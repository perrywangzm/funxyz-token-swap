import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getAssetErc20Service } from "./erc20.service";

const assetErc20QuerySchema = z.object({
  chainId: z.coerce
    .number()
    .int()
    .positive("Chain ID must be a positive integer")
    .min(1, "Chain ID must be at least 1"),
  symbol: z.string().min(1, "Symbol is required"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters with Zod
    const validationResult = assetErc20QuerySchema.safeParse({
      chainId: searchParams.get("chainId") || undefined,
      symbol: searchParams.get("symbol"),
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

    const { chainId, symbol } = validationResult.data;

    // Call the getAssetErc20Service function
    const assetErc20 = await getAssetErc20Service({
      chainId,
      symbol,
    });

    return NextResponse.json(assetErc20, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching ERC20 asset:", error);

    return NextResponse.json(
      { error: "Failed to fetch ERC20 asset" },
      { status: 500 }
    );
  }
}
