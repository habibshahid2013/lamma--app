"use client";

import { useState, useCallback } from "react";

interface UseAIOptions {
  onError?: (error: Error) => void;
}

interface Creator {
  name: string;
  topics: string[];
}

/**
 * Hook for using AI features in components
 */
export function useAI(options: UseAIOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback(
    (err: Error) => {
      setError(err.message);
      options.onError?.(err);
    },
    [options]
  );

  /**
   * Generate a bio for a creator
   */
  const generateBio = useCallback(
    async (
      creatorName: string,
      topics: string[],
      existingInfo?: string
    ): Promise<string | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/ai/generate-bio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ creatorName, topics, existingInfo }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate bio");
        }

        const data = await response.json();
        return data.bio;
      } catch (err) {
        handleError(err instanceof Error ? err : new Error(String(err)));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  /**
   * Get creator recommendations based on interests
   */
  const getRecommendations = useCallback(
    async (
      userInterests: string[],
      followedCreators: string[],
      availableCreators: Creator[]
    ): Promise<string[]> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/ai/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userInterests,
            followedCreators,
            availableCreators,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get recommendations");
        }

        const data = await response.json();
        return data.recommendations;
      } catch (err) {
        handleError(err instanceof Error ? err : new Error(String(err)));
        return [];
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  /**
   * Summarize content (video, podcast, article)
   */
  const summarize = useCallback(
    async (
      title: string,
      description: string,
      contentType: "video" | "podcast" | "article"
    ): Promise<string | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/ai/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, contentType }),
        });

        if (!response.ok) {
          throw new Error("Failed to summarize content");
        }

        const data = await response.json();
        return data.summary;
      } catch (err) {
        handleError(err instanceof Error ? err : new Error(String(err)));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  return {
    loading,
    error,
    generateBio,
    getRecommendations,
    summarize,
    clearError: () => setError(null),
  };
}

export default useAI;
