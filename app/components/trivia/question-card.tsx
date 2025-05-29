"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useTriviaStore } from "@/app/lib/store"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Progress } from "@/app/components/ui/progress"
import { Check, X } from "lucide-react"
import { cn } from "@/app/lib/utils"

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
    
    // Add a slight delay before showing the Next button for better UX
    setTimeout(() => {
      const nextButton = document.getElementById('next-question-button')
      if (nextButton) {
        nextButton.focus()
      }
    }, 500)
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
        {currentQuestion.options.map((option, index) => {
          const isCorrect = index === currentQuestion.correctAnswer
          const isSelected = selectedOption === index
          const isIncorrect = isSelected && !isCorrect && showFeedback
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "w-full justify-between text-left h-auto py-4 px-5 mb-2 transition-all duration-200 relative",
                  isSelected && "ring-2 ring-primary",
                  showFeedback && isCorrect && "bg-[var(--success)] text-[var(--success-foreground)] hover:bg-[var(--success)]/90",
                  isIncorrect && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                )}
                onClick={() => handleOptionSelect(index)}
                disabled={isAnswered}
              >
                <span className="mr-2">{option}</span>
                {showFeedback && (
                  <span className="flex items-center justify-center">
                    {isCorrect ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      isIncorrect && <X className="h-5 w-5" />
                    )}
                  </span>
                )}
              </Button>
            </motion.div>
          )
        })}
      </CardContent>
      
      <CardFooter className="flex justify-center">
        {showFeedback && (
          <motion.div 
            className="w-full" 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Button 
              id="next-question-button"
              onClick={handleNextQuestion} 
              className="w-full mt-4 py-5 text-base font-medium shadow-md hover:shadow-lg transition-all"
              size="lg"
            >
              {currentQuestionIndex === questions.length - 1 ? "See Results" : "Next Question"}
            </Button>
          </motion.div>
        )}
      </CardFooter>
    </Card>
  )
}
