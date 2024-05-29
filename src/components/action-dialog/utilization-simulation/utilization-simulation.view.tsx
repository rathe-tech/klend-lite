import { useEffect, useRef } from "react";
import { PublicKey } from "@solana/web3.js";
import { KaminoReserve } from "@kamino-finance/klend-sdk";

import { vars } from "@theme/vars.css";
import { Assert } from "@misc/utils";
import { useMarket } from "@components/market-context";

import { Plotter, PlotterSettings } from "./plotter";
import * as css from "./utilization-simulation.css";

export const UtilizationSimulation = ({
  mintAddress,
}: {
  mintAddress: PublicKey,
}) => {
  const { marketState: { data: market } } = useMarket();
  Assert.some(market, "Market not loaded");
  const reserve = market.getReserveByMint(mintAddress);
  Assert.some(reserve, "Reserve not found");

  const rootRef = useRef<HTMLDivElement | null>(null);
  const plotterRef = useRef<Plotter | null>(null);

  useEffect(() => {
    if (plotterRef.current == null) {
      const settings = preparePlotterSettings(reserve);
      plotterRef.current = new Plotter(settings);
      plotterRef.current.mount(rootRef.current!);
    } else {
      const { points, x } = extractData(reserve);
      plotterRef.current.update(points, x);
    }
  }, [reserve]);

  useEffect(() => {
    return () => {
      if (plotterRef.current) {
        plotterRef.current.unmount();
        plotterRef.current = null;
      }
    };
  }, []);

  return (
    <div className={css.root} ref={rootRef} />
  );
}

function preparePlotterSettings(reserve: KaminoReserve): PlotterSettings {
  const { points, x } = extractData(reserve);
  // y bottom padding to ensure chart min y = 0.
  const yMin = Math.min(...points.map(p => p.y));

  return {
    points,
    x,
    curvePadding: { left: 0, right: 0, top: 0.1, bottom: yMin },
    axisColor: vars.color.borderPrimary,

    pointColor: vars.color.accentColor,
    cursorColor: "blue",

    xLabelFormatter: x => `${(x * 100).toFixed(0)}%`,
    yLabelFormatter: y => `${(y * 100).toFixed(0)}%`,
    labelColor: vars.color.labelSecondary,

    xLegendText: "Utilization",
    yLegendText: "Borrow APR",
    legendColor: vars.color.labelPrimary,

    tooltipXLabelText: "Utilization",
    tooltipYLabelText: "Borrow APR",
    tooltipFormatter: p => ({ x: `${(p.x * 100).toFixed(2)}%`, y: `${(p.y * 100).toFixed(2)}%` }),
    tooltipLabelColor: vars.color.labelSecondary,
    tooltipValueColor: vars.color.labelPrimary,
    tooltipBorderColor: vars.color.borderPrimary,
    tooltipBackgroundColor: vars.color.backgroundPrimary,
  };
}

function extractData(reserve: KaminoReserve) {
  const points = reserve.stats.borrowCurve.map(([x, y]) => ({ x, y }));
  const x = reserve.calculateUtilizationRatio();
  return { points, x };
}