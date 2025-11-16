"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Bot,
  Save,
} from "lucide-react";
import { api, apiRequest } from "@/lib/api";
import { useAgentContext } from "@/contexts/AgentContext";
import BusinessKnowledge from "./components/BusinessKnowledge";
import VoiceSelection from "./components/VoiceSelection";
import CRMData from "./components/CRMData";
import { AgentTools } from "./components/AgentTools";

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
  const [voice, setVoice] = useState("james");
  const [temperature, setTemperature] = useState<string>("");
  const [settings, setSettings] = useState<string>("");
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // ElevenLabs specific fields
  const [agentId, setAgentId] = useState<string>("");
  const [voiceId, setVoiceId] = useState<string>("");
  // Business details
  const [businessName, setBusinessName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [hasAgent, setHasAgent] = useState(false);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);

  const loadAgentConfig = useCallback(async () => {
    if (!businessId) {
      console.log("No business ID available for loading config");
      return;
    }

    console.log("Loading agent config for business ID:", businessId);
    setIsLoading(true);

    try {
      const response = await api.agent.getConfig();
      console.log("Agent config response:", response);

      if (response.ok) {
        const { config, memories, business } = response.data;
        console.log("Config:", config, "Memories:", memories, "Business:", business);

        // Load business details
        if (business) {
          setBusinessName(business.name || "");
          setBusinessDescription(business.description || "");
        }

        // Always load memories, even if config is null
        setBusinessMemories(memories || []);

        if (!config) {
          setHasAgent(false);
          toast.info(`No agent config found yet. Loaded ${memories?.length || 0} memories.`);
          return;
        }
        setHasAgent(true);
        setFirstMessage(config.firstMessage ?? "");
        setSystemPrompt(config.systemPrompt ?? "");
        setVoice(config.voice ?? "james");
        setTemperature(
          config.temperature != null ? String(config.temperature) : ""
        );
        setSettings(
          config.settings ? JSON.stringify(config.settings, null, 2) : ""
        );
        // ElevenLabs specific fields
        setAgentId(config.agentId ?? "");
        setVoiceId(config.voiceId ?? "");
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
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  // Auto-load when businessId is available once
  useEffect(() => {
    console.log("Business ID check:", {
      contextBusinessId: businessId,
      hasLoadedOnce
    });
    
    if (businessId && !hasLoadedOnce) {
      console.log("Loading agent config for the first time");
      loadAgentConfig();
      setHasLoadedOnce(true);
    }
  }, [businessId, hasLoadedOnce, loadAgentConfig]);

  const onCreateAgent = async () => {
    if (!businessId) {
      toast.error("Missing business ID");
      return;
    }

    if (!businessName || !businessDescription) {
      toast.error("Please fill in business name and description");
      return;
    }

    setIsCreatingAgent(true);
    try {
      const response = await apiRequest('/agent/elevenlabs/create', {
        method: 'POST',
        body: JSON.stringify({
          businessName,
          businessDescription,
          voiceName: getVoiceName(voice),
          firstMessage: firstMessage || "Hello! How can I assist you today?",
        }),
      });

      if (response.ok) {
        toast.success("AI Agent created successfully");
        setHasAgent(true);
        await loadAgentConfig();
      } else {
        toast.error(response.error || "Failed to create agent");
      }
    } catch (error) {
      console.error("Error creating agent:", error);
      toast.error("Failed to create agent");
    } finally {
      setIsCreatingAgent(false);
    }
  };

  const getVoiceName = (voiceId: string): string => {
    const voiceMap: Record<string, string> = {
      'james': 'James',
      'peter': 'Peter', 
      'hope': 'Hope',
      'emmanuel': 'Emmanuel',
      'stella': 'Stella'
    };
    return voiceMap[voiceId] || voiceId;
  };

  const saveAgentConfig = async () => {
    if (!businessId) {
      toast.error("Missing business ID. Please complete onboarding first.");
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
        temperature: temperature ? Number.parseFloat(temperature) : null,
        settings: parsedSettings,
      };

      const response = await api.agent.saveConfig(configData);

      if (response.ok) {
        // If voice changed, update the ElevenLabs agent voice
        if (voice) {
          try {
            const getElevenLabsVoiceId = (voiceName: string): string => {
              const voiceIdMap: Record<string, string> = {
                'james': 'Smxkoz0xiOoHo5WcSskf',
                'peter': 'ChO6kqkVouUn0s7HMunx',
                'hope': 'zGjIP4SZlMnY9m93k97r',
                'emmanuel': '77aEIu0qStu8Jwv1EdhX',
                'stella': '2vbhUP8zyKg4dEZaTWGn'
              };
              return voiceIdMap[voiceName] || voiceName;
            };

            await api.voice.update({ 
              voice, 
              voiceId: getElevenLabsVoiceId(voice), // Use actual ElevenLabs voice ID
              voiceName: getVoiceName(voice) 
            });
            toast.success("Agent config and voice updated");
          } catch (voiceError) {
            console.error("Error updating voice:", voiceError);
            toast.success("Agent config saved, but voice update failed");
          }
        } else {
          toast.success("Agent config saved");
        }
        
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


  // no-op: we rely on button disabled state and server errors


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
          <BusinessKnowledge
            firstMessage={firstMessage}
            setFirstMessage={setFirstMessage}
            businessMemories={businessMemories}
            setBusinessMemories={setBusinessMemories}
            businessId={businessId}
            isLoading={isLoading}
            businessName={businessName}
            setBusinessName={setBusinessName}
            businessDescription={businessDescription}
            setBusinessDescription={setBusinessDescription}
            hasAgent={hasAgent}
            onCreateAgent={onCreateAgent}
            isCreatingAgent={isCreatingAgent}
          />
        )}

        {activeAgentComponent === "voice" && (
          <VoiceSelection
            voice={voice}
            setVoice={setVoice}
            businessId={businessId}
            loadAgentConfig={loadAgentConfig}
          />
        )}

        {activeAgentComponent === "crm" && (
          <CRMData businessId={businessId} />
        )}

        {activeAgentComponent === "tools" && (
          <AgentTools hasAgent={hasAgent} />
        )}
      </div>

    </div>
  );
}
