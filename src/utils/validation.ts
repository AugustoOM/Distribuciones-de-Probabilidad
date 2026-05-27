import type { DistributionDefinition, IntervalType, ParameterValues, ValidationResult } from "../types/distributions";

function hasNumber(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isIntegerPositive(value: number | undefined): value is number {
  return hasNumber(value) && Number.isInteger(value) && value > 0;
}

function isPositive(value: number | undefined): boolean {
  return hasNumber(value) && value > 0;
}

export function validateInputs(
  distribution: DistributionDefinition,
  params: ParameterValues,
  intervalType: IntervalType,
  a: number,
  b: number
): ValidationResult {
  const errors: string[] = [];

  for (const parameter of distribution.parameters) {
    const current = params[parameter.key];
    if (!hasNumber(current)) {
      errors.push(`${parameter.label} debe ser un número válido.`);
      continue;
    }
    if (parameter.integer && !Number.isInteger(current)) {
      errors.push(`${parameter.label} debe ser un entero.`);
    }
    if (parameter.min !== undefined && current < parameter.min) {
      errors.push(`${parameter.label} debe ser mayor o igual que ${parameter.min}.`);
    }
    if (parameter.max !== undefined && current > parameter.max) {
      errors.push(`${parameter.label} debe ser menor o igual que ${parameter.max}.`);
    }
  }

  if (["sigma", "lambda", "gamma", "s", "alpha", "beta", "theta", "k", "df", "df1", "df2"].some((key) => {
    const current = params[key as keyof ParameterValues];
    return current !== undefined && !isPositive(current);
  })) {
    errors.push("Los parámetros de escala, forma y grados de libertad deben ser mayores que 0.");
  }

  if (params.p !== undefined && (params.p < 0 || params.p > 1)) {
    errors.push("p debe estar entre 0 y 1.");
  }

  if (params.n !== undefined && !isIntegerPositive(params.n)) {
    errors.push("n debe ser un entero positivo.");
  }

  if (params.r !== undefined && !isIntegerPositive(params.r)) {
    errors.push("r debe ser un entero positivo.");
  }

  if (distribution.id === "hypergeometric") {
    const N = params.N;
    const K = params.K;
    const n = params.n;
    if (!isIntegerPositive(N) || !isIntegerPositive(K) || !isIntegerPositive(n)) {
      errors.push("N, K y n deben ser enteros positivos.");
    } else {
      const population = N;
      const successes = K;
      const sample = n;
      if (successes > population) {
        errors.push("En la distribución hipergeométrica, K debe ser menor o igual que N.");
      }
      if (sample > population) {
        errors.push("En la distribución hipergeométrica, n debe ser menor o igual que N.");
      }
    }
  }

  if (!Number.isFinite(a)) {
    errors.push("El límite a debe ser un número válido.");
  }
  if ((intervalType === "between" || intervalType === "outside") && !Number.isFinite(b)) {
    errors.push("El límite b debe ser un número válido.");
  }
  if ((intervalType === "between" || intervalType === "outside") && Number.isFinite(a) && Number.isFinite(b) && a > b) {
    errors.push("En intervalos centrales o exteriores se debe cumplir a ≤ b.");
  }

  return { valid: errors.length === 0, errors };
}
