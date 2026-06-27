import { PrismaClient } from "@prisma/client";
import { seedMockData } from "../lib/seed";

const prisma = new PrismaClient();

async function main() {
  const result = await seedMockData(prisma);
  console.log("Seed complete:", result.summary);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });