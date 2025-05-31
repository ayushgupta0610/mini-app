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
import { AlertCircle, Play, Loader2, Settings } from "lucide-react";

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

      // Instead of navigating, just call the onStart callback
      // This will update the UI state without changing the URL
      if (onStart) {
        onStart();
      }
    } catch (error) {
      console.error("Error starting quiz:", error);
    } finally {
      setIsStarting(false);
    }
  };

  const categories = [
    { name: "Development", icon: "💻" },
    { name: "Memes/NFTs/Tokens", icon: "🖼️" },
    { name: "Scams", icon: "🚨" },
    { name: "Incidents", icon: "🚨" },
    // { name: "People in Web3", icon: "👤" },
  ];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CardTitle className="text-2xl text-center">
            Crypto Trivia Quiz
          </CardTitle>
          <CardDescription className="text-center mt-2">
            Test your crypto knowledge and discover when you should have entered
            the space!
          </CardDescription>
        </motion.div>
      </CardHeader>

      <CardContent>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-center mb-4">
            Answer questions from these categories:
          </p>

          <div className="grid grid-cols-2 gap-3">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-accent/50 p-3 rounded-lg text-center"
              >
                <div className="text-2xl mb-1">{category.icon}</div>
                <div className="text-sm font-medium">{category.name}</div>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-1 mt-4 mb-2">
            <div className="h-2 w-2 rounded-full bg-primary"></div>
            <p className="text-center text-sm text-muted-foreground">
              10 questions • 5 seconds per question • 10 plays per day
            </p>
            <div className="h-2 w-2 rounded-full bg-primary"></div>
          </div>

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

      <CardFooter>
        <Button
          onClick={handleStart}
          className="w-full"
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
      </CardFooter>

      {/* Settings Dialog */}
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSettings(true)}
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      <TriviaSettings open={showSettings} onOpenChange={setShowSettings} />
    </Card>
  );
};
