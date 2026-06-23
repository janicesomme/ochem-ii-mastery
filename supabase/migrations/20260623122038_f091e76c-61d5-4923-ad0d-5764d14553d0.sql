
-- Chapters
CREATE TABLE public.chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number int NOT NULL,
  title text NOT NULL,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.chapters TO anon, authenticated;
GRANT ALL ON public.chapters TO service_role;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Chapters are publicly readable" ON public.chapters FOR SELECT USING (true);

-- Topics
CREATE TABLE public.topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.topics TO anon, authenticated;
GRANT ALL ON public.topics TO service_role;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Topics are publicly readable" ON public.topics FOR SELECT USING (true);

-- Questions
CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES public.topics(id) ON DELETE SET NULL,
  title text NOT NULL,
  prompt text NOT NULL,
  question_type text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
  memory_trick text,
  common_trap text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.questions TO anon, authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Questions are publicly readable" ON public.questions FOR SELECT USING (true);

-- Hints (Hint 1, Hint 2, Checklist)
CREATE TABLE public.question_hints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  hint_level int NOT NULL,
  kind text NOT NULL DEFAULT 'hint' CHECK (kind IN ('hint','checklist')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.question_hints TO anon, authenticated;
GRANT ALL ON public.question_hints TO service_role;
ALTER TABLE public.question_hints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hints are publicly readable" ON public.question_hints FOR SELECT USING (true);

-- Step-by-step solutions
CREATE TABLE public.question_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  step_number int NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.question_steps TO anon, authenticated;
GRANT ALL ON public.question_steps TO service_role;
ALTER TABLE public.question_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Steps are publicly readable" ON public.question_steps FOR SELECT USING (true);

-- Final answers
CREATE TABLE public.question_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.question_answers TO anon, authenticated;
GRANT ALL ON public.question_answers TO service_role;
ALTER TABLE public.question_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Answers are publicly readable" ON public.question_answers FOR SELECT USING (true);

-- Quick sheets
CREATE TABLE public.quick_sheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE SET NULL,
  title text NOT NULL,
  summary text NOT NULL,
  content text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.quick_sheets TO anon, authenticated;
GRANT ALL ON public.quick_sheets TO service_role;
ALTER TABLE public.quick_sheets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quick sheets are publicly readable" ON public.quick_sheets FOR SELECT USING (true);

-- User attempts (optional auth — kept for future; anon users use localStorage)
CREATE TABLE public.user_question_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  score int NOT NULL CHECK (score IN (0,1,3,5)),
  hints_used int NOT NULL DEFAULT 0,
  used_solution boolean NOT NULL DEFAULT false,
  attempt_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_question_attempts TO authenticated;
GRANT ALL ON public.user_question_attempts TO service_role;
ALTER TABLE public.user_question_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own attempts" ON public.user_question_attempts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User notes
CREATE TABLE public.user_question_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  note text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, question_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_question_notes TO authenticated;
GRANT ALL ON public.user_question_notes TO service_role;
ALTER TABLE public.user_question_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own notes" ON public.user_question_notes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX ON public.topics (chapter_id);
CREATE INDEX ON public.questions (chapter_id);
CREATE INDEX ON public.questions (topic_id);
CREATE INDEX ON public.question_hints (question_id);
CREATE INDEX ON public.question_steps (question_id);
CREATE INDEX ON public.question_answers (question_id);
CREATE INDEX ON public.quick_sheets (chapter_id);
