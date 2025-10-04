import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Pricing } from "@/components/sections/pricing";
import { LanguageProvider } from "@/hooks/use-language";

const PricingPage = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Pricing />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default PricingPage;
