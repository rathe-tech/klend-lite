const SVG_NS = "http://www.w3.org/2000/svg";

interface Point {
  x: number;
  y: number;
}

interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface BoundBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface PlotterSettings {
  points: Point[];
  x: number;

  chartPosition?: Rect;
  curvePadding?: Rect;
  curveWidth?: number;
  curveColor?: string;

  pointRadius?: number;
  pointColor?: string;

  cursorRadius?: number;
  cursorColor?: string;

  horizontalAxisCount?: number;
  verticalAxisCount?: number;
  axisColor?: string;

  xLabelFormatter?: (value: number) => string;
  yLabelFormatter?: (value: number) => string;
  xLabelOffset?: number;
  yLabelOffset?: number;
  labelFontSize?: string;
  labelColor?: string;

  xLegendText?: string;
  yLegendText?: string;
  xLegendOffset?: number;
  yLegendOffset?: number;
  legendFontSize?: string;
  legendColor?: string;

  tooltipFormatter?: (point: Point) => { x: string, y: string };
  tooltipXLabelText?: string;
  tooltipYLabelText?: string;
  tooltipFontSize?: string;
  tooltipLabelColor?: string;
  tooltipValueColor?: string;
  tooltipBackgroundColor?: string;
  tooltipBorderColor?: string;

  fontFamily?: string;
}

export class Plotter {
  #settings: PlotterSettings;

  #container: HTMLElement;
  #plot: SVGSVGElement;
  #vAxises: SVGLineElement[];
  #hAxises: SVGLineElement[];
  #xLabels: SVGTextElement[];
  #yLabels: SVGTextElement[];
  #xLegend: SVGTextElement;
  #yLegend: SVGTextElement;
  #curve: SVGPolylineElement;
  #point: SVGCircleElement;
  #cursor: SVGCircleElement;

  #pointTooltip: Tooltip;
  #cursorTooltip: Tooltip;

  #observer: ResizeObserver;
  #parent: HTMLElement | null = null;

  #pointCoord: Point = { x: 0, y: 0 };
  #chartGizmo: BoundBox = { x1: 0, y1: 0, x2: 0, y2: 0 };
  #curveGizmo: BoundBox = { x1: 0, y1: 0, x2: 0, y2: 0 };

  get #points() { return this.#settings.points; }
  get #x() { return this.#settings.x; }
  get #chartPosition() { return this.#settings.chartPosition ?? Plotter.#defaults.chartPosition; }
  get #curvePadding() { return this.#settings.curvePadding ?? Plotter.#defaults.curvePadding; }
  get #curveWidth() { return this.#settings.curveWidth ?? Plotter.#defaults.curveWidth; }
  get #curveColor() { return this.#settings.curveColor ?? Plotter.#defaults.curveColor; }
  get #pointRadius() { return this.#settings.pointRadius ?? Plotter.#defaults.pointRadius; }
  get #pointColor() { return this.#settings.pointColor ?? Plotter.#defaults.pointColor; }
  get #cursorRadius() { return this.#settings.cursorRadius ?? Plotter.#defaults.cursorRadius; }
  get #cursorColor() { return this.#settings.cursorColor ?? Plotter.#defaults.cursorColor; }
  get #vAxisCount() { return this.#settings.verticalAxisCount ?? Plotter.#defaults.verticalAxisCount; }
  get #hAxisCount() { return this.#settings.horizontalAxisCount ?? Plotter.#defaults.horizontalAxisCount; }
  get #axisColor() { return this.#settings.axisColor ?? Plotter.#defaults.axisColor; }
  get #xLabelFormatter() { return this.#settings.xLabelFormatter ?? Plotter.#defaults.xLabelFormatter; }
  get #yLabelFormatter() { return this.#settings.yLabelFormatter ?? Plotter.#defaults.yLabelFormatter; }
  get #xLabelOffset() { return this.#settings.xLabelOffset ?? Plotter.#defaults.xLabelOffset; }
  get #yLabelOffset() { return this.#settings.yLabelOffset ?? Plotter.#defaults.yLabelOffset; }
  get #labelFontSize() { return this.#settings.labelFontSize ?? Plotter.#defaults.labelFontSize; }
  get #labelColor() { return this.#settings.labelColor ?? Plotter.#defaults.labelColor; }
  get #xLegendText() { return this.#settings.xLegendText ?? Plotter.#defaults.xLegendText; }
  get #xLegendOffset() { return this.#settings.xLegendOffset ?? Plotter.#defaults.xLegendOffset; }
  get #yLegendText() { return this.#settings.yLegendText ?? Plotter.#defaults.yLegendText; }
  get #yLegendOffset() { return this.#settings.yLegendOffset ?? Plotter.#defaults.yLegendOffset; }
  get #legendFontSize() { return this.#settings.legendFontSize ?? Plotter.#defaults.legendFontSize; }
  get #legendColor() { return this.#settings.legendColor ?? Plotter.#defaults.legendColor; }
  get #tooltipFormatter() { return this.#settings.tooltipFormatter ?? Plotter.#defaults.tooltipFormatter; }
  get #tooltipXLabelText() { return this.#settings.tooltipXLabelText ?? Plotter.#defaults.tooltipXLabelText; }
  get #tooltipYLabelText() { return this.#settings.tooltipYLabelText ?? Plotter.#defaults.tooltipYLabelText; }
  get #tooltipFontSize() { return this.#settings.tooltipFontSize ?? Plotter.#defaults.tooltipFontSize; }
  get #tooltipLabelColor() { return this.#settings.tooltipLabelColor ?? Plotter.#defaults.tooltipLabelColor; }
  get #tooltipValueColor() { return this.#settings.tooltipValueColor ?? Plotter.#defaults.tooltipValueColor; }
  get #tooltipBackgroundColor() { return this.#settings.tooltipBackgroundColor ?? Plotter.#defaults.tooltipBackgroundColor; }
  get #tooltipBorderColor() { return this.#settings.tooltipBorderColor ?? Plotter.#defaults.tooltipBorderColor; }
  get #fontFamily() { return this.#settings.fontFamily ?? Plotter.#defaults.fontFamily; }

