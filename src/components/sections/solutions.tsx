import { SectionHeader } from "@/components/section-header";
import { FeatureCard } from "@/components/feature-card";
import { useLanguage } from "@/hooks/use-language";

export const Solutions = () => {
  const { t } = useLanguage();

  const solutions = [
    {
      title: t('solutions.communication.title'),
      icon: "💬",
      description: t('solutions.communication.desc'),
      example: t('solutions.communication.example'),
    },
    {
      title: t('solutions.automation.title'),
      icon: "⚡",
      description: t('solutions.automation.desc'),
      example: t('solutions.automation.example'),
    },
    {
      title: t('solutions.efficiency.title'),
      icon: "⏱️",
      description: t('solutions.efficiency.desc'),
      example: t('solutions.efficiency.example'),
    },
    {
      title: t('solutions.accuracy.title'),
      icon: "✅",
      description: t('solutions.accuracy.desc'),
      example: t('solutions.accuracy.example'),
    },
  ];

  return (
    <section id="solutions" className="py-12 sm:py-16 lg:py-20 bg-background-soft">
      <div className="container mx-auto px-4 sm:px-6">
        <SectionHeader
          title={t('solutions.title')}
          subtitle={t('solutions.subtitle')}
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {solutions.map((solution, idx) => (
            <FeatureCard
              key={idx}
              icon={solution.icon}
              title={solution.title}
              description={solution.description}
              example={solution.example}
            />
          ))}
        </div>
      </div>
    </section>
  );
};