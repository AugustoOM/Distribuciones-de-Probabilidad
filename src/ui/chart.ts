import type { DistributionDefinition, ParameterValues, ProbabilityResult } from "../types/distributions";
import { createContinuousMath } from "../math/continuous";
import { createDiscreteMath } from "../math/discrete";
import { formatNumber } from "../utils/format";

interface ChartTheme {
  axis: string;
  grid: string;
  text: string;
  primary: string;
  shaded: string;
  muted: string;
}

function getTheme(): ChartTheme {
  const styles = getComputedStyle(document.documentElement);
  return {
    axis: styles.getPropertyValue("--chart-axis").trim(),
    grid: styles.getPropertyValue("--chart-grid").trim(),
    text: styles.getPropertyValue("--text-muted").trim(),
    primary: styles.getPropertyValue("--accent").trim(),
    shaded: styles.getPropertyValue("--accent-soft").trim(),
    muted: styles.getPropertyValue("--bar-muted").trim()
  };
}

function clear(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.clearRect(0, 0, width, height);
}

export function renderEmptyChart(canvas: HTMLCanvasElement, message: string): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  const { width, height } = canvas;
  clear(ctx, width, height);
  ctx.fillStyle = getTheme().text;
  ctx.font = "28px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(message, width / 2, height / 2);
}

export function renderChart(
  canvas: HTMLCanvasElement,
  distribution: DistributionDefinition,
  params: ParameterValues,
  result: ProbabilityResult
): void {
  if (distribution.kind === "continuous") {
    renderContinuous(canvas, distribution, params, result);
  } else {
    renderDiscrete(canvas, distribution, params, result);
  }
}

function renderContinuous(
  canvas: HTMLCanvasElement,
  distribution: DistributionDefinition,
  params: ParameterValues,
  result: ProbabilityResult
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const theme = getTheme();
  const { width, height } = canvas;
  const padding = { top: 42, right: 48, bottom: 68, left: 76 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const math = createContinuousMath(distribution, params);
  const [minX, maxX] = math.domain;
  const samples = 420;
  const points = Array.from({ length: samples }, (_, index) => {
    const x = minX + (index / (samples - 1)) * (maxX - minX);
    const y = math.pdf(x);
    return { x, y: Number.isFinite(y) ? y : 0 };
  });
  const maxY = Math.max(...points.map((point) => point.y), 1e-8) * 1.12;
  const xToPixel = (x: number) => padding.left + ((x - minX) / (maxX - minX)) * plotWidth;
  const yToPixel = (y: number) => padding.top + plotHeight - (y / maxY) * plotHeight;

  clear(ctx, width, height);
  drawGrid(ctx, width, height, padding, theme, minX, maxX, maxY);

  ctx.fillStyle = theme.shaded;
  for (const range of result.shadedRanges) {
    const start = Math.max(minX, range.start);
    const end = Math.min(maxX, range.end);
    if (start >= end) {
      continue;
    }
    ctx.beginPath();
    ctx.moveTo(xToPixel(start), yToPixel(0));
    const shadedPoints = points.filter((point) => point.x >= start && point.x <= end);
    for (const point of shadedPoints) {
      ctx.lineTo(xToPixel(point.x), yToPixel(point.y));
    }
    ctx.lineTo(xToPixel(end), yToPixel(0));
    ctx.closePath();
    ctx.fill();
  }

  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 4;
  ctx.beginPath();
  points.forEach((point, index) => {
    const x = xToPixel(point.x);
    const y = yToPixel(point.y);
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();

  ctx.strokeStyle = theme.primary;
  ctx.lineWidth = 2;
  result.shadedRanges.forEach((range) => {
    [range.start, range.end].forEach((limit) => {
      if (limit >= minX && limit <= maxX) {
        ctx.beginPath();
        ctx.moveTo(xToPixel(limit), padding.top);
        ctx.lineTo(xToPixel(limit), padding.top + plotHeight);
        ctx.stroke();
      }
    });
  });
}

function renderDiscrete(
  canvas: HTMLCanvasElement,
  distribution: DistributionDefinition,
  params: ParameterValues,
  result: ProbabilityResult
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const theme = getTheme();
  const { width, height } = canvas;
  const padding = { top: 42, right: 48, bottom: 78, left: 76 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const math = createDiscreteMath(distribution, params);
  const rows = math.support.map((k) => ({ k, probability: math.pmf(k), included: result.includedValues.includes(k) }));
  const maxY = Math.max(...rows.map((row) => row.probability), 1e-8) * 1.18;
  const barGap = Math.max(2, Math.min(12, plotWidth / rows.length / 4));
  const barWidth = Math.max(4, plotWidth / rows.length - barGap);
  const yToPixel = (y: number) => padding.top + plotHeight - (y / maxY) * plotHeight;

  clear(ctx, width, height);
  drawGrid(ctx, width, height, padding, theme, rows[0]?.k ?? 0, rows.at(-1)?.k ?? 1, maxY);

  rows.forEach((row, index) => {
    const x = padding.left + index * (plotWidth / rows.length) + barGap / 2;
    const y = yToPixel(row.probability);
    ctx.fillStyle = row.included ? theme.primary : theme.muted;
    roundRect(ctx, x, y, barWidth, padding.top + plotHeight - y, 7);
    ctx.fill();
  });

  ctx.fillStyle = theme.text;
  ctx.font = "22px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  const labelStep = Math.ceil(rows.length / 14);
  rows.forEach((row, index) => {
    if (index % labelStep === 0 || index === rows.length - 1) {
      const x = padding.left + index * (plotWidth / rows.length) + barWidth / 2;
      ctx.fillText(String(row.k), x, padding.top + plotHeight + 38);
    }
  });
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  padding: { top: number; right: number; bottom: number; left: number },
  theme: ChartTheme,
  minX: number,
  maxX: number,
  maxY: number
): void {
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  ctx.strokeStyle = theme.grid;
  ctx.lineWidth = 1;
  ctx.fillStyle = theme.text;
  ctx.font = "20px Inter, system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  for (let i = 0; i <= 5; i += 1) {
    const y = padding.top + (i / 5) * plotHeight;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
    const value = maxY * (1 - i / 5);
    ctx.fillText(formatNumber(value, 3), padding.left - 14, y);
  }

  ctx.strokeStyle = theme.axis;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top + plotHeight);
  ctx.lineTo(width - padding.right, padding.top + plotHeight);
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, padding.top + plotHeight);
  ctx.stroke();

  ctx.fillStyle = theme.text;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  for (let i = 0; i <= 6; i += 1) {
    const x = padding.left + (i / 6) * plotWidth;
    ctx.fillText(formatNumber(minX + (i / 6) * (maxX - minX), 2), x, padding.top + plotHeight + 18);
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
  ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
  ctx.arcTo(x, y + height, x, y, safeRadius);
  ctx.arcTo(x, y, x + width, y, safeRadius);
  ctx.closePath();
}
