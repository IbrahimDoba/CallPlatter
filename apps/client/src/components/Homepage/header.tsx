"use client";

import { useState, useEffect } from "react";
import type React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Phone,
  Menu,
  ChevronDown,
  Hotel,
  Building2,
  UtensilsCrossed,
  Droplets,
  Scissors,
  Calendar,
  PhoneCall,
  Mail,
  CalendarDays,
  Volume2,
  Activity,
  Mic,
  FileText,
  ShoppingCart,
  Users,
  BookOpen,
  HelpCircle,
  Landmark,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

// ListItem component for navigation links
function ListItem({
  title,
  children,
  href,
  icon: Icon,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & {
  href: string;
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href} className="flex flex-row items-center gap-3">
          {Icon && (
            <div className="flex-shrink-0 w-8 h-8 rounded-lg border border-border flex items-center justify-center bg-background/50">
              <Icon className="h-4 w-4 text-foreground/70" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm leading-none font-medium">{title}</div>
            {children && (
              <p className="text-muted-foreground line-clamp-2 text-sm leading-snug mt-1">
                {children}
              </p>
            )}
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileSection, setOpenMobileSection] = useState<string | null>(
    null
  );
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    if (sectionId === "testimonials") {
      const testimonialSection = document.querySelector(".animate-marquee");
      if (testimonialSection) {
        const yOffset = -100; // Offset to account for the fixed header
        const y =
          testimonialSection.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    } else if (sectionId === "cta") {
      const ctaSection = document.querySelector(".button-gradient");
      if (ctaSection) {
        const yOffset = -100;
        const y =
          ctaSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const navItems: Array<{
    name: string;
    href: string;
    onClick?: (() => void) | null;
  }> = [
    { name: "Pricing", href: "/pricing", onClick: null },
    { name: "Sign in", href: "/signin", onClick: null },
  ];

  // Helper function to chunk array into groups of 4
  const chunkArray = <T,>(array: T[], chunkSize: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  };

  // Industries data
  const industries = [
    { title: "Hotels", href: "/industries/hotels", icon: Hotel },
    { title: "Real Estate", href: "/industries/real-estate", icon: Building2 },
    { title: "Restaurants", href: "/industries/restaurants", icon: UtensilsCrossed },
    { title: "Salons", href: "/industries/salons", icon: Scissors },
    { title: "Car Wash Service", href: "/industries/car-wash", icon: Droplets },
    { title: "Event Planning", href: "/industries/event-planning", icon: Calendar },
    { title: "Online Vendors", href: "/industries/online-vendors", icon: ShoppingCart },
    { title: "Fintech", href: "/industries/fintech", icon: Landmark },
  ];

  const industriesColumns = chunkArray(industries, 4);

  // Solutions data
  const solutions = [
    { title: "Answering Service", href: "/solutions/answering-service", icon: PhoneCall },
    { title: "24/7 Availability", href: "/solutions/24-7-availability", icon: Activity },
    { title: "Email Summary", href: "/solutions/email-summary", icon: Mail },
    { title: "Appointment Scheduling", href: "/solutions/appointment-scheduling", icon: CalendarDays },
    { title: "Call Recording", href: "/solutions/call-recording", icon: Mic },
    { title: "Call Summary", href: "/solutions/call-summary", icon: FileText },
    { title: "CRM Feature", href: "/solutions/crm-feature", icon: Users },
    { title: "Call Transcription", href: "/solutions/call-transcription", icon: FileText },
    { title: "Multiple Voice Options", href: "/solutions/voice-options", icon: Volume2 },
  ];

  const solutionsColumns = chunkArray(solutions, 4);

  // Resources data
  const resources = [
    { title: "Blog", href: "/blog", icon: BookOpen },
    { title: "Call Forwarding Guides", href: "/resources/call-forwarding-guides", icon: HelpCircle },
  ];

  return (
    <header
      className={`fixed top-3.5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 rounded-full ${
        isScrolled
          ? "h-14 bg-background/40 backdrop-blur-xl border border-border scale-95 w-[95%] max-w-6xl"
          : "h-14 bg-background/60 backdrop-blur-md w-[98%] max-w-6xl"
      }`}
    >
      <div className="mx-auto h-full px-8">
        <nav className="flex items-center justify-between h-full">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Phone className="w-4 h-4 text-primary-foreground" />
            </motion.div>
            <Link href="/" className="font-bold text-base text-primary">DailZero</Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <NavigationMenu viewport={isMobile}>
              <NavigationMenuList className="flex-wrap">
                {/* Industries Menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50">
                    Industries
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="shadow-none rounded-lg">
                    <ul className="grid gap-2 w-[500px] md:w-[600px] relative">
                      <li>
                        <div className="p-4">
                          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${industriesColumns.length}, minmax(0, 1fr))` }}>
                            {industriesColumns.map((column) => (
                              <ul key={column.map((item) => item.title).join('-')} className="space-y-1">
                                {column.map((industry) => (
                                  <ListItem
                                    key={industry.title}
                                    title={industry.title}
                                    href={industry.href}
                                    icon={industry.icon}
                                  />
                                ))}
                              </ul>
                            ))}
                          </div>
                        </div>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Solutions Menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50">
                    Solutions
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="shadow-none rounded-lg">
                    <ul className="grid gap-2 w-[500px] md:w-[600px] relative">
                      <li>
                        <div className="p-4">
                          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${solutionsColumns.length}, minmax(0, 1fr))` }}>
                            {solutionsColumns.map((column) => (
                              <ul key={column.map((item) => item.title).join('-')} className="space-y-1">
                                {column.map((solution) => (
                                  <ListItem
                                    key={solution.title}
                                    title={solution.title}
                                    href={solution.href}
                                    icon={solution.icon}
                                  />
                                ))}
                              </ul>
                            ))}
                          </div>
                        </div>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Resources Menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-accent/50">
                    Resources
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="shadow-none rounded-lg">
                    <ul className="grid w-[300px] gap-4 p-4">
                      {resources.map((resource) => (
                        <ListItem
                          key={resource.title}
                          title={resource.title}
                          href={resource.href}
                          icon={resource.icon}
                        />
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Simple Links */}
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.name}>
                    <NavigationMenuLink
                      asChild
                      className={`${navigationMenuTriggerStyle()} bg-transparent hover:bg-accent/50`}
                    >
                      <Link
                        href={item.href}
                        onClick={(e) => {
                          if (item.onClick) {
                            e.preventDefault();
                            item.onClick();
                          }
                        }}
                      >
                        {item.name}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
            <Link href="/signup">
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-background/10 border-border text-foreground hover:bg-background/20"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-background/95 backdrop-blur-xl border-border overflow-y-auto">
                <div className="flex flex-col gap-4 mt-8">
                  {/* Industries Mobile Menu */}
                  <div>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMobileSection(
                          openMobileSection === "industries" ? null : "industries"
                        )
                      }
                      className="flex items-center justify-between w-full text-lg text-foreground/80 hover:text-foreground transition-colors"
                    >
                      Industries
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          openMobileSection === "industries"
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>
                    {openMobileSection === "industries" && (
                      <div className="pl-4 mt-2">
                        <ul className="space-y-1">
                          {industries.map((industry) => (
                            <li key={industry.title}>
                              <Link
                                href={industry.href}
                                className="text-sm text-foreground/70 hover:text-foreground transition-colors block py-1"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {industry.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Solutions Mobile Menu */}
                  <div>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMobileSection(
                          openMobileSection === "solutions" ? null : "solutions"
                        )
                      }
                      className="flex items-center justify-between w-full text-lg text-foreground/80 hover:text-foreground transition-colors"
                    >
                      Solutions
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          openMobileSection === "solutions"
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>
                    {openMobileSection === "solutions" && (
                      <div className="pl-4 mt-2">
                        <ul className="space-y-1">
                          {solutions.map((solution) => (
                            <li key={solution.title}>
                              <Link
                                href={solution.href}
                                className="text-sm text-foreground/70 hover:text-foreground transition-colors block py-1"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {solution.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Resources Mobile Menu */}
                  <div>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMobileSection(
                          openMobileSection === "resources" ? null : "resources"
                        )
                      }
                      className="flex items-center justify-between w-full text-lg text-foreground/80 hover:text-foreground transition-colors"
                    >
                      Resources
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          openMobileSection === "resources"
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>
                    {openMobileSection === "resources" && (
                      <div className="pl-4 mt-2 space-y-1">
                        {resources.map((resource) => (
                          <Link
                            key={resource.title}
                            href={resource.href}
                            className="text-sm text-foreground/70 hover:text-foreground transition-colors block py-1"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {resource.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Other Nav Items */}
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-lg text-foreground/80 hover:text-foreground transition-colors"
                      onClick={(e) => {
                        if (item.onClick) {
                          e.preventDefault();
                          item.onClick();
                        }
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <div className="pt-4 border-t border-border">
                    <Link href="/waitlist" className="block w-full">
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Join Waitlist
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
}