  public constructor(settings: PlotterSettings) {
    this.#settings = settings;
    this.#container = Plotter.#createContainer();
    this.#plot = Plotter.#createPlot(this.#container);
    this.#vAxises = Plotter.#createAxises(this.#vAxisCount, this.#axisColor, this.#plot);
    this.#hAxises = Plotter.#createAxises(this.#hAxisCount, this.#axisColor, this.#plot);
    this.#xLabels = Plotter.#createXLabels(this.#vAxisCount, this.#fontFamily, this.#labelFontSize, this.#labelColor, this.#plot);
    this.#yLabels = Plotter.#createYLabels(this.#hAxisCount, this.#fontFamily, this.#labelFontSize, this.#labelColor, this.#plot);
    this.#xLegend = Plotter.#createXLegend(this.#xLegendText, this.#fontFamily, this.#legendFontSize, this.#legendColor, this.#plot);
    this.#yLegend = Plotter.#createYLegend(this.#yLegendText, this.#fontFamily, this.#legendFontSize, this.#legendColor, this.#plot);
    this.#curve = Plotter.#createCurve(this.#curveWidth, this.#curveColor, this.#plot);
    this.#point = Plotter.#createPoint(this.#pointRadius, this.#pointColor, false, this.#plot);
    this.#cursor = Plotter.#createPoint(this.#cursorRadius, this.#cursorColor, true, this.#plot);
    this.#pointTooltip = new Tooltip(this.#prepareTooltipSettings());
    this.#cursorTooltip = new Tooltip(this.#prepareTooltipSettings(true));
    this.#observer = new ResizeObserver(([{ contentRect: { width, height } }]) => this.#render(width, height));
    this.#refresh();
  }

