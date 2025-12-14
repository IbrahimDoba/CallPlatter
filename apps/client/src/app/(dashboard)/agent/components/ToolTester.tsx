"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Play, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ToolTesterProps {
  toolConfig: {
    name: string;
    url: string;
    method: string;
    headers?: Record<string, string>;
    schema?: any;
  };
}

export function ToolTester({ toolConfig }: ToolTesterProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testInputs, setTestInputs] = useState<Record<string, any>>({});

  const runTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const startTime = Date.now();

      // Build request body from test inputs
      const requestBody = { ...testInputs };

      // Make the actual HTTP request to the webhook
      const response = await fetch(toolConfig.url, {
        method: toolConfig.method,
        headers: {
          "Content-Type": "application/json",
          ...toolConfig.headers,
        },
        body: ["POST", "PUT", "PATCH"].includes(toolConfig.method)
          ? JSON.stringify(requestBody)
          : undefined,
      });

      const endTime = Date.now();
      const latency = endTime - startTime;

      let responseData;
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }

      setTestResult({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        latency,
        responseData,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (response.ok) {
        toast.success(`Test successful! (${latency}ms)`);
      } else {
        toast.error(`Test failed: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      console.error("Test error:", error);
      setTestResult({
        success: false,
        error: error.message,
      });
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const getSchemaFields = () => {
    if (!toolConfig.schema?.properties) return [];
    return Object.entries(toolConfig.schema.properties).map(
      ([key, prop]: [string, any]) => ({
        name: key,
        type: prop.type,
        description: prop.description,
        required: toolConfig.schema.required?.includes(key),
        isSystemProvided: prop.is_system_provided,
      })
    );
  };

  const schemaFields = getSchemaFields();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Test Your Webhook</h3>
        <p className="text-sm text-muted-foreground">
          Test your webhook endpoint before deploying to ensure it works correctly
        </p>
      </div>

      {/* Test Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Test Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Method</Label>
              <p className="font-mono text-sm">{toolConfig.method}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">URL</Label>
              <p className="font-mono text-sm truncate">{toolConfig.url}</p>
            </div>
          </div>

          {/* Test Inputs */}
          {schemaFields.length > 0 && (
            <div className="space-y-3">
              <Label>Test Parameters</Label>
              {schemaFields.map((field) => (
                <div key={field.name} className="space-y-1">
                  <Label htmlFor={field.name} className="text-sm">
                    {field.name}
                    {field.required && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Required
                      </Badge>
                    )}
                    {field.isSystemProvided && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Auto-injected
                      </Badge>
                    )}
                  </Label>
                  {field.description && (
                    <p className="text-xs text-muted-foreground">
                      {field.description}
                    </p>
                  )}
                  <Input
                    id={field.name}
                    type={field.type === "number" ? "number" : "text"}
                    placeholder={
                      field.isSystemProvided
                        ? "This will be auto-provided"
                        : `Enter ${field.name}`
                    }
                    value={testInputs[field.name] || ""}
                    onChange={(e) =>
                      setTestInputs({
                        ...testInputs,
                        [field.name]: e.target.value,
                      })
                    }
                    disabled={field.isSystemProvided}
                  />
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={runTest}
            disabled={isTesting}
            className="w-full"
          >
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Test
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Test Results</CardTitle>
              {testResult.success ? (
                <Badge className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Success
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Failed
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="response">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="response">Response</TabsTrigger>
                <TabsTrigger value="headers">Headers</TabsTrigger>
                <TabsTrigger value="timing">Timing</TabsTrigger>
              </TabsList>

              <TabsContent value="response" className="space-y-2">
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Status:</span>{" "}
                    <Badge
                      variant={testResult.success ? "default" : "destructive"}
                    >
                      {testResult.status} {testResult.statusText}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Response Body
                  </Label>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto mt-2">
                    {typeof testResult.responseData === "string"
                      ? testResult.responseData
                      : JSON.stringify(testResult.responseData, null, 2)}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="headers" className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Response Headers
                </Label>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                  {JSON.stringify(testResult.headers, null, 2)}
                </pre>
              </TabsContent>

              <TabsContent value="timing" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Latency</span>
                  </div>
                  <div className="text-3xl font-bold">{testResult.latency}ms</div>
                  <p className="text-sm text-muted-foreground">
                    {testResult.latency < 2000
                      ? "✓ Good latency for real-time conversations"
                      : testResult.latency < 5000
                      ? "⚠ Acceptable but try to optimize"
                      : "⚠ Too slow - customers may experience delays"}
                  </p>
                </div>

                {testResult.error && (
                  <div className="rounded-lg bg-destructive/10 p-4">
                    <p className="text-sm text-destructive font-medium">
                      Error
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {testResult.error}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Testing Tips */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-sm mb-2">Testing Tips</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Test with realistic data your customers would provide</li>
            <li>Aim for response times under 5 seconds (under 2s is ideal)</li>
            <li>Verify your webhook returns user-friendly error messages</li>
            <li>Test authentication headers are working correctly</li>
            <li>Check response format is valid JSON (if applicable)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
