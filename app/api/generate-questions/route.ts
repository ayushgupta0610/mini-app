import { NextRequest, NextResponse } from "next/server";
import { fetchTriviaQuestionsBatchFromGemini } from "@/app/lib/gemini-api";
import { TriviaQuestion } from "@/app/lib/trivia-data";
import { v4 as uuidv4 } from "uuid";

// Get API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string | undefined;

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
  ];

  // Shuffle and return the requested number
  return fallbackQuestions
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.min(requestedCount, fallbackQuestions.length));
}

/**
 * API route handler for generating trivia questions
 * Either uses Gemini API or falls back to static questions
 */
export async function POST(request: NextRequest) {
  try {
    const { count = 8, difficulty = "medium" } = await request.json();

    // Validate API key
    if (!GEMINI_API_KEY) {
      console.warn(
        "Gemini API key not configured, using fallback static questions"
      );
      // Generate some static questions as fallback
      const fallbackQuestions = generateFallbackQuestions(count);
      return NextResponse.json({ questions: fallbackQuestions });
    }

    // Try to generate questions using Gemini API
    try {
      const questions = await fetchTriviaQuestionsBatchFromGemini(
        GEMINI_API_KEY,
        count,
        difficulty as "easy" | "medium" | "hard"
      );

      // If we got questions, return them
      if (questions && questions.length > 0) {
        return NextResponse.json({ questions });
      } else {
        // If no questions were generated, use fallback
        console.warn("No questions generated from API, using fallback");
        const fallbackQuestions = generateFallbackQuestions(count);
        return NextResponse.json({ questions: fallbackQuestions });
      }
    } catch (apiError) {
      console.error("Error fetching questions from Gemini API:", apiError);
      // Use fallback questions if API call fails
      const fallbackQuestions = generateFallbackQuestions(count);
      return NextResponse.json({ questions: fallbackQuestions });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    const fallbackQuestions = generateFallbackQuestions(10);
    return NextResponse.json({ questions: fallbackQuestions });
  }
}
