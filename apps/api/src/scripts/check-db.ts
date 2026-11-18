
import { prisma } from "../config/database.js";

async function checkDatabaseConnection(): Promise<void> {
  try {
    await prisma.$connect();

    const result = await prisma.$queryRaw<
      Array<{ current_database: string }>
    >`SELECT current_database()`;

    console.log("Database connected successfully!");
    console.log("Connected database:", result[0]?.current_database);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseConnection().catch((error: unknown) => {
  console.error("Unexpected database test error:", error);
  process.exitCode = 1;
});
