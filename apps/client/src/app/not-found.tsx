"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "@/components/Homepage/header";
import Footer from "@/components/Homepage/footer";
import { Home, Search, Phone, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center px-4 py-40">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* 404 Number */}
          <div className="space-y-4">
            <h1 className="text-9xl font-bold text-primary/20 select-none">
              404
            </h1>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-foreground">
                Page Not Found
              </h2>
              <p className="text-lg text-muted-foreground">
                Oops! The page you're looking for seems to have wandered off. 
                Don't worry, we'll help you find your way back.
              </p>
            </div>
          </div>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="w-12 h-12 text-primary/50" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-border"
            >
              <Link href="/contact" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Contact Support
              </Link>
            </Button>
          </div>

          {/* Quick Links */}
          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">
              Popular pages you might be looking for:
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/pricing"
                className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3 rotate-180" />
                Pricing
              </Link>
              <Link
                href="/blog"
                className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3 rotate-180" />
                Blog
              </Link>
              <Link
                href="/contact"
                className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3 rotate-180" />
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

