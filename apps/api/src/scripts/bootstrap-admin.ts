
import { prisma } from "../config/database.js";
import { hashPassword } from "../utils/password.js";

async function bootstrapAdmin(): Promise<void> {
  try {
    const organizationName = process.env.FIELDOPS_ORG_NAME?.trim();
    const adminName = process.env.FIELDOPS_ADMIN_NAME?.trim();
    const adminEmail = process.env.FIELDOPS_ADMIN_EMAIL
      ?.trim()
      .toLowerCase();
    const adminPassword = process.env.FIELDOPS_ADMIN_PASSWORD;

    if (
      !organizationName ||
      !adminName ||
      !adminEmail ||
      !adminPassword
    ) {
      throw new Error("Missing bootstrap environment variables");
    }

    if (adminPassword.length < 12) {
      throw new Error("Admin password must contain at least 12 characters");
    }

    // Prevent accidental duplicate administrator creation.
    const existingUser = await prisma.user.findUnique({
      where: {
        email: adminEmail,
      },
    });

    if (existingUser) {
      throw new Error(
        "An account with this email already exists. Bootstrap cancelled."
      );
    }

    // Hash the password before storing it.
    const passwordHash = await hashPassword(adminPassword);

    // Create organization, user and membership atomically.
    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
        },
      });

      const user = await tx.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          passwordHash,
          status: "ACTIVE",
        },
      });

      const membership = await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: "ADMIN",
        },
      });

      return {
        organization,
        user,
        membership,
      };
    });

    console.log("FieldOps bootstrap completed successfully!");
    console.log("Organization:", result.organization.name);
    console.log("Admin:", result.user.email);
    console.log("Role:", result.membership.role);
  } catch (error) {
    console.error("FieldOps bootstrap failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

bootstrapAdmin();
