"use client"

interface TimelineGuideProps {
  steps: {
    number: number
    label: string
  }[]
}

export default function TimelineGuide({ steps }: TimelineGuideProps) {
  return (
    <div className="absolute left-4 sm:left-8 top-8 bottom-8">
      <div className="absolute left-4 top-0 bottom-0 border-l-2 border-dashed border-gray-400" />
      
      <div className="relative space-y-32">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold z-10">
              {step.number}
            </div>
            <span className="font-medium text-sm sm:text-base whitespace-nowrap">
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
