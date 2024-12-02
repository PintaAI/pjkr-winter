import { PrismaClient, BusType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed data bus
  const buses = [
    {
      tipe: BusType.BUS_1,
      namaBus: 'Bus Ekonomi',
      harga: 50000,
      kapasitas: 40
    },
    {
      tipe: BusType.BUS_2,
      namaBus: 'Bus Bisnis',
      harga: 75000,
      kapasitas: 40
    },
    {
      tipe: BusType.BUS_3,
      namaBus: 'Bus Eksekutif',
      harga: 100000,
      kapasitas: 40
    }
  ]

  for (const bus of buses) {
    await prisma.bus.upsert({
      where: { tipe: bus.tipe },
      update: bus,
      create: bus
    })
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
