"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Handle successful payment
    const handleSuccess = async () => {
      try {
        // You can add logic here to:
        // 1. Verify the payment with your backend
        // 2. Update user subscription status
        // 3. Send confirmation emails
        // 4. Log the successful payment
        
        console.log("Payment successful!", {
          sessionId: searchParams.get('session_id'),
          customerId: searchParams.get('customer_id'),
          // Add other relevant parameters
        });

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error processing successful payment:", error);
        setError("There was an error processing your payment. Please contact support.");
        setIsLoading(false);
      }
    };

    handleSuccess();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Processing your payment...</h1>
          <p className="text-muted-foreground">
            Please wait while we confirm your subscription.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-red-600">Payment Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="space-y-3">
            <Link href="/dashboard">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="w-full">Contact Support</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-green-500 mb-4">
          <CheckCircle className="h-16 w-16 mx-auto" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground mb-6">
          Your subscription has been activated. You can now access all the features of your new plan.
        </p>
        <div className="space-y-3">
          <Link href="/dashboard">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
          <Link href="/portal">
            <Button variant="outline" className="w-full">Manage Billing</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Loading...</h1>
        <p className="text-muted-foreground">
          Please wait while we process your request.
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SuccessContent />
    </Suspense>
  );
}
