const HOUR = 3600000;
const hash = async (value) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), b => b.toString(16).padStart(2, '0')).join('');
const json = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    try {
      const now = Date.now();
      if (url.pathname === '/api/codes' && request.method === 'GET') {
        const { results } = await env.DB.prepare('SELECT id, code, created_at, expires_at FROM codes WHERE expires_at > ? ORDER BY created_at ASC, id ASC').bind(now).all();
        return json({ codes: results, serverTime: now });
      }
      if (request.method !== 'GET' && request.headers.get('Origin') !== url.origin) return json({ error: '请求来源无效' }, 403);
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
    await env.DB.batch([
      env.DB.prepare('DELETE FROM codes WHERE expires_at <= ?').bind(now),
      env.DB.prepare('DELETE FROM submissions WHERE submitted_at < ?').bind(now - HOUR)
    ]);
  }
};
