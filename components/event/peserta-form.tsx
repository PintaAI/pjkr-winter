"use client"

import { User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PesertaData {
  name: string
  email: string
  phone: string
  address: string
  ukuranBaju: string
  ukuranSepatu: string
}

const ukuranBajuOptions = [
  { label: "S (90)", value: "S" },
  { label: "M (95)", value: "M" },
  { label: "L (100)", value: "L" },
  { label: "XL (105)", value: "XL" },
  { label: "XXL (110)", value: "XXL" }
]

const ukuranSepatuOptions = [
  "250", "255", "260", "265", "270", "275"
]

interface PesertaFormProps {
  peserta: PesertaData[]
  errors: {[key: string]: string}
  isLoading: boolean
  onAddPeserta: () => void
  onRemovePeserta: (index: number) => void
  onPesertaChange: (index: number, field: keyof PesertaData, value: string) => void
}

export default function PesertaForm({
  peserta,
  errors,
  isLoading,
  onAddPeserta,
  onRemovePeserta,
  onPesertaChange
}: PesertaFormProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg sm:text-xl font-semibold">Data Peserta</h2>
        <Button 
          type="button" 
          variant="outline"
          onClick={onAddPeserta}
          disabled={isLoading}
        >
          + Tambah Peserta
        </Button>
      </div>

      {peserta.map((peserta, index) => (
        <Card key={index} className="bg-background border-2 border-secondary">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm">
                <User className="inline mr-2" size={17}/>{index + 1}
              </CardTitle>
              {index > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => onRemovePeserta(index)}
                  disabled={isLoading}
                >
                  Hapus
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`name_${index}`}>Nama Lengkap</Label>
              <Input
                id={`name_${index}`}
                placeholder="Masukkan nama lengkap..."
                value={peserta.name}
                onChange={(e) => onPesertaChange(index, 'name', e.target.value)}
                required
                disabled={isLoading}
              />
              {errors[`name_${index}`] && (
                <p className="text-sm text-red-500">{errors[`name_${index}`]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`email_${index}`}>Email</Label>
              <Input
                type="email"
                id={`email_${index}`}
                placeholder="email@example.com"
                value={peserta.email}
                onChange={(e) => onPesertaChange(index, 'email', e.target.value)}
                required
                disabled={isLoading}
              />
              {errors[`email_${index}`] && (
                <p className="text-sm text-red-500">{errors[`email_${index}`]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`phone_${index}`}>Nomor Telepon</Label>
              <Input
                type="tel"
                id={`phone_${index}`}
                placeholder="cth: 08123456789"
                value={peserta.phone}
                onChange={(e) => onPesertaChange(index, 'phone', e.target.value)}
                required
                disabled={isLoading}
              />
              {errors[`phone_${index}`] && (
                <p className="text-sm text-red-500">{errors[`phone_${index}`]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`address_${index}`}>Domisili</Label>
              <Textarea
                id={`address_${index}`}
                placeholder="Jalan, Kota, Kodepos..."
                value={peserta.address}
                onChange={(e) => onPesertaChange(index, 'address', e.target.value)}
                required
                disabled={isLoading}
              />
              {errors[`address_${index}`] && (
                <p className="text-sm text-red-500">{errors[`address_${index}`]}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`ukuranBaju_${index}`}>Ukuran Baju</Label>
                <Select
                  disabled={isLoading}
                  value={peserta.ukuranBaju}
                  onValueChange={(value) => onPesertaChange(index, 'ukuranBaju', value)}
                >
                  <SelectTrigger id={`ukuranBaju_${index}`}>
                    <SelectValue placeholder="Pilih Ukuran" />
                  </SelectTrigger>
                  <SelectContent>
                    {ukuranBajuOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors[`ukuranBaju_${index}`] && (
                  <p className="text-sm text-red-500">{errors[`ukuranBaju_${index}`]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`ukuranSepatu_${index}`}>Ukuran Sepatu</Label>
                <Select
                  disabled={isLoading}
                  value={peserta.ukuranSepatu}
                  onValueChange={(value) => onPesertaChange(index, 'ukuranSepatu', value)}
                >
                  <SelectTrigger id={`ukuranSepatu_${index}`}>
                    <SelectValue placeholder="Pilih Ukuran" />
                  </SelectTrigger>
                  <SelectContent>
                    {ukuranSepatuOptions.map(size => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors[`ukuranSepatu_${index}`] && (
                  <p className="text-sm text-red-500">{errors[`ukuranSepatu_${index}`]}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export type { PesertaData }
