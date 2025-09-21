"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import DashboardHeader from "@/components/layout/AppHeader";
import AppSidebar, { navigation } from "@/components/layout/Appsidebar";
import { getBusinessInfo } from "@/app/actions/business";
import { AgentProvider, useAgentContext } from "@/contexts/AgentContext";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  headerActions?: ReactNode;
  searchPlaceholder?: string;
}

// Wrapper component to set business ID in context
function BusinessIdProvider({ businessId, children }: { businessId: string; children: ReactNode }) {
  const { setBusinessId } = useAgentContext();
  
  useEffect(() => {
    if (businessId) {
      setBusinessId(businessId);
    }
  }, [businessId, setBusinessId]);
  
  return <>{children}</>;
}


export default function DashboardLayout({
  children,
  title,
  headerActions,
  searchPlaceholder = "Search...",
}: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [businessInfo, setBusinessInfo] = useState<{id: string; name: string; phoneNumber: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBusinessInfo() {
      if (status !== 'authenticated') {
        setIsLoading(false);
        return;
      }

      try {
        const result = await getBusinessInfo();
        if (result.success) {
          setBusinessInfo(result.business ? { ...result.business, phoneNumber: (result.business as { phoneNumber?: string }).phoneNumber || '' } : null);
          console.log('Business info fetched:', result.business);
        } else {
          console.error('Error fetching business info:', result.error);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBusinessInfo();
  }, [status]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push("/signin");
    }
  }, [status, router]);

  // Show loading state while session is being checked or business info is loading
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"/>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const businessId = businessInfo?.id || '';
  const businessName = businessInfo?.name || 'Your Business';
  const businessPhoneNumber = businessInfo?.phoneNumber || '';

  // Redirect to signin if not authenticated
  if (status === 'unauthenticated') {
    router.push("/signin");
    return null;
  }

  if (!session) {
    return null;
  }

  // Get page title from pathname if not provided
  const pageTitle =
    title ||
    navigation.find((item) => item.href === pathname)?.name ||
    "Dashboard";

  return (
    <AgentProvider>
      <BusinessIdProvider businessId={businessId}>
        <SidebarProvider>
          <AppSidebar session={session as { user?: { name?: string; email?: string } }} />
          <SidebarInset>
            <DashboardHeader
              pageTitle={pageTitle}
              businessName={businessName}
              businessId={businessId}
              businessPhoneNumber={businessPhoneNumber}
              headerActions={headerActions}
              searchPlaceholder={searchPlaceholder}
            />

            <main className="flex-1 p-4 sm:p-6">
              <div className="mx-auto w-full max-w-[1200px]">
                {children}
              </div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </BusinessIdProvider>
    </AgentProvider>
  );
}