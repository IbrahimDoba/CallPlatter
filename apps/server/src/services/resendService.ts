import { Resend } from "resend";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Email templates
export const emailTemplates = {
  waitlistConfirmation: (email: string) => `
    <!DOCTYPE html>
     <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to DailZero</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 30px 40px;">
                    <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 600; color: #111827; letter-spacing: -0.5px;">You're on the list! 🎉</h1>
                    <p style="margin: 0; font-size: 15px; color: #6b7280; line-height: 1.5;">Thanks for joining the DailZero waitlist</p>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 0 40px 30px 40px;">
                    <p style="margin: 0 0 20px 0; font-size: 15px; color: #374151; line-height: 1.6;">
                      Hi there,
                    </p>
                    <p style="margin: 0 0 20px 0; font-size: 15px; color: #374151; line-height: 1.6;">
                      Thanks for your interest in DailZero. We're building Nigeria's smartest AI receptionist, and you'll be among the first to know when we launch.
                    </p>
                    <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.6;">
                      We'll keep you updated on our progress and let you know as soon as we're ready for early access.
                    </p>
                  </td>
                </tr>

                <!-- Benefits Section -->
                <tr>
                  <td style="padding: 0 40px 30px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 20px; background-color: #f9fafb; border-left: 3px solid #667eea;">
                          <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #111827;">What you'll get:</p>
                          <p style="margin: 0 0 8px 0; font-size: 14px; color: #4b5563; line-height: 1.5;">→ Early access before public launch</p>
                          <p style="margin: 0 0 8px 0; font-size: 14px; color: #4b5563; line-height: 1.5;">→ Special pricing for early adopters</p>
                          <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.5;">→ Direct line to our team for feedback</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td style="padding: 0 40px 40px 40px;" align="center">
                    <a href="https://dailzero.com" style="display: inline-block; padding: 14px 32px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 500;">
                      Learn More About DailZero
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 12px 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
                      Expected launch: Q2 2025
                    </p>
                    <p style="margin: 0 0 16px 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
                      Questions? Reply to this email or reach out at <a href="mailto:info@dailzero.com" style="color: #667eea; text-decoration: none;">info@dailzero.com</a>
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                      <a href="https://twitter.com/Dobaibrahim" style="color: #6b7280; text-decoration: none; margin-right: 16px;">Twitter</a>
                      <a href="https://dailzero.com" style="color: #6b7280; text-decoration: none;">Website</a>
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `,
};

// Helper function to add contact to Resend audience
export const addToAudience = async (data: { email: string }) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is required");
    }

    // Check if audience ID is provided
    if (!process.env.RESEND_AUDIENCE_ID) {
      return { success: false, error: "No audience ID configured" };
    }

    // Add contact to Resend audience using the exact format from docs
    const audienceResult = await resend.contacts.create({
      email: data.email,
      audienceId: process.env.RESEND_AUDIENCE_ID,
      unsubscribed: false,
    });

    return { success: true, contactId: audienceResult.data?.id };
  } catch (error) {
    console.error("Resend audience error:", error);
    // Don't throw error for audience - email sending is more important
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Helper function to send waitlist confirmation email
export const sendWaitlistConfirmation = async (data: { email: string }) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is required");
    }

    // First, add to audience
    const audienceResult = await addToAudience(data);

    // Then send the email
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "DailZero <noreply@dailzero.com>",
      to: [data.email],
      subject: "Welcome to DailZero Waitlist! 🎉",
      html: emailTemplates.waitlistConfirmation(data.email),
    });

    return {
      success: true,
      messageId: result.data?.id || "unknown",
      audienceAdded: audienceResult.success,
      contactId: audienceResult.contactId,
    };
  } catch (error) {
    console.error("Resend email error:", error);
    throw error;
  }
};
