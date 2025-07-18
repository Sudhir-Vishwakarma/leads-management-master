import React, {
  useEffect,
  useState,
  useCallback,
  ChangeEvent,
  useRef,
  // useMemo
} from "react";
import { FaRegLightbulb } from "react-icons/fa";
import LeadsTable from "../components/dashboard/LeadsTable";
import { Lead, CustomKpi, CustomField } from "../types/types";
import { KPI } from "../types";
import {
  syncLeadsFromSheets,
  fetchLeadsFromFirestore,
  importLeadsFromCSV,
} from "../services/api";
import axios from "axios";
import Papa from "papaparse";
import { getAuth } from "firebase/auth";
import { db, fetchAllUsers } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import ReactSelect, { components } from "react-select";
import { SyncLoader } from "react-spinners";
import { StylesConfig, GroupBase } from "react-select";
import { fetchCustomKpis } from "../services/customKpis";
import {
  Users,
  Check,
  Award,
  ChevronDown,
  IndianRupee,
  Calendar,
  CheckCircle,
  Home,
  Mail,
  FileText,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  Star,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useMeet } from "../context/MeetContext";
import { fetchCustomFields } from "../services/customFields";
import { differenceInHours, parseISO } from "date-fns";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperCore } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import { setupChatToLeadSync } from "../services/Firebasesync";

type CardColor = "blue" | "orange" | "green" | "purple" | "red" | "indigo";

