"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  TriviaQuestion,
  getRandomQuestions,
  getRandomStaticQuestions,
  calculateCryptoEntryYear,
} from "./trivia-data";

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
  castScore: () => Promise<boolean>;
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
      useDynamicQuestions: false,
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

          // Fallback to static questions in case of error
          const { user } = get();
          const today = getTodayString();
          const dailyPlays =
            user.dailyPlays.date === today
              ? { date: today, count: user.dailyPlays.count + 1 }
              : { date: today, count: 1 };

          const staticFallbackQuestions = getRandomStaticQuestions(questionCount);

          // In a fallback scenario, we typically reset progress.
          // The user object (including dailyPlays) is from the get() call just before this block.
          set({
            questions: staticFallbackQuestions,
            currentQuestionIndex: 0,
            answers: Array(staticFallbackQuestions.length).fill(null),
            score: 0,
            isComplete: false,
            entryYear: null,
            isLoading: false,
            user: {
              ...user, // user from the closure, contains dailyPlays updated earlier in this function
              dailyPlays,
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

      castScore: async () => {
        const { score, questions, entryYear, user } = get();

        if (!user.fid) {
          console.error("User not authenticated");
          return false;
        }

        try {
          // Prepare the data to be cast
          const castData = {
            score,
            totalQuestions: questions.length,
            entryYear,
            fid: user.fid,
            username: user.username,
          };

          // Call the API endpoint to cast the score
          const response = await fetch("/api/cast-score", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(castData),
          });

          if (!response.ok) {
            throw new Error("Failed to cast score");
          }

          return true;
        } catch (error) {
          console.error("Error casting score:", error);
          return false;
        }
      },

      // Other actions

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
