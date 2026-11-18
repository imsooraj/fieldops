
import { prisma } from "../config/database.js";
import { createInvitation } from "../services/invitations.service.js";
import {
  verifyInvitationToken,
} from "../utils/invitation-token.js";
import {
  getInvitationStatus,
} from "../utils/invitation-validation.js";

async function testInvitationService(): Promise<void> {
  try {
    // Find an existing organization and user for testing.
    const organization = await prisma.organization.findFirst();
    const user = await prisma.user.findFirst();

    if (!organization || !user) {
      throw new Error(
        "Create an organization and user before running this test"
      );
    }

    const result = await createInvitation({
      email: "technician-test@example.com",
      organizationId: organization.id,
      invitedById: user.id,
      role: "TECHNICIAN",
    });

    // Retrieve the invitation using its hashed token.
    const storedInvitation = await prisma.invitation.findUnique({
      where: {
        id: result.invitation.id,
      },
    });

    if (!storedInvitation) {
      throw new Error("Invitation was not saved");
    }

    const tokenIsValid = verifyInvitationToken(
      result.token,
      storedInvitation.tokenHash
    );

    const status = getInvitationStatus(storedInvitation);

    console.log("Invitation created:", Boolean(result.invitation.id));
    console.log("Token stored as hash:", storedInvitation.tokenHash !== result.token);
    console.log("Token verification:", tokenIsValid);
    console.log("Invitation status:", status);
    console.log("Invitation expires:", storedInvitation.expiresAt);
  } catch (error) {
    console.error("Invitation service test failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

testInvitationService();
