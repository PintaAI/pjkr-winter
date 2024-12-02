import { AuthForm } from "@/components/auth/auth-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Login ke Akun Anda</h1>
          <p className="mt-2 text-gray-600">
            Masukkan email dan password Anda
          </p>
        </div>
        <AuthForm mode="login" />
      </div>
    </div>
  )
}
