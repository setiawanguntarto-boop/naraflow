import { SectionHeader } from "@/components/section-header";
import { useLanguage } from "@/hooks/use-language";

export const Products = () => {
  const { t } = useLanguage();

  const products = [
    {
      name: "Rahayu",
      icon: "🐔",
      description: t('products.rahayu.desc'),
      status: "available",
      features: t('products.rahayu.features'),
      link: "https://tanyarahayu.com/",
    },
    {
      name: "Rodaya",
      icon: "🏍️",
      description: t('products.rodaya.desc'),
      status: "available",
      features: t('products.rodaya.features'),
      link: "https://rodaya.naraflow.id/",
    },
    {
      name: "Tambakflow",
      icon: "🦐",
      description: t('products.tambakflow.desc'),
      status: "available",
      features: t('products.tambakflow.features'),
      link: "https://tambak.naraflow.id",
    },
    {
      name: "Kasaflow",
      icon: "🏪",
      description: t('products.kasaflow.desc'),
      status: "coming-soon",
      features: t('products.kasaflow.features'),
    },
    {
      name: "Tamara",
      icon: "🏨",
      description: t('products.tamara.desc'),
      status: "coming-soon",
      features: t('products.tamara.features'),
    },
  ];

  return (
    <section id="products" className="py-12 sm:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <SectionHeader
          title={t('products.title')}
          subtitle={t('products.subtitle')}
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {products.map((product, idx) => {
            const isAvailable = product.status === "available";
            const statusText = isAvailable ? t('products.status.available') : t('products.status.coming-soon');
            const statusClass = isAvailable 
              ? "bg-green-100 text-green-800 border-green-200" 
              : "bg-orange-100 text-orange-800 border-orange-200";
            
            return (
              <div
                key={idx}
                className="relative p-6 rounded-2xl border-0 flex flex-col h-full slide-in overflow-hidden group"
                style={{
                  animationDelay: `${idx * 0.1}s`,
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

                <div className="text-4xl mb-4 text-center">
                  {product.icon}
                </div>

                <h3 className="text-xl font-semibold text-brand-primary mb-3 text-center">
                  {product.name}
                </h3>

                <p className="text-foreground-muted text-sm mb-4 leading-relaxed">
                  {product.description}
                </p>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">
                    {t('products.features-title')}:
                  </h4>
                  <ul className="text-xs text-foreground-muted space-y-1">
                    {product.features.split(',').map((feature, featureIdx) => (
                      <li key={featureIdx} className="flex items-start">
                        <span className="text-brand-primary mr-2">•</span>
                        <span>{feature.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-4">
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
    </section>
  );
};
