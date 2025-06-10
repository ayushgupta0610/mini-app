"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  TriviaQuestion,
  getRandomQuestions,
  calculateCryptoEntryYear,
} from "./trivia-data";

// Helper function to determine crypto persona based on score percentage
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getCryptoPersona = (score: number, totalQuestions: number) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  if (percentage >= 90)
    return {
      title: "Satoshi Tier",
      description:
        "You might be Satoshi himself! Your crypto knowledge is legendary.",
      emoji: "🧠",
      badge: "satoshi",
      color: "from-yellow-400 to-amber-600",
      rank: "1",
    };
  if (percentage >= 80)
    return {
      title: "Crypto OG",
      description:
        "You've been around since the Bitcoin whitepaper and survived multiple cycles.",
      emoji: "🦖",
      badge: "og",
      color: "from-purple-600 to-blue-600",
      rank: "2",
    };
  if (percentage >= 70)
    return {
      title: "Early Adopter",
      description: "You got in before the masses and have diamond hands.",
      emoji: "💎",
      badge: "early",
      color: "from-blue-500 to-teal-500",
      rank: "3",
    };
  if (percentage >= 60)
    return {
      title: "DeFi Wizard",
      description: "You know your way around protocols and yield farming.",
      emoji: "🧙",
      badge: "defi",
      color: "from-teal-400 to-emerald-500",
      rank: "4",
    };
  if (percentage >= 50)
    return {
      title: "NFT Collector",
      description: "You have an eye for digital art and community.",
      emoji: "🖼️",
      badge: "nft",
      color: "from-emerald-500 to-lime-500",
      rank: "5",
    };
  if (percentage >= 40)
    return {
      title: "Degen Trader",
      description: "High risk, high reward - you live for the volatility.",
      emoji: "🎰",
      badge: "degen",
      color: "from-orange-500 to-amber-500",
      rank: "6",
    };
  if (percentage >= 30)
    return {
      title: "Meme Coin Enthusiast",
      description: "You're in it for the memes and the community.",
      emoji: "🐕",
      badge: "meme",
      color: "from-rose-400 to-pink-500",
      rank: "7",
    };
  return {
    title: "Crypto Curious",
    description: "You're just getting started on your crypto journey.",
    emoji: "🔍",
    badge: "curious",
    color: "from-sky-400 to-blue-500",
    rank: "8",
  };
};

// Define a type for tracking daily plays
interface PlayRecord {
  date: string;
  count: number;
}

// Define a type for user data
interface UserData {
  fid: string | null;
  username: string | null;
  displayName: string | null;
  pfp: string | null;
  dailyPlays: PlayRecord;
}

// Define the persisted state structure
interface PersistedState {
  user: UserData;
  isAuthenticated: boolean;
}

// Define the main state structure
interface TriviaState extends PersistedState {
  // Quiz state
  questions: TriviaQuestion[];
  currentQuestionIndex: number;
  answers: (number | null)[];
  score: number;
  isComplete: boolean;
  entryYear: number | null;
  hasReachedDailyLimit: boolean;
  isLoading: boolean;
  useDynamicQuestions: boolean;
  difficulty: "easy" | "medium" | "hard";

  // Actions
  initializeQuiz: (
    questionCount?: number,
    options?: {
      useDynamicQuestions?: boolean;
      difficulty?: "easy" | "medium" | "hard";
    }
  ) => Promise<void>;
  answerQuestion: (answerIndex: number) => void;
  nextQuestion: () => void;
  resetQuiz: () => Promise<void>;
  calculateResults: () => void;
  setUserData: (userData: Partial<UserData>) => void;
  logoutUser: () => void;
  castScore: (customMessage?: string) => Promise<boolean>;
  checkDailyLimit: () => boolean;
  setUseDynamicQuestions: (useDynamic: boolean) => void;
  setDifficulty: (difficulty: "easy" | "medium" | "hard") => void;
}

// Get today's date in YYYY-MM-DD format for tracking daily plays
const getTodayString = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

