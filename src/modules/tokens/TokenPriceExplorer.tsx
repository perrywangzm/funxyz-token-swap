"use client";

import { formatPrice } from "@/lib/utils";
import { getTokenAmount, getUniqueTokenKey } from "@/models/token";

import { AmountInput } from "./components/AmountInput";
import { ConversionRates } from "./components/ConversionRates";
import { TokenAutocomplete } from "./components/TokenAutocomplete";
import { useTokenInit } from "./hooks/useTokenInit";
import { useTokenStore } from "./hooks/useTokenStore";

export function TokenPriceExplorer() {
  // Initialize recommended tokens
  useTokenInit();

  const {
    amountUsd,
    tokenFrom,
    assetFrom,
    tokenTo,
    assetTo,
    setTokenFrom,
    setTokenTo,
    fetchTokenList,
    recommendedTokens,
    recommendedTokensStatus,
    swapTokens,
  } = useTokenStore();

  const isLoading = recommendedTokensStatus?.isLoading || false;

  return (
    <div className="w-full max-w-xl m-auto bg-white rounded-lg shadow-lg p-6 m-0">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Token Price Explorer
        </h1>
      </div>

      {/* Amount Input */}
      <AmountInput />

      {/* From/To Swap */}
      <div className="space-y-4 my-6">
        <label className="block text-sm font-medium text-gray-700 capitalize">
          From
        </label>
        <TokenAutocomplete
          selectedToken={tokenFrom || undefined}
          amount={
            assetFrom
              ? formatPrice(getTokenAmount(assetFrom.unitPrice, amountUsd), 3)
              : null
          }
          onTokenSelect={(token) => setTokenFrom(token)}
          onRequest={fetchTokenList}
          disabledTokenKeys={tokenTo ? [getUniqueTokenKey(tokenTo)] : undefined}
          defaultTokens={recommendedTokens}
          isLoading={isLoading}
        />

        <div className="flex justify-center">
          <button
            onClick={swapTokens}
            className="w-8 h-8 bg-gray-200 hover:bg-gray-100 rounded-full flex items-center justify-center cursor-pointer"
          >
            <svg
              className="w-4 h-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </button>
        </div>

        <label className="block text-sm font-medium text-gray-700 capitalize">
          To
        </label>
        <TokenAutocomplete
          selectedToken={tokenTo || undefined}
          amount={
            assetTo
              ? formatPrice(getTokenAmount(assetTo.unitPrice, amountUsd), 3)
              : null
          }
          onTokenSelect={(token) => setTokenTo(token)}
          onRequest={fetchTokenList}
          disabledTokenKeys={
            tokenFrom ? [getUniqueTokenKey(tokenFrom)] : undefined
          }
          defaultTokens={recommendedTokens}
          isLoading={isLoading}
        />
      </div>

      {/* Conversion Rates */}
      {!!tokenFrom && !!tokenTo && !!assetFrom && !!assetTo && (
        <ConversionRates
          amountUsd={amountUsd}
          tokenFrom={tokenFrom}
          assetFrom={assetFrom}
          tokenTo={tokenTo}
          assetTo={assetTo}
        />
      )}

      {/* Footer */}
      <div className="text-xs text-gray-500 text-center mt-4 space-y-1">
        <p>Quotes are indicative.</p>
      </div>
    </div>
  );
}
