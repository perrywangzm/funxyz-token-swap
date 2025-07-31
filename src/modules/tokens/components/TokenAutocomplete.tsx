"use client";

import debounce from "lodash/debounce";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getUniqueTokenKey, Token } from "@/models/token";

import { mockTokens } from "../data/mockTokens";
import { useTokenStore } from "../hooks/useTokenStore";

import { NetworkImage } from "./NetworkImage";

interface TokenAutocompleteProps {
  selectedToken?: Token;
  onTokenSelect: (token: Token) => void;
  amount?: string | null;
  disabledTokenKeys?: string[];
  onRequest?: (query: string) => Promise<Token[]>;
  defaultTokens?: Token[];
  isLoading?: boolean;
}

export function TokenAutocomplete({
  selectedToken,
  onTokenSelect,
  amount,
  disabledTokenKeys,
  onRequest,
  defaultTokens = mockTokens,
  isLoading,
}: TokenAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Ensures that we only preserve the most recent query API response
  const mostRecentRequestQueryRef = React.useRef("");

  // Use store for request state management
  const { fetchTokenList, tokenListStatus } = useTokenStore();
  const [tokens, setTokens] = React.useState<Token[]>(defaultTokens);

  // Search function
  const handleSearchRequest = React.useCallback(
    async (query: string) => {
      if (!onRequest) {
        // Use store's fetchTokenList if no onRequest provided
        try {
          const results = await fetchTokenList(query);
          setTokens(results);
        } catch (error) {
          console.error("Failed to fetch tokens:", error);
          setTokens([]);
        }
        return;
      }

      try {
        const results = await onRequest(query);
        // Discard results if the query has changed since the request was made
        if (mostRecentRequestQueryRef.current !== query) return;
        setTokens(results);
      } catch (error) {
        console.error("Failed to fetch tokens:", error);
        setTokens([]);
      }
    },
    [onRequest, fetchTokenList]
  );

  // Initialize tokens with default tokens if no query has been made
  React.useEffect(() => {
    if (mostRecentRequestQueryRef.current === "") {
      setTokens(defaultTokens);
    }
  }, [defaultTokens]);

  // Ref for debounced function
  const requestRef = React.useRef(handleSearchRequest);
  requestRef.current = handleSearchRequest;

  // Create debounced function with ref
  const debouncedSearch = React.useMemo(
    () => debounce((query: string) => requestRef.current(query), 300),
    []
  );

  // Cleanup debounced function on unmount
  React.useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearch = React.useCallback(
    (query: string) => {
      setSearchQuery(query);
      // Immediately update query ref when user input to prevent stale results
      mostRecentRequestQueryRef.current = query;

      if (query.trim() === "") {
        // Show default tokens when search is empty
        setTokens(defaultTokens);
      } else {
        // Trigger debounced search for non-empty queries
        debouncedSearch(query);
      }
    },
    [debouncedSearch, defaultTokens]
  );

  const getTokenIcon = (token: Token) => {
    if (token.logoURI) {
      return (
        <div className="relative w-6 h-6">
          <NetworkImage
            src={token.logoURI}
            alt={token.symbol}
            width={24}
            height={24}
            className="rounded-full"
            fallback={
              <div className="absolute inset-0 w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {token.symbol[0]}
              </div>
            }
          />
        </div>
      );
    }

    // Fallback text icon
    return (
      <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
        {token.symbol[0]}
      </div>
    );
  };

  const getTokenDisplay = (token: Token) => {
    return (
      <div className="flex items-center space-x-2">
        {getTokenIcon(token)}
        <div className="flex flex-col">
          <span className="font-medium">{token.symbol}</span>
          <span className="text-xs text-gray-500">
            {token.name} | Chain ID: {token.chainId ?? "Unknown"}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <Popover
        open={isLoading ? false : open}
        onOpenChange={isLoading ? undefined : setOpen}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between p-3 h-auto"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-gray-500">Loading tokens...</span>
              </div>
            ) : selectedToken ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  {getTokenIcon(selectedToken)}
                  <span className="font-medium text-gray-900">
                    {selectedToken.symbol}
                  </span>
                </div>
                <div className="text-right">
                  {amount && (
                    <div className="text-lg font-medium text-gray-900">
                      {amount}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-gray-500">Select token...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search tokens..."
              value={searchQuery}
              onValueChange={handleSearch}
            />
            <CommandList>
              <CommandEmpty>
                {tokenListStatus?.isLoading ? "Loading..." : "No tokens found."}
              </CommandEmpty>
              {!tokenListStatus?.isLoading && tokens.length > 0 && (
                <CommandGroup>
                  {tokens.map((token) => {
                    const tokenKey = getUniqueTokenKey(token);
                    return (
                      <CommandItem
                        key={tokenKey}
                        value={tokenKey}
                        onSelect={() => {
                          onTokenSelect(token);
                          setOpen(false);
                        }}
                        disabled={disabledTokenKeys?.includes(tokenKey)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedToken?.id === token.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {getTokenDisplay(token)}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
