import type {
  InteractiveVisualLesson,
  PersonalizedRoadmap,
  QuizAttempt,
  StudyActivity,
  DocumentRecord,
  UserProfile,
} from '../types';

/**
 * Notice: The following records represent demonstration fixtures strictly for Phase 1 UI verification.
 * They are clearly tagged with [DEMO DATA - PHASE 1] in accordance with OptiMind AI's truth-in-product standard.
 */

export const DEMO_USER_PROFILE: UserProfile = {
  id: 'usr_demo_01',
  name: 'Alex Chen',
  email: 'alex.learner@example.com',
  isGuest: false,
  learningStreakDays: 5,
  totalHoursStudied: 14.5,
  completedLessonsCount: 12,
  averageQuizScore: 84,
};

export const DEMO_BINARY_SEARCH_LESSON: InteractiveVisualLesson = {
  id: 'lesson_bs_01',
  title: 'Binary Search Algorithm',
  subject: 'algorithms',
  difficulty: 'beginner',
  overview: 'Discover how divide-and-conquer reduces logarithmic search time from O(n) to O(log n) on sorted arrays.',
  interactiveControlsEnabled: true,
  steps: [
    {
      stepNumber: 1,
      title: 'Initial Array State',
      description: 'We are searching for the target value 42 in a sorted array of 9 elements.',
      visualState: {
        values: [7, 14, 21, 28, 35, 42, 49, 56, 63],
        highlightIndices: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        pointerIndex: 4,
        statusMessage: 'Pointers initialized: Left = Index 0 (7), Right = Index 8 (63). Target = 42.',
        diagramType: 'array',
      },
      explanation: 'Binary Search requires that the input collection is pre-sorted. We define two bounds: low (start) and high (end).',
      keyTakeaway: 'Always verify array is sorted before applying binary search.',
    },
    {
      stepNumber: 2,
      title: 'Calculate Midpoint',
      description: 'Midpoint index = floor((0 + 8) / 2) = Index 4 (value: 35).',
      visualState: {
        values: [7, 14, 21, 28, 35, 42, 49, 56, 63],
        highlightIndices: [4],
        pointerIndex: 4,
        statusMessage: 'Comparing Mid (35) with Target (42). Since 35 < 42, target must be in the right half.',
        diagramType: 'array',
      },
      explanation: 'We compare the element at mid with our target. Since 35 is strictly less than 42, the target cannot exist in the left half.',
      keyTakeaway: 'Half of the remaining search space is eliminated in a single operation.',
    },
    {
      stepNumber: 3,
      title: 'Adjust Left Boundary',
      description: 'Move left pointer to mid + 1 = Index 5 (value: 42). Right pointer remains at Index 8 (value: 63).',
      visualState: {
        values: [7, 14, 21, 28, 35, 42, 49, 56, 63],
        highlightIndices: [5, 6, 7, 8],
        pointerIndex: 6,
        statusMessage: 'New sub-array: [42, 49, 56, 63]. Recalculating midpoint: floor((5 + 8) / 2) = Index 6 (49).',
        diagramType: 'array',
      },
      explanation: 'The new midpoint is Index 6 (49). We evaluate whether 49 equals our target 42.',
      keyTakeaway: 'The active search space is now reduced to only 4 elements.',
    },
    {
      stepNumber: 4,
      title: 'Adjust Right Boundary',
      description: 'Since 49 > 42, move right pointer to mid - 1 = Index 5.',
      visualState: {
        values: [7, 14, 21, 28, 35, 42, 49, 56, 63],
        highlightIndices: [5],
        pointerIndex: 5,
        statusMessage: 'Left pointer = 5, Right pointer = 5. Recalculating mid: Index 5 (value 42).',
        diagramType: 'array',
      },
      explanation: 'Now both low and high point to index 5. Midpoint is index 5.',
      keyTakeaway: 'Boundary convergence leads directly to the target candidate.',
    },
    {
      stepNumber: 5,
      title: 'Target Found!',
      description: 'Array[5] == 42. Match confirmed at Index 5 in just 3 comparison steps!',
      visualState: {
        values: [7, 14, 21, 28, 35, 42, 49, 56, 63],
        highlightIndices: [5],
        pointerIndex: 5,
        statusMessage: 'Success! Target 42 found at Index 5 in 3 iterations. Time complexity: O(log 9) ≈ 3 ops.',
        diagramType: 'array',
      },
      explanation: 'Compared to a linear scan which would have taken 6 operations, binary search found 42 in 3 steps.',
      keyTakeaway: 'Logarithmic growth scales effortlessly even with millions of items.',
    },
  ],
};

