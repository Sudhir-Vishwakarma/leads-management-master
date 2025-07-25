// // Extend the Window interface to include fbAsyncInit for Facebook SDK
// declare global {
//   interface Window {
//     fbAsyncInit?: () => void;
//     FB: any;
//     gapi: any;
//     initMap?: () => void;
//     google: typeof google;
//   }
// }

// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { doc, setDoc } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
// import app, { firestore } from "../../config/firebase";
// import { useNavigate } from "react-router-dom";
// import {
//   ArrowRight,
//   ArrowLeft,
//   Building,
//   MapPin,
//   User,
//   Upload,
//   FileText,
//   Check,
//   X,
//   Loader2,
//   CheckCircle,
//   AlertCircle,
// } from "lucide-react";
// import { FaGoogle, FaFacebook, FaWhatsapp } from "react-icons/fa";
// import { useAuth } from "../../context/AuthContext";
// import { useGoogleLogin } from "@react-oauth/google";

// // Industry-specific questions and keywords
// const industryData = {
//   Insurance: {
//     questions: [
//       "What type of insurance are you interested in?",
//       "What's your current coverage amount?",
//       "Have you filed any claims in the last 5 years?",
//       "What's your primary reason for seeking insurance?",
//       "Do you have any pre-existing medical conditions?",
//       "What's your preferred deductible amount?",
//       "Are you looking for individual or family coverage?",
//       "What's your annual income range?",
//       "Do you own any high-value assets?",
//       "What's your risk tolerance level?",
//     ],
//     keywords: [
//       "Term Life",
//       "Health Coverage",
//       "Auto Insurance",
//       "Homeowners",
//       "Liability",
//       "Premium",
//       "Deductible",
//       "Claim Process",
//       "Renewal",
//       "Risk Assessment",
//     ],
//   },
//   Loan: {
//     questions: [
//       "What type of loan are you seeking?",
//       "What's the desired loan amount?",
//       "What's your credit score range?",
//       "What's your employment status?",
//       "What's your annual income?",
//       "Do you have any existing debts?",
//       "What's the purpose of the loan?",
//       "What loan term are you looking for?",
//       "Do you have collateral to offer?",
//       "Have you declared bankruptcy in the last 7 years?",
//     ],
//     keywords: [
//       "Personal Loan",
//       "Mortgage",
//       "Business Loan",
//       "Interest Rate",
//       "EMI",
//       "Credit Score",
//       "Collateral",
//       "Pre-approval",
//       "Refinance",
//       "Debt Consolidation",
//     ],
//   },
//   "Real Estate": {
//     questions: [
//       "What type of property are you looking for?",
//       "What's your budget range?",
//       "What's your preferred location?",
//       "Do you need financing assistance?",
//       "What's your timeline for purchasing?",
//       "What are your must-have features?",
//       "Are you working with another agent?",
//       "What's your preferred property size?",
//       "Do you have any specific amenities requirements?",
//       "Are you interested in investment properties?",
//     ],
//     keywords: [
//       "Residential",
//       "Commercial",
//       "Lease",
//       "Brokerage",
//       "Property Management",
//       "Appraisal",
//       "Closing",
//       "Down Payment",
//       "Listing",
//       "Market Analysis",
//     ],
//   },
//   Education: {
//     questions: [
//       "What level of education are you seeking?",
//       "What's your field of interest?",
//       "What's your preferred learning format?",
//       "What's your budget for education?",
//       "Do you need financial aid?",
//       "What's your timeline for enrollment?",
//       "Do you have any prior qualifications?",
//       "What are your career goals?",
//       "Do you require accommodation services?",
//       "Are you interested in international programs?",
//     ],
//     keywords: [
//       "Online Courses",
//       "Certification",
//       "Vocational Training",
//       "Higher Education",
//       "Scholarships",
//       "Admissions",
//       "Curriculum",
//       "Faculty",
//       "Accreditation",
//       "Placement",
//     ],
//   },
//   "HR Agency": {
//     questions: [
//       "What type of staffing needs do you have?",
//       "What industries do you recruit for?",
//       "What's your typical position level?",
//       "What's your average time-to-hire?",
//       "Do you need temporary or permanent staffing?",
//       "What's your company size?",
//       "Do you require background check services?",
//       "What's your budget per hire?",
//       "Do you need payroll management services?",
//       "What ATS systems do you use?",
//     ],
//     keywords: [
//       "Recruitment",
//       "Talent Acquisition",
//       "Executive Search",
//       "Onboarding",
//       "Payroll",
//       "Compliance",
//       "Training",
//       "Performance Management",
//       "Contract Staffing",
//       "HR Consulting",
//     ],
//   },
//   Others: {
//     questions: [
//       "What products or services do you offer?",
//       "Who is your target customer?",
//       "What's your business model?",
//       "How do you generate leads currently?",
//       "What's your average deal size?",
//       "What are your primary business goals?",
//       "Do you have any specific requirements for leads?",
//       "What's your preferred method of contact?",
//       "What industries do you primarily serve?",
//       "What's your company size?",
//     ],
//     keywords: [
//       "Custom Solution",
//       "General Business",
//       "B2B",
//       "B2C",
//       "Consulting",
//       "Partnership",
//       "Innovation",
//       "Growth",
//       "Diversified",
//       "Flexible",
//     ],
//   },
// };

// // Step titles for header
// const stepTitles = [
//   "Welcome",
//   "Select Your Industry",
//   "Connect Your Accounts",
//   "Personal Details",
//   "Upload Documents",
//   "Leads Qualifier",
// ];

// const Onboarding = () => {
//   const [step, setStep] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [progress, setProgress] = useState(16);
//   const { currentUser, refreshOnboardingStatus } = useAuth();
//   const navigate = useNavigate();

//   // Initialize Firebase Storage
//   const storage = getStorage(app);

//   // Form state
//   const [industry, setIndustry] = useState("");
//   const [userDetails, setUserDetails] = useState({
//     profilePic: null as File | null,
//     fullName: "",
//     userName: "",
//     phone: currentUser?.phoneNumber || "",
//     phoneWithoutWhatsApp: "",
//     email: "",
//     dateOfBirth: "",
//     gender: "",
//     location: {
//       address: "",
//       lat: 0,
//       lng: 0,
//     },
//   });
//   const [documents, setDocuments] = useState({
//     udyam: [] as File[],
//     businessProofs: [] as File[],
//   });
//   const [leadsData, setLeadsData] = useState({
//     selectedQuestions: [] as string[],
//     location: "",
//     selectedKeywords: [] as string[],
//     usp: "",
//   });
//   const [connections, setConnections] = useState({
//     google: false,
//     meta: false,
//     whatsapp: false,
//   });

//   // Google connection states
//   const [googleLoading, setGoogleLoading] = useState(false);
//   const [googleStatusMessage, setGoogleStatusMessage] = useState("");
//   const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(
//     null
//   );

//   // WhatsApp Business Account details
//   const [whatsappBusinessAccount, setWhatsappBusinessAccount] = useState<{
//     phoneNumberId?: string;
//     wabaId?: string;
//   }>({});

//   // Meta SDK states
//   const [metaSdkReady, setMetaSdkReady] = useState(false);
//   const [metaLoginStatus, setMetaLoginStatus] = useState<
//     "idle" | "processing" | "success" | "error"
//   >("idle");
//   const [metaStatusMessage, setMetaStatusMessage] = useState("");

//   // WhatsApp SDK states
//   const [whatsappStatus, setWhatsappStatus] = useState<
//     "idle" | "processing" | "success" | "error" | "cancelled"
//   >("idle");
//   const [whatsappStatusMessage, setWhatsappStatusMessage] = useState("");

//   // Google Maps states
//   const mapRef = useRef<HTMLDivElement>(null);
//   const [map, setMap] = useState<google.maps.Map | null>(null);
//   const [marker, setMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
//   const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
//   const [mapLoading, setMapLoading] = useState(false);
//   const [mapError, setMapError] = useState("");
//   const mapScriptLoaded = useRef(false);

//   // New states for partner access
//   const [pages, setPages] = useState<Array<{ id: string; name: string; access_token: string }>>([]);
//   const [selectedPage, setSelectedPage] = useState<{ id: string; access_token: string } | null>(null);
//   const [grantingAccess, setGrantingAccess] = useState(false);
//   const [accessStatus, setAccessStatus] = useState('');


//   // Initialize Facebook SDK
//   useEffect(() => {
//     const initFacebookSdk = () => {
//       // Check if SDK is already loaded
//       if (window.FB) {
//         setMetaSdkReady(true);
//         return;
//       }

//       window.fbAsyncInit = function () {
//         window.FB.init({
//           appId: "2446058352452818",
//           cookie: true,
//           xfbml: true,
//           version: "v22.0",
//         });
//         setMetaSdkReady(true);
//       };

//       // Load SDK only once
//       if (!document.getElementById("facebook-jssdk")) {
//         const script = document.createElement("script");
//         script.id = "facebook-jssdk";
//         script.src = "https://connect.facebook.net/en_US/sdk.js";
//         script.async = true;
//         script.defer = true;
//         script.onerror = () => {
//           setError("Failed to load Meta SDK. Please try again.");
//           setMetaSdkReady(false);
//         };
//         document.body.appendChild(script);
//       }
//     };

//     initFacebookSdk();
//   }, []);

//   // Initialize Google Maps - Fixed implementation
//   useEffect(() => {
//     if (step !== 4) return;
//     if (!mapRef.current) return;

//     let isMounted = true;
//     let geolocationWatchId: number | null = null;

//     const initMap = () => {
//       setMapLoading(true);
//       setMapError("");

//       const defaultCenter = new google.maps.LatLng(28.6139, 77.2090);
      
//       if (navigator.geolocation) {
//         geolocationWatchId = navigator.geolocation.watchPosition(
//           (position) => {
//             if (!isMounted) return;
//             const userLocation = new google.maps.LatLng(
//               position.coords.latitude,
//               position.coords.longitude
//             );
//             createMap(userLocation);
//           },
//           () => {
//             if (!isMounted) return;
//             createMap(defaultCenter);
//           },
//           { timeout: 5000 }
//         );
//       } else {
//         createMap(defaultCenter);
//       }
//     };

//     const createMap = (center: google.maps.LatLng) => {
//       try {
//         if (!mapRef.current || !isMounted) {
//           setMapLoading(false);
//           return;
//         }

//         const mapInstance = new google.maps.Map(mapRef.current, {
//           center,
//           zoom: 15,
//           mapTypeId: google.maps.MapTypeId.ROADMAP,
//           streetViewControl: false,
//           fullscreenControl: true,
//         });

