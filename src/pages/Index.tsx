import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/sections/hero";
import { TipiShowcase } from "@/components/sections/tipi-showcase";
import { WorkflowStudio } from "@/components/sections/workflow-studio";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <TipiShowcase />
        <WorkflowStudio />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
