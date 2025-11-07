"use client";

import Header from "@/components/Homepage/header";
import Footer from "@/components/Homepage/footer";
import {
  SectionHero,
  SectionFeaturesGrid,
  SectionHowItWorks,
  SectionFAQ,
} from "@/components/sections";

export default function AnsweringServicePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <SectionHero
        title="Professional AI Answering Service"
        titleHighlight="Capture Every Call, Every Time"
        subtitle="Our AI-powered virtual receptionists provide exceptional, 24/7 call answering for businesses of all sizes. From capturing leads and booking appointments to providing customer support, we ensure you never miss an opportunity. Elevate your customer experience and streamline your operations."
        primaryButtonText="Start Your Free Trial"
        primaryButtonHref="/signup"
        secondaryButtonText="Request a Demo"
        secondaryButtonHref="/request-demo"
        imageSrc="https://images.pexels.com/photos/4145354/pexels-photo-4145354.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
        imageAlt="Professional AI answering service with a virtual receptionist managing calls."
        useConversation={true}
        customerMessage="Hi, I'm calling about the ad I saw for your plumbing services. I have a leaky faucet and need to schedule a repair. Are you available this week?"
        aiResponse="Of course! I can help with that. We have openings on Wednesday and Friday. Our technician can be there between 10 AM and 2 PM. Which day works better for you? I can get you booked right now."
      />

      <SectionFeaturesGrid
        title="Everything You Need in an Answering Service"
        subtitle="Our feature-rich service is designed to handle all your communication needs, allowing you to focus on running your business."
        features={[
          {
            title: "24/7/365 Availability",
            description:
              "Never miss a call, day or night. Our AI receptionists are always on, ensuring your business is responsive even after hours, on weekends, and during holidays.",
          },
          {
            title: "Appointment Scheduling",
            description:
              "Seamlessly book, reschedule, and cancel appointments directly into your calendar. We integrate with popular platforms like Google Calendar, Calendly, and more.",
          },
          {
            title: "Lead Capture & Qualification",
            description:
              "We capture vital information from potential customers and can even ask qualifying questions, ensuring you receive high-quality leads ready for follow-up.",
          },
          {
            title: "Personalized Call Scripts",
            description:
              "Customize how our AI interacts with your callers. We'll follow your scripts to provide a consistent and on-brand experience every time.",
          },
          {
            title: "Bilingual Support",
            description:
              "Serve a wider audience with AI receptionists fluent in both English and Spanish, ensuring clear communication with all your customers.",
          },
          {
            title: "Call Forwarding & Routing",
            description:
              "For complex issues, we can intelligently route calls to the right person or department on your team, ensuring urgent matters are handled promptly.",
          },
        ]}
      />

      <SectionHowItWorks
        title="Get Started in 3 Simple Steps"
        subtitle="Our onboarding process is quick and easy, so you can have a professional answering service up and running in no time."
        steps={[
          {
            title: "Customize Your Service",
            description:
              "Tell us about your business and how you want us to handle your calls. You'll customize your greetings, call scripts, and scheduling preferences in our simple setup wizard. This ensures our AI represents your brand perfectly.",
            image:
              "https://images.pexels.com/photos/3184460/pexels-photo-3184460.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Team customizing the answering service settings on a dashboard.",
          },
          {
            title: "Forward Your Calls",
            description:
              "We'll provide you with a dedicated phone number. Simply forward your existing business line to this number, and our AI receptionists will start answering your calls immediately. You control when you want us to take over.",
            image:
              "https://images.pexels.com/photos/2239655/pexels-photo-2239655.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "A person forwarding calls on their smartphone.",
          },
          {
            title: "Receive Real-Time Updates",
            description:
              "Get instant notifications and detailed summaries of every call via email or SMS. You'll have a complete record of every interaction, including appointments booked and leads captured, all accessible in your client dashboard.",
            image:
              "https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Business owner reviewing call summaries and analytics on a laptop.",
          },
        ]}
      />

      <SectionFAQ
        title="Frequently Asked Questions"
        heading="Everything you need to know about our AI Answering Service."
        faqs={[
          {
            question: "How is an AI answering service different from a traditional one?",
            answer:
              "Our AI service offers the same professional call handling but at a fraction of the cost. It's more consistent, infinitely scalable, and provides advanced features like real-time analytics. However, we also offer seamless transition to human agents for calls that require a human touch.",
            id: "ai-vs-traditional",
          },
          {
            question: "Can the AI handle complex or industry-specific conversations?",
            answer:
              "Yes. Our AI is trained on vast datasets and can be customized with your specific business information, including industry jargon, service details, and pricing. It can handle a wide range of complex inquiries with natural, human-like conversation.",
            id: "complex-conversations",
          },
          {
            question: "How much does the answering service cost?",
            answer:
              "We have flexible and affordable plans designed for businesses of all sizes, starting from just $20/month. Our pricing is transparent and based on your usage, making it a cost-effective alternative to hiring a full-time receptionist.",
            id: "pricing",
          },
          {
            question: "What integrations do you support?",
            answer:
              "We support a wide range of integrations with popular CRMs, calendar apps, and helpdesk software, including Salesforce, HubSpot, Google Calendar, Calendly, and more. This ensures a seamless workflow with the tools you already use.",
            id: "integrations",
          },
          {
            question: "How secure is my data and my customers' information?",
            answer:
              "Security is our top priority. All call data is encrypted, and our service is compliant with industry standards. If you require payment processing, we use PCI-compliant systems to ensure all financial information is handled securely.",
            id: "security",
          },
          {
            question: "What if a caller absolutely needs to speak to a human?",
            answer:
              "We design our call flows with a seamless escalation path. If a caller expresses a desire to speak with a person or if the AI determines the issue requires human intervention, the call is instantly and smoothly transferred to a designated person on your team.",
            id: "human-escalation",
          },
        ]}
      />

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
