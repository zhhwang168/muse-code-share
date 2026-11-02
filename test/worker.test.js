import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import worker from '../src/worker.js';

function setup() {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync(new URL('../migrations/0001_init.sql', import.meta.url), 'utf8'));
  const binding = {
    prepare(sql) {
      const statement = db.prepare(sql);
      return {
        args: [], bind(...args) { this.args = args; return this; },
        async all() { return { results: statement.all(...this.args) }; },
        async first() { return statement.get(...this.args); },
        async run() { const r = statement.run(...this.args); return { meta: { changes: Number(r.changes) } }; }
      };
    },
    async batch(statements) { return Promise.all(statements.map(s => s.run())); }
  };
  const env = { DB: binding, ASSETS: { fetch: () => new Response('page') } };
  const call = (path = '/api/codes', { method = 'GET', code, token, ip = '127.0.0.1', origin = 'https://example.com', eventId, visitor } = {}) => worker.fetch(new Request(`https://example.com${path}`, {
    method, headers: { Origin: origin, 'Content-Type': 'application/json', 'CF-Connecting-IP': ip, ...(eventId ? {'X-Copy-Event':eventId} : {}), ...(visitor ? {'X-Copy-Visitor':visitor} : {}), ...(token ? { 'X-Delete-Token': token } : {}) },
    ...(code !== undefined ? { body: JSON.stringify({ code }) } : {})
  }), env);
  return { db, env, call };
}
test('FIFO, independent 24-hour expiry, and cleanup preserve newer codes', async () => {
  const { db, env, call } = setup(); const now = Date.now();
  const insert = db.prepare('INSERT INTO codes VALUES (?, ?, ?, ?, ?)');
  insert.run('expired', 'EXPIRED', now - 86400001, now - 1, 'hash');
  insert.run('older', 'OLDER1', now - 60000, now + 60000, 'hash');
  insert.run('newer', 'NEWER1', now, now + 86400000, 'hash');
  const list = await (await call()).json();
  assert.deepEqual(list.codes.map(c => c.code), ['OLDER1', 'NEWER1']);
  assert.ok(!JSON.stringify(list).includes('delete_hash'));
  await worker.scheduled({}, env);
  assert.equal(db.prepare('SELECT count(*) AS n FROM codes').get().n, 2);
  const response = await call('/api/codes', { method: 'POST', code: 'VALID123' });
  assert.equal(response.status, 201);
  const row = db.prepare('SELECT * FROM codes WHERE code = ?').get('VALID123');
  assert.equal(row.expires_at - row.created_at, 86400000);
  db.close();
});
test('duplicate cannot reset expiry; submissions are throttled', async () => {
  const { db, call } = setup();
  await call('/api/codes', { method: 'POST', code: 'SAME123' });
  const before = db.prepare('SELECT expires_at FROM codes').get().expires_at;
  assert.equal((await call('/api/codes', { method: 'POST', code: 'SAME123', ip: '2' })).status, 409);
  assert.equal(db.prepare('SELECT expires_at FROM codes').get().expires_at, before);
  assert.equal((await call('/api/codes', { method: 'POST', code: 'OTHER1' })).status, 429);
  db.close();
});
test('only owner can remove a code; cross-origin and invalid input fail', async () => {
  const { db, call } = setup();
  const submitted = await (await call('/api/codes', { method: 'POST', code: 'OWNER123' })).json();
  const path = `/api/codes/${submitted.id}`;
  assert.equal((await call(path, { method: 'DELETE', token: 'wrong' })).status, 403);
  assert.equal((await call(path, { method: 'DELETE', token: submitted.deleteToken })).status, 200);
  assert.equal((await (await call()).json()).codes.length, 0);
  assert.equal((await call('/api/codes', { method: 'POST', code: '<script>', ip: '3' })).status, 400);
  assert.equal((await call('/api/codes', { method: 'POST', code: 'VALID1', origin: 'https://elsewhere.com' })).status, 403);
  db.close();
});

