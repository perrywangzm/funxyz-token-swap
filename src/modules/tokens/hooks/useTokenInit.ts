"use client";

import { useEffect } from "react";

import { useTokenSwapStore } from "../store/tokenStore";

export function useTokenInit() {
  useEffect(() => {
    const initializeTokens = async () => {
      // Check if we're already loading or have loaded recommended tokens
      const state = useTokenSwapStore.getState();
      const recommendedStatus = state.requestStatusMap["recommendedTokens"];

      // Only fetch if we haven't loaded yet and aren't currently loading
      if (!recommendedStatus?.isLoading && !recommendedStatus?.lastFetched) {
        try {
          await state.fetchRecommendedTokens();
        } catch (error) {
          console.error("Failed to initialize recommended tokens:", error);
        }
      }
    };

    initializeTokens();
  }, []); // Empty dependency array - only run on mount
}