//         const markerInstance = new google.maps.Marker({
//           position: center,
//           map: mapInstance,
//           draggable: true,
//           title: "Drag to set your business location",
//         });

//         const geocoderInstance = new google.maps.Geocoder();

//         updateLocation(center, geocoderInstance);

//         markerInstance.addListener("dragend", () => {
//           const newPosition = markerInstance.getPosition();
//           if (newPosition) updateLocation(newPosition, geocoderInstance);
//         });

//         mapInstance.addListener("click", (e: google.maps.MapMouseEvent) => {
//           if (e.latLng) {
//             markerInstance.setPosition(e.latLng);
//             updateLocation(e.latLng, geocoderInstance);
//           }
//         });

//         setMap(mapInstance);
//         setMarker(markerInstance);
//         setGeocoder(geocoderInstance);
//         setMapLoading(false);

//         setTimeout(() => {
//           google.maps.event.trigger(mapInstance, "resize");
//         }, 100);
//       } catch (err) {
//         console.error("Map creation error:", err);
//         if (isMounted) {
//           setMapError("Failed to create map. Please try again.");
//           setMapLoading(false);
//         }
//       }
//     };

//     const updateLocation = (
//       location: google.maps.LatLng,
//       geocoder: google.maps.Geocoder
//     ) => {
//       if (!isMounted) return;
//       geocoder.geocode({ location }, (results, status) => {
//         if (!isMounted) return;
//         if (status === "OK" && results?.[0]) {
//           const address = results[0].formatted_address;
//           setUserDetails((prev) => ({
//             ...prev,
//             location: {
//               address,
//               lat: location.lat(),
//               lng: location.lng(),
//             },
//           }));
//         } else {
//           setMapError("Could not find address for this location");
//         }
//       });
//     };

//     const loadScript = () => {
//       const script = document.createElement("script");
//       script.src = `https://maps.googleapis.com/maps/api/js?key=${
//         import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY
//       }`;
//       script.async = true;
//       script.defer = true;
//       script.onload = () => {
//         if (!isMounted) return;
//         mapScriptLoaded.current = true;
//         if (window.google && window.google.maps) {
//           initMap();
//         } else {
//           setMapError("Failed to load Google Maps. Please try again.");
//           setMapLoading(false);
//         }
//       };
//       script.onerror = () => {
//         if (!isMounted) return;
//         setMapError("Failed to load Google Maps. Please try again.");
//         setMapLoading(false);
//       };
//       document.head.appendChild(script);
//     };

//     if (mapScriptLoaded.current) {
//       initMap();
//     } else if (window.google && window.google.maps) {
//       mapScriptLoaded.current = true;
//       initMap();
//     } else {
//       loadScript();
//     }

//     return () => {
//       isMounted = false;
//       if (geolocationWatchId !== null) {
//         navigator.geolocation.clearWatch(geolocationWatchId);
//       }
//       if (marker) {
//         marker.setMap(null);
//       }
//     };
//   }, [step]);

//   // Add WhatsApp message listener
//   useEffect(() => {
//     const handleWhatsAppMessage = (event: MessageEvent) => {
//       if (
//         event.origin !== "https://www.facebook.com" &&
//         event.origin !== "https://web.facebook.com"
//       ) {
//         return;
//       }

//       try {
//         const data = JSON.parse(event.data);
//         if (data.type === "WA_EMBEDDED_SIGNUP") {
//           if (data.event === "FINISH") {
//             const { phone_number_id, waba_id } = data.data;
//             setWhatsappBusinessAccount({
//               phoneNumberId: phone_number_id,
//               wabaId: waba_id,
//             });
//             setConnections((prev) => ({ ...prev, whatsapp: true }));
//             setWhatsappStatus("success");
//             setWhatsappStatusMessage(
//               "WhatsApp business account connected successfully"
//             );
//           } else if (data.event === "CANCEL") {
//             const { current_step } = data.data;
//             setWhatsappStatus("cancelled");
//             setWhatsappStatusMessage(`Cancelled at step ${current_step}`);
//           } else if (data.event === "ERROR") {
//             const { error_message } = data.data;
//             setWhatsappStatus("error");
//             setWhatsappStatusMessage(error_message || "Unknown error occurred");
//           }
//         }
//       } catch {
//         console.log("Non JSON Responses", event.data);
//       }
//     };

//     window.addEventListener("message", handleWhatsAppMessage);
//     return () => window.removeEventListener("message", handleWhatsAppMessage);
//   }, []);

//   // Handle Google Sign-In
//   const handleGoogleConnect = useGoogleLogin({
//     scope: "https://www.googleapis.com/auth/business.manage",
//     onSuccess: (tokenResponse) => {
//       const accessToken = tokenResponse.access_token;

//       // Save access token and update UI
//       setGoogleAccessToken(accessToken);
//       setConnections((prev) => ({ ...prev, google: true }));
//       setGoogleStatusMessage("Google connected successfully!");
//     },
//     onError: (errorResponse) => {
//       console.error("Google sign-in error", errorResponse);
//       setGoogleStatusMessage("Google connection failed or canceled");
//     },
//   });

//   // Get Google status icon
//   const getGoogleStatusIcon = () => {
//     if (googleLoading) {
//       return <Loader2 className="w-5 h-5 animate-spin" />;
//     }
//     return (
//       <FaGoogle
//         size={32}
//         className={connections.google ? "text-green-600" : "text-gray-500"}
//       />
//     );
//   };

//   // // Handle Meta login
//   // const handleMetaLogin = useCallback(() => {
//   //   setMetaLoginStatus("processing");
//   //   setMetaStatusMessage("Connecting to Meta...");

//   //   window.FB.login(
//   //     (response: {
//   //       authResponse?: {
//   //         accessToken: string;
//   //         expiresIn: number;
//   //         signedRequest: string;
//   //         userID: string;
//   //         grantedScopes?: string;
//   //       };
//   //       status?: string;
//   //     }) => {
//   //       if (response.authResponse) {
//   //         setMetaLoginStatus("success");
//   //         setMetaStatusMessage("Connected to Meta!");
//   //         setConnections((prev) => ({ ...prev, meta: true }));

//   //         // Get user info
//   //         interface FBUserPictureData {
//   //           url?: string;
//   //         }

//   //         interface FBUserPicture {
//   //           data?: FBUserPictureData;
//   //         }

//   //         interface FBUserResponse {
//   //           name?: string;
//   //           email?: string;
//   //           picture?: FBUserPicture;
//   //           error?: any;
//   //         }

//   //         window.FB.api(
//   //           "/me",
//   //           { fields: "name,email,picture" },
//   //           (userResponse: FBUserResponse) => {
//   //             if (userResponse && !userResponse.error) {
//   //               setUserDetails((prev) => ({
//   //                 ...prev,
//   //                 fullName: userResponse.name || prev.fullName,
//   //                 email: userResponse.email || prev.email,
//   //                 ...(userResponse.picture?.data?.url && {
//   //                   profilePicUrl: userResponse.picture.data.url,
//   //                 }),
//   //               }));
//   //             }
//   //           }
//   //         );
//   //       } else {
//   //         setMetaLoginStatus("error");
//   //         setMetaStatusMessage("Meta connection failed or canceled");
//   //         setConnections((prev) => ({ ...prev, meta: false }));
//   //       }
//   //     },
//   //     {
//   //       scope:
//   //         "public_profile,email,pages_show_list,pages_read_engagement,leads_retrieval",
//   //       return_scopes: true,
//   //     }
//   //   );
//   // }, []);
//   // Handle Meta login - Updated to fetch pages
//   const handleMetaLogin = useCallback(() => {
//     setMetaLoginStatus("processing");
//     setMetaStatusMessage("Connecting to Meta...");

//     window.FB.login(
//       (response: {
//         authResponse?: {
//           accessToken: string;
//           expiresIn: number;
//           signedRequest: string;
//           userID: string;
//           grantedScopes?: string;
//         };
//         status?: string;
//       }) => {
//         if (response.authResponse) {
//           const userAccessToken = response.authResponse.accessToken;
          
//           setMetaLoginStatus("success");
//           setMetaStatusMessage("Connected to Meta!");
//           setConnections((prev) => ({ ...prev, meta: true }));

//           // Get user info
//           interface FBUserPictureData {
//             url?: string;
//           }

//           interface FBUserPicture {
//             data?: FBUserPictureData;
//           }

//           interface FBUserResponse {
//             name?: string;
//             email?: string;
//             picture?: FBUserPicture;
//             error?: any;
//           }

//           window.FB.api(
//             "/me",
//             { fields: "name,email,picture" },
//             (userResponse: FBUserResponse) => {
//               if (userResponse && !userResponse.error) {
//                 setUserDetails((prev) => ({
//                   ...prev,
//                   fullName: userResponse.name || prev.fullName,
//                   email: userResponse.email || prev.email,
//                   ...(userResponse.picture?.data?.url && {
//                     profilePicUrl: userResponse.picture.data.url,
//                   }),
//                 }));
//               }
//             }
//           );

//           // Fetch user's pages after successful login
//           window.FB.api(
//             "/me/accounts",
//             { access_token: userAccessToken },
//             (pagesResponse: { data?: Array<{ id: string; name: string; access_token: string }>; error?: any }) => {
//               if (pagesResponse.data) {
//                 setPages(pagesResponse.data);
//                 if (pagesResponse.data.length > 0) {
//                   setSelectedPage({
//                     id: pagesResponse.data[0].id,
//                     access_token: pagesResponse.data[0].access_token
//                   });
//                 }
//               } else if (pagesResponse.error) {
//                 console.error("Error fetching pages:", pagesResponse.error);
//                 setMetaStatusMessage("Connected but failed to fetch pages");
//               }
//             }
//           );
//         } else {
//           setMetaLoginStatus("error");
//           setMetaStatusMessage("Meta connection failed or canceled");
//           setConnections((prev) => ({ ...prev, meta: false }));
//         }
//       },
//       {
//         scope:
//           "public_profile,email,pages_show_list,pages_read_engagement,leads_retrieval,business_management",
//         return_scopes: true,
//       }
//     );
//   }, []);

//   // Grant partner access to selected page
//   const grantPartnerAccess = useCallback(async () => {
//     if (!selectedPage) {
//       setAccessStatus("No page selected");
//       return;
//     }

//     setGrantingAccess(true);
//     setAccessStatus("Granting partner access...");

//     try {
//       const formData = new URLSearchParams();
//       formData.append("business", "949040750500917");
//       formData.append("permitted_tasks", JSON.stringify(['MANAGE', 'ADVERTISE', 'ANALYZE']));

