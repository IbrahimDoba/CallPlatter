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
  Users,
  Calendar,
  TrendingUp,
  Star,
  Utensils,
  CheckCircle,
} from "lucide-react";
import Header from "@/components/Homepage/header";
import Footer from "@/components/Homepage/footer";

export default function RestaurantsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {/* Hero Section */}
      <SectionHero
        title="Restaurant Answering Service"
        titleHighlight="Never Miss a Reservation Again"
        subtitle="Professional 24/7 restaurant call answering and reservation management service. Capture every table booking, takeout order, and customer inquiry with dedicated phone support for restaurants, cafes, bistros, and fine dining establishments. Reduce wait times, eliminate missed calls, and increase revenue."
        primaryButtonText="Start Free Trial"
        primaryButtonHref="/signup"
        secondaryButtonText="See Pricing"
        secondaryButtonHref="/pricing"
        imageSrc="https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
        imageAlt="Professional Restaurant Answering Service and Reservation Management System for Restaurants and Dining Establishments"
        showCallButton={true}
        useConversation={true}
        customerMessage="Hi, I'd like to make a reservation for 6 people tonight at 7:30 PM. Do you have any tables available?"
        aiResponse="Absolutely! We'd be happy to accommodate your party of 6 at 7:30 PM this evening. We have a lovely table available in our main dining area. May I have your name and contact number to confirm the reservation?"
      />

      {/* Features Section */}
      <SectionContent
        title="Restaurant Answering Service Features"
        contentTitle="Complete Call Management Solution for Food Service Businesses"
        contentTitleSubtext="Every feature designed specifically for restaurants, cafes, bars, pizzerias, and catering companies that need to capture every reservation, takeout order, and customer inquiry without interrupting kitchen operations or table service."
        cards={[
          {
            title: "24/7 Restaurant Phone Answering Service",
            subtitle:
              "Round-the-clock live call answering ensures every reservation request, takeout order, delivery inquiry, and customer question receives immediate professional response during peak lunch and dinner rushes, after closing hours, holidays, and busy weekend service when staff can't reach the phone.",
            image:
              "https://images.pexels.com/photos/6347888/pexels-photo-6347888.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "24/7 restaurant phone answering service for reservations and orders",
          },
          {
            title: "Restaurant Reservation Management System",
            subtitle:
              "Seamlessly book table reservations, check availability, manage party sizes, handle special requests, process waitlist inquiries, and coordinate private dining bookings. Reduce no-shows with automated confirmation calls and maximize table turnover by filling cancellations immediately through efficient reservation handling.",
            image:
              "https://images.pexels.com/photos/3201921/pexels-photo-3201921.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Restaurant reservation management and table booking system",
          },
          {
            title: "Takeout & Delivery Order Taking Service",
            subtitle:
              "Professional order taking for takeout, delivery, and catering requests. Accurately capture menu items, special instructions, dietary restrictions, delivery addresses, and payment preferences. Process orders directly into your POS system while maintaining upselling opportunities that increase average ticket values consistently.",
            image:
              "https://images.pexels.com/photos/4393426/pexels-photo-4393426.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Restaurant takeout and delivery order taking phone service",
          },
          {
            title: "Restaurant POS & Reservation System Integration",
            subtitle:
              "Direct integration with leading restaurant technology including Toast POS, Square, Clover, OpenTable, Resy, Yelp Reservations, and other reservation management platforms. Orders and bookings flow automatically into your systems eliminating manual entry, reducing errors, and ensuring seamless coordination between phone staff and kitchen operations.",
            image:
              "https://images.pexels.com/photos/4099354/pexels-photo-4099354.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Restaurant POS integration for answering service and order management",
          },
          {
            title: "Menu Knowledge & Special Requests Handling",
            subtitle:
              "Our restaurant answering specialists learn your complete menu including ingredients, preparation methods, allergen information, daily specials, wine pairings, and pricing. Professionally answer customer questions about gluten-free options, vegan selections, spice levels, and dietary accommodations while maintaining your restaurant's service standards and hospitality reputation.",
            image:
              "https://images.pexels.com/photos/1395964/pexels-photo-1395964.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Restaurant menu knowledge and customer service call handling",
          },
          {
            title: "Multi-Location Restaurant Support",
            subtitle:
              "Manage calls for restaurant groups, franchises, and multi-location dining concepts with location-specific routing, individual menu knowledge, separate reservation systems, and customized call handling procedures for each establishment. Maintain brand consistency while accommodating unique operational requirements across all your restaurant properties.",
            image:
              "https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Multi-location restaurant answering service and call routing",
          },
        ]}
      />

      {/* Value Proposition */}
      <SectionInfo
        title="Why Restaurants Choose Professional Answering Services"
        pageInfoTitle="Increase Restaurant Revenue by 15-25% While Reducing Operational Stress and Missed Opportunities"
        subtitle="Independent restaurants, casual dining chains, and fine dining establishments use professional answering services to maximize table bookings and takeout orders without additional staff overhead."
        pageInfoText="Missing phone calls during lunch and dinner rushes costs restaurants $5,000-$15,000 monthly in lost reservations and takeout orders. When customers can't reach your restaurant, they immediately call competitors. The first restaurant that answers professionally wins the business.\n\nRestaurant answering services capture 100% of incoming calls with trained specialists who understand food service terminology, menu questions, reservation procedures, and order taking protocols. We handle peak hour overflow, after-hours inquiries, and holiday booking requests that would otherwise go to voicemail.\n\nWhile your staff focuses on delivering exceptional dining experiences to seated guests, professional answering services manage phone communications, process takeout orders, book reservations, and answer menu questions. This operational efficiency increases table turnover, boosts average check sizes through proper upselling, reduces staff stress during rushes, and ensures every revenue opportunity receives immediate attention. Restaurants using answering services report dramatic improvements in reservation capture rates, takeout order volume, customer satisfaction scores, and overall profitability without hiring additional host staff or expanding phone lines."
      />

      {/* Benefits Slider */}
      <SectionContentSlider
        title="Restaurant Answering Service Benefits"
        heading="How Professional Call Services Increase Restaurant Revenue & Guest Satisfaction"
        subheading="Proven advantages that maximize reservations, boost takeout sales, and improve operational efficiency in food service operations"
        cards={[
          {
            icon: TrendingUp,
            text: "Revenue increase of 15-25% from capturing every reservation and takeout order. Restaurants miss an average of 30-50 calls per week during peak hours. Professional answering services convert these missed opportunities into confirmed bookings and orders that directly increase sales.",
            id: "revenue-increase",
          },
          {
            icon: Calendar,
            text: "Reservation optimization maximizes table utilization and reduces no-shows. Immediate confirmation calls, waitlist management, and strategic booking practices fill cancellations instantly and maintain optimal dining room capacity throughout service periods, increasing covers per shift consistently.",
            id: "reservation-optimization",
          },
          {
            icon: Star,
            text: "Guest satisfaction improves dramatically when calls answer immediately with friendly, knowledgeable service. Customers appreciate prompt attention to reservations, accurate order taking, and professional menu guidance that reflects positively on your restaurant's reputation and generates positive online reviews.",
            id: "guest-satisfaction",
          },
          {
            icon: Utensils,
            text: "Staff efficiency increases as kitchen and front-of-house teams focus entirely on serving guests rather than answering phones during rushes. Eliminating phone distractions improves table service quality, reduces ticket times, and allows servers to provide attentive hospitality that earns higher tips.",
            id: "staff-efficiency",
          },
          {
            icon: CheckCircle,
            text: "Order accuracy improves through trained specialists who clearly capture menu items, modifications, dietary restrictions, and delivery details. Reducing order errors decreases food waste, eliminates costly remakes, improves customer satisfaction, and protects profit margins on takeout operations.",
            id: "order-accuracy",
          },
          {
            icon: Users,
            text: "Competitive advantage against larger restaurant chains. Independent restaurants gain enterprise-level phone support that matches or exceeds chain restaurant service quality, attracting customers who value immediate responses and professional communication when making dining decisions.",
            id: "competitive-advantage",
          },
        ]}
      />

      {/* How It Works */}
      <SectionImageInfo
        title="How Restaurant Answering Services Work"
        sectionHeading="Simple Setup Process, Immediate Reservation & Order Capture"
        subheading="Start capturing every restaurant call professionally within 24-48 hours with zero disruption to daily operations"
        items={[
          {
            title: "Select Your Restaurant Call Handling Plan",
            subtext:
              "Choose service coverage matching your restaurant's needs including call volume capacity, hours of operation (lunch/dinner only, after-hours, or 24/7 coverage), order taking capabilities, reservation management features, and multi-location support. Plans scale flexibly for single restaurants through large dining groups.",
            image:
              "https://images.pexels.com/photos/955137/pexels-photo-955137.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Restaurant answering service plan selection and setup",
            useConversation: true,
            customerMessage:
              "We run a busy Italian restaurant and need help managing calls during dinner service. Can you handle both reservations and takeout orders?",
            aiResponse:
              "Absolutely! Our restaurant answering service is designed for exactly this. We can manage your dinner rush calls, take reservations, process takeout orders with your menu, and even upsell specials. Would you like to start with our Business plan that includes both services?",
          },
          {
            title: "Customize Your Restaurant Service Protocols",
            subtext:
              "Work with our hospitality team to develop custom call scripts reflecting your restaurant's brand personality, complete menu details, reservation policies, special event procedures, private dining options, and preferred guest communication style. Specialists learn your offerings thoroughly ensuring authentic representation that matches in-house service standards.",
            image:
              "https://images.pexels.com/photos/3184192/pexels-photo-3184192.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Custom restaurant call scripts and service protocol training",
            useConversation: true,
            customerMessage:
              "Our menu changes seasonally and we have daily specials. Can your team keep up with that and answer questions about ingredients?",
            aiResponse:
              "Yes! We'll train our specialists on your full menu including seasonal items, daily specials, ingredients, allergens, and preparation methods. You can update us anytime via email or our portal, and we'll ensure accurate information for every guest call.",
          },
          {
            title: "Integrate With Your Restaurant Technology",
            subtext:
              "Seamless connection to your existing POS system, reservation platform, online ordering software, and communication tools. Reservations appear automatically in OpenTable or Resy, orders transfer directly to Toast or Square, and guest information syncs with your CRM ensuring smooth coordination between answering service and restaurant operations without duplicate entry.",
            image:
              "https://images.pexels.com/photos/4253312/pexels-photo-4253312.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Restaurant POS and reservation system integration with answering service",
            useConversation: true,
            customerMessage:
              "We use Toast POS and OpenTable for reservations. Will everything sync automatically?",
            aiResponse:
              "Perfect! We integrate seamlessly with both Toast and OpenTable. When we take an order, it goes straight to your Toast system. Reservations appear instantly in OpenTable with all guest details. Zero manual entry needed on your end!",
          },
          {
            title: "Launch and Optimize Your Call Management",
            subtext:
              "Your restaurant answering service begins capturing calls immediately. Monitor real-time performance through your dashboard showing reservation counts, order values, call volumes, peak hour patterns, and customer feedback. Continuously refine scripts based on seasonal menu changes, special events, promotional offers, and guest interaction analytics to maximize conversion rates.",
            image:
              "https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt:
              "Restaurant call management analytics and performance optimization",
            useConversation: true,
            customerMessage:
              "How will I know if this is actually increasing our reservations and orders?",
            aiResponse:
              "Great question! Your dashboard shows exactly how many calls we handle, reservations booked, order values, peak call times, and conversion rates. You'll see the direct impact on revenue and how many bookings you would have missed during busy service.",
          },
        ]}
      />

      {/* FAQ Section */}
      <SectionFAQ
        title="Restaurant Answering Service FAQ"
        heading="Common Questions About Professional Call Services for Restaurants and Food Service Businesses"
        faqs={[
          {
            question:
              "How quickly can restaurant answering service be implemented?",
            answer:
              "Most restaurants have professional answering service fully operational within 24-48 hours. Basic reservation and order taking can begin within hours after call forwarding setup, while comprehensive menu training, POS integration, and complete service protocol implementation typically requires 1-2 business days depending on menu complexity and technology systems.",
            id: "implementation-speed",
          },
          {
            question:
              "What does restaurant answering service cost compared to hiring staff?",
            answer:
              "At Dailzero, our restaurant answering service offers exceptional value with flexible pricing. Our Starter plan begins at just $20/month, Business plan at $45/month, and Enterprise plan at $120/month. This represents massive savings compared to hiring host staff at $15-$20/hour ($2,500-$3,500/month per employee) while providing superior 24/7 coverage, no payroll taxes, no benefits costs, no training expenses, and zero scheduling headaches.",
            id: "pricing-comparison",
          },
          {
            question:
              "Can answering service staff learn our complete menu and specials?",
            answer:
              "Absolutely. Our restaurant answering specialists receive comprehensive training on your full menu including appetizers, entrees, desserts, beverages, daily specials, seasonal items, ingredients, preparation methods, portion sizes, pricing, and pairing recommendations. They master allergen information, dietary accommodations, spice levels, and signature dishes to answer guest questions as knowledgeably as your in-house staff.",
            id: "menu-knowledge",
          },
          {
            question:
              "How do you handle takeout and delivery order taking?",
            answer:
              "Our restaurant answering service takes complete takeout and delivery orders with professional accuracy. Specialists capture menu selections, quantity, modifications, special instructions, dietary restrictions, pickup/delivery preferences, contact information, and payment methods. Orders transmit directly into your POS system or via your preferred method (phone call, text, email, or system integration) ensuring kitchen receives clear, complete order details.",
            id: "order-taking-process",
          },
          {
            question:
              "What happens during extremely busy dinner rushes when we can't answer?",
            answer:
              "This is exactly when restaurant answering services provide maximum value. When your staff is overwhelmed serving seated guests during peak hours, our specialists handle overflow calls seamlessly. Guests experience immediate professional service instead of busy signals or voicemail, reservations get booked, orders get placed, and your team maintains focus on dining room hospitality without phone interruptions.",
            id: "rush-hour-handling",
          },
          {
            question:
              "Does the service integrate with OpenTable, Resy, or our reservation system?",
            answer:
              "Yes. Our restaurant answering service integrates with all major reservation platforms including OpenTable, Resy, Yelp Reservations, TableAgent, and others. We also connect with leading POS systems like Toast, Square, Clover, Lightspeed, and TouchBistro. Integration ensures reservations and orders flow automatically into your systems with real-time availability checking and zero manual entry.",
            id: "reservation-integration",
          },
          {
            question:
              "Can you handle catering inquiries and private event bookings?",
            answer:
              "Absolutely. Our restaurant answering specialists manage catering requests, private dining inquiries, event bookings, and special occasion reservations following your specific procedures. We capture party details, budget requirements, menu preferences, and event specifications, then either process bookings directly or schedule consultations with your events coordinator based on your operational preferences.",
            id: "catering-events",
          },
          {
            question:
              "What about restaurants with multiple locations or franchises?",
            answer:
              "Our restaurant answering service excels at multi-location support. We handle calls for restaurant groups, franchises, and dining concepts with intelligent routing to appropriate locations, location-specific menu knowledge, individual reservation systems, separate order processing, and customized service protocols for each property while maintaining overall brand consistency across your entire restaurant portfolio.",
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

