"use client";

import { useEffect, useId, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Bot,
  Save,
  MessageSquare,
  Headphones,
  Plus,
  Trash2,
  Edit,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import CRMDocumentUpload from "./CRMDocumentUpload";
import { useAgentContext } from "@/contexts/AgentContext";

interface BusinessMemory {
  id?: string;
  title: string;
  content: string;
  isActive: boolean;
}

export default function AgentForm() {
  const { activeAgentComponent, businessId } = useAgentContext();
  const [firstMessage, setFirstMessage] = useState("");
  const [businessMemories, setBusinessMemories] = useState<BusinessMemory[]>(
    []
  );
  const [systemPrompt, setSystemPrompt] = useState("");
  const [voice, setVoice] = useState("alloy");
  const [responseModel, setResponseModel] = useState(
    "gpt-4o-realtime-preview-2024-12-17"
  );
  const [transcriptionModel, setTranscriptionModel] = useState("whisper-1");
  const [enableServerVAD, setEnableServerVAD] = useState(true);
  const [turnDetection, setTurnDetection] = useState("server_vad");
  const [temperature, setTemperature] = useState<string>("");
  const [settings, setSettings] = useState<string>("");
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingMemory, setEditingMemory] = useState<BusinessMemory | null>(
    null
  );

  const loadAgentConfig = useCallback(async () => {
    if (!businessId) {
      console.log("No business ID available for loading config");
      return;
    }

    console.log("Loading agent config for business ID:", businessId);

    try {
      const response = await api.agent.getConfig();
      console.log("Agent config response:", response);

      if (response.ok) {
        const { config, memories } = response.data;
        console.log("Config:", config, "Memories:", memories);

        if (!config) {
          toast.info("No agent config found for this business yet");
          return;
        }
        setFirstMessage(config.firstMessage ?? "");
        setBusinessMemories(memories || []);
        setSystemPrompt(config.systemPrompt ?? "");
        setVoice(config.voice ?? "alloy");
        setResponseModel(
          config.responseModel ?? "gpt-4o-realtime-preview-2024-12-17"
        );
        setTranscriptionModel(config.transcriptionModel ?? "whisper-1");
        setEnableServerVAD(config.enableServerVAD ?? true);
        setTurnDetection(config.turnDetection ?? "server_vad");
        setTemperature(
          config.temperature != null ? String(config.temperature) : ""
        );
        setSettings(
          config.settings ? JSON.stringify(config.settings, null, 2) : ""
        );
        toast.success(
          `Loaded agent config and ${memories?.length || 0} memories`
        );
      } else {
        console.error("Failed to load config:", response.error);
        toast.error(response.error || "Failed to load config");
      }
    } catch (error) {
      console.error("Error loading agent config:", error);
      toast.error("Failed to load agent config");
    }
  }, [businessId]);

  // Auto-load when businessId is available once
  useEffect(() => {
    console.log(
      "Business ID changed:",
      businessId,
      "Has loaded once:",
      hasLoadedOnce
    );
    if (businessId && !hasLoadedOnce) {
      console.log("Loading agent config for the first time");
      loadAgentConfig();
      setHasLoadedOnce(true);
    }
  }, [businessId, hasLoadedOnce, loadAgentConfig]);

  const saveAgentConfig = async () => {
    if (!businessId) {
      toast.error("Missing business ID");
      return;
    }

    setIsSaving(true);
    try {
      let parsedSettings = undefined;
      if (settings) {
        try {
          parsedSettings = JSON.parse(settings);
        } catch {
          toast.error("Invalid JSON in settings");
          setIsSaving(false);
          return;
        }
      }

      const configData = {
        firstMessage: firstMessage || null,
        systemPrompt: systemPrompt || null,
        voice: voice || null,
        responseModel: responseModel || null,
        transcriptionModel: transcriptionModel || null,
        enableServerVAD,
        turnDetection: turnDetection || null,
        temperature: temperature ? Number.parseFloat(temperature) : null,
        settings: parsedSettings,
      };

      const response = await api.agent.saveConfig(configData);

      if (response.ok) {
        toast.success("Agent config saved");
        // Re-load from server to ensure UI reflects normalized values
        await loadAgentConfig();
      } else {
        toast.error(response.error || "Failed to save config");
      }
    } catch (error) {
      console.error("Error saving agent config:", error);
      toast.error("Failed to save agent config");
    } finally {
      setIsSaving(false);
    }
  };

  // Business Memory Management Functions
  const addMemory = () => {
    const newMemory: BusinessMemory = {
      title: "",
      content: "",
      isActive: true,
    };
    setEditingMemory(newMemory);
  };

  const editMemory = (memory: BusinessMemory) => {
    setEditingMemory(memory);
  };

  const saveMemory = async (memory: BusinessMemory) => {
    try {
      if (memory.id) {
        // Update existing memory
        const response = await api.agent.updateMemory(memory.id, memory);
        if (response.ok) {
          setBusinessMemories((prev) =>
            prev.map((m) => (m.id === memory.id ? response.data : m))
          );
          toast.success("Memory updated");
        } else {
          toast.error(response.error || "Failed to update memory");
        }
      } else {
        // Create new memory
        const response = await api.agent.createMemory(memory);
        if (response.ok) {
          setBusinessMemories((prev) => [...prev, response.data]);
          toast.success("Memory created");
        } else {
          toast.error(response.error || "Failed to create memory");
        }
      }
      setEditingMemory(null);
    } catch (error) {
      console.error("Error saving memory:", error);
      toast.error("Failed to save memory");
    }
  };

  const deleteMemory = async (memoryId: string) => {
    try {
      const response = await api.agent.deleteMemory(memoryId);
      if (response.ok) {
        setBusinessMemories((prev) => prev.filter((m) => m.id !== memoryId));
        toast.success("Memory deleted");
      } else {
        toast.error(response.error || "Failed to delete memory");
      }
    } catch (error) {
      console.error("Error deleting memory:", error);
      toast.error("Failed to delete memory");
    }
  };

  const cancelEdit = () => {
    setEditingMemory(null);
  };

  const testVoice = () => {
    if (!voice) {
      toast.error("Please select a voice first");
      return;
    }

    try {
      // Map voice values to custom file names
      const voiceFileMap: Record<string, string> = {
        verse: "darius-verse",
        sage: "zyra-sage",
        coral: "cortana-coral",
        ballad: "silver-ballad",
        alloy: "james-alloy",
      };

      const fileName = voiceFileMap[voice];
      if (!fileName) {
        toast.error("Voice sample not available");
        return;
      }

      // Create audio element with proper error handling
      const audio = new Audio();

      // Handle audio loading errors
      audio.addEventListener("error", (e) => {
        console.error("Audio loading error:", e);
        toast.error(`Failed to load voice sample for ${voice}`);
      });

      // Handle successful loading
      audio.addEventListener("canplaythrough", () => {
        audio.play();
        toast.success(`Playing test audio with ${voice} voice`);
      });

      // Set the source and start loading
      audio.src = `/assets/${fileName}.mp3`;
      audio.load();
    } catch (error) {
      console.error("Error playing voice sample:", error);
      toast.error("Failed to play voice sample. Please try again.");
    }
  };

  // no-op: we rely on button disabled state and server errors

  const ids = {
    firstMessage: useId(),
    systemPrompt: useId(),
    voice: useId(),
    responseModel: useId(),
    transcriptionModel: useId(),
    turnDetection: useId(),
    temperature: useId(),
    settings: useId(),
    memoryTitle: useId(),
    memoryContent: useId(),
  } as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="h-7 w-7" /> Agent Configuration
          </h1>
          <p className="text-gray-600 mt-2">
            Manage the AI agent voice, prompts, CRM data and realtime settings
          </p>
        </div>
        <Button onClick={saveAgentConfig} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="space-y-6">
        {activeAgentComponent === "knowledge" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" /> Prompts
              </CardTitle>
              <CardDescription>
                First message, business memory and optional system prompt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={ids.firstMessage}>First Message</Label>
                <Input
                  id={ids.firstMessage}
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                  placeholder="Hello, thanks for calling ..."
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Business Memories
                  </Label>
                  <Button onClick={addMemory} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Memory
                  </Button>
                </div>

                {businessMemories.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>
                      No business memories yet. Add some to help your AI agent
                      understand your business better.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {businessMemories.map((memory) => (
                      <div
                        key={memory.id || "temp"}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-gray-900">
                              {memory.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {memory.content}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  memory.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {memory.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              onClick={() => editMemory(memory)}
                              size="sm"
                              variant="ghost"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {memory.id && (
                              <Button
                                onClick={() =>
                                  memory.id && deleteMemory(memory.id)
                                }
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor={ids.systemPrompt}>
                  System Prompt (optional)
                </Label>
                <Textarea
                  id={ids.systemPrompt}
                  rows={4}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Additional guardrails and instructions"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeAgentComponent === "voice" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="h-5 w-5" /> Voice Selection
              </CardTitle>
              <CardDescription>
                Choose your AI agent's voice and test how it sounds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="max-w-2xl mx-auto">
                <div className="space-y-4">
                  <Label htmlFor={ids.voice} className="text-lg font-medium">
                    Select Voice
                  </Label>
                  <div className="flex items-center gap-3">
                    <Select value={voice} onValueChange={setVoice}>
                      <SelectTrigger
                        id={ids.voice}
                        className="h-12 text-lg flex-1"
                      >
                        <SelectValue placeholder="Select a voice" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alloy">
                          James - Neutral, balanced tone
                        </SelectItem>
                        <SelectItem value="ballad">
                          Silver - Smooth, melodic tone
                        </SelectItem>
                        <SelectItem value="coral">
                          Cortana - Bright, energetic voice
                        </SelectItem>
                        <SelectItem value="sage">
                          Zyra - Calm, wise voice
                        </SelectItem>
                        <SelectItem value="verse">
                          Darius - Rich, deep voice
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={testVoice}
                      className="h-10 px-6 bg-blue-600 hover:bg-blue-700"
                      disabled={!voice}
                    >
                      <Headphones className="h-5 w-5 mr-2" />
                      Play Voice
                    </Button>
                  </div>
                 
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeAgentComponent === "crm" && (
          <div className="space-y-6">
            {businessId ? (
              <CRMDocumentUpload businessId={businessId} />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Please select a business to manage CRM data
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Memory Edit Modal */}
      {editingMemory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingMemory.id ? "Edit Memory" : "Add Memory"}
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor={ids.memoryTitle}>Title</Label>
                <Input
                  id={ids.memoryTitle}
                  value={editingMemory.title}
                  onChange={(e) =>
                    setEditingMemory({
                      ...editingMemory,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g., Business Hours, Location, Services"
                />
              </div>
              <div>
                <Label htmlFor={ids.memoryContent}>Content</Label>
                <Textarea
                  id={ids.memoryContent}
                  value={editingMemory.content}
                  onChange={(e) =>
                    setEditingMemory({
                      ...editingMemory,
                      content: e.target.value,
                    })
                  }
                  placeholder="Describe the information..."
                  rows={4}
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={editingMemory.isActive}
                  onCheckedChange={(checked) =>
                    setEditingMemory({ ...editingMemory, isActive: checked })
                  }
                />
                <Label>Active</Label>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => saveMemory(editingMemory)}
                disabled={
                  !editingMemory.title.trim() || !editingMemory.content.trim()
                }
              >
                Save
              </Button>
              <Button onClick={cancelEdit} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
