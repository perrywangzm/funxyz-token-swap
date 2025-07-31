import { NextRequest } from "next/server";

import { GET } from "../route";

// Mock the service
jest.mock("../assets.service", () => ({
  getAssetPriceInfoService: jest.fn(),
}));

// Helper function to create a mock request
function createMockRequest(url: string): NextRequest {
  return {
    url,
    nextUrl: new URL(url),
    searchParams: new URL(url).searchParams,
  } as unknown as NextRequest;
}

describe("/api/assets route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 for missing assetTokenAddress", async () => {
    const request = createMockRequest("http://localhost:3000/api/assets");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid query parameters");
  });

  it("should return 400 for missing chainId", async () => {
    const request = createMockRequest(
      "http://localhost:3000/api/assets?assetTokenAddress=test"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid query parameters");
  });

  it("should return 400 for invalid chainId", async () => {
    const request = createMockRequest(
      "http://localhost:3000/api/assets?assetTokenAddress=test&chainId=invalid"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid query parameters");
  });

  it("should return 400 for negative chainId", async () => {
    const request = createMockRequest(
      "http://localhost:3000/api/assets?assetTokenAddress=test&chainId=-1"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid query parameters");
  });

  it("should return 400 for zero chainId", async () => {
    const request = createMockRequest(
      "http://localhost:3000/api/assets?assetTokenAddress=test&chainId=0"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid query parameters");
  });

  it("should return 200 for valid parameters", async () => {
    const mockAssetPriceInfo = {
      data: {
        assetId: "test-asset",
        price: 100,
        priceUsd: 100,
        priceChange24h: 5.2,
      },
    };

    const { getAssetPriceInfoService } = require("../assets.service");
    getAssetPriceInfoService.mockResolvedValue(mockAssetPriceInfo);

    const request = createMockRequest(
      "http://localhost:3000/api/assets?assetTokenAddress=test-asset&chainId=1"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockAssetPriceInfo);
    expect(getAssetPriceInfoService).toHaveBeenCalledWith({
      assetTokenAddress: "test-asset",
      chainId: 1,
    });
  });
});
