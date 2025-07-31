// import React, { useCallback, useState, useRef, useEffect } from "react";
// import { NavLink, useLocation } from "react-router-dom";
// import {
//   LayoutDashboard,
//   BarChart2,
//   MessageCircle,
//   Megaphone,
//   Users,
//   Calendar,
//   Settings,
//   X,
//   LogOut,
//   ChevronDown,
//   ChevronUp,
//   Facebook,
//   User,
//   UserCog,
//   Award,
//   Globe,
//   ShoppingCart,
//   Database as DatabaseIcon,
//   ShoppingBag,
//   DollarSign,
//   Phone,
//   GitBranch,
//   ListTodo,
// } from "lucide-react";
// import { useAuth } from "../../context/AuthContext";
// import { FcGoogle } from "react-icons/fc";
// import { FaWhatsapp } from "react-icons/fa";

// interface SidebarProps {
//   closeSidebar?: () => void;
// }

// const Sidebar: React.FC<SidebarProps> = ({ closeSidebar }) => {
//   const { signOut } = useAuth();
//   const location = useLocation();
//   const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
//   const submenuRefs = useRef<{
//     activities: HTMLDivElement | null;
//     lists: HTMLDivElement | null;
//     campaign: HTMLDivElement | null;
//     analytics: HTMLDivElement | null;
//   }>({
//     activities: null,
//     lists: null,
//     campaign: null,
//     analytics: null,
//   });

//   const [submenuHeights, setSubmenuHeights] = useState({
//     activities: 0,
//     lists: 0,
//     campaign: 0,
//     analytics: 0,
//   });

//   useEffect(() => {
//     setSubmenuHeights({
//       activities: submenuRefs.current.activities?.scrollHeight || 0,
//       lists: submenuRefs.current.lists?.scrollHeight || 0,
//       campaign: submenuRefs.current.campaign?.scrollHeight || 0,
//       analytics: submenuRefs.current.analytics?.scrollHeight || 0,
//     });
//   }, []);

//   const handleSignOut = useCallback(async () => {
//     try {
//       await signOut();
//     } catch (error) {
//       console.error("Error signing out:", error);
//     }
//   }, [signOut]);

//   const getNavLinkClass = useCallback(
//     (isActive: boolean) =>
//       `group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
//         isActive
//           ? "bg-primary/10 text-primary"
//           : "text-muted-foreground hover:bg-muted hover:text-foreground"
//       }`,
//     []
//   );

//   const toggleMenu = (menu: string) => {
//     setExpandedMenu((prev) => (prev === menu ? null : menu));
//   };

//   // Update isMenuActive to handle root path
//   const isMenuActive = useCallback((path: string) => {
//     return location.pathname.startsWith(`/dashboard${path}`);
//   }, [location.pathname]);

//   // const isMenuActive = (path: string) =>
//   //   location.pathname.startsWith(`/dashboard${path}`);

//   return (
//     <div className="h-full flex flex-col bg-background border-r border-border">
//       {/* Header */}
//       <div className="flex items-center justify-between h-16 px-4 border-b border-border">
//         <div className="flex items-center">
//           <img
//             src="/favicon.ico"
//             alt="Logo"
//             className="w-8 h-8 rounded-full animate-pulse [animation-duration:5s]"
//           />
//           <span className="ml-2 text-xl font-semibold text-foreground">
//             <strong>STARZ Ai CRM</strong>
//           </span>
//         </div>
//         {closeSidebar && (
//           <button
//             onClick={closeSidebar}
//             className="lg:hidden rounded-md text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
//             aria-label="Close sidebar"
//           >
//             <X size={24} />
//           </button>
//         )}
//       </div>

//       {/* Navigation */}
//       <div className="flex-1 flex flex-col overflow-y-auto">
//         <nav className="px-2 py-4 space-y-1 flex-grow">
//           {/* Pipelines */}
//           <NavLink
//             to="/dashboard"
//             className={({ isActive }) => getNavLinkClass(isActive)}
//           >
//             <GitBranch className="mr-3 h-5 w-5" />
//             Pipelines
//           </NavLink>

