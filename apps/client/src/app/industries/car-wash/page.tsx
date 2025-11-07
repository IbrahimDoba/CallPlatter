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
  Droplets,
  Calendar,
  Star,
  TrendingUp,
  Users,
  CheckCircle,
} from "lucide-react";
import Header from "@/components/Homepage/header";
import Footer from "@/components/Homepage/footer";

export default function CarWashPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {/* Hero Section */}
      <SectionHero
        title="24/7 Car Wash Answering Service"
        titleHighlight="Never Miss a Booking or Customer Again"
        subtitle="Professional 24/7 car wash and auto detailing call answering service for full-service car washes, express washes, mobile detailing, and auto care businesses. Capture every appointment booking, service inquiry, and customer question with dedicated phone support that maximizes bookings and eliminates missed revenue opportunities from unanswered calls."
        primaryButtonText="Start Free Trial"
        primaryButtonHref="/signup"
        secondaryButtonText="View Pricing"
        secondaryButtonHref="/pricing"
        imageSrc="https://images.pexels.com/photos/6872164/pexels-photo-6872164.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
        imageAlt="Professional Car Wash Answering Service and Appointment Booking System for Auto Detailing and Car Wash Businesses"
        showCallButton={true}
        useConversation={true}
        customerMessage="Hi, I need to get my car detailed before a big event this weekend. Do you offer interior and exterior packages, and can I book for Saturday?"
        aiResponse="Yes! We have the perfect package for you. Our Premium Detail includes full interior cleaning, exterior wash, wax, and tire shine. We have Saturday slots at 10 AM and 2 PM available. The service takes 3 hours. Would either time work for your schedule?"
      />

      {/* Features Section */}
      <SectionContent
        title="Car Wash Answering Service Features"
        contentTitle="Complete Call Management Solution for Auto Care Businesses"
        contentTitleSubtext="Every feature designed specifically for car washes, auto detailing shops, mobile detailing services, and automotive care businesses that need to capture every appointment booking, service inquiry, and customer question without interrupting operations or missing calls during peak hours."
        cards={[
          {
            title: "24/7 Car Wash Appointment Booking Service",
            subtitle:
              "Round-the-clock live call answering ensures every appointment request, service inquiry, pricing question, and customer call receives immediate professional response during peak business hours, after closing, weekends, holidays, and when staff are busy with vehicles on-site.",
            image:
              "https://images.pexels.com/photos/5217882/pexels-photo-5217882.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "24/7 car wash appointment booking and phone answering service",
          },
          {
            title: "Car Wash Service Scheduling & Queue Management",
            subtitle:
              "Seamlessly book full-service washes, express washes, interior detailing, exterior detailing, waxing services, ceramic coating, and specialty treatments. Check bay availability, manage service duration, handle rescheduling requests, process cancellations, and fill last-minute openings efficiently to maximize bay utilization and revenue per day.",
            image:
              "https://images.pexels.com/photos/6872161/pexels-photo-6872161.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Car wash service scheduling and queue management system",
          },
          {
            title: "Car Wash Service Knowledge & Pricing Support",
            subtitle:
              "Our car wash answering specialists learn your complete service menu including wash packages, detailing services, pricing tiers, add-on services, vehicle size categories, and membership options. Professionally answer customer questions about service duration, pricing, package differences, and what's included in each service level.",
            image:
              "https://images.pexels.com/photos/4489702/pexels-photo-4489702.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Car wash service knowledge and customer pricing phone support",
          },
          {
            title: "Car Wash Booking Software Integration",
            subtitle:
              "Direct integration with leading car wash management systems, scheduling platforms, POS systems, and customer databases. Appointments sync automatically into your calendar, bay schedules update in real-time, and customer information flows seamlessly into your system eliminating double booking risks and manual entry.",
            image:
              "https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Car wash booking software integration with appointment systems",
          },
          {
            title: "Car Wash Customer Retention & Membership Management",
            subtitle:
              "Enhance customer retention through professional appointment confirmations, reminder calls, membership renewal follow-ups, and promotional announcements. Maintain consistent communication that keeps customers engaged, reduces no-shows, increases repeat bookings, and builds long-term loyalty to your car wash brand.",
            image:
              "https://images.pexels.com/photos/6872165/pexels-photo-6872165.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Car wash customer retention and membership management services",
          },
        ]}
      />

      {/* Value Proposition */}
      <SectionInfo
        title="Why Car Washes Choose Professional Answering Services"
        pageInfoTitle="Increase Car Wash Revenue by 25-35% While Eliminating Missed Appointments and Customer Calls"
        subtitle="Independent car washes, express wash chains, auto detailing shops, and mobile detailing services use professional answering services to maximize appointment bookings and customer retention without additional front desk staff overhead."
        pageInfoText="Missing phone calls during busy car wash hours costs auto care businesses $4,000-$10,000 monthly in lost appointments and walk-in opportunities. When customers can't reach your car wash, they immediately call competitors. The car wash that answers professionally and books immediately wins the customer—every single time.\n\nCar wash answering services capture 100% of incoming calls with trained specialists who understand automotive service terminology, wash packages, detailing procedures, pricing structures, vehicle size categories, membership programs, and customer service excellence. We handle peak booking hours, after-hours inquiries, weekend rush periods, and holiday appointment requests that would otherwise go to voicemail or busy signals.\n\nWhile your staff focuses on delivering exceptional vehicle care services—whether full-service washes, express washes, interior detailing, exterior detailing, ceramic coating, or waxing services—professional answering services manage phone communications, book appointments, answer service questions, and handle rescheduling requests. This operational efficiency increases bay utilization rates, reduces no-shows through confirmation calls, maximizes revenue per bay, and ensures every booking opportunity receives immediate professional attention. Car washes using answering services report dramatic improvements in appointment fill rates, customer retention metrics, average service ticket values, and overall profitability without hiring additional reception staff, expanding phone lines, or increasing payroll overhead."
      />

      {/* Benefits Slider */}
      <SectionContentSlider
        title="Car Wash Answering Service Benefits"
        heading="How Professional Call Services Increase Car Wash Revenue & Customer Satisfaction"
        subheading="Proven advantages that maximize appointment bookings, reduce no-shows, and improve operational efficiency in auto care businesses"
        cards={[
          {
            icon: TrendingUp,
            text: "Revenue increase of 25-35% from capturing every appointment opportunity. Car washes miss an average of 30-50 calls per week during peak hours. Professional answering services convert these missed calls into confirmed appointments that directly increase daily revenue and bay utilization rates.",
            id: "revenue-growth",
          },
          {
            icon: Calendar,
            text: "Appointment optimization maximizes bay utilization and reduces gaps. Immediate booking availability, strategic scheduling, and efficient queue management fill cancellations instantly, minimize downtime between vehicles, and maintain optimal bay schedules throughout operating hours.",
            id: "appointment-optimization",
          },
          {
            icon: Star,
            text: "Customer satisfaction improves dramatically when calls answer immediately with knowledgeable, friendly service. Customers appreciate prompt attention to booking requests, accurate service information, and professional communication that reflects positively on your car wash's reputation and generates positive reviews.",
            id: "customer-satisfaction",
          },
          {
            icon: Droplets,
            text: "Staff efficiency increases as car wash professionals focus entirely on vehicle services rather than answering phones during busy periods. Eliminating phone distractions improves service quality, allows staff to provide attentive customer service, and creates better experiences that earn higher tips and referrals.",
            id: "staff-efficiency",
          },
          {
            icon: CheckCircle,
            text: "No-show reduction through automated appointment confirmations and reminder calls. Professional follow-up communication significantly decreases missed appointments, fills last-minute cancellations quickly, and protects revenue by ensuring booked time slots remain filled with confirmed customers.",
            id: "no-show-reduction",
          },
          {
            icon: Users,
            text: "Competitive advantage against larger car wash chains. Independent car washes gain enterprise-level phone support that matches or exceeds chain car wash service quality, attracting customers who value immediate responses and professional booking experiences when scheduling auto care services.",
            id: "competitive-edge",
          },
        ]}
      />

      {/* How It Works */}
      <SectionImageInfo
        title="How Car Wash Answering Services Work"
        sectionHeading="Simple Setup Process, Immediate Appointment Booking Capture"
        subheading="Start capturing every car wash call professionally within 24-48 hours with zero disruption to daily operations"
        items={[
          {
            title: "Select Your Car Wash Call Handling Plan",
            subtext:
              "Choose service coverage matching your car wash's needs including call volume capacity, hours of operation (business hours only, after-hours, or 24/7 coverage), appointment booking capabilities, service menu training, and multi-location support. Plans scale flexibly for single-bay operations through large multi-location car wash chains.",
            image:
              "https://images.pexels.com/photos/13065689/pexels-photo-13065689.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Car wash answering service plan selection and setup",
            useConversation: true,
            customerMessage:
              "I own a small express wash. We're missing so many calls during our Saturday rush. What's the best plan for a single-location operation?",
            aiResponse:
              "Perfect! Our Starter plan is ideal for express washes. We'll capture every Saturday rush call while your team focuses on cars. You get unlimited calls, appointment booking, and service inquiries handled professionally. Most clients see 40% more bookings in the first month!",
          },
          {
            title: "Customize Your Car Wash Service Protocols",
            subtext:
              "Work with our automotive industry specialists to develop custom call scripts reflecting your car wash's brand personality, complete service menu, pricing structure, package tiers, vehicle size categories, membership programs, and preferred customer communication style. Specialists learn your offerings thoroughly ensuring authentic representation.",
            image:
              "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Custom car wash call scripts and service protocol training",
            useConversation: true,
            customerMessage:
              "We have three service tiers: Basic Wash at $25, Deluxe at $45 with wax, and Premium at $75 with ceramic spray. Can your team learn all this and recommend the right package?",
            aiResponse:
              "Absolutely! We'll train our team on each package's features and pricing. We'll know when to suggest upgrades based on customer needs—like recommending the Deluxe for weather protection or Premium for special occasions. We'll represent your business just like your best employee!",
          },
          {
            title: "Integrate With Your Car Wash Booking Software",
            subtext:
              "Seamless connection to your existing car wash management system, scheduling platform, POS system, and customer database. Appointments appear automatically in your calendar, bay schedules update in real-time, and customer information syncs ensuring smooth coordination without duplicate entry.",
            image:
              "https://images.pexels.com/photos/5849563/pexels-photo-5849563.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Car wash booking software integration with appointment systems",
            useConversation: true,
            customerMessage:
              "We use DRB Tunnel for our operations. Will this work with our existing POS and scheduling system, or is it going to be a complicated setup?",
            aiResponse:
              "Great news—we integrate seamlessly with DRB Tunnel! Setup takes about 24 hours. Once connected, all appointments sync automatically to your system in real-time. Your team sees bookings instantly, and there's zero manual entry. We handle the technical setup for you!",
          },
          {
            title: "Launch and Optimize Your Appointment Management",
            subtext:
              "Your car wash answering service begins capturing calls immediately. Monitor real-time performance through your dashboard showing appointment bookings, call volumes, peak booking hours, service requests, and customer feedback. Continuously refine scripts based on seasonal promotions, new services, package changes, and booking patterns to maximize conversion rates.",
            image:
              "https://images.pexels.com/photos/3802508/pexels-photo-3802508.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Car wash appointment management analytics and performance optimization",
            useConversation: true,
            customerMessage:
              "This sounds great, but how do I track if it's actually working? I need to justify the investment to my business partner.",
            aiResponse:
              "You'll have a real-time dashboard showing every call, booking made, revenue captured, and conversion rates. You'll see exactly how many appointments we book daily, peak call times, and total revenue impact. Plus, call recordings let you hear quality firsthand. Most clients see ROI within the first week!",
          },
        ]}
      />

      {/* FAQ Section */}
      <SectionFAQ
        title="Car Wash Answering Service FAQ"
        heading="Common Questions About Professional Call Services for Car Washes, Auto Detailing & Automotive Care Businesses"
        faqs={[
          {
            question:
              "How quickly can car wash answering service be implemented?",
            answer:
              "Most car washes have professional answering service fully operational within 24-48 hours. Basic appointment booking can begin within hours after call forwarding setup, while comprehensive service menu training, booking software integration, and complete protocol implementation typically requires 1-2 business days depending on service complexity and technology systems.",
            id: "implementation-speed",
          },
          {
            question:
              "What does car wash answering service cost compared to hiring front desk staff?",
            answer:
              "At Dailzero, our car wash answering service offers exceptional value with flexible pricing. Our Starter plan begins at just $20/month, Business plan at $45/month, and Enterprise plan at $120/month. This represents massive savings compared to hiring front desk staff at $12-$18/hour ($2,000-$3,000/month per employee) while providing superior 24/7 coverage, no payroll taxes, no benefits costs, no training expenses, and zero scheduling challenges.",
            id: "pricing-comparison",
          },
          {
            question:
              "Can answering service staff learn our complete service menu and pricing?",
            answer:
              "Absolutely. Our car wash answering specialists receive comprehensive training on your full service menu including basic washes, premium packages, full-service options, interior detailing, exterior detailing, waxing, ceramic coating, pricing tiers, vehicle size categories, and membership programs. They master service durations, package differences, and can answer customer questions as knowledgeably as your front desk staff.",
            id: "service-knowledge",
          },
          {
            question:
              "How do you handle appointment booking and scheduling?",
            answer:
              "Our car wash answering service books appointments professionally with complete accuracy. Specialists check real-time bay availability through your booking system, confirm service types and durations, capture vehicle information, handle special requests, process rescheduling and cancellations, and enter complete appointment details directly into your calendar system ensuring seamless coordination.",
            id: "appointment-booking",
          },
          {
            question:
              "What happens during extremely busy car wash hours when we can't answer?",
            answer:
              "This is exactly when car wash answering services provide maximum value. When your front desk is overwhelmed with in-person customers during peak hours, our specialists handle overflow calls seamlessly. Customers experience immediate professional service instead of busy signals or voicemail, appointments get booked, questions get answered, and your team maintains focus on serving vehicles without phone interruptions.",
            id: "busy-hour-handling",
          },
          {
            question:
              "Does the service integrate with car wash management systems or POS systems?",
            answer:
              "Yes. Our car wash answering service integrates with major car wash management platforms, scheduling software, POS systems, and customer databases. We also connect with Google Calendar, Outlook, and custom scheduling systems. Integration ensures appointments flow automatically into your systems with real-time availability checking and zero manual entry.",
            id: "system-integration",
          },
          {
            question:
              "Can you handle fleet accounts and commercial vehicle services?",
            answer:
              "Absolutely. Our car wash answering specialists manage fleet account inquiries, commercial vehicle appointments, bulk service requests, and corporate accounts following your specific procedures. We coordinate multiple vehicles, manage account billing preferences, handle special pricing, and ensure all fleet service details are captured accurately for seamless execution.",
            id: "fleet-services",
          },
          {
            question:
              "What about car washes with multiple locations or bays?",
            answer:
              "Our car wash answering service excels at multi-location and multi-bay support. We handle calls for car wash chains, franchises, and multi-bay operations with intelligent routing to appropriate locations, location-specific service knowledge, individual bay scheduling, separate calendars, and customized service protocols for each location while maintaining overall brand consistency across your entire car wash portfolio.",
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

