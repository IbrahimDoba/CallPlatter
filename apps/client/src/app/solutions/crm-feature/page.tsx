"use client";

import Header from "@/components/Homepage/header";
import Footer from "@/components/Homepage/footer";
import {
  SectionHero,
  SectionFeaturesGrid,
  SectionHowItWorks,
  SectionContentSlider,
  SectionFAQ,
} from "@/components/sections";
import {
  Database,
  RefreshCw,
  Zap,
  Users,
  BarChart3,
  Shield,
} from "lucide-react";

export default function CRMIntegrationPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <SectionHero
        title="Seamless CRM Integration"
        titleHighlight="Your Calls, Automatically Logged & Organized"
        subtitle="Stop manual data entry forever. Every call automatically syncs with your CRM—contact details, call notes, outcomes, and follow-ups update themselves. Works seamlessly with Salesforce, HubSpot, Pipedrive, Zoho, and 50+ other platforms."
        primaryButtonText="Connect Your CRM"
        primaryButtonHref="/signup"
        secondaryButtonText="See Integrations"
        secondaryButtonHref="#how-it-works"
        imageSrc="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
        imageAlt="CRM dashboard showing automated call data synchronization"
        useConversation={true}
        customerMessage="Hi, this is Sarah from Acme Corp calling about upgrading our enterprise plan. We currently have 50 users but will scale to 200 by Q3. Can you walk me through pricing options?"
        aiResponse="Absolutely, Sarah! Let me pull up your Acme Corp account. I see you're on the Professional plan. For scaling to 200 users, our Enterprise tier would be perfect. I'll log these details and have our sales team send a custom quote within 24 hours."
      />

      <SectionFeaturesGrid
        title="CRM Integration That Works Automatically"
        subtitle="Connect once, and every call instantly updates your CRM with zero manual effort. It's like having a personal assistant for data entry."
        features={[
          {
            title: "Automatic Contact Creation & Updates",
            description:
              "When new customers call, their contact records are created automatically in your CRM with phone number, location, and conversation history. Existing contacts update in real-time with each interaction.",
          },
          {
            title: "Smart Deal & Opportunity Tracking",
            description:
              "Calls are automatically linked to the correct deals or opportunities in your pipeline. Deal stages update based on conversation outcomes, and next steps are added to your CRM workflow automatically.",
          },
          {
            title: "Real-Time Activity Logging",
            description:
              "Every call is instantly logged as an activity in your CRM with full details: duration, outcome, sentiment, key topics discussed, and AI-generated notes. Your team always has complete conversation history.",
          },
          {
            title: "Custom Field Mapping",
            description:
              "Map call data to any custom fields in your CRM. Extract specific information like budget discussed, decision timeframe, pain points, or competitor mentions and populate your CRM fields automatically.",
          },
          {
            title: "Bi-Directional Sync",
            description:
              "Changes flow both ways. Update a contact in your CRM and our system reflects it instantly. Schedule a follow-up in your CRM and our AI knows to reference it on the next call. Perfect synchronization, always.",
          },
          {
            title: "Task & Follow-Up Automation",
            description:
              "Action items identified during calls automatically create tasks in your CRM assigned to the right team members with proper due dates. Never manually create a follow-up reminder again.",
          },
        ]}
      />

      <SectionHowItWorks
        title="Connect Your CRM in 3 Simple Steps"
        subtitle="Get up and running in minutes with our seamless integration process."
        steps={[
          {
            title: "Choose Your CRM Platform",
            description:
              "Select your CRM from our extensive list of integrations including Salesforce, HubSpot, Pipedrive, Zoho, Microsoft Dynamics, Close, Copper, and 50+ others. We support all major CRMs and custom platforms via API.",
            image:
              "https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Dashboard showing available CRM integration options",
          },
          {
            title: "Authenticate & Configure",
            description:
              "Securely connect your CRM with a single click using OAuth. Then customize how data flows: choose which fields to sync, set up custom mappings, define trigger rules, and configure team permissions. Our smart defaults work perfectly for most businesses.",
            image:
              "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Configuration interface for CRM field mapping",
          },
          {
            title: "Calls Auto-Sync Instantly",
            description:
              "That's it! From now on, every call automatically creates or updates records in your CRM. Your team sees complete, accurate data without lifting a finger. Focus on closing deals, not data entry.",
            image:
              "https://images.pexels.com/photos/3184639/pexels-photo-3184639.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Real-time CRM synchronization dashboard",
          },
        ]}
      />

      <SectionContentSlider
        title="Supported CRM Platforms & Features"
        heading="Works With Everything You Use"
        subheading="Native integrations with the tools your team already relies on"
        cards={[
          {
            icon: Database,
            text: "Salesforce - Full integration with Sales Cloud, Service Cloud, and custom objects. Sync accounts, contacts, leads, opportunities, and cases.",
          },
          {
            icon: RefreshCw,
            text: "HubSpot - Automatic contact enrichment, deal stage updates, and activity logging. Works with all HubSpot hubs and custom properties.",
          },
          {
            icon: Zap,
            text: "Pipedrive - Instant pipeline updates, deal tracking, and activity logging. Smart matching with persons, organizations, and deals.",
          },
          {
            icon: Users,
            text: "Zoho CRM - Complete bi-directional sync with modules, custom fields, and workflows. Supports multi-user setups and teams.",
          },
          {
            icon: BarChart3,
            text: "Microsoft Dynamics 365 - Enterprise-grade integration with accounts, contacts, leads, and opportunities. Full audit trail and security.",
          },
          {
            icon: Shield,
            text: "Custom CRMs & APIs - Use our REST API to integrate with any custom CRM or business system. Full documentation and dedicated support.",
          },
        ]}
      />

      <SectionFAQ
        title="CRM Integration Questions"
        heading="Everything you need to know about connecting your CRM."
        faqs={[
          {
            question: "How quickly does data sync between calls and our CRM?",
            answer:
              "Data syncs in real-time—typically within 2-5 seconds after a call ends. Contact updates, activity logs, and notes appear in your CRM before you even open the contact record. For complex workflows with custom triggers, sync may take up to 30 seconds. You can also configure batch syncing if you prefer scheduled updates.",
            id: "sync-speed",
          },
          {
            question: "What happens if we use multiple CRMs or have custom systems?",
            answer:
              "No problem! Our system can sync with multiple CRMs simultaneously. If you use Salesforce for sales and Zendesk for support, both update automatically. For custom CRMs or proprietary systems, we provide a robust REST API with webhooks, allowing you to push/pull data exactly how you need. Our technical team can help with custom integrations.",
            id: "multiple-crms",
          },
          {
            question: "Can we control which team members have access to CRM sync?",
            answer:
              "Absolutely. You have granular permission controls. Set up user roles to determine who can sync data, which CRM objects they can access, and what fields they can update. For example, sales reps might only sync to their own leads, while managers see all activity. Permissions mirror your CRM's existing security model.",
            id: "access-control",
          },
          {
            question: "Will this create duplicate records in our CRM?",
            answer:
              "No—our smart matching algorithm prevents duplicates by identifying contacts through multiple data points: phone number, email, name, and company. When a match is found, we update the existing record. If multiple potential matches exist, you can configure rules for how to handle them (merge, create new, or ask for manual review).",
            id: "duplicate-prevention",
          },
          {
            question: "Can we customize what call data gets sent to our CRM?",
            answer:
              "Yes! You have complete control over data flow. Choose which call attributes to sync (duration, outcome, sentiment, recording, transcript), map them to specific CRM fields, and set up conditional rules (e.g., only sync calls longer than 2 minutes or calls marked as qualified leads). Create different sync profiles for different call types.",
            id: "custom-data-mapping",
          },
          {
            question: "What if a call involves multiple contacts or companies?",
            answer:
              "Our system intelligently handles complex scenarios. If a call involves multiple people (conference calls, transferred calls), we create activity records associated with all relevant contacts. You can also configure primary/secondary contact rules and relationship mapping based on your business logic.",
            id: "multiple-contacts",
          },
          {
            question: "Is the CRM integration secure and compliant?",
            answer:
              "Security is our top priority. All data transfers use enterprise-grade encryption (TLS 1.3), and we never store your CRM credentials—only secure OAuth tokens. We're SOC 2 Type II certified, GDPR compliant, and HIPAA-ready for healthcare organizations. All sync activity is logged for auditing and compliance requirements.",
            id: "security-compliance",
          },
          {
            question: "Can we test the integration before rolling it out company-wide?",
            answer:
              "Definitely! We recommend starting with a sandbox or test CRM environment. You can also enable the integration for specific users or teams first, verify data accuracy, and then expand to your entire organization. Our support team provides hands-on onboarding and testing assistance to ensure everything works perfectly before going live.",
            id: "testing-rollout",
          },
        ]}
      />

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}

