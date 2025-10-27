import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FAQ as FAQSection } from "@/components/sections/faq";
import { Contact } from "@/components/sections/contact";
import { useLanguage } from "@/hooks/use-language";
import { LanguageProvider } from "@/hooks/use-language";

const FAQ = () => {
  const { t } = useLanguage();

  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative bg-gradient-hero overflow-hidden py-20 sm:py-28">
            <div className="container mx-auto px-4 sm:px-6 text-center">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-brand-primary mb-6">
                {t("faq.page-title")}
              </h1>
              <p className="text-lg sm:text-xl text-foreground-muted max-w-3xl mx-auto">
                {t("faq.page-subtitle")}
              </p>
            </div>
          </section>

          {/* FAQ Content */}
          <FAQSection />

          {/* Contact Section */}
          <Contact />
        </main>

        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default FAQ;
