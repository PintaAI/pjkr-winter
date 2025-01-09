"use client"

import { useEffect, useReducer, useState } from "react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Trash2 } from "lucide-react"
import { getPanitiaData, deletePeserta } from "@/app/actions/dashboard"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PesertaCard } from "@/components/dashboard/peserta-card"
import { User, UserRole, UserPlan, Bus, Ticket, OptionalItem, StatusPeserta } from "@prisma/client"

// Type for data returned from getPanitiaData()
type PanitiaData = {
  id: string
  name: string | null
  email: string
  alamat: string | null
  telepon: string | null
  tiket: {
    id: string
    tipe: string
    harga: number
    description: string
    features: string[]
    pesertaId: string
  }[]
  optionalItems: {
    id: string
    namaItem: string
    harga: number
    deskripsi: string[]
    pesertaId: string
  }[]
  createdAt: Date
}

// Type for our complete panitia data
type PanitiaWithRelations = User & {
  bus: Bus | null
  tiket: Ticket[]
  optionalItems: OptionalItem[]
  status: StatusPeserta[]
}

type State = {
  panitia: PanitiaWithRelations[]
  filteredPanitia: PanitiaWithRelations[]
  searchQuery: string
  filterPlan: string
}

type Action =
  | { type: 'SET_PANITIA'; payload: PanitiaWithRelations[] }
  | { type: 'SET_FILTERED_PANITIA'; payload: PanitiaWithRelations[] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTER_PLAN'; payload: string }

const initialState: State = {
  panitia: [],
  filteredPanitia: [],
  searchQuery: "",
  filterPlan: "all"
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_PANITIA':
      return { ...state, panitia: action.payload }
    case 'SET_FILTERED_PANITIA':
      return { ...state, filteredPanitia: action.payload }
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload }
    case 'SET_FILTER_PLAN':
      return { ...state, filterPlan: action.payload }
    default:
      return state
  }
}

export function ManagePanitia() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedPanitia, setSelectedPanitia] = useState<PanitiaWithRelations | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterPanitia()
  }, [state.searchQuery, state.filterPlan, state.panitia])

  const loadData = async () => {
    try {
      const result = await getPanitiaData()
      if (result.success && result.data) {
        // Sort by createdAt in descending order (newest first)
        const sortedData = result.data.map((p: PanitiaData) => ({
          ...p,
          // Add missing User fields
          emailVerified: null,
          image: null,
          password: null,
          role: UserRole.PANITIA,
          plan: UserPlan.FREE,
          updatedAt: p.createdAt,
          ukuranBaju: null,
          ukuranSepatu: null,
          tipeAlat: null,
          busId: null,
          registrationId: null,
          // Add required relations
          bus: null,
          status: [],
          // Use existing relations
          tiket: p.tiket,
          optionalItems: p.optionalItems,
        } as PanitiaWithRelations)).sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        dispatch({ type: 'SET_PANITIA', payload: sortedData })
        dispatch({ type: 'SET_FILTERED_PANITIA', payload: sortedData })
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Gagal memuat data")
    }
  }

  const filterPanitia = () => {
    let filtered = state.panitia
    
    // Text search
    if (state.searchQuery) {
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        p.email?.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        p.telepon?.toLowerCase().includes(state.searchQuery.toLowerCase())
      )
    }

    // Plan filter
    if (state.filterPlan !== "all") {
      filtered = filtered.filter(p => 
        p.plan === state.filterPlan
      )
    }

    dispatch({ type: 'SET_FILTERED_PANITIA', payload: filtered })
  }

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Cari nama, email, atau telepon..."
            value={state.searchQuery}
            onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Select
            value={state.filterPlan}
            onValueChange={(value) => dispatch({ type: 'SET_FILTER_PLAN', payload: value })}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Plan</SelectItem>
              <SelectItem value={UserPlan.FREE}>Free</SelectItem>
              <SelectItem value={UserPlan.PRO}>Pro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telepon</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Tiket</TableHead>
              <TableHead>Item Tambahan</TableHead>
              <TableHead>Tanggal Bergabung</TableHead>
              <TableHead className="w-[50px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.filteredPanitia.map((p) => (
              <TableRow key={p.id}>
                <TableCell 
                  className="font-medium cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    setSelectedPanitia(p)
                    setIsDrawerOpen(true)
                  }}
                >
                  {p.name || "-"}
                </TableCell>
                <TableCell>{p.email || "-"}</TableCell>
                <TableCell>{p.telepon || "-"}</TableCell>
                <TableCell>
                  <Badge variant={p.plan === UserPlan.PRO ? "default" : "secondary"}>
                    {p.plan}
                  </Badge>
                </TableCell>
                <TableCell>
                  {p.tiket?.map((t) => (
                    <Badge key={t.id} variant="outline" className="mr-1">
                      {t.tipe}
                    </Badge>
                  ))}
                </TableCell>
                <TableCell>
                  {p.optionalItems?.length > 0 ? (
                    <Badge variant="outline">
                      {p.optionalItems.length} item
                    </Badge>
                  ) : "-"}
                </TableCell>
                <TableCell>{formatDate(p.createdAt)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                    onClick={async () => {
                      if (window.confirm("Apakah Anda yakin ingin menghapus panitia ini?")) {
                        const result = await deletePeserta(p.id)
                        if (result.success) {
                          toast.success("Panitia berhasil dihapus")
                          loadData() // Refresh data after deletion
                        } else {
                          toast.error(result.message || "Gagal menghapus panitia")
                        }
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Details Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Detail Panitia</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            {selectedPanitia && (
              <PesertaCard peserta={selectedPanitia} />
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
