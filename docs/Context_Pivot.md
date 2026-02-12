📂 Bundle 1: The Business Blueprint (Context & Pivot)
1. Visi dan Latar Belakang Proyek
TRISULA adalah platform manajemen loyalitas dan layanan eksklusif ("Wealth Management & Priority Services") yang dirancang khusus untuk nasabah kelas atas (Sultan). Platform ini bertransformasi dari konsep Web3 menjadi Web 2.0 murni untuk menjamin keandalan operasional, kecepatan layanan, dan kemudahan akses bagi pengguna di Indonesia. TRISULA berfungsi sebagai jembatan digital antara Nasabah, Agen Lapangan, dan tim Back-office (Admin).

2. Identitas Visual (Premium Branding)
Berdasarkan logo resmi 3D, aplikasi harus memberikan kesan mewah dan kredibel melalui palet warna berikut:

Royal Blue (#002366): Melambangkan stabilitas, profesionalisme, dan kepercayaan tinggi.

Gold Metallic (#D4AF37): Melambangkan eksklusivitas, poin reward, dan status nasabah prioritas.

Dark Mode Standard: Penggunaan latar belakang gelap/hitam sangat dianjurkan untuk menonjolkan elemen emas dan biru, menciptakan kontras yang elegan sesuai estetika logo.

3. Matriks Peran & Kontrol Akses (Strict RBAC)
Sistem ini memisahkan pengguna ke dalam 5 kategori dengan hak akses yang terisolasi:

Super Admin: Otoritas tertinggi untuk manajemen sistem, konfigurasi kolom dinamis, dan audit log menyeluruh.

Admin 1 (Input-Only): Bertanggung jawab memasukkan data entitas baru. Hanya memiliki akses POST.

Admin 2 (View-Only): Bertanggung jawab memantau data dan status. Hanya memiliki akses GET.

Agent: Pengguna lapangan yang mengelola nasabah. Dashboard fokus pada metrik penjualan, data polis, dan omset.

Nasabah (Sultan): Pengguna akhir. Dashboard fokus pada katalog hadiah, perolehan poin, dan klaim layanan.

4. Mekanisme Pendaftaran & Keamanan
Pendaftaran dalam TRISULA diatur dengan logika khusus untuk menjaga validitas data:

A. Pendaftaran Agen (The Unique Code Logic)
Agen tidak dapat mendaftar secara bebas. Pendaftaran hanya bisa dilakukan jika:

Admin men-generate Unique Code (Kode Aktivasi) khusus untuk calon agen.

Agen mendaftar dengan memasukkan Unique Code tersebut beserta email dan nomor WhatsApp aktif.

Sistem memvalidasi kode sebelum akun Agen diaktifkan.

B. Pendaftaran Nasabah
Nasabah mendaftar dengan memasukkan Nama, WhatsApp, dan ID Agent yang membawanya.

Data Nasabah akan otomatis terhubung dengan Dashboard Agen yang bersangkutan.

Nasabah langsung menerima Welcome Points setelah registrasi berhasil.

5. Diferensiasi Antarmuka (Distinct Dashboards)
Aplikasi memiliki dua "wajah" yang berbeda tergantung pada siapa yang login:

Dashboard Agen (Sales-Centric):

Panel pantauan omset harian/bulanan.

Daftar akumulasi data nasabah yang dikelolanya.

Status polis yang sedang didaftarkan.

Dashboard Nasabah (Reward-Centric):

Tampilan saldo poin yang elegan (Gold theme).

Menu Redemption (Katalog servis eksklusif).

Menu Produk untuk melihat layanan baru yang bisa dibeli.

Pop-up promo/video sosmed sebagai materi edukasi.

6. Fitur Operasional Unggulan
WhatsApp Watchdog: Sistem akan memicu notifikasi ke Admin jika dalam 5 menit setelah nasabah mengeklik tombol WhatsApp Agen, tidak ada progres transaksi yang tercatat.

Daily Engagement: Insentif login harian untuk menjaga retensi nasabah Sultan di dalam aplikasi.

Service Redemption: Penukaran poin difokuskan pada Servis (seperti bantuan medis atau layanan pribadi), yang membutuhkan koordinasi cepat antara sistem dan agen.