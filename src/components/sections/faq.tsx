import { useState } from "react";
import { SectionHeader } from "@/components/section-header";

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAnswer = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      q: "Berapa biaya jika saya deploy 2 chatbot dengan 5 nomor aktif selama 1 tahun, ditambah custom dashboard?",
      a: `Deploy 2 chatbot = 2 × IDR 6.000.000 = IDR 12.000.000 (sekali bayar).
Nomor aktif 5 × IDR 50.000 × 12 bulan = IDR 3.000.000/tahun.
Custom dashboard 1 × IDR 1.000.000 = IDR 1.000.000 (sekali bayar).
➡️ Total tahun pertama = IDR 16.000.000
➡️ Tahun berikutnya hanya biaya nomor aktif = IDR 3.000.000/tahun.`,
    },
    {
      q: "Apakah biaya deploy dibayar sekali atau tiap tahun?",
      a: "Biaya deploy dibayar sekali saja. Setelah itu chatbot bisa digunakan selamanya tanpa biaya tambahan deploy.",
    },
    {
      q: "Bagaimana jika saya hanya ingin 1 nomor aktif dulu, lalu menambah seiring waktu?",
      a: "Sangat fleksibel. Anda cukup membayar sesuai jumlah nomor aktif per bulan. Kalau awalnya 1 nomor, lalu bulan depan ditambah jadi 3 nomor, tagihan otomatis menyesuaikan.",
    },
    {
      q: "Apakah custom dashboard wajib?",
      a: "Tidak wajib. Default dashboard standar sudah tersedia. Namun, jika Anda ingin format laporan khusus, ada biaya tambahan IDR 1.000.000 sekali deploy.",
    },
    {
      q: "Apakah ada biaya maintenance?",
      a: "Tidak ada biaya maintenance tambahan. Biaya bulanan sudah mencakup update sistem dasar dan support ringan.",
    },
    {
      q: "Apakah ada trial gratis?",
      a: "Ya. Anda bisa mencoba demo chatbot di WhatsApp tanpa biaya. Namun untuk implementasi ke nomor Anda sendiri tetap dikenakan biaya deploy.",
    },
    {
      q: "Apakah chatbot bisa terhubung dengan sistem lain (ERP, accounting)?",
      a: "Ya, tersedia API untuk integrasi. Integrasi standar sudah termasuk, sementara integrasi kompleks bisa dibicarakan lebih lanjut.",
    },
  ];

  return (
    <section id="faq" className="py-20 bg-background-soft">
      <div className="container mx-auto px-6">
        <SectionHeader
          title="Pertanyaan yang Sering Diajukan"
        />

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-gradient-card rounded-xl border border-border-light shadow-soft overflow-hidden transition-all duration-300 hover:shadow-medium"
            >
              <button
                className="w-full p-6 text-left flex justify-between items-center hover:bg-surface-muted/50 transition-colors"
                onClick={() => toggleAnswer(idx)}
              >
                <h3 className="font-semibold text-lg text-brand-primary pr-4">
                  {faq.q}
                </h3>
                <span className={`text-2xl text-brand-primary transition-transform duration-300 ${
                  openIndex === idx ? 'rotate-45' : ''
                }`}>
                  +
                </span>
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  openIndex === idx ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-6 border-t border-border-light">
                  <p className="text-foreground-muted whitespace-pre-line leading-relaxed pt-4">
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};