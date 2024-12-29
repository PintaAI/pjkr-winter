"use client"

import { User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  tipeAlat: string
}

const tipeAlatOptions = [
  { label: "Ski", value: "ski", icon: "/icons/ski-option.png" },
  { label: "Snowboard", value: "snowboard", icon: "/icons/snowboard-option.png" }
]

const ukuranBajuOptions = [
  { label: "S (90)", value: "S" },
  { label: "M (95)", value: "M" },
  { label: "L (100)", value: "L" },
  { label: "XL (105)", value: "XL" },
  { label: "XXL (110)", value: "XXL" }
]

const ukuranSepatuOptions = [
  "170", "175", "180", "185", "190", "195", "200", "205", "210", "215", 
  "220", "225", "230", "235", "240", "245", "250", "255", "260", "265", 
  "270", "275", "280", "285", "290", "295", "300", "305", "310", "315", "320"
]

interface PesertaFormProps {
  peserta: PesertaData[]
  errors: {[key: string]: string}
  isLoading: boolean
  onAddPeserta: () => void
  onRemovePeserta: (index: number) => void
  onPesertaChange: (index: number, field: keyof PesertaData, value: string) => void
  validateEmail?: (email: string, currentIndex: number) => boolean
}

export default function PesertaForm({
  peserta,
  errors,
  isLoading,
  onAddPeserta,
  onRemovePeserta,
  onPesertaChange,
  validateEmail
}: PesertaFormProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center relative">
        <div className="flex items-center gap-2 px-3 py-1 rounded-md -ml-12">
          <Badge variant="default" className="bg-accent rounded-sm text-black">1</Badge>
          <h2 className="text-lg font-semibold">DATA PESERTA</h2>
        </div>
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
                onChange={(e) => {
                  const newEmail = e.target.value;
                  if (validateEmail && !validateEmail(newEmail, index)) {
                    errors[`email_${index}`] = "Email sudah digunakan oleh peserta lain";
                  }
                  onPesertaChange(index, 'email', newEmail);
                }}
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

              <div className="space-y-4 col-span-2">
                <Label>Tipe Alat</Label>
                <div className="grid grid-cols-2 gap-6">
                  {tipeAlatOptions.map(option => (
                    <Card 
                      key={option.value}
                      className={`cursor-pointer p-0 m-0 mt-0 transition-all hover:border-primary overflow-hidden ${
                        peserta.tipeAlat === option.value ? 'border-2 border-primary bg-accent/50' : ''
                      }`}
                      onClick={() => !isLoading && onPesertaChange(index, 'tipeAlat', option.value)}
                    >
                      <CardContent className="p-0 mt-0">
                        <div className="relative aspect-[4/3] w-full">
                          <img 
                            src={option.icon} 
                            alt={option.label} 
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-1 text-center">
                          <h3 className="text-sm">{option.label}</h3>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {errors[`tipeAlat_${index}`] && (
                  <p className="text-sm text-red-500">{errors[`tipeAlat_${index}`]}</p>
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
