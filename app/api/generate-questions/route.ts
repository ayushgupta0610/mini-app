import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { TriviaQuestion } from "@/app/lib/trivia-data";
import { createClient } from '@supabase/supabase-js';

// Get API keys from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Define the database schema type
type TriviaQuestionRecord = {
  id: string;
  category: TriviaQuestion['category'];
  question: string;
  options: string[];
  correct_answer: number;
  year_indicator: number;
  difficulty: string;
  created_at: string;
};

/**
 * Generates crypto trivia questions using Gemini API
 * Each question will be from a specific year, with years decreasing as difficulty increases
 */
export async function POST(request: NextRequest) {
  try {
    const { count = 8, difficulty = "medium" } = await request.json();

    // Validate API key
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured on the server" },
        { status: 500 }
      );
    }

    // Validate Supabase connection
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase connection not configured on the server" },
        { status: 500 }
      );
    }

    // Try to fetch questions from Supabase first
    const questions = await fetchTriviaQuestionsFromDatabase(
      count,
      difficulty as "easy" | "medium" | "hard"
    );

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}

/**
 * Fetches crypto trivia questions from the database
 * If not enough questions are found, generates new ones using Gemini API
 */
async function fetchTriviaQuestionsFromDatabase(
  count: number = 8,
  difficulty: "easy" | "medium" | "hard" = "medium"
): Promise<TriviaQuestion[]> {
  if (!supabase) {
    throw new Error("Supabase client is required");
  }

  // Define the difficulty level filter
  let difficultyFilter: string;
  switch (difficulty) {
    case "easy":
      difficultyFilter = "easy";
      break;
    case "hard":
      difficultyFilter = "hard";
      break;
    default:
      difficultyFilter = "medium";
  }

  try {
    // Fetch questions from database
    const { data: dbQuestions, error } = await supabase
      .from('trivia_questions')
      .select('*')
      .eq('difficulty', difficultyFilter)
      .order('created_at', { ascending: false })
      .limit(count);

    if (error) {
      console.error("Error fetching questions from database:", error);
      // If there's an error with the database, fall back to generating questions
      return fetchTriviaQuestionsFromGemini(count, difficulty);
    }

    // If we have enough questions from the database, return them
    if (dbQuestions && dbQuestions.length >= count) {
      // Map database questions to TriviaQuestion format
      return dbQuestions.map((q: TriviaQuestionRecord) => ({
        id: q.id,
        category: q.category,
        question: q.question,
        options: q.options,
        correctAnswer: q.correct_answer,
        yearIndicator: q.year_indicator
      }));
    }

    // If we don't have enough questions, generate new ones
    console.log(`Not enough questions in database (${dbQuestions?.length || 0}/${count}), generating new ones...`);
    const generatedQuestions = await fetchTriviaQuestionsFromGemini(
      count - (dbQuestions?.length || 0),
      difficulty
    );

    // Store the newly generated questions in the database
    if (generatedQuestions.length > 0) {
      const questionsToInsert = generatedQuestions.map(q => ({
        id: q.id,
        category: q.category,
        question: q.question,
        options: q.options,
        correct_answer: q.correctAnswer,
        year_indicator: q.yearIndicator,
        difficulty: difficultyFilter,
        created_at: new Date().toISOString()
      }));

      const { error: insertError } = await supabase
        .from('trivia_questions')
        .insert(questionsToInsert);

      if (insertError) {
        console.error("Error storing questions in database:", insertError);
      }
    }

    // Combine database questions with newly generated ones
    return [
      ...(dbQuestions || []).map((q: TriviaQuestionRecord) => ({
        id: q.id,
        category: q.category,
        question: q.question,
        options: q.options,
        correctAnswer: q.correct_answer,
        yearIndicator: q.year_indicator
      })), 
      ...generatedQuestions
    ];
  } catch (error) {
    console.error("Unexpected error with database operations:", error);
    return fetchTriviaQuestionsFromGemini(count, difficulty);
  }
}

/**
 * Fetches crypto trivia questions from Gemini API based on difficulty
 * Each question will be from a specific year, with years decreasing as difficulty increases
 */
