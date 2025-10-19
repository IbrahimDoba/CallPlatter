"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { api } from "@/lib/api";

function VerifyEmailForm() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get email from URL params or localStorage
    const emailParam = searchParams.get("email");
    const storedEmail = localStorage.getItem("signupEmail");
    const userEmail = emailParam || storedEmail;
    
    if (userEmail) {
      setEmail(userEmail);
    } else {
      // Redirect to signup if no email found
      router.push("/signup");
    }
  }, [searchParams, router]);

  useEffect(() => {
    // Start countdown for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit verification code");
      return;
    }

    setIsLoading(true);

    try {
      await api.auth.verifyEmail({
        email,
        otp,
      });

      toast.success("Email verified successfully!");
      localStorage.removeItem("signupEmail"); // Clear stored email
      router.push("/signin?verified=true");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Verification failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) {
      toast.error(`Please wait ${countdown} seconds before requesting a new code`);
      return;
    }

    setIsResending(true);

    try {
      await api.auth.resendOTP({ email });
      toast.success("Verification code sent to your email");
      setCountdown(60); // 60 second cooldown
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send verification code";
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };


  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2074&auto=format&fit=crop"
          alt="Email verification"
          className="object-cover w-full h-full opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20" />
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              Verify Your Email
            </h1>
            <p className="text-gray-600">
              We've sent a 6-digit verification code to
            </p>
            <p className="text-gray-900 font-medium">{email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Verification Code
              </Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  className="gap-2"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-sm text-gray-500 text-center">
                Enter the 6-digit code from your email
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Didn't receive the code?
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleResendOTP}
              disabled={isResending || countdown > 0}
              className="w-full"
            >
              {isResending 
                ? "Sending..." 
                : countdown > 0 
                  ? `Resend in ${countdown}s` 
                  : "Resend Code"
              }
            </Button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Wrong email address?{" "}
              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Go back to signup
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}
