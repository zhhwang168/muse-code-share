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
  const call = (path = '/api/codes', { method = 'GET', code, token, ip = '127.0.0.1', origin = 'https://example.com' } = {}) => worker.fetch(new Request(`https://example.com${path}`, {
    method, headers: { Origin: origin, 'Content-Type': 'application/json', 'CF-Connecting-IP': ip, ...(token ? { 'X-Delete-Token': token } : {}) },
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
