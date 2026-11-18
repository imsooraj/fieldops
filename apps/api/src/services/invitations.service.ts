
import { prisma } from "../config/database.js";
import {
  generateInvitationToken,
  hashInvitationToken,
} from "../utils/invitation-token.js";

interface CreateInvitationInput {
  email: string;
  organizationId: string;
  invitedById: string;
  role: string;
}

export async function createInvitation(
  input: CreateInvitationInput
) {
  try {
    const email = input.email.trim().toLowerCase();

    if (!email || !input.organizationId || !input.invitedById || !input.role) {
      throw new Error("All invitation fields are required");
    }

    // Generate the raw token and its database-safe hash.
    const rawToken = generateInvitationToken();
    const tokenHash = hashInvitationToken(rawToken);

    // Invitation expires after 48 hours.
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + 48 * 60 * 60 * 1000
    );

    const invitation = await prisma.$transaction(async (tx) => {
      // Revoke previous pending invitations for this email
      // within the same organization.
      await tx.invitation.updateMany({
        where: {
          email,
          organizationId: input.organizationId,
          acceptedAt: null,
          revokedAt: null,
          expiresAt: {
            gt: now,
          },
        },
        data: {
          revokedAt: now,
        },
      });

      // Create the new invitation.
      return await tx.invitation.create({
        data: {
          email,
          organizationId: input.organizationId,
          invitedById: input.invitedById,
          role: input.role,
          tokenHash,
          expiresAt,
        },
        select: {
          id: true,
          email: true,
          organizationId: true,
          role: true,
          expiresAt: true,
          createdAt: true,
        },
      });
    });

    // Return the raw token only for the email delivery step.
    // Never return or expose tokenHash.
    return {
      invitation,
      token: rawToken,
    };
  } catch (error) {
    console.error("Invitation creation failed:", error);
    throw new Error("Unable to create invitation");
  }
}