//           {/* Activities */}
//           <div>
//             <button
//               onClick={() => toggleMenu("activities")}
//               className={`group flex items-center justify-between w-full px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
//                 isMenuActive("/activities")
//                   ? "bg-primary/10 text-primary"
//                   : "text-muted-foreground hover:bg-muted hover:text-foreground"
//               }`}
//             >
//               <div className="flex items-center">
//                 <Calendar className="mr-3 h-5 w-5" />
//                 Activities
//               </div>
//               {expandedMenu === "activities" ? (
//                 <ChevronUp className="h-4 w-4" />
//               ) : (
//                 <ChevronDown className="h-4 w-4" />
//               )}
//             </button>
//             <div
//               ref={(el) => (submenuRefs.current.activities = el)}
//               className={`overflow-hidden transition-all duration-300 ease-in-out ${
//                 expandedMenu === "activities"
//                   ? "opacity-100"
//                   : "opacity-0 max-h-0"
//               }`}
//               style={{
//                 maxHeight:
//                   expandedMenu === "activities"
//                     ? `${submenuHeights.activities}px`
//                     : "0px",
//               }}
//             >
//               <div className="pl-8 space-y-1 mt-1">
//                 <NavLink
//                   to="/dashboard/activities/chats"
//                   className={({ isActive }) => getNavLinkClass(isActive)}
//                 >
//                   <MessageCircle className="mr-3 h-4 w-4" />
//                   Chats
//                 </NavLink>
//                 <NavLink
//                   to="/dashboard/activities/calls"
//                   className={({ isActive }) => getNavLinkClass(isActive)}
//                 >
//                   <Phone className="mr-3 h-4 w-4" />
//                   Calls
//                 </NavLink>
//                 <NavLink
//                   to="/dashboard/activities/tasks"
//                   className={({ isActive }) => getNavLinkClass(isActive)}
//                 >
//                   <ListTodo className="mr-3 h-4 w-4" />
//                   Tasks
//                 </NavLink>
//                 <NavLink
//                   to="/dashboard/activities/meets"
//                   className={({ isActive }) => getNavLinkClass(isActive)}
//                 >
//                   <Calendar className="mr-3 h-4 w-4" />
//                   Meets
//                 </NavLink>
//               </div>
//             </div>
//           </div>

//           {/* Lists */}
//           <div>
//             <button
//               onClick={() => toggleMenu("lists")}
//               className={`group flex items-center justify-between w-full px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
//                 isMenuActive("/lists")
//                   ?"bg-primary/10 text-primary"
//                   :"text-muted-foreground hover:bg-muted hover:text-foreground"
//               }`}
//             >
//               <div className="flex items-center">
//                 <Users className="mr-3 h-5 w-5" />
//                 Lists
//               </div>
//               {expandedMenu === "lists" ? (
//                 <ChevronUp className="h-4 w-4" />
//               ) : (
//                 <ChevronDown className="h-4 w-4" />
//               )}
//             </button>
//             <div
//               ref={(el) => (submenuRefs.current.lists = el)}
//               className={`overflow-hidden transition-all duration-300 ease-in-out ${
//                 expandedMenu === "lists" ? "opacity-100" : "opacity-0 max-h-0"
//               }`}
//               style={{
//                 maxHeight:
//                   expandedMenu === "lists"
//                     ? `${submenuHeights.lists}px`
//                     : "0px",
//               }}
//             >
//               <div className="pl-8 space-y-1 mt-1">
//                 <NavLink
//                   to="/dashboard/lists/basic"
//                   className={({ isActive }) => getNavLinkClass(isActive)}
//                 >
//                   <User className="mr-3 h-4 w-4" />
//                   Basic
//                 </NavLink>
//                 <NavLink
//                   to="/dashboard/lists/advance"
//                   className={({ isActive }) => getNavLinkClass(isActive)}
//                 >
//                   <UserCog className="mr-3 h-4 w-4" />
//                   Advance
//                 </NavLink>
//                 <NavLink
//                   to="/dashboard/lists/pro"
//                   className={({ isActive }) => getNavLinkClass(isActive)}
//                 >
//                   <Award className="mr-3 h-4 w-4 text-yellow-500" />
//                   Pro
//                 </NavLink>
//                 <NavLink
//                   to="/dashboard/lists/leads"
//                   end
//                   className={({ isActive }) => getNavLinkClass(isActive)}
//                 >
//                   <LayoutDashboard className="mr-3 h-4 w-4" />
//                   Leads
//                 </NavLink>
//                 <NavLink
//                   to="/dashboard/lists/data"
//                   className={({ isActive }) => getNavLinkClass(isActive)}
//                 >
//                   <DatabaseIcon className="mr-3 h-4 w-4" />
//                   Data
//                 </NavLink>
//               </div>
//             </div>
//           </div>

