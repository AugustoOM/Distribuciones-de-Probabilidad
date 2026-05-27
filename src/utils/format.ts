import type { IntervalType, ParameterKey } from "../types/distributions";

const labels: Record<ParameterKey, string> = {
  mu: "μ",
  sigma: "σ",
  df: "ν",
  df1: "ν1",
  df2: "ν2",
  lambda: "λ",
  x0: "x0",
  gamma: "γ",
  k: "k",
  alpha: "α",
  theta: "θ",
  beta: "β",
  s: "s",
  n: "n",
  p: "p",
  r: "r",
  N: "N",
  K: "K"
};

export function formatNumber(value: number, digits = 4): string {
  if (!Number.isFinite(value)) {
    return "no definido";
  }
  const abs = Math.abs(value);
  if (abs > 0 && (abs < 0.0001 || abs >= 100000)) {
    return value.toExponential(3);
  }
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: Number.isInteger(value) ? 0 : Math.min(2, digits)
  }).format(value);
}

export function formatProbability(value: number): string {
  if (!Number.isFinite(value)) {
    return "no definido";
  }
  return value.toFixed(value < 0.0001 && value > 0 ? 6 : 4);
}

export function formatParameterLabel(key: ParameterKey): string {
  return labels[key];
}

export function formatExpression(type: IntervalType, a: number, b: number): string {
  const left = formatNumber(a, 3);
  const right = formatNumber(b, 3);
  if (type === "left") {
    return `P(X ≤ ${left})`;
  }
  if (type === "right") {
    return `P(X ≥ ${left})`;
  }
  if (type === "outside") {
    return `P(X ≤ ${left}) + P(X ≥ ${right})`;
  }
  return `P(${left} ≤ X ≤ ${right})`;
}
