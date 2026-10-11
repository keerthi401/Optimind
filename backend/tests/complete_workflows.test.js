import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:5000/api';
const FRONTEND_BASE = 'http://localhost:5174';

test('OptiMind AI - Complete Workflows A through J Integration Verification', async (t) => {
  let authToken = '';
  let testUser = null;
  let uploadedDocId = null;
  let activeQuizId = null;
  let activeRoadmapId = null;
  let firstMilestoneId = null;

  // Workflow A: Open Landing Page
  await t.test('Workflow A: Landing page serves valid HTML with tagline', async () => {
    const res = await fetch(`${FRONTEND_BASE}/`);
    assert.equal(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes('OptiMind') || html.includes('<!DOCTYPE html>'));
  });

  // Workflow B: Register and Log In
  await t.test('Workflow B: Register user, log in, and verify authenticated profile', async () => {
    const email = `learner_${Date.now()}@optimind.ai`;
    const password = 'MasterPassword123!';
    const name = 'Dr. Ada Lovelace';

    // 1. Register
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    assert.equal(regRes.status, 201);
    const regData = await regRes.json();
    assert.equal(regData.success, true);
    assert.ok(regData.data.token);
    assert.equal(regData.data.user.email, email);

    authToken = regData.data.token;
    testUser = regData.data.user;

    // 2. Login
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    assert.equal(loginRes.status, 200);
    const loginData = await loginRes.json();
    assert.ok(loginData.data.token);

    // 3. Profile
    const profileRes = await fetch(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.equal(profileRes.status, 200);
    const profileData = await profileRes.json();
    assert.equal(profileData.data.user.email, email);
  });

  // Workflow C: Dashboard Data Display
  await t.test('Workflow C: Dashboard loads user-specific metrics and saved lessons', async () => {
    const summaryRes = await fetch(`${API_BASE}/progress/summary`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.equal(summaryRes.status, 200);
    const summaryData = await summaryRes.json();
    assert.equal(summaryData.success, true);
    assert.ok(summaryData.data.metrics);

    const savedRes = await fetch(`${API_BASE}/ai/saved`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.equal(savedRes.status, 200);
    const savedData = await savedRes.json();
    assert.equal(savedData.success, true);
    assert.ok(Array.isArray(savedData.data));
  });

  // Workflow D: AI Concept Explainer
  await t.test('Workflow D: Generate concept explanation and save to library', async () => {
    const explainRes = await fetch(`${API_BASE}/ai/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        topic: 'Byzantine Fault Tolerance in Distributed Consensus',
        subject: 'computer_science',
        difficulty: 'advanced',
        format: 'step_by_step',
      }),
    });
    assert.equal(explainRes.status, 200);
    const explainData = await explainRes.json();
    assert.equal(explainData.success, true);
    assert.ok(explainData.data.data.summary);
    assert.ok(explainData.data.data.steps.length >= 3);
    assert.ok(explainData.data.data.terminology.length >= 2);
    assert.ok(explainData.data.data.analogy);

    // Save explanation
    const saveRes = await fetch(`${API_BASE}/ai/save-explanation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        topic: 'Byzantine Fault Tolerance',
        subject: 'computer_science',
        difficulty: 'advanced',
        format: 'step_by_step',
        ...explainData.data.data,
      }),
    });
    assert.equal(saveRes.status, 201);
  });

  // Workflow E: Interactive Visualizer & Mermaid
  await t.test('Workflow E: Generate visual lesson steps with Mermaid flowchart definitions', async () => {
    const visualRes = await fetch(`${API_BASE}/ai/visualize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        topic: 'Dijkstra Shortest Path Algorithm',
        subject: 'algorithms',
        difficulty: 'intermediate',
      }),
    });
    assert.equal(visualRes.status, 200);
    const visualData = await visualRes.json();
    assert.equal(visualData.success, true);
    const steps = visualData.data.data.steps;
    assert.ok(Array.isArray(steps));
    assert.ok(steps.length > 0);
    assert.ok(steps[0].mermaidDiagram.includes('flowchart') || steps[0].mermaidDiagram.includes('graph'));
    assert.ok(steps[0].visualState);
  });

  // Workflow F: Document Upload & Text Extraction
  await t.test('Workflow F: Upload document, perform extraction, and generate chunks', async () => {
    const sampleNotes = `Distributed Systems Lecture: Raft Consensus Algorithm
Raft is a consensus algorithm designed as an alternative to Paxos.
It achieves consensus via an elected leader who manages the replicated log.
The three states of a Raft node are Leader, Follower, and Candidate.
Heartbeats are periodically broadcast from the Leader to prevent Followers from timing out.
Term numbers act as a logical clock in Raft to detect obsolete leaders.`;

    const blob = new Blob([sampleNotes], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', blob, 'raft_consensus_notes.txt');

    const uploadRes = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: formData,
    });
    assert.equal(uploadRes.status, 201);
    const uploadData = await uploadRes.json();
    assert.equal(uploadData.success, true);
    assert.equal(uploadData.data.status, 'ready');
    assert.ok(uploadData.data.chunkCount >= 1);
    uploadedDocId = uploadData.data.id;
  });

  // Workflow G: Grounded Document Q&A (RAG)
  await t.test('Workflow G: Ask question grounded in uploaded document with citations', async () => {
    const ragRes = await fetch(`${API_BASE}/rag/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        question: 'What are the three states of a Raft node?',
        documentId: uploadedDocId,
      }),
    });
    assert.equal(ragRes.status, 200);
    const ragData = await ragRes.json();
    assert.equal(ragData.success, true);
    assert.equal(ragData.data.hasSufficientEvidence, true);
    assert.ok(ragData.data.sources.length > 0);
    assert.ok(ragData.data.sources[0].docName.includes('raft_consensus_notes.txt'));
    assert.ok(ragData.data.answer.toLowerCase().includes('raft'));
  });

  // Workflow H: Quiz Generation & Submission
  await t.test('Workflow H: Generate diagnostic quiz, conceal answers, submit and score', async () => {
    // 1. Generate Quiz
    const quizRes = await fetch(`${API_BASE}/quizzes/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        topic: 'Raft Consensus Protocol',
        subject: 'computer_science',
        difficulty: 'intermediate',
        documentId: uploadedDocId,
      }),
    });
    assert.equal(quizRes.status, 201);
    const quizData = await quizRes.json();
    assert.equal(quizData.success, true);
    assert.ok(quizData.data.questions.length > 0);
    // Crucial check: verify correctOptionIndex is NOT leaked to client payload
    assert.equal(quizData.data.questions[0].correctOptionIndex, undefined);
    activeQuizId = quizData.data.id;

    // 2. Submit Answers
    const submitRes = await fetch(`${API_BASE}/quizzes/${activeQuizId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ answers: [0, 0, 0] }),
    });
    assert.equal(submitRes.status, 200);
    const submitData = await submitRes.json();
    assert.equal(submitData.success, true);
    assert.ok(typeof submitData.data.score === 'number');
    assert.ok(typeof submitData.data.percentage === 'number');
    assert.ok(Array.isArray(submitData.data.questionResults));

    // 3. Verify sample_quiz_01 submission also succeeds gracefully
    const sampleSubmitRes = await fetch(`${API_BASE}/quizzes/sample_quiz_01/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ answers: [1] }),
    });
    assert.equal(sampleSubmitRes.status, 200);
    const sampleSubmitData = await sampleSubmitRes.json();
    assert.equal(sampleSubmitData.success, true);
    assert.equal(sampleSubmitData.data.score, 1);
  });

  // Workflow I: Learning Roadmap Creation & Milestone Update
  await t.test('Workflow I: Create curriculum roadmap, toggle milestone, and track progress', async () => {
    const roadmapRes = await fetch(`${API_BASE}/roadmaps/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        goal: 'Master Distributed Consensus & Fault Tolerance',
        subject: 'Computer Science',
        skillLevel: 'advanced',
        hoursPerWeek: 8,
        targetDurationWeeks: 6,
      }),
    });
    assert.equal(roadmapRes.status, 201);
    const roadmapData = await roadmapRes.json();
    assert.equal(roadmapData.success, true);
    assert.ok(roadmapData.data.milestones.length >= 3);
    activeRoadmapId = roadmapData.data.id;
    firstMilestoneId = roadmapData.data.milestones[0].id;

    // Update milestone to completed
    const patchRes = await fetch(`${API_BASE}/roadmaps/${activeRoadmapId}/milestones/${firstMilestoneId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ status: 'completed' }),
    });
    assert.equal(patchRes.status, 200);
    const patchData = await patchRes.json();
    assert.equal(patchData.success, true);
    const updatedMs = patchData.data.milestones.find((m) => m.id === firstMilestoneId);
    assert.equal(updatedMs.status, 'completed');
    assert.equal(updatedMs.progressPercentage, 100);
  });

  // Workflow J: Progress Tracking Reflects All Activity
  await t.test('Workflow J: Final telemetry aggregates quiz score, roadmap milestones, and study time', async () => {
    const finalProgressRes = await fetch(`${API_BASE}/progress/summary`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert.equal(finalProgressRes.status, 200);
    const finalData = await finalProgressRes.json();
    assert.equal(finalData.success, true);
    const metrics = finalData.data.metrics;
    assert.ok(metrics.totalQuizzesTaken >= 2);
    assert.ok(metrics.completedLessonsCount >= 1);
    assert.ok(metrics.documentsIngestedCount >= 1);
    assert.ok(finalData.data.activeRoadmap);
    assert.equal(finalData.data.activeRoadmap.completedMilestones, 1);
  });
});
