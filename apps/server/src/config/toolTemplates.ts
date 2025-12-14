/**
 * Tool Templates
 *
 * Pre-configured tool templates that users can use as starting points
 * when creating custom tools for their AI agents.
 */

import type { ToolConfig } from "../services/elevenLabsToolService.js";

/**
 * WEBHOOK TOOL EXAMPLES
 * These tools call external HTTP endpoints
 */

export const WEBHOOK_TOOL_TEMPLATES = {
  /**
   * Check Transaction Status
   * Looks up transaction information from an external API
   */
  check_transaction_status: {
    type: "webhook",
    name: "check_transaction_status",
    description: `Looks up transaction status when customer reports payment issues. Use when customer mentions: failed transfer, missing money, transaction not received, or provides a transaction reference number.

ALWAYS ask for at least ONE identifier:
- Transaction reference number (most accurate)
- Phone number used for transfer
- Account number + date

Call this tool immediately after getting the identifier.`,
    api_schema: {
      url: "https://yourdomain.com/api/webhooks/transactions/status",
      method: "POST",
      content_type: "application/json",
      request_headers: {
        Authorization: "Bearer YOUR_API_KEY", // Replace with actual auth
      },
      request_body_schema: {
        type: "object",
        properties: {
          lookup_type: {
            type: "string",
            enum: ["reference_number", "phone_number", "account_number"],
            description: "How to search for the transaction",
          },
          lookup_value: {
            type: "string",
            description: "The identifier value (e.g., TRX123, 08012345678)",
          },
          business_id: {
            type: "string",
            is_system_provided: true,
          },
        },
        required: ["lookup_type", "lookup_value"],
      },
    },
  } as ToolConfig,

  /**
   * Check Account Balance
   * Retrieves customer account balance
   */
  check_account_balance: {
    type: "webhook",
    name: "check_account_balance",
    description: `Retrieves customer account balance. Use when customer asks: "what's my balance?", "how much do I have?", or wants to verify if payment reflected.

ALWAYS ask for phone number or account number first.`,
    api_schema: {
      url: "https://yourdomain.com/api/webhooks/accounts/balance",
      method: "POST",
      content_type: "application/json",
      request_headers: {
        Authorization: "Bearer YOUR_API_KEY",
      },
      request_body_schema: {
        type: "object",
        properties: {
          account_identifier: {
            type: "string",
            enum: ["phone_number", "account_number"],
            description: "Type of identifier",
          },
          identifier_value: {
            type: "string",
            description: "The identifier value",
          },
          include_pending: {
            type: "boolean",
            description: "Include pending transactions",
          },
        },
        required: ["account_identifier", "identifier_value"],
      },
    },
  } as ToolConfig,

  /**
   * Create Support Ticket
   * Creates a support ticket in external ticketing system
   */
  create_support_ticket: {
    type: "webhook",
    name: "create_support_ticket",
    description: `Creates a support ticket for non-urgent issues requiring human review. Use when: customer has a complaint, needs manual investigation, or issue cannot be resolved immediately.

DO NOT use for urgent issues - use transfer_to_agent instead.`,
    api_schema: {
      url: "https://yourdomain.com/api/webhooks/tickets/create",
      method: "POST",
      content_type: "application/json",
      request_headers: {
        Authorization: "Bearer YOUR_API_KEY",
      },
      request_body_schema: {
        type: "object",
        properties: {
          customer_phone: {
            type: "string",
            description: "Customer phone number",
          },
          customer_name: {
            type: "string",
            description: "Customer name",
          },
          issue_summary: {
            type: "string",
            description: "Brief description of the issue",
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Issue priority",
          },
        },
        required: ["customer_phone", "issue_summary", "priority"],
      },
    },
  } as ToolConfig,

  /**
   * Generic GET Request Example
   */
  fetch_data_example: {
    type: "webhook",
    name: "fetch_customer_info",
    description: "Fetches customer information from CRM",
    api_schema: {
      url: "https://yourdomain.com/api/customers/{customer_id}",
      method: "GET",
      query_params_schema: {
        properties: {
          include_history: {
            type: "boolean",
            description: "Include purchase history",
          },
        },
        required: [],
      },
    },
  } as ToolConfig,
};

/**
 * Note: Client and System tools have been removed.
 * Only webhook tools are user-creatable.
 *
 * Built-in tools (end_call, transfer_to_human) are handled automatically
 * and don't need to be created by users.
 */

/**
 * Helper: Get all tool templates (webhook only)
 */
export function getAllToolTemplates() {
  return {
    webhook: WEBHOOK_TOOL_TEMPLATES,
  };
}

/**
 * Helper: Get a specific template by name
 */
export function getToolTemplate(name: string): ToolConfig | undefined {
  return WEBHOOK_TOOL_TEMPLATES[name as keyof typeof WEBHOOK_TOOL_TEMPLATES];
}

/**
 * Common JSON Schema patterns for reuse
 */
export const JSON_SCHEMA_PATTERNS = {
  phone_number: {
    type: "string",
    pattern: "^[0-9]{10,15}$",
    description: "Phone number (10-15 digits)",
  },

  email: {
    type: "string",
    format: "email",
    description: "Email address",
  },

  date: {
    type: "string",
    pattern: "^\\d{4}-\\d{2}-\\d{2}$",
    description: "Date in YYYY-MM-DD format",
  },

  amount: {
    type: "number",
    minimum: 0,
    description: "Amount (positive number)",
  },

  transaction_reference: {
    type: "string",
    pattern: "^TRX[A-Z0-9]{6,20}$",
    description: "Transaction reference (e.g., TRX123456)",
  },
};
