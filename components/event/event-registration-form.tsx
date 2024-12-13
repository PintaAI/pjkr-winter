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
import { cn } from '@/lib/utils' // misal punya util classNames helper

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
    // Contoh validasi simple email
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Format email ga valid, bro!'
    }
    // Validasi simple phone (harus angka minimal 8 karakter)
    if (!formData.phone.match(/^[0-9]{8,}$/)) {
      newErrors.phone = 'Nomor telepon minimal 8 digit angka!'
    }
    // Pastikan semua field diisi
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
    if (checked) {
      if (!formData.rentals.includes(id)) {
        setFormData({...formData, rentals: [...formData.rentals, id]})
      }
    } else {
      setFormData({
        ...formData,
        rentals: formData.rentals.filter(rentalId => rentalId !== id)
      })
    }
  }

  // Hitung total (ticket + rentals)
  const selectedTicket = ticketData.find(t => t.tipe === formData.ticketType)
  const totalTicket = selectedTicket ? selectedTicket.harga : 0
  const selectedRentals = rentalData.filter(r => formData.rentals.includes(r.id))
  const totalRentals = selectedRentals.reduce((acc, r) => acc + r.hargaSewa, 0)
  const totalHarga = totalTicket + totalRentals

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto py-8">

      {/* Progress Step Indicators */}
      <div className="flex items-center mb-4 gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full relative">
          {/* Simple progress bar indikasi semua step (cuma visual aja) */}
          <div className="absolute h-2 bg-blue-500 rounded-full" style={{width: "100%"}}></div>
        </div>
        <span className="text-sm text-gray-600">Step: Isi Data → Pilih Tiket → Pilih Bus → Rental → Summary</span>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Data Peserta */}
      <Card>
        <CardHeader>
          <CardTitle>Data Peserta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              placeholder="Masukkan nama lengkap lo..."
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
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
              onChange={(e) => setFormData({...formData, email: e.target.value})}
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
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
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
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              required
              disabled={isLoading}
            />
            {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Pilihan Tiket */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Pilihan Tiket</h2>
        <p className="text-sm text-gray-500 mb-2">Pilih tipe tiket yang cocok buat lo</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ticketData.map((ticket) => {
            const isSelected = formData.ticketType === ticket.tipe
            return (
              <Card 
                key={ticket.tipe}
                className={cn(
                  "cursor-pointer transition-all p-4",
                  isSelected ? 'border-2 border-blue-500' : 'hover:border-blue-200'
                )}
                onClick={() => setFormData({...formData, ticketType: ticket.tipe})}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {ticket.tipe} {isSelected && <span className="text-green-500 text-xl">✔</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatWon(ticket.harga)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {ticket.description}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {ticket.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-sm">{feature}</span>
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
        <h2 className="text-xl font-semibold">Pilihan Bus</h2>
        <p className="text-sm text-gray-500 mb-2">Pilih bus yang masih tersedia bangkunya</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {busData.map((bus) => {
            const isFull = bus.terisi >= bus.kapasitas
            const isSelected = formData.busId === bus.id

            return (
              <Card 
                key={bus.id}
                className={cn(
                  "cursor-pointer transition-all p-4",
                  isSelected ? 'border-2 border-blue-500' 
                    : isFull ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:border-blue-200'
                )}
                onClick={() => {
                  if (!isFull) {
                    setFormData({...formData, busId: bus.id})
                  }
                }}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {bus.namaBus} {isSelected && <span className="text-green-500 text-xl">✔</span>}
                    {isFull && <span className="text-red-500 text-sm"> (Penuh)</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mt-2">
                    Kapasitas: {bus.terisi}/{bus.kapasitas}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Sewa Peralatan */}
      <Card>
        <CardHeader>
          <CardTitle>Sewa Peralatan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-gray-500">Pilih peralatan tambahan yang mau lo sewa (opsional)</p>
          {rentalData.map((rental) => (
            <div key={rental.id} className="flex items-start space-x-2">
              <Checkbox
                id={rental.id}
                checked={formData.rentals.includes(rental.id)}
                onCheckedChange={(checked) => 
                  handleRentalChange(rental.id, checked as boolean)
                }
              />
              <div className="leading-none">
                <Label htmlFor={rental.id}>
                  {rental.namaBarang}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {formatWon(rental.hargaSewa)}
                </p>
                <ul className="mt-2 space-y-1">
                  {rental.items.map((item, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Summary Pilihan */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Pilihan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="font-medium">Tiket:</span>
            <span>{selectedTicket ? selectedTicket.tipe : '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Bus:</span>
            <span>
              {formData.busId 
                ? (busData.find(b => b.id === formData.busId)?.namaBus || '-') 
                : '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Peralatan:</span>
            <span>
              {selectedRentals.length > 0 ? selectedRentals.map(r => r.namaBarang).join(', ') : '-'}
            </span>
          </div>
          <hr />
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>{formatWon(totalHarga)}</span>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full flex items-center justify-center"
        disabled={isLoading}
      >
        {isLoading && <Spinner />}
        {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
      </Button>
    </form>
  )
}
