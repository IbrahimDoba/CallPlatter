"use client"

import { Mail, Instagram, Phone, Twitter } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full bg-muted/30 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-xl text-primary">
                DailZero
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered receptionist service designed for modern businesses worldwide.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://x.com/DobaIbrahim" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/dailzero" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="mailto:support@dailzero.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Solutions</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/solutions/24-7-availability" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  24/7 Availability
                </Link>
              </li>
              <li>
                <Link href="/solutions/answering-service" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Answering Service
                </Link>
              </li>
              <li>
                <Link href="/solutions/appointment-scheduling" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Appointment Scheduling
                </Link>
              </li>
              <li>
                <Link href="/solutions/call-recording" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Call Recording
                </Link>
              </li>
              <li>
                <Link href="/solutions/call-summary" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Call Summary
                </Link>
              </li>
              <li>
                <Link href="/solutions/call-transcription" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Call Transcription
                </Link>
              </li>
              <li>
                <Link href="/solutions/crm-feature" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  CRM Integration
                </Link>
              </li>
              <li>
                <Link href="/solutions/email-summary" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Email Summary
                </Link>
              </li>
              <li>
                <Link href="/solutions/voice-options" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Voice Options
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Industries</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/industries/car-wash" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Car Wash
                </Link>
              </li>
              <li>
                <Link href="/industries/event-planning" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Event Planning
                </Link>
              </li>
              <li>
                <Link href="/industries/hotels" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Hotels
                </Link>
              </li>
              <li>
                <Link href="/industries/online-vendors" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Online Vendors
                </Link>
              </li>
              <li>
                <Link href="/industries/real-estate" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Real Estate
                </Link>
              </li>
              <li>
                <Link href="/industries/restaurants" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Restaurants
                </Link>
              </li>
              <li>
                <Link href="/industries/salons" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Salons
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} DailZero. All rights reserved. Made with ❤️ for businesses worldwide
          </p>
        </div>
      </div>
    </footer>
  )
}