export const DEMO_ROADMAP: PersonalizedRoadmap = {
  id: 'rdmp_demo_01',
  goal: 'Master Foundational Data Structures & Algorithmic Thinking',
  subject: 'Computer Science',
  skillLevel: 'intermediate',
  hoursPerWeek: 6,
  targetDurationWeeks: 8,
  overallProgress: 42,
  generatedAt: '2026-10-01',
  milestones: [
    {
      id: 'ms_01',
      title: '1. Asymptotic Analysis & Arrays',
      topics: ['Big-O, Big-Omega, Big-Theta notation', 'Dynamic arrays & memory layout', 'Two-pointer technique'],
      estimatedHours: 8,
      status: 'completed',
      progressPercentage: 100,
    },
    {
      id: 'ms_02',
      title: '2. Divide & Conquer and Sorting',
      topics: ['Binary Search variations', 'Merge Sort recursion tree', 'QuickSort partitioning logic'],
      estimatedHours: 12,
      status: 'in_progress',
      progressPercentage: 65,
    },
    {
      id: 'ms_03',
      title: '3. Linked Lists & Pointer Traversal',
      topics: ['Singly vs Doubly linked nodes', "Floyd's Cycle Detection", 'Reversal and merge patterns'],
      estimatedHours: 10,
      status: 'not_started',
      progressPercentage: 0,
    },
    {
      id: 'ms_04',
      title: '4. Trees & Graphs Foundations',
      topics: ['Binary Search Trees (BST)', 'Breadth-First Search (BFS)', 'Depth-First Search (DFS)'],
      estimatedHours: 16,
      status: 'not_started',
      progressPercentage: 0,
    },
  ],
};

export const DEMO_QUIZ_ATTEMPTS: QuizAttempt[] = [
  {
    id: 'qa_01',
    quizId: 'quiz_alg_01',
    title: 'Time Complexity & Big-O Fundamentals',
    score: 9,
    totalQuestions: 10,
    percentage: 90,
    completedAt: 'Yesterday, 4:15 PM',
    weakTopics: ['Amortized analysis on dynamic arrays'],
  },
  {
    id: 'qa_02',
    quizId: 'quiz_alg_02',
    title: 'Binary Search Edge Cases & Invariants',
    score: 8,
    totalQuestions: 10,
    percentage: 80,
    completedAt: '3 days ago',
    weakTopics: ['Integer overflow when computing mid = (L + R) / 2'],
  },
  {
    id: 'qa_03',
    quizId: 'quiz_rec_01',
    title: 'Recursion Call Stack & Base Conditions',
    score: 7,
    totalQuestions: 10,
    percentage: 70,
    completedAt: 'Last week',
    weakTopics: ['Stack memory limits', 'Tail call optimization'],
  },
];

export const DEMO_STUDY_ACTIVITIES: StudyActivity[] = [
  {
    id: 'act_01',
    date: 'Today, 2:30 PM',
    topic: 'Binary Search Algorithm (Visual Step-Through)',
    activityType: 'visual_simulation',
    durationMinutes: 25,
    masteryScore: 92,
  },
  {
    id: 'act_02',
    date: 'Yesterday, 4:00 PM',
    topic: 'Time Complexity Evaluation Assessment',
    activityType: 'quiz_evaluation',
    durationMinutes: 18,
    masteryScore: 90,
  },
  {
    id: 'act_03',
    date: '2 days ago',
    topic: 'Introduction to Pointers & Dynamic Memory',
    activityType: 'concept_lesson',
    durationMinutes: 35,
    masteryScore: 85,
  },
  {
    id: 'act_04',
    date: '4 days ago',
    topic: 'Distributed Systems & Vector Clocks PDF',
    activityType: 'rag_document',
    durationMinutes: 40,
    masteryScore: 78,
  },
];

export const DEMO_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'doc_01',
    name: 'CS106B_Lecture_04_Recursion.pdf',
    sizeBytes: 2450000,
    fileType: 'pdf',
    uploadedAt: 'Oct 08, 2026',
    status: 'ready',
    chunkCount: 18,
    extractedSnippet: 'Recursion is an algorithmic strategy where a function resolves a sub-instance of the same problem until reaching a base condition...',
  },
  {
    id: 'doc_02',
    name: 'Operating_Systems_Virtual_Memory_Notes.txt',
    sizeBytes: 42000,
    fileType: 'txt',
    uploadedAt: 'Oct 05, 2026',
    status: 'ready',
    chunkCount: 6,
    extractedSnippet: 'Paging divides memory into fixed-size blocks termed page frames. The Memory Management Unit (MMU) translates virtual addresses...',
  },
];
