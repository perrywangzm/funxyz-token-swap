export interface Token {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  chainId?: number;
}

// Reuse API types for now
import { type GetAssetPriceInfoResponse } from "@funkit/api-base";
export type AssetPriceInfo = GetAssetPriceInfoResponse;

export { type Erc20AssetInfo } from "@funkit/api-base";

// Utils
export function getUniqueTokenKey(token: Token) {
  return `${token.symbol}/${token.chainId || ""}`;
}

export function getTokenAmount(unitPrice: number, usdAmount: string) {
  if (!unitPrice || !usdAmount) return 0;
  const usdValue = parseFloat(usdAmount.replace(/,/g, ""));
  return usdValue / unitPrice;
}
