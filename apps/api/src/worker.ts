import { processPendingOutboxEvents } from "./workers/outbox.worker.js";

const POLLING_INTERVAL = 5000;

async function startWorker(): Promise<void> {
  try {
    console.log("FieldOps Outbox Worker started");

    while (true) {
      await processPendingOutboxEvents();

      await new Promise<void>((resolve) => {
        setTimeout(resolve, POLLING_INTERVAL);
      });
    }
  } catch (error) {
    console.error("Outbox worker stopped unexpectedly:", error);
    process.exitCode = 1;
  }
}

void startWorker();