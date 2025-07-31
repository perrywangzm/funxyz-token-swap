import { getAssetPriceInfoService } from "../assets.service";

// Mock the @funkit/api-base module
jest.mock("@funkit/api-base", () => ({
  getAssetPriceInfo: jest.fn(),
}));

describe("Assets Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return asset price info for valid parameters", async () => {
    const mockAssetPriceInfo = {
      assetId: "test-asset",
      price: 100,
      priceUsd: 100,
      priceChange24h: 5.2,
    };

    const { getAssetPriceInfo } = await import("@funkit/api-base");
    (getAssetPriceInfo as jest.Mock).mockResolvedValue(mockAssetPriceInfo);

    const result = await getAssetPriceInfoService({
      assetTokenAddress: "test-asset",
      chainId: 1,
    });

    expect(result).toEqual({
      data: mockAssetPriceInfo,
    });
    expect(getAssetPriceInfo).toHaveBeenCalledWith({
      assetTokenAddress: "test-asset",
      chainId: "1",
      apiKey: undefined,
    });
  });

  it("should handle service errors", async () => {
    const { getAssetPriceInfo } = await import("@funkit/api-base");
    (getAssetPriceInfo as jest.Mock).mockRejectedValue(
      new Error("[Testing] Service error")
    );

    await expect(
      getAssetPriceInfoService({
        assetTokenAddress: "test-asset",
        chainId: 1,
      })
    ).rejects.toThrow("Failed to fetch asset price info");
  });
});
