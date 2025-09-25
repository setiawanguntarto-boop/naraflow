import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button-extended";
import { useLanguage } from "@/hooks/use-language";

export const Contact = () => {
  const { t } = useLanguage();
  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <SectionHeader title={t('contact.title')} subtitle={t('contact.subtitle')} />

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          
          {/* Left Column - Contact Info */}
          <div className="space-y-8">
            <h3 className="text-2xl font-semibold text-brand-primary mb-6">{t('contact.channels')}</h3>
            
            <div className="space-y-6">
              {/* WhatsApp */}
              <div className="flex items-center gap-4 p-4 bg-gradient-card rounded-xl border border-border-light shadow-soft hover:shadow-medium transition-all duration-300">
                <div className="w-12 h-12 flex items-center justify-center bg-brand-secondary text-surface-primary-foreground rounded-xl text-xl">
                  📱
                </div>
                <a
                  href="https://wa.me/6287731771859"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-brand-secondary font-medium text-lg transition-colors"
                >
                  WhatsApp: +62 877-3177-1859
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4 p-4 bg-gradient-card rounded-xl border border-border-light shadow-soft hover:shadow-medium transition-all duration-300">
                <div className="w-12 h-12 flex items-center justify-center bg-brand-primary text-surface-primary-foreground rounded-xl text-xl">
                  📧
                </div>
                <a
                  href="mailto:hello@naraflow.id"
                  className="text-foreground hover:text-brand-primary font-medium text-lg transition-colors"
                >
                  Email: hello@naraflow.id
                </a>
              </div>

              {/* LinkedIn */}
              <div className="flex items-center gap-4 p-4 bg-gradient-card rounded-xl border border-border-light shadow-soft hover:shadow-medium transition-all duration-300">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-500 text-surface-primary-foreground rounded-xl text-xl">
                  💼
                </div>
                <a
                  href="https://www.linkedin.com/company/naraflow-id/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-blue-600 font-medium text-lg transition-colors"
                >
                  LinkedIn: Naraflow
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="bg-gradient-card rounded-xl border border-border-light shadow-soft p-8">
            <h3 className="text-2xl font-semibold text-brand-primary mb-6">{t('contact.send-message')}</h3>
            <form className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder={t('contact.name-placeholder')}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder={t('contact.email-placeholder')}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <textarea
                  rows={4}
                  placeholder={t('contact.message-placeholder')}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all resize-none"
                ></textarea>
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
              >
                {t('contact.send-button')}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};