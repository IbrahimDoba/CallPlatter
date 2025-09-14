import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import WebCallModal from "@/components/module/call/WebCallModal";
import { Globe, Settings } from "lucide-react";

interface DashboardHeaderProps {
  pageTitle: string;
  businessName: string;
  businessId: string;
  businessPhoneNumber?: string;
  headerActions?: ReactNode;
  searchPlaceholder?: string;
}

export default function DashboardHeader({
  pageTitle,
  businessName,
  businessId,
  businessPhoneNumber,
  headerActions,
  searchPlaceholder = "Search...",
}: DashboardHeaderProps) {
  const [isWebCallModalOpen, setIsWebCallModalOpen] = useState(false);

  return (
    <>
      {/* Header */}
      <header className="border-b">
        <div className="flex h-16 shrink-0 items-center gap-2 px-4 mx-auto w-full max-w-[1200px]">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center justify-between w-full">
            <h2 className="text-2xl font-semibold text-foreground">
              {pageTitle}
            </h2>
            <div className="flex items-center gap-3">
              {businessPhoneNumber && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Your number:</span> {businessPhoneNumber}
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
                onClick={() => setIsWebCallModalOpen(true)}
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Web call</span>
              </Button>
              <WebCallModal
                isOpen={isWebCallModalOpen}
                onClose={() => setIsWebCallModalOpen(false)}
                businessName={businessName}
                businessId={businessId}
              />
              {headerActions}
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filter Bar */}
      {/* <div className=" pb-6">
        <div className="flex items-center gap-4 px-4 mx-auto w-full max-w-[1200px] pt-4 sm:pt-6">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-transparent"
        >
          <Settings className="h-4 w-4" />
          Filter
        </Button>
          <Input placeholder={searchPlaceholder} className="max-w-md" />
        </div>
      </div> */}
    </>
  );
}