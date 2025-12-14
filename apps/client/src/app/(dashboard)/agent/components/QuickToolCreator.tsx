"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuickToolCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const SIMPLE_TEMPLATES = [
  {
    id: "transaction_check",
    label: "Check Transaction Status",
    icon: "💳",
    example: "Look up if a payment went through",
    suggestedName: "check_transaction",
    suggestedQuestion: "What information should customers provide? (e.g., transaction ID, phone number)",
    defaultParams: ["transaction_reference", "phone_number"],
  },
  {
    id: "account_balance",
    label: "Check Account Balance",
    icon: "💰",
    example: "Get customer's current balance",
    suggestedName: "check_balance",
    suggestedQuestion: "How do you identify the customer? (e.g., account number, phone number)",
    defaultParams: ["account_number"],
  },
  {
    id: "customer_lookup",
    label: "Look Up Customer Info",
    icon: "👤",
    example: "Get customer details from your CRM",
    suggestedName: "fetch_customer",
    suggestedQuestion: "How do you identify the customer? (e.g., phone number, email)",
    defaultParams: ["phone_number"],
  },
  {
    id: "order_status",
    label: "Check Order Status",
    icon: "📦",
    example: "Track a customer's order",
    suggestedName: "check_order",
    suggestedQuestion: "What information identifies the order? (e.g., order number, tracking ID)",
    defaultParams: ["order_number"],
  },
  {
    id: "custom",
    label: "Something Else",
    icon: "✨",
    example: "Create a custom tool",
    suggestedName: "my_custom_tool",
    suggestedQuestion: "What information do you need from the customer?",
    defaultParams: [],
  },
];

export function QuickToolCreator({
  open,
  onOpenChange,
  onSuccess,
}: QuickToolCreatorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(SIMPLE_TEMPLATES[0]);

  // Simple form fields
  const [whatToFetch, setWhatToFetch] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [customerInfo, setCustomerInfo] = useState("");

  const resetForm = () => {
    setSelectedTemplate(SIMPLE_TEMPLATES[0]);
    setWhatToFetch("");
    setApiUrl("");
    setApiKey("");
    setCustomerInfo("");
  };

  const generateDescription = () => {
    const purpose = whatToFetch || selectedTemplate?.example || "Fetch information";
    const params = customerInfo || selectedTemplate?.defaultParams.join(", ") || "required information";

    return `${purpose}. Use this tool when the customer asks about this information.

IMPORTANT: First collect the required information from the customer:
- ${params}

Only call this tool AFTER you have collected the necessary information from the customer.`;
  };

  const generateToolName = () => {
    if (whatToFetch) {
      return whatToFetch
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
    }
    return selectedTemplate?.suggestedName || "custom_tool";
  };

  const generateParameters = () => {
    const params = customerInfo
      ? customerInfo.split(",").map((p) => p.trim().toLowerCase().replace(/\s+/g, "_"))
      : selectedTemplate?.defaultParams || [];

    const properties: any = {};
    const required: string[] = [];

    for (const param of params) {
      if (param) {
        properties[param] = {
          type: "string",
          description: `Customer's ${param.replace(/_/g, " ")}`,
        };
        required.push(param);
      }
    }

    // Always add business_id (no description when is_system_provided is true)
    properties.business_id = {
      type: "string",
      is_system_provided: true,
    };

    return {
      type: "object",
      properties,
      required,
    };
  };

  const handleCreate = async () => {
    // Validation
    if (!apiUrl) {
      toast.error("Please enter your API URL");
      return;
    }

    if (!apiUrl.startsWith("http://") && !apiUrl.startsWith("https://")) {
      toast.error("API URL must start with http:// or https://");
      return;
    }

    setIsCreating(true);
    try {
      const toolName = generateToolName();
      const description = generateDescription();
      const parameters = generateParameters();

      const toolConfig: any = {
        type: "webhook",
        name: toolName,
        description: description,
        api_schema: {
          url: apiUrl,
          method: "POST",
          content_type: "application/json",
          request_body_schema: parameters,
        },
      };

      // Add API key if provided
      if (apiKey) {
        toolConfig.api_schema.request_headers = {
          Authorization: `Bearer ${apiKey}`,
        };
      }

      const response = await apiRequest("/tools", {
        method: "POST",
        body: JSON.stringify({ tool_config: toolConfig }),
      });

      if (response.ok) {
        toast.success("Tool created successfully! 🎉");
        onSuccess();
        onOpenChange(false);
        resetForm();
      } else {
        toast.error(response.error || "Failed to create tool");
      }
    } catch (error) {
      console.error("Error creating tool:", error);
      toast.error("Failed to create tool");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Quick Create Tool
          </DialogTitle>
          <DialogDescription>
            Create a custom tool in 3 simple steps. We'll handle the technical details for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: What to fetch */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                1
              </div>
              <Label className="text-base font-semibold">
                What should this tool do?
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-2 ml-8">
              {SIMPLE_TEMPLATES.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all hover:border-primary ${
                    selectedTemplate?.id === template.id
                      ? "border-primary ring-2 ring-primary"
                      : ""
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{template.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">
                          {template.label}
                          {selectedTemplate?.id === template.id && (
                            <Check className="inline h-4 w-4 ml-1 text-primary" />
                          )}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {template.example}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedTemplate?.id === "custom" && (
              <div className="ml-8">
                <Input
                  placeholder="e.g., Check customer's loyalty points"
                  value={whatToFetch}
                  onChange={(e) => setWhatToFetch(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Step 2: API URL */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                2
              </div>
              <Label htmlFor="apiUrl" className="text-base font-semibold">
                Where should I fetch this data? *
              </Label>
            </div>

            <div className="ml-8 space-y-2">
              <Input
                id="apiUrl"
                type="url"
                placeholder="https://api.yourdomain.com/check-transaction"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your API endpoint that will provide this information
              </p>
            </div>
          </div>

          {/* Step 3: Authentication */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                3
              </div>
              <Label htmlFor="apiKey" className="text-base font-semibold">
                How should I authenticate? (optional)
              </Label>
            </div>

            <div className="ml-8 space-y-2">
              <Input
                id="apiKey"
                type="password"
                placeholder="sk_live_... or your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                We'll send this as: Authorization: Bearer YOUR_KEY
              </p>
            </div>
          </div>

          {/* Step 4: Customer Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-semibold">
                4
              </div>
              <Label htmlFor="customerInfo" className="text-base font-semibold">
                {selectedTemplate?.suggestedQuestion || "What information do you need from the customer?"}
              </Label>
            </div>

            <div className="ml-8 space-y-2">
              <Input
                id="customerInfo"
                placeholder="e.g., transaction ID, phone number"
                value={customerInfo}
                onChange={(e) => setCustomerInfo(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The AI will ask customers for this information before calling your API
              </p>
            </div>
          </div>

          {/* Preview */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                What will happen during a call
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Customer asks about it</p>
                    <p className="text-muted-foreground text-xs">
                      e.g., "Can you check my transaction?"
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium">AI collects information</p>
                    <p className="text-muted-foreground text-xs">
                      AI asks: {customerInfo || selectedTemplate?.defaultParams.join(", ") || "required info"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium">AI calls your API</p>
                    <p className="text-muted-foreground text-xs">
                      POST {apiUrl || "your-api-url"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <p className="font-medium">AI responds naturally</p>
                    <p className="text-muted-foreground text-xs">
                      Uses your API data to answer the customer
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info box */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-700 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Your API should return JSON</p>
                <p className="text-blue-800">
                  The AI will automatically convert your API response into natural
                  conversation. Just return the data in JSON format.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !apiUrl}>
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Create Tool
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
