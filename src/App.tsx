// import React from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import { AuthProvider, useAuth } from "./context/AuthContext";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import Login from "./pages/Login";
// import SignUp from "./pages/SignUp";
// import Dashboard from "./pages/Dashboard";
// import Analytics from "./pages/Analytics";
// import Settings from "./pages/Settings";
// import Meta from "./pages/Campaign/Meta";
// import Google from "./pages/Campaign/Google";
// import WhatsApp from "./pages/Campaign/WhatsApp";
// import DashboardLayout from "./components/layout/DashboardLayout";
// import ServicesGoogle from "./pages/MyServices/Google";
// import ServicesMeta from "./pages/MyServices/Meta";
// import ServicesWhatsApp from "./pages/MyServices/WhatsApp";
// import Web from "./pages/MyServices/Web";
// import ServicesApp from "./pages/MyServices/App";
// import Meet from "./pages/Task/Meet";
// import Basic from "./pages/Customers/Basic";
// import Advance from "./pages/Customers/Advance";
// import Pro from "./pages/Customers/Pro";
// import NotificationPage from "./pages/Notification";
// import MeetingNotificationMonitor from "./pages/NotificationMonitor";
// import ShopNow from "./pages/ShopNow/ShopNow";
// import Chats from "./pages/Chats";
// import Database from "./pages/Database/Database";
// import Orders from "./pages/Orders/Orders";
// import SaveAndEarn from "./pages/SaveAndEarn/SaveAndEarn";
// import { CustomerTypeProvider } from "./context/CustomerTypeContext";
// import { MeetProvider } from "./context/MeetContext";
// import { NotificationProvider } from "./context/NotificationContext";

// const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
//   const { currentUser, loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (!currentUser) {
//     return <Navigate to="/login" replace />;
//   }

//   return <>{children}</>;
// };

// function App() {
//   return (
//     <AuthProvider>
//       <NotificationProvider>
//         <CustomerTypeProvider>
//           <MeetProvider>
//             <MeetingNotificationMonitor />
//             <Router>
//               <Routes>
//                 <Route path="/login" element={<Login />} />
//                 <Route path="/signup" element={<SignUp />} />

//                 <Route
//                   path="/dashboard"
//                   element={
//                     <ProtectedRoute>
//                       <DashboardLayout />
//                     </ProtectedRoute>
//                   }
//                 >
//                   <Route index element={<Dashboard />} />
//                   <Route path="analytics" element={<Analytics />} />
//                   <Route path="chats" element={<Chats />} />
//                   <Route path="settings" element={<Settings />} />
//                   <Route path="taskmeet" element={<Meet />} />
//                   <Route path="shopnow" element={<ShopNow />} />
//                   <Route path="database" element={<Database />} />
//                   <Route path="orders" element={<Orders />} />
//                   <Route path="saveandearn" element={<SaveAndEarn />} />
//                   <Route path="campaigns">
//                     <Route path="meta" element={<Meta />} />
//                     <Route path="google" element={<Google />} />
//                     <Route path="whatsapp" element={<WhatsApp />} />
//                   </Route>
//                   <Route path="customers">
//                     <Route path="basic" element={<Basic />} />
//                     <Route path="advance" element={<Advance />} />
//                     <Route path="pro" element={<Pro />} />
//                   </Route>

//                   <Route path="myservices">
//                     <Route path="sgoogle" element={<ServicesGoogle />} />
//                     <Route path="smeta" element={<ServicesMeta />} />
//                     <Route path="swhatsapp" element={<ServicesWhatsApp />} />
//                     <Route path="sweb" element={<Web />} />
//                     <Route path="sapp" element={<ServicesApp />} />
//                   </Route>
//                 </Route>
//                 <Route
//                   path="notifications"
//                   element={
//                     <ProtectedRoute>
//                       <NotificationPage />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/"
//                   element={<Navigate to="/dashboard" replace />}
//                 />
//               </Routes>
//             </Router>

//             <ToastContainer
//               position="top-right"
//               autoClose={5000}
//               hideProgressBar={false}
//               newestOnTop
//               closeOnClick
//               rtl={false}
//               pauseOnFocusLoss
//               draggable
//               pauseOnHover
//               theme="colored"
//             />
//           </MeetProvider>
//         </CustomerTypeProvider>
//       </NotificationProvider>
//     </AuthProvider>
//   );
// }

