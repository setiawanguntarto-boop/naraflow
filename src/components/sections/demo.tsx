import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button-extended";
import { WhatsAppIcon, CheckIcon } from "@/components/ui/icons";

export const Demo = () => {
  const steps = [
    "Bot menyapa dan menampilkan menu utama.",
    "User memilih menu: Catat Data Harian, Lihat Ringkasan, atau Tutup Siklus.",
    "Jika pilih Catat Data Harian, bot akan menanyakan jumlah pakan, mortalitas, suhu, dll.",
    "Bot merangkum input lalu meminta konfirmasi user.",
    "Data tersimpan otomatis & bisa dicek supervisor/admin."
  ];

  return (
    <section id="demo" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <SectionHeader
          title="Coba Demo Rahayu Sekarang"
          subtitle="Rahayu adalah co-bot WhatsApp yang membantu pencatatan operasional harian di peternakan ayam. Semua data pakan, mortalitas, panen, dan suhu bisa dicatat dengan cepat, transparan, dan tanpa aplikasi tambahan."
        />

        <div className="text-center mb-12">
          <Button variant="whatsapp" size="xl" asChild className="group">
            <a
              href="https://wa.me/6287731771859"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3"
            >
              <WhatsAppIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              Buka Demo di WhatsApp
            </a>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left Column - Conversation Steps */}
          <div>
            <h3 className="text-2xl font-semibold text-brand-primary mb-8">
              Alur Percakapan Demo
            </h3>
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <CheckIcon className="w-5 h-5 text-brand-secondary flex-shrink-0 mt-1" />
                  <span className="text-foreground-muted leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Video */}
          <div>
            <h3 className="text-2xl font-semibold text-brand-primary mb-8">
              Tutorial Video
            </h3>
            <div className="aspect-video rounded-xl overflow-hidden shadow-medium border border-border-light">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/MB8v-eOR5VA"
                title="Tutorial Rahayu"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};