import { searchCustomerInfo } from './pineconeService';
import { logger } from '../utils/logger';

export interface CallContext {
  isExistingCustomer: boolean;
  customer?: {
    name: string;
    phoneNumber: string;
    content: string; // All the customer data in one field
  };
  contextInstructions?: string;
}

/**
 * Lookup customer information when a call comes in
 * This should be called before the AI receptionist starts speaking
 */
export async function lookupCallerContext(
  businessId: string,
  callerPhoneNumber: string
): Promise<CallContext> {
  try {
    logger.info('Looking up caller context', { businessId, callerPhoneNumber });

    // Search for customer in CRM
    const searchResults = await searchCustomerInfo(businessId, callerPhoneNumber, 1);
    
    if (searchResults.length === 0) {
      logger.info('No customer found for phone number', { callerPhoneNumber });
      return {
        isExistingCustomer: false
      };
    }

    // Get the best match (highest score)
    const customerData = searchResults[0];
    if (!customerData) {
      logger.info('No customer data found in search results', { callerPhoneNumber });
      return {
        isExistingCustomer: false
      };
    }

    const metadata = customerData.metadata;

    // Extract customer information from metadata - simplified to just the essentials
    const customer = {
      name: metadata?.name as string || 'Unknown',
      phoneNumber: metadata?.phoneNumber as string || callerPhoneNumber,
      content: metadata?.originalContent as string || customerData.content || ''
    };

    // Generate context instructions for the AI receptionist
    const contextInstructions = generateContextInstructions(customer);

    logger.info('Customer found', { 
      businessId, 
      callerPhoneNumber, 
      customerName: customer.name,
      contentLength: customer.content.length
    });

    return {
      isExistingCustomer: true,
      customer,
      contextInstructions
    };

  } catch (error) {
    logger.error('Error looking up caller context:', error);
    // Return default context on error to not break the call flow
    return {
      isExistingCustomer: false
    };
  }
}

/**
 * Generate AI receptionist instructions based on customer data
 */
function generateContextInstructions(customer: CallContext['customer']): string {
  if (!customer) return '';

  const instructions = [
    `CUSTOMER CONTEXT: This is ${customer.name}, an existing customer.`,
    `Phone: ${customer.phoneNumber}`,
    '',
    'CUSTOMER DATA:',
    customer.content,
    '',
    'INSTRUCTIONS:',
    "- Greet them by name: \"Hello " + (customer.name.split(' ')[0] || 'there') + "\"",
    "- Acknowledge their customer status: \"Happy to hear from you again\"",
    "- Use the customer data above to provide personalized service",
    "- Reference their order history, preferences, and details when relevant",
    "- Be more personalized and familiar since they're an existing customer",
    "- If they're a VIP customer, provide premium service",
    ''
  ];

  return instructions.join('\n');
}

/**
 * Generate a quick customer summary for logging
 */
export function generateCustomerSummary(customer: CallContext['customer']): string {
  if (!customer) return 'New customer';
  
  return `${customer.name} - ${customer.content.substring(0, 100)}...`;
}
