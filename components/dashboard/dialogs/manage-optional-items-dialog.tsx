"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { OptionalItem } from "@prisma/client";
import { toast } from "sonner";
import { addOptionalItemToPeserta, removeOptionalItemFromPeserta } from "@/app/actions/dashboard";

interface ManageOptionalItemsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  pesertaId: string;
  optionalItems: {
    id: string;
    namaItem: string;
    harga: number;
    deskripsi: string[];
  }[];
  selectedItems: OptionalItem[];
  onItemUpdate: (updatedItems: OptionalItem[]) => void;
}

export function ManageOptionalItemsDialog({
  isOpen,
  onOpenChange,
  pesertaId,
  optionalItems,
  selectedItems,
  onItemUpdate
}: ManageOptionalItemsDialogProps) {
  const handleItemAction = async (item: typeof optionalItems[0], isSelected: boolean) => {
    try {
      if (isSelected) {
        const res = await removeOptionalItemFromPeserta(pesertaId, item.id);
        if (res.success) {
          onItemUpdate(selectedItems.filter(i => i.id !== item.id));
          toast.success(res.message);
        } else {
          toast.error(res.message);
        }
      } else {
        const res = await addOptionalItemToPeserta(pesertaId, item.id);
        if (res.success) {
          onItemUpdate([...selectedItems, {
            ...item,
            pesertaId
          } as OptionalItem]);
          toast.success(res.message);
        } else {
          toast.error(res.message);
        }
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Kelola Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kelola Item Opsional</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {optionalItems.map((item) => {
            const isSelected = selectedItems.some(i => i.id === item.id);
            return (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{item.namaItem}</span>
                  <p className="text-sm text-muted-foreground">
                    Rp {item.harga.toLocaleString()}
                  </p>
                </div>
                <Button
                  variant={isSelected ? "destructive" : "default"}
                  size="sm"
                  onClick={() => handleItemAction(item, isSelected)}
                >
                  {isSelected ? "Hapus" : "Tambah"}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
