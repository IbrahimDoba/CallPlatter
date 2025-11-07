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
  Clock,
  Globe,
  Shield,
  Star,
  HeadphonesIcon,
  TrendingUp,
} from "lucide-react";
import Header from "@/components/Homepage/header";
import Footer from "@/components/Homepage/footer";

export default function HotelsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {/* Hero Section */}
      <SectionHero
        title="24/7 Hotel Answering Service"
        titleHighlight="& Virtual Front Desk Solutions"
        subtitle="Professional hotel call answering service delivering exceptional guest experiences around the clock. Never miss reservations, guest requests, or urgent inquiries with dedicated virtual receptionist support for hotels, resorts, motels, and boutique properties. Multilingual support, reservation management, and seamless integration with your property management system."
        primaryButtonText="Get Started Today"
        primaryButtonHref="/waitlist"
        secondaryButtonText="View Pricing"
        secondaryButtonHref="/pricing"
        imageSrc="https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
        imageAlt="Professional 24/7 Hotel Answering Service and Virtual Front Desk for Hotels and Resorts"
        showCallButton={true}
        useConversation={true}
        customerMessage="Hi, I'd like to book a room for 3 nights starting this Friday. Do you have any king-sized rooms available with a city view?"
        aiResponse="Absolutely! We have beautiful king rooms with city views available for your 3-night stay starting Friday. The rate is $189 per night. May I have your name and email to send you a confirmation?"
      />

      {/* Features Section */}
      <SectionContent
        title="Hotel Answering Service Features"
        contentTitle="Complete Guest Communication Solution for Hospitality Properties"
        contentTitleSubtext="Comprehensive 24/7 call handling services designed specifically for hotels, resorts, bed & breakfasts, vacation rentals, and boutique properties requiring professional guest support without the overhead of overnight front desk staffing."
        cards={[
          {
            title: "24/7 Virtual Front Desk & Concierge Service",
            subtitle:
              "Round-the-clock live answering service provides professional guest support during late check-ins, overnight emergencies, after-hours inquiries, holidays, and weekends. Our trained hotel receptionists handle reservation requests, guest questions, wake-up calls, and concierge services exactly like your on-site staff.",
            image:
              "https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "24/7 virtual front desk answering service for hotels and resorts",
          },
          {
            title: "Hospitality-Trained Call Specialists",
            subtitle:
              "Our hotel answering service representatives receive extensive hospitality industry training covering property terminology, reservation procedures, guest service protocols, amenity information, local attractions, dining recommendations, and emergency response procedures ensuring five-star guest experiences with every interaction.",
            image:
              "https://images.pexels.com/photos/3771110/pexels-photo-3771110.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Professional hospitality-trained hotel call center specialists",
          },
          {
            title: "Reservation & Booking Management System",
            subtitle:
              "Capture direct bookings, process reservation inquiries, check room availability, quote rates, handle modification requests, and manage cancellations seamlessly. Reduce OTA commission costs by converting phone inquiries into direct bookings that increase your revenue per available room.",
            image:
              "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Hotel reservation and booking management integration",
          },
          {
            title: "Property Management System (PMS) Integration",
            subtitle:
              "Seamless integration with leading hotel PMS platforms including Opera, Maestro, Cloudbeds, Mews, RoomKeyPMS, and other property management systems. Real-time synchronization of reservations, guest information, room availability, rates, and special requests directly into your existing hotel software ecosystem.",
            image:
              "https://images.pexels.com/photos/669619/pexels-photo-669619.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Hotel property management system PMS integration for answering service",
          },
          {
            title: "Multilingual Guest Support Services",
            subtitle:
              "Serve international guests professionally with multilingual answering service capabilities in Spanish, French, German, Mandarin, and other languages. Essential for tourist destinations, international hotels, and properties serving diverse global clientele requiring language support beyond English-speaking staff capacity.",
            image:
              "https://images.pexels.com/photos/2507007/pexels-photo-2507007.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Multilingual hotel answering service for international guests",
          },
          {
            title: "Emergency Response & Guest Safety Protocols",
            subtitle:
              "Trained specialists handle urgent guest situations, maintenance emergencies, security concerns, medical incidents, and critical property issues following your hotel's specific emergency procedures. Immediate escalation ensures appropriate response times protecting guest safety and property reputation during overnight hours.",
            image:
              "https://images.pexels.com/photos/1001965/pexels-photo-1001965.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Hotel emergency response and guest safety call protocols",
          },
        ]}
      />

      {/* Value Proposition */}
      <SectionInfo
        title="Why Hotels Choose Professional Answering Services"
        pageInfoTitle="Enhance Guest Satisfaction While Reducing Front Desk Overhead Costs by 60-70%"
        subtitle="Boutique hotels, independent properties, and growing chains leverage 24/7 answering services to compete with major brands while maintaining profitability and exceptional guest experiences."
        pageInfoText="Operating a full-time overnight front desk costs hotels $35,000-$55,000 annually per staff member when accounting for wages, benefits, training, and management overhead. Smaller properties struggle justifying this expense, yet guests expect 24/7 service availability regardless of hotel size or budget.\n\nProfessional hotel answering services provide comprehensive after-hours support, reservation management, guest inquiries, wake-up calls, emergency handling, and concierge services for a fraction of traditional staffing costs. Your property delivers five-star guest experiences without five-star labor expenses.\n\nGuests reaching live, professional hotel representatives at 2 AM receive the same quality service as afternoon check-ins. This consistency drives positive online reviews, repeat bookings, and higher revenue per available room. Properties using answering services report significant improvements in guest satisfaction scores, direct booking conversions, and operational efficiency while eliminating costly staffing gaps, overtime expenses, and service quality inconsistencies during overnight hours when most properties struggle with limited coverage."
      />

      {/* Benefits Slider */}
      <SectionContentSlider
        title="Hotel Answering Service Benefits"
        heading="How Professional Call Services Transform Hotel Operations & Guest Satisfaction"
        subheading="Proven advantages that increase direct bookings, reduce overhead costs, and deliver exceptional guest experiences around the clock"
        cards={[
          {
            icon: TrendingUp,
            text: "Direct booking revenue increases 25-40% when guests reach live representatives instead of voicemail or online-only booking. Phone inquiries convert at higher rates and generate larger booking values than web-only reservations, maximizing revenue per guest.",
            id: "revenue-growth",
          },
          {
            icon: Star,
            text: "Guest satisfaction scores improve dramatically with 24/7 live support. Properties offering consistent after-hours service receive higher online review ratings, increased repeat bookings, and stronger guest loyalty compared to hotels with limited front desk coverage.",
            id: "guest-satisfaction",
          },
          {
            icon: Clock,
            text: "Operational cost reduction of 60-70% compared to full-time overnight front desk staffing. Eliminate salary expenses, benefits, payroll taxes, training costs, and management overhead while maintaining superior service quality during all business hours.",
            id: "cost-reduction",
          },
          {
            icon: Shield,
            text: "Risk mitigation through professional emergency response protocols. Trained specialists handle urgent guest situations, property emergencies, and security concerns following your procedures, reducing liability exposure and protecting your hotel's reputation.",
            id: "risk-management",
          },
          {
            icon: Globe,
            text: "Competitive advantage against major hotel chains. Independent properties and boutique hotels deliver big-brand service quality without enterprise budgets, attracting guests seeking personalized service with reliable 24/7 support availability.",
            id: "competitive-edge",
          },
          {
            icon: HeadphonesIcon,
            text: "Staff focus on high-value guest interactions. Free your daytime team from routine phone calls, allowing concentration on in-person guest experiences, upselling opportunities, personalized service delivery, and relationship building that drives premium room rates.",
            id: "staff-efficiency",
          },
        ]}
      />

      {/* How It Works */}
      <SectionImageInfo
        title="How Hotel Answering Services Work"
        sectionHeading="Simple Implementation Process, Immediate Guest Service Enhancement"
        subheading="Start delivering professional 24/7 guest support within 48-72 hours with zero equipment installation or technical complexity"
        items={[
          {
            title: "Select Your Hotel Call Handling Service Plan",
            subtext:
              "Choose coverage options matching your property needs including call volume capacity, service hours (after-hours only or 24/7 full coverage), reservation support level, multilingual capabilities, and emergency response protocols. Flexible plans scale with seasonal occupancy variations and property growth.",
            image:
              "https://images.pexels.com/photos/269077/pexels-photo-269077.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Hotel answering service plan selection and setup",
            useConversation: true,
            customerMessage:
              "We're a 50-room boutique hotel. We need after-hours coverage from 11 PM to 7 AM and someone who can handle Spanish-speaking guests.",
            aiResponse:
              "Perfect! Our Business plan includes after-hours coverage with bilingual support in Spanish and English. We'll handle all guest calls during those hours including late check-ins, requests, and emergencies. Would you like to start with a 2-week trial?",
          },
          {
            title: "Customize Your Hotel Service Protocols",
            subtext:
              "Collaborate with our hospitality specialists to develop custom call scripts reflecting your property's brand voice, amenities, room types, rate structures, local area information, dining options, guest service standards, and emergency procedures. Scripts ensure consistent representation matching your hotel's unique character and service philosophy.",
            image:
              "https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Custom hotel call scripts and guest service protocols",
            useConversation: true,
            customerMessage:
              "Can your team answer questions about our rooftop pool, spa services, and recommend nearby restaurants? That's what guests ask about most.",
            aiResponse:
              "Absolutely! We'll train our specialists on all your property amenities including pool hours, spa booking, room service menu, and local restaurant recommendations. They'll represent your hotel as if they're standing at your front desk.",
          },
          {
            title: "Integrate With Your Hotel Management Systems",
            subtext:
              "Seamless connection with your existing property management system (PMS), channel manager, booking engine, email platforms, and communication tools. Automated synchronization ensures reservations, guest requests, room availability updates, and service notes flow directly into your hotel software without manual data entry or duplicate work.",
            image:
              "https://images.pexels.com/photos/6929172/pexels-photo-6929172.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Hotel PMS property management system integration",
            useConversation: true,
            customerMessage:
              "We use Cloudbeds for our property management. Can you integrate with that so bookings go straight into our system?",
            aiResponse:
              "Yes! We integrate seamlessly with Cloudbeds. When we book a reservation, it appears instantly in your Cloudbeds system with full guest details, room type, rates, and special requests. Real-time sync, zero manual entry needed.",
          },
          {
            title: "Launch Your Virtual Front Desk Service",
            subtext:
              "Your professional hotel answering service activates immediately, handling every guest call with hospitality expertise. Access detailed call logs, reservation summaries, guest feedback, and service analytics through your management dashboard. Continuously optimize protocols based on guest interaction data and seasonal booking patterns.",
            image:
              "https://images.pexels.com/photos/6474524/pexels-photo-6474524.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Hotel virtual front desk service launch and analytics",
            useConversation: true,
            customerMessage:
              "How will I track performance and see if this is actually helping our hotel get more direct bookings?",
            aiResponse:
              "Your dashboard shows every call we handle, reservations booked, guest requests processed, call response times, and booking conversion rates. You'll see exactly how many direct bookings we capture and revenue generated versus OTA commissions saved.",
          },
        ]}
      />

      {/* FAQ Section */}
      <SectionFAQ
        title="Hotel Answering Service FAQ"
        heading="Common Questions About Professional Call Services for Hotels, Resorts & Hospitality Properties"
        faqs={[
          {
            question:
              "How quickly can hotel answering service be implemented at our property?",
            answer:
              "Most hotels have professional answering service fully operational within 48-72 hours for standard implementations. Basic after-hours call coverage can begin within 24 hours, while comprehensive PMS integration, custom guest service protocols, multilingual support configuration, and staff training typically requires 2-3 business days depending on your property management system and specific service requirements.",
            id: "implementation-time",
          },
          {
            question:
              "What does a hotel answering service cost compared to front desk staff?",
            answer:
              "At Dailzero, we provide exceptional value with scalable pricing designed for properties of all sizes. Our Starter plan begins at just $20/month, Business plan at $45/month, and Enterprise plan at $120/month. This represents 60-70% cost savings compared to full-time front desk staffing which costs $35,000-$55,000+ annually per employee when including wages, benefits, taxes, and training. You receive professional 24/7 coverage for a small fraction of traditional staffing expenses.",
            id: "pricing-cost",
          },
          {
            question:
              "Are answering service representatives trained in hotel operations and hospitality?",
            answer:
              "Absolutely. Our hotel answering service specialists complete comprehensive hospitality training covering property management terminology, reservation procedures, room categories, rate structures, amenity descriptions, guest service protocols, concierge knowledge, emergency response procedures, and professional communication standards. They understand hotel operations and deliver service quality matching your on-site front desk team's expertise and professionalism.",
            id: "hospitality-training",
          },
          {
            question:
              "Can the answering service handle actual reservations and bookings?",
            answer:
              "Yes. Our hotel answering service captures reservation inquiries, checks room availability through your PMS integration, quotes accurate rates, explains room types and amenities, processes booking requests, handles modification and cancellation requests, and enters complete reservation details directly into your property management system. This converts phone inquiries into direct bookings, reducing OTA commission costs and increasing your revenue.",
            id: "reservation-handling",
          },
          {
            question:
              "What happens during guest emergencies or urgent property situations?",
            answer:
              "Our answering service follows your hotel's specific emergency protocols for urgent situations including guest medical issues, security concerns, maintenance emergencies, safety incidents, or critical property matters. Depending on your procedures, we immediately contact designated on-call managers, maintenance staff, security personnel, or emergency services while documenting all details. Guest safety and appropriate response receive highest priority.",
            id: "emergency-protocols",
          },
          {
            question:
              "Does the service integrate with our existing hotel PMS and software systems?",
            answer:
              "Yes. Our hotel answering service integrates seamlessly with major property management systems including Opera PMS, Maestro, Cloudbeds, Mews, RoomKeyPMS, WebRezPro, ThinkReservations, and other leading platforms. We also connect with channel managers, booking engines, guest messaging systems, and email platforms. This integration eliminates duplicate work, ensures data accuracy, and provides real-time information access for both answering service representatives and your hotel staff.",
            id: "pms-integration",
          },
          {
            question:
              "Is multilingual support available for international guests?",
            answer:
              "Yes. Our hotel answering service offers multilingual capabilities in Spanish, French, German, Mandarin, and additional languages based on your guest demographics and service area. This is particularly valuable for properties in tourist destinations, international gateway cities, or locations serving diverse global clientele requiring professional communication beyond English-speaking staff capacity.",
            id: "multilingual-support",
          },
          {
            question:
              "Can we use the answering service for after-hours only or do we need 24/7 coverage?",
            answer:
              "Completely flexible based on your property's needs. Many hotels use answering services exclusively for after-hours coverage (typically 11 PM - 7 AM) when maintaining front desk staffing is most expensive, while others implement 24/7 full coverage to handle overflow calls, supplement daytime staff, or operate without traditional front desk personnel entirely. Choose the coverage schedule and call volume capacity matching your specific operational requirements and budget.",
            id: "coverage-options",
          },
        ]}
      />

      <SectionCTA />

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}

