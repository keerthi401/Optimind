import { v4 as uuidv4 } from 'uuid';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import User from '../models/User.js';
import Document from '../models/Document.js';
import DocumentChunk from '../models/DocumentChunk.js';
import { env } from '../config/env.js';

export async function generateQuizQuestions({ topic, subject = 'general', difficulty = 'intermediate', documentId = null, userId }) {
  let contextMaterial = '';

  if (documentId) {
    const doc = await Document.findById(documentId);
    if (doc) {
      const chunks = await DocumentChunk.find({ documentId, userId });
      contextMaterial = chunks.map((c) => c.content).slice(0, 4).join('\n\n');
    }
  }

  // Live Gemini generation if API key is present
  if (env.GEMINI_API_KEY) {
    try {
      const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

      const systemPrompt = `You are an expert diagnostic quiz creator for OptiMind AI.
Generate a high-yield diagnostic quiz with 3 to 4 multiple-choice questions.
Return strictly valid JSON with this format:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOptionIndex": 0,
      "explanation": "Why this option is correct and why other options are incorrect",
      "topic": "Specific sub-topic"
    }
  ]
}`;

      const prompt = `Topic: "${topic}"
Subject: "${subject}"
Difficulty: "${difficulty}"
${contextMaterial ? `Source Document Material:\n${contextMaterial.slice(0, 1500)}` : ''}

Generate 3-4 diagnostic multiple-choice questions testing conceptual comprehension.`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
            return parsed.questions.map((q) => ({
              id: uuidv4(),
              question: q.question,
              options: q.options,
              correctOptionIndex: Number(q.correctOptionIndex) || 0,
              explanation: q.explanation || 'Verified correct answer.',
              topic: q.topic || topic,
            }));
          }
        }
      }
    } catch (e) {
      console.warn(`[Quiz Gemini Error] ${e.message}`);
    }
  }

  // Deterministic pedagogical questions for robust offline operation
  return synthesizeQuizQuestions(topic, difficulty);
}

function synthesizeQuizQuestions(topic, difficulty) {
  const t = topic.trim();
  return [
    {
      id: uuidv4(),
      question: `Which fundamental principle governs the optimal operation of ${t}?`,
      options: [
        'Strict maintenance of state invariants throughout transitions',
        'Arbitrary non-deterministic state branching',
        'Complete avoidance of boundary condition checks',
        'Unbounded quadratic memory allocation',
      ],
      correctOptionIndex: 0,
      explanation:
        'In computer science and applied mathematics, correctness relies on preserving loop and state invariants from initialization to termination.',
      topic: `${t} Fundamentals`,
    },
    {
      id: uuidv4(),
      question: `What represents the primary trade-off when implementing ${t} at an ${difficulty} level?`,
      options: [
        'Optimizing time complexity versus spatial memory overhead',
        'Disregarding all input validation to maximize throughput',
        'Relying entirely on manual garbage collection without assertions',
        'Replacing all structured routines with unconstrained jumps',
      ],
      correctOptionIndex: 0,
      explanation:
        'The foundational trade-off in algorithmic design is balancing execution time (CPU cycles) against spatial complexity (RAM/cache footprint).',
      topic: `${t} Trade-offs`,
    },
    {
      id: uuidv4(),
      question: `How should a robust implementation of ${t} handle edge conditions (such as null/empty inputs)?`,
      options: [
        'Validate inputs explicitly upfront and exit gracefully or raise a structured error',
        'Silently ignore empty inputs and continue execution into memory faults',
        'Loop indefinitely until external input arrives',
        'Crash the host process immediately without logging',
      ],
      correctOptionIndex: 0,
      explanation:
        'Defensive software design requires explicit boundary checking at input barriers to maintain fault tolerance.',
      topic: `${t} Edge Cases`,
    },
  ];
}

/**
 * Create a new quiz and persist to store
 */
export async function createQuizRecord({ userId, topic, subject, difficulty, documentId }) {
  const questions = await generateQuizQuestions({ topic, subject, difficulty, documentId, userId });

  const quiz = await Quiz.create({
    id: uuidv4(),
    userId,
    title: `${topic} Diagnostic Quiz`,
    subject,
    difficulty,
    source: documentId ? 'document' : 'topic',
    documentId,
    questions,
  });

  return sanitizeQuizForStudent(quiz);
}

/**
 * Remove correctOptionIndex so the student cannot inspect network payloads
 */
export function sanitizeQuizForStudent(quiz) {
  return {
    id: quiz._id || quiz.id,
    title: quiz.title,
    subject: quiz.subject,
    difficulty: quiz.difficulty,
    totalQuestions: quiz.questions.length,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      topic: q.topic,
    })),
  };
}

/**
 * Evaluate submitted answers securely on the server
 */
export async function evaluateQuizSubmission({ userId, quizId, answers }) {
  let quiz = await Quiz.findById(quizId);
  if (!quiz && (quizId === 'sample_quiz_01' || !quizId)) {
    quiz = await Quiz.create({
      _id: 'sample_quiz_01',
      id: 'sample_quiz_01',
      title: 'Dynamic Memory Allocation & Pointers Diagnostic',
      topic: 'Dynamic Memory Allocation & Pointers in C',
      difficulty: 'intermediate',
      userId: userId || 'guest_anon',
      questions: [
        {
          id: 'q1',
          question: 'What occurs when dynamic memory allocated with malloc() is never passed to free() before program termination?',
          options: [
            'Stack overflow exception is triggered',
            'A memory leak occurs, retaining unusable heap space',
            'The compiler automatically injects deallocation logic',
            'Segmentation fault occurs immediately upon function return',
          ],
          correctOptionIndex: 1,
          explanation: 'Memory allocated dynamically on the heap remains reserved until freed explicitly, causing a memory leak if orphaned.',
          topic: 'Memory Leaks',
        },
      ],
    });
  }
  if (!quiz) {
    throw new Error('Quiz not found');
  }

  let score = 0;
  const weakTopics = [];
  const questionResults = [];

  quiz.questions.forEach((q, idx) => {
    const selectedIndex = answers[idx] !== undefined ? answers[idx] : -1;
    const isCorrect = selectedIndex === q.correctOptionIndex;

    if (isCorrect) {
      score++;
    } else {
      if (!weakTopics.includes(q.topic)) {
        weakTopics.push(q.topic);
      }
    }

    questionResults.push({
      questionId: q.id,
      question: q.question,
      selectedOptionIndex: selectedIndex,
      correctOptionIndex: q.correctOptionIndex,
      isCorrect,
      explanation: q.explanation,
      topic: q.topic,
    });
  });

  const totalQuestions = quiz.questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);

  // Persist attempt
  const attempt = await QuizAttempt.create({
    id: uuidv4(),
    userId,
    quizId,
    title: quiz.title,
    score,
    totalQuestions,
    percentage,
    weakTopics,
    questionResults,
  });

  // Update user stats
  try {
    const user = await User.findById(userId);
    if (user) {
      const allAttempts = await QuizAttempt.find({ userId });
      const avgScore = Math.round(
        allAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / Math.max(1, allAttempts.length)
      );
      await User.findByIdAndUpdate(userId, {
        averageQuizScore: avgScore,
      });
    }
  } catch (err) {
    console.warn(`[User Stats Update Error] ${err.message}`);
  }

  return {
    attemptId: attempt._id || attempt.id,
    title: quiz.title,
    score,
    totalQuestions,
    percentage,
    weakTopics,
    questionResults,
  };
}
