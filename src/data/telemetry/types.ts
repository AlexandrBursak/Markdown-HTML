import type { OutputMode, TransformationCategory } from "@/entities/conversion/types";

export type TelemetryEvent =
  | { name: "session-start" }
  | { name: "input-presence"; present: boolean; sizeBucket: "empty" | "small" | "medium" | "large" | "oversize" }
  | { name: "preview-timing"; elapsedMs: number; sizeBucket: "small" | "medium" | "large" | "oversize" }
  | { name: "output-mode"; mode: OutputMode }
  | { name: "sanitization"; category: TransformationCategory; count: number }
  | { name: "copy-outcome"; outcome: "success" | "denied" | "failed"; elapsedMs: number };

export interface Telemetry {
  track(event: TelemetryEvent): void;
}
