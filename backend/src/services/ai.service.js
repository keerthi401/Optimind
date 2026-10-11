import { env } from '../config/env.js';

// Cache for identical queries (1 hour TTL)
const responseCache = new Map();

/**
 * Call Gemini REST API with strict timeouts and structured output validation
 */
async function callGeminiApi(prompt, systemInstruction = '', responseSchema = null) {
  if (!env.GEMINI_API_KEY) {
    return null; // Signals offline mode
  }

  const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[Gemini API Error] HTTP ${res.status}: ${errorText}`);
      throw new Error(`Gemini API returned status ${res.status}: ${errorText}`);
    }

    const json = await res.json();
    const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Gemini API returned empty candidate content');
    }

    let textToParse = candidateText.trim();
    if (textToParse.startsWith('```json')) {
      textToParse = textToParse.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    } else if (textToParse.startsWith('```')) {
      textToParse = textToParse.replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
    }

    try {
      return JSON.parse(textToParse);
    } catch (parseErr) {
      console.warn('[Gemini Parse Notice] Fallback JSON sanitization:', parseErr.message);
      // Attempt to extract largest JSON object substring if surrounded by extraneous text
      const firstBrace = textToParse.indexOf('{');
      const lastBrace = textToParse.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        return JSON.parse(textToParse.substring(firstBrace, lastBrace + 1));
      }
      throw parseErr;
    }
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Gemini API call timed out after 35 seconds');
    }
    throw err;
  }
}

/**
 * Generate Structured Concept Explanation
 */
export async function generateConceptExplanation({ topic, subject = 'general', difficulty = 'intermediate', format = 'step_by_step' }) {
  const cacheKey = `exp_${subject}_${difficulty}_${format}_${topic.toLowerCase().trim()}`;
  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey);
  }

  const systemInstruction = `You are an elite educational AI tutor for OptiMind AI.
Generate clear, pedagogically sound, structured explanations.
Format the output STRICTLY as valid JSON with the following structure:
{
  "summary": "1-2 sentence core concept overview",
  "steps": [
    { "title": "Step 1 Title", "content": "Detailed step explanation" }
  ],
  "terminology": [
    { "term": "Key Term", "definition": "Clear concise definition" }
  ],
  "analogy": "A relatable real-world analogy illuminating the concept"
}`;

  const prompt = `Explain the following topic:
Topic: "${topic}"
Subject Area: "${subject}"
Target Level: "${difficulty}"
Format Style: "${format}"

Provide between 3 and 5 clear steps, at least 2 key terms, and an intuitive analogy.`;

  let result;
  if (env.GEMINI_API_KEY) {
    try {
      const aiData = await callGeminiApi(prompt, systemInstruction);
      if (aiData && aiData.summary && Array.isArray(aiData.steps)) {
        result = {
          isLiveAi: true,
          provider: 'google_gemini',
          model: env.GEMINI_MODEL,
          data: aiData,
        };
      }
    } catch (err) {
      console.warn(`[AI Service] Live call failed (${err.message}). Falling back to structured educational synthesis.`);
    }
  }

  // If live AI is unavailable or GEMINI_API_KEY is not configured
  if (!result) {
    result = {
      isLiveAi: false,
      provider: 'educational_fallback_engine',
      notice: env.GEMINI_API_KEY
        ? 'Live AI service temporarily unavailable. Using resilient educational synthesis.'
        : 'GEMINI_API_KEY not configured in backend/.env. Using structured educational synthesis.',
      data: synthesizeConceptExplanation(topic, subject, difficulty, format),
    };
  }

  responseCache.set(cacheKey, result);
  return result;
}

/**
 * Pedagogically sound fallback generator for offline / unkeyed evaluation
 */
function synthesizeConceptExplanation(topic, subject, difficulty, format) {
  const t = topic.trim();
  return {
    summary: `${t} is a fundamental concept in ${subject} designed to optimize understanding, problem-solving, and systematic execution.`,
    steps: [
      {
        title: `1. Core Foundation of ${t}`,
        content: `At the ${difficulty} level, ${t} begins with identifying the fundamental boundary conditions, primary inputs, and core objectives.`,
      },
      {
        title: `2. Mechanism & Structural Flow`,
        content: `The system processes information sequentially or iteratively, maintaining essential invariants while eliminating extraneous overhead.`,
      },
      {
        title: `3. Practical Application & Trade-offs`,
        content: `Applying ${t} requires balancing performance, maintainability, and resource constraints, avoiding common edge-case pitfalls.`,
      },
      {
        title: `4. Verification & Synthesis`,
        content: `Final outcomes are validated against test assertions and theoretical benchmarks to guarantee correctness.`,
      },
    ],
    terminology: [
      {
        term: 'Invariant',
        definition: 'A condition or property that remains true throughout the lifecycle of the system or algorithm.',
      },
      {
        term: 'State Transition',
        definition: 'The progression from one distinct operational condition to another based on given rules.',
      },
    ],
    analogy: `Understanding ${t} is like following an architectural blueprint: each layer rests on a verified base, guaranteeing overall stability and predictable results.`,
  };
}

