import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

export function TermsAndConditions() {
  return (
    <Card className="w-full">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">Syarat & Ketentuan</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[250px] sm:h-[400px] w-full rounded-md">
          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 text-sm sm:text-base">
            <div className="space-y-2">
              <p>Peserta wajib tiba di lokasi titik pertemuan sebelum pukul 07.30 pagi untuk memastikan keberangkatan tepat waktu.</p>
              <p>Peserta diwajibkan membawa dokumen identitas diri yang sah untuk verifikasi jika dibutuhkan.</p>
              <p>Tiket masuk harus dijaga dengan baik. Kehilangan tiket akan dikenakan denda yang menjadi tanggung jawab peserta.</p>
              <p>Barang bawaan pribadi adalah tanggung jawab masing-masing peserta. Panitia tidak bertanggung jawab atas kehilangan atau kerusakan barang pribadi.</p>
              <p>Peserta diharapkan menjaga keselamatan diri sendiri selama acara berlangsung. Panitia tidak bertanggung jawab secara finansial atas kecelakaan atau cedera yang mungkin terjadi.</p>
              <p>Peserta yang terlambat dan tidak tiba di lokasi keberangkatan sesuai jadwal yang telah ditetapkan akan dianggap batal. Biaya yang telah dibayarkan tidak dapat dikembalikan.</p>
              <p>Semua peserta wajib mengikuti instruksi panitia selama acara berlangsung demi kelancaran dan keamanan bersama.</p>
              <p>Peserta diimbau membawa obat-obatan pribadi jika diperlukan untuk keadaan darurat.</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-semibold">Catatan Penting (NOTE):</h3>
              <ul className="list-disc pl-4 sm:pl-6 space-y-2">
                <li>Batas waktu pendaftaran adalah H-14 sebelum acara, yaitu pada hari Minggu, 15 Januari 2025.</li>
                <li>Pembatalan dengan pengembalian dana (refund) dapat dilakukan paling lambat H-14, yaitu pada hari Rabu, 15 Januari 2025.</li>
                <li>Peserta disarankan membawa sarung tangan pribadi, karena panitia tidak menyediakan perlengkapan tersebut.</li>
                <li>Siapkan uang koin untuk menggunakan fasilitas loker penyimpanan dan charger station di lokasi acara.</li>
                <li>Disarankan membawa baju ganti untuk kenyamanan setelah aktivitas.</li>
                <li>Harap membaca dan memahami seluruh ketentuan ini sebelum mengikuti acara.</li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
