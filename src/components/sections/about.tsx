import { SectionHeader } from "@/components/section-header";

export const About = () => {
  const values = [
    { title: "Sederhana", icon: "✨", desc: "Mudah dipakai tanpa training rumit." },
    { title: "Transparan", icon: "🔍", desc: "Data jelas, rapi, dan bisa dipercaya." },
    { title: "Kolaboratif", icon: "🤝", desc: "Mendukung semua peran dalam bisnis." },
    { title: "Tangguh", icon: "💪", desc: "Dirancang untuk bisnis sehari-hari yang dinamis." },
  ];

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <SectionHeader
          title="Tentang Naraflow"
          subtitle="Naraflow adalah platform WhatsApp-first Workflow yang membantu UMKM dan agribisnis mencatat, mengelola, dan memantau data secara sederhana namun terstruktur. Kami percaya setiap bisnis berhak atas tata kelola yang efisien, transparan, dan tangguh."
        />

        {/* Vision & Mission */}
        <div className="grid gap-8 md:grid-cols-2 mb-16">
          <div className="p-8 bg-gradient-card rounded-xl shadow-soft border border-border-light">
            <h3 className="text-2xl font-semibold text-brand-primary mb-4">Visi</h3>
            <p className="text-foreground-muted leading-relaxed text-lg">
              Menjadi jembatan digitalisasi UMKM di Asia Tenggara dengan solusi
              sederhana, berbasis percakapan, dan transparan.
            </p>
          </div>
          <div className="p-8 bg-gradient-card rounded-xl shadow-soft border border-border-light">
            <h3 className="text-2xl font-semibold text-brand-primary mb-4">Misi</h3>
            <p className="text-foreground-muted leading-relaxed text-lg">
              Memberdayakan pelaku usaha kecil dengan teknologi yang mudah digunakan,
              meningkatkan efisiensi operasional, dan membangun kepercayaan berbasis data.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {values.map((val, idx) => (
            <div 
              key={idx} 
              className="p-6 bg-gradient-card rounded-xl border border-border-light shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 text-center"
            >
              <div className="text-4xl mb-4">{val.icon}</div>
              <h4 className="font-semibold text-lg text-foreground mb-2">{val.title}</h4>
              <p className="text-foreground-muted">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};