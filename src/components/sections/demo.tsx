import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button-extended";
import { WhatsAppIcon, CheckIcon } from "@/components/ui/icons";
import { useLanguage } from "@/hooks/use-language";

export const Demo = () => {
  const { t } = useLanguage();
  const steps = [t('demo.s1'), t('demo.s2'), t('demo.s3'), t('demo.s4'), t('demo.s5')];

  return (
    <section id="demo" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <SectionHeader title={t('demo.title')} subtitle={t('demo.subtitle')} />

        <div className="text-center mb-12">
          <Button variant="whatsapp" size="xl" asChild className="group">
            <a
              href="https://wa.me/6287731771859"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3"
            >
              <WhatsAppIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              {t('demo.open-whatsapp')}
            </a>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left Column - Conversation Steps */}
          <div>
            <h3 className="text-2xl font-semibold text-brand-primary mb-8">
              {t('demo.conversation-flow')}
            </h3>
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <CheckIcon className="w-5 h-5 text-brand-secondary flex-shrink-0 mt-1" />
                  <span className="text-foreground-muted leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Video */}
          <div>
            <h3 className="text-2xl font-semibold text-brand-primary mb-8">
              {t('demo.tutorial-video')}
            </h3>
            <div className="aspect-video rounded-xl overflow-hidden shadow-medium border border-border-light">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/MB8v-eOR5VA"
                title="Tutorial Rahayu"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};