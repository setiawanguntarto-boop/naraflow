/**
 * Enhanced Comprehensive Workflow Features Knowledge Base
 * Knowledge base yang diperkaya dengan instruksi detail step-by-step
 */

import { FeatureData, StepDetail } from "./workflowFeatures";

export const workflowFeaturesEnriched: Record<string, FeatureData> = {
  "describe-workflow": {
    title: "Describe Workflow",
    icon: "Edit3",
    category: "fundamental",
    description: "Gunakan bahasa natural untuk mendeskripsikan workflow WhatsApp automation Anda. Sistem AI akan menginterpretasi dan menghasilkan node-node yang sesuai secara otomatis.",
    
    stepByStep: [
      {
        step: 1,
        title: "Persiapan Deskripsi",
        instructions: [
          "Buka section '1. Describe Workflow' di bagian atas studio",
          "Identifikasi tujuan workflow Anda (customer service, marketing, dll)",
          "Tentukan trigger awal (pesan masuk, jam tertentu, event)",
          "Siapkan daftar tindakan yang diperlukan secara berurutan"
        ],
        tips: [
          "Gunakan kalimat aktif: 'Ketika pesan masuk, lalu...'",
          "Sebutkan jenis data yang perlu diproses",
          "Tentukan kondisi percabangan jika ada"
        ]
      },
      {
        step: 2,
        title: "Penulisan Prompt",
        instructions: [
          "Klik pada text area 'Describe your workflow in natural language...'",
          "Mulai dengan trigger: 'Ketika [event] terjadi...'",
          "Jelaskan proses utama: 'lalu sistem harus [tindakan]...'",
          "Sertakan kondisi: 'jika [kondisi] maka [tindakan] lain...'",
          "Akhiri dengan output: 'akhirnya kirim [pesan/aksi]...'",
          "Contoh lengkap: 'Ketika pesan WhatsApp masuk yang mengandung kata 'harga', lalu cek database produk, jika produk tersedia kirim detail harga, jika tidak kirim pesan maaf'"
        ],
        tips: [
          "Gunakan @ untuk memanggil template spesifik",
          "Panjang ideal: 2-5 kalimat berurutan",
          "Spesifikkan format output yang diinginkan"
        ]
      },
      {
        step: 3,
        title: "Template Integration",
        instructions: [
          "Untuk template cepat, ketik '@' di text area",
          "Pilih dari dropdown template yang muncul",
          "Template akan auto-fill prompt dasar",
          "Modifikasi template sesuai kebutuhan spesifik",
          "Atau pilih dari Quick Templates di panel kiri"
        ],
        tips: [
          "Template 'customer-service' untuk respon otomatis",
          "Template 'marketing-blast' untuk broadcast",
          "Template 'order-tracking' untuk status pesanan"
        ]
      },
      {
        step: 4,
        title: "Generate Workflow",
        instructions: [
          "Klik tombol 'Generate' dengan icon sparkles",
          "Tunggu proses interpretasi AI (biasanya 5-15 detik)",
          "Review hasil di preview modal yang muncul",
          "Periksa node yang dihasilkan dan koneksinya",
          "Jika sesuai, klik 'Apply to Canvas'",
          "Jika perlu modifikasi, edit prompt dan generate ulang"
        ],
        tips: [
          "Gunakan 'Generate with LLaMA' untuk alternatif AI",
          "Check validation errors setelah apply",
          "Simpan prompt asli untuk referensi future"
        ]
      }
    ],
    
    bestPractices: [
      "Gunakan urutan waktu: pertama → lalu → kemudian → akhirnya",
      "Spesifikkan tipe data: 'nomor telepon', 'nama produk', 'jumlah'",
      "Sebutkan sumber data: 'dari database', 'dari API eksternal'",
      "Tentukan format output: 'dalam format tabel', 'dengan emoji'"
    ],
    
    commonMistakes: [
      "Deskripsi terlalu vague: 'buat workflow untuk bisnis'",
      "Lompat logika: tidak menjelaskan transisi antar step",
      "Tidak menyebutkan kondisi exception",
      "Lupa menentukan format output"
    ],
    
    relatedFeatures: ["node-library", "workflow-canvas", "templates", "validation"]
  },

  "node-library": {
    title: "Node Library",
    icon: "Box",
    category: "fundamental",
    description: "Kumpulan semua komponen building block untuk membangun workflow WhatsApp automation. Setiap node merepresentasikan fungsi spesifik dalam alur kerja.",
    
    stepByStep: [
      {
        step: 1,
        title: "Understanding Node Types",
        instructions: [
          "Buka panel '2. Node Library' di sisi kiri studio",
          "Pahami 4 kategori node utama:",
          "• Input Nodes (Hijau): Trigger workflow - Message In, Schedule, Webhook",
          "• Processing Nodes (Biru): Logika & transformasi - AI Processor, Database, Condition",
          "• Output Nodes (Merah): Aksi keluar - Send Message, API Call, Notification",
          "• Utility Nodes (Ungu): Support functions - Delay, Log, Variable"
        ],
        tips: [
          "Warna border node menunjukkan kategorinya",
          "Hover pada node untuk melihat deskripsi singkat",
          "Icon setiap node merepresentasikan fungsinya"
        ]
      },
      {
        step: 2,
        title: "Node Selection Strategy",
        instructions: [
          "Identifikasi trigger yang dibutuhkan:",
          "• Message In: untuk memulai dari pesan WhatsApp masuk",
          "• Schedule: untuk workflow berjalan otomatis per jam/hari",
          "• Webhook: untuk trigger dari sistem external",
          "Pilih processor berdasarkan kebutuhan:",
          "• AI Processor: untuk NLP, klasifikasi, generate text",
          "• Condition: untuk percabangan if/else logic",
          "• Database: untuk query/update data",
          "Tentukan output akhir:",
          "• Send Message: kirim balasan WhatsApp",
          "• API Call: integrasi dengan sistem lain"
        ],
        tips: [
          "Mulai dengan satu Input node dan satu Output node",
          "Tambahkan Processing nodes di antara mereka",
          "Gunakan Condition nodes untuk logika kompleks"
        ]
      },
      {
        step: 3,
        title: "Drag & Drop Technique",
        instructions: [
          "Klik dan tahan node dari library",
          "Drag ke area canvas - perhatikan highlight area drop",
          "Posisikan node dengan jarak cukup untuk koneksi",
          "Drop node di lokasi yang diinginkan",
          "Ulangi untuk semua node yang diperlukan",
          "Atur tata letak dengan mempertimbangkan alur kiri-ke-kanan"
        ],
        tips: [
          "Gunakan grid canvas untuk alignment rapi",
          "Berikan space untuk edge connections",
          "Group node related berdekatan"
        ]
      },
      {
        step: 4,
        title: "Node Organization",
        instructions: [
          "Gunakan alignment tools untuk rapikan layout",
          "Group functional sections dengan background area",
          "Gunakan consistent spacing antar node",
          "Label node groups dengan annotation tools",
          "Manfaatkan auto-layout untuk organize cepat"
        ],
        tips: [
          "Workflow kecil: 3-7 nodes optimal",
          "Workflow medium: 8-15 nodes dengan grouping",
          "Workflow complex: 16+ nodes dengan modular design"
        ]
      }
    ],

    nodeCategories: {
      input: {
        description: "Memulai workflow - trigger points",
        nodes: [
          {
            name: "Message In",
            usage: "Trigger dari pesan WhatsApp masuk",
            config: "Filter berdasarkan keyword, sender, type"
          }
        ]
      }
    },

    bestPractices: [
      "Gunakan naming convention konsisten untuk node labels",
      "Batasi 5-8 nodes per logical group",
      "Document complex nodes dengan description field",
      "Test setiap node individually sebelum integrasi"
    ],

    relatedFeatures: ["workflow-canvas", "node-configuration", "validation"]
  },

  // Tambahkan features lainnya...
};

// Export enriched features
export type FeatureId = keyof typeof workflowFeaturesEnriched;

