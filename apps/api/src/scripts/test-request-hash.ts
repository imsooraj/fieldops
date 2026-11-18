
import { generateRequestHash } from "../utils/request-hash.js";

async function testRequestHash(): Promise<void> {
  try {
    const payloadA = {
      workOrderId: "wo-123",
      notes: "AC repair completed",
    };

    const payloadB = {
      notes: "AC repair completed",
      workOrderId: "wo-123",
    };

    const payloadC = {
      workOrderId: "wo-123",
      notes: "Different repair details",
    };

    const hashA = generateRequestHash(payloadA);
    const hashB = generateRequestHash(payloadB);
    const hashC = generateRequestHash(payloadC);

    console.log("Hash A:", hashA);
    console.log("Hash B:", hashB);
    console.log("Hash C:", hashC);

    console.log("A and B match:", hashA === hashB);
    console.log("A and C match:", hashA === hashC);
  } catch (error) {
    console.error("Request hash test failed:", error);
  }
}

testRequestHash();
