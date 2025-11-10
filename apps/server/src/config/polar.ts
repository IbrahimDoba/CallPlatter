import { Polar } from "@polar-sh/sdk";

// Initialize Polar client only if access token is provided
let polar: Polar | null = null;

if (process.env.POLAR_ACCESS_TOKEN) {
  try {
    polar = new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      server: process.env.POLAR_SERVER === "production" ? "production" : "sandbox",
    });
    console.log("✅ Polar SDK initialized successfully");
  } catch (error) {
    console.warn("Failed to initialize Polar SDK:", error);
  }
} else {
  console.warn("POLAR_ACCESS_TOKEN not set. Polar metering features will be disabled.");
}

export { polar };

// Helper function to check if Polar is available
export function isPolarAvailable(): boolean {
  return polar !== null;
}

// Helper function to ingest meter events
export async function ingestMeterEvent(
  eventName: string,
  externalCustomerId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  if (!polar) {
    console.warn("Polar SDK not initialized. Skipping meter event ingestion.");
    return;
  }

  try {
    await polar.events.ingest({
      events: [
        {
          name: eventName,
          externalCustomerId,
          metadata: (metadata || {}) as Record<string, string | number | boolean>,
        },
      ],
    });
    console.log(`✅ Meter event ingested: ${eventName} for customer ${externalCustomerId}`);
  } catch (error) {
    console.error(`❌ Error ingesting meter event ${eventName}:`, error);
    // Don't throw - we don't want meter failures to break call tracking
  }
}

