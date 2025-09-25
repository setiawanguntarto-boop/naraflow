import { SectionHeader } from "@/components/section-header";
import { useLanguage } from "@/hooks/use-language";

export const About = () => {
  const { t } = useLanguage();

  const values = [
    { title: t('about.values.simple.title'), icon: "✨", desc: t('about.values.simple.desc') },
    { title: t('about.values.transparent.title'), icon: "🔍", desc: t('about.values.transparent.desc') },
    { title: t('about.values.collaborative.title'), icon: "🤝", desc: t('about.values.collaborative.desc') },
    { title: t('about.values.resilient.title'), icon: "💪", desc: t('about.values.resilient.desc') },
  ];

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <SectionHeader
          title={t('about.title')}
          subtitle={t('about.subtitle')}
        />

        {/* Vision & Mission */}
        <div className="grid gap-8 md:grid-cols-2 mb-16">
          <div className="p-8 bg-gradient-card rounded-xl shadow-soft border border-border-light">
            <h3 className="text-2xl font-semibold text-brand-primary mb-4">{t('about.vision.title')}</h3>
            <p className="text-foreground-muted leading-relaxed text-lg">
              {t('about.vision.desc')}
            </p>
          </div>
          <div className="p-8 bg-gradient-card rounded-xl shadow-soft border border-border-light">
            <h3 className="text-2xl font-semibold text-brand-primary mb-4">{t('about.mission.title')}</h3>
            <p className="text-foreground-muted leading-relaxed text-lg">
              {t('about.mission.desc')}
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {values.map((val, idx) => (
            <div 
              key={idx} 
              className="p-6 bg-gradient-card rounded-xl border border-border-light shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 text-center"
            >
              <div className="text-4xl mb-4">{val.icon}</div>
              <h4 className="font-semibold text-lg text-foreground mb-2">{val.title}</h4>
              <p className="text-foreground-muted">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};