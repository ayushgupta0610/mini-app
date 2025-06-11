import { NextRequest, NextResponse } from "next/server";
import { fetchTriviaQuestionsBatchFromGemini } from "@/app/lib/gemini-api";
import { TriviaQuestion } from "@/app/lib/trivia-data";
import {
  fetchTriviaQuestionsFromSupabase,
  createSupabaseClient,
} from "@/app/lib/supabase-client";
import { v4 as uuidv4 } from "uuid";

// Get API keys and configuration from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string | undefined;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Generate fallback questions when API fails
 */
function generateFallbackQuestions(requestedCount: number): TriviaQuestion[] {
  // Create some basic fallback questions
  const fallbackQuestions: TriviaQuestion[] = [
    {
      id: `fallback-${uuidv4().slice(0, 8)}`,
      category: "development",
      question:
        "Which consensus mechanism does Ethereum use after 'The Merge'?",
      options: [
        "Proof of Work",
        "Proof of Stake",
        "Proof of Authority",
        "Proof of Space",
      ],
      correctAnswer: 1,
      yearIndicator: 2022,
    },
    {
      id: `fallback-${uuidv4().slice(0, 8)}`,
      category: "memes-nfts-tokens",
      question: "What does 'WAGMI' stand for in crypto culture?",
      options: [
        "We Are Getting Money Instantly",
        "We're All Gonna Make It",
        "When Art Generates Massive Income",
        "Wealth And Growth Metrics Index",
      ],
      correctAnswer: 1,
      yearIndicator: 2021,
    },
    {
      id: `fallback-${uuidv4().slice(0, 8)}`,
      category: "scams-incidents",
      question: "What is a 'rug pull' in crypto?",
      options: [
        "A hardware wallet malfunction",
        "Developers abandoning a project after taking investors' money",
        "A type of mining attack",
        "A market manipulation technique",
      ],
      correctAnswer: 1,
      yearIndicator: 2020,
    },
    {
      id: `fallback-${uuidv4().slice(0, 8)}`,
      category: "crypto-characters",
      question:
        "Which exchange filed for bankruptcy in 2022 after misusing customer funds?",
      options: ["Binance", "Coinbase", "FTX", "Kraken"],
      correctAnswer: 2,
      yearIndicator: 2022,
    },
    {
      id: `fallback-${uuidv4().slice(0, 8)}`,
      category: "development",
      question:
        "What programming language is primarily used for Ethereum smart contracts?",
      options: ["JavaScript", "Python", "Solidity", "Rust"],
      correctAnswer: 2,
      yearIndicator: 2017,
    },
    {
      id: `fallback-${uuidv4().slice(0, 8)}`,
      category: "memes-nfts-tokens",
      question:
        "Which NFT collection features pixelated characters and became one of the first major NFT phenomena?",
      options: ["Bored Ape Yacht Club", "CryptoPunks", "Azuki", "Doodles"],
      correctAnswer: 1,
      yearIndicator: 2017,
    },
    {
      id: `fallback-${uuidv4().slice(0, 8)}`,
      category: "scams-incidents",
      question: "What was BitConnect primarily known for?",
      options: [
        "Being the first DEX",
        "A legitimate lending platform",
        "A Ponzi scheme",
        "A hardware wallet",
      ],
      correctAnswer: 2,
      yearIndicator: 2018,
    },
    {
      id: `fallback-${uuidv4().slice(0, 8)}`,
      category: "crypto-characters",
      question: "Who is known as 'Satoshi Nakamoto'?",
      options: [
        "The founder of Ethereum",
        "The pseudonymous creator of Bitcoin",
        "The CEO of Binance",
        "The inventor of the first hardware wallet",
      ],
      correctAnswer: 1,
      yearIndicator: 2009,
    },
    {
      id: `fallback-${uuidv4().slice(0, 8)}`,
      category: "development",
      question: "What is ERC-721?",
      options: [
        "A fungible token standard",
        "A non-fungible token standard",
        "A governance standard",
        "A staking standard",
      ],
      correctAnswer: 1,
      yearIndicator: 2018,
    },
    {
      id: `fallback-${uuidv4().slice(0, 8)}`,
      category: "memes-nfts-tokens",
      question:
        "Which meme coin was initially created as a joke but gained significant value?",
      options: ["Bitcoin", "Ethereum", "Dogecoin", "USD Coin"],
      correctAnswer: 2,
      yearIndicator: 2013,
    },
  ];

  // Shuffle and return the requested number
  return fallbackQuestions
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.min(requestedCount, fallbackQuestions.length));
}