async function fetchTriviaQuestionsFromGemini(
  count: number = 8,
  difficulty: "easy" | "medium" | "hard" = "medium"
): Promise<TriviaQuestion[]> {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is required");
  }

  // Initialize the Gemini API client with the latest package
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  
  // Configure safety settings
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  // Calculate the starting year based on difficulty
  const startYear = 2024;
  const yearDecrement =
    difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;

  // Prepare the questions array
  const questions: TriviaQuestion[] = [];

  // Define the categories we want questions for
  const categories: Array<TriviaQuestion["category"]> = [
    "development",
    "memes-nfts-tokens",
    "scams-incidents",
    "crypto-characters",
  ];

  // Calculate how many questions we need per category
  const questionsPerCategory = Math.floor(count / categories.length);
  const remainder = count % categories.length;

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const categoryCount =
      i < remainder ? questionsPerCategory + 1 : questionsPerCategory;

    for (let j = 0; j < categoryCount; j++) {
      const year = startYear - j * yearDecrement;

      try {
        const prompt = `Generate a high-quality crypto trivia question about events, developments, or notable things that happened around the year ${year} related to the category "${category}".

Requirements:
1. The question should be multiple choice with exactly 4 options
2. Only one option should be correct
3. The question should be clear and unambiguous
4. The options should be distinct and not too similar
5. The correct answer should be factual and verifiable
6. The question should be challenging but fair for ${difficulty} difficulty level
7. Include a brief explanation of why the correct answer is right

Format your response as a valid JSON object with the following structure:
{
  "question": "The question text",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctAnswer": 0, // Index of the correct answer (0-3)
  "explanation": "Brief explanation of why this is the correct answer"
}`;

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          safetySettings,
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 1024,
          },
        });
        const response = result.response;
        const text = response.text();

        // Extract the JSON from the response
        const jsonMatch =
          text.match(/```json\n([\s\S]*?)\n```/) ||
          text.match(/```([\s\S]*?)```/) ||
          text.match(/{[\s\S]*?}/);

        if (jsonMatch) {
          const jsonText = jsonMatch[1] || jsonMatch[0];
          const parsedResponse = JSON.parse(
            jsonText.replace(/```/g, "").trim()
          );

          // Validate the response structure
          if (
            !parsedResponse.question ||
            !Array.isArray(parsedResponse.options) ||
            parsedResponse.options.length !== 4 ||
            typeof parsedResponse.correctAnswer !== "number" ||
            parsedResponse.correctAnswer < 0 ||
            parsedResponse.correctAnswer > 3
          ) {
            console.error(
              "Invalid question structure from Gemini:",
              parsedResponse
            );
            continue;
          }

          // Create a question object
          const question: TriviaQuestion = {
            id: `${category}-${year}-${j}`,
            category,
            question: parsedResponse.question,
            options: parsedResponse.options,
            correctAnswer: parsedResponse.correctAnswer,
            yearIndicator: year,
          };

          questions.push(question);
        } else {
          console.error("Failed to parse JSON from Gemini response:", text);
          continue;
        }
      } catch (error) {
        console.error(
          `Error generating question for ${category} in year ${year}:`,
          error
        );
        continue;
      }
    }
  }

  // If we couldn't generate enough questions, fill in with questions from random years
  if (questions.length < count) {
    const remainingCount = count - questions.length;
    for (let i = 0; i < remainingCount; i++) {
      const category = categories[i % categories.length];
      const year = Math.floor(Math.random() * (2024 - 2009)) + 2009;

      try {
        const prompt = `Generate a high-quality crypto trivia question about events, developments, or notable things that happened around the year ${year} related to the category "${category}".

Requirements:
1. The question should be multiple choice with exactly 4 options
2. Only one option should be correct
3. The question should be clear and unambiguous
4. The options should be distinct and not too similar
5. The correct answer should be factual and verifiable
6. The question should be challenging but fair for ${difficulty} difficulty level
7. Include a brief explanation of why the correct answer is right

Format your response as a valid JSON object with the following structure:
{
  "question": "The question text",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctAnswer": 0, // Index of the correct answer (0-3)
  "explanation": "Brief explanation of why this is the correct answer"
}`;

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          safetySettings,
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 1024,
          },
        });
        const response = result.response;
        const text = response.text();

        // Extract the JSON from the response
        const jsonMatch =
          text.match(/```json\n([\s\S]*?)\n```/) ||
          text.match(/```([\s\S]*?)```/) ||
          text.match(/{[\s\S]*?}/);

        if (jsonMatch) {
          const jsonText = jsonMatch[1] || jsonMatch[0];
          const parsedResponse = JSON.parse(
            jsonText.replace(/```/g, "").trim()
          );

          // Validate the response structure
          if (
            !parsedResponse.question ||
            !Array.isArray(parsedResponse.options) ||
            parsedResponse.options.length !== 4 ||
            typeof parsedResponse.correctAnswer !== "number" ||
            parsedResponse.correctAnswer < 0 ||
            parsedResponse.correctAnswer > 3
          ) {
            console.error(
              "Invalid question structure from Gemini:",
              parsedResponse
            );
            continue;
          }

          // Create a question object
          const question: TriviaQuestion = {
            id: `${category}-${year}-backup-${i}`,
            category,
            question: parsedResponse.question,
            options: parsedResponse.options,
            correctAnswer: parsedResponse.correctAnswer,
            yearIndicator: year,
          };

          questions.push(question);
        }
      } catch (error) {
        console.error(`Error generating backup question:`, error);
        continue;
      }
    }
  }

  // Shuffle the questions to mix categories
  return questions.sort(() => 0.5 - Math.random());
}
