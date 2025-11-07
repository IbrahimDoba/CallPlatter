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
  ShoppingCart,
  Headset,
  Package,
  TrendingUp,
  Star,
  CheckCircle,
} from "lucide-react";
import Header from "@/components/Homepage/header";
import Footer from "@/components/Homepage/footer";

export default function OnlineVendorsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {/* Hero Section */}
      <SectionHero
        title="24/7 Answering Service for Online Vendors"
        titleHighlight="Never Lose a Sale to an Unanswered Call"
        subtitle="Professional 24/7 answering service for e-commerce stores, marketplace sellers, and online businesses. We provide exceptional customer support, process orders over the phone, and manage inquiries, helping you build trust and maximize revenue."
        primaryButtonText="Start Your Free Trial"
        primaryButtonHref="/signup"
        secondaryButtonText="View Pricing"
        secondaryButtonHref="/pricing"
        imageSrc="https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
        imageAlt="Professional answering service for online vendors and e-commerce stores."
        showCallButton={true}
        useConversation={true}
        customerMessage="Hi, I saw a product on your website, but I have a question about the dimensions before I place my order. I also want to know about your return policy."
        aiResponse="Of course! I'd be happy to help. Which product are you interested in? I can provide the exact dimensions. Our return policy is 30 days for a full refund, no questions asked. I can even help you place the order over the phone if you'd like."
      />

      {/* Features Section */}
      <SectionContent
        title="E-commerce Answering Service Features"
        contentTitle="The Complete Customer Support Solution for Your Online Store"
        contentTitleSubtext="From handling product questions to processing orders and managing returns, our features are designed to provide a seamless and professional customer experience for your e-commerce brand."
        cards={[
          {
            title: "24/7 Customer Service & Support",
            subtitle:
              "Offer round-the-clock support to your customers. Our team is always available to answer product questions, provide shipping updates, and resolve issues, regardless of time zones. This builds customer confidence and loyalty.",
            image:
              "https://images.pexels.com/photos/4195325/pexels-photo-4195325.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "24/7 customer service for online stores.",
          },
          {
            title: "Over-the-Phone Order Processing",
            subtitle:
              "Cater to customers who prefer to order by phone. Our PCI-compliant agents can securely take orders, process payments, and confirm details, capturing sales you might otherwise miss.",
            image:
              "https://images.pexels.com/photos/50987/money-card-business-credit-card-50987.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Secure over-the-phone order processing for e-commerce.",
          },
          {
            title: "Return & Exchange Management (RMA)",
            subtitle:
              "Streamline your returns process. We can initiate RMAs, provide customers with return instructions and shipping labels, and answer questions about your return policy, turning a potential negative experience into a positive one.",
            image:
              "https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Return and exchange management for online vendors.",
          },
          {
            title: "Marketplace Seller Support",
            subtitle:
              "Provide dedicated support for your Amazon, eBay, Etsy, or other marketplace customers. We can handle inquiries specific to each platform, manage communication, and ensure you maintain a high seller rating.",
            image:
              "https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Customer support for marketplace sellers on Amazon, eBay, and Etsy.",
          },
          {
            title: "Lead Capture & Pre-Sales Inquiries",
            subtitle:
              "Don't miss out on potential customers. We capture contact information from interested callers, answer pre-sales questions about your products, and can even qualify leads for your sales team, fueling your growth.",
            image:
              "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Lead capture and pre-sales support for online businesses.",
          },
          {
            title: "Helpdesk & Ticketing Integration",
            subtitle:
              "Integrate seamlessly with your existing helpdesk software like Zendesk, Gorgias, or Freshdesk. Every call is logged as a ticket, ensuring a unified view of all customer interactions and a streamlined support workflow.",
            image:
              "https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Integration with helpdesk and ticketing software.",
          },
        ]}
      />

      {/* Value Proposition */}
      <SectionInfo
        title="Why Online Vendors Need a Professional Answering Service"
        pageInfoTitle="Convert More Sales and Build a Trusted Brand"
        subtitle="Successful e-commerce entrepreneurs and marketplace sellers leverage a professional answering service to offer enterprise-level customer support, freeing them to focus on product, marketing, and growth."
        pageInfoText="For online vendors, every missed call can be a lost sale. Studies show that over 60% of consumers prefer to call a business for complex inquiries, and if they can't get a human on the line, they'll simply buy from a competitor. Managing a constant stream of customer calls while also handling inventory, shipping, and marketing is a significant challenge for growing online businesses.\n\nA dedicated e-commerce answering service ensures every customer feels heard and valued. We act as your frontline support, providing instant, professional responses to questions about orders, products, and policies. This not only saves you time but also dramatically increases customer trust and conversion rates.\n\nOur trained agents become experts on your products. From processing orders over the phone for less tech-savvy customers to managing complex return requests, we provide a human touch that automated systems can't match. Online vendors using our service see an average 25% increase in phone order conversions and a significant boost in positive customer reviews, directly impacting their bottom line and brand reputation."
      />

      {/* Benefits Slider */}
      <SectionContentSlider
        title="E-commerce Answering Service Benefits"
        heading="How a Dedicated Call Service Boosts Your Online Sales"
        subheading="Key advantages that lead to higher conversion rates, increased customer loyalty, and a more scalable business."
        cards={[
          {
            icon: TrendingUp,
            text: "Increase conversion rates by providing instant answers to pre-sales questions. A quick, helpful response can be the deciding factor for a customer on the fence about a purchase.",
            id: "conversion-increase",
          },
          {
            icon: Star,
            text: "Improve customer loyalty and lifetime value. Excellent, accessible support turns one-time buyers into repeat customers and brand advocates who leave positive reviews.",
            id: "customer-loyalty",
          },
          {
            icon: ShoppingCart,
            text: "Reduce cart abandonment by offering a phone number for immediate help. Customers who can easily resolve questions during checkout are far more likely to complete their purchase.",
            id: "cart-abandonment",
          },
          {
            icon: Headset,
            text: "Enhance your brand's reputation. Offering professional, human-powered phone support sets you apart from competitors and builds a perception of a larger, more established company.",
            id: "brand-reputation",
          },
          {
            icon: CheckCircle,
            text: "Free up your time to focus on growth. Delegate customer service and order management to us, so you can concentrate on product development, marketing, and scaling your business.",
            id: "time-saving",
          },
          {
            icon: Package,
            text: "Streamline operations with efficient handling of returns and order issues. A smooth, hassle-free process for problem resolution is key to maintaining customer satisfaction.",
            id: "operations",
          },
        ]}
      />

      {/* How It Works */}
      <SectionImageInfo
        title="How Our E-commerce Answering Service Works"
        sectionHeading="Simple Onboarding, Immediate Impact"
        subheading="Launch your professional customer support line in just 24-48 hours and start capturing more sales."
        items={[
          {
            title: "We Learn Your Products and Policies",
            subtext:
              "You provide us with your product catalog, FAQs, and store policies. We use this to build a comprehensive knowledge base, training our agents to be experts on your brand.",
            image:
              "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Answering service team learning about a client's e-commerce products.",
            useConversation: true,
            customerMessage:
              "I sell handmade leather goods on Etsy. Can your team answer detailed questions about the type of leather used and the crafting process?",
            aiResponse:
              "Absolutely. We'd love to learn about your craft. You can provide us with all those details, and our agents will be able to share the unique story and quality of your products with every caller, just like you would.",
          },
          {
            title: "Customize Your Call Handling Instructions",
            subtext:
              "You decide how we handle different types of calls. From taking messages and processing orders to initiating returns, you set the rules, and we follow them perfectly.",
            image:
              "https://images.pexels.com/photos/3184460/pexels-photo-3184460.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Team customizing call handling instructions.",
            useConversation: true,
            customerMessage:
              "I want you to try and save the sale if a customer calls to cancel an order. Can you offer them a 10% discount before processing the cancellation?",
            aiResponse:
              "Excellent strategy. We can add that right into your script. If a customer requests a cancellation, our agent will be prompted to offer a 10% discount to encourage them to keep the order. We'll only proceed with the cancellation if they decline.",
          },
          {
            title: "Integrate With Your E-commerce Stack",
            subtext:
              "We connect with popular e-commerce platforms and helpdesks. This allows us to look up order information, log interactions, and provide a truly integrated support experience.",
            image:
              "https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Answering service dashboard integrating with e-commerce software.",
            useConversation: true,
            customerMessage:
              "We use Shopify for our store and Gorgias for our helpdesk. Can you look up order statuses in Shopify and create tickets in Gorgias?",
            aiResponse:
              "Yes, we integrate with both. Our agents can access order information directly from your Shopify admin to provide customers with real-time status updates. Every call will also be automatically logged as a ticket in Gorgias for your records.",
          },
          {
            title: "Go Live and Watch Your Business Grow",
            subtext:
              "Forward your calls to us, and we start answering immediately. You can track our performance through a real-time dashboard, seeing call volumes, order values, and customer feedback.",
            image:
              "https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
            imageAlt: "Online vendor monitoring business growth on a dashboard.",
            useConversation: true,
            customerMessage:
              "How will I know if the service is paying for itself?",
            aiResponse:
              "Your dashboard will show you exactly how many orders we've processed over the phone and their total value. You can directly compare this to your monthly cost. Most of our e-commerce clients find the service pays for itself with just a few saved sales.",
          },
        ]}
      />

      {/* FAQ Section */}
      <SectionFAQ
        title="Answering Service for Online Vendors FAQ"
        heading="Frequently Asked Questions for E-commerce Businesses"
        faqs={[
          {
            question: "Can you handle calls 24/7, including weekends and holidays?",
            answer:
              "Yes. Our service operates 24/7/365. This is especially valuable for online vendors, as customers may be shopping at any time, from any time zone. We ensure you're always open for business.",
            id: "24-7-support",
          },
          {
            question:
              "How much does an answering service for an online store cost?",
            answer:
              "Our pricing is designed to be affordable for businesses of all sizes. We have flexible monthly plans based on call volume, which are far more cost-effective than hiring in-house customer service staff (which can cost $3,000+/month per employee).",
            id: "pricing",
          },
          {
            question: "Is your service secure for taking payments?",
            answer:
              "Absolutely. Our systems are fully PCI DSS compliant, which is the industry standard for secure credit card processing. You can be confident that your customers' data is always protected.",
            id: "pci-compliance",
          },
          {
            question: "How do you learn about my specific products?",
            answer:
              "We have a structured onboarding process where we collect your product information, FAQs, and store policies. We use this to build a knowledge base and train our agents, who are skilled at quickly learning new product lines.",
            id: "product-training",
          },
          {
            question: "What happens if a caller has a very technical product question?",
            answer:
              "We work with you to define an escalation path. For highly technical questions that our team can't answer, we can escalate the call to a designated expert on your team via direct transfer or by taking a detailed message for a callback.",
            id: "escalation",
          },
          {
            question: "Can you support customers from different marketplaces like Amazon or eBay?",
            answer:
              "Yes. We can act as the support line for your entire online presence. We can be trained on the specific policies and communication guidelines for each marketplace to ensure you maintain high seller ratings.",
            id: "marketplaces",
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
