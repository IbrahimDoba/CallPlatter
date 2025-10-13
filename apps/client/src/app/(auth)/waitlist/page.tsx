"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, TrendingUp, Bell, Shield } from "lucide-react";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const serverUrl =
        process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";
      const response = await fetch(`${serverUrl}/api/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to join waitlist");

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-lg border-border">
          <CardHeader className="text-center space-y-6 pb-8">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-primary" strokeWidth={2} />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-semibold text-foreground">
                Welcome aboard
              </CardTitle>
              <p className="text-muted-foreground text-lg">
                You're now on the DailZero waitlist. We'll be in touch soon with
                exclusive updates.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted border border-border rounded-xl p-6">
              <h4 className="font-medium text-foreground mb-4">
                What to expect
              </h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                  <span>Priority access when we launch in Q2 2025</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                  <span>Exclusive pricing reserved for early supporters</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                  <span>Behind-the-scenes development insights</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => (window.location.href = "/")}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Return home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 md:mb-20">
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-1.5 bg-secondary text-secondary-foreground border-border"
            >
              <Clock className="w-3.5 h-3.5 mr-2" />
              Launching Q2 2025
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold text-foreground mb-6 leading-tight">
              Your Personal
              <br />
              AI receptionist
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join the waitlist to get early access to DailZero and never miss
              another call again.
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-12">
            {/* Form */}
            <div className="flex justify-center">
              <Card className="border-border shadow-sm w-full max-w-md">
                <CardHeader className="pb-6">
                  <CardTitle className="text-xl font-medium text-foreground text-center">
                    Get early access
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Join 10+ businesses already on our list
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-foreground"
                      >
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 border-input focus:border-ring focus:ring-ring"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                      disabled={isLoading}
                    >
                      {isLoading ? "Joining..." : "Join waitlist"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      No spam. Unsubscribe anytime.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Benefits */}
            <div className="space-y-12">
              <div className="space-y-6">
                <h3 className="text-2xl font-medium text-foreground">
                  Why join early
                </h3>
                <div className="grid gap-6">
                  <div className="flex gap-4">
                    <div className="w-11 h-11 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp
                        className="w-5 h-5 text-primary"
                        strokeWidth={2}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        Priority access
                      </h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Be first in line when we open our doors. Skip the queue
                        and start using DailZero before anyone else.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-11 h-11 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield
                        className="w-5 h-5 text-accent-foreground"
                        strokeWidth={2}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        Exclusive pricing
                      </h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Lock in special launch rates reserved exclusively for
                        our waitlist members. Save up to 40% off standard
                        pricing.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-11 h-11 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bell
                        className="w-5 h-5 text-secondary-foreground"
                        strokeWidth={2}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        Development updates
                      </h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Get insider access to our progress, features, and launch
                        timeline as we build DailZero.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted border border-border rounded-xl p-6">
                <h4 className="font-medium text-foreground mb-4">
                  What's included
                </h4>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle
                      className="w-4 h-4 text-primary flex-shrink-0"
                      strokeWidth={2}
                    />
                    <span>AI with Nigerian accents</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle
                      className="w-4 h-4 text-primary flex-shrink-0"
                      strokeWidth={2}
                    />
                    <span>Call analytics dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle
                      className="w-4 h-4 text-primary flex-shrink-0"
                      strokeWidth={2}
                    />
                    <span>24/7 call handling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle
                      className="w-4 h-4 text-primary flex-shrink-0"
                      strokeWidth={2}
                    />
                    <span>CRM integrations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle
                      className="w-4 h-4 text-primary flex-shrink-0"
                      strokeWidth={2}
                    />
                    <span>Appointment scheduling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle
                      className="w-4 h-4 text-primary flex-shrink-0"
                      strokeWidth={2}
                    />
                    <span>Custom voice training</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 pt-12 border-t border-border">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
              <div>
                <div className="text-4xl font-semibold text-foreground mb-2">
                  5+
                </div>
                <div className="text-muted-foreground text-sm">
                  On the waitlist
                </div>
              </div>
              <div>
                <div className="text-4xl font-semibold text-foreground mb-2">
                  Q2 2025
                </div>
                <div className="text-muted-foreground text-sm">
                  Expected launch
                </div>
              </div>
              <div>
                <div className="text-4xl font-semibold text-foreground mb-2">
                  Free
                </div>
                <div className="text-muted-foreground text-sm">Testing</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
