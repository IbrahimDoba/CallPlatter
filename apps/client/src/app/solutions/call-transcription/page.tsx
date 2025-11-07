"use client";

import Header from "@/components/Homepage/header";
import Footer from "@/components/Homepage/footer";
import {
  SectionHero,
  SectionFeaturesGrid,
  SectionImageInfo,
  SectionContentSlider,
  SectionFAQ,
  SectionCTA,
} from "@/components/sections";
import {
  FileText,
  Search,
  Globe,
  Zap,
  Lock,
  Users,
} from "lucide-react";

export default function CallTranscriptionPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <SectionHero
        title="AI-Powered Call Transcription"
        titleHighlight="Every Word, Perfectly Captured"
        subtitle="Transform spoken conversations into accurate, searchable text in real-time. Our advanced speech recognition technology transcribes calls with 95%+ accuracy across multiple languages, accents, and industries—giving you a permanent, searchable record of every conversation."
        primaryButtonText="Start Transcribing"
        primaryButtonHref="/signup"
        secondaryButtonText="Request a Demo"
        secondaryButtonHref="/request-demo"
        imageSrc="https://images.pexels.com/photos/5483077/pexels-photo-5483077.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
        imageAlt="Real-time call transcription interface showing spoken words being converted to text"
        useConversation={true}
        customerMessage="I need to confirm the delivery address: it's 1425 Innovation Drive, Suite 200, Austin, Texas, 78701. The delivery window should be between 2 PM and 4 PM on March 15th."
        aiResponse="Perfect, I have that documented: 1425 Innovation Drive, Suite 200, Austin, TX 78701, delivery March 15th between 2-4 PM. I'm transcribing this conversation so you'll receive a written confirmation via email immediately after our call."
      />

      <SectionFeaturesGrid
        title="Professional-Grade Transcription"
        subtitle="Get crystal-clear transcripts that capture every detail, every time. Perfect for legal, medical, sales, and customer service conversations."
        features={[
          {
            title: "95%+ Accuracy Rate",
            description:
              "Our AI achieves industry-leading transcription accuracy using advanced neural networks trained on millions of conversations. Works flawlessly with different accents, speaking speeds, and audio quality levels.",
          },
          {
            title: "Real-Time Transcription",
            description:
              "See words appear on screen as they're spoken during live calls. Perfect for live note-taking, accessibility needs, or monitoring conversations in real-time. Get instant transcripts the moment calls end.",
          },
          {
            title: "Multi-Language Support",
            description:
              "Transcribe calls in 40+ languages including English, Spanish, French, German, Mandarin, Japanese, Arabic, and more. Automatically detects the language being spoken and switches seamlessly for multilingual conversations.",
          },
          {
            title: "Speaker Identification",
            description:
              "Our AI automatically distinguishes between different speakers on the call, labeling each person's contributions separately. Perfect for conference calls, interviews, or tracking customer-agent interactions.",
          },
          {
            title: "Timestamp & Searchable Format",
            description:
              "Every transcript includes precise timestamps, making it easy to find specific moments in recordings. Full-text search across all transcripts lets you locate any conversation or topic instantly using keywords.",
          },
          {
            title: "Custom Vocabulary & Terms",
            description:
              "Add industry jargon, product names, acronyms, and technical terms to ensure perfect accuracy. Our system learns your business vocabulary and applies it automatically to all future transcriptions.",
          },
        ]}
      />

      <SectionImageInfo
        title="Why Businesses Rely on Transcription"
        sectionHeading="From Audio to Actionable Text"
        subheading="Discover how accurate transcriptions transform your workflow"
        items={[
          {
            title: "Legal & Compliance Documentation",
            subtext:
              "Create permanent, legally admissible records of all business communications. Perfect for regulated industries that require documented conversations, verbal agreements, or dispute resolution. Timestamps and speaker identification provide courtroom-quality documentation that protects your business and satisfies regulatory requirements.",
            image:
              "https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          },
          {
            title: "Find Information in Seconds, Not Hours",
            subtext:
              "Stop wasting time listening to entire call recordings trying to find one specific detail. Search all your transcripts instantly using keywords, phrases, or topics. Looking for all calls where 'refund' was mentioned? All conversations about 'Project Phoenix'? All calls with a specific customer? Find them in seconds with full-text search across your entire call history.",
            image:
              "https://images.pexels.com/photos/3183172/pexels-photo-3183172.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          },
          {
            title: "Accessibility & Inclusion",
            subtext:
              "Make your phone systems accessible to everyone. Real-time transcription provides essential accessibility for team members who are deaf or hard of hearing, ensuring everyone can participate fully in calls. Written transcripts also help non-native speakers, those in noisy environments, or anyone who prefers reading to listening.",
            image:
              "https://images.pexels.com/photos/3184433/pexels-photo-3184433.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          },
          {
            title: "Training & Quality Assurance",
            subtext:
              "Use transcripts to train new employees on best practices and successful conversation patterns. Review agent performance by searching for specific phrases, compliance keywords, or script adherence. Quickly identify coaching opportunities by analyzing what top performers say differently. Transcripts make quality assurance scalable and objective.",
            image:
              "https://images.pexels.com/photos/3184296/pexels-photo-3184296.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          },
        ]}
      />

      <SectionContentSlider
        title="Advanced Transcription Features"
        heading="More Than Just Text"
        subheading="Powerful tools that maximize the value of your transcripts"
        cards={[
          {
            icon: FileText,
            text: "Export Options - Download transcripts as TXT, PDF, DOCX, or JSON. Perfect formatting for sharing, archiving, or importing into other systems.",
          },
          {
            icon: Search,
            text: "Advanced Search - Find exact phrases, multiple keywords, speaker-specific content, or sentiment. Filter by date range, call duration, or custom tags.",
          },
          {
            icon: Globe,
            text: "Translation - Automatically translate transcripts into 100+ languages. Perfect for international teams or multilingual customer support.",
          },
          {
            icon: Zap,
            text: "Live Streaming - View transcripts in real-time during active calls. Great for monitoring, compliance, or providing live assistance to agents.",
          },
          {
            icon: Lock,
            text: "Redaction & Privacy - Automatically redact sensitive information like credit card numbers, SSNs, or passwords from transcripts for compliance.",
          },
          {
            icon: Users,
            text: "Team Collaboration - Share transcripts with team members, add comments or highlights, and create shared transcript libraries for training.",
          },
        ]}
      />

      <SectionCTA
        title="Ready to Transform Your Calls into Text?"
        subtitle="Start transcribing every conversation with industry-leading accuracy. No setup fees, no minimums, cancel anytime."
        buttonText="Start Free Trial"
        buttonHref="/signup"
      />

      <SectionFAQ
        title="Transcription Questions"
        heading="Everything you need to know about our transcription service."
        faqs={[
          {
            question: "How accurate is the transcription compared to human transcriptionists?",
            answer:
              "Our AI achieves 95-98% accuracy on clear audio with standard accents—comparable to professional human transcriptionists at a fraction of the cost and with instant delivery. For mission-critical applications like legal proceedings, we offer a hybrid option where AI transcription is reviewed and corrected by certified human transcriptionists, achieving 99.5%+ accuracy.",
            id: "accuracy-comparison",
          },
          {
            question: "Can it handle background noise, multiple speakers, or poor audio quality?",
            answer:
              "Yes. Our advanced noise cancellation algorithms filter out background sounds, music, and ambient noise to focus on speech. We can transcribe calls with multiple speakers (up to 10 distinct voices), overlapping speech, and even low-quality phone connections. Accuracy may decrease slightly with very poor audio but remains highly usable in most real-world conditions.",
            id: "audio-quality",
          },
          {
            question: "Which languages and accents are supported?",
            answer:
              "We support 40+ languages including English (US, UK, Australian), Spanish (Spain, Latin America), French, German, Italian, Portuguese, Dutch, Russian, Japanese, Mandarin, Cantonese, Hindi, Arabic, and many more. Our models are trained on diverse accents and regional variations, delivering accurate transcription regardless of the speaker's origin.",
            id: "languages-accents",
          },
          {
            question: "How does speaker identification work with multiple people on a call?",
            answer:
              "Our AI uses voice biometrics to distinguish between different speakers based on vocal characteristics like pitch, tone, and speaking patterns. Each speaker is automatically labeled (Speaker 1, Speaker 2, etc.) and their contributions are separated in the transcript. You can also assign names to speakers for clearer transcripts. This works even when people talk over each other or switch frequently.",
            id: "speaker-identification",
          },
          {
            question: "Can I edit or correct transcripts if there are errors?",
            answer:
              "Absolutely. Our transcript editor lets you make corrections, add punctuation, format text, or annotate specific sections. Changes are saved with version history so you can always see what was modified. When you make corrections, our AI learns from them and improves accuracy on future calls with similar vocabulary or context.",
            id: "editing-transcripts",
          },
          {
            question: "How is sensitive information handled in transcripts?",
            answer:
              "We offer automatic PII (Personally Identifiable Information) redaction that detects and removes or masks sensitive data like credit card numbers, social security numbers, addresses, dates of birth, and medical information. You can customize redaction rules based on your compliance requirements (HIPAA, GDPR, PCI-DSS). All transcripts are encrypted at rest and in transit.",
            id: "sensitive-information",
          },
          {
            question: "Can transcripts be integrated with other systems or exported?",
            answer:
              "Yes! Export transcripts in multiple formats including plain text, PDF, Microsoft Word (DOCX), JSON, or SRT (subtitle format). We also provide API access to programmatically retrieve transcripts and integrate with your CRM, knowledge base, or business intelligence tools. Transcripts can automatically sync to cloud storage like Google Drive, Dropbox, or AWS S3.",
            id: "export-integration",
          },
          {
            question: "What's the difference between real-time and post-call transcription?",
            answer:
              "Real-time transcription delivers text as words are spoken during live calls with only 2-3 seconds of latency. This is perfect for live monitoring, accessibility, or coaching. Post-call transcription processes the entire recording after the call ends and typically delivers slightly higher accuracy (additional 1-3%) because our AI can analyze the full context. You can use both simultaneously if needed.",
            id: "realtime-vs-postcall",
          },
        ]}
      />

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}

