"use client";

import { useEffect, useState } from "react";
// Import the SDK from frame-sdk
import { sdk } from "@farcaster/frame-sdk";
import { useTriviaStore } from "@/app/lib/store";
import { WelcomeScreen } from "./welcome-screen";
import { QuestionCard } from "./question-card";
import { ResultsCard } from "./results-card";

export const TriviaApp = () => {
  const { questions, isComplete, initializeQuiz } = useTriviaStore();
  // Add state to control whether to show welcome screen
  const [showWelcome, setShowWelcome] = useState(true);

  // Only initialize the SDK when app is ready
  useEffect(() => {
    // Only notify ready when we have questions (after welcome screen is dismissed)
    if (questions.length > 0 && !showWelcome) {
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
  }, [questions.length, isComplete, showWelcome]);

  // Call ready() once if questions are already populated on initial mount
  // and welcome screen should be skipped
  useEffect(() => {
    // If we have questions from a previous session, skip welcome screen
    if (questions.length > 0 && isComplete === false) {
      setShowWelcome(false);
      
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

  // Show welcome screen if showWelcome is true
  if (showWelcome) {
    return <WelcomeScreen onStart={() => {
      setShowWelcome(false);
      // Initialize quiz when user clicks start
      if (questions.length === 0) {
        initializeQuiz(10);
      }
    }} />;
  }

  // Show results if quiz is complete
  if (isComplete) {
    return <ResultsCard />;
  }

  // Otherwise show the question card
  return <QuestionCard />;
};
