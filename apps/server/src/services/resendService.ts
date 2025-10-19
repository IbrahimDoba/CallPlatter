import { Resend } from "resend";

// Lazy initialization of Resend client
let resend: Resend | null = null;

const getResendClient = (): Resend => {
  if (!resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

// Email templates
export const emailTemplates = {
  // OTP Verification Email Template
  otpVerification: (otp: string, businessName: string) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fafafa;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 4px;">
              
              <tr>
                <td style="padding: 48px 32px 32px 32px;">
                  <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 600; color: #1a1a1a;">
                    Hey there 👋
                  </h1>
                  <p style="margin: 0 0 24px 0; font-size: 15px; color: #525252; line-height: 1.6;">
                    Thanks for signing up with ${businessName}. Here's your verification code:
                  </p>
                  
                  <div style="background-color: #f5f5f5; padding: 24px; border-radius: 4px; text-align: center; margin: 0 0 24px 0;">
                    <div style="font-size: 36px; font-weight: 600; color: #1a1a1a; letter-spacing: 6px; font-family: 'SF Mono', Consolas, monospace;">
                      ${otp}
                    </div>
                  </div>
                  
                  <p style="margin: 0 0 24px 0; font-size: 14px; color: #737373; line-height: 1.6;">
                    This code expires in 5 minutes. If you didn't request this, just ignore this email.
                  </p>
                  
                  <div style="border-left: 2px solid #fbbf24; padding-left: 16px; margin: 24px 0 0 0;">
                    <p style="margin: 0; font-size: 13px; color: #a16207; line-height: 1.5;">
                      Never share this code. We'll never ask for it over email or phone.
                    </p>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding: 24px 32px; background-color: #fafafa; border-top: 1px solid #f0f0f0;">
                  <p style="margin: 0; font-size: 13px; color: #a3a3a3; line-height: 1.5;">
                    Questions? Just reply to this email or contact us at 
                    <a href="mailto:support@dailzero.com" style="color: #525252; text-decoration: underline;">support@dailzero.com</a>
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

  // Email Verification Success Template
  emailVerifiedSuccess: (businessName: string) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You're all set!</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fafafa;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 4px;">
              
              <tr>
                <td style="padding: 48px 32px 32px 32px;">
                  <div style="width: 48px; height: 48px; background-color: #10b981; border-radius: 50%; margin: 0 0 24px 0; display: inline-flex; align-items: center; justify-content: center;">
                    <span style="color: white; font-size: 24px; line-height: 0;">✓</span>
                  </div>
                  
                  <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 600; color: #1a1a1a;">
                    You're all set!
                  </h1>
                  
                  <p style="margin: 0 0 32px 0; font-size: 15px; color: #525252; line-height: 1.6;">
                    Your email is verified and your ${businessName} account is ready. Let's get you started.
                  </p>
                  
                  <a href="https://dailzero.com/signin" style="display: inline-block; padding: 12px 24px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: 500;">
                    Go to Dashboard
                  </a>
                </td>
              </tr>

              <tr>
                <td style="padding: 0 32px 32px 32px;">
                  <div style="background-color: #fafafa; padding: 20px; border-radius: 4px;">
                    <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 500; color: #1a1a1a;">
                      Quick start guide:
                    </p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #525252; line-height: 1.5;">
                      • Set up your business profile
                    </p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #525252; line-height: 1.5;">
                      • Configure your AI receptionist
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #525252; line-height: 1.5;">
                      • Take your first AI-assisted call
                    </p>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding: 24px 32px; background-color: #fafafa; border-top: 1px solid #f0f0f0;">
                  <p style="margin: 0 0 8px 0; font-size: 13px; color: #a3a3a3; line-height: 1.5;">
                    Need help? Check our <a href="https://dailzero.com/help" style="color: #525252; text-decoration: underline;">help center</a> or reply to this email.
                  </p>
                  <p style="margin: 0; font-size: 13px; color: #a3a3a3;">
                    <a href="mailto:support@dailzero.com" style="color: #525252; text-decoration: underline;">support@dailzero.com</a>
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

  // Password Reset OTP Email Template
  passwordResetOTP: (otp: string, businessName: string) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - ${businessName}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 30px 40px; text-align: center;">
                    <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 600; color: #111827; letter-spacing: -0.5px;">Reset Your Password</h1>
                    <p style="margin: 0; font-size: 15px; color: #6b7280; line-height: 1.5;">Complete your ${businessName} password reset</p>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 0 40px 30px 40px; text-align: center;">
                    <p style="margin: 0 0 20px 0; font-size: 15px; color: #374151; line-height: 1.6;">
                      Please enter the verification code below to reset your password:
                    </p>
                    
                    <!-- OTP Code Display -->
                    <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 20px; border-radius: 12px; margin: 20px 0;">
                      <div style="font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: 8px; font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;">
                        ${otp}
                      </div>
                    </div>
                    
                    <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280; line-height: 1.5;">
                      This code will expire in <strong>15 minutes</strong>
                    </p>
                  </td>
                </tr>

                <!-- Security Notice -->
                <tr>
                  <td style="padding: 0 40px 30px 40px;">
                    <div style="background-color: #fef2f2; border-left: 3px solid #dc2626; padding: 16px; border-radius: 6px;">
                      <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #dc2626;">Security Notice</p>
                      <p style="margin: 0; font-size: 13px; color: #dc2626; line-height: 1.5;">
                        If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 12px 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
                      This password reset request was made for your ${businessName} account.
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                      Questions? Reply to this email or reach out at <a href="mailto:support@dailzero.com" style="color: #667eea; text-decoration: none;">support@dailzero.com</a>
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

  // Password Reset Success Email Template
  passwordResetSuccess: (businessName: string) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Successful - ${businessName}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 30px 40px; text-align: center;">
                    <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                      <span style="color: white; font-size: 24px;">✓</span>
                    </div>
                    <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 600; color: #111827; letter-spacing: -0.5px;">Password Reset Successful!</h1>
                    <p style="margin: 0; font-size: 15px; color: #6b7280; line-height: 1.5;">Your ${businessName} password has been updated</p>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 0 40px 30px 40px; text-align: center;">
                    <p style="margin: 0 0 20px 0; font-size: 15px; color: #374151; line-height: 1.6;">
                      Your password has been successfully reset. You can now sign in with your new password.
                    </p>
                    
                    <!-- CTA Button -->
                    <a href="https://dailzero.com/signin" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 500; margin: 20px 0;">
                      Sign In to Your Account
                    </a>
                  </td>
                </tr>

                <!-- Security Notice -->
                <tr>
                  <td style="padding: 0 40px 30px 40px;">
                    <div style="background-color: #f0f9ff; border-left: 3px solid #0ea5e9; padding: 20px; border-radius: 6px;">
                      <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #0c4a6e;">Security Reminder</p>
                      <p style="margin: 0 0 8px 0; font-size: 14px; color: #0c4a6e; line-height: 1.5;">→ Keep your password secure and don't share it</p>
                      <p style="margin: 0 0 8px 0; font-size: 14px; color: #0c4a6e; line-height: 1.5;">→ Use a strong, unique password</p>
                      <p style="margin: 0; font-size: 14px; color: #0c4a6e; line-height: 1.5;">→ Contact support if you notice any suspicious activity</p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 12px 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
                      If you didn't make this change, please contact support immediately.
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                      Questions? Reply to this email or reach out at <a href="mailto:support@dailzero.com" style="color: #667eea; text-decoration: none;">support@dailzero.com</a>
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
    const audienceResult = await getResendClient().contacts.create({
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

// Helper function to send OTP verification email
export const sendOTPVerificationEmail = async (data: {
  email: string;
  otp: string;
  businessName: string;
}) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is required");
    }

    const result = await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL || "DailZero <noreply@dailzero.com>",
      to: [data.email],
      subject: `Verify Your Email - ${data.businessName}`,
      html: emailTemplates.otpVerification(data.otp, data.businessName),
    });

    return {
      success: true,
      messageId: result.data?.id || "unknown",
    };
  } catch (error) {
    console.error("Resend OTP email error:", error);
    throw error;
  }
};

