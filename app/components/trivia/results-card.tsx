"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useTriviaStore } from "@/app/lib/store"
import { createFrameMessage } from "@/app/lib/farcaster"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"
import { FarcasterAuth } from "@/app/components/auth/farcaster-auth"
import { AlertCircle, Share2, RefreshCw, Check } from "lucide-react"

export const ResultsCard = () => {
  const { 
    questions, 
    score, 
    entryYear, 
    resetQuiz, 
    isAuthenticated,
    castScore,
    hasReachedDailyLimit
  } = useTriviaStore()
  
  const [isCasting, setIsCasting] = useState(false)
  const [castSuccess, setCastSuccess] = useState(false)
  const [castError, setCastError] = useState<string | null>(null)
  
  // Calculate percentage score
  const percentage = Math.round((score / questions.length) * 100)
  
  // Get message based on score
  const getMessage = () => {
    if (percentage >= 80) return "Crypto OG! You've been around the block(chain)."
    if (percentage >= 60) return "Solid crypto knowledge. You've seen a few cycles."
    if (percentage >= 40) return "You know your way around crypto."
    return "Welcome to crypto! There's a lot to learn."
  }
  
  // Handle casting score to Farcaster
  const handleCastScore = async () => {
    if (!isAuthenticated) {
      setCastError("Please sign in with Farcaster to cast your score")
      return
    }
    
    setIsCasting(true)
    setCastError(null)
    
    try {
      const success = await castScore()
      
      if (success) {
        setCastSuccess(true)
      } else {
        setCastError("Failed to cast your score. Please try again.")
      }
    } catch (error) {
      console.error("Error casting score:", error)
      setCastError("An unexpected error occurred. Please try again.")
    } finally {
      setIsCasting(false)
    }
  }
  
  // Handle sharing result to Farcaster
  const handleShare = () => {
    const shareText = `I scored ${score}/${questions.length} on the Crypto Trivia Quiz! According to the quiz, I entered crypto around ${entryYear}. ${getMessage()} #CryptoTrivia`
    createFrameMessage(shareText)
    
    // Show a toast or feedback that the result was shared
    alert("Your result has been shared!")
  }
  
  // Use the hasReachedDailyLimit from store
  const hasReachedLimit = hasReachedDailyLimit
  
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
        
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <FarcasterAuth />
          </motion.div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col gap-3">
        {castError && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md flex items-start gap-2 mb-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{castError}</p>
          </div>
        )}
        
        {isAuthenticated && (
          <Button 
            onClick={handleCastScore}
            className="w-full"
            disabled={isCasting || castSuccess}
          >
            {isCasting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Casting...
              </span>
            ) : castSuccess ? (
              <span className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                Cast Successful
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Cast to Farcaster
              </span>
            )}
          </Button>
        )}
        
        <Button 
          onClick={handleShare}
          className="w-full"
          variant={isAuthenticated ? "outline" : "default"}
        >
          <Share2 className="h-5 w-5 mr-2" />
          Share as Frame
        </Button>
        
        <Button 
          onClick={resetQuiz}
          variant="outline" 
          className="w-full"
          disabled={hasReachedLimit}
        >
          <RefreshCw className="h-5 w-5 mr-2" />
          Try Again
        </Button>
        
        {hasReachedLimit && (
          <div className="mt-2 p-3 bg-amber-500/10 text-amber-500 rounded-md text-sm text-center">
            You&apos;ve reached the daily limit of 3 quizzes. Come back tomorrow for more!
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
