import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PricingModal } from "@/components/module/PricingModal";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { signOut } from "next-auth/react";
import {
  Settings,
  LogOut,
  User,
  PhoneCall,
  CalendarDays,
  Cog,
  Bot,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Mic,
  Users,
//   Puzzle,
} from "lucide-react";
import { useAgentContext } from "@/contexts/AgentContext";

interface AppSidebarProps {
  session: {
    user?: {
      name?: string;
      email?: string;
    };
  };
}

const navigation = [
  { name: "Calls", href: "/calls", icon: PhoneCall },
  { name: "Appointments", href: "/appointments", icon: CalendarDays },
  { 
    name: "Agent", 
    href: "/agent", 
    icon: Bot,
    hasSubNav: true,
    subItems: [
      { name: "Knowledge", component: "knowledge", icon: BookOpen },
      { name: "Voice", component: "voice", icon: Mic },
      { name: "CRM", component: "crm", icon: Users },
    ]
  },
  { name: "Settings", href: "/settings", icon: Cog },
//   { name: "Integrations", href: "/integrations", icon: Puzzle },
];

const supportItems = [
  { name: "Talk to support", icon: HelpCircle, href: "/support" },
  { name: "What's new", icon: Sparkles, href: "/whats-new" },
];

function TrialBanner() {
  return (
    <div className="mx-2 mb-4 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
          Trial
        </span>
        <span className="text-xs text-purple-600 dark:text-purple-400">
          7 days left
        </span>
      </div>
      <PricingModal>
        <Button
          size="sm"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          Upgrade now
        </Button>
      </PricingModal>
    </div>
  );
}

export default function AppSidebar({ session }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { activeAgentComponent, setActiveAgentComponent } = useAgentContext();

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  const handleAgentSubItemClick = (component: string) => {
    setActiveAgentComponent(component);
  };

  // Auto-expand Agent sub-navigation when on agent page
  useEffect(() => {
    if (pathname === "/agent" && !expandedItems.includes("Agent")) {
      setExpandedItems(prev => [...prev, "Agent"]);
    }
  }, [pathname, expandedItems]);

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-start justify-start h-12">
          <h1 className="text-xl font-semibold">DailZero</h1>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.hasSubNav && item.subItems?.some(subItem => activeAgentComponent === subItem.component));
                const isExpanded = expandedItems.includes(item.name);
                
                return (
                  <SidebarMenuItem key={item.name}>
                    {item.hasSubNav ? (
                      <>
                        <SidebarMenuButton
                          onClick={() => {
                            // Navigate to the agent page first
                            router.push(item.href);
                            // Then toggle the sub-navigation
                            toggleExpanded(item.name);
                          }}
                          isActive={isActive}
                          className={cn(
                            "transition-all duration-200 hover:scale-105 py-6 px-4 rounded-lg w-full",
                            isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="text-base flex-1 text-left">{item.name}</span>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </SidebarMenuButton>
                        
                        <div 
                          className={cn(
                            "overflow-hidden transition-all duration-300 ease-in-out",
                            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                          )}
                        >
                          <div className="ml-6 mt-1 space-y-1">
                            {item.subItems?.map((subItem, index) => {
                              const isSubActive = activeAgentComponent === subItem.component;
                              return (
                                <SidebarMenuButton
                                  key={subItem.name}
                                  onClick={() => handleAgentSubItemClick(subItem.component)}
                                  isActive={isSubActive}
                                  className={cn(
                                    "transition-all duration-200 hover:scale-105 py-3 px-4 rounded-lg text-sm cursor-pointer",
                                    isSubActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                                    "transform transition-all duration-200 hover:translate-x-1"
                                  )}
                                  style={{
                                    animationDelay: isExpanded ? `${index * 50}ms` : '0ms'
                                  }}
                                >
                                  <subItem.icon className="h-4 w-4" />
                                  <span>{subItem.name}</span>
                                </SidebarMenuButton>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={cn(
                          "transition-all duration-200 hover:scale-105 py-6 px-4 rounded-lg",
                          isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        )}
                      >
                        <Link href={item.href} className="gap-3">
                          <item.icon className="h-5 w-5" />
                          <span className="text-base">{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto">
          <TrialBanner />
          
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {supportItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={cn(
                          "transition-all duration-200 hover:scale-105",
                          isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        )}
                      >
                        <Link href={item.href} className="gap-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-blue-100 text-blue-700">
                      {session.user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {session.user?.name || "User"}
                    </span>
                    <span className="truncate text-xs">
                      {session.user?.email || "user@example.com"}
                    </span>
                  </div>
                  <Settings className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export { navigation };