"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { useTriviaStore } from "@/app/lib/store"
import { createFrameMessage } from "@/app/lib/farcaster"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"

export const ResultsCard = () => {
  const { questions, score, entryYear, resetQuiz } = useTriviaStore()
  
  // Calculate percentage score
  const percentage = Math.round((score / questions.length) * 100)
  
  // Get message based on score
  const getMessage = () => {
    if (percentage >= 80) return "Crypto OG! You've been around the block(chain)."
    if (percentage >= 60) return "Solid crypto knowledge. You've seen a few cycles."
    if (percentage >= 40) return "You know your way around crypto."
    return "Welcome to crypto! There's a lot to learn."
  }
  
  // Handle sharing result to Farcaster
  const handleShare = () => {
    const shareText = `I scored ${score}/${questions.length} on the Crypto Trivia Quiz! According to the quiz, I entered crypto around ${entryYear}. ${getMessage()} #CryptoTrivia`
    createFrameMessage(shareText)
    
    // Show a toast or feedback that the result was shared
    alert("Your result has been shared!")
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Your Crypto Trivia Results</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="text-6xl font-bold mb-2">
            {score}/{questions.length}
          </div>
          <div className="text-xl font-medium text-muted-foreground">
            {percentage}%
          </div>
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center space-y-2"
        >
          <h3 className="text-xl font-semibold">Based on your score...</h3>
          <p>You probably entered crypto around:</p>
          <div className="text-3xl font-bold">{entryYear}</div>
          <p className="text-muted-foreground mt-2">{getMessage()}</p>
        </motion.div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-3">
        <Button 
          onClick={handleShare}
          className="w-full"
        >
          Share on Farcaster
        </Button>
        <Button 
          onClick={resetQuiz}
          variant="outline" 
          className="w-full"
        >
          Try Again
        </Button>
      </CardFooter>
    </Card>
  )
}
