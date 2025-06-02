-- Create trivia_questions table
CREATE TABLE IF NOT EXISTS trivia_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_answer INTEGER NOT NULL,
  year_indicator INTEGER NOT NULL,
  difficulty TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add constraints
  CONSTRAINT valid_difficulty CHECK (difficulty IN ('easy', 'medium', 'hard')),
  CONSTRAINT valid_correct_answer CHECK (correct_answer >= 0 AND correct_answer <= 3)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_trivia_questions_difficulty ON trivia_questions (difficulty);
CREATE INDEX IF NOT EXISTS idx_trivia_questions_category ON trivia_questions (category);
CREATE INDEX IF NOT EXISTS idx_trivia_questions_created_at ON trivia_questions (created_at DESC);

-- Add comment to the table
COMMENT ON TABLE trivia_questions IS 'Stores crypto trivia questions with different difficulty levels';
