"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTriviaStore } from "@/app/lib/store";
import { createFrameMessage } from "@/app/lib/farcaster";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { FarcasterAuth } from "@/app/components/auth/farcaster-auth";
import { AlertCircle, RefreshCw, Check, Trophy, AtSign, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";

export const ResultsCard = () => {
  const {
    questions,
    score,
    resetQuiz,
    isAuthenticated,
    castScore,
    hasReachedDailyLimit,
    isLoading,
  } = useTriviaStore();

  const [isCasting, setIsCasting] = useState(false);
  const [castError, setCastError] = useState<string | null>(null);
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const [isChallengeDialogOpen, setChallengeDialogOpen] = useState(false);
  const [friendHandles, setFriendHandles] = useState("");

  // Calculate percentage score
  const percentage = Math.round((score / questions.length) * 100);

  // Define crypto personas based on score
  const getCryptoPersona = () => {
    if (percentage >= 90)
      return {
        title: "Satoshi Tier",
        description:
          "You might be Satoshi himself! Your crypto knowledge is legendary.",
        emoji: "🧠",
        badge: "satoshi",
        color: "from-yellow-400 to-amber-600",
        rank: "1",
      };
    if (percentage >= 80)
      return {
        title: "Crypto OG",
        description:
          "You've been around since the Bitcoin whitepaper and survived multiple cycles.",
        emoji: "🦖",
        badge: "og",
        color: "from-purple-600 to-blue-600",
        rank: "2",
      };
    if (percentage >= 70)
      return {
        title: "Early Adopter",
        description: "You got in before the masses and have diamond hands.",
        emoji: "💎",
        badge: "early",
        color: "from-blue-500 to-teal-500",
        rank: "3",
      };
    if (percentage >= 60)
      return {
        title: "DeFi Wizard",
        description: "You know your way around protocols and yield farming.",
        emoji: "🧙",
        badge: "defi",
        color: "from-teal-400 to-emerald-500",
        rank: "4",
      };
    if (percentage >= 50)
      return {
        title: "NFT Collector",
        description: "You have an eye for digital art and community.",
        emoji: "🖼️",
        badge: "nft",
        color: "from-emerald-500 to-lime-500",
        rank: "5",
      };
    if (percentage >= 40)
      return {
        title: "Degen Trader",
        description: "High risk, high reward - you live for the volatility.",
        emoji: "🎰",
        badge: "degen",
        color: "from-orange-500 to-amber-500",
        rank: "6",
      };
    if (percentage >= 30)
      return {
        title: "Meme Coin Enthusiast",
        description: "You're in it for the memes and the community.",
        emoji: "🐕",
        badge: "meme",
        color: "from-rose-400 to-pink-500",
        rank: "7",
      };
    return {
      title: "Crypto Curious",
      description: "You're just getting started on your crypto journey.",
      emoji: "🔍",
      badge: "curious",
      color: "from-sky-400 to-blue-500",
      rank: "8",
    };
  };

  // Get the persona for this score
  const persona = getCryptoPersona();

  // Open challenge dialog
  const openChallengeDialog = () => {
    setChallengeDialogOpen(true);
  };
  
  // Handle sharing result to Farcaster
  const handleShare = () => {
    openChallengeDialog();
  };

  // Handle sharing result to Farcaster with friend mentions
  const handleChallengeFriends = async () => {
    if (!isAuthenticated) {
      setChallengeDialogOpen(false);
      setCastError("Please sign in with Farcaster to challenge your friends");
      return;
    }

    setIsCasting(true);
    setCastError(null);
    setChallengeDialogOpen(false);

    try {
      // Format handles to proper mentions if they don't start with @
      const formattedHandles = friendHandles
        .split(/\s*,\s*/)
        .filter(handle => handle.trim() !== '')
        .map(handle => handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`)
        .join(" ");
      
      // Add custom message with mentions
      const shareText = formattedHandles 
        ? `Hey ${formattedHandles}, I just scored ${score}/${questions.length} on the Crypto Trivia Quiz! My crypto persona is "${persona.title}" ${persona.emoji}. Can you beat my score? #CryptoTrivia`
        : `I scored ${score}/${questions.length} on the Crypto Trivia Quiz! My crypto persona is "${persona.title}" ${persona.emoji}. Can you beat my score? #CryptoTrivia`;
      
      // Use the createFrameMessage function to prepare the frame for casting
      createFrameMessage(shareText);

      // Call castScore with the custom message
      const success = await castScore(shareText);

      if (success) {
        setShowShareSuccess(true);
        setTimeout(() => setShowShareSuccess(false), 5000);
      } else {
        setCastError("Failed to share your challenge. Please try again.");
      }
    } catch (error) {
      console.error("Error challenging friends:", error);
      setCastError("An unexpected error occurred. Please try again.");
    } finally {
      setIsCasting(false);
    }
  };


  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl text-center">Quiz Results</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Score display */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center gap-1"
        >
          <div className="text-3xl font-bold">
            {score}/{questions.length}
          </div>
          <div className="text-lg font-medium text-muted-foreground">
            {percentage}% Correct
          </div>
        </motion.div>

        {/* Persona badge */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4"
        >
          <div className="p-4 rounded-full bg-gradient-to-br ring-2 ring-muted border border-muted-foreground/10 shadow-lg">
            <span className="text-4xl">{persona.emoji}</span>
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-bold">{persona.title}</h3>
            <div className="flex items-center justify-center gap-1 text-amber-500 mt-1">
              <Trophy className="h-4 w-4" />
              <span className="text-sm font-medium">Rank {persona.rank}/8</span>
            </div>
            <p className="text-muted-foreground mt-2 text-sm">
              {persona.description}
            </p>
          </div>
        </motion.div>

        {/* Challenge banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-muted/50 p-3 rounded-lg text-center text-sm border border-muted-foreground/20"
        >
          <p className="font-medium">
            Challenge your friends to beat your score!
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Share your results and see who gets the highest rank
          </p>
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

        {showShareSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 bg-green-500/10 text-green-500 rounded-md flex items-start gap-2 mb-2"
          >
            <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm">Your result has been shared!</p>
          </motion.div>
        )}

        <Button
          onClick={handleShare}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
          variant="default"
          disabled={isLoading || isCasting}
        >
          {isCasting ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              Casting...
            </span>
          ) : (
            <>
              <Trophy className="h-5 w-5 mr-2" />
              Challenge Friends
            </>
          )}
        </Button>

        <Button
          onClick={resetQuiz}
          variant="outline"
          className="w-full"
          disabled={isLoading || hasReachedDailyLimit || isCasting}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              Loading...
            </span>
          ) : (
            <>
              <RefreshCw className="h-5 w-5 mr-2" />
              Try Again {hasReachedDailyLimit ? "Tomorrow" : ""}
            </>
          )}
        </Button>

        {hasReachedDailyLimit && (
          <div className="mt-2 p-3 bg-amber-500/10 text-amber-500 rounded-md text-sm text-center">
            <p className="font-medium">Daily Limit Reached</p>
            <p className="text-xs mt-1">
              You&apos;ve played 5 times today. Come back tomorrow to improve
              your rank!
            </p>
          </div>
        )}
      </CardFooter>

      {/* Challenge Dialog */}
      <Dialog open={isChallengeDialogOpen} onOpenChange={setChallengeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Challenge your friends</DialogTitle>
            <DialogDescription>
              Mention your friends&apos; Farcaster handles to challenge them to beat your score.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <div className="grid flex-1 gap-2">
              <label htmlFor="friendHandles" className="text-sm text-muted-foreground">Enter Farcaster handles (separated by commas)</label>
              <div className="flex items-center rounded-md border px-3">
                <AtSign className="h-4 w-4 text-muted-foreground mr-2" />
                <input
                  id="friendHandles"
                  value={friendHandles}
                  onChange={(e) => setFriendHandles(e.target.value)}
                  placeholder="handle1, handle2, handle3"
                  className="flex-1 py-3 outline-none bg-transparent"
                />
                {friendHandles && (
                  <button 
                    onClick={() => setFriendHandles('')}
                    className="p-1 rounded-full hover:bg-muted"
                    type="button"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setChallengeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChallengeFriends}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
            >
              Cast Challenge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
