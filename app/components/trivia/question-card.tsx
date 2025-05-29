"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useTriviaStore } from "@/app/lib/store"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Progress } from "@/app/components/ui/progress"

export const QuestionCard = () => {
  const { 
    questions, 
    currentQuestionIndex, 
    // We're not directly using answers in this component
    answerQuestion, 
    nextQuestion 
  } = useTriviaStore()
  
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  
  // Get current question
  const currentQuestion = questions[currentQuestionIndex]
  
  // Calculate progress percentage
  const progressPercentage = ((currentQuestionIndex) / questions.length) * 100
  
  // Reset state when question changes
  useEffect(() => {
    setSelectedOption(null)
    setIsAnswered(false)
    setShowFeedback(false)
  }, [currentQuestionIndex])
  
  // Handle option selection
  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswered) return
    
    setSelectedOption(optionIndex)
    setIsAnswered(true)
    answerQuestion(optionIndex)
    setShowFeedback(true)
  }
  
  // Handle next question
  const handleNextQuestion = () => {
    nextQuestion()
  }
  
  // If no questions are loaded yet
  if (!currentQuestion) {
    return null
  }
  
  // This variable is used to determine button styling in the UI
  // We'll use it directly in the JSX instead of storing it in a variable
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium capitalize">
            {currentQuestion.category.replace('-', '/')}
          </span>
        </div>
        <Progress value={progressPercentage} className="mb-4" />
        <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {currentQuestion.options.map((option, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              variant={
                showFeedback
                  ? index === currentQuestion.correctAnswer
                    ? "default"
                    : selectedOption === index
                    ? "destructive"
                    : "outline"
                  : selectedOption === index
                  ? "default"
                  : "outline"
              }
              className="w-full justify-start text-left h-auto py-3 mb-2"
              onClick={() => handleOptionSelect(index)}
              disabled={isAnswered}
            >
              {option}
            </Button>
          </motion.div>
        ))}
      </CardContent>
      
      <CardFooter>
        {showFeedback && (
          <Button 
            onClick={handleNextQuestion} 
            className="w-full mt-2"
          >
            {currentQuestionIndex === questions.length - 1 ? "See Results" : "Next Question"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