  #prepareTooltipSettings(hidden: boolean = false): TooltipSettings {
    return {
      parent: this.#container,
      xLabelText: this.#tooltipXLabelText,
      yLabelText: this.#tooltipYLabelText,
      labelColor: this.#tooltipLabelColor,
      valueColor: this.#tooltipValueColor,
      formatter: this.#tooltipFormatter,
      fontSize: this.#tooltipFontSize,
      fontFamily: this.#fontFamily,
      backgroundColor: this.#tooltipBackgroundColor,
      borderColor: this.#tooltipBorderColor,
      hidden,
    };
  }

  #onPointerMove = ({ offsetX: x }: PointerEvent) => {
    const { x1: chartX1, x2: chartX2, y1: chartY1, y2: chartY2 } = this.#chartGizmo;
    const { x1: curveX1, x2: curveX2, y1: curveY1, y2: curveY2 } = this.#curveGizmo;
    const firstPoint = this.#points[0];

    const chartWidth = chartX2 - chartX1;
    const curveWidth = curveX2 - curveX1;
    const xScale = chartWidth / curveWidth;
    const xOffset = chartX1 + (this.#curvePadding.left - firstPoint.x) * xScale;

    const chartHeight = chartY2 - chartY1;
    const curveHeight = curveY2 - curveY1;
    const yScale = chartHeight / curveHeight
    const yOffset = chartY2 - (this.#curvePadding.bottom - firstPoint.y) * yScale;

    // Translate screen X coord to data space.
    const xProbe = (x - xOffset) / xScale;
    const yProbe = Plotter.#trace(this.#points, xProbe);

    if (yProbe == null) {
      this.#cursor.setAttribute("visibility", "hidden");
      this.#pointTooltip.opacity = 1;
      this.#cursorTooltip.hide();
    } else {
      const y = yOffset - yProbe * yScale;
      this.#cursor.removeAttribute("visibility");
      Plotter.#updatePointCoords(this.#cursor, x, y);
      this.#pointTooltip.opacity = 0.6;

      const xMin = this.#points[0].x;
      const xMax = this.#points[this.#points.length - 1].x;
      const xProgress = (xProbe - xMin) / (xMax - xMin);
      const positionAnchor = xProgress > 0.5 ? PositionAnchor.Left : PositionAnchor.Right;

      this.#cursorTooltip.show();
      this.#cursorTooltip.positionAnchor = positionAnchor;
      this.#cursorTooltip.updatePoint({ x: xProbe, y: yProbe });
      this.#cursorTooltip.updatePosition(x, y, this.#chartGizmo);
    }
  };

  #onPointerLeave = () => {
    this.#cursor.setAttribute("visibility", "hidden");
    this.#pointTooltip.opacity = 1;
    this.#cursorTooltip.hide();
  };

  public mount(parent: HTMLElement) {
    if (this.#parent != null) {
      throw new Error("Already mounted");
    }

    this.#parent = parent;
    this.#observer.observe(this.#container);
    this.#plot.addEventListener("pointermove", this.#onPointerMove);
    this.#plot.addEventListener("pointerleave", this.#onPointerLeave);
    this.#parent.appendChild(this.#container);
  }

  public unmount() {
    if (this.#parent == null) {
      throw new Error("Already unmounted");
    }

    this.#observer.unobserve(this.#container);
    this.#plot.removeEventListener("pointermove", this.#onPointerMove);
    this.#plot.removeEventListener("pointerleave", this.#onPointerLeave);
    this.#parent.removeChild(this.#container);
  }

  public update(points: Point[], x: number) {
    this.#settings.points = points;
    this.#settings.x = x;

    this.#refresh();
    this.#render(this.#container.clientWidth, this.#container.clientHeight);
  }

  #refresh() {
    this.#refreshCurveGizmo();
    this.#refreshLabels();
    this.#refreshPointCoordAndTooltip();
  }

  #refreshCurveGizmo() {
    const xMin = this.#points[0].x;
    const xMax = this.#points[this.#points.length - 1].x;

    const sorted = this.#points.map(p => p).sort((l, r) => l.y - r.y);
    const yMin = sorted[0].y;
    const yMax = sorted[sorted.length - 1].y;

    const { left, right, top, bottom } = this.#curvePadding;
    this.#curveGizmo.x1 = xMin - left;
    this.#curveGizmo.x2 = xMax + right;
    this.#curveGizmo.y1 = yMin - bottom;
    this.#curveGizmo.y2 = yMax + top;
  }

  #refreshLabels() {
    const { x1, x2, y1, y2 } = this.#curveGizmo;

    this.#xLabels[0].textContent = this.#xLabelFormatter(x1);
    this.#xLabels[this.#vAxisCount - 1].textContent = this.#xLabelFormatter(x2);
    const xStep = (x2 - x1) / (this.#vAxisCount - 1);
    for (let i = 1; i < this.#vAxisCount - 1; i++) {
      const value = x1 + xStep * i;
      this.#xLabels[i].textContent = this.#xLabelFormatter(value);
    }

    this.#yLabels[0].textContent = this.#yLabelFormatter(y1);
    this.#yLabels[this.#hAxisCount - 1].textContent = this.#yLabelFormatter(y2);
    const yStep = (y2 - y1) / (this.#hAxisCount - 1);
    for (let i = 1; i < this.#hAxisCount - 1; i++) {
      const value = y1 + yStep * i;
      this.#yLabels[i].textContent = this.#yLabelFormatter(value);
    }
  }

  #refreshPointCoordAndTooltip() {
    const y = Plotter.#trace(this.#points, this.#x) ?? 0;
    this.#pointCoord.x = this.#x;
    this.#pointCoord.y = y;
    this.#pointTooltip.updatePoint(this.#pointCoord);
  }

  #render(width: number, height: number) {
    this.#refreshChartGizmo(width, height);
    this.#renderAxisesAndLabels();
    this.#renderLegends();
    this.#renderCurveAndPoint();
  }

  #refreshChartGizmo(width: number, height: number) {
    const { left, right, top, bottom } = this.#chartPosition;
    this.#chartGizmo.x1 = left;
    this.#chartGizmo.y1 = top;
    this.#chartGizmo.x2 = width - right;
    this.#chartGizmo.y2 = height - bottom;
  }

  #renderAxisesAndLabels() {
    const { x1, y1, x2, y2 } = this.#chartGizmo;
    const xStep = (x2 - x1) / (this.#vAxisCount - 1);
    const yStep = (y2 - y1) / (this.#hAxisCount - 1);

    Plotter.#updateLineCoords(this.#hAxises[0], x1, y2, x2, y2);
    Plotter.#updateTextCoords(this.#yLabels[0], x1 - this.#yLabelOffset, y2);
    for (let i = 1; i < this.#hAxisCount - 1; i++) {
      const y = y2 - yStep * i;
      Plotter.#updateLineCoords(this.#hAxises[i], x1, y, x2, y);
      Plotter.#updateTextCoords(this.#yLabels[i], x1 - this.#yLabelOffset, y);
    }
    Plotter.#updateLineCoords(this.#hAxises[this.#hAxisCount - 1], x1, y1, x2, y1);
    Plotter.#updateTextCoords(this.#yLabels[this.#hAxisCount - 1], x1 - this.#yLabelOffset, y1);

    Plotter.#updateLineCoords(this.#vAxises[0], x1, y1, x1, y2);
    Plotter.#updateTextCoords(this.#xLabels[0], x1, y2 + this.#xLabelOffset);
    for (let i = 1; i < this.#vAxisCount - 1; i++) {
      const x = x1 + xStep * i;
      Plotter.#updateLineCoords(this.#vAxises[i], x, y1, x, y2);
      Plotter.#updateTextCoords(this.#xLabels[i], x, y2 + this.#xLabelOffset);
    }
    Plotter.#updateLineCoords(this.#vAxises[this.#vAxisCount - 1], x2, y1, x2, y2);
    Plotter.#updateTextCoords(this.#xLabels[this.#vAxisCount - 1], x2, y2 + this.#xLabelOffset);
  }

  #renderLegends() {
    const { x1, y1, x2, y2 } = this.#chartGizmo;
    Plotter.#updateTextCoords(this.#xLegend, (x1 + x2) / 2, y2 + this.#xLegendOffset);
    Plotter.#updateTextCoords(this.#yLegend, x1 - this.#yLegendOffset, (y1 + y2) / 2);
  }

  #renderCurveAndPoint() {
    const { x1: chartX1, x2: chartX2, y1: chartY1, y2: chartY2 } = this.#chartGizmo;
    const { x1: curveX1, x2: curveX2, y1: curveY1, y2: curveY2 } = this.#curveGizmo;
    const firstPoint = this.#points[0];

    const chartWidth = chartX2 - chartX1;
    const curveWidth = curveX2 - curveX1;
    const xScale = chartWidth / curveWidth;
    const xOffset = chartX1 + (this.#curvePadding.left - firstPoint.x) * xScale;

    const chartHeight = chartY2 - chartY1;
    const curveHeight = curveY2 - curveY1;
    const yScale = chartHeight / curveHeight
    const yOffset = chartY2 - (this.#curvePadding.bottom - firstPoint.y) * yScale;

    const points = this.#points.map(p => {
      const x = p.x * xScale + xOffset;
      const y = yOffset - p.y * yScale;
      return `${x},${y}`;
    }).join(" ");
    this.#curve.setAttribute("points", points);

    const px = this.#pointCoord.x * xScale + xOffset;
    const py = yOffset - this.#pointCoord.y * yScale;
    Plotter.#updatePointCoords(this.#point, px, py);

    this.#pointTooltip.updatePosition(px, py, this.#chartGizmo);
  }

  static #createContainer() {
    const container = document.createElement("div");
    container.style.position = "relative";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.boxSizing = "border-box";
    container.style.userSelect = "none";
    return container;
  }

  static #createPlot(container: HTMLElement) {
    const plot = document.createElementNS(SVG_NS, "svg");
    plot.style.width = "100%";
    plot.style.height = "100%";
    container.appendChild(plot);
    return plot;
  }

  static #createAxises(count: number, color: string, plot: SVGSVGElement) {
    return Array.from({ length: count }, (_, i) => {
      const axis = document.createElementNS(SVG_NS, "line");
      axis.setAttribute("stroke", color);
      if (i !== 0) axis.setAttribute("stroke-dasharray", "1 3");
      plot.appendChild(axis);
      return axis;
    });
  }

  static #createXLabels(count: number, fontFamily: string, fontSize: string, color: string, plot: SVGSVGElement) {
    return Array.from({ length: count }, () => {
      const label = document.createElementNS(SVG_NS, "text");
      label.setAttribute("font-family", fontFamily);
      label.setAttribute("font-size", fontSize);
      label.setAttribute("fill", color);
      label.setAttribute("dominant-baseline", "hanging");
      label.setAttribute("text-anchor", "middle");
      label.textContent = "100%";
      plot.appendChild(label);
      return label;
    });
  }

  static #createYLabels(count: number, fontFamily: string, fontSize: string, color: string, plot: SVGSVGElement) {
    return Array.from({ length: count }, () => {
      const label = document.createElementNS(SVG_NS, "text");
      label.setAttribute("font-family", fontFamily);
      label.setAttribute("font-size", fontSize);
      label.setAttribute("fill", color);
      label.setAttribute("dominant-baseline", "middle");
      label.setAttribute("text-anchor", "end");
      label.textContent = "100%";
      plot.appendChild(label);
      return label;
    });
  }

  static #createXLegend(text: string, fontFamily: string, fontSize: string, color: string, plot: SVGSVGElement) {
    const legend = document.createElementNS(SVG_NS, "text");
    legend.textContent = text;
    legend.setAttribute("font-family", fontFamily);
    legend.setAttribute("font-size", fontSize);
    legend.setAttribute("fill", color);
    legend.setAttribute("dominant-baseline", "hanging");
    legend.setAttribute("text-anchor", "middle");
    plot.appendChild(legend);
    return legend;
  }

  static #createYLegend(text: string, fontFamily: string, fontSize: string, color: string, plot: SVGSVGElement) {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const legend = document.createElementNS(SVG_NS, "text");
    if (isSafari) legend.style.display = "none"; // Safari SVG rotation doesn't work.
    legend.style.transformBox = "fill-box"; // Adjust origin
    legend.textContent = text;
    legend.setAttribute("font-family", fontFamily);
    legend.setAttribute("font-size", fontSize);
    legend.setAttribute("fill", color);
    legend.setAttribute("dominant-baseline", "middle");
    legend.setAttribute("text-anchor", "middle");
    legend.setAttribute("transform-origin", "center");
    legend.setAttribute("transform", "rotate(-90)");
    plot.appendChild(legend);
    return legend;
  }

  static #createCurve(width: number, color: string, plot: SVGSVGElement) {
    const curve = document.createElementNS(SVG_NS, "polyline");
    curve.setAttribute("stroke", color);
    curve.setAttribute("stroke-width", <any>width);
    curve.setAttribute("fill", "transparent");
    plot.appendChild(curve);
    return curve;
  }

  static #createPoint(radius: number, color: string, hidden: boolean, plot: SVGSVGElement) {
    const point = document.createElementNS(SVG_NS, "circle");
    point.setAttribute("fill", color);
    point.setAttribute("r", <any>radius);
    if (hidden) point.setAttribute("visibility", "hidden");
    plot.appendChild(point);
    return point;
  }

  static #updateLineCoords(line: SVGLineElement, x1: number, y1: number, x2: number, y2: number) {
    line.setAttribute("x1", <any>x1);
    line.setAttribute("y1", <any>y1);
    line.setAttribute("x2", <any>x2);
    line.setAttribute("y2", <any>y2);
  }

  static #updateTextCoords(text: SVGTextElement, x: number, y: number) {
    text.setAttribute("x", <any>x);
    text.setAttribute("y", <any>y);
  }

  static #updatePointCoords(point: SVGCircleElement, x: number, y: number) {
    point.setAttribute("cx", <any>x);
    point.setAttribute("cy", <any>y);
  }

  static #trace(points: Point[], xProbe: number) {
    for (let i = 0; i < points.length - 1; i++) {
      const { x: x1, y: y1 } = points[i];
      const { x: x2, y: y2 } = points[i + 1];
      if (xProbe >= x1 && xProbe <= x2) {
        return Plotter.#interpolate(x1, y1, x2, y2, xProbe);
      }
    }
  }

  static #interpolate(x1: number, y1: number, x2: number, y2: number, x: number) {
    return y1 + (x - x1) * ((y2 - y1) / (x2 - x1));
  }

  static #defaults = {
    chartPosition: { left: 60, right: 20, top: 20, bottom: 40 },
    curvePadding: { left: 0, right: 0, top: 0, bottom: 0 },
    curveWidth: 2,
    curveColor: "white",
    // Point settings
    pointRadius: 5,
    pointColor: "green",
    // Cursor setting
    cursorRadius: 5,
    cursorColor: "yellow",
    // Axis settings
    verticalAxisCount: 5,
    horizontalAxisCount: 5,
    axisColor: "grey",
    // Label settings
    xLabelFormatter: (value: number) => `${value.toFixed(2)}`,
    yLabelFormatter: (value: number) => `${value.toFixed(2)}`,
    xLabelOffset: 7,
    yLabelOffset: 7,
    labelFontSize: "10px",
    labelColor: "grey",
    // Legend settings
    xLegendText: "Axis X",
    xLegendOffset: 23,
    yLegendText: "Axis Y",
    yLegendOffset: 45,
    legendFontSize: "12px",
    legendColor: "white",
    // Tooltip settings
    tooltipFormatter: ({ x, y }: Point) => <{ x: string, y: string }>({ x: `${x.toFixed(2)}`, y: `${y.toFixed(2)}` }),
    tooltipXLabelText: "X",
    tooltipYLabelText: "Y",
    tooltipFontSize: "12px",
    tooltipLabelColor: "grey",
    tooltipValueColor: "white",
    tooltipBackgroundColor: "black",
    tooltipBorderColor: "#404040",
    // Rest settings
    fontFamily: "monospace",
  };
}

