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

test('Document & RAG API - Upload, Extraction, and Grounded Retrieval', async () => {
  // 1. Create a guest session
  const guestRes = await fetch(`${baseUrl}/api/auth/guest`, { method: 'POST' });
  const { data: { token, user } } = await guestRes.json();

  // 2. Upload a sample study text document
  const sampleText = `Operating Systems Lecture 04: Virtual Memory
Virtual memory provides an illusion of a large contiguous address space.
The translation lookaside buffer (TLB) is a hardware cache used to reduce the time taken to access a user memory location.
Page faults occur when a requested memory page is not present in physical RAM and must be fetched from secondary storage.
Page replacement algorithms like LRU (Least Recently Used) decide which memory page to evict.`;

  const blob = new Blob([sampleText], { type: 'text/plain' });
  const formData = new FormData();
  formData.append('file', blob, 'os_lecture_04.txt');

  const uploadRes = await fetch(`${baseUrl}/api/documents/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  assert.equal(uploadRes.status, 201);
  const uploadBody = await uploadRes.json();
  assert.equal(uploadBody.success, true);
  assert.equal(uploadBody.data.status, 'ready');
  assert.ok(uploadBody.data.chunkCount >= 1);
  const docId = uploadBody.data.id;

  // 3. Ask a grounded question
  const ragRes = await fetch(`${baseUrl}/api/rag/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      question: 'What is a page fault and why does it occur?',
      documentId: docId,
    }),
  });

  assert.equal(ragRes.status, 200);
  const ragBody = await ragRes.json();
  assert.equal(ragBody.success, true);
  assert.equal(ragBody.data.hasSufficientEvidence, true);
  assert.ok(ragBody.data.sources.length > 0);
  assert.equal(ragBody.data.sources[0].docName, 'os_lecture_04.txt');
  assert.ok(ragBody.data.answer.toLowerCase().includes('page'));

  // 4. Ask an unrelated question expecting insufficient evidence
  const unrelatedRes = await fetch(`${baseUrl}/api/rag/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      question: 'What is photosynthesis in plant biology chloroplasts?',
      documentId: docId,
    }),
  });

  assert.equal(unrelatedRes.status, 200);
  const unrelatedBody = await unrelatedRes.json();
  assert.equal(unrelatedBody.data.hasSufficientEvidence, false);

  // 5. Delete document
  const delRes = await fetch(`${baseUrl}/api/documents/${docId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(delRes.status, 200);
});
