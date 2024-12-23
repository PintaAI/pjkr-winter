"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatWon } from "@/lib/utils"
import { BusData } from "./bus-form"
import { OptionalItemData } from "./optional-item-form"
import { TicketData } from "./ticket-form"

interface SummaryFormProps {
  pesertaCount: number
  selectedTicket: TicketData | undefined
  selectedBus: BusData | undefined
  selectedOptionalItems: OptionalItemData[]
  totalTicketPerPerson: number
  totalOptionalItemsPerPerson: number
  totalPerPerson: number
  totalHarga: number
}

export default function SummaryForm({
  pesertaCount,
  selectedTicket,
  selectedBus,
  selectedOptionalItems,
  totalTicketPerPerson,
  totalOptionalItemsPerPerson,
  totalPerPerson,
  totalHarga
}: SummaryFormProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl">Ringkasan Pilihan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">Jumlah Peserta:</span>
            <span className="text-right">{pesertaCount} orang</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Tiket:</span>
            <span className="text-right">
              {selectedTicket ? `${selectedTicket.tipe} (${formatWon(totalTicketPerPerson)}/orang)` : '-'}
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium">Bus:</span>
          <span className="text-right">
            {selectedBus ? selectedBus.namaBus : '-'}
          </span>
        </div>
        <div className="flex justify-between items-start">
          <span className="font-medium">Item Tambahan:</span>
          <div className="text-right flex-1 ml-4">
            <div>{selectedOptionalItems.length > 0 ? selectedOptionalItems.map(item => item.namaItem).join(', ') : '-'}</div>
            {selectedOptionalItems.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {formatWon(totalOptionalItemsPerPerson)}/orang
              </div>
            )}
          </div>
        </div>
        <hr className="my-2" />
        <div className="space-y-1">
          <div className="flex justify-between items-center text-sm">
            <span>Total per orang:</span>
            <span>{formatWon(totalPerPerson)}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total {pesertaCount} orang:</span>
            <span>{formatWon(totalHarga)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}