import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  fetchTriviaQuestionsBatchFromGemini,
  GeminiTriviaQuestion,
} from "@/app/lib/gemini-api";

// Get API keys from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

// Define the database schema type
type TriviaQuestionRecord = {
  id: string;
  category: GeminiTriviaQuestion["category"];
  question: string;
  options: string[];
  correct_answer: number;
  year_indicator: number;
  difficulty: string;
  created_at: string;
};

// Minimum number of questions to maintain in the database per difficulty level
const MIN_QUESTIONS_PER_DIFFICULTY = 20;

// Maximum number of questions to fetch in a batch
const MAX_BATCH_SIZE = 30;

/**
 * Generates crypto trivia questions using a caching strategy
 * 1. First checks if there are enough questions in the database
 * 2. If not, fetches new questions from Gemini API
 * 3. In the background, fetches additional questions to maintain the cache
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
        { error: "Supabase not properly configured" },
        { status: 500 }
      );
    }

    try {
      // First try to get questions from the database
      const { data: dbQuestions, error: fetchError } = await supabase
        .from("trivia_questions")
        .select("*")
        .eq("difficulty", difficulty)
        .order("created_at", { ascending: false })
        .limit(count);

      if (fetchError) {
        console.error("Error fetching questions from Supabase:", fetchError);
        throw fetchError;
      }

      // If we have enough questions in the database, use them
      if (dbQuestions && dbQuestions.length >= count) {
        console.log(
          `Using ${dbQuestions.length} cached questions from database`
        );

        // Convert database records to the expected format
        const questions: GeminiTriviaQuestion[] = dbQuestions.map(
          (q: TriviaQuestionRecord) => ({
            id: q.id,
            category: q.category,
            question: q.question,
            options: q.options,
            correctAnswer: q.correct_answer,
            yearIndicator: q.year_indicator,
          })
        );

        // Shuffle the questions
        const shuffledQuestions = questions.sort(() => 0.5 - Math.random());

        // Check if we need to replenish the cache in the background
        checkAndReplenishCache(difficulty).catch((err) => {
          console.error("Background cache replenishment failed:", err);
        });

        return NextResponse.json(shuffledQuestions.slice(0, count));
      }

      // If not enough questions in database, fetch from Gemini API
      console.log(
        `Not enough cached questions (${
          dbQuestions?.length || 0
        }/${count}), fetching from Gemini API`
      );
      const questions = await fetchTriviaQuestionsBatchFromGemini(
        GEMINI_API_KEY,
        count,
        difficulty
      );

      // Convert to database format and save to Supabase
      const questionsToSave = questions.map((q) => ({
        category: q.category,
        question: q.question,
        options: q.options,
        correct_answer: q.correctAnswer,
        year_indicator: q.yearIndicator,
        difficulty: difficulty,
      }));

      const { error } = await supabase
        .from("trivia_questions")
        .insert(questionsToSave);

      if (error) {
        console.error("Error saving questions to Supabase:", error);
        // Continue even if save fails, as we still want to return the questions
      }

      return NextResponse.json(questions);
    } catch (error) {
      console.error("Error generating questions:", error);
      return NextResponse.json(
        { error: "Failed to generate questions" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}

/**
 * Checks if we need to replenish the cache and does so in the background
 * This ensures we always have enough questions for future requests
 */
async function checkAndReplenishCache(
  difficulty: "easy" | "medium" | "hard" = "medium"
): Promise<void> {
  if (!supabase || !GEMINI_API_KEY) return;

  try {
    // Check how many questions we have in the database for this difficulty
    const { count, error } = await supabase
      .from("trivia_questions")
      .select("*", { count: "exact", head: true })
      .eq("difficulty", difficulty);

    if (error) {
      console.error("Error checking question count:", error);
      return;
    }

    // If we have enough questions, no need to replenish
    if (count && count >= MIN_QUESTIONS_PER_DIFFICULTY) {
      console.log(
        `Cache has enough questions (${count}/${MIN_QUESTIONS_PER_DIFFICULTY}) for ${difficulty} difficulty`
      );
      return;
    }

    // Calculate how many more questions we need
    const neededQuestions = MIN_QUESTIONS_PER_DIFFICULTY - (count || 0);
    console.log(
      `Replenishing cache with ${neededQuestions} new ${difficulty} questions in the background`
    );

    // Fetch new questions in batches to avoid rate limiting
    const batchSize = Math.min(neededQuestions, MAX_BATCH_SIZE);
    const newQuestions = await fetchTriviaQuestionsBatchFromGemini(
      GEMINI_API_KEY,
      batchSize,
      difficulty
    );

    // Save the new questions to the database
    if (newQuestions.length > 0) {
      const questionsToSave = newQuestions.map((q) => ({
        category: q.category,
        question: q.question,
        options: q.options,
        correct_answer: q.correctAnswer,
        year_indicator: q.yearIndicator,
        difficulty: difficulty,
      }));

      const { error: insertError } = await supabase
        .from("trivia_questions")
        .insert(questionsToSave);

      if (insertError) {
        console.error("Error saving new questions to cache:", insertError);
        return;
      }

      console.log(
        `Successfully added ${newQuestions.length} new questions to the cache`
      );
    }
  } catch (error) {
    console.error("Error in background cache replenishment:", error);
  }
}
//         year_indicator: q.yearIndicator,
//         difficulty: difficulty,
//       }));

