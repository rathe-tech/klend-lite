import { useMemo } from "react";
import { useMarket } from "@components/market-context";

export function useRefreshState() {
  const { slotState, marketState, obligationState, tokenBalancesState, refresh } = useMarket();
  const state = useMemo<RefreshState>(() => {
    if (slotState.isFetching || marketState.isFetching) {
      return RefreshState.MarketProgress;
    } else if (obligationState.isFetching) {
      return RefreshState.ObligationProgress;
    } else if (tokenBalancesState.isFetching) {
      return RefreshState.TokenBalancesProgress;
    } else {
      return RefreshState.Idle;
    }
  }, [slotState, marketState, obligationState, tokenBalancesState]);

  return { state, refresh };
}

type RefreshState =
  | { kind: "Idle" }
  | { kind: "Progress", target: "Market" | "Obligation" | "TokenBalances" };
type IdleState = Extract<RefreshState, { kind: "Idle" }>;
type ProgressState = Exclude<RefreshState, IdleState>;

export module RefreshState {
  export const Idle: RefreshState = { kind: "Idle" };
  export const MarketProgress: RefreshState = { kind: "Progress", target: "Market" };
  export const ObligationProgress: RefreshState = { kind: "Progress", target: "Obligation" };
  export const TokenBalancesProgress: RefreshState = { kind: "Progress", target: "TokenBalances" };

  export function isInIdle(state: RefreshState): state is IdleState {
    return state.kind === "Idle";
  }

  export function isInProgress(state: RefreshState): state is ProgressState {
    return !isInIdle(state);
  }

  export function humanize(state: RefreshState) {
    if (isInProgress(state)) {
      switch (state.target) {
        case "Market":
          return "Fetching market...";
        case "Obligation":
          return "Fetching account...";
        case "TokenBalances":
          return "Fetching wallet...";
      }
    } else {
      return "Refresh";
    }
  }
}