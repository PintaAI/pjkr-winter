import { auth } from "@/auth"
import { LogoutButton } from "@/components/auth/logout-button"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-xl font-semibold text-red-600">Akses Ditolak</h1>
          <p className="text-gray-600 mt-2">Silakan login terlebih dahulu</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <LogoutButton />
        </div>
        
        <div className="space-y-6">
          <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Selamat Datang! 👋</h2>
            <p className="text-blue-800">
              {session.user.name || "User"}
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-3">Info Akun</h2>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Email:</span>{" "}
                  {session.user.email || "Tidak tersedia"}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">ID:</span>{" "}
                  {session.user.id || "Tidak tersedia"}
                </p>
              </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-lg border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-3">Status Sesi</h2>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Status:</span>{" "}
                  <span className="text-green-600">Aktif</span>
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Role:</span>{" "}
                  {session.user.role || "User"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
