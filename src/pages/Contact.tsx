import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Contact } from "@/components/sections/contact";
import { LanguageProvider } from "@/hooks/use-language";

const ContactPage = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Contact />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default ContactPage;
