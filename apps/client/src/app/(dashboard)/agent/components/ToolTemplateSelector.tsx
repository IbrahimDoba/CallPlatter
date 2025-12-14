"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  CreditCard,
  FileText,
  Database,
  Phone,
  Globe,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface ToolTemplate {
  id: string;
  name: string;
  displayName: string;
  category: "fintech" | "general" | "crm" | "support";
  description: string;
  icon: "creditcard" | "file" | "database" | "phone";
  tags: string[];
  config: any;
  customizableFields: TemplateVariable[];
}

export interface TemplateVariable {
  key: string;
  label: string;
  description: string;
  type: "string" | "url" | "secret";
  placeholder: string;
  required: boolean;
  defaultValue?: string;
}

interface ToolTemplateSelectorProps {
  onSelect: (template: ToolTemplate | null) => void;
  selectedTemplateId?: string;
}

const ICON_MAP = {
  creditcard: CreditCard,
  file: FileText,
  database: Database,
  phone: Phone,
};

// Template definitions matching backend templates
const TEMPLATES: ToolTemplate[] = [
  {
    id: "check_transaction_status",
    name: "check_transaction_status",
    displayName: "Check Transaction Status",
    category: "fintech",
    description: "Looks up transaction status when customer reports payment issues. Perfect for fintech apps and payment platforms.",
    icon: "creditcard",
    tags: ["fintech", "payments", "transactions"],
    config: {
      type: "webhook",
      name: "check_transaction_status",
      description: `Looks up transaction status when customer reports payment issues. Use when customer mentions: failed transfer, missing money, transaction not received, or provides a transaction reference number.

ALWAYS ask for at least ONE identifier:
- Transaction reference number (most accurate)
- Phone number used for transfer
- Account number + date

Call this tool immediately after getting the identifier.`,
      api_schema: {
        url: "", // User will provide
        method: "POST",
        content_type: "application/json",
        request_headers: {},
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
              description: "Business ID (auto-injected)",
              is_system_provided: true,
            },
          },
          required: ["lookup_type", "lookup_value"],
        },
      },
    },
    customizableFields: [
      {
        key: "webhook_url",
        label: "Webhook URL",
        description: "Your API endpoint that will handle transaction lookups",
        type: "url",
        placeholder: "https://api.yourdomain.com/transactions/status",
        required: true,
      },
      {
        key: "api_key",
        label: "API Key",
        description: "Authentication key for your webhook endpoint",
        type: "secret",
        placeholder: "sk_live_...",
        required: false,
      },
    ],
  },
  {
    id: "check_account_balance",
    name: "check_account_balance",
    displayName: "Check Account Balance",
    category: "fintech",
    description: "Retrieves customer account balance. Use for banking apps, wallets, and financial services.",
    icon: "creditcard",
    tags: ["fintech", "banking", "balance"],
    config: {
      type: "webhook",
      name: "check_account_balance",
      description: `Retrieves customer account balance. Use when customer asks: "what's my balance?", "how much do I have?", or wants to verify if payment reflected.

ALWAYS ask for phone number or account number first.`,
      api_schema: {
        url: "",
        method: "POST",
        content_type: "application/json",
        request_headers: {},
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
    },
    customizableFields: [
      {
        key: "webhook_url",
        label: "Webhook URL",
        description: "Your API endpoint for balance lookups",
        type: "url",
        placeholder: "https://api.yourdomain.com/accounts/balance",
        required: true,
      },
      {
        key: "api_key",
        label: "API Key",
        description: "Authentication key for your webhook",
        type: "secret",
        placeholder: "sk_live_...",
        required: false,
      },
    ],
  },
  {
    id: "create_support_ticket",
    name: "create_support_ticket",
    displayName: "Create Support Ticket",
    category: "support",
    description: "Creates a support ticket in your ticketing system when customers report non-urgent issues.",
    icon: "file",
    tags: ["support", "tickets", "helpdesk"],
    config: {
      type: "webhook",
      name: "create_support_ticket",
      description: `Creates a support ticket for non-urgent issues requiring human review. Use when: customer has a complaint, needs manual investigation, or issue cannot be resolved immediately.

DO NOT use for urgent issues - use transfer_to_agent instead.`,
      api_schema: {
        url: "",
        method: "POST",
        content_type: "application/json",
        request_headers: {},
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
    },
    customizableFields: [
      {
        key: "webhook_url",
        label: "Webhook URL",
        description: "Your ticketing system webhook endpoint",
        type: "url",
        placeholder: "https://api.yourdomain.com/tickets/create",
        required: true,
      },
      {
        key: "api_key",
        label: "API Key",
        description: "Authentication for your ticketing system",
        type: "secret",
        placeholder: "api_key_...",
        required: false,
      },
    ],
  },
  {
    id: "fetch_customer_info",
    name: "fetch_customer_info",
    displayName: "Fetch Customer Info",
    category: "crm",
    description: "Retrieves customer information from your CRM to personalize conversations.",
    icon: "database",
    tags: ["crm", "customers", "data"],
    config: {
      type: "webhook",
      name: "fetch_customer_info",
      description: "Fetches customer information from CRM system. Use when you need to personalize the conversation or look up customer details.",
      api_schema: {
        url: "",
        method: "GET",
        query_params_schema: {
          type: "object",
          properties: {
            customer_id: {
              type: "string",
              description: "Customer ID or phone number",
            },
            include_history: {
              type: "boolean",
              description: "Include purchase history",
            },
          },
          required: ["customer_id"],
        },
      },
    },
    customizableFields: [
      {
        key: "webhook_url",
        label: "Webhook URL",
        description: "Your CRM API endpoint",
        type: "url",
        placeholder: "https://api.yourdomain.com/customers/{customer_id}",
        required: true,
      },
      {
        key: "api_key",
        label: "API Key",
        description: "CRM API authentication key",
        type: "secret",
        placeholder: "Bearer token or API key",
        required: false,
      },
    ],
  },
];

export function ToolTemplateSelector({
  onSelect,
  selectedTemplateId,
}: ToolTemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filteredTemplates, setFilteredTemplates] = useState(TEMPLATES);

  useEffect(() => {
    let filtered = TEMPLATES;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.displayName.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    setFilteredTemplates(filtered);
  }, [searchQuery, selectedCategory]);

  const getCategoryCount = (category: string) => {
    if (category === "all") return TEMPLATES.length;
    return TEMPLATES.filter((t) => t.category === category).length;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Choose a Template</h3>
        <p className="text-sm text-muted-foreground">
          Start with a pre-configured template or create from scratch
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            All ({getCategoryCount("all")})
          </TabsTrigger>
          <TabsTrigger value="fintech">
            Fintech ({getCategoryCount("fintech")})
          </TabsTrigger>
          <TabsTrigger value="crm">
            CRM ({getCategoryCount("crm")})
          </TabsTrigger>
          <TabsTrigger value="support">
            Support ({getCategoryCount("support")})
          </TabsTrigger>
          <TabsTrigger value="general">
            General ({getCategoryCount("general")})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-4 space-y-3">
          {/* Start from Scratch Option */}
          <Card
            className={`cursor-pointer transition-all hover:border-primary ${
              selectedTemplateId === "custom"
                ? "border-primary ring-2 ring-primary"
                : ""
            }`}
            onClick={() => onSelect(null)}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <Globe className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">Start from Scratch</h4>
                  {selectedTemplateId === "custom" && (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Create a custom webhook tool with your own configuration
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>

          {/* Template Cards */}
          {filteredTemplates.map((template) => {
            const Icon = ICON_MAP[template.icon];
            const isSelected = selectedTemplateId === template.id;

            return (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all hover:border-primary ${
                  isSelected ? "border-primary ring-2 ring-primary" : ""
                }`}
                onClick={() => onSelect(template)}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{template.displayName}</h4>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            );
          })}

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No templates found. Try a different search or category.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { TEMPLATES };
