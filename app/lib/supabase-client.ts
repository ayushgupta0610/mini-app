import { createClient } from '@supabase/supabase-js';
import { TriviaQuestion } from './trivia-data';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Type for database trivia questions
export interface SupabaseTriviaQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  correct_answer: number;
  year_indicator: number;
  difficulty: string;
  created_at: string;
}

// Create Supabase client if environment variables are available
export const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not configured');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
};

/**
 * Fetches trivia questions from Supabase database
 * @param count Number of questions to retrieve
 * @param difficulty Difficulty level of questions
 * @returns Promise resolving to array of TriviaQuestion objects
 */
export async function fetchTriviaQuestionsFromSupabase(
  count: number = 10,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<TriviaQuestion[]> {
  try {
    const supabase = createSupabaseClient();
    
    // Query the database for questions with the specified difficulty
    const { data, error } = await supabase
      .from('trivia_questions')
      .select('*')
      .eq('difficulty', difficulty)
      .order('created_at', { ascending: false })
      .limit(count);
    
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error('No questions found in database');
    }
    
    // Convert Supabase format to app format
    return data.map((item: SupabaseTriviaQuestion): TriviaQuestion => ({
      id: item.id,
      category: item.category as TriviaQuestion['category'],
      question: item.question,
      options: item.options,
      correctAnswer: item.correct_answer,
      yearIndicator: item.year_indicator
    }));
  } catch (error) {
    console.error('Error fetching questions from Supabase:', error);
    throw error;
  }
}
