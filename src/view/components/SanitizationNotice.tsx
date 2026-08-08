import type { TransformationDiagnostic } from "@/entities/conversion/types";

const labels = {
  "escaped-raw-html": "Escaped raw HTML",
  "removed-url": "Removed unsafe URL",
  "changed-structure": "Changed structure",
} as const;

export function SanitizationNotice({ diagnostics }: { diagnostics: TransformationDiagnostic[] }) {
  if (diagnostics.length === 0) return null;
  return (
    <details>
      <summary>{diagnostics.length} {diagnostics.length === 1 ? "transformation" : "transformations"} made</summary>
      <ul>
        {diagnostics.map((diagnostic, index) => (
          <li key={`${diagnostic.category}-${diagnostic.position.start.offset ?? index}`}>
            {labels[diagnostic.category]}: line {diagnostic.position.start.line}, column {diagnostic.position.start.column}
          </li>
        ))}
      </ul>
    </details>
  );
}
