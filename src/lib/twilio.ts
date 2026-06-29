import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const isTwilioConfigured = !!(accountSid && authToken && twilioPhone);

let twilioClient: twilio.Twilio | null = null;
if (isTwilioConfigured) {
  twilioClient = twilio(accountSid, authToken);
} else {
  console.warn("Warning: Twilio environment variables are missing. Using mock SMS fallback.");
}

/**
 * Programmatically sends a Proof-of-Work text message to the customer.
 */
export async function sendProofOfWorkSMS(customerPhone: string, customerName: string, photoUrl: string) {
  try {
    const messageBody = `Hello ${customerName}, your bins have been securely returned by CurbSitter. View your service confirmation here: ${photoUrl}`;

    console.log(`--- DISPATCHING SMS TELEMETRY ---`);
    console.log(`To: ${customerPhone}`);
    console.log(`Body: "${messageBody}"`);

    if (isTwilioConfigured && twilioClient) {
      const response = await Promise.race([
        twilioClient.messages.create({
          body: messageBody,
          from: twilioPhone,
          to: customerPhone,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Twilio API request timed out after 10 seconds")), 10000)
        )
      ]);
      console.log(`[TWILIO SUCCESS] Message SID: ${response.sid}`);
      return { success: true, sid: response.sid };
    } else {
      console.log(`[TWILIO MOCK SUCCESS] SMS sent to ${customerPhone} (Twilio not configured)`);
      return { success: true, isMock: true };
    }
  } catch (err) {
    console.error("[TWILIO DISPATCH ERROR] Failed to send SMS:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown Twilio API failure" };
  }
}
