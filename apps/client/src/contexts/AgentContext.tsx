"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface AgentContextType {
  activeAgentComponent: string;
  setActiveAgentComponent: (component: string) => void;
  businessId: string;
  setBusinessId: (id: string) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [activeAgentComponent, setActiveAgentComponent] = useState<string>("knowledge");
  const [businessId, setBusinessId] = useState<string>("");

  return (
    <AgentContext.Provider value={{ activeAgentComponent, setActiveAgentComponent, businessId, setBusinessId }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgentContext() {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error("useAgentContext must be used within an AgentProvider");
  }
  return context;
}
