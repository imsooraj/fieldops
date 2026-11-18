
import {
  randomBytes,
  createHash,
  timingSafeEqual,
} from "node:crypto";

export function generateInvitationToken(): string {
  try {
    return randomBytes(32).toString("hex");
  } catch (error) {
    console.error("Invitation token generation failed:", error);
    throw new Error("Unable to generate invitation token");
  }
}

export function hashInvitationToken(token: string): string {
  try {
    if (!token || typeof token !== "string") {
      throw new Error("A valid invitation token is required");
    }

    return createHash("sha256")
      .update(token)
      .digest("hex");
  } catch (error) {
    console.error("Invitation token hashing failed:", error);
    throw new Error("Unable to hash invitation token");
  }
}

export function verifyInvitationToken(
  token: string,
  storedTokenHash: string
): boolean {
  try {
    if (
      !token ||
      !storedTokenHash ||
      !/^[a-f0-9]{64}$/i.test(storedTokenHash)
    ) {
      return false;
    }

    const tokenHash = hashInvitationToken(token);

    return timingSafeEqual(
      Buffer.from(tokenHash, "hex"),
      Buffer.from(storedTokenHash, "hex")
    );
  } catch (error) {
    console.error("Invitation token verification failed:", error);
    throw new Error("Unable to verify invitation token");
  }
}
