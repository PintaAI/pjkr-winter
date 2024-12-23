"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn, formatWon } from "@/lib/utils"

interface OptionalItemData {
  id: string
  namaItem: string
  harga: number
  deskripsi: string[]
}

interface OptionalItemFormProps {
  optionalItemData: OptionalItemData[]
  selectedIds: string[]
  onOptionalItemChange: (id: string, checked: boolean) => void
}

export default function OptionalItemForm({
  optionalItemData,
  selectedIds,
  onOptionalItemChange
}: OptionalItemFormProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <span>Item Tambahan</span>
          <Badge variant="secondary" className="text-xs">Opsional</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">Pilih item tambahan yang lo butuhin</p>
        
        <div className="flex flex-col lg:flex-row gap-4">
          {optionalItemData.map((item) => {
            const isSelected = selectedIds.includes(item.id)
            return (
              <Card
                key={item.id}
                className={cn(
                  "transition-all flex-1",
                  isSelected ? 'border-2 border-primary ring-2 ring-primary/20' : 'hover:border-primary/20'
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      className="mt-1 h-5 w-5"
                      onCheckedChange={(checked) => onOptionalItemChange(item.id, checked as boolean)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-base truncate">{item.namaItem}</h3>
                        <Badge variant="secondary" className="ml-2 shrink-0">
                          {formatWon(item.harga)}
                        </Badge>
                      </div>
                      <ul className="space-y-1.5">
                        {item.deskripsi.map((desc, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="text-primary shrink-0">•</span>
                            <span className="break-words">{desc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export type { OptionalItemData }