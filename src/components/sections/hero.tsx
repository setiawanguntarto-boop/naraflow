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

          {/* Two-column layout: Mockup + Products */}
          <div className="grid lg:grid-cols-2 gap-12 items-start mt-16 max-w-7xl mx-auto">
            {/* Left: Hero Mockup with 3D Effect */}
            <div 
              className="animate-fade-in lg:sticky lg:top-24" 
              style={{ 
                animationDelay: '0.6s',
                perspective: '1500px'
              }}
            >
              <div 
                className="inline-block transition-transform duration-500 hover:scale-105 w-full"
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

            {/* Right: Product Lineup */}
            <div className="animate-fade-in space-y-8" style={{ animationDelay: '0.8s' }}>
              <div className="text-left">
                <h2 className="text-3xl sm:text-4xl font-bold text-brand-primary mb-3">
                  {t('products.title')}
                </h2>
                <p className="text-foreground-muted text-lg">
                  {t('products.subtitle')}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    name: "Rahayu",
                    icon: "🐔",
                    description: t('products.rahayu.desc'),
                    status: "available",
                    link: "https://tanyarahayu.com/",
                  },
                  {
                    name: "Rodaya",
                    icon: "🏍️",
                    description: t('products.rodaya.desc'),
                    status: "available",
                    link: "https://rodaya.naraflow.id/",
                  },
                  {
                    name: "Tambakflow",
                    icon: "🦐",
                    description: t('products.tambakflow.desc'),
                    status: "available",
                    link: "https://tambak.naraflow.id",
                  },
                  {
                    name: "Kasaflow",
                    icon: "🏪",
                    description: t('products.kasaflow.desc'),
                    status: "coming-soon",
                  },
                  {
                    name: "Tamara",
                    icon: "🏨",
                    description: t('products.tamara.desc'),
                    status: "coming-soon",
                  },
                ].map((product, idx) => {
                  const isAvailable = product.status === "available";
                  const statusText = isAvailable ? t('products.status.available') : t('products.status.coming-soon');
                  const statusClass = isAvailable 
                    ? "bg-green-100 text-green-800 border-green-200" 
                    : "bg-orange-100 text-orange-800 border-orange-200";
                  
                  return (
                    <div
                      key={idx}
                      className="relative p-5 rounded-2xl border-0 flex flex-col h-full overflow-hidden group"
                      style={{
                        background: 'linear-gradient(145deg, hsl(var(--background)) 0%, hsl(var(--background-soft)) 100%)',
                        boxShadow: '8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.7)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '12px 12px 24px rgba(0, 0, 0, 0.15), -12px -12px 24px rgba(255, 255, 255, 0.8)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.7)';
                      }}
                    >
                      <div className="absolute -top-2 -right-2">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClass}`}>
                          {statusText}
                        </span>
                      </div>

                      <div className="text-3xl mb-3 text-center">
                        {product.icon}
                      </div>

                      <h3 className="text-lg font-semibold text-brand-primary mb-2 text-center">
                        {product.name}
                      </h3>

                      <p className="text-foreground-muted text-sm mb-3 leading-relaxed text-center">
                        {product.description}
                      </p>

                      <div className="mt-auto pt-3">
                        {isAvailable ? (
                          product.link ? (
                            <a 
                              href={product.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full bg-brand-primary text-surface-primary-foreground py-2 px-4 rounded-lg text-sm font-medium hover:bg-brand-primary/90 transition-colors inline-block text-center"
                            >
                              {t('products.visit-site')}
                            </a>
                          ) : (
                            <button className="w-full bg-brand-primary text-surface-primary-foreground py-2 px-4 rounded-lg text-sm font-medium hover:bg-brand-primary/90 transition-colors">
                              {t('products.learn-more')}
                            </button>
                          )
                        ) : (
                          <button 
                            disabled
                            className="w-full bg-gray-100 text-gray-400 py-2 px-4 rounded-lg text-sm font-medium cursor-not-allowed"
                          >
                            {t('products.coming-soon')}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};