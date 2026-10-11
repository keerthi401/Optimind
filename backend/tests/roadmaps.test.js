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

test('Roadmap API - Plan Generation and Milestone Progress Recalculation', async () => {
  // 1. Create session
  const guestRes = await fetch(`${baseUrl}/api/auth/guest`, { method: 'POST' });
  const { data: { token } } = await guestRes.json();

  // 2. Generate Roadmap
  const genRes = await fetch(`${baseUrl}/api/roadmaps/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      goal: 'Master Distributed Systems and Raft Consensus',
      subject: 'computer_science',
      skillLevel: 'advanced',
      hoursPerWeek: 8,
      targetDurationWeeks: 6,
    }),
  });

  assert.equal(genRes.status, 201);
  const genBody = await genRes.json();
  assert.equal(genBody.success, true);
  const roadmap = genBody.data;
  assert.ok(roadmap.milestones.length >= 3);
  const firstMilestone = roadmap.milestones[0];

  // 3. Mark milestone complete
  const patchRes = await fetch(`${baseUrl}/api/roadmaps/${roadmap.id}/milestones/${firstMilestone.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status: 'completed' }),
  });

  assert.equal(patchRes.status, 200);
  const patchBody = await patchRes.json();
  assert.equal(patchBody.success, true);
  const updatedFirst = patchBody.data.milestones.find((m) => m.id === firstMilestone.id);
  assert.equal(updatedFirst.status, 'completed');
  assert.equal(updatedFirst.progressPercentage, 100);
});
