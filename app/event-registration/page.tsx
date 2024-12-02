import EventRegistrationForm from '@/components/event/event-registration-form'

export default function EventRegistrationPage() {
  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Pendaftaran Event PJKR Winter
        </h1>
        <EventRegistrationForm />
      </div>
    </div>
  )
}
