"use client";

import { useState, useId } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, Phone, FileText, Database } from "lucide-react";
interface SearchResult {
  id: string;
  score: number;
  content: string;
  metadata: Record<string, unknown>;
}

interface CRMSearchTestProps {
  businessId: string;
}

export default function CRMSearchTest({ businessId }: CRMSearchTestProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [textQuery, setTextQuery] = useState("");
  const [phoneResults, setPhoneResults] = useState<SearchResult[]>([]);
  const [textResults, setTextResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const phoneInputId = useId();
  const textInputId = useId();

  const searchByPhone = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/pinecone/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          phoneNumber: phoneNumber.trim(),
          topK: 10
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      setPhoneResults(data.results || []);
      
      console.log("Phone search response:", data);
      console.log("Phone search results:", data.results);
      
      if (data.results && data.results.length > 0) {
        toast.success(`Found ${data.results.length} results for phone number`);
      } else {
        toast.info("No results found for this phone number");
        console.log("No phone results found. Check server logs for phone number variants being searched.");
      }
    } catch (error) {
      console.error("Phone search error:", error);
      toast.error("Failed to search by phone number");
    } finally {
      setIsSearching(false);
    }
  };

  const searchByText = async () => {
    if (!textQuery.trim()) {
      toast.error("Please enter a text query");
      return;
    }

    setIsSearching(true);
    try {
      // First, generate embedding for the text query
      const embeddingResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          texts: [textQuery.trim()]
        }),
      });

      if (!embeddingResponse.ok) {
        throw new Error(`Embedding generation failed: ${embeddingResponse.statusText}`);
      }

      const embeddingData = await embeddingResponse.json();
      const queryEmbedding = embeddingData.embeddings[0];

      // Then search using the embedding
      const searchResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/pinecone/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          queryEmbedding,
          topK: 10
        }),
      });

      if (!searchResponse.ok) {
        throw new Error(`Search failed: ${searchResponse.statusText}`);
      }

      const data = await searchResponse.json();
      setTextResults(data.results || []);
      
      if (data.results && data.results.length > 0) {
        toast.success(`Found ${data.results.length} results for text query`);
      } else {
        toast.info("No results found for this text query");
      }
    } catch (error) {
      console.error("Text search error:", error);
      toast.error("Failed to search by text");
    } finally {
      setIsSearching(false);
    }
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            CRM Search Test
          </CardTitle>
          <CardDescription>
            Test the CRM search functionality to verify vector search is working with your imported data.
            Business ID: <Badge variant="outline">{businessId}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Phone Number Search */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <Label htmlFor={phoneInputId}>Search by Phone Number</Label>
            </div>
            <div className="flex gap-2">
              <Input
                id={phoneInputId}
                placeholder="Enter phone number (e.g., 555-123-4567 or +15551234567)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchByPhone()}
              />
              <Button 
                onClick={searchByPhone} 
                disabled={isSearching}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>
            
            {/* Phone Search Results */}
            {phoneResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Phone Search Results ({phoneResults.length})</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {phoneResults.map((result, index) => (
                    <div key={result.id} className="p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">Score: {(result.score * 100).toFixed(1)}%</Badge>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Content:</strong> {result.content.substring(0, 200)}
                        {result.content.length > 200 && "..."}
                      </div>
                      <div className="text-xs text-gray-500">
                        <strong>Metadata:</strong> {JSON.stringify(result.metadata, null, 2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Text Search */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <Label htmlFor={textInputId}>Search by Text Query</Label>
            </div>
            <div className="flex gap-2">
              <Input
                id={textInputId}
                placeholder="Enter text query (e.g., 'customer name', 'company', 'address')"
                value={textQuery}
                onChange={(e) => setTextQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchByText()}
              />
              <Button 
                onClick={searchByText} 
                disabled={isSearching}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>
            
            {/* Text Search Results */}
            {textResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Text Search Results ({textResults.length})</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {textResults.map((result, index) => (
                    <div key={result.id} className="p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">Score: {(result.score * 100).toFixed(1)}%</Badge>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Content:</strong> {result.content.substring(0, 200)}
                        {result.content.length > 200 && "..."}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        <strong>Phone Numbers in Metadata:</strong> 
                        {result.metadata.phoneNumbers ? (
                          <span className="ml-1 font-mono bg-yellow-100 px-1 rounded">
                            {JSON.stringify(result.metadata.phoneNumbers)}
                          </span>
                        ) : (
                          <span className="ml-1 text-red-500">None found</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        <strong>Full Metadata:</strong> {JSON.stringify(result.metadata, null, 2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Debug Info */}
          {phoneResults.length === 0 && phoneNumber && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Debug Info:</h4>
              <div className="text-sm text-yellow-800 space-y-1">
                <p><strong>Searching for:</strong> {phoneNumber}</p>
                <p><strong>Business ID:</strong> {businessId}</p>
                <p><strong>Namespace:</strong> business-{businessId}</p>
                <p className="text-xs mt-2">Check browser console and server logs for more details about the search variants being used.</p>
              </div>
            </div>
          )}

          {/* Test Instructions */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Test Instructions:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Phone Search:</strong> Try phone numbers from your imported Excel file</li>
              <li>• <strong>Text Search:</strong> Try customer names, company names, or addresses from your data</li>
              <li>• <strong>Expected Results:</strong> You should see relevant chunks of data with similarity scores</li>
              <li>• <strong>Metadata:</strong> Check that businessId, importId, and phoneNumbers are included</li>
              <li>• <strong>Debug:</strong> Check browser console for search details and server logs for phone variants</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
