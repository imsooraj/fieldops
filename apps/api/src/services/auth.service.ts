
import { prisma } from "../config/database.js";
import { verifyPassword } from "../utils/password.js";
import { createSession } from "./sessions.service.js";

interface LoginInput {
  email: string;
  password: string;
}

export async function login(input: LoginInput) {
  try {
    // 1. Normalize the email before searching.
    const email = input.email.trim().toLowerCase();

    // 2. Find the user and their organization memberships.
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        memberships: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // 3. Use the same result for unknown and inactive users.
    if (!user || user.status !== "ACTIVE") {
      return null;
    }

    // 4. Verify the submitted password against the stored hash.
    const isPasswordValid = await verifyPassword(
      input.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return null;
    }

    // 5. Create a database session after successful verification.
    const { session, token } = await createSession({
      userId: user.id,
    });

    // 6. Return safe user data, memberships and the token.
    // The controller will put the token in an HttpOnly cookie.
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      memberships: user.memberships.map((membership) => ({
        id: membership.id,
        role: membership.role,
        organization: membership.organization,
      })),
      session,
      token,
    };
  } catch (error) {
    console.error("Login service failed:", error);
    throw new Error("Unable to log in");
  }
}
