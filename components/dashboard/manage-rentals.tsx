"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { createRental, updateRental, deleteRental, getRentalData } from "@/app/actions/dashboard"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { formatWon } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface RentalForm {
  namaBarang: string
  hargaSewa: number
  items: string[]
}

interface RentalData extends RentalForm {
  id: string
}

const initialForm: RentalForm = {
  namaBarang: "",
  hargaSewa: 0,
  items: []
}

export function ManageRentals() {
  const [rentals, setRentals] = useState<RentalData[]>([])
  const [editForm, setEditForm] = useState<RentalForm>(initialForm)
  const [selectedRentalId, setSelectedRentalId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [newItem, setNewItem] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    loadRentalData()
  }, [])

  const loadRentalData = async () => {
    try {
      const result = await getRentalData()
      if (result.success && result.data) {
        setRentals(result.data)
      }
    } catch (error) {
      console.error("Error loading rental data:", error)
      setError("Gagal memuat data sewa")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      let result
      if (isEditing && selectedRentalId) {
        result = await updateRental(selectedRentalId, {
          namaBarang: editForm.namaBarang,
          hargaSewa: editForm.hargaSewa,
          items: editForm.items
        })
      } else {
        result = await createRental(editForm)
      }

      if (result.success) {
        setSuccess(result.message)
        await loadRentalData()
        setIsEditing(false)
        setSelectedRentalId(null)
        setEditForm(initialForm)
        setDialogOpen(false)
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("Terjadi kesalahan saat memproses data sewa")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus paket sewa ini?")) {
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await deleteRental(id)
      if (result.success) {
        setSuccess(result.message)
        await loadRentalData()
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("Terjadi kesalahan saat menghapus paket sewa")
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            onClick={() => {
              setIsEditing(false)
              setSelectedRentalId(null)
              setEditForm(initialForm)
              setDialogOpen(true)
            }}
          >
            Tambah Paket Sewa Baru
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Paket Sewa" : "Tambah Paket Sewa Baru"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isEditing && (
              <div className="space-y-2">
                <Label>Nama Paket</Label>
                <Input
                  value={editForm.namaBarang}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    namaBarang: e.target.value
                  })}
                  required
                  disabled={isLoading}
                  placeholder="Contoh: Paket Ski Pemula"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Harga Sewa</Label>
              <Input
                type="number"
                value={editForm.hargaSewa}
                onChange={(e) => setEditForm({
                  ...editForm,
                  hargaSewa: parseInt(e.target.value)
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
                {isLoading ? "Menyimpan..." : (isEditing ? "Simpan Perubahan" : "Tambah Paket")}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setSelectedRentalId(null)
                  setEditForm(initialForm)
                  setDialogOpen(false)
                }}
                disabled={isLoading}
              >
                Batal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rentals.map((rental) => (
          <Card key={rental.id} className="relative">
            <CardHeader>
              <CardTitle>{rental.namaBarang}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatWon(rental.hargaSewa)}
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

                <div className="flex space-x-2">
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setEditForm({
                            namaBarang: rental.namaBarang,
                            hargaSewa: rental.hargaSewa,
                            items: rental.items
                          })
                          setSelectedRentalId(rental.id)
                          setIsEditing(true)
                          setDialogOpen(true)
                        }}
                      >
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Paket Sewa</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Harga Sewa</Label>
                          <Input
                            type="number"
                            value={editForm.hargaSewa}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              hargaSewa: parseInt(e.target.value)
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
                              setSelectedRentalId(null)
                              setEditForm(initialForm)
                              setDialogOpen(false)
                            }}
                            disabled={isLoading}
                          >
                            Batal
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button 
                    variant="destructive"
                    onClick={() => handleDelete(rental.id)}
                    disabled={isLoading}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
