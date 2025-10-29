import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { SectionHeader } from "@/components/section-header";
import { useLanguage } from "@/hooks/use-language";
import { MessageSquare, LayoutDashboard, Bot, Rocket, Database, BarChart3, MessageCircle, Cpu, ArrowRight, CheckCircle } from "lucide-react";

export const HowItWorks = () => {
  const { t } = useLanguage();
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      title: t("how.title1"),
      desc: t("how.desc1"),
      icon: MessageSquare,
      gradient: "from-blue-500 to-cyan-500",
      delay: 0,
    },
    {
      title: t("how.title2"),
      desc: t("how.desc2"),
      icon: LayoutDashboard,
      gradient: "from-purple-500 to-pink-500",
      delay: 0.1,
    },
    {
      title: t("how.title3"),
      desc: t("how.desc3"),
      icon: Bot,
      gradient: "from-green-500 to-emerald-500",
      delay: 0.2,
    },
    {
      title: t("how.title4"),
      desc: t("how.desc4"),
      icon: Database,
      gradient: "from-orange-500 to-red-500",
      delay: 0.3,
    },
    {
      title: t("how.title5"),
      desc: t("how.desc5"),
      icon: BarChart3,
      gradient: "from-indigo-500 to-blue-600",
      delay: 0.4,
    },
    {
      title: t("how.title6"),
      desc: t("how.desc6"),
      icon: Rocket,
      gradient: "from-purple-600 to-indigo-600",
      delay: 0.5,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-background relative overflow-hidden" ref={sectionRef}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <SectionHeader title={t("how.title")} subtitle={t("how.subtitle")} />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
            <div
              key={idx}
                className="group relative bg-white dark:bg-surface-elevated rounded-2xl p-8 border border-neutral-100 dark:border-border-light shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
                style={{
                  animation: inView ? `fadeInUp 0.6s ease-out ${step.delay}s forwards` : 'none',
                  opacity: inView ? 1 : 0,
                }}
              >
                {/* Gradient background effect on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Step number */}
                <div className="absolute top-4 left-4 w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-full flex items-center justify-center border-2 border-gray-200 dark:border-gray-700">
                  <span className="text-xs font-bold text-foreground">{idx + 1}</span>
                </div>

                <div className="relative z-10 mt-4">
                  <div className={`bg-gradient-to-br ${step.gradient} w-16 h-16 flex items-center justify-center rounded-2xl mx-auto mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-3 group-hover:text-brand-primary transition-colors text-center">
                    {step.title}
                  </h4>
                  <p className="text-sm text-foreground-muted leading-relaxed text-center">{step.desc}</p>
                </div>

                {/* Decorative corner element */}
                <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${step.gradient} opacity-5 rounded-bl-full`} />
                
                {/* Hover underline effect */}
                <div className={`absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r ${step.gradient} group-hover:w-full transition-all duration-500`} />
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 60px 60px;
          }
        }
      `}</style>
    </section>
  );
};

// Data Collection Section Component
export const DataCollectionSection = () => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8
      }
    }
  };

  const whatsappSteps = [
    "Kirim pesan ke nomor Agent yang ditentukan",
    "AI mengenali konteks dan format data",
    "Data divalidasi dan dikonversi ke format terstruktur",
    "Notifikasi real-time untuk data yang tidak valid"
  ];

  const iotSteps = [
    "Sensor terpasang pada mesin/peralatan operasional",
    "Data dikirim secara otomatis ke platform Naraflow",
    "Platform memproses dan menyimpan data terstruktur",
    "Notifikasi untuk kondisi abnormal atau peringatan"
  ];

  return (
    <section 
      id="data-collection"
      ref={ref}
      className="py-20 bg-gray-50 dark:bg-surface"
      aria-labelledby="data-collection-title"
    >
      <div className="container mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="text-center mb-16"
        >
          <motion.h2
            id="data-collection-title"
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Dua Cara Mudah Mengumpulkan Data
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-lg text-foreground-muted max-w-3xl mx-auto"
          >
            Pilih metode yang paling sesuai dengan kebutuhan operasional perusahaan Anda
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* WhatsApp Method */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="group"
          >
            <div className="bg-white dark:bg-surface-elevated rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 h-full border border-gray-100 dark:border-border-light hover:border-green-200 dark:hover:border-green-800">
              {/* Header */}
              <div className="flex items-center mb-6">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-white text-2xl mr-6 shadow-lg"
                >
                  <MessageCircle size={32} />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-1">
                    Input via WhatsApp
                  </h3>
                  <p className="text-green-600 dark:text-green-400 font-medium">Metode Mudah & Familiar</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-foreground-muted mb-8 leading-relaxed">
                Tim lapangan dapat melaporkan aktivitas langsung melalui WhatsApp tanpa perlu menginstall aplikasi tambahan.
                Naraflow secara otomatis memproses pesan dan mengekstrak data terstruktur.
              </p>

              {/* Features */}
              <div className="mb-8">
                <h4 className="font-semibold text-foreground mb-4 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Cara Kerja:
                </h4>
                <div className="space-y-3">
                  {whatsappSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-start"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={inView ? { scale: 1 } : {}}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0"
                      >
                        <CheckCircle size={14} className="text-green-600 dark:text-green-400" />
                      </motion.div>
                      <span className="text-foreground-muted text-sm leading-relaxed">{step}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">90%</div>
                  <div className="text-sm text-foreground-muted">Reducsi Error</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">24/7</div>
                  <div className="text-sm text-foreground-muted">Operasional</div>
                </div>
              </div>

              {/* Demo Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center group"
              >
                Lihat Demo WhatsApp
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </motion.div>

          {/* IoT Method */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="group"
          >
            <div className="bg-white dark:bg-surface-elevated rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 h-full border border-gray-100 dark:border-border-light hover:border-blue-200 dark:hover:border-blue-800">
              {/* Header */}
              <div className="flex items-center mb-6">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl mr-6 shadow-lg"
                >
                  <Cpu size={32} />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-1">
                    Sensor & Perangkat IoT
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400 font-medium">Data Real-Time Otomatis</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-foreground-muted mb-8 leading-relaxed">
                Pasang sensor IoT pada mesin dan peralatan untuk mengumpulkan data operasional secara real-time 
                tanpa intervensi manual.
              </p>

              {/* Features */}
              <div className="mb-8">
                <h4 className="font-semibold text-foreground mb-4 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                  Cara Kerja:
                </h4>
                <div className="space-y-3">
                  {iotSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-start"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={inView ? { scale: 1 } : {}}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0"
                      >
                        <CheckCircle size={14} className="text-blue-600 dark:text-blue-400" />
                      </motion.div>
                      <span className="text-foreground-muted text-sm leading-relaxed">{step}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">100%</div>
                  <div className="text-sm text-foreground-muted">Real-time</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">99.9%</div>
                  <div className="text-sm text-foreground-muted">Akurasi</div>
                </div>
              </div>

              {/* Demo Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center group"
              >
                Lihat Demo IoT
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Comparison Arrow */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="flex justify-center mt-8"
        >
          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
            Atau kombinasi keduanya untuk hasil optimal
          </div>
        </motion.div>
      </div>
    </section>
  );
};