test('copy counter counts site events, retries are idempotent, estimate clamps at zero', async () => {
  const { db, call } = setup();
  const created = await (await call('/api/codes', {method:'POST',code:'COUNT123'})).json();
  const path = `/api/codes/${created.id}/copy`;
  const eventId=crypto.randomUUID();
  let result=await (await call(path,{method:'POST',eventId})).json();
  assert.equal(result.copy_count,1);assert.equal(result.estimated_remaining,29);
  result=await (await call(path,{method:'POST',eventId})).json();
  assert.equal(result.copy_count,1);
  await Promise.all(Array.from({length:30},(_,i)=>call(path,{method:'POST',eventId:crypto.randomUUID(),visitor:crypto.randomUUID(),ip:'unique-'+i})));
  const listed=await (await call()).json();assert.equal(listed.codes[0].copy_count,31);
  result=await (await call(path,{method:'POST',eventId})).json();assert.equal(result.estimated_remaining,0);
  assert.equal((await call(path,{method:'POST',eventId,origin:'https://bad.com'})).status,403);
  db.prepare('UPDATE codes SET expires_at = 0').run();
  assert.equal((await call(path,{method:'POST',eventId:crypto.randomUUID()})).status,404);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM copy_events').get().n,31);
  db.close();
});
test('owner-requested relisting only touches the two original records and runs once', async () => {
  const {db,env,call}=setup();
  const insert=db.prepare('INSERT INTO codes VALUES (?, ?, ?, ?, ?)');
  insert.run('f7a09b13-5761-40c2-bb07-ed94800e3539','4JD1B2',1793576332010,1793662732010,'private');
  insert.run('b7074a1b-280a-4914-900e-ca9bce709164','3EBFWA',1793583339106,1793669739106,'private2');
  insert.run('unrelated','OTHER12',100,Date.now()+86400000,'private3');
  await call();
  const a=db.prepare('SELECT * FROM codes WHERE code = ?').get('4JD1B2');
  assert.equal(a.expires_at-a.created_at,86400000);assert.equal(a.delete_hash,'private');
  assert.equal(db.prepare('SELECT created_at FROM codes WHERE id = ?').get('unrelated').created_at,100);
  // A fresh binding simulates a new isolate/deploy while the marker persists.
  const wrapped={prepare:(...args)=>env.DB.prepare(...args),batch:(...args)=>env.DB.batch(...args)};
  await worker.fetch(new Request('https://example.com/api/codes'),{...env,DB:wrapped});
  assert.equal(db.prepare('SELECT created_at FROM codes WHERE code = ?').get('4JD1B2').created_at,a.created_at);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM codes').get().n,3);
  db.close();
});

test('same visitor counts twice across tabs and networks; copying remains available', async () => {
  const {db,call}=setup();
  const created=await (await call('/api/codes',{method:'POST',code:'LIMIT123'})).json();
  const before=db.prepare('SELECT created_at,expires_at FROM codes WHERE id = ?').get(created.id);
  const path=`/api/codes/${created.id}/copy`,visitor=crypto.randomUUID();
  const results=await Promise.all(Array.from({length:15},(_,i)=>call(path,{method:'POST',eventId:crypto.randomUUID(),visitor,ip:'net-'+i})));
  assert.ok(results.every(r=>r.status===200));
  const bodies=await Promise.all(results.map(r=>r.json()));
  assert.equal(bodies.filter(r=>!r.limited).length,2);
  const result=await (await call(path,{method:'POST',eventId:crypto.randomUUID(),visitor})).json();
  assert.equal(result.copy_count,2);assert.equal(result.estimated_remaining,28);assert.equal(result.limited,true);
  // Another visitor on the same network has a separate per-code quota.
  const other=await (await call(path,{method:'POST',eventId:crypto.randomUUID(),visitor:crypto.randomUUID()})).json();
  assert.equal(other.copy_count,3);assert.equal(other.limited,false);
  assert.deepEqual(db.prepare('SELECT created_at,expires_at FROM codes WHERE id = ?').get(created.id),before);
  // Sliding window: once a counted event is older than 24h, one new count is allowed.
  db.prepare('UPDATE copy_guards SET created_at = ? WHERE event_id = (SELECT event_id FROM copy_guards WHERE visitor_hash = (SELECT visitor_hash FROM copy_guards LIMIT 1) LIMIT 1)').run(Date.now()-86400001);
  const renewed=await (await call(path,{method:'POST',eventId:crypto.randomUUID(),visitor})).json();
  assert.equal(renewed.limited,false);assert.equal(renewed.copy_count,4);
  db.close();
});
test('network safeguard limits identifier rotation without blocking copy responses', async () => {
  const {db,call}=setup();
  const created=await (await call('/api/codes',{method:'POST',code:'NETWORK1'})).json();
  const path=`/api/codes/${created.id}/copy`;
  for(let i=0;i<14;i++)assert.equal((await call(path,{method:'POST',eventId:crypto.randomUUID(),visitor:crypto.randomUUID()})).status,200);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM copy_events').get().n,10);
  db.close();
});
