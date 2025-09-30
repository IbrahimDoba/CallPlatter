"use client";

import { useState, useId } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from "lucide-react";
import Header from "@/components/Homepage/header";
import Footer from "@/components/Homepage/footer";
import BackgroundElements from "@/components/Homepage/background-elements";

export default function ContactPage() {
  const nameId = useId();
  const emailId = useId();
  const companyId = useId();
  const subjectId = useId();
  const messageId = useId();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: "",
        email: "",
        company: "",
        subject: "",
        message: "",
      });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone",
      details: ["+234 800 123 4567", "+234 800 123 4568"],
      description: "Call us for immediate support"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email",
      details: ["hello@dailzero.com", "support@dailzero.com"],
      description: "Send us an email anytime"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Office",
      details: ["Lagos, Nigeria", "Abuja, Nigeria"],
      description: "Visit our offices"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Hours",
      details: ["Mon - Fri: 9AM - 6PM", "Sat: 10AM - 4PM"],
      description: "We're here to help"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#343434' }}>
      <BackgroundElements />
      <Header />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Get in <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Touch</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Have questions about DailZero? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1 space-y-6"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <div key={`contact-${index}`} className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                        {info.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">{info.title}</h3>
                        <div className="space-y-1">
                          {info.details.map((detail, idx) => (
                            <p key={`detail-${index}-${idx}`} className="text-gray-300 text-sm">{detail}</p>
                          ))}
                        </div>
                        <p className="text-gray-400 text-xs mt-1">{info.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
                <div className="space-y-3">
                  <a href="#features" className="block text-gray-300 hover:text-white transition-colors">
                    → Features
                  </a>
                  <a href="#pricing" className="block text-gray-300 hover:text-white transition-colors">
                    → Pricing
                  </a>
                  <a href="/signup" className="block text-gray-300 hover:text-white transition-colors">
                    → Get Started
                  </a>
                  <a href="/signin" className="block text-gray-300 hover:text-white transition-colors">
                    → Sign In
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-2"
            >
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white">Send us a Message</CardTitle>
                  <CardDescription className="text-gray-300">
                    Fill out the form below and we'll get back to you within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                      <p className="text-gray-300">Thank you for contacting us. We'll get back to you soon.</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor={nameId} className="text-white">Full Name *</Label>
                          <Input
                            id={nameId}
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400"
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={emailId} className="text-white">Email Address *</Label>
                          <Input
                            id={emailId}
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400"
                            placeholder="Enter your email"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor={companyId} className="text-white">Company</Label>
                          <Input
                            id={companyId}
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400"
                            placeholder="Your company name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={subjectId} className="text-white">Subject *</Label>
                          <Input
                            id={subjectId}
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            required
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400"
                            placeholder="What's this about?"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={messageId} className="text-white">Message *</Label>
                        <Textarea
                          id={messageId}
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={6}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400"
                          placeholder="Tell us how we can help you..."
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending Message...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            Send Message
                          </div>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-300">Quick answers to common questions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                {
                  question: "How quickly can I get started?",
                  answer: "You can set up your AI receptionist in under 5 minutes. Just complete our simple onboarding process and you're ready to go."
                },
                {
                  question: "Do you offer phone support?",
                  answer: "Yes! We provide 24/7 phone support for all our customers. Call us anytime for immediate assistance."
                },
                {
                  question: "Can I customize the AI voice?",
                  answer: "Absolutely! We offer 6 different AI voices to choose from, each with unique characteristics to match your brand."
                },
                {
                  question: "What if I need help with setup?",
                  answer: "Our support team is here to help with setup, configuration, and any questions you might have. We offer free onboarding assistance."
                }
              ].map((faq, index) => (
                <Card key={`faq-${index}`} className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                    <p className="text-gray-300">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