/**
 * API route handler for generating trivia questions
 * Priority order:
 * 1. LLM (Gemini API)
 * 2. Supabase database
 * 3. Hardcoded fallback questions
 */
export async function POST(request: NextRequest) {
  try {
    const { count = 10, difficulty = "medium" } = await request.json();
    const typedDifficulty = difficulty as "easy" | "medium" | "hard";

    // First priority: Use LLM (Gemini API) if available
    if (GEMINI_API_KEY) {
      try {
        console.log("Attempting to generate questions using LLM (Gemini API)");
        const result = await fetchTriviaQuestionsBatchFromGemini(
          GEMINI_API_KEY,
          count,
          typedDifficulty
        );

        // If we got questions from LLM, save generation time to Supabase and return them
        if (result.questions && result.questions.length > 0) {
          console.log(
            `Successfully generated ${result.questions.length} questions from LLM in ${result.generationTimeMs}ms`
          );

          // Save the generation time to Supabase if available
          if (SUPABASE_URL && SUPABASE_ANON_KEY) {
            try {
              const supabase = createSupabaseClient();

              // Save metrics
              await supabase.from("llm_metrics").insert({
                operation: "generate_questions",
                time_ms: result.generationTimeMs,
                question_count: result.questions.length,
                difficulty: typedDifficulty,
                success: true,
              });
              console.log(
                `Saved LLM metrics to Supabase: ${result.generationTimeMs}ms for ${result.questions.length} questions`
              );

              // Save the generated questions to the trivia_questions table
              const questionsToSave = result.questions.map((q) => ({
                id: uuidv4(), // Generate proper UUID for Supabase
                category: q.category,
                question: q.question,
                options: q.options,
                correct_answer: q.correctAnswer,
                year_indicator: q.yearIndicator,
                difficulty: typedDifficulty,
                created_at: new Date().toISOString(),
              }));

              const { error } = await supabase
                .from("trivia_questions")
                .insert(questionsToSave);

              if (error) {
                console.error("Error saving questions to Supabase:", error);
              } else {
                console.log(
                  `Successfully saved ${questionsToSave.length} questions to Supabase trivia_questions table`
                );
              }
            } catch (metricsError) {
              console.error("Error saving data to Supabase:", metricsError);
              // Continue even if saving fails
            }
          }

          return NextResponse.json({
            questions: result.questions,
            source: "llm",
            metrics: {
              generationTimeMs: result.generationTimeMs,
            },
          });
        } else {
          console.warn(
            "LLM returned empty questions array, trying Supabase fallback"
          );
        }
      } catch (llmError) {
        console.error(
          "Error fetching questions from LLM (Gemini API):",
          llmError
        );
        // Continue to next fallback
      }
    } else {
      console.warn("Gemini API key not configured, skipping LLM generation");
    }

    // Second priority: Use Supabase database if available
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      try {
        console.log("Attempting to fetch questions from Supabase database");
        const questions = await fetchTriviaQuestionsFromSupabase(
          count,
          typedDifficulty
        );

        if (questions && questions.length > 0) {
          console.log(
            `Successfully fetched ${questions.length} questions from Supabase`
          );
          return NextResponse.json({
            questions,
            source: "supabase",
            metrics: {
              fromDatabase: true,
            },
          });
        } else {
          console.warn(
            "Supabase returned empty questions array, using hardcoded fallback"
          );
        }
      } catch (supabaseError) {
        console.error("Error fetching questions from Supabase:", supabaseError);
        // Continue to final fallback
      }
    } else {
      console.warn(
        "Supabase configuration not available, skipping database fetch"
      );
    }

    // Final fallback: Use hardcoded questions
    console.warn("Using hardcoded fallback questions as last resort");
    const fallbackQuestions = generateFallbackQuestions(count);
    return NextResponse.json({
      questions: fallbackQuestions,
      source: "hardcoded",
      metrics: {
        fallback: true,
      },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    const fallbackQuestions = generateFallbackQuestions(10);
    return NextResponse.json({
      questions: fallbackQuestions,
      source: "hardcoded",
      metrics: {
        fallback: true,
        error: true,
      },
    });
  }
}
