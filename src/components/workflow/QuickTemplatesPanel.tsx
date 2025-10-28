import { useState } from "react";
import { Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface QuickTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  prompt: string;
  nodes: number;
  complexity: "simple" | "medium" | "complex";
}

export const BROILER_TEMPLATES: QuickTemplate[] = [
  {
    id: "broiler-full",
    name: "Budidaya Broiler - End to End",
    description: "Workflow lengkap untuk manajemen siklus broiler dari registrasi hingga panen",
    category: "agriculture",
    tags: ["broiler", "poultry", "monitoring", "reporting"],
    prompt: `Workflow Budidaya Broiler - Sistem Manajemen Lengkap

## Overview
Sistem manajemen siklus broiler terintegrasi dengan WhatsApp, Google Sheets, dan alert system.

## Core Components:

1. **FARM REGISTRATION**
   - Input data farm: nama farm, peternak, lokasi, kapasitas
   - Generate unique farm_id
   - Setup kandang dengan QR code assignment

2. **DAILY CHECK-IN SYSTEM**
   - Input data harian: mortalitas, pakan, berat, suhu
   - Auto-calculate: FCR, ADG, mortality %
   - Validation: mortality threshold alert (>2%)
   - WhatsApp confirmation to farmer

3. **PERFORMANCE MONITORING**
   - Real-time performance metrics
   - Cumulative FCR calculation
   - Growth trend analysis
   - Mortality tracking

4. **HARVEST PROCESSING**
   - Input data panen: jumlah ekor, berat total
   - Calculate cycle performance
   - Generate PDF report
   - Send summary via WhatsApp

5. **ALERT SYSTEM**
   - Mortality alert (>2% → PPL & Admin)
   - Daily reminder for data entry
   - Harvest readiness notification

## Integration:
- WhatsApp for notifications
- Google Sheets for data storage
- QR code for shed identification
- PDF report generation`,
    nodes: 12,
    complexity: "complex"
  },
  {
    id: "broiler-daily",
    name: "Broiler Daily Check-in",
    description: "Template cepat untuk input data harian broiler dengan validasi otomatis",
    category: "agriculture", 
    tags: ["daily", "checkin", "performance"],
    prompt: `Daily Check-in Workflow untuk Broiler

## Input Data Harian:
- Kandang (shed_id)
- Hari ke (day_of_cycle) 
- Jumlah mati (mortality)
- Pakan konsumsi (feed_kg)
- Berat rata-rata (avg_weight_g)
- Suhu kandang (temp_c)

## Auto Calculation:
- Mortality percentage
- FCR (Feed Conversion Ratio)
- ADG (Average Daily Gain)
- Current population

## Alert System:
- Jika mortality > 2% → kirim alert ke PPL
- Jika mortality > 5% → kirim critical alert

## Output:
- WhatsApp confirmation ke peternak
- Simpan data ke Google Sheets
- Update performance metrics`,
    nodes: 6,
    complexity: "simple"
  },
  {
    id: "broiler-harvest",
    name: "Broiler Harvest Processing", 
    description: "Processing data panen dan generate laporan performa siklus",
    category: "agriculture",
    tags: ["harvest", "report", "performance"],
    prompt: `Harvest Processing Workflow untuk Broiler

## Input Data Panen:
- Kandang (shed_id)
- Tanggal panen
- Jumlah ekor panen
- Berat total (kg)
- Durasi siklus (hari)

## Performance Calculation:
- Cycle FCR
- Cycle ADG  
- Cycle mortality %
- Average weight
- Production efficiency

## Report Generation:
- PDF harvest report
- Performance summary
- Financial calculation (optional)
- Historical comparison

## Distribution:
- WhatsApp ke peternak & PPL
- Simpan ke harvest_log sheet
- Update farm status`,
    nodes: 8,
    complexity: "medium"
  },
  {
    id: "broiler-data-infra",
    name: "Broiler Data Infrastructure",
    description: "Data pipeline, validation, dan centralized data management untuk multi-farm",
    category: "data",
    tags: ["data", "infrastructure", "pipeline", "validation"],
    prompt: `Data Infrastructure Workflow untuk Broiler

## Core Components:

1. **DATA COLLECTION PIPELINE**
   - Multi-source data aggregation (WhatsApp, IoT sensors, manual input)
   - Data ingestion from multiple farms
   - Data format standardization
   - Timestamp normalization

2. **DATA VALIDATION & QUALITY**
   - Field-level validation (range checks, format validation)
   - Cross-field validation (consistency checks)
   - Outlier detection and flagging
   - Data completeness checks
   - Duplicate detection

3. **DATA TRANSFORMATION**
   - Data normalization
   - Unit conversion (gram to kg, etc.)
   - Derived metrics calculation
   - Data enrichment (farm metadata)

4. **CENTRALIZED STORAGE**
   - Store Records to Google Sheets
   - Data warehousing structure
   - Historical data retention
   - Backup and versioning

5. **DATA SYNCHRONIZATION**
   - Multi-farm data sync
   - Real-time updates
   - Conflict resolution
   - Audit trail logging

6. **ANALYTICS & REPORTING**
   - Aggregated analytics across farms
   - Trend analysis
   - Performance benchmarking
   - Export to dashboards

## Integration:
- Google Sheets API for data storage
- Data validation rules
- Automated backups
- Real-time sync across farms`,
    nodes: 10,
    complexity: "complex"
  },
  {
    id: "broiler-cloud-infra",
    name: "Broiler Cloud Infrastructure",
    description: "Cloud storage, backups, dan distributed analytics untuk operasi skala besar",
    category: "cloud",
    tags: ["cloud", "backup", "analytics", "scalable"],
    prompt: `Cloud Infrastructure Workflow untuk Broiler

## Core Components:

1. **CLOUD STORAGE SETUP**
   - Automated cloud backup
   - Multi-region data replication
   - Encrypted data storage
   - Version control for historical data

2. **DATA BACKUP SYSTEM**
   - Automated daily backups
   - Incremental backup strategy
   - Backup verification
   - Disaster recovery plan

3. **CLOUD ANALYTICS**
   - Multi-farm analytics dashboard
   - Performance comparison across farms
   - Real-time monitoring
   - Predictive analytics

4. **API INTEGRATION**
   - RESTful API for external systems
   - Webhook integrations
   - Third-party service connections
   - API rate limiting and security

5. **NOTIFICATION SYSTEM**
   - Multi-channel notifications (Email, WhatsApp, SMS)
   - Priority-based alert routing
   - Escalation rules
   - Notification preferences

6. **SCALABILITY FEATURES**
   - Load balancing
   - Auto-scaling capabilities
   - Performance monitoring
   - Resource optimization

## Integration:
- Cloud storage (AWS S3, Google Cloud Storage)
- Database backup (automated)
- API gateway
- Monitoring and alerting
- Multi-region deployment`,
    nodes: 8,
    complexity: "complex"
  }
];

