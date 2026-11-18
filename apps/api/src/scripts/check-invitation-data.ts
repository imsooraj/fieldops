
import { prisma } from "../config/database.js";

async function checkInvitationData(): Promise<void> {
  try {
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const memberships = await prisma.membership.findMany({
      select: {
        id: true,
        userId: true,
        organizationId: true,
        role: true,
      },
    });

    console.log("Organizations:", organizations);
    console.log("Users:", users);
    console.log("Memberships:", memberships);
  } catch (error) {
    console.error("Failed to inspect invitation data:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

checkInvitationData();
