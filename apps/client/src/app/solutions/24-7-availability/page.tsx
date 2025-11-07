"use client";

import Header from "@/components/Homepage/header";
import Footer from "@/components/Homepage/footer";
import {
  SectionHero,
  SectionFeaturesGrid,
  SectionHowItWorks,
  SectionFAQ,
} from "@/components/sections";

export default function AvailabilityPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <SectionHero
        title="24/7 Business Availability"
        titleHighlight="Your Doors Are Always Open"
        subtitle="Capture every opportunity, around the clock. Our 24/7/365 answering service ensures your business is always responsive. We handle calls after hours, on weekends, and during holidays, so you can rest easy knowing your customers are always taken care of."
        primaryButtonText="Start Your Free Trial"
        primaryButtonHref="/signup"
        secondaryButtonText="Request a Demo"
        secondaryButtonHref="/request-demo"
        imageSrc="https://images.pexels.com/photos/210600/pexels-photo-210600.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
        imageAlt="A city skyline at night, representing 24/7 business availability."
        useConversation={true}
        customerMessage="Hi, it's 10 PM here, but I just had an emergency water leak and need a plumber fast. Your website says you offer 24/7 service. Are you really available?"
        aiResponse="Yes, we are. I understand this is an emergency, and I'm here to help. I've located a technician in your area who is on call. I can dispatch them to your address right away. Can you please confirm your location?"
      />

      <SectionFeaturesGrid
        title="The Power of Always-On Communication"
        subtitle="Our 24/7 availability solution is more than just answering calls; it's about creating opportunities and providing peace of mind."
        features={[
          {
            title: "After-Hours & Overflow Answering",
            description:
              "Don't let the clock dictate your business hours. We handle all calls that come in after you've closed, ensuring every customer receives a prompt, professional response.",
          },
          {
            title: "Weekend & Holiday Coverage",
            description:
              "While you're taking a well-deserved break, our service ensures your business isn't. We provide seamless customer support on weekends and public holidays.",
          },
          {
            title: "Emergency Dispatch & On-Call Escalation",
            description:
              "For businesses that handle urgent situations, we can follow your custom protocols to dispatch on-call personnel or escalate critical calls immediately.",
          },
          {
            title: "Global Time Zone Support",
            description:
              "Serve your customers no matter where they are. Our 24/7 service makes your business accessible and responsive to a global customer base.",
          },
          {
            title: "Always-On Lead Capture",
            description:
              "Inspiration strikes at all hours. We ensure that every potential lead who calls your business is captured, qualified, and ready for your team to follow up on.",
          },
          {
            title: "Uninterrupted Customer Support",
            description:
              "Provide continuous support for your products or services. We can answer common questions and troubleshoot issues, improving customer satisfaction and loyalty.",
          },
        ]}
      />

      <SectionHowItWorks
        title="Activate 24/7 Coverage in Minutes"
        subtitle="Our setup process is designed to be quick and intuitive, getting your business ready for round-the-clock operation."
        steps={[
          {
            title: "Define Your After-Hours Protocol",
            description:
              "You tell us how to handle different call scenarios outside your business hours. Whether it's taking a message, booking an appointment, or escalating an emergency, you're in complete control.",
            image:
              "https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "A team defining their after-hours call handling protocol.",
          },
          {
            title: "Set Your Availability Schedule",
            description:
              "In your dashboard, you can easily set your office hours. When you're 'closed', we automatically start answering your calls. You can update this schedule anytime, giving you full flexibility.",
            image:
              "https://images.pexels.com/photos/669619/pexels-photo-669619.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "A person setting their business availability schedule on a calendar.",
          },
          {
            title: "Rest Easy, We've Got You Covered",
            description:
              "That's it. Your business is now operational 24/7. You'll receive real-time notifications and detailed call summaries, so you're always in the loop, even when you're not on the clock.",
            image:
              "https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "A business owner relaxing, confident that their calls are being handled.",
          },
        ]}
      />

      <SectionFAQ
        title="Frequently Asked Questions"
        heading="Common questions about our 24/7 Availability service."
        faqs={[
          {
            question: "Will my customers know they are speaking to an AI?",
            answer:
              "Our AI is designed to be incredibly human-like and conversational. Most callers won't know the difference. The priority is to provide a professional, helpful, and immediate response, which the AI is expertly trained to do.",
            id: "human-like-ai",
          },
          {
            question: "How are urgent or emergency calls handled?",
            answer:
              "You define what constitutes an emergency. When a call meets your criteria, our system can follow a custom escalation path, including dispatching your on-call team, transferring the call to a specific number, or sending urgent SMS alerts.",
            id: "emergency-handling",
          },
          {
            question: "Can this service work alongside my existing staff?",
            answer:
              "Absolutely. Our service is a perfect complement to your team. We can act as your after-hours receptionist, handle overflow calls during peak times, or cover for your staff during lunch breaks and holidays, ensuring seamless coverage.",
            id: "staff-augmentation",
          },
          {
            question: "Is it expensive to have 24/7 coverage?",
            answer:
              "Not at all. Our AI-powered solution makes 24/7 coverage accessible for any budget. It's significantly more cost-effective than hiring overnight staff, with plans designed to scale with your business needs.",
            id: "cost",
          },
          {
            question: "Can I try the service before I commit?",
            answer:
              "Yes. We offer a free trial so you can experience the value of 24/7 availability firsthand. You can see how we handle your calls and the peace of mind it provides, with no obligation.",
            id: "free-trial",
          },
          {
            question: "How do I know what happened on the calls I missed?",
            answer:
              "You'll receive a detailed summary of every call, including the caller's information, the reason for their call, and any action taken (like booking an appointment or escalating the call). This is all available in your real-time dashboard.",
            id: "call-summaries",
          },
        ]}
      />

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
