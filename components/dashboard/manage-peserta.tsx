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
import { Input } from "@/components/ui/input"
import { QrCode, Search, CheckCircle2, Check } from "lucide-react"

// Helper function to check payment status
const hasPembayaranStatus = (status: any[], registration: any | null) => {
  const statusVerified = status.some(s => s.nama === "Pembayaran" && s.nilai === true)
  const registrationConfirmed = registration?.status === "CONFIRMED"
  return statusVerified || registrationConfirmed
}
import { getPesertaData } from "@/app/actions/dashboard"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { PesertaCard } from "@/components/dashboard/peserta-card"
import { PesertaQR } from "@/components/dashboard/peserta-qr"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

type State = {
  peserta: any[]
  filteredPeserta: any[]
  searchQuery: string
  filterTiket: string
  filterBus: string
  filterAlat: string
  filterOptionalItems: string
}

type Action =
  | { type: 'SET_PESERTA'; payload: any[] }
  | { type: 'SET_FILTERED_PESERTA'; payload: any[] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTER_TIKET'; payload: string }
  | { type: 'SET_FILTER_BUS'; payload: string }
  | { type: 'SET_FILTER_ALAT'; payload: string }
  | { type: 'SET_FILTER_OPTIONAL_ITEMS'; payload: string }

const initialState: State = {
  peserta: [],
  filteredPeserta: [],
  searchQuery: "",
  filterTiket: "all",
  filterBus: "all",
  filterAlat: "all",
  filterOptionalItems: "all"
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_PESERTA':
      return { ...state, peserta: action.payload }
    case 'SET_FILTERED_PESERTA':
      return { ...state, filteredPeserta: action.payload }
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload }
    case 'SET_FILTER_TIKET':
      return { ...state, filterTiket: action.payload }
    case 'SET_FILTER_BUS':
      return { ...state, filterBus: action.payload }
    case 'SET_FILTER_ALAT':
      return { ...state, filterAlat: action.payload }
    case 'SET_FILTER_OPTIONAL_ITEMS':
      return { ...state, filterOptionalItems: action.payload }
    default:
      return state
  }
}

