import { create } from "zustand";

import { showToast } from "@/lib/toast";
import { AssetPriceInfo, Token } from "@/models/token";

import {
  getAssetErc20ByChainAndSymbol,
  getAssetPriceInfo,
} from "../services/assets";
import {
  getFilteredTokenList,
  fetchRecommendedTokenList,
} from "../services/tokenlist";

interface RequestStatus {
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

interface TokenSwapState {
  // State
  tokenFrom: Token | null;
  assetFrom: AssetPriceInfo | null;
  tokenTo: Token | null;
  assetTo: AssetPriceInfo | null;
  amountUsd: string;
  recommendedTokens: Token[];

  // Request state management
  requestStatusMap: Record<string, RequestStatus>;

  // Actions
  setTokenFrom: (token: Token | null) => void;
  setTokenTo: (token: Token | null) => void;
  setAmountUsd: (amount: string) => void;
  setRecommendedTokens: (tokens: Token[]) => void;

  // Request status management
  updateRequestStatus: (key: string, status: Partial<RequestStatus>) => void;

  // API actions through store
  fetchTokenList: (query?: string) => Promise<Token[]>;
  fetchRecommendedTokens: () => Promise<Token[]>;
  fetchAssetPriceInfo: (token: Token) => Promise<AssetPriceInfo>;

  reset: () => void;
}

export const useTokenSwapStore = create<TokenSwapState>((set, get) => ({
  // Initial state
  tokenFrom: null,
  assetFrom: null,
  tokenTo: null,
  assetTo: null,
  amountUsd: "",
  recommendedTokens: [],
  requestStatusMap: {},

  // Actions
  setTokenFrom: async (token) => {
    set({ tokenFrom: token, assetFrom: null });
    if (token) {
      try {
        const assetInfo = await get().fetchAssetPriceInfo(token);
        set({ assetFrom: assetInfo });
      } catch (error) {
        console.error("Failed to fetch asset price for tokenFrom:", error);
        showToast.apiError(error, "Failed to fetch token price information");
      }
    } else {
      set({ assetFrom: null });
    }
  },
  setTokenTo: async (token) => {
    set({ tokenTo: token, assetTo: null });
    if (token) {
      try {
        const assetInfo = await get().fetchAssetPriceInfo(token);
        set({ assetTo: assetInfo });
      } catch (error) {
        console.error("Failed to fetch asset price for tokenTo:", error);
        showToast.apiError(error, "Failed to fetch token price information");
      }
    } else {
      set({ assetTo: null });
    }
  },
  setAmountUsd: (amount) => set({ amountUsd: amount }),
  setRecommendedTokens: (tokens) => set({ recommendedTokens: tokens }),

  // Request status management
  updateRequestStatus: (key: string, status: Partial<RequestStatus>) => {
    set((state) => {
      const currentStatus = state.requestStatusMap[key] || {
        isLoading: false,
        error: null,
        lastFetched: null,
      };

      return {
        requestStatusMap: {
          ...state.requestStatusMap,
          [key]: {
            ...currentStatus,
            ...status,
          },
        },
      };
    });
  },

  // API actions
  fetchTokenList: async (query?: string) => {
    const key = "tokenList";
    const { updateRequestStatus } = get();

    updateRequestStatus(key, { isLoading: true, error: null });

    try {
      const result = await getFilteredTokenList({
        query,
        limit: 50,
        offset: 0,
      });
      updateRequestStatus(key, {
        isLoading: false,
        lastFetched: Date.now(),
      });
      return result.tokens;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch token list";
      updateRequestStatus(key, {
        isLoading: false,
        error: errorMessage,
      });
      showToast.apiError(error, "Failed to fetch token list");
      throw error;
    }
  },

  fetchRecommendedTokens: async () => {
    const key = "recommendedTokens";
    const { updateRequestStatus, setRecommendedTokens } = get();

    updateRequestStatus(key, { isLoading: true, error: null });

    try {
      const result = await fetchRecommendedTokenList();
      setRecommendedTokens(result.tokens);
      updateRequestStatus(key, {
        isLoading: false,
        lastFetched: Date.now(),
      });
      return result.tokens;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch recommended tokens";
      updateRequestStatus(key, {
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  fetchAssetPriceInfo: async (token: Token) => {
    const key = `assetPrice_${token.symbol}`;
    const { updateRequestStatus } = get();

    updateRequestStatus(key, { isLoading: true, error: null });

    try {
      const erc20 = await getAssetErc20ByChainAndSymbol({
        chainId: token.chainId || 1, // Default to chainId 1 if not provided
        symbol: token.symbol,
      });
      const result = await getAssetPriceInfo({
        assetTokenAddress: erc20.address,
        chainId: token.chainId || 1, // Default to chainId 1 if not provided
        symbol: token.symbol,
      });
      updateRequestStatus(key, {
        isLoading: false,
        lastFetched: Date.now(),
      });
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch asset price info";
      updateRequestStatus(key, {
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  reset: () =>
    set({
      tokenFrom: null,
      assetFrom: null,
      tokenTo: null,
      assetTo: null,
      amountUsd: "1,000",
      recommendedTokens: [],
      requestStatusMap: {},
    }),
}));
