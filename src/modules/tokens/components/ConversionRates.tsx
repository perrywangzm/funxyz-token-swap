"use client";

import { formatPrice } from "@/lib/utils";
import { AssetPriceInfo, getTokenAmount, Token } from "@/models/token";

type ConversionRatesProps = {
  amountUsd: string;
  tokenFrom: Token;
  assetFrom: AssetPriceInfo;
  tokenTo: Token;
  assetTo: AssetPriceInfo;
};

export function ConversionRates({
  amountUsd,
  tokenFrom,
  tokenTo,
  assetFrom,
  assetTo,
}: ConversionRatesProps) {
  if (!amountUsd || Number.isNaN(+amountUsd)) return null;
  const amountOfTokenFrom = getTokenAmount(assetFrom.unitPrice, amountUsd);
  const amountOfTokenTo = getTokenAmount(assetTo.unitPrice, amountUsd);
  return (
    <ul className="list-none space-y-1 text-sm text-gray-600">
      <li key="by-unit">
        1 {tokenFrom.symbol} ≈{" "}
        {formatPrice(assetFrom.unitPrice / assetTo.unitPrice, 3)}{" "}
        {tokenTo.symbol}
      </li>
      <li key="by-amount">
        {formatPrice(amountOfTokenFrom, 3)} {tokenFrom.symbol} ≈{" "}
        {formatPrice(amountOfTokenTo, 3)} {tokenTo.symbol}
      </li>
    </ul>
  );
}
