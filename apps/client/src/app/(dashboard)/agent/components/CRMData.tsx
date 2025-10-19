"use client";

import CRMDocumentUpload from "../CRMDocumentUpload";

interface CRMDataProps {
  businessId: string | null;
}

export default function CRMData({ businessId }: CRMDataProps) {
  return (
    <div className="space-y-6">
      {businessId ? (
        <CRMDocumentUpload businessId={businessId} />
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Please select a business to manage CRM data
          </p>
        </div>
      )}
    </div>
  );
}
