/**
 * Broiler Workflow Configuration
 * Konfigurasi untuk Google Sheet mapping, validasi rules, dan settings workflow Broiler
 */

export interface BroilerSheetConfig {
  sheetId: string;
  sheetName: string;
  range?: string;
}

export interface BroilerValidationRules {
  mortality_min: number;
  mortality_max_pct_alert: number;
  mortality_max_pct_critical: number;
  feed_min: number;
  avg_weight_min: number;
  avg_weight_max: number;
  temp_min: number;
  temp_max: number;
}

export interface BroilerFieldMapping {
  key: string;
  label: string;
  type: "string" | "number" | "date" | "boolean";
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export const broilerConfig = {
  // Google Sheet Configuration
  sheets: {
    dailyLog: {
      sheetId: process.env.VITE_GOOGLE_SHEET_BROILER_ID || "SHEET_BROILER_LOG",
      sheetName: "daily_log",
      range: "A1:M1000",
    } as BroilerSheetConfig,

    harvestLog: {
      sheetId: process.env.VITE_GOOGLE_SHEET_BROILER_ID || "SHEET_BROILER_LOG",
      sheetName: "harvest_log",
      range: "A1:Q100",
    } as BroilerSheetConfig,
  },

  // Field Mapping untuk Daily Log
  dailyLogFields: [
    { key: "timestamp", label: "Timestamp", type: "date", required: true },
    { key: "farm_id", label: "Farm ID", type: "string", required: true },
    { key: "shed_id", label: "Shed ID", type: "string", required: true },
    { key: "day_of_cycle", label: "Hari Siklus", type: "number", required: true },
    { key: "population_start", label: "Populasi Awal", type: "number", required: true },
    {
      key: "mortality",
      label: "Mortalitas",
      type: "number",
      required: true,
      validation: { min: 0 },
    },
    { key: "mortality_pct", label: "Mortalitas %", type: "number", required: true },
    { key: "feed_kg", label: "Pakan (kg)", type: "number", required: true, validation: { min: 0 } },
    {
      key: "avg_weight_g",
      label: "Berat Rata-rata (g)",
      type: "number",
      required: true,
      validation: { min: 0 },
    },
    { key: "temp_c", label: "Suhu (°C)", type: "number", required: false },
    { key: "FCR", label: "FCR", type: "number", required: false },
    { key: "ADG", label: "ADG (gr/hari)", type: "number", required: false },
    { key: "reporter_phone", label: "No. HP Reporter", type: "string", required: false },
    { key: "note", label: "Catatan", type: "string", required: false },
  ] as BroilerFieldMapping[],

  // Field Mapping untuk Harvest Log
  harvestLogFields: [
    { key: "harvest_date", label: "Tanggal Panen", type: "date", required: true },
    { key: "farm_id", label: "Farm ID", type: "string", required: true },
    { key: "cycle_id", label: "Cycle ID", type: "string", required: true },
    { key: "qty", label: "Jumlah Ekor", type: "number", required: true },
    { key: "total_weight_kg", label: "Berat Total (kg)", type: "number", required: true },
    { key: "avg_weight_g", label: "Berat Rata-rata (g)", type: "number", required: true },
    { key: "cycle_FCR", label: "FCR Siklus", type: "number", required: true },
    { key: "cycle_ADG", label: "ADG Siklus", type: "number", required: true },
    { key: "cycle_mortality_pct", label: "Mortality %", type: "number", required: true },
    { key: "duration_days", label: "Durasi (hari)", type: "number", required: true },
    { key: "owner_phone", label: "No. HP Peternak", type: "string", required: true },
    { key: "report_url", label: "URL Laporan", type: "string", required: false },
  ] as BroilerFieldMapping[],

  // Validation Rules
  validationRules: {
    mortality_min: 0,
    mortality_max_pct_alert: 2.0,
    mortality_max_pct_critical: 5.0,
    feed_min: 0,
    avg_weight_min: 0,
    avg_weight_max: 5000,
    temp_min: 18,
    temp_max: 35,
  } as BroilerValidationRules,

  // Performance Targets
  performanceTargets: {
    FCR_target: 1.6,
    FCR_good: "< 1.6",
    FCR_warning: "1.6 - 1.8",
    FCR_critical: "> 1.8",
    ADG_target: 50, // grams per day
    mortality_target: "< 2%",
  },

  // WhatsApp Configuration
  whatsapp: {
    templates: {
      ALERT_MORTALITY: "ALERT_MORTALITY",
      HARVEST_SUMMARY: "HARVEST_SUMMARY",
      QR_ASSIGNED: "QR_ASSIGNED",
      DAILY_CHECKIN_REMINDER: "DAILY_CHECKIN_REMINDER",
      PERFORMANCE_UPDATE: "PERFORMANCE_UPDATE",
      FARM_REGISTERED: "FARM_REGISTERED",
    },
    defaultRecipients: {
      ppl_phone: "+6281234567890", // Replace with actual PPL phone
      admin_phone: "+6281234567891", // Replace with actual admin phone
    },
  },

  // QR Code Configuration
  qr: {
    baseUrl: process.env.VITE_QR_BASE_URL || "https://naraflow.example/qr",
    templateUrl: "{{baseUrl}}/{{farmId}}/{{shedId}}",
    expiresIn: 90, // days
  },
};

/**
 * Get field mapping by key
 */
export function getFieldMapping(key: string): BroilerFieldMapping | undefined {
  return [...broilerConfig.dailyLogFields, ...broilerConfig.harvestLogFields].find(
    field => field.key === key
  );
}

/**
 * Validate field value according to mapping rules
 */
export function validateFieldValue(
  field: BroilerFieldMapping,
  value: any
): { valid: boolean; error?: string } {
  if (field.required && (value === null || value === undefined || value === "")) {
    return { valid: false, error: `${field.label} is required` };
  }

  if (field.validation) {
    if (field.validation.min !== undefined && Number(value) < field.validation.min) {
      return { valid: false, error: `${field.label} must be at least ${field.validation.min}` };
    }

    if (field.validation.max !== undefined && Number(value) > field.validation.max) {
      return { valid: false, error: `${field.label} must be at most ${field.validation.max}` };
    }

    if (field.validation.pattern && typeof value === "string") {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(value)) {
        return { valid: false, error: `${field.label} format is invalid` };
      }
    }
  }

  return { valid: true };
}
