import { Token } from "@/models/token";

import { tokenListData } from "./tokenlist.data";

export interface GetAllTokenListResponse {
  tokens: Token[];
}

export interface GetFilteredTokenListParams {
  query?: string;
  limit?: number;
  offset?: number;
}

export interface GetFilteredTokenListResponse {
  tokens: Token[];
  total: number;
  limit: number;
  offset: number;
}

export async function fetchTokenList(): Promise<GetAllTokenListResponse> {
  /** Use hardcoded data to avoid calling external apis/resources */
  return {
    tokens: tokenListData,
  };
}

export async function getFilteredTokenList(
  params: GetFilteredTokenListParams
): Promise<GetFilteredTokenListResponse> {
  const { query = "", limit = 50, offset = 0 } = params;

  const tokenList = await fetchTokenList();

  // Filter tokens based on query (case-insensitive search in name and symbol)
  let filteredTokens = tokenList.tokens;

  if (query.trim()) {
    const searchTerm = query.toLowerCase();
    const symbolMatches = tokenList.tokens.filter((token) =>
      token.symbol.toLowerCase().includes(searchTerm)
    );
    const nameMatches = tokenList.tokens.filter(
      (token) =>
        !token.symbol.toLowerCase().includes(searchTerm) &&
        token.name.toLowerCase().includes(searchTerm)
    );
    filteredTokens = [...symbolMatches, ...nameMatches];
  }

  // Apply pagination
  const total = filteredTokens.length;
  const paginatedTokens = filteredTokens.slice(offset, offset + limit);

  return {
    tokens: paginatedTokens,
    total,
    limit,
    offset,
  };
}

export async function fetchRecommendedTokenList(): Promise<GetAllTokenListResponse> {
  // Define recommended tokens by chainId and symbol
  const recommendedTokenSpecs = [
    { chainId: 1, symbol: "USDC" },
    { chainId: 1, symbol: "USDT" },
    { chainId: 1, symbol: "ETH" },
    { chainId: 1, symbol: "WBTC" },
  ];

  try {
    const tokenList = await fetchTokenList();
    const recommendedTokens: Token[] = [];

    // Look up each recommended token in the fetched token list
    for (const spec of recommendedTokenSpecs) {
      const token = tokenList.tokens.find(
        (t) => t.chainId === spec.chainId && t.symbol === spec.symbol
      );

      if (token) {
        recommendedTokens.push(token);
      }
    }

    return {
      tokens: recommendedTokens,
    };
  } catch (error) {
    console.error("Failed to fetch recommended token list:", error);
    // Return empty list as fallback
    return {
      tokens: [],
    };
  }
}
