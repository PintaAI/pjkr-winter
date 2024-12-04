import { LogoutButton } from "@/components/auth/logout-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ManagePackages } from "@/components/dashboard/manage-packages"
import { ManageBuses } from "@/components/dashboard/manage-buses"
import { ManageRentals } from "@/components/dashboard/manage-rentals"
import { ManageStatus } from "@/components/dashboard/manage-status"
import { ManagePeserta } from "@/components/dashboard/manage-peserta"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Package, Bus, Wrench, CheckSquare } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard Panitia</h1>
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link href="/scan">Scan QR Code</Link>
          </Button>
          <LogoutButton />
        </div>
      </div>

      <Tabs defaultValue="peserta" className="space-y-6">
        <TabsList className="grid grid-cols-5 gap-4">
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
          <TabsTrigger value="rentals" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            <span className="hidden md:inline">Kelola Peralatan</span>
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
          <ManagePackages />
        </TabsContent>

        <TabsContent value="buses">
          <ManageBuses />
        </TabsContent>

        <TabsContent value="rentals">
          <ManageRentals />
        </TabsContent>

        <TabsContent value="status">
          <ManageStatus />
        </TabsContent>
      </Tabs>
    </div>
  )
}