// export default App;













































// import React from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import { AuthProvider, useAuth } from "./context/AuthContext";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import Login from "./pages/Login";
// import SignUp from "./pages/SignUp";
// import Dashboard from "./pages/Dashboard";
// import Analytics from "./pages/Analytics";
// // import Settings from "./pages/Settings";
// import Settings from "./pages/Settings";
// import Meta from "./pages/Campaign/Meta";
// import Google from "./pages/Campaign/Google";
// import WhatsApp from "./pages/Campaign/WhatsApp";
// import DashboardLayout from "./components/layout/DashboardLayout";
// import ServicesGoogle from "./pages/MyServices/Google";
// import ServicesMeta from "./pages/MyServices/Meta";
// import ServicesWhatsApp from "./pages/MyServices/WhatsApp";
// import Web from "./pages/MyServices/Web";
// import ServicesApp from "./pages/MyServices/App";
// import Meet from "./pages/Task/Meet";
// import Basic from "./pages/Customers/Basic";
// import Advance from "./pages/Customers/Advance";
// import Pro from "./pages/Customers/Pro";
// import NotificationPage from "./pages/Notification";
// import MeetingNotificationMonitor from "./pages/NotificationMonitor";
// import ShopNow from "./pages/ShopNow/ShopNow";
// import Chats from "./pages/Chats";
// import Database from "./pages/Database/Database";
// import Orders from "./pages/Orders/Orders";
// import SaveAndEarn from "./pages/SaveAndEarn/SaveAndEarn";
// import { CustomerTypeProvider } from "./context/CustomerTypeContext";
// import { MeetProvider } from "./context/MeetContext";
// import { NotificationProvider } from "./context/NotificationContext";
// import Task from "./pages/Task/Task";
// import Pipelines from "./pages/Pipelines";
// import Calls from "./pages/calls";
// import LeadsPage from "../src/components/dashboard/LeadsPage"

// const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
//   const { currentUser, loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (!currentUser) {
//     return <Navigate to="/login" replace />;
//   }

//   return <>{children}</>;
// };

// function App() {
//   return (
//     <AuthProvider>
//       <NotificationProvider>
//         <CustomerTypeProvider>
//           <MeetProvider>
//             <MeetingNotificationMonitor />
//             <Router>
//               <Routes>
//                 <Route path="/login" element={<Login />} />
//                 <Route path="/signup" element={<SignUp />} />

//                 <Route
//                   path="/dashboard"
//                   element={
//                     <ProtectedRoute>
//                       <DashboardLayout />
//                     </ProtectedRoute>
//                   }
//                 >
//                   <Route index element={<Dashboard />} />
//                   <Route path="analytics" element={<Analytics />} />
                  
//                   <Route path="settings" element={<Settings />} />
                  
                  
//                   <Route path="shopnow" element={<ShopNow />} />
                  
//                   <Route path="orders" element={<Orders />} />
//                   <Route path="saveandearn" element={<SaveAndEarn />} />
//                   <Route path="pipelines" element={<Pipelines />} />
                  
//                   <Route path="activities" >
//                     <Route path="chats" element={<Chats />} />
//                     <Route path="calls" element={<Calls />} />
//                     <Route path="tasks" element={<Task />} />
//                     <Route path="meets" element={<Meet />} />
//                   </Route>
//                   <Route path="campaigns">
//                     <Route path="meta" element={<Meta />} />
//                     <Route path="google" element={<Google />} />
//                     <Route path="whatsapp" element={<WhatsApp />} />
//                   </Route>
//                   <Route path="lists">
//                     <Route path="basic" element={<Basic />} />
//                     <Route path="advance" element={<Advance />} />
//                     <Route path="pro" element={<Pro />} />
//                     <Route path="data" element={<Database />} />
//                     <Route path="leads" element={<LeadsPage />} />
//                   </Route>

