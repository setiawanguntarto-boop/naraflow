import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Solutions } from "@/components/sections/solutions";
import { LanguageProvider } from "@/hooks/use-language";

const SolutionsPage = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Solutions />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default SolutionsPage;
