import { useState } from "react";
import { SectionHeader } from "@/components/section-header";
import { useLanguage } from "@/hooks/use-language";

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t } = useLanguage();

  const toggleAnswer = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
    { q: t("faq.q6"), a: t("faq.a6") },
    { q: t("faq.q7"), a: t("faq.a7") },
  ];

  return (
    <section id="faq" className="py-20 bg-background-soft">
      <div className="container mx-auto px-6">
        <SectionHeader title={t("faq.title")} />

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
                <h3 className="font-semibold text-lg text-brand-primary pr-4">{faq.q}</h3>
                <span
                  className={`text-2xl text-brand-primary transition-transform duration-300 ${
                    openIndex === idx ? "rotate-45" : ""
                  }`}
                >
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
