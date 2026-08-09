import { describe, expect, it, vi } from "vitest";

import { createDisabledTelemetry } from "@/data/telemetry/disabledTelemetry";

describe("disabled telemetry", () => {
  it("emits nothing for approved outcome-only events", () => {
    const transport = vi.fn();
    const telemetry = createDisabledTelemetry(transport);
    telemetry.track({ name: "copy-outcome", outcome: "success", elapsedMs: 8 });
    expect(transport).not.toHaveBeenCalled();
  });
});
