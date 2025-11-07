"use client";

import { useState, useId } from "react";
import Header from "@/components/Homepage/header";
import Footer from "@/components/Homepage/footer";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function RequestDemoPage() {
  const firstNameId = useId();
  const emailId = useId();
  const companyNameId = useId();
  const industryId = useId();
  const companySocialsId = useId();
  const demoEmailId = useId();

  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    companyName: "",
    industry: "",
    companySocials: "",
    demoEmail: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/demo-request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSubmitted(true);
        
        // Reset form after 5 seconds
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({
            firstName: "",
            email: "",
            companyName: "",
            industry: "",
            companySocials: "",
            demoEmail: "",
          });
        }, 5000);
      } else {
        // Handle error
        alert(data.message || "Failed to submit demo request. Please try again.");
      }
    } catch (error) {
      console.error("Demo request error:", error);
      alert("Failed to submit demo request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 py-20 mt-30 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              Get Your <span className="text-primary">Free Demo</span> Here
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              See DailZero in action! Fill out the form below and we'll send you
              a personalized demo showcasing how our AI receptionist can
              transform your business communications.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-card border border-border rounded-2xl shadow-lg p-8 md:p-12">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* First Name */}
                <div className="space-y-2">
                  <label
                    htmlFor={firstNameId}
                    className="text-sm font-semibold text-foreground flex items-center gap-1"
                  >
                    First Name
                    <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    id={firstNameId}
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Enter your first name"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor={emailId}
                    className="text-sm font-semibold text-foreground flex items-center gap-1"
                  >
                    Your Email Address
                    <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    id={emailId}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <label
                    htmlFor={companyNameId}
                    className="text-sm font-semibold text-foreground flex items-center gap-1"
                  >
                    Company Name
                    <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    id={companyNameId}
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    placeholder="Your company name"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                {/* Industry */}
                <div className="space-y-2">
                  <label
                    htmlFor={industryId}
                    className="text-sm font-semibold text-foreground flex items-center gap-1"
                  >
                    What Industry Are You In?
                    <span className="text-destructive">*</span>
                  </label>
                  <select
                    id={industryId}
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  >
                    <option value="">Select your industry</option>
                    <option value="healthcare">Healthcare & Medical</option>
                    <option value="legal">Legal & Professional Services</option>
                    <option value="real-estate">Real Estate</option>
                    <option value="retail">Retail & E-commerce</option>
                    <option value="hospitality">Hospitality & Tourism</option>
                    <option value="financial">Financial Services</option>
                    <option value="construction">Construction & Home Services</option>
                    <option value="technology">Technology & SaaS</option>
                    <option value="education">Education & Training</option>
                    <option value="fitness">Fitness & Wellness</option>
                    <option value="automotive">Automotive</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="nonprofit">Non-Profit</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Company Socials */}
                <div className="space-y-2">
                  <label
                    htmlFor={companySocialsId}
                    className="text-sm font-semibold text-foreground"
                  >
                    Company Website or Social Media{" "}
                    <span className="text-muted-foreground font-normal">
                      (Optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    id={companySocialsId}
                    name="companySocials"
                    value={formData.companySocials}
                    onChange={handleChange}
                    placeholder="https://yourwebsite.com or @yourcompany"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                {/* Demo Email Confirmation */}
                <div className="space-y-2">
                  <label
                    htmlFor={demoEmailId}
                    className="text-sm font-semibold text-foreground flex items-center gap-1"
                  >
                    Where Should We Send Your Custom Demo?
                    <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    id={demoEmailId}
                    name="demoEmail"
                    value={formData.demoEmail}
                    onChange={handleChange}
                    required
                    placeholder="demo@company.com"
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    We'll send a personalized demo video and setup guide to this
                    email address.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-6 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      "Request My Free Demo"
                    )}
                  </Button>
                </div>

                {/* Privacy Note */}
                <p className="text-xs text-center text-muted-foreground pt-2">
                  By submitting this form, you agree to receive communications
                  from DailZero. We respect your privacy and will never share
                  your information.
                </p>
              </form>
            ) : (
              /* Success Message */
              <div className="text-center py-12 space-y-6">
                <div className="flex justify-center">
                  <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-4">
                    <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-foreground">
                    Thank You, {formData.firstName}!
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-md mx-auto">
                    Your demo request has been received. We're preparing a
                    personalized demo for {formData.companyName} and will send it
                    to{" "}
                    <span className="font-semibold text-foreground">
                      {formData.demoEmail}
                    </span>{" "}
                    within the next 24 hours.
                  </p>
                </div>
                <div className="pt-6">
                  <Button
                    onClick={() => setIsSubmitted(false)}
                    variant="outline"
                    className="px-8"
                  >
                    Submit Another Request
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Additional Info Section */}
          <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">
                Demo Available Anytime
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">5 min</div>
              <div className="text-sm text-muted-foreground">
                Quick Setup Process
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">
                Free, No Credit Card
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}

