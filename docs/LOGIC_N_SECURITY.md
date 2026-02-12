📂 Bundle 3: Logic & Security (The Brain/Backend)
Dokumentasi ini memberikan instruksi mendalam bagi AI Agent untuk mengimplementasikan logika backend menggunakan Hono API (atau framework pilihan) dan Drizzle ORM. Fokus utama adalah pada keamanan akses (RBAC), integritas poin, dan sistem otomasi pengawasan.

1. Implementasi Strict RBAC Middleware
Keamanan TRISULA bergantung pada pemisahan hak akses yang kaku. AI Agent harus membangun middleware yang memvalidasi role pengguna sebelum memproses permintaan.

- Admin 1 (Input-Only): Hanya diizinkan melakukan metode POST. Jika mencoba melakukan GET, PATCH, PUT, atau DELETE, sistem harus mengembalikan 403 Forbidden.

- Admin 2 (View-Only): Hanya diizinkan melakukan metode GET. Jika mencoba melakukan mutasi data (POST, PATCH, dll), akses harus ditolak.

- Super Admin: Akses penuh ke semua metode dan endpoint.

- Logic Path: if (user.role === 'admin_input' && request.method !== 'POST') return Error(403); if (user.role === 'admin_view' && request.method !== 'GET') return Error(403);

2. Mekanisme Otomasi Poin (Atomic Transactions)
Poin adalah aset berharga bagi Nasabah Sultan. AI Agent wajib menggunakan Database Transactions untuk setiap perubahan saldo guna menghindari race conditions.

A. Welcome & Daily Bonus
Welcome Bonus: Dipicu satu kali saat registrasi nasabah berhasil.

- Daily Login: Sistem mengecek tabel login_logs. Poin hanya ditambahkan jika tidak ada entri untuk userId pada tanggal yang sama.

B. Refund Logic (Status Rejected/Cancelled)
Jika status redeem_requests diubah menjadi rejected (oleh Admin) atau cancelled (oleh User), sistem harus:

- Mengembalikan poin ke users.points_balance.

- Mencatat transaksi pengembalian di points_ledger dengan sumber 'refund'.

- Memastikan kedua langkah ini terjadi dalam satu transaksi atomik.

$$Balance_{new} = Balance_{old} + Points_{refund}$$

3. Sistem "Watchdog" 5 Menit (Cron Job)
Untuk menjamin kecepatan servis, AI Agent harus mengimplementasikan fungsi pengawas pada interaksi WhatsApp.

- Trigger: Setiap nasabah mengeklik tombol WhatsApp Agent, simpan record di wa_interactions.

- Worker/Cron: Jalankan job setiap menit untuk memindai interaksi yang terbengkalai.

- Query Logic: $$T_{threshold} = T_{now} - 5\text{ minutes}$$

SELECT * FROM wa_interactions WHERE clicked_at < T_threshold AND is_admin_notified = false

Action: Kirim notifikasi ke Admin Dashboard atau Telegram Admin jika ditemukan interaksi yang melewati batas waktu tanpa progres.

4. Alur Registrasi & Otentikasi Khusus
A. Aktivasi Agen via Unique Code
Agent tidak bisa login sebelum akunnya diaktivasi.

- Admin men-generate kode unik ke tabel agent_activation_codes.

- Calon Agen menginput kode saat registrasi.

- Backend memvalidasi: if (code.isValid && !code.isUsed).

Hubungkan user_id baru ke kode tersebut dan set is_used = true.

B. Login via User ID
Otentikasi tidak menggunakan email sebagai username, melainkan User ID unik (contoh: 12345). AI Agent harus memastikan pengecekan userId bersifat case-sensitive dan unik di seluruh database.

5. Audit Log (Transparency)
Setiap mutasi data yang dilakukan oleh Admin (terutama Admin 1 & 2) wajib memicu penulisan ke tabel admin_actions.

- Data yang dicatat: Admin ID, jenis aksi, ID target, dan timestamp.

- Tujuan: Memastikan Super Admin dapat melacak siapa yang memasukkan data polis tertentu atau siapa yang menolak permintaan penukaran nasabah.