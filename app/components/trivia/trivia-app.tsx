"use client";

import { useEffect } from "react";
// Import the SDK from frame-sdk
import { sdk } from "@farcaster/frame-sdk";
import { useTriviaStore } from "@/app/lib/store";
import { WelcomeScreen } from "./welcome-screen";
import { QuestionCard } from "./question-card";
import { ResultsCard } from "./results-card";

export const TriviaApp = () => {
  const { questions, isComplete, initializeQuiz } = useTriviaStore();

  // Initialize the app on first load
  useEffect(() => {
    if (questions.length === 0) {
      initializeQuiz(10);
      // Questions are being initialized, not ready yet.
    } else {
      // Questions are loaded, now we are ready.
      const notifyReady = async () => {
        try {
          await sdk.actions.ready();
          console.log("Farcaster SDK ready signal sent");
        } catch (error) {
          console.error("Error sending ready signal to Farcaster:", error);
        }
      };

      notifyReady();
    }
  }, [questions.length, initializeQuiz]);

  // Call ready() once if questions are already populated on initial mount
  // (e.g. from persisted state) and not going through the initialization path above.
  useEffect(() => {
    if (questions.length > 0) {
      const notifyReady = async () => {
        try {
          await sdk.actions.ready();
          console.log("Farcaster SDK ready signal sent (initial mount)");
        } catch (error) {
          console.error("Error sending ready signal to Farcaster:", error);
        }
      };

      notifyReady();
    }
  }, []); // Run only once on mount

  // Show welcome screen if no questions
  if (questions.length === 0) {
    return <WelcomeScreen />;
  }

  // Show results if quiz is complete
  if (isComplete) {
    return <ResultsCard />;
  }

  // Otherwise show the question card
  return <QuestionCard />;
};
