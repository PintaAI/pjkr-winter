"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BusType } from "@prisma/client"
import { updateBus, getBusCapacityData } from "@/app/actions/dashboard"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface BusForm {
  type: BusType
  name: string
  price: number
  capacity: number
}

interface BusData extends BusForm {
  currentOccupancy: number
}

const initialForm: BusForm = {
  type: BusType.BUS_1,
  name: "",
  price: 0,
  capacity: 40
}

export function ManageBuses() {
  const [buses, setBuses] = useState<BusData[]>([])
  const [editForm, setEditForm] = useState<BusForm>(initialForm)
  const [isEditing, setIsEditing] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadBusData()
  }, [])

  const loadBusData = async () => {
    const result = await getBusCapacityData()
    if (result.success && result.data) {
      setBuses(result.data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await updateBus(editForm)
      if (result.success) {
        setSuccess(result.message)
        loadBusData() // Reload data after successful update
        setIsEditing(false)
        setIsAdding(false)
        setEditForm(initialForm)
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("Terjadi kesalahan saat memperbarui data bus")
    } finally {
      setIsLoading(false)
    }
  }

  const availableBusTypes = Object.values(BusType).filter(
    type => !buses.find(bus => bus.type === type)
  )

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

      {!isEditing && !isAdding && (
        <Button 
          onClick={() => {
            setIsAdding(true)
            setEditForm(initialForm)
          }}
          className="mb-4"
          disabled={availableBusTypes.length === 0}
        >
          Tambah Bus Baru
        </Button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {buses.map((bus) => (
          <Card key={bus.type}>
            <CardHeader>
              <CardTitle>{bus.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    Rp {bus.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Kapasitas: {bus.capacity} penumpang
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Terisi: {bus.currentOccupancy}/{bus.capacity}</span>
                    <span>{Math.round((bus.currentOccupancy / bus.capacity) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(bus.currentOccupancy / bus.capacity) * 100} 
                    className="h-2"
                  />
                </div>

                <Button 
                  variant="outline"
                  onClick={() => {
                    setEditForm({
                      type: bus.type,
                      name: bus.name,
                      price: bus.price,
                      capacity: bus.capacity
                    })
                    setIsEditing(true)
                    setIsAdding(false)
                  }}
                >
                  Edit Bus
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(isEditing || isAdding) && (
        <Card>
          <CardHeader>
            <CardTitle>{isAdding ? "Tambah Bus Baru" : "Edit Bus"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tipe Bus</Label>
                {isAdding ? (
                  <Select
                    value={editForm.type}
                    onValueChange={(value) => setEditForm({
                      ...editForm,
                      type: value as BusType
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe bus" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBusTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={editForm.type} disabled />
                )}
              </div>

              <div className="space-y-2">
                <Label>Nama Bus</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    name: e.target.value
                  })}
                  required
                  disabled={isLoading}
                  placeholder="Contoh: Bus Ekonomi"
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
                  placeholder="Masukkan harga"
                />
              </div>

              <div className="space-y-2">
                <Label>Kapasitas</Label>
                <Input
                  type="number"
                  value={editForm.capacity}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    capacity: parseInt(e.target.value)
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
                  {isLoading ? "Menyimpan..." : (isAdding ? "Tambah Bus" : "Simpan Perubahan")}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setIsAdding(false)
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
