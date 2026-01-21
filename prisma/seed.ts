import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  const adminPassword = await bcrypt.hash(`${process.env.PWSEEDADMIN}`, 12);
  const userPassword = await bcrypt.hash(`${process.env.PWSEEDUSER}`, 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@newsportal.com" },
    update: {},
    create: {
      fullName: "Admin",
      email: "admin@newsportal.com",
      password: adminPassword,
      birthYear: 2001,
      role: Role.ADMIN,
      isBlocked: false,
    },
  });

  console.log("Admin created:", admin.email);

  const user = await prisma.user.upsert({
    where: { email: "user@newsportal.com" },
    update: {},
    create: {
      fullName: "Test User",
      email: "user@newsportal.com",
      password: userPassword,
      birthYear: 2004,
      role: Role.USER,
      isBlocked: false,
    },
  });

  console.log("Test user created:", user.email);

  console.log("Status:");
  console.log("Seed completed! Login credentials:");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
