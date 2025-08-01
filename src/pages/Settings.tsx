import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "firebase/auth";
import {
  User,
  Phone,
  Plus,
  X,
  Home,
  Mail,
  FileText,
  MapPin,
  Calendar,
  IndianRupee,
  Users as UsersIcon,
  CheckCircle,
  Check,
  BarChart2,
  Loader2,
  Tag,
  ClipboardList,
  UserPlus,
} from "lucide-react";
import {
  addCustomKpi,
  fetchCustomKpis,
  deleteCustomKpi,
} from "../services/customKpis";
import { CustomKpi } from "../types/types";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import {
  fetchCustomFields,
  addCustomField,
  deleteCustomField,
} from "../services/customFields";
import { CustomField } from "../types/types";

const Settings: React.FC = () => {
  const { currentUser } = useAuth();
  const [displayName, setDisplayName] = useState(
    currentUser?.displayName || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [customKpis, setCustomKpis] = useState<CustomKpi[]>([]);
  const [newKpiLabel, setNewKpiLabel] = useState("");
  const [newKpiColor, setNewKpiColor] = useState("purple");
  const [newKpiIcon, setNewKpiIcon] = useState("home");
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "profile" | "kpis" | "fields" | "onboarding" | "users"
  >("profile");

  // Add new state variables for custom fields
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [newFieldOptions, setNewFieldOptions] = useState("");
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  // User management state
  interface TeamMember {
    id: string;
    phone: string;
    role: string;
    status: string;
    addedAt?: Date | { seconds: number; nanoseconds: number };
    addedBy?: string;
  }
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserRole, setNewUserRole] = useState("user");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [userLoading, setUserLoading] = useState(false);

  // Define color options
  const colorOptions = [
    { value: "purple", name: "Purple", hex: "hsl(var(--primary))" },
    { value: "yellow", name: "Yellow", hex: "hsl(var(--warning))" },
    { value: "indigo", name: "Indigo", hex: "#6366F1" },
    { value: "pink", name: "Pink", hex: "hsl(var(--accent))" },
    { value: "teal", name: "Teal", hex: "#14B8A6" },
    { value: "red", name: "Red", hex: "hsl(var(--destructive))" },
    { value: "green", name: "Green", hex: "hsl(var(--success))" },
    { value: "blue", name: "Blue", hex: "#3B82F6" },
  ];

  // Define icon options
  const iconOptions = [
    { value: "home", icon: <Home size={16} /> },
    { value: "mail", icon: <Mail size={16} /> },
    { value: "file-text", icon: <FileText size={16} /> },
    { value: "map-pin", icon: <MapPin size={16} /> },
    { value: "calendar", icon: <Calendar size={16} /> },
    { value: "indian-rupee", icon: <IndianRupee size={16} /> },
    { value: "users", icon: <UsersIcon size={16} /> },
    { value: "check-circle", icon: <CheckCircle size={16} /> },
  ];

  // Onboarding
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File[]>>(
    {}
  );
  const [businessDetails, setBusinessDetails] = useState({
    leadQualifier: "",
    locations: "",
    keywords: "",
    usp: "",
  });

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: string
  ) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles((prev) => ({
        ...prev,
        [docType]: [...(prev[docType] || []), ...files],
      }));
    }
  };

  const handleSubmitBusinessDetails = () => {
    // Submit logic here
    console.log("Business details submitted:", businessDetails);
    // Reset onboarding
    setOnboardingStep(0);
    setSelectedPlatform(null);
    setUploadedFiles({});
    setBusinessDetails({
      leadQualifier: "",
      locations: "",
      keywords: "",
      usp: "",
    });
  };

  useEffect(() => {
    const checkAdmin = async () => {
      if (currentUser?.phoneNumber) {
        const sanitizedPhone = currentUser.phoneNumber.replace(/[^\d]/g, "");
        const userDocRef = doc(db, "crm_users", sanitizedPhone);
        const docSnap = await getDoc(userDocRef);
        setIsAdmin(docSnap.exists() && docSnap.data().isAdmin);
      }
    };

    const loadCustomKpis = async () => {
      if (currentUser?.phoneNumber) {
        try {
          const sanitizedPhone = currentUser.phoneNumber.replace(/[^\d]/g, "");
          const kpis = await fetchCustomKpis(sanitizedPhone);
          setCustomKpis(kpis);
        } catch (error) {
          console.error("Failed to load custom KPIs", error);
        }
      }
    };

    checkAdmin();
    loadCustomKpis();
  }, [currentUser]);

  // Load team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (currentUser?.phoneNumber && activeTab === "users" && isAdmin) {
        setUserLoading(true);
        try {
          const sanitizedPhone = currentUser.phoneNumber.replace(/[^\d]/g, "");
          const teamRef = collection(db, "crm_teams", sanitizedPhone, "members");
          const snapshot = await getDocs(teamRef);
          
          const members: TeamMember[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              phone: data.phone ?? "",
              role: data.role ?? "",
              status: data.status ?? "",
              addedAt: data.addedAt,
              addedBy: data.addedBy,
            };
          });
          
          setTeamMembers(members);
        } catch (error) {
          console.error("Error loading team members:", error);
          setError("Failed to load team members");
        } finally {
          setUserLoading(false);
        }
      }
    };

    fetchTeamMembers();
  }, [currentUser, activeTab, isAdmin]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await updateProfile(currentUser, {
        displayName: displayName,
      });

      setSuccess("Profile updated successfully!");
      setLoading(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
      setLoading(false);
    }
  };

  const handleAddKpi = async () => {
    if (!newKpiLabel.trim() || !currentUser?.phoneNumber) return;

    try {
      const sanitizedPhone = currentUser.phoneNumber.replace(/[^\d]/g, "");
      const newKpi = {
        label: newKpiLabel.trim(),
        color: newKpiColor,
        icon: newKpiIcon,
      };

      const addedKpi = await addCustomKpi(sanitizedPhone, newKpi);
      setCustomKpis([...customKpis, addedKpi]);
      setNewKpiLabel("");
      setSuccess("Custom KPI added successfully!");
      setError("");
    } catch (error) {
      console.error("Error adding custom KPI:", error);
      setError("Failed to add custom KPI. Please try again.");
      setSuccess("");
    }
  };

  const handleDeleteKpi = async (id: string) => {
    if (!currentUser?.phoneNumber) return;

    try {
      const sanitizedPhone = currentUser.phoneNumber.replace(/[^\d]/g, "");
      await deleteCustomKpi(sanitizedPhone, id);
      setCustomKpis(customKpis.filter((kpi) => kpi.id !== id));
      setSuccess("Custom KPI deleted successfully!");
      setError("");
    } catch (error) {
      console.error("Error deleting custom KPI:", error);
      setError("Failed to delete custom KPI. Please try again.");
      setSuccess("");
    }
  };

  const handleAddField = async () => {
    if (!newFieldName.trim() || !currentUser?.phoneNumber) return;

    try {
      const sanitizedPhone = currentUser.phoneNumber.replace(/[^\d]/g, "");

      const newField = {
        name: newFieldName.trim(),
        type: newFieldType as
          | "text"
          | "number"
          | "select"
          | "date"
          | "checkbox",
        user_phone: sanitizedPhone,
        ...(newFieldType === "select" && {
          options: newFieldOptions.split(",").map((opt) => opt.trim()),
        }),
      };

      const addedField = await addCustomField(sanitizedPhone, newField);
      setCustomFields([...customFields, addedField]);
      setNewFieldName("");
      setNewFieldType("text");
      setNewFieldOptions("");
      setSuccess("Custom field added successfully!");
      setError("");
    } catch (error) {
      console.error("Error adding custom field:", error);
      setError("Failed to add custom field. Please try again.");
      setSuccess("");
    }
  };

  const handleDeleteField = async (id: string) => {
    if (!currentUser?.phoneNumber) return;

    try {
      const sanitizedPhone = currentUser.phoneNumber.replace(/[^\d]/g, "");
      await deleteCustomField(sanitizedPhone, id);
      setCustomFields(customFields.filter((field) => field.id !== id));
      setSuccess("Custom field deleted successfully!");
      setError("");
    } catch (error) {
      console.error("Error deleting custom field:", error);
      setError("Failed to delete custom field. Please try again.");
      setSuccess("");
    }
  };

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

  const handleAddUser = async () => {
    if (!newUserPhone.trim() || !currentUser?.phoneNumber) return;
    
    setUserLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const sanitizedAdminPhone = currentUser.phoneNumber.replace(/[^\d]/g, "");
      const sanitizedUserPhone = newUserPhone.replace(/[^\d]/g, "");
      
      // Create user document in the team collection
      const teamRef = doc(db, "crm_teams", sanitizedAdminPhone, "members", sanitizedUserPhone);
      await setDoc(teamRef, {
        phone: sanitizedUserPhone,
        role: newUserRole,
        addedAt: new Date(),
        addedBy: sanitizedAdminPhone,
        status: "pending"
      });
      
      // Refresh team members list
      const teamRefCollection = collection(db, "crm_teams", sanitizedAdminPhone, "members");
      const snapshot = await getDocs(teamRefCollection);
      const members: TeamMember[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          phone: data.phone ?? "",
          role: data.role ?? "",
          status: data.status ?? "",
          addedAt: data.addedAt,
          addedBy: data.addedBy,
        };
      });
      
      setTeamMembers(members);
      setNewUserPhone("");
      setNewUserRole("user");
      setSuccess("User added successfully! They'll receive an invitation.");
    } catch (error) {
      console.error("Error adding user:", error);
      setError("Failed to add user. Please try again.");
    } finally {
      setUserLoading(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!currentUser?.phoneNumber) return;
    
    setUserLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const sanitizedAdminPhone = currentUser.phoneNumber.replace(/[^\d]/g, "");
      const userRef = doc(db, "crm_teams", sanitizedAdminPhone, "members", userId);
      
      // Instead of deleting, mark as inactive
      await setDoc(userRef, {
        status: "removed"
      }, { merge: true });
      
      // Update local state to remove the user
      setTeamMembers(prev => prev.filter(user => user.id !== userId));
      setSuccess("User removed successfully!");
    } catch (error) {
      console.error("Error removing user:", error);
      setError("Failed to remove user. Please try again.");
    } finally {
      setUserLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl shadow-md border border-border">
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "profile"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
              }`}
            >
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Profile Settings
              </div>
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab("kpis")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "kpis"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                }`}
              >
                <div className="flex items-center">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Pipelines Settings
                  {customKpis.length > 0 && (
                    <span className="ml-2 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {customKpis.length}
                    </span>
                  )}
                </div>
              </button>
            )}

            <button
              onClick={() => setActiveTab("fields")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "fields"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
              }`}
            >
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                Custom Fields
              </div>
            </button>

            {/* {isAdmin && (
              <button
                onClick={() => setActiveTab("onboarding")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "onboarding"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                }`}
              >
                <div className="flex items-center">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Onboarding
                </div>
              </button>
            )} */}

            {/* {isAdmin && (
              <button
                onClick={() => setActiveTab("users")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "users"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                }`}
              >
                <div className="flex items-center">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Users
                  {teamMembers.length > 0 && (
                    <span className="ml-2 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {teamMembers.length}
                    </span>
                  )}
                </div>
              </button>
            )} */}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Settings Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {error && (
                <div className="p-4 bg-destructive/10 rounded-lg border-l-4 border-destructive">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-destructive"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div className="p-4 bg-success/10 rounded-lg border-l-4 border-success">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-success"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-success">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Display Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="pl-10 w-full rounded-lg border border-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition bg-card text-foreground"
                        placeholder="Your display name"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <input
                        type="tel"
                        value={currentUser?.phoneNumber || ""}
                        disabled
                        className="pl-10 w-full rounded-lg border border-input px-4 py-3 bg-muted text-muted-foreground focus:outline-none shadow-sm transition cursor-not-allowed"
                        placeholder="Your phone number"
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Phone number cannot be changed as it's used for
                      authentication.
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full md:w-auto flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm transition-all ${
                      loading
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Profile Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Custom KPIs Tab */}
          {activeTab === "kpis" && isAdmin && (
            <div className="space-y-6">
              <div className="bg-muted rounded-xl p-5 border border-border">
                <div className="flex items-center mb-4">
                  <div className="bg-primary/10 p-2 rounded-lg mr-3">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">
                    Create new pipeline stage
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Stage Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newKpiLabel}
                        onChange={(e) => setNewKpiLabel(e.target.value)}
                        className="w-full rounded-lg border border-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition bg-card text-foreground"
                        placeholder="e.g., Site Visit, Proposal Sent"
                      />
                      {newKpiLabel && (
                        <button
                          type="button"
                          onClick={() => setNewKpiLabel("")}
                          className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Select Icon
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {iconOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setNewKpiIcon(option.value)}
                          className={`p-3 rounded-xl flex flex-col items-center justify-center transition-all ${
                            newKpiIcon === option.value
                              ? "bg-primary/10 border-2 border-primary shadow-sm"
                              : "bg-card border border-border hover:bg-muted"
                          }`}
                        >
                          {option.icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Select Color
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setNewKpiColor(color.value)}
                          className={`h-10 rounded-lg flex items-center justify-center transition-all ${
                            newKpiColor === color.value
                              ? "ring-2 ring-offset-2 ring-primary"
                              : "hover:opacity-90"
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        >
                          {newKpiColor === color.value && (
                            <Check className="h-4 w-4 text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddKpi}
                  disabled={!newKpiLabel.trim()}
                  className={`mt-6 w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm transition-all ${
                    !newKpiLabel.trim()
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add pipeline Stage
                </button>
              </div>

              <div>
                <div className="flex items-center mb-4">
                  <div className="bg-success/10 p-2 rounded-lg mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-success"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-foreground">
                    Your custom stages
                  </h3>
                </div>

                {customKpis.length === 0 ? (
                  <div className="text-center py-8 rounded-xl border-2 border-dashed border-border">
                    <div className="bg-muted border-2 border-dashed rounded-xl w-16 h-16 mx-auto flex items-center justify-center">
                      <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-foreground">
                      No custom pipelines created
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                      Create your first custom pipeline stage to track unique
                      lead stages beyond the default metrics.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customKpis.map((kpi) => {
                      const color =
                        colorOptions.find((c) => c.value === kpi.color) ||
                        colorOptions[0];
                      const icon =
                        iconOptions.find((i) => i.value === kpi.icon) ||
                        iconOptions[0];

                      return (
                        <div
                          key={kpi.id}
                          className="border border-border rounded-xl p-4 flex items-center justify-between transition-all hover:shadow-md bg-card"
                        >
                          <div className="flex items-center">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
                              style={{ backgroundColor: `${color.hex}20` }}
                            >
                              <div style={{ color: color.hex }}>
                                {icon.icon}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground">
                                {kpi.label}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                <span
                                  className="inline-block w-3 h-3 rounded-full mr-1"
                                  style={{ backgroundColor: color.hex }}
                                ></span>
                                {color.name}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteKpi(kpi.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-2"
                            title="Delete KPI"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {customKpis.length > 0 && (
                  <div className="mt-6 bg-primary/10 rounded-lg p-4 border border-primary/20">
                    <div className="flex">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="ml-3 text-sm text-primary">
                        Custom stages will appear as cards on your dashboard and
                        as status options in leads table.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Custom Fields Tab */}
          {activeTab === "fields" && isAdmin && (
            <div className="space-y-6">
              <div className="bg-muted rounded-xl p-5 border border-border">
                <div className="flex items-center mb-4">
                  <div className="bg-primary/10 p-2 rounded-lg mr-3">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">
                    Create New Custom Field
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Field Name
                    </label>
                    <input
                      type="text"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      className="w-full rounded-lg border border-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition bg-card text-foreground"
                      placeholder="e.g., Location, Budget"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Field Type
                    </label>
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value)}
                      className="w-full rounded-lg border border-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition bg-card text-foreground"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="select">Dropdown</option>
                      <option value="date">Date</option>
                      <option value="checkbox">Checkbox</option>
                    </select>
                  </div>

                  {newFieldType === "select" && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Options (comma separated)
                      </label>
                      <input
                        type="text"
                        value={newFieldOptions}
                        onChange={(e) => setNewFieldOptions(e.target.value)}
                        className="w-full rounded-lg border border-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition bg-card text-foreground"
                        placeholder="e.g., Option1, Option2"
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={handleAddField}
                  className="mt-6 w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 transition-all"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Custom Field
                </button>
              </div>

              <div>
                <div className="flex items-center mb-4">
                  <div className="bg-success/10 p-2 rounded-lg mr-3">
                    <Tag className="h-5 w-5 text-success" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">
                    Your Custom Fields
                  </h3>
                </div>

                {customFields.length === 0 ? (
                  <div className="text-center py-8 rounded-xl border-2 border-dashed border-border">
                    <div className="bg-muted border-2 border-dashed rounded-xl w-16 h-16 mx-auto flex items-center justify-center">
                      <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-foreground">
                      No custom fields created
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                      Create custom fields to store additional information about
                      your leads.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Field Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Options
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-card divide-y divide-border">
                        {customFields.map((field) => (
                          <tr key={field.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                              {field.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {field.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {field.options ? field.options.join(", ") : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleDeleteField(field.id)}
                                className="text-destructive hover:text-destructive/80"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Onboarding Tab */}
          {activeTab === "onboarding" && isAdmin && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-primary/10 to-indigo-50 dark:to-indigo-900/10 rounded-xl p-5 border border-primary/20">
                <div className="flex border-b border-border mb-6">
                  {["Welcome", "Access", "Upload Docs", "Business Details"].map(
                    (tab, index) => (
                      <button
                        key={index}
                        className={`px-4 py-3 text-sm font-medium relative ${
                          onboardingStep === index
                            ? "text-primary font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        onClick={() => setOnboardingStep(index)}
                      >
                        {tab}
                        {onboardingStep === index && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                        )}
                      </button>
                    )
                  )}
                </div>

                <div className="pt-2">
                  {onboardingStep === 0 && (
                    <div className="text-center py-6">
                      <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-3">
                        Welcome to Starz AI CRM
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-8">
                        Thank you for choosing our platform. Let's get your
                        account set up for success with our quick onboarding
                        process.
                      </p>
                      <button
                        onClick={() => setOnboardingStep(1)}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg shadow hover:bg-primary/90 transition-colors font-medium"
                      >
                        Get Started
                      </button>
                    </div>
                  )}

                  {onboardingStep === 1 && (
                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-5">
                        Connect Your Account
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Select your preferred integration method:
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {[
                          {
                            id: "meta",
                            name: "Meta",
                            icon: "M20.896 11.07C20.896 5.584 16.513 1.2 11.026 1.2 5.54 1.2 1.156 5.584 1.156 11.07c0 4.92 3.518 9.01 8.116 9.93v-7.03H7.626v-2.9h1.646V9.16c0-1.8 1.08-2.79 2.72-2.79.78 0 1.46.06 1.66.08v1.92h-1.14c-.89 0-1.06.42-1.06 1.04v1.37h2.12l-.28 2.9h-1.84v7.03c4.6-.92 8.12-5.01 8.12-9.93z",
                          },
                          {
                            id: "google",
                            name: "Google",
                            icon: "M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z",
                          },
                          {
                            id: "whatsapp",
                            name: "WhatsApp",
                            icon: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
                          },
                        ].map((platform) => (
                          <button
                            key={platform.id}
                            className={`p-4 rounded-xl border flex flex-col items-center transition-all ${
                              selectedPlatform === platform.id
                                ? "border-primary bg-primary/10 shadow-sm"
                                : "border-border bg-card hover:bg-muted"
                            }`}
                            onClick={() => setSelectedPlatform(platform.id)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              className={`h-10 w-10 ${
                                platform.id === "meta"
                                  ? "text-[#1877F2]"
                                  : platform.id === "google"
                                  ? "text-[#4285F4]"
                                  : "text-[#25D366]"
                              }`}
                            >
                              <path fill="currentColor" d={platform.icon} />
                            </svg>
                            <span className="mt-3 font-medium text-foreground">
                              {platform.name}
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => setOnboardingStep(2)}
                          disabled={!selectedPlatform}
                          className={`px-5 py-2.5 rounded-lg font-medium ${
                            selectedPlatform
                              ? "bg-primary text-primary-foreground hover:bg-primary/90"
                              : "bg-muted text-muted-foreground cursor-not-allowed"
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}

                  {onboardingStep === 2 && (
                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-5">
                        Upload Required Documents
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Please upload documents in any format
                      </p>

                      <div className="space-y-5">
                        {[
                          "KYC Document",
                          "Business Proof",
                          "Utility Proof",
                          "Others",
                        ].map((docType, index) => (
                          <div
                            key={index}
                            className="bg-card p-4 rounded-xl border border-border"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-medium text-foreground">
                                {docType}
                              </h4>
                              <span className="text-xs text-muted-foreground">
                                Any format
                              </span>
                            </div>

                            <div className="flex items-center">
                              <label className="flex-1">
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => handleFileUpload(e, docType)}
                                />
                                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-muted">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-10 w-10 text-muted-foreground mx-auto mb-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                  </svg>
                                  <p className="text-sm text-muted-foreground">
                                    Click to upload or drag and drop
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    PDF, DOC, JPG, PNG (max 10MB)
                                  </p>
                                </div>
                              </label>

                              {uploadedFiles[docType]?.length > 0 && (
                                <div className="ml-4 text-sm text-success flex items-center">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-1"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  {uploadedFiles[docType]?.length} file(s)
                                  uploaded
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between mt-8">
                        <button
                          onClick={() => setOnboardingStep(1)}
                          className="px-5 py-2.5 rounded-lg font-medium text-foreground bg-muted hover:bg-border"
                        >
                          Back
                        </button>
                        <button
                          onClick={() => setOnboardingStep(3)}
                          className="px-5 py-2.5 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}

                  {onboardingStep === 3 && (
                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-6">
                        Business Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Lead Qualifier
                          </label>
                          <input
                            type="text"
                            value={businessDetails.leadQualifier}
                            onChange={(e) =>
                              setBusinessDetails({
                                ...businessDetails,
                                leadQualifier: e.target.value,
                              })
                            }
                            className="w-full p-3 border border-input rounded-lg focus:ring-primary focus:border-primary bg-card text-foreground"
                            placeholder="How do you qualify leads?"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Locations
                          </label>
                          <input
                            type="text"
                            value={businessDetails.locations}
                            onChange={(e) =>
                              setBusinessDetails({
                                ...businessDetails,
                                locations: e.target.value,
                              })
                            }
                            className="w-full p-3 border border-input rounded-lg focus:ring-primary focus:border-primary bg-card text-foreground"
                            placeholder="Main business locations"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Keywords
                          </label>
                          <input
                            type="text"
                            value={businessDetails.keywords}
                            onChange={(e) =>
                              setBusinessDetails({
                                ...businessDetails,
                                keywords: e.target.value,
                              })
                            }
                            className="w-full p-3 border border-input rounded-lg focus:ring-primary focus:border-primary bg-card text-foreground"
                            placeholder="Relevant business keywords"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Separate with commas
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            USP (Unique Selling Proposition)
                          </label>
                          <textarea
                            rows={3}
                            value={businessDetails.usp}
                            onChange={(e) =>
                              setBusinessDetails({
                                ...businessDetails,
                                usp: e.target.value,
                              })
                            }
                            className="w-full p-3 border border-input rounded-lg focus:ring-primary focus:border-primary bg-card text-foreground"
                            placeholder="What makes your business unique?"
                          ></textarea>
                        </div>
                      </div>

                      <div className="flex justify-between border-t border-border pt-6">
                        <button
                          onClick={() => setOnboardingStep(2)}
                          className="px-5 py-2.5 rounded-lg font-medium text-foreground bg-muted hover:bg-border"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleSubmitBusinessDetails}
                          className="px-6 py-2.5 rounded-lg font-medium bg-success text-primary-foreground hover:bg-success/90 shadow-sm"
                        >
                          Complete Onboarding
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Add Users Tab */}
          {activeTab === "users" && isAdmin && (
            <div className="space-y-6">
              <div className="bg-muted rounded-xl p-5 border border-border">
                <div className="flex items-center mb-4">
                  <div className="bg-primary/10 p-2 rounded-lg mr-3">
                    <UserPlus className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">
                    Add New User
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <input
                        type="tel"
                        value={newUserPhone}
                        onChange={(e) => setNewUserPhone(e.target.value)}
                        className="pl-10 w-full rounded-lg border border-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition bg-card text-foreground"
                        placeholder="User's phone number"
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      User will receive an invitation to join your team
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Role
                    </label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                      className="w-full rounded-lg border border-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition bg-card text-foreground"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Admins can manage team settings and configurations
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleAddUser}
                  disabled={!newUserPhone.trim() || userLoading}
                  className={`mt-6 w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm transition-all ${
                    !newUserPhone.trim() || userLoading
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {userLoading ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-5 w-5 mr-2" />
                  )}
                  {userLoading ? "Adding User..." : "Add User"}
                </button>
              </div>

              <div>
                <div className="flex items-center mb-4">
                  <div className="bg-success/10 p-2 rounded-lg mr-3">
                    <UsersIcon className="h-5 w-5 text-success" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">
                    Team Members
                  </h3>
                </div>

                {userLoading && teamMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                    <p className="mt-2 text-muted-foreground">Loading team members...</p>
                  </div>
                ) : teamMembers.length === 0 ? (
                  <div className="text-center py-8 rounded-xl border-2 border-dashed border-border">
                    <div className="bg-muted border-2 border-dashed rounded-xl w-16 h-16 mx-auto flex items-center justify-center">
                      <UsersIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-foreground">
                      No team members added
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                      Add team members to collaborate on your leads and customers.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Phone Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-card divide-y divide-border">
                        {teamMembers.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                              {user.phone}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === "admin" 
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300" 
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                              }`}>
                                {user.role === "admin" ? "Admin" : "User"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.status === "active" 
                                  ? "bg-success/10 text-success" 
                                  : user.status === "pending"
                                  ? "bg-warning/10 text-warning"
                                  : "bg-destructive/10 text-destructive"
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleRemoveUser(user.id)}
                                className="text-destructive hover:text-destructive/80"
                                disabled={userLoading}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;































// import React, { useState, useEffect, useCallback } from "react";
// import { useAuth } from "../context/AuthContext";
// import { updateProfile } from "firebase/auth";
// import {
//   User,
//   Phone,
//   Plus,
//   X,
//   Home,
//   Mail,
//   FileText,
//   MapPin,
//   Calendar,
//   IndianRupee,
//   Users as UsersIcon,
//   CheckCircle,
//   Check,
//   BarChart2,
//   Loader2,
//   Tag,
//   ClipboardList,
//   UserPlus,
//   ArrowRight,
//   ArrowLeft,
//   Building,
//   Upload,
//   CheckCircle as CheckCircleIcon,
//   AlertCircle,
// } from "lucide-react";
// import {
//   addCustomKpi,
//   fetchCustomKpis,
//   deleteCustomKpi,
// } from "../services/customKpis";
// import { CustomKpi } from "../types/types";
// import { 
//   doc, 
//   getDoc, 
//   setDoc, 
//   collection, 
//   getDocs, 
//   updateDoc 
// } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
// import { db, storage } from "../services/firebase";
// import {
//   fetchCustomFields,
//   addCustomField,
//   deleteCustomField,
// } from "../services/customFields";
// import { CustomField } from "../types/types";
// import { FaGoogle, FaFacebook, FaWhatsapp } from "react-icons/fa";
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

// const Settings: React.FC = () => {
//   const { currentUser, refreshOnboardingStatus } = useAuth();
//   const [displayName, setDisplayName] = useState(
//     currentUser?.displayName || ""
//   );
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [customKpis, setCustomKpis] = useState<CustomKpi[]>([]);
//   const [newKpiLabel, setNewKpiLabel] = useState("");
//   const [newKpiColor, setNewKpiColor] = useState("purple");
//   const [newKpiIcon, setNewKpiIcon] = useState("home");
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [activeTab, setActiveTab] = useState<
//     "profile" | "kpis" | "fields" | "onboarding" | "users"
//   >("profile");

//   // Add new state variables for custom fields
//   const [newFieldName, setNewFieldName] = useState("");
//   const [newFieldType, setNewFieldType] = useState("text");
//   const [newFieldOptions, setNewFieldOptions] = useState("");
//   const [customFields, setCustomFields] = useState<CustomField[]>([]);

//   // User management state
//   interface TeamMember {
//     id: string;
//     phone: string;
//     role: string;
//     status: string;
//     addedAt?: Date | { seconds: number; nanoseconds: number };
//     addedBy?: string;
//   }
//   const [newUserPhone, setNewUserPhone] = useState("");
//   const [newUserRole, setNewUserRole] = useState("user");
//   const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
//   const [userLoading, setUserLoading] = useState(false);

//   // Onboarding states
//   const [onboardingStep, setOnboardingStep] = useState(1);
//   const [progress, setProgress] = useState(16);
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
//     street: "",
//     city: "",
//     state: "",
//     zip: "",
//     country: "",
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

//   // Define color options
//   const colorOptions = [
//     { value: "purple", name: "Purple", hex: "hsl(var(--primary))" },
//     { value: "yellow", name: "Yellow", hex: "hsl(var(--warning))" },
//     { value: "indigo", name: "Indigo", hex: "#6366F1" },
//     { value: "pink", name: "Pink", hex: "hsl(var(--accent))" },
//     { value: "teal", name: "Teal", hex: "#14B8A6" },
//     { value: "red", name: "Red", hex: "hsl(var(--destructive))" },
//     { value: "green", name: "Green", hex: "hsl(var(--success))" },
//     { value: "blue", name: "Blue", hex: "#3B82F6" },
//   ];

//   // Define icon options
//   const iconOptions = [
//     { value: "home", icon: <Home size={16} /> },
//     { value: "mail", icon: <Mail size={16} /> },
//     { value: "file-text", icon: <FileText size={16} /> },
//     { value: "map-pin", icon: <MapPin size={16} /> },
//     { value: "calendar", icon: <Calendar size={16} /> },
//     { value: "indian-rupee", icon: <IndianRupee size={16} /> },
//     { value: "users", icon: <UsersIcon size={16} /> },
//     { value: "check-circle", icon: <CheckCircle size={16} /> },
//   ];

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

//   // Handle Meta login
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
//         } else {
//           setMetaLoginStatus("error");
//           setMetaStatusMessage("Meta connection failed or canceled");
//           setConnections((prev) => ({ ...prev, meta: false }));
//         }
//       },
//       {
//         scope:
//           "public_profile,email,pages_show_list,pages_read_engagement,leads_retrieval",
//         return_scopes: true,
//       }
//     );
//   }, []);

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
//     setProgress(Math.round((onboardingStep / 6) * 100));
//   }, [onboardingStep]);

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
//     switch (onboardingStep) {
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
//           !userDetails.email
//         ) {
//           setError("Full Name, Username, and Email are required");
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
//       if (onboardingStep < 6) {
//         setOnboardingStep(onboardingStep + 1);
//       } else {
//         submitOnboarding();
//       }
//     }
//   };

//   // Handle skip step
//   const handleSkip = () => {
//     setError("");
//     if (onboardingStep < 6) {
//       setOnboardingStep(onboardingStep + 1);
//     } else {
//       submitOnboarding();
//     }
//   };

//   // Handle previous step
//   const handleBack = () => {
//     setError("");
//     if (onboardingStep > 1) {
//       setOnboardingStep(onboardingStep - 1);
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
//       const userRef = doc(db, "crm_users", cleanPhone);
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

//       setSuccess("Onboarding completed successfully!");
//       setLoading(false);
//     } catch (err) {
//       console.error("Onboarding error:", err);
//       setError(
//         `Failed to complete onboarding: ${
//           (err as Error).message || "Please try again."
//         }`
//       );
//       setLoading(false);
//     }
//   };

//   // Render current onboarding step
//   const renderOnboardingStep = () => {
//     switch (onboardingStep) {
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

//                 {metaLoginStatus === "processing" ? (
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
//                   <div className="font-medium">Profile Photo</div>
//                   <p className="text-sm text-gray-500">JPG, PNG (max 5MB)</p>
//                 </div>
//               </div>

//               {/* Basic Info */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium mb-1">
//                     Full Name
//                   </label>
//                   <input
//                     type="text"
//                     value={userDetails.fullName}
//                     onChange={(e) =>
//                       setUserDetails((prev) => ({
//                         ...prev,
//                         fullName: e.target.value,
//                       }))
//                     }
//                     placeholder="Your full name"
//                     className="block w-full rounded-lg border px-4 py-3"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1">
//                     Phone
//                   </label>
//                   <input
//                     type="tel"
//                     value={userDetails.phone}
//                     disabled
//                     className="block w-full rounded-lg border px-4 py-3 bg-gray-100"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1">
//                     Email
//                   </label>
//                   <input
//                     type="email"
//                     value={userDetails.email}
//                     onChange={(e) =>
//                       setUserDetails((prev) => ({
//                         ...prev,
//                         email: e.target.value,
//                       }))
//                     }
//                     placeholder="Your email address"
//                     className="block w-full rounded-lg border px-4 py-3"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1">
//                     Date of Birth
//                   </label>
//                   <input
//                     type="date"
//                     value={userDetails.dateOfBirth}
//                     onChange={(e) =>
//                       setUserDetails((prev) => ({
//                         ...prev,
//                         dateOfBirth: e.target.value,
//                       }))
//                     }
//                     className="block w-full rounded-lg border px-4 py-3"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1">
//                     Gender (optional)
//                   </label>
//                   <select
//                     value={userDetails.gender}
//                     onChange={(e) =>
//                       setUserDetails((prev) => ({
//                         ...prev,
//                         gender: e.target.value,
//                       }))
//                     }
//                     className="block w-full rounded-lg border px-4 py-3 bg-white"
//                   >
//                     <option value="">Select Gender</option>
//                     <option value="Male">Male</option>
//                     <option value="Female">Female</option>
//                     <option value="Other">Other</option>
//                     <option value="Prefer not to say">Prefer not to say</option>
//                   </select>
//                 </div>
//               </div>

//               {/* Address */}
//               <div className="border-t pt-6 mt-6">
//                 <h3 className="text-lg font-medium text-gray-800 mb-4">
//                   Address Information
//                 </h3>
//                 <div className="grid grid-cols-1 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium mb-1">
//                       Street Address
//                     </label>
//                     <input
//                       type="text"
//                       value={userDetails.street}
//                       onChange={(e) =>
//                         setUserDetails((prev) => ({
//                           ...prev,
//                           street: e.target.value,
//                         }))
//                       }
//                       placeholder="Your street address"
//                       className="block w-full rounded-lg border px-4 py-3"
//                     />
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                     <div>
//                       <label className="block text-sm font-medium mb-1">
//                         City
//                       </label>
//                       <input
//                         type="text"
//                         value={userDetails.city}
//                         onChange={(e) =>
//                           setUserDetails((prev) => ({
//                             ...prev,
//                             city: e.target.value,
//                           }))
//                         }
//                         placeholder="City"
//                         className="block w-full rounded-lg border px-4 py-3"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-1">
//                         State
//                       </label>
//                       <input
//                         type="text"
//                         value={userDetails.state}
//                         onChange={(e) =>
//                           setUserDetails((prev) => ({
//                             ...prev,
//                             state: e.target.value,
//                           }))
//                         }
//                         placeholder="State"
//                         className="block w-full rounded-lg border px-4 py-3"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium mb-1">
//                         ZIP Code
//                       </label>
//                       <input
//                         type="text"
//                         value={userDetails.zip}
//                         onChange={(e) =>
//                           setUserDetails((prev) => ({
//                             ...prev,
//                             zip: e.target.value,
//                           }))
//                         }
//                         placeholder="ZIP"
//                         className="block w-full rounded-lg border px-4 py-3"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium mb-1">
//                       Country
//                     </label>
//                     <input
//                       type="text"
//                       value={userDetails.country}
//                       onChange={(e) =>
//                         setUserDetails((prev) => ({
//                           ...prev,
//                           country: e.target.value,
//                         }))
//                       }
//                       placeholder="Country"
//                       className="block w-full rounded-lg border px-4 py-3"
//                     />
//                   </div>
//                 </div>
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

//       case 6:
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
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   // Step titles for header
//   const stepTitles = [
//     "Welcome",
//     "Select Your Industry",
//     "Connect Your Accounts",
//     "Personal Details",
//     "Upload Documents",
//     "Leads Qualifier",
//   ];

//   // Check admin status and load custom KPIs
//   useEffect(() => {
//     const checkAdmin = async () => {
//       if (currentUser?.phoneNumber) {
//         const sanitizedPhone = currentUser.phoneNumber.replace(/[^\d]/g, "");
//         const userDocRef = doc(db, "crm_users", sanitizedPhone);
//         const docSnap = await getDoc(userDocRef);
//         setIsAdmin(docSnap.exists() && docSnap.data().isAdmin);
//       }
//     };

//     const loadCustomKpis = async () => {
//       if (currentUser?.phoneNumber) {
//         try {
//           const sanitizedPhone = currentUser.phoneNumber.replace(/[^\d]/g, "");
//           const kpis = await fetchCustomKpis(sanitizedPhone);
//           setCustomKpis(kpis);
//         } catch (error) {
//           console.error("Failed to load custom KPIs", error);
//         }
//       }
//     };

//     checkAdmin();
//     loadCustomKpis();
//   }, [currentUser]);

//   // Load team members
//   useEffect(() => {
//     const fetchTeamMembers = async () => {
//       if (currentUser?.phoneNumber && activeTab === "users" && isAdmin) {
//         setUserLoading(true);
//         try {
//           const sanitizedPhone = currentUser.phoneNumber.replace(/[^\d]/g, "");
//           const teamRef = collection(db, "crm_teams", sanitizedPhone, "members");
//           const snapshot = await getDocs(teamRef);
          
//           const members: TeamMember[] = snapshot.docs.map(doc => {
//             const data = doc.data();
//             return {
//               id: doc.id,
//               phone: data.phone ?? "",
//               role: data.role ?? "",
//               status: data.status ?? "",
//               addedAt: data.addedAt,
//               addedBy: data.addedBy,
//             };
//           });
          
//           setTeamMembers(members);
//         } catch (error) {
//           console.error("Error loading team members:", error);
//           setError("Failed to load team members");
//         } finally {
//           setUserLoading(false);
//         }
//       }
//     };

//     fetchTeamMembers();
//   }, [currentUser, activeTab, isAdmin]);

//   const handleUpdateProfile = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!currentUser) return;

//     try {
//       setLoading(true);
//       setError("");
//       setSuccess("");

//       await updateProfile(currentUser, {
//         displayName: displayName,
//       });

//       setSuccess("Profile updated successfully!");
//       setLoading(false);
//     } catch (error) {
//       console.error("Error updating profile:", error);
//       setError("Failed to update profile. Please try again.");
//       setLoading(false);
//     }
//   };

//   const handleAddKpi = async () => {
//     if (!newKpiLabel.trim() || !currentUser?.phoneNumber) return;

//     try {
//       const sanitizedPhone = currentUser.phoneNumber.replace(/[^\d]/g, "");
//       const newKpi = {
//         label: newKpiLabel.trim(),
//         color: newKpiColor,
//         icon: newKpiIcon,
//       };

//       const addedKpi = await addCustomKpi(sanitizedPhone, newKpi);
//       setCustomKpis([...customKpis, addedKpi]);
//       setNewKpiLabel("");
//       setSuccess("Custom KPI added successfully!");
//       setError("");
//     } catch (error) {
//       console.error("Error adding custom KPI:", error);
//       setError("Failed to add custom KPI. Please try again.");
//       setSuccess("");
//     }
//   };

//   const handleDeleteKpi = async (id: string) => {
//     if (!currentUser?.phoneNumber) return;

//     try {
//       const sanitizedPhone = currentUser.phoneNumber.replace(/[^\d]/g, "");
//       await deleteCustomKpi(sanitizedPhone, id);
//       setCustomKpis(customKpis.filter((kpi) => kpi.id !== id));
//       setSuccess("Custom KPI deleted successfully!");
//       setError("");
//     } catch (error) {
//       console.error("Error deleting custom KPI:", error);
//       setError("Failed to delete custom KPI. Please try again.");
//       setSuccess("");
//     }
//   };

//   const handleAddField = async () => {
//     if (!newFieldName.trim() || !currentUser?.phoneNumber) return;

//     try {
//       const sanitizedPhone = currentUser.phoneNumber.replace(/[^\d]/g, "");

//       const newField = {
//         name: newFieldName.trim(),
//         type: newFieldType as
//           | "text"
//           | "number"
//           | "select"
//           | "date"
//           | "checkbox",
//         user_phone: sanitizedPhone,
//         ...(newFieldType === "select" && {
//           options: newFieldOptions.split(",").map((opt) => opt.trim()),
//         }),
//       };

//       const addedField = await addCustomField(sanitizedPhone, newField);
//       setCustomFields([...customFields, addedField]);
//       setNewFieldName("");
//       setNewFieldType("text");
//       setNewFieldOptions("");
//       setSuccess("Custom field added successfully!");
//       setError("");
//     } catch (error) {
//       console.error("Error adding custom field:", error);
//       setError("Failed to add custom field. Please try again.");
//       setSuccess("");
//     }
//   };

//   const handleDeleteField = async (id: string) => {
//     if (!currentUser?.phoneNumber) return;

//     try {
//       const sanitizedPhone = currentUser.phoneNumber.replace(/[^\d]/g, "");
//       await deleteCustomField(sanitizedPhone, id);
//       setCustomFields(customFields.filter((field) => field.id !== id));
//       setSuccess("Custom field deleted successfully!");
//       setError("");
//     } catch (error) {
//       console.error("Error deleting custom field:", error);
//       setError("Failed to delete custom field. Please try again.");
//       setSuccess("");
//     }
//   };

//   useEffect(() => {
//     const loadCustomFields = async () => {
//       if (currentUser?.phoneNumber) {
//         try {
//           const sanitizedPhone = currentUser.phoneNumber.replace(/[^\d]/g, "");
//           const fields = await fetchCustomFields(sanitizedPhone);
//           setCustomFields(fields);
//         } catch (error) {
//           console.error("Failed to load custom fields", error);
//         }
//       }
//     };

//     loadCustomFields();
//   }, [currentUser]);

//   const handleAddUser = async () => {
//     if (!newUserPhone.trim() || !currentUser?.phoneNumber) return;
    
//     setUserLoading(true);
//     setError("");
//     setSuccess("");
    
//     try {
//       const sanitizedAdminPhone = currentUser.phoneNumber.replace(/[^\d]/g, "");
//       const sanitizedUserPhone = newUserPhone.replace(/[^\d]/g, "");
      
//       // Create user document in the team collection
//       const teamRef = doc(db, "crm_teams", sanitizedAdminPhone, "members", sanitizedUserPhone);
//       await setDoc(teamRef, {
//         phone: sanitizedUserPhone,
//         role: newUserRole,
//         addedAt: new Date(),
//         addedBy: sanitizedAdminPhone,
//         status: "pending"
//       });
      
//       // Refresh team members list
//       const teamRefCollection = collection(db, "crm_teams", sanitizedAdminPhone, "members");
//       const snapshot = await getDocs(teamRefCollection);
//       const members: TeamMember[] = snapshot.docs.map(doc => {
//         const data = doc.data();
//         return {
//           id: doc.id,
//           phone: data.phone ?? "",
//           role: data.role ?? "",
//           status: data.status ?? "",
//           addedAt: data.addedAt,
//           addedBy: data.addedBy,
//         };
//       });
      
//       setTeamMembers(members);
//       setNewUserPhone("");
//       setNewUserRole("user");
//       setSuccess("User added successfully! They'll receive an invitation.");
//     } catch (error) {
//       console.error("Error adding user:", error);
//       setError("Failed to add user. Please try again.");
//     } finally {
//       setUserLoading(false);
//     }
//   };

//   const handleRemoveUser = async (userId: string) => {
//     if (!currentUser?.phoneNumber) return;
    
//     setUserLoading(true);
//     setError("");
//     setSuccess("");
    
//     try {
//       const sanitizedAdminPhone = currentUser.phoneNumber.replace(/[^\d]/g, "");
//       const userRef = doc(db, "crm_teams", sanitizedAdminPhone, "members", userId);
      
//       // Instead of deleting, mark as inactive
//       await setDoc(userRef, {
//         status: "removed"
//       }, { merge: true });
      
//       // Update local state to remove the user
//       setTeamMembers(prev => prev.filter(user => user.id !== userId));
//       setSuccess("User removed successfully!");
//     } catch (error) {
//       console.error("Error removing user:", error);
//       setError("Failed to remove user. Please try again.");
//     } finally {
//       setUserLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="bg-card rounded-xl shadow-md border border-border">
//         <div className="border-b border-border">
//           <nav className="flex space-x-8 px-6" aria-label="Tabs">
//             <button
//               onClick={() => setActiveTab("profile")}
//               className={`py-4 px-1 border-b-2 font-medium text-sm ${
//                 activeTab === "profile"
//                   ? "border-primary text-primary"
//                   : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
//               }`}
//             >
//               <div className="flex items-center">
//                 <User className="h-4 w-4 mr-2" />
//                 Profile Settings
//               </div>
//             </button>
//             {isAdmin && (
//               <button
//                 onClick={() => setActiveTab("kpis")}
//                 className={`py-4 px-1 border-b-2 font-medium text-sm ${
//                   activeTab === "kpis"
//                     ? "border-primary text-primary"
//                     : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
//                 }`}
//               >
//                 <div className="flex items-center">
//                   <BarChart2 className="h-4 w-4 mr-2" />
//                   Pipelines Settings
//                   {customKpis.length > 0 && (
//                     <span className="ml-2 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">
//                       {customKpis.length}
//                     </span>
//                   )}
//                 </div>
//               </button>
//             )}

//             <button
//               onClick={() => setActiveTab("fields")}
//               className={`py-4 px-1 border-b-2 font-medium text-sm ${
//                 activeTab === "fields"
//                   ? "border-primary text-primary"
//                   : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
//               }`}
//             >
//               <div className="flex items-center">
//                 <Tag className="h-4 w-4 mr-2" />
//                 Custom Fields
//               </div>
//             </button>

//             {isAdmin && (
//               <button
//                 onClick={() => setActiveTab("onboarding")}
//                 className={`py-4 px-1 border-b-2 font-medium text-sm ${
//                   activeTab === "onboarding"
//                     ? "border-primary text-primary"
//                     : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
//                 }`}
//               >
//                 <div className="flex items-center">
//                   <ClipboardList className="h-4 w-4 mr-2" />
//                   Onboarding
//                 </div>
//               </button>
//             )}

//             {isAdmin && (
//               <button
//                 onClick={() => setActiveTab("users")}
//                 className={`py-4 px-1 border-b-2 font-medium text-sm ${
//                   activeTab === "users"
//                     ? "border-primary text-primary"
//                     : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
//                 }`}
//               >
//                 <div className="flex items-center">
//                   <UserPlus className="h-4 w-4 mr-2" />
//                   Add Users
//                   {teamMembers.length > 0 && (
//                     <span className="ml-2 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">
//                       {teamMembers.length}
//                     </span>
//                   )}
//                 </div>
//               </button>
//             )}
//           </nav>
//         </div>

//         <div className="p-6">
//           {/* Profile Settings Tab */}
//           {activeTab === "profile" && (
//             <div className="space-y-6">
//               {error && (
//                 <div className="p-4 bg-destructive/10 rounded-lg border-l-4 border-destructive">
//                   <div className="flex">
//                     <div className="flex-shrink-0">
//                       <svg
//                         className="h-5 w-5 text-destructive"
//                         xmlns="http://www.w3.org/2000/svg"
//                         viewBox="0 0 20 20"
//                         fill="currentColor"
//                         aria-hidden="true"
//                       >
//                         <path
//                           fillRule="evenodd"
//                           d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                           clipRule="evenodd"
//                         />
//                       </svg>
//                     </div>
//                     <div className="ml-3">
//                       <p className="text-sm text-destructive">{error}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {success && (
//                 <div className="p-4 bg-success/10 rounded-lg border-l-4 border-success">
//                   <div className="flex">
//                     <div className="flex-shrink-0">
//                       <svg
//                         className="h-5 w-5 text-success"
//                         xmlns="http://www.w3.org/2000/svg"
//                         viewBox="0 0 20 20"
//                         fill="currentColor"
//                         aria-hidden="true"
//                       >
//                         <path
//                           fillRule="evenodd"
//                           d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//                           clipRule="evenodd"
//                         />
//                       </svg>
//                     </div>
//                     <div className="ml-3">
//                       <p className="text-sm text-success">{success}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <form onSubmit={handleUpdateProfile} className="space-y-6">
//                 <div className="grid grid-cols-1 gap-6">
//                   {/* Display Name */}
//                   <div>
//                     <label className="block text-sm font-medium text-foreground mb-2">
//                       Display Name
//                     </label>
//                     <div className="relative">
//                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                         <User className="h-5 w-5 text-muted-foreground" />
//                       </div>
//                       <input
//                         type="text"
//                         value={displayName}
//                         onChange={(e) => setDisplayName(e.target.value)}
//                         className="pl-10 w-full rounded-lg border border-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition bg-card text-foreground"
//                         placeholder="Your display name"
//                       />
//                     </div>
//                   </div>

//                   {/* Phone Number */}
//                   <div>
//                     <label className="block text-sm font-medium text-foreground mb-2">
//                       Phone Number
//                     </label>
//                     <div className="relative">
//                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                         <Phone className="h-5 w-5 text-muted-foreground" />
//                       </div>
//                       <input
//                         type="tel"
//                         value={currentUser?.phoneNumber || ""}
//                         disabled
//                         className="pl-10 w-full rounded-lg border border-input px-4 py-3 bg-muted text-muted-foreground focus:outline-none shadow-sm transition cursor-not-allowed"
//                         placeholder="Your phone number"
//                       />
//                     </div>
//                     <p className="mt-2 text-xs text-muted-foreground">
//                       Phone number cannot be changed as it's used for
//                       authentication.
//                     </p>
//                   </div>
//                 </div>

//                 <div className="pt-4">
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className={`w-full md:w-auto flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm transition-all ${
//                       loading
//                         ? "bg-muted text-muted-foreground cursor-not-allowed"
//                         : "bg-primary text-primary-foreground hover:bg-primary/90"
//                     }`}
//                   >
//                     {loading ? (
//                       <>
//                         <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                         Saving...
//                       </>
//                     ) : (
//                       "Save Profile Changes"
//                     )}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           )}

//           {/* Custom KPIs Tab */}
//           {activeTab === "kpis" && isAdmin && (
//             <div className="space-y-6">
//               <div className="bg-muted rounded-xl p-5 border border-border">
//                 <div className="flex items-center mb-4">
//                   <div className="bg-primary/10 p-2 rounded-lg mr-3">
//                     <Plus className="h-5 w-5 text-primary" />
//                   </div>
//                   <h3 className="text-lg font-medium text-foreground">
//                     Create new pipeline stage
//                   </h3>
//                 </div>

//                 <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//                   <div className="lg:col-span-2">
//                     <label className="block text-sm font-medium text-foreground mb-2">
//                       Stage Name
//                     </label>
//                     <div className="relative">
//                       <input
//                         type="text"
//                         value={newKpiLabel}
//                         onChange={(e) => setNewKpiLabel(e.target.value)}
//                         className="w-full rounded-lg border border-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition bg-card text-foreground"
//                         placeholder="e.g., Site Visit, Proposal Sent"
//                       />
//                       {newKpiLabel && (
//                         <button
//                           type="button"
//                           onClick={() => setNewKpiLabel("")}
//                           className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
//                         >
//                           <X className="h-4 w-4" />
//                         </button>
//                       )}
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-foreground mb-2">
//                       Select Icon
//                     </label>
//                     <div className="grid grid-cols-4 gap-2">
//                       {iconOptions.map((option) => (
//                         <button
//                           key={option.value}
//                           type="button"
//                           onClick={() => setNewKpiIcon(option.value)}
//                           className={`p-3 rounded-xl flex flex-col items-center justify-center transition-all ${
//                             newKpiIcon === option.value
//                               ? "bg-primary/10 border-2 border-primary shadow-sm"
//                               : "bg-card border border-border hover:bg-muted"
//                           }`}
//                         >
//                           {option.icon}
//                         </button>
//                       ))}
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-foreground mb-2">
//                       Select Color
//                     </label>
//                     <div className="grid grid-cols-4 gap-2">
//                       {colorOptions.map((color) => (
//                         <button
//                           key={color.value}
//                           type="button"
//                           onClick={() => setNewKpiColor(color.value)}
//                           className={`h-10 rounded-lg flex items-center justify-center transition-all ${
//                             newKpiColor === color.value
//                               ? "ring-2 ring-offset-2 ring-primary"
//                               : "hover:opacity-90"
//                           }`}
//                           style={{ backgroundColor: color.hex }}
//                           title={color.name}
//                         >
//                           {newKpiColor === color.value && (
//                             <Check className="h-4 w-4 text-white" />
//                           )}
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={handleAddKpi}
//                   disabled={!newKpiLabel.trim()}
//                   className={`mt-6 w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm transition-all ${
//                     !newKpiLabel.trim()
//                       ? "bg-muted text-muted-foreground cursor-not-allowed"
//                       : "bg-primary text-primary-foreground hover:bg-primary/90"
//                   }`}
//                 >
//                   <Plus className="h-5 w-5 mr-2" />
//                   Add pipeline Stage
//                 </button>
//               </div>

//               <div>
//                 <div className="flex items-center mb-4">
//                   <div className="bg-success/10 p-2 rounded-lg mr-3">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-5 w-5 text-success"
//                       viewBox="0 0 20 20"
//                       fill="currentColor"
//                     >
//                       <path
//                         fillRule="evenodd"
//                         d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//                         clipRule="evenodd"
//                       />
//                     </svg>
//                   </div>
//                   <h3 className="text-lg font-medium text-foreground">
//                     Your custom stages
//                   </h3>
//                 </div>

//                 {customKpis.length === 0 ? (
//                   <div className="text-center py-8 rounded-xl border-2 border-dashed border-border">
//                     <div className="bg-muted border-2 border-dashed rounded-xl w-16 h-16 mx-auto flex items-center justify-center">
//                       <Plus className="h-8 w-8 text-muted-foreground" />
//                     </div>
//                     <h3 className="mt-4 text-lg font-medium text-foreground">
//                       No custom pipelines created
//                     </h3>
//                     <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
//                       Create your first custom pipeline stage to track unique
//                       lead stages beyond the default metrics.
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {customKpis.map((kpi) => {
//                       const color =
//                         colorOptions.find((c) => c.value === kpi.color) ||
//                         colorOptions[0];
//                       const icon =
//                         iconOptions.find((i) => i.value === kpi.icon) ||
//                         iconOptions[0];

//                       return (
//                         <div
//                           key={kpi.id}
//                           className="border border-border rounded-xl p-4 flex items-center justify-between transition-all hover:shadow-md bg-card"
//                         >
//                           <div className="flex items-center">
//                             <div
//                               className="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
//                               style={{ backgroundColor: `${color.hex}20` }}
//                             >
//                               <div style={{ color: color.hex }}>
//                                 {icon.icon}
//                               </div>
//                             </div>
//                             <div>
//                               <h4 className="font-medium text-foreground">
//                                 {kpi.label}
//                               </h4>
//                               <p className="text-sm text-muted-foreground mt-1">
//                                 <span
//                                   className="inline-block w-3 h-3 rounded-full mr-1"
//                                   style={{ backgroundColor: color.hex }}
//                                 ></span>
//                                 {color.name}
//                               </p>
//                             </div>
//                           </div>
//                           <button
//                             type="button"
//                             onClick={() => handleDeleteKpi(kpi.id)}
//                             className="text-muted-foreground hover:text-destructive transition-colors p-2"
//                             title="Delete KPI"
//                           >
//                             <X className="h-5 w-5" />
//                           </button>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}

//                 {customKpis.length > 0 && (
//                   <div className="mt-6 bg-primary/10 rounded-lg p-4 border border-primary/20">
//                     <div className="flex">
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
//                         viewBox="0 0 20 20"
//                         fill="currentColor"
//                       >
//                         <path
//                           fillRule="evenodd"
//                           d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
//                           clipRule="evenodd"
//                         />
//                       </svg>
//                       <p className="ml-3 text-sm text-primary">
//                         Custom stages will appear as cards on your dashboard and
//                         as status options in leads table.
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Custom Fields Tab */}
//           {activeTab === "fields" && isAdmin && (
//             <div className="space-y-6">
//               <div className="bg-muted rounded-xl p-5 border border-border">
//                 <div className="flex items-center mb-4">
//                   <div className="bg-primary/10 p-2 rounded-lg mr-3">
//                     <Plus className="h-5 w-5 text-primary" />
//                   </div>
//                   <h3 className="text-lg font-medium text-foreground">
//                     Create New Custom Field
//                   </h3>
//                 </div>

//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-foreground mb-2">
//                       Field Name
//                     </label>
//                     <input
//                       type="text"
//                       value={newFieldName}
//                       onChange={(e) => setNewFieldName(e.target.value)}
//                       className="w-full rounded-lg border border-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition bg-card text-foreground"
//                       placeholder="e.g., Location, Budget"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-foreground mb-2">
//                       Field Type
//                     </label>
//                     <select
//                       value={newFieldType}
//                       onChange={(e) => setNewFieldType(e.target.value)}
//                       className="w-full rounded-lg border border-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition bg-card text-foreground"
//                     >
//                       <option value="text">Text</option>
//                       <option value="number">Number</option>
//                       <option value="select">Dropdown</option>
//                       <option value="date">Date</option>
//                       <option value="checkbox">Checkbox</option>
//                     </select>
//                   </div>

//                   {newFieldType === "select" && (
//                     <div>
//                       <label className="block text-sm font-medium text-foreground mb-2">
//                         Options (comma separated)
//                       </label>
//                       <input
//                         type="text"
//                         value={newFieldOptions}
//                         onChange={(e) => setNewFieldOptions(e.target.value)}
//                         className="w-full rounded-lg border border-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition bg-card text-foreground"
//                         placeholder="e.g., Option1, Option2"
//                       />
//                     </div>
//                   )}
//                 </div>

//                 <button
//                   onClick={handleAddField}
//                   className="mt-6 w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 transition-all"
//                 >
//                   <Plus className="h-5 w-5 mr-2" />
//                   Add Custom Field
//                 </button>
//               </div>

//               <div>
//                 <div className="flex items-center mb-4">
//                   <div className="bg-success/10 p-2 rounded-lg mr-3">
//                     <Tag className="h-5 w-5 text-success" />
//                   </div>
//                   <h3 className="text-lg font-medium text-foreground">
//                     Your Custom Fields
//                   </h3>
//                 </div>

//                 {customFields.length === 0 ? (
//                   <div className="text-center py-8 rounded-xl border-2 border-dashed border-border">
//                     <div className="bg-muted border-2 border-dashed rounded-xl w-16 h-16 mx-auto flex items-center justify-center">
//                       <Plus className="h-8 w-8 text-muted-foreground" />
//                     </div>
//                     <h3 className="mt-4 text-lg font-medium text-foreground">
//                       No custom fields created
//                     </h3>
//                     <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
//                       Create custom fields to store additional information about
//                       your leads.
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="overflow-x-auto">
//                     <table className="min-w-full divide-y divide-border">
//                       <thead className="bg-muted">
//                         <tr>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
//                             Field Name
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
//                             Type
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
//                             Options
//                           </th>
//                           <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
//                             Actions
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody className="bg-card divide-y divide-border">
//                         {customFields.map((field) => (
//                           <tr key={field.id}>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
//                               {field.name}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
//                               {field.type}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
//                               {field.options ? field.options.join(", ") : "-"}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                               <button
//                                 onClick={() => handleDeleteField(field.id)}
//                                 className="text-destructive hover:text-destructive/80"
//                               >
//                                 Delete
//                               </button>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Onboarding Tab */}
//           {activeTab === "onboarding" && isAdmin && (
//             <div className="space-y-6">
//               {error && (
//                 <div className="p-4 bg-destructive/10 rounded-lg border-l-4 border-destructive">
//                   <div className="flex">
//                     <div className="flex-shrink-0">
//                       <AlertCircle className="h-5 w-5 text-destructive" />
//                     </div>
//                     <div className="ml-3">
//                       <p className="text-sm text-destructive">{error}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {success && (
//                 <div className="p-4 bg-success/10 rounded-lg border-l-4 border-success">
//                   <div className="flex">
//                     <div className="flex-shrink-0">
//                       <CheckCircleIcon className="h-5 w-5 text-success" />
//                     </div>
//                     <div className="ml-3">
//                       <p className="text-sm text-success">{success}</p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div className="bg-gradient-to-r from-primary/10 to-indigo-50 dark:to-indigo-900/10 rounded-xl p-5 border border-primary/20">
//                 <div className="mb-6">
//                   <p className="text-sm text-muted-foreground">Step {onboardingStep} of 6</p>
//                   <h2 className="text-xl font-bold text-foreground">
//                     {stepTitles[onboardingStep - 1]}
//                   </h2>
//                 </div>

//                 {/* Progress Bar */}
//                 <div className="h-2 bg-gray-200 mb-6">
//                   <div
//                     className="h-full bg-primary transition-all duration-500 ease-in-out"
//                     style={{ width: `${progress}%` }}
//                   ></div>
//                 </div>

//                 <div className="mb-8">
//                   {renderOnboardingStep()}
//                 </div>

//                 <div className="flex justify-between items-center">
//                   <div>
//                     {onboardingStep > 1 && (
//                       <button
//                         type="button"
//                         onClick={handleBack}
//                         disabled={loading}
//                         className="flex items-center px-5 py-2.5 rounded-lg border border-input text-foreground hover:bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed"
//                       >
//                         <ArrowLeft size={18} className="mr-2" />
//                         Back
//                       </button>
//                     )}
//                   </div>

//                   <div className="flex items-center space-x-3">
//                     {onboardingStep >= 2 && onboardingStep <= 6 && (
//                       <button
//                         type="button"
//                         onClick={handleSkip}
//                         disabled={loading}
//                         className="px-5 py-2.5 rounded-lg border border-input text-foreground hover:bg-muted transition disabled:opacity-50"
//                       >
//                         Skip
//                       </button>
//                     )}

//                     <button
//                       type="button"
//                       onClick={handleNext}
//                       disabled={loading}
//                       className={`flex items-center px-5 py-2.5 rounded-lg text-primary-foreground transition ${
//                         loading
//                           ? "bg-primary/70 cursor-not-allowed"
//                           : "bg-primary hover:bg-primary/90"
//                       }`}
//                     >
//                       {onboardingStep === 6 ? "Complete Setup" : "Next Step"}
//                       {onboardingStep < 6 && <ArrowRight size={18} className="ml-2" />}
//                       {loading && (
//                         <Loader2 className="h-4 w-4 ml-2 animate-spin" />
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Add Users Tab */}
//           {/* {activeTab === "users" && isAdmin && (
//             <div className="space-y-6">
//               <div className="bg-muted rounded-xl p-5 border border-border">
//                 <div className="flex items-center mb-4">
//                   <div className="bg-primary/10 p-2 rounded-lg mr-3">
//                     <UserPlus className="h-5 w-5 text-primary" />
//                   </div>
//                   <h3 className="text-lg font-medium text-foreground">
//                     Add New User
//                   </h3>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-foreground mb-2">
//                       Phone Number
//                     </label>
//                     <div className="relative">
//                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                         <Phone className="h-5 w-5 text-muted-foreground" />
//                       </div>
//                       <input
//                         type="tel"
//                         value={newUserPhone}
//                         onChange={(e) => setNewUserPhone(e.target.value)}
//                         className="pl-10 w-full rounded-lg border border-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition bg-card text-foreground"
//                         placeholder="User's phone number"
//                       />
//                     </div>
//                     <p className="mt-2 text-xs text-muted-foreground">
//                       User will receive an invitation to join your team
//                     </p>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-foreground mb-2">
//                       Role
//                     </label>
//                     <select
//                       value={newUserRole}
//                       onChange={(e) => setNewUserRole(e.target.value)}
//                       className="w-full rounded-lg border border-input px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition bg-card text-foreground"
//                     >
//                       <option value="user">User</option>
//                       <option value="admin">Admin</option>
//                     </select>
//                     <p className="mt-2 text-xs text-muted-foreground">
//                       Admins can manage team settings and configurations
//                     </p>
//                   </div>
//                 </div>

//                 <button
//                   onClick={handleAddUser}
//                   disabled={!newUserPhone.trim() || userLoading}
//                   className={`mt-6 w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm transition-all ${
//                     !newUserPhone.trim() || userLoading
//                       ? "bg-muted text-muted-foreground cursor-not-allowed"
//                       : "bg-primary text-primary-foreground hover:bg-primary/90"
//                   }`}
//                 >
//                   {userLoading ? (
//                     <Loader2 className="h-5 w-5 mr-2 animate-spin" />
//                   ) : (
//                     <Plus className="h-5 w-5 mr-2" />
//                   )}
//                   {userLoading ? "Adding User..." : "Add User"}
//                 </button>
//               </div>

//               <div>
//                 <div className="flex items-center mb-4">
//                   <div className="bg-success/10 p-2 rounded-lg mr-3">
//                     <UsersIcon className="h-5 w-5 text-success" />
//                   </div>
//                   <h3 className="text-lg font-medium text-foreground">
//                     Team Members
//                   </h3>
//                 </div>

//                 {userLoading && teamMembers.length === 0 ? (
//                   <div className="text-center py-8">
//                     <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
//                     <p className="mt-2 text-muted-foreground">Loading team members...</p>
//                   </div>
//                 ) : teamMembers.length === 0 ? (
//                   <div className="text-center py-8 rounded-xl border-2 border-dashed border-border">
//                     <div className="bg-muted border-2 border-dashed rounded-xl w-16 h-16 mx-auto flex items-center justify-center">
//                       <UsersIcon className="h-8 w-8 text-muted-foreground" />
//                     </div>
//                     <h3 className="mt-4 text-lg font-medium text-foreground">
//                       No team members added
//                     </h3>
//                     <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
//                       Add team members to collaborate on your leads and customers.
//                     </p>
//                   </div>
//                 ) : (
//                   <div className="overflow-x-auto">
//                     <table className="min-w-full divide-y divide-border">
//                       <thead className="bg-muted">
//                         <tr>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
//                             Phone Number
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
//                             Role
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
//                             Status
//                           </th>
//                           <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
//                             Actions
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody className="bg-card divide-y divide-border">
//                         {teamMembers.map((user) => (
//                           <tr key={user.id}>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
//                               {user.phone}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
//                               <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                                 user.role === "admin" 
//                                   ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300" 
//                                   : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
//                               }`}>
//                                 {user.role === "admin" ? "Admin" : "User"}
//                               </span>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
//                               <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                                 user.status === "active" 
//                                   ? "bg-success/10 text-success" 
//                                   : user.status === "pending"
//                                   ? "bg-warning/10 text-warning"
//                                   : "bg-destructive/10 text-destructive"
//                               }`}>
//                                 {user.status}
//                               </span>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                               <button
//                                 onClick={() => handleRemoveUser(user.id)}
//                                 className="text-destructive hover:text-destructive/80"
//                                 disabled={userLoading}
//                               >
//                                 Remove
//                               </button>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )} */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Settings;


