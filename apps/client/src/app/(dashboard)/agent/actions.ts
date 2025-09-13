"use server";

import { db } from "@repo/db";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

export type AgentConfigPayload = {
  businessId: string;
  firstMessage?: string | null;
  systemPrompt?: string | null;
  voice?: string | null;
  responseModel?: string | null;
  transcriptionModel?: string | null;
  enableServerVAD?: boolean | null;
  turnDetection?: string | null;
  temperature?: number | null;
  settings?: unknown;
};

export async function getAgentConfig(businessId: string) {
  if (!businessId) return null;
  return db.aIAgentConfig.findUnique({ where: { businessId } });
}

export async function loadAgentConfig(_prevState: unknown, formData: FormData) {
  const businessId = String(formData.get("businessId") || "").trim();
  if (!businessId) return { ok: false, error: "Missing businessId" };
  const cfg = await db.aIAgentConfig.findUnique({ where: { businessId } });
  return { ok: true, data: cfg ?? null };
}

export async function saveAgentConfig(_prevState: unknown, formData: FormData) {
  const businessId = String(formData.get("businessId") || "").trim();
  if (!businessId) return { ok: false, error: "Missing businessId" };

  const toStr = (k: string) => {
    const v = formData.get(k);
    return v == null ? null : String(v);
  };
  const toBool = (k: string) => String(formData.get(k) || "") === "on" || String(formData.get(k) || "") === "true";
  const toNum = (k: string) => {
    const raw = formData.get(k);
    if (raw == null || String(raw).trim() === "") return null;
    const n = Number(raw);
    return Number.isNaN(n) ? null : n;
  };

  let parsedSettings: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | null | undefined = undefined;
  const settingsStr = toStr("settings");
  if (settingsStr) {
    try {
      parsedSettings = JSON.parse(settingsStr) as Prisma.InputJsonValue;
    } catch {
      return { ok: false, error: "Invalid JSON in settings" };
    }
  }

  const data: Prisma.AIAgentConfigUncheckedUpdateInput = {
    firstMessage: toStr("firstMessage"),
    systemPrompt: toStr("systemPrompt"),
    voice: toStr("voice") ?? undefined,
    responseModel: toStr("responseModel") ?? undefined,
    transcriptionModel: toStr("transcriptionModel") ?? undefined,
    enableServerVAD: toBool("enableServerVAD"),
    turnDetection: toStr("turnDetection") ?? undefined,
    temperature: toNum("temperature"),
    settings: parsedSettings,
  } as const;

  await db.aIAgentConfig.upsert({
    where: { businessId },
    update: { ...data },
    create: { businessId, ...data } as Prisma.AIAgentConfigUncheckedCreateInput,
  });

  revalidatePath("/dashboard/agent");
  return { ok: true };
}
