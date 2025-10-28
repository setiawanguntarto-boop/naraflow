/**
 * Condition Templates for Broiler Workflow
 * Provides pre-configured condition logic for various broiler farming scenarios
 */

export interface ConditionTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  code: string;
  paths: Array<{
    id: string;
    label: string;
    description: string;
  }>;
}

export const BROILER_CONDITION_TEMPLATES: Record<string, ConditionTemplate> = {
  mortality_threshold: {
    id: 'mortality_threshold',
    name: 'Mortality Threshold Check',
    description: 'Cek jika mortalitas melebihi batas normal',
    category: 'safety',
    code: `// Check mortality threshold and route accordingly
const mortalityPct = input.mortality_pct;

if (mortalityPct > 5.0) {
  return { 
    path: 'critical', 
    message: '🚨 CRITICAL: Mortality ' + mortalityPct + '%',
    severity: 'critical'
  };
} else if (mortalityPct > 2.0) {
  return { 
    path: 'warning', 
    message: '⚠️ WARNING: Mortality ' + mortalityPct + '%',
    severity: 'warning'
  };
} else {
  return { 
    path: 'normal', 
    message: '✅ NORMAL: Mortality ' + mortalityPct + '%',
    severity: 'normal'
  };
}`,
    paths: [
      { id: 'critical', label: 'Critical Alert', description: 'Mortalitas > 5%' },
      { id: 'warning', label: 'Warning Alert', description: 'Mortalitas 2-5%' },
      { id: 'normal', label: 'Normal Process', description: 'Mortalitas < 2%' }
    ]
  },

  harvest_readiness: {
    id: 'harvest_readiness',
    name: 'Harvest Readiness Check',
    description: 'Cek apakah broiler sudah siap panen berdasarkan berat dan umur',
    category: 'production',
    code: `// Check harvest readiness
const avgWeight = input.avg_weight_g;
const dayOfCycle = input.day_of_cycle;
const healthStatus = input.health_status || 'good';

// Standard broiler ready at 1.5-2kg (1500-2000g) and 30-40 days
if (avgWeight >= 1800 && dayOfCycle >= 32 && healthStatus === 'good') {
  return { 
    path: 'ready', 
    message: 'Siap panen - berat: ' + avgWeight + 'g, umur: ' + dayOfCycle + ' hari'
  };
} else if (avgWeight >= 1500 && dayOfCycle >= 28) {
  return { 
    path: 'almost_ready', 
    message: 'Hampir siap - berat: ' + avgWeight + 'g'
  };
} else {
  return { 
    path: 'not_ready', 
    message: 'Belum siap - perlu: ' + (Math.max(0, 1800 - avgWeight)) + 'g lagi'
  };
}`,
    paths: [
      { id: 'ready', label: 'Ready for Harvest', description: 'Berat ≥ 1800g, umur ≥ 32 hari' },
      { id: 'almost_ready', label: 'Almost Ready', description: 'Berat ≥ 1500g, umur ≥ 28 hari' },
      { id: 'not_ready', label: 'Not Ready', description: 'Butuh pertumbuhan lebih' }
    ]
  },

  temperature_monitoring: {
    id: 'temperature_monitoring',
    name: 'Temperature Range Check',
    description: 'Monitor suhu kandang dalam range optimal',
    category: 'environment',
    code: `// Check temperature range
const temperature = input.temp_c;
const dayOfCycle = input.day_of_cycle;

// Optimal temperature based on broiler age
let minTemp, maxTemp;
if (dayOfCycle <= 7) {
  minTemp = 30; maxTemp = 32; // Week 1
} else if (dayOfCycle <= 14) {
  minTemp = 28; maxTemp = 30; // Week 2
} else if (dayOfCycle <= 21) {
  minTemp = 26; maxTemp = 28; // Week 3
} else {
  minTemp = 24; maxTemp = 26; // Week 4+
}

if (temperature < minTemp - 2) {
  return { path: 'too_cold', message: 'Suhu terlalu dingin: ' + temperature + '°C' };
} else if (temperature > maxTemp + 2) {
  return { path: 'too_hot', message: 'Suhu terlalu panas: ' + temperature + '°C' };
} else if (temperature < minTemp || temperature > maxTemp) {
  return { path: 'suboptimal', message: 'Suhu suboptimal: ' + temperature + '°C' };
} else {
  return { path: 'optimal', message: 'Suhu optimal: ' + temperature + '°C' };
}`,
    paths: [
      { id: 'too_cold', label: 'Too Cold', description: 'Suhu terlalu dingin' },
      { id: 'too_hot', label: 'Too Hot', description: 'Suhu terlalu panas' },
      { id: 'suboptimal', label: 'Suboptimal', description: 'Suhu di luar range optimal' },
      { id: 'optimal', label: 'Optimal', description: 'Suhu dalam range optimal' }
    ]
  },

  feed_efficiency: {
    id: 'feed_efficiency',
    name: 'Feed Conversion Check',
    description: 'Monitor efisiensi pakan (FCR)',
    category: 'performance',
    code: `// Check feed conversion ratio
const FCR = input.FCR;
const optimalFCR = 1.8; // Optimal FCR for broiler
const targetFCR = 2.0;  // Target FCR maximum

if (FCR <= optimalFCR) {
  return { path: 'excellent', message: 'FCR Excellent: ' + FCR.toFixed(2) };
} else if (FCR <= targetFCR) {
  return { path: 'good', message: 'FCR Good: ' + FCR.toFixed(2) };
} else if (FCR <= targetFCR + 0.3) {
  return { path: 'fair', message: 'FCR Fair: ' + FCR.toFixed(2) };
} else {
  return { path: 'poor', message: 'FCR Poor: ' + FCR.toFixed(2) + ' - Perlu perhatian!' };
}`,
    paths: [
      { id: 'excellent', label: 'Excellent FCR', description: 'FCR ≤ 1.8' },
      { id: 'good', label: 'Good FCR', description: 'FCR 1.8-2.0' },
      { id: 'fair', label: 'Fair FCR', description: 'FCR 2.0-2.3' },
      { id: 'poor', label: 'Poor FCR', description: 'FCR > 2.3' }
    ]
  }
};

/**
 * Get condition template by ID
 */
export const getConditionTemplate = (id: string): ConditionTemplate | undefined => {
  return BROILER_CONDITION_TEMPLATES[id];
};

/**
 * Get all condition templates
 */
export const getAllConditionTemplates = (): ConditionTemplate[] => {
  return Object.values(BROILER_CONDITION_TEMPLATES);
};

/**
 * Get condition templates by category
 */
export const getConditionTemplatesByCategory = (category: string): ConditionTemplate[] => {
  return Object.values(BROILER_CONDITION_TEMPLATES).filter(
    template => template.category === category
  );
};

