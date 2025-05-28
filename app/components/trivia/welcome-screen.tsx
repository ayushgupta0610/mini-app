"use client"

import { motion } from "framer-motion"
import { useTriviaStore } from "@/app/lib/store"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card"

export const WelcomeScreen = () => {
  const { initializeQuiz } = useTriviaStore()
  
  const handleStart = () => {
    initializeQuiz(8) // Start with 8 questions
  }
  
  const categories = [
    { name: "Development", icon: "💻" },
    { name: "Memes/NFTs", icon: "🖼️" },
    { name: "Scams", icon: "🚨" },
    { name: "Incidents", icon: "📰" }
  ]
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CardTitle className="text-2xl text-center">Crypto Trivia Quiz</CardTitle>
          <CardDescription className="text-center mt-2">
            Test your crypto knowledge and discover when you should have entered the space!
          </CardDescription>
        </motion.div>
      </CardHeader>
      
      <CardContent>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-4"
        >
          <p className="text-center mb-4">
            Answer questions from these categories:
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex flex-col items-center p-3 rounded-lg border bg-card/50"
              >
                <span className="text-2xl mb-1">{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
              </motion.div>
            ))}
          </div>
          
          <p className="text-center text-sm text-muted-foreground mt-4">
            8 questions total • 2 from each category
          </p>
        </motion.div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleStart}
          className="w-full"
          size="lg"
        >
          Start Quiz
        </Button>
      </CardFooter>
    </Card>
  )
}