interface KPICardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: CardColor;
  flipData?: {
    title: string;
    value: string;
    icon: React.ReactNode;
    description: string;
  };
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  color = "blue",
  flipData,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const colorMap = {
    blue: {
      bg: "from-blue-50 to-blue-100",
      border: "border-blue-200",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      text: "text-blue-800",
    },
    orange: {
      bg: "from-orange-50 to-orange-100",
      border: "border-orange-200",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      text: "text-orange-800",
    },
    green: {
      bg: "from-green-50 to-green-100",
      border: "border-green-200",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      text: "text-green-800",
    },
    purple: {
      bg: "from-purple-50 to-purple-100",
      border: "border-purple-200",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      text: "text-purple-800",
    },
    red: {
      bg: "from-red-50 to-red-100",
      border: "border-red-200",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      text: "text-red-800",
    },
    indigo: {
      bg: "from-indigo-50 to-indigo-100",
      border: "border-indigo-200",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      text: "text-indigo-800",
    },
  };

  const colors = colorMap[color] || colorMap.blue;

  useEffect(() => {
    if (!flipData) return;

    const interval = setInterval(() => {
      setIsFlipped((prev) => !prev);
    }, 5000); // Flip every 5 seconds

    return () => clearInterval(interval);
  }, [flipData]);

  return (
    <div className="kpi-card-outer w-full h-full perspective-1000">
      <div 
        className={`kpi-card-inner relative w-full h-full transform-style-3d transition-transform duration-700 ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front Face */}
        <div
          className={`kpi-card-front absolute w-full h-full backface-hidden border ${colors.border} bg-gradient-to-br ${colors.bg} p-5 shadow-sm`}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between">
              <div>
                <h3 className={`text-sm font-medium ${colors.text}`}>
                  {title}
                </h3>
                <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
              </div>
              <div
                className={`${colors.iconBg} rounded-lg p-2.5 ${colors.iconColor}`}
              >
                {icon}
              </div>
            </div>
          </div>
        </div>

        {/* Back Face */}
        {flipData && (
          <div
            className={`kpi-card-back absolute w-full h-full backface-hidden border ${colors.border} bg-gradient-to-br ${colors.bg} p-5 shadow-sm rotate-y-180`}
          >
            <div className="flex items-center justify-between h-full">
              <div className="flex flex-col justify-center">
                <h3 className={`text-sm font-medium ${colors.text}`}>
                  {flipData.title}
                </h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {flipData.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-lg ${colors.iconBg} ${colors.iconColor}`}
              >
                {flipData.icon}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [allUsers, setAllUsers] = useState<
    Array<{
      phoneNumber: string;
      displayName: string;
    }>
  >([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSwitchLoading, setUserSwitchLoading] = useState(false);
  const [viewingUserPhone, setViewingUserPhone] = useState("");
  const [viewingUserDisplayName, setViewingUserDisplayName] = useState("");
  const [customKpis, setCustomKpis] = useState<CustomKpi[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [importError, setImportError] = useState("");
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const { addToMeet } = useMeet();
  const swiperRef = useRef<SwiperCore | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [contactRate, setContactRate] = useState(0);
  const [meetingRate, setMeetingRate] = useState(0);
  const [feedbackRate, setFeedbackRate] = useState(0);

  useEffect(() => {
    const loadCustomFields = async () => {
      if (currentUser?.phoneNumber) {
        try {
          const sanitizedPhone = currentUser.phoneNumber.replace(/[^\d]/g, "");
          const fields = await fetchCustomFields(sanitizedPhone);
          setCustomFields(fields);
        } catch (error) {
          console.error("Failed to load custom fields", error);
        }
      }
    };
    loadCustomFields();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.phoneNumber || !accountId) return;

    const sanitizedPhone = currentUser.phoneNumber.replace(/[^\d]/g, "");
    const unsubscribe = setupChatToLeadSync(sanitizedPhone, accountId);

    return () => unsubscribe();
  }, [currentUser, accountId]);

  useEffect(() => {
    const fetchConnectedWABA = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user || !user.phoneNumber) return;
        
        const phoneNumber = user.phoneNumber.replace(/[^\d]/g, "");
        const userDoc = await getDoc(doc(db, `crm_users/${phoneNumber}`));
        
        if (userDoc.exists() && userDoc.data().connectedWABA) {
          setAccountId(userDoc.data().connectedWABA);
        }
      } catch (error) {
        console.error("Error fetching connected WABA:", error);
      }
    };
    
    fetchConnectedWABA();
  }, []);

  const computeKPIs = useCallback(
    (list: Lead[]) => {
      const meetingDone = list.filter(
        (l) => l.lead_status === "Meeting Done"
      ).length;
      const dealDone = list.filter((l) => l.lead_status === "Deal Done").length;

      const totalLeads = list.length;
      const contactedLeads = list.filter(
        (l) => l.lead_status !== "New Lead"
      ).length;

      const now = new Date();
      const meetingDoneRecent = list.filter((lead) => {
        return (
          lead.lead_status === "Meeting Done" &&
          lead.meeting_done_time &&
          differenceInHours(now, parseISO(lead.meeting_done_time)) <= 48
        );
      }).length;

      const newMeetingRate =
        totalLeads > 0 ? Math.round((meetingDoneRecent / totalLeads) * 100) : 0;

      const leadsWithRecentComments = list.filter((lead) => {
        if (!lead.customerComments || !Array.isArray(lead.customerComments))
          return false;

        const latestComment = lead.customerComments.reduce(
          (latest, comment) => {
            const commentDate = parseISO(comment.timestamp);
            return commentDate > latest ? commentDate : latest;
          },
          new Date(0)
        );

        const hoursDifference = differenceInHours(now, latestComment);
        return hoursDifference <= 24;
      }).length;

      const newFeedbackRate =
        totalLeads > 0
          ? Math.round((leadsWithRecentComments / totalLeads) * 100)
          : 0;

      setContactRate(0);
      setMeetingRate(newMeetingRate);
      setFeedbackRate(newFeedbackRate);

      const defaultKpis: KPI[] = [
        {
          title: "Qualified Leads",
          value: totalLeads,
          icon: <Users size={24} />,
          color: "blue" as CardColor,
          flipData: {
            title: "Contact Rate",
            value: `0%`,
            icon: <Phone size={24} />,
            description: "Leads contacted vs total",
          },
        },
        {
          title: "Meeting Done",
          value: meetingDone,
          icon: <Check size={24} />,
          color: "orange" as CardColor,
          flipData: {
            title: "Meeting Rate",
            value: `${newMeetingRate}%`,
            icon: <MessageCircle size={24} />,
            description: "Meetings vs contacted",
          },
        },
        {
          title: "Deal Done",
          value: dealDone,
          icon: <Award size={24} />,
          color: "green" as CardColor,
          flipData: {
            title: "Feedback Rate",
            value: `${newFeedbackRate}%`,
            icon: <Star size={24} />,
            description: "Deals vs meetings",
          },
        },
      ];

      const customCards: KPI[] = customKpis.map((kpi) => {
        const count = list.filter((l) => l.lead_status === kpi.label).length;
        let iconComponent: React.ReactNode;

        switch (kpi.icon) {
          case "home":
            iconComponent = <Home size={24} />;
            break;
          case "mail":
            iconComponent = <Mail size={24} />;
            break;
          case "file-text":
            iconComponent = <FileText size={24} />;
            break;
          case "map-pin":
            iconComponent = <MapPin size={24} />;
            break;
          case "calendar":
            iconComponent = <Calendar size={24} />;
            break;
          case "indian-rupee":
            iconComponent = <IndianRupee size={24} />;
            break;
          case "users":
            iconComponent = <Users size={24} />;
            break;
          case "check-circle":
            iconComponent = <CheckCircle size={24} />;
            break;
          default:
            iconComponent = <Home size={24} />;
        }

        return {
          title: kpi.label,
          value: count,
          icon: iconComponent,
          color: kpi.color as CardColor,
        };
      });

      return [...defaultKpis, ...customCards];
    },
    [customKpis]
  );

  useEffect(() => {
    setKpis(computeKPIs(leads));
  }, [leads, computeKPIs]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user || !user.phoneNumber) {
          throw new Error("User not authenticated or phone number missing");
        }

        const sanitizedPhone = user.phoneNumber.replace(/[^\d]/g, "");
        const displayName = user.displayName || sanitizedPhone;
        setViewingUserPhone(sanitizedPhone);
        setViewingUserDisplayName(displayName);
        const userDocRef = doc(db, "crm_users", sanitizedPhone);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists() && docSnap.data().isAdmin) {
          setIsAdmin(true);
          setUsersLoading(true);
          try {
            const users = await fetchAllUsers();
            setAllUsers(users);
          } catch (err) {
            console.error("Failed to fetch users", err);
          } finally {
            setUsersLoading(false);
          }
        }

        const initial = await fetchLeadsFromFirestore();
        setLeads(initial);

        syncLeadsFromSheets()
          .then(async () => {
            const updated = await fetchLeadsFromFirestore();
            setLeads(updated);
          })
          .catch(console.error);

        const kpis = await fetchCustomKpis(sanitizedPhone);
        setCustomKpis(kpis);
      } catch (err: unknown) {
        console.error("Error loading leads:", err);
        if (axios.isAxiosError(err) && err.response?.status === 500) {
          setWarning("No leads available for your account");
        } else if (err instanceof Error) {
          setError("Failed to load leads: " + err.message);
        } else {
          setError("Failed to load leads due to an unknown error");
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleUpdateCustomField = (
    leadId: string,
    fieldName: string,
    newValue: any
  ) => {
    setLeads(
      leads.map((lead) =>
        lead.id === leadId ? { ...lead, [fieldName]: newValue } : lead
      )
    );
  };

  const handleCSVImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImportError("");

    try {
      const file = files[0];
      const text = await readFileAsText(file);
      const leads = parseCSV(text);

      await importLeadsFromCSV(leads);

      const updatedLeads = await fetchLeadsFromFirestore();
      setLeads(updatedLeads);

      setShowPopup(false);
    } catch (err: unknown) {
      console.error("CSV import error:", err);
      if (err instanceof Error) {
        setImportError(err.message || "Failed to import CSV");
      } else {
        setImportError("Failed to import CSV");
      }
    } finally {
      e.target.value = "";
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("File reading failed"));
      reader.readAsText(file);
    });
  };

  const parseCSV = (csvText: string): Lead[] => {
    interface ParseResult<T> {
      data: T[];
      errors: Papa.ParseError[];
      meta: Papa.ParseMeta;
    }

    const results: ParseResult<Record<string, string>> = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
    });

    if (results.errors.length > 0) {
      throw new Error("Invalid CSV format");
    }

    return results.data.map(
      (row): Lead => ({
        created_time: row.created_time || new Date().toISOString(),
        platform: row.platform || "",
        name: row.name || "",
        whatsapp_number_: row.whatsapp_number_ || "",
        lead_status: row.lead_status || "New Lead",
        comments: row.comments || "",
      })
    );
  };

  const handleStatusUpdate = (leadId: string, newStatus: string) => {
    const now = new Date().toISOString();

    setLeads((prevLeads) =>
      prevLeads.map((lead) => {
        if (lead.id !== leadId) return lead;

        const updatedLead: Lead = { ...lead, lead_status: newStatus };

        if (newStatus === "Meeting Done") {
          updatedLead.meeting_done_time = now;
        } else {
          delete updatedLead.meeting_done_time;
        }

        return updatedLead;
      })
    );
  };

  const handleFollowUpScheduled = (
    leadId: string,
    date: string,
    time: string
  ) => {
    setLeads(
      leads.map((lead) =>
        lead.id === leadId
          ? { ...lead, followUpDate: date, followUpTime: time }
          : lead
      )
    );
  };

  const handleUpdateCustomerComment = (leadId: string, comment: string) => {
    setLeads(
      leads.map((lead) =>
        lead.id === leadId ? { ...lead, customerComment: comment } : lead
      )
    );
  };

  const handleDownloadSample = () => {
    const headers = [
      "created_time",
      "platform",
      "name",
      "whatsapp_number_",
      "lead_status",
      "comments",
    ];
    const csvContent = headers.join(",") + "\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sample_leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUserChange = async (
    selectedOption: { value: string; label: string } | null
  ) => {
    if (selectedOption) {
      setUserSwitchLoading(true);
      try {
        const userPhone = selectedOption.value;
        const auth = getAuth();
        const user = auth.currentUser;
        const displayName = user?.displayName || "User";

        setSelectedUser(userPhone);
        setViewingUserPhone(userPhone);
        setViewingUserDisplayName(displayName);

        const userLeads = await fetchLeadsFromFirestore(userPhone);
        setLeads(userLeads);
      } catch (error) {
        console.error("Failed to switch user", error);
      } finally {
        setUserSwitchLoading(false);
      }
    } else {
      const auth = getAuth();
      const user = auth.currentUser;
      const displayName = user?.displayName || "User";

      if (user?.phoneNumber) {
        const sanitizedPhone = user.phoneNumber.replace(/[^\d]/g, "");
        setViewingUserPhone(sanitizedPhone);
        setViewingUserDisplayName(displayName);
      }
    }
  };

  const UserDropdown = () => {
    type UserOption = {
      value: string;
      label: string;
    };

    const selectStyles: StylesConfig<
      UserOption,
      false,
      GroupBase<UserOption>
    > = {
      control: (provided) => ({
        ...provided,
        minWidth: "240px",
        borderRadius: "0.375rem",
        borderColor: "#e5e7eb",
        "&:hover": { borderColor: "#93c5fd" },
        boxShadow: "none",
        backgroundColor: "#f9fafb",
        minHeight: "42px",
      }),
      option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
          ? "#3b82f6"
          : state.isFocused
          ? "#dbeafe"
          : "white",
        color: state.isSelected ? "white" : "#1f2937",
        padding: "10px 15px",
        fontSize: "0.875rem",
      }),
      input: (provided) => ({
        ...provided,
        "input:focus": { boxShadow: "none" },
        fontSize: "0.875rem",
      }),
      placeholder: (provided) => ({
        ...provided,
        color: "#9ca3af",
        fontSize: "0.875rem",
      }),
      singleValue: (provided) => ({
        ...provided,
        color: "#1f2937",
        fontSize: "0.875rem",
        fontWeight: 500,
      }),
      menu: (provided) => ({
        ...provided,
        borderRadius: "0.375rem",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        zIndex: 9999,
      }),
      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      indicatorSeparator: () => ({ display: "none" }),
    };

    return (
      <div className="relative w-64">
        <ReactSelect
          options={allUsers.map((user) => ({
            value: user.phoneNumber,
            label: user.displayName || user.phoneNumber,
          }))}
          value={
            selectedUser
              ? {
                  value: selectedUser,
                  label:
                    allUsers.find((u) => u.phoneNumber === selectedUser)
                      ?.displayName || selectedUser,
                }
              : null
          }
          onChange={handleUserChange}
          placeholder={usersLoading ? "Loading users..." : "Select user..."}
          isSearchable
          isLoading={usersLoading}
          loadingMessage={() => "Loading users..."}
          noOptionsMessage={({ inputValue }: { inputValue: string }) =>
            inputValue ? "No matching users" : "No users available"
          }
          components={{
            DropdownIndicator: (props) => (
              <components.DropdownIndicator {...props}>
                {usersLoading ? (
                  <div className="px-2">
                    <SyncLoader size={8} color="#3b82f6" />
                  </div>
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </components.DropdownIndicator>
            ),
            LoadingIndicator: () => (
              <div className="px-2">
                <SyncLoader size={8} color="#3b82f6" />
              </div>
            ),
          }}
          styles={selectStyles}
          menuPortalTarget={document.body}
          menuPosition="fixed"
        />
        {userSwitchLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center rounded-md border border-gray-200">
            <SyncLoader size={8} color="#3b82f6" />
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <SyncLoader size={12} color="#3b82f6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4 rounded border-yellow-400 bg-yellow-50 px-4 py-3 flex items-start">
        <svg
          className="h-5 w-5 flex-shrink-0 text-yellow-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.366-.756 1.4-.756 1.766 0l6.518 13.452A.75.75 0 0115.75 18h-11.5a.75.75 0 01-.791-1.449l6.518-13.452zM11 14a1 1 0 10-2 0 1 1 0 002 0zm-1-4a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0v-2.5A.75.75 0 0110 10z"
            clipRule="evenodd"
          />
        </svg>
        <div className="ml-3 text-yellow-800">
          <p className="font-medium">Warning</p>
          <p className="mt-1 text-sm">⚠️ {warning}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-1 py-3">
      <div className="mb-8 relative group">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        <Swiper
          modules={[Navigation]}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          className="kpi-swiper"
        >
          {kpis.map((kpi, index) => (
            <SwiperSlide key={index}>
              <div className="px-2 py-4 h-28 w-full">
                <KPICard
                  title={kpi.title}
                  value={kpi.value}
                  icon={kpi.icon}
                  color={kpi.color as CardColor}
                  flipData={kpi.flipData}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-500 rounded-lg overflow-hidden mb-6 py-3">
        <div className="relative overflow-hidden group">
          <div className="marquee-single flex items-center gap-x-8 min-w-max animate-marquee">
            <span className="mx-4 text-blue-800 font-medium flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-blue-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              5-24 Rule :-
            </span>
            <span className="text-blue-700">
              As per Harvard Research, You can get up to 80%+ Sales Conversion,
              if contacted leads within 5 minutes & meeting done within 24–48
              hrs. Update Remarks CRM within 5min to get more quality leads.
            </span>
            <span className="mx-4 text-green-600 font-medium">
              *** STARZ Wishes you all the best, Happy Deals! ***
            </span>
          </div>
        </div>

        <style>
          {`
            @keyframes marquee {
              0% {
                transform: translateX(65%);
              }
              100% {
                transform: translateX(-100%);
              }
            }

            .animate-marquee {
              animation: marquee 25s linear infinite;
            }

            .group:hover .animate-marquee {
              animation-play-state: paused;
            }
          `}
        </style>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Recent Leads</h2>
          <p className="text-sm text-gray-500 mt-1">
            {leads.length} records found
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          {isAdmin && <UserDropdown />}
          <button
            onClick={() => setShowPopup(true)}
            className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 ${
              userSwitchLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            Import CSV
          </button>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative border border-gray-200">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-3xl transition-colors"
            >
              &times;
            </button>

            <h3 className="text-xl font-bold mb-6 text-gray-800 text-center">
              📂 Import CSV File
            </h3>

            {importError && (
              <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-2 text-red-700 shadow text-sm">
                {importError}
              </div>
            )}

            <ol className="list-decimal space-y-6 text-gray-700 text-sm pl-6">
              <li>
                <p className="mb-2 font-medium">Download the sample file:</p>
                <button
                  onClick={handleDownloadSample}
                  className="bg-green-600 text-white text-sm px-4 py-2 rounded-md hover:bg-green-700 shadow transition"
                >
                  Download
                </button>
              </li>

              <li>
                <p className="font-medium">
                  Add your data to the file using the same format as shown in
                  the sample.
                </p>
              </li>

              <li>
                <p className="mb-2 font-medium">Import your updated file:</p>
                <label className="inline-block bg-blue-600 text-white text-sm px-4 py-2 rounded-md cursor-pointer hover:bg-blue-700 shadow transition">
                  Import
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleCSVImport}
                  />
                </label>
              </li>
            </ol>
          </div>
        </div>
      )}

      <LeadsTable
        leads={leads}
        onStatusUpdate={handleStatusUpdate}
        onFollowUpScheduled={handleFollowUpScheduled}
        onUpdateCustomerComment={handleUpdateCustomerComment}
        isLoading={userSwitchLoading}
        viewingUserPhone={viewingUserPhone}
        viewingUserDisplayName={viewingUserDisplayName}
        customKpis={customKpis}
        customFields={customFields}
        onUpdateCustomField={handleUpdateCustomField}
        addToMeet={addToMeet}
      />

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        
        .backface-hidden {
          backface-visibility: hidden;
        }
        
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        
        .kpi-card-outer {
          perspective: 1000px;
        }
        
        .kpi-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.7s;
        }
        
        .kpi-card-front, .kpi-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 0.5rem;
        }
        
        .kpi-card-back {
          transform: rotateY(180deg);
        }
        
        .flipped {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;