//       const { error: insertError } = await supabase
//         .from("trivia_questions")
//         .insert(questionsToSave);

//       if (insertError) {
//         console.error("Error saving new questions:", insertError);
//       }
//     }

//     // Combine existing and new questions
//     return [
//       ...(dbQuestions || []),
//       ...newQuestions.map((q) => ({
//         ...q,
//         correct_answer: q.correctAnswer,
//         year_indicator: q.yearIndicator,
//       })),
//     ].slice(0, count) as TriviaQuestion[];
//   } catch (error) {
//     console.error("Error in fetchTriviaQuestionsFromDatabase:", error);
//     // If there's an error with the database, fall back to generating questions
//     if (!GEMINI_API_KEY) {
//       throw new Error("Gemini API key not configured");
//     }
//     const questions = await fetchTriviaQuestionsFromGemini(
//       GEMINI_API_KEY,
//       count,
//       difficulty
//     );
//     return questions.map((q) => ({
//       ...q,
//       correct_answer: q.correctAnswer,
//       year_indicator: q.yearIndicator,
//     })) as TriviaQuestion[];
//   }
// }

// /**
//  * Fetches crypto trivia questions from Gemini API based on difficulty
//  * Each question will be from a specific year, with years decreasing as difficulty increases
//  */
// async function fetchTriviaQuestionsFromGemini(
//   apiKey: string,
//   count: number = 10,
//   difficulty: "easy" | "medium" | "hard" = "medium"
// ): Promise<TriviaQuestion[]> {
//   if (!apiKey) {
//     throw new Error("Gemini API key is required");
//   }

//   // Initialize the Gemini API client with the latest package
//   const genAI = new GoogleGenerativeAI(apiKey);
//   const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

//   // Calculate the starting year based on difficulty
//   const startYear = 2024;
//   const yearDecrement =
//     difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;

//   // Prepare the questions array
//   const questions: TriviaQuestion[] = [];

//   // Define the categories we want questions for
//   const categories: Array<TriviaQuestion["category"]> = [
//     "development",
//     "memes-nfts-tokens",
//     "scams-incidents",
//     "crypto-characters",
//   ];

//   // Calculate how many questions we need per category
//   const questionsPerCategory = Math.floor(count / categories.length);
//   const remainder = count % categories.length;

//   for (let i = 0; i < categories.length; i++) {
//     const category = categories[i];
//     const categoryCount =
//       i < remainder ? questionsPerCategory + 1 : questionsPerCategory;

//     for (let j = 0; j < categoryCount; j++) {
//       const year = startYear - j * yearDecrement;

//       try {
//         const prompt = `Generate a high-quality crypto trivia question about events, developments, or notable things that happened around the year ${year} related to the category "${category}".

// Requirements:
// 1. The question should be multiple choice with exactly 4 options
// 2. Only one option should be correct
// 3. The question should be clear and unambiguous
// 4. The options should be distinct and not too similar
// 5. The correct answer should be factual and verifiable
// 6. The question should be challenging but fair for ${difficulty} difficulty level
// 7. Include a brief explanation of why the correct answer is right

// Format your response as a valid JSON object with the following structure:
// {
//   "question": "The question text",
//   "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
//   "correctAnswer": 0, // Index of the correct answer (0-3)
//   "explanation": "Brief explanation of why this is the correct answer"
// }`;

//         const result = await model.generateContent({
//           contents: [{ role: "user", parts: [{ text: prompt }] }],
//           generationConfig: {
//             temperature: 0.7,
//             topP: 0.8,
//             topK: 40,
//             maxOutputTokens: 1024,
//           },
//         });
//         const response = result.response;
//         const text = response.text();

