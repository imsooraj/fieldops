
import {
  generateInvitationToken,
  hashInvitationToken,
  verifyInvitationToken,
} from "../utils/invitation-token.js";

async function testInvitationToken(): Promise<void> {
  try {
    const token = generateInvitationToken();

    const tokenHash = hashInvitationToken(token);

    const validToken = verifyInvitationToken(token, tokenHash);

    const invalidToken = verifyInvitationToken(
      "incorrect-token",
      tokenHash
    );

    console.log("Token generated:", Boolean(token));
    console.log("Token length:", token.length);
    console.log("Hash length:", tokenHash.length);
    console.log("Valid token:", validToken);
    console.log("Invalid token:", invalidToken);
  } catch (error) {
    console.error("Invitation token test failed:", error);
    process.exitCode = 1;
  }
}

testInvitationToken();
