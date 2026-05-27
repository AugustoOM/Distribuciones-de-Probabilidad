import type { DistributionDefinition, ParameterValues } from "../types/distributions";
import { betaFunction, clampProbability, erf, logGamma, regularizedBeta, regularizedGammaP } from "./special";

export interface ContinuousDistributionMath {
  pdf: (x: number) => number;
  cdf: (x: number) => number;
  domain: [number, number];
}

function value(params: ParameterValues, key: keyof ParameterValues, fallback: number): number {
  return params[key] ?? fallback;
}

export function createContinuousMath(
  distribution: DistributionDefinition,
  params: ParameterValues
): ContinuousDistributionMath {
  switch (distribution.id) {
    case "normal": {
      const mu = value(params, "mu", 0);
      const sigma = value(params, "sigma", 1);
      return {
        pdf: (x) => Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI)),
        cdf: (x) => 0.5 * (1 + erf((x - mu) / (sigma * Math.SQRT2))),
        domain: [mu - 6 * sigma, mu + 6 * sigma]
      };
    }
    case "student": {
      const df = value(params, "df", 8);
      const constant = Math.exp(logGamma((df + 1) / 2) - logGamma(df / 2)) / Math.sqrt(df * Math.PI);
      return {
        pdf: (x) => constant * (1 + (x * x) / df) ** (-(df + 1) / 2),
        cdf: (x) => {
          const z = df / (df + x * x);
          const ib = regularizedBeta(z, df / 2, 0.5);
          return x >= 0 ? clampProbability(1 - 0.5 * ib) : clampProbability(0.5 * ib);
        },
        domain: [-Math.max(7, Math.sqrt(df) * 4.2), Math.max(7, Math.sqrt(df) * 4.2)]
      };
    }
    case "chiSquared": {
      const df = value(params, "df", 4);
      return {
        pdf: (x) =>
          x <= 0 ? 0 : Math.exp((df / 2 - 1) * Math.log(x) - x / 2 - (df / 2) * Math.log(2) - logGamma(df / 2)),
        cdf: (x) => regularizedGammaP(df / 2, x / 2),
        domain: [0, Math.max(8, df + 8 * Math.sqrt(2 * df))]
      };
    }
    case "fDistribution": {
      const df1 = value(params, "df1", 5);
      const df2 = value(params, "df2", 12);
      return {
        pdf: (x) => {
          if (x <= 0) {
            return 0;
          }
          const numerator = Math.sqrt(((df1 * x) ** df1 * df2 ** df2) / (df1 * x + df2) ** (df1 + df2));
          return numerator / (x * betaFunction(df1 / 2, df2 / 2));
        },
        cdf: (x) => {
          if (x <= 0) {
            return 0;
          }
          return regularizedBeta((df1 * x) / (df1 * x + df2), df1 / 2, df2 / 2);
        },
        domain: [0, Math.max(7, (df2 / Math.max(1, df2 - 2)) * 7)]
      };
    }
    case "exponential": {
      const lambda = value(params, "lambda", 1);
      return {
        pdf: (x) => (x < 0 ? 0 : lambda * Math.exp(-lambda * x)),
        cdf: (x) => (x < 0 ? 0 : clampProbability(1 - Math.exp(-lambda * x))),
        domain: [0, 9 / lambda]
      };
    }
    case "cauchy": {
      const x0 = value(params, "x0", 0);
      const gamma = value(params, "gamma", 1);
      return {
        pdf: (x) => 1 / (Math.PI * gamma * (1 + ((x - x0) / gamma) ** 2)),
        cdf: (x) => 0.5 + Math.atan((x - x0) / gamma) / Math.PI,
        domain: [x0 - 16 * gamma, x0 + 16 * gamma]
      };
    }
    case "weibull": {
      const k = value(params, "k", 1.5);
      const lambda = value(params, "lambda", 1);
      return {
        pdf: (x) => (x < 0 ? 0 : (k / lambda) * (x / lambda) ** (k - 1) * Math.exp(-((x / lambda) ** k))),
        cdf: (x) => (x < 0 ? 0 : clampProbability(1 - Math.exp(-((x / lambda) ** k)))),
        domain: [0, lambda * Math.max(5.5, (-Math.log(0.0002)) ** (1 / k))]
      };
    }
    case "gamma": {
      const alpha = value(params, "alpha", 2);
      const theta = value(params, "theta", 1);
      return {
        pdf: (x) =>
          x <= 0 ? 0 : Math.exp((alpha - 1) * Math.log(x) - x / theta - logGamma(alpha) - alpha * Math.log(theta)),
        cdf: (x) => (x <= 0 ? 0 : regularizedGammaP(alpha, x / theta)),
        domain: [0, Math.max(8 * theta, alpha * theta + 8 * Math.sqrt(alpha) * theta)]
      };
    }
    case "beta": {
      const alpha = value(params, "alpha", 2);
      const beta = value(params, "beta", 5);
      const betaNorm = betaFunction(alpha, beta);
      return {
        pdf: (x) => {
          if (x <= 0 || x >= 1) {
            return 0;
          }
          return (x ** (alpha - 1) * (1 - x) ** (beta - 1)) / betaNorm;
        },
        cdf: (x) => regularizedBeta(x, alpha, beta),
        domain: [-0.08, 1.08]
      };
    }
    case "logNormal": {
      const mu = value(params, "mu", 0);
      const sigma = value(params, "sigma", 0.5);
      return {
        pdf: (x) =>
          x <= 0 ? 0 : Math.exp(-((Math.log(x) - mu) ** 2) / (2 * sigma * sigma)) / (x * sigma * Math.sqrt(2 * Math.PI)),
        cdf: (x) => (x <= 0 ? 0 : 0.5 * (1 + erf((Math.log(x) - mu) / (sigma * Math.SQRT2)))),
        domain: [0, Math.exp(mu + 5 * sigma)]
      };
    }
    case "logistic": {
      const mu = value(params, "mu", 0);
      const s = value(params, "s", 1);
      return {
        pdf: (x) => {
          const z = Math.exp(-(x - mu) / s);
          return z / (s * (1 + z) ** 2);
        },
        cdf: (x) => 1 / (1 + Math.exp(-(x - mu) / s)),
        domain: [mu - 10 * s, mu + 10 * s]
      };
    }
    default:
      throw new Error(`${distribution.name} no es continua.`);
  }
}

export function continuousProbability(
  math: ContinuousDistributionMath,
  intervalType: string,
  a: number,
  b: number
): number {
  if (intervalType === "left") {
    return clampProbability(math.cdf(a));
  }
  if (intervalType === "right") {
    return clampProbability(1 - math.cdf(a));
  }
  if (intervalType === "outside") {
    return clampProbability(math.cdf(a) + 1 - math.cdf(b));
  }
  return clampProbability(math.cdf(b) - math.cdf(a));
}
