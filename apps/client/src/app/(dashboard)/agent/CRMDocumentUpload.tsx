"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Upload, 
  FileText, 
  Database, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trash2
} from "lucide-react";
import { uploadCRMImportWithUploadThing } from "./crm-uploadthing-actions";
import { getCRMImportsFromBackend, deleteCRMImportFromBackend } from "./crm-backend-actions";
import { Progress } from "@/components/ui/progress";

interface CRMImport {
  id: string;
  fileName: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  recordsProcessed?: number;
  phoneNumbersFound?: number;
  errorMessage?: string;
  pineconeNamespace?: string;
  createdAt: string;
  updatedAt: string;
}

interface CRMDocumentUploadProps {
  businessId: string;
}

export default function CRMDocumentUpload({ businessId }: CRMDocumentUploadProps) {
  const [imports, setImports] = useState<CRMImport[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadImports = useCallback(async () => {
    if (!businessId) return;
    
    setIsLoading(true);
    try {
      const result = await getCRMImportsFromBackend();
      if (result.ok && result.data) {
        setImports(result.data as CRMImport[]);
      }
    } catch (error) {
      console.error("Error loading imports:", error);
      toast.error("Failed to load imports");
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  // Load imports on mount
  useEffect(() => {
    loadImports();
  }, [loadImports]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !businessId) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF, CSV, Excel, or TXT file");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('businessId', businessId);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadCRMImportWithUploadThing(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.ok) {
        toast.success("Document uploaded successfully! Processing will begin shortly.");
        await loadImports(); // Refresh the list
      } else {
        toast.error(result.error || "Failed to upload document");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload document");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleDeleteImport = async (importId: string) => {
    if (!confirm("Are you sure you want to delete this import? This action cannot be undone.")) {
      return;
    }

    try {
      const result = await deleteCRMImportFromBackend(importId);
      if (result.ok) {
        toast.success("Import deleted successfully");
        await loadImports(); // Refresh the list
      } else {
        toast.error(result.error || "Failed to delete import");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete import");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "PROCESSING":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      COMPLETED: "default",
      FAILED: "destructive",
      PROCESSING: "secondary",
      PENDING: "outline"
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status.toLowerCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            CRM Document Upload
          </CardTitle>
          <CardDescription>
            Upload customer data files (PDF, CSV, Excel, TXT) to enhance AI call personalization.
            Documents will be processed and stored as vector embeddings in Pinecone for customer recognition.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="crm-file-upload">Select Document</Label>
            <Input
              type="file"
              accept=".pdf,.csv,.xlsx,.xls,.txt"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="cursor-pointer"
            />
            <p className="text-sm text-muted-foreground">
              Supported formats: PDF, CSV, Excel (.xlsx, .xls), TXT (Max 10MB)
            </p>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading and processing...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            CRM Imports
          </CardTitle>
          <CardDescription>
            Manage your CRM imports and view processing status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading imports...</div>
            </div>
          ) : imports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No imports uploaded</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first CRM document to get started with customer recognition
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {imports.map((importItem) => (
                <div
                  key={importItem.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(importItem.status)}
                    <div>
                      <div className="font-medium">{importItem.fileName}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(importItem.createdAt).toLocaleDateString()}
                      </div>
                      {importItem.status === "COMPLETED" && (
                        <div className="text-sm text-green-600 mt-1">
                          {importItem.recordsProcessed} records • {importItem.phoneNumbersFound} phone numbers
                        </div>
                      )}
                      {importItem.status === "FAILED" && importItem.errorMessage && (
                        <div className="text-sm text-red-600 mt-1">
                          Error: {importItem.errorMessage}
                        </div>
                      )}
                      {importItem.pineconeNamespace && (
                        <div className="text-xs text-blue-600 mt-1">
                          Namespace: {importItem.pineconeNamespace}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(importItem.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteImport(importItem.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
