"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function VerifyEmailSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect to signin after 5 seconds
    const timer = setTimeout(() => {
      router.push("/signin?verified=true");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Email Verified Successfully!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your account has been activated. You can now sign in to your account.
        </p>
        
        <div className="space-y-3">
          <Button
            onClick={() => router.push("/signin?verified=true")}
            className="w-full"
          >
            Continue to Sign In
          </Button>
          
          <p className="text-sm text-gray-500">
            You'll be automatically redirected in a few seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
