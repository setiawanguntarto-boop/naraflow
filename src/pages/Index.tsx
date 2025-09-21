import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/sections/hero";
import { Solutions } from "@/components/sections/solutions";
import { About } from "@/components/sections/about";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Pricing } from "@/components/sections/pricing";
import { Demo } from "@/components/sections/demo";
import { FAQ } from "@/components/sections/faq";
import { Contact } from "@/components/sections/contact";
import { LanguageProvider } from "@/hooks/use-language";

const Index = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Hero />
          <Solutions />
          <About />
          <HowItWorks />
          <Pricing />
          <Demo />
          <FAQ />
          <Contact />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default Index;
