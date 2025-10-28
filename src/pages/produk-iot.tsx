import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { TipiShowcase } from "@/components/tipi-showcase";

const ProdukIoT = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-extrabold text-brand-primary mb-6">
              Produk IoT Naraflow
            </h1>
            <p className="text-foreground-muted text-lg max-w-3xl mx-auto mb-12">
              Jelajahi teknologi IoT kami yang dirancang untuk integrasi cerdas dengan sistem farm dan lapangan.{" "}
              Dimulai dengan <span className="text-brand-primary font-semibold">Timbangan Pintar (TIPI)</span>.
            </p>
          </div>
          <TipiShowcase />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProdukIoT;

