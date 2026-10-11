import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

let server;
let baseUrl;

test.before(async () => {
  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
});

test('GET /api/health - returns 200 OK with expected JSON structure', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);

  const contentType = res.headers.get('content-type');
  assert.ok(contentType.includes('application/json'));

  const body = await res.json();
  assert.equal(body.success, true);
  assert.equal(body.message, 'OptiMind AI API is running');
  assert.equal(body.data.status, 'ok');
  assert.equal(body.data.version, '1.0.0');
  assert.ok(typeof body.data.uptimeSeconds === 'number');
  assert.ok(typeof body.data.timestamp === 'string');
});

test('GET /api/unknown - returns 404 with structured error JSON', async () => {
  const res = await fetch(`${baseUrl}/api/nonexistent-endpoint`);
  assert.equal(res.status, 404);

  const body = await res.json();
  assert.equal(body.success, false);
  assert.equal(body.error.code, 'ROUTE_NOT_FOUND');
  assert.ok(body.error.message.includes('/api/nonexistent-endpoint'));
});

test('POST with invalid JSON body - returns 400 Bad Request', async () => {
  const res = await fetch(`${baseUrl}/api/health`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"invalidJson": ',
  });
  assert.equal(res.status, 400);

  const body = await res.json();
  assert.equal(body.success, false);
  assert.equal(body.error.code, 'INVALID_JSON_BODY');
});

test('CORS headers allow frontend origin', async () => {
  const res = await fetch(`${baseUrl}/api/health`, {
    headers: { Origin: 'http://localhost:5174' },
  });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:5174');
  assert.equal(res.headers.get('access-control-allow-credentials'), 'true');
});
