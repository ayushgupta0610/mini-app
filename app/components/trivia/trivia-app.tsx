"use client";

import { useEffect, useState } from "react";
// Import the SDK from the latest Mini App SDK
import { sdk } from "@farcaster/frame-sdk";
import { useTriviaStore } from "@/app/lib/store";
import { WelcomeScreen } from "./welcome-screen";
import { QuestionCard } from "./question-card";
import { ResultsCard } from "./results-card";
import { usePathname } from "next/navigation";

export const TriviaApp = () => {
  const {
    questions,
    isComplete,
    // initializeQuiz,
    setUseDynamicQuestions,
    setDifficulty,
  } = useTriviaStore();
  // Add state to control whether to show welcome screen
  const [showWelcome, setShowWelcome] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const pathname = usePathname();

  // Enable dynamic questions by default
  useEffect(() => {
    setUseDynamicQuestions(true);
    setDifficulty("medium");
  }, [setUseDynamicQuestions, setDifficulty]);

  // Initialize the SDK as early as possible
  useEffect(() => {
    // Always try to initialize the SDK when component mounts
    const notifyReady = async () => {
      if (sdkInitialized) return; // Avoid multiple initializations
      
      try {
        // Use the latest Mini App SDK ready method with disableNativeGestures option
        await sdk.actions.ready({ disableNativeGestures: false });
        console.log("Farcaster Mini App SDK ready signal sent successfully");
        setSdkInitialized(true);
      } catch (error) {
        console.error("Error sending ready signal to Farcaster:", error);
        // Even if there's an error, we'll mark as initialized to avoid repeated attempts
        setSdkInitialized(true);
      }
    };

    // Try to initialize immediately
    notifyReady();
    
    // Set a backup timer to ensure SDK is initialized even if there are issues
    const backupTimer = setTimeout(() => {
      if (!sdkInitialized) {
        console.log("Backup SDK initialization triggered");
        notifyReady();
      }
    }, 2000); // 2 second backup
    
    return () => clearTimeout(backupTimer);
  }, [sdkInitialized]);

  // Handle URL cleanup if we somehow ended up with /quiz in the URL
  useEffect(() => {
    if (
      pathname.includes("/quiz") &&
      window.history &&
      window.history.replaceState
    ) {
      // Replace the current URL with the base URL without changing browser history
      const baseUrl = window.location.origin;
      window.history.replaceState({}, document.title, baseUrl);
    }
  }, [pathname]);

  // Check if we have existing questions on initial mount
  useEffect(() => {
    // If we have questions from a previous session and quiz is not complete, skip welcome screen
    if (questions.length > 0 && isComplete === false) {
      console.log("Found existing questions, skipping welcome screen");
      setShowWelcome(false);
    }
  }, []); // Run only once on mount

  // Show welcome screen if showWelcome is true
  if (showWelcome) {
    return (
      <WelcomeScreen
        onStart={() => {
          console.log("Welcome screen onStart callback triggered");
          // Update UI state to show questions
          setShowWelcome(false);
          setIsLoading(false);
          // Reset SDK initialization flag
          setSdkInitialized(false);
        }}
        isLoading={isLoading}
      />
    );
  }

  // Show results if quiz is complete
  if (isComplete) {
    return <ResultsCard />;
  }

  // Otherwise show the question card
  return <QuestionCard />;
};
