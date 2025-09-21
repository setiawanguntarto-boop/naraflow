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
    'about.title': 'Tentang Naraflow',
    'about.subtitle': 'Naraflow adalah platform WhatsApp-first Workflow yang membantu UMKM dan agribisnis mencatat, mengelola, dan memantau data secara sederhana namun terstruktur. Kami percaya setiap bisnis berhak atas tata kelola yang efisien, transparan, dan tangguh.',
    'about.vision': 'Visi',
    'about.vision.desc': 'Menjadi jembatan digitalisasi UMKM di Asia Tenggara dengan solusi sederhana, berbasis percakapan, dan transparan.',
    'about.mission': 'Misi',
    'about.mission.desc': 'Memberdayakan pelaku usaha kecil dengan teknologi yang mudah digunakan, meningkatkan efisiensi operasional, dan membangun kepercayaan berbasis data.',

    // How it Works
    'how-it-works.title': 'Bagaimana Naraflow Bekerja?',
    'how-it-works.subtitle': 'Semua alur bisnis langsung berjalan di WhatsApp: mulai dari pencatatan, validasi, hingga laporan — sederhana, transparan, dan efisien.',

    // Pricing
    'pricing.title': 'Harga yang Sederhana & Transparan',
    'pricing.subtitle': 'Bayar sesuai kebutuhan Anda. Tanpa biaya tersembunyi, fleksibel sesuai skala bisnis.',
    'pricing.contact': 'Hubungi Kami',

    // Demo
    'demo.title': 'Coba Demo Rahayu Sekarang',
    'demo.subtitle': 'Rahayu adalah co-bot WhatsApp yang membantu pencatatan operasional harian di peternakan ayam. Semua data pakan, mortalitas, panen, dan suhu bisa dicatat dengan cepat, transparan, dan tanpa aplikasi tambahan.',
    'demo.open-whatsapp': 'Buka Demo di WhatsApp',
    'demo.conversation-flow': 'Alur Percakapan Demo',
    'demo.tutorial-video': 'Tutorial Video',

    // FAQ
    'faq.title': 'Pertanyaan yang Sering Diajukan',

    // Contact
    'contact.title': 'Hubungi Tim Naraflow',
    'contact.subtitle': 'Ada pertanyaan atau ingin berdiskusi? Silakan hubungi kami lewat WhatsApp, email, atau kirim pesan langsung melalui form di bawah ini.',
    'contact.channels': 'Saluran Kontak',
    'contact.send-message': 'Kirim Pesan',
    'contact.name-placeholder': 'Nama Anda',
    'contact.email-placeholder': 'Email Anda',
    'contact.message-placeholder': 'Pesan Anda',
    'contact.send-button': 'Kirim Pesan',

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
    'about.title': 'About Naraflow',
    'about.subtitle': 'Naraflow is a WhatsApp-first Workflow platform that helps SMEs and agribusiness record, manage, and monitor data simply yet systematically. We believe every business deserves efficient, transparent, and resilient governance.',
    'about.vision': 'Vision',
    'about.vision.desc': 'To become a bridge for SME digitalization in Southeast Asia with simple, conversation-based, and transparent solutions.',
    'about.mission': 'Mission',
    'about.mission.desc': 'Empower small business actors with easy-to-use technology, improve operational efficiency, and build data-based trust.',

    // How it Works
    'how-it-works.title': 'How Does Naraflow Work?',
    'how-it-works.subtitle': 'All business flows run directly on WhatsApp: from recording, validation, to reports — simple, transparent, and efficient.',

    // Pricing
    'pricing.title': 'Simple & Transparent Pricing',
    'pricing.subtitle': 'Pay according to your needs. No hidden costs, flexible according to business scale.',
    'pricing.contact': 'Contact Us',

    // Demo
    'demo.title': 'Try Rahayu Demo Now',
    'demo.subtitle': 'Rahayu is a WhatsApp co-bot that helps daily operational recording in chicken farms. All feed, mortality, harvest, and temperature data can be recorded quickly, transparently, and without additional apps.',
    'demo.open-whatsapp': 'Open Demo on WhatsApp',
    'demo.conversation-flow': 'Demo Conversation Flow',
    'demo.tutorial-video': 'Tutorial Video',

    // FAQ
    'faq.title': 'Frequently Asked Questions',

    // Contact
    'contact.title': 'Contact Naraflow Team',
    'contact.subtitle': 'Have questions or want to discuss? Please contact us via WhatsApp, email, or send a message directly through the form below.',
    'contact.channels': 'Contact Channels',
    'contact.send-message': 'Send Message',
    'contact.name-placeholder': 'Your Name',
    'contact.email-placeholder': 'Your Email',
    'contact.message-placeholder': 'Your Message',
    'contact.send-button': 'Send Message',

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