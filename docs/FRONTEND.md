📂 Bundle 4: User Experience & Interaction (Frontend)
Dokumentasi ini memberikan panduan bagi AI Agent untuk membangun antarmuka menggunakan Next.js, Tailwind CSS, GSAP, dan Lenis Smooth Scroll. Fokus utama adalah menciptakan nuansa eksklusif "Private Wealth Management" dengan transisi yang sinematik.

1. Prinsip Desain & Luxury Branding
Aplikasi harus merefleksikan identitas visual TRISULA yang mapan:

- Warna Utama: Royal Blue (#002366) sebagai warna latar belakang yang melambangkan stabilitas.

- Warna Aksen: Gold Metallic (#D4AF37) untuk tombol Call-to-Action, saldo poin, dan status premium.

- Latar Belakang: Gunakan Dark Mode (Deep Charcoal/Black) agar elemen emas dan biru terlihat menonjol dan elegan.

- Typography: Gunakan font Serif untuk judul (memberikan kesan "mahal") dan Sans Serif yang bersih untuk teks operasional.

2. Frontend Tech Stack (The "Sultan" Setup)
AI Agent harus mengonfigurasi library berikut untuk performa visual maksimal:

- GSAP (@gsap/react): Digunakan untuk seluruh animasi mikro, transisi elemen, dan efek kilauan emas (shimmer).

- Lenis: Implementasikan Smooth Scroll global agar gerakan gulir di aplikasi terasa halus dan tidak kaku.

- Tailwind CSS: Untuk penataan tata letak (layouting) yang cepat dan responsif.

3. Diferensiasi Dashboard (Conditional Rendering)
Render komponen secara eksklusif berdasarkan user.role:

A. Dashboard Nasabah (The Private Vault)
- Gold Card Balance: Gunakan GSAP untuk menganimasikan angka poin yang bertambah (counting effect) saat login harian sukses.

- Redemption Gallery: Layout kartu servis yang muncul satu per satu dengan efek stagger GSAP saat halaman dibuka.

- Interactive Video Pop-up: Video promo yang muncul secara halus (fade-in & scale-up) berdasarkan pengecekan tabel announcement_views.

B. Dashboard Agen (The Performance Hub)
- Revenue Analytics: Tampilan angka omset dan jumlah polis dengan visualisasi yang bersih.

- Unique Code Manager: Area khusus bagi agen untuk mengelola kode aktivasi agen baru dari Admin.

- Nasabah Directory: Daftar nasabah di bawah naungan agen tersebut dengan akses cepat ke WhatsApp.

4. Interaksi & Logika Operasional
A. The WhatsApp Watchdog UI
- Trigger Event: Saat nasabah klik tombol WA Agent, jalankan fungsi pelacakan di backend.

- Feedback Modal: Jika dalam 5 menit belum ada konfirmasi progres, munculkan modal umpan balik yang elegan: "Apakah Agen kami telah merespons kebutuhan Anda?".

B. Dynamic JSONB Field Rendering
- Frontend harus memetakan (mapping) data dari additionalMetadata.

- Render field tambahan (seperti "Spesialisasi" atau "Catatan Medis") secara otomatis tanpa perlu modifikasi kode manual.

5. Panduan Animasi GSAP untuk AI Agent
AI Agent harus mengikuti pola animasi berikut agar tetap "berkelas":

- Easing: Gunakan power4.out atau expo.out untuk kesan gerakan yang presisi dan mewah.

- Hover Effects: Berikan sedikit pergeseran atau perubahan saturasi warna emas pada tombol saat disentuh kurser.

- Page Transitions: Gunakan transisi fade-out sederhana antar halaman untuk menjaga kesan stabilitas aplikasi.