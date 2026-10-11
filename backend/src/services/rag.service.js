import Document from '../models/Document.js';
import DocumentChunk from '../models/DocumentChunk.js';
import { env } from '../config/env.js';

/**
 * Score relevance of a chunk to a query using token overlap and term weighting
 */
function calculateRelevanceScore(query, text) {
  const queryTerms = query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (queryTerms.length === 0) return 0;

  const contentLower = text.toLowerCase();
  let score = 0;

  for (const term of queryTerms) {
    if (contentLower.includes(term)) {
      // Frequency bonus
      const matches = (contentLower.match(new RegExp(`\\b${term}`, 'g')) || []).length;
      score += 1 + Math.min(matches, 3) * 0.5;
    }
  }

  // Normalize by query length
  return score / queryTerms.length;
}

/**
 * Query user documents with Retrieval-Augmented Generation
 */
export async function queryDocumentRAG({ userId, question, documentId = null }) {
  if (!question || !question.trim()) {
    throw new Error('Question cannot be empty');
  }

  // 1. Fetch user's documents
  const docFilter = { userId };
  if (documentId) {
    docFilter._id = documentId;
  }
  const userDocs = await Document.find(docFilter);
  if (!userDocs || userDocs.length === 0) {
    return {
      answer: 'No study materials found in your library. Please upload a document (PDF, TXT, or Image) first to enable grounded answers.',
      sources: [],
      hasSufficientEvidence: false,
    };
  }

  const docMap = new Map();
  for (const doc of userDocs) {
    docMap.set(String(doc._id || doc.id), doc.originalFilename || doc.name);
  }

  // 2. Fetch all chunks belonging to user
  const chunkFilter = { userId };
  if (documentId) {
    chunkFilter.documentId = documentId;
  }
  const allChunks = await DocumentChunk.find(chunkFilter);

  if (!allChunks || allChunks.length === 0) {
    return {
      answer: 'Your uploaded documents are still processing or contained no readable text. Please check the document status.',
      sources: [],
      hasSufficientEvidence: false,
    };
  }

  // 3. Score chunks
  const scoredChunks = allChunks
    .map((chunk) => ({
      chunk,
      score: calculateRelevanceScore(question, chunk.content),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  // If score is negligible, indicate insufficient evidence
  if (scoredChunks.length === 0 || scoredChunks[0].score < 0.3) {
    return {
      answer:
        'Insufficient evidence found in your uploaded materials to answer this query. To get an accurate answer, upload lecture notes or textbook chapters covering this topic.',
      sources: [],
      hasSufficientEvidence: false,
    };
  }

  // Take top 3 most relevant chunks
  const topChunks = scoredChunks.slice(0, 3).map((item) => {
    const docName = docMap.get(String(item.chunk.documentId)) || 'Uploaded Document';
    return {
      docName,
      page: item.chunk.pageNumber || 1,
      snippet: item.chunk.content.slice(0, 280),
      fullChunk: item.chunk.content,
    };
  });

  // 4. Generate answer grounded in evidence
  let generatedAnswer = '';

  if (env.GEMINI_API_KEY) {
    try {
      const evidenceContext = topChunks
        .map((s, idx) => `[Source ${idx + 1}: ${s.docName}, Page ${s.page}]\n${s.fullChunk}`)
        .join('\n\n');

      const systemPrompt = `You are the OptiMind AI Grounded Tutor.
Answer the student's question using ONLY the provided document evidence below.
Do not hallucinate facts outside the provided sources.
Cite your claims with references like [DocName, Page X].
If the evidence does not directly support answering the question, say "Insufficient evidence in uploaded documents."`;

      const prompt = `Evidence:\n${evidenceContext}\n\nQuestion: "${question}"\n\nProvide a clear, grounded answer citing the sources:`;

      const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) generatedAnswer = text.trim();
      }
    } catch (e) {
      console.warn(`[RAG Gemini Call Warning] ${e.message}`);
    }
  }

  // Grounded fallback answer when offline or no API key
  if (!generatedAnswer) {
    const primarySource = topChunks[0];
    generatedAnswer = `According to ${primarySource.docName} (Page ${primarySource.page}): "${primarySource.snippet.replace(/\n+/g, ' ')}...". This directly addresses your question regarding "${question.trim()}".`;
  }

  return {
    answer: generatedAnswer,
    sources: topChunks.map(({ docName, page, snippet }) => ({ docName, page, snippet })),
    hasSufficientEvidence: true,
  };
}
