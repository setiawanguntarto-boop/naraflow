import { ExecutionContext, NodeResult } from "@/core/nodeLibrary_v3";

/**
 * Performance Calculator Executor
 * Calculates FCR (Feed Conversion Ratio), ADG (Average Daily Gain), and mortality percentage
 */
export async function performanceCalcExecutor(
  ctx: ExecutionContext,
  nodeData: any
): Promise<NodeResult> {
  try {
    const {
      inputKeys = ["feed", "avg_weight", "mortality", "population_start"],
      outputKeys = ["FCR", "ADG", "mortality_pct"],
    } = nodeData.metadata || {};

    // Extract values from input or memory
    const feed = ctx.payload?.feed || ctx.memory?.feed || 0;
    const avg_weight = ctx.payload?.avg_weight || ctx.memory?.avg_weight || 0;
    const mortality = ctx.payload?.mortality || ctx.memory?.mortality || 0;
    const population_start = ctx.payload?.population_start || ctx.memory?.population_start || 0;
    const days = ctx.payload?.days || ctx.memory?.days || 1;

    // Calculate ADG (Average Daily Gain) in grams
    const ADG = avg_weight / days;

    // Calculate mortality percentage
    const mortality_pct = population_start > 0 ? (mortality / population_start) * 100 : 0;

    // Calculate FCR (Feed Conversion Ratio)
    // Weight gain in kg = (avg_weight in grams / 1000) * (population_start - mortality)
    const weightGainKg = (avg_weight / 1000) * (population_start - mortality);
    const FCR = weightGainKg > 0 ? feed / weightGainKg : null;

    const results = {
      FCR,
      ADG,
      mortality_pct: Number(mortality_pct.toFixed(2)),
    };

    // Store results in memory
    const updatedMemory = {
      ...ctx.memory,
      lastPerformance: results,
      FCR,
      ADG,
      mortality_pct,
    };

    ctx.services.logger.info("Performance calculated", {
      FCR,
      ADG,
      mortality_pct,
      days,
    });

    return {
      status: "success",
      data: results,
      updatedMemory,
    };
  } catch (error: any) {
    ctx.services.logger.error("Performance calculation failed", { error: error.message });
    return {
      status: "error",
      error: {
        message: error.message || "Performance calculation failed",
        code: "PERF_CALC_ERROR",
        details: error,
      },
    };
  }
}
