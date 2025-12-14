"use client";

import { useState } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface SchemaField {
  id: string;
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  description: string;
  required: boolean;
  isSystemProvided?: boolean;
  // String validations
  pattern?: string;
  enum?: string[];
  format?: "email" | "uri" | "date" | "time" | "date-time";
  // Number validations
  minimum?: number;
  maximum?: number;
  // For arrays
  items?: Partial<SchemaField>;
}

interface JsonSchemaBuilderProps {
  fields: SchemaField[];
  onChange: (fields: SchemaField[]) => void;
  title?: string;
  description?: string;
}

export function JsonSchemaBuilder({
  fields,
  onChange,
  title = "Request Parameters",
  description = "Define the parameters your webhook expects",
}: JsonSchemaBuilderProps) {
  const addField = () => {
    const newField: SchemaField = {
      id: `field_${Date.now()}`,
      name: "",
      type: "string",
      description: "",
      required: false,
      isSystemProvided: false,
    };
    onChange([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<SchemaField>) => {
    onChange(
      fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const removeField = (id: string) => {
    onChange(fields.filter((field) => field.id !== id));
  };

  const moveField = (index: number, direction: "up" | "down") => {
    const newFields = [...fields];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newFields.length) return;
    const temp = newFields[index];
    const target = newFields[newIndex];
    if (!temp || !target) return;
    newFields[index] = target;
    newFields[newIndex] = temp;
    onChange(newFields);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <Card key={field.id}>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-1 mt-8">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => moveField(index, "up")}
                      disabled={index === 0}
                    >
                      <GripVertical className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>
                        Parameter Name *
                        {field.isSystemProvided && (
                          <Badge variant="secondary" className="ml-2">
                            System
                          </Badge>
                        )}
                      </Label>
                      <Input
                        placeholder="e.g., transaction_reference"
                        value={field.name}
                        onChange={(e) =>
                          updateField(field.id, { name: e.target.value })
                        }
                        disabled={field.isSystemProvided}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value: any) =>
                          updateField(field.id, { type: value })
                        }
                        disabled={field.isSystemProvided}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="object">Object</SelectItem>
                          <SelectItem value="array">Array</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeField(field.id)}
                    disabled={field.isSystemProvided}
                    className="mt-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label>Description (helps AI extract this parameter)</Label>
                  <Textarea
                    placeholder="e.g., Transaction reference number provided by customer"
                    value={field.description}
                    onChange={(e) =>
                      updateField(field.id, { description: e.target.value })
                    }
                    rows={2}
                  />
                </div>

                {/* Type-specific validations */}
                {field.type === "string" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Format (optional)</Label>
                      <Select
                        value={field.format || "none"}
                        onValueChange={(value) =>
                          updateField(field.id, {
                            format: value === "none" ? undefined : (value as any),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="uri">URL</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="time">Time</SelectItem>
                          <SelectItem value="date-time">DateTime</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Pattern (regex, optional)</Label>
                      <Input
                        placeholder="e.g., ^TRX[0-9]{6,}$"
                        value={field.pattern || ""}
                        onChange={(e) =>
                          updateField(field.id, {
                            pattern: e.target.value || undefined,
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {field.type === "number" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Minimum (optional)</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 0"
                        value={field.minimum ?? ""}
                        onChange={(e) =>
                          updateField(field.id, {
                            minimum: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Maximum (optional)</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 1000000"
                        value={field.maximum ?? ""}
                        onChange={(e) =>
                          updateField(field.id, {
                            maximum: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Enum values for string type */}
                {field.type === "string" && (
                  <div className="space-y-2">
                    <Label>Allowed Values (optional, comma-separated)</Label>
                    <Input
                      placeholder="e.g., pending, completed, failed"
                      value={field.enum?.join(", ") || ""}
                      onChange={(e) =>
                        updateField(field.id, {
                          enum: e.target.value
                            ? e.target.value.split(",").map((v) => v.trim())
                            : undefined,
                        })
                      }
                    />
                  </div>
                )}

                {/* Flags */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={field.required}
                      onCheckedChange={(checked) =>
                        updateField(field.id, { required: checked })
                      }
                      disabled={field.isSystemProvided}
                    />
                    <Label>Required parameter</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={field.isSystemProvided || false}
                      onCheckedChange={(checked) =>
                        updateField(field.id, { isSystemProvided: checked })
                      }
                    />
                    <Label>System-provided (auto-injected)</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addField}
        className="w-full"
        type="button"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Parameter
      </Button>

      {/* JSON Preview */}
      {fields.length > 0 && (
        <div className="space-y-2">
          <Label>JSON Schema Preview</Label>
          <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
            {JSON.stringify(convertToJsonSchema(fields), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// Convert SchemaField[] to JSON Schema format
function convertToJsonSchema(fields: SchemaField[]) {
  const properties: Record<string, any> = {};
  const required: string[] = [];

  for (const field of fields) {
    if (!field.name) continue;

    const prop: any = {
      type: field.type,
    };

    // ElevenLabs API: cannot have description + is_system_provided together
    if (field.isSystemProvided) {
      prop.is_system_provided = true;
    } else if (field.description) {
      prop.description = field.description;
    }

    if (field.type === "string") {
      if (field.format) prop.format = field.format;
      if (field.pattern) prop.pattern = field.pattern;
      if (field.enum && field.enum.length > 0) prop.enum = field.enum;
    }

    if (field.type === "number") {
      if (field.minimum !== undefined) prop.minimum = field.minimum;
      if (field.maximum !== undefined) prop.maximum = field.maximum;
    }

    properties[field.name] = prop;

    if (field.required) {
      required.push(field.name);
    }
  }

  return {
    type: "object",
    properties,
    required,
  };
}

export { convertToJsonSchema };
