import { ExecutionContext, NodeResult } from '@/core/nodeLibrary_v3';

/**
 * Report Generator Executor
 * Generates harvest reports and optional notifications
 */
export async function reportGeneratorExecutor(
  ctx: ExecutionContext,
  nodeData: any
): Promise<NodeResult> {
  try {
    const { 
      templateId = 'TEMPLATE_HARVEST_SUMMARY', 
      outputs = ['pdf'],
      sheetId = 'SHEET_BROILER_LOG',
      sheetName = 'daily_log'
    } = nodeData.metadata || {};

    const farmId = ctx.memory?.farmId || ctx.payload?.farmId || 'unknown';
    const cycleId = ctx.memory?.cycleId || ctx.payload?.cycleId || Date.now().toString();

    // Collect data from memory
    const harvestData = {
      farmId,
      cycleId,
      qty: ctx.payload?.qty || ctx.memory?.qty,
      total_weight: ctx.payload?.total_weight || ctx.memory?.total_weight,
      ...ctx.memory?.lastPerformance
    };

    // Mock PDF generation (in production, use actual PDF library like pdfmake or puppeteer)
    const reportUrl = `https://naraflow.example/reports/${farmId}_${cycleId}_harvest_report.pdf`;
    
    // If WhatsApp output is requested
    if (outputs.includes('whatsapp')) {
      const ownerPhone = ctx.memory?.owner_phone || ctx.payload?.owner_phone;
      if (ownerPhone && ctx.services.sendMessage) {
        const message = `📦 Laporan Panen siap!\nFarm: ${farmId}\nSiklus: ${cycleId}\nLihat laporan: ${reportUrl}`;
        await ctx.services.sendMessage('whatsapp', ownerPhone, message);
      }
    }

    // Store report URL in memory
    const updatedMemory = {
      ...ctx.memory,
      lastReportUrl: reportUrl,
      reportData: harvestData
    };

    ctx.services.logger.info('Report generated', { farmId, cycleId, reportUrl });

    return {
      status: 'success',
      data: {
        reportUrl,
        harvestData
      },
      updatedMemory
    };
  } catch (error: any) {
    ctx.services.logger.error('Report generation failed', { error: error.message });
    return {
      status: 'error',
      error: {
        message: error.message || 'Report generation failed',
        code: 'REPORT_GEN_ERROR',
        details: error
      }
    };
  }
}

