/**
 * WhatsApp Templates for Broiler Workflow
 * Template messages yang dapat digunakan untuk berbagai notifikasi dalam workflow Broiler
 */

export interface WhatsAppTemplate {
  id: string;
  name: string;
  body: string;
  variables: string[];
  category: string;
}

export const whatsappTemplates: Record<string, WhatsAppTemplate> = {
  ALERT_MORTALITY: {
    id: 'ALERT_MORTALITY',
    name: 'Mortality Alert',
    body: `⚠️ ALERT: Mortalitas Tinggi pada {{farmName}} (Kandang {{shedId}})
Tanggal: {{date}}
Mortalitas: {{mortality}} ekor ({{mortality_pct}}%)
Populasi Awal: {{population_start}} ekor
Mohon PPL segera cek lapangan.
Link QR Kandang: {{qrUrl}}`,
    variables: ['farmName', 'shedId', 'date', 'mortality', 'mortality_pct', 'population_start', 'qrUrl'],
    category: 'alert'
  },

  HARVEST_SUMMARY: {
    id: 'HARVEST_SUMMARY',
    name: 'Harvest Summary Report',
    body: `📦 Laporan Panen - {{farmName}}
Siklus: {{cycleId}}
Tanggal: {{harvestDate}}

📊 Data Panen:
• Jumlah: {{qty}} ekor
• Berat Total: {{total_weight}} kg
• Berat Rata-rata: {{avg_weight}} gr

📈 Performance Siklus:
• FCR: {{FCR}}
• ADG: {{ADG}} gr/hari
• Mortality: {{mortality_pct}}%

Lihat laporan lengkap: {{pdfUrl}}`,
    variables: ['farmName', 'cycleId', 'harvestDate', 'qty', 'total_weight', 'avg_weight', 'FCR', 'ADG', 'mortality_pct', 'pdfUrl'],
    category: 'report'
  },

  QR_ASSIGNED: {
    id: 'QR_ASSIGNED',
    name: 'QR Code Assigned',
    body: `✅ QR Code Kandang Assigned!

Farm: {{farmName}}
Kandang: {{shedId}}
Link QR: {{qrUrl}}

Scan QR code untuk check-in harian.
Kamu bisa mulai input data mulai hari ini!`,
    variables: ['farmName', 'shedId', 'qrUrl'],
    category: 'notification'
  },

  DAILY_CHECKIN_REMINDER: {
    id: 'DAILY_CHECKIN_REMINDER',
    name: 'Daily Check-in Reminder',
    body: `📅 Reminder: Waktunya Check-in Harian!

Farm: {{farmName}}
Kandang: {{shedId}}
Tanggal: {{date}}

Silakan input data:
• Mortalitas (ekor)
• Pakan (kg)
• Berat rata-rata (gr)
• Suhu (°C)

Reply dengan format:
INPUT <mortalitas> <pakan> <berat> <suhu>`,
    variables: ['farmName', 'shedId', 'date'],
    category: 'reminder'
  },

  PERFORMANCE_UPDATE: {
    id: 'PERFORMANCE_UPDATE',
    name: 'Performance Update',
    body: `📊 Update Performance Siklus {{cycleId}}

Farm: {{farmName}}
Tanggal: {{date}}

📈 Metrics:
• FCR: {{FCR}} (Target: < 1.6)
• ADG: {{ADG}} gr/hari
• Mortality: {{mortality_pct}}%

Status: {{status}}`,
    variables: ['cycleId', 'farmName', 'date', 'FCR', 'ADG', 'mortality_pct', 'status'],
    category: 'update'
  },

  FARM_REGISTERED: {
    id: 'FARM_REGISTERED',
    name: 'Farm Registration Confirmation',
    body: `🏷️ Farm Berhasil Terdaftar!

Nama Farm: {{farmName}}
Peternak: {{owner}}
Lokasi: {{location}}
Kapasitas: {{capacity}} ekor
Tanggal Mulai: {{start_date}}

ID Farm: {{farmId}}
Silakan simpan ID ini untuk keperluan selanjutnya.`,
    variables: ['farmName', 'owner', 'location', 'capacity', 'start_date', 'farmId'],
    category: 'confirmation'
  }
};

/**
 * Render WhatsApp template dengan variabel
 */
export function renderWhatsAppTemplate(templateId: string, variables: Record<string, any>): string {
  const template = whatsappTemplates[templateId];
  
  if (!template) {
    console.warn(`Template ${templateId} not found`);
    return '';
  }

  let rendered = template.body;
  
  // Replace all variables
  template.variables.forEach(variable => {
    const value = variables[variable] || '';
    const regex = new RegExp(`{{${variable}}}`, 'g');
    rendered = rendered.replace(regex, String(value));
  });

  return rendered;
}

/**
 * Get all templates by category
 */
export function getTemplatesByCategory(category: string): WhatsAppTemplate[] {
  return Object.values(whatsappTemplates).filter(template => template.category === category);
}

