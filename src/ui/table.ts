import type { DiscreteRow } from "../types/distributions";
import { formatProbability } from "../utils/format";

export function renderDiscreteTable(container: HTMLElement, rows: DiscreteRow[]): void {
  if (rows.length === 0) {
    container.innerHTML = "";
    return;
  }

  const body = rows
    .map(
      (row) => `
        <tr class="${row.included ? "included" : ""}">
          <td>${row.k}</td>
          <td>${formatProbability(row.probability)}</td>
        </tr>
      `
    )
    .join("");

  container.innerHTML = `
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>k</th>
            <th>P(X = k)</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}