//       const response = await fetch(
//         `https://graph.facebook.com/v22.0/${selectedPage.id}/agencies`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${selectedPage.access_token}`,
//           },
//           body: formData,
//         }
//       );

//       const data = await response.json();

//       if (data.success) {
//         setAccessStatus("Partner access granted successfully!");
//         // Update connections to mark partner access as completed
//         setConnections(prev => ({
//           ...prev,
//           meta: true
//         }));
//       } else {
//         setAccessStatus(`Error: ${data.error?.message || "Unknown error"}`);
//       }
//     } catch (error) {
//       console.error("Partner access error:", error);
//       setAccessStatus("Failed to grant partner access. Please try again.");
//     } finally {
//       setGrantingAccess(false);
//     }
//   }, [selectedPage]);


//   // Launch WhatsApp Embedded Signup
//   const launchWhatsAppSignup = useCallback(() => {
//     if (!metaSdkReady) {
//       setError("Facebook SDK is not ready yet");
//       return;
//     }

//     setWhatsappStatus("processing");
//     setWhatsappStatusMessage("Launching WhatsApp signup...");

//     interface FBLoginResponse {
//       authResponse?: {
//         accessToken: string;
//         expiresIn: number;
//         signedRequest: string;
//         userID: string;
//         grantedScopes?: string;
//       };
//       status?: string;
//     }

//     interface FBLoginExtras {
//       setup: { payment_method: boolean };
//       featureType: string;
//       sessionInfoVersion: string;
//     }

//     interface FBLoginOptions {
//       config_id: string;
//       response_type: string;
//       scope: string;
//       override_default_response_type: boolean;
//       extras: FBLoginExtras;
//     }

//     window.FB.login(
//       (response: FBLoginResponse) => {
//         if (!response.authResponse) {
//           setWhatsappStatus("error");
//           setWhatsappStatusMessage("User cancelled the login");
//         }
//       },
//       {
//         config_id: "643657128126546",
//         response_type: "code",
//         scope: "business_management,whatsapp_business_management",
//         override_default_response_type: true,
//         extras: {
//           setup: { payment_method: true },
//           featureType: "embedded_signup",
//           sessionInfoVersion: "2",
//         },
//       } as FBLoginOptions
//     );
//   }, [metaSdkReady]);

//   // Get WhatsApp status icon
//   const getWhatsAppStatusIcon = () => {
//     switch (whatsappStatus) {
//       case "processing":
//         return <Loader2 className="w-5 h-5 animate-spin" />;
//       case "success":
//         return <CheckCircle className="w-5 h-5 text-green-500" />;
//       case "error":
//       case "cancelled":
//         return <AlertCircle className="w-5 h-5 text-red-500" />;
//       default:
//         return (
//           <FaWhatsapp
//             size={32}
//             className={
//               connections.whatsapp ? "text-green-600" : "text-gray-500"
//             }
//           />
//         );
//     }
//   };

//   // Update progress bar on step change
//   useEffect(() => {
//     setProgress(Math.round((step / 6) * 100));
//   }, [step]);

//   // Handle file uploads
//   const handleFileUpload = (
//     e: React.ChangeEvent<HTMLInputElement>,
//     type: "udyam" | "businessProofs"
//   ) => {
//     if (e.target.files) {
//       const files = Array.from(e.target.files);
//       setDocuments((prev) => ({
//         ...prev,
//         [type]: [...prev[type], ...files],
//       }));
//     }
//   };

//   // Remove uploaded file
//   const removeFile = (index: number, type: "udyam" | "businessProofs") => {
//     setDocuments((prev) => ({
//       ...prev,
//       [type]: prev[type].filter((_, i) => i !== index),
//     }));
//   };

//   // Toggle selection for questions and keywords
//   const toggleSelection = (item: string, type: "questions" | "keywords") => {
//     const selectedArray =
//       type === "questions"
//         ? leadsData.selectedQuestions
//         : leadsData.selectedKeywords;

//     const setSelected =
//       type === "questions"
//         ? (items: string[]) =>
//             setLeadsData((prev) => ({ ...prev, selectedQuestions: items }))
//         : (items: string[]) =>
//             setLeadsData((prev) => ({ ...prev, selectedKeywords: items }));

//     if (selectedArray.includes(item)) {
//       setSelected(selectedArray.filter((i) => i !== item));
//     } else {
//       if (selectedArray.length < 3) {
//         setSelected([...selectedArray, item]);
//       }
//     }
//   };

//   // Validate current step before proceeding
//   const validateStep = () => {
//     switch (step) {
//       case 1:
//         return true;
//       case 2:
//         if (!industry) {
//           setError("Please select an industry");
//           return false;
//         }
//         return true;
//       case 3:
//         return true;
//       case 4:
//         if (
//           !userDetails.fullName ||
//           !userDetails.userName ||
//           !userDetails.email ||
//           !userDetails.location.address
//         ) {
//           setError("Full Name, Username, Email, and Location are required");
//           return false;
//         }
//         return true;
//       case 5:
//         if (documents.udyam.length === 0) {
//           setError("Udyam certificate is required");
//           return false;
//         }
//         return true;
//       case 6:
//         return true;
//       default:
//         return true;
//     }
//   };

//   // Handle next step
//   const handleNext = () => {
//     if (validateStep()) {
//       setError("");
//       if (step < 6) {
//         setStep(step + 1);
//       } else {
//         submitOnboarding();
//       }
//     }
//   };

//   // Handle skip step
//   const handleSkip = () => {
//     setError("");
//     if (step < 6) {
//       setStep(step + 1);
//     } else {
//       submitOnboarding();
//     }
//   };

//   // Handle previous step
//   const handleBack = () => {
//     setError("");
//     if (step > 1) {
//       setStep(step - 1);
//     }
//   };

//   // Upload files to Firebase Storage
//   const uploadFiles = async (files: File[], path: string) => {
//     const urls = [];
//     for (const file of files) {
//       const timestamp = Date.now();
//       const fileExtension = file.name.split(".").pop();
//       const uniqueFilename = `${timestamp}.${fileExtension}`;

//       const storageRef = ref(storage, `${path}/${uniqueFilename}`);
//       await uploadBytes(storageRef, file);
//       const url = await getDownloadURL(storageRef);
//       urls.push(url);
//     }
//     return urls;
//   };

//   // Final submission
//   const submitOnboarding = async () => {
//     setLoading(true);
//     setError("");

//     try {
//       if (!currentUser?.phoneNumber) throw new Error("User not authenticated");

//       const cleanPhone = currentUser.phoneNumber.replace(/\D/g, "");

//       // Upload profile picture
//       let profilePicUrl = "";
//       if (userDetails.profilePic) {
//         const storageRef = ref(
//           storage,
//           `profile_pics/${cleanPhone}/${Date.now()}`
//         );
//         await uploadBytes(storageRef, userDetails.profilePic);
//         profilePicUrl = await getDownloadURL(storageRef);
//       }

//       // Upload documents
//       const udyamUrls = await uploadFiles(
//         documents.udyam,
//         `documents/${cleanPhone}/udyam`
//       );
//       const businessProofUrls = await uploadFiles(
//         documents.businessProofs,
//         `documents/${cleanPhone}/business_proofs`
//       );

//       // Prepare user data
//       const userData = {
//         industry,
//         connections: {
//           ...connections,
//           whatsapp: {
//             connected: connections.whatsapp,
//             ...whatsappBusinessAccount,
//           },
//         },
//         userDetails: {
//           ...userDetails,
//           profilePic: profilePicUrl,
//         },
//         documents: {
//           udyam: udyamUrls,
//           businessProofs: businessProofUrls,
//         },
//         leadsData: {
//           ...leadsData,
//           industryQuestions:
//             industryData[industry as keyof typeof industryData]?.questions ||
//             [],
//           industryKeywords:
//             industryData[industry as keyof typeof industryData]?.keywords || [],
//         },
//         completed: true,
//         createdAt: new Date(),
//       };

//       // Save to Firestore
//       const userRef = doc(firestore, "crm_users", cleanPhone);
//       const onboardingRef = doc(userRef, "Onboarding", "onboardingData");

//       // Store Google access token in main user document
//       if (googleAccessToken) {
//         await setDoc(
//           userRef,
//           { google_access_token: googleAccessToken },
//           { merge: true }
//         );
//       }

//       await setDoc(onboardingRef, userData);

//       // Refresh onboarding status
//       if (refreshOnboardingStatus) {
//         await refreshOnboardingStatus();
//       }

//       navigate("/dashboard");
//     } catch (err) {
//       console.error("Onboarding error:", err);
//       setError(
//         `Failed to complete onboarding: ${
//           (err as Error).message || "Please try again."
//         }`
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Render current step
//   const renderStep = () => {
//     switch (step) {
//       case 1:
//         return (
//           <div className="text-center">
//             <div className="flex justify-center mb-6">
//               <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white">
//                 <Building size={48} />
//               </div>
//             </div>
//             <h1 className="text-3xl font-bold text-gray-800 mb-4">
//               Welcome to STARZ Ai CRM
//             </h1>
//             <p className="text-gray-600 mb-8 max-w-md mx-auto">
//               Get started with the most powerful CRM solution tailored for your
//               business. Complete your onboarding to unlock all features.
//             </p>
//           </div>
//         );

//       case 2:
//         return (
//           <div className="space-y-6">
//             <p className="text-gray-600 mb-6">
//               Choose the industry that best describes your business
//             </p>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               {Object.keys(industryData).map((ind) => (
//                 <button
//                   key={ind}
//                   className={`p-4 rounded-lg border-2 text-left transition-all ${
//                     industry === ind
//                       ? "border-blue-600 bg-blue-50"
//                       : "border-gray-200 hover:border-blue-300"
//                   }`}
//                   onClick={() => setIndustry(ind)}
//                 >
//                   <div className="font-medium text-gray-800">{ind}</div>
//                 </button>
//               ))}
//             </div>
//           </div>
//         );

