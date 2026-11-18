
import {
  randomBytes,
  createHash,
  timingSafeEqual,
} from "node:crypto";

export function generateSecureToken(): string {
  try {
    return randomBytes(32).toString("hex");
  } catch (error) {
    console.error("Secure token generation failed:", error);
    throw new Error("Unable to generate secure token");
  }
}

export function hashToken(token: string): string {
  try {
    if (!token || typeof token !== "string") {
      throw new Error("A valid token is required");
    }

    return createHash("sha256")
      .update(token)
      .digest("hex");
  } catch (error) {
    console.error("Token hashing failed:", error);
    throw new Error("Unable to hash token");
  }
}

export function verifyToken(
  token: string,
  storedHash: string
): boolean {
  try {
    if (
      !token ||
      !storedHash ||
      !/^[a-f0-9]{64}$/i.test(storedHash)
    ) {
      return false;
    }

    const tokenHash = hashToken(token);

    return timingSafeEqual(
      Buffer.from(tokenHash, "hex"),
      Buffer.from(storedHash, "hex")
    );
  } catch (error) {
    console.error("Token verification failed:", error);
    throw new Error("Unable to verify token");
  }
}
