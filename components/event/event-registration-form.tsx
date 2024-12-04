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

interface FormData {
  name: string
  email: string
  phone: string
  address: string
  ticketType: string
  rentals: string[] // Ubah ke string[] untuk ID rental
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
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      // Load bus data
      const busResult = await getBusData()
      if (busResult.success) {
        setBusData(busResult.data ?? [])
      }

      // Load ticket data
      const ticketResult = await getTicketData()
      if (ticketResult.success) {
        setTicketData(ticketResult.data ?? [])
      }

      // Load rental data
      const rentalResult = await getRentalData()
      if (rentalResult.success) {
        setRentalData(rentalResult.data ?? [])
      }
    }
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

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
      setError('Terjadi kesalahan saat mengirim data')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRentalChange = (id: string, checked: boolean) => {
    if (checked) {
      if (!formData.rentals.includes(id)) {
        setFormData({
          ...formData,
          rentals: [...formData.rentals, id]
        })
      }
    } else {
      setFormData({
        ...formData,
        rentals: formData.rentals.filter(rentalId => rentalId !== id)
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
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
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon</Label>
            <Input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Alamat</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              required
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pilihan Tiket */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Pilihan Tiket</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ticketData.map((ticket) => (
            <Card 
              key={ticket.tipe}
              className={`cursor-pointer transition-all ${
                formData.ticketType === ticket.tipe 
                  ? 'border-2 border-blue-500' 
                  : 'hover:border-blue-200'
              }`}
              onClick={() => setFormData({...formData, ticketType: ticket.tipe})}
            >
              <CardHeader>
                <CardTitle>{ticket.tipe}</CardTitle>
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
          ))}
        </div>
      </div>

      {/* Pilihan Bus */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Pilihan Bus</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {busData.map((bus) => {
            const isFull = bus.terisi >= bus.kapasitas
            const isSelected = formData.busId === bus.id

            return (
              <Card 
                key={bus.id}
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-2 border-blue-500' 
                    : isFull 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:border-blue-200'
                }`}
                onClick={() => {
                  if (!isFull) {
                    setFormData({...formData, busId: bus.id})
                  }
                }}
              >
                <CardHeader>
                  <CardTitle>
                    {bus.namaBus}
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
          {rentalData.map((rental) => (
            <div key={rental.id} className="flex items-center space-x-2">
              <Checkbox
                id={rental.id}
                checked={formData.rentals.includes(rental.id)}
                onCheckedChange={(checked) => 
                  handleRentalChange(rental.id, checked as boolean)
                }
              />
              <div className="grid gap-1.5 leading-none">
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

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
      </Button>
    </form>
  )
}
