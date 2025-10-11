import { SectionHeader } from "@/components/section-header";
import { useLanguage } from "@/hooks/use-language";

export const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    {
      title: t('how.title1'),
      desc: t('how.desc1'),
      icon: "https://cdn-icons-png.flaticon.com/512/733/733585.png",
      alt: "WhatsApp Icon",
    },
    {
      title: t('how.title2'),
      desc: t('how.desc2'),
      icon: "https://cdn-icons-png.flaticon.com/512/992/992700.png",
      alt: "Input Icon",
    },
    {
      title: t('how.title3'),
      desc: t('how.desc3'),
      icon: "https://cdn-icons-png.flaticon.com/512/1828/1828817.png",
      alt: "Automation Icon",
    },
    {
      title: t('how.title4'),
      desc: t('how.desc4'),
      icon: "https://cdn-icons-png.flaticon.com/512/1828/1828940.png",
      alt: "Report Icon",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <SectionHeader title={t('how.title')} subtitle={t('how.subtitle')} />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-surface-elevated rounded-2xl p-8 text-center border border-neutral-100 dark:border-border-light shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="bg-brand-primary/10 w-16 h-16 flex items-center justify-center rounded-full mx-auto mb-5">
                <img 
                  src={step.icon} 
                  alt={step.alt} 
                  className="w-9 h-9 opacity-80"
                />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">
                {step.title}
              </h4>
              <p className="text-sm text-foreground-muted leading-snug">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};