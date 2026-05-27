# ProbabilityLab

ProbabilityLab es una calculadora interactiva de distribuciones de probabilidad. Permite elegir una distribucion, ajustar sus parametros, seleccionar el tipo de intervalo y visualizar el resultado junto con un grafico.

El proyecto esta pensado como una herramienta educativa para explorar distribuciones continuas y discretas sin depender de librerias estadisticas externas.

## Que permite hacer

- Calcular probabilidades para intervalos como `P(X <= a)`, `P(a <= X <= b)`, `P(X >= a)` y valores fuera de un intervalo.
- Visualizar la distribucion en un canvas, resaltando el area o los valores incluidos en el calculo.
- Consultar una descripcion y un ejemplo de uso para cada distribucion.
- Ver una tabla de probabilidades cuando la distribucion es discreta.
- Copiar el resultado calculado.
- Descargar el grafico como imagen PNG.
- Alternar entre tema claro y tema oscuro.

## Distribuciones incluidas

Distribuciones continuas:

- Normal
- t de Student
- Chi-cuadrado
- Distribucion F
- Exponencial
- Cauchy
- Weibull
- Gamma
- Beta
- Log-normal
- Logistica

Distribuciones discretas:

- Binomial
- Pascal / binomial negativa
- Poisson
- Hipergeometrica

## Como funciona

La aplicacion mantiene un estado con la distribucion seleccionada, sus parametros y los limites del intervalo. Cada vez que el usuario cambia un control, se vuelve a validar la entrada, se recalcula la probabilidad y se redibuja la interfaz.

El flujo principal esta en `src/main.ts`:

1. Carga la distribucion inicial.
2. Renderiza los controles laterales.
3. Valida parametros y limites.
4. Calcula la probabilidad correspondiente.
5. Actualiza el resultado, el grafico y, si aplica, la tabla discreta.

Las definiciones de distribuciones viven en `src/data/distributions.ts`. Alli se indican el nombre, tipo, parametros, valores por defecto, descripcion y ejemplo de cada una.

La logica matematica esta separada por tipo de distribucion:

- `src/math/continuous.ts`: funciones de densidad, distribucion acumulada e intervalos continuos.
- `src/math/discrete.ts`: funciones de masa, soportes discretos y valores incluidos.
- `src/math/probability.ts`: punto de entrada comun para calcular probabilidades.
- `src/math/special.ts`: funciones auxiliares numericas como gamma, beta regularizada y error function.

La interfaz se organiza en modulos pequenos:

- `src/ui/controls.ts`: controles de distribucion, parametros e intervalos.
- `src/ui/chart.ts`: renderizado del grafico en canvas.
- `src/ui/table.ts`: tabla para distribuciones discretas.
- `src/ui/theme.ts`: alternancia entre modo claro y oscuro.
- `src/style.css`: estilos, layout y paleta visual.

## Requisitos

- Node.js
- npm

## Instalacion

```bash
npm install
```

## Ejecutar en desarrollo

```bash
npm run dev
```

Vite levanta la aplicacion en un servidor local. Por defecto, el proyecto usa `127.0.0.1`.

## Generar version de produccion

```bash
npm run build
```

Este comando ejecuta TypeScript y luego genera los archivos optimizados en `dist/`.

## Previsualizar el build

```bash
npm run preview
```

Sirve localmente el contenido generado en `dist/`.

## Estructura del proyecto

```text
.
├── index.html
├── src
│   ├── data
│   │   └── distributions.ts
│   ├── math
│   │   ├── continuous.ts
│   │   ├── discrete.ts
│   │   ├── probability.ts
│   │   └── special.ts
│   ├── types
│   │   └── distributions.ts
│   ├── ui
│   │   ├── chart.ts
│   │   ├── controls.ts
│   │   ├── icons.ts
│   │   ├── table.ts
│   │   └── theme.ts
│   ├── utils
│   │   ├── format.ts
│   │   └── validation.ts
│   ├── main.ts
│   └── style.css
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Como agregar una nueva distribucion

1. Agregar su identificador en `src/types/distributions.ts`.
2. Definir sus metadatos y parametros en `src/data/distributions.ts`.
3. Implementar su calculo en `src/math/continuous.ts` o `src/math/discrete.ts`, segun corresponda.
4. Verificar que la validacion cubra sus restricciones de parametros.
5. Ejecutar `npm run build` para comprobar que todo compile.

## Tecnologias

- TypeScript
- Vite
- Canvas API
- Feather Icons
