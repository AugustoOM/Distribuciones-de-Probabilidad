import "./style.css";
import { distributions, getDistribution } from "./data/distributions";
import { calculateProbability } from "./math/probability";
import { createDiscreteMath } from "./math/discrete";
import type { AppState, DiscreteRow, IntervalType } from "./types/distributions";
import { formatProbability } from "./utils/format";
import { validateInputs } from "./utils/validation";
import { renderChart, renderEmptyChart } from "./ui/chart";
import { renderControls } from "./ui/controls";
import { renderDiscreteTable } from "./ui/table";
import { initTheme } from "./ui/theme";

const controls = document.querySelector<HTMLElement>("#controls")!;
const canvas = document.querySelector<HTMLCanvasElement>("#probability-chart")!;
const resultExpression = document.querySelector<HTMLElement>("#result-expression")!;
const title = document.querySelector<HTMLElement>("#distribution-title")!;
const description = document.querySelector<HTMLElement>("#distribution-description")!;
const example = document.querySelector<HTMLElement>("#distribution-example")!;
const tableCard = document.querySelector<HTMLElement>("#discrete-table-card")!;
const tableContainer = document.querySelector<HTMLElement>("#discrete-table")!;
const copyButton = document.querySelector<HTMLButtonElement>("#copy-result")!;
const downloadButton = document.querySelector<HTMLButtonElement>("#download-chart")!;
const themeButton = document.querySelector<HTMLButtonElement>("#theme-toggle")!;

const initialDistribution = distributions[0];
let state: AppState = {
  distributionId: initialDistribution.id,
  parameters: { ...initialDistribution.defaults },
  intervalType: "between",
  a: -1,
  b: 1
};

let latestResultText = "";

function update(): void {
  const distribution = getDistribution(state.distributionId);
  const validation = validateInputs(distribution, state.parameters, state.intervalType, state.a, state.b);
  renderControls(controls, state, distribution, validation, {
    onDistributionChange: (id) => {
      const next = getDistribution(id);
      state = {
        ...state,
        distributionId: next.id,
        parameters: { ...next.defaults },
        a: next.kind === "continuous" ? -1 : 2,
        b: next.kind === "continuous" ? 1 : 6
      };
      update();
    },
    onParameterChange: (key, value) => {
      state = { ...state, parameters: { ...state.parameters, [key]: value } };
      update();
    },
    onIntervalChange: (type: IntervalType) => {
      state = { ...state, intervalType: type };
      update();
    },
    onLimitChange: (key, value) => {
      state = { ...state, [key]: value };
      update();
    },
    onReset: () => {
      state = { ...state, parameters: { ...distribution.defaults } };
      update();
    }
  });

  title.textContent = distribution.name;
  description.textContent = distribution.description;
  example.textContent = distribution.example;

  if (!validation.valid) {
    resultExpression.textContent = "Corrige los datos para calcular";
    latestResultText = "";
    tableCard.hidden = true;
    tableContainer.innerHTML = "";
    renderEmptyChart(canvas, "Datos inválidos");
    return;
  }

  const result = calculateProbability(distribution, state.parameters, state.intervalType, state.a, state.b);
  latestResultText = `${result.expression} = ${formatProbability(result.value)}`;
  resultExpression.textContent = latestResultText;
  renderChart(canvas, distribution, state.parameters, result);

  if (distribution.kind === "discrete") {
    const math = createDiscreteMath(distribution, state.parameters);
    const included = new Set(result.includedValues);
    const rows: DiscreteRow[] = math.support.map((k) => ({
      k,
      probability: math.pmf(k),
      included: included.has(k)
    }));
    tableCard.hidden = false;
    renderDiscreteTable(tableContainer, rows);
  } else {
    tableCard.hidden = true;
    tableContainer.innerHTML = "";
  }
}

copyButton.addEventListener("click", async () => {
  if (!latestResultText) {
    return;
  }
  await navigator.clipboard.writeText(latestResultText);
  copyButton.textContent = "Copiado";
  window.setTimeout(() => {
    copyButton.textContent = "Copiar";
  }, 1200);
});

downloadButton.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = `probabilitylab-${state.distributionId}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
});

initTheme(themeButton);
update();

window.addEventListener("resize", () => {
  update();
});
