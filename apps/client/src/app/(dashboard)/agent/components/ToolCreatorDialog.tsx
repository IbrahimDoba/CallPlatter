"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { ToolTemplateSelector, type ToolTemplate } from "./ToolTemplateSelector";
import { JsonSchemaBuilder, type SchemaField, convertToJsonSchema } from "./JsonSchemaBuilder";
import { HeaderConfiguration, type HeaderConfig, convertHeadersToObject } from "./HeaderConfiguration";
import { ToolTester } from "./ToolTester";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";

interface ToolCreatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingTool?: any;
}

type Step = "template" | "basic" | "headers" | "parameters" | "test" | "review";

const STEPS: { id: Step; label: string }[] = [
  { id: "template", label: "Template" },
  { id: "basic", label: "Basic Info" },
  { id: "headers", label: "Headers" },
  { id: "parameters", label: "Parameters" },
  { id: "test", label: "Test" },
  { id: "review", label: "Review" },
];

export function ToolCreatorDialog({
  open,
  onOpenChange,
  onSuccess,
  editingTool,
}: ToolCreatorDialogProps) {
  const [currentStep, setCurrentStep] = useState<Step>("template");
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [selectedTemplate, setSelectedTemplate] = useState<ToolTemplate | null>(null);
  const [toolName, setToolName] = useState("");
  const [toolDescription, setToolDescription] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookMethod, setWebhookMethod] = useState<"GET" | "POST" | "PUT" | "PATCH" | "DELETE">("POST");
  const [headers, setHeaders] = useState<HeaderConfig[]>([]);
  const [schemaFields, setSchemaFields] = useState<SchemaField[]>([]);
  const [useQueryParams, setUseQueryParams] = useState(false);
  const [querySchemaFields, setQuerySchemaFields] = useState<SchemaField[]>([]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setCurrentStep("template");
        setSelectedTemplate(null);
        setToolName("");
        setToolDescription("");
        setWebhookUrl("");
        setWebhookMethod("POST");
        setHeaders([]);
        setSchemaFields([]);
        setQuerySchemaFields([]);
        setUseQueryParams(false);
      }, 300);
    }
  }, [open]);

  // Load template data when selected
  useEffect(() => {
    if (selectedTemplate) {
      setToolName(selectedTemplate.config.name || "");
      setToolDescription(selectedTemplate.config.description || "");
      setWebhookMethod(selectedTemplate.config.api_schema?.method || "POST");

      // Convert template schema to SchemaField[]
      if (selectedTemplate.config.api_schema?.request_body_schema) {
        const schema = selectedTemplate.config.api_schema.request_body_schema;
        const fields: SchemaField[] = Object.entries(schema.properties || {}).map(
          ([key, prop]: [string, any]) => ({
            id: `field_${key}`,
            name: key,
            type: prop.type || "string",
            description: prop.description || "",
            required: schema.required?.includes(key) || false,
            isSystemProvided: prop.is_system_provided || false,
            pattern: prop.pattern,
            enum: prop.enum,
            format: prop.format,
            minimum: prop.minimum,
            maximum: prop.maximum,
          })
        );
        setSchemaFields(fields);
      }
    }
  }, [selectedTemplate]);

  const getCurrentStepIndex = () => STEPS.findIndex((s) => s.id === currentStep);
  const progress = ((getCurrentStepIndex() + 1) / STEPS.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case "template":
        return true; // Can always proceed from template
      case "basic":
        return toolName && toolDescription && webhookUrl;
      case "headers":
        return true; // Headers are optional
      case "parameters":
        return true; // Parameters are optional
      case "test":
        return true; // Testing is optional
      case "review":
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    const currentIndex = getCurrentStepIndex();
    const nextStepData = STEPS[currentIndex + 1];
    if (currentIndex < STEPS.length - 1 && nextStepData) {
      setCurrentStep(nextStepData.id);
    }
  };

  const prevStep = () => {
    const currentIndex = getCurrentStepIndex();
    const prevStepData = STEPS[currentIndex - 1];
    if (currentIndex > 0 && prevStepData) {
      setCurrentStep(prevStepData.id);
    }
  };

  const handleCreate = async () => {
    if (!canProceed()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    try {
      const toolConfig: any = {
        type: "webhook",
        name: toolName,
        description: toolDescription,
        api_schema: {
          url: webhookUrl,
          method: webhookMethod,
          content_type: "application/json",
        },
      };

      // Add headers if configured
      if (headers.length > 0) {
        toolConfig.api_schema.request_headers = convertHeadersToObject(headers);
      }

      // Add request body schema if configured
      if (schemaFields.length > 0 && ["POST", "PUT", "PATCH"].includes(webhookMethod)) {
        toolConfig.api_schema.request_body_schema = convertToJsonSchema(schemaFields);
      }

      // Add query params schema if configured
      if (querySchemaFields.length > 0 && useQueryParams) {
        toolConfig.api_schema.query_params_schema = convertToJsonSchema(querySchemaFields);
      }

      const response = await apiRequest("/tools", {
        method: "POST",
        body: JSON.stringify({ tool_config: toolConfig }),
      });

      if (response.ok) {
        toast.success("Tool created successfully!");
        onSuccess();
        onOpenChange(false);
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

  const renderStepContent = () => {
    switch (currentStep) {
      case "template":
        return (
          <ToolTemplateSelector
            onSelect={(template) => {
              setSelectedTemplate(template);
              if (template) {
                nextStep();
              }
            }}
            selectedTemplateId={selectedTemplate?.id || (selectedTemplate === null ? "custom" : undefined)}
          />
        );

      case "basic":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="toolName">Tool Name *</Label>
              <Input
                id="toolName"
                placeholder="e.g., check_transaction_status"
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use lowercase with underscores (no spaces). This is how the AI will call the tool.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="toolDescription">Description *</Label>
              <Textarea
                id="toolDescription"
                placeholder="Describe when and how the AI should use this tool..."
                value={toolDescription}
                onChange={(e) => setToolDescription(e.target.value)}
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                Be specific! Include trigger phrases, required information to collect, and when to call the tool.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL *</Label>
              <Input
                id="webhookUrl"
                type="url"
                placeholder="https://api.yourdomain.com/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhookMethod">HTTP Method</Label>
              <Select
                value={webhookMethod}
                onValueChange={(value: any) => setWebhookMethod(value)}
              >
                <SelectTrigger id="webhookMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "headers":
        return (
          <HeaderConfiguration headers={headers} onChange={setHeaders} />
        );

      case "parameters":
        return (
          <div className="space-y-6">
            {["POST", "PUT", "PATCH"].includes(webhookMethod) && (
              <JsonSchemaBuilder
                fields={schemaFields}
                onChange={setSchemaFields}
                title="Request Body Parameters"
                description="Define the JSON parameters sent in the request body"
              />
            )}

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Query Parameters</h3>
                  <p className="text-sm text-muted-foreground">
                    Add URL query parameters (optional)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Label>Enable</Label>
                  <input
                    type="checkbox"
                    checked={useQueryParams}
                    onChange={(e) => setUseQueryParams(e.target.checked)}
                    className="rounded"
                  />
                </div>
              </div>

              {useQueryParams && (
                <JsonSchemaBuilder
                  fields={querySchemaFields}
                  onChange={setQuerySchemaFields}
                  title=""
                  description="Define query parameters added to the URL"
                />
              )}
            </div>
          </div>
        );

      case "test":
        return (
          <ToolTester
            toolConfig={{
              name: toolName,
              url: webhookUrl,
              method: webhookMethod,
              headers: convertHeadersToObject(headers),
              schema: schemaFields.length > 0 ? convertToJsonSchema(schemaFields) : undefined,
            }}
          />
        );

      case "review":
        return (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <h3 className="font-semibold mb-2">Tool Configuration</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="font-medium">Name:</dt>
                  <dd className="text-muted-foreground">{toolName}</dd>
                </div>
                <div>
                  <dt className="font-medium">Method:</dt>
                  <dd className="text-muted-foreground">{webhookMethod}</dd>
                </div>
                <div>
                  <dt className="font-medium">URL:</dt>
                  <dd className="text-muted-foreground break-all">{webhookUrl}</dd>
                </div>
                <div>
                  <dt className="font-medium">Headers:</dt>
                  <dd className="text-muted-foreground">
                    {headers.length} configured
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Parameters:</dt>
                  <dd className="text-muted-foreground">
                    {schemaFields.length} body parameters
                    {useQueryParams && `, ${querySchemaFields.length} query parameters`}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {toolDescription}
              </p>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-sm text-green-900">
                <Check className="inline h-4 w-4 mr-1" />
                Your tool is ready to be created! Click "Create Tool" to deploy it.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {currentStep === "template" ? "Create New Tool" : `Create Tool: ${STEPS.find(s => s.id === currentStep)?.label}`}
          </DialogTitle>
          <DialogDescription>
            {currentStep === "template"
              ? "Choose a template or start from scratch"
              : "Configure your webhook tool step by step"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        {currentStep !== "template" && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              {STEPS.filter(s => s.id !== "template").map((step, index) => (
                <span
                  key={step.id}
                  className={
                    step.id === currentStep ? "font-semibold text-primary" : ""
                  }
                >
                  {index + 1}. {step.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {renderStepContent()}
        </div>

        {/* Footer with Navigation */}
        {currentStep !== "template" && (
          <DialogFooter className="flex justify-between border-t pt-4">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={getCurrentStepIndex() === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="flex gap-2">
              {currentStep === "review" ? (
                <Button onClick={handleCreate} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Tool"
                  )}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
