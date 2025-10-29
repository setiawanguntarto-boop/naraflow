import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { LanguageProvider } from "@/hooks/use-language";
import { ErrorBoundary } from "@/components/ErrorBoundary";
// NOTE: the asset currently exists as .png.png; will normalize later
import heroImg from "@/assets/how-it-works-hero.png.png";

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
  const base = (import.meta as any).env?.BASE_URL || "/";
  const [imgOk, setImgOk] = useState(true);
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main role="main" aria-label="How Naraflow Works">
          {/* Hero Header - Transformational narrative with subtle moving background */}
          <section
            className="relative py-20 md:py-24 overflow-hidden"
            aria-labelledby="hiw-hero-title"
          >
            {/* Lowest layer background image (from public/images) */}
            <img
              src={`${base}images/how-it-works-backdrop.png`}
              alt=""
              aria-hidden
              draggable={false}
              className="absolute inset-0 -z-50 w-full h-full object-cover opacity-90 pointer-events-none select-none"
              onError={(e) => {
                // Fallback to main gradient if the image isn't present yet
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
            {/* Gradient fallback layer to ensure readability */}
            <div aria-hidden className="absolute inset-0 -z-40 pointer-events-none" style={{ background: 'var(--gradient-hero)' }} />
            <div className="relative z-10 container mx-auto px-6 grid md:grid-cols-2 items-center gap-4 md:gap-6">
              {/* Left: Title and copy */}
              <div className="text-center md:text-left md:pr-4 lg:pr-8">
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
              <div className="relative h-[300px] md:h-[460px] md:-ml-4 lg:-ml-6">
                <img
                  src={heroImg}
                  alt="WhatsApp to insights visual"
                  className="absolute right-0 bottom-0 h-full w-auto object-contain select-none pointer-events-none drop-shadow-xl transform scale-[1.15] md:scale-[1.25] origin-right"
                  loading="eager"
                  decoding="async"
                  onLoad={() => setImgOk(true)}
                  onError={(e) => {
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
