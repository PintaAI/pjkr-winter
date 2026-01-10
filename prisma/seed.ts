import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Hash the password
  const hashedPassword = await bcrypt.hash("12345678", 10);

  // Create or update admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: {
      password: hashedPassword,
      role: "PANITIA",
      name: "Admin",
    },
    create: {
      email: "admin@admin.com",
      password: hashedPassword,
      role: "PANITIA",
      name: "Admin",
    },
  });

  console.log("Admin user created/updated:", admin);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
