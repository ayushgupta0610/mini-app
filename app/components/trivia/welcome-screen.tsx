"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useTriviaStore } from "@/app/lib/store";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { FarcasterAuth } from "@/app/components/auth/farcaster-auth";
import { TriviaSettings } from "./trivia-settings";
import { AlertCircle, Play, Loader2, Settings, Trophy, Brain, Zap } from "lucide-react";

interface WelcomeScreenProps {
  onStart?: () => void;
  isLoading?: boolean;
}

export const WelcomeScreen = ({
  onStart,
  isLoading: externalLoading,
}: WelcomeScreenProps) => {
  // const router = useRouter();
  const {
    initializeQuiz,
    isAuthenticated,
    user,
    checkDailyLimit,
    isLoading,
    useDynamicQuestions,
    difficulty,
  } = useTriviaStore();
  const [isStarting, setIsStarting] = useState(false);
  // Combine local and external loading states
  const isButtonLoading = isStarting || isLoading || externalLoading;
  const [showSettings, setShowSettings] = useState(false);

  // Check if user has reached daily limit
  const hasReachedLimit = checkDailyLimit();

  const handleStart = async () => {
    setIsStarting(true);

    try {
      // Initialize the quiz with 8 questions
      // Use dynamic questions if enabled
      await initializeQuiz(8, {
        useDynamicQuestions,
        difficulty,
      });

      // Call the onStart callback to update parent component state
      if (onStart) {
        onStart();
      }
      
      // Log success for debugging
      console.log("Quiz initialized successfully, moving to questions");
    } catch (error) {
      console.error("Error starting quiz:", error);
      // Reset loading state on error
      setIsStarting(false);
      return;
    }
    
    // Set loading to false only on success path
    setIsStarting(false)
  };

  const categories = [
    { name: "Development", icon: "💻" },
    { name: "Memes/NFTs/Tokens", icon: "🖼️" },
    { name: "Scams", icon: "🚨" },
    { name: "Incidents", icon: "🚨" },
    // { name: "People in Web3", icon: "👤" },
  ];

  return (
    <Card className="w-full max-w-md mx-auto relative overflow-hidden border-2 border-primary/20 shadow-lg">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-cyan-500/10 z-0"></div>
      
      {/* Animated particles */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/20"
            style={{
              width: Math.random() * 10 + 5,
              height: Math.random() * 10 + 5,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * -100 - 50],
              opacity: [0, 0.7, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <CardHeader className="relative z-10">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          <motion.div 
            className="w-24 h-24 mb-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Brain className="w-12 h-12 text-white" />
          </motion.div>
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
            Crypto Trivia
          </CardTitle>
          <CardDescription className="text-center mt-2 text-base">
            Test your crypto knowledge and discover when you should have entered
            the space!
          </CardDescription>
        </motion.div>
      </CardHeader>

      <CardContent className="relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.p 
            className="text-center mb-4 font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Challenge yourself in these categories:
          </motion.p>

          <div className="grid grid-cols-2 gap-3">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm p-4 rounded-xl text-center border border-primary/10 hover:border-primary/30 hover:shadow-md transition-all duration-300"
                whileHover={{ scale: 1.03 }}
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="text-sm font-medium">{category.name}</div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="flex items-center justify-center gap-2 mt-6 mb-3 bg-primary/10 rounded-full py-2 px-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Zap className="h-4 w-4 text-primary" />
            <p className="text-center text-sm font-medium">
              10 questions • 5 seconds per question • 10 plays per day
            </p>
            <Trophy className="h-4 w-4 text-primary" />
          </motion.div>

          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-6"
            >
              <FarcasterAuth />
            </motion.div>
          )}

          {isAuthenticated && user.dailyPlays.count > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-4 text-center text-sm"
            >
              <p className="text-muted-foreground">
                You&apos;ve played{" "}
                <span className="font-medium text-foreground">
                  {user.dailyPlays.count}/3
                </span>{" "}
                quizzes today
              </p>
            </motion.div>
          )}

          {hasReachedLimit && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-4 p-3 bg-amber-500/10 text-amber-500 rounded-md flex items-start gap-2"
            >
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                You&apos;ve reached the daily limit of 3 quizzes. Come back
                tomorrow for more!
              </p>
            </motion.div>
          )}
        </motion.div>
      </CardContent>

      <CardFooter className="relative z-10">
        <motion.div 
          className="w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            onClick={handleStart}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
            size="lg"
            disabled={hasReachedLimit || isButtonLoading}
          >
            {isButtonLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Loading Questions...
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Start Quiz
              </>
            )}
          </Button>
        </motion.div>
      </CardFooter>

      {/* Settings Dialog */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSettings(true)}
          title="Settings"
          className="bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-300"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      <TriviaSettings open={showSettings} onOpenChange={setShowSettings} />
    </Card>
  );
};