//       case 3:
//         return (
//           <div className="space-y-8">
//             <p className="text-gray-600">
//               Connect your business accounts to enable seamless integration and
//               data synchronization
//             </p>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {/* Google Connection */}
//               <div
//                 className={`border-2 rounded-xl p-6 text-center transition-all ${
//                   connections.google
//                     ? "border-green-500 bg-green-50"
//                     : "border-gray-200 hover:border-blue-300"
//                 }`}
//               >
//                 <div className="flex justify-center mb-4">
//                   <div
//                     className={`w-16 h-16 rounded-full flex items-center justify-center ${
//                       connections.google ? "bg-green-100" : "bg-gray-100"
//                     }`}
//                   >
//                     {getGoogleStatusIcon()}
//                   </div>
//                 </div>
//                 <h3 className="text-lg font-medium text-gray-800 mb-2">
//                   Google Account
//                 </h3>
//                 <p className="text-sm text-gray-600 mb-4">
//                   Connect your Google account for email, calendar, and contacts
//                 </p>
//                 {googleLoading ? (
//                   <div className="text-center py-2">
//                     <p className="text-sm text-gray-600">
//                       {googleStatusMessage}
//                     </p>
//                   </div>
//                 ) : (
//                   <button
//                     type="button"
//                     className={`px-4 py-2 rounded-lg ${
//                       connections.google
//                         ? "bg-green-100 text-green-700 hover:bg-green-200"
//                         : "bg-blue-600 text-white hover:bg-blue-700"
//                     } transition`}
//                     onClick={() => handleGoogleConnect()}
//                     disabled={googleLoading}
//                   >
//                     {connections.google ? "Connected ✓" : "Connect Google"}
//                   </button>
//                 )}
//               </div>

//               {/* Meta Connection */}
//               <div
//                 className={`border-2 rounded-xl p-6 text-center transition-all ${
//                   connections.meta
//                     ? "border-blue-500 bg-blue-50"
//                     : "border-gray-200 hover:border-blue-300"
//                 }`}
//               >
//                 <div className="flex justify-center mb-4">
//                   <div
//                     className={`w-16 h-16 rounded-full flex items-center justify-center ${
//                       connections.meta ? "bg-blue-100" : "bg-gray-100"
//                     }`}
//                   >
//                     <FaFacebook size={32} className="text-gray-500" />
//                   </div>
//                 </div>
//                 <h3 className="text-lg font-medium text-gray-800 mb-2">
//                   Facebook Account
//                 </h3>
//                 <p className="text-sm text-gray-600 mb-4">
//                   Connect your Facebook and Instagram business accounts
//                 </p>

//                 {/* {metaLoginStatus === "processing" ? (
//                   <div className="text-center py-2">
//                     <p className="text-sm text-gray-600">{metaStatusMessage}</p>
//                   </div>
//                 ) : (
//                   <button
//                     type="button"
//                     className={`px-4 py-2 rounded-lg ${
//                       connections.meta
//                         ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
//                         : "bg-blue-600 text-white hover:bg-blue-700"
//                     } transition`}
//                     onClick={handleMetaLogin}
//                     disabled={!metaSdkReady || metaLoginStatus === "processing"}
//                   >
//                     {connections.meta ? "Connected ✓" : "Connect Meta"}
//                   </button>
//                 )} */}
//                 {metaLoginStatus === "processing" ? (
//                   <div className="text-center py-2">
//                     <p className="text-sm text-gray-600">{metaStatusMessage}</p>
//                   </div>
//                 ) : connections.meta ? (
//                   <div className="space-y-4">
//                     {pages.length > 0 ? (
//                       <>
//                         <div className="text-left">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Select a Page
//                           </label>
//                           <select
//                             className="w-full p-2 border rounded"
//                             value={selectedPage?.id || ""}
//                             onChange={(e) => {
//                               const pageId = e.target.value;
//                               const page = pages.find(p => p.id === pageId);
//                               if (page) {
//                                 setSelectedPage({
//                                   id: page.id,
//                                   access_token: page.access_token
//                                 });
//                               }
//                             }}
//                           >
//                             {pages.map(page => (
//                               <option key={page.id} value={page.id}>
//                                 {page.name}
//                               </option>
//                             ))}
//                           </select>
//                         </div>
                        
//                         <button
//                           type="button"
//                           className={`w-full px-4 py-2 rounded-lg ${
//                             grantingAccess
//                               ? "bg-blue-300 cursor-not-allowed"
//                               : "bg-blue-600 hover:bg-blue-700"
//                           } text-white transition`}
//                           onClick={grantPartnerAccess}
//                           disabled={grantingAccess}
//                         >
//                           {grantingAccess ? (
//                             <span className="flex items-center justify-center">
//                               <Loader2 className="animate-spin mr-2" size={16} />
//                               Granting Access...
//                             </span>
//                           ) : (
//                             "Grant Partner Access"
//                           )}
//                         </button>
                        
//                         {accessStatus && (
//                           <p className={`text-sm ${
//                             accessStatus.includes("success") 
//                               ? "text-green-600" 
//                               : "text-red-500"
//                           }`}>
//                             {accessStatus}
//                           </p>
//                         )}
//                       </>
//                     ) : (
//                       <p className="text-sm text-gray-600">
//                         No pages found for your account
//                       </p>
//                     )}
//                   </div>
//                 ) : (
//                   <button
//                     type="button"
//                     className={`px-4 py-2 rounded-lg ${
//                       connections.meta
//                         ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
//                         : "bg-blue-600 text-white hover:bg-blue-700"
//                     } transition`}
//                     onClick={handleMetaLogin}
//                     disabled={!metaSdkReady || metaLoginStatus === "processing"}
//                   >
//                     Connect Meta
//                   </button>
//                 )}
//               </div>

//               {/* WhatsApp Connection */}
//               <div
//                 className={`border-2 rounded-xl p-6 text-center transition-all ${
//                   connections.whatsapp
//                     ? "border-green-500 bg-green-50"
//                     : "border-gray-200 hover:border-blue-300"
//                 }`}
//               >
//                 <div className="flex justify-center mb-4">
//                   <div
//                     className={`w-16 h-16 rounded-full flex items-center justify-center ${
//                       connections.whatsapp ? "bg-green-100" : "bg-gray-100"
//                     }`}
//                   >
//                     {getWhatsAppStatusIcon()}
//                   </div>
//                 </div>
//                 <h3 className="text-lg font-medium text-gray-800 mb-2">
//                   WhatsApp Business
//                 </h3>
//                 <p className="text-sm text-gray-600 mb-4">
//                   Connect your WhatsApp Business account for messaging
//                 </p>

//                 {whatsappStatus === "processing" ? (
//                   <div className="text-center py-2">
//                     <p className="text-sm text-gray-600">
//                       {whatsappStatusMessage}
//                     </p>
//                   </div>
//                 ) : (
//                   <button
//                     type="button"
//                     className={`px-4 py-2 rounded-lg ${
//                       connections.whatsapp
//                         ? "bg-green-100 text-green-700 hover:bg-green-200"
//                         : "bg-blue-600 text-white hover:bg-blue-700"
//                     } transition`}
//                     onClick={launchWhatsAppSignup}
//                     disabled={whatsappStatus === "processing"}
//                   >
//                     {connections.whatsapp ? "Connected ✓" : "Connect WhatsApp"}
//                   </button>
//                 )}

//                 {(whatsappStatus === "error" ||
//                   whatsappStatus === "cancelled") && (
//                   <p className="text-red-500 text-sm mt-2">
//                     {whatsappStatusMessage}
//                   </p>
//                 )}
//               </div>
//             </div>

//             <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
//               <p className="text-sm text-blue-700">
//                 <span className="font-medium">Note:</span> You can skip this
//                 step and connect accounts later.
//               </p>
//             </div>
//           </div>
//         );

//       case 4:
//         return (
//           <div className="space-y-6">
//             <p className="text-gray-600 mb-6">
//               Provide your personal information
//             </p>

//             <div className="space-y-6">
//               {/* Profile Picture */}
//               <div className="flex items-center space-x-6">
//                 <div className="relative">
//                   {userDetails.profilePic ? (
//                     <img
//                       src={URL.createObjectURL(userDetails.profilePic)}
//                       alt="Profile"
//                       className="w-20 h-20 rounded-full object-cover"
//                     />
//                   ) : (
//                     <div className="bg-gray-200 border-2 border-dashed rounded-full w-20 h-20 flex items-center justify-center">
//                       <User size={24} className="text-gray-400" />
//                     </div>
//                   )}
//                   <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer">
//                     <Upload size={16} />
//                     <input
//                       type="file"
//                       className="hidden"
//                       accept="image/*"
//                       onChange={(e) => {
//                         if (e.target.files?.[0]) {
//                           setUserDetails((prev) => ({
//                             ...prev,
//                             profilePic: e.target.files![0],
//                           }));
//                         }
//                       }}
//                     />
//                   </label>
//                 </div>
//                 <div>
//                   <div className="font-medium">Business Logo</div>
//                   <p className="text-sm text-gray-500">JPG, PNG (max 5MB)</p>
//                 </div>
//               </div>

//               {/* Location Map */}
//               <div className="border-t pt-6 mt-6">
//                 <h3 className="text-lg font-medium text-gray-800 mb-4">
//                   Business Location
//                 </h3>
//                 <p className="text-sm text-gray-600 mb-4">
//                   Drag the marker to your business location
//                 </p>

//                 {mapLoading ? (
//                   <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
//                     <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
//                     <p className="ml-3 text-gray-600">Loading map...</p>
//                   </div>
//                 ) : (
//                   <>
//                     <div
//                       ref={mapRef}
//                       className="w-full h-96 rounded-lg overflow-hidden border border-gray-300"
//                     />
//                     {mapError && (
//                       <p className="text-red-500 text-sm mt-2">{mapError}</p>
//                     )}
//                   </>
//                 )}

//                 {userDetails.location.address && (
//                   <div className="mt-4 p-3 bg-blue-50 rounded-lg">
//                     <p className="text-sm font-medium text-gray-700">
//                       Selected Address:
//                     </p>
//                     <p className="text-gray-900 mt-1">
//                       {userDetails.location.address}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         );

//       case 5:
//         return (
//           <div className="space-y-6">
//             <p className="text-gray-600 mb-6">
//               Please upload required documents for verification
//             </p>

//             {/* Udyam Certificate */}
//             <div className="space-y-4">
//               <div className="font-medium text-gray-800 flex items-center">
//                 Udyam Certificate *
//                 <span className="text-xs text-gray-500 ml-2">(PDF only)</span>
//               </div>

//               <label className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
//                 <div className="flex flex-col items-center justify-center">
//                   <Upload size={24} className="text-gray-400 mb-2" />
//                   <p className="text-sm text-gray-500">
//                     <span className="font-medium text-blue-600">
//                       Click to upload
//                     </span>{" "}
//                     or drag and drop
//                   </p>
//                   <p className="text-xs text-gray-500 mt-1">
//                     PDF files only (max 10MB each)
//                   </p>
//                 </div>
//                 <input
//                   type="file"
//                   className="hidden"
//                   accept="application/pdf"
//                   multiple
//                   onChange={(e) => handleFileUpload(e, "udyam")}
//                 />
//               </label>

