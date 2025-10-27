# Budidaya Broiler Workflow - Setup Guide

## Overview

Workflow Budidaya Broiler adalah sistem manajemen siklus broiler lengkap yang mencakup:
- Registrasi farm dan peternak
- QR code assignment per kandang
- Daily check-in untuk monitoring
- Performance calculation (FCR, ADG, mortality %)
- Mortality alert system
- Harvest processing
- Report generation

## File Structure

```
src/lib/
├── templates/
│   ├── workflowTemplates.ts       # Template workflow Broiler
│   ├── workflowPresets.ts         # Preset untuk UI Quick Templates
│   └── whatsappTemplates.ts       # WhatsApp message templates
├── config/
│   └── broilerConfig.ts           # Konfigurasi, field mapping, validation rules
├── executors/
│   ├── performanceCalcExecutor.ts # Calculator FCR/ADG/mortality%
│   └── reportGeneratorExecutor.ts # Generator laporan panen
└── services/
    └── googleSheetsService.ts    # Google Sheets integration

```

## Environment Variables

Tambahkan variabel berikut ke file `.env`:

```env
# Google Sheets Configuration
VITE_GOOGLE_SHEET_BROILER_ID=your_google_sheet_id
VITE_GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key

# QR Code Configuration
VITE_QR_BASE_URL=https://your-domain.com/qr

# WhatsApp Numbers (optional)
VITE_PPL_PHONE=+6281234567890
VITE_ADMIN_PHONE=+6281234567891
```

## Google Sheets Setup

### 1. Create Sheet dengan nama "Broiler Log"

Buka Google Sheets dan buat sheet baru dengan ID yang akan di-set di environment variable.

### 2. Setup Sheet Structure

#### Tab: daily_log
| Column | Key | Type | Description |
|--------|-----|------|-------------|
| timestamp | timestamp | date | Timestamp input |
| farm_id | farm_id | string | ID Farm |
| shed_id | shed_id | string | ID Kandang |
| day_of_cycle | day_of_cycle | number | Hari ke-berapa dalam siklus |
| population_start | population_start | number | Populasi awal |
| mortality | mortality | number | Jumlah ekor mati |
| mortality_pct | mortality_pct | number | Persentase mortalitas |
| feed_kg | feed_kg | number | Pakan dalam kg |
| avg_weight_g | avg_weight_g | number | Berat rata-rata (gram) |
| temp_c | temp_c | number | Suhu (°C) |
| FCR | FCR | number | Feed Conversion Ratio |
| ADG | ADG | number | Average Daily Gain (gr/hari) |
| reporter_phone | reporter_phone | string | No. HP yang input |
| note | note | string | Catatan |

#### Tab: harvest_log
| Column | Key | Type | Description |
|--------|-----|------|-------------|
| harvest_date | harvest_date | date | Tanggal panen |
| farm_id | farm_id | string | ID Farm |
| cycle_id | cycle_id | string | ID Siklus |
| qty | qty | number | Jumlah ekor |
| total_weight_kg | total_weight_kg | number | Berat total (kg) |
| avg_weight_g | avg_weight_g | number | Berat rata-rata (gram) |
| cycle_FCR | cycle_FCR | number | FCR siklus |
| cycle_ADG | cycle_ADG | number | ADG siklus |
| cycle_mortality_pct | cycle_mortality_pct | number | Mortality % siklus |
| duration_days | duration_days | number | Durasi siklus (hari) |
| owner_phone | owner_phone | string | No. HP peternak |
| report_url | report_url | string | URL laporan PDF |

### 3. Enable Google Sheets API

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project atau pilih project existing
3. Enable Google Sheets API
4. Create credentials (Service Account atau OAuth)
5. Download credentials dan simpan dengan aman

## WhatsApp Templates

Template yang tersedia di `src/lib/templates/whatsappTemplates.ts`:

### ALERT_MORTALITY
Alert ketika mortalitas melewati threshold (>2%)

```
⚠️ ALERT: Mortalitas Tinggi pada {{farmName}} (Kandang {{shedId}})
Tanggal: {{date}}
Mortalitas: {{mortality}} ekor ({{mortality_pct}}%)
```

### HARVEST_SUMMARY
Laporan panen lengkap dengan performance metrics

```
📦 Laporan Panen - {{farmName}}
Siklus: {{cycleId}}
Jumlah: {{qty}} ekor
FCR: {{FCR}}
```

### DAILY_CHECKIN_REMINDER
Reminder untuk input data harian

### QR_ASSIGNED
Notifikasi setelah QR code di-assign ke kandang

### PERFORMANCE_UPDATE
Update performa siklus

## Usage

### 1. Menggunakan Preset

Di Workflow Studio:
1. Buka tab "Quick Templates"
2. Pilih "Budidaya Broiler - End-to-End"
3. Klik Generate
4. Workflow akan ter-load ke canvas

### 2. Customize Workflow

Setelah workflow ter-load, Anda bisa:
- Edit node properties
- Add/remove nodes
- Adjust edges
- Configure executors

### 3. Running Workflow

1. Fill in the data di node Farm Registration:
   - Nama farm
   - Nama peternak
   - Lokasi
   - Kapasitas kandang
   - Tanggal mulai

2. QR code akan otomatis di-generate dan dikirim via WhatsApp

3. Daily check-in:
   - Input data harian
   - Validation otomatis
   - Jika mortalitas >2%, alert akan dikirim

4. Harvest:
   - Trigger dengan keyword "panen" atau "harvest"
   - Input jumlah ekor dan berat total
   - Report PDF akan di-generate
   - Notifikasi dikirim via WhatsApp

## Customization

### Modifying Validation Rules

Edit `src/lib/config/broilerConfig.ts`:

```typescript
validationRules: {
  mortality_min: 0,
  mortality_max_pct_alert: 2.0,  // Ubah threshold alert
  mortality_max_pct_critical: 5.0,
  // ... other rules
}
```

### Adding New WhatsApp Templates

Edit `src/lib/templates/whatsappTemplates.ts`:

```typescript
export const whatsappTemplates: Record<string, WhatsAppTemplate> = {
  // ... existing templates
  CUSTOM_TEMPLATE: {
    id: 'CUSTOM_TEMPLATE',
    name: 'Custom Template',
    body: 'Your message {{variable}}',
    variables: ['variable'],
    category: 'custom'
  }
};
```

### Modifying Performance Calculation

Edit `src/lib/executors/performanceCalcExecutor.ts`:

```typescript
// Adjust calculation formula
const FCR = weightGainKg > 0 ? feed / weightGainKg : null;
// Add custom metrics as needed
```

## Testing

### Unit Tests

```bash
npm test
```

### Mock Testing

Untuk development tanpa integrasi Google Sheets actual:
- Services akan menggunakan mock implementation
- Data ditampilkan di console
- WhatsApp messages akan di-log

### Integration Testing

1. Setup Google Sheets dengan credentials
2. Test dengan real WhatsApp numbers
3. Verify data tersimpan di sheet
4. Check report generation

## Troubleshooting

### "Template not found"
- Pastikan template ID ada di `whatsappTemplates.ts`
- Check bahwa template sudah di-export

### "Sheet not accessible"
- Verify Google Sheets API credentials
- Check environment variables
- Ensure service account has access to sheet

### "Validation failed"
- Check validation rules di `broilerConfig.ts`
- Verify input data format
- Check min/max constraints

## Support

Untuk pertanyaan atau issues, silakan buat issue di repository atau hubungi tim development.

