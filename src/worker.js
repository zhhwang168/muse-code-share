const HOUR = 3600000;
// Additive copy storage plus the explicitly requested one-time relisting below.
const counterSchema = new WeakMap();
async function ensureCounter(db) {
  if (!counterSchema.has(db)) {
    const ready = (async () => {
      await db.prepare('CREATE TABLE IF NOT EXISTS copy_events (event_id TEXT PRIMARY KEY, code_id TEXT NOT NULL, created_at INTEGER NOT NULL)').run();
      await db.prepare('CREATE INDEX IF NOT EXISTS copy_events_code ON copy_events(code_id)').run();
      await db.prepare('CREATE TABLE IF NOT EXISTS copy_guards (event_id TEXT PRIMARY KEY, code_id TEXT NOT NULL, visitor_hash TEXT NOT NULL, network_hash TEXT NOT NULL, created_at INTEGER NOT NULL)').run();
      await db.prepare('CREATE INDEX IF NOT EXISTS copy_guards_visitor ON copy_guards(code_id, visitor_hash, created_at)').run();
      await db.prepare('CREATE INDEX IF NOT EXISTS copy_guards_network ON copy_guards(network_hash, created_at)').run();
      await db.prepare('CREATE TABLE IF NOT EXISTS site_changes (change_id TEXT PRIMARY KEY, applied_at INTEGER NOT NULL)').run();
      // Owner-requested one-time relisting of the two existing records. The marker
      // and exact original IDs/timestamps prevent future deploys from renewing them.
      const now = Date.now();
      await db.batch([
        db.prepare("UPDATE codes SET created_at = ? + CASE WHEN id = 'b7074a1b-280a-4914-900e-ca9bce709164' THEN 1 ELSE 0 END, expires_at = ? + CASE WHEN id = 'b7074a1b-280a-4914-900e-ca9bce709164' THEN 1 ELSE 0 END WHERE ((id = ? AND created_at = ?) OR (id = ? AND created_at = ?)) AND NOT EXISTS (SELECT 1 FROM site_changes WHERE change_id = 'copy-counter-relist-2026-11-02')")
          .bind(now, now + 24 * HOUR, 'f7a09b13-5761-40c2-bb07-ed94800e3539', 1793576332010, 'b7074a1b-280a-4914-900e-ca9bce709164', 1793583339106),
        db.prepare("INSERT OR IGNORE INTO site_changes (change_id, applied_at) VALUES ('copy-counter-relist-2026-11-02', ?)").bind(now)
      ]);
    })().catch(error => { counterSchema.delete(db); throw error; });
    counterSchema.set(db, ready);
  }
  await counterSchema.get(db);
}
const hash = async (value) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), b => b.toString(16).padStart(2, '0')).join('');
const json = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    try {
      const now = Date.now();
      await ensureCounter(env.DB);
      if (url.pathname === '/api/codes' && request.method === 'GET') {
        const { results } = await env.DB.prepare('SELECT c.id, c.code, c.created_at, c.expires_at, (SELECT COUNT(*) FROM copy_events e WHERE e.code_id = c.id) AS copy_count FROM codes c WHERE c.expires_at > ? ORDER BY c.created_at ASC, c.id ASC').bind(now).all();
        return json({ codes: results, serverTime: now });
      }
      if (request.method !== 'GET' && request.headers.get('Origin') !== url.origin) return json({ error: '请求来源无效' }, 403);
      const copyRoute = url.pathname.match(/^\/api\/codes\/([^/]+)\/copy$/);
      if (copyRoute && request.method === 'POST') {
        const eventId = request.headers.get('X-Copy-Event') || '';
        if (!/^[a-f0-9-]{36}$/i.test(eventId)) return json({ error: '提交格式无效' }, 400);
        const id = copyRoute[1];
        const active = await env.DB.prepare('SELECT id FROM codes WHERE id = ? AND expires_at > ?').bind(id, now).first();
        if (!active) return json({ error: '邀请码已下架或你没有操作权限' }, 404);
        const visitor = request.headers.get('X-Copy-Visitor') || '';
        if (visitor && !/^[a-f0-9-]{36}$/i.test(visitor)) return json({ error: '提交格式无效' }, 400);
        const ip = request.headers.get('CF-Connecting-IP') || 'local';
        const networkHash = await hash(`${Math.floor(now / (24 * HOUR))}:${ip}`);
        const visitorHash = await hash(visitor || `network:${ip}`);
        // A transactional conditional INSERT enforces the rolling quota even
        // across parallel requests/tabs. Old clients fall back to the network.
        await env.DB.batch([
          env.DB.prepare('INSERT OR IGNORE INTO copy_guards (event_id, code_id, visitor_hash, network_hash, created_at) SELECT ?, id, ?, ?, ? FROM codes WHERE id = ? AND expires_at > ? AND (SELECT COUNT(*) FROM copy_guards WHERE code_id = ? AND visitor_hash = ? AND created_at > ?) < 2 AND (SELECT COUNT(*) FROM copy_guards WHERE network_hash = ? AND created_at > ?) < 10')
            .bind(eventId, visitorHash, networkHash, now, id, now, id, visitorHash, now - 24 * HOUR, networkHash, now - 60000),
          env.DB.prepare('INSERT OR IGNORE INTO copy_events (event_id, code_id, created_at) SELECT event_id, code_id, created_at FROM copy_guards WHERE event_id = ? AND code_id = ? AND visitor_hash = ?').bind(eventId, id, visitorHash)
        ]);
        const row = await env.DB.prepare('SELECT COUNT(*) AS copy_count FROM copy_events WHERE code_id = ?').bind(id).first();
        const recorded = await env.DB.prepare('SELECT event_id FROM copy_guards WHERE event_id = ? AND code_id = ? AND visitor_hash = ?').bind(eventId, id, visitorHash).first();
        return json({ copy_count: row.copy_count, estimated_remaining: Math.max(0, 30 - row.copy_count), limited: !recorded });
      }
      if (url.pathname.startsWith('/api/codes/') && request.method === 'DELETE') {
        const id = url.pathname.slice('/api/codes/'.length);
        const token = request.headers.get('X-Delete-Token') || '';
        if (token.length > 128 || !token) return json({ error: '仅提交者可下架自己的邀请码' }, 403);
        const result = await env.DB.prepare('DELETE FROM codes WHERE id = ? AND delete_hash = ?').bind(id, await hash(token)).run();
        return result.meta.changes ? json({ ok: true }) : json({ error: '邀请码已下架或你没有操作权限' }, 403);
      }
      if (url.pathname === '/api/codes' && request.method === 'POST') {
        if (request.headers.get('Origin') !== url.origin) return json({ error: '请求来源无效' }, 403);
        if (!request.headers.get('Content-Type')?.includes('application/json')) return json({ error: '请使用 JSON 提交' }, 415);
        const raw = await request.text();
        if (raw.length > 1024) return json({ error: '提交内容过长' }, 413);
        let body; try { body = JSON.parse(raw); } catch { return json({ error: '提交格式无效' }, 400); }
        const code = typeof body.code === 'string' ? body.code.trim() : '';
        if (!/^[A-Za-z0-9][A-Za-z0-9_-]{3,63}$/.test(code)) return json({ error: '请输入 4–64 位字母、数字、短横线或下划线' }, 400);
        const ip = request.headers.get('CF-Connecting-IP') || 'local';
        const ipHash = await hash(`${Math.floor(now / (24 * HOUR))}:${ip}`);
        const prior = await env.DB.prepare('SELECT id FROM codes WHERE code = ? AND expires_at > ?').bind(code, now).first();
        if (prior) return json({ error: '这个注册码已经在列表里了' }, 409);
        // Conditional upsert makes the one-minute submission limit atomic.
        const gate = await env.DB.prepare('INSERT INTO submissions (ip_hash, submitted_at) VALUES (?, ?) ON CONFLICT(ip_hash) DO UPDATE SET submitted_at = excluded.submitted_at WHERE submissions.submitted_at <= ?').bind(ipHash, now, now - 60000).run();
        if (!gate.meta.changes) return json({ error: '提交太快啦，请一分钟后再试' }, 429);
        const id = crypto.randomUUID();
        const deleteToken = crypto.randomUUID();
        const result = await env.DB.prepare('INSERT INTO codes (id, code, created_at, expires_at, delete_hash) VALUES (?, ?, ?, ?, ?) ON CONFLICT(code) DO UPDATE SET id = excluded.id, created_at = excluded.created_at, expires_at = excluded.expires_at, delete_hash = excluded.delete_hash WHERE codes.expires_at <= ?').bind(id, code, now, now + 24 * HOUR, await hash(deleteToken), now).run();
        if (!result.meta.changes) return json({ error: '这个注册码已经在列表里了' }, 409);
        return json({ ok: true, id, deleteToken }, 201);
      }
      return json({ error: '接口不存在' }, 404);
    } catch (error) {
      console.error(error);
      return json({ error: '服务暂时不可用，请稍后重试' }, 500);
    }
  },
  async scheduled(event, env) {
    const now = Date.now();
    await ensureCounter(env.DB);
    await env.DB.batch([
      env.DB.prepare('DELETE FROM codes WHERE expires_at <= ?').bind(now),
      env.DB.prepare('DELETE FROM submissions WHERE submitted_at < ?').bind(now - HOUR)
      ,env.DB.prepare('DELETE FROM copy_events WHERE code_id NOT IN (SELECT id FROM codes)')
      ,env.DB.prepare('DELETE FROM copy_guards WHERE created_at <= ?').bind(now - 24 * HOUR)
    ]);
  }
};
