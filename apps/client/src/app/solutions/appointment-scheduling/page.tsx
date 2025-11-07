"use client";

import Header from "@/components/Homepage/header";
import Footer from "@/components/Homepage/footer";
import {
  SectionHero,
  SectionFeaturesGrid,
  SectionHowItWorks,
  SectionFAQ,
} from "@/components/sections";

export default function AppointmentSchedulingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <SectionHero
        title="AI Appointment Scheduling"
        titleHighlight="Fill Your Calendar, Automatically"
        subtitle="Our intelligent AI receptionists book, reschedule, and confirm appointments 24/7 directly into your calendar. Eliminate no-shows, reduce administrative work, and empower your clients to book anytime, from anywhere."
        primaryButtonText="Start Your Free Trial"
        primaryButtonHref="/signup"
        secondaryButtonText="Request a Demo"
        secondaryButtonHref="/request-demo"
        imageSrc="https://images.pexels.com/photos/4348403/pexels-photo-4348403.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
        imageAlt="A digital calendar with appointments being scheduled automatically by AI."
        useConversation={true}
        customerMessage="Hi, I'd like to schedule a cleaning with Dr. Evans. I'm free on Tuesday afternoons or anytime on Wednesday."
        aiResponse="Certainly. Dr. Evans has an opening on Tuesday at 3 PM and several slots available on Wednesday. The appointment will take about an hour. Which time would you prefer?"
      />

      <SectionFeaturesGrid
        title="A Smarter Way to Manage Your Schedule"
        subtitle="Our appointment scheduling service is packed with powerful features to streamline your booking process and enhance the client experience."
        features={[
          {
            title: "Real-Time Calendar Sync",
            description:
              "We integrate directly with Google Calendar, Outlook, and other popular platforms. Appointments are added instantly, preventing double bookings.",
          },
          {
            title: "Automated Reminders & Confirmations",
            description:
              "Dramatically reduce no-shows. Our system automatically sends SMS and email reminders to clients, and can even call to confirm.",
          },
          {
            title: "Custom Booking Rules",
            description:
              "You control your availability. Set rules for buffer times between appointments, lead time required for new bookings, and specific hours for different services.",
          },
          {
            title: "24/7 Self-Service Booking",
            description:
              "Allow clients to book appointments on their own time through a simple, user-friendly interface, or have our AI receptionist do it for them over the phone.",
          },
          {
            title: "Payment & Deposit Collection",
            description:
              "Secure your revenue by requiring a deposit or full payment at the time of booking. We integrate with Stripe and other payment processors.",
          },
          {
            title: "Multi-Location & Staff Scheduling",
            description:
              "Easily manage complex schedules for businesses with multiple locations, services, or staff members, ensuring the right resources are booked every time.",
          },
        ]}
      />

      <SectionHowItWorks
        title="Effortless Scheduling in 3 Steps"
        subtitle="Get your intelligent scheduling assistant working for you in just a few minutes."
        steps={[
          {
            title: "Connect Your Calendar",
            description:
              "Securely link your existing business calendar (Google, Outlook, etc.). This allows our AI to see your real-time availability and add new appointments instantly without any conflicts.",
            image:
              "https://images.pexels.com/photos/669619/pexels-photo-669619.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "A person connecting their digital calendar to the scheduling service.",
          },
          {
            title: "Set Your Booking Preferences",
            description:
              "Define your rules: how long appointments are, when you're available, how much notice you need, and whether to add buffer time. Our AI will follow these rules perfectly for every booking.",
            image:
              "https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "A team setting their booking preferences and rules.",
          },
          {
            title: "Let Us Handle the Rest",
            description:
              "Whether a client calls or uses your online booking link, our system takes over. Appointments are booked, reminders are sent, and your calendar fills up—all without you lifting a finger.",
            image:
              "https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "A business owner relaxing as appointments are automatically scheduled.",
          },
        ]}
      />

      <SectionFAQ
        title="Frequently Asked Questions"
        heading="Common questions about our AI Appointment Scheduling service."
        faqs={[
          {
            question: "How does the system prevent double-booking?",
            answer:
              "Our service syncs with your calendar in real-time. The moment an appointment is booked (either by our AI or by you manually), that time slot becomes unavailable everywhere, making double-bookings a thing of the past.",
            id: "double-booking",
          },
          {
            question: "Can it handle cancellations and rescheduling?",
            answer:
              "Yes. Clients can easily reschedule or cancel appointments through a link in their confirmation email. Our AI can also process these requests over the phone, and the newly opened time slot is immediately made available in your calendar.",
            id: "cancellations",
          },
          {
            question: "Which calendar platforms do you integrate with?",
            answer:
              "We integrate with all major calendar platforms, including Google Calendar, Outlook/Office 365, and Apple iCloud Calendar. We are constantly adding new integrations as well.",
            id: "integrations",
          },
          {
            question: "Is the scheduling service HIPAA compliant for medical practices?",
            answer:
              "Yes, we offer HIPAA-compliant plans for healthcare providers. We have specific protocols in place to ensure all patient data is handled with the required level of security and confidentiality. Please contact us for more details on these plans.",
            id: "hipaa-compliance",
          },
          {
            question: "Can I require clients to pay when they book?",
            answer:
              "Absolutely. You can make appointments free, require a deposit to reduce no-shows, or charge the full amount upfront. We integrate with Stripe, PayPal, and other major payment gateways to make this process seamless.",
            id: "payments",
          },
          {
            question: "How does the AI know which staff member to book for a specific service?",
            answer:
              "During setup, you can assign different services to different staff members and set their individual availability. The AI will intelligently match the client's request to the correct staff member's schedule, ensuring the right person is booked every time.",
            id: "staff-assignment",
          },
        ]}
      />

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
