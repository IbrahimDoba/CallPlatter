"use client";

import {
  SectionHero,
  SectionContent,
  SectionInfo,
  SectionContentSlider,
  SectionImageInfo,
  SectionFAQ,
  SectionCTA,
} from "@/components/sections";
import {
  Calendar,
  Users,
  Mic,
  TrendingUp,
  Star,
  CheckCircle,
} from "lucide-react";
import Header from "@/components/Homepage/header";
import Footer from "@/components/Homepage/footer";

export default function EventPlanningPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {/* Hero Section */}
      <SectionHero
        title="24/7 Event Planning Answering Service"
        titleHighlight="Flawless Communication for Every Occasion"
        subtitle="Professional 24/7 answering service for event planners, wedding coordinators, corporate event managers, and conference organizers. We handle RSVP management, ticket sales, vendor coordination, and attendee inquiries so you can focus on creating unforgettable experiences. Never miss a critical call."
        primaryButtonText="Start Your Free Trial"
        primaryButtonHref="/signup"
        secondaryButtonText="View Pricing"
        secondaryButtonHref="/pricing"
        imageSrc="https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
        imageAlt="Professional Event Planning Answering Service for coordinating flawless events and managing attendee communication."
        showCallButton={true}
        useConversation={true}
        customerMessage="Hi, I'm attending the Tech Innovate Summit next month. I have a question about the speaker schedule and need to confirm my dietary restrictions for the gala dinner. Can you help me with that?"
        aiResponse="Of course! I can confirm the final speaker schedule is available on the event app, and I've just updated your profile with your dietary restrictions for the gala. Is there anything else I can assist you with for the summit?"
      />

      {/* Features Section */}
      <SectionContent
        title="Event Planning Answering Service Features"
        contentTitle="Comprehensive Communication Hub for Your Events"
        contentTitleSubtext="Every feature is designed to support the unique demands of event management, from corporate conferences and trade shows to weddings and private parties. We ensure every detail is handled professionally."
        cards={[
          {
            title: "24/7 RSVP & Registration Management",
            subtitle:
              "Capture every registration and RSVP around the clock. Our team can process attendee information, manage guest lists, handle special requests, and confirm attendance via phone, ensuring accurate headcounts and a seamless registration experience for your guests.",
            image:
              "https://images.pexels.com/photos/2263436/pexels-photo-2263436.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "24/7 RSVP and registration management for events.",
          },
          {
            title: "Ticketing Sales & Support",
            subtitle:
              "Provide a dedicated line for ticket sales, inquiries, and payment processing. We can answer questions about ticket tiers, early-bird pricing, group discounts, and troubleshoot any issues, maximizing your ticket revenue and attendee satisfaction.",
            image:
              "https://images.pexels.com/photos/787961/pexels-photo-787961.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Event ticketing sales and support.",
          },
          {
            title: "Vendor & Supplier Coordination",
            subtitle:
              "Act as a central point of contact for your vendors, suppliers, and staff. We can confirm arrival times, provide directions, handle last-minute coordination, and relay urgent messages, ensuring all your event partners are synchronized and informed.",
            image:
              "https://images.pexels.com/photos/1181345/pexels-photo-1181345.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Vendor and supplier coordination for event planning.",
          },
          {
            title: "Attendee & Guest Information Hotline",
            subtitle:
              "Offer a friendly, knowledgeable resource for your attendees. We answer questions about event schedules, venue locations, parking, dress codes, accommodations, and more, providing a professional and helpful experience that reflects well on your event.",
            image:
              "https://images.pexels.com/photos/3184423/pexels-photo-3184423.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Attendee and guest information hotline.",
          },
          {
            title: "Emergency & On-Site Communication Relay",
            subtitle:
              "Provide a reliable communication channel for urgent, on-site issues. We can escalate critical information to your event team, relay messages between staff, and serve as a calm, professional voice during unexpected situations, ensuring swift resolution.",
            image:
              "https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Emergency and on-site communication for events.",
          },
          {
            title: "Post-Event Follow-Up & Surveys",
            subtitle:
              "Assist with post-event activities, including conducting attendee satisfaction surveys, gathering feedback, and answering follow-up questions. This helps you measure success, collect valuable insights, and build relationships for future events.",
            image:
              "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Post-event follow-up and attendee surveys.",
          },
        ]}
      />

      {/* Value Proposition */}
      <SectionInfo
        title="Why Event Planners Need a Professional Answering Service"
        pageInfoTitle="Elevate Your Events and Regain Your Focus"
        subtitle="Successful event planners and coordinators use a professional answering service to manage communications overload, allowing them to focus on execution and client satisfaction without the distraction of constant calls."
        pageInfoText="The average event planner receives over 50 calls a day in the week leading up to an event. Missing just one critical call from a keynote speaker, vendor, or major sponsor can have significant consequences. Juggling these calls while managing on-site logistics is a primary source of stress and operational inefficiency in the event planning industry.\n\nA dedicated event answering service acts as your communications command center. We capture 100% of calls, ensuring every vendor confirmation, attendee question, and last-minute change is handled professionally and efficiently. This frees up your time to focus on high-value tasks like client relations, creative direction, and flawless event execution.\n\nFrom managing RSVPs for a wedding to handling ticketing for a major conference, our trained specialists become an extension of your team. We learn your event details, speak your brand's language, and provide a seamless experience for attendees, vendors, and stakeholders. Event planners who use our service report a 40% reduction in personal call volume, a significant decrease in stress, and higher satisfaction ratings from their clients and guests."
      />

      {/* Benefits Slider */}
      <SectionContentSlider
        title="Event Answering Service Benefits"
        heading="How a Dedicated Call Service Transforms Your Event Management"
        subheading="Key advantages that lead to smoother events, happier clients, and a more streamlined planning process."
        cards={[
          {
            icon: TrendingUp,
            text: "Increase ticket sales and attendance by ensuring every inquiry is answered promptly. Never miss a potential attendee because of a busy signal or voicemail. We convert callers into confirmed guests.",
            id: "sales-growth",
          },
          {
            icon: Star,
            text: "Enhance guest experience with a professional, dedicated line for information and support. Attendees feel valued and well-cared-for from their first call, setting a positive tone for your event.",
            id: "guest-experience",
          },
          {
            icon: Calendar,
            text: "Improve organization and reduce errors with centralized RSVP and registration management. Our meticulous process ensures accurate guest lists, dietary requirement tracking, and seamless check-ins.",
            id: "organization",
          },
          {
            icon: Users,
            text: "Strengthen vendor relationships with clear, consistent communication. A reliable contact point for suppliers, entertainers, and venue staff prevents misunderstandings and ensures everyone is on the same page.",
            id: "vendor-relations",
          },
          {
            icon: CheckCircle,
            text: "Free up your time to focus on what matters most: creating an amazing event. Delegate the communication logistics to us and get back to strategic planning, creative design, and client management.",
            id: "time-saving",
          },
          {
            icon: Mic,
            text: "Project a professional image for events of any size. Whether you're a solo planner or a large agency, our service provides the polish and responsiveness of a large, dedicated support team.",
            id: "professional-image",
          },
        ]}
      />

      {/* How It Works */}
      <SectionImageInfo
        title="How Our Event Answering Service Works"
        sectionHeading="Seamless Integration, Immediate Support"
        subheading="Go live in just 24-48 hours and let us handle the calls while you handle the event."
        items={[
          {
            title: "Define Your Event Communication Needs",
            subtext:
              "Tell us about your event. We'll create a plan covering everything from RSVP management for a wedding to multi-session registration for a corporate conference. Our service scales to your exact needs.",
            image:
              "https://images.pexels.com/photos/3184328/pexels-photo-3184328.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Event planners defining communication needs with an answering service.",
            useConversation: true,
            customerMessage:
              "I'm a solo wedding planner and I'm drowning in calls from guests about the gift registry and hotel block. Can you just handle those specific questions?",
            aiResponse:
              "Absolutely! We can act as your dedicated guest information line. We'll learn all the details about the registry, hotel accommodations, and transportation, and answer all those calls for you. Your clients and their guests will get instant, friendly answers.",
          },
          {
            title: "We Learn Your Event Inside and Out",
            subtext:
              "Our team is trained on your specific event details. We become experts on your agenda, speakers, venue, vendors, and key contacts, ensuring we represent your event accurately and professionally.",
            image:
              "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Answering service team learning the details of an event.",
            useConversation: true,
            customerMessage:
              "For our annual conference, we need a team that can explain the 12 different breakout sessions and help attendees register for them. Is that possible?",
            aiResponse:
              "Yes, our specialists will be fully trained on each breakout session's content, speaker, and schedule. We can guide attendees through the options and register them for their chosen sessions directly in your system, ensuring a smooth process.",
          },
          {
            title: "Integrate With Your Event Tools",
            subtext:
              "We connect directly with your existing event management software, CRM, or ticketing platform. Registrations, RSVPs, and guest information are synced in real-time, eliminating manual data entry and errors.",
            image:
              "https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Answering service integrating with event management software.",
            useConversation: true,
            customerMessage:
              "We use Eventbrite for ticketing and registration. Can you process sales and update attendee information directly in our Eventbrite account?",
            aiResponse:
              "Yes, we have direct integration with Eventbrite. Our team can process new ticket orders, update attendee details, and manage waitlists in your account in real-time. Everything stays perfectly synchronized without any extra work for you.",
          },
          {
            title: "Go Live and Monitor Performance",
            subtext:
              "Your dedicated event line is active. You can monitor call volumes, registration numbers, and common attendee questions through our real-time dashboard, giving you valuable insights into your event's engagement.",
            image:
              "https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Event planner monitoring call performance on a dashboard.",
            useConversation: true,
            customerMessage:
              "How will I know what's happening? I need to be able to report on registration numbers and common issues to my client.",
            aiResponse:
              "Your client-facing dashboard provides a complete overview. You'll see real-time registration numbers, call volume, a log of common questions, and any escalated issues. You can export reports anytime to keep your clients fully informed.",
          },
        ]}
      />

      {/* FAQ Section */}
      <SectionFAQ
        title="Event Planning Answering Service FAQ"
        heading="Frequently Asked Questions About Call Services for Event Professionals"
        faqs={[
          {
            question: "Can you handle calls for different types of events?",
            answer:
              "Yes. Our service is adaptable for any event, including corporate conferences, trade shows, product launches, weddings, non-profit fundraisers, music festivals, and private parties. We customize our scripts and protocols for each unique event.",
            id: "event-types",
          },
          {
            question:
              "How much does an event answering service cost?",
            answer:
              "Our pricing is flexible to fit your event's budget. We offer per-minute plans, monthly subscriptions, and custom packages for large-scale events. This is significantly more cost-effective than hiring temporary administrative staff, which can cost upwards of $25/hour plus hiring fees.",
            id: "pricing",
          },
          {
            question: "Can you process ticket payments over the phone?",
            answer:
              "Yes, our systems are fully PCI compliant, allowing us to securely process credit card payments for ticket sales and registrations over the phone, providing a convenient option for your attendees.",
            id: "payments",
          },
          {
            question: "How do you manage last-minute changes to the event?",
            answer:
              "We have a protocol for rapid updates. You can provide new information to our team via a dedicated portal or email, and we can have our agents briefed and relaying the new details to callers within minutes. This is crucial for things like schedule changes or venue updates.",
            id: "last-minute-changes",
          },
          {
            question: "What happens if a call needs to be escalated to my team?",
            answer:
              "We work with you to create a clear escalation process. For urgent matters or specific VIP callers, we can transfer the call directly to you or a designated team member, or send an immediate SMS/email notification with the caller's details and needs.",
            id: "escalation",
          },
          {
            question: "Can you make outbound calls to vendors or guests?",
            answer:
              "Yes. In addition to answering incoming calls, we can perform outbound calling campaigns, such as confirming attendance with your RSVP list, reminding speakers of their call times, or verifying details with your vendors.",
            id: "outbound-calls",
          },
        ]}
      />

      {/* CTA Section */}
      <SectionCTA />

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
