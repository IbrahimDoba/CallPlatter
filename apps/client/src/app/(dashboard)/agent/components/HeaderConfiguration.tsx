"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export interface HeaderConfig {
  id: string;
  key: string;
  value: string;
  type: "static" | "variable";
  isSecret?: boolean;
}

interface HeaderConfigurationProps {
  headers: HeaderConfig[];
  onChange: (headers: HeaderConfig[]) => void;
}

const COMMON_HEADERS = [
  { value: "Authorization", label: "Authorization" },
  { value: "Content-Type", label: "Content-Type" },
  { value: "X-API-Key", label: "X-API-Key" },
  { value: "X-Auth-Token", label: "X-Auth-Token" },
  { value: "Accept", label: "Accept" },
  { value: "User-Agent", label: "User-Agent" },
];

const SYSTEM_VARIABLES = [
  { value: "{{business_id}}", label: "Business ID" },
  { value: "{{agent_id}}", label: "Agent ID" },
  { value: "{{call_id}}", label: "Call ID" },
  { value: "{{caller_phone}}", label: "Caller Phone" },
  { value: "{{timestamp}}", label: "Timestamp" },
];

export function HeaderConfiguration({
  headers,
  onChange,
}: HeaderConfigurationProps) {
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const addHeader = () => {
    const newHeader: HeaderConfig = {
      id: `header_${Date.now()}`,
      key: "",
      value: "",
      type: "static",
      isSecret: false,
    };
    onChange([...headers, newHeader]);
  };

  const updateHeader = (id: string, updates: Partial<HeaderConfig>) => {
    onChange(
      headers.map((header) =>
        header.id === id ? { ...header, ...updates } : header
      )
    );
  };

  const removeHeader = (id: string) => {
    onChange(headers.filter((header) => header.id !== id));
  };

  const toggleSecretVisibility = (id: string) => {
    setShowSecrets((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const insertVariable = (headerId: string, variable: string) => {
    const header = headers.find((h) => h.id === headerId);
    if (!header) return;

    const currentValue = header.value || "";
    const newValue = currentValue + variable;
    updateHeader(headerId, { value: newValue, type: "variable" });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">HTTP Headers</h3>
        <p className="text-sm text-muted-foreground">
          Configure authentication and custom headers for your webhook
        </p>
      </div>

      <div className="space-y-3">
        {headers.map((header) => (
          <Card key={header.id}>
            <CardContent className="pt-4 space-y-3">
              {/* Header Name */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Header Name</Label>
                  <Select
                    value={header.key}
                    onValueChange={(value) =>
                      updateHeader(header.id, { key: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select or type header name" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_HEADERS.map((h) => (
                        <SelectItem key={h.value} value={h.value}>
                          {h.label}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom Header...</SelectItem>
                    </SelectContent>
                  </Select>
                  {header.key === "custom" && (
                    <Input
                      placeholder="Enter custom header name"
                      value={header.key === "custom" ? "" : header.key}
                      onChange={(e) =>
                        updateHeader(header.id, { key: e.target.value })
                      }
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={header.type}
                    onValueChange={(value: "static" | "variable") =>
                      updateHeader(header.id, { type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="static">Static Value</SelectItem>
                      <SelectItem value="variable">
                        Dynamic (with variables)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Header Value */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Header Value</Label>
                  {header.isSecret && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSecretVisibility(header.id)}
                      type="button"
                    >
                      {showSecrets[header.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
                <Input
                  type={
                    header.isSecret && !showSecrets[header.id]
                      ? "password"
                      : "text"
                  }
                  placeholder={
                    header.type === "static"
                      ? "e.g., Bearer sk_live_..."
                      : "e.g., Bearer {{business_id}}_token"
                  }
                  value={header.value}
                  onChange={(e) =>
                    updateHeader(header.id, { value: e.target.value })
                  }
                />
              </div>

              {/* System Variables (for variable type) */}
              {header.type === "variable" && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Quick Insert Variables:
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {SYSTEM_VARIABLES.map((variable) => (
                      <Badge
                        key={variable.value}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() =>
                          insertVariable(header.id, variable.value)
                        }
                      >
                        {variable.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`secret-${header.id}`}
                    checked={header.isSecret || false}
                    onChange={(e) =>
                      updateHeader(header.id, { isSecret: e.target.checked })
                    }
                    className="rounded"
                  />
                  <Label
                    htmlFor={`secret-${header.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    Mark as secret (will be hidden)
                  </Label>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeHeader(header.id)}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addHeader}
        className="w-full"
        type="button"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Header
      </Button>

      {/* Common Examples */}
      <div className="rounded-lg bg-muted p-4 space-y-2">
        <p className="text-sm font-medium">Common Examples:</p>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>
            <code className="bg-background px-1 py-0.5 rounded">
              Authorization: Bearer your_api_key
            </code>
          </p>
          <p>
            <code className="bg-background px-1 py-0.5 rounded">
              X-Business-ID: {`{{business_id}}`}
            </code>
          </p>
          <p>
            <code className="bg-background px-1 py-0.5 rounded">
              X-Call-ID: {`{{call_id}}`}
            </code>
          </p>
        </div>
      </div>

      {/* Headers Preview */}
      {headers.length > 0 && (
        <div className="space-y-2">
          <Label>Headers Preview</Label>
          <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
            {JSON.stringify(
              headers.reduce((acc, h) => {
                if (h.key && h.value) {
                  acc[h.key] = h.isSecret ? "***HIDDEN***" : h.value;
                }
                return acc;
              }, {} as Record<string, string>),
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
}

export function convertHeadersToObject(
  headers: HeaderConfig[]
): Record<string, string> {
  return headers.reduce((acc, header) => {
    if (header.key && header.value) {
      acc[header.key] = header.value;
    }
    return acc;
  }, {} as Record<string, string>);
}
