"use client"

import { useEffect } from "react"
import { useTriviaStore } from "@/app/lib/store"
import { WelcomeScreen } from "./welcome-screen"
import { QuestionCard } from "./question-card"
import { ResultsCard } from "./results-card"

export const TriviaApp = () => {
  const { questions, isComplete, initializeQuiz } = useTriviaStore()
  
  // Initialize the app on first load
  useEffect(() => {
    // Only initialize if no questions are loaded
    if (questions.length === 0) {
      initializeQuiz(8)
    }
  }, [questions.length, initializeQuiz])
  
  // Show welcome screen if no questions
  if (questions.length === 0) {
    return <WelcomeScreen />
  }
  
  // Show results if quiz is complete
  if (isComplete) {
    return <ResultsCard />
  }
  
  // Otherwise show the question card
  return <QuestionCard />
}
