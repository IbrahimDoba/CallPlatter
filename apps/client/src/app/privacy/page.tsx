"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, Database, Users, Globe, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" as const },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="container mx-auto px-6 text-center">
          <motion.div {...fadeInUp}>
            <Shield className="w-16 h-16 mx-auto mb-6 text-white" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Your privacy is important to us. This policy explains how DailZero collects, uses, and protects your information.
            </p>
            <p className="text-sm text-blue-200 mt-4">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-12"
        >
          {/* Introduction */}
          <motion.section {...fadeInUp} className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Eye className="w-8 h-8 text-blue-400" />
              Introduction
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              DailZero ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI receptionist service.
            </p>
            <p className="text-gray-300 leading-relaxed">
              By using our service, you agree to the collection and use of information in accordance with this policy.
            </p>
          </motion.section>

          {/* Information We Collect */}
          <motion.section {...fadeInUp} className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-400" />
              Information We Collect
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-blue-300">Personal Information</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                  <li>Name and contact information (email, phone number)</li>
                  <li>Business information (company name, address, industry)</li>
                  <li>Account credentials and preferences</li>
                  <li>Billing and payment information</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-blue-300">Call Data</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                  <li>Call recordings and transcripts</li>
                  <li>Call duration and timestamps</li>
                  <li>Customer phone numbers and caller information</li>
                  <li>Appointment bookings and scheduling data</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-blue-300">Usage Data</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                  <li>Service usage patterns and analytics</li>
                  <li>Device information and IP addresses</li>
                  <li>Browser type and operating system</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* How We Use Information */}
          <motion.section {...fadeInUp} className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              How We Use Your Information
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-300">Service Delivery</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>Provide AI receptionist services</li>
                  <li>Process and manage appointments</li>
                  <li>Generate call summaries and reports</li>
                  <li>Improve AI conversation quality</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-300">Business Operations</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>Account management and billing</li>
                  <li>Customer support and communication</li>
                  <li>Service improvements and updates</li>
                  <li>Legal compliance and security</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Data Protection */}
          <motion.section {...fadeInUp} className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Lock className="w-8 h-8 text-blue-400" />
              Data Protection & Security
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-blue-300">Security Measures</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>End-to-end encryption for all communications</li>
                  <li>Secure data centers with 24/7 monitoring</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Access controls and authentication protocols</li>
                  <li>Data backup and disaster recovery procedures</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-blue-300">Compliance</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>GDPR (General Data Protection Regulation) compliant</li>
                  <li>SOC 2 Type II certified</li>
                  <li>HIPAA compliant for healthcare data</li>
                  <li>Regular compliance audits and assessments</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Data Sharing */}
          <motion.section {...fadeInUp} className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Globe className="w-8 h-8 text-blue-400" />
              Data Sharing & Disclosure
            </h2>
            
            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                <li><strong>Service Providers:</strong> Trusted third-party vendors who assist in service delivery</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale</li>
                <li><strong>Consent:</strong> When you explicitly consent to sharing</li>
                <li><strong>Emergency:</strong> To protect safety and security</li>
              </ul>
            </div>
          </motion.section>

          {/* Your Rights */}
          <motion.section {...fadeInUp} className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-400" />
              Your Rights & Choices
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-300">Access & Control</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>Access your personal data</li>
                  <li>Update or correct information</li>
                  <li>Delete your account and data</li>
                  <li>Export your data</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-300">Communication Preferences</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>Opt-out of marketing communications</li>
                  <li>Control call recording preferences</li>
                  <li>Manage notification settings</li>
                  <li>Update contact preferences</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Data Retention */}
          <motion.section {...fadeInUp} className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold mb-6">Data Retention</h2>
            
            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                We retain your information for as long as necessary to provide our services and comply with legal obligations:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
                <li><strong>Account Data:</strong> Until account deletion or 3 years of inactivity</li>
                <li><strong>Call Recordings:</strong> 90 days (configurable by customer)</li>
                <li><strong>Call Transcripts:</strong> 1 year for analytics and improvement</li>
                <li><strong>Billing Data:</strong> 7 years for tax and legal compliance</li>
                <li><strong>Analytics Data:</strong> Anonymized and retained for service improvement</li>
              </ul>
            </div>
          </motion.section>

          {/* International Transfers */}
          <motion.section {...fadeInUp} className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold mb-6">International Data Transfers</h2>
            
            <p className="text-gray-300 leading-relaxed mb-4">
              As a global service, your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place:
            </p>
            
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Standard Contractual Clauses (SCCs) for EU transfers</li>
              <li>Adequacy decisions where applicable</li>
              <li>Binding Corporate Rules for internal transfers</li>
              <li>Certification schemes and codes of conduct</li>
            </ul>
          </motion.section>

          {/* Children's Privacy */}
          <motion.section {...fadeInUp} className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold mb-6">Children's Privacy</h2>
            
            <p className="text-gray-300 leading-relaxed">
              Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
            </p>
          </motion.section>

          {/* Changes to Policy */}
          <motion.section {...fadeInUp} className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold mb-6">Changes to This Policy</h2>
            
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </motion.section>

          {/* Contact Information */}
          <motion.section {...fadeInUp} className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <Mail className="w-8 h-8" />
              Contact Us
            </h2>
            
            <p className="text-blue-100 mb-6">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5" />
                  <span className="text-blue-100">support@dailzero.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5" />
                  <span className="text-blue-100">+234 81 4911 3328</span>
                </div>
              </div>
              
             
            </div>
          </motion.section>
        </motion.div>

        {/* Back to Home */}
        <motion.div {...fadeInUp} className="text-center mt-12">
          <Link href="/">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3">
              Back to Home
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
