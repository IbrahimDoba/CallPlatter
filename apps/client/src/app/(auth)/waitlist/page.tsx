"use client";

import { useState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Users, Zap, Mail } from "lucide-react";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const emailId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
      const apiUrl = `${serverUrl}/api/waitlist`;
      
      console.log('Sending request to:', apiUrl);
      console.log('Request data:', { email });
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const result = await response.json();
      console.log('Response data:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to join waitlist');
      }
      
      toast.success("You've been added to our waitlist! Check your email for confirmation.");
      setIsSubmitted(true);
    } catch (error) {
      console.error('Waitlist submission error:', error);
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error("Unable to connect to server. Please check if the server is running.");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" as const },
  };


  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <motion.div {...fadeInUp} className="w-full max-w-md">
          <Card className="text-center">
            <CardHeader className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">You're on the list!</CardTitle>
              <CardDescription className="text-lg">
                Thank you for joining our waitlist. We'll notify you as soon as DailZero is ready for launch.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Early access to DailZero when we launch</li>
                  <li>• Exclusive updates on our development progress</li>
                  <li>• Special launch pricing for waitlist members</li>
                </ul>
              </div>
              <Button 
                onClick={() => {
                  window.location.href = '/';
                }}
                className="w-full"
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="container mx-auto px-6 py-8">
        <motion.div {...fadeInUp} className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Clock className="w-4 h-4 mr-2" />
            Coming Soon
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Join the{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DailZero
            </span>{" "}
            Waitlist
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Be among the first to experience Nigeria's most advanced AI receptionist. 
            Just enter your email to get early access and exclusive launch pricing.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Waitlist Form */}
          <motion.div {...fadeInUp}>
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Get Early Access</CardTitle>
                <CardDescription className="text-center">
                  Join 500+ people already on our waitlist
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor={emailId}>Email Address</Label>
                    <Input
                      id={emailId}
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={handleEmailChange}
                      required
                      className="text-lg py-3"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                    {isLoading ? "Joining Waitlist..." : "Join the Waitlist"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Benefits Section */}
          <motion.div {...fadeInUp} className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Why Join Our Waitlist?
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Early Access</h4>
                    <p className="text-gray-600">Be the first to try DailZero when we launch</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Exclusive Pricing</h4>
                    <p className="text-gray-600">Special launch pricing for waitlist members</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Development Updates</h4>
                    <p className="text-gray-600">Get exclusive insights into our development progress</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h4 className="font-semibold text-gray-900 mb-3">What's Coming</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  AI Receptionist with Multiple Accents
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  24/7 Call Handling
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Appointment Booking
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  CRM Integration
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Call Analytics & Reports
                </li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div {...fadeInUp} className="mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">People on Waitlist</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">Q2 2025</div>
              <div className="text-gray-600">Expected Launch</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
