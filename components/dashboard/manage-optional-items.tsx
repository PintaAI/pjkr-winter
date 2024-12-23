"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { createOptionalItem, updateOptionalItem, deleteOptionalItem, getOptionalItemData } from "@/app/actions/dashboard"
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

interface OptionalItemForm {
  namaItem: string
  harga: number
  deskripsi: string[]
}

interface OptionalItemData extends OptionalItemForm {
  id: string
}

const initialForm: OptionalItemForm = {
  namaItem: "",
  harga: 0,
  deskripsi: []
}

export function ManageOptionalItems() {
  const [items, setItems] = useState<OptionalItemData[]>([])
  const [editForm, setEditForm] = useState<OptionalItemForm>(initialForm)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [newItem, setNewItem] = useState("")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  useEffect(() => {
    loadOptionalItemData()
  }, [])

  const loadOptionalItemData = async () => {
    try {
      const result = await getOptionalItemData()
      if (result.success && result.data) {
        setItems(result.data)
      }
    } catch (error) {
      console.error("Error loading optional item data:", error)
      setError("Gagal memuat data item")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      let result
      if (isEditing && selectedItemId) {
        result = await updateOptionalItem(selectedItemId, {
          namaItem: editForm.namaItem,
          harga: editForm.harga,
          deskripsi: editForm.deskripsi
        })
      } else {
        result = await createOptionalItem(editForm)
      }

      if (result.success) {
        setSuccess(result.message)
        await loadOptionalItemData()
        setIsEditing(false)
        setSelectedItemId(null)
        setEditForm(initialForm)
        setAddDialogOpen(false)
        setEditDialogOpen(false)
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("Terjadi kesalahan saat memproses data item")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus item ini?")) {
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await deleteOptionalItem(id)
      if (result.success) {
        setSuccess(result.message)
        await loadOptionalItemData()
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("Terjadi kesalahan saat menghapus item")
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = () => {
    if (newItem.trim()) {
      setEditForm({
        ...editForm,
        deskripsi: [...editForm.deskripsi, newItem.trim()]
      })
      setNewItem("")
    }
  }

  const removeItem = (index: number) => {
    setEditForm({
      ...editForm,
      deskripsi: editForm.deskripsi.filter((_, i) => i !== index)
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

      {/* Dialog untuk Tambah Item Baru */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            onClick={() => {
              setIsEditing(false)
              setSelectedItemId(null)
              setEditForm(initialForm)
              setAddDialogOpen(true)
            }}
          >
            Tambah Item Opsional
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Item Opsional</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Item</Label>
              <Input
                value={editForm.namaItem}
                onChange={(e) => setEditForm({
                  ...editForm,
                  namaItem: e.target.value
                })}
                required
                disabled={isLoading}
                placeholder="Contoh: Jaket Winter"
              />
            </div>

            <div className="space-y-2">
              <Label>Harga</Label>
              <Input
                type="number"
                value={editForm.harga}
                onChange={(e) => setEditForm({
                  ...editForm,
                  harga: parseInt(e.target.value)
                })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <div className="flex space-x-2">
                <Input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Tambah deskripsi"
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
                {editForm.deskripsi.map((item, index) => (
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
                {isLoading ? "Menyimpan..." : "Tambah Item"}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setSelectedItemId(null)
                  setEditForm(initialForm)
                  setAddDialogOpen(false)
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
        {items.map((item) => (
          <Card key={item.id} className="relative">
            <CardHeader>
              <CardTitle>{item.namaItem}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatWon(item.harga)}
                  </p>
                </div>
                
                <div>
                  <p className="font-medium mb-2">Deskripsi:</p>
                  <div className="flex flex-wrap gap-2">
                    {item.deskripsi.map((desc, index) => (
                      <Badge key={index} variant="secondary">
                        {desc}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  {/* Dialog untuk Edit Item */}
                  <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setEditForm({
                            namaItem: item.namaItem,
                            harga: item.harga,
                            deskripsi: item.deskripsi
                          })
                          setSelectedItemId(item.id)
                          setIsEditing(true)
                          setEditDialogOpen(true)
                        }}
                      >
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Item Opsional</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Nama Item</Label>
                          <Input
                            value={editForm.namaItem}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              namaItem: e.target.value
                            })}
                            required
                            disabled={isLoading}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Harga</Label>
                          <Input
                            type="number"
                            value={editForm.harga}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              harga: parseInt(e.target.value)
                            })}
                            required
                            disabled={isLoading}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Deskripsi</Label>
                          <div className="flex space-x-2">
                            <Input
                              value={newItem}
                              onChange={(e) => setNewItem(e.target.value)}
                              placeholder="Tambah deskripsi"
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
                            {editForm.deskripsi.map((item, index) => (
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
                              setSelectedItemId(null)
                              setEditForm(initialForm)
                              setEditDialogOpen(false)
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
                    onClick={() => handleDelete(item.id)}
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
