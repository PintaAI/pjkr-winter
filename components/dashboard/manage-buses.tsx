"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { createBus, updateBus, deleteBus, getBusData } from "@/app/actions/dashboard"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface BusForm {
  namaBus: string
  kapasitas: number
}

interface BusData {
  id: string
  namaBus: string
  kapasitas: number
  terisi: number
  crew: string[]
}

const initialForm: BusForm = {
  namaBus: "",
  kapasitas: 40
}

export function ManageBuses() {
  const router = useRouter()
  const [buses, setBuses] = useState<BusData[]>([])
  const [editForm, setEditForm] = useState<BusForm>(initialForm)
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadBusData()
  }, [])

  const loadBusData = async () => {
    const result = await getBusData()
    if (result.success && result.data) {
      const sortedBuses = [...result.data].sort((a, b) => 
        a.namaBus.localeCompare(b.namaBus)
      )
      setBuses(sortedBuses)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

      try {
        let result;
        if (isEditing && selectedBusId) {
          const selectedBus = buses.find(bus => bus.id === selectedBusId)
          if (selectedBus && editForm.kapasitas < selectedBus.terisi) {
            setError("Kapasitas tidak boleh kurang dari jumlah penumpang saat ini")
            return
          }
          result = await updateBus(selectedBusId, editForm)
        } else {
          result = await createBus(editForm)
        }

        if (result.success) {
          setSuccess(result.message)
          loadBusData()
          setIsEditing(false)
          setSelectedBusId(null)
          setEditForm(initialForm)
        } else {
          setError(result.message)
        }
    } catch (error) {
      setError("Terjadi kesalahan saat memproses data bus")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await deleteBus(id)
      if (result.success) {
        setSuccess(result.message)
        loadBusData()
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("Terjadi kesalahan saat menghapus bus")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBusClick = (busId: string) => {
    router.push(`/bus/${busId}`)
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

      <Dialog>
        <DialogTrigger asChild>
          <Button>
            Tambah Bus Baru
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Bus" : "Tambah Bus Baru"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Bus</Label>
              <Input
                value={editForm.namaBus}
                onChange={(e) => setEditForm({
                  ...editForm,
                  namaBus: e.target.value
                })}
                required
                disabled={isLoading}
                placeholder="Contoh: Bus Ekonomi"
              />
            </div>

            <div className="space-y-2">
              <Label>Kapasitas</Label>
              <Input
                type="number"
                value={editForm.kapasitas}
                onChange={(e) => setEditForm({
                  ...editForm,
                  kapasitas: parseInt(e.target.value)
                })}
                required
                min={1}
                max={100}
                disabled={isLoading}
                placeholder="Masukkan kapasitas"
              />
            </div>

            <div className="flex space-x-2">
              <Button 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Menyimpan..." : (isEditing ? "Simpan Perubahan" : "Tambah Bus")}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setSelectedBusId(null)
                  setEditForm(initialForm)
                }}
                disabled={isLoading}
              >
                Batal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {buses.map((bus) => (
          <Card 
            key={bus.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleBusClick(bus.id)}
          >
            <CardHeader>
              <CardTitle>{bus.namaBus}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Terisi: {bus.terisi}/{bus.kapasitas}</span>
                      <span>{Math.round((bus.terisi / bus.kapasitas) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(bus.terisi / bus.kapasitas) * 100} 
                      className="h-2"
                    />
                    {bus.terisi > bus.kapasitas && (
                      <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md mt-2">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          className="text-red-500"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <span className="text-sm text-red-600">
                          Melebihi kapasitas sebanyak {bus.terisi - bus.kapasitas} peserta
                        </span>
                      </div>
                    )}
                  </div>

                {bus.crew.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium">Crew:</p>
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                      {bus.crew.sort().map((crewName, index) => (
                        <li key={index}>{crewName}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditForm({
                            namaBus: bus.namaBus,
                            kapasitas: bus.kapasitas
                          })
                          setSelectedBusId(bus.id)
                          setIsEditing(true)
                        }}
                      >
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent onClick={(e) => e.stopPropagation()}>
                      <DialogHeader>
                        <DialogTitle>Edit Bus</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Nama Bus</Label>
                          <Input
                            value={editForm.namaBus}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              namaBus: e.target.value
                            })}
                            required
                            disabled={isLoading}
                            placeholder="Contoh: Bus Ekonomi"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Kapasitas</Label>
                          <Input
                            type="number"
                            value={editForm.kapasitas}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({
                              ...editForm,
                              kapasitas: parseInt(e.target.value)
                            })}
                            required
                            min={1}
                            max={100}
                            disabled={isLoading}
                            placeholder="Masukkan kapasitas"
                          />
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
                              setSelectedBusId(null)
                              setEditForm(initialForm)
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
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(bus.id)
                    }}
                    disabled={bus.terisi > 0}
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
