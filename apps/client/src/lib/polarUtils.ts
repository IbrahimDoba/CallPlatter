import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Utility function to get customer information for Polar checkout
export const getCustomerInfo = async () => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }
  
  return {
    customerId: session.user.id,
    customerEmail: session.user.email,
    customerName: session.user.name,
    // Add any other customer metadata you want to pass to Polar
    metadata: {
      userId: session.user.id,
      // Remove createdAt as it's not available in session
      // Add any other relevant metadata
    }
  };
};

// Generate checkout URL with customer information
export const generateCheckoutUrl = (productId: string, customerInfo?: {
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  metadata?: Record<string, unknown>;
}) => {
  const baseUrl = '/checkout';
  const params = new URLSearchParams();
  
  params.append('products', productId);
  
  if (customerInfo) {
    if (customerInfo.customerId) {
      params.append('customerId', customerInfo.customerId);
    }
    if (customerInfo.customerEmail) {
      params.append('customerEmail', customerInfo.customerEmail);
    }
    if (customerInfo.customerName) {
      params.append('customerName', customerInfo.customerName);
    }
    if (customerInfo.metadata) {
      params.append('metadata', JSON.stringify(customerInfo.metadata));
    }
  }
  
  return `${baseUrl}?${params.toString()}`;
};
