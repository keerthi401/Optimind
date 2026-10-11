export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type SubjectArea =
  | 'computer_science'
  | 'algorithms'
  | 'mathematics'
  | 'physics'
  | 'biology'
  | 'networking'
  | 'general';

export interface VisualStep {
  stepNumber: number;
  title: string;
  description: string;
  visualState: {
    highlightIndices?: number[];
    pointerIndex?: number;
    values?: (number | string)[];
    statusMessage?: string;
    diagramType?: 'array' | 'flow' | 'tree' | 'graph';
  };
  explanation: string;
  keyTakeaway: string;
  mermaidDiagram?: string;
}

export interface InteractiveVisualLesson {
  id: string;
  title: string;
  subject: SubjectArea;
  difficulty: DifficultyLevel;
  overview: string;
  steps: VisualStep[];
  interactiveControlsEnabled: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  explanation?: string;
  difficulty: DifficultyLevel;
  topic: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  title: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
  weakTopics: string[];
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  topics: string[];
  estimatedHours: number;
  status: 'not_started' | 'in_progress' | 'completed';
  progressPercentage: number;
}

export interface PersonalizedRoadmap {
  id: string;
  goal: string;
  subject: string;
  skillLevel: DifficultyLevel;
  hoursPerWeek: number;
  targetDurationWeeks: number;
  overallProgress: number;
  milestones: RoadmapMilestone[];
  generatedAt: string;
}

export interface StudyActivity {
  id: string;
  date: string;
  topic: string;
  activityType: 'concept_lesson' | 'visual_simulation' | 'quiz_evaluation' | 'rag_document';
  durationMinutes: number;
  masteryScore?: number;
}

export interface DocumentRecord {
  id: string;
  name: string;
  sizeBytes: number;
  fileType: 'pdf' | 'txt' | 'png' | 'jpg';
  uploadedAt: string;
  status: 'ready' | 'processing' | 'error';
  chunkCount: number;
  extractedSnippet: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isGuest: boolean;
  learningStreakDays: number;
  totalHoursStudied: number;
  completedLessonsCount: number;
  averageQuizScore: number;
}
