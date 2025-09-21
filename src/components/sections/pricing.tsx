import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button-extended";
import { CheckIcon } from "@/components/ui/icons";

export const Pricing = () => {
  const plans = [
    {
      title: "Deploy Chatbot",
      price: "IDR 6.000.000",
      subtitle: "/ chatbot (sekali bayar)",
      features: [
        "Chatbot WhatsApp siap digunakan",
        "Integrasi workflow sesuai template standar",
        "Dukungan setup awal & training singkat",
      ],
      highlighted: false,
    },
    {
      title: "Nomor Aktif",
      price: "IDR 50.000",
      subtitle: "/ nomor / bulan",
      features: [
        "Biaya operasional nomor WhatsApp",
        "Berlaku per nomor aktif",
        "Fleksibel sesuai kebutuhan tim",
      ],
      highlighted: true,
    },
    {
      title: "Custom Dashboard",
      price: "IDR 1.000.000",
      subtitle: "/ deploy (opsional)",
      features: [
        "Dashboard khusus sesuai SOP bisnis Anda",
        "Format laporan custom",
        "Integrasi tambahan sesuai kebutuhan",
      ],
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-background-soft">
      <div className="container mx-auto px-6">
        <SectionHeader
          title="Harga yang Sederhana & Transparan"
          subtitle="Bayar sesuai kebutuhan Anda. Tanpa biaya tersembunyi, fleksibel sesuai skala bisnis."
        />

        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative p-8 rounded-xl border transition-all duration-300 hover:-translate-y-2 ${
                plan.highlighted
                  ? "bg-gradient-hero text-surface-primary-foreground shadow-glow border-brand-primary-light"
                  : "bg-gradient-card border-border-light shadow-soft hover:shadow-medium"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-brand-accent text-surface-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Populer
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className={`text-xl font-semibold mb-3 ${
                  plan.highlighted ? "text-surface-primary-foreground" : "text-brand-primary"
                }`}>
                  {plan.title}
                </h3>
                <div className={`text-3xl font-bold mb-2 ${
                  plan.highlighted ? "text-surface-primary-foreground" : "text-foreground"
                }`}>
                  {plan.price}
                </div>
                <p className={`text-sm ${
                  plan.highlighted ? "text-surface-primary-foreground/80" : "text-foreground-muted"
                }`}>
                  {plan.subtitle}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      plan.highlighted ? "text-brand-accent" : "text-brand-secondary"
                    }`} />
                    <span className={`text-sm leading-relaxed ${
                      plan.highlighted ? "text-surface-primary-foreground/90" : "text-foreground-muted"
                    }`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlighted ? "accent" : "primary"}
                size="lg"
                className="w-full"
                asChild
              >
                <a href="https://wa.me/6287731771859" target="_blank" rel="noopener noreferrer">
                  Hubungi Kami
                </a>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};