// Helper function to send email verification success email
export const sendEmailVerifiedSuccess = async (data: {
  email: string;
  businessName: string;
}) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is required");
    }

    const result = await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL || "DailZero <noreply@dailzero.com>",
      to: [data.email],
      subject: `Email Verified - Welcome to ${data.businessName}!`,
      html: emailTemplates.emailVerifiedSuccess(data.businessName),
    });

    return {
      success: true,
      messageId: result.data?.id || "unknown",
    };
  } catch (error) {
    console.error("Resend success email error:", error);
    throw error;
  }
};

// Helper function to send password reset OTP email
export const sendPasswordResetOTP = async (data: {
  email: string;
  otp: string;
  businessName: string;
}) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is required");
    }

    const result = await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL || "DailZero <noreply@dailzero.com>",
      to: [data.email],
      subject: `Reset Your Password - ${data.businessName}`,
      html: emailTemplates.passwordResetOTP(data.otp, data.businessName),
    });

    return {
      success: true,
      messageId: result.data?.id || "unknown",
    };
  } catch (error) {
    console.error("Resend password reset OTP email error:", error);
    throw error;
  }
};

// Helper function to send password reset success email
export const sendPasswordResetSuccess = async (data: {
  email: string;
  businessName: string;
}) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is required");
    }

    const result = await getResendClient().emails.send({
      from: process.env.RESEND_FROM_EMAIL || "DailZero <noreply@dailzero.com>",
      to: [data.email],
      subject: `Password Reset Successful - ${data.businessName}`,
      html: emailTemplates.passwordResetSuccess(data.businessName),
    });

    return {
      success: true,
      messageId: result.data?.id || "unknown",
    };
  } catch (error) {
    console.error("Resend password reset success email error:", error);
    throw error;
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
    const result = await getResendClient().emails.send({
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
