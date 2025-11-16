"use server";

import { db } from "@repo/db";
import { revalidatePath } from "next/cache";

export type AgentConfigPayload = {
  businessId: string;
  firstMessage?: string | null;
  systemPrompt?: string | null;
  voice?: string | null;
  temperature?: number | null;
  askForName?: boolean;
  askForPhone?: boolean;
  askForEmail?: boolean;
  askForCompany?: boolean;
  askForAddress?: boolean;
  goodbyeMessage?: string | null;
};

export async function getAgentConfig(businessId: string) {
  if (!businessId) return null;

  // Get config from ElevenLabsAgent (single source of truth)
  const agent = await db.elevenLabsAgent.findUnique({ where: { businessId } });

  if (!agent) return null;

  // Transform to config format for backwards compatibility
  return {
    id: agent.id,
    businessId: agent.businessId,
    firstMessage: agent.firstMessage,
    goodbyeMessage: agent.goodbyeMessage,
    systemPrompt: agent.systemPrompt,
    voice: agent.voiceName,
    temperature: agent.temperature,
    askForName: agent.askForName,
    askForPhone: agent.askForPhone,
    askForEmail: agent.askForEmail,
    askForCompany: agent.askForCompany,
    askForAddress: agent.askForAddress,
    settings: agent.settings,
    createdAt: agent.createdAt,
    updatedAt: agent.updatedAt,
    // ElevenLabs specific fields
    agentId: agent.agentId,
    voiceId: agent.voiceId,
    voiceName: agent.voiceName,
  };
}

export async function loadAgentConfig(_prevState: unknown, formData: FormData) {
  const businessId = String(formData.get("businessId") || "").trim();
  if (!businessId) return { ok: false, error: "Missing businessId" };
  const cfg = await getAgentConfig(businessId);
  return { ok: true, data: cfg ?? null };
}

export async function saveAgentConfig(_prevState: unknown, formData: FormData) {
  const businessId = String(formData.get("businessId") || "").trim();
  if (!businessId) return { ok: false, error: "Missing businessId" };

  const toStr = (k: string) => {
    const v = formData.get(k);
    return v == null ? null : String(v);
  };
  const toNum = (k: string) => {
    const raw = formData.get(k);
    if (raw == null || String(raw).trim() === "") return null;
    const n = Number(raw);
    return Number.isNaN(n) ? null : n;
  };

  // NOTE: This is a simplified version that only updates local database
  // For full functionality, the frontend should call the server API to update
  // the ElevenLabs agent as well (which handles hash-based change detection)

  // Check if agent exists
  const existingAgent = await db.elevenLabsAgent.findUnique({
    where: { businessId }
  });

  if (!existingAgent) {
    return { ok: false, error: "No agent found. Please complete onboarding first." };
  }

  // Update ElevenLabsAgent settings in database
  // Note: This doesn't update the actual ElevenLabs agent - use server API for that
  await db.elevenLabsAgent.update({
    where: { businessId },
    data: {
      firstMessage: toStr("firstMessage"),
      systemPrompt: toStr("systemPrompt"),
      temperature: toNum("temperature"),
      // Voice changes should go through server API
    },
  });

  revalidatePath("/dashboard/agent");
  return { ok: true };
}
