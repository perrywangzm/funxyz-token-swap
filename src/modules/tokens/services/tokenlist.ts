import { Token } from "@/models/token";

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
  const response = await fetch("/api/tokenlist", {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch token list: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function getFilteredTokenList(
  params: GetFilteredTokenListParams
): Promise<GetFilteredTokenListResponse> {
  const { query = "", limit = 50, offset = 0 } = params;

  const searchParams = new URLSearchParams();
  if (query) searchParams.set("query", query);
  if (limit !== 50) searchParams.set("limit", limit.toString());
  if (offset !== 0) searchParams.set("offset", offset.toString());

  const url = `/api/tokenlist${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch filtered token list: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function fetchRecommendedTokenList(): Promise<GetAllTokenListResponse> {
  const response = await fetch("/api/tokenlist/recommended", {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch recommended token list: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}
