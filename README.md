# Next.js Authentication Starter Template

Template Next.js modern dengan sistem autentikasi yang lengkap, menggunakan teknologi terbaru untuk pengembangan web yang aman dan efisien.

## 🚀 Teknologi Utama

- **Next.js 15** - Framework React dengan App Router
- **NextAuth.js v5 Beta** - Autentikasi modern dan aman
- **Prisma** - ORM untuk manajemen database
- **TailwindCSS** - Utility-first CSS framework
- **TypeScript** - Type safety untuk JavaScript
- **Zod** - Validasi schema TypeScript-first

## 🛠️ Fitur

- ✅ Sistem autentikasi lengkap (Login/Register)
- 🔒 Protected routes dengan middleware
- 🎨 UI yang responsif dengan TailwindCSS
- 📝 Form validation menggunakan Zod
- 🔄 Session handling yang aman
- 📦 Database integration dengan Prisma
- 🌐 API routes untuk autentikasi
- 🔐 Password hashing dengan bcrypt

## 📁 Struktur Proyek

```
├── app/                  # Next.js App Router
│   ├── api/             # API endpoints
│   ├── auth/            # Auth pages
│   └── dashboard/       # Protected pages
├── components/          # React components
│   ├── auth/           # Auth-related components
│   └── providers/      # Context providers
├── lib/                # Utility functions
├── prisma/             # Database schema
├── schemas/            # Validation schemas
└── types/              # TypeScript types
```

## 🚦 Cara Memulai

1. **Clone Repository**
   ```bash
   git clone [url-repository] nama-proyek-baru
   cd nama-proyek-baru
   ```

2. **Setup Git Baru**
   ```bash
   rm -rf .git
   git init
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Setup Environment**
   ```bash
   copy .env.example .env
   ```
   
   Sesuaikan variabel berikut di file `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
   AUTH_SECRET="generate-secret-minimal-32-karakter"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

5. **Setup Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Jalankan Development Server**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000)

## 📝 Fitur Autentikasi

- **Register**: `/auth/register`
  - Validasi email dan password
  - Hash password otomatis
  - Pencegahan duplikasi email

- **Login**: `/auth/login`
  - Autentikasi dengan email/password
  - Session handling
  - Protected route redirect

- **Dashboard**: `/dashboard`
  - Protected route example
  - Session data access
  - Logout functionality

## 🔧 Kustomisasi

1. **Database Schema**
   - Edit `prisma/schema.prisma` untuk menyesuaikan model data
   - Jalankan `npx prisma generate` setelah perubahan
   - Update types di `types/prisma.ts`

2. **Autentikasi**
   - Konfigurasi di `auth.config.ts`
   - Custom callbacks di `auth.ts`
   - Middleware settings di `middleware.ts`

3. **Styling**
   - TailwindCSS config di `tailwind.config.ts`
   - Global styles di `app/globals.css`

## 📚 Dokumentasi Terkait

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://authjs.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## 🤝 Kontribusi

Kontribusi selalu diterima! Silakan buat pull request atau issue untuk perbaikan dan saran.

## 📄 Lisensi

MIT License - Silakan gunakan dan modifikasi sesuai kebutuhan Anda.
