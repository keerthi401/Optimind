-- ========================================================
-- OptiMind AI — Supabase PostgreSQL Database Schema
-- Run this script in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ========================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "isGuest" BOOLEAN DEFAULT FALSE,
  "avatarUrl" TEXT DEFAULT '',
  "learningStreakDays" INTEGER DEFAULT 1,
  "totalHoursStudied" NUMERIC DEFAULT 0,
  "completedLessonsCount" INTEGER DEFAULT 0,
  "averageQuizScore" NUMERIC DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users ("email");

-- 2. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.documents (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "originalFilename" TEXT NOT NULL,
  "fileType" TEXT NOT NULL,
  "sizeBytes" BIGINT NOT NULL,
  "storagePath" TEXT NOT NULL,
  "status" TEXT DEFAULT 'processing',
  "chunkCount" INTEGER DEFAULT 0,
  "extractedSnippet" TEXT DEFAULT '',
  "fullText" TEXT DEFAULT '',
  "errorMessage" TEXT DEFAULT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents ("userId");

-- 3. DOCUMENT CHUNKS TABLE
CREATE TABLE IF NOT EXISTS public.document_chunks (
  "id" TEXT PRIMARY KEY,
  "documentId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "chunkIndex" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "pageNumber" INTEGER DEFAULT 1,
  "embedding" JSONB DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON public.document_chunks ("documentId");
CREATE INDEX IF NOT EXISTS idx_chunks_user_id ON public.document_chunks ("userId");

-- 4. EXPLANATIONS TABLE
CREATE TABLE IF NOT EXISTS public.explanations (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "subject" TEXT DEFAULT 'general',
  "difficulty" TEXT DEFAULT 'intermediate',
  "format" TEXT DEFAULT 'step_by_step',
  "summary" TEXT NOT NULL,
  "steps" JSONB DEFAULT '[]'::jsonb,
  "terminology" JSONB DEFAULT '[]'::jsonb,
  "analogy" TEXT DEFAULT '',
  "isSaved" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_explanations_user_id ON public.explanations ("userId");

-- 5. LESSONS TABLE
CREATE TABLE IF NOT EXISTS public.lessons (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "subject" TEXT DEFAULT 'general',
  "difficulty" TEXT DEFAULT 'intermediate',
  "overview" TEXT NOT NULL,
  "steps" JSONB DEFAULT '[]'::jsonb,
  "isSaved" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lessons_user_id ON public.lessons ("userId");

-- 6. QUIZZES TABLE
CREATE TABLE IF NOT EXISTS public.quizzes (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "subject" TEXT DEFAULT 'general',
  "difficulty" TEXT DEFAULT 'intermediate',
  "source" TEXT DEFAULT 'topic',
  "documentId" TEXT DEFAULT NULL,
  "questions" JSONB DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON public.quizzes ("userId");

-- 7. QUIZ ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "quizId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "score" NUMERIC NOT NULL,
  "totalQuestions" INTEGER NOT NULL,
  "percentage" NUMERIC NOT NULL,
  "weakTopics" JSONB DEFAULT '[]'::jsonb,
  "questionResults" JSONB DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts ("userId");
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON public.quiz_attempts ("quizId");

-- 8. ROADMAPS TABLE
CREATE TABLE IF NOT EXISTS public.roadmaps (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "goal" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "skillLevel" TEXT DEFAULT 'intermediate',
  "hoursPerWeek" NUMERIC DEFAULT 5,
  "targetDurationWeeks" NUMERIC DEFAULT 4,
  "overallProgress" NUMERIC DEFAULT 0,
  "milestones" JSONB DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON public.roadmaps ("userId");

-- 9. LEARNING PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.learning_progress (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "activityType" TEXT NOT NULL,
  "durationMinutes" NUMERIC DEFAULT 15,
  "masteryScore" NUMERIC DEFAULT 80,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON public.learning_progress ("userId");

-- 10. ACCOUNT DETAILS TABLE (Extended Profile, Academic Info & Settings)
CREATE TABLE IF NOT EXISTS public.account_details (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "username" TEXT UNIQUE,
  "phoneNumber" TEXT DEFAULT '',
  "institution" TEXT DEFAULT '',
  "major" TEXT DEFAULT '',
  "academicLevel" TEXT DEFAULT 'Undergraduate',
  "bio" TEXT DEFAULT '',
  "country" TEXT DEFAULT '',
  "timezone" TEXT DEFAULT 'UTC',
  "preferredLanguage" TEXT DEFAULT 'en',
  "socialLinks" JSONB DEFAULT '{"github": "", "linkedin": "", "twitter": "", "website": ""}'::jsonb,
  "learningPreferences" JSONB DEFAULT '{"theme": "system", "dailyGoalMinutes": 30, "preferredStyle": "visual_step_by_step", "audioNarrationSpeed": 1.0, "soundEffects": true}'::jsonb,
  "notificationSettings" JSONB DEFAULT '{"emailDigest": true, "streakReminders": true, "quizRecommendations": true, "productUpdates": false}'::jsonb,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_account_details_user FOREIGN KEY ("userId") REFERENCES public.users ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_account_details_user_id ON public.account_details ("userId");
CREATE INDEX IF NOT EXISTS idx_account_details_username ON public.account_details ("username");

-- 11. USER SESSIONS & ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.user_sessions (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "loginMethod" TEXT DEFAULT 'email_password',
  "ipAddress" TEXT DEFAULT '',
  "userAgent" TEXT DEFAULT '',
  "deviceType" TEXT DEFAULT 'desktop',
  "lastActiveAt" TIMESTAMPTZ DEFAULT NOW(),
  "isRevoked" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_user_sessions_user FOREIGN KEY ("userId") REFERENCES public.users ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions ("userId");

-- Allow Service Role and Public access (handled by application JWT auth)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.explanations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create open policies for backend service role / API access
DO $$
BEGIN
  CREATE POLICY "Allow all access to users" ON public.users FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow all access to documents" ON public.documents FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow all access to document_chunks" ON public.document_chunks FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow all access to explanations" ON public.explanations FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow all access to lessons" ON public.lessons FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow all access to quizzes" ON public.quizzes FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow all access to quiz_attempts" ON public.quiz_attempts FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow all access to roadmaps" ON public.roadmaps FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow all access to learning_progress" ON public.learning_progress FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow all access to account_details" ON public.account_details FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow all access to user_sessions" ON public.user_sessions FOR ALL USING (true) WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
