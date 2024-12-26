"use client"

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { registerEvent, getBusData, getTicketData, getOptionalItemData } from '@/app/actions/event-registration'
import { useRouter } from 'next/navigation' 
import { PesertaQR } from '@/components/dashboard/peserta-qr'
import { FileUpload } from "@/components/ui/file-upload"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import PesertaForm, { PesertaData } from './peserta-form'
import TicketForm, { TicketData } from './ticket-form'
import BusForm, { BusData } from './bus-form'
import OptionalItemForm, { OptionalItemData } from './optional-item-form'
import SummaryForm from './summary-form'
import { Badge } from '../ui/badge'
import { Phone, PhoneIcon } from 'lucide-react'

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
  buktiPembayaran: string | null
}

interface RegisteredPeserta {
  id: string
  name: string
  email: string
  ukuranSepatu: string
  ukuranBaju: string
  jenisTiket: string
  namaBus: string
}

type RegisterEventResponse = {
  success: boolean
  message: string
  data?: RegisteredPeserta[]
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
  busId: "",
  buktiPembayaran: null
}

export default function EventRegistrationForm() {
  const handleFileUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('pathname', `event-registration/${file.name}`);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('File uploaded successfully:', data.url);
      setFormData(prev => ({
        ...prev,
        buktiPembayaran: data.url
      }));
      toast.success('Bukti pembayaran berhasil diunggah');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Gagal mengunggah bukti pembayaran');
    }
  };

  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registeredPeserta, setRegisteredPeserta] = useState<RegisteredPeserta[]>([])
  const [showTickets, setShowTickets] = useState(false)
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

    if (!formData.buktiPembayaran) {
      newErrors['buktiPembayaran'] = 'Bukti pembayaran wajib diunggah!'
    }

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
      const result = await registerEvent(formData) as RegisterEventResponse
      if (result.success && result.data) {
        toast.success('Pendaftaran berhasil!')
        setRegisteredPeserta(result.data)
        setShowTickets(true)
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
    <>
      {showTickets ? (
        <div className="space-y-8 max-w-7xl mx-auto py-4 sm:py-8 px-4">
          <h2 className="text-2xl font-bold text-center mb-6">Tiket Anda</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registeredPeserta.map((peserta, index) => (
              <PesertaQR key={`${peserta.id}-${index}`} peserta={peserta} />
            ))}
          </div>
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              Jika tidak bisa mengunduh tiket, silakan screenshot atau hubungi kami melalui{" "}
              <a 
                href="https://wa.me/6285728212056" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                WhatsApp
              </a>
            </p>
            <Alert>
              <AlertDescription className="text-center">
                Silakan bergabung dengan grup WhatsApp kami untuk informasi lebih lanjut:{" "}
                <a 
                  href="https://chat.whatsapp.com/C5S7eCPqjwJFfXLj2t4uie"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  Klik di sini untuk bergabung
                </a>
              </AlertDescription>
            </Alert>
          </div>
          <div className="flex justify-center">
            <Button
              onClick={() => {
                setShowTickets(false)
                setFormData(initialFormData)
                setRegisteredPeserta([])
                router.refresh()
              }}
            >
              Daftar Lagi
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-7xl mx-auto py-4 sm:py-8 px-4 relative">
          {/* Timeline Guide */}
          <div className="absolute left-4 sm:left-8 top-8 bottom-8 -z-10">
            <div className="absolute left-4 top-0 bottom-0 border-l-2 border-dashed border-gray-400" />
          </div>
          {/* Main Content with padding for timeline */}
          <div className="pl-10 space-y-4">
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

            <div className="space-y-4">
              <div className="flex items-center gap-2 px-3 py-1 rounded-md -ml-12">
                <Badge variant="default" className="bg-accent rounded-sm text-black">6</Badge>
                <h2 className="text-lg font-semibold">BUKTI PEMBAYARAN</h2>
              </div>
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm text-gray-500">Silahkan Transfer ke total harga pembayaran ke:</p>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                        <div>
                          <p className="font-semibold">우리 Bank</p>
                          <p className="text-lg font-mono">1002762999866</p>
                          <p className="text-sm">a/n SAGELLA RORES</p>
                        </div>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            navigator.clipboard.writeText('1002762999866');
                            toast.success('Nomor rekening berhasil disalin!');
                          }}
                          className="h-8"
                        >
                          Salin
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <FileUpload onChange={handleFileUpload} />
                    {errors.buktiPembayaran && (
                      <p className="text-sm text-destructive">{errors.buktiPembayaran}</p>
                    )}
                    {formData.buktiPembayaran && (
                      <p className="text-sm text-green-500">✓ Bukti pembayaran berhasil diunggah</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 sm:h-11 text-base sm:text-sm flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading && <Spinner />}
              {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
            </Button>
            <p className='text-sm'>note : jika terjadi masalah atau kesulitan dalam mendaftar silahkan hubungi admin di             
              <PhoneIcon className="w-4 h-4 inline ml-2 border p-1 rounded-full" /><a 
              href="https://wa.me/6285728212056" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-secondary font-bold hover:underline"
            >
              WhatsApp
            </a></p>
          </div>
        </form>
      )}
    </>
  )
}
