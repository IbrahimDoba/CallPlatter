"use client";

import Header from "@/components/Homepage/header";
import Footer from "@/components/Homepage/footer";
import {
  SectionHero,
  SectionFeaturesGrid,
  SectionImageInfo,
  SectionHowItWorks,
  SectionContentSlider,
  SectionFAQ,
} from "@/components/sections";
import {
  Mic,
  Volume2,
  Settings,
  Sparkles,
  Globe,
  Smile,
} from "lucide-react";

export default function VoiceOptionsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <SectionHero
        title="Custom AI Voice Options"
        titleHighlight="Your Brand, Your Voice"
        subtitle="Choose from 100+ natural-sounding AI voices in multiple languages, accents, and speaking styles. Or create a custom voice that perfectly represents your brand personality—from professional and authoritative to warm and friendly."
        primaryButtonText="Explore Voices"
        primaryButtonHref="/signup"
        secondaryButtonText="Request a Demo"
        secondaryButtonHref="/request-demo"
        imageSrc="https://images.pexels.com/photos/4195325/pexels-photo-4195325.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
        imageAlt="Audio waveform visualization representing diverse AI voice options"
        useConversation={true}
        customerMessage="Hi, I'm calling to schedule a consultation for next week. Do you have any morning slots available?"
        aiResponse="Good morning! I'd be happy to help you schedule a consultation. I have several morning appointments available next week. Would Tuesday at 9:30 AM or Wednesday at 10:00 AM work better for you?"
      />

      <SectionFeaturesGrid
        title="Voices That Sound Human"
        subtitle="Our advanced text-to-speech technology creates natural, expressive voices that customers can't tell apart from real humans."
        features={[
          {
            title: "100+ Premium Voices",
            description:
              "Choose from an extensive library of professionally-crafted AI voices spanning different genders, ages, accents, and speaking styles. From energetic and upbeat to calm and reassuring—find the perfect voice for your brand.",
          },
          {
            title: "Multiple Languages & Accents",
            description:
              "Native-sounding voices in 50+ languages including English (US, UK, Australian, Canadian), Spanish, French, German, Italian, Portuguese, Japanese, Mandarin, Hindi, Arabic, and more. Serve global customers in their preferred language.",
          },
          {
            title: "Emotional Intelligence",
            description:
              "Our AI voices convey appropriate emotions based on context—sounding empathetic during difficult conversations, excited when sharing good news, and professional when discussing business matters. Natural prosody and intonation make every interaction feel genuine.",
          },
          {
            title: "Custom Voice Cloning",
            description:
              "Create a unique AI voice that sounds like a specific person or matches your exact brand requirements. Perfect for businesses wanting a signature voice identity that's exclusively theirs. Requires just 30 minutes of sample audio.",
          },
          {
            title: "Speaking Style Controls",
            description:
              "Fine-tune how your AI sounds: adjust speaking speed, pitch, emphasis, pause duration, and energy level. Create different voice profiles for different scenarios—urgent messages, friendly greetings, formal announcements, or conversational dialogues.",
          },
          {
            title: "Pronunciation Customization",
            description:
              "Teach your AI how to pronounce industry jargon, brand names, product codes, or unusual words correctly. Create a pronunciation dictionary that ensures perfect delivery of specialized terminology every time.",
          },
        ]}
      />

      <SectionImageInfo
        title="Why Voice Matters"
        sectionHeading="The Power of the Right Voice"
        subheading="Your AI's voice shapes how customers perceive your entire brand"
        items={[
          {
            title: "Build Trust & Credibility Instantly",
            subtext:
              "First impressions happen in seconds, and voice is a huge part of it. A professional, clear, and appropriate voice immediately establishes credibility and makes callers feel they're in good hands. Studies show customers are 40% more likely to trust companies with professional voice systems compared to robotic-sounding alternatives.",
            image:
              "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          },
          {
            title: "Match Your Brand Personality",
            subtext:
              "Your phone system should sound like your brand. A tech startup needs a different voice than a law firm. A fitness company needs different energy than a meditation app. Choose voices that align with your brand identity—whether that's innovative and energetic, sophisticated and calm, friendly and approachable, or authoritative and confident.",
            image:
              "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          },
          {
            title: "Improve Customer Satisfaction",
            subtext:
              "Natural-sounding voices significantly reduce caller frustration. When customers can easily understand your AI and don't feel like they're talking to a 'robot,' satisfaction scores increase by 35% on average. Clear pronunciation, appropriate pacing, and natural intonation make every interaction smoother and more pleasant.",
            image:
              "https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          },
          {
            title: "Serve Diverse Audiences Effectively",
            subtext:
              "Different customers respond to different voices. Older demographics often prefer mature, authoritative voices while younger audiences relate to energetic, casual voices. International customers need native accents in their language. Our voice library lets you customize the experience for different customer segments, regions, or use cases.",
            image:
              "https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          },
        ]}
      />

      <SectionHowItWorks
        title="Customize Your AI Voice in Minutes"
        subtitle="Setting up the perfect voice for your business is quick and easy."
        steps={[
          {
            title: "Preview Voice Library",
            description:
              "Browse our extensive collection of AI voices, organized by language, accent, gender, age, and style. Listen to samples of each voice handling common business scenarios like greetings, questions, confirmations, and empathetic responses.",
            image:
              "https://images.pexels.com/photos/3183186/pexels-photo-3183186.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Voice library interface showing diverse voice options with play buttons",
          },
          {
            title: "Select & Customize",
            description:
              "Choose your preferred voice and fine-tune it to perfection. Adjust speaking speed for clarity, modify pitch for personality, set pause durations for natural flow, and add emphasis patterns. Test your customizations with your actual scripts to hear exactly how it will sound.",
            image:
              "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Voice customization controls showing speed, pitch, and style adjustments",
          },
          {
            title: "Deploy & Refine",
            description:
              "Activate your voice with one click and it's live immediately across all your phone numbers and call flows. Monitor customer feedback, listen to recordings, and make adjustments anytime. Switch voices instantly if your needs change—no technical setup required.",
            image:
              "https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Deployment dashboard showing voice activation and live metrics",
          },
        ]}
      />

      <SectionContentSlider
        title="Voice Categories"
        heading="Find Your Perfect Voice"
        subheading="Explore our organized voice library by category"
        cards={[
          {
            icon: Mic,
            text: "Professional & Corporate - Authoritative, clear, and confident voices perfect for financial services, legal firms, and enterprise businesses.",
          },
          {
            icon: Volume2,
            text: "Friendly & Casual - Warm, approachable, and conversational voices ideal for retail, hospitality, healthcare, and customer support.",
          },
          {
            icon: Settings,
            text: "Technical & Precise - Clear, articulate voices that excel at delivering complex information for tech support, medical advice, or instructions.",
          },
          {
            icon: Sparkles,
            text: "Energetic & Upbeat - Enthusiastic, dynamic voices great for sales, marketing, fitness, events, and youth-oriented brands.",
          },
          {
            icon: Globe,
            text: "Multilingual - Native-speaking voices in 50+ languages with authentic accents and cultural nuances for international audiences.",
          },
          {
            icon: Smile,
            text: "Empathetic & Caring - Compassionate, reassuring voices perfect for healthcare, counseling, crisis support, and sensitive situations.",
          },
        ]}
      />

      <SectionFAQ
        title="Voice Options Questions"
        heading="Everything you need to know about choosing and customizing voices."
        faqs={[
          {
            question: "How realistic do the AI voices sound?",
            answer:
              "Our neural text-to-speech technology produces voices that are indistinguishable from human speakers in most contexts. They include natural breathing, subtle voice variations, appropriate emotional expression, and realistic prosody. In blind tests, customers correctly identify our AI voices as 'artificial' less than 15% of the time. For contexts requiring absolute realism, our premium voices achieve even higher accuracy.",
            id: "voice-realism",
          },
          {
            question: "Can I switch voices after setting one up?",
            answer:
              "Yes, absolutely! You can change voices anytime with just a few clicks. Switch immediately, or schedule voice changes for different times of day (e.g., professional voice during business hours, casual voice after hours). You can also use different voices for different call types, phone numbers, or customer segments. There's no limit to how often you can change.",
            id: "switching-voices",
          },
          {
            question: "What is custom voice cloning and how does it work?",
            answer:
              "Custom voice cloning creates an AI voice that sounds like a specific person—perfect if you want your CEO, founder, or brand spokesperson to be the voice of your AI receptionist. We need about 30-60 minutes of clear audio recordings of the target voice reading various scripts. Our AI then learns that voice's unique characteristics and can generate any message in that voice. The process takes 2-3 business days and requires explicit consent from the person being cloned.",
            id: "voice-cloning",
          },
          {
            question: "Can the AI speak multiple languages, or do I need different voices?",
            answer:
              "Most of our voices are language-specific for the highest quality and authenticity. However, we also offer multilingual voices that can speak 5-10 languages fluently—perfect if your business serves diverse international customers. You can set up automatic language detection so the AI responds in the caller's language, or create routing rules based on phone number origin.",
            id: "multilingual",
          },
          {
            question: "How do I ensure proper pronunciation of industry terms or brand names?",
            answer:
              "Use our pronunciation dictionary tool to define how specific words should be said. Type the word and provide either a phonetic spelling or record yourself saying it correctly. The AI learns these custom pronunciations and applies them consistently. You can add unlimited entries for product names, technical jargon, employee names, location names, or any specialized terminology.",
            id: "pronunciation",
          },
          {
            question: "Can the voice convey different emotions based on the conversation?",
            answer:
              "Yes! Our advanced voices feature emotional intelligence. The AI automatically adjusts tone and delivery based on context—sounding apologetic when addressing a complaint, excited when sharing good news, empathetic during difficult conversations, or professional when discussing business details. You can also manually specify emotional tones for specific messages or scenarios in your call flows.",
            id: "emotional-intelligence",
          },
          {
            question: "What if I need a voice that sounds like a specific age or gender?",
            answer:
              "Our voice library includes diverse options across the spectrum: young adult (20s-30s), middle-aged (40s-50s), and mature (60+) voices. We offer male, female, and gender-neutral options. You can preview voices filtered by these characteristics to find the perfect demographic match for your target audience. Our custom voice cloning can create voices with any age or gender characteristics you need.",
            id: "age-gender",
          },
          {
            question: "Is there an additional cost for premium voices or custom voice cloning?",
            answer:
              "All our standard voice library (100+ voices) is included at no extra cost in every plan. Premium voices with enhanced realism and emotional expression are available on Professional and Enterprise plans. Custom voice cloning requires a one-time setup fee of $499 plus a small monthly licensing fee ($29/month). Volume discounts are available for businesses needing multiple custom voices.",
            id: "voice-pricing",
          },
        ]}
      />

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}

