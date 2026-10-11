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

test('Auth API - User Registration, Login, and Profile Authorization', async () => {
  const email = `test.student.${Date.now()}@example.com`;
  const password = 'StrongPassword123!';

  // 1. Register
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test Learner', email, password }),
  });
  assert.equal(regRes.status, 201);
  const regBody = await regRes.json();
  assert.equal(regBody.success, true);
  assert.ok(regBody.data.token);
  assert.equal(regBody.data.user.email, email);
  assert.equal(regBody.data.user.isGuest, false);

  const token = regBody.data.token;

  // 2. Duplicate registration returns 409
  const dupRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test Learner', email, password }),
  });
  assert.equal(dupRes.status, 409);

  // 3. Login
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(loginRes.status, 200);
  const loginBody = await loginRes.json();
  assert.ok(loginBody.data.token);

  // 4. Invalid Password Login returns 401
  const badLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'WrongPassword' }),
  });
  assert.equal(badLoginRes.status, 401);

  // 5. Access Protected Profile with Token
  const profileRes = await fetch(`${baseUrl}/api/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(profileRes.status, 200);
  const profileBody = await profileRes.json();
  assert.equal(profileBody.data.user.email, email);

  // 6. Access Protected Profile WITHOUT Token returns 401
  const unauthRes = await fetch(`${baseUrl}/api/auth/profile`);
  assert.equal(unauthRes.status, 401);

  // 7. Create Guest Session
  const guestRes = await fetch(`${baseUrl}/api/auth/guest`, { method: 'POST' });
  assert.equal(guestRes.status, 201);
  const guestBody = await guestRes.json();
  assert.ok(guestBody.data.token);
  assert.equal(guestBody.data.user.isGuest, true);
});
