import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WorkflowStudio as WorkflowStudioSection } from "@/components/sections/workflow-studio";

const WorkflowStudio = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <WorkflowStudioSection />
      </main>
      <Footer />
    </div>
  );
};

export default WorkflowStudio;
