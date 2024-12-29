"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn, formatWon } from "@/lib/utils"
import { Medal } from "lucide-react"

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
  // Sort tickets by price from lowest to highest
  const sortedTickets = [...ticketData].sort((a, b) => a.harga - b.harga)

  // Function to get tier styling and icon
  const getTierProps = (index: number) => {
    switch(index) {
      case 0: // Bronze
        return {
          color: "text-amber-700",
          badge: "bg-amber-700 text-background hover:bg-amber-800",
          label: "Bronze"
        }
      case 1: // Silver  
        return {
          color: "text-gray-400",
          badge: "bg-gray-400 text-background hover:bg-gray-500",
          label: "Silver"
        }
      case 2: // Gold
        return {
          color: "text-yellow-500",
          badge: "bg-yellow-500 text-background hover:bg-yellow-600",
          label: "Gold"
        }
      default:
        return {
          color: "",
          badge: "",
          label: ""
        }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-3 py-1 rounded-md -ml-12">
        <Badge variant="default" className="bg-accent rounded-sm text-black">2</Badge>
        <h2 className="text-lg font-semibold">PILIH TIKET</h2>
      </div>
      <p className="text-sm text-gray-500 ml-3">Pilih tipe tiket yang cocok buat mu</p>
      <div className="flex flex-col lg:flex-row gap-4">
        {sortedTickets.map((ticket, index) => {
          const isSelected = selectedType === ticket.tipe
          const tierProps = getTierProps(index)
          
          return (
            <Card 
              key={ticket.tipe}
              className={cn(
                "cursor-pointer transition-all flex-1 border-2",
                isSelected 
                  ? 'border-accent ring-2 ring-accent/20' 
                  : 'border-secondary hover:border-accent/20'
              )}
              onClick={() => onTypeChange(ticket.tipe)}
            >
              <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-base">{ticket.tipe}</h3>
                <div className="flex items-center gap-2">
                <Medal className={cn("h-4 w-4", tierProps.color)} />
                  <Badge 
                    variant="secondary"
                    className={cn(
                      "font-semibold",
                      isSelected ? "bg-accent hover:bg-accent/90 text-black" : tierProps.badge
                    )}
                  >
                    {formatWon(ticket.harga)}
                  </Badge>
                </div>
              </div>


                <p className="text-sm text-muted-foreground mb-3">
                  {ticket.description}
                </p>
                <ul className="space-y-1.5">
                  {ticket.features.map((feature, index) => (
                    <li key={index} className="text-sm flex items-center gap-2">
                      <span className="text-accent">•</span>
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
