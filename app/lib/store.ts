"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  TriviaQuestion,
  getRandomQuestions,
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

  // Actions
  initializeQuiz: (questionCount?: number) => void;
  answerQuestion: (answerIndex: number) => void;
  nextQuestion: () => void;
  resetQuiz: () => void;
  calculateResults: () => void;
  setUserData: (userData: Partial<UserData>) => void;
  logoutUser: () => void;
  castScore: () => Promise<boolean>;
  checkDailyLimit: () => boolean;
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
      initializeQuiz: (questionCount = 10) => {
        // Check if user has reached daily limit
        const hasReachedLimit = get().checkDailyLimit();

        if (hasReachedLimit) {
          set({ hasReachedDailyLimit: true });
          return;
        }

        // Update play count for today
        const { user } = get();
        const today = getTodayString();
        const dailyPlays =
          user.dailyPlays.date === today
            ? { date: today, count: user.dailyPlays.count + 1 }
            : { date: today, count: 1 };

        // Get random questions and initialize quiz
        const questions = getRandomQuestions(questionCount);
        set({
          questions,
          currentQuestionIndex: 0,
          answers: Array(questions.length).fill(null),
          score: 0,
          isComplete: false,
          entryYear: null,
          user: {
            ...user,
            dailyPlays,
          },
        });
      },

      checkDailyLimit: () => {
        const { user } = get();
        const today = getTodayString();

        // Reset count if it's a new day
        if (user.dailyPlays.date !== today) {
          return false;
        }

        // Check if user has reached the limit of 10 plays per day
        return user.dailyPlays.count >= 10;
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

      resetQuiz: () => {
        // Check if user has reached daily limit before resetting
        const hasReachedLimit = get().checkDailyLimit();

        if (hasReachedLimit) {
          set({ hasReachedDailyLimit: true });
          return;
        }

        get().initializeQuiz();
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