//           {/* Campaign */}
//           <div>
//             <button
//               onClick={() => toggleMenu("campaign")}
//               className={`group flex items-center justify-between w-full px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
//                 isMenuActive("/campaigns")
//                   ? "bg-primary/10 text-primary"
//                   : "text-muted-foreground hover:bg-muted hover:text-foreground"
//               }`}
//             >
//               <div className="flex items-center">
//                 <Megaphone className="mr-3 h-5 w-5" />
//                 Campaign
//               </div>
//               {expandedMenu === "campaign" ? (
//                 <ChevronUp className="h-4 w-4" />
//               ) : (
//                 <ChevronDown className="h-4 w-4" />
//               )}
//             </button>
//             <div
//               ref={(el) => (submenuRefs.current.campaign = el)}
//               className={`overflow-hidden transition-all duration-300 ease-in-out ${
//                 expandedMenu === "campaign"
//                   ? "opacity-100"
//                   : "opacity-0 max-h-0"
//               }`}
//               style={{
//                 maxHeight:
//                   expandedMenu === "campaign"
//                     ? `${submenuHeights.campaign}px`
//                     : "0px",
//               }}
//             >
//               <div className="pl-8 space-y-1 mt-1">
//                 <NavLink
//                   to="/dashboard/campaigns/meta"
//                   className={({ isActive }) => getNavLinkClass(isActive)}
//                 >
//                   <Facebook className="mr-3 h-4 w-4 text-blue-600" />
//                   Meta
//                 </NavLink>
//                 <NavLink
//                   to="/dashboard/campaigns/google"
//                   className={({ isActive }) => getNavLinkClass(isActive)}
//                 >
//                   <FcGoogle className="mr-3 h-4 w-4" />
//                   Google
//                 </NavLink>
//                 <NavLink
//                   to="/dashboard/campaigns/whatsapp"
//                   className={({ isActive }) => getNavLinkClass(isActive)}
//                 >
//                   <FaWhatsapp className="mr-3 h-4 w-4 text-green-500" />
//                   WhatsApp
//                 </NavLink>
//               </div>
//             </div>
//           </div>

//           {/* Analytics */}
//           <div>
//             <button
//               onClick={() => toggleMenu("analytics")}
//               className={`group flex items-center justify-between w-full px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
//                 isMenuActive("/analytics") || isMenuActive("/myservices")
//                   ? "bg-primary/10 text-primary"
//                   : "text-muted-foreground hover:bg-muted hover:text-foreground"
//               }`}
//             >
//               <div className="flex items-center">
//                 <BarChart2 className="mr-3 h-5 w-5" />
//                 Analytics
//               </div>
//               {expandedMenu === "analytics" ? (
//                 <ChevronUp className="h-4 w-4" />
//               ) : (
//                 <ChevronDown className="h-4 w-4" />
//               )}
//             </button>
//             <div
//               ref={(el) => (submenuRefs.current.analytics = el)}
//               className={`overflow-hidden transition-all duration-300 ease-in-out ${
//                 expandedMenu === "analytics"
//                   ? "opacity-100"
//                   : "opacity-0 max-h-0"
//               }`}
//               style={{
//                 maxHeight:
//                   expandedMenu === "analytics"
//                     ? `${submenuHeights.analytics}px`
//                     : "0px",
//               }}
//             >
//               <div className="pl-8 space-y-1 mt-1">
//                 <NavLink
//                   to="/dashboard/analytics"
//                   className={({ isActive }) => getNavLinkClass(isActive)}
//                 >
//                   <BarChart2 className="mr-3 h-4 w-4" />
//                   All
//                 </NavLink>
//                 <NavLink
//                   to="/dashboard/myservices/sgoogle"
//                   className={({ isActive }) => getNavLinkClass(isActive)}
//                 >
//                   <FcGoogle className="mr-3 h-4 w-4" />
//                   Google
//                 </NavLink>
//                 <NavLink
//                   to="/dashboard/myservices/smeta"
//                   className={({ isActive }) => getNavLinkClass(isActive)}
//                 >
//                   <Facebook className="mr-3 h-4 w-4 text-blue-600" />
//                   Meta
//                 </NavLink>
//                 <NavLink
//                   to="/dashboard/myservices/swhatsapp"
//                   className={({ isActive }) => getNavLinkClass(isActive)}
//                 >
//                   <FaWhatsapp className="mr-3 h-4 w-4 text-green-500" />
//                   WhatsApp
//                 </NavLink>
//                 <NavLink
//                   to="/dashboard/myservices/sweb"
//                   className={({ isActive }) => getNavLinkClass(isActive)}
//                 >
//                   <Globe className="mr-3 h-4 w-4 text-blue-500" />
//                   Web
//                 </NavLink>
//               </div>
//             </div>
//           </div>

