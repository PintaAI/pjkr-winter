import { SurveyForm } from "@/components/survey/survey-form";

export default function SurveyPage() {
  return (
    <main className="container min-h-screen flex items-center justify-center">
      <div className="w-full mx-auto max-w-2xl py-8">
        <SurveyForm />
      </div>
    </main>
  );
}
