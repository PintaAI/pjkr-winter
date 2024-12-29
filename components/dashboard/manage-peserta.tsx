"use client"

import { useEffect, useReducer } from "react"
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
import { Search } from "lucide-react"
import { getPesertaData } from "@/app/actions/dashboard"

type State = {
  peserta: any[]
  filteredPeserta: any[]
  searchQuery: string
}

type Action =
  | { type: 'SET_PESERTA'; payload: any[] }
  | { type: 'SET_FILTERED_PESERTA'; payload: any[] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }

const initialState: State = {
  peserta: [],
  filteredPeserta: [],
  searchQuery: ""
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_PESERTA':
      return { ...state, peserta: action.payload }
    case 'SET_FILTERED_PESERTA':
      return { ...state, filteredPeserta: action.payload }
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload }
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
    if (state.searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(state.searchQuery.toLowerCase())
      )
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

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Nama</TableHead>
              <TableHead>Tiket</TableHead>
              <TableHead>Bus</TableHead>
              <TableHead>Alat</TableHead>
              <TableHead>Ukuran</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.filteredPeserta.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">
                  {p.name}
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
                  <div className="text-sm">
                    <div>Baju: {p.ukuranBaju || "-"}</div>
                    <div>Sepatu: {p.ukuranSepatu || "-"}</div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
