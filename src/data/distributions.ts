import type { DistributionDefinition } from "../types/distributions";

const positive = { min: 0.0001, step: 0.1 };
const integerPositive = { min: 1, step: 1, integer: true };

export const distributions: DistributionDefinition[] = [
  {
    id: "normal",
    name: "Normal",
    kind: "continuous",
    parameters: [
      { key: "mu", label: "μ", description: "Media de la distribucion.", step: 0.1 },
      { key: "sigma", label: "σ", description: "Desviacion estandar, mayor que 0.", ...positive }
    ],
    defaults: { mu: 0, sigma: 1 },
    description: "Modelo continuo simetrico usado para errores, mediciones y fenomenos agregados.",
    example: "Ejemplo: alturas, puntajes estandarizados o errores de medicion."
  },
  {
    id: "student",
    name: "Student t",
    kind: "continuous",
    parameters: [{ key: "df", label: "ν", description: "Grados de libertad.", ...positive }],
    defaults: { df: 8 },
    description: "Distribucion simetrica con colas pesadas, frecuente en inferencia con muestras pequenas.",
    example: "Ejemplo: contraste de medias cuando la varianza poblacional es desconocida."
  },
  {
    id: "chiSquared",
    name: "Chi-Squared",
    kind: "continuous",
    parameters: [{ key: "df", label: "ν", description: "Grados de libertad.", ...positive }],
    defaults: { df: 4 },
    description: "Distribucion positiva asociada a sumas de cuadrados de normales estandar.",
    example: "Ejemplo: pruebas de bondad de ajuste o intervalos para varianzas."
  },
  {
    id: "fDistribution",
    name: "F-Distribution",
    kind: "continuous",
    parameters: [
      { key: "df1", label: "ν1", description: "Grados de libertad del numerador.", ...positive },
      { key: "df2", label: "ν2", description: "Grados de libertad del denominador.", ...positive }
    ],
    defaults: { df1: 5, df2: 12 },
    description: "Distribucion positiva para razones de varianzas independientes.",
    example: "Ejemplo: analisis de varianza y comparacion de modelos."
  },
  {
    id: "exponential",
    name: "Exponential",
    kind: "continuous",
    parameters: [{ key: "lambda", label: "λ", description: "Tasa de ocurrencia.", ...positive }],
    defaults: { lambda: 1 },
    description: "Modelo de tiempos de espera con tasa constante.",
    example: "Ejemplo: tiempo hasta la siguiente llegada en un proceso de Poisson."
  },
  {
    id: "cauchy",
    name: "Cauchy",
    kind: "continuous",
    parameters: [
      { key: "x0", label: "x0", description: "Parametro de localizacion.", step: 0.1 },
      { key: "gamma", label: "γ", description: "Parametro de escala, mayor que 0.", ...positive }
    ],
    defaults: { x0: 0, gamma: 1 },
    description: "Distribucion simetrica de colas muy pesadas, sin media ni varianza definidas.",
    example: "Ejemplo: cociente de dos normales estandar independientes."
  },
  {
    id: "weibull",
    name: "Weibull",
    kind: "continuous",
    parameters: [
      { key: "k", label: "k", description: "Parametro de forma.", ...positive },
      { key: "lambda", label: "λ", description: "Parametro de escala.", ...positive }
    ],
    defaults: { k: 1.5, lambda: 1 },
    description: "Modelo flexible para tiempos de vida y confiabilidad.",
    example: "Ejemplo: duracion de componentes mecanicos."
  },
  {
    id: "gamma",
    name: "Gamma",
    kind: "continuous",
    parameters: [
      { key: "alpha", label: "α", description: "Parametro de forma.", ...positive },
      { key: "theta", label: "θ", description: "Parametro de escala.", ...positive }
    ],
    defaults: { alpha: 2, theta: 1 },
    description: "Distribucion positiva para tiempos acumulados y variables sesgadas a derecha.",
    example: "Ejemplo: tiempo total hasta varios eventos independientes."
  },
  {
    id: "beta",
    name: "Beta",
    kind: "continuous",
    parameters: [
      { key: "alpha", label: "α", description: "Parametro de forma izquierdo.", ...positive },
      { key: "beta", label: "β", description: "Parametro de forma derecho.", ...positive }
    ],
    defaults: { alpha: 2, beta: 5 },
    description: "Distribucion sobre el intervalo [0, 1], ideal para proporciones.",
    example: "Ejemplo: incertidumbre sobre una tasa de conversion."
  },
  {
    id: "logNormal",
    name: "Log-Normal",
    kind: "continuous",
    parameters: [
      { key: "mu", label: "μ", description: "Media del logaritmo.", step: 0.1 },
      { key: "sigma", label: "σ", description: "Desviacion estandar del logaritmo.", ...positive }
    ],
    defaults: { mu: 0, sigma: 0.5 },
    description: "Modelo positivo para variables cuyo logaritmo es normal.",
    example: "Ejemplo: precios, tamanos o tiempos multiplicativos."
  },
  {
    id: "logistic",
    name: "Logistic",
    kind: "continuous",
    parameters: [
      { key: "mu", label: "μ", description: "Parametro de localizacion.", step: 0.1 },
      { key: "s", label: "s", description: "Parametro de escala.", ...positive }
    ],
    defaults: { mu: 0, s: 1 },
    description: "Distribucion simetrica similar a la normal, con CDF de forma sigmoide.",
    example: "Ejemplo: modelos de crecimiento y regresion logistica latente."
  },
  {
    id: "binomial",
    name: "Binomial",
    kind: "discrete",
    parameters: [
      { key: "n", label: "n", description: "Numero de ensayos.", ...integerPositive },
      { key: "p", label: "p", description: "Probabilidad de exito por ensayo.", min: 0, max: 1, step: 0.01 }
    ],
    defaults: { n: 10, p: 0.4 },
    description: "Cuenta exitos en un numero fijo de ensayos independientes.",
    example: "Ejemplo: cantidad de respuestas correctas en 10 preguntas binarias."
  },
  {
    id: "negativeBinomial",
    name: "Pascal / Negative Binomial",
    kind: "discrete",
    parameters: [
      { key: "r", label: "r", description: "Cantidad de exitos objetivo.", ...integerPositive },
      { key: "p", label: "p", description: "Probabilidad de exito por ensayo.", min: 0, max: 1, step: 0.01 }
    ],
    defaults: { r: 4, p: 0.45 },
    description: "Cuenta fallos antes de alcanzar una cantidad fija de exitos.",
    example: "Ejemplo: fallos antes del cuarto acierto en intentos independientes."
  },
  {
    id: "poisson",
    name: "Poisson",
    kind: "discrete",
    parameters: [{ key: "lambda", label: "λ", description: "Media o tasa esperada.", ...positive }],
    defaults: { lambda: 4 },
    description: "Cuenta eventos raros en un intervalo cuando la tasa promedio es conocida.",
    example: "Ejemplo: llamadas por minuto o defectos por lote."
  },
  {
    id: "hypergeometric",
    name: "Hypergeometric",
    kind: "discrete",
    parameters: [
      { key: "N", label: "N", description: "Tamano de la poblacion.", ...integerPositive },
      { key: "K", label: "K", description: "Exitos en la poblacion.", ...integerPositive },
      { key: "n", label: "n", description: "Tamano de la muestra.", ...integerPositive }
    ],
    defaults: { N: 40, K: 12, n: 8 },
    description: "Cuenta exitos al muestrear sin reemplazo desde una poblacion finita.",
    example: "Ejemplo: piezas defectuosas en una muestra sin reemplazo."
  }
];

export function getDistribution(id: string): DistributionDefinition {
  const distribution = distributions.find((item) => item.id === id);
  if (!distribution) {
    throw new Error(`Distribucion desconocida: ${id}`);
  }
  return distribution;
}