//           {/* Shop Now */}
//           <NavLink
//             to="/dashboard/shopnow"
//             className={({ isActive }) => getNavLinkClass(isActive)}
//           >
//             <ShoppingCart className="mr-3 h-5 w-5" />
//             Shop Now
//           </NavLink>

//           {/* My Orders */}
//           <NavLink
//             to="/dashboard/orders"
//             className={({ isActive }) => getNavLinkClass(isActive)}
//           >
//             <ShoppingBag className="mr-3 h-5 w-5" />
//             My Orders
//           </NavLink>
//         </nav>

//         {/* Bottom Navigation Items */}

//         {/* Footer */}
//         <div className="border-border px-2 py-2 flex-shrink-0">
//           <div className="mt-auto">
//             <nav className=" space-y-1 border-t border-border">
//               {/* Setting */}
//               <NavLink
//                 to="/dashboard/settings"
//                 className={({ isActive }) => getNavLinkClass(isActive)}
//               >
//                 <Settings className="mr-3 h-5 w-5" />
//                 Setting
//               </NavLink>

//               {/* Refer & Earn */}
//               <NavLink
//                 to="/dashboard/saveandearn"
//                 className={({ isActive }) => getNavLinkClass(isActive)}
//               >
//                 <DollarSign className="mr-3 h-5 w-5 text-green-600" />
//                 Refer & Earn
//               </NavLink>
//             </nav>
//           </div>
//           <div className="mt-4 text-sm text-muted-foreground">
//             Beta Version 1.0.0
//           </div>
//           <div className="text-xs text-muted-foreground mt-1">
//             (There might be few issues, kindly ignore.)
//           </div>

