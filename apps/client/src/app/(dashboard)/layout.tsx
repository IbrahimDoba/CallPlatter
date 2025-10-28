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
import { SubscriptionBanner } from "@/components/layout/SubscriptionBanner";
import { SubscriptionStatus } from "@/components/layout/SubscriptionStatus";
import { getBusinessInfo } from "@/app/actions/business";
import { LoadingScreen } from "@/components/ui/loader";
import { useSubscription } from "@/hooks/useSubscription";
import { AgentProvider, useAgentContext } from "@/contexts/AgentContext";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  headerActions?: ReactNode;
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
}: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [businessInfo, setBusinessInfo] = useState<{id: string; name: string; phoneNumber: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get businessId early for hook usage
  const businessId = businessInfo?.id || '';
  
  // Check subscription status (must be called unconditionally)
  const { isSubscriptionInvalid } = useSubscription(businessId);

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
    return <LoadingScreen message="Loading..." />;
  }

  const businessPhoneNumber = businessInfo?.phoneNumber || '';

  // Redirect to signin if not authenticated
  if (status === 'unauthenticated') {
    router.push("/signin");
    return null;
  }

  if (!session) {
    return null;
  }

  // Show subscription status if invalid
  if (isSubscriptionInvalid) {
    return <SubscriptionStatus businessId={businessId} />;
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
              businessPhoneNumber={businessPhoneNumber}
              headerActions={headerActions}
            />

            <main className="flex-1 p-4 sm:p-6">
              <div className="mx-auto w-full max-w-[1200px]">
                <SubscriptionBanner businessId={businessId} />
                {children}
              </div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </BusinessIdProvider>
    </AgentProvider>
  );
}