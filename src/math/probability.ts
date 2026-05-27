import type { DistributionDefinition, IntervalType, ParameterValues, ProbabilityResult } from "../types/distributions";
import { createContinuousMath, continuousProbability } from "./continuous";
import { createDiscreteMath, discreteIncludedValues } from "./discrete";
import { clampProbability } from "./special";
import { formatExpression } from "../utils/format";

export function calculateProbability(
  distribution: DistributionDefinition,
  params: ParameterValues,
  intervalType: IntervalType,
  a: number,
  b: number
): ProbabilityResult {
  const expression = formatExpression(intervalType, a, b);

  if (distribution.kind === "continuous") {
    const math = createContinuousMath(distribution, params);
    const value = continuousProbability(math, intervalType, a, b);
    const shadedRanges =
      intervalType === "left"
        ? [{ start: math.domain[0], end: a }]
        : intervalType === "right"
          ? [{ start: a, end: math.domain[1] }]
          : intervalType === "outside"
            ? [
                { start: math.domain[0], end: a },
                { start: b, end: math.domain[1] }
              ]
            : [{ start: a, end: b }];
    return { expression, value, includedValues: [], shadedRanges };
  }

  const math = createDiscreteMath(distribution, params);
  const includedValues = discreteIncludedValues(math.support, intervalType, a, b);
  const value = clampProbability(includedValues.reduce((total, k) => total + math.pmf(k), 0));
  return { expression, value, includedValues, shadedRanges: [] };
}
