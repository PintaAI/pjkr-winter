"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RentalType } from "@prisma/client"
import { updateRental, getRentalData } from "@/app/actions/dashboard"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface RentalForm {
  type: RentalType
  name: string
  price: number
  description: string
  items: string[]
}

const initialForm: RentalForm = {
  type: "EQUIPMENT_FULLSET",
  name: "",
  price: 0,
  description: "",
  items: []
}

const defaultRentals: RentalForm[] = [
  {
    type: "EQUIPMENT_FULLSET",
    name: "Peralatan Ski Fullset",
    price: 100000,
    description: "Ski/snowboard, helm, dan perlengkapan keselamatan",
    items: ["Ski/Snowboard", "Helm", "Pelindung lutut", "Pelindung siku"]
  },
  {
    type: "CLOTHING_FULLSET",
    name: "Pakaian Winter Fullset",
    price: 50000,
    description: "Jaket winter, celana, sarung tangan, dan kacamata",
    items: ["Jaket Winter", "Celana Winter", "Sarung Tangan", "Kacamata Ski"]
  }
]

export function ManageRentals() {
  const [rentals, setRentals] = useState<RentalForm[]>(defaultRentals)
  const [editForm, setEditForm] = useState<RentalForm>(initialForm)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [newItem, setNewItem] = useState("")

  useEffect(() => {
    loadRentalData()
  }, [])

  const loadRentalData = async () => {
    const result = await getRentalData()
    if (result.success && result.data) {
      // Merge default items with database data
      const updatedRentals = defaultRentals.map(defaultRental => {
        const dbRental = result.data.find(r => r.type === defaultRental.type)
        return dbRental ? {
          ...defaultRental,
          name: dbRental.name,
          price: dbRental.price
        } : defaultRental
      })
      setRentals(updatedRentals)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await updateRental(editForm)
      if (result.success) {
        setSuccess(result.message)
        loadRentalData()
        setIsEditing(false)
        setEditForm(initialForm)
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("Terjadi kesalahan saat memperbarui data sewa")
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = () => {
    if (newItem.trim()) {
      setEditForm({
        ...editForm,
        items: [...editForm.items, newItem.trim()]
      })
      setNewItem("")
    }
  }

  const removeItem = (index: number) => {
    setEditForm({
      ...editForm,
      items: editForm.items.filter((_, i) => i !== index)
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
        {rentals.map((rental) => (
          <Card key={rental.type}>
            <CardHeader>
              <CardTitle>{rental.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    Rp {rental.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {rental.description}
                  </p>
                </div>
                
                <div>
                  <p className="font-medium mb-2">Termasuk:</p>
                  <div className="flex flex-wrap gap-2">
                    {rental.items.map((item, index) => (
                      <Badge key={index} variant="secondary">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button 
                  variant="outline"
                  onClick={() => {
                    setEditForm(rental)
                    setIsEditing(true)
                  }}
                  disabled={isLoading}
                >
                  Edit Paket Sewa
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Paket Sewa</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipe Paket</Label>
                <Input
                  value={editForm.type}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label>Nama Paket</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    name: e.target.value
                  })}
                  required
                  disabled={isLoading}
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
                <Label>Item yang Termasuk</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Tambah item baru"
                    disabled={isLoading}
                  />
                  <Button 
                    type="button"
                    onClick={addItem}
                    disabled={isLoading}
                  >
                    Tambah
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {editForm.items.map((item, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      {item}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeItem(index)}
                        disabled={isLoading}
                      >
                        ×
                      </Button>
                    </Badge>
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
