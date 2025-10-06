import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'id' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  id: {
    // Header
    'nav.solutions': 'Solusi',
    'nav.how-it-works': 'Cara Kerja',
    'nav.about': 'Tentang',
    'nav.pricing': 'Harga',
    'nav.demo': 'Demo',
    'nav.faq': 'FAQ',
    'nav.contact': 'Kontak',
    'nav.try-demo': 'Coba Demo',

    // Hero Section
    'hero.main-title-1': 'Satu',
    'hero.main-title-wa': 'WhatsApp',
    'hero.main-title-2': 'Semua Beres.',
    'hero.lead': 'Naraflow mengubah cara tim lapangan bekerja. Catat, koordinasi, dan kelola semua operasional bisnis langsung dari WhatsApp, tanpa perlu install aplikasi tambahan.',
    'hero.cta-demo-free': 'Coba Demo Gratis',
    'hero.cta-how-it-works': 'Lihat Cara Kerja',
    'hero.title': 'WhatsApp-first Workflow for SMEs',
    'hero.subtitle': 'Sederhanakan pencatatan, koordinasi, dan tata kelola bisnis Anda — langsung dari WhatsApp, tanpa ribet aplikasi baru.',
    'hero.cta-demo': '🚀 Coba Demo',
    'hero.cta-learn': '📖 Lihat Cara Kerja',
    'hero.feature1': 'Pencatatan langsung via WhatsApp',
    'hero.feature2': 'Data rapi & transparan',
    'hero.feature3': 'Siap dipakai untuk laporan & analisis',

    // Solutions
    'solutions.title': 'Solusi yang Ditawarkan Naraflow',
    'solutions.subtitle': 'Naraflow membantu bisnis Anda keluar dari pencatatan manual yang rawan hilang dan manipulasi. Semua data langsung rapi, transparan, dan siap dipakai untuk keputusan bisnis.',
    'solutions.communication.title': 'Komunikasi Cepat',
    'solutions.communication.desc': 'Semua interaksi tim langsung lewat WhatsApp tanpa aplikasi tambahan. Anak kandang, admin, hingga supervisor bisa terhubung real-time.',
    'solutions.communication.example': 'Contoh: Anak kandang mencatat mortalitas pagi ini, supervisor langsung dapat notifikasi di WhatsApp.',
    'solutions.automation.title': 'Otomatisasi',
    'solutions.automation.desc': 'Setiap input data otomatis terstruktur dan tersimpan rapi, siap dipakai untuk laporan dan analisis.',
    'solutions.automation.example': 'Contoh: Pencatatan pakan harian otomatis masuk ke laporan bulanan tanpa perlu input manual di Excel.',
    'solutions.efficiency.title': 'Efisiensi Waktu',
    'solutions.efficiency.desc': 'Naraflow memotong alur birokrasi yang panjang, membuat laporan siap lebih cepat dan akurat.',
    'solutions.efficiency.example': 'Contoh: Admin tidak lagi menunggu seminggu untuk laporan panen—data bisa langsung dikompilasi dalam hitungan menit.',
    'solutions.accuracy.title': 'Akurat & Transparan',
    'solutions.accuracy.desc': 'Semua data tercatat dengan jelas, diverifikasi, dan dapat diaudit. Mengurangi risiko manipulasi dan kebocoran data.',
    'solutions.accuracy.example': 'Contoh: Nota timbang panen yang biasanya hanya di kertas, kini otomatis tercatat dan bisa diverifikasi supervisor.',

    // About

    // How it Works
    'how-it-works.title': 'Bagaimana Naraflow Bekerja?',
    'how-it-works.subtitle': 'Semua alur bisnis langsung berjalan di WhatsApp: mulai dari pencatatan, validasi, hingga laporan — sederhana, transparan, dan efisien.',
    'how.title': 'Bagaimana Naraflow Bekerja?',
    'how.subtitle': 'Empat langkah sederhana dari chat hingga laporan yang siap dipakai.',
    'how.title1': 'Mulai dari WhatsApp',
    'how.desc1': 'Tim mencatat aktivitas langsung lewat WhatsApp tanpa aplikasi tambahan.',
    'how.title2': 'Input Terstruktur',
    'how.desc2': 'Data divalidasi dan ditata otomatis agar konsisten dan rapi.',
    'how.title3': 'Otomatisasi Alur',
    'how.desc3': 'Notifikasi, agregasi, dan sinkronisasi data berjalan otomatis.',
    'how.title4': 'Laporan & Insight',
    'how.desc4': 'Data siap untuk pelaporan periodik dan analisis keputusan.',

    // Pricing
    'pricing.title': 'Harga yang Sederhana & Transparan',
    'pricing.subtitle': 'Bayar sesuai kebutuhan Anda. Tanpa biaya tersembunyi, fleksibel sesuai skala bisnis.',
    'pricing.contact': 'Hubungi Kami',
    'pricing.popular': 'Paling Populer',
    'pricing.plan1.title': 'Starter',
    'pricing.plan1.price': 'Rp99.000/nomor/bulan',
    'pricing.plan1.subtitle': 'Langganan per nomor WhatsApp.',
    'pricing.plan1.f1': 'Alur dasar WhatsApp',
    'pricing.plan1.f2': 'Penyimpanan standar',
    'pricing.plan1.f3': 'Dukungan komunitas',
    'pricing.plan2.title': 'Growth',
    'pricing.plan2.price': 'Rp6.000.000/deploy',
    'pricing.plan2.subtitle': 'Biaya per deploy untuk implementasi.',
    'pricing.plan2.f1': 'Otomatisasi & notifikasi',
    'pricing.plan2.f2': 'Laporan periodik',
    'pricing.plan2.f3': 'Prioritas dukungan',
    'pricing.plan3.title': 'Scale',
    'pricing.plan3.price': 'Hubungi kami',
    'pricing.plan3.subtitle': 'Kustomisasi & integrasi tingkat lanjut.',
    'pricing.plan3.f1': 'Integrasi ERP/API',
    'pricing.plan3.f2': 'Kontrol akses lanjutan',
    'pricing.plan3.f3': 'SLA enterprise',

    // Demo
    'demo.title': 'Coba Demo Rahayu Sekarang',
    'demo.subtitle': 'Rahayu adalah co-bot WhatsApp yang membantu pencatatan operasional harian di peternakan ayam. Semua data pakan, mortalitas, panen, dan suhu bisa dicatat dengan cepat, transparan, dan tanpa aplikasi tambahan.',
    'demo.open-whatsapp': 'Buka Demo di WhatsApp',
    'demo.conversation-flow': 'Alur Percakapan Demo',
    'demo.tutorial-video': 'Tutorial Video',
    'demo.s1': 'Ketik "halo" untuk memulai percakapan dengan Rahayu.',
    'demo.s2': 'Bot akan menawarkan menu seperti pencatatan pakan, mortalitas, atau panen.',
    'demo.s3': 'Pilih menu yang diinginkan dan ikuti instruksi bot untuk mengisi data.',
    'demo.s4': 'Data akan tervalidasi otomatis dan tersimpan rapi untuk laporan.',
    'demo.s5': 'Akhiri percakapan atau kembali ke menu utama untuk alur lainnya.',

    // FAQ
    'faq.title': 'Pertanyaan yang Sering Diajukan',
    'faq.q1': 'Apa itu Naraflow?',
    'faq.a1': 'Naraflow adalah platform WhatsApp-first Workflow untuk membantu pencatatan, koordinasi, dan tata kelola operasional bisnis secara sederhana dan transparan.',
    'faq.q2': 'Apakah harus install aplikasi baru?',
    'faq.a2': 'Tidak perlu. Semua berjalan lewat WhatsApp sehingga tim Anda bisa langsung menggunakan tanpa pelatihan rumit.',
    'faq.q3': 'Produk apa saja yang tersedia?',
    'faq.a3': 'Saat ini tersedia Rahayu dan Tambakflow. Rodaya sudah tersedia di situs resminya, dan produk lain sedang dikembangkan.',
    'faq.q4': 'Apakah data saya aman?',
    'faq.a4': 'Kami menerapkan praktik keamanan standar industri. Akses data dikontrol dan dicatat untuk menjaga integritas dan privasi.',
    'faq.q5': 'Bagaimana cara mencoba?',
    'faq.a5': 'Anda bisa mencoba demo Rahayu lewat tombol Demo di situs ini atau menghubungi kami melalui bagian Kontak.',
    'faq.q6': 'Berapa biayanya?',
    'faq.a6': 'Kami menyediakan paket harga yang sederhana dan transparan. Lihat bagian Harga untuk detail terbaru.',
    'faq.q7': 'Bisakah kustom sesuai kebutuhan bisnis saya?',
    'faq.a7': 'Bisa. Tim kami dapat membantu menyesuaikan alur kerja dan integrasi sesuai proses bisnis Anda.',

    // Contact
    'contact.title': 'Hubungi Tim Naraflow',
    'contact.subtitle': 'Ada pertanyaan atau ingin berdiskusi? Silakan hubungi kami lewat WhatsApp, email, atau kirim pesan langsung melalui form di bawah ini.',
    'contact.channels': 'Saluran Kontak',
    'contact.send-message': 'Kirim Pesan',
    'contact.name-placeholder': 'Nama Anda',
    'contact.email-placeholder': 'Email Anda',
    'contact.message-placeholder': 'Pesan Anda',
    'contact.send-button': 'Kirim Pesan',

    // Products
    'products.title': 'Lini Produk Naraflow',
    'products.subtitle': 'Solusi workflow WhatsApp yang disesuaikan untuk berbagai sektor bisnis. Dari pertanian hingga retail, Naraflow hadir dengan produk yang tepat untuk kebutuhan Anda.',
    'products.status.available': 'Tersedia',
    'products.status.coming-soon': 'Segera Hadir',
    'products.features-title': 'Fitur Utama',
    'products.learn-more': 'Pelajari Lebih Lanjut',
    'products.visit-site': 'Kunjungi Website',
    'products.coming-soon': 'Segera Hadir',
    'products.try-me': 'Coba Sekarang',
    'products.rahayu.desc': 'Workflow khusus untuk budidaya ayam broiler. Memudahkan pencatatan pakan, bobot ayam, mortalitas, dan hasil panen langsung dari WhatsApp. Data otomatis diolah menjadi laporan performa budidaya.',
    'products.rahayu.features': 'Pencatatan hasil panen, Monitoring kondisi lahan, Koordinasi tim pertanian, Laporan produksi otomatis',
    'products.rodaya.desc': 'Workflow untuk motoris dan distribusi FMCG. Membantu pencatatan penjualan di warung, kontrol stok barang, serta manajemen rute distribusi agar lebih efisien dan transparan.',
    'products.rodaya.features': 'Monitoring produksi real-time, Kontrol kualitas otomatis, Manajemen inventori, Laporan efisiensi',
    'products.tambakflow.desc': 'Workflow untuk budidaya udang. Menyediakan pencatatan kualitas air, jadwal pemberian pakan, hingga laporan siklus panen secara real-time melalui WhatsApp.',
    'products.tambakflow.features': 'Monitoring kualitas air, Pencatatan pakan udang, Tracking kesehatan udang, Laporan hasil panen',
    'products.kasaflow.desc': 'Workflow untuk trading singkong. Memfasilitasi verifikasi lahan, estimasi panen, dan pencatatan nota timbang digital sehingga transaksi lebih rapi dan dapat dilacak.',
    'products.kasaflow.features': 'Manajemen inventori, Tracking penjualan, Laporan keuangan, Integrasi kasir',
    'products.tamara.desc': 'Workflow untuk housekeeping dan hospitality. Mendukung laporan kebersihan kamar, checklist maintenance, dan penanganan keluhan tamu secara cepat, semua terintegrasi lewat WhatsApp.',
    'products.tamara.features': 'Housekeeping management, Maintenance tracking, Inventory control, Real-time reporting, Guest complaint handling',

    // About
    'about.title': 'Tentang Naraflow',
    'about.subtitle': 'Naraflow adalah platform WhatsApp-first Workflow yang membantu UMKM dan agribisnis mencatat, mengelola, dan memantau data secara sederhana namun terstruktur. Kami percaya setiap bisnis berhak atas tata kelola yang efisien, transparan, dan tangguh.',
    'about.vision.title': 'Visi',
    'about.vision.desc': 'Menjadi jembatan digitalisasi UMKM di Asia Tenggara dengan solusi sederhana, berbasis percakapan, dan transparan.',
    'about.mission.title': 'Misi',
    'about.mission.desc': 'Memberdayakan pelaku usaha kecil dengan teknologi yang mudah digunakan, meningkatkan efisiensi operasional, dan membangun kepercayaan berbasis data.',
    'about.values.simple.title': 'Sederhana',
    'about.values.simple.desc': 'Mudah dipakai tanpa training rumit.',
    'about.values.transparent.title': 'Transparan',
    'about.values.transparent.desc': 'Data jelas, rapi, dan bisa dipercaya.',
    'about.values.collaborative.title': 'Kolaboratif',
    'about.values.collaborative.desc': 'Mendukung semua peran dalam bisnis.',
    'about.values.resilient.title': 'Tangguh',
    'about.values.resilient.desc': 'Dirancang untuk bisnis sehari-hari yang dinamis.',

    // Footer
    'footer.rights': 'All rights reserved.'
  },
  en: {
    // Header
    'nav.solutions': 'Solutions',
    'nav.how-it-works': 'How It Works',
    'nav.about': 'About',
    'nav.pricing': 'Pricing',
    'nav.demo': 'Demo',
    'nav.faq': 'FAQ',
    'nav.contact': 'Contact',
    'nav.try-demo': 'Try Demo',

    // Hero Section
    'hero.main-title-1': 'One',
    'hero.main-title-wa': 'WhatsApp',
    'hero.main-title-2': 'Everything Done.',
    'hero.lead': 'Naraflow transforms how field teams work. Record, coordinate, and manage all business operations directly from WhatsApp, without installing additional apps.',
    'hero.cta-demo-free': 'Try Free Demo',
    'hero.cta-how-it-works': 'See How It Works',
    'hero.title': 'WhatsApp-first Workflow for SMEs',
    'hero.subtitle': 'Simplify your business recording, coordination, and governance — directly from WhatsApp, without the hassle of new apps.',
    'hero.cta-demo': '🚀 Try Demo',
    'hero.cta-learn': '📖 See How It Works',
    'hero.feature1': 'Direct recording via WhatsApp',
    'hero.feature2': 'Clean & transparent data',
    'hero.feature3': 'Ready for reports & analysis',

    // Solutions
    'solutions.title': 'Solutions Offered by Naraflow',
    'solutions.subtitle': 'Naraflow helps your business move away from manual recording that is prone to loss and manipulation. All data is immediately clean, transparent, and ready for business decisions.',
    'solutions.communication.title': 'Fast Communication',
    'solutions.communication.desc': 'All team interactions directly through WhatsApp without additional apps. Farm workers, admins, and supervisors can connect in real-time.',
    'solutions.communication.example': 'Example: Farm worker records morning mortality, supervisor immediately gets notification on WhatsApp.',
    'solutions.automation.title': 'Automation',
    'solutions.automation.desc': 'Every data input is automatically structured and stored neatly, ready for reports and analysis.',
    'solutions.automation.example': 'Example: Daily feed recording automatically goes into monthly reports without manual Excel input.',
    'solutions.efficiency.title': 'Time Efficiency',
    'solutions.efficiency.desc': 'Naraflow cuts through lengthy bureaucratic processes, making reports ready faster and more accurate.',
    'solutions.efficiency.example': 'Example: Admin no longer waits a week for harvest reports—data can be compiled immediately in minutes.',
    'solutions.accuracy.title': 'Accurate & Transparent',
    'solutions.accuracy.desc': 'All data is clearly recorded, verified, and auditable. Reduces risk of manipulation and data leakage.',
    'solutions.accuracy.example': 'Example: Harvest weighing notes that used to be only on paper, now automatically recorded and verifiable by supervisors.',

    // About

    // How it Works
    'how-it-works.title': 'How Does Naraflow Work?',
    'how-it-works.subtitle': 'All business flows run directly on WhatsApp: from recording, validation, to reports — simple, transparent, and efficient.',
    'how.title': 'How Naraflow Works',
    'how.subtitle': 'Four simple steps from chat to ready-to-use reports.',
    'how.title1': 'Start in WhatsApp',
    'how.desc1': 'Teams record activities directly via WhatsApp without extra apps.',
    'how.title2': 'Structured Input',
    'how.desc2': 'Data is validated and automatically organized for consistency.',
    'how.title3': 'Automation',
    'how.desc3': 'Notifications, aggregation, and data sync run automatically.',
    'how.title4': 'Reports & Insights',
    'how.desc4': 'Data is ready for periodic reporting and decision analysis.',

    // Pricing
    'pricing.title': 'Simple & Transparent Pricing',
    'pricing.subtitle': 'Pay according to your needs. No hidden costs, flexible according to business scale.',
    'pricing.contact': 'Contact Us',
    'pricing.popular': 'Most Popular',
    'pricing.plan1.title': 'Starter',
    'pricing.plan1.price': 'IDR 99,000/number/month',
    'pricing.plan1.subtitle': 'Subscription per WhatsApp number.',
    'pricing.plan1.f1': 'Basic WhatsApp flows',
    'pricing.plan1.f2': 'Standard storage',
    'pricing.plan1.f3': 'Community support',
    'pricing.plan2.title': 'Growth',
    'pricing.plan2.price': 'IDR 6,000,000/deploy',
    'pricing.plan2.subtitle': 'Per-deploy implementation fee.',
    'pricing.plan2.f1': 'Automation & notifications',
    'pricing.plan2.f2': 'Periodic reports',
    'pricing.plan2.f3': 'Priority support',
    'pricing.plan3.title': 'Scale',
    'pricing.plan3.price': 'Contact us',
    'pricing.plan3.subtitle': 'Advanced customization & integrations.',
    'pricing.plan3.f1': 'ERP/API integrations',
    'pricing.plan3.f2': 'Advanced access control',
    'pricing.plan3.f3': 'Enterprise SLA',

    // Demo
    'demo.title': 'Try Rahayu Demo Now',
    'demo.subtitle': 'Rahayu is a WhatsApp co-bot that helps daily operational recording in chicken farms. All feed, mortality, harvest, and temperature data can be recorded quickly, transparently, and without additional apps.',
    'demo.open-whatsapp': 'Open Demo on WhatsApp',
    'demo.conversation-flow': 'Demo Conversation Flow',
    'demo.tutorial-video': 'Tutorial Video',
    'demo.s1': 'Type "hello" to start a conversation with Rahayu.',
    'demo.s2': 'The bot will offer menus like feed entry, mortality, or harvest.',
    'demo.s3': 'Choose a menu and follow the bot instructions to fill in data.',
    'demo.s4': 'Data is automatically validated and neatly stored for reports.',
    'demo.s5': 'End the chat or return to the main menu for other flows.',

    // FAQ
    'faq.title': 'Frequently Asked Questions',
    'faq.q1': 'What is Naraflow?',
    'faq.a1': 'Naraflow is a WhatsApp-first Workflow platform that helps with recording, coordination, and governance of business operations in a simple and transparent way.',
    'faq.q2': 'Do I need to install a new app?',
    'faq.a2': 'No. Everything runs through WhatsApp so your team can use it immediately without complex training.',
    'faq.q3': 'Which products are available?',
    'faq.a3': 'Currently, Rahayu and Tambakflow are available. Rodaya is now live on its official site, and other products are under development.',
    'faq.q4': 'Is my data secure?',
    'faq.a4': 'We follow industry-standard security practices. Data access is controlled and audited to maintain integrity and privacy.',
    'faq.q5': 'How can I try it?',
    'faq.a5': 'You can try the Rahayu demo via the Demo section on this site or contact us through the Contact section.',
    'faq.q6': 'How much does it cost?',
    'faq.a6': 'We offer simple and transparent pricing plans. See the Pricing section for the latest details.',
    'faq.q7': 'Can it be customized for my business?',
    'faq.a7': 'Yes. Our team can help tailor workflows and integrations to your processes.',

    // Contact
    'contact.title': 'Contact Naraflow Team',
    'contact.subtitle': 'Have questions or want to discuss? Please contact us via WhatsApp, email, or send a message directly through the form below.',
    'contact.channels': 'Contact Channels',
    'contact.send-message': 'Send Message',
    'contact.name-placeholder': 'Your Name',
    'contact.email-placeholder': 'Your Email',
    'contact.message-placeholder': 'Your Message',
    'contact.send-button': 'Send Message',

    // Products
    'products.title': 'Naraflow Product Line',
    'products.subtitle': 'WhatsApp workflow solutions tailored for various business sectors. From agriculture to retail, Naraflow provides the right products for your needs.',
    'products.status.available': 'Available',
    'products.status.coming-soon': 'Coming Soon',
    'products.features-title': 'Key Features',
    'products.learn-more': 'Learn More',
    'products.visit-site': 'Visit Website',
    'products.coming-soon': 'Coming Soon',
    'products.try-me': 'Try Now',
    'products.rahayu.desc': 'Workflow solution for agriculture and agribusiness sectors. Manage recording, monitoring, and agricultural team coordination easily.',
    'products.rahayu.features': 'Harvest recording, Land condition monitoring, Agricultural team coordination, Automatic production reports',
    'products.rodaya.desc': 'Workflow platform specifically for industry and manufacturing. Optimize production processes and quality control.',
    'products.rodaya.features': 'Real-time production monitoring, Automatic quality control, Inventory management, Efficiency reports',
    'products.tambakflow.desc': 'Management system for shrimp farming and aquaculture. Monitor shrimp health, water quality, and harvest yield.',
    'products.tambakflow.features': 'Water quality monitoring, Shrimp feed recording, Shrimp health tracking, Harvest reports',
    'products.kasaflow.desc': 'Retail and store solution for inventory and sales management. Manage stock and transactions efficiently.',
    'products.kasaflow.features': 'Inventory management, Sales tracking, Financial reports, Cashier integration',
    'products.tamara.desc': 'WhatsApp-first Workflow for hospitality operations. System for non-star hotels, guest houses, and fragmented villas.',
    'products.tamara.features': 'Housekeeping management, Maintenance tracking, Inventory control, Real-time reporting, Guest complaint handling',

    // About
    'about.title': 'About Naraflow',
    'about.subtitle': 'Naraflow is a WhatsApp-first Workflow platform that helps SMEs and agribusiness record, manage, and monitor data in a simple yet structured way. We believe every business deserves efficient, transparent, and resilient governance.',
    'about.vision.title': 'Vision',
    'about.vision.desc': 'To become the digitalization bridge for SMEs in Southeast Asia with simple, conversation-based, and transparent solutions.',
    'about.mission.title': 'Mission',
    'about.mission.desc': 'Empower small business owners with easy-to-use technology, improve operational efficiency, and build data-based trust.',
    'about.values.simple.title': 'Simple',
    'about.values.simple.desc': 'Easy to use without complex training.',
    'about.values.transparent.title': 'Transparent',
    'about.values.transparent.desc': 'Clear, organized, and trustworthy data.',
    'about.values.collaborative.title': 'Collaborative',
    'about.values.collaborative.desc': 'Supporting all roles in business.',
    'about.values.resilient.title': 'Resilient',
    'about.values.resilient.desc': 'Designed for dynamic daily business operations.',

    // Footer
    'footer.rights': 'All rights reserved.'
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('id');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['id']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};