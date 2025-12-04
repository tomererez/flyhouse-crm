
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import {
  LayoutDashboard,
  Users,
  Plane,
  TableProperties,
  Settings,
  Bell,
  Search,
  Calendar,
  Mail,
  Shield
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigationItems = [
  {
    title: "My Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Admin Dashboard",
    url: createPageUrl("AdminDashboard"),
    icon: Users,
    adminOnly: true,
  },
  {
    title: "Kanban Board",
    url: createPageUrl("Kanban"),
    icon: Plane,
  },
  {
    title: "Upcoming Flights",
    url: createPageUrl("UpcomingFlights"),
    icon: Calendar,
  },
  {
    title: "Email Distribution",
    url: createPageUrl("EmailDistribution"),
    icon: Mail,
  },
  {
    title: "All Clients",
    url: createPageUrl("Leads"),
    icon: TableProperties,
  },
  {
    title: "Team",
    url: createPageUrl("Team"),
    icon: Users,
  },

  {
    title: "Settings",
    url: createPageUrl("Settings"),
    icon: Settings,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [me, allUsers] = await Promise.all([
          User.currentUser(),
          User.list()
        ]);
        setCurrentUser(me);
        setUsers(allUsers);
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    loadData();
  }, []);

  const handleSwitchUser = async (email) => {
    try {
      await User.login(email);
      window.location.reload();
    } catch (error) {
      console.error("Error switching user:", error);
    }
  };

  const filteredNavItems = navigationItems.filter(item =>
    !item.adminOnly || currentUser?.role === 'admin'
  );

  return (
    <div className="h-screen flex flex-col">
      <style>{`
        :root {
          --flyhouse-cream: #EDE8E0;
          --flyhouse-cream-light: #F5F2EC;
          --flyhouse-cream-dark: #E5DFD5;
          --flyhouse-black: #1A1A1A;
          --flyhouse-gray: #6B6B6B;
          --flyhouse-white: #FFFFFF;
          --flyhouse-gold: #C9A96E;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .glass-effect {
          background: var(--flyhouse-cream-light);
          border: 1px solid var(--flyhouse-cream-dark);
          box-shadow: none;
        }

        .gradient-bg {
          background: var(--flyhouse-cream);
        }

        .card-glass {
                        background: var(--flyhouse-white);
                        border: 1px solid var(--flyhouse-cream-dark);
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
                        border-radius: 12px;
                      }

        .flyhouse-btn {
                        background: transparent;
                        border: 1px solid var(--flyhouse-black);
                        color: var(--flyhouse-black);
                        font-weight: 500;
                        transition: all 0.2s ease;
                        border-radius: 8px;
                      }

                      .flyhouse-btn:hover {
                        background: var(--flyhouse-black);
                        color: var(--flyhouse-white);
                      }

                      .flyhouse-btn-primary {
                        background: var(--flyhouse-black);
                        border: 1px solid var(--flyhouse-black);
                        color: var(--flyhouse-white);
                        border-radius: 8px;
                      }

                      .flyhouse-btn-primary:hover {
                        background: #333333;
                      }

                      /* Global rounded corners */
                      .rounded-none {
                        border-radius: 8px !important;
                      }
      `}</style>

      <div className="gradient-bg fixed inset-0 -z-10" />

      <SidebarProvider>
        <div className="flex flex-1 overflow-hidden">
          <Sidebar className="bg-[#F5F2EC] border-r border-[#E5DFD5]">
            <SidebarHeader className="p-6">
              <div className="flex flex-col gap-2">
                <img src="/FH-logo-with-wordmark.png" alt="FlyHouse" className="h-8 w-auto object-contain" />
                <p className="text-xs text-[#6B6B6B] uppercase tracking-widest pl-1">CRM Charter</p>
              </div>

              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
                <Input
                  placeholder="Search leads..."
                  className="pl-10 bg-white border-[#E5DFD5] text-[#1A1A1A] placeholder-[#6B6B6B] rounded-lg"
                />
              </div>
            </SidebarHeader>

            <SidebarContent className="px-4">
              <SidebarGroup>
                <SidebarGroupLabel className="text-[10px] font-medium text-[#6B6B6B] uppercase tracking-[0.2em] px-2 py-2">
                  Navigation
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-0.5">
                    {filteredNavItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`rounded-lg transition-all duration-200 ${location.pathname === item.url
                            ? 'bg-[#1A1A1A] text-white'
                            : 'text-[#1A1A1A] hover:bg-[#E5DFD5]'
                            }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-2.5">
                            <item.icon className="w-4 h-4" />
                            <span className="font-medium text-sm">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4">
              <div className="bg-white border border-[#E5DFD5] p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1A1A1A] flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {currentUser?.full_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1A1A1A] text-sm truncate">{currentUser?.full_name || 'Loading...'}</p>
                    <p className="text-xs text-[#6B6B6B] truncate uppercase tracking-wider">{currentUser?.role || 'Guest'}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="w-8 h-8 rounded-lg hover:bg-[#E5DFD5]">
                        <Settings className="w-4 h-4 text-[#1A1A1A]" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Switch User (Dev)</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {users.map(user => (
                        <DropdownMenuItem
                          key={user.id}
                          onClick={() => handleSwitchUser(user.email)}
                          className={currentUser?.id === user.id ? "bg-gray-100" : ""}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{user.full_name}</span>
                            <span className="text-xs text-gray-500">{user.role}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1 flex flex-col overflow-hidden bg-[#EDE8E0]">
            <header className="bg-[#F5F2EC] border-b border-[#E5DFD5] px-6 py-4 md:hidden flex-shrink-0">
              <div className="flex items-center justify-between">
                <SidebarTrigger className="p-2 hover:bg-[#E5DFD5] transition-all duration-200" />
                <h1 className="text-lg font-semibold text-[#1A1A1A] tracking-tight">FlyHouse CRM</h1>
                <Button size="icon" variant="ghost" className="rounded-lg hover:bg-[#E5DFD5]">
                  <Bell className="w-5 h-5 text-[#1A1A1A]" />
                </Button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
