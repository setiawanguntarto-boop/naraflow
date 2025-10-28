import { useState, useEffect } from 'react';
import { Cloud, Database, HardDrive, CheckCircle, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CloudConfig, CloudInfrastructureNeeds, generateBucketName } from '@/lib/cloudInfrastructureDetector';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CloudInfrastructureStepProps {
  agentName: string;
  environment: string;
  needs: CloudInfrastructureNeeds;
  config: CloudConfig;
  onChange: (config: CloudConfig) => void;
}

export function CloudInfrastructureStep({
  agentName,
  environment,
  needs,
  config,
  onChange
}: CloudInfrastructureStepProps) {
  const [autoGenerate, setAutoGenerate] = useState(true);
  // Simple FX for local display only (non-binding)
  const USD_TO_IDR = 15500; // approx. rate for estimate

  // Estimate monthly cost based on current selections
  const estimateCostUSD = () => {
    // Baseline
    let base = 5; // $5 baseline

    // Region modifier
    const regionFactorMap: Record<string, number> = {
      "us-central1": 1.0,
      "europe-west1": 1.1,
      "asia-east1": 1.2,
      "asia-southeast1": 1.15,
    };
    const regionKey = (config.storage.region || "us-central1").toLowerCase();
    const regionFactor = regionFactorMap[regionKey] ?? 1.0;

    // Storage class modifier
    const storageClassFactorMap: Record<string, number> = {
      standard: 1.0,
      nearline: 0.7,
      coldline: 0.5,
    };
    const storageClassFactor = storageClassFactorMap[config.storage.storageClass] ?? 1.0;

    // Database cost add-on
    let databaseAddon = 0;
    if (needs.database && config.database.enabled) {
      if (config.database.type === "firestore") databaseAddon = 2;
      if (config.database.type === "bigtable") databaseAddon = 6;
    }

    // API gateway add-on
    const apiAddon = needs.api ? 2 : 0;

    // Monitoring add-on
    const monitoringAddon = needs.monitoring && config.monitoring.enabled ? 1 : 0;

    // Scaling add-on (very rough heuristic)
    const scalingAddon = Math.max(0, (config.scaling.minInstances - 1) * 0.5);

    const estimated = base * regionFactor * storageClassFactor + databaseAddon + apiAddon + monitoringAddon + scalingAddon;
    const min = Math.max(3, estimated * 0.8);
    const max = estimated * 1.3;
    return { min, max };
  };

  // Auto-generate bucket name when agentName changes
  useEffect(() => {
    if (autoGenerate && agentName && !config.storage.bucketName) {
      const bucketName = generateBucketName(agentName, environment);
      onChange({
        ...config,
        storage: { ...config.storage, bucketName }
      });
    }
  }, [agentName, environment, autoGenerate]);

  if (!needs.requiresCloud) {
    return (
      <Alert>
        <CheckCircle className="w-4 h-4" />
        <AlertDescription>
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">No cloud infrastructure required</p>
              <p className="text-sm text-green-600 mt-1">
                Your workflow can run without additional cloud resources.
              </p>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 text-black">
      {/* Detected Requirements with subtle animation */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-black opacity-100 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Detected Cloud Infrastructure Needs
          </h4>
          <Badge variant="secondary">Google Cloud</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {needs.storage && (
            <div className="flex items-center gap-2 text-sm opacity-100 animate-fade-in">
              <HardDrive className="w-4 h-4 text-black" />
              <span className="text-black">Cloud Storage</span>
            </div>
          )}
          {needs.database && (
            <div className="flex items-center gap-2 text-sm opacity-100 animate-fade-in [animation-delay:100ms]">
              <Database className="w-4 h-4 text-black" />
              <span className="text-black">Database</span>
            </div>
          )}
          {needs.api && (
            <div className="flex items-center gap-2 text-sm opacity-100 animate-fade-in [animation-delay:200ms]">
              <Cloud className="w-4 h-4 text-black" />
              <span className="text-black">API Gateway</span>
            </div>
          )}
          {needs.monitoring && (
            <div className="flex items-center gap-2 text-sm opacity-100 animate-fade-in [animation-delay:300ms]">
              <CheckCircle className="w-4 h-4 text-black" />
              <span className="text-black">Monitoring</span>
            </div>
          )}
        </div>
      </div>

      {/* Storage Configuration */}
      {needs.storage && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="bucketName">Cloud Storage Bucket</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAutoGenerate(!autoGenerate)}
            >
              {autoGenerate ? 'Customize' : 'Auto-generate'}
            </Button>
          </div>
          
          <Input
            id="bucketName"
            value={config.storage.bucketName}
            onChange={(e) => onChange({
              ...config,
              storage: { ...config.storage, bucketName: e.target.value }
            })}
            disabled={autoGenerate}
            placeholder="bucket-name"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-black/70">Region</Label>
              <Select
                value={config.storage.region}
                onValueChange={(value) => onChange({
                  ...config,
                  storage: { ...config.storage, region: value }
                })}
              >
                <SelectTrigger className="bg-white text-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="us-central1">us-central1 (Iowa)</SelectItem>
                  <SelectItem value="europe-west1">europe-west1 (Belgium)</SelectItem>
                  <SelectItem value="asia-east1">asia-east1 (Taiwan)</SelectItem>
                  <SelectItem value="asia-southeast1">asia-southeast1 (Singapore)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-xs text-black/70">Storage Class</Label>
              <Select
                value={config.storage.storageClass}
                onValueChange={(value) => onChange({
                  ...config,
                  storage: { ...config.storage, storageClass: value }
                })}
              >
                <SelectTrigger className="bg-white text:black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="nearline">Nearline</SelectItem>
                  <SelectItem value="coldline">Coldline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Database Configuration */}
      {needs.database && (
        <div className="space-y-3">
          <Label className="text-black">Database Configuration</Label>
          {/* Alternative options prompt */}
          <p className="text-xs text-black/70">Choose a database type. Firestore fits most use cases; Bigtable is for high throughput analytics. You can also select "No Database".</p>
          <Select
            value={config.database.type}
            onValueChange={(value) => onChange({
              ...config,
              database: { ...config.database, type: value }
            })}
          >
            <SelectTrigger className="bg-white text-black">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="firestore">Firestore (Recommended)</SelectItem>
              <SelectItem value="bigtable">Bigtable (High Volume)</SelectItem>
              <SelectItem value="none">No Database</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-black/70">
            Database is required for storing persistent data in your workflow
          </p>
        </div>
      )}

      {/* Cost Estimation */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-black opacity-100">Perkiraan Biaya Bulanan</p>
            <p className="text-xs text-black opacity-100 mt-1">
              Berdasarkan kompleksitas workflow dan kebutuhan penyimpanan
            </p>
          </div>
          <div className="text-right">
            {(() => {
              const { min, max } = estimateCostUSD();
              return (
                <>
                  <div className="text-lg sm:text-xl font-bold text-black opacity-100">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(min * USD_TO_IDR)}
                    {" "}-{" "}
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(max * USD_TO_IDR)}
                  </div>
                  <div className="text-[10px] sm:text-xs text-black/70">≈ ${min.toFixed(0)} – ${max.toFixed(0)}</div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

