"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@repo/db";

export type CRMImportsResult = {
  ok: boolean;
  error?: string;
  data?: Array<{
    id: string;
    fileName: string;
    status: string;
    recordsProcessed?: number;
    phoneNumbersFound?: number;
    errorMessage?: string;
    pineconeNamespace?: string;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type CRMImportDeleteResult = {
  ok: boolean;
  error?: string;
};

export async function getCRMImportsFromBackend(): Promise<CRMImportsResult> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.businessId) {
      return { ok: false, error: "Authentication required" };
    }

    const businessId = session.user.businessId;

    const imports = await db.cRMImport.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      ok: true,
      data: imports.map(imp => ({
        id: imp.id,
        fileName: imp.fileName,
        status: imp.status,
        recordsProcessed: imp.recordsProcessed || undefined,
        phoneNumbersFound: imp.phoneNumbersFound || undefined,
        errorMessage: imp.errorMessage || undefined,
        pineconeNamespace: imp.pineconeNamespace || undefined,
        createdAt: imp.createdAt.toISOString(),
        updatedAt: imp.updatedAt.toISOString(),
      }))
    };
  } catch (error) {
    console.error("Get imports error:", error);
    return { 
      ok: false, 
      error: error instanceof Error ? error.message : "Failed to load imports" 
    };
  }
}

export async function deleteCRMImportFromBackend(importId: string): Promise<CRMImportDeleteResult> {
  try {
    if (!importId) {
      return { ok: false, error: "Missing importId" };
    }

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.businessId) {
      return { ok: false, error: "Authentication required" };
    }

    const businessId = session.user.businessId;

    // TODO: Also delete from Pinecone namespace
    // For now, just delete the import record
    await db.cRMImport.delete({
      where: { 
        id: importId,
        businessId // Ensure user can only delete their own business imports
      }
    });

    return { ok: true };
  } catch (error) {
    console.error("Delete import error:", error);
    return { 
      ok: false, 
      error: error instanceof Error ? error.message : "Failed to delete import" 
    };
  }
}
