
import { WorkOrderStatus } from "../generated/prisma/client.js";

import { canTransitionWorkOrderStatus } from "../utils/work-order-workflow.js";

async function testWorkOrderWorkflow() {
  try {
    const testCases = [
      {
        current: WorkOrderStatus.CREATED,
        next: WorkOrderStatus.ASSIGNED,
        expected: true,
      },
      {
        current: WorkOrderStatus.ASSIGNED,
        next: WorkOrderStatus.ACCEPTED,
        expected: true,
      },
      {
        current: WorkOrderStatus.CREATED,
        next: WorkOrderStatus.APPROVED,
        expected: false,
      },
      {
        current: WorkOrderStatus.APPROVED,
        next: WorkOrderStatus.IN_PROGRESS,
        expected: false,
      },
      {
        current: WorkOrderStatus.IN_PROGRESS,
        next: WorkOrderStatus.ON_HOLD,
        expected: true,
      },
    ];

    for (const testCase of testCases) {
      const actual = canTransitionWorkOrderStatus(
        testCase.current,
        testCase.next
      );

      const passed = actual === testCase.expected;

      console.log({
        transition: `${testCase.current} → ${testCase.next}`,
        expected: testCase.expected,
        actual,
        result: passed ? "PASS" : "FAIL",
      });
    }
  } catch (error) {
    console.error("Workflow tests failed:", error);
    throw error;
  }
}

testWorkOrderWorkflow().catch((error) => {
  console.error("Test script execution failed:", error);
  process.exitCode = 1;
});
