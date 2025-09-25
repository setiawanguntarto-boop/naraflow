import { SectionHeader } from "@/components/section-header";
import { useLanguage } from "@/hooks/use-language";

export const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    {
      title: t('how.title1'),
      desc: t('how.desc1'),
      icon: "💬",
    },
    {
      title: t('how.title2'),
      desc: t('how.desc2'),
      icon: "✍️",
    },
    {
      title: t('how.title3'),
      desc: t('how.desc3'),
      icon: "🔄",
    },
    {
      title: t('how.title4'),
      desc: t('how.desc4'),
      icon: "📊",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <SectionHeader title={t('how.title')} subtitle={t('how.subtitle')} />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative group"
            >
              {/* Connecting line for desktop */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-brand-primary to-brand-primary-light transform translate-x-4"></div>
              )}
              
              <div className="flex flex-col items-center text-center p-8 bg-gradient-card rounded-xl border border-border-light shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                <h3 className="font-semibold text-xl text-foreground mb-4 group-hover:text-brand-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-foreground-muted leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};