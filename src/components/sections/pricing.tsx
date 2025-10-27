export const Pricing = () => {
  return (
    <section id="pricing" className="bg-gray-50 py-20">
      <div className="container mx-auto max-w-6xl px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
          Paket Harga Naraflow
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-12">
          Pilih paket sesuai kebutuhan bisnis Anda. Harga transparan, tanpa biaya tersembunyi.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 border hover:shadow-xl transition">
            <h3 className="text-xl font-semibold text-purple-700 mb-4">Deployment Fee</h3>
            <p className="text-gray-600 mb-6">Sekali bayar saat chatbot dipasang</p>
            <p className="text-3xl font-bold text-gray-900 mb-6">
              Rp6.000.000<span className="text-base font-medium text-gray-500"> / chatbot</span>
            </p>
            <ul className="space-y-3 text-left text-gray-600">
              <li>✔️ Instalasi & konfigurasi WhatsApp bot</li>
              <li>✔️ Integrasi ke dashboard standar</li>
              <li>✔️ Training tim internal</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-600 hover:shadow-xl transition relative">
            <span className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-2xl">
              Populer
            </span>
            <h3 className="text-xl font-semibold text-purple-700 mb-4">Subscription Fee</h3>
            <p className="text-gray-600 mb-6">Berlangganan bulanan untuk nomor aktif</p>
            <p className="text-3xl font-bold text-gray-900 mb-6">
              Rp50.000<span className="text-base font-medium text-gray-500"> / nomor / bulan</span>
            </p>
            <ul className="space-y-3 text-left text-gray-600">
              <li>✔️ Termasuk support & maintenance</li>
              <li>✔️ Data sinkron ke cloud</li>
              <li>✔️ Cocok untuk bisnis multi cabang</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border hover:shadow-xl transition">
            <h3 className="text-xl font-semibold text-purple-700 mb-4">Customization Fee</h3>
            <p className="text-gray-600 mb-6">Tambahan untuk kebutuhan khusus</p>
            <p className="text-3xl font-bold text-gray-900 mb-6">
              Rp1.000.000<span className="text-base font-medium text-gray-500"> / deployment</span>
            </p>
            <ul className="space-y-3 text-left text-gray-600">
              <li>✔️ Dashboard custom sesuai SOP</li>
              <li>✔️ Laporan PDF otomatis</li>
              <li>✔️ Fitur tambahan sesuai kebutuhan</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
