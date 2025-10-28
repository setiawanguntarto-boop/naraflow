# Fix: Duplicate Configuration Problem

## Problem Identified
User harus mengisi konfigurasi **dua kali** dengan field yang sama:

1. **Lampiran 1** - `ConfigurationPanel` (di workflow builder sidebar):
   - Agent Name
   - Phone Number ID
   - Access Token
   - WABA ID
   - Environment
   - Webhook URL
   - API Key

2. **Lampiran 2** - `DeployAgentModal` (setelah klik Deploy):
   - Sama seperti lampiran 1, user harus mengisi **ULANG** field yang sama

## Root Cause
`ConfigurationPanel` tidak mengirim data konfigurasi ke `DeployAgentModal`, sehingga modal membuka form kosong dan meminta user mengisi ulang.

## Solution Implemented

### 1. Updated `ConfigurationPanel.tsx`
**Change**: Kirim semua field config saat tombol deploy diklik
```typescript
const handleDeploy = () => {
  const deployConfig = {
    agentName: agentName.trim(),
    environment: environment,
    phoneNumberId: phoneNumberId.trim(),
    accessToken: accessToken.trim(),
    wabaId: wabaId.trim() || undefined,
    webhookUrl: webhookUrl.trim() || undefined,
    apiKey: apiKey.trim() || undefined,
    nodes: nodes.length,
    edges: edges.length
  };

  console.log("📤 Sending config to DeployAgentModal:", deployConfig);
  toast.success("Opening deployment wizard...");
  
  // Pass data to DeployAgentModal
  onDeploy?.(deployConfig);
};
```

### 2. Updated `workflow-studio.tsx`
**Change**: Simpan config ke state dan kirim ke modal
```typescript
const [deploymentConfig, setDeploymentConfig] = useState<any>(null);

// Di ConfigurationPanel callback
onDeploy={config => {
  setDeploymentConfig(config);
  setShowDeployModal(true);
}}

// Di DeployAgentModal
<DeployAgentModal
  open={showDeployModal}
  onOpenChange={setShowDeployModal}
  workflow={{
    nodes: Object.values(nodes),
    edges: Object.values(edges),
  }}
  initialConfig={deploymentConfig}
/>
```

### 3. Updated `DeployAgentModal.tsx`
**Changes**:
- Accept `initialConfig` prop
- Pre-fill form dengan data dari `initialConfig`
- Show info alert bahwa config sudah terisi

```typescript
interface DeployAgentModalProps {
  // ... existing props
  initialConfig?: {
    agentName?: string;
    phoneNumberId?: string;
    accessToken?: string;
    wabaId?: string;
    environment?: string;
    webhookUrl?: string;
    apiKey?: string;
  };
}

// Pre-fill form saat modal opens
useEffect(() => {
  if (open && initialConfig) {
    if (initialConfig.agentName) setAgentName(initialConfig.agentName);
    if (initialConfig.environment) setEnvironment(initialConfig.environment);
    if (initialConfig.phoneNumberId) setPhoneNumberId(initialConfig.phoneNumberId);
    if (initialConfig.accessToken) setAccessToken(initialConfig.accessToken);
    if (initialConfig.wabaId) setWabaId(initialConfig.wabaId);
    if (initialConfig.webhookUrl) setWebhookUrl(initialConfig.webhookUrl);
    if (initialConfig.apiKey) setApiKey(initialConfig.apiKey);
  }
}, [open, initialConfig]);
```

### 4. Visual Indicator
**Info Alert** di Step 1 menunjukkan bahwa config sudah pre-filled:
```typescript
{initialConfig && (
  <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 p-3">
    <div className="flex items-start gap-2">
      <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
      <div className="text-sm text-blue-800 dark:text-blue-200">
        <p className="font-semibold mb-1">Configuration pre-filled from workspace</p>
        <p className="text-xs">
          Review and update if needed, then proceed to simulation
        </p>
      </div>
    </div>
  </div>
)}
```

## Benefits

✅ **No more duplicate input** - User hanya isi sekali di `ConfigurationPanel`
✅ **Seamless experience** - Data otomatis di-transfer ke modal
✅ **User can still edit** - Form di modal bisa diubah jika perlu
✅ **Clear visual feedback** - Alert menunjukkan data sudah pre-filled

## User Flow (After Fix)

1. User mengisi konfigurasi di `ConfigurationPanel` (sidebar)
2. User klik "Deploy Agent"
3. `DeployAgentModal` terbuka dengan **semua field sudah terisi**
4. User melihat alert: "Configuration pre-filled from workspace"
5. User bisa review/edit jika perlu, lalu klik "Next" untuk simulasi
6. Proses deployment berjalan

## Testing

1. Isi form di ConfigurationPanel
2. Klik "Deploy Agent"
3. Verify: Modal terbuka dengan field sudah terisi
4. Verify: Alert muncul "Configuration pre-filled from workspace"
5. Verify: User bisa edit field jika perlu
6. Verify: User bisa langsung klik "Next" tanpa isi ulang

## Files Modified

- `src/components/workflow/ConfigurationPanel.tsx` - Mengirim config data
- `src/components/workflow/DeployAgentModal.tsx` - Menerima dan menggunakan initialConfig
- `src/components/sections/workflow-studio.tsx` - State management untuk deploymentConfig

