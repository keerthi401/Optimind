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

test('AI API - Concept Explanation returns structured response', async () => {
  const res = await fetch(`${baseUrl}/api/ai/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'Binary Search Algorithm',
      subject: 'algorithms',
      difficulty: 'beginner',
      format: 'step_by_step',
    }),
  });

  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.ok(body.data.data.summary);
  assert.ok(Array.isArray(body.data.data.steps));
  assert.ok(body.data.data.steps.length >= 2);
  assert.ok(Array.isArray(body.data.data.terminology));
  assert.ok(body.data.data.analogy);
});

test('AI API - Visual Lesson generation produces steps with Mermaid definitions', async () => {
  const res = await fetch(`${baseUrl}/api/ai/visualize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'Bubble Sort Invariants',
      subject: 'algorithms',
      difficulty: 'beginner',
    }),
  });

  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  assert.ok(body.data.data.title);
  assert.ok(Array.isArray(body.data.data.steps));
  assert.ok(body.data.data.steps.length > 0);
  assert.ok(body.data.data.steps[0].mermaidDiagram.includes('flowchart'));
});
