"use client";

import { useState, useEffect } from "react";
import {  Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, Plus, Trash2, Edit, Loader2, Globe, Phone, Database, ExternalLink, Sparkles, Settings } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { useAgentContext } from "@/contexts/AgentContext";
import { ToolCreatorDialog } from "./ToolCreatorDialog";
import { QuickToolCreator } from "./QuickToolCreator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface Tool {
  id: string;
  elevenLabsToolId: string;
  type: "webhook" | "client" | "system";
  name: string;
  description: string;
  config: any;
  isActive: boolean;
  createdAt: string;
  agentCount?: number;
}

interface AgentToolsProps {
  hasAgent: boolean;
}

export function AgentTools({ hasAgent }: AgentToolsProps) {
  const { businessId } = useAgentContext();
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [isAdvancedCreateOpen, setIsAdvancedCreateOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);

  useEffect(() => {
    loadTools();
  }, [businessId]);

  const loadTools = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("/tools", {
        method: "GET",
      });

      if (response.ok && response.data) {
        setTools(response.data.tools || []);
      }
    } catch (error) {
      console.error("Error loading tools:", error);
      toast.error("Failed to load tools");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTool = async (toolId: string) => {
    if (!confirm("Are you sure you want to delete this tool?")) {
      return;
    }

    try {
      const response = await apiRequest(`/tools/${toolId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Tool deleted successfully");
        loadTools();
      } else {
        toast.error(response.error || "Failed to delete tool");
      }
    } catch (error) {
      console.error("Error deleting tool:", error);
      toast.error("Failed to delete tool");
    }
  };

  const getToolIcon = (type: string) => {
    switch (type) {
      case "webhook":
        return <Globe className="h-4 w-4" />;
      case "client":
        return <Database className="h-4 w-4" />;
      case "system":
        return <Phone className="h-4 w-4" />;
      default:
        return <Wrench className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "webhook":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "client":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "system":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700";
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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" /> Agent Tools
              </CardTitle>
              <CardDescription>
                Create and manage custom tools for your AI agent
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Tool
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setIsQuickCreateOpen(true)}>
                  <Sparkles className="h-4 w-4 mr-2 text-primary" />
                  <div>
                    <div className="font-medium">Quick Create</div>
                    <div className="text-xs text-muted-foreground">
                      Simple 3-step setup
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsAdvancedCreateOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  <div>
                    <div className="font-medium">Advanced Setup</div>
                    <div className="text-xs text-muted-foreground">
                      Full control & customization
                    </div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : tools.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                No tools created yet. Create your first tool to get started.
              </p>
              <Button onClick={() => setIsQuickCreateOpen(true)}>
                <Sparkles className="h-4 w-4 mr-2" />
                Quick Create Tool
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {tools.map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1 text-muted-foreground">
                      {getToolIcon(tool.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{tool.name}</h4>
                        <Badge variant="outline" className={getTypeBadgeColor(tool.type)}>
                          {tool.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {tool.description}
                      </p>
                      {tool.type === "webhook" && tool.config?.api_schema?.url && (
                        <p className="text-xs text-muted-foreground mt-1">
                          URL: {tool.config.api_schema.url}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {tool.type === "webhook" && tool.config?.api_schema?.url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const url = tool.config.api_schema.url;
                          window.open(url, "_blank");
                        }}
                        title="Open webhook URL"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTool(tool.id)}
                      title="Delete tool"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tool Creator */}
      <QuickToolCreator
        open={isQuickCreateOpen}
        onOpenChange={setIsQuickCreateOpen}
        onSuccess={loadTools}
      />

      {/* Advanced Tool Creator Dialog */}
      <ToolCreatorDialog
        open={isAdvancedCreateOpen}
        onOpenChange={setIsAdvancedCreateOpen}
        onSuccess={loadTools}
        editingTool={editingTool || undefined}
      />
    </>
  );
}
