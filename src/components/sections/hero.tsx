import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button-extended";
import { useLanguage } from "@/hooks/use-language";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WhatsAppMockup } from "@/components/whatsapp-mockup";
export const Hero = () => {
  const {
    t
  } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const products = [{
    name: "Rahayu",
    icon: "🐔",
    description: t('products.rahayu.desc'),
    features: t('products.rahayu.features'),
    status: "available",
    link: "https://tanyarahayu.com/"
  }, {
    name: "Rodaya",
    icon: "🏍️",
    description: t('products.rodaya.desc'),
    features: t('products.rodaya.features'),
    status: "available",
    link: "https://rodaya.naraflow.id/"
  }, {
    name: "Tambakflow",
    icon: "🦐",
    description: t('products.tambakflow.desc'),
    features: t('products.tambakflow.features'),
    status: "available",
    link: "https://tambak.naraflow.id"
  }, {
    name: "Kasaflow",
    icon: "🏪",
    description: t('products.kasaflow.desc'),
    features: t('products.kasaflow.features'),
    status: "coming-soon"
  }, {
    name: "Tamara",
    icon: "🏨",
    description: t('products.tamara.desc'),
    features: t('products.tamara.features'),
    status: "available",
    link: "https://tamara.naraflow.id/"
  }];
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % products.length);
    }, 6000); // 6 seconds per item

    return () => clearInterval(timer);
  }, [products.length]);
  const nextProduct = () => {
    setCurrentIndex(prev => (prev + 1) % products.length);
  };
  const prevProduct = () => {
    setCurrentIndex(prev => (prev - 1 + products.length) % products.length);
  };
  const currentProduct = products[currentIndex];
  const isAvailable = currentProduct.status === "available";
  const statusText = isAvailable ? t('products.status.available') : t('products.status.coming-soon');
  const statusClass = isAvailable ? "bg-green-100 text-green-800 border-green-200" : "bg-orange-100 text-orange-800 border-orange-200";
  return <section className="relative bg-gradient-hero overflow-hidden min-h-screen flex items-center justify-center py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 relative">
        <div className="text-center space-y-10 max-w-5xl mx-auto">
          
          {/* Hero Content */}
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight whitespace-nowrap">
              {t('hero.main-title-1')} <span className="text-brand-accent">{t('hero.main-title-wa')}</span>. {t('hero.main-title-2')}
            </h1>
            
            
          </div>

          {/* CTA Buttons */}
          

          {/* Two-column layout: Mockup + Products */}
          <div className="grid lg:grid-cols-2 gap-12 items-start mt-16 max-w-7xl mx-auto">
            {/* Left: Hero Mockup with 3D Effect */}
            <div className="animate-fade-in lg:sticky lg:top-24" style={{
            animationDelay: '0.6s',
            perspective: '1500px',
            filter: 'drop-shadow(0 10px 60px rgba(0, 0, 0, 0.15))'
          }}>
              <div className="inline-block w-full" style={{
              transform: 'rotateX(8deg) rotateY(-8deg) rotateZ(2deg)',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }} onMouseMove={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = (e.clientX - rect.left) / rect.width;
              const y = (e.clientY - rect.top) / rect.height;
              const rotateY = (x - 0.5) * 20;
              const rotateX = (y - 0.5) * -20;
              e.currentTarget.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            }} onMouseLeave={e => {
              e.currentTarget.style.transform = 'rotateX(8deg) rotateY(-8deg) rotateZ(2deg)';
            }}>
                <WhatsAppMockup />
              </div>
            </div>

            {/* Right: Product Carousel */}
            <div className="animate-fade-in space-y-6" style={{
            animationDelay: '0.8s'
          }}>
              <div className="text-left">
                <h2 className="text-3xl sm:text-4xl font-bold text-brand-primary mb-3">
                  {t('products.title')}
                </h2>
                
              </div>

              {/* Carousel Container */}
              <div className="relative">
                {/* Product Card */}
                <div key={currentIndex} className="relative p-8 rounded-3xl border-0 flex flex-col overflow-hidden slide-in-left" style={{
                background: 'linear-gradient(145deg, hsl(var(--background)) 0%, hsl(var(--background-soft)) 100%)',
                boxShadow: '12px 12px 24px rgba(0, 0, 0, 0.15), -12px -12px 24px rgba(255, 255, 255, 0.8)',
                minHeight: '400px'
              }}>
                  <div className="text-7xl mb-6 text-center">
                    {currentProduct.icon}
                  </div>

                  <h3 className="text-3xl font-bold text-brand-primary mb-4 text-center">
                    {currentProduct.name}
                  </h3>

                  <p className="text-foreground-muted text-lg mb-6 leading-relaxed text-center">
                    {currentProduct.description}
                  </p>

                  

                  <div className="mt-auto pt-4 space-y-3">
                    {isAvailable ? <>
                        {currentProduct.link && <a href={currentProduct.link} target="_blank" rel="noopener noreferrer" className="w-full bg-brand-primary text-surface-primary-foreground py-3 px-6 rounded-xl text-base font-semibold hover:bg-brand-primary/90 transition-colors inline-block text-center">
                            {t('products.visit-site')}
                          </a>}
                        {(currentProduct.name === "Rahayu" || currentProduct.name === "Tambakflow") && <a href={currentProduct.name === "Rahayu" ? "http://wa.me/6289637112147" : "https://wa.me/62881024280794"} target="_blank" rel="noopener noreferrer" className="w-full bg-brand-secondary text-surface-primary-foreground py-3 px-6 rounded-xl text-base font-semibold hover:bg-brand-secondary/90 transition-colors inline-block text-center">
                            {t('products.try-me')}
                          </a>}
                        {!currentProduct.link && currentProduct.name !== "Rahayu" && currentProduct.name !== "Tambakflow" && <button className="w-full bg-brand-primary text-surface-primary-foreground py-3 px-6 rounded-xl text-base font-semibold hover:bg-brand-primary/90 transition-colors">
                            {t('products.learn-more')}
                          </button>}
                      </> : <button disabled className="w-full bg-gray-100 text-gray-400 py-3 px-6 rounded-xl text-base font-semibold cursor-not-allowed">
                        {t('products.coming-soon')}
                      </button>}
                  </div>
                </div>

                {/* Navigation Arrows */}
                <button onClick={prevProduct} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110" aria-label="Previous product">
                  <ChevronLeft className="w-6 h-6 text-brand-primary" />
                </button>
                
                <button onClick={nextProduct} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110" aria-label="Next product">
                  <ChevronRight className="w-6 h-6 text-brand-primary" />
                </button>

                {/* Dots Indicator */}
                <div className="flex justify-center gap-2 mt-6">
                  {products.map((_, idx) => <button key={idx} onClick={() => setCurrentIndex(idx)} className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-brand-primary' : 'w-2 bg-gray-300 hover:bg-gray-400'}`} aria-label={`Go to product ${idx + 1}`} />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};