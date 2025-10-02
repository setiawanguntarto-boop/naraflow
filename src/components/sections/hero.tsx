import { Button } from "@/components/ui/button-extended";
import { useLanguage } from "@/hooks/use-language";

export const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="relative bg-gradient-hero overflow-hidden min-h-screen flex items-center justify-center py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 relative">
        <div className="text-center space-y-10 max-w-5xl mx-auto">
          
          {/* Hero Content */}
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight">
              {t('hero.main-title-1')} <span className="text-brand-accent">{t('hero.main-title-wa')}</span>. {t('hero.main-title-2')}
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-foreground-muted leading-relaxed max-w-4xl mx-auto" style={{ animationDelay: '0.2s' }}>
              {t('hero.lead')}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Button 
              variant="primary" 
              size="xl"
              asChild
              className="group w-full sm:w-auto bg-brand-primary hover:bg-brand-primary/90 text-white shadow-strong"
            >
              <a
                href="https://demorahayu.lovable.app/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('hero.cta-demo-free')}
              </a>
            </Button>
            
            <Button 
              variant="outline" 
              size="xl"
              asChild
              className="w-full sm:w-auto border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
            >
              <a href="#how-it-works">
                {t('hero.cta-how-it-works')}
              </a>
            </Button>
          </div>

          {/* Hero Mockup with 3D Effect */}
          <div 
            className="animate-fade-in mt-16" 
            style={{ 
              animationDelay: '0.6s',
              perspective: '1500px'
            }}
          >
            <div 
              className="inline-block transition-transform duration-500 hover:scale-105"
              style={{
                transform: 'rotateX(10deg) rotateY(-5deg)',
                transition: 'transform 0.5s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'rotateX(0deg) rotateY(0deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'rotateX(10deg) rotateY(-5deg)';
              }}
            >
              <img 
                src="https://placehold.co/800x1600/E9E4D8/5B3F91?text=Contoh+Laporan%0Avia+Naraflow" 
                alt="Mockup smartphone menunjukkan antarmuka Naraflow di WhatsApp"
                className="w-full max-w-md mx-auto rounded-3xl shadow-strong border border-border"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};