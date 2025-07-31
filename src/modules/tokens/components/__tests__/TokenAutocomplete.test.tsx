import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";

import { Token } from "@/models/token";

import { mockTokens } from "../../data/mockTokens";
import { TokenAutocomplete } from "../TokenAutocomplete";

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock the useTokenStore hook
const mockFetchTokenList = jest.fn();
const mockTokenListStatus = { isLoading: false };

jest.mock("../../hooks/useTokenStore", () => ({
  useTokenStore: () => ({
    fetchTokenList: mockFetchTokenList,
    tokenListStatus: mockTokenListStatus,
  }),
}));

// Mock the NetworkImage component
jest.mock("../NetworkImage", () => ({
  NetworkImage: ({
    src,
    alt,
    fallback,
  }: {
    src: string;
    alt: string;
    fallback?: React.ReactNode;
  }) => (
    <div data-testid="network-image" data-src={src} data-alt={alt}>
      {fallback || "Mock Image"}
    </div>
  ),
}));

describe("TokenAutocomplete", () => {
  const defaultProps = {
    onTokenSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchTokenList.mockResolvedValue(mockTokens);
  });

  describe("Rendering", () => {
    it("renders with default state", () => {
      render(<TokenAutocomplete {...defaultProps} />);

      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(screen.getByText("Select token...")).toBeInTheDocument();
    });

    it("renders with selected token", () => {
      const selectedToken = mockTokens[0]; // Bitcoin
      render(
        <TokenAutocomplete {...defaultProps} selectedToken={selectedToken} />
      );

      expect(screen.getByText("BTC")).toBeInTheDocument();
      // The full name is only shown in the dropdown, not in the trigger button
    });

    it("renders with amount", () => {
      const selectedToken = mockTokens[0];
      const amount = "1.5";

      render(
        <TokenAutocomplete
          {...defaultProps}
          selectedToken={selectedToken}
          amount={amount}
        />
      );

      expect(screen.getByText("1.5")).toBeInTheDocument();
    });

    it("renders loading state", () => {
      render(<TokenAutocomplete {...defaultProps} isLoading={true} />);

      expect(screen.getByText("Loading tokens...")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeDisabled();
    });
  });

  describe("Token Selection", () => {
    it("renders with proper ARIA attributes", () => {
      render(<TokenAutocomplete {...defaultProps} />);

      const combobox = screen.getByRole("combobox");
      expect(combobox).toHaveAttribute("aria-expanded", "false");
    });

    it("calls onTokenSelect when token is clicked", async () => {
      const user = userEvent.setup();
      const onTokenSelect = jest.fn();

      render(
        <TokenAutocomplete {...defaultProps} onTokenSelect={onTokenSelect} />
      );

      // Open popover
      await user.click(screen.getByRole("combobox"));

      // Select first token
      const firstToken = screen.getByText("BTC");
      await user.click(firstToken);

      expect(onTokenSelect).toHaveBeenCalledWith(mockTokens[0]);
    });

    it("disables specified tokens", async () => {
      const user = userEvent.setup();
      const disabledTokenKeys = ["BTC/1"];

      render(
        <TokenAutocomplete
          {...defaultProps}
          disabledTokenKeys={disabledTokenKeys}
        />
      );

      await user.click(screen.getByRole("combobox"));

      const btcItem = screen.getByText("BTC").closest('[role="option"]');
      expect(btcItem).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("Search Functionality", () => {
    it("shows default tokens when search is empty", async () => {
      const user = userEvent.setup();
      render(<TokenAutocomplete {...defaultProps} />);

      await user.click(screen.getByRole("combobox"));

      // Should show default tokens
      expect(screen.getByText("BTC")).toBeInTheDocument();
      expect(screen.getByText("ETH")).toBeInTheDocument();
      expect(screen.getByText("SOL")).toBeInTheDocument();
    });

    it("triggers search when user types", async () => {
      const user = userEvent.setup();
      render(<TokenAutocomplete {...defaultProps} />);

      await user.click(screen.getByRole("combobox"));

      const searchInput = screen.getByPlaceholderText("Search tokens...");
      await user.type(searchInput, "bitcoin");

      await waitFor(() => {
        expect(mockFetchTokenList).toHaveBeenCalledWith("bitcoin");
      });
    });

    it("uses custom onRequest when provided", async () => {
      const user = userEvent.setup();
      const customOnRequest = jest.fn().mockResolvedValue([mockTokens[0]]);

      render(
        <TokenAutocomplete {...defaultProps} onRequest={customOnRequest} />
      );

      await user.click(screen.getByRole("combobox"));

      const searchInput = screen.getByPlaceholderText("Search tokens...");
      await user.type(searchInput, "test");

      await waitFor(() => {
        expect(customOnRequest).toHaveBeenCalledWith("test");
        expect(mockFetchTokenList).not.toHaveBeenCalled();
      });
    });

    it("handles search errors gracefully", async () => {
      const user = userEvent.setup();
      mockFetchTokenList.mockRejectedValue(new Error("API Error"));

      render(<TokenAutocomplete {...defaultProps} />);

      await user.click(screen.getByRole("combobox"));

      const searchInput = screen.getByPlaceholderText("Search tokens...");
      await user.type(searchInput, "error");

      await waitFor(() => {
        expect(screen.getByText("No tokens found.")).toBeInTheDocument();
      });
    });
  });

  describe("Token Display", () => {
    it("displays token with logo", async () => {
      const user = userEvent.setup();
      render(<TokenAutocomplete {...defaultProps} />);

      await user.click(screen.getByRole("combobox"));

      const btcItem = screen.getByText("BTC").closest('[role="option"]');
      expect(btcItem).toBeInTheDocument();

      // Check for network image
      const images = screen.getAllByTestId("network-image");
      expect(images.length).toBeGreaterThan(0);
    });

    it("displays token without logo (fallback)", async () => {
      const user = userEvent.setup();
      const tokenWithoutLogo: Token = {
        id: "test",
        name: "Test Token",
        symbol: "TEST",
        decimals: 18,
        chainId: 1,
      };

      render(
        <TokenAutocomplete
          {...defaultProps}
          defaultTokens={[tokenWithoutLogo]}
        />
      );

      await user.click(screen.getByRole("combobox"));

      expect(screen.getByText("TEST")).toBeInTheDocument();
      expect(screen.getByText("Test Token | Chain ID: 1")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty token list", async () => {
      const user = userEvent.setup();
      render(<TokenAutocomplete {...defaultProps} defaultTokens={[]} />);

      await user.click(screen.getByRole("combobox"));

      expect(screen.getByText("No tokens found.")).toBeInTheDocument();
    });

    it("handles tokens with missing chainId", async () => {
      const user = userEvent.setup();
      const tokenWithoutChainId: Token = {
        id: "test",
        name: "Test Token",
        symbol: "TEST",
        decimals: 18,
      };

      render(
        <TokenAutocomplete
          {...defaultProps}
          defaultTokens={[tokenWithoutChainId]}
        />
      );

      await user.click(screen.getByRole("combobox"));

      expect(
        screen.getByText("Test Token | Chain ID: Unknown")
      ).toBeInTheDocument();
    });

    it("prevents popover from opening when loading", async () => {
      const user = userEvent.setup();
      render(<TokenAutocomplete {...defaultProps} isLoading={true} />);

      await user.click(screen.getByRole("combobox"));

      expect(
        screen.queryByPlaceholderText("Search tokens...")
      ).not.toBeInTheDocument();
    });
  });
});
