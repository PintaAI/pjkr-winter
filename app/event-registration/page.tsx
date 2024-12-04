import EventRegistrationForm from '@/components/event/event-registration-form'

export default function EventRegistrationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-10">
      <div className="w-full">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Pendaftaran Event PJKR Winter
        </h1>
        <EventRegistrationForm />
      </div>
    </div>
  )
}
