import { db } from "@/lib/db";
import { PesertaQR } from "@/components/dashboard/peserta-qr";
import { notFound } from "next/navigation";

interface QRPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getPeserta(id: string) {
  const peserta = await db.user.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!peserta || !peserta.name) {
    notFound();
  }

  return {
    id: peserta.id,
    name: peserta.name,
    email: peserta.email,
  };
}

export default async function QRPage(props: QRPageProps) {
  const params = await props.params;
  const peserta = await getPeserta(params.id);

  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 print:hidden">QR Code Peserta</h1>
        <PesertaQR peserta={peserta} />
      </div>
    </div>
  );
}
