"use client";

import { useEffect, useId, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Bot, Save, RefreshCcw, MessageSquare, Headphones, Settings, ChevronDown, Plus, Trash2, Edit } from "lucide-react";
import { useSession } from "next-auth/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";

interface BusinessMemory {
  id?: string;
  title: string;
  content: string;
  isActive: boolean;
}

export default function AgentForm() {
  const { data: session } = useSession();
  const [businessId, setBusinessId] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [businessMemories, setBusinessMemories] = useState<BusinessMemory[]>([]);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [voice, setVoice] = useState("alloy");
  const [responseModel, setResponseModel] = useState("gpt-4o-realtime-preview-2024-12-17");
  const [transcriptionModel, setTranscriptionModel] = useState("whisper-1");
  const [enableServerVAD, setEnableServerVAD] = useState(true);
  const [turnDetection, setTurnDetection] = useState("server_vad");
  const [temperature, setTemperature] = useState<string>("");
  const [settings, setSettings] = useState<string>("");
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingMemory, setEditingMemory] = useState<BusinessMemory | null>(null);

  // Attempt to auto-fill businessId from session if present
  useEffect(() => {
    const sid = (session as any)?.user?.businessId as string | undefined;
    if (sid && !businessId) setBusinessId(sid);
  }, [session, businessId]);

  const loadAgentConfig = useCallback(async () => {
    if (!businessId) return;
    
    setIsLoading(true);
    try {
      const response = await api.agent.getConfig();
      
      if (response.ok) {
        const { config, memories } = response.data;
        if (!config) {
          toast.info("No agent config found for this business yet");
          return;
        }
        setFirstMessage(config.firstMessage ?? "");
        setBusinessMemories(memories || []);
        setSystemPrompt(config.systemPrompt ?? "");
        setVoice(config.voice ?? "alloy");
        setResponseModel(config.responseModel ?? "gpt-4o-realtime-preview-2024-12-17");
        setTranscriptionModel(config.transcriptionModel ?? "whisper-1");
        setEnableServerVAD(config.enableServerVAD ?? true);
        setTurnDetection(config.turnDetection ?? "server_vad");
        setTemperature(config.temperature != null ? String(config.temperature) : "");
        setSettings(config.settings ? JSON.stringify(config.settings, null, 2) : "");
        toast.success("Loaded agent config and memories");
      } else {
        toast.error(response.error || "Failed to load config");
      }
    } catch (error) {
      console.error("Error loading agent config:", error);
      toast.error("Failed to load agent config");
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  // Auto-load when businessId is available once
  useEffect(() => {
    if (businessId && !hasLoadedOnce) {
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
          setBusinessMemories(prev => 
            prev.map(m => m.id === memory.id ? response.data : m)
          );
          toast.success("Memory updated");
        } else {
          toast.error(response.error || "Failed to update memory");
        }
      } else {
        // Create new memory
        const response = await api.agent.createMemory(memory);
        if (response.ok) {
          setBusinessMemories(prev => [...prev, response.data]);
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
        setBusinessMemories(prev => prev.filter(m => m.id !== memoryId));
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
          <p className="text-gray-600 mt-2">Manage the AI agent voice, prompts and realtime settings</p>
        </div>
        <Button onClick={saveAgentConfig} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" /> Business
          </CardTitle>
          <CardDescription>We auto-detected your Business ID from session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="businessId">Business ID</Label>
              <Input id="businessId" value={businessId} onChange={(e) => setBusinessId(e.target.value)} placeholder="business id" disabled={!!businessId} />
            </div>
            <Button onClick={loadAgentConfig} disabled={isLoading} className="pb-0.5">
              <RefreshCcw className="h-4 w-4 mr-2" />
              {isLoading ? "Loading..." : "Load"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" /> Prompts
          </CardTitle>
          <CardDescription>First message, business memory and optional system prompt</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={ids.firstMessage}>First Message</Label>
            <Input id={ids.firstMessage} value={firstMessage} onChange={(e) => setFirstMessage(e.target.value)} placeholder="Hello, thanks for calling ..." />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Business Memories</Label>
              <Button onClick={addMemory} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Memory
              </Button>
            </div>
            
            {businessMemories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No business memories yet. Add some to help your AI agent understand your business better.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {businessMemories.map((memory) => (
                  <div key={memory.id || 'temp'} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900">{memory.title}</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{memory.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            memory.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {memory.isActive ? 'Active' : 'Inactive'}
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
                            onClick={() => deleteMemory(memory.id!)}
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
            <Label htmlFor={ids.systemPrompt}>System Prompt (optional)</Label>
            <Textarea id={ids.systemPrompt} rows={4} value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} placeholder="Additional guardrails and instructions" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5" /> Voice & Realtime
          </CardTitle>
          <CardDescription>Voice, model, transcription and VAD settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={ids.voice}>Voice</Label>
              <Select value={voice} onValueChange={setVoice}>
                <SelectTrigger id={ids.voice}>
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alloy">alloy</SelectItem>
                  <SelectItem value="ash">ash</SelectItem>
                  <SelectItem value="ballad">ballad</SelectItem>
                  <SelectItem value="coral">coral</SelectItem>
                  <SelectItem value="echo">echo</SelectItem>
                  <SelectItem value="sage">sage</SelectItem>
                  <SelectItem value="shimmer">shimmer</SelectItem>
                  <SelectItem value="verse">verse</SelectItem>
                  <SelectItem value="marin">marin</SelectItem>
                  <SelectItem value="cedar">cedar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={ids.responseModel}>Response Model</Label>
              <Select value={responseModel} onValueChange={setResponseModel}>
                <SelectTrigger id={ids.responseModel}>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-realtime-preview-2024-12-17">gpt-4o-realtime-preview-2024-12-17</SelectItem>
                  <SelectItem value="gpt-4o-realtime-preview-2024-10-01">gpt-4o-realtime-preview-2024-10-01</SelectItem>
                  <SelectItem value="gpt-4o-mini-realtime-preview-2024-12-17">gpt-4o-mini-realtime-preview-2024-12-17</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={ids.transcriptionModel}>Transcription Model</Label>
              <Select value={transcriptionModel} onValueChange={setTranscriptionModel}>
                <SelectTrigger id={ids.transcriptionModel}>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whisper-1">whisper-1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={ids.turnDetection}>Turn Detection</Label>
              <Input id={ids.turnDetection} value={turnDetection} onChange={(e) => setTurnDetection(e.target.value)} placeholder="server_vad" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Enable Server VAD</Label>
              <div className="flex items-center gap-3">
                <Switch checked={enableServerVAD} onCheckedChange={setEnableServerVAD} />
                <span className="text-sm text-gray-600">Detect turns on server</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={ids.temperature}>Temperature</Label>
              <Input id={ids.temperature} type="number" step="0.1" min="0" max="2" value={temperature} onChange={(e) => setTemperature(e.target.value)} placeholder="e.g., 0.7" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Advanced</CardTitle>
          <CardDescription>Optional JSON settings stored as-is</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor={ids.settings}>Settings (JSON)</Label>
          <Textarea id={ids.settings} rows={6} value={settings} onChange={(e) => setSettings(e.target.value)} placeholder='{"example":true}' />
        </CardContent>
      </Card>

      {/* Memory Edit Modal */}
      {editingMemory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingMemory.id ? 'Edit Memory' : 'Add Memory'}
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor={ids.memoryTitle}>Title</Label>
                <Input
                  id={ids.memoryTitle}
                  value={editingMemory.title}
                  onChange={(e) => setEditingMemory({...editingMemory, title: e.target.value})}
                  placeholder="e.g., Business Hours, Location, Services"
                />
              </div>
              <div>
                <Label htmlFor={ids.memoryContent}>Content</Label>
                <Textarea
                  id={ids.memoryContent}
                  value={editingMemory.content}
                  onChange={(e) => setEditingMemory({...editingMemory, content: e.target.value})}
                  placeholder="Describe the information..."
                  rows={4}
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={editingMemory.isActive}
                  onCheckedChange={(checked) => setEditingMemory({...editingMemory, isActive: checked})}
                />
                <Label>Active</Label>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => saveMemory(editingMemory)}
                disabled={!editingMemory.title.trim() || !editingMemory.content.trim()}
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