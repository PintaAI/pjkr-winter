"use client";

import type React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, Star } from "lucide-react";

const RATINGS = [1, 2, 3, 4, 5] as const;
const RATING_LABELS = {
  1: "Sangat Buruk",
  2: "Buruk",
  3: "Cukup",
  4: "Baik",
  5: "Sangat Baik"
} as const;
const HOW_DID_YOU_KNOW_OPTIONS = ["Instagram", "Tiktok", "Iklan", "teman", "Lainnya"];

export function SurveyForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  type FormData = {
    howDidYouKnow: string;
    eventRating: number;
    foodRating: number;
    serviceRating: number;
    merchandiseRating: number;
    feedback: string;
  };

  const [formData, setFormData] = useState<FormData>({
    howDidYouKnow: "",
    eventRating: 0,
    foodRating: 0,
    serviceRating: 0,
    merchandiseRating: 0,
    feedback: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.howDidYouKnow) {
        throw new Error("Mohon pilih bagaimana kamu mengetahui acara ini");
      }
      if (!formData.eventRating || !formData.foodRating || !formData.serviceRating || !formData.merchandiseRating) {
        throw new Error("Mohon berikan penilaian untuk semua aspek acara");
      }

      const response = await fetch("/api/survey/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Gagal mengirim survey");
      }

      alert("Terima kasih atas feedback Anda! Anda akan dialihkan ke halaman dokumentasi.");

      setTimeout(() => {
        window.location.href = "https://drive.google.com/drive/folders/1Px51HZIjnvWTRkdY9txfh694tbyMRFRQ?usp=sharing";
      }, 1500);
    } catch (error) {
      console.error("Error submitting survey:", error);
      alert(error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingChange = (field: string, value: number): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const progress =
    (Object.values(formData).filter((val) => (typeof val === "number" ? val > 0 : val !== "")).length / 6) * 100;

  return (
    <div className="min-h-screen  flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl overflow-hidden shadow-xl">
        <div className="bg-primary p-6 text-primary-foreground">
          <h1 className="text-2xl font-bold">Survei Kepuasan Acara</h1>
          <p className="text-primary-foreground/80">Kami menghargai umpan balik mu</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div className="space-y-2">
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-in-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            
          </div>

          <Alert className="bg-muted border-primary/20">
            <InfoIcon className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground">
              Sebelum melihat media dokumentasi, mohon isi survey singkat berikut untuk membantu kami meningkatkan
              kualitas acara.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-foreground">
                Bagaimana Kamu mengetahui tentang acara ini?
              </Label>
              <RadioGroup
                value={formData.howDidYouKnow}
                onValueChange={(value: string) => setFormData((prev) => ({ ...prev, howDidYouKnow: value }))}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                {HOW_DID_YOU_KNOW_OPTIONS.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="text-foreground">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {[
              { label: "Nilai pengalaman kamu secara keseluruhan", field: "eventRating" },
              { label: "Nilai kualitas makanan", field: "foodRating" },
              { label: "Nilai pelayanan panitia", field: "serviceRating" },
              { label: "Nilai kualitas merchandise", field: "merchandiseRating" },
            ].map(({ label, field }) => (
              <div key={field} className="space-y-4">
                <Label className="text-lg font-semibold text-foreground">{label}</Label>
                <div className="flex items-center space-x-2">
                  {RATINGS.map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => handleRatingChange(field, rating)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          rating <= (formData[field as keyof FormData] as number)
                            ? "text-accent fill-accent"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {(formData[field as keyof FormData] as number) > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {RATING_LABELS[formData[field as keyof FormData] as keyof typeof RATING_LABELS]}
                  </p>
                )}
              </div>
            ))}

            <div className="space-y-4">
              <Label htmlFor="feedback" className="text-lg font-semibold text-foreground">
                Kritik dan Saran
              </Label>
              <Textarea
                id="feedback"
                placeholder="Berikan kritik dan saran kamu untuk meningkatkan kualitas acara"
                value={formData.feedback}
                onChange={(e) => setFormData((prev) => ({ ...prev, feedback: e.target.value }))}
                className="min-h-[100px] border-input focus:border-primary focus:ring-primary"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Mengirim..." : "Lihat Media Dokumentasi"}
          </Button>
        </form>
      </Card>
      <p className="mt-4 text-sm text-muted-foreground">© 2025 PJKR. Semua hak dilindungi.</p>
    </div>
  );
}
