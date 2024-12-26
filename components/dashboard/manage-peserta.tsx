"use client"

import { useState, useEffect, useReducer } from "react"
import { toast } from "sonner"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { QrCode, Search, MoreVertical, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { formatWon } from "@/lib/utils"
import { getPesertaData, updatePeserta, deletePeserta, getBusData } from "@/app/actions/dashboard"
import { PesertaCard } from "./peserta-card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PesertaForm {
  name: string
  email: string
  alamat: string
  telepon: string
  busId: string | null
  ukuranBaju: string
  ukuranSepatu: string
}

interface BusData {
  id: string
  namaBus: string
  kapasitas: number
  terisi: number
}

type State = {
  peserta: any[]
  filteredPeserta: any[]
  buses: BusData[]
  editForm: PesertaForm | null
  selectedPesertaId: string | null
  isLoading: boolean
  dialogOpen: boolean
  drawerOpen: boolean
  selectedPeserta: any
  searchQuery: string
  actionMenuOpen: string | null
}

type Action =
  | { type: 'SET_PESERTA'; payload: any[] }
  | { type: 'SET_FILTERED_PESERTA'; payload: any[] }
  | { type: 'SET_BUSES'; payload: BusData[] }
  | { type: 'SET_EDIT_FORM'; payload: PesertaForm | null }
  | { type: 'SET_SELECTED_PESERTA_ID'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DIALOG_OPEN'; payload: boolean }
  | { type: 'SET_DRAWER_OPEN'; payload: boolean }
  | { type: 'SET_SELECTED_PESERTA'; payload: any }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_ACTION_MENU_OPEN'; payload: string | null }

const initialState: State = {
  peserta: [],
  filteredPeserta: [],
  buses: [],
  editForm: null,
  selectedPesertaId: null,
  isLoading: false,
  dialogOpen: false,
  drawerOpen: false,
  selectedPeserta: null,
  searchQuery: "",
  actionMenuOpen: null
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_PESERTA':
      return { ...state, peserta: action.payload }
    case 'SET_FILTERED_PESERTA':
      return { ...state, filteredPeserta: action.payload }
    case 'SET_BUSES':
      return { ...state, buses: action.payload }
    case 'SET_EDIT_FORM':
      return { ...state, editForm: action.payload }
    case 'SET_SELECTED_PESERTA_ID':
      return { ...state, selectedPesertaId: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_DIALOG_OPEN':
      return { ...state, dialogOpen: action.payload }
    case 'SET_DRAWER_OPEN':
      return { ...state, drawerOpen: action.payload }
    case 'SET_SELECTED_PESERTA':
      return { ...state, selectedPeserta: action.payload }
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload }
    case 'SET_ACTION_MENU_OPEN':
      return { ...state, actionMenuOpen: action.payload }
    default:
      return state
  }
}

export function ManagePeserta() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterPeserta()
  }, [state.searchQuery, state.peserta])

  const loadData = async () => {
    try {
      const [pesertaResult, busResult] = await Promise.all([
        getPesertaData(),
        getBusData()
      ])

      if (pesertaResult.success && pesertaResult.data) {
        dispatch({ type: 'SET_PESERTA', payload: pesertaResult.data })
        dispatch({ type: 'SET_FILTERED_PESERTA', payload: pesertaResult.data })
      }

      if (busResult.success && busResult.data) {
        dispatch({ type: 'SET_BUSES', payload: busResult.data })
      }
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Gagal memuat data")
    }
  }

  const filterPeserta = () => {
    let filtered = state.peserta

    // Search filter
    if (state.searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(state.searchQuery.toLowerCase())
      )
    }

    dispatch({ type: 'SET_FILTERED_PESERTA', payload: filtered })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!state.editForm || !state.selectedPesertaId) return

    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      const result = await updatePeserta(state.selectedPesertaId, state.editForm)

      if (result.success) {
        toast.success(result.message)
        await loadData()
        dispatch({ type: 'SET_SELECTED_PESERTA_ID', payload: null })
        dispatch({ type: 'SET_EDIT_FORM', payload: null })
        dispatch({ type: 'SET_DIALOG_OPEN', payload: false })
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat memproses data peserta")
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const handleDelete = async (id: string) => {
    toast.promise(
      (async () => {
        if (!confirm("Apakah Anda yakin ingin menghapus peserta ini?")) {
          return
        }

        dispatch({ type: 'SET_LOADING', payload: true })

        try {
          const result = await deletePeserta(id)
          if (result.success) {
            await loadData()
            return result
          } else {
            throw new Error(result.message)
          }
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      })(),
      {
        loading: 'Menghapus peserta...',
        success: (result) => result?.message || 'Berhasil menghapus peserta',
        error: (err) => err?.message || "Terjadi kesalahan saat menghapus peserta"
      }
    )
  }

  const handleShowCard = (p: any) => {
    dispatch({ type: 'SET_SELECTED_PESERTA', payload: p })
    dispatch({ type: 'SET_DRAWER_OPEN', payload: true })
  }

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Cari nama atau email..."
          value={state.searchQuery}
          onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* Drawer untuk PesertaCard */}
      <Drawer open={state.drawerOpen} onOpenChange={(open) => dispatch({ type: 'SET_DRAWER_OPEN', payload: open })}>
        <DrawerContent>
          <DrawerHeader className="border-b">
            <DrawerTitle>Detail Peserta</DrawerTitle>
          </DrawerHeader>
          <div className="flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              {state.selectedPeserta && <PesertaCard peserta={state.selectedPeserta} />}
            </div>
          </div>
          <DrawerFooter className="border-t">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">Tutup</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Responsive Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Nama</TableHead>
              <TableHead className="hidden md:table-cell">Tiket</TableHead>
              <TableHead className="hidden sm:table-cell">Bus</TableHead>
              <TableHead className="hidden sm:table-cell">Total Biaya</TableHead>
              <TableHead className="w-[60px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.filteredPeserta.map((p) => {
              const tiketCost = p.tiket?.reduce((acc: number, t: any) => acc + t.harga, 0) || 0;
              const optionalItemsCost = p.optionalItems?.reduce((acc: number, item: any) => acc + item.harga, 0) || 0;
              const totalCost = tiketCost + optionalItemsCost;

              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    <button
                      onClick={() => handleShowCard(p)}
                      className="hover:underline focus:outline-none text-left"
                    >
                      {p.name}
                      <div className="text-sm text-muted-foreground md:hidden">
                        {p.bus?.namaBus || 'No Bus'}
                      </div>
                    </button>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {p.tiket?.map((t: any) => (
                      <Badge
                        key={t.id}
                        variant="secondary"
                        className="mr-1 mb-1"
                      >
                        {t.tipe}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {p.bus ? (
                      <Badge variant="outline">
                        {p.bus.namaBus}
                      </Badge>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{formatWon(totalCost)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/peserta/${p.id}/qr`} className="flex items-center">
                            <QrCode className="h-4 w-4 mr-2" />
                            <span>QR Code</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            dispatch({ type: 'SET_EDIT_FORM', payload: {
                              name: p.name,
                              email: p.email,
                              alamat: p.alamat || "",
                              telepon: p.telepon || "",
                              busId: p.bus?.id || null,
                              ukuranBaju: p.ukuranBaju || "",
                              ukuranSepatu: p.ukuranSepatu || ""
                            }});
                            dispatch({ type: 'SET_SELECTED_PESERTA_ID', payload: p.id });
                            dispatch({ type: 'SET_DIALOG_OPEN', payload: true });
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(p.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
