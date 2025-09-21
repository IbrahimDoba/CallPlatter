import { logger } from "../../utils/logger";

export interface CallState {
  businessId: string | null;
  businessName: string | null;
  callerNumber: string | null;
  streamSid: string | null;
  latestMediaTimestamp: number;
  lastAssistantItem: string | null;
  markQueue: string[];
  responseStartTimestampTwilio: number | null;
  sessionConfigured: boolean;
  callId: string | null;
  callStartTime: Date | null;
  memoriesInjected: boolean;
}

export class CallStateService {
  private state: CallState = {
    businessId: null,
    businessName: null,
    callerNumber: null,
    streamSid: null,
    latestMediaTimestamp: 0,
    lastAssistantItem: null,
    markQueue: [],
    responseStartTimestampTwilio: null,
    sessionConfigured: false,
    callId: null,
    callStartTime: null,
    memoriesInjected: false,
  };

  /**
   * Update multiple state properties at once
   */
  updateState(updates: Partial<CallState>): void {
    this.state = { ...this.state, ...updates };
    logger.debug("Call state updated", { updates });
  }

  /**
   * Get current state
   */
  getState(): CallState {
    return { ...this.state };
  }

  /**
   * Get specific state property
   */
  get<K extends keyof CallState>(key: K): CallState[K] {
    return this.state[key];
  }

  /**
   * Set specific state property
   */
  set<K extends keyof CallState>(key: K, value: CallState[K]): void {
    this.state[key] = value;
    logger.debug("Call state property updated", { key, value });
  }

  /**
   * Reset state to initial values
   */
  reset(): void {
    this.state = {
      businessId: null,
      businessName: null,
      callerNumber: null,
      streamSid: null,
      latestMediaTimestamp: 0,
      lastAssistantItem: null,
      markQueue: [],
      responseStartTimestampTwilio: null,
      sessionConfigured: false,
      callId: null,
      callStartTime: null,
      memoriesInjected: false,
    };
    logger.info("Call state reset");
  }

  /**
   * Check if session is configured
   */
  isSessionConfigured(): boolean {
    return this.state.sessionConfigured;
  }

  /**
   * Check if memories have been injected
   */
  areMemoriesInjected(): boolean {
    return this.state.memoriesInjected;
  }

  /**
   * Mark session as configured
   */
  markSessionConfigured(): void {
    this.set("sessionConfigured", true);
  }

  /**
   * Mark memories as injected
   */
  markMemoriesInjected(): void {
    this.set("memoriesInjected", true);
  }

  /**
   * Add item to mark queue
   */
  addToMarkQueue(item: string): void {
    this.state.markQueue.push(item);
  }

  /**
   * Remove item from mark queue
   */
  removeFromMarkQueue(): string | undefined {
    return this.state.markQueue.shift();
  }

  /**
   * Clear mark queue
   */
  clearMarkQueue(): void {
    this.state.markQueue = [];
  }

  /**
   * Get call duration in seconds
   */
  getCallDuration(): number {
    if (!this.state.callStartTime) return 0;
    return Math.floor((Date.now() - this.state.callStartTime.getTime()) / 1000);
  }
}
