import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Suspense, lazy, useEffect, useMemo, useState } from "react";
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
  const [imgOk, setImgOk] = useState(true);
  const [imgSrc, setImgSrc] = useState<string>("/images/how-it-works-hero.png");
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main role="main" aria-label="How Naraflow Works">
          {/* Hero Header - Transformational narrative with subtle moving background */}
          <section
            className="relative py-20 md:py-24 overflow-hidden bg-gradient-to-b from-background to-background-soft"
            aria-labelledby="hiw-hero-title"
          >
            {!reduceMotion && <AnimatedBackground />}

            <div className="relative z-10 container mx-auto px-6 grid md:grid-cols-2 items-center gap-8 md:gap-12">
              {/* Left: Title and copy */}
              <div className="text-center md:text-left">
                <h2
                  id="hiw-hero-title"
                  className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent mb-6"
                >
                  How Naraflow Works
                </h2>
                <p className="text-base md:text-xl text-foreground-muted leading-relaxed max-w-xl md:max-w-none mx-auto md:mx-0">
                  Automasi dimulai dari percakapan WhatsApp dan berakhir dengan insight bisnis siap pakai. 
                  Semua terjadi tanpa coding, langsung dari chat ke dashboard Anda.
                </p>
              </div>

              {/* Right: Hero image with soft background removal mask */}
              <div className="relative h-[300px] md:h-[420px]">
                <img
                  src={imgSrc}
                  alt="WhatsApp to insights visual"
                  className="absolute right-0 bottom-0 h-full w-auto object-contain select-none pointer-events-none drop-shadow-xl"
                  loading="eager"
                  decoding="async"
                  onLoad={() => setImgOk(true)}
                  onError={(e) => {
                    // Try alternative paths before falling back
                    if (imgSrc.startsWith("/images/")) {
                      setImgSrc("images/how-it-works-hero.png");
                      return;
                    }
                    if (imgSrc.startsWith("images/")) {
                      setImgSrc("/how-it-works-hero.png");
                      return;
                    }
                    setImgOk(false);
                    (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                  }}
                  style={imgOk ? {
                    WebkitMaskImage:
                      "radial-gradient(120% 120% at 70% 60%, #000 55%, rgba(0,0,0,0) 85%)",
                    maskImage:
                      "radial-gradient(120% 120% at 70% 60%, #000 55%, rgba(0,0,0,0) 85%)",
                    mixBlendMode: "multiply",
                  } : {}}
                />
              </div>
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
