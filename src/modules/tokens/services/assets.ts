import { TTLCache } from "@/lib/cache";
import { AssetPriceInfo, Erc20AssetInfo } from "@/models/token";

export interface GetAssetPriceInfoParams {
  assetTokenAddress: string;
  chainId: number;
}

export interface GetAssetErc20Params {
  chainId: number;
  symbol: string;
}

// Create cache instances
const assetPriceCache = new TTLCache<AssetPriceInfo>(5); // 5 minutes
const assetErc20Cache = new TTLCache<Erc20AssetInfo>(60); // 1 hour

export async function getAssetPriceInfo(
  params: GetAssetPriceInfoParams & { symbol: string }
): Promise<AssetPriceInfo> {
  const { assetTokenAddress, chainId, symbol } = params;
  const cacheKey = `${symbol}/${chainId || ""}`;

  // Check cache first
  const cachedData = assetPriceCache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // Fetch from API if cache miss or expired
  const searchParams = new URLSearchParams({
    assetTokenAddress,
    chainId: chainId.toString(),
  });

  const url = `/api/assets?${searchParams.toString()}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  // const response = {
  //   ok: true,
  //   status: 200,
  //   statusText: "OK",
  //   json: async () => {
  //     await new Promise((resolve) => setTimeout(resolve, 1000));
  //     const v = Math.random() * 100000;
  //     return {
  //       data: {
  //         unitPrice: 1.0011507807297457,
  //         amount: 1,
  //         total: 1.0011507807297457,
  //       },
  //     };
  //   },
  // };

  if (!response.ok) {
    throw new Error(
      `Failed to fetch asset price info: ${response.status} ${response.statusText}`
    );
  }

  const data: { data: AssetPriceInfo } = await response.json();
  const assetData = data.data;

  // Cache the result
  assetPriceCache.set(cacheKey, assetData);

  return assetData;
}

export async function getAssetErc20ByChainAndSymbol(
  params: GetAssetErc20Params
): Promise<Erc20AssetInfo> {
  const { chainId, symbol } = params;
  const cacheKey = `${symbol}/${chainId}`;

  // Check cache first
  const cachedData = assetErc20Cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // Fetch from API if cache miss or expired
  const searchParams = new URLSearchParams({
    chainId: chainId.toString(),
    symbol,
  });

  const url = `/api/assets/erc20?${searchParams.toString()}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ERC20 asset: ${response.status} ${response.statusText}`
    );
  }

  const data: { data: Erc20AssetInfo } = await response.json();
  const assetData = data.data;

  // Cache the result
  assetErc20Cache.set(cacheKey, assetData);

  return assetData;
}
