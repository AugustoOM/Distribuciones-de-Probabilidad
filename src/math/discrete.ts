import type { DistributionDefinition, ParameterValues } from "../types/distributions";
import { clampProbability, logCombination } from "./special";

export interface DiscreteDistributionMath {
  pmf: (k: number) => number;
  cdf: (k: number) => number;
  support: number[];
}

function numeric(params: ParameterValues, key: keyof ParameterValues, fallback: number): number {
  return params[key] ?? fallback;
}

function makeRange(start: number, end: number): number[] {
  const values: number[] = [];
  for (let k = start; k <= end; k += 1) {
    values.push(k);
  }
  return values;
}

function cumulativeFromPmf(pmf: (k: number) => number, min: number, k: number): number {
  let total = 0;
  for (let i = min; i <= k; i += 1) {
    total += pmf(i);
  }
  return clampProbability(total);
}

export function createDiscreteMath(distribution: DistributionDefinition, params: ParameterValues): DiscreteDistributionMath {
  switch (distribution.id) {
    case "binomial": {
      const n = Math.round(numeric(params, "n", 10));
      const p = numeric(params, "p", 0.4);
      const pmf = (k: number) => {
        if (!Number.isInteger(k) || k < 0 || k > n) {
          return 0;
        }
        if (p === 0) {
          return k === 0 ? 1 : 0;
        }
        if (p === 1) {
          return k === n ? 1 : 0;
        }
        return Math.exp(logCombination(n, k) + k * Math.log(p) + (n - k) * Math.log1p(-p));
      };
      return { pmf, cdf: (k) => cumulativeFromPmf(pmf, 0, Math.floor(k)), support: makeRange(0, n) };
    }
    case "negativeBinomial": {
      const r = Math.round(numeric(params, "r", 4));
      const p = numeric(params, "p", 0.45);
      const pmf = (k: number) => {
        if (!Number.isInteger(k) || k < 0) {
          return 0;
        }
        if (p === 1) {
          return k === 0 ? 1 : 0;
        }
        if (p === 0) {
          return 0;
        }
        return Math.exp(logCombination(k + r - 1, k) + r * Math.log(p) + k * Math.log1p(-p));
      };
      const support: number[] = [];
      let cumulative = 0;
      const maxK = Math.max(80, Math.ceil((r * (1 - p)) / p + 10 * Math.sqrt((r * (1 - p)) / (p * p))));
      for (let k = 0; k <= Math.min(500, maxK); k += 1) {
        support.push(k);
        cumulative += pmf(k);
        if (k > r && cumulative > 0.99995) {
          break;
        }
      }
      return { pmf, cdf: (k) => cumulativeFromPmf(pmf, 0, Math.floor(k)), support };
    }
    case "poisson": {
      const lambda = numeric(params, "lambda", 4);
      const pmf = (k: number) => {
        if (!Number.isInteger(k) || k < 0) {
          return 0;
        }
        return Math.exp(k * Math.log(lambda) - lambda - logCombination(k, k));
      };
      const support: number[] = [];
      let cumulative = 0;
      const maxK = Math.max(25, Math.ceil(lambda + 10 * Math.sqrt(lambda)));
      for (let k = 0; k <= Math.min(500, maxK); k += 1) {
        support.push(k);
        cumulative += pmf(k);
        if (k > lambda && cumulative > 0.99995) {
          break;
        }
      }
      return { pmf, cdf: (k) => cumulativeFromPmf(pmf, 0, Math.floor(k)), support };
    }
    case "hypergeometric": {
      const N = Math.round(numeric(params, "N", 40));
      const K = Math.round(numeric(params, "K", 12));
      const n = Math.round(numeric(params, "n", 8));
      const min = Math.max(0, n - (N - K));
      const max = Math.min(n, K);
      const denominator = logCombination(N, n);
      const pmf = (k: number) => {
        if (!Number.isInteger(k) || k < min || k > max) {
          return 0;
        }
        return Math.exp(logCombination(K, k) + logCombination(N - K, n - k) - denominator);
      };
      return { pmf, cdf: (k) => cumulativeFromPmf(pmf, min, Math.floor(k)), support: makeRange(min, max) };
    }
    default:
      throw new Error(`${distribution.name} no es discreta.`);
  }
}

export function discreteIncludedValues(support: number[], intervalType: string, a: number, b: number): number[] {
  return support.filter((k) => {
    if (intervalType === "left") {
      return k <= Math.floor(a);
    }
    if (intervalType === "right") {
      return k >= Math.ceil(a);
    }
    if (intervalType === "outside") {
      return k <= Math.floor(a) || k >= Math.ceil(b);
    }
    return k >= Math.ceil(a) && k <= Math.floor(b);
  });
}