/**
 * Generate Structured Visual Lesson Steps & Mermaid Diagram
 */
export async function generateVisualLesson({ topic, subject = 'algorithms', difficulty = 'intermediate' }) {
  const systemInstruction = `You are an expert visual educator for OptiMind AI.
Create a step-by-step visual lesson for the given topic with accompanying Mermaid.js diagram definitions.
Return STRICTLY valid JSON with structure:
{
  "title": "Title of the visual lesson",
  "overview": "Overview paragraph",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step title",
      "description": "Short description",
      "explanation": "Detailed explanation",
      "keyTakeaway": "Key takeaway",
      "visualState": {
        "statusMessage": "What is happening at this step",
        "highlightIndices": [0, 1],
        "values": [1, 2, 3]
      },
      "mermaidDiagram": "flowchart TD\\n  A[Start] --> B[Process]"
    }
  ]
}`;

  const prompt = `Generate an interactive visual lesson for:
Topic: "${topic}"
Subject: "${subject}"
Difficulty: "${difficulty}"
Include 3 to 5 clear sequential stages and a valid Mermaid.js diagram definition for each step.`;

  if (env.GEMINI_API_KEY) {
    try {
      const aiData = await callGeminiApi(prompt, systemInstruction);
      if (aiData && aiData.steps && aiData.steps.length > 0) {
        return {
          isLiveAi: true,
          provider: 'google_gemini',
          data: aiData,
        };
      }
    } catch (err) {
      console.warn(`[AI Service] Visual generation call failed (${err.message}). Using synthesis.`);
    }
  }

  return {
    isLiveAi: false,
    provider: 'educational_fallback_engine',
    notice: 'Using structured visual lesson synthesis. Set GEMINI_API_KEY in backend/.env for dynamic Gemini generation.',
    data: synthesizeVisualLesson(topic, subject, difficulty),
  };
}

function synthesizeVisualLesson(topic, subject, difficulty) {
  return {
    title: `${topic} - Visual Walkthrough`,
    overview: `An interactive visual deconstruction of ${topic} illustrating state transformations and structural dynamics at the ${difficulty} level.`,
    steps: [
      {
        stepNumber: 1,
        title: 'Initial State & Input Setup',
        description: `Set up the baseline environment and initial input configuration for ${topic}.`,
        explanation: 'Before execution, parameters and pointers are initialized to their default reference values.',
        keyTakeaway: 'Accurate boundary initialization prevents out-of-bounds errors and runtime faults.',
        visualState: {
          values: [10, 25, 40, 55, 70],
          highlightIndices: [0],
          pointerIndex: 0,
          statusMessage: 'Initialized baseline state: low pointer set to 0, high pointer set to end.',
        },
        mermaidDiagram: `flowchart LR
  Start(["Input Received"]) --> Init["Initialize State"]
  Init --> Stage1["Stage 1: Pointers Ready"]`,
      },
      {
        stepNumber: 2,
        title: 'Active Transformation & Invariant Check',
        description: `Execute the central step of ${topic}, evaluating the current state against target criteria.`,
        explanation: 'The system assesses mid-state values to prune the search space or update linked pointers.',
        keyTakeaway: 'Eliminating non-viable paths guarantees logarithmic or linear convergence.',
        visualState: {
          values: [10, 25, 40, 55, 70],
          highlightIndices: [2],
          pointerIndex: 2,
          statusMessage: 'Evaluating midpoint: condition verified, advancing downstream pointer.',
        },
        mermaidDiagram: `flowchart TD
  Stage1["Inspect State"] --> Check{"Verify Condition"}
  Check -- Yes --> Transform["Execute Transition"]
  Check -- No --> Prune["Prune Search Space"]`,
      },
      {
        stepNumber: 3,
        title: 'Convergence & Verified Completion',
        description: `Final state reached with verified assertions and clean output.`,
        explanation: 'All iterations converge toward the optimal terminating state, returning the solution.',
        keyTakeaway: 'Formal termination proof guarantees that execution completes safely without infinite cycles.',
        visualState: {
          values: [10, 25, 40, 55, 70],
          highlightIndices: [3, 4],
          pointerIndex: 4,
          statusMessage: 'Target condition satisfied. Final state locked and validated.',
        },
        mermaidDiagram: `flowchart LR
  Transform["Completed Operations"] --> Result(["Optimal Solution Output"])`,
      },
    ],
  };
}
