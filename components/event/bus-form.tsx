"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface BusData {
  id: string
  namaBus: string
  kapasitas: number
  terisi: number
}

interface BusFormProps {
  busData: BusData[]
  selectedId: string
  onBusSelect: (id: string) => void
}

export default function BusForm({
  busData,
  selectedId,
  onBusSelect
}: BusFormProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold">Pilihan Bus</h2>
      <p className="text-sm text-gray-500">Pilih bus yang masih tersedia bangkunya</p>
      <div className="flex flex-col lg:flex-row gap-4">
        {busData.map((bus) => {
          const isFull = bus.terisi >= bus.kapasitas
          const isSelected = selectedId === bus.id

          return (
            <Card 
              key={bus.id}
              className={cn(
                "cursor-pointer transition-all flex-1",
                isSelected ? 'border-2 border-primary ring-2 ring-primary/20' 
                  : isFull ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:border-primary/20'
              )}
              onClick={() => {
                if (!isFull) {
                  onBusSelect(bus.id)
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-base">{bus.namaBus}</h3>
                  {isFull && (
                    <Badge variant="destructive">Penuh</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Kapasitas:</span>
                  <div className="flex-1 h-2.5 bg-gray-200 rounded-full">
                    <div 
                      className={cn(
                        "h-2.5 rounded-full",
                        isFull ? "bg-red-500" : "bg-green-500"
                      )}
                      style={{
                        width: `${(bus.terisi / bus.kapasitas) * 100}%`
                      }}
                    />
                  </div>
                  <span>{bus.terisi}/{bus.kapasitas}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export type { BusData }
