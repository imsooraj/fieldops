
export type InvitationStatus =
  | "PENDING"
  | "EXPIRED"
  | "ACCEPTED"
  | "REVOKED";

export interface InvitationValidationData {
  expiresAt: Date;
  acceptedAt: Date | null;
  revokedAt: Date | null;
}

export function getInvitationStatus(
  invitation: InvitationValidationData
): InvitationStatus {
  try {
    if (
      !(invitation.expiresAt instanceof Date) ||
      Number.isNaN(invitation.expiresAt.getTime())
    ) {
      throw new Error("Invalid invitation expiration date");
    }

    if (invitation.revokedAt !== null) {
      return "REVOKED";
    }

    if (invitation.acceptedAt !== null) {
      return "ACCEPTED";
    }

    if (invitation.expiresAt.getTime() <= Date.now()) {
      return "EXPIRED";
    }

    return "PENDING";
  } catch (error) {
    console.error("Invitation status validation failed:", error);
    throw new Error("Unable to validate invitation status");
  }
}
