import type { Telemetry, TelemetryEvent } from "./types";

export function createDisabledTelemetry(
  _transport?: (event: TelemetryEvent) => void,
): Telemetry {
  void _transport;
  return {
    track(_event: TelemetryEvent): void {
      void _event;
      // Deliberately disabled until a provider and event subset pass privacy review.
    },
  };
}
