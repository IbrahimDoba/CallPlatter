import twilio from 'twilio';

export class TwilioService {
  private client: twilio.Twilio;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not found in environment variables');
    }
    
    this.client = twilio(accountSid, authToken);
  }

  /**
   * Get available phone numbers from Twilio with pagination
   */
  async getAvailableNumbers(countryCode = 'US', areaCode?: string, page = 1, limit = 10) {
    try {
      const availableNumbers = await this.client.availablePhoneNumbers(countryCode)
        .local
        .list({
          areaCode: areaCode ? Number.parseInt(areaCode, 10) : undefined,
          limit: limit,
          voiceEnabled: true,
          smsEnabled: true,
        });

      // Get total count for pagination info (this is approximate since Twilio doesn't provide exact counts)
      const totalCountResponse = await this.client.availablePhoneNumbers(countryCode)
        .local
        .list({
          areaCode: areaCode ? Number.parseInt(areaCode, 10) : undefined,
          limit: 1000, // Get a larger sample to estimate total
          voiceEnabled: true,
          smsEnabled: true,
        });

      const totalCount = totalCountResponse.length;
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      const numbers = availableNumbers.map(number => ({
        phoneNumber: number.phoneNumber,
        friendlyName: number.friendlyName,
        capabilities: number.capabilities,
        locality: number.locality,
        region: number.region,
      }));

      return {
        numbers,
        pagination: {
          currentPage: page,
          limit,
          totalPages,
          hasNextPage,
          hasPrevPage,
          totalCount
        }
      };
    } catch (error) {
      console.error('Error fetching available numbers:', error);
      throw new Error('Failed to fetch available phone numbers');
    }
  }

  /**
   * Purchase a phone number from Twilio
   */
  async purchaseNumber(phoneNumber: string, webhookUrl: string, friendlyName?: string) {
    try {
      const incomingNumber = await this.client.incomingPhoneNumbers.create({
        phoneNumber,
        voiceUrl: webhookUrl,
        smsUrl: webhookUrl,
        friendlyName: friendlyName || `Business Number - ${phoneNumber}`,
        voiceMethod: 'POST',
        smsMethod: 'POST',
      });

      return {
        sid: incomingNumber.sid,
        phoneNumber: incomingNumber.phoneNumber,
        friendlyName: incomingNumber.friendlyName,
        capabilities: incomingNumber.capabilities,
        voiceUrl: incomingNumber.voiceUrl,
        smsUrl: incomingNumber.smsUrl,
        accountSid: incomingNumber.accountSid,
      };
    } catch (error) {
      console.error('Error purchasing number:', error);
      throw new Error('Failed to purchase phone number');
    }
  }

  /**
   * Update webhook URL for existing number
   */
  async updateWebhookUrl(phoneNumberSid: string, webhookUrl: string) {
    try {
      const incomingNumber = await this.client.incomingPhoneNumbers(phoneNumberSid)
        .update({
          voiceUrl: webhookUrl,
          smsUrl: webhookUrl,
        });

      return incomingNumber;
    } catch (error) {
      console.error('Error updating webhook URL:', error);
      throw new Error('Failed to update webhook URL');
    }
  }

  /**
   * Get all purchased phone numbers
   */
  async getPurchasedNumbers() {
    try {
      const incomingNumbers = await this.client.incomingPhoneNumbers.list();
      return incomingNumbers.map(number => ({
        sid: number.sid,
        phoneNumber: number.phoneNumber,
        friendlyName: number.friendlyName,
        capabilities: number.capabilities,
        voiceUrl: number.voiceUrl,
        smsUrl: number.smsUrl,
      }));
    } catch (error) {
      console.error('Error fetching purchased numbers:', error);
      throw new Error('Failed to fetch purchased phone numbers');
    }
  }

  /**
   * Release a phone number
   */
  async releaseNumber(phoneNumberSid: string) {
    try {
      await this.client.incomingPhoneNumbers(phoneNumberSid).remove();
      return true;
    } catch (error) {
      console.error('Error releasing number:', error);
      throw new Error('Failed to release phone number');
    }
  }

  /**
   * Release phone number for a business (helper method)
   */
  async releaseBusinessPhoneNumber(businessId: string) {
    try {
      const { db } = await import("@repo/db");
      
      // Find the business and its phone number
      const business = await db.business.findUnique({
        where: { id: businessId },
        include: { phoneNumberRecord: true }
      });

      if (!business?.phoneNumberRecord?.twilioSid) {
        console.log(`No phone number to release for business ${businessId}`);
        return { success: true, message: 'No phone number assigned' };
      }

      // Release the phone number from Twilio
      await this.releaseNumber(business.phoneNumberRecord.twilioSid);

      // Update the phone number record in the database
      await db.phoneNumber.update({
        where: { id: business.phoneNumberRecord.id },
        data: {
          isAssigned: false,
          assignedTo: null,
          isActive: false,
        }
      });

      console.log(`Successfully released phone number ${business.phoneNumberRecord.number} for business ${businessId}`);
      return { 
        success: true, 
        message: `Phone number ${business.phoneNumberRecord.number} released successfully`,
        phoneNumber: business.phoneNumberRecord.number
      };
    } catch (error) {
      console.error('Error releasing business phone number:', error);
      throw new Error('Failed to release business phone number');
    }
  }
}

export const twilioService = new TwilioService();
