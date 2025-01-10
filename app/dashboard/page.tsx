"use client"
import { LogoutButton } from "@/components/auth/logout-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ManagePackages } from "@/components/dashboard/manage-packages"
import { ManageBuses } from "@/components/dashboard/manage-buses"
import { ManageStatus } from "@/components/dashboard/manage-status"
import { ManagePeserta } from "@/components/dashboard/manage-peserta"
import { ManagePanitia } from "@/components/dashboard/manage-panitia"
import { ManageOptionalItems } from "@/components/dashboard/manage-optional-items"
import { ManageRegistrationLogs } from "@/components/dashboard/manage-registration-logs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Package, Bus, CheckSquare, ClipboardList, UserCog, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    // Force a client-side data refetch
    await fetch(window.location.href, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    window.location.reload();
    setIsRefreshing(false);
  };
  return (
    <div className="max-w-[1200px] mx-auto px-3 sm:px-4 py-6 sm:py-10">
      {/* Responsive header layout */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Dashboard Panitia</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button 
            onClick={refreshData} 
            variant="outline" 
            size="icon" 
            className={`${isRefreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button asChild className="flex-1 sm:flex-none">
            <Link href="/scan" className="text-sm sm:text-base">Scan QR Code</Link>
          </Button>
          <Button asChild className="flex-1 sm:flex-none">
            <Link href="/event-registration" className="text-sm sm:text-base">Daftar Event</Link>
          </Button>
          <LogoutButton />
        </div>
      </div>

      <Tabs defaultValue="peserta" className="space-y-6">
        {/* Keeping original tab structure */}
        <TabsList className="grid grid-cols-6 gap-4">
          <TabsTrigger value="panitia" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            <span className="hidden md:inline">Daftar Panitia</span>
          </TabsTrigger>
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
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden md:inline">Log Registrasi</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="panitia">
          <ManagePanitia />
        </TabsContent>

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

        <TabsContent value="logs">
          <ManageRegistrationLogs />
        </TabsContent>
      </Tabs>
    </div>
  )
}
