import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HowItWorks, DataCollectionSection } from "@/components/sections/how-it-works";
import { LanguageProvider } from "@/hooks/use-language";

const HowItWorksPage = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          {/* Page Header - Pastel Purple Brand Identity */}
          <section className="relative">
            <div
              className="absolute inset-0 -z-10"
              style={{
                background:
                  "linear-gradient(135deg, hsl(265 95% 97%) 0%, hsl(265 90% 92%) 100%)",
              }}
            />
            <div className="container mx-auto px-4 py-10 md:py-14">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                How It Works
              </h1>
              <p className="mt-2 text-sm md:text-base text-foreground-muted max-w-2xl">
                Langkah-langkah sederhana membangun otomasi WhatsApp dengan Naraflow.
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
