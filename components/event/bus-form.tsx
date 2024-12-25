"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { BusFront } from "lucide-react"
import { Badge } from "../ui/badge"

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
      <div className="flex items-center gap-2 px-3 py-1 rounded-md -ml-12">
        <Badge variant="default" className="bg-accent rounded-sm text-black">3</Badge>
        <h2 className="text-lg font-semibold">PILIH BUS</h2>
      </div>
      <p className="text-sm text-gray-500 ml-3">Pilih bus yang masih tersedia bangkunya</p>
      <div className="grid grid-cols-2 gap-4">
        {busData.map((bus) => {
          const isFull = bus.terisi >= bus.kapasitas
          const isSelected = selectedId === bus.id

          return (
            <Card 
              key={bus.id}
              className={cn(
                "cursor-pointer transition-all rounded-xl",
                isSelected 
                  ? 'bg-accent text-accent-foreground' 
                  : 'bg-background text-secondary-foreground',
                isFull && 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => {
                if (!isFull) {
                  onBusSelect(bus.id)
                }
              }}
            >
              <CardContent className="p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <BusFront className="w-5 h-5" />
                  <span className="font-semibold">{bus.namaBus}</span>
                  {isFull && <span className="ml-auto text-sm">full</span>}
                </div>
                <div className="space-y-1.5">
                  <Progress 
                    value={(bus.terisi / bus.kapasitas) * 100} 
                    className={cn(
                      "h-2",
                      isFull ? "bg-destructive" : "bg-secondary/50"
                    )}
                  />
                  <div className="flex justify-between text-xs">
                    <span>Kapasitas</span>
                    <span>{bus.terisi}/{bus.kapasitas}</span>
                  </div>
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
