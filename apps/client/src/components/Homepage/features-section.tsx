"use client"
import { Phone, Calendar, BarChart3, Shield } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FeatureTab } from "./FeatureTab"
import { FeatureContent } from "./FeatureContent"

const features = [
  {
    icon: <Phone className="w-6 h-6" />,
    title: "AI Voice Assistant",
    description: "Natural conversation handling with advanced speech recognition. Our AI understands various accents and local business contexts worldwide.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: "Smart Appointment Booking",
    description: "Automatically schedule appointments during calls. Integrates with your calendar and sends reminders to customers.",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Business Dashboard",
    description: "Track calls, appointments, and customer interactions. Get insights into your business communications patterns.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Enterprise Security",
    description: "Enterprise-grade security with complete data isolation. Your business data is protected and private.",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
  }
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container px-4 mx-auto max-w-6xl">
        {/* Header Section */}
        <div className="max-w-2xl mb-20">
          <h2 className="text-5xl md:text-6xl font-normal mb-6 tracking-tight text-left text-foreground">
            Advanced AI
            <br />
            <span className="text-primary font-medium">Features & Tools</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground text-left">
            Experience professional-grade AI tools and features designed for modern businesses and their communication needs worldwide.
          </p>
        </div>

        <Tabs defaultValue={features[0]?.title || "AI Voice Assistant"} className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            {/* Left side - Tab triggers */}
            <div className="md:col-span-5 space-y-3">
              <TabsList className="flex flex-col w-full bg-transparent h-auto p-0 space-y-3">
                {features.map((feature) => (
                  <TabsTrigger
                    key={feature.title}
                    value={feature.title}
                    className="w-full data-[state=active]:shadow-none data-[state=active]:bg-transparent"
                  >
                    <FeatureTab
                      title={feature.title}
                      description={feature.description}
                      icon={feature.icon}
                      isActive={false}
                    />
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Right side - Tab content with images */}
            <div className="md:col-span-7">
              {features.map((feature) => (
                <TabsContent
                  key={feature.title}
                  value={feature.title}
                  className="mt-0 h-full"
                >
                  <FeatureContent
                    image={feature.image}
                    title={feature.title}
                  />
                </TabsContent>
              ))}
            </div>
          </div>
        </Tabs>
      </div>
    </section>
  )
}
