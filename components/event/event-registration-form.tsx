"use client"

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { registerEvent, getBusData, getTicketData, getOptionalItemData } from '@/app/actions/event-registration'
import { useRouter } from 'next/navigation'

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import PesertaForm, { PesertaData } from './peserta-form'
import TicketForm, { TicketData } from './ticket-form'
import BusForm, { BusData } from './bus-form'
import OptionalItemForm, { OptionalItemData } from './optional-item-form'
import SummaryForm from './summary-form'

// Simple spinner component
function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" 
        stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" 
        d="M4 12a8 8 0 018-8v8H4z"></path>
    </svg>
  )
}

interface FormData {
  peserta: PesertaData[]
  ticketType: string
  optionalItems: string[]
  busId: string | ""
}

const initialPesertaData: PesertaData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  ukuranBaju: "",
  ukuranSepatu: "",
  tipeAlat: ""
}

const initialFormData: FormData = {
  peserta: [{ ...initialPesertaData }],
  ticketType: "REGULAR",
  optionalItems: [],
  busId: ""
}

export default function EventRegistrationForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busData, setBusData] = useState<BusData[]>([])
  const [ticketData, setTicketData] = useState<TicketData[]>([])
  const [optionalItemData, setOptionalItemData] = useState<OptionalItemData[]>([])
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      const busResult = await getBusData()
      if (busResult.success) setBusData(busResult.data ?? [])

      const ticketResult = await getTicketData()
      if (ticketResult.success) setTicketData(ticketResult.data ?? [])

      const optionalItemResult = await getOptionalItemData()
      if (optionalItemResult.success) setOptionalItemData(optionalItemResult.data ?? [])
    }
    loadData()
  }, [])

  const validateEmail = (email: string, currentIndex: number) => {
    return !formData.peserta.some(
      (p, idx) => idx !== currentIndex && p.email === email
    );
  }

  const validate = () => {
    const newErrors: {[key: string]: string} = {}
    
    formData.peserta.forEach((peserta, index) => {
      if (!peserta.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        newErrors[`email_${index}`] = 'Format email tidak valid!'
      } else if (!validateEmail(peserta.email, index)) {
        newErrors[`email_${index}`] = 'Email sudah digunakan oleh peserta lain!'
      }
      if (!peserta.phone.match(/^[0-9]{8,}$/)) {
        newErrors[`phone_${index}`] = 'Nomor telepon minimal 8 digit angka!'
      }
      if (!peserta.name.trim()) newErrors[`name_${index}`] = 'Nama wajib diisi ya!'
      if (!peserta.address.trim()) newErrors[`address_${index}`] = 'Alamat jangan kosong dong!'
      if (!peserta.ukuranBaju) newErrors[`ukuranBaju_${index}`] = 'Pilih ukuran baju!'
      if (!peserta.ukuranSepatu) newErrors[`ukuranSepatu_${index}`] = 'Pilih ukuran sepatu!'
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddPeserta = () => {
    setFormData(prev => ({
      ...prev,
      peserta: [...prev.peserta, { ...initialPesertaData }]
    }))
  }

  const handleRemovePeserta = (index: number) => {
    setFormData(prev => ({
      ...prev,
      peserta: prev.peserta.filter((_, i) => i !== index)
    }))
  }

  const handlePesertaChange = (index: number, field: keyof PesertaData, value: string) => {
    setFormData(prev => ({
      ...prev,
      peserta: prev.peserta.map((p, i) => 
        i === index ? { ...p, [field]: value } : p
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!validate()) return

    setIsLoading(true)
    try {
      const result = await registerEvent(formData)
      if (result.success) {
        toast.success('Pendaftaran berhasil!')
        setFormData(initialFormData)
        router.refresh()
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError('Terjadi kesalahan saat mengirim data, coba lagi nanti ya!')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOptionalItemChange = (id: string, checked: boolean) => {
    setFormData(prev => {
      if (checked && !prev.optionalItems.includes(id)) {
        return {...prev, optionalItems: [...prev.optionalItems, id]}
      }
      if (!checked) {
        return {...prev, optionalItems: prev.optionalItems.filter(itemId => itemId !== id)}
      }
      return prev
    })
  }

  // Hitung total (ticket + optional items) untuk semua peserta
  const selectedTicket = ticketData.find(t => t.tipe === formData.ticketType)
  const totalTicketPerPerson = selectedTicket ? selectedTicket.harga : 0
  const selectedOptionalItems = optionalItemData.filter(item => formData.optionalItems.includes(item.id))
  const totalOptionalItemsPerPerson = selectedOptionalItems.reduce((acc, item) => acc + item.harga, 0)
  const totalPerPerson = totalTicketPerPerson + totalOptionalItemsPerPerson
  const totalHarga = totalPerPerson * formData.peserta.length

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-7xl mx-auto py-4 sm:py-8 px-4 relative">
      {/* Timeline Guide */}
      <div className="absolute left-4 sm:left-8 top-8 bottom-8">
        <div className="absolute left-4 top-0 bottom-0 border-l-2 border-dashed border-gray-400" />
      </div>
      {/* Main Content with padding for timeline */}
      <div className="pl-10 space-y-4 ">
        {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <PesertaForm
        peserta={formData.peserta}
        errors={errors}
        isLoading={isLoading}
        onAddPeserta={handleAddPeserta}
        onRemovePeserta={handleRemovePeserta}
        onPesertaChange={handlePesertaChange}
        validateEmail={validateEmail}
      />

      <TicketForm
        ticketData={ticketData}
        selectedType={formData.ticketType}
        onTypeChange={(type) => setFormData(prev => ({...prev, ticketType: type}))}
      />

      <BusForm
        busData={busData}
        selectedId={formData.busId}
        onBusSelect={(id) => setFormData(prev => ({...prev, busId: id}))}
      />

      <OptionalItemForm
        optionalItemData={optionalItemData}
        selectedIds={formData.optionalItems}
        onOptionalItemChange={handleOptionalItemChange}
      />

      <SummaryForm
        pesertaCount={formData.peserta.length}
        selectedTicket={selectedTicket}
        selectedBus={busData.find(b => b.id === formData.busId)}
        selectedOptionalItems={selectedOptionalItems}
        totalTicketPerPerson={totalTicketPerPerson}
        totalOptionalItemsPerPerson={totalOptionalItemsPerPerson}
        totalPerPerson={totalPerPerson}
        totalHarga={totalHarga}
      />

        <Button
          type="submit"
          className="w-full h-12 sm:h-11 text-base sm:text-sm flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading && <Spinner />}
          {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
        </Button>
      </div>
    </form>
  )
}
