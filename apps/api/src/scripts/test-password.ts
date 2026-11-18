import {
  hashPassword,
  verifyPassword,
} from "../utils/password.js";

async function testPassword(): Promise<void> {
  try {
    const password = "FieldOps@123";

    // Generate password hash
    const hashedPassword = await hashPassword(password);    

    console.log("Password hashed successfully");
    console.log("Hash generated:", Boolean(hashedPassword));

    // Verify correct password
    const isValid = await verifyPassword(password, hashedPassword);

    console.log("Correct password:", isValid);

    // Verify incorrect password
    const isInvalid = await verifyPassword(
      "WrongPassword@123",
      hashedPassword
    );

    console.log("Incorrect password:", isInvalid);
  } catch (error) {
    console.error("Password test failed:", error);
    process.exitCode = 1;
  }
}

testPassword();