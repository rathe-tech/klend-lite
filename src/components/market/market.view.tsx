import { MarketProvider, useMarket } from "@components/market-context";
import { MarketSelect } from "@components/market-select";
import { Section } from "@components/section";
import { Reserves } from "@components/reserves";
import { Obligation } from "@components/obligation";
import { ObligationStats } from "@components/obligation-stats";
import { ActionFormProvider } from "@components/action-dialog";

import { RefreshButton } from "./refresh-button";
import * as css from "./market.css";

export const Market = () =>
  <MarketProvider>
    <MarketSelect />
    <Section.Body>
      <Content />
    </Section.Body>
  </MarketProvider>

const Content = () => {
  const { hasError } = useMarket();

  if (hasError()) {
    return (
      <div>
        Some data could not be fetched. Please reload the page.
      </div>
    );
  }

  return (
    <ActionFormProvider>
      <div className={css.statsContainer}>
        <ObligationStats />
        <RefreshButton />
      </div>
      <Obligation />
      <Reserves />
    </ActionFormProvider>
  );
};