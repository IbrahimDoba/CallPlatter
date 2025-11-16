"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Wrench, Phone, Globe, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface AgentTool {
  id: string;
  toolType: string;
  toolName: string;
  displayName: string;
  description: string | null;
  isEnabled: boolean;
  config: unknown;
}

interface AgentToolsProps {
  hasAgent: boolean;
}

export function AgentTools({ hasAgent }: AgentToolsProps) {
  const [tools, setTools] = useState<AgentTool[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [togglingToolId, setTogglingToolId] = useState<string | null>(null);
  const [totalEnabled, setTotalEnabled] = useState(0);

  const loadTools = useCallback(async () => {
    if (!hasAgent) return;

    setIsLoading(true);
    try {
      const response = await api.agentTools.getTools();
      if (response.ok && response.data) {
        setTools(response.data.tools || []);
        setTotalEnabled(response.data.totalEnabled || 0);
      } else {
        // No agent yet, that's okay
        setTools([]);
        setTotalEnabled(0);
      }
    } catch (error) {
      console.error("Error loading tools:", error);
    } finally {
      setIsLoading(false);
    }
  }, [hasAgent]);

  useEffect(() => {
    loadTools();
  }, [loadTools]);

  const handleToggleTool = async (toolId: string, currentEnabled: boolean) => {
    setTogglingToolId(toolId);
    try {
      const response = await api.agentTools.toggleTool(toolId, !currentEnabled);
      if (response.ok) {
        // Update local state
        setTools((prev) =>
          prev.map((tool) =>
            tool.id === toolId ? { ...tool, isEnabled: !currentEnabled } : tool
          )
        );
        setTotalEnabled((prev) => (currentEnabled ? prev - 1 : prev + 1));
        toast.success(`Tool ${currentEnabled ? "disabled" : "enabled"} successfully`);
      } else {
        toast.error(response.error || "Failed to update tool");
      }
    } catch (error) {
      console.error("Error toggling tool:", error);
      toast.error("Failed to update tool");
    } finally {
      setTogglingToolId(null);
    }
  };

  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case "end_call":
        return <Phone className="h-4 w-4" />;
      case "language_detection":
        return <Globe className="h-4 w-4" />;
      case "transfer_to_number":
        return <Phone className="h-4 w-4" />;
      default:
        return <Wrench className="h-4 w-4" />;
    }
  };

  if (!hasAgent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" /> Agent Tools
          </CardTitle>
          <CardDescription>
            Create an AI agent first to manage tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Tools will be available after you create your AI agent.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5" /> Agent Tools
          </div>
          <Badge variant="secondary">
            {totalEnabled} / {tools.length} enabled
          </Badge>
        </CardTitle>
        <CardDescription>
          Enable or disable tools that your AI agent can use during calls
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : tools.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No tools configured yet. Tools will be initialized when you save your agent configuration.
          </div>
        ) : (
          <div className="space-y-4">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-muted-foreground">
                    {getToolIcon(tool.toolName)}
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {tool.displayName}
                      <Badge variant="outline" className="text-xs">
                        {tool.toolType}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {tool.description || "No description"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {togglingToolId === tool.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Switch
                      checked={tool.isEnabled}
                      onCheckedChange={() => handleToggleTool(tool.id, tool.isEnabled)}
                      disabled={togglingToolId !== null}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
