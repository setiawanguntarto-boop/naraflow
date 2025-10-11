import { SectionHeader } from "@/components/section-header";
import { useLanguage } from "@/hooks/use-language";
import { FileX, Smartphone, MessageSquare, Eye, CheckCircle2, Sprout, Waves } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const About = () => {
  const { t } = useLanguage();

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <SectionHeader
          title={t('about.title')}
          subtitle={t('about.subtitle')}
        />

        {/* Why Naraflow - Business Thesis */}
        <div className="mb-20">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">Kenapa Naraflow?</h3>
            <p className="text-foreground-muted text-lg">
              Data akurat dari lapangan adalah kunci, namun seringkali terhambat oleh proses manual dan aplikasi yang rumit. Di sinilah letak masalah yang kami selesaikan.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Pain Point 1 */}
            <Card className="border-border-light hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="bg-destructive/10 text-destructive w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5">
                  <FileX className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-3">Data Terfragmentasi</h4>
                <p className="text-foreground-muted leading-relaxed">
                  Pencatatan data di lapangan masih sering manual, tidak standar, dan lambat. Ini menciptakan kesenjangan antara realita di lapangan dan data di kantor pusat.
                </p>
              </CardContent>
            </Card>

            {/* Pain Point 2 */}
            <Card className="border-border-light hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Smartphone className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-3">Aplikasi Rumit Gagal Diadopsi</h4>
                <p className="text-foreground-muted leading-relaxed">
                  Aplikasi konvensional seringkali terlalu kompleks, butuh pelatihan, dan tidak intuitif bagi pekerja lapangan, sehingga tingkat penggunaannya rendah.
                </p>
              </CardContent>
            </Card>

            {/* Pain Point 3 */}
            <Card className="border-border-light hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8 text-center">
                <div className="bg-brand-primary/10 text-brand-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-3">Solusi di Platform yang Dikenal</h4>
                <p className="text-foreground-muted leading-relaxed">
                  Naraflow bekerja di dalam WhatsApp. Tim Anda bisa melaporkan data lewat percakapan biasa, tanpa perlu membuka atau belajar aplikasi baru.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="grid gap-8 md:grid-cols-2 mb-20">
          <Card className="border-border-light hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-8 text-center">
              <div className="bg-brand-primary/10 text-brand-primary w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5">
                <Eye className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">{t('about.vision.title')}</h3>
              <p className="text-foreground-muted leading-relaxed text-lg">
                {t('about.vision.desc')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border-light hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-8">
              <div className="bg-brand-primary/10 text-brand-primary w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4 text-center">{t('about.mission.title')}</h3>
              <ul className="space-y-3 text-foreground-muted max-w-sm mx-auto">
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span><span className="font-semibold text-foreground">Otomatisasi Percakapan:</span> Mengubah obrolan WhatsApp menjadi alur kerja terstruktur secara otomatis.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span><span className="font-semibold text-foreground">Integrasi Tanpa Batas:</span> Menghubungkan data dari lapangan ke sistem bisnis inti Anda (ERP, CRM) dengan mudah.</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span><span className="font-semibold text-foreground">Memberdayakan Tim:</span> Menyediakan alat yang intuitif dan mudah digunakan oleh semua level pekerja.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Segments Section */}
        <div>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">Satu Platform untuk Setiap Kebutuhan Lapangan</h3>
            <p className="text-foreground-muted text-lg">
              Dari memantau pertumbuhan panen hingga mengelola check-in tamu, Naraflow menyediakan alur kerja khusus untuk industri Anda.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
            {/* Agriculture Segment */}
            <Card className="border-border-light hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <h4 className="text-2xl font-bold text-foreground">Agrikultur & Akuakultur</h4>
                </div>
                <p className="text-foreground-muted mb-6">
                  Digitalisasi pencatatan data dari sawah, kebun, atau tambak langsung melalui WhatsApp untuk pemantauan real-time dan pengambilan keputusan yang lebih baik.
                </p>
                <div className="space-y-3">
                  <div className="bg-background-soft p-3 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center text-green-700 dark:text-green-300 font-bold">R</div>
                    <div>
                      <p className="font-semibold text-foreground">Rahayu</p>
                      <p className="text-sm text-foreground-muted">Manajemen Pertanian & Perkebunan</p>
                    </div>
                  </div>
                  <div className="bg-background-soft p-3 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-200 dark:bg-cyan-800 flex items-center justify-center text-cyan-700 dark:text-cyan-300 font-bold">
                      <Waves className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Tambakflow</p>
                      <p className="text-sm text-foreground-muted">Manajemen Budidaya Ikan & Udang</p>
                    </div>
                  </div>
                  <div className="bg-background-soft p-3 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">K</div>
                    <div>
                      <p className="font-semibold text-foreground">Kasaflow</p>
                      <p className="text-sm text-foreground-muted">Manajemen Perhotelan & Properti</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Field Workflow Segment */}
            <Card className="border-border-light hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 w-12 h-12 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-2xl font-bold text-foreground">Operasional Lapangan</h4>
                </div>
                <p className="text-foreground-muted mb-6">
                  Koordinasi tim, pelaporan insiden, dan audit kepatuhan menjadi lebih mudah dan terdokumentasi dengan baik untuk industri seperti perhotelan, logistik, dan manajemen properti.
                </p>
                <div className="space-y-3">
                  <div className="bg-background-soft p-3 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-200 dark:bg-red-800 flex items-center justify-center text-red-700 dark:text-red-300 font-bold">T</div>
                    <div>
                      <p className="font-semibold text-foreground">Tamara</p>
                      <p className="text-sm text-foreground-muted">Manajemen Peternakan</p>
                    </div>
                  </div>
                  <div className="bg-background-soft p-3 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold">R</div>
                    <div>
                      <p className="font-semibold text-foreground">Rodaya</p>
                      <p className="text-sm text-foreground-muted">Manajemen Logistik & Armada</p>
                    </div>
                  </div>
                  <div className="bg-background-soft p-3 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-fuchsia-200 dark:bg-fuchsia-800 flex items-center justify-center text-fuchsia-700 dark:text-fuchsia-300 font-bold">S</div>
                    <div>
                      <p className="font-semibold text-foreground">Sortify</p>
                      <p className="text-sm text-foreground-muted">Manajemen Gudang & Inventaris</p>
                    </div>
                  </div>
                  <div className="bg-background-soft p-3 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold">A</div>
                    <div>
                      <p className="font-semibold text-foreground">Alur Kerja Kustom</p>
                      <p className="text-sm text-foreground-muted">Solusi Sesuai Kebutuhan Bisnis Anda</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};