//               {/* Uploaded files */}
//               {documents.udyam.length > 0 && (
//                 <div className="mt-4 space-y-2">
//                   {documents.udyam.map((file, index) => (
//                     <div
//                       key={index}
//                       className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
//                     >
//                       <div className="flex items-center">
//                         <FileText size={18} className="text-gray-500 mr-2" />
//                         <span className="text-sm truncate max-w-xs">
//                           {file.name}
//                         </span>
//                         <span className="text-xs text-gray-500 ml-2">
//                           {(file.size / 1024 / 1024).toFixed(2)}MB
//                         </span>
//                       </div>
//                       <button
//                         type="button"
//                         className="text-red-500 hover:text-red-700"
//                         onClick={() => removeFile(index, "udyam")}
//                       >
//                         <X size={18} />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Business Proofs */}
//             <div className="space-y-4 pt-6">
//               <div className="font-medium text-gray-800 flex items-center">
//                 Business Proofs
//                 <span className="text-xs text-gray-500 ml-2">(PDF only)</span>
//               </div>

//               <label className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
//                 <div className="flex flex-col items-center justify-center">
//                   <Upload size={24} className="text-gray-400 mb-2" />
//                   <p className="text-sm text-gray-500">
//                     <span className="font-medium text-blue-600">
//                       Click to upload
//                     </span>{" "}
//                     or drag and drop
//                   </p>
//                   <p className="text-xs text-gray-500 mt-1">
//                     PDF files only (max 10MB each)
//                   </p>
//                 </div>
//                 <input
//                   type="file"
//                   className="hidden"
//                   accept="application/pdf"
//                   multiple
//                   onChange={(e) => handleFileUpload(e, "businessProofs")}
//                 />
//               </label>

//               {/* Uploaded files */}
//               {documents.businessProofs.length > 0 && (
//                 <div className="mt-4 space-y-2">
//                   {documents.businessProofs.map((file, index) => (
//                     <div
//                       key={index}
//                       className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
//                     >
//                       <div className="flex items-center">
//                         <FileText size={18} className="text-gray-500 mr-2" />
//                         <span className="text-sm truncate max-w-xs">
//                           {file.name}
//                         </span>
//                         <span className="text-xs text-gray-500 ml-2">
//                           {(file.size / 1024 / 1024).toFixed(2)}MB
//                         </span>
//                       </div>
//                       <button
//                         type="button"
//                         className="text-red-500 hover:text-red-700"
//                         onClick={() => removeFile(index, "businessProofs")}
//                       >
//                         <X size={18} />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         );

//       case 6: {
//         const currentIndustryData =
//           industryData[industry as keyof typeof industryData];

//         return (
//           <div className="space-y-8">
//             <p className="text-gray-600 mb-6">
//               Configure your lead qualification settings for {industry} industry
//             </p>

//             {/* Industry Questions */}
//             <div>
//               <h3 className="text-lg font-medium text-gray-800 mb-4">
//                 1. Select up to 3 qualifying questions
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {currentIndustryData?.questions.map((question, index) => (
//                   <button
//                     key={index}
//                     type="button"
//                     className={`p-4 rounded-lg border text-left transition-all ${
//                       leadsData.selectedQuestions.includes(question)
//                         ? "border-blue-600 bg-blue-50"
//                         : "border-gray-200 hover:border-blue-300"
//                     } ${
//                       leadsData.selectedQuestions.length >= 3 &&
//                       !leadsData.selectedQuestions.includes(question)
//                         ? "opacity-50 cursor-not-allowed"
//                         : "cursor-pointer"
//                     }`}
//                     onClick={() => toggleSelection(question, "questions")}
//                     disabled={
//                       leadsData.selectedQuestions.length >= 3 &&
//                       !leadsData.selectedQuestions.includes(question)
//                     }
//                   >
//                     <div className="flex items-start">
//                       {leadsData.selectedQuestions.includes(question) ? (
//                         <Check
//                           className="text-blue-600 mt-0.5 mr-2 flex-shrink-0"
//                           size={18}
//                         />
//                       ) : (
//                         <div className="w-5 h-5 rounded-full border border-gray-300 mr-2 mt-0.5 flex-shrink-0" />
//                       )}
//                       <span>{question}</span>
//                     </div>
//                   </button>
//                 ))}
//               </div>
//               <p className="text-sm text-gray-500 mt-2">
//                 Selected: {leadsData.selectedQuestions.length}/3
//               </p>
//             </div>

//             {/* Location */}
//             <div className="pt-6">
//               <h3 className="text-lg font-medium text-gray-800 mb-4">
//                 2. Select Target Location
//               </h3>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <MapPin size={18} className="text-gray-400" />
//                 </div>
//                 <input
//                   type="text"
//                   value={leadsData.location}
//                   onChange={(e) =>
//                     setLeadsData((prev) => ({
//                       ...prev,
//                       location: e.target.value,
//                     }))
//                   }
//                   placeholder="Enter target location (city, state, or region)"
//                   className="pl-10 block w-full rounded-lg border px-4 py-3"
//                 />
//               </div>
//             </div>

//             {/* Keywords */}
//             <div className="pt-6">
//               <h3 className="text-lg font-medium text-gray-800 mb-4">
//                 3. Select up to 3 relevant keywords
//               </h3>
//               <div className="flex flex-wrap gap-2">
//                 {currentIndustryData?.keywords.map((keyword, index) => (
//                   <button
//                     key={index}
//                     type="button"
//                     className={`px-4 py-2 rounded-full border transition-all ${
//                       leadsData.selectedKeywords.includes(keyword)
//                         ? "border-blue-600 bg-blue-50 text-blue-700"
//                         : "border-gray-200 text-gray-700 hover:border-blue-300"
//                     } ${
//                       leadsData.selectedKeywords.length >= 3 &&
//                       !leadsData.selectedKeywords.includes(keyword)
//                         ? "opacity-50 cursor-not-allowed"
//                         : "cursor-pointer"
//                     }`}
//                     onClick={() => toggleSelection(keyword, "keywords")}
//                     disabled={
//                       leadsData.selectedKeywords.length >= 3 &&
//                       !leadsData.selectedKeywords.includes(keyword)
//                     }
//                   >
//                     {keyword}
//                   </button>
//                 ))}
//               </div>
//               <p className="text-sm text-gray-500 mt-2">
//                 Selected: {leadsData.selectedKeywords.length}/3
//               </p>
//             </div>

//             {/* USP */}
//             <div className="pt-6">
//               <h3 className="text-lg font-medium text-gray-800 mb-4">
//                 4. Your Unique Selling Proposition (USP)
//               </h3>
//               <textarea
//                 value={leadsData.usp}
//                 onChange={(e) =>
//                   setLeadsData((prev) => ({ ...prev, usp: e.target.value }))
//                 }
//                 placeholder="What makes your business unique? (Max 200 characters)"
//                 className="block w-full rounded-lg border px-4 py-3 min-h-[120px]"
//                 maxLength={200}
//               />
//               <p className="text-sm text-gray-500 text-right mt-1">
//                 {leadsData.usp.length}/200
//               </p>
//             </div>
//             </div>
//           );
//         }

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-8">
//       <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
//         {/* Progress Bar */}
//         <div className="h-2 bg-gray-200">
//           <div
//             className="h-full bg-blue-600 transition-all duration-500 ease-in-out"
//             style={{ width: `${progress}%` }}
//           ></div>
//         </div>

//         <div className="p-8">
//           {/* Step Header */}
//           <div className="mb-6">
//             <p className="text-sm text-gray-500">Step {step} of 6</p>
//             <h2 className="text-xl font-bold text-gray-800">
//               {stepTitles[step - 1]}
//             </h2>
//           </div>

//           {/* Step Content */}
//           <div className="mb-8">{renderStep()}</div>

//           {/* Error Message */}
//           {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

//           {/* Navigation Buttons */}
//           <div className="flex justify-between items-center">
//             <div>
//               {step > 1 && (
//                 <button
//                   type="button"
//                   onClick={handleBack}
//                   disabled={loading}
//                   className="flex items-center px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <ArrowLeft size={18} className="mr-2" />
//                   Back
//                 </button>
//               )}
//             </div>

//             <div className="flex items-center space-x-3">
//               {step >= 2 && step <= 6 && (
//                 <button
//                   type="button"
//                   onClick={handleSkip}
//                   disabled={loading}
//                   className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
//                 >
//                   Skip
//                 </button>
//               )}

//               <button
//                 type="button"
//                 onClick={handleNext}
//                 disabled={loading}
//                 className="flex items-center px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
//               >
//                 {step === 6 ? "Complete Setup" : "Next Step"}
//                 {step < 6 && <ArrowRight size={18} className="ml-2" />}
//                 {loading && (
//                   <svg
//                     className="animate-spin -mr-1 ml-2 h-4 w-4 text-white"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     ></circle>
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     ></path>
//                   </svg>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Onboarding;









































// Extend the Window interface to include fbAsyncInit for Facebook SDK
declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB: any;
    gapi: any;
    initMap?: () => void;
    google: typeof google;
  }
}

import React, { useState, useEffect, useCallback, useRef } from "react";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
import app, { firestore } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  Building,
  MapPin,
  User,
  Upload,
  FileText,
  Check,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { FaGoogle, FaFacebook, FaWhatsapp } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";

// Industry-specific questions and keywords
const industryData = {
  Insurance: {
    questions: [
      "What type of insurance are you interested in?",
      "What's your current coverage amount?",
      "Have you filed any claims in the last 5 years?",
      "What's your primary reason for seeking insurance?",
      "Do you have any pre-existing medical conditions?",
      "What's your preferred deductible amount?",
      "Are you looking for individual or family coverage?",
      "What's your annual income range?",
      "Do you own any high-value assets?",
      "What's your risk tolerance level?",
    ],
    keywords: [
      "Term Life",
      "Health Coverage",
      "Auto Insurance",
      "Homeowners",
      "Liability",
      "Premium",
      "Deductible",
      "Claim Process",
      "Renewal",
      "Risk Assessment",
    ],
  },
  Loan: {
    questions: [
      "What type of loan are you seeking?",
      "What's the desired loan amount?",
      "What's your credit score range?",
      "What's your employment status?",
      "What's your annual income?",
      "Do you have any existing debts?",
      "What's the purpose of the loan?",
      "What loan term are you looking for?",
      "Do you have collateral to offer?",
      "Have you declared bankruptcy in the last 7 years?",
    ],
    keywords: [
      "Personal Loan",
      "Mortgage",
      "Business Loan",
      "Interest Rate",
      "EMI",
      "Credit Score",
      "Collateral",
      "Pre-approval",
      "Refinance",
      "Debt Consolidation",
    ],
  },
  "Real Estate": {
    questions: [
      "What type of property are you looking for?",
      "What's your budget range?",
      "What's your preferred location?",
      "Do you need financing assistance?",
      "What's your timeline for purchasing?",
      "What are your must-have features?",
      "Are you working with another agent?",
      "What's your preferred property size?",
      "Do you have any specific amenities requirements?",
      "Are you interested in investment properties?",
    ],
    keywords: [
      "Residential",
      "Commercial",
      "Lease",
      "Brokerage",
      "Property Management",
      "Appraisal",
      "Closing",
      "Down Payment",
      "Listing",
      "Market Analysis",
    ],
  },
  Education: {
    questions: [
      "What level of education are you seeking?",
      "What's your field of interest?",
      "What's your preferred learning format?",
      "What's your budget for education?",
      "Do you need financial aid?",
      "What's your timeline for enrollment?",
      "Do you have any prior qualifications?",
      "What are your career goals?",
      "Do you require accommodation services?",
      "Are you interested in international programs?",
    ],
    keywords: [
      "Online Courses",
      "Certification",
      "Vocational Training",
      "Higher Education",
      "Scholarships",
      "Admissions",
      "Curriculum",
      "Faculty",
      "Accreditation",
      "Placement",
    ],
  },
  "HR Agency": {
    questions: [
      "What type of staffing needs do you have?",
      "What industries do you recruit for?",
      "What's your typical position level?",
      "What's your average time-to-hire?",
      "Do you need temporary or permanent staffing?",
      "What's your company size?",
      "Do you require background check services?",
      "What's your budget per hire?",
      "Do you need payroll management services?",
      "What ATS systems do you use?",
    ],
    keywords: [
      "Recruitment",
      "Talent Acquisition",
      "Executive Search",
      "Onboarding",
      "Payroll",
      "Compliance",
      "Training",
      "Performance Management",
      "Contract Staffing",
      "HR Consulting",
    ],
  },
  Others: {
    questions: [
      "What products or services do you offer?",
      "Who is your target customer?",
      "What's your business model?",
      "How do you generate leads currently?",
      "What's your average deal size?",
      "What are your primary business goals?",
      "Do you have any specific requirements for leads?",
      "What's your preferred method of contact?",
      "What industries do you primarily serve?",
      "What's your company size?",
    ],
    keywords: [
      "Custom Solution",
      "General Business",
      "B2B",
      "B2C",
      "Consulting",
      "Partnership",
      "Innovation",
      "Growth",
      "Diversified",
      "Flexible",
    ],
  },
};

// Step titles for header
const stepTitles = [
  "Welcome",
  "Select Your Industry",
  "Connect Your Accounts",
  "Personal Details",
  "Upload Documents",
  "Leads Qualifier",
];

// Facebook API version constant
const FB_API_VERSION = "v22.0";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(16);
  const { currentUser, refreshOnboardingStatus } = useAuth();
  const navigate = useNavigate();

  // Initialize Firebase Storage
  const storage = getStorage(app);

  // Form state
  const [industry, setIndustry] = useState("");
  const [userDetails, setUserDetails] = useState({
    profilePic: null as File | null,
    fullName: "",
    userName: "",
    phone: currentUser?.phoneNumber || "",
    phoneWithoutWhatsApp: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    location: {
      address: "",
      lat: 0,
      lng: 0,
    },
  });
  const [documents, setDocuments] = useState({
    udyam: [] as File[],
    businessProofs: [] as File[],
  });
  const [leadsData, setLeadsData] = useState({
    selectedQuestions: [] as string[],
    location: "",
    selectedKeywords: [] as string[],
    usp: "",
  });
  const [connections, setConnections] = useState({
    google: false,
    meta: false,
    whatsapp: false,
  });

  // Google connection states
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleStatusMessage, setGoogleStatusMessage] = useState("");
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(
    null
  );

  // WhatsApp Business Account details
  const [whatsappBusinessAccount, setWhatsappBusinessAccount] = useState<{
    phoneNumberId?: string;
    wabaId?: string;
  }>({});

  // Meta SDK states
  const [metaSdkReady, setMetaSdkReady] = useState(false);
  const [metaLoginStatus, setMetaLoginStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [metaStatusMessage, setMetaStatusMessage] = useState("");

  // WhatsApp SDK states
  const [whatsappStatus, setWhatsappStatus] = useState<
    "idle" | "processing" | "success" | "error" | "cancelled"
  >("idle");
  const [whatsappStatusMessage, setWhatsappStatusMessage] = useState("");

  // Google Maps states
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState("");
  const mapScriptLoaded = useRef(false);

  // New states for partner access
  const [pages, setPages] = useState<Array<{ id: string; name: string; access_token: string }>>([]);
  const [selectedPage, setSelectedPage] = useState<{ id: string; access_token: string } | null>(null);
  const [grantingAccess, setGrantingAccess] = useState(false);
  const [accessStatus, setAccessStatus] = useState('');
  const [grantedScopes, setGrantedScopes] = useState('');


  // Initialize Facebook SDK
  useEffect(() => {
    const initFacebookSdk = () => {
      // Check if SDK is already loaded
      if (window.FB) {
        setMetaSdkReady(true);
        return;
      }

      window.fbAsyncInit = function () {
        window.FB.init({
          appId: "2446058352452818",
          cookie: true,
          xfbml: true,
          version: FB_API_VERSION,
        });
        setMetaSdkReady(true);
      };

      // Load SDK only once
      if (!document.getElementById("facebook-jssdk")) {
        const script = document.createElement("script");
        script.id = "facebook-jssdk";
        script.src = "https://connect.facebook.net/en_US/sdk.js";
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          setError("Failed to load Meta SDK. Please try again.");
          setMetaSdkReady(false);
        };
        document.body.appendChild(script);
      }
    };

    initFacebookSdk();
  }, []);

  // Initialize Google Maps - Fixed implementation
  useEffect(() => {
    if (step !== 4) return;
    if (!mapRef.current) return;

    let isMounted = true;
    let geolocationWatchId: number | null = null;

    const initMap = () => {
      setMapLoading(true);
      setMapError("");

      const defaultCenter = new google.maps.LatLng(28.6139, 77.2090);
      
      if (navigator.geolocation) {
        geolocationWatchId = navigator.geolocation.watchPosition(
          (position) => {
            if (!isMounted) return;
            const userLocation = new google.maps.LatLng(
              position.coords.latitude,
              position.coords.longitude
            );
            createMap(userLocation);
          },
          () => {
            if (!isMounted) return;
            createMap(defaultCenter);
          },
          { timeout: 5000 }
        );
      } else {
        createMap(defaultCenter);
      }
    };

    const createMap = (center: google.maps.LatLng) => {
      try {
        if (!mapRef.current || !isMounted) {
          setMapLoading(false);
          return;
        }

        const mapInstance = new google.maps.Map(mapRef.current, {
          center,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          streetViewControl: false,
          fullscreenControl: true,
        });

        const markerInstance = new google.maps.Marker({
          position: center,
          map: mapInstance,
          draggable: true,
          title: "Drag to set your business location",
        });

        const geocoderInstance = new google.maps.Geocoder();

        updateLocation(center, geocoderInstance);

        markerInstance.addListener("dragend", () => {
          const newPosition = markerInstance.getPosition();
          if (newPosition) updateLocation(newPosition, geocoderInstance);
        });

        mapInstance.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            markerInstance.setPosition(e.latLng);
            updateLocation(e.latLng, geocoderInstance);
          }
        });

        setMap(mapInstance);
        setMarker(markerInstance);
        setGeocoder(geocoderInstance);
        setMapLoading(false);

        setTimeout(() => {
          google.maps.event.trigger(mapInstance, "resize");
        }, 100);
      } catch (err) {
        console.error("Map creation error:", err);
        if (isMounted) {
          setMapError("Failed to create map. Please try again.");
          setMapLoading(false);
        }
      }
    };

    const updateLocation = (
      location: google.maps.LatLng,
      geocoder: google.maps.Geocoder
    ) => {
      if (!isMounted) return;
      geocoder.geocode({ location }, (results, status) => {
        if (!isMounted) return;
        if (status === "OK" && results?.[0]) {
          const address = results[0].formatted_address;
          setUserDetails((prev) => ({
            ...prev,
            location: {
              address,
              lat: location.lat(),
              lng: location.lng(),
            },
          }));
        } else {
          setMapError("Could not find address for this location");
        }
      });
    };

    const loadScript = () => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${
        import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY
      }`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (!isMounted) return;
        mapScriptLoaded.current = true;
        if (window.google && window.google.maps) {
          initMap();
        } else {
          setMapError("Failed to load Google Maps. Please try again.");
          setMapLoading(false);
        }
      };
      script.onerror = () => {
        if (!isMounted) return;
        setMapError("Failed to load Google Maps. Please try again.");
        setMapLoading(false);
      };
      document.head.appendChild(script);
    };

    if (mapScriptLoaded.current) {
      initMap();
    } else if (window.google && window.google.maps) {
      mapScriptLoaded.current = true;
      initMap();
    } else {
      loadScript();
    }

    return () => {
      isMounted = false;
      if (geolocationWatchId !== null) {
        navigator.geolocation.clearWatch(geolocationWatchId);
      }
      if (marker) {
        marker.setMap(null);
      }
    };
  }, [step]);

  // Add WhatsApp message listener
  useEffect(() => {
    const handleWhatsAppMessage = (event: MessageEvent) => {
      if (
        event.origin !== "https://www.facebook.com" &&
        event.origin !== "https://web.facebook.com"
      ) {
        return;
      }

      try {
        const data = JSON.parse(event.data);
        if (data.type === "WA_EMBEDDED_SIGNUP") {
          if (data.event === "FINISH") {
            const { phone_number_id, waba_id } = data.data;
            setWhatsappBusinessAccount({
              phoneNumberId: phone_number_id,
              wabaId: waba_id,
            });
            setConnections((prev) => ({ ...prev, whatsapp: true }));
            setWhatsappStatus("success");
            setWhatsappStatusMessage(
              "WhatsApp business account connected successfully"
            );
          } else if (data.event === "CANCEL") {
            const { current_step } = data.data;
            setWhatsappStatus("cancelled");
            setWhatsappStatusMessage(`Cancelled at step ${current_step}`);
          } else if (data.event === "ERROR") {
            const { error_message } = data.data;
            setWhatsappStatus("error");
            setWhatsappStatusMessage(error_message || "Unknown error occurred");
          }
        }
      } catch {
        console.log("Non JSON Responses", event.data);
      }
    };

    window.addEventListener("message", handleWhatsAppMessage);
    return () => window.removeEventListener("message", handleWhatsAppMessage);
  }, []);

  // Handle Google Sign-In
  const handleGoogleConnect = useGoogleLogin({
    scope: "https://www.googleapis.com/auth/business.manage",
    onSuccess: (tokenResponse) => {
      const accessToken = tokenResponse.access_token;

      // Save access token and update UI
      setGoogleAccessToken(accessToken);
      setConnections((prev) => ({ ...prev, google: true }));
      setGoogleStatusMessage("Google connected successfully!");
    },
    onError: (errorResponse) => {
      console.error("Google sign-in error", errorResponse);
      setGoogleStatusMessage("Google connection failed or canceled");
    },
  });

  // Get Google status icon
  const getGoogleStatusIcon = () => {
    if (googleLoading) {
      return <Loader2 className="w-5 h-5 animate-spin" />;
    }
    return (
      <FaGoogle
        size={32}
        className={connections.google ? "text-green-600" : "text-gray-500"}
      />
    );
  };

  // Handle Meta login - Updated to fetch pages
  const handleMetaLogin = useCallback(() => {
    setMetaLoginStatus("processing");
    setMetaStatusMessage("Connecting to Meta...");

    window.FB.login(
      (response: {
        authResponse?: {
          accessToken: string;
          expiresIn: number;
          signedRequest: string;
          userID: string;
          grantedScopes?: string;
        };
        status?: string;
      }) => {
        if (response.authResponse) {
          const userAccessToken = response.authResponse.accessToken;
          const scopes = response.authResponse.grantedScopes || '';
          setGrantedScopes(scopes);
          
          setMetaLoginStatus("success");
          setMetaStatusMessage("Connected to Meta!");
          setConnections((prev) => ({ ...prev, meta: true }));

          // Get user info
          window.FB.api(
            "/me",
            { fields: "name,email,picture" },
            (userResponse: any) => {
              if (userResponse && !userResponse.error) {
                setUserDetails((prev) => ({
                  ...prev,
                  fullName: userResponse.name || prev.fullName,
                  email: userResponse.email || prev.email,
                  ...(userResponse.picture?.data?.url && {
                    profilePicUrl: userResponse.picture.data.url,
                  }),
                }));
              }
            }
          );

          // Fetch user's pages after successful login
          window.FB.api(
            "/me/accounts",
            { access_token: userAccessToken },
            (pagesResponse: any) => {
              if (pagesResponse.data) {
                setPages(pagesResponse.data);
                if (pagesResponse.data.length > 0) {
                  setSelectedPage({
                    id: pagesResponse.data[0].id,
                    access_token: pagesResponse.data[0].access_token
                  });
                  setMetaStatusMessage(`Found ${pagesResponse.data.length} pages`);
                } else {
                  setMetaStatusMessage("No pages found for your account");
                }
              } else if (pagesResponse.error) {
                console.error("Error fetching pages:", pagesResponse.error);
                setMetaStatusMessage(`Error: ${pagesResponse.error.message || "Failed to fetch pages"}`);
              }
            }
          );
        } else {
          setMetaLoginStatus("error");
          setMetaStatusMessage("Meta connection failed or canceled");
          setConnections((prev) => ({ ...prev, meta: false }));
        }
      },
      {
        scope:
          "public_profile,email,pages_show_list,pages_read_engagement,leads_retrieval,business_management",
        return_scopes: true,
      }
    );
  }, []);

  // Grant partner access to selected page
  const grantPartnerAccess = useCallback(async () => {
    if (!selectedPage) {
      setAccessStatus("No page selected");
      return;
    }

    setGrantingAccess(true);
    setAccessStatus("Granting partner access...");

    try {
      const response = await fetch(
        `https://graph.facebook.com/${FB_API_VERSION}/${selectedPage.id}/agencies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            business: "949040750500917",
            permitted_tasks: ['MANAGE', 'ADVERTISE', 'ANALYZE'],
            access_token: selectedPage.access_token
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setAccessStatus("Partner access granted successfully!");
        setConnections(prev => ({
          ...prev,
          meta: true
        }));
      } else {
        setAccessStatus(`Error: ${data.error?.message || JSON.stringify(data)}`);
      }
    } catch (error: any) {
      console.error("Partner access error:", error);
      setAccessStatus(`Failed: ${error.message || "Please try again."}`);
    } finally {
      setGrantingAccess(false);
    }
  }, [selectedPage]);


  // Launch WhatsApp Embedded Signup
  const launchWhatsAppSignup = useCallback(() => {
    if (!metaSdkReady) {
      setError("Facebook SDK is not ready yet");
      return;
    }

    setWhatsappStatus("processing");
    setWhatsappStatusMessage("Launching WhatsApp signup...");

    window.FB.login(
      (response: any) => {
        if (!response.authResponse) {
          setWhatsappStatus("error");
          setWhatsappStatusMessage("User cancelled the login");
        }
      },
      {
        config_id: "643657128126546",
        response_type: "code",
        scope: "business_management,whatsapp_business_management",
        override_default_response_type: true,
        extras: {
          setup: { payment_method: true },
          featureType: "embedded_signup",
          sessionInfoVersion: "2",
        },
      }
    );
  }, [metaSdkReady]);

  // Get WhatsApp status icon
  const getWhatsAppStatusIcon = () => {
    switch (whatsappStatus) {
      case "processing":
        return <Loader2 className="w-5 h-5 animate-spin" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
      case "cancelled":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return (
          <FaWhatsapp
            size={32}
            className={
              connections.whatsapp ? "text-green-600" : "text-gray-500"
            }
          />
        );
    }
  };

  // Update progress bar on step change
  useEffect(() => {
    setProgress(Math.round((step / 6) * 100));
  }, [step]);

  // Handle file uploads
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "udyam" | "businessProofs"
  ) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setDocuments((prev) => ({
        ...prev,
        [type]: [...prev[type], ...files],
      }));
    }
  };

  // Remove uploaded file
  const removeFile = (index: number, type: "udyam" | "businessProofs") => {
    setDocuments((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  // Toggle selection for questions and keywords
  const toggleSelection = (item: string, type: "questions" | "keywords") => {
    const selectedArray =
      type === "questions"
        ? leadsData.selectedQuestions
        : leadsData.selectedKeywords;

    const setSelected =
      type === "questions"
        ? (items: string[]) =>
            setLeadsData((prev) => ({ ...prev, selectedQuestions: items }))
        : (items: string[]) =>
            setLeadsData((prev) => ({ ...prev, selectedKeywords: items }));

    if (selectedArray.includes(item)) {
      setSelected(selectedArray.filter((i) => i !== item));
    } else {
      if (selectedArray.length < 3) {
        setSelected([...selectedArray, item]);
      }
    }
  };

  // Validate current step before proceeding
  const validateStep = () => {
    switch (step) {
      case 1:
        return true;
      case 2:
        if (!industry) {
          setError("Please select an industry");
          return false;
        }
        return true;
      case 3:
        return true;
      case 4:
        if (
          !userDetails.fullName ||
          !userDetails.userName ||
          !userDetails.email ||
          !userDetails.location.address
        ) {
          setError("Full Name, Username, Email, and Location are required");
          return false;
        }
        return true;
      case 5:
        if (documents.udyam.length === 0) {
          setError("Udyam certificate is required");
          return false;
        }
        return true;
      case 6:
        return true;
      default:
        return true;
    }
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      setError("");
      if (step < 6) {
        setStep(step + 1);
      } else {
        submitOnboarding();
      }
    }
  };

  // Handle skip step
  const handleSkip = () => {
    setError("");
    if (step < 6) {
      setStep(step + 1);
    } else {
      submitOnboarding();
    }
  };

  // Handle previous step
  const handleBack = () => {
    setError("");
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Upload files to Firebase Storage
  const uploadFiles = async (files: File[], path: string) => {
    const urls = [];
    for (const file of files) {
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop();
      const uniqueFilename = `${timestamp}.${fileExtension}`;

      const storageRef = ref(storage, `${path}/${uniqueFilename}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      urls.push(url);
    }
    return urls;
  };

  // Final submission
  const submitOnboarding = async () => {
    setLoading(true);
    setError("");

    try {
      if (!currentUser?.phoneNumber) throw new Error("User not authenticated");

      const cleanPhone = currentUser.phoneNumber.replace(/\D/g, "");

      // Upload profile picture
      let profilePicUrl = "";
      if (userDetails.profilePic) {
        const storageRef = ref(
          storage,
          `profile_pics/${cleanPhone}/${Date.now()}`
        );
        await uploadBytes(storageRef, userDetails.profilePic);
        profilePicUrl = await getDownloadURL(storageRef);
      }

      // Upload documents
      const udyamUrls = await uploadFiles(
        documents.udyam,
        `documents/${cleanPhone}/udyam`
      );
      const businessProofUrls = await uploadFiles(
        documents.businessProofs,
        `documents/${cleanPhone}/business_proofs`
      );

      // Prepare user data
      const userData = {
        industry,
        connections: {
          ...connections,
          whatsapp: {
            connected: connections.whatsapp,
            ...whatsappBusinessAccount,
          },
        },
        userDetails: {
          ...userDetails,
          profilePic: profilePicUrl,
        },
        documents: {
          udyam: udyamUrls,
          businessProofs: businessProofUrls,
        },
        leadsData: {
          ...leadsData,
          industryQuestions:
            industryData[industry as keyof typeof industryData]?.questions ||
            [],
          industryKeywords:
            industryData[industry as keyof typeof industryData]?.keywords || [],
        },
        completed: true,
        createdAt: new Date(),
      };

      // Save to Firestore
      const userRef = doc(firestore, "crm_users", cleanPhone);
      const onboardingRef = doc(userRef, "Onboarding", "onboardingData");

      // Store Google access token in main user document
      if (googleAccessToken) {
        await setDoc(
          userRef,
          { google_access_token: googleAccessToken },
          { merge: true }
        );
      }

      await setDoc(onboardingRef, userData);

      // Refresh onboarding status
      if (refreshOnboardingStatus) {
        await refreshOnboardingStatus();
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Onboarding error:", err);
      setError(
        `Failed to complete onboarding: ${
          (err as Error).message || "Please try again."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Render current step
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white">
                <Building size={48} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Welcome to STARZ Ai CRM
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Get started with the most powerful CRM solution tailored for your
              business. Complete your onboarding to unlock all features.
            </p>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <p className="text-gray-600 mb-6">
              Choose the industry that best describes your business
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.keys(industryData).map((ind) => (
                <button
                  key={ind}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    industry === ind
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  onClick={() => setIndustry(ind)}
                >
                  <div className="font-medium text-gray-800">{ind}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <p className="text-gray-600">
              Connect your business accounts to enable seamless integration and
              data synchronization
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Google Connection */}
              <div
                className={`border-2 rounded-xl p-6 text-center transition-all ${
                  connections.google
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="flex justify-center mb-4">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      connections.google ? "bg-green-100" : "bg-gray-100"
                    }`}
                  >
                    {getGoogleStatusIcon()}
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Google Account
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Connect your Google account for email, calendar, and contacts
                </p>
                {googleLoading ? (
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-600">
                      {googleStatusMessage}
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg ${
                      connections.google
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    } transition`}
                    onClick={() => handleGoogleConnect()}
                    disabled={googleLoading}
                  >
                    {connections.google ? "Connected ✓" : "Connect Google"}
                  </button>
                )}
              </div>

              {/* Meta Connection */}
              <div
                className={`border-2 rounded-xl p-6 text-center transition-all ${
                  connections.meta
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="flex justify-center mb-4">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      connections.meta ? "bg-blue-100" : "bg-gray-100"
                    }`}
                  >
                    <FaFacebook size={32} className="text-gray-500" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Facebook Account
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Connect your Facebook and Instagram business accounts
                </p>

                {metaLoginStatus === "processing" ? (
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-600">{metaStatusMessage}</p>
                  </div>
                ) : connections.meta ? (
                  <div className="space-y-4">
                    {pages.length > 0 ? (
                      <>
                        <div className="text-left">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select a Page
                          </label>
                          <select
                            className="w-full p-2 border rounded"
                            value={selectedPage?.id || ""}
                            onChange={(e) => {
                              const pageId = e.target.value;
                              const page = pages.find(p => p.id === pageId);
                              if (page) {
                                setSelectedPage({
                                  id: page.id,
                                  access_token: page.access_token
                                });
                              }
                            }}
                          >
                            {pages.map(page => (
                              <option key={page.id} value={page.id}>
                                {page.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <button
                          type="button"
                          className={`w-full px-4 py-2 rounded-lg ${
                            grantingAccess
                              ? "bg-blue-300 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700"
                          } text-white transition`}
                          onClick={grantPartnerAccess}
                          disabled={grantingAccess}
                        >
                          {grantingAccess ? (
                            <span className="flex items-center justify-center">
                              <Loader2 className="animate-spin mr-2" size={16} />
                              Granting Access...
                            </span>
                          ) : (
                            "Grant Partner Access"
                          )}
                        </button>
                        
                        {accessStatus && (
                          <p className={`text-sm ${
                            accessStatus.includes("success") 
                              ? "text-green-600" 
                              : "text-red-500"
                          }`}>
                            {accessStatus}
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm text-gray-600">
                          No pages found for your account
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Granted scopes: {grantedScopes}
                        </p>
                        <p className="text-xs text-gray-500">
                          {metaStatusMessage}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg ${
                      connections.meta
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    } transition`}
                    onClick={handleMetaLogin}
                    disabled={!metaSdkReady || metaLoginStatus === "processing"}
                  >
                    Connect Meta
                  </button>
                )}
              </div>

              {/* WhatsApp Connection */}
              <div
                className={`border-2 rounded-xl p-6 text-center transition-all ${
                  connections.whatsapp
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="flex justify-center mb-4">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      connections.whatsapp ? "bg-green-100" : "bg-gray-100"
                    }`}
                  >
                    {getWhatsAppStatusIcon()}
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  WhatsApp Business
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Connect your WhatsApp Business account for messaging
                </p>

                {whatsappStatus === "processing" ? (
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-600">
                      {whatsappStatusMessage}
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg ${
                      connections.whatsapp
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    } transition`}
                    onClick={launchWhatsAppSignup}
                    disabled={whatsappStatus === "processing"}
                  >
                    {connections.whatsapp ? "Connected ✓" : "Connect WhatsApp"}
                  </button>
                )}

                {(whatsappStatus === "error" ||
                  whatsappStatus === "cancelled") && (
                  <p className="text-red-500 text-sm mt-2">
                    {whatsappStatusMessage}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Note:</span> You can skip this
                step and connect accounts later.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <p className="text-gray-600 mb-6">
              Provide your personal information
            </p>

            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {userDetails.profilePic ? (
                    <img
                      src={URL.createObjectURL(userDetails.profilePic)}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="bg-gray-200 border-2 border-dashed rounded-full w-20 h-20 flex items-center justify-center">
                      <User size={24} className="text-gray-400" />
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 cursor-pointer">
                    <Upload size={16} />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setUserDetails((prev) => ({
                            ...prev,
                            profilePic: e.target.files![0],
                          }));
                        }
                      }}
                    />
                  </label>
                </div>
                <div>
                  <div className="font-medium">Business Logo</div>
                  <p className="text-sm text-gray-500">JPG, PNG (max 5MB)</p>
                </div>
              </div>

              {/* Location Map */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Business Location
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Drag the marker to your business location
                </p>

                {mapLoading ? (
                  <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="ml-3 text-gray-600">Loading map...</p>
                  </div>
                ) : (
                  <>
                    <div
                      ref={mapRef}
                      className="w-full h-96 rounded-lg overflow-hidden border border-gray-300"
                    />
                    {mapError && (
                      <p className="text-red-500 text-sm mt-2">{mapError}</p>
                    )}
                  </>
                )}

                {userDetails.location.address && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">
                      Selected Address:
                    </p>
                    <p className="text-gray-900 mt-1">
                      {userDetails.location.address}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <p className="text-gray-600 mb-6">
              Please upload required documents for verification
            </p>

            {/* Udyam Certificate */}
            <div className="space-y-4">
              <div className="font-medium text-gray-800 flex items-center">
                Udyam Certificate *
                <span className="text-xs text-gray-500 ml-2">(PDF only)</span>
              </div>

              <label className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex flex-col items-center justify-center">
                  <Upload size={24} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-blue-600">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF files only (max 10MB each)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="application/pdf"
                  multiple
                  onChange={(e) => handleFileUpload(e, "udyam")}
                />
              </label>

              {/* Uploaded files */}
              {documents.udyam.length > 0 && (
                <div className="mt-4 space-y-2">
                  {documents.udyam.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <FileText size={18} className="text-gray-500 mr-2" />
                        <span className="text-sm truncate max-w-xs">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {(file.size / 1024 / 1024).toFixed(2)}MB
                        </span>
                      </div>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeFile(index, "udyam")}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Business Proofs */}
            <div className="space-y-4 pt-6">
              <div className="font-medium text-gray-800 flex items-center">
                Business Proofs
                <span className="text-xs text-gray-500 ml-2">(PDF only)</span>
              </div>

              <label className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex flex-col items-center justify-center">
                  <Upload size={24} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-blue-600">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF files only (max 10MB each)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="application/pdf"
                  multiple
                  onChange={(e) => handleFileUpload(e, "businessProofs")}
                />
              </label>

              {/* Uploaded files */}
              {documents.businessProofs.length > 0 && (
                <div className="mt-4 space-y-2">
                  {documents.businessProofs.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <FileText size={18} className="text-gray-500 mr-2" />
                        <span className="text-sm truncate max-w-xs">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {(file.size / 1024 / 1024).toFixed(2)}MB
                        </span>
                      </div>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeFile(index, "businessProofs")}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 6: {
        const currentIndustryData =
          industryData[industry as keyof typeof industryData];

        return (
          <div className="space-y-8">
            <p className="text-gray-600 mb-6">
              Configure your lead qualification settings for {industry} industry
            </p>

            {/* Industry Questions */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                1. Select up to 3 qualifying questions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentIndustryData?.questions.map((question, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`p-4 rounded-lg border text-left transition-all ${
                      leadsData.selectedQuestions.includes(question)
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    } ${
                      leadsData.selectedQuestions.length >= 3 &&
                      !leadsData.selectedQuestions.includes(question)
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                    onClick={() => toggleSelection(question, "questions")}
                    disabled={
                      leadsData.selectedQuestions.length >= 3 &&
                      !leadsData.selectedQuestions.includes(question)
                    }
                  >
                    <div className="flex items-start">
                      {leadsData.selectedQuestions.includes(question) ? (
                        <Check
                          className="text-blue-600 mt-0.5 mr-2 flex-shrink-0"
                          size={18}
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-gray-300 mr-2 mt-0.5 flex-shrink-0" />
                      )}
                      <span>{question}</span>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Selected: {leadsData.selectedQuestions.length}/3
              </p>
            </div>

            {/* Location */}
            <div className="pt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                2. Select Target Location
              </h3>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={leadsData.location}
                  onChange={(e) =>
                    setLeadsData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="Enter target location (city, state, or region)"
                  className="pl-10 block w-full rounded-lg border px-4 py-3"
                />
              </div>
            </div>

            {/* Keywords */}
            <div className="pt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                3. Select up to 3 relevant keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {currentIndustryData?.keywords.map((keyword, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`px-4 py-2 rounded-full border transition-all ${
                      leadsData.selectedKeywords.includes(keyword)
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-700 hover:border-blue-300"
                    } ${
                      leadsData.selectedKeywords.length >= 3 &&
                      !leadsData.selectedKeywords.includes(keyword)
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                    onClick={() => toggleSelection(keyword, "keywords")}
                    disabled={
                      leadsData.selectedKeywords.length >= 3 &&
                      !leadsData.selectedKeywords.includes(keyword)
                    }
                  >
                    {keyword}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Selected: {leadsData.selectedKeywords.length}/3
              </p>
            </div>

            {/* USP */}
            <div className="pt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                4. Your Unique Selling Proposition (USP)
              </h3>
              <textarea
                value={leadsData.usp}
                onChange={(e) =>
                  setLeadsData((prev) => ({ ...prev, usp: e.target.value }))
                }
                placeholder="What makes your business unique? (Max 200 characters)"
                className="block w-full rounded-lg border px-4 py-3 min-h-[120px]"
                maxLength={200}
              />
              <p className="text-sm text-gray-500 text-right mt-1">
                {leadsData.usp.length}/200
              </p>
            </div>
            </div>
          );
        }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-8">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all duration-500 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="p-8">
          {/* Step Header */}
          <div className="mb-6">
            <p className="text-sm text-gray-500">Step {step} of 6</p>
            <h2 className="text-xl font-bold text-gray-800">
              {stepTitles[step - 1]}
            </h2>
          </div>

          {/* Step Content */}
          <div className="mb-8">{renderStep()}</div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  className="flex items-center px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft size={18} className="mr-2" />
                  Back
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {step >= 2 && step <= 6 && (
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Skip
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="flex items-center px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {step === 6 ? "Complete Setup" : "Next Step"}
                {step < 6 && <ArrowRight size={18} className="ml-2" />}
                {loading && (
                  <svg
                    className="animate-spin -mr-1 ml-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;