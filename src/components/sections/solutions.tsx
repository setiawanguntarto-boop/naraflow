import { SectionHeader } from "@/components/section-header";
import { FeatureCard } from "@/components/feature-card";

export const Solutions = () => {
  const solutions = [
    {
      title: "Komunikasi Cepat",
      icon: "💬",
      description: "Semua interaksi tim langsung lewat WhatsApp tanpa aplikasi tambahan. Anak kandang, admin, hingga supervisor bisa terhubung real-time.",
      example: "Contoh: Anak kandang mencatat mortalitas pagi ini, supervisor langsung dapat notifikasi di WhatsApp.",
    },
    {
      title: "Otomatisasi",
      icon: "⚡",
      description: "Setiap input data otomatis terstruktur dan tersimpan rapi, siap dipakai untuk laporan dan analisis.",
      example: "Contoh: Pencatatan pakan harian otomatis masuk ke laporan bulanan tanpa perlu input manual di Excel.",
    },
    {
      title: "Efisiensi Waktu",
      icon: "⏱️",
      description: "Naraflow memotong alur birokrasi yang panjang, membuat laporan siap lebih cepat dan akurat.",
      example: "Contoh: Admin tidak lagi menunggu seminggu untuk laporan panen—data bisa langsung dikompilasi dalam hitungan menit.",
    },
    {
      title: "Akurat & Transparan",
      icon: "✅",
      description: "Semua data tercatat dengan jelas, diverifikasi, dan dapat diaudit. Mengurangi risiko manipulasi dan kebocoran data.",
      example: "Contoh: Nota timbang panen yang biasanya hanya di kertas, kini otomatis tercatat dan bisa diverifikasi supervisor.",
    },
  ];

  return (
    <section id="solutions" className="py-20 bg-background-soft">
      <div className="container mx-auto px-6">
        <SectionHeader
          title="Solusi yang Ditawarkan Naraflow"
          subtitle="Naraflow membantu bisnis Anda keluar dari pencatatan manual yang rawan hilang dan manipulasi. Semua data langsung rapi, transparan, dan siap dipakai untuk keputusan bisnis."
        />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {solutions.map((solution, idx) => (
            <FeatureCard
              key={idx}
              icon={solution.icon}
              title={solution.title}
              description={solution.description}
              example={solution.example}
            />
          ))}
        </div>
      </div>
    </section>
  );
};