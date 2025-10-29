import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HowItWorks, DataCollectionSection } from "@/components/sections/how-it-works";
import { AnimatedBackground } from "@/components/sections/AnimatedBackground";
import { LanguageProvider } from "@/hooks/use-language";

const HowItWorksPage = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          {/* Hero Header - Transformational narrative with subtle moving background */}
          <section className="relative py-24 overflow-hidden bg-gradient-to-b from-background to-background-soft">
            <AnimatedBackground />

            <div className="relative z-10 text-center container mx-auto px-6">
              <h2 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent mb-6">
                How Naraflow Works
              </h2>
              <p className="text-lg md:text-xl text-foreground-muted max-w-3xl mx-auto leading-relaxed">
                Automasi dimulai dari percakapan WhatsApp dan berakhir dengan insight bisnis siap pakai. 
                Semua terjadi tanpa coding, langsung dari chat ke dashboard Anda.
              </p>
            </div>
          </section>

          <HowItWorks />
          <DataCollectionSection />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default HowItWorksPage;
