import { Button } from "@/components/ui/button-extended";
import { WhatsAppIcon } from "@/components/ui/icons";
import { PhoneMockup } from "@/components/phone-mockup";
import { CheckIcon } from "@/components/ui/icons";

export const Hero = () => {
  return (
    <section className="relative bg-gradient-hero text-surface-primary-foreground overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-glow/20 to-transparent"></div>
      
      <div className="container mx-auto px-6 py-20 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                WhatsApp-first
                <span className="block text-brand-accent">Workflow</span>
                <span className="block text-3xl md:text-5xl font-medium">for SMEs</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-surface-primary-foreground/90 leading-relaxed max-w-lg">
                Sederhanakan pencatatan, koordinasi, dan tata kelola bisnis Anda — 
                langsung dari WhatsApp, tanpa ribet aplikasi baru.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="whatsapp" 
                size="xl"
                asChild
                className="group"
              >
                <a
                  href="https://wa.me/6287731771859"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3"
                >
                  <WhatsAppIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  🚀 Coba Demo
                </a>
              </Button>
              
              <Button 
                variant="outline" 
                size="xl"
                asChild
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <a href="#how-it-works" className="flex items-center gap-2">
                  📖 Lihat Cara Kerja
                </a>
              </Button>
            </div>

            <div className="space-y-3">
              {[
                "Pencatatan langsung via WhatsApp",
                "Data rapi & transparan",
                "Siap dipakai untuk laporan & analisis"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-surface-primary-foreground/90">
                  <CheckIcon className="w-5 h-5 text-brand-accent" />
                  <span className="text-lg">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right content - Phone Mockup */}
          <div className="flex justify-center lg:justify-end">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  );
};