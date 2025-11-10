import type { ReactNode } from "react";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatPhoneNumber } from "@/lib/phoneUtils";

interface DashboardHeaderProps {
  pageTitle: string;
  businessPhoneNumber?: string;
  headerActions?: ReactNode;
}

export default function DashboardHeader({
  pageTitle,
  businessPhoneNumber,
  headerActions,
}: DashboardHeaderProps) {

  return (
    <>
      {/* Header */}
      <header className="border-b relative">
        <div className="flex h-16 shrink-0 items-center px-4 mx-auto w-full max-w-[1200px]">
          <SidebarTrigger className="relative sm:absolute sm:left-4 sm:-ml-1" />
          <div className="flex items-center justify-between w-full ml-2 sm:ml-8">
            {/* Page Title - responsive text size */}
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground truncate max-w-[200px] sm:max-w-none">
              {pageTitle}
            </h2>
            
            {/* Right side actions */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Business phone number - hidden on very small screens */}
              {businessPhoneNumber && (
                <div className="text-xs sm:text-sm text-muted-foreground hidden xs:block">
                  <span className="font-medium hidden sm:inline">Your number:</span>
                  <span className="font-medium sm:hidden">#:</span> 
                  <span className="hidden sm:inline">{formatPhoneNumber(businessPhoneNumber)}</span>
                  <span className="sm:hidden">{businessPhoneNumber.replace(/\D/g, '').slice(-4)}</span>
                </div>
              )}
              
              {/* AI Phone Number Display */}
              {businessPhoneNumber && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/agent"
                      className="text-sm sm:text-base font-bold text-foreground bg-primary/10 hover:bg-primary/20 border border-primary/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer flex items-center gap-2"
                    >
                      <span className="font-semibold">AI Number:</span>
                      <span className="font-mono font-bold text-primary">
                        {formatPhoneNumber(businessPhoneNumber)}
                      </span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="text-sm">
                      Forward your existing line to this number to use our AI service
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              {/* Header actions */}
              <div className="flex items-center">
                {headerActions}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filter Bar - Mobile Responsive */}
      {/* <div className="pb-4 sm:pb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 px-4 mx-auto w-full max-w-[1200px] pt-4 sm:pt-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 sm:gap-2 bg-transparent text-xs sm:text-sm px-2 sm:px-3"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Filter</span>
              <span className="xs:hidden">Filter</span>
            </Button>
            <Input 
              placeholder={searchPlaceholder} 
              className="flex-1 sm:max-w-md text-sm" 
            />
          </div>
        </div>
      </div> */}
    </>
  );
}