interface QuickTemplatesPanelProps {
  onTemplateSelect?: (template: QuickTemplate) => void;
  onGenerate?: (prompt: string, templateId: string) => void;
  className?: string;
}

export const QuickTemplatesPanel = ({ 
  onTemplateSelect, 
  onGenerate,
  className 
}: QuickTemplatesPanelProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<QuickTemplate | null>(null);

  const handleTemplateSelect = (template: QuickTemplate) => {
    setSelectedTemplate(template);
    onTemplateSelect?.(template);
  };

  const handleGenerate = () => {
    if (selectedTemplate) {
      onGenerate?.(selectedTemplate.prompt, selectedTemplate.id);
      // This will trigger the broiler workflow generation with the full template structure
    }
  };

  return (
    <div className={`h-full flex flex-col ${className || ''}`}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          <h2 className="text-lg font-semibold">Quick Templates</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Pilih template untuk memulai workflow broiler
        </p>
      </div>

      {/* Templates Grid */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-4">
          {BROILER_TEMPLATES.map((template) => (
            <Card 
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={
                      template.complexity === 'simple' ? 'secondary' :
                      template.complexity === 'medium' ? 'default' : 'destructive'
                    }
                    className="text-xs"
                  >
                    {template.complexity}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="text-xs">
                    {template.nodes} nodes
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Generate Button */}
      <div className="border-t border-border p-6">
        {selectedTemplate && (
          <div className="mb-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium mb-1">
              <Zap className="w-4 h-4 text-yellow-600" />
              Template Terpilih
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedTemplate.name}
            </div>
          </div>
        )}
        <Button 
          onClick={handleGenerate}
          disabled={!selectedTemplate}
          className="w-full"
        >
          <ChevronRight className="w-4 h-4 mr-2" />
          Generate Workflow
        </Button>
      </div>
    </div>
  );
};

