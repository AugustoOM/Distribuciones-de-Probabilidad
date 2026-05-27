import type { AppState, DistributionDefinition, IntervalType, ValidationResult } from "../types/distributions";
import { distributions } from "../data/distributions";
import { formatParameterLabel } from "../utils/format";

interface ControlsCallbacks {
  onDistributionChange: (id: string) => void;
  onParameterChange: (key: string, value: number) => void;
  onIntervalChange: (type: IntervalType) => void;
  onLimitChange: (key: "a" | "b", value: number) => void;
  onReset: () => void;
}

const intervalOptions: Array<{ type: IntervalType; label: string; hint: string; icon: string }> = [
  { type: "left", label: "P(X ≤ a)", hint: "Cola izquierda", icon: "◨" },
  { type: "between", label: "P(a ≤ X ≤ b)", hint: "Intervalo central", icon: "▥" },
  { type: "right", label: "P(X ≥ a)", hint: "Cola derecha", icon: "◧" },
  { type: "outside", label: "Extremos", hint: "Exterior del intervalo", icon: "◫" }
];

export function renderControls(
  container: HTMLElement,
  state: AppState,
  distribution: DistributionDefinition,
  validation: ValidationResult,
  callbacks: ControlsCallbacks
): void {
  const selectorOptions = distributions
    .map((item) => `<option value="${item.id}" ${item.id === state.distributionId ? "selected" : ""}>${item.name}</option>`)
    .join("");

  const params = distribution.parameters
    .map((parameter) => {
      const value = state.parameters[parameter.key] ?? distribution.defaults[parameter.key] ?? 0;
      const min = parameter.min === undefined ? "" : `min="${parameter.min}"`;
      const max = parameter.max === undefined ? "" : `max="${parameter.max}"`;
      return `
        <label class="field" title="${parameter.description}">
          <span>${formatParameterLabel(parameter.key)}</span>
          <input
            data-param="${parameter.key}"
            type="number"
            value="${value}"
            step="${parameter.step}"
            ${min}
            ${max}
          />
        </label>
      `;
    })
    .join("");

  const intervals = intervalOptions
    .map(
      (option) => `
        <button
          class="interval-button ${option.type === state.intervalType ? "active" : ""}"
          data-interval="${option.type}"
          type="button"
          title="${option.hint}"
        >
          <span class="interval-icon" aria-hidden="true">${option.icon}</span>
          <span>${option.label}</span>
        </button>
      `
    )
    .join("");

  const needsB = state.intervalType === "between" || state.intervalType === "outside";
  const errors = validation.errors.map((error) => `<li>${error}</li>`).join("");

  container.innerHTML = `
    <section class="control-section">
      <label class="field field-full">
        <span>Distribucion</span>
        <select id="distribution-select">${selectorOptions}</select>
      </label>
    </section>

    <section class="control-section">
      <div class="section-row">
        <h2>Parametros</h2>
        <button class="ghost-button" id="reset-params" type="button">Restablecer</button>
      </div>
      <div class="parameter-grid">${params}</div>
    </section>

    <section class="control-section">
      <h2>Intervalo</h2>
      <div class="interval-grid">${intervals}</div>
      <div class="limit-grid ${needsB ? "" : "single"}">
        <label class="field">
          <span>a</span>
          <input id="limit-a" type="number" value="${state.a}" step="0.1" />
        </label>
        ${
          needsB
            ? `<label class="field">
                <span>b</span>
                <input id="limit-b" type="number" value="${state.b}" step="0.1" />
              </label>`
            : ""
        }
      </div>
    </section>

    <section class="control-section validation-box ${validation.valid ? "is-valid" : ""}">
      <h2>Validacion</h2>
      ${validation.valid ? "<p>Listo para calcular.</p>" : `<ul>${errors}</ul>`}
    </section>
  `;

  container.querySelector<HTMLSelectElement>("#distribution-select")!.addEventListener("change", (event) => {
    callbacks.onDistributionChange((event.currentTarget as HTMLSelectElement).value);
  });

  container.querySelectorAll<HTMLInputElement>("[data-param]").forEach((input) => {
    input.addEventListener("input", (event) => {
      const target = event.currentTarget as HTMLInputElement;
      callbacks.onParameterChange(target.dataset.param!, Number(target.value));
    });
  });

  container.querySelectorAll<HTMLButtonElement>("[data-interval]").forEach((button) => {
    button.addEventListener("click", (event) => {
      callbacks.onIntervalChange((event.currentTarget as HTMLButtonElement).dataset.interval as IntervalType);
    });
  });

  container.querySelector<HTMLInputElement>("#limit-a")!.addEventListener("input", (event) => {
    callbacks.onLimitChange("a", Number((event.currentTarget as HTMLInputElement).value));
  });

  container.querySelector<HTMLInputElement>("#limit-b")?.addEventListener("input", (event) => {
    callbacks.onLimitChange("b", Number((event.currentTarget as HTMLInputElement).value));
  });

  container.querySelector<HTMLButtonElement>("#reset-params")!.addEventListener("click", callbacks.onReset);
}