//         // Extract the JSON from the response
//         const jsonMatch =
//           text.match(/```json\n([\s\S]*?)\n```/) ||
//           text.match(/```([\s\S]*?)```/) ||
//           text.match(/{[\s\S]*?}/);

//         if (jsonMatch) {
//           const jsonText = jsonMatch[1] || jsonMatch[0];
//           const parsedResponse = JSON.parse(
//             jsonText.replace(/```/g, "").trim()
//           );

//           // Validate the response structure
//           if (
//             !parsedResponse.question ||
//             !Array.isArray(parsedResponse.options) ||
//             parsedResponse.options.length !== 4 ||
//             typeof parsedResponse.correctAnswer !== "number" ||
//             parsedResponse.correctAnswer < 0 ||
//             parsedResponse.correctAnswer > 3
//           ) {
//             console.error(
//               "Invalid question structure from Gemini:",
//               parsedResponse
//             );
//             continue;
//           }

//           // Create a question object
//           const question: TriviaQuestion = {
//             id: `${category}-${year}-${j}`,
//             category,
//             question: parsedResponse.question,
//             options: parsedResponse.options,
//             correctAnswer: parsedResponse.correctAnswer,
//             yearIndicator: year,
//           };

//           questions.push(question);
//         } else {
//           console.error("Failed to parse JSON from Gemini response:", text);
//           continue;
//         }
//       } catch (error) {
//         console.error(
//           `Error generating question for ${category} in year ${year}:`,
//           error
//         );
//         continue;
//       }
//     }
//   }

//   // If we couldn't generate enough questions, fill in with questions from random years
//   if (questions.length < count) {
//     const remainingCount = count - questions.length;
//     for (let i = 0; i < remainingCount; i++) {
//       const category = categories[i % categories.length];
//       const year = Math.floor(Math.random() * (2024 - 2009)) + 2009;

//       try {
//         const prompt = `Generate a high-quality crypto trivia question about events, developments, or notable things that happened around the year ${year} related to the category "${category}".

// Requirements:
// 1. The question should be multiple choice with exactly 4 options
// 2. Only one option should be correct
// 3. The question should be clear and unambiguous
// 4. The options should be distinct and not too similar
// 5. The correct answer should be factual and verifiable
// 6. The question should be challenging but fair for ${difficulty} difficulty level
// 7. Include a brief explanation of why the correct answer is right

// Format your response as a valid JSON object with the following structure:
// {
//   "question": "The question text",
//   "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
//   "correctAnswer": 0, // Index of the correct answer (0-3)
//   "explanation": "Brief explanation of why this is the correct answer"
// }`;

//         const result = await model.generateContent({
//           contents: [{ role: "user", parts: [{ text: prompt }] }],
//           generationConfig: {
//             temperature: 0.7,
//             topP: 0.8,
//             topK: 40,
//             maxOutputTokens: 1024,
//           },
//         });
//         const response = result.response;
//         const text = response.text();

//         // Extract the JSON from the response
//         const jsonMatch =
//           text.match(/```json\n([\s\S]*?)\n```/) ||
//           text.match(/```([\s\S]*?)```/) ||
//           text.match(/{[\s\S]*?}/);

//         if (jsonMatch) {
//           const jsonText = jsonMatch[1] || jsonMatch[0];
//           const parsedResponse = JSON.parse(
//             jsonText.replace(/```/g, "").trim()
//           );

//           // Validate the response structure
//           if (
//             !parsedResponse.question ||
//             !Array.isArray(parsedResponse.options) ||
//             parsedResponse.options.length !== 4 ||
//             typeof parsedResponse.correctAnswer !== "number" ||
//             parsedResponse.correctAnswer < 0 ||
//             parsedResponse.correctAnswer > 3
//           ) {
//             console.error(
//               "Invalid question structure from Gemini:",
//               parsedResponse
//             );
//             continue;
//           }

//           // Create a question object
//           const question: TriviaQuestion = {
//             id: `${category}-${year}-backup-${i}`,
//             category,
//             question: parsedResponse.question,
//             options: parsedResponse.options,
//             correctAnswer: parsedResponse.correctAnswer,
//             yearIndicator: year,
//           };

//           questions.push(question);
//         }
//       } catch (error) {
//         console.error(`Error generating backup question:`, error);
//         continue;
//       }
//     }
//   }

//   // Shuffle the questions to mix categories
//   return questions.sort(() => 0.5 - Math.random());
// }
