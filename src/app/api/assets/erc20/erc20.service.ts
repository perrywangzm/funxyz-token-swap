import { getAssetErc20ByChainAndSymbol } from "@funkit/api-base";

import { FUNKIT_API_KEY } from "@/config/server";
import { Erc20AssetInfo } from "@/models/token";

export interface GetAssetErc20Params {
  chainId: number;
  symbol: string;
}

export interface GetAssetErc20Response {
  data: Erc20AssetInfo;
}

export async function getAssetErc20Service(
  params: GetAssetErc20Params
): Promise<GetAssetErc20Response> {
  const { chainId, symbol } = params;

  try {
    const assetErc20 = await getAssetErc20ByChainAndSymbol({
      chainId: chainId.toString(),
      symbol,
      apiKey: FUNKIT_API_KEY,
    });

    return {
      data: assetErc20,
    };
  } catch (error) {
    console.error("Error in getAssetErc20Service:", error);
    throw new Error("Failed to fetch ERC20 asset");
  }
}
