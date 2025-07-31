"use client";

import { useState } from "react";
import { z } from "zod";

import { formatPrice } from "@/lib/utils";
import { AssetPriceInfo, getTokenAmount } from "@/models/token";

import { useTokenStore } from "../hooks/useTokenStore";

// Zod schema for amount validation
const amountSchema = z
  .string()
  .min(1, "Amount is required")
  .refine((val) => !isNaN(Number(val.replace(/,/g, ""))), {
    message: "Must be a valid number",
  })
  .refine((val) => Number(val.replace(/,/g, "")) >= 0, {
    message: "Amount must be non-negative",
  })
  .refine((val) => Number(val.replace(/,/g, "")) <= 999999999, {
    message: "Amount is too large",
  });

export function AmountInput() {
  const { amountUsd, setAmountUsd, tokenFrom, assetFrom, tokenTo, assetTo } =
    useTokenStore();
  const [error, setError] = useState<string | null>(null);

  // Validate input and update store
  const handleAmountChange = (value: string) => {
    setAmountUsd(value);

    // Clear error if input is empty
    if (!value.trim()) {
      setError(null);
      return;
    }

    // Validate input
    const result = amountSchema.safeParse(value);
    if (!result.success) {
      setError(result.error.issues[0].message);
    } else {
      setError(null);
    }
  };

  const renderEstimates = () => {
    if (!assetFrom && !assetTo) return null;
    const fromEstimate =
      tokenFrom && assetFrom
        ? `${formatPrice(getTokenAmount(assetFrom.unitPrice, amountUsd), 3)} ${
            tokenFrom.symbol
          }`
        : null;
    const toEstimate =
      tokenTo && assetTo
        ? `${formatPrice(getTokenAmount(assetTo.unitPrice, amountUsd), 3)} ${
            tokenTo.symbol
          }`
        : null;

    const combinedEstimate = [fromEstimate, toEstimate]
      .filter(Boolean)
      .join(" • ");
    return <div className="text-sm text-gray-600">~ {combinedEstimate}</div>;
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Amount (USD)
      </label>
      <div className="relative">
        <input
          type="text"
          value={amountUsd}
          onChange={(e) => handleAmountChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
          placeholder="0.00"
        />
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      {renderEstimates()}
    </div>
  );
}
