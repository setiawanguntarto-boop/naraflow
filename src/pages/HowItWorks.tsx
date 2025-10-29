import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Suspense, lazy, useEffect, useMemo } from "react";
import { AnimatedBackground } from "@/components/sections/AnimatedBackground";
import { LanguageProvider } from "@/hooks/use-language";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Lazy-load heavy sections for faster TTI
const HowItWorks = lazy(() =>
  import("@/components/sections/how-it-works").then(m => ({ default: m.HowItWorks }))
);
const DataCollectionSection = lazy(() =>
  import("@/components/sections/how-it-works").then(m => ({ default: m.DataCollectionSection }))
);

// Small hook to set page metadata without extra deps
function usePageMetadata(title: string, description: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);

    return () => {
      document.title = previousTitle;
    };
  }, [title, description]);
}

// Respect user accessibility preference for reduced motion
function usePrefersReducedMotion(): boolean {
  const query = useMemo(() => window.matchMedia?.("(prefers-reduced-motion: reduce)") ?? null, []);
  const prefers = !!query && query.matches;
  return prefers;
}

const HowItWorksPage = () => {
  usePageMetadata(
    "How Naraflow Works — From Chat to Insight (No‑Code)",
    "Pelajari bagaimana Naraflow mengubah percakapan WhatsApp menjadi automasi bisnis dan insight siap pakai tanpa coding."
  );
  const reduceMotion = usePrefersReducedMotion();
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main role="main" aria-label="How Naraflow Works">
          {/* Hero Header - Transformational narrative with subtle moving background */}
          <section
            className="relative py-24 overflow-hidden bg-gradient-to-b from-background to-background-soft"
            aria-labelledby="hiw-hero-title"
          >
            {!reduceMotion && <AnimatedBackground />}

            <div className="relative z-10 text-center container mx-auto px-6">
              <h2
                id="hiw-hero-title"
                className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent mb-6"
              >
                How Naraflow Works
              </h2>
              <p className="text-lg md:text-xl text-foreground-muted max-w-3xl mx-auto leading-relaxed">
                Automasi dimulai dari percakapan WhatsApp dan berakhir dengan insight bisnis siap pakai. 
                Semua terjadi tanpa coding, langsung dari chat ke dashboard Anda.
              </p>
            </div>
          </section>
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="container mx-auto px-6 py-12" aria-busy="true" aria-live="polite">
                  <div className="h-6 w-48 bg-muted rounded mb-6" />
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
                    ))}
                  </div>
                </div>
              }
            >
          <HowItWorks />
          <DataCollectionSection />
            </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default HowItWorksPage;