//           <button
//             onClick={handleSignOut}
//             className="mt-3 w-full flex items-center px-3 py-3 text-sm font-medium text-destructive hover:text-destructive/80 rounded-md hover:bg-destructive/10 transition-all duration-200"
//           >
//             <LogOut className="mr-3 h-5 w-5" />
//             Sign Out
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;



































































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
  Database as DatabaseIcon,
  ShoppingBag,
  DollarSign,
  Phone,
  GitBranch,
  ListTodo,
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
    activities: HTMLDivElement | null;
    lists: HTMLDivElement | null;
    campaign: HTMLDivElement | null;
    analytics: HTMLDivElement | null;
  }>({
    activities: null,
    lists: null,
    campaign: null,
    analytics: null,
  });

  const [submenuHeights, setSubmenuHeights] = useState({
    activities: 0,
    lists: 0,
    campaign: 0,
    analytics: 0,
  });

  useEffect(() => {
    setSubmenuHeights({
      activities: submenuRefs.current.activities?.scrollHeight || 0,
      lists: submenuRefs.current.lists?.scrollHeight || 0,
      campaign: submenuRefs.current.campaign?.scrollHeight || 0,
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

  const isMenuActive = useCallback(
    (path: string) => location.pathname.startsWith(`/dashboard${path}`),
    [location.pathname]
  );

  return (
    <div className="h-full flex flex-col bg-background border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-border pb-9 pt-9">
        <div className="flex items-center">
          <img
            src="/favicon.ico"
            alt="Logo"
            className="w-10 h-10 rounded-full animate-pulse [animation-duration:5s]"
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
          {/* Pipelines - Fixed with end prop */}
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            <GitBranch className="mr-3 h-5 w-5" />
            Pipelines
          </NavLink>

          {/* Activities */}
          <div>
            <button
              onClick={() => toggleMenu("activities")}
              className={`group flex items-center justify-between w-full px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                isMenuActive("/activities")
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <div className="flex items-center">
                <Calendar className="mr-3 h-5 w-5" />
                Activities
              </div>
              {expandedMenu === "activities" ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            <div
              ref={(el) => (submenuRefs.current.activities = el)}
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedMenu === "activities"
                  ? "opacity-100"
                  : "opacity-0 max-h-0"
              }`}
              style={{
                maxHeight:
                  expandedMenu === "activities"
                    ? `${submenuHeights.activities}px`
                    : "0px",
              }}
            >
              <div className="pl-8 space-y-1 mt-1">
                <NavLink
                  to="/dashboard/activities/chats"
                  className={({ isActive }) => getNavLinkClass(isActive)}
                >
                  <MessageCircle className="mr-3 h-4 w-4" />
                  Chats
                </NavLink>
                {/* <NavLink
                  to="/dashboard/activities/calls"
                  className={({ isActive }) => getNavLinkClass(isActive)}
                >
                  <Phone className="mr-3 h-4 w-4" />
                  Calls
                </NavLink> */}
                {/* <NavLink
                  to="/dashboard/activities/tasks"
                  className={({ isActive }) => getNavLinkClass(isActive)}
                >
                  <ListTodo className="mr-3 h-4 w-4" />
                  Tasks
                </NavLink> */}
                <NavLink
                  to="/dashboard/activities/meets"
                  className={({ isActive }) => getNavLinkClass(isActive)}
                >
                  <Calendar className="mr-3 h-4 w-4" />
                  Meets
                </NavLink>
              </div>
            </div>
          </div>

          {/* Lists */}
          <div>
            <button
              onClick={() => toggleMenu("lists")}
              className={`group flex items-center justify-between w-full px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                isMenuActive("/lists")
                  ?"bg-primary/10 text-primary"
                  :"text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <div className="flex items-center">
                <Users className="mr-3 h-5 w-5" />
                Lists
              </div>
              {expandedMenu === "lists" ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            <div
              ref={(el) => (submenuRefs.current.lists = el)}
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedMenu === "lists" ? "opacity-100" : "opacity-0 max-h-0"
              }`}
              style={{
                maxHeight:
                  expandedMenu === "lists"
                    ? `${submenuHeights.lists}px`
                    : "0px",
              }}
            >
              <div className="pl-8 space-y-1 mt-1">
                <NavLink
                  to="/dashboard/lists/leads"
                  end
                  className={({ isActive }) => getNavLinkClass(isActive)}
                >
                  <LayoutDashboard className="mr-3 h-4 w-4" />
                  Leads
                </NavLink>
                {/* <NavLink
                  to="/dashboard/lists/data"
                  className={({ isActive }) => getNavLinkClass(isActive)}
                >
                  <DatabaseIcon className="mr-3 h-4 w-4" />
                  Data
                </NavLink> */}
                <NavLink
                  to="/dashboard/lists/basic"
                  className={({ isActive }) => getNavLinkClass(isActive)}
                >
                  <User className="mr-3 h-4 w-4" />
                  Basic
                </NavLink>
                <NavLink
                  to="/dashboard/lists/advance"
                  className={({ isActive }) => getNavLinkClass(isActive)}
                >
                  <UserCog className="mr-3 h-4 w-4" />
                  Advance
                </NavLink>
                <NavLink
                  to="/dashboard/lists/pro"
                  className={({ isActive }) => getNavLinkClass(isActive)}
                >
                  <Award className="mr-3 h-4 w-4 text-yellow-500" />
                  Pro
                </NavLink>
              </div>
            </div>
          </div>

          {/* Campaign */}
          <div>
            <button
              onClick={() => toggleMenu("campaign")}
              className={`group flex items-center justify-between w-full px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                isMenuActive("/campaigns")
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <div className="flex items-center">
                <Megaphone className="mr-3 h-5 w-5" />
                Campaign
              </div>
              {expandedMenu === "campaign" ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            <div
              ref={(el) => (submenuRefs.current.campaign = el)}
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedMenu === "campaign"
                  ? "opacity-100"
                  : "opacity-0 max-h-0"
              }`}
              style={{
                maxHeight:
                  expandedMenu === "campaign"
                    ? `${submenuHeights.campaign}px`
                    : "0px",
              }}
            >
              <div className="pl-8 space-y-1 mt-1">
                <NavLink
                  to="/dashboard/campaigns/meta"
                  className={({ isActive }) => getNavLinkClass(isActive)}
                >
                  <Facebook className="mr-3 h-4 w-4 text-blue-600" />
                  Meta
                </NavLink>
                {/* <NavLink
                  to="/dashboard/campaigns/google"
                  className={({ isActive }) => getNavLinkClass(isActive)}
                >
                  <FcGoogle className="mr-3 h-4 w-4" />
                  Google
                </NavLink> */}
                <NavLink
                  to="/dashboard/campaigns/whatsapp"
                  className={({ isActive }) => getNavLinkClass(isActive)}
                >
                  <FaWhatsapp className="mr-3 h-4 w-4 text-green-500" />
                  WhatsApp
                </NavLink>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div>
            <button
              onClick={() => toggleMenu("analytics")}
              className={`group flex items-center justify-between w-full px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                isMenuActive("/analytics") || isMenuActive("/myservices")
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <div className="flex items-center">
                <BarChart2 className="mr-3 h-5 w-5" />
                Analytics
              </div>
              {expandedMenu === "analytics" ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            <div
              ref={(el) => (submenuRefs.current.analytics = el)}
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                expandedMenu === "analytics"
                  ? "opacity-100"
                  : "opacity-0 max-h-0"
              }`}
              style={{
                maxHeight:
                  expandedMenu === "analytics"
                    ? `${submenuHeights.analytics}px`
                    : "0px",
              }}
            >
              <div className="pl-8 space-y-1 mt-1">
                <NavLink
                  to="/dashboard/analytics"
                  className={({ isActive }) => getNavLinkClass(isActive)}
                >
                  <BarChart2 className="mr-3 h-4 w-4" />
                  All
                </NavLink>
                <NavLink
                  to="/dashboard/myservices/sgoogle"
                  className={({ isActive }) => getNavLinkClass(isActive)}
                >
                  <FcGoogle className="mr-3 h-4 w-4" />
                  Google
                </NavLink>
                <NavLink
                  to="/dashboard/myservices/smeta"
                  className={({ isActive }) => getNavLinkClass(isActive)}
                >
                  <Facebook className="mr-3 h-4 w-4 text-blue-600" />
                  Meta
                </NavLink>
                <NavLink
                  to="/dashboard/myservices/swhatsapp"
                  className={({ isActive }) => getNavLinkClass(isActive)}
                >
                  <FaWhatsapp className="mr-3 h-4 w-4 text-green-500" />
                  WhatsApp
                </NavLink>
                <NavLink
                  to="/dashboard/myservices/sweb"
                  className={({ isActive }) => getNavLinkClass(isActive)}
                >
                  <Globe className="mr-3 h-4 w-4 text-blue-500" />
                  Web
                </NavLink>
              </div>
            </div>
          </div>

          {/* Shop Now */}
          <NavLink
            to="/dashboard/shopnow"
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            <ShoppingCart className="mr-3 h-5 w-5" />
            Shop Now
          </NavLink>

          {/* My Orders */}
          <NavLink
            to="/dashboard/orders"
            className={({ isActive }) => getNavLinkClass(isActive)}
          >
            <ShoppingBag className="mr-3 h-5 w-5" />
            My Orders
          </NavLink>
        </nav>

        {/* Bottom Navigation Items */}

        {/* Footer */}
        <div className="border-border px-2 py-2 flex-shrink-0">
          <div className="mt-auto">
            <nav className=" space-y-1 border-t border-border">
              {/* Setting */}
              <NavLink
                to="/dashboard/settings"
                className={({ isActive }) => getNavLinkClass(isActive)}
              >
                <Settings className="mr-3 h-5 w-5" />
                Setting
              </NavLink>

              {/* Refer & Earn */}
              {/* <NavLink
                to="/dashboard/saveandearn"
                className={({ isActive }) => getNavLinkClass(isActive)}
              >
                <DollarSign className="mr-3 h-5 w-5 text-green-600" />
                Refer & Earn
              </NavLink> */}
            </nav>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Beta Version 2.0.1
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            (There might be few issues, kindly ignore.)
          </div>

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




