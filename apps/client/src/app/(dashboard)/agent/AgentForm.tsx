"use client";

import { useEffect, useId, useMemo, useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Bot, Save, RefreshCcw, MessageSquare, Headphones, Settings, ChevronDown } from "lucide-react";
import { loadAgentConfig, saveAgentConfig } from "./actions";
import { useSession } from "next-auth/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Please wait..." : children}
    </Button>
  );
}

export default function AgentForm() {
  const { data: session } = useSession();
  const [businessId, setBusinessId] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [agentLLM, setAgentLLM] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [voice, setVoice] = useState("alloy");
  const [responseModel, setResponseModel] = useState("gpt-4o-realtime-preview-2024-12-17");
  const [transcriptionModel, setTranscriptionModel] = useState("whisper-1");
  const [enableServerVAD, setEnableServerVAD] = useState(true);
  const [turnDetection, setTurnDetection] = useState("server_vad");
  const [temperature, setTemperature] = useState<string>("");
  const [settings, setSettings] = useState<string>("");
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Server action state machines
  const [loadState, loadAction] = useActionState(loadAgentConfig as any, null);
  const [saveState, saveAction] = useActionState(saveAgentConfig as any, null);

  // Attempt to auto-fill businessId from session if present
  useEffect(() => {
    const sid = (session as any)?.user?.businessId as string | undefined;
    if (sid && !businessId) setBusinessId(sid);
  }, [session, businessId]);

  // Auto-load when businessId is available once
  useEffect(() => {
    if (businessId && !hasLoadedOnce) {
      const fd = new FormData();
      fd.set("businessId", businessId);
      // biome-ignore lint/suspicious/noExplicitAny: server action dispatcher typing
      (loadAction as any)(fd);
      setHasLoadedOnce(true);
    }
  }, [businessId, hasLoadedOnce, loadAction]);

  // When loadState changes with data, hydrate the form
  useEffect(() => {
    if (loadState && (loadState as any).ok) {
      const cfg = (loadState as any).data;
      if (!cfg) {
        toast.info("No agent config found for this business yet");
        return;
      }
      setFirstMessage(cfg.firstMessage ?? "");
      setAgentLLM(cfg.agentLLM ?? "");
      setSystemPrompt(cfg.systemPrompt ?? "");
      setVoice(cfg.voice ?? "alloy");
      setResponseModel(cfg.responseModel ?? "gpt-4o-realtime-preview-2024-12-17");
      setTranscriptionModel(cfg.transcriptionModel ?? "whisper-1");
      setEnableServerVAD(cfg.enableServerVAD ?? true);
      setTurnDetection(cfg.turnDetection ?? "server_vad");
      setTemperature(cfg.temperature != null ? String(cfg.temperature) : "");
      setSettings(cfg.settings ? JSON.stringify(cfg.settings, null, 2) : "");
      toast.success("Loaded agent config");
    } else if (loadState && !(loadState as any).ok) {
      toast.error((loadState as any).error || "Failed to load config");
    }
  }, [loadState]);

  // When saveState changes
  useEffect(() => {
    if (saveState && (saveState as any).ok) {
      toast.success("Agent config saved");
      // Re-load from server to ensure UI reflects normalized values
      if (businessId) {
        const fd = new FormData();
        fd.set("businessId", businessId);
        // trigger server action to fetch latest
        // loadAction accepts FormData from useActionState
        // biome-ignore lint/suspicious/noExplicitAny: server action dispatcher typing
        (loadAction as any)(fd);
      }
    } else if (saveState && !(saveState as any).ok) {
      toast.error((saveState as any).error || "Failed to save config");
    }
  }, [saveState, businessId, loadAction]);

  // no-op: we rely on button disabled state and server errors

  const ids = {
    firstMessage: useId(),
    agentLLM: useId(),
    systemPrompt: useId(),
    voice: useId(),
    responseModel: useId(),
    transcriptionModel: useId(),
    turnDetection: useId(),
    temperature: useId(),
    settings: useId(),
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
        <form action={saveAction}>
          <input type="hidden" name="businessId" value={businessId} />
          <input type="hidden" name="firstMessage" value={firstMessage} />
          <input type="hidden" name="agentLLM" value={agentLLM} />
          <input type="hidden" name="systemPrompt" value={systemPrompt} />
          <input type="hidden" name="voice" value={voice} />
          <input type="hidden" name="responseModel" value={responseModel} />
          <input type="hidden" name="transcriptionModel" value={transcriptionModel} />
          <input type="hidden" name="enableServerVAD" value={String(enableServerVAD)} />
          <input type="hidden" name="turnDetection" value={turnDetection} />
          <input type="hidden" name="temperature" value={temperature} />
          <input type="hidden" name="settings" value={settings} />
          <SubmitButton>
            <Save className="h-4 w-4 mr-2" /> Save
          </SubmitButton>
        </form>
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
            <form action={loadAction} className="pb-0.5">
              <input type="hidden" name="businessId" value={businessId} />
              <SubmitButton>
                <RefreshCcw className="h-4 w-4 mr-2" /> Load
              </SubmitButton>
            </form>
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
          <details className="group rounded-md border border-gray-200 bg-white">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-sm font-medium text-gray-800">
              <span>Agent Memory (Business Context)</span>
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="space-y-2 border-t border-gray-200 p-3 pt-2">
              <Label htmlFor={ids.agentLLM} className="sr-only">Agent Memory (Business Context)</Label>
              <Textarea id={ids.agentLLM} rows={10} value={agentLLM} onChange={(e) => setAgentLLM(e.target.value)} placeholder="Describe your services, policies, FAQs, etc." />
            </div>
          </details>
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
    </div>
  );
}