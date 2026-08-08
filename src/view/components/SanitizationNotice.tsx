import type { TransformationDiagnostic } from "@/entities/conversion/types";

const labels = {
  "escaped-raw-html": "Escaped raw HTML",
  "removed-url": "Removed unsafe URL",
  "changed-structure": "Changed structure",
} as const;

export function SanitizationNotice({ diagnostics }: { diagnostics: TransformationDiagnostic[] }) {
  if (diagnostics.length === 0) return null;
  const groupedDiagnostics = diagnostics.reduce(
    (groups, diagnostic) => {
      const group = groups.get(diagnostic.category) ?? [];
      group.push(diagnostic);
      groups.set(diagnostic.category, group);
      return groups;
    },
    new Map<TransformationDiagnostic["category"], TransformationDiagnostic[]>(),
  );

  return (
    <details>
      <summary>{diagnostics.length} {diagnostics.length === 1 ? "transformation" : "transformations"} made</summary>
      <ul>
        {[...groupedDiagnostics].map(([category, occurrences]) => (
          <li key={category}>
            <span>{labels[category]} ({occurrences.length})</span>
            <ul>
              {occurrences.map((diagnostic, index) => (
                <li key={`${category}-${diagnostic.position.start.offset ?? index}`}>
                  Line {diagnostic.position.start.line}, column {diagnostic.position.start.column}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </details>
  );
}
