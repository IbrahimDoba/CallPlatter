"use client";

import Header from "@/components/Homepage/header";
import Footer from "@/components/Homepage/footer";
import {
  SectionHero,
  SectionFeaturesGrid,
  SectionImageInfo,
  SectionContentSlider,
  SectionFAQ,
} from "@/components/sections";
import {
  Clock,
  Mail,
  Users,
  TrendingUp,
  CheckCircle,
  Brain,
} from "lucide-react";

export default function CallSummaryPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <SectionHero
        title="Instant Call Summaries"
        titleHighlight="Turn Hours of Calls Into Minutes of Insights"
        subtitle="Every call automatically summarized with key points, action items, and critical details. No more listening to entire recordings or deciphering messy notes. Get intelligent, actionable summaries delivered instantly after each conversation."
        primaryButtonText="Try It Free"
        primaryButtonHref="/signup"
        secondaryButtonText="Request a Demo"
        secondaryButtonHref="/request-demo"
        imageSrc="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
        imageAlt="Professional reviewing AI-generated call summary on tablet"
        useConversation={true}
        customerMessage="I'm interested in your premium package but need to know if it includes setup assistance, training for my team, and whether we can start with a 3-month trial before committing to annual pricing."
        aiResponse="Absolutely! The premium package includes full setup assistance and two training sessions for your team. We can definitely arrange a 3-month pilot program. Let me connect you with our enterprise team to discuss custom terms."
      />

      <SectionFeaturesGrid
        title="Intelligent Call Summarization"
        subtitle="Our AI doesn't just transcribe—it understands, organizes, and highlights what matters most from every conversation."
        features={[
          {
            title: "Automatic Key Points Extraction",
            description:
              "Our AI identifies and extracts the most important information from each call: customer requirements, pain points, commitments made, pricing discussed, and next steps agreed upon.",
          },
          {
            title: "Action Items & Follow-Ups",
            description:
              "Never forget a promise or deadline again. We automatically detect action items, assign them to the right team members, and create follow-up reminders with due dates.",
          },
          {
            title: "Sentiment & Emotion Analysis",
            description:
              "Understand how your customers truly feel. Our AI analyzes tone, emotion, and satisfaction levels throughout the conversation, alerting you to potential issues or opportunities.",
          },
          {
            title: "Instant Email Summaries",
            description:
              "After every call, receive a beautifully formatted email summary with key highlights, decisions made, and next steps. Forward to colleagues or keep for your records with zero effort.",
          },
          {
            title: "CRM Auto-Update",
            description:
              "Call summaries automatically sync with your CRM (Salesforce, HubSpot, etc.). Contact records, deal notes, and activity logs update themselves—eliminating manual data entry forever.",
          },
          {
            title: "Custom Summary Templates",
            description:
              "Different call types need different information. Create custom summary templates for sales calls, support tickets, consultations, or interviews that capture exactly what your team needs.",
          },
        ]}
      />

      <SectionImageInfo
        title="The Power of Automated Summaries"
        sectionHeading="Work Smarter, Not Harder"
        subheading="See how intelligent call summaries transform your workflow"
        items={[
          {
            title: "Save Hours Every Single Week",
            subtext:
              "Stop spending time listening to recordings, taking notes during calls, or trying to remember what was discussed. Our AI instantly processes every conversation and delivers comprehensive summaries in seconds. Sales reps save 5-10 hours per week, managers can review team performance in minutes instead of hours, and everyone stays on the same page effortlessly.",
            image:
              "https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          },
          {
            title: "Never Miss Critical Details Again",
            subtext:
              "Important information shared on calls—pricing agreements, technical requirements, delivery dates, customer objections—is automatically captured, organized, and highlighted. Whether you're following up with a client or handing off to another team member, you have complete context at your fingertips. No more 'I think they said...' or 'Let me check my notes...'",
            image:
              "https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          },
          {
            title: "Improve Team Collaboration & Handoffs",
            subtext:
              "When calls are summarized automatically, your entire team has instant access to what was discussed. Sales can brief account managers, support can catch up on customer history, and executives can review key deals—all without scheduling meetings or writing reports. Everyone works from the same accurate information, eliminating miscommunication and dropped balls.",
            image:
              "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          },
        ]}
      />

      <SectionContentSlider
        title="What Gets Captured in Every Summary"
        heading="Comprehensive & Intelligent"
        subheading="Our AI understands context and extracts what matters most"
        cards={[
          {
            icon: Clock,
            text: "Call Duration & Timing - When the call happened, how long it lasted, and who was involved",
          },
          {
            icon: Users,
            text: "Participants & Roles - Automatic identification of who spoke, their role, and speaking time distribution",
          },
          {
            icon: CheckCircle,
            text: "Key Decisions & Agreements - Important commitments, pricing discussed, terms agreed upon, and approvals given",
          },
          {
            icon: Mail,
            text: "Action Items & Deadlines - Tasks assigned, follow-ups needed, deadlines mentioned, and who's responsible",
          },
          {
            icon: TrendingUp,
            text: "Customer Intent & Sentiment - Purchase signals, objections raised, satisfaction level, and buying readiness",
          },
          {
            icon: Brain,
            text: "Topics & Keywords - Main discussion points, products mentioned, competitors discussed, and concerns raised",
          },
        ]}
      />

      <SectionFAQ
        title="Call Summary Questions"
        heading="Everything you need to know about automated call summaries."
        faqs={[
          {
            question: "How quickly are call summaries generated?",
            answer:
              "Call summaries are generated instantly after the call ends—typically within 10-30 seconds depending on call length. You'll receive an email summary immediately, and the full summary with action items is available in your dashboard before you even finish your next task. For longer calls (over 30 minutes), it may take up to 2 minutes.",
            id: "generation-speed",
          },
          {
            question: "Can I customize what information is included in summaries?",
            answer:
              "Absolutely! You have full control over summary content. Create custom templates for different call types (sales, support, consultation) and specify what information to prioritize. You can choose to include or exclude sections like sentiment analysis, action items, technical details, pricing discussions, or competitor mentions. Configure it once and every future call of that type follows your template.",
            id: "customization",
          },
          {
            question: "Do summaries work with accents or industry-specific terminology?",
            answer:
              "Yes. Our AI is trained on diverse accents and continuously learns industry-specific vocabulary. You can also add custom terminology to your account—product names, technical jargon, company-specific acronyms—to ensure perfect accuracy. The system improves over time as it learns from your conversations.",
            id: "accents-terminology",
          },
          {
            question: "Can summaries be shared with team members or clients?",
            answer:
              "Yes! Share summaries instantly via email, Slack, or generate a secure shareable link. You can share the full summary or create client-friendly versions that exclude internal notes or sensitive information. All sharing is logged for compliance and security. You can also export summaries as PDFs for formal record-keeping.",
            id: "sharing",
          },
          {
            question: "How accurate are the action items and follow-ups detected?",
            answer:
              "Our AI achieves 85-95% accuracy in detecting action items and commitments, depending on how clearly they're stated in the conversation. The system recognizes phrases like 'I'll send you...', 'Let's schedule...', 'Can you provide...', and 'We need to...' and automatically converts them into actionable tasks with due dates when mentioned. You can always edit or add items manually if needed.",
            id: "action-item-accuracy",
          },
          {
            question: "Does this integrate with our existing CRM and tools?",
            answer:
              "Yes! We integrate with Salesforce, HubSpot, Pipedrive, Zoho, Microsoft Dynamics, and dozens of other CRMs. Call summaries, action items, and key details automatically sync to the appropriate contact or deal records. We also integrate with Slack, Microsoft Teams, Asana, Trello, and Monday.com for task management. If you use a custom system, we offer API access for seamless integration.",
            id: "crm-integration",
          },
          {
            question: "What happens to summaries of confidential or sensitive calls?",
            answer:
              "All summaries are encrypted and stored securely. You can mark specific calls as confidential, restricting access to authorized team members only. For highly sensitive calls (legal, medical, financial), you can disable automatic email summaries and require dashboard-only access with two-factor authentication. You have complete control over retention policies and can permanently delete summaries at any time.",
            id: "confidential-calls",
          },
          {
            question: "Can I get a summary of multiple calls together for reporting?",
            answer:
              "Yes! Use our bulk summary feature to generate consolidated reports across multiple calls. Filter by date range, team member, customer, topic, or outcome to create weekly summaries, monthly performance reports, or campaign analysis. Our AI identifies patterns, trends, and common themes across conversations—perfect for management reviews and strategic planning.",
            id: "bulk-summaries",
          },
        ]}
      />

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}

