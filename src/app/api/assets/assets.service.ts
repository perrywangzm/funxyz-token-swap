import { getAssetPriceInfo } from "@funkit/api-base";

import { FUNKIT_API_KEY } from "@/config/server";
import { AssetPriceInfo } from "@/models/token";

export interface GetAssetPriceInfoParams {
  assetTokenAddress: string;
  chainId: number;
}

export interface GetAssetPriceInfoResponse {
  data: AssetPriceInfo;
}

export async function getAssetPriceInfoService(
  params: GetAssetPriceInfoParams
): Promise<GetAssetPriceInfoResponse> {
  const { assetTokenAddress, chainId } = params;

  try {
    const assetPriceInfo = await getAssetPriceInfo({
      assetTokenAddress,
      chainId: chainId.toString(),
      apiKey: FUNKIT_API_KEY,
    });

    return {
      data: assetPriceInfo,
    };
  } catch (error) {
    console.error("Error in getAssetPriceInfoService:", error);
    throw new Error("Failed to fetch asset price info");
  }
}