// Create the store with persistence
export const useTriviaStore = create<TriviaState>()(
  persist(
    (set, get) => ({
      // Initial state
      questions: [],
      currentQuestionIndex: 0,
      answers: [],
      score: 0,
      isComplete: false,
      entryYear: null,
      isLoading: false,
      useDynamicQuestions: true,
      difficulty: "medium",

      // User state
      user: {
        fid: null,
        username: null,
        displayName: null,
        pfp: null,
        dailyPlays: {
          date: getTodayString(),
          count: 0,
        },
      },
      isAuthenticated: false,
      hasReachedDailyLimit: false,

      // Actions
      setUseDynamicQuestions: (useDynamic: boolean) => {
        set({ useDynamicQuestions: useDynamic });
      },

      setDifficulty: (difficulty: "easy" | "medium" | "hard") => {
        set({ difficulty });
      },

      initializeQuiz: async (questionCount = 10, options) => {
        // Check if user has reached daily limit
        const hasReachedLimit = get().checkDailyLimit();

        if (hasReachedLimit) {
          set({ hasReachedDailyLimit: true });
          return;
        }

        // Set loading state
        set({ isLoading: true });

        try {
          // Update play count for today
          const { user, useDynamicQuestions, difficulty } = get();
          const today = getTodayString();
          const dailyPlays =
            user.dailyPlays.date === today
              ? { date: today, count: user.dailyPlays.count + 1 }
              : { date: today, count: 1 };

          // Determine if we should use dynamic questions
          const useDynamic =
            options?.useDynamicQuestions ?? useDynamicQuestions;
          const selectedDifficulty = options?.difficulty ?? difficulty;

          // Get questions - either dynamic from API or static
          const newQuestions = await getRandomQuestions(questionCount, {
            useDynamicQuestions: useDynamic,
            difficulty: selectedDifficulty,
          });

          const oldState = get();
          let newCurrentQuestionIndex = 0;
          let newScore = 0;

          if (
            oldState.questions.length > 0 && // Quiz was previously initialized
            oldState.currentQuestionIndex > 0 && // User had moved past the first question
            newQuestions.length > 0 && // New questions are available
            oldState.questions[0]?.id !== newQuestions[0]?.id // And the questions are actually different
          ) {
            // This is an update to the question set while quiz was in progress
            // and user was not on the first question.
            // Preserve current position and score.
            newCurrentQuestionIndex = oldState.currentQuestionIndex;
            newScore = oldState.score;
          }

          set({
            questions: newQuestions,
            currentQuestionIndex: newCurrentQuestionIndex,
            answers: Array(newQuestions.length).fill(null), // Reset answers for the new question set
            score: newScore,
            isComplete: false,
            entryYear: null,
            isLoading: false,
            user: {
              ...user, // user from the closure, contains dailyPlays updated earlier in this function
              dailyPlays,
            },
          });
        } catch (error) {
          console.error("Error initializing quiz:", error);

          // Error fetching questions. A play was attempted, so update dailyPlays.
          // The user object for dailyPlays calculation should be the one from the try block's scope if available,
          // or fetched again if not. Here, 'user' from the try block is not in scope, so we fetch.
          const { user: currentUserForErrorHandling } = get();
          const todayOnError = getTodayString();
          const dailyPlaysOnError =
            currentUserForErrorHandling.dailyPlays.date === todayOnError
              ? { date: todayOnError, count: currentUserForErrorHandling.dailyPlays.count + 1 }
              : { date: todayOnError, count: 1 };

          // Set questions to empty array to indicate failure to load
          set({
            questions: [],
            currentQuestionIndex: 0,
            answers: [],
            score: 0,
            isComplete: false, // Or true, depending on desired UX for failed load
            entryYear: null,
            isLoading: false,
            user: {
              ...currentUserForErrorHandling,
              dailyPlays: dailyPlaysOnError, // Ensure daily play is counted even on error
            },
          });
        }
      },

      checkDailyLimit: () => {
        const { user } = get();
        const today = getTodayString();

        // Reset count if it's a new day
        if (user.dailyPlays.date !== today) {
          return false;
        }

        // Check if user has reached the limit of 3 plays per day
        return user.dailyPlays.count >= 3;
      },

      setUserData: (userData: Partial<UserData>) => {
        const { user } = get();
        set({
          user: { ...user, ...userData },
          isAuthenticated: Boolean(userData.fid),
        });
      },

      logoutUser: () => {
        set({
          user: {
            fid: null,
            username: null,
            displayName: null,
            pfp: null,
            dailyPlays: {
              date: getTodayString(),
              count: 0,
            },
          },
          isAuthenticated: false,
        });
      },

      castScore: async (customMessage?: string): Promise<boolean> => {
        const { score, questions, entryYear, user } = get();

        if (!user.fid) {
          console.error("User not authenticated for casting score.");
          return false;
        }

        try {
          // Prepare the data to be sent to the backend to generate frame metadata
          const castData = {
            score,
            totalQuestions: questions.length,
            entryYear,
            fid: user.fid,
            username: user.username,
            displayName: user.displayName, // Add displayName
            pfpUrl: user.pfp,          // Add pfpUrl (assuming user.pfp holds the URL)
          };

          // Call the API endpoint to get Frame metadata
          const response = await fetch("/api/cast-score", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(castData),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({})); // Try to parse error response
            console.error('Failed to get frame data from API:', response.status, errorData);
            throw new Error(`Failed to get frame data: ${errorData.error || response.statusText}`);
          }

          const frameApiResponse = await response.json();

          if (!frameApiResponse.success || !frameApiResponse.frame || !frameApiResponse.castText) {
            console.error('Invalid frame data received from API:', frameApiResponse);
            throw new Error('Invalid frame data received from API');
          }

          // At this point, frameApiResponse.frame contains the frame metadata (image, buttons, etc.)
          // and frameApiResponse.castText contains the suggested text for the cast.

          // The actual casting mechanism depends on the Farcaster client environment.
          // Below is a placeholder. You'll need to replace this with the specific API
          // provided by the Farcaster client (e.g., Warpcast, Supercast) or SDK (e.g., Neynar).
          // Common patterns involve window.neynar.frame.send(), window.farcaster.sendFrameCast(), etc.

          // Ensure this code runs only in the browser
          if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((window as any).farcasterClient?.sendFrameCast) {
              // Example: Using a hypothetical farcasterClient that might be injected by the Mini App host
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await (window as any).farcasterClient.sendFrameCast({
                text: customMessage || frameApiResponse.castText, // Text accompanying the frame
                embeds: [{ url: frameApiResponse.frame.image }], // The frame itself is an embed
              });
              console.log('Frame cast initiated via farcasterClient.sendFrameCast');
              return true;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } else if ((window as any).parentIFrame?.sendMessage) {
              // Example: Communicating with a parent iframe (common in some embedded scenarios)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (window as any).parentIFrame.sendMessage({
                type: 'castFrame',
                data: {
                  castText: customMessage || frameApiResponse.castText,
                  frame: frameApiResponse.frame,
                },
              });
              console.log('Frame cast message sent to parent iframe.');
              return true;
            } else {
              // Fallback: Log the data and instruct user if no direct casting method is found.
              console.warn('No direct Farcaster client casting method found. Frame data:', frameApiResponse);
              alert(`Frame ready! Text: "${customMessage || frameApiResponse.castText}" Image: ${frameApiResponse.frame.image}. Please cast this manually if your client supports it.`);
              return true; 
            }
          } else {
            // Running in a non-browser environment (e.g., server-side during SSR/build)
            console.warn('castScore called in non-browser environment. Skipping client-side cast.');
            return false;
          }

        } catch (error) {
          console.error("Error casting score:", error);
          return false;
        }
      },

      answerQuestion: (answerIndex: number) => {
        const { currentQuestionIndex, answers, questions } = get();

        // Create a new answers array with the current answer updated
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = answerIndex;

        // Check if answer is correct and update score
        const isCorrect =
          answerIndex === questions[currentQuestionIndex].correctAnswer;

        set({
          answers: newAnswers,
          score: isCorrect ? get().score + 1 : get().score,
        });
      },

      nextQuestion: () => {
        const { currentQuestionIndex, questions } = get();
        const nextIndex = currentQuestionIndex + 1;

        if (nextIndex >= questions.length) {
          // If we've reached the end, calculate results
          get().calculateResults();
        } else {
          // Otherwise, move to the next question
          set({ currentQuestionIndex: nextIndex });
        }
      },

      resetQuiz: async () => {
        // Check if user has reached daily limit before resetting
        const hasReachedLimit = get().checkDailyLimit();

        if (hasReachedLimit) {
          set({ hasReachedDailyLimit: true });
          return;
        }

        await get().initializeQuiz();
      },

      calculateResults: () => {
        const { score, questions } = get();
        const entryYear = calculateCryptoEntryYear(score, questions.length);

        set({
          isComplete: true,
          entryYear,
        });
      },
    }),
    {
      name: "trivia-storage",
      // Only persist user data and authentication state
      partialize: (state) =>
        ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        } as PersistedState),
    }
  )
);
