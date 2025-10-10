import { Resend } from 'resend';
import { logger } from '../utils/logger';

interface CallSummaryEmailData {
  businessName: string;
  businessLogo?: string;
  phoneNumber: string;
  callDate: string;
  callTime: string;
  summary: string;
  transcription?: string;
  audioUrl?: string;
  callId: string;
  recipientEmail: string;
  siteUrl: string;
}

export class EmailService {
  private resend: Resend | null = null;

  constructor() {
    // Don't initialize Resend here - do it lazily in sendCallSummaryEmail
  }

  private getResendClient(): Resend {
    if (!this.resend) {
      if (!process.env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY environment variable is not set");
      }
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
    return this.resend;
  }

  private generateEmailHTML(data: CallSummaryEmailData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Call Summary - ${data.businessName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background-color: #f5f5f5;
            padding: 20px;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
        }

        .header {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }

        .header h1 {
            font-size: 26px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .header p {
            font-size: 14px;
            opacity: 0.9;
        }

        .info-grid {
            padding: 30px;
            background: #fafafa;
            border-bottom: 1px solid #e5e5e5;
        }

        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e5e5e5;
        }

        .info-item:last-child {
            border-bottom: none;
        }

        .info-label {
            font-weight: 500;
            color: #666;
            font-size: 14px;
        }

        .info-value {
            color: #1a1a1a;
            font-size: 14px;
            font-weight: 500;
        }

        .content {
            padding: 30px;
        }

        .section {
            margin-bottom: 30px;
        }

        .section:last-child {
            margin-bottom: 0;
        }

        .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .summary-box {
            background: #f8f9ff;
            border-left: 3px solid #6366f1;
            padding: 20px;
            border-radius: 6px;
            color: #374151;
            line-height: 1.7;
        }

        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            margin-top: 20px;
            font-size: 14px;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
        }

        .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(99, 102, 241, 0.3);
        }

        .transcript-box {
            background: #fafafa;
            border: 1px solid #e5e5e5;
            padding: 20px;
            border-radius: 6px;
            max-height: 300px;
            overflow-y: auto;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
            font-size: 13px;
            line-height: 1.6;
            color: #374151;
            white-space: pre-wrap;
        }

        .footer {
            background: #1a1a1a;
            color: #a3a3a3;
            padding: 30px;
            text-align: center;
            font-size: 13px;
            line-height: 1.8;
        }

        .footer a {
            color: #8b5cf6;
            text-decoration: none;
            transition: color 0.2s;
        }

        .footer a:hover {
            color: #a78bfa;
        }

        .footer-links {
            margin: 15px 0;
        }

        .footer-links a {
            margin: 0 10px;
        }

        .divider {
            color: #525252;
            margin: 0 8px;
        }

        @media (max-width: 640px) {
            body {
                padding: 10px;
            }

            .header {
                padding: 30px 20px;
            }

            .header h1 {
                font-size: 22px;
            }

            .info-grid,
            .content {
                padding: 20px;
            }

            .btn {
                display: block;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${data.businessName}</h1>
            <p>Call Summary Report</p>
        </div>

        <div class="info-grid">
            <div class="info-item">
                <span class="info-label">Phone Number</span>
                <span class="info-value">${data.phoneNumber}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Date</span>
                <span class="info-value">${data.callDate}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Time</span>
                <span class="info-value">${data.callTime}</span>
            </div>
        </div>

        <div class="content">
            <div class="section">
                <h2 class="section-title">
                    <span>📞</span>
                    <span>Call Summary</span>
                </h2>
                <div class="summary-box">
                    ${data.summary}
                </div>
                ${data.audioUrl ? `
                <a href="${data.siteUrl}/calls/${data.callId}" class="btn">
                    Listen to Recording
                </a>
                ` : ''}
            </div>

            ${data.transcription ? `
            <div class="section">
                <h2 class="section-title">
                    <span>📝</span>
                    <span>Transcription</span>
                </h2>
                <div class="transcript-box">${data.transcription}</div>
            </div>
            ` : ''}
        </div>

        <div class="footer">
            <p>This summary was automatically generated by your AI receptionist</p>
            <div class="footer-links">
                <a href="${data.siteUrl}">Dashboard</a>
                <span class="divider">•</span>
                <a href="${data.siteUrl}/calls">All Calls</a>
                <span class="divider">•</span>
                <a href="${data.siteUrl}/settings">Settings</a>
            </div>
            <p style="margin-top: 20px; color: #737373; font-size: 12px;">
                © ${new Date().getFullYear()} ${data.businessName}
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }

  async sendCallSummaryEmail(data: CallSummaryEmailData): Promise<boolean> {
    try {
      // Check if Resend API key is configured
      if (!process.env.RESEND_API_KEY) {
        logger.error("❌ RESEND_API_KEY not configured");
        return false;
      }

      const html = this.generateEmailHTML(data);
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@dailzero.com';
      
      logger.info("📧 Sending email", {
        from: fromEmail,
        to: data.recipientEmail,
        callId: data.callId,
        hasApiKey: !!process.env.RESEND_API_KEY
      });
      
      const result = await this.getResendClient().emails.send({
        from: `${data.businessName} <${fromEmail}>`,
        to: [data.recipientEmail],
        subject: `📞 Call Summary - ${data.businessName} (${data.callDate})`,
        html: html,
      });
      
      logger.info("✅ Call summary email sent successfully", {
        to: data.recipientEmail,
        callId: data.callId,
        messageId: result.data?.id,
        result: result
      });

      return true;
    } catch (error) {
      logger.error("❌ Error sending call summary email:", {
        error: error instanceof Error ? error.message : String(error),
        callId: data.callId,
        recipientEmail: data.recipientEmail,
        stack: error instanceof Error ? error.stack : undefined
      });
      return false;
    }
  }
}

export const emailService = new EmailService();