export function ManagePeserta() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isQRDrawerOpen, setIsQRDrawerOpen] = useState(false)
  const [selectedPeserta, setSelectedPeserta] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterPeserta()
  }, [state.searchQuery, state.filterTiket, state.filterBus, state.filterAlat, state.filterOptionalItems, state.peserta])

  const loadData = async () => {
    try {
      const result = await getPesertaData()
      if (result.success && result.data) {
        console.log("Peserta data:", result.data) // Debug log
        // Sort by createdAt in descending order (newest first)
        const sortedData = result.data.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        dispatch({ type: 'SET_PESERTA', payload: sortedData })
        dispatch({ type: 'SET_FILTERED_PESERTA', payload: sortedData })
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Gagal memuat data")
    }
  }

  const filterPeserta = () => {
    let filtered = state.peserta
    
    // Text search
    if (state.searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(state.searchQuery.toLowerCase())
      )
    }

    // Tiket filter
    if (state.filterTiket !== "all") {
      filtered = filtered.filter(p => 
        p.tiket?.some((t: any) => t.tipe.toLowerCase() === state.filterTiket.toLowerCase())
      )
    }

    // Bus filter
    if (state.filterBus !== "all") {
      filtered = filtered.filter(p => 
        p.bus?.namaBus.toLowerCase() === state.filterBus.toLowerCase()
      )
    }

    // Alat filter
    if (state.filterAlat !== "all") {
      filtered = filtered.filter(p => 
        p.tipeAlat?.toLowerCase() === state.filterAlat.toLowerCase()
      )
    }

    // Optional Items filter
    if (state.filterOptionalItems !== "all") {
      filtered = filtered.filter(p => {
        const hasOptionalItems = Array.isArray(p.optionalItems) && p.optionalItems.length > 0;
        return state.filterOptionalItems === "ada" ? hasOptionalItems : !hasOptionalItems;
      });
    }

    dispatch({ type: 'SET_FILTERED_PESERTA', payload: filtered })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get unique values for filters
  const getUniqueTiketTypes = () => {
    const types = new Set<string>()
    state.peserta.forEach(p => {
      p.tiket?.forEach((t: any) => types.add(t.tipe))
    })
    return Array.from(types)
  }

  const getUniqueBuses = () => {
    const buses = new Set<string>()
    state.peserta.forEach(p => {
      if (p.bus?.namaBus) buses.add(p.bus.namaBus)
    })
    return Array.from(buses)
  }

  const getUniqueAlat = () => {
    const alat = new Set<string>()
    state.peserta.forEach(p => {
      if (p.tipeAlat) alat.add(p.tipeAlat)
    })
    return Array.from(alat)
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Cari nama atau email..."
            value={state.searchQuery}
            onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Select
            value={state.filterTiket}
            onValueChange={(value) => dispatch({ type: 'SET_FILTER_TIKET', payload: value })}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter Tiket" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tiket</SelectItem>
              {getUniqueTiketTypes().map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={state.filterBus}
            onValueChange={(value) => dispatch({ type: 'SET_FILTER_BUS', payload: value })}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter Bus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Bus</SelectItem>
              {getUniqueBuses().map((bus) => (
                <SelectItem key={bus} value={bus}>{bus}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={state.filterAlat}
            onValueChange={(value) => dispatch({ type: 'SET_FILTER_ALAT', payload: value })}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter Alat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Alat</SelectItem>
              {getUniqueAlat().map((alat) => (
                <SelectItem key={alat} value={alat}>{alat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={state.filterOptionalItems}
            onValueChange={(value) => dispatch({ type: 'SET_FILTER_OPTIONAL_ITEMS', payload: value })}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter Item Tambahan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Makanan</SelectItem>
              <SelectItem value="ada">Include</SelectItem>
              <SelectItem value="tidak">Tidak</SelectItem>
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
              <TableHead>Tiket</TableHead>
              <TableHead>Bus</TableHead>
              <TableHead>Alat</TableHead>
              <TableHead>Makanan</TableHead>
              <TableHead>Ukuran</TableHead>
              <TableHead className="w-[50px]">QR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.filteredPeserta.map((p) => (
              <TableRow key={p.id}>
                <TableCell 
                  className="font-medium cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    setSelectedPeserta(p)
                    setIsDrawerOpen(true)
                  }}
                >
                  <div className="flex items-center gap-2">
                    {p.name}
                    {hasPembayaranStatus(p.status || [], p.registration) && (
                      
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {p.email}
                  </div>
                </TableCell>
                <TableCell>
                  {p.tiket?.map((t: any) => {
                    let variant: "secondary" | "default" | "destructive" | "success" | "outline" = "secondary";
                    // Basic Pass - blue theme
                    if (t.tipe.toLowerCase().includes("basic")) {
                      variant = "default";
                    }
                    // Eskalator Pass - gray theme (₩85,000)
                    else if (t.tipe.toLowerCase().includes("eskalator")) {
                      variant = "secondary";
                    }
                    // Gondola Pass - yellow/gold theme (₩100,000)
                    else if (t.tipe.toLowerCase().includes("gondola")) {
                      variant = "destructive";
                    }
                    
                    return (
                      <Badge
                        key={t.id}
                        variant={variant}
                        className={`mr-1 mb-1 ${
                          variant === "destructive" ? "bg-yellow-500 hover:bg-yellow-600" : ""
                        }`}
                      >
                        {t.tipe}
                      </Badge>
                    );
                  })}
                </TableCell>
                <TableCell>
                  {p.bus ? (
                    <Badge variant="outline">
                      {p.bus.namaBus}
                    </Badge>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {p.tipeAlat || "-"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {p.optionalItems && p.optionalItems.length > 0 ? (
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>Baju: {p.ukuranBaju || "-"}</div>
                    <div>Sepatu: {p.ukuranSepatu || "-"}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedPeserta(p)
                      setIsQRDrawerOpen(true)
                    }}
                  >
                    <QrCode className="h-4 w-4" />
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
            <DrawerTitle>Detail Peserta</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            {selectedPeserta && (
              <PesertaCard peserta={selectedPeserta} />
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {/* QR Code Drawer */}
      <Drawer open={isQRDrawerOpen} onOpenChange={setIsQRDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>QR Code Peserta</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            {selectedPeserta && (
              <PesertaQR peserta={{
                id: selectedPeserta.id,
                name: selectedPeserta.name,
                email: selectedPeserta.email,
                ukuranSepatu: selectedPeserta.ukuranSepatu || "-",
                ukuranBaju: selectedPeserta.ukuranBaju || "-",
                jenisTiket: selectedPeserta.tiket?.[0]?.tipe || "-",
                namaBus: selectedPeserta.bus?.namaBus || "-"
              }} />
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
