
import { createServiceReportSchema } from "../validators/service-reports.validator.js";

async function testServiceReportValidator(): Promise<void> {
  try {
    const validPayload = {
      notes: "AC filter cleaned and cooling performance verified.",
    };

    const invalidPayload = {
      notes: "Done",
    };

    const validResult = createServiceReportSchema.safeParse(validPayload);
    const invalidResult = createServiceReportSchema.safeParse(invalidPayload);

    console.log("Valid payload:", validResult.success);
    console.log("Invalid payload:", invalidResult.success);

    if (!invalidResult.success) {
      console.log(
        "Validation errors:",
        invalidResult.error.flatten()
      );
    }
  } catch (error) {
    console.error("Service report validator test failed:", error);
  }
}

testServiceReportValidator();
