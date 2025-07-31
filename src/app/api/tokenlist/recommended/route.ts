import { NextResponse } from "next/server";

import { fetchRecommendedTokenList } from "../tokenlist.service";

export async function GET() {
  try {
    const data = await fetchRecommendedTokenList();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching recommended token list:", error);

    return NextResponse.json(
      { error: "Failed to fetch recommended token list" },
      { status: 500 }
    );
  }
}
