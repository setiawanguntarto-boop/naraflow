import { Node, Edge } from "@xyflow/react";

interface BroilerWorkflowConfig {
  nodes: Node[];
  edges: Edge[];
}

export const useBroilerWorkflowGenerator = () => {
  const generateBroilerWorkflow = (templateId: string): BroilerWorkflowConfig => {
    const baseNodes: Node[] = [];
    const baseEdges: Edge[] = [];
    let nextNodeId = 1;

    // Helper function to generate node IDs
    const nextId = () => `node-${nextNodeId++}`;
    const nextEdgeId = (source: string, target: string) => `e${source}-${target}`;

    // 1. Initial Setup: Farm Registration → QR Generator → WhatsApp QR
    const farmReg = nextId();
    const qrGen = nextId();
    const whatsappQR = nextId();

    baseNodes.push(
      {
        id: farmReg,
        type: 'input',
        position: { x: 100, y: 100 },
        data: { 
          label: 'Ask Question',
          title: 'Farm Registration',
          description: 'Input data farm dan peternak',
          prompt: 'Isi data farm (format: farm_name:..., owner_name:..., location:..., capacity:...)',
          parse: 'kv',
          metrics: [
            {
              name: 'farm_name',
              label: 'Nama Farm',
              description: 'Nama lengkap farm',
              type: 'text',
              required: true
            },
            {
              name: 'owner_name',
              label: 'Nama Peternak',
              description: 'Nama pemilik/peternak',
              type: 'text', 
              required: true
            },
            {
              name: 'location',
              label: 'Lokasi Farm',
              description: 'Alamat lengkap farm',
              type: 'text',
              required: true
            },
            {
              name: 'capacity',
              label: 'Kapasitas Kandang',
              description: 'Jumlah maksimal ekor per kandang',
              type: 'number',
              required: true,
              validation: { min: 100, max: 50000 }
            }
          ]
        }
      },
      {
        id: qrGen,
        type: 'process',
        position: { x: 400, y: 100 },
        data: { 
          label: 'Process Data',
          title: 'QR Code Generator',
          debug: false,
          description: `// Generate QR Code untuk Kandang
const farmId = input.farm_name?.toLowerCase().replace(/\\s+/g, '_') || 'farm_001';
const shedId = \`\${farmId}_shed_1\`;

return {
  shed_id: shedId,
  qr_code: \`https://naraflow.app/shed/\${shedId}\`,
  qr_data: JSON.stringify({
    farm_name: input.farm_name,
    shed_id: shedId,
    capacity: input.capacity
  })
};`
        }
      },
      {
        id: whatsappQR,
        type: 'output',
        position: { x: 700, y: 100 },
        data: { 
          label: 'WhatsApp Message',
          title: 'Kirim QR Code',
          description: 'Kirim QR code ke peternak via WhatsApp',
          templateId: 'QR_ASSIGNED',
          config: {
            recipientType: 'farmer',
            messageType: 'confirmation',
            template: 'qr_assigned'
          }
        }
      }
    );

    baseEdges.push(
      { id: nextEdgeId(farmReg, qrGen), source: farmReg, target: qrGen },
      { id: nextEdgeId(qrGen, whatsappQR), source: qrGen, target: whatsappQR }
    );

    // For broiler-daily and broiler-full, add daily check-in flow
    if (templateId === 'broiler-full' || templateId === 'broiler-daily') {
      // 2. Daily Check-in Flow
      const dailyInput = nextId();
      const calculateMetrics = nextId();
      const conditionCheck = nextId();

      baseNodes.push(
        {
          id: dailyInput,
          type: 'input',
          position: { x: 100, y: 300 },
          data: {
            label: 'Ask Question',
            title: 'Daily Check-in Data',
            description: 'Input data harian broiler',
            prompt: 'Masukkan data harian (format: day_of_cycle:..., mortality:..., feed_kg:..., avg_weight_g:..., temp_c:...)',
            parse: 'kv',
            metrics: [
              {
                name: 'shed_id',
                label: 'Kandang',
                description: 'Pilih kandang yang akan di-input',
                type: 'select',
                required: true,
                validation: { options: ['Kandang A', 'Kandang B', 'Kandang C'] }
              },
              {
                name: 'day_of_cycle',
                label: 'Hari Ke',
                description: 'Hari ke-berapa dalam siklus',
                type: 'number',
                required: true,
                validation: { min: 1, max: 60 }
              },
              {
                name: 'mortality',
                label: 'Jumlah Mati (ekor)',
                description: 'Jumlah ayam mati hari ini',
                type: 'number',
                required: true,
                validation: { min: 0, max: 1000 }
              },
              {
                name: 'feed_kg',
                label: 'Pakan (kg)',
                description: 'Total pakan dikonsumsi hari ini',
                type: 'number',
                required: true,
                validation: { min: 0, max: 5000 }
              },
              {
                name: 'avg_weight_g',
                label: 'Berat Rata-rata (gram)',
                description: 'Berat rata-rata sampel ayam',
                type: 'number',
                required: false,
                validation: { min: 0, max: 5000 }
              },
              {
                name: 'temp_c',
                label: 'Suhu Kandang (°C)',
                description: 'Suhu rata-rata kandang',
                type: 'number',
                required: false,
                validation: { min: 20, max: 35 }
              }
            ]
          }
        },
        {
          id: calculateMetrics,
          type: 'process',
          position: { x: 400, y: 300 },
          data: {
            label: 'Process Data',
            title: 'Calculate Performance',
            debug: false,
            description: `// Performance Calculator untuk Broiler
const population = input.population_start || 10000;
const mortality = input.mortality || 0;
const feed = input.feed_kg || 0;
const weight = input.avg_weight_g || 0;

// Hitung metrics
const mortality_pct = ((mortality / population) * 100).toFixed(2);
const current_population = population - mortality;
const avg_weight_kg = weight / 1000;
const FCR = avg_weight_kg > 0 && current_population > 0 
  ? (feed / (avg_weight_kg * current_population)).toFixed(2) 
  : null;
const ADG = input.day_of_cycle > 1 && weight > 0 
  ? (weight / input.day_of_cycle).toFixed(1) 
  : null;

return {
  mortality_pct: parseFloat(mortality_pct),
  FCR: FCR ? parseFloat(FCR) : null,
  ADG: ADG ? parseFloat(ADG) : null,
  current_population,
  population_start: population
};`
          }
        },
        {
          id: conditionCheck,
          type: 'condition',
          position: { x: 700, y: 300 },
          data: {
            label: 'Condition',
            title: 'Check Mortality Threshold',
            description: `// Check mortality threshold
const mortalityPct = input.mortality_pct;

if (mortalityPct > 5.0) {
  return { path: 'critical', message: 'CRITICAL: Mortality ' + mortalityPct + '%' };
} else if (mortalityPct > 2.0) {
  return { path: 'warning', message: 'WARNING: Mortality ' + mortalityPct + '%' };
} else {
  return { path: 'normal', message: 'NORMAL: Mortality ' + mortalityPct + '%' };
}`,
            prompt: 'Kondisi mortalitas (critical / warning / normal)',
            autoRoute: true
          }
        }
      );

      baseEdges.push(
        { id: nextEdgeId(whatsappQR, dailyInput), source: whatsappQR, target: dailyInput },
        { id: nextEdgeId(dailyInput, calculateMetrics), source: dailyInput, target: calculateMetrics },
        { id: nextEdgeId(calculateMetrics, conditionCheck), source: calculateMetrics, target: conditionCheck }
      );

      // 3. Condition Paths: Critical, Warning, Normal
      const criticalAlert = nextId();
      const warningAlert = nextId();
      const normalConfirm = nextId();
      const criticalMerge = nextId();
      const warningMerge = nextId();
      const normalMerge = nextId();

      baseNodes.push(
        // Critical Path (Mortality > 5%)
        {
          id: criticalAlert,
          type: 'output',
          position: { x: 950, y: 400 },
          data: {
            label: 'WhatsApp Message',
            title: 'Critical Alert',
            description: `🚨 CRITICAL ALERT: Mortalitas Tinggi!`,
            templateId: 'ALERT_MORTALITY',
            config: {
              recipientType: 'both',
              messageType: 'alert',
              template: 'critical_mortality'
            }
          }
        },
        {
          id: criticalMerge,
          type: 'default',
          position: { x: 1200, y: 400 },
          data: {
            label: 'Merge',
            title: 'Merge Critical',
            description: 'Gabungkan alur critical'
          }
        },

        // Warning Path (Mortality 2-5%)
        {
          id: warningAlert,
          type: 'output',
          position: { x: 950, y: 300 },
          data: {
            label: 'WhatsApp Message',
            title: 'Warning Alert',
            description: `⚠️ WARNING: Mortalitas Meningkat`,
            templateId: 'PERFORMANCE_UPDATE',
            config: {
              recipientType: 'ppl',
              messageType: 'alert',
              template: 'mortality_alert'
            }
          }
        },
        {
          id: warningMerge,
          type: 'default',
          position: { x: 1200, y: 300 },
          data: {
            label: 'Merge',
            title: 'Merge Warning',
            description: 'Gabungkan alur warning'
          }
        },

        // Normal Path (Mortality < 2%)
        {
          id: normalConfirm,
          type: 'output',
          position: { x: 950, y: 200 },
          data: {
            label: 'WhatsApp Message',
            title: 'Daily Confirmation',
            description: `✅ Data Harian Tercatat`,
            templateId: 'DAILY_CHECKIN_REMINDER',
            config: {
              recipientType: 'farmer',
              messageType: 'confirmation',
              template: 'daily_checkin'
            }
          }
        },
        {
          id: normalMerge,
          type: 'default',
          position: { x: 1200, y: 200 },
          data: {
            label: 'Merge',
            title: 'Merge Normal',
            description: 'Gabungkan alur normal'
          }
        }
      );

      // 4. Connect paths to merges
      baseEdges.push(
        // Critical path
        { id: nextEdgeId(conditionCheck, criticalAlert), source: conditionCheck, target: criticalAlert, label: 'critical' },
        { id: nextEdgeId(criticalAlert, criticalMerge), source: criticalAlert, target: criticalMerge },
        
        // Warning path
        { id: nextEdgeId(conditionCheck, warningAlert), source: conditionCheck, target: warningAlert, label: 'warning' },
        { id: nextEdgeId(warningAlert, warningMerge), source: warningAlert, target: warningMerge },
        
        // Normal path
        { id: nextEdgeId(conditionCheck, normalConfirm), source: conditionCheck, target: normalConfirm, label: 'normal' },
        { id: nextEdgeId(normalConfirm, normalMerge), source: normalConfirm, target: normalMerge }
      );

      // 5. Final Merge node
      const finalMerge = nextId();
      baseNodes.push({
        id: finalMerge,
        type: 'default',
        position: { x: 1450, y: 300 },
        data: {
          label: 'Merge',
          title: 'Final Merge',
          description: 'Gabungkan semua alur kondisi'
        }
      });

      // Connect all merges to final merge
      baseEdges.push(
        { id: nextEdgeId(criticalMerge, finalMerge), source: criticalMerge, target: finalMerge },
        { id: nextEdgeId(warningMerge, finalMerge), source: warningMerge, target: finalMerge },
        { id: nextEdgeId(normalMerge, finalMerge), source: normalMerge, target: finalMerge }
      );

      // 6. For broiler-daily: Add End node
      if (templateId === 'broiler-daily') {
        const endNode = nextId();
        baseNodes.push({
          id: endNode,
          type: 'output',
          position: { x: 1700, y: 300 },
          data: {
            label: 'End',
            title: 'End',
            description: 'Workflow selesai'
          }
        });
        baseEdges.push(
          { id: nextEdgeId(finalMerge, endNode), source: finalMerge, target: endNode }
        );
      }
    }

    // 7. For broiler-full and broiler-harvest: Add Harvest Processing
    if (templateId === 'broiler-full' || templateId === 'broiler-harvest') {
      const harvestInput = nextId();
      const harvestCalc = nextId();
      const harvestReport = nextId();
      const harvestEnd = nextId();

      // Find the final merge node or use whatsappQR as starting point
      const lastNodeId = templateId === 'broiler-full' 
        ? baseNodes.find(n => (n.data as any).label === 'Merge' && (n.data as any).title === 'Final Merge')?.id || whatsappQR
        : whatsappQR;

      baseNodes.push(
        {
          id: harvestInput,
          type: 'input',
          position: { x: 100, y: 600 },
          data: {
            label: 'Ask Question',
            title: 'Harvest Data Input',
            description: 'Input data panen broiler',
            prompt: 'Masukkan data panen (format: shed_id:..., harvest_date:YYYY-MM-DD, qty:..., total_weight_kg:..., duration_days:...)',
            parse: 'kv',
            metrics: [
              {
                name: 'shed_id',
                label: 'Kandang',
                description: 'Kandang yang dipanen',
                type: 'select',
                required: true,
                validation: { options: ['Kandang A', 'Kandang B', 'Kandang C'] }
              },
              {
                name: 'harvest_date',
                label: 'Tanggal Panen',
                description: 'Tanggal pelaksanaan panen',
                type: 'date',
                required: true
              },
              {
                name: 'qty',
                label: 'Jumlah Ekor',
                description: 'Total ekor yang dipanen',
                type: 'number',
                required: true,
                validation: { min: 0 }
              },
              {
                name: 'total_weight_kg',
                label: 'Berat Total (kg)',
                description: 'Berat total panen dalam kg',
                type: 'number',
                required: true,
                validation: { min: 0 }
              },
              {
                name: 'duration_days',
                label: 'Durasi Siklus (hari)',
                description: 'Lama siklus budidaya',
                type: 'number',
                required: true,
                validation: { min: 1, max: 90 }
              }
            ]
          }
        },
        {
          id: harvestCalc,
          type: 'process',
          position: { x: 400, y: 600 },
          data: {
            label: 'Process Data',
            title: 'Generate Harvest Report',
            debug: false,
            description: `// Harvest Calculator
const total_weight = input.total_weight_kg;
const qty = input.qty;
const days = input.duration_days;

const avg_weight = (total_weight / qty * 1000).toFixed(0);
const cycle_ADG = days > 0 ? (avg_weight / days).toFixed(1) : null;

return {
  avg_weight_g: parseFloat(avg_weight),
  cycle_ADG: cycle_ADG ? parseFloat(cycle_ADG) : null,
  total_weight_kg,
  qty,
  duration_days: days,
  harvest_date: input.harvest_date
};`
          }
        },
        {
          id: harvestReport,
          type: 'output',
          position: { x: 700, y: 600 },
          data: {
            label: 'WhatsApp Message',
            title: 'Send Harvest Report',
            description: '📦 PANEN SIAP - Laporan lengkap telah dikirim.',
            templateId: 'HARVEST_SUMMARY',
            config: {
              recipientType: 'both',
              messageType: 'report',
              template: 'harvest_notification'
            }
          }
        },
        {
          id: harvestEnd,
          type: 'output',
          position: { x: 1000, y: 600 },
          data: {
            label: 'End',
            title: 'End',
            description: 'Workflow panen selesai'
          }
        }
      );

      baseEdges.push(
        { id: nextEdgeId(lastNodeId, harvestInput), source: lastNodeId, target: harvestInput },
        { id: nextEdgeId(harvestInput, harvestCalc), source: harvestInput, target: harvestCalc },
        { id: nextEdgeId(harvestCalc, harvestReport), source: harvestCalc, target: harvestReport },
        { id: nextEdgeId(harvestReport, harvestEnd), source: harvestReport, target: harvestEnd }
      );
    }

    // 8. Data Infrastructure Template (broiler-data-infra)
    if (templateId === 'broiler-data-infra') {
      const dataInput = nextId();
      const validate = nextId();
      const transform = nextId();
      const enrich = nextId();
      const storeSync = nextId();
      const analytics = nextId();
      const reportGen = nextId();
      const finalOutput = nextId();
      const auditLog = nextId();
      const backupData = nextId();

      const lastNodeId = baseNodes[baseNodes.length - 1]?.id || 'start';

      baseNodes.push(
        {
          id: dataInput,
          type: 'input',
          position: { x: 100, y: 100 },
          data: {
            label: 'Ask Question',
            title: 'Multi-source Data Collection',
            description: 'Input data dari berbagai sumber (WhatsApp, IoT, Manual)',
            prompt: 'Input multi-sumber (format: data_source:..., farm_id:..., data_payload:{...}, timestamp:...)',
            parse: 'kv',
            metrics: [
              {
                name: 'data_source',
                label: 'Sumber Data',
                description: 'Pilih sumber data',
                type: 'select',
                required: true,
                validation: { options: ['WhatsApp', 'IoT Sensor', 'Manual Input', 'API Import'] }
              },
              {
                name: 'farm_id',
                label: 'Farm ID',
                description: 'ID farm pengirim data',
                type: 'text',
                required: true
              },
              {
                name: 'data_payload',
                label: 'Data Payload',
                description: 'Data mentah dari sumber',
                type: 'text',
                required: true
              },
              {
                name: 'timestamp',
                label: 'Timestamp',
                description: 'Waktu data dikirim',
                type: 'datetime',
                required: true
              }
            ]
          }
        },
        {
          id: validate,
          type: 'process',
          position: { x: 400, y: 100 },
          data: {
            label: 'Process Data',
            title: 'Data Validation & Quality Check',
            description: `// Data Validation Pipeline
const source = input.data_source;
const payload = JSON.parse(input.data_payload || '{}');
const errors = [];
const warnings = [];

// Field-level validation
if (!payload.shed_id) errors.push('Missing shed_id');
if (!payload.day_of_cycle) errors.push('Missing day_of_cycle');
if (payload.day_of_cycle < 1 || payload.day_of_cycle > 60) warnings.push('day_of_cycle out of normal range');

// Range checks
if (payload.mortality && (payload.mortality < 0 || payload.mortality > 50000)) {
  errors.push('mortality value invalid');
}

// Consistency checks
if (payload.population_start && payload.mortality && payload.population_start < payload.mortality) {
  errors.push('Inconsistent: mortality exceeds population');
}

// Outlier detection (example: mortality rate)
if (payload.population_start && payload.mortality) {
  const mortalityRate = (payload.mortality / payload.population_start) * 100;
  if (mortalityRate > 10) warnings.push('Extremely high mortality rate detected');
}

return {
  valid: errors.length === 0,
  errors: errors,
  warnings: warnings,
  validated_data: payload,
  quality_score: errors.length === 0 && warnings.length === 0 ? 100 : 
                 errors.length === 0 && warnings.length < 3 ? 85 : 60
};`
          }
        },
        {
          id: transform,
          type: 'process',
          position: { x: 700, y: 100 },
          data: {
            label: 'Process Data',
            title: 'Data Transformation',
            description: `// Data Transformation Pipeline
const data = input.validated_data || {};
const transformed = {};

// Normalize unit conversion
if (data.avg_weight_g) {
  transformed.avg_weight_kg = data.avg_weight_g / 1000;
}

if (data.feed_gram) {
  transformed.feed_kg = data.feed_gram / 1000;
}

// Calculate derived metrics if not present
if (data.feed_kg && data.avg_weight_kg && data.population) {
  transformed.FCR = (data.feed_kg / (data.avg_weight_kg * data.population)).toFixed(2);
}

// Normalize timestamp
transformed.timestamp = new Date(input.timestamp).toISOString();

// Add metadata
transformed.data_source = input.data_source;
transformed.farm_id = input.farm_id;
transformed.original_data = data;

return transformed;`
          }
        },
        {
          id: enrich,
          type: 'process',
          position: { x: 1000, y: 100 },
          data: {
            label: 'Process Data',
            title: 'Data Enrichment',
            description: `// Data Enrichment with Farm Metadata
const data = input;
const farmId = data.farm_id;

// Fetch farm metadata (mock - would fetch from database)
const farmMetadata = {
  'farm_001': { name: 'Farm A', region: 'Jawa Timur', capacity: 20000 },
  'farm_002': { name: 'Farm B', region: 'Jawa Barat', capacity: 15000 }
};

const metadata = farmMetadata[farmId] || {};

return {
  ...data,
  farm_name: metadata.name,
  farm_region: metadata.region,
  farm_capacity: metadata.capacity,
  enriched_at: new Date().toISOString()
};`
          }
        },
        {
          id: storeSync,
          type: 'output',
          position: { x: 1300, y: 100 },
          data: {
            label: 'Store Records',
            title: 'Centralized Storage & Sync',
            description: 'Sync data ke Google Sheets dengan struktur data warehouse',
            config: {
              sheetId: 'data_warehouse_main',
              tab: 'broiler_daily_log',
              conflictResolution: 'timestamp_latest'
            }
          }
        },
        {
          id: analytics,
          type: 'process',
          position: { x: 100, y: 300 },
          data: {
            label: 'Process Data',
            title: 'Aggregate Analytics',
            description: `// Multi-farm Analytics
const data = input;

// Trend analysis
const trend = data.FCR && data.avg_weight_kg ? 
  (data.FCR < 1.6 ? 'excellent' : data.FCR < 1.8 ? 'good' : 'needs_attention') : 'insufficient_data';

// Performance benchmarking
const performance = {
  FCR: data.FCR,
  mortality_rate: data.mortality_pct,
  avg_weight: data.avg_weight_kg,
  trend: trend,
  benchmark: 'industry_standard'
};

return {
  ...data,
  analytics: performance
};`
          }
        },
        {
          id: reportGen,
          type: 'output',
          position: { x: 400, y: 300 },
          data: {
            label: 'Process Data',
            title: 'Report Generation',
            description: 'Generate aggregated report untuk dashboard'
          }
        },
        {
          id: auditLog,
          type: 'default',
          position: { x: 700, y: 300 },
          data: {
            label: 'Process Data',
            title: 'Audit Logging',
            description: 'Log semua operasi untuk audit trail'
          }
        },
        {
          id: backupData,
          type: 'output',
          position: { x: 1000, y: 300 },
          data: {
            label: 'Store Records',
            title: 'Backup Data',
            description: 'Backup otomatis ke secondary storage',
            config: {
              sheetId: 'backup_storage',
              tab: 'broiler_log_backup',
              compression: true
            }
          }
        },
        {
          id: finalOutput,
          type: 'output',
          position: { x: 1300, y: 300 },
          data: {
            label: 'End',
            title: 'End',
            description: 'Data pipeline selesai'
          }
        }
      );

      baseEdges.push(
        { id: nextEdgeId(lastNodeId, dataInput), source: lastNodeId, target: dataInput },
        { id: nextEdgeId(dataInput, validate), source: dataInput, target: validate },
        { id: nextEdgeId(validate, transform), source: validate, target: transform },
        { id: nextEdgeId(transform, enrich), source: transform, target: enrich },
        { id: nextEdgeId(enrich, storeSync), source: enrich, target: storeSync },
        { id: nextEdgeId(storeSync, analytics), source: storeSync, target: analytics },
        { id: nextEdgeId(analytics, reportGen), source: analytics, target: reportGen },
        { id: nextEdgeId(reportGen, auditLog), source: reportGen, target: auditLog },
        { id: nextEdgeId(auditLog, backupData), source: auditLog, target: backupData },
        { id: nextEdgeId(backupData, finalOutput), source: backupData, target: finalOutput }
      );
    }

    // 9. Cloud Infrastructure Template (broiler-cloud-infra)
    if (templateId === 'broiler-cloud-infra') {
      const cloudSetup = nextId();
      const backupSystem = nextId();
      const analyticsEngine = nextId();
      const apiGateway = nextId();
      const notifications = nextId();
      const scaling = nextId();
      const monitoring = nextId();
      const endNode = nextId();

      const lastNodeId = baseNodes[baseNodes.length - 1]?.id || 'start';

      baseNodes.push(
        {
          id: cloudSetup,
          type: 'process',
          position: { x: 100, y: 100 },
          data: {
            label: 'Process Data',
            title: 'Cloud Storage Setup',
            description: `// Cloud Storage Configuration
const config = {
  provider: 'google_cloud',
  bucket: 'broiler-data-prod',
  regions: ['asia-southeast2', 'us-central1'],
  encryption: true,
  versioning: true,
  lifecycle_rules: [
    { action: 'archive', condition: { days: 90 } },
    { action: 'delete', condition: { days: 365 } }
  ]
};

return {
  ...config,
  status: 'configured',
  multi_region_enabled: true,
  encryption_key: 'auto-managed'
};`
          }
        },
        {
          id: backupSystem,
          type: 'process',
          position: { x: 400, y: 100 },
          data: {
            label: 'Process Data',
            title: 'Automated Backup System',
            description: `// Backup Strategy Implementation
const backupConfig = {
  frequency: 'daily',
  strategy: 'incremental',
  retention: 30,
  verification: true,
  alert_on_failure: true
};

// Daily backup trigger
const today = new Date();
const lastBackup = input.last_backup || new Date(today.getTime() - 24 * 60 * 60 * 1000);

return {
  backup_scheduled: true,
  backup_time: today,
  verification_status: 'pending',
  disaster_recovery: 'ready',
  ...backupConfig
};`
          }
        },
        {
          id: analyticsEngine,
          type: 'process',
          position: { x: 700, y: 100 },
          data: {
            label: 'Process Data',
            title: 'Cloud Analytics Engine',
            description: `// Multi-farm Analytics Pipeline
const farms = input.farms || ['farm_001', 'farm_002', 'farm_003'];
const analytics = {};

farms.forEach(farmId => {
  // Fetch aggregated data per farm
  const farmData = fetchFarmData(farmId);
  analytics[farmId] = {
    avg_FCR: calculateAverage(farmData.FCR_values),
    avg_mortality: calculateAverage(farmData.mortality_values),
    production_trend: determineTrend(farmData.daily_data),
    performance_score: calculateScore(farmData)
  };
});

// Cross-farm comparison
const benchmark = {
  top_performer: getTopPerformer(analytics),
  overall_average: calculateOverallAverage(analytics),
  predictive_insights: generatePredictions(analytics)
};

return {
  farm_analytics: analytics,
  benchmark: benchmark,
  generated_at: new Date().toISOString()
};`
          }
        },
        {
          id: apiGateway,
          type: 'process',
          position: { x: 1000, y: 100 },
          data: {
            label: 'Process Data',
            title: 'API Gateway & Integration',
            description: `// API Gateway Configuration
const apiConfig = {
  endpoints: [
    { path: '/api/v1/farms', method: 'GET', rateLimit: '1000/hour' },
    { path: '/api/v1/data/upload', method: 'POST', rateLimit: '500/hour' },
    { path: '/api/v1/analytics', method: 'GET', rateLimit: '200/hour' }
  ],
  security: {
    authentication: 'JWT',
    authorization: 'Role-Based',
    encryption: 'TLS 1.3'
  },
  webhooks: [
    { name: 'data_received', url: 'https://app.naraflow.com/webhook/data' },
    { name: 'alert_triggered', url: 'https://app.naraflow.com/webhook/alert' }
  ]
};

return apiConfig;`
          }
        },
        {
          id: notifications,
          type: 'output',
          position: { x: 1300, y: 100 },
          data: {
            label: 'Send Message',
            title: 'Multi-channel Notifications',
            description: 'Send notifications via Email, WhatsApp, SMS',
            config: {
              channels: ['email', 'whatsapp', 'sms'],
              priority: 'high',
              escalation: true
            }
          }
        },
        {
          id: scaling,
          type: 'process',
          position: { x: 100, y: 300 },
          data: {
            label: 'Process Data',
            title: 'Auto-scaling & Load Balancing',
            description: `// Scaling Configuration
const scaling = {
  auto_scale: true,
  min_instances: 2,
  max_instances: 10,
  target_cpu: 70,
  load_balancer: 'round_robin',
  health_checks: true
};

return {
  ...scaling,
  current_instances: 3,
  recommended_scale: 'up',
  predicted_load: 'high'
};`
          }
        },
        {
          id: monitoring,
          type: 'default',
          position: { x: 400, y: 300 },
          data: {
            label: 'Process Data',
            title: 'Performance Monitoring',
            description: 'Real-time monitoring dashboard'
          }
        },
        {
          id: endNode,
          type: 'output',
          position: { x: 700, y: 300 },
          data: {
            label: 'End',
            title: 'End',
            description: 'Cloud infrastructure setup selesai'
          }
        }
      );

      baseEdges.push(
        { id: nextEdgeId(lastNodeId, cloudSetup), source: lastNodeId, target: cloudSetup },
        { id: nextEdgeId(cloudSetup, backupSystem), source: cloudSetup, target: backupSystem },
        { id: nextEdgeId(backupSystem, analyticsEngine), source: backupSystem, target: analyticsEngine },
        { id: nextEdgeId(analyticsEngine, apiGateway), source: analyticsEngine, target: apiGateway },
        { id: nextEdgeId(apiGateway, notifications), source: apiGateway, target: notifications },
        { id: nextEdgeId(notifications, scaling), source: notifications, target: scaling },
        { id: nextEdgeId(scaling, monitoring), source: scaling, target: monitoring },
        { id: nextEdgeId(monitoring, endNode), source: monitoring, target: endNode }
      );
    }

    // Mark all generated nodes as broiler to enable broiler-specific UI/config panels
    const nodesWithBroilerFlag = baseNodes.map(n => ({
      ...n,
      data: { ...(n.data as any), broiler: true }
    }));

    return { nodes: nodesWithBroilerFlag, edges: baseEdges };
  };

  return { generateBroilerWorkflow };
};
