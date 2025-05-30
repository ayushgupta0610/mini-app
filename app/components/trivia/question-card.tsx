"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTriviaStore } from "@/app/lib/store";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { Check, X, Clock } from "lucide-react";
import { cn } from "@/app/lib/utils";

export const QuestionCard = () => {
  const {
    questions,
    currentQuestionIndex,
    // We're not directly using answers in this component
    answerQuestion,
    nextQuestion,
  } = useTriviaStore();

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5); // 5 seconds per question
  const [isTimerActive, setIsTimerActive] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Get current question
  const currentQuestion = questions[currentQuestionIndex];

  // Calculate progress percentage
  const progressPercentage = (currentQuestionIndex / questions.length) * 100;

  // Reset state when question changes
  useEffect(() => {
    setSelectedOption(null);
    setIsAnswered(false);
    setShowFeedback(false);
    setTimeLeft(5); // Reset timer to 5 seconds
    setIsTimerActive(true);
  }, [currentQuestionIndex]);

  // Timer effect
  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      // Time's up, auto-select the correct answer
      setIsTimerActive(false);
      if (!isAnswered) {
        // Auto-select the correct answer when time runs out
        const correctAnswer = currentQuestion.correctAnswer;
        setSelectedOption(correctAnswer);
        setIsAnswered(true);
        answerQuestion(correctAnswer);
        setShowFeedback(true);
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, isTimerActive, isAnswered, answerQuestion, currentQuestion]);

  // Handle option selection
  const handleOptionSelect = (optionIndex: number) => {
    if (isAnswered) return;

    // Stop the timer when an option is selected
    setIsTimerActive(false);

    setSelectedOption(optionIndex);
    setIsAnswered(true);
    answerQuestion(optionIndex);
    setShowFeedback(true);

    // Add a slight delay before showing the Next button for better UX
    setTimeout(() => {
      const nextButton = document.getElementById("next-question-button");
      if (nextButton) {
        nextButton.focus();
      }
    }, 500);
  };

  // Handle next question
  const handleNextQuestion = () => {
    nextQuestion();
  };

  // If no questions are loaded yet
  if (!currentQuestion) {
    return null;
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
            {currentQuestion.category.replace("-", "/")}
          </span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <Progress value={progressPercentage} className="flex-1 mr-2" />
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium",
              timeLeft <= 5 ? "text-destructive" : "text-primary"
            )}
          >
            <Clock className="h-4 w-4" />
            <span>{timeLeft}s</span>
          </div>
        </div>
        <Progress
          value={(timeLeft / 5) * 100}
          className="mb-4"
          indicatorClassName={cn(
            timeLeft <= 2
              ? "bg-destructive"
              : timeLeft <= 4
              ? "bg-amber-500"
              : "bg-primary"
          )}
        />
        <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {currentQuestion.options.map((option, index) => {
          const isCorrect = index === currentQuestion.correctAnswer;
          const isSelected = selectedOption === index;
          const isIncorrect = isSelected && !isCorrect && showFeedback;

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
                  showFeedback &&
                    isCorrect &&
                    "bg-[var(--success)] text-[var(--success-foreground)] hover:bg-[var(--success)]/90",
                  isIncorrect &&
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
          );
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
              {currentQuestionIndex === questions.length - 1
                ? "See Results"
                : "Next Question"}
            </Button>
          </motion.div>
        )}
      </CardFooter>
    </Card>
  );
};
