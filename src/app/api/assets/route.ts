import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getAssetPriceInfoService } from "./assets.service";

const assetPriceQuerySchema = z.object({
  assetTokenAddress: z.string().min(1, "Asset token address is required"),
  chainId: z.coerce
    .number()
    .int()
    .positive("Chain ID must be a positive integer")
    .min(1, "Chain ID must be at least 1"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters with Zod
    const validationResult = assetPriceQuerySchema.safeParse({
      assetTokenAddress: searchParams.get("assetTokenAddress"),
      chainId: searchParams.get("chainId") || undefined,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { assetTokenAddress, chainId } = validationResult.data;

    // Call the getAssetPriceInfoService function
    const assetPriceInfo = await getAssetPriceInfoService({
      assetTokenAddress,
      chainId,
    });

    return NextResponse.json(assetPriceInfo, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching asset price info:", error);

    return NextResponse.json(
      { error: "Failed to fetch asset price info" },
      { status: 500 }
    );
  }
}
