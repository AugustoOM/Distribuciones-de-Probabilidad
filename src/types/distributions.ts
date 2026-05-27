export type DistributionKind = "continuous" | "discrete";

export type DistributionId =
  | "normal"
  | "student"
  | "chiSquared"
  | "fDistribution"
  | "exponential"
  | "cauchy"
  | "weibull"
  | "gamma"
  | "beta"
  | "logNormal"
  | "logistic"
  | "binomial"
  | "negativeBinomial"
  | "poisson"
  | "hypergeometric";

export type IntervalType = "left" | "between" | "right" | "outside";

export type ParameterKey =
  | "mu"
  | "sigma"
  | "df"
  | "df1"
  | "df2"
  | "lambda"
  | "x0"
  | "gamma"
  | "k"
  | "alpha"
  | "theta"
  | "beta"
  | "s"
  | "n"
  | "p"
  | "r"
  | "N"
  | "K";

export type ParameterValues = Partial<Record<ParameterKey, number>>;

export interface ParameterDefinition {
  key: ParameterKey;
  label: string;
  description: string;
  min?: number;
  max?: number;
  step: number;
  integer?: boolean;
}

export interface DistributionDefinition {
  id: DistributionId;
  name: string;
  kind: DistributionKind;
  parameters: ParameterDefinition[];
  defaults: ParameterValues;
  description: string;
  example: string;
}

export interface AppState {
  distributionId: DistributionId;
  parameters: ParameterValues;
  intervalType: IntervalType;
  a: number;
  b: number;
}

export interface ContinuousRange {
  start: number;
  end: number;
}

export interface ProbabilityResult {
  expression: string;
  value: number;
  includedValues: number[];
  shadedRanges: ContinuousRange[];
}

export interface DiscreteRow {
  k: number;
  probability: number;
  included: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
