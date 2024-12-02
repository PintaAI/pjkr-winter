"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TicketType } from "@prisma/client"
import { updatePackage } from "@/app/actions/dashboard"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface PackageForm {
  type: TicketType
  price: number
  description: string
  features: string[]
}

const initialForm: PackageForm = {
  type: "REGULAR",
  price: 100000,
  description: "",
  features: []
}

const defaultPackages: PackageForm[] = [
  {
    type: "REGULAR",
    price: 100000,
    description: "Paket dasar untuk pemula",
    features: [
      "Akses area ski pemula",
      "Instruktur dasar",
      "Peralatan standar"
    ]
  },
  {
    type: "LIFT_GONDOLA",
    price: 150000,
    description: "Paket lengkap untuk pengalaman ski maksimal",
    features: [
      "Akses Lift Gondola",
      "Area ski lanjutan",
      "Instruktur profesional",
      "Prioritas peralatan"
    ]
  }
]

export function ManagePackages() {
  const [packages, setPackages] = useState<PackageForm[]>(defaultPackages)
  const [editForm, setEditForm] = useState<PackageForm>(initialForm)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [newFeature, setNewFeature] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await updatePackage(editForm)
      if (result.success) {
        setSuccess(result.message)
        // Update local state
        setPackages(packages.map(pkg => 
          pkg.type === editForm.type ? editForm : pkg
        ))
        setIsEditing(false)
        setEditForm(initialForm)
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("Terjadi kesalahan saat memperbarui paket")
    } finally {
      setIsLoading(false)
    }
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setEditForm({
        ...editForm,
        features: [...editForm.features, newFeature.trim()]
      })
      setNewFeature("")
    }
  }

  const removeFeature = (index: number) => {
    setEditForm({
      ...editForm,
      features: editForm.features.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {packages.map((pkg) => (
          <Card key={pkg.type} className="relative">
            {pkg.type === 'LIFT_GONDOLA' && (
              <Badge className="absolute top-4 right-4">
                Premium
              </Badge>
            )}
            <CardHeader>
              <CardTitle>
                {pkg.type === 'REGULAR' ? 'Paket Regular' : 'Paket Lift Gondola'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    Rp {pkg.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {pkg.description}
                  </p>
                </div>
                
                <div>
                  <p className="font-medium mb-2">Fitur:</p>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button 
                  variant="outline"
                  onClick={() => {
                    setEditForm(pkg)
                    setIsEditing(true)
                  }}
                  disabled={isLoading}
                >
                  Edit Paket
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Paket</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipe Paket</Label>
                <Input
                  value={editForm.type === 'REGULAR' ? 'Paket Regular' : 'Paket Lift Gondola'}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label>Harga</Label>
                <Input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    price: parseInt(e.target.value)
                  })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    description: e.target.value
                  })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>Fitur Paket</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Tambah fitur baru"
                    disabled={isLoading}
                  />
                  <Button 
                    type="button"
                    onClick={addFeature}
                    disabled={isLoading}
                  >
                    Tambah
                  </Button>
                </div>
                <div className="mt-2 space-y-2">
                  {editForm.features.map((feature, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between bg-secondary p-2 rounded-md"
                    >
                      <span className="text-sm">{feature}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(index)}
                        disabled={isLoading}
                      >
                        Hapus
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setEditForm(initialForm)
                  }}
                  disabled={isLoading}
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
