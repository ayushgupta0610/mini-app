"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTriviaStore } from "@/app/lib/store";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { AlertCircle, LogIn, ExternalLink } from "lucide-react";

export const FarcasterAuth = () => {
  const { setUserData, user, isAuthenticated } = useTriviaStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // Check if we're running in preview mode
  useEffect(() => {
    // Check if we're in a preview environment by looking at the URL
    const isPreview = window.location.hostname.includes('vercel.app') || 
                     window.location.hostname.includes('localhost') ||
                     window.location.href.includes('preview');
    setIsPreviewMode(isPreview);
  }, []);

  // Check if the Farcaster API is available
  const isFarcasterAvailable = typeof window !== "undefined" && "farcaster" in window;

  // Handle Farcaster sign-in
  const handleSignIn = async () => {
    if (!isFarcasterAvailable && !isPreviewMode) {
      setError("Farcaster API not available. Please use a Farcaster compatible browser or app.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // If in preview mode, use mock data
      if (isPreviewMode) {
        // Create mock user data for preview
        setUserData({
          fid: "999999",
          username: "preview_user",
          displayName: "Preview User",
          pfp: "https://avatars.githubusercontent.com/u/1315101?v=4", // Default avatar
          dailyPlays: user.dailyPlays // Keep existing play records
        });
      } else {
        // Normal Farcaster authentication flow
        // @ts-expect-error - Farcaster API is not typed
        const response = await window.farcaster.signIn();
        
        if (response && response.success) {
          // Extract user data from the response
          const { fid, username, displayName, pfp } = response.user;
          
          // Update the store with user data
          setUserData({
            fid: fid.toString(),
            username,
            displayName,
            pfp,
            dailyPlays: user.dailyPlays // Keep existing play records
          });
        } else {
          setError("Failed to sign in with Farcaster. Please try again.");
        }
      }
    } catch (err) {
      console.error("Farcaster sign-in error:", err);
      setError("An error occurred during sign-in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // If already authenticated, show a different UI
  if (isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto bg-accent/50 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden">
              {user.pfp && (
                <Image
                  src={user.pfp}
                  alt={user.displayName || user.username || "User"}
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <span>
              {user.displayName || user.username || "Authenticated User"}
            </span>
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl text-center">Sign in with Farcaster</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <p className="text-center text-muted-foreground">
            Sign in with your Farcaster account to track your progress and share your results.
          </p>

          <Button
            onClick={handleSignIn}
            disabled={isLoading || (!isFarcasterAvailable && !isPreviewMode)}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                Sign in with Farcaster
              </span>
            )}
          </Button>

          {!isFarcasterAvailable && !isPreviewMode && (
            <p className="text-center text-sm text-muted-foreground">
              Farcaster API not detected. Please use a Farcaster compatible browser or app.
            </p>
          )}
          
          {!isFarcasterAvailable && isPreviewMode && (
            <div className="mt-4 p-3 bg-blue-500/10 text-blue-500 rounded-md flex items-start gap-2">
              <ExternalLink className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                Running in preview mode. Click the button above to continue with a preview account.
              </p>
            </div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
};
