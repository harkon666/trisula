import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './db/schema';
import { users } from './db/schema';

// Connection string dari .env
const connectionString = process.env.DATABASE_URL!;

// Client setup
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

async function main() {
    console.log('🚀 Menjalankan operasi database TRISULA...');

    // 1. SEEDING: Tambahkan Admin pertama
    const adminData: typeof users.$inferInsert = {
        name: 'Nol Builder',
        email: 'admin@trisula.io',
        passwordHash: await Bun.password.hash('P@sswordVIP2026'), // Pakai Bun hashing!
        role: 'super_admin',
        status: 'active',
    };

    try {
        const result = await db.insert(users).values(adminData).returning();
        console.log('✅ Admin berhasil dibuat:', result[0]?.email);
    } catch (err) {
        console.log('⚠️ Admin mungkin sudah ada, lanjut ke penarikan data...');
    }

    // 2. READ: Ambil semua user (untuk testing)
    const allUsers = await db.select().from(users);
    console.log('📊 Daftar User saat ini:', allUsers.length);

    // Jangan lupa tutup koneksi jika ini script mandiri
    await client.end();
    console.log('🏁 Proses selesai.');
}

// Jalankan fungsi main
main();