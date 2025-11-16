"use client";

import { useState } from "react";
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
  MessageSquare,
  Plus,
  Trash2,
  Edit,
  Building2,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";

interface BusinessMemory {
  id?: string;
  title: string;
  content: string;
  isActive: boolean;
}

interface BusinessKnowledgeProps {
  firstMessage: string;
  setFirstMessage: (value: string) => void;
  businessMemories: BusinessMemory[];
  setBusinessMemories: React.Dispatch<React.SetStateAction<BusinessMemory[]>>;
  businessId: string | null;
  isLoading?: boolean;
  businessName: string;
  setBusinessName: (value: string) => void;
  businessDescription: string;
  setBusinessDescription: (value: string) => void;
  hasAgent: boolean;
  onCreateAgent: () => Promise<void>;
  isCreatingAgent: boolean;
}

export default function BusinessKnowledge({
  firstMessage,
  setFirstMessage,
  businessMemories,
  setBusinessMemories,
  businessId,
  isLoading = false,
  businessName,
  setBusinessName,
  businessDescription,
  setBusinessDescription,
  hasAgent,
  onCreateAgent,
  isCreatingAgent,
}: BusinessKnowledgeProps) {
  const [editingMemory, setEditingMemory] = useState<BusinessMemory | null>(null);
  const [memoryToDelete, setMemoryToDelete] = useState<BusinessMemory | null>(null);
  const [isSavingMemory, setIsSavingMemory] = useState(false);

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
    setIsSavingMemory(true);
    try {
      if (memory.id) {
        // Update existing memory
        const response = await api.agent.updateMemory(memory.id, memory);
        if (response.ok) {
          setBusinessMemories((prev: BusinessMemory[]) =>
            prev.map((m: BusinessMemory) => (m.id === memory.id ? response.data : m))
          );
          toast.success("Memory updated");
        } else {
          toast.error(response.error || "Failed to update memory");
        }
      } else {
        // Create new memory
        const response = await api.agent.createMemory(memory);
        if (response.ok) {
          setBusinessMemories((prev: BusinessMemory[]) => [...prev, response.data]);
          toast.success("Memory created");
        } else {
          toast.error(response.error || "Failed to create memory");
        }
      }
      setEditingMemory(null);
    } catch (error) {
      console.error("Error saving memory:", error);
      toast.error("Failed to save memory");
    } finally {
      setIsSavingMemory(false);
    }
  };

  const confirmDelete = (memory: BusinessMemory) => {
    setMemoryToDelete(memory);
  };

  const cancelDelete = () => {
    setMemoryToDelete(null);
  };

  const deleteMemory = async () => {
    if (!memoryToDelete?.id) return;

    try {
      const response = await api.agent.deleteMemory(memoryToDelete.id);
      if (response.ok) {
        setBusinessMemories((prev: BusinessMemory[]) => prev.filter((m: BusinessMemory) => m.id !== memoryToDelete.id));
        toast.success("Memory deleted");
        setMemoryToDelete(null);
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

  const ids = {
    firstMessage: "firstMessage",
    memoryTitle: "memoryTitle",
    memoryContent: "memoryContent",
  } as const;

  return (
    <>
      {/* Business Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" /> Business Details
          </CardTitle>
          <CardDescription>
            Your business name and description used for AI agent context
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Your Business Name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessDescription">Business Description</Label>
            <Textarea
              id="businessDescription"
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              placeholder="Describe your business, services, and what makes you unique..."
              rows={4}
            />
          </div>
          {!hasAgent && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-800">No AI Agent Found</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    You need to create an AI agent to enable voice calls. Make sure to fill in your business name and description above.
                  </p>
                  <Button
                    onClick={onCreateAgent}
                    disabled={isCreatingAgent || !businessName || !businessDescription}
                    className="mt-3 bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isCreatingAgent ? "Creating Agent..." : "Create AI Agent"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prompts Card */}
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

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
                <p className="text-gray-500">Loading business memories...</p>
              </div>
            ) : businessMemories.length === 0 ? (
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
                            onClick={() => confirmDelete(memory)}
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
          {/* <div className="space-y-2">
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
          </div> */}
        </CardContent>
      </Card>

      {/* Memory Edit Modal */}
      {editingMemory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
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
                  !editingMemory.title.trim() || 
                  !editingMemory.content.trim() || 
                  isSavingMemory
                }
              >
                {isSavingMemory ? "Saving..." : "Save"}
              </Button>
              <Button 
                onClick={cancelEdit} 
                variant="outline"
                disabled={isSavingMemory}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {memoryToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              Delete Memory
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{memoryToDelete.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={deleteMemory}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
              <Button onClick={cancelDelete} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
