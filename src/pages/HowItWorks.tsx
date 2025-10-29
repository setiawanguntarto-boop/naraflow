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
          <HowItWorks />
          <DataCollectionSection />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default HowItWorksPage;
