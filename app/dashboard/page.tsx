import { LogoutButton } from "@/components/auth/logout-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ManagePackages } from "@/components/dashboard/manage-packages"
import { ManageBuses } from "@/components/dashboard/manage-buses"
import { ManageStatus } from "@/components/dashboard/manage-status"
import { ManagePeserta } from "@/components/dashboard/manage-peserta"
import { ManageOptionalItems } from "@/components/dashboard/manage-optional-items"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Package, Bus, CheckSquare } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-3 sm:px-4 py-6 sm:py-10">
      {/* Responsive header layout */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Dashboard Panitia</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button asChild className="flex-1 sm:flex-none">
            <Link href="/scan" className="text-sm sm:text-base">Scan QR Code</Link>
          </Button>
          <LogoutButton />
        </div>
      </div>

      <Tabs defaultValue="peserta" className="space-y-6">
        {/* Keeping original tab structure */}
        <TabsList className="grid grid-cols-4 gap-4">
          <TabsTrigger value="peserta" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">Daftar Peserta</span>
          </TabsTrigger>
          <TabsTrigger value="packages" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden md:inline">Kelola Paket</span>
          </TabsTrigger>
          <TabsTrigger value="buses" className="flex items-center gap-2">
            <Bus className="h-4 w-4" />
            <span className="hidden md:inline">Kelola Bus</span>
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            <span className="hidden md:inline">Kelola Status</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="peserta">
          <ManagePeserta />
        </TabsContent>

        <TabsContent value="packages">
          <div className="space-y-6 sm:space-y-8">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Paket Acara</h2>
              <ManagePackages />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Item Opsional</h2>
              <ManageOptionalItems />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="buses">
          <ManageBuses />
        </TabsContent>

        <TabsContent value="status">
          <ManageStatus />
        </TabsContent>
      </Tabs>
    </div>
  )
}