interface TooltipSettings {
  parent: HTMLElement;
  xLabelText: string;
  yLabelText: string;
  labelColor: string;
  valueColor: string;
  formatter: (point: Point) => { x: string, y: string };
  fontFamily: string;
  fontSize: string;
  backgroundColor: string;
  borderColor: string;
  hidden: boolean;
}

enum PositionAnchor {
  Left,
  Right,
  Top,
  Bottom,
}

class Tooltip {
  #parent: HTMLElement;
  #root: HTMLElement;

  #xSection: HTMLElement;
  #ySection: HTMLElement;

  #xLabel: HTMLElement;
  #yLabel: HTMLElement;

  #xValue: HTMLElement;
  #yValue: HTMLElement;

  #formatter: (point: Point) => { x: string, y: string };

  #positionAnchor = PositionAnchor.Top;
  public get positionAnchor() { return this.#positionAnchor; }
  public set positionAnchor(value: PositionAnchor) { this.#positionAnchor = value; }

  public constructor({
    parent,
    xLabelText,
    yLabelText,
    labelColor,
    valueColor,
    formatter,
    fontFamily,
    fontSize,
    backgroundColor,
    borderColor,
    hidden,
  }: TooltipSettings) {
    this.#root = document.createElement("div");
    this.#root.style.fontFamily = fontFamily;
    this.#root.style.fontSize = fontSize;
    this.#root.style.display = "flex";
    this.#root.style.flexDirection = "column";
    this.#root.style.lineHeight = "150%";
    this.#root.style.whiteSpace = "pre";
    this.#root.style.position = "fixed";
    this.#root.style.zIndex = <any>100;
    this.#root.style.padding = "0.5em 0.75em";
    this.#root.style.backgroundColor = backgroundColor;
    this.#root.style.boxSizing = "border-box";
    this.#root.style.border = `1px solid ${borderColor}`;
    this.#root.style.borderRadius = "4px";
    this.#root.style.pointerEvents = "none";
    this.#root.style.userSelect = "none";

    this.#parent = parent;
    this.#parent.appendChild(this.#root);

    this.#xSection = document.createElement("div");
    this.#ySection = document.createElement("div");
    this.#xSection.style.display = "flex";
    this.#ySection.style.display = "flex";
    this.#xSection.style.columnGap = "4px";
    this.#ySection.style.columnGap = "4px";
    this.#root.appendChild(this.#xSection);
    this.#root.appendChild(this.#ySection);

    this.#xLabel = document.createElement("div");
    this.#yLabel = document.createElement("div");
    this.#xLabel.textContent = `${xLabelText}:`;
    this.#yLabel.textContent = `${yLabelText}:`;
    this.#xLabel.style.color = labelColor;
    this.#yLabel.style.color = labelColor;
    this.#xLabel.style.flex = <any>1;
    this.#yLabel.style.flex = <any>1;
    this.#xSection.appendChild(this.#xLabel);
    this.#ySection.appendChild(this.#yLabel);

    this.#xValue = document.createElement("div");
    this.#yValue = document.createElement("div");
    this.#xValue.style.color = valueColor;
    this.#yValue.style.color = valueColor;
    this.#xSection.appendChild(this.#xValue);
    this.#ySection.appendChild(this.#yValue);

    this.#formatter = formatter;
    if (hidden) this.hide();
  }

  public updatePoint(point: Point) {
    const { x, y } = this.#formatter(point);
    this.#xValue.textContent = x;
    this.#yValue.textContent = y;
  }

  public updatePosition(x: number, y: number, constraint: BoundBox) {
    switch (this.#positionAnchor) {
      case PositionAnchor.Top:
        this.#updatePositionTopOrBottom(x, y, true, constraint);
        break;
      case PositionAnchor.Bottom:
        this.#updatePositionTopOrBottom(x, y, false, constraint);
        break;
      case PositionAnchor.Left:
        this.#updatePositionLeftOrRight(x, y, true);
        break;
      case PositionAnchor.Right:
        this.#updatePositionLeftOrRight(x, y, false);
        break;
      default:
        throw new Error(`Unsupported position anchor: ${this.#positionAnchor}`);
    }
  }

  #updatePositionTopOrBottom(x: number, y: number, isTop: boolean, constraint: BoundBox) {
    const { left, top } = this.#parent.getBoundingClientRect();
    const { offsetWidth: width, offsetHeight: height } = this.#root;
    const halfWidth = width / 2;

    const xMin = left + constraint.x1;
    const xMax = left + constraint.x2;

    const x1 = left + x - halfWidth;
    const x2 = x1 + width;

    const x1Offset = (x1 < xMin) ? xMin - x1 : 0;
    const x2Offset = (x2 > xMax) ? xMax - x2 : 0;

    const xOffset = x1Offset + x2Offset;
    const yOffset = isTop ? (-height - 10) : 10;

    const xOrigin = Math.max(xMin, x1 + xOffset);
    const yOrigin = top + y + yOffset;

    this.#root.style.left = `${xOrigin}px`;
    this.#root.style.top = `${yOrigin}px`;
  }

  #updatePositionLeftOrRight(x: number, y: number, isLeft: boolean) {
    const { left, top } = this.#parent.getBoundingClientRect();
    const { offsetWidth: width, offsetHeight: height } = this.#root;
    const halfHeight = height / 2;

    const xOffset = isLeft ? (-width - 10) : 10;
    const xOrigin = left + x + xOffset;
    const yOrigin = top + y - halfHeight;

    this.#root.style.left = `${xOrigin}px`;
    this.#root.style.top = `${yOrigin}px`;
  }

  public set opacity(value: number) {
    this.#root.style.opacity = <any>value;
  }

  public hide() {
    this.#root.style.visibility = "hidden";
  }

  public show() {
    this.#root.style.visibility = "visible";
  }
}