
import { prisma } from "../config/database.js";
import { generateSecureToken, hashToken } from "../utils/secure-token.js";

const SESSION_DURATION_DAYS = 7;

interface CreateSessionInput {
  userId: string;
}

export async function createSession(input: CreateSessionInput) {
  try {
    if (!input.userId) {
      throw new Error("User ID is required");
    }

    // Generate a random token for the browser cookie.
    const token = generateSecureToken();

    // Store only the hash in PostgreSQL.
    const tokenHash = hashToken(token);

    const expiresAt = new Date(
      Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
    );

    const session = await prisma.session.create({
      data: {
        userId: input.userId,
        tokenHash,
        expiresAt,
      },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    return {
      session,
      token,
    };
  } catch (error) {
    console.error("Session creation failed:", error);
    throw new Error("Unable to create session");
  }
}


export async function revokeSession(token: string) {
  try {
    if (!token) {
      return;
    }

    const tokenHash = hashToken(token);

    await prisma.session.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Session revocation failed:", error);
    throw new Error("Unable to revoke session");
  }
}

