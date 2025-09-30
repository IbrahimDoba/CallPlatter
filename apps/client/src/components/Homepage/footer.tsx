"use client"

import { Phone, Github, Twitter, Linkedin, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Footer() {
  return (
    <footer className="w-full py-12 mt-20" style={{ backgroundColor: '#343434' }}>
      <div className="container px-4 mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 shadow-lg max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  DailZero
                </h3>
              </div>
              <p className="text-sm text-gray-300">
                AI-powered receptionist service designed specifically for Nigerian businesses.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-white/10">
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-white/10">
                  <Github className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-white/10">
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-white/10">
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-white">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-sm text-gray-300 hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-sm text-gray-300 hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-sm text-gray-300 hover:text-white transition-colors">
                    API
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-sm text-gray-300 hover:text-white transition-colors">
                    Integrations
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-white">Support</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/contact" className="text-sm text-gray-300 hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-sm text-gray-300 hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-sm text-gray-300 hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-sm text-gray-300 hover:text-white transition-colors">
                    Status
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-white">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#about" className="text-sm text-gray-300 hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-sm text-gray-300 hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-sm text-gray-300 hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-sm text-gray-300 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-sm text-gray-300 text-center">
              © {new Date().getFullYear()} DailZero. All rights reserved. Made in Nigeria 🇳🇬
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
