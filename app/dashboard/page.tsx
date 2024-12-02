import { db } from "@/lib/db"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatRupiah } from "@/lib/utils"
import { LogoutButton } from "@/components/auth/logout-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ManagePackages } from "@/components/dashboard/manage-packages"
import { ManageBuses } from "@/components/dashboard/manage-buses"
import { ManageRentals } from "@/components/dashboard/manage-rentals"

async function getPeserta() {
  const peserta = await db.user.findMany({
    include: {
      tiket: true,
      sewaan: true,
      bus: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  return peserta
}

export default async function DashboardPage() {
  const peserta = await getPeserta()

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard Panitia</h1>
        <LogoutButton />
      </div>

      <Tabs defaultValue="peserta" className="space-y-6">
        <TabsList>
          <TabsTrigger value="peserta">Daftar Peserta</TabsTrigger>
          <TabsTrigger value="packages">Kelola Paket</TabsTrigger>
          <TabsTrigger value="buses">Kelola Bus</TabsTrigger>
          <TabsTrigger value="rentals">Kelola Peralatan</TabsTrigger>
        </TabsList>

        <TabsContent value="peserta">
          <div className="rounded-md border">
            <Table>
              <TableCaption>Daftar peserta yang sudah terdaftar</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Tiket</TableHead>
                  <TableHead>Bus</TableHead>
                  <TableHead>Sewaan</TableHead>
                  <TableHead>Total Biaya</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {peserta.map((p) => {
                  // Hitung total biaya
                  const tiketCost = p.tiket.reduce((acc, t) => {
                    return acc + t.harga
                  }, 0)
                  
                  const sewaanCost = p.sewaan.reduce((acc, s) => {
                    return acc + s.hargaSewa
                  }, 0)

                  const totalCost = tiketCost + sewaanCost

                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.email}</TableCell>
                      <TableCell>{p.telepon}</TableCell>
                      <TableCell>
                        {p.tiket.map((t) => (
                          <Badge key={t.id} variant="secondary" className="mr-1">
                            {t.tipe === 'REGULAR' ? 'Regular' : 'Lift Gondola'}
                          </Badge>
                        ))}
                      </TableCell>
                      <TableCell>
                        {p.bus ? (
                          <Badge>
                            {p.bus.namaBus}
                          </Badge>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {p.sewaan.length > 0 ? (
                          <div className="space-y-1">
                            {p.sewaan.map((s) => (
                              <Badge key={s.id} variant="outline" className="mr-1">
                                {s.namaBarang}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>{formatRupiah(totalCost)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
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
      </Tabs>
    </div>
  )
}
