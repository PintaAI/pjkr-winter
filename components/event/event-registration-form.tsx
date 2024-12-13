"use client"

import { useState, useEffect } from 'react'
import { registerEvent, getBusData, getTicketData, getRentalData } from '@/app/actions/event-registration'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatWon } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Badge } from "@/components/ui/badge"

// Simple spinner component
function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" 
        stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" 
        d="M4 12a8 8 0 018-8v8H4z"></path>
    </svg>
  )
}

interface FormData {
  name: string
  email: string
  phone: string
  address: string
  ticketType: string
  rentals: string[]
  busId: string | ""
}

const initialFormData: FormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  ticketType: "REGULAR",
  rentals: [],
  busId: ""
}

interface BusData {
  id: string
  namaBus: string
  kapasitas: number
  terisi: number
}

interface TicketData {
  tipe: string
  harga: number
  description: string
  features: string[]
}

interface RentalData {
  id: string
  namaBarang: string
  hargaSewa: number
  items: string[]
}

export default function EventRegistrationForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busData, setBusData] = useState<BusData[]>([])
  const [ticketData, setTicketData] = useState<TicketData[]>([])
  const [rentalData, setRentalData] = useState<RentalData[]>([])
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const busResult = await getBusData()
      if (busResult.success) setBusData(busResult.data ?? [])

      const ticketResult = await getTicketData()
      if (ticketResult.success) setTicketData(ticketResult.data ?? [])

      const rentalResult = await getRentalData()
      if (rentalResult.success) setRentalData(rentalResult.data ?? [])
    }
    loadData()
  }, [])

  const validate = () => {
    const newErrors: {[key: string]: string} = {}
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Format email ga valid, bro!'
    }
    if (!formData.phone.match(/^[0-9]{8,}$/)) {
      newErrors.phone = 'Nomor telepon minimal 8 digit angka!'
    }
    if (!formData.name.trim()) newErrors.name = 'Nama wajib diisi ya!'
    if (!formData.address.trim()) newErrors.address = 'Alamat jangan kosong dong!'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!validate()) return

    setIsLoading(true)
    try {
      const result = await registerEvent(formData)
      if (result.success) {
        alert('Pendaftaran berhasil!')
        setFormData(initialFormData)
        router.refresh()
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError('Terjadi kesalahan saat mengirim data, coba lagi nanti ya!')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRentalChange = (id: string, checked: boolean) => {
    setFormData(prev => {
      if (checked && !prev.rentals.includes(id)) {
        return {...prev, rentals: [...prev.rentals, id]}
      }
      if (!checked) {
        return {...prev, rentals: prev.rentals.filter(rentalId => rentalId !== id)}
      }
      return prev
    })
  }

  // Hitung total (ticket + rentals)
  const selectedTicket = ticketData.find(t => t.tipe === formData.ticketType)
  const totalTicket = selectedTicket ? selectedTicket.harga : 0
  const selectedRentals = rentalData.filter(r => formData.rentals.includes(r.id))
  const totalRentals = selectedRentals.reduce((acc, r) => acc + r.hargaSewa, 0)
  const totalHarga = totalTicket + totalRentals

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-7xl mx-auto py-4 sm:py-8 px-4">
      {/* Progress Step Indicators */}
      <div className="flex items-center mb-4 gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full relative">
          <div className="absolute h-2 bg-blue-500 rounded-full" style={{width: "100%"}}></div>
        </div>
        <span className="hidden sm:inline text-sm text-gray-600">Step: Isi Data → Pilih Tiket → Pilih Bus → Rental → Summary</span>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Data Peserta */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Data Peserta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              placeholder="Masukkan nama lengkap mu..."
              value={formData.name}
              onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
              required
              disabled={isLoading}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              placeholder="contoh: lu@ex.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
              required
              disabled={isLoading}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon</Label>
            <Input
              type="tel"
              id="phone"
              placeholder="cth: 08123456789"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
              required
              disabled={isLoading}
            />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Alamat</Label>
            <Textarea
              id="address"
              placeholder="Jalan, Kota, Kodepos..."
              value={formData.address}
              onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
              required
              disabled={isLoading}
            />
            {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Pilihan Tiket */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold">Pilihan Tiket</h2>
        <p className="text-sm text-gray-500">Pilih tipe tiket yang cocok buat mu</p>
        <div className="flex flex-col lg:flex-row gap-4">
          {ticketData.map((ticket) => {
            const isSelected = formData.ticketType === ticket.tipe
            return (
              <Card 
                key={ticket.tipe}
                className={cn(
                  "cursor-pointer transition-all flex-1",
                  isSelected ? 'border-2 border-primary ring-2 ring-primary/20' : 'hover:border-primary/20'
                )}
                onClick={() => setFormData(prev => ({...prev, ticketType: ticket.tipe}))}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-base">{ticket.tipe}</h3>
                    <Badge variant="secondary" className="font-semibold">
                      {formatWon(ticket.harga)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {ticket.description}
                  </p>
                  <ul className="space-y-1.5">
                    {ticket.features.map((feature, index) => (
                      <li key={index} className="text-sm flex items-center gap-2">
                        <span className="text-primary">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Pilihan Bus */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold">Pilihan Bus</h2>
        <p className="text-sm text-gray-500">Pilih bus yang masih tersedia bangkunya</p>
        <div className="flex flex-col lg:flex-row gap-4">
          {busData.map((bus) => {
            const isFull = bus.terisi >= bus.kapasitas
            const isSelected = formData.busId === bus.id

            return (
              <Card 
                key={bus.id}
                className={cn(
                  "cursor-pointer transition-all flex-1",
                  isSelected ? 'border-2 border-primary ring-2 ring-primary/20' 
                    : isFull ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:border-primary/20'
                )}
                onClick={() => {
                  if (!isFull) {
                    setFormData(prev => ({...prev, busId: bus.id}))
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-base">{bus.namaBus}</h3>
                    {isFull && (
                      <Badge variant="destructive">Penuh</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Kapasitas:</span>
                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full">
                      <div 
                        className={cn(
                          "h-2.5 rounded-full",
                          isFull ? "bg-red-500" : "bg-green-500"
                        )}
                        style={{
                          width: `${(bus.terisi / bus.kapasitas) * 100}%`
                        }}
                      />
                    </div>
                    <span>{bus.terisi}/{bus.kapasitas}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Sewa Peralatan */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <span>Sewa Peralatan</span>
            <Badge variant="secondary" className="text-xs">Opsional</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">Pilih peralatan yang lo butuhin buat petualangan mu</p>
          
          <div className="flex flex-col lg:flex-row gap-4">
            {rentalData.map((rental) => {
              const isSelected = formData.rentals.includes(rental.id)
              return (
                <Card
                  key={rental.id}
                  className={cn(
                    "transition-all flex-1",
                    isSelected ? 'border-2 border-primary ring-2 ring-primary/20' : 'hover:border-primary/20'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isSelected}
                        className="mt-1 h-5 w-5"
                        onCheckedChange={(checked) => handleRentalChange(rental.id, checked as boolean)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-base truncate">{rental.namaBarang}</h3>
                          <Badge variant="secondary" className="ml-2 shrink-0">
                            {formatWon(rental.hargaSewa)}
                          </Badge>
                        </div>
                        <ul className="space-y-1.5">
                          {rental.items.map((item, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className="text-primary shrink-0">•</span>
                              <span className="break-words">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary Pilihan */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Ringkasan Pilihan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Tiket:</span>
            <span className="text-right">{selectedTicket ? selectedTicket.tipe : '-'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Bus:</span>
            <span className="text-right">
              {formData.busId 
                ? (busData.find(b => b.id === formData.busId)?.namaBus || '-') 
                : '-'}
            </span>
          </div>
          <div className="flex justify-between items-start">
            <span className="font-medium">Peralatan:</span>
            <span className="text-right flex-1 ml-4">
              {selectedRentals.length > 0 ? selectedRentals.map(r => r.namaBarang).join(', ') : '-'}
            </span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total:</span>
            <span>{formatWon(totalHarga)}</span>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full h-12 sm:h-11 text-base sm:text-sm flex items-center justify-center"
        disabled={isLoading}
      >
        {isLoading && <Spinner />}
        {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
      </Button>
    </form>
  )
}
