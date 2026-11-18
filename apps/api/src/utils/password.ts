import argon2 from "argon2";

export async function hashPassword(password: string): Promise<string> {
  try {
    const hashedPassword = await argon2.hash(password);
    return hashedPassword;
  } catch (error) {
    console.error("Password hashing failed:", error);
    throw new Error("Unable to process password");
  }
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    return await argon2.verify(hashedPassword, password);
  } catch (error) {
    console.error("Password verification failed:", error);
    throw new Error("Unable to verify password");
  }
}