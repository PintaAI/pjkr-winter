import { AuthForm } from "@/components/auth/auth-form"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Buat Akun Baru</h1>
          <p className="mt-2 text-gray-600">
            Daftar untuk mendapatkan akun
          </p>
        </div>
        <AuthForm mode="register" />
      </div>
    </div>
  )
}
