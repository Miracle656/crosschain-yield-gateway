import { AVAILABLE_POOLS, TOKENS } from './tokens';

export function canSwapDirectly(from: string, to: string): boolean {
  // Only WPC pairs exist
  if ((from === "WPC" || to === "WPC") && from !== to) {
    // Check if this pool exists
    return AVAILABLE_POOLS.some(
      pool =>
        (pool.token0 === from && pool.token1 === to) ||
        (pool.token0 === to && pool.token1 === from)
    );
  }
  return false;
}

export function getSwapRoute(fromSymbol: string, toSymbol: string) {
  // PC ↔ WPC (wrap/unwrap)
  if ((fromSymbol === "PC" && toSymbol === "WPC") || 
      (fromSymbol === "WPC" && toSymbol === "PC")) {
    return {
      hops: [fromSymbol, toSymbol],
      method: fromSymbol === "PC" ? "wrap" : "unwrap",
      needsSwap: false
    };
  }

  // Direct WPC pair
  if (canSwapDirectly(fromSymbol, toSymbol)) {
    return {
      hops: [fromSymbol, toSymbol],
      method: "directSwap",
      needsSwap: true,
      fee: 500 // All pools use 500
    };
  }

  // Multi-hop: Token → WPC → Token or PC → WPC → Token
  if (fromSymbol === "PC") {
    return {
      hops: ["PC", "WPC", toSymbol],
      method: "multiHop",
      needsSwap: true,
      fee: 500
    };
  }

  if (toSymbol === "PC") {
    return {
      hops: [fromSymbol, "WPC", "PC"],
      method: "multiHop",
      needsSwap: true,
      fee: 500
    };
  }

  // Token → WPC → Token
  return {
    hops: [fromSymbol, "WPC", toSymbol],
    method: "multiHop",
    needsSwap: true,
    fee: 500
  };
}