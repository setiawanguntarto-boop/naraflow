import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/sections/hero";
import { TipiShowcase } from "@/components/sections/tipi-showcase";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <TipiShowcase />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