//                   <Route path="myservices">
//                     <Route path="sgoogle" element={<ServicesGoogle />} />
//                     <Route path="smeta" element={<ServicesMeta />} />
//                     <Route path="swhatsapp" element={<ServicesWhatsApp />} />
//                     <Route path="sweb" element={<Web />} />
//                     <Route path="sapp" element={<ServicesApp />} />
//                   </Route>
//                 </Route>
//                 <Route
//                   path="notifications"
//                   element={
//                     <ProtectedRoute>
//                       <NotificationPage />
//                     </ProtectedRoute>
//                   }
//                 />
//                 <Route
//                   path="/"
//                   element={<Navigate to="/dashboard" replace />}
//                 />
//               </Routes>
//             </Router>

//             <ToastContainer
//               position="top-right"
//               autoClose={5000}
//               hideProgressBar={false}
//               newestOnTop
//               closeOnClick
//               rtl={false}
//               pauseOnFocusLoss
//               draggable
//               pauseOnHover
//               theme="colored"
//             />
//           </MeetProvider>
//         </CustomerTypeProvider>
//       </NotificationProvider>
//     </AuthProvider>
//   );
// }

// export default App;































import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Onboarding from "./components/auth/Onboarding";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Meta from "./pages/Campaign/Meta";
import Google from "./pages/Campaign/Google";
import WhatsApp from "./pages/Campaign/WhatsApp";
import DashboardLayout from "./components/layout/DashboardLayout";
import ServicesGoogle from "./pages/MyServices/Google";
import ServicesMeta from "./pages/MyServices/Meta";
import ServicesWhatsApp from "./pages/MyServices/WhatsApp";
import Web from "./pages/MyServices/Web";
import ServicesApp from "./pages/MyServices/App";
import Meet from "./pages/Task/Meet";
import Basic from "./pages/Customers/Basic";
import Advance from "./pages/Customers/Advance";
import Pro from "./pages/Customers/Pro";
import NotificationPage from "./pages/Notification";
import MeetingNotificationMonitor from "./pages/NotificationMonitor";
import ShopNow from "./pages/ShopNow/ShopNow";
import Chats from "./pages/Chats";
import Database from "./pages/Database/Database";
import Orders from "./pages/Orders/Orders";
import SaveAndEarn from "./pages/SaveAndEarn/SaveAndEarn";
import { CustomerTypeProvider } from "./context/CustomerTypeContext";
import { MeetProvider } from "./context/MeetContext";
import { NotificationProvider } from "./context/NotificationContext";
import { useWABASync } from "./services/Hooks/useLeadSync";
import { GoogleOAuthProvider } from '@react-oauth/google';

// Replace this with your actual client ID
const GOOGLE_CLIENT_ID = "655518493333-pi8nosro0gd9jsn8c2lbdj20689eipcg.apps.googleusercontent.com";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading, onboardingComplete } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!onboardingComplete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (onboardingComplete && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  useWABASync();

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <NotificationProvider>
          <CustomerTypeProvider>
            <MeetProvider>
              <MeetingNotificationMonitor />
              <Router>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/onboarding" element={
                    <ProtectedRoute>
                      <Onboarding />
                    </ProtectedRoute>
                  } />

                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Dashboard />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="chats" element={<Chats />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="taskmeet" element={<Meet />} />
                    <Route path="shopnow" element={<ShopNow />} />
                    <Route path="database" element={<Database />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="saveandearn" element={<SaveAndEarn />} />
                    <Route path="campaigns">
                      <Route path="meta" element={<Meta />} />
                      <Route path="google" element={<Google />} />
                      <Route path="whatsapp" element={<WhatsApp />} />
                    </Route>
                    <Route path="customers">
                      <Route path="basic" element={<Basic />} />
                      <Route path="advance" element={<Advance />} />
                      <Route path="pro" element={<Pro />} />
                    </Route>

                    <Route path="myservices">
                      <Route path="sgoogle" element={<ServicesGoogle />} />
                      <Route path="smeta" element={<ServicesMeta />} />
                      <Route path="swhatsapp" element={<ServicesWhatsApp />} />
                      <Route path="sweb" element={<Web />} />
                      <Route path="sapp" element={<ServicesApp />} />
                    </Route>
                  </Route>
                  <Route
                    path="notifications"
                    element={
                      <ProtectedRoute>
                        <NotificationPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                  />
                </Routes>
              </Router>

              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
              />
            </MeetProvider>
          </CustomerTypeProvider>
        </NotificationProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;






