import { Token } from "@/models/token";

export const mockTokens: Token[] = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    decimals: 8,
    chainId: 1,
    logoURI: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
    chainId: 1,
    logoURI: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    decimals: 9,
    chainId: 1,
    logoURI: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
  },
  {
    id: "usd-coin",
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    chainId: 1,
    logoURI:
      "https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png",
  },
  {
    id: "tether",
    name: "Tether USD",
    symbol: "USDT",
    decimals: 6,
    chainId: 1,
    logoURI: "https://assets.coingecko.com/coins/images/325/large/Tether.png",
  },
  {
    id: "wrapped-bitcoin",
    name: "Wrapped Bitcoin",
    symbol: "WBTC",
    decimals: 8,
    chainId: 1,
    logoURI:
      "https://assets.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png",
  },
  {
    id: "chainlink",
    name: "Chainlink",
    symbol: "LINK",
    decimals: 18,
    chainId: 1,
    logoURI:
      "https://assets.coingecko.com/coins/images/877/large/chainlink.png",
  },
  {
    id: "uniswap",
    name: "Uniswap",
    symbol: "UNI",
    decimals: 18,
    chainId: 1,
    logoURI:
      "https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png",
  },
  {
    id: "polygon",
    name: "Polygon",
    symbol: "MATIC",
    decimals: 18,
    chainId: 1,
    logoURI:
      "https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png",
  },
  {
    id: "cardano",
    name: "Cardano",
    symbol: "ADA",
    decimals: 18,
    chainId: 1,
    logoURI: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
  },
];
