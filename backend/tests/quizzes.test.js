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

test('Quiz API - Generation, Secret Answers Omission, Server-side Grading', async () => {
  // 1. Create guest session
  const guestRes = await fetch(`${baseUrl}/api/auth/guest`, { method: 'POST' });
  const { data: { token } } = await guestRes.json();

  // 2. Generate Quiz
  const genRes = await fetch(`${baseUrl}/api/quizzes/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      topic: 'Hash Tables and Collision Resolution',
      subject: 'computer_science',
      difficulty: 'intermediate',
    }),
  });

  assert.equal(genRes.status, 201);
  const genBody = await genRes.json();
  assert.equal(genBody.success, true);
  const quiz = genBody.data;

  // Verify that correct answers are NOT leaked to the client
  quiz.questions.forEach((q) => {
    assert.equal(q.correctOptionIndex, undefined, 'Client must not receive correctOptionIndex before submission');
  });

  // 3. Submit Answers
  const answers = [0, 1, 0]; // user picks options
  const submitRes = await fetch(`${baseUrl}/api/quizzes/${quiz.id}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ answers }),
  });

  assert.equal(submitRes.status, 200);
  const submitBody = await submitRes.json();
  assert.equal(submitBody.success, true);
  assert.ok(typeof submitBody.data.score === 'number');
  assert.ok(typeof submitBody.data.percentage === 'number');
  assert.ok(Array.isArray(submitBody.data.questionResults));
  assert.equal(submitBody.data.questionResults.length, quiz.questions.length);

  // After submission, correct answers and explanations are revealed
  submitBody.data.questionResults.forEach((r) => {
    assert.ok(typeof r.correctOptionIndex === 'number');
    assert.ok(r.explanation);
  });
});
