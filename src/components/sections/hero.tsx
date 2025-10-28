import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button-extended";
import { useLanguage } from "@/hooks/use-language";
import { 
  ChevronLeft, 
  ChevronRight, 
  Tractor, 
  ClipboardList,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  Sparkles,
  CheckCircle2,
    Building,
    Truck,
  Store,
  Hotel,
  Recycle,
    Bird,
    Fish
} from "lucide-react";
import { WhatsAppMockup } from "@/components/whatsapp-mockup";
import { WaveBackground } from "@/components/ui/wave-background";

export const Hero = () => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<"all" | "farm" | "field">("all");
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Neutral brand colors for a clean, white layout with Naraflow purple accents
  const brandColors = {
    primary: {
      light: '#F3F4F6',
      medium: '#111827',
      dark: '#0B1220'
    },
    surface: '#FFFFFF',
    text: {
      dark: '#111827',
      muted: '#6B7280'
    },
    gradient: 'linear-gradient(135deg, #111827 0%, #374151 100%)'
  };

  const allProducts = [
    {
      name: "Rahayu",
      icon: Bird,
      description: "Platform manajemen peternakan ayam melalui WhatsApp. Pantau kesehatan, produksi, dan penjualan dengan mudah.",
      features: ["Monitoring Kesehatan", "Tracking Produksi", "Manajemen Pakan", "Laporan Otomatis"],
      status: "available",
      link: "https://tanyarahayu.com/",
      category: "farm",
      time: "09:41",
      lastMessage: "Sampling bobot hari ini sudah selesai, rata-rata 1.8kg",
      color: "from-amber-100 to-orange-100",
      iconColor: "text-amber-600"
    },
    {
      name: "Rodaya",
      icon: Store,
      description: "Sistem pemesanan dan manajemen inventori untuk warung dan UMKM melalui WhatsApp.",
      features: ["Pemesanan Otomatis", "Manajemen Stok", "Laporan Penjualan", "Payment Tracking"],
      status: "available",
      link: "https://rodaya.naraflow.id/",
      category: "field",
      time: "09:41",
      lastMessage: "Pesanan warung Bu Siti sudah diproses",
      color: "from-emerald-100 to-green-100",
      iconColor: "text-emerald-600"
    },
    {
      name: "Tambakflow",
      icon: Fish,
      description: "Monitoring dan manajemen tambak udang real-time via WhatsApp.",
      features: ["Kualitas Air", "Monitoring Pakan", "Health Tracking", "Panen Otomatis"],
      status: "available",
      link: "https://tambak.naraflow.id",
      category: "farm",
      time: "09:41",
      lastMessage: "Kualitas air stabil, pakan 25kg terdistribusi",
      color: "from-blue-100 to-cyan-100",
      iconColor: "text-blue-600"
    },
    {
      name: "Kasaflow",
      icon: Truck,
      description: "Manajemen toko dan distribusi dengan integrasi WhatsApp Business.",
      features: ["Inventory Management", "Order Processing", "Customer Service", "Analytics"],
      status: "available",
      link: "https://kasaflow.lovable.app/",
      category: "farm",
      time: "09:41",
      lastMessage: "Nota timbang panen siap diverifikasi",
      color: "from-violet-100 to-purple-100",
      iconColor: "text-violet-600"
    },
    {
      name: "Tamara",
      icon: Hotel,
      description: "Workflow untuk housekeeping dan hospitality terintegrasi WhatsApp. Mendukung laporan kebersihan kamar, checklist maintenance, dan penanganan keluhan tamu secara cepat.",
      features: ["Housekeeping", "Maintenance", "Guest Services", "Quality Control"],
      status: "available",
      link: "https://tamara.naraflow.id/",
      category: "field",
      time: "09:41",
      lastMessage: "Checklist kamar 207 sudah lengkap",
      color: "from-pink-100 to-rose-100",
      iconColor: "text-pink-600"
    },
    {
      name: "Sortify",
      icon: Recycle,
      description: "Manajemen daur ulang dan sustainability tracking melalui WhatsApp.",
      features: ["Waste Tracking", "Recycling Points", "Sustainability Reports", "Community Engagement"],
      status: "available",
      category: "field",
      time: "09:41",
      lastMessage: "Sampah plastik 25kg sudah terproses",
      color: "from-lime-100 to-green-100",
      iconColor: "text-lime-600"
    }
  ];

  const farmProducts = allProducts.filter(p => p.category === "farm");
  const fieldProducts = allProducts.filter(p => p.category === "field");

  const getActiveProducts = () => {
    if (activeCategory === "farm") return farmProducts;
    if (activeCategory === "field") return fieldProducts;
    return allProducts;
  };

  const products = getActiveProducts();

  useEffect(() => {
    if (activeCategory !== "all" && products.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % products.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [products.length, activeCategory]);

  // Reset index when category changes to avoid out-of-range
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeCategory]);

  // Keyboard arrow navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        nextProduct();
      } else if (e.key === "ArrowLeft") {
        prevProduct();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [products.length]);

  const nextProduct = () => {
    setCurrentIndex(prev => (prev + 1) % products.length);
  };

  const prevProduct = () => {
    setCurrentIndex(prev => (prev - 1 + products.length) % products.length);
  };

  const currentProduct = products[currentIndex];

  return (
    <WaveBackground className="min-h-screen flex items-center justify-center py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-6 relative z-10">
        <div className={`transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          
          {/* Header */}
          <div className="text-center space-y-6 max-w-4xl mx-auto mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-4 shadow-sm"
              style={{
                background: '#6D2A9A',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">
                Satu Platform, Semua Kebutuhan
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl tracking-tight leading-tight"
              style={{ color: brandColors.text.dark }}>
              <span className="font-semibold">
                Satu{" "}
                <span style={{ color: '#25D366' }}>WhatsApp</span>
                .
              </span>
              <br />
              <span className="font-extrabold" style={{ color: brandColors.text.dark }}>
                Semua Beres.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed" style={{ color: brandColors.text.muted }}>
              Dua kategori, satu platform. Dari farm hingga operasional lapangan — semua tercatat di WhatsApp.
            </p>

            {/* Category Filter */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-12">
              <div className="inline-flex rounded-2xl p-1.5 border shadow-sm bg-white"
                style={{ 
                  borderColor: 'rgba(17, 24, 39, 0.08)'
                }}>
            <button
                  onClick={() => setActiveCategory("all")}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    activeCategory === "all" ? "text-white" : 'text-gray-700'
                  }`}
                  style={{
                    background: activeCategory === "all" ? '#6D2A9A' : 'transparent',
                    color: activeCategory === "all" ? 'white' : brandColors.text.dark
                  }}
            >
              Semua Agen
            </button>
            <button
                  onClick={() => setActiveCategory("farm")}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                    activeCategory === "farm" ? "text-white" : 'text-gray-700'
                  }`}
                  style={{
                    background: activeCategory === "farm" ? '#6D2A9A' : 'transparent',
                    color: activeCategory === "farm" ? 'white' : brandColors.text.dark
                  }}
                >
                  🌾
              Farm as a Service
            </button>
            <button
                  onClick={() => setActiveCategory("field")}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                    activeCategory === "field" ? "text-white" : 'text-gray-700'
                  }`}
                  style={{
                    background: activeCategory === "field" ? '#6D2A9A' : 'transparent',
                    color: activeCategory === "field" ? 'white' : brandColors.text.dark
                  }}
                >
                  🧱
              Field Workflow
            </button>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-start max-w-7xl mx-auto">
            
            {/* Left: WhatsApp Mockup + Chat Preview */}
            <div className="space-y-6">
              {/* WhatsApp Mockup dengan shadow matching logo */}
              <div className="relative">
                <WhatsAppMockup />
              </div>
            </div>

            {/* Right: Products Display */}
            <div className="space-y-6">
              
              {/* Current Product Focus */}
              <div className="rounded-3xl p-8 border shadow-sm transition-transform hover:scale-[1.01]"
                style={{ 
                  background: '#FFFFFF',
                  borderColor: 'rgba(17, 24, 39, 0.08)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)'
                }}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    {currentProduct ? (
                      <>
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentProduct.color} flex items-center justify-center shadow-lg`}>
                          <currentProduct.icon className={`w-6 h-6 ${currentProduct.iconColor}`} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold" style={{ color: brandColors.text.dark }}>{currentProduct.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded-full"
                              style={{
                                background: brandColors.primary.light,
                                color: brandColors.primary.dark
                              }}>
                              {currentProduct.category === 'farm' ? '🌾 Farm' : '🧱 Field'}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center shadow-lg">
                          <Hotel className="w-6 h-6 text-pink-600" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold" style={{ color: brandColors.text.dark }}>Tamara</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded-full"
                              style={{ background: '#F0F9FF', color: brandColors.primary.dark }}>
                              🧱 Field
                            </span>
              </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Navigation */}
                  {products.length > 1 && (
                    <div className="flex gap-2">
                      <button
                        onClick={prevProduct}
                        className="p-2 rounded-full border transition-colors hover:shadow-sm"
                        style={{ borderColor: 'rgba(17, 24, 39, 0.12)' }}>
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={nextProduct}
                        className="p-2 rounded-full border transition-colors hover:shadow-sm"
                        style={{ borderColor: 'rgba(17, 24, 39, 0.12)' }}>
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                    </div>
                  )}
                </div>

                <p className="leading-relaxed mb-6 text-base font-normal" style={{ color: brandColors.text.muted }}>
                  {currentProduct ? currentProduct.description : "Workflow untuk housekeeping dan hospitality. Mendukung laporan kebersihan kamar, checklist maintenance, dan penanganan keluhan tamu secara cepat, semua terintegrasi lewat WhatsApp."}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {(currentProduct ? currentProduct.features : allProducts.find(p => p.name === "Tamara")?.features || []).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm font-medium" style={{ color: brandColors.text.muted }}>
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#10B981' }} />
                      <span className="line-clamp-1">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <a
                    href={currentProduct ? currentProduct.link : "https://tamara.naraflow.id/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-6 rounded-xl font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                    style={{
                      background: '#6D2A9A',
                      color: 'white',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                    }}
                  >
                    Kunjungi Website
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Product Line Summary */}
              <div className="rounded-3xl p-6 border shadow-sm"
                style={{
                  background: '#FFFFFF',
                  borderColor: 'rgba(17, 24, 39, 0.08)'
                }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: brandColors.text.dark }}>Lini Produk Naraflow</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="font-semibold mb-3 flex items-center gap-2 text-sm" style={{ color: brandColors.text.dark }}>
                      <Tractor className="w-4 h-4" style={{ color: '#111827' }} />
                      Farm as a Service
                    </p>
                    <div className="space-y-2">
                      {farmProducts.map(product => {
                        const IconComponent = product.icon;
                        return (
                          <div key={product.name} className="flex items-center gap-3 p-2 rounded-lg bg-white">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${product.color} flex items-center justify-center`}>
                              <IconComponent className={`w-4 h-4 ${product.iconColor}`} />
                            </div>
                            <span className="text-sm font-semibold" style={{ color: brandColors.text.dark }}>{product.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold mb-3 flex items-center gap-2 text-sm" style={{ color: brandColors.text.dark }}>
                      <ClipboardList className="w-4 h-4" style={{ color: '#111827' }} />
                      Field Workflow
                    </p>
                    <div className="space-y-2">
                      {fieldProducts.map(product => {
                        const IconComponent = product.icon;
                        return (
                          <div key={product.name} className="flex items-center gap-3 p-2 rounded-lg bg-white">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${product.color} flex items-center justify-center`}>
                              <IconComponent className={`w-4 h-4 ${product.iconColor}`} />
                            </div>
                            <span className="text-sm font-semibold" style={{ color: brandColors.text.dark }}>{product.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          
        </div>
      </div>
    </WaveBackground>
  );
};
