"use client";

import { useState, useEffect, Suspense, useId } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { api } from "@/lib/api";

function ResetPasswordForm() {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const newPasswordId = useId();
  const confirmPasswordId = useId();

  useEffect(() => {
    // Get email from URL params
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // Redirect to forgot password if no email
      router.push("/forgot-password");
    }
  }, [searchParams, router]);

  useEffect(() => {
    // Start countdown for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit verification code");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.auth.verifyResetOTP({
        email,
        otp,
      });

      setResetToken(response.resetToken);
      setOtpVerified(true);
      toast.success("Code verified successfully!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Verification failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await api.auth.resetPassword({
        email,
        resetToken,
        newPassword,
      });

      toast.success("Password reset successfully!");
      router.push("/signin?reset=true");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Password reset failed. Please try again.";
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
      await api.auth.forgotPassword({ email });
      toast.success("Verification code sent to your email");
      setCountdown(60); // 60 second cooldown
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send verification code";
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  if (!otpVerified) {
    return (
      <div className="min-h-screen flex">
        {/* Left side - Image */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2074&auto=format&fit=crop"
            alt="Password reset"
            className="object-cover w-full h-full opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20" />
        </div>

        {/* Right side - OTP Verification */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white overflow-y-auto">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                Verify Your Identity
              </h1>
              <p className="text-gray-600">
                We've sent a 6-digit code to
              </p>
              <p className="text-gray-900 font-medium">{email}</p>
            </div>

            <div className="space-y-6">
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
                onClick={handleVerifyOTP}
                className="w-full h-12"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>

              <div className="text-center">
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2074&auto=format&fit=crop"
          alt="Password reset"
          className="object-cover w-full h-full opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20" />
      </div>

      {/* Right side - New Password Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">
              Create New Password
            </h1>
            <p className="text-gray-600">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor={newPasswordId} className="text-sm font-medium text-gray-700">
                New Password
              </Label>
              <Input
                id={newPasswordId}
                name="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-11"
                required
              />
              <p className="text-sm text-gray-500">
                Must be at least 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor={confirmPasswordId} className="text-sm font-medium text-gray-700">
                Confirm Password
              </Label>
              <Input
                id={confirmPasswordId}
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11"
              disabled={isLoading || newPassword.length < 8 || newPassword !== confirmPassword}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => router.push("/signin")}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
