import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  HardDrive,
  X,
  RefreshCw,
  Smartphone,
  Monitor
} from 'lucide-react';
import { toast } from 'sonner';

interface PWAInstallPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PWAInstallPrompt = ({ open, onOpenChange }: PWAInstallPromptProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installError, setInstallError] = useState<string | null>(null);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true) {
        setIsInstalled(true);
      }
    };

    checkInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast.success('Naraflow has been installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast.error('Install prompt not available');
      return;
    }

    try {
      setInstallError(null);
      
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // Clear the deferred prompt
      setDeferredPrompt(null);
      onOpenChange(false);
      
    } catch (error) {
      console.error('Installation failed:', error);
      setInstallError(error instanceof Error ? error.message : 'Installation failed');
    }
  };

  const handleManualInstall = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome')) {
      toast.info('Click the install button in your browser\'s address bar');
    } else if (userAgent.includes('firefox')) {
      toast.info('Click the install button in your browser\'s address bar');
    } else if (userAgent.includes('safari')) {
      toast.info('Tap the Share button and select "Add to Home Screen"');
    } else if (userAgent.includes('edge')) {
      toast.info('Click the install button in your browser\'s address bar');
    } else {
      toast.info('Look for the install option in your browser\'s menu');
    }
  };

  if (isInstalled) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              App Installed
            </DialogTitle>
            <DialogDescription>
              Naraflow has been successfully installed on your device.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                You can now access Naraflow directly from your home screen or app drawer.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => onOpenChange(false)} className="flex-1">
                Got it
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-6 h-6 text-brand-primary" />
            Install Naraflow
          </DialogTitle>
          <DialogDescription>
            Install Naraflow as a native app for a better experience.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Smartphone className="w-5 h-5 text-brand-primary" />
              <div>
                <p className="font-medium text-sm">Mobile Access</p>
                <p className="text-xs text-muted-foreground">Access from your home screen</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Monitor className="w-5 h-5 text-brand-primary" />
              <div>
                <p className="font-medium text-sm">Desktop App</p>
                <p className="text-xs text-muted-foreground">Native desktop experience</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <HardDrive className="w-5 h-5 text-brand-primary" />
              <div>
                <p className="font-medium text-sm">Offline Support</p>
                <p className="text-xs text-muted-foreground">Work without internet connection</p>
              </div>
            </div>
          </div>
          
          {installError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{installError}</p>
            </div>
          )}
          
          <div className="flex gap-2">
            {deferredPrompt ? (
              <Button onClick={handleInstall} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Install App
              </Button>
            ) : (
              <Button onClick={handleManualInstall} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Install Instructions
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
