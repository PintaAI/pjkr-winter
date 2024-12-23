import Image from "next/image"
import EventRegistrationForm from "@/components/event/event-registration-form"

export default function EventRegistrationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-10 max-w-3xl mx-auto">
      <div className="w-full">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.png"
            alt="Logo"
            width={60}
            height={80}
            className="mb-4"
          />
          <Image
            src="/PJKR.svg"
            alt="PJKR Logo"
            width={200}
            height={200}
            className="mb-4"
          />
          <h1 className="bigfont text-2xl font-bold text-accent text-center">
            FORM PENDAFTARAN
          </h1>
        </div>
        <EventRegistrationForm />
      </div>
    </div>
  )
}
