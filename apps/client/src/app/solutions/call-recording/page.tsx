"use client";

import Header from "@/components/Homepage/header";
import Footer from "@/components/Homepage/footer";
import {
  SectionHero,
  SectionFeaturesGrid,
  SectionImageInfo,
  SectionContentSlider,
  SectionHowItWorks,
  SectionFAQ,
} from "@/components/sections";
import { Shield, Database, Search, FileText, Lock, Clock } from "lucide-react";

export default function CallRecordingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <SectionHero
        title="AI-Powered Call Recording"
        titleHighlight="Never Miss a Detail Again"
        subtitle="Automatically record, transcribe, and analyze every conversation. Our intelligent call recording system captures critical information, ensures compliance, and provides valuable insights to improve your business operations."
        primaryButtonText="Start Recording Today"
        primaryButtonHref="/signup"
        secondaryButtonText="Request a Demo"
        secondaryButtonHref="/request-demo"
        imageSrc="https://images.pexels.com/photos/4195325/pexels-photo-4195325.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
        imageAlt="Professional recording setup with audio waveforms displaying call analytics"
        useConversation={true}
        customerMessage="Hi, I wanted to follow up on the quote you sent last week. Can you remind me what was included in the premium package?"
        aiResponse="Of course! The premium package includes 24/7 support, priority scheduling, and a dedicated account manager. I'll send you a detailed breakdown via email. Let me also note this conversation is recorded for quality assurance."
      />

      <SectionFeaturesGrid
        title="Complete Call Recording Solution"
        subtitle="Our call recording service provides everything you need to capture, store, and leverage your conversations for business success."
        features={[
          {
            title: "Automatic Recording",
            description:
              "Every call is automatically recorded from start to finish. No manual buttons to press, no missed conversations. Set it once and let our system handle the rest.",
          },
          {
            title: "Real-Time Transcription",
            description:
              "Get instant, accurate transcripts of every call. Search through conversations using keywords, review critical details, and share transcripts with your team effortlessly.",
          },
          {
            title: "AI-Powered Insights",
            description:
              "Our advanced AI analyzes sentiment, identifies key topics, extracts action items, and highlights important moments—turning raw recordings into actionable business intelligence.",
          },
          {
            title: "Compliance & Legal Protection",
            description:
              "Stay compliant with industry regulations including GDPR, HIPAA, and call recording laws. Automatic consent notifications, secure storage, and detailed audit trails.",
          },
          {
            title: "Unlimited Cloud Storage",
            description:
              "All recordings are securely stored in the cloud with unlimited retention. Access your call history from anywhere, anytime, with enterprise-grade encryption and redundancy.",
          },
          {
            title: "Advanced Search & Filter",
            description:
              "Find any conversation in seconds. Search by date, caller, keywords, duration, or outcomes. Filter by sentiment, urgency, or custom tags to surface exactly what you need.",
          },
        ]}
      />

      <SectionImageInfo
        title="Why Businesses Trust Our Call Recording"
        sectionHeading="Transform Your Conversations Into Assets"
        subheading="Discover how intelligent call recording protects your business and drives growth"
        items={[
          {
            title: "Protect Your Business from Disputes",
            subtext:
              "Never rely on memory again. Having an accurate recording of what was said, when it was said, and who said it provides ironclad protection against disputes, chargebacks, and legal issues. Our recordings are timestamped and tamper-proof.",
            image:
              "https://images.pexels.com/photos/5668838/pexels-photo-5668838.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          },
          {
            title: "Train & Improve Your Team",
            subtext:
              "Use real customer conversations as training materials. Identify what top performers do differently, share best practices across your team, and coach employees with specific examples. Turn every call into a learning opportunity.",
            image:
              "https://images.pexels.com/photos/3183198/pexels-photo-3183198.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          },
          {
            title: "Capture Critical Information Automatically",
            subtext:
              "Important details shared on calls—customer requirements, pricing agreements, delivery dates—are automatically extracted and organized. No more frantic note-taking or forgotten details. Everything is captured and searchable.",
            image:
              "https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          },
          {
            title: "Ensure Quality & Compliance",
            subtext:
              "Monitor every customer interaction for quality assurance and compliance. Identify script deviations, compliance violations, or service issues before they become problems. Get alerts for specific keywords or phrases that require attention.",
            image:
              "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          },
        ]}
      />

      <SectionContentSlider
        title="Industries That Rely on Call Recording"
        heading="Built for Every Business"
        subheading="See how different industries leverage our call recording technology"
        cards={[
          {
            icon: Shield,
            text: "Legal & Professional Services - Document every client conversation for complete protection and billing accuracy",
          },
          {
            icon: Database,
            text: "Healthcare - Maintain HIPAA-compliant records of all patient communications and appointment details",
          },
          {
            icon: Search,
            text: "Sales Teams - Review successful calls, identify objection patterns, and replicate winning strategies",
          },
          {
            icon: FileText,
            text: "Customer Support - Quality assurance monitoring, dispute resolution, and performance evaluation",
          },
          {
            icon: Lock,
            text: "Financial Services - Regulatory compliance, transaction verification, and fraud prevention",
          },
          {
            icon: Clock,
            text: "Real Estate - Document property details, client preferences, and verbal agreements with timestamps",
          },
        ]}
      />

      <SectionHowItWorks
        title="Start Recording in Minutes"
        subtitle="Our intelligent recording system is ready to work the moment you connect your phone."
        steps={[
          {
            title: "Activate Call Recording",
            description:
              "Simply enable call recording in your dashboard. Choose whether to record all calls automatically or only specific types. Set up custom consent messages that comply with your local regulations.",
            image:
              "https://images.pexels.com/photos/6476587/pexels-photo-6476587.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Dashboard interface showing call recording activation settings",
          },
          {
            title: "Calls Are Automatically Captured & Transcribed",
            description:
              "Once activated, every call is recorded in crystal-clear quality and instantly transcribed. Our AI identifies speakers, timestamps key moments, and extracts important information without any manual effort required.",
            image:
              "https://images.pexels.com/photos/7688465/pexels-photo-7688465.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Real-time transcription display with speaker identification",
          },
          {
            title: "Access, Search & Analyze",
            description:
              "Review your calls in an intuitive library. Search transcripts, filter by outcomes, listen to specific moments, or let our AI summarize entire conversations. Share recordings securely with your team or export for your records.",
            image:
              "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Call library interface with search and analytics features",
          },
        ]}
      />

      <SectionFAQ
        title="Call Recording Questions"
        heading="Everything you need to know about our call recording service."
        faqs={[
          {
            question: "Is it legal to record phone calls?",
            answer:
              "Call recording laws vary by location. In most US states, only one party (you) needs to consent to record a call. Some states require both parties to consent. Our system automatically plays customizable consent notifications before recording begins, ensuring you stay compliant with local laws. We recommend consulting with legal counsel for your specific situation.",
            id: "legal-recording",
          },
          {
            question: "How long are call recordings stored?",
            answer:
              "We offer unlimited storage on all plans. Your recordings are stored securely in the cloud for as long as you need them. You can set custom retention policies (e.g., auto-delete after 1 year for certain call types) or keep everything indefinitely. All recordings are encrypted and backed up across multiple data centers.",
            id: "storage-duration",
          },
          {
            question: "Can I access recordings from my phone or while traveling?",
            answer:
              "Absolutely. Your entire call recording library is accessible from any device—desktop, tablet, or smartphone. Log into your account from anywhere in the world to listen to recordings, read transcripts, or share clips with your team. Our mobile app makes it especially convenient when you're on the go.",
            id: "mobile-access",
          },
          {
            question: "How accurate are the transcriptions?",
            answer:
              "Our AI-powered transcription service achieves 90-95% accuracy on average, depending on audio quality, accents, and background noise. The transcription engine is continuously learning and improving. You can also edit transcripts manually if needed, and our system learns from your corrections.",
            id: "transcription-accuracy",
          },
          {
            question: "What happens if someone requests their recording be deleted?",
            answer:
              "You have full control over your recordings. If a customer or contact requests deletion, you can permanently remove specific recordings from your account with a single click. This action is immediate and irreversible, ensuring compliance with GDPR, CCPA, and other privacy regulations.",
            id: "deletion-requests",
          },
          {
            question: "Can I share recordings with my team or external parties?",
            answer:
              "Yes. You can share recordings securely via a password-protected link that expires after a set time. You can also grant team members access to specific recordings or folders, with permission levels (view only, download, edit). All sharing activity is logged for your records.",
            id: "sharing-recordings",
          },
          {
            question: "What if I only want to record certain types of calls?",
            answer:
              "You have complete flexibility. Record all calls automatically, or set up rules to record only specific scenarios—like calls that last longer than 2 minutes, calls from new customers, calls about specific topics, or calls handled by certain team members. Configure it however works best for your business.",
            id: "selective-recording",
          },
          {
            question: "Is the call recording service HIPAA compliant?",
            answer:
              "Yes. We offer HIPAA-compliant call recording for healthcare providers and other organizations handling protected health information (PHI). Our HIPAA plans include Business Associate Agreements (BAAs), enhanced encryption, access controls, and detailed audit logs. Please contact us to discuss your specific compliance needs.",
            id: "hipaa-compliance",
          },
        ]}
      />

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}

