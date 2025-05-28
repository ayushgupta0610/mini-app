"use client"

import { create } from "zustand"
import { TriviaQuestion, getRandomQuestions, calculateCryptoEntryYear } from "./trivia-data"

interface TriviaState {
  // Quiz state
  questions: TriviaQuestion[]
  currentQuestionIndex: number
  answers: (number | null)[]
  score: number
  isComplete: boolean
  entryYear: number | null
  
  // Actions
  initializeQuiz: (questionCount?: number) => void
  answerQuestion: (answerIndex: number) => void
  nextQuestion: () => void
  resetQuiz: () => void
  calculateResults: () => void
}

export const useTriviaStore = create<TriviaState>((set, get) => ({
  // Initial state
  questions: [],
  currentQuestionIndex: 0,
  answers: [],
  score: 0,
  isComplete: false,
  entryYear: null,
  
  // Actions
  initializeQuiz: (questionCount = 8) => {
    const questions = getRandomQuestions(questionCount)
    set({
      questions,
      currentQuestionIndex: 0,
      answers: Array(questions.length).fill(null),
      score: 0,
      isComplete: false,
      entryYear: null
    })
  },
  
  answerQuestion: (answerIndex: number) => {
    const { currentQuestionIndex, answers, questions } = get()
    
    // Create a new answers array with the current answer updated
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = answerIndex
    
    // Check if answer is correct and update score
    const isCorrect = answerIndex === questions[currentQuestionIndex].correctAnswer
    
    set({
      answers: newAnswers,
      score: isCorrect ? get().score + 1 : get().score
    })
  },
  
  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get()
    const nextIndex = currentQuestionIndex + 1
    
    if (nextIndex >= questions.length) {
      // If we've reached the end, calculate results
      get().calculateResults()
    } else {
      // Otherwise, move to the next question
      set({ currentQuestionIndex: nextIndex })
    }
  },
  
  resetQuiz: () => {
    get().initializeQuiz()
  },
  
  calculateResults: () => {
    const { score, questions } = get()
    const entryYear = calculateCryptoEntryYear(score, questions.length)
    
    set({
      isComplete: true,
      entryYear
    })
  }
}))
