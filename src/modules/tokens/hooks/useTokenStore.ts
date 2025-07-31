"use client";

import { useTokenSwapStore } from "../store/tokenStore";

export function useTokenStore() {
  const store = useTokenSwapStore();

  // Convenience getters for request states
  const tokenListStatus = store.requestStatusMap["tokenList"];
  const recommendedTokensStatus = store.requestStatusMap["recommendedTokens"];

  const swapTokens = () => {
    const tokenFrom = store.tokenFrom;
    const tokenTo = store.tokenTo;
    store.setTokenFrom(tokenTo);
    store.setTokenTo(tokenFrom);
  };

  return {
    // State
    tokenFrom: store.tokenFrom,
    assetFrom: store.assetFrom,
    tokenTo: store.tokenTo,
    assetTo: store.assetTo,
    amountUsd: store.amountUsd,
    recommendedTokens: store.recommendedTokens,

    // Request states
    tokenListStatus,
    recommendedTokensStatus,

    // Actions
    setTokenFrom: store.setTokenFrom,
    setTokenTo: store.setTokenTo,
    setAmountUsd: store.setAmountUsd,
    setRecommendedTokens: store.setRecommendedTokens,
    fetchTokenList: store.fetchTokenList,
    fetchRecommendedTokens: store.fetchRecommendedTokens,
    fetchAssetPriceInfo: store.fetchAssetPriceInfo,
    reset: store.reset,

    // Derived actions
    swapTokens,
  };
}
