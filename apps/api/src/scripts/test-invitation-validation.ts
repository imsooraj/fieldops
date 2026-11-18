
import { getInvitationStatus } from "../utils/invitation-validation.js";

async function testInvitationValidation(): Promise<void> {
  try {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000);
    const pastDate = new Date(Date.now() - 60 * 60 * 1000);

    const pending = getInvitationStatus({
      expiresAt: futureDate,
      acceptedAt: null,
      revokedAt: null,
    });

    const expired = getInvitationStatus({
      expiresAt: pastDate,
      acceptedAt: null,
      revokedAt: null,
    });

    const accepted = getInvitationStatus({
      expiresAt: futureDate,
      acceptedAt: new Date(),
      revokedAt: null,
    });

    const revoked = getInvitationStatus({
      expiresAt: futureDate,
      acceptedAt: null,
      revokedAt: new Date(),
    });

    console.log("Pending invitation:", pending);
    console.log("Expired invitation:", expired);
    console.log("Accepted invitation:", accepted);
    console.log("Revoked invitation:", revoked);
  } catch (error) {
    console.error("Invitation validation test failed:", error);
    process.exitCode = 1;
  }
}

testInvitationValidation();
