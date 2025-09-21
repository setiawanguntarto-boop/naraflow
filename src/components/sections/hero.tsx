import { Button } from "@/components/ui/button-extended";
import { WhatsAppIcon } from "@/components/ui/icons";
import { PhoneMockup } from "@/components/phone-mockup";
import { CheckIcon } from "@/components/ui/icons";
import { useLanguage } from "@/hooks/use-language";

export const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="relative bg-gradient-hero text-surface-primary-foreground overflow-hidden min-h-screen flex items-center">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary-glow/20 to-transparent"></div>
      
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 relative">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
          
          {/* Left content - Centered on mobile */}
          <div className="text-center lg:text-left space-y-6 lg:space-y-8 order-2 lg:order-1">
            <div className="space-y-4 lg:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="block">WhatsApp-first</span>
                <span className="block text-brand-accent">Workflow</span>
                <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium">for SMEs</span>
              </h1>
              
              <p className="text-lg sm:text-xl lg:text-2xl text-surface-primary-foreground/90 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {t('hero.subtitle')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Button 
                variant="whatsapp" 
                size="xl"
                asChild
                className="group w-full sm:w-auto"
              >
                <a
                  href="https://wa.me/6287731771859"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3"
                >
                  <WhatsAppIcon className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                  {t('hero.cta-demo')}
                </a>
              </Button>
              
              <Button 
                variant="outline" 
                size="xl"
                asChild
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 w-full sm:w-auto"
              >
                <a href="#how-it-works" className="flex items-center justify-center gap-2">
                  {t('hero.cta-learn')}
                </a>
              </Button>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {[
                t('hero.feature1'),
                t('hero.feature2'),
                t('hero.feature3')
              ].map((feature, i) => (
                <div key={i} className="flex items-center justify-center lg:justify-start gap-3 text-surface-primary-foreground/90">
                  <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-brand-accent flex-shrink-0" />
                  <span className="text-base sm:text-lg">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right content - Phone Mockup - Centered */}
          <div className="flex justify-center order-1 lg:order-2">
            <div className="transform scale-75 sm:scale-90 lg:scale-100">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};