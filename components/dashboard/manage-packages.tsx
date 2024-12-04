"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createPackage, updatePackage, deletePackage, getPackageData } from "@/app/actions/dashboard"
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

interface PackageForm {
  tipe: string
  harga: number
  description: string
  features: string[]
}

interface PackageData extends PackageForm {
  id: string
}

const initialForm: PackageForm = {
  tipe: "",
  harga: 0,
  description: "",
  features: []
}

export function ManagePackages() {
  const [packages, setPackages] = useState<PackageData[]>([])
  const [editForm, setEditForm] = useState<PackageForm>(initialForm)
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [newFeature, setNewFeature] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    loadPackageData()
  }, [])

  const loadPackageData = async () => {
    try {
      const result = await getPackageData()
      if (result.success && result.data) {
        setPackages(result.data)
      }
    } catch (error) {
      console.error("Error loading package data:", error)
      setError("Gagal memuat data paket")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      let result
      if (isEditing && selectedPackageId) {
        result = await updatePackage(selectedPackageId, {
          harga: editForm.harga,
          description: editForm.description,
          features: editForm.features
        })
      } else {
        result = await createPackage(editForm)
      }

      if (result.success) {
        setSuccess(result.message)
        await loadPackageData()
        setIsEditing(false)
        setSelectedPackageId(null)
        setEditForm(initialForm)
        setDialogOpen(false)
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("Terjadi kesalahan saat memproses data paket")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus paket ini?")) {
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await deletePackage(id)
      if (result.success) {
        setSuccess(result.message)
        await loadPackageData()
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("Terjadi kesalahan saat menghapus paket")
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            onClick={() => {
              setIsEditing(false)
              setSelectedPackageId(null)
              setEditForm(initialForm)
              setDialogOpen(true)
            }}
          >
            Tambah Paket Baru
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Paket" : "Tambah Paket Baru"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isEditing && (
              <div className="space-y-2">
                <Label>Tipe Paket</Label>
                <Input
                  value={editForm.tipe}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    tipe: e.target.value
                  })}
                  required
                  disabled={isLoading}
                  placeholder="Contoh: REGULAR"
                />
              </div>
            )}

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
                {isLoading ? "Menyimpan..." : (isEditing ? "Simpan Perubahan" : "Tambah Paket")}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setSelectedPackageId(null)
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
        {packages.map((pkg) => (
          <Card key={pkg.id} className="relative">
            <CardHeader>
              <CardTitle>{pkg.tipe}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatWon(pkg.harga)}
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

                <div className="flex space-x-2">
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setEditForm({
                            tipe: pkg.tipe,
                            harga: pkg.harga,
                            description: pkg.description,
                            features: pkg.features
                          })
                          setSelectedPackageId(pkg.id)
                          setIsEditing(true)
                          setDialogOpen(true)
                        }}
                      >
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Paket</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
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
                              setSelectedPackageId(null)
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
                    onClick={() => handleDelete(pkg.id)}
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
