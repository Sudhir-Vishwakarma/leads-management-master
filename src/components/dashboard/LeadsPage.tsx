import React, { useEffect, useState, ChangeEvent } from "react";
import LeadsTable from "./LeadsTable";
import { Lead, CustomKpi, CustomField } from "../../types/types";
import { fetchLeadsFromFirestore, importLeadsFromCSV } from "../../services/api";
import axios from "axios";
import Papa from "papaparse";
import { getAuth } from "firebase/auth";
import { db, fetchAllUsers } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import ReactSelect, { components } from "react-select";
import { SyncLoader } from "react-spinners";
import { StylesConfig, GroupBase } from "react-select";
import { fetchCustomKpis } from "../../services/customKpis";
import { useAuth } from "../../context/AuthContext";
import { useMeet } from "../../context/MeetContext";
import { fetchCustomFields } from "../../services/customFields";
// import { differenceInHours, parseISO } from "date-fns";
import { 
  Home,
  Mail,
  FileText,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  Star,
  ChevronDown
} from "lucide-react";
import { setupChatToLeadSync } from "../../services/Firebasesync";

const LeadsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
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
    <div className="container mx-auto px-4 py-6">
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
        isAdmin={isAdmin}
        userSwitchLoading={userSwitchLoading}
        allUsers={allUsers}
        selectedUser={selectedUser}
        handleUserChange={handleUserChange}
        usersLoading={usersLoading}
        onImportCSVClick={() => setShowPopup(true)}
        totalCount={leads.length}
      />

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
    </div>
  );
};

export default LeadsPage;