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
  Scissors,
  Calendar,
  Star,
  TrendingUp,
  Users,
  CheckCircle,
} from "lucide-react";
import Header from "@/components/Homepage/header";
import Footer from "@/components/Homepage/footer";

export default function SalonsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {/* Hero Section */}
      <SectionHero
        title="Salon Answering Service"
        titleHighlight="Never Miss an Appointment Again"
        subtitle="Professional 24/7 salon and spa call answering service for hair salons, beauty salons, barbershops, nail salons, and wellness centers. Capture every appointment booking, client inquiry, and service request with dedicated phone support that maximizes your booking calendar and eliminates missed revenue opportunities."
        primaryButtonText="Start Free Trial"
        primaryButtonHref="/signup"
        secondaryButtonText="View Pricing"
        secondaryButtonHref="/pricing"
        imageSrc="https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
        imageAlt="Salon stylist working with client - professional answering service"
        showCallButton={true}
        useConversation={true}
        customerMessage="Hi! I'd like to book a haircut and color appointment for this Saturday. Do you have any availability around 2 PM?"
        aiResponse="Of course! I'd be happy to help you schedule that. We have availability at 2 PM on Saturday with Sarah, our color specialist. The combined service takes about 2.5 hours. May I have your name and phone number to confirm the booking?"
      />

      {/* Features Section */}
      <SectionContent
        title="Salon Answering Service Features"
        contentTitle="Complete Call Management Solution for Beauty & Wellness Businesses"
        contentTitleSubtext="Every feature designed specifically for hair salons, barbershops, nail salons, spas, and beauty centers that need to capture every appointment booking, client consultation, and service inquiry without interrupting stylist-client interactions or front desk operations."
        cards={[
          {
            title: "24/7 Salon Appointment Booking Service",
            subtitle:
              "Round-the-clock live call answering ensures every appointment request, service inquiry, consultation booking, and client question receives immediate professional response during peak booking hours, after closing, weekends, holidays, and when front desk staff are busy with in-salon clients.",
            image:
              "https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "24/7 salon appointment booking and phone answering service",
          },
          {
            title: "Salon Appointment Scheduling & Calendar Management",
            subtitle:
              "Seamlessly book hair appointments, color services, styling sessions, nail treatments, spa services, and beauty consultations. Check stylist availability, manage service duration, handle rescheduling requests, process cancellations, and fill last-minute openings efficiently to maximize chair utilization and revenue per day.",
            image:
              "https://images.pexels.com/photos/3993324/pexels-photo-3993324.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Salon appointment scheduling and calendar management system",
          },
          {
            title: "Salon Service Knowledge & Consultation Support",
            subtitle:
              "Our salon answering specialists learn your complete service menu including haircuts, coloring, highlights, treatments, extensions, styling, nail services, facials, waxing, and pricing. Professionally answer client questions about service duration, pricing, stylist specialties, product recommendations, and appointment preparation requirements.",
            image:
              "https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Salon service knowledge and client consultation phone support",
          },
          {
            title: "Salon Booking Software Integration",
            subtitle:
              "Direct integration with leading salon management systems including Square Appointments, Booksy, Vagaro, Mindbody, Schedulicity, Fresha, and other salon booking platforms. Appointments sync automatically into your calendar, stylist schedules update in real-time, and client information flows seamlessly into your CRM system eliminating double booking risks.",
            image:
              "https://images.pexels.com/photos/853151/pexels-photo-853151.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Salon booking software integration with appointment systems",
          },
          {
            title: "Multi-Stylist & Multi-Location Salon Support",
            subtitle:
              "Manage appointments for salons with multiple stylists, barbers, nail technicians, and estheticians. Route calls to appropriate specialists based on service type, handle team scheduling, coordinate multi-service appointments, and support salon groups or franchises with location-specific booking and service knowledge.",
            image:
              "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Multi-stylist and multi-location salon appointment management",
          },
          {
            title: "Salon Client Retention & Follow-Up Services",
            subtitle:
              "Enhance client retention through professional appointment confirmations, reminder calls, rebooking follow-ups, and special promotion announcements. Maintain consistent communication that keeps clients engaged, reduces no-shows, increases repeat bookings, and builds long-term loyalty to your salon brand.",
            image:
              "https://images.pexels.com/photos/3993324/pexels-photo-3993324.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Salon client retention and follow-up appointment services",
          },
        ]}
      />

      {/* Value Proposition */}
      <SectionInfo
        title="Why Salons Choose Professional Answering Services"
        pageInfoTitle="Increase Salon Revenue by 20-30% While Eliminating Missed Appointments and Booking Gaps"
        subtitle="Independent salons, barbershops, nail salons, and spa businesses use professional answering services to maximize appointment bookings and client retention without additional front desk staff overhead."
        pageInfoText="Missing phone calls during busy salon hours costs beauty businesses $3,000-$8,000 monthly in lost appointments and walk-in opportunities. When clients can't reach your salon, they immediately book with competitors. The salon that answers professionally and books immediately wins the client.\n\nSalon answering services capture 100% of incoming calls with trained specialists who understand beauty industry terminology, service descriptions, appointment scheduling, stylist availability, and client consultation needs. We handle peak booking hours, after-hours inquiries, and weekend appointment requests that would otherwise go to voicemail.\n\nWhile your stylists focus on delivering exceptional client experiences, professional answering services manage phone communications, book appointments, answer service questions, and handle rescheduling requests. This operational efficiency increases chair utilization, reduces no-shows through confirmation calls, maximizes revenue per stylist, and ensures every booking opportunity receives immediate attention. Salons using answering services report dramatic improvements in appointment fill rates, client retention, average service values, and overall profitability without hiring additional reception staff or expanding phone lines."
      />

      {/* Benefits Slider */}
      <SectionContentSlider
        title="Salon Answering Service Benefits"
        heading="How Professional Call Services Increase Salon Revenue & Client Satisfaction"
        subheading="Proven advantages that maximize appointment bookings, reduce no-shows, and improve operational efficiency in beauty and wellness businesses"
        cards={[
          {
            icon: TrendingUp,
            text: "Revenue increase of 20-30% from capturing every appointment opportunity. Salons miss an average of 25-40 calls per week during peak booking hours. Professional answering services convert these missed calls into confirmed appointments that directly increase daily revenue and stylist utilization rates.",
            id: "revenue-growth",
          },
          {
            icon: Calendar,
            text: "Appointment optimization maximizes chair utilization and reduces gaps. Immediate booking availability, strategic scheduling, and efficient calendar management fill cancellations instantly, minimize downtime between clients, and maintain optimal stylist schedules throughout operating hours.",
            id: "appointment-optimization",
          },
          {
            icon: Star,
            text: "Client satisfaction improves dramatically when calls answer immediately with knowledgeable, friendly service. Clients appreciate prompt attention to booking requests, accurate service information, and professional communication that reflects positively on your salon's reputation and generates positive reviews.",
            id: "client-satisfaction",
          },
          {
            icon: Scissors,
            text: "Stylist efficiency increases as beauty professionals focus entirely on client services rather than answering phones during appointments. Eliminating phone distractions improves service quality, allows stylists to provide attentive consultations, and creates better client experiences that earn higher tips and referrals.",
            id: "stylist-efficiency",
          },
          {
            icon: CheckCircle,
            text: "No-show reduction through automated appointment confirmations and reminder calls. Professional follow-up communication significantly decreases missed appointments, fills last-minute cancellations quickly, and protects revenue by ensuring booked time slots remain filled with confirmed clients.",
            id: "no-show-reduction",
          },
          {
            icon: Users,
            text: "Competitive advantage against larger salon chains. Independent salons gain enterprise-level phone support that matches or exceeds chain salon service quality, attracting clients who value immediate responses and professional booking experiences when scheduling beauty services.",
            id: "competitive-edge",
          },
        ]}
      />

      {/* How It Works */}
      <SectionImageInfo
        title="How Salon Answering Services Work"
        sectionHeading="Simple Setup Process, Immediate Appointment Booking Capture"
        subheading="Start capturing every salon call professionally within 24-48 hours with zero disruption to daily operations"
        items={[
          {
            title: "Select Your Salon Call Handling Plan",
            subtext:
              "Choose service coverage matching your salon's needs including call volume capacity, hours of operation (business hours only, after-hours, or 24/7 coverage), appointment booking capabilities, service menu training, and multi-stylist support. Plans scale flexibly for single-chair salons through large multi-location beauty businesses.",
            image:
              "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Salon team planning service",
            useConversation: true,
            customerMessage:
              "I need an answering service for my 3-chair salon. We're open Tuesday through Saturday and get swamped with calls on Fridays.",
            aiResponse:
              "Perfect! Our Business plan would be ideal for your setup. We can handle your Friday rush hour calls and provide coverage during all business hours. Would you like to start with a trial this week?",
          },
          {
            title: "Customize Your Salon Service Protocols",
            subtext:
              "Work with our beauty industry specialists to develop custom call scripts reflecting your salon's brand personality, complete service menu, pricing structure, stylist specialties, booking policies, cancellation procedures, and preferred client communication style. Specialists learn your offerings thoroughly ensuring authentic representation.",
            image:
              "https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Salon consultation and training",
            useConversation: true,
            customerMessage:
              "Can your team learn about our keratin treatments and balayage services? We need them to answer specific questions about timing and pricing.",
            aiResponse:
              "Absolutely! We'll train our specialists on your complete service menu including keratin treatments, balayage, and all your specialty services. They'll know exact durations, pricing, and can answer client questions just like your front desk staff.",
          },
          {
            title: "Integrate With Your Salon Booking Software",
            subtext:
              "Seamless connection to your existing salon management system, booking platform, calendar software, and client database. Appointments appear automatically in Square Appointments, Booksy, Vagaro, or your preferred system, stylist schedules update in real-time, and client information syncs ensuring smooth coordination without duplicate entry.",
            image:
              "https://images.pexels.com/photos/853151/pexels-photo-853151.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Salon technology and booking system",
            useConversation: true,
            customerMessage:
              "We use Booksy for our appointments. Will your service work with our existing system?",
            aiResponse:
              "Yes! We integrate seamlessly with Booksy. When we book an appointment, it automatically appears in your Booksy calendar with all client details and service information. No manual entry needed on your end.",
          },
          {
            title: "Launch and Optimize Your Appointment Management",
            subtext:
              "Your salon answering service begins capturing calls immediately. Monitor real-time performance through your dashboard showing appointment bookings, call volumes, peak booking hours, service requests, and client feedback. Continuously refine scripts based on seasonal promotions, new services, stylist changes, and booking patterns to maximize conversion rates.",
            image:
              "https://images.pexels.com/photos/3993324/pexels-photo-3993324.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Salon performance analytics",
            useConversation: true,
            customerMessage:
              "How can I track if the service is actually helping my salon book more appointments?",
            aiResponse:
              "Great question! You'll have access to a dashboard showing every call we handle, appointments booked, call volumes by time of day, and conversion rates. You'll see exactly how many bookings you would have missed without our service.",
          },
        ]}
      />

      {/* FAQ Section */}
      <SectionFAQ
        title="Salon Answering Service FAQ"
        heading="Common Questions About Professional Call Services for Salons, Spas & Beauty Businesses"
        faqs={[
          {
            question:
              "How quickly can salon answering service be implemented?",
            answer:
              "Most salons have professional answering service fully operational within 24-48 hours. Basic appointment booking can begin within hours after call forwarding setup, while comprehensive service menu training, booking software integration, and complete protocol implementation typically requires 1-2 business days depending on service complexity and technology systems.",
            id: "implementation-speed",
          },
          {
            question:
              "What does salon answering service cost compared to hiring reception staff?",
            answer:
              "At Dailzero, our salon answering service offers exceptional value with flexible pricing. Our Starter plan begins at just $20/month, Business plan at $45/month, and Enterprise plan at $120/month. This represents massive savings compared to hiring reception staff at $12-$18/hour ($2,000-$3,000/month per employee) while providing superior 24/7 coverage, no payroll taxes, no benefits costs, no training expenses, and zero scheduling challenges.",
            id: "pricing-comparison",
          },
          {
            question:
              "Can answering service staff learn our complete service menu and pricing?",
            answer:
              "Absolutely. Our salon answering specialists receive comprehensive training on your full service menu including haircuts, coloring, highlights, treatments, extensions, styling, nail services, facials, waxing, and all pricing. They master service durations, stylist specialties, product information, and appointment preparation requirements to answer client questions as knowledgeably as your front desk staff.",
            id: "service-knowledge",
          },
          {
            question:
              "How do you handle appointment booking and scheduling?",
            answer:
              "Our salon answering service books appointments professionally with complete accuracy. Specialists check real-time stylist availability through your booking system, confirm service types and durations, capture client preferences, handle special requests, process rescheduling and cancellations, and enter complete appointment details directly into your calendar system ensuring seamless coordination.",
            id: "appointment-booking",
          },
          {
            question:
              "What happens during extremely busy salon hours when we can't answer?",
            answer:
              "This is exactly when salon answering services provide maximum value. When your front desk is overwhelmed with in-salon clients during peak booking hours, our specialists handle overflow calls seamlessly. Clients experience immediate professional service instead of busy signals or voicemail, appointments get booked, questions get answered, and your team maintains focus on in-person client service without phone interruptions.",
            id: "busy-hour-handling",
          },
          {
            question:
              "Does the service integrate with Square Appointments, Booksy, Vagaro, or our booking system?",
            answer:
              "Yes. Our salon answering service integrates with all major salon booking platforms including Square Appointments, Booksy, Vagaro, Mindbody, Schedulicity, Fresha, and others. We also connect with Google Calendar, Outlook, and custom scheduling systems. Integration ensures appointments flow automatically into your systems with real-time availability checking and zero manual entry.",
            id: "booking-integration",
          },
          {
            question:
              "Can you handle multi-service appointments and complex booking requests?",
            answer:
              "Absolutely. Our salon answering specialists manage multi-service appointments, package bookings, bridal party coordination, group appointments, and complex scheduling requests following your specific procedures. We coordinate multiple stylists, manage service sequencing, handle special event bookings, and ensure all appointment details are captured accurately for seamless execution.",
            id: "complex-bookings",
          },
          {
            question:
              "What about salons with multiple stylists or locations?",
            answer:
              "Our salon answering service excels at multi-stylist and multi-location support. We handle calls for salon groups, franchises, and multi-chair operations with intelligent routing to appropriate stylists, location-specific service knowledge, individual booking systems, separate calendars, and customized service protocols for each location while maintaining overall brand consistency across your entire salon portfolio.",
            id: "multi-location-support",
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

