import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { About } from "@/components/sections/about";
import { LanguageProvider } from "@/hooks/use-language";

const AboutPage = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <About />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default AboutPage;
