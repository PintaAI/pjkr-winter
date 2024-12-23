"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn, formatWon } from "@/lib/utils"

interface TicketData {
  tipe: string
  harga: number
  description: string
  features: string[]
}

interface TicketFormProps {
  ticketData: TicketData[]
  selectedType: string
  onTypeChange: (type: string) => void
}

export default function TicketForm({
  ticketData,
  selectedType,
  onTypeChange
}: TicketFormProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold">Pilihan Tiket</h2>
      <p className="text-sm text-gray-500">Pilih tipe tiket yang cocok buat mu</p>
      <div className="flex flex-col lg:flex-row gap-4">
        {ticketData.map((ticket) => {
          const isSelected = selectedType === ticket.tipe
          return (
            <Card 
              key={ticket.tipe}
              className={cn(
                "cursor-pointer transition-all flex-1",
                isSelected ? 'border-2 border-primary ring-2 ring-primary/20' : 'hover:border-primary/20'
              )}
              onClick={() => onTypeChange(ticket.tipe)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-base">{ticket.tipe}</h3>
                  <Badge variant="secondary" className="font-semibold">
                    {formatWon(ticket.harga)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {ticket.description}
                </p>
                <ul className="space-y-1.5">
                  {ticket.features.map((feature, index) => (
                    <li key={index} className="text-sm flex items-center gap-2">
                      <span className="text-primary">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export type { TicketData }
