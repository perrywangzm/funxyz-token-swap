import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getFilteredTokenList } from "./tokenlist.service";

const tokenListQuerySchema = z.object({
  query: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters with Zod
    const validationResult = tokenListQuerySchema.safeParse({
      query: searchParams.get("query"),
      limit: searchParams.get("limit") || undefined,
      offset: searchParams.get("offset") || undefined,
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

    const { query, limit, offset } = validationResult.data;
    const data = await getFilteredTokenList({ query, limit, offset });

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching token list:", error);

    return NextResponse.json(
      { error: "Failed to fetch token list" },
      { status: 500 }
    );
  }
}
