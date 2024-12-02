# Next.js Auth Implementation Knowledge Base

## Struktur Aplikasi

### Halaman Utama
- `app/page.tsx`: Landing page dengan navigasi ke Login, Register, dan Dashboard
- Menggunakan Next.js App Router
- Styling dengan Tailwind CSS

### Autentikasi
- Menggunakan NextAuth.js untuk manajemen autentikasi
- Implementasi Credentials Provider
- Middleware untuk proteksi route

### Routes & Middleware
- Protected routes diarahkan ke `/auth/login` jika user belum login
- Auth routes (`/auth/login`, `/auth/register`) diarahkan ke dashboard jika user sudah login
- API routes diawali dengan `/api/auth/`

## Komponen-komponen

### Auth Form (`components/auth/auth-form.tsx`)
- Komponen client-side untuk login dan register
- Validasi form menggunakan Zod schema
- Menangani error dan success state
- Auto login setelah registrasi berhasil

### Logout Button (`components/auth/logout-button.tsx`)
- Client component untuk fungsi logout
- Menggunakan `signOut()` dari next-auth/react
- Styling konsisten dengan tema aplikasi

### Dashboard Page (`app/dashboard/page.tsx`)
- Server component yang menampilkan informasi user
- Protected route yang memerlukan autentikasi
- Menampilkan:
  * Nama user
  * Email
  * ID
  * Role
  * Status session

## Session Handling

### Client-side
```typescript
import { useSession } from "next-auth/react"

// Dalam komponen React
const { data: session } = useSession()
```

### Server-side
```typescript
import { auth } from "@/auth"

// Dalam server component
const session = await auth()
```

## Database Schema
- User model dengan fields:
  * id
  * name
  * email
  * password (hashed)
  * role
  * plan
  * emailVerified
  * image
  * createdAt
  * updatedAt

## Validasi
- Login schema: email dan password
- Register schema: name, email, dan password
- Validasi menggunakan Zod

## Security Features
- Password hashing menggunakan bcrypt
- Protected routes dengan middleware
- Session-based authentication
- CSRF protection

## Error Handling
- Form validation errors
- API response errors
- Authentication errors
- Server-side errors

## Best Practices
1. Gunakan server components untuk data fetching
2. Client components untuk interaktivitas (form, buttons)
3. Proper error handling dan user feedback
4. Consistent styling dengan Tailwind CSS
5. Type safety dengan TypeScript
6. Proper session handling (client vs server)

## Middleware Configuration
```typescript
export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
```

## Environment Variables
```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

## Tips
1. Selalu gunakan proper error handling
2. Implementasikan proper loading states
3. Berikan feedback yang jelas ke user
4. Gunakan TypeScript untuk type safety
5. Ikuti Next.js best practices untuk performance
