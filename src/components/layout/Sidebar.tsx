import React, { useCallback, useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart2,
  MessageCircle,
  Megaphone,
  Users,
  Calendar,
  Settings,
  X,
  LogOut,
  ChevronDown,
  ChevronUp,
  Facebook,
  User,
  UserCog,
  Award,
  Globe,
  ShoppingCart,
  // Database as DatabaseIcon,
  ShoppingBag,
  // DollarSign,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { FcGoogle } from "react-icons/fc";
import { FaWhatsapp } from "react-icons/fa";

interface SidebarProps {
  closeSidebar?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ closeSidebar }) => {
  const { signOut } = useAuth();
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const submenuRefs = useRef<{
    campaigns: HTMLDivElement | null;
    customers: HTMLDivElement | null;
    analytics: HTMLDivElement | null;
  }>({
    campaigns: null,
    customers: null,
    analytics: null,
  });

  const [submenuHeights, setSubmenuHeights] = useState({
    campaigns: 0,
    customers: 0,
    analytics: 0,
  });

  useEffect(() => {
    setSubmenuHeights({
      campaigns: submenuRefs.current.campaigns?.scrollHeight || 0,
      customers: submenuRefs.current.customers?.scrollHeight || 0,
      analytics: submenuRefs.current.analytics?.scrollHeight || 0,
    });
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [signOut]);

  const getNavLinkClass = useCallback(
    (isActive: boolean) =>
      `group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`,
    []
  );

  const toggleMenu = (menu: string) => {
    setExpandedMenu((prev) => (prev === menu ? null : menu));
  };

  const isMenuActive = (path: string) =>
    location.pathname.startsWith(`/dashboard${path}`);

  return (
    <div className="h-full flex flex-col bg-background border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        <div className="flex items-center">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-8 h-8 rounded-full animate-pulse [animation-duration:5s]"
          />
          <span className="ml-2 text-xl font-semibold text-foreground">
            <strong>STARZ Ai CRM</strong>
          </span>
        </div>
        {closeSidebar && (
          <button
            onClick={closeSidebar}
            className="lg:hidden rounded-md text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close sidebar"
          >
            <X size={24} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="px-2 py-4 space-y-1 flex-grow">
          <NavLink to="/dashboard" end className={({ isActive }) => getNavLinkClass(isActive)}>
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Leads
          </NavLink>

          {/* Analytics */}
          <div>
            <button
              onClick={() => toggleMenu("analytics")}
              className={`group flex items-center justify-between w-full px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                isMenuActive("/dashboard/analytics")
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <div className="flex items-center">
                <BarChart2 className="mr-3 h-5 w-5" />
                Analytics
              </div>
              {expandedMenu === "analytics" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <div
              ref={(el) => (submenuRefs.current.analytics = el)}
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedMenu === "analytics" ? "opacity-100" : "opacity-0 max-h-0"
              }`}
              style={{
                maxHeight: expandedMenu === "analytics" ? `${submenuHeights.analytics}px` : "0px",
              }}
            >
              <div className="pl-8 space-y-1 mt-1">
                <NavLink to="/dashboard/analytics" className={({ isActive }) => getNavLinkClass(isActive)}>
                  <BarChart2 className="mr-3 h-4 w-4" />
                  All
                </NavLink>
                <NavLink to="/dashboard/myservices/sgoogle" className={({ isActive }) => getNavLinkClass(isActive)}>
                  <FcGoogle className="mr-3 h-4 w-4" />
                  Google
                </NavLink>
                <NavLink to="/dashboard/myservices/smeta" className={({ isActive }) => getNavLinkClass(isActive)}>
                  <Facebook className="mr-3 h-4 w-4 text-blue-600" />
                  Meta
                </NavLink>
                <NavLink to="/dashboard/myservices/swhatsapp" className={({ isActive }) => getNavLinkClass(isActive)}>
                  <FaWhatsapp className="mr-3 h-4 w-4 text-green-500" />
                  WhatsApp
                </NavLink>
                <NavLink to="/dashboard/myservices/sweb" className={({ isActive }) => getNavLinkClass(isActive)}>
                  <Globe className="mr-3 h-4 w-4 text-blue-500" />
                  Web
                </NavLink>
              </div>
            </div>
          </div>

          <NavLink to="/dashboard/chats" className={({ isActive }) => getNavLinkClass(isActive)}>
            <MessageCircle className="mr-3 h-5 w-5" />
            Chats
          </NavLink>

          {/* Campaigns */}
          <div>
            <button
              onClick={() => toggleMenu("campaigns")}
              className={`group flex items-center justify-between w-full px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                isMenuActive("/dashboard/campaigns")
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <div className="flex items-center">
                <Megaphone className="mr-3 h-5 w-5" />
                Campaigns
              </div>
              {expandedMenu === "campaigns" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <div
              ref={(el) => (submenuRefs.current.campaigns = el)}
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedMenu === "campaigns" ? "opacity-100" : "opacity-0 max-h-0"
              }`}
              style={{
                maxHeight: expandedMenu === "campaigns" ? `${submenuHeights.campaigns}px` : "0px",
              }}
            >
              <div className="pl-8 space-y-1 mt-1">
                <NavLink to="/dashboard/campaigns/meta" className={({ isActive }) => getNavLinkClass(isActive)}>
                  <Facebook className="mr-3 h-4 w-4 text-blue-600" />
                  Meta
                </NavLink>
                <NavLink to="/dashboard/campaigns/google" className={({ isActive }) => getNavLinkClass(isActive)}>
                  <FcGoogle className="mr-3 h-4 w-4" />
                  Google
                </NavLink>
                <NavLink to="/dashboard/campaigns/whatsapp" className={({ isActive }) => getNavLinkClass(isActive)}>
                  <FaWhatsapp className="mr-3 h-4 w-4 text-green-500" />
                  WhatsApp
                </NavLink>
              </div>
            </div>
          </div>

          {/* Customers */}
          <div>
            <button
              onClick={() => toggleMenu("customers")}
              className={`group flex items-center justify-between w-full px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                isMenuActive("/dashboard/customers")
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <div className="flex items-center">
                <Users className="mr-3 h-5 w-5" />
                Lists
              </div>
              {expandedMenu === "customers" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <div
              ref={(el) => (submenuRefs.current.customers = el)}
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedMenu === "customers" ? "opacity-100" : "opacity-0 max-h-0"
              }`}
              style={{
                maxHeight: expandedMenu === "customers" ? `${submenuHeights.customers}px` : "0px",
              }}
            >
              <div className="pl-8 space-y-1 mt-1">
                <NavLink to="/dashboard/customers/basic" className={({ isActive }) => getNavLinkClass(isActive)}>
                  <User className="mr-3 h-4 w-4" />
                  Basic
                </NavLink>
                <NavLink to="/dashboard/customers/advance" className={({ isActive }) => getNavLinkClass(isActive)}>
                  <UserCog className="mr-3 h-4 w-4" />
                  Advance
                </NavLink>
                <NavLink to="/dashboard/customers/pro" className={({ isActive }) => getNavLinkClass(isActive)}>
                  <Award className="mr-3 h-4 w-4 text-yellow-500" />
                  Pro
                </NavLink>
              </div>
            </div>
          </div>

          {/* Task/Meet */}
          <NavLink to="/dashboard/taskmeet" className={({ isActive }) => getNavLinkClass(isActive)}>
            <Calendar className="mr-3 h-5 w-5" />
            Task/Meet
          </NavLink>

          {/* Shop Now */}
          <NavLink to="/dashboard/shopnow" className={({ isActive }) => getNavLinkClass(isActive)}>
            <ShoppingCart className="mr-3 h-5 w-5" />
            Shop Now
          </NavLink>

          {/* Database */}
          {/* <NavLink to="/dashboard/database" className={({ isActive }) => getNavLinkClass(isActive)}>
            <DatabaseIcon className="mr-3 h-5 w-5" />
            Database
          </NavLink> */}

          {/* Order */}
          <NavLink to="/dashboard/orders" className={({ isActive }) => getNavLinkClass(isActive)}>
            <ShoppingBag className="mr-3 h-5 w-5" />
            Orders
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="border-t border-border px-3 py-4 flex-shrink-0">
          <NavLink to="/dashboard/settings" className={({ isActive }) => getNavLinkClass(isActive)}>
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </NavLink>

          {/* Save & Earn */}
          {/* <NavLink to="/dashboard/saveandearn" className={({ isActive }) => getNavLinkClass(isActive)}>
            <DollarSign className="mr-3 h-5 w-5 text-green-600" />
            Save & Earn
          </NavLink> */}

          <div className="mt-4 text-sm text-muted-foreground">Beta Version 1.0.0</div>
          <div className="text-xs text-muted-foreground mt-1">(There might be few issues, kindly ignore.)</div>

          <button
            onClick={handleSignOut}
            className="mt-3 w-full flex items-center px-3 py-3 text-sm font-medium text-destructive hover:text-destructive/80 rounded-md hover:bg-destructive/10 transition-all duration-200"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
