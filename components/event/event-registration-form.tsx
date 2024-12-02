"use client"

import { useState, useEffect } from 'react'
import { TicketType, RentalType, BusType } from '@prisma/client'
import { registerEvent, getBusCapacity } from '@/app/actions/event-registration'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FormData {
  name: string
  email: string
  phone: string
  address: string
  ticketType: TicketType
  rentals: {
    type: RentalType
    items: string[]
  }
  busType: BusType | ""
}

const initialFormData: FormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  ticketType: "REGULAR",
  rentals: {
    type: "EQUIPMENT_FULLSET",
    items: []
  },
  busType: ""
}

interface BusCapacity {
  BUS_1: number;
  BUS_2: number;
  BUS_3: number;
}

export default function EventRegistrationForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busCapacity, setBusCapacity] = useState<BusCapacity>({
    BUS_1: 0,
    BUS_2: 0,
    BUS_3: 0
  })
  const router = useRouter()

  useEffect(() => {
    const loadBusCapacity = async () => {
      const result = await getBusCapacity()
      if (result.success) {
        setBusCapacity(result.data)
      }
    }
    loadBusCapacity()
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
          <Card 
            className={`cursor-pointer transition-all ${
              formData.ticketType === 'REGULAR' 
                ? 'border-2 border-blue-500' 
                : 'hover:border-blue-200'
            }`}
            onClick={() => setFormData({...formData, ticketType: 'REGULAR'})}
          >
            <CardHeader>
              <CardTitle>Regular</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">Rp 100.000</p>
              <ul className="mt-4 space-y-2">
                <li>✓ Akses area ski pemula</li>
                <li>✓ Instruktur dasar</li>
                <li>✓ Peralatan standar</li>
              </ul>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${
              formData.ticketType === 'LIFT_GONDOLA' 
                ? 'border-2 border-blue-500' 
                : 'hover:border-blue-200'
            }`}
            onClick={() => setFormData({...formData, ticketType: 'LIFT_GONDOLA'})}
          >
            <CardHeader>
              <CardTitle>Lift Gondola</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">Rp 150.000</p>
              <ul className="mt-4 space-y-2">
                <li>✓ Akses Lift Gondola</li>
                <li>✓ Area ski lanjutan</li>
                <li>✓ Instruktur profesional</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pilihan Bus */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Pilihan Bus</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['BUS_1', 'BUS_2', 'BUS_3'] as BusType[]).map((bus) => {
            const isFull = (busCapacity[bus] || 0) >= 40
            const isSelected = formData.busType === bus

            return (
              <Card 
                key={bus}
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-2 border-blue-500' 
                    : isFull 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:border-blue-200'
                }`}
                onClick={() => {
                  if (!isFull) {
                    setFormData({...formData, busType: bus})
                  }
                }}
              >
                <CardHeader>
                  <CardTitle>
                    Bus {bus.split('_')[1]}
                    {isFull && <span className="text-red-500 text-sm"> (Penuh)</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Kapasitas: {busCapacity[bus]}/40
                  </p>
                  <p className="mt-2 font-medium">
                    {bus === 'BUS_1' && 'Ekonomi'}
                    {bus === 'BUS_2' && 'Bisnis'}
                    {bus === 'BUS_3' && 'Eksekutif'}
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
          <div className="flex items-center space-x-2">
            <Checkbox
              id="equipment-fullset"
              checked={formData.rentals.type === 'EQUIPMENT_FULLSET' && formData.rentals.items.includes('fullset')}
              onCheckedChange={(checked) => {
                if (checked) {
                  setFormData({
                    ...formData,
                    rentals: {
                      type: 'EQUIPMENT_FULLSET',
                      items: ['fullset']
                    }
                  })
                } else {
                  setFormData({
                    ...formData,
                    rentals: {
                      type: 'EQUIPMENT_FULLSET',
                      items: []
                    }
                  })
                }
              }}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="equipment-fullset">
                Sewa Peralatan Fullset
              </Label>
              <p className="text-sm text-muted-foreground">
                Termasuk ski/snowboard, helm, dan perlengkapan keselamatan (Rp 100.000)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="clothing-fullset"
              checked={formData.rentals.type === 'CLOTHING_FULLSET' && formData.rentals.items.includes('fullset')}
              onCheckedChange={(checked) => {
                if (checked) {
                  setFormData({
                    ...formData,
                    rentals: {
                      type: 'CLOTHING_FULLSET',
                      items: ['fullset']
                    }
                  })
                } else {
                  setFormData({
                    ...formData,
                    rentals: {
                      type: 'CLOTHING_FULLSET',
                      items: []
                    }
                  })
                }
              }}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="clothing-fullset">
                Sewa Pakaian Fullset
              </Label>
              <p className="text-sm text-muted-foreground">
                Termasuk jaket winter, celana, sarung tangan, dan kacamata (Rp 50.000)
              </p>
            </div>
          </div>
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
