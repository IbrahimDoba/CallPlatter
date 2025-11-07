"use client";

import Header from "@/components/Homepage/header";
import Footer from "@/components/Homepage/footer";
import {
  SectionHero,
  SectionImageInfo,
  SectionFeaturesGrid,
  SectionFAQ,
} from "@/components/sections";

export default function EmailSummaryPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <SectionHero
        title="AI-Powered Email Summaries"
        titleHighlight="Stay Informed, Effortlessly"
        subtitle="Get a perfect, AI-generated summary of every call delivered directly to your inbox. Our daily call digests provide actionable insights, key details, and caller sentiment, so you can stay on top of your business without listening to a single recording."
        primaryButtonText="Start Your Free Trial"
        primaryButtonHref="/signup"
        secondaryButtonText="Request a Demo"
        secondaryButtonHref="/request-demo"
        imageSrc="https://images.pexels.com/photos/4145153/pexels-photo-4145153.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
        imageAlt="A person reviewing an email summary of their business calls on a laptop."
        useConversation={true}
        customerMessage="Hi, my name is Sarah. I'm calling to get a quote for catering for a corporate event of about 50 people on December 5th. My budget is around $2,000. Please call me back at 555-123-4567."
        aiResponse="Thank you, Sarah. I have all your details: a catering quote for 50 people on December 5th with a $2,000 budget. I've passed this message on to our catering manager, and they will call you back shortly at 555-123-4567 to discuss the menu options."
      />

      <SectionImageInfo
        title="Your Daily Call Digest: Perfected"
        sectionHeading="All Your Key Call Information in a Single, Scannable Email"
        subheading="Our email summaries are intelligently designed to give you everything you need at a glance, transforming raw conversations into structured, actionable data."
        items={[
          {
            title: "Caller & Contact Information",
            subtext:
              "Instantly see who called, their phone number, and any information they provided. If they're a returning customer, we'll link to their profile in your CRM, giving you immediate context for every conversation.",
            image:
              "https://images.pexels.com/photos/669612/pexels-photo-669612.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "A mockup of an email summary showing clear caller and contact information.",
          },
          {
            title: "AI-Generated Call Summary",
            subtext:
              "Our advanced AI listens to the entire conversation and condenses it into a concise, accurate summary. You'll understand the reason for the call and the outcome in seconds, without having to read a full transcript.",
            image:
              "https://images.pexels.com/photos/326503/pexels-photo-326503.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "An example of a clear, AI-generated summary of a business call.",
          },
          {
            title: "Action Items & Next Steps",
            subtext:
              "Never forget to follow up. The AI identifies and highlights clear action items, such as 'Call back,' 'Send quote,' or 'Book appointment,' so your team knows exactly what to do next to secure the business.",
            image:
              "https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "A to-do list with clear action items generated from call summaries.",
          },
        ]}
      />

      <SectionFeaturesGrid
        title="Unlock Deeper Insights from Every Call"
        subtitle="Our email summaries go beyond basic transcription to provide you with valuable business intelligence."
        features={[
          {
            title: "Sentiment Analysis",
            description:
              "Instantly gauge the mood of every caller. Our AI analyzes the tone and language to label calls as positive, neutral, or negative, helping you prioritize follow-ups and identify customer service trends.",
          },
          {
            title: "Call Categorization",
            description:
              "Automatically tag and categorize calls based on their content. Whether it's a 'New Lead,' 'Support Request,' or 'Appointment Booking,' you can easily filter and analyze your call data.",
          },
          {
            title: "Keyword & Topic Spotting",
            description:
              "Identify trends in what your customers are asking for. Our AI spots frequently mentioned keywords and topics, giving you valuable insights into market demand and product feedback.",
          },
          {
            title: "CRM Integration",
            description:
              "Sync all call summaries and data directly to your CRM. A record of the call is automatically added to the customer's contact file, ensuring your team has a complete history of all interactions.",
          },
          {
            title: "Customizable Reports",
            description:
              "Choose the frequency and format of your summaries. Whether you want an instant alert for every call or a single daily digest, you can customize the reports to fit your workflow.",
          },
          {
            title: "Full Transcription Included",
            description:
              "For when you need every detail, a full, accurate transcript of the call is always included with the summary, giving you the option to dive deeper whenever necessary.",
          },
        ]}
      />

      <SectionFAQ
        title="Frequently Asked Questions"
        heading="Common questions about our AI-Powered Email Summaries."
        faqs={[
          {
            question: "How accurate are the AI summaries?",
            answer:
              "Our AI is built on a state-of-the-art language model, providing incredibly high accuracy. It's designed to understand context, identify key details, and filter out irrelevant chatter to create a summary that is both concise and comprehensive.",
            id: "accuracy",
          },
          {
            question: "Can I customize what information is included in the summary?",
            answer:
              "Yes. During setup, you can specify what information is most important to your business. We can tailor the AI to focus on capturing specific details, such as budget, timeline, or product interest, and feature them prominently in the summary.",
            id: "customization",
          },
          {
            question: "How quickly do I receive the email summary after a call?",
            answer:
              "You can choose your delivery schedule. We offer real-time summaries that are sent moments after a call ends, as well as hourly, daily, or weekly digests. Most clients prefer a daily digest to review all of the previous day's calls at once.",
            id: "delivery-speed",
          },
          {
            question: "Is the email and call data secure?",
            answer:
              "Absolutely. All data, both in transit and at rest, is fully encrypted. We adhere to strict security protocols to ensure that your business and customer information is always protected and confidential.",
            id: "security",
          },
          {
            question: "Does this integrate with my existing email client and CRM?",
            answer:
              "Yes. The summaries are sent as standard emails, so they work with any email client (like Gmail, Outlook, etc.). We also offer direct integrations with popular CRMs to automatically log call details to the correct customer records.",
            id: "integrations",
          },
          {
            question: "What happens if the summary misses an important detail?",
            answer:
              "While our AI is highly accurate, every summary also includes a link to the full call recording and a complete transcription. This gives you a fallback to easily access the raw conversation if you ever need to verify a specific detail.",
            id: "missed-details",
          },
        ]}
      />

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
