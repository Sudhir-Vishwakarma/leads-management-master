import React, { useState, useMemo, useEffect, useRef } from "react";
import { format, parseISO, parse, isValid } from "date-fns";
import { Lead } from "../../types";
import { CustomKpi, CustomField } from "../../types/types";
import {
  ChevronDown,
  Check,
  Edit,
  X,
  MessageSquare,
  MessagesSquare,
  MessageCircle,
  User,
  Award,
  Calendar,
  Tag,
  Snowflake,
} from "lucide-react";
import {
  updateLeadStatus,
  scheduleFollowUp,
  appendCustomerComment,
} from "../../services/api";
import { SyncLoader } from "react-spinners";
import { FaBell, FaWhatsapp, FaFacebookF, FaInstagram } from "react-icons/fa";
import { CollapsibleQualifierSection } from "../../../src/components/collapsiblesection";
import { updateLeadCustomField } from "../../services/api";
import { useCustomerType } from "../../context/CustomerTypeContext";
import { useNotification } from "../../context/NotificationContext";
import { subscribeToLeads } from "../../services/firebase";

interface LeadsTableProps {
  leads: Lead[];
  onStatusUpdate: (index: string, newStatus: string) => void;
  onFollowUpScheduled: (leadId: string, date: string, time: string) => void;
  onUpdateCustomerComment: (leadId: string, comment: string) => void;
  isLoading?: boolean;
  viewingUserPhone: string;
  viewingUserDisplayName: string;
  customKpis: CustomKpi[];
  customFields?: CustomField[];
  onUpdateCustomField: (
    leadId: string,
    fieldName: string,
    newValue: unknown
  ) => void;
  addToMeet: (lead: {
    name: string;
    contact: string;
    date: string;
    time: string;
  }) => void;
}

const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  onStatusUpdate,
  onFollowUpScheduled,
  onUpdateCustomerComment,
  isLoading = false,
  viewingUserPhone,
  viewingUserDisplayName,
  customKpis,
  customFields = [],
  onUpdateCustomField,
  addToMeet,
}) => {
  const { customerTypes, setCustomerType } = useCustomerType();
  const { addNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [followUpLeadId, setFollowUpLeadId] = useState<string | null>(null);
  const [followUpDate, setFollowUpDate] = useState<string>("");
  const [followUpTime, setFollowUpTime] = useState<string>("");
  const [customerComment, setCustomerComment] = useState("");
  const [activeTab, setActiveTab] = useState<
    "Overview" | "Contact" | "Qualifiers" | "Comments"
  >("Overview");
  const [commentsHistory, setCommentsHistory] = useState<CommentHistoryItem[]>(
    []
  );
  const [statusUpdateModalOpen, setStatusUpdateModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [leadForStatusUpdate, setLeadForStatusUpdate] = useState<string | null>(
    null
  );
  const [openSectionKey, setOpenSectionKey] = useState<string | null>(
    "customerType"
  );
  const [scheduledLeads, setScheduledLeads] = useState<Record<string, boolean>>(
    {}
  );
  const [updatingRemark, setUpdatingRemark] = useState<string | null>(null);
  const [remarkUpdateModalOpen, setRemarkUpdateModalOpen] = useState(false);
  const [selectedRemark, setSelectedRemark] = useState<string>("");
  const [leadForRemarkUpdate, setLeadForRemarkUpdate] = useState<string | null>(
    null
  );
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const timerRefs = useRef<Record<string, NodeJS.Timeout>>({});

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timerRefs.current).forEach(clearInterval);
    };
  }, []);

  // Remarks options
  const remarkOptions = [
    "DNP/DNC",
    "Interested",
    "Qualifier Issue",
    "Location Issue",
    "Targeting Issue",
    "Not Interested",
  ];

  // Handle remark update
  const handleRemarkSelection = (leadId: string, remark: string) => {
    if (remark === "DNP/DNC" || remark === "Interested") {
      // Open follow-up popup
      setLeadForRemarkUpdate(leadId);
      setSelectedRemark(remark);
      setFollowUpLeadId(leadId);
    } else {
      // Open comment modal
      setLeadForRemarkUpdate(leadId);
      setSelectedRemark(remark);
      setRemarkUpdateModalOpen(true);
    }
  };

  useEffect(() => {
    if (!viewingUserPhone) return;

    const unsubscribe = subscribeToLeads(viewingUserPhone, (newLeads) => {
      setLeads(newLeads);
    });

    return () => unsubscribe();
  }, [viewingUserPhone]);

  const handleRemarkUpdateSubmit = async (comment: string) => {
    if (!leadForRemarkUpdate || !selectedRemark) return;

    setUpdatingRemark(leadForRemarkUpdate);
    setRemarkUpdateModalOpen(false);

    try {
      // Update remark field
      await updateLeadCustomField(
        leadForRemarkUpdate,
        "remark",
        selectedRemark,
        viewingUserPhone
      );
      onUpdateCustomField(leadForRemarkUpdate, "remark", selectedRemark);

      // Add comment if provided
      if (comment.trim()) {
        const newComment: CommentHistoryItem = {
          user: viewingUserPhone,
          displayName: viewingUserDisplayName,
          content: `Remark updated to ${selectedRemark}: ${comment.trim()}`,
          timestamp: new Date().toISOString(),
        };

        await appendCustomerComment(
          leadForRemarkUpdate,
          newComment,
          viewingUserPhone
        );
      }
    } catch (error) {
      console.error("Error updating remark:", error);
    } finally {
      setUpdatingRemark(null);
    }
  };

  interface CommentHistoryItem {
    user: string;
    displayName: string;
    content: string;
    timestamp: string;
  }

  const toggleSection = (section: string) => {
    setOpenSectionKey((prev) => (prev === section ? null : section));
  };

  // Notification for new leads //
  useEffect(() => {
    if (leads.length > 0) {
      const recentLead = leads[0];
      const leadDate = recentLead.created_time
        ? new Date(recentLead.created_time)
        : new Date();
      const now = new Date();
      const diffSeconds = (now.getTime() - leadDate.getTime()) / 1000;

      if (diffSeconds < 10) {
        addNotification({
          type: "lead",
          title: "New Lead Added",
          message: `${
            recentLead.name || "A new lead"
          } has been added to your dashboard`,
          link: `/dashboard`,
        });
      }
    }
  }, [leads, addNotification]);

  const handleSaveCustomField = async (
    leadId: string,
    fieldName: string,
    newValue: unknown
  ) => {
    if (!selectedLead) return;

    try {
      await updateLeadCustomField(
        leadId,
        fieldName,
        newValue,
        viewingUserPhone
      );

      onUpdateCustomField(leadId, fieldName, newValue);

      setSelectedLead({
        ...selectedLead,
        [fieldName]: newValue as string | number | boolean | undefined,
      });
    } catch (error) {
      console.error("Error updating custom field:", error);
      alert("Failed to update field. Please try again.");
    }
  };

  const EditableField = ({
    leadId,
    field,
    value,
  }: {
    leadId: string;
    field: CustomField;
    value: unknown;
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);

    useEffect(() => {
      setEditValue(value);
    }, [value]);

    const handleSave = () => {
      handleSaveCustomField(leadId, field.name, editValue);
      setIsEditing(false);
    };

    const handleCancel = () => {
      setEditValue(value);
      setIsEditing(false);
    };

    return (
      <div className="flex items-center group">
        <div className="w-32 flex-shrink-0 text-muted-foreground truncate">
          {field.name}
        </div>
        <div className="font-medium text-foreground truncate flex-1">
          {isEditing ? (
            <div className="flex items-center">
              {field.type === "select" ? (
                <select
                  value={String(editValue)}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="border border-input rounded px-2 py-1 text-sm w-full"
                >
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === "checkbox" ? (
                <input
                  type="checkbox"
                  checked={Boolean(editValue)}
                  onChange={(e) => setEditValue(e.target.checked)}
                  className="ml-2"
                />
              ) : field.type === "date" ? (
                <input
                  type="date"
                  value={String(editValue)}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="border border-input rounded px-2 py-1 text-sm"
                />
              ) : (
                <input
                  type="text"
                  value={String(editValue)}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="border border-input rounded px-2 py-1 text-sm w-full"
                  autoFocus
                />
              )}
              <button
                onClick={handleSave}
                className="ml-2 text-success hover:text-success/80"
              >
                <Check size={16} />
              </button>
              <button
                onClick={handleCancel}
                className="ml-1 text-destructive hover:text-destructive/80"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              <span className="truncate">
                {formatCustomFieldValue(value, field.type)}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="ml-2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const itemsPerPage = 20;

  const statusOptions = useMemo(() => {
    const customStatuses = customKpis.map((kpi) => kpi.label);
    return ["New Lead", "Meeting Done", "Deal Done", ...customStatuses];
  }, [customKpis]);

  useEffect(() => {
    if (selectedLead) {
      if (
        Array.isArray(selectedLead.customerComments) &&
        selectedLead.customerComments.length > 0
      ) {
        setCommentsHistory(selectedLead.customerComments);
      } else {
        setCommentsHistory([]);
      }
      setCustomerComment("");
    }
  }, [selectedLead]);

  const getPlatformInfo = (platform: string | undefined) => {
    if (!platform) return { icon: null, color: "bg-muted text-foreground" };

    const platformLower = platform.toLowerCase();

    if (platformLower === "ig")
      return {
        icon: <FaInstagram className="w-3 h-3" />,
        color:
          "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
      };

    if (platformLower === "fb")
      return {
        icon: <FaFacebookF className="w-3 h-3" />,
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      };

    if (platformLower === "wa")
      return {
        icon: <FaWhatsapp className="w-3 h-3" />,
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      };

    if (platformLower.includes("facebook"))
      return {
        icon: <FaFacebookF className="w-3 h-3" />,
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      };

    if (platformLower.includes("instagram"))
      return {
        icon: <FaInstagram className="w-3 h-3" />,
        color:
          "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
      };

    if (platformLower.includes("google"))
      return {
        icon: <MessageSquare className="w-3 h-3" />,
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      };

    if (platformLower.includes("zalo"))
      return {
        icon: <MessagesSquare className="w-3 h-3" />,
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      };

    if (platformLower.includes("tiktok"))
      return {
        icon: <MessageCircle className="w-3 h-3" />,
        color: "bg-black text-white dark:bg-gray-800 dark:text-gray-200",
      };

    if (platformLower.includes("whatsapp"))
      return {
        icon: <FaWhatsapp className="w-3 h-3" />,
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      };

    return {
      icon: (
        <span className="text-xs font-bold">
          {platform.substring(0, 2).toUpperCase()}
        </span>
      ),
      color: "bg-muted text-foreground",
    };
  };

  const handleStatusSelection = async (leadId: string, status: string) => {
    setLeadForStatusUpdate(leadId);
    setSelectedStatus(status);
    setStatusUpdateModalOpen(true);
  };

  const handleStatusUpdateSubmit = async (comment: string) => {
    if (!leadForStatusUpdate || !selectedStatus) return;

    setUpdatingStatus(leadForStatusUpdate);
    setStatusUpdateModalOpen(false);

    try {
      await updateLeadStatus(
        leadForStatusUpdate,
        selectedStatus,
        viewingUserPhone
      );
      onStatusUpdate(leadForStatusUpdate, selectedStatus);

      if (comment.trim()) {
        const newComment: CommentHistoryItem = {
          user: viewingUserPhone,
          displayName: viewingUserDisplayName,
          content: `Status updated to ${selectedStatus}: ${comment.trim()}`,
          timestamp: new Date().toISOString(),
        };

        await appendCustomerComment(
          leadForStatusUpdate,
          newComment,
          viewingUserPhone
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // --- Improved Follow-up Scheduling Logic ---
  const handleSchedule = async (leadId: string) => {
    if (!followUpDate || !followUpTime) return;
    try {
      if (followUpDate) {
        await scheduleFollowUp(
          leadId,
          new Date(followUpDate),
          followUpTime,
          viewingUserPhone
        );
        onFollowUpScheduled(leadId, followUpDate, followUpTime);
      }

      // Find the lead that was scheduled
      const scheduledLead = leads.find((lead) => lead.id === leadId);
      if (scheduledLead) {
        addToMeet({
          name: scheduledLead.name || "Unnamed Lead",
          contact: scheduledLead.whatsapp_number_ || "N/A",
          date: followUpDate,
          time: followUpTime,
        });
      }

      setScheduledLeads((prev) => ({ ...prev, [leadId]: true }));
      setFollowUpLeadId(null);

      // Update remark if it was set via remark selection
      if (leadForRemarkUpdate && selectedRemark) {
        await updateLeadCustomField(
          leadForRemarkUpdate,
          "remark",
          selectedRemark,
          viewingUserPhone
        );
        onUpdateCustomField(leadForRemarkUpdate, "remark", selectedRemark);
        setLeadForRemarkUpdate(null);
        setSelectedRemark("");
      }
    } catch (error) {
      console.error("Error scheduling follow-up:", error);
    }
  };

  const handleFollowUpClick = (leadId: string) => {
    if (followUpLeadId === leadId) {
      setFollowUpLeadId(null);
    } else {
      const lead = leads.find((l) => l.id === leadId);
      setFollowUpLeadId(leadId);
      setFollowUpDate(lead?.followUpDate ? String(lead.followUpDate) : "");
      setFollowUpTime(lead?.followUpTime ? String(lead.followUpTime) : "");
    }
  };

  const openSidePanel = (lead: Lead) => {
    setSelectedLead(lead);
    setIsSidePanelOpen(true);
    setOpenSectionKey("customerType");
  };

  const closeSidePanel = () => {
    setIsSidePanelOpen(false);
    setSelectedLead(null);
  };

  const handleSaveCustomerComment = async () => {
    if (selectedLead && customerComment.trim()) {
      try {
        const user = viewingUserPhone || "User";
        const newComment: CommentHistoryItem = {
          user,
          displayName: viewingUserDisplayName,
          content: customerComment.trim(),
          timestamp: new Date().toISOString(),
        };

        await appendCustomerComment(
          selectedLead.id!,
          newComment,
          viewingUserPhone
        );

        onUpdateCustomerComment(selectedLead.id!, customerComment);

        let updatedComments = [...commentsHistory, newComment];
        if (updatedComments.length > 30) {
          updatedComments = updatedComments.slice(updatedComments.length - 30);
        }
        setCommentsHistory(updatedComments);
        setCustomerComment("");
      } catch (error) {
        console.error("Failed to save comment:", error);
        alert("Failed to save comment. Please try again.");
      }
    }
  };

  const [sortingConfig, setSortingConfig] = useState<{
    field: "date" | "name" | "score" | null;
    direction: "asc" | "desc";
  }>({
    field: null,
    direction: "asc",
  });

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const search = searchTerm.trim().toLowerCase();

      const matchesSearch =
        lead.name?.toLowerCase().includes(search) ||
        String(lead.whatsapp_number_ || "").includes(search) ||
        lead.comments?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" || lead.lead_status === statusFilter;

      const matchesPlatform =
        platformFilter === "all" || lead.platform === platformFilter;

      return matchesSearch && matchesStatus && matchesPlatform;
    });
  }, [leads, searchTerm, statusFilter, platformFilter]);

  const parseLeadScore = (comments: string): number | null => {
    const match = comments.match(/🏆 Lead Score: (\d+)/);
    return match ? parseInt(match[1], 10) : null;
  };

  const handleSort = (field: "date" | "name" | "score") => {
    let direction: "asc" | "desc" = "asc";
    if (sortingConfig.field === field) {
      direction = sortingConfig.direction === "asc" ? "desc" : "asc";
    }
    setSortingConfig({ field, direction });
  };

  const parseLeadDate = (dateStr: string | undefined): Date | null => {
    if (!dateStr) return null;

    try {
      const isoDate = parseISO(dateStr);
      if (isValid(isoDate)) return isoDate;
    } catch {
      // Ignore parseISO errors
    }

    try {
      const customDate = parse(dateStr, "MMM dd, yyyy hh:mm a", new Date());
      if (isValid(customDate)) return customDate;
    } catch {
      // Ignore parse errors
    }

    return null;
  };

  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      if (sortingConfig.field) {
        let valueA: string | number | Date | null = null;
        let valueB: string | number | Date | null = null;

        switch (sortingConfig.field) {
          case "date":
            valueA = a.created_time ? parseLeadDate(a.created_time) : null;
            valueB = b.created_time ? parseLeadDate(b.created_time) : null;
            break;
          case "name":
            valueA = (a.name || "").toLowerCase();
            valueB = (b.name || "").toLowerCase();
            break;
          case "score":
            valueA = parseLeadScore(a.comments || "") ?? -Infinity;
            valueB = parseLeadScore(b.comments || "") ?? -Infinity;
            break;
        }

        if (sortingConfig.field === "date") {
          const aTime =
            valueA instanceof Date && !isNaN(valueA.getTime())
              ? valueA.getTime()
              : 0;
          const bTime =
            valueB instanceof Date && !isNaN(valueB.getTime())
              ? valueB.getTime()
              : 0;
          return sortingConfig.direction === "asc"
            ? aTime - bTime
            : bTime - aTime;
        }

        if (valueA == null && valueB == null) {
          return 0;
        }
        if (valueA == null) {
          return sortingConfig.direction === "asc" ? 1 : -1;
        }
        if (valueB == null) {
          return sortingConfig.direction === "asc" ? -1 : 1;
        }
        if (valueA < valueB) {
          return sortingConfig.direction === "asc" ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortingConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      }

      const aDate = a.created_time ? parseLeadDate(a.created_time) : null;
      const bDate = b.created_time ? parseLeadDate(b.created_time) : null;
      const aTime = aDate ? aDate.getTime() : 0;
      const bTime = bDate ? bDate.getTime() : 0;
      return bTime - aTime;
    });
  }, [filteredLeads, sortingConfig]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = sortedLeads.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const formatDate = (dateString: string) => {
    const date = parseLeadDate(dateString);
    if (date) {
      return format(date, "MMM dd, yyyy hh:mm a");
    }
    return dateString;
  };

  const extractLocation = (comments: string) => {
    const locationMatch = comments.match(/📍 Location: ([^\n]+)/);
    return locationMatch ? locationMatch[1] : "N/A";
  };

  const extractScore = (comments: string) => {
    const scoreMatch = comments.match(/🏆 Lead Score: (\d+)/);
    return scoreMatch ? parseInt(scoreMatch[1], 10) : null;
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score < 50) return "text-destructive font-bold";
    if (score >= 50 && score <= 70) return "text-warning font-bold";
    return "text-success font-bold";
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return "bg-muted text-foreground";

    switch (status.toLowerCase()) {
      case "meeting done":
        return "bg-primary/10 text-primary";
      case "deal done":
      case "deal closed":
        return "bg-success/10 text-success";
      case "interested":
        return "bg-warning/10 text-warning";
      default:
        return "bg-muted text-foreground";
    }
  };

  const formatLabel = (key: string) => {
    let formatted = key
      .replace(/_/g, " ")
      .replace(/[^\w\s]/gi, "")
      .replace(/([a-z])([A-Z])/g, "$1 $2");

    formatted = formatted.replace(/\b\w/g, (c) => c.toUpperCase());

    formatted = formatted
      .replace("Whatsapp Number", "WhatsApp")
      .replace("Full Name", "Name")
      .replace("They Are", "Role")
      .replace("Childs Age", "Child's Age");

    return formatted;
  };

  const formatValue = (key: string, value: unknown) => {
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    switch (key.toLowerCase()) {
      case "gender":
        return value === "m" ? "Male" : value === "f" ? "Female" : value;
      case "is_organic":
        return value ? "Organic" : "Paid";
      case "phone_number_verified":
        return value ? "Verified" : "Unverified";
      default:
        if (
          key.toLowerCase().includes("date") ||
          key.toLowerCase().includes("time")
        ) {
          return value ? formatDate(String(value)) : "Not scheduled";
        }
        return value !== undefined && value !== null ? String(value) : "N/A";
    }
  };

  const statuses = Array.from(
    new Set(leads.map((lead) => lead.lead_status))
  ).filter(Boolean);

  const platforms = Array.from(
    new Set(leads.map((lead) => lead.platform))
  ).filter(Boolean);

  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);

  const isContactField = (key: string) => {
    const contactPatterns = [
      /name/i,
      /phone/i,
      /whatsapp/i,
      /email/i,
      /age/i,
      /gender/i,
      /city/i,
      /location/i,
      /address/i,
      /child's age/i,
      /full name/i,
      /contact/i,
    ];

    return contactPatterns.some((pattern) => pattern.test(key));
  };

  interface CollapsibleSectionProps {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
  }

  const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    title,
    icon,
    children,
    isOpen,
    onToggle,
  }) => {
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 ease-in-out hover:shadow-md">
        <button
          className="flex items-center justify-between w-full p-4 text-left hover:bg-accent/20 transition-colors duration-200"
          onClick={onToggle}
        >
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-semibold text-foreground">{title}</h3>
          </div>
          <ChevronDown
            className={`transition-transform text-muted-foreground duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
            size={18}
          />
        </button>

        {isOpen && (
          <div className="p-4 border-t border-border transition-all duration-300 ease-in-out">
            {children}
          </div>
        )}
      </div>
    );
  };

  interface MetricCardProps {
    title: string;
    value: React.ReactNode;
    icon?: React.ReactNode;
    color?: string;
    bgFrom: string;
    bgTo: string;
  }

  const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    icon,
    color,
    bgFrom,
    bgTo,
  }) => (
    <div
      className={`bg-gradient-to-br ${bgFrom} ${bgTo} border border-border rounded-xl p-3 transition-transform duration-300 hover:scale-[1.02] hover:shadow-sm`}
    >
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className={`flex items-center mt-1 ${color || "text-foreground"}`}>
        {icon && <span className="mr-2">{icon}</span>}
        <span className="font-medium truncate">{value}</span>
      </div>
    </div>
  );

  interface CommentModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    onSubmit: (comment: string) => void;
  }

  const CommentModal: React.FC<CommentModalProps> = ({
    isOpen,
    onClose,
    title,
    onSubmit,
  }) => {
    const [comment, setComment] = useState("");

    if (!isOpen) return null;

    const handleSubmit = () => {
      onSubmit(comment);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 animate-fadeIn">
        <div className="bg-card border border-border rounded-lg p-6 shadow-xl w-full max-w-md relative transform transition-all duration-300 animate-slideUp">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors duration-200"
            aria-label="Close"
          >
            ✕
          </button>

          <div className="flex justify-center mb-4">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          </div>

          <div className="mb-4">
            <label
              htmlFor="statusComment"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Add Comment
            </label>
            <textarea
              id="statusComment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-background shadow-sm focus:border-primary focus:ring-primary sm:text-sm min-h-[100px] resize-y"
              placeholder="Enter comment..."
              autoFocus
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors duration-200"
          >
            Submit
          </button>
        </div>
      </div>
    );
  };

  function formatCustomFieldValue(value: unknown, type: string): string {
    if (value === undefined || value === null) return "N/A";

    switch (type) {
      case "date":
      case "datetime":
        if (typeof value === "string" && value) {
          const date = parseLeadDate(value);
          return date ? format(date, "MMM dd, yyyy hh:mm a") : value.toString();
        }
        return value.toString();
      case "boolean":
        return value ? "Yes" : "No";
      case "number":
        return typeof value === "number"
          ? value.toString()
          : (Number(value) || "N/A").toString();
      case "string":
      default:
        return String(value);
    }
  }

  // Timer component for new leads
  const LeadTimer = ({ createdTime }: { createdTime?: string }) => {
    const [remainingSeconds, setRemainingSeconds] = useState<number | null>(
      null
    );
    const [elapsedMinutes, setElapsedMinutes] = useState<number | null>(null);
    const [progress, setProgress] = useState(1);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      if (!createdTime) {
        setRemainingSeconds(null);
        setElapsedMinutes(null);
        return;
      }

      const leadDate = parseLeadDate(createdTime);
      if (!leadDate) {
        setRemainingSeconds(null);
        setElapsedMinutes(null);
        return;
      }

      const calculateTime = () => {
        const now = new Date();
        const diffInMs = now.getTime() - leadDate.getTime();
        const diffInSeconds = Math.floor(diffInMs / 1000);
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

        // Within first 2 minutes
        if (diffInSeconds < 120) {
          const remaining = 120 - diffInSeconds;
          setRemainingSeconds(remaining);
          setProgress(remaining / 120);
          setElapsedMinutes(null);
        }
        // Between 2 minutes and 1 hour
        else if (diffInMinutes < 60) {
          setRemainingSeconds(null);
          setElapsedMinutes(diffInMinutes);
        }
        // Over 1 hour
        else {
          setRemainingSeconds(null);
          setElapsedMinutes(null);
        }
      };

      // Initial calculation
      calculateTime();

      // Set up interval if within first 2 minutes
      if (remainingSeconds !== null && remainingSeconds > 0) {
        timerRef.current = setInterval(calculateTime, 1000);
      }

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }, [createdTime]);

    // Clear interval when component unmounts
    useEffect(() => {
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }, []);

    if (!createdTime)
      return <div className="text-xs text-muted-foreground">N/A</div>;

    const leadDate = parseLeadDate(createdTime);
    if (!leadDate)
      return <div className="text-xs text-muted-foreground">N/A</div>;

    const diffInMs = new Date().getTime() - leadDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const circumference = 2 * Math.PI * 9; // Radius of 9

    // Within first 2 minutes - show animated circular timer
    if (remainingSeconds !== null && remainingSeconds > 0) {
      const minutes = Math.floor(remainingSeconds / 60);
      return (
        <div className="relative w-5 h-5">
          <svg className="w-full h-full" viewBox="0 0 20 20">
            <circle
              cx="10"
              cy="10"
              r="9"
              fill="none"
              stroke="#e6e6e6"
              strokeWidth="1.5"
            />
            <circle
              cx="10"
              cy="10"
              r="9"
              fill="none"
              stroke="#10B981"
              strokeWidth="1.5"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              transform="rotate(-90 10 10)"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[6px] font-bold text-green-600">
              {minutes}
            </span>
          </div>
        </div>
      );
    }
    // Between 2 minutes and 1 hour - show elapsed minutes
    else if (
      elapsedMinutes !== null ||
      (diffInMinutes >= 2 && diffInMinutes < 60)
    ) {
      return (
        <div className="text-xs text-warning font-medium">
          🕒{elapsedMinutes !== null ? elapsedMinutes : diffInMinutes}min
        </div>
      );
    }
    // Over 1 hour - show lead cold
    else if (diffInHours >= 1) {
      return (
        <div className="relative group flex items-center gap-1 text-xs text-blue-400 font-medium cursor-help">
          <Snowflake size={12} />
          <span>Cold</span>

          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-3 py-1 bg-black text-white text-[10px] rounded shadow-lg w-auto max-w-xs z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            Leads become cold if not connected within 2hrs
          </div>
        </div>
      );
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <SyncLoader color="hsl(var(--primary))" />
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-muted border-2 border-dashed rounded-xl w-16 h-16 mx-auto flex items-center justify-center">
          <X className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-foreground">
          No leads found
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          There are no leads to display at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow overflow-hidden relative">
      {/* Status Update Modal */}
      <CommentModal
        isOpen={statusUpdateModalOpen}
        onClose={() => setStatusUpdateModalOpen(false)}
        title={`Update Status to ${selectedStatus}`}
        onSubmit={handleStatusUpdateSubmit}
      />

      {/* Remark Update Modal */}
      <CommentModal
        isOpen={remarkUpdateModalOpen}
        onClose={() => setRemarkUpdateModalOpen(false)}
        title={`Update Remark to ${selectedRemark}`}
        onSubmit={handleRemarkUpdateSubmit}
      />

      <div className="p-4 sm:p-6 border-b border-border">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search leads by name, number, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-2 pl-10 text-sm shadow-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-0 sm:ml-4 flex space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="focus:ring-primary focus:border-primary block sm:text-sm border-input rounded-md bg-background transition-colors duration-200 hover:bg-accent/20"
            >
              <option value="all">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="focus:ring-primary focus:border-primary block sm:text-sm border-input rounded-md bg-background transition-colors duration-200 hover:bg-accent/20"
            >
              <option value="all">All Platforms</option>
              {platforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platform.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row h-[calc(100vh-150px)]">
        <div
          className={`transition-all duration-400 ease-in-out ${
            isSidePanelOpen ? "w-full md:w-2/6" : "w-full"
          } overflow-hidden flex flex-col`}
        >
          <div className="overflow-auto flex-grow">
            <table className="min-w-full divide-y divide-border">
              {!isSidePanelOpen && (
                <thead className="bg-muted sticky top-0 z-10">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-28 cursor-pointer hover:bg-accent/20 transition-colors"
                      onClick={() => handleSort("date")}
                    >
                      <div className="flex items-center">
                        Date
                        <span className="ml-1">
                          {sortingConfig.field === "date" &&
                            (sortingConfig.direction === "asc" ? "↑" : "↓")}
                        </span>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hover:bg-accent/20 transition-colors"
                    >
                      Platform
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-24 cursor-pointer hover:bg-accent/20 transition-colors"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        Name
                        <span className="ml-1">
                          {sortingConfig.field === "name" &&
                            (sortingConfig.direction === "asc" ? "↑" : "↓")}
                        </span>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hover:bg-accent/20 transition-colors"
                    >
                      Location
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/20 transition-colors"
                      onClick={() => handleSort("score")}
                    >
                      <div className="flex items-center">
                        Lead Score
                        <span className="ml-1">
                          {sortingConfig.field === "score" &&
                            (sortingConfig.direction === "asc" ? "↑" : "↓")}
                        </span>
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hover:bg-accent/20 transition-colors"
                    >
                      Remarks
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hover:bg-accent/20 transition-colors"
                    >
                      STAGES
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-32 hover:bg-accent/20 transition-colors"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
              )}
              <tbody className="bg-card divide-y divide-border">
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((lead) => {
                    const score = extractScore(lead.comments || "");
                    const scoreColor = getScoreColor(score);
                    const platformInfo = getPlatformInfo(lead.platform);

                    const getInitial = () => {
                      if (!lead.name) return "?";
                      const match = lead.name.match(/[a-zA-Z]/);
                      return match ? match[0].toUpperCase() : "?";
                    };

                    const isScheduled =
                      scheduledLeads[lead.id!] ||
                      (!!lead.followUpDate && !!lead.followUpTime);

                    return (
                      <tr
                        key={lead.id}
                        className={`transition-colors duration-150 ${
                          isSidePanelOpen && selectedLead?.id === lead.id
                            ? "bg-primary/10"
                            : "hover:bg-muted"
                        }`}
                      >
                        {isSidePanelOpen ? (
                          <td className="px-4 py-3">
                            <div
                              className="flex items-center cursor-pointer group"
                              onClick={() => openSidePanel(lead)}
                            >
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-3 transition-transform group-hover:scale-110">
                                <span className="text-primary font-medium">
                                  {getInitial()}
                                </span>
                              </div>
                              <div className="min-w-0 flex-grow">
                                <div className="flex justify-between items-baseline">
                                  <span className="text-sm font-bold truncate text-foreground">
                                    {lead.name || "N/A"}
                                  </span>
                                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                    {lead.created_time
                                      ? formatDate(lead.created_time)
                                      : "N/A"}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground truncate mt-1">
                                  {lead.whatsapp_number_ || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>
                        ) : (
                          <>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground w-28">
                              {lead.created_time
                                ? formatDate(lead.created_time)
                                : "N/A"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${platformInfo.color} font-bold transition-transform hover:scale-110`}
                                title={lead.platform || "Platform"}
                              >
                                {platformInfo.icon}
                              </div>
                            </td>
                            <td
                              className="px-4 py-3 whitespace-nowrap text-sm font-medium text-primary hover:text-primary/80 hover:underline cursor-pointer w-24 truncate"
                              onClick={() => openSidePanel(lead)}
                              title={lead.name || "N/A"}
                            >
                              {lead.name || "N/A"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-muted-foreground truncate max-w-[140px]">
                                {extractLocation(lead.comments || "")}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className={`text-sm ${scoreColor}`}>
                                {score ?? "N/A"}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 relative">
                                  <select
                                    value={(lead as any).remark || ""}
                                    onChange={(e) =>
                                      handleRemarkSelection(
                                        lead.id!,
                                        e.target.value
                                      )
                                    }
                                    disabled={updatingRemark === lead.id}
                                    className={`w-full px-2 py-1 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary ${
                                      updatingRemark === lead.id
                                        ? "opacity-70 cursor-not-allowed"
                                        : ""
                                    }`}
                                  >
                                    <option value="">Select Remark</option>
                                    {remarkOptions.map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                  {updatingRemark === lead.id && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-accent/50 rounded">
                                      <SyncLoader
                                        size={5}
                                        color="hsl(var(--primary))"
                                      />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-shrink-0">
                                  <LeadTimer createdTime={lead.created_time} />
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap relative">
                              <select
                                value={lead.lead_status || ""}
                                onChange={(e) =>
                                  handleStatusSelection(
                                    lead.id!,
                                    e.target.value
                                  )
                                }
                                disabled={updatingStatus === lead.id}
                                className={`px-2 py-1 text-xs leading-5 font-semibold rounded-md ${getStatusColor(
                                  lead.lead_status
                                )} focus:outline-none focus:ring-1 focus:ring-primary w-full transition-colors ${
                                  updatingStatus === lead.id
                                    ? "cursor-not-allowed opacity-70"
                                    : "hover:opacity-90"
                                }`}
                              >
                                {statusOptions.map((status) => (
                                  <option key={status} value={status}>
                                    {status}
                                  </option>
                                ))}
                              </select>
                              {updatingStatus === lead.id && (
                                <div className="absolute inset-0 flex items-center justify-center bg-accent rounded">
                                  <SyncLoader
                                    size={5}
                                    color="hsl(var(--primary))"
                                  />
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium w-32">
                              <div className="flex items-center justify-end space-x-2">
                                <a
                                  href={`https://wa.me/${lead.whatsapp_number_}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-success hover:text-success/80 transition-transform hover:scale-110"
                                  title="Open WhatsApp"
                                >
                                  <FaWhatsapp className="text-lg" />
                                </a>

                                <div
                                  className={`cursor-pointer p-1 rounded-full transition-all duration-300 ${
                                    isScheduled
                                      ? "text-success bg-success/10"
                                      : "text-foreground bg-muted"
                                  } hover:bg-accent hover:shadow-md`}
                                  onClick={() => handleFollowUpClick(lead.id!)}
                                  title="Schedule Follow-up"
                                >
                                  <FaBell className="text-lg" />
                                </div>
                              </div>

                              {followUpLeadId === lead.id && (
                                <div
                                  className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
                                  onClick={() => {
                                    setFollowUpLeadId(null);
                                    setLeadForRemarkUpdate(null);
                                  }}
                                >
                                  <div
                                    className="bg-card border border-border rounded-md p-6 shadow-lg w-80 relative animate-fadeIn"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      onClick={() => {
                                        setFollowUpLeadId(null);
                                        setLeadForRemarkUpdate(null);
                                      }}
                                      className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                                      aria-label="Close"
                                    >
                                      ✕
                                    </button>
                                    <div className="flex justify-center mb-4">
                                      <h3 className="text-lg font-semibold text-foreground">
                                        Follow Up
                                      </h3>
                                    </div>
                                    <div className="mb-4">
                                      <label
                                        htmlFor="followUpDate"
                                        className="block text-sm font-medium text-foreground"
                                      >
                                        Date
                                      </label>
                                      <input
                                        type="date"
                                        id="followUpDate"
                                        value={followUpDate}
                                        onChange={(e) =>
                                          setFollowUpDate(e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-md border border-input bg-background shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition"
                                      />
                                    </div>
                                    <div className="mb-6">
                                      <label
                                        htmlFor="followUpTime"
                                        className="block text-sm font-medium text-foreground"
                                      >
                                        Time
                                      </label>
                                      <input
                                        type="time"
                                        id="followUpTime"
                                        value={followUpTime}
                                        onChange={(e) =>
                                          setFollowUpTime(e.target.value)
                                        }
                                        className="mt-1 block w-full rounded-md border border-input bg-background shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition"
                                      />
                                    </div>
                                    <button
                                      onClick={() => handleSchedule(lead.id!)}
                                      className={`w-full py-2 rounded-md transition-transform hover:scale-[1.02] ${
                                        followUpDate && followUpTime
                                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                          : "bg-muted text-muted-foreground cursor-not-allowed"
                                      }`}
                                      disabled={!followUpDate || !followUpTime}
                                    >
                                      Schedule
                                    </button>
                                  </div>
                                </div>
                              )}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-4 text-center text-sm text-muted-foreground"
                    >
                      No leads found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div
          className={`bg-card border-l border-border transition-all duration-400 ease-in-out overflow-hidden flex ${
            isSidePanelOpen ? "w-full md:w-4/6" : "w-0"
          }`}
        >
          {isSidePanelOpen && selectedLead && (
            <div className="flex flex-col w-full h-full animate-fadeIn">
              <div className="p-4 bg-gradient-to-r from-primary/5 to-indigo-50 dark:to-indigo-900/10 border-b border-border">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 truncate">
                    <div className="bg-gradient-to-br from-primary to-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center text-primary-foreground font-bold transition-transform hover:scale-105">
                      {selectedLead.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="truncate">
                      <h1 className="text-lg font-bold text-foreground truncate flex items-center gap-2">
                        <span className="truncate">
                          {selectedLead.name || "Unnamed Lead"}
                        </span>
                        {selectedLead.lead_status && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                              selectedLead.lead_status
                            )} transition-colors`}
                          >
                            {selectedLead.lead_status}
                          </span>
                        )}
                      </h1>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                        <span className="flex items-center">
                          <Calendar size={12} className="mr-1" />
                          {selectedLead.created_time
                            ? formatDate(selectedLead.created_time)
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`https://wa.me/${selectedLead.whatsapp_number_}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-success text-success-foreground px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm hover:bg-success/90 transition-transform hover:scale-[1.02]"
                    >
                      <FaWhatsapp size={14} />
                      <span>Message</span>
                    </a>
                    <button
                      onClick={closeSidePanel}
                      className="text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-accent transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex border-b border-border bg-card">
                {["Overview", "Contact", "Qualifiers", "Comments"].map(
                  (tab) => (
                    <button
                      key={tab}
                      className={`px-4 py-3 text-sm font-medium relative transition-colors duration-200 ${
                        activeTab === tab
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      onClick={() =>
                        setActiveTab(
                          tab as
                            | "Overview"
                            | "Contact"
                            | "Qualifiers"
                            | "Comments"
                        )
                      }
                    >
                      {tab}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary transition-all duration-300"></div>
                      )}
                    </button>
                  )
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === "Overview" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <MetricCard
                        title="Lead Score"
                        value={
                          extractScore(selectedLead.comments || "") ?? "N/A"
                        }
                        color={getScoreColor(
                          extractScore(selectedLead.comments || "")
                        )}
                        bgFrom="from-primary/5"
                        bgTo="to-indigo-50 dark:to-indigo-900/10"
                      />

                      <MetricCard
                        title="Platform"
                        value={selectedLead.platform || "N/A"}
                        icon={getPlatformInfo(selectedLead.platform).icon}
                        bgFrom="from-success/5"
                        bgTo="to-emerald-50 dark:to-emerald-900/10"
                      />

                      <MetricCard
                        title="Location"
                        value={
                          extractLocation(selectedLead.comments || "") || "N/A"
                        }
                        bgFrom="from-warning/5"
                        bgTo="to-orange-50 dark:to-orange-900/10"
                      />

                      <MetricCard
                        title="Follow-up"
                        value={selectedLead.followUpDate || "Not scheduled"}
                        bgFrom="from-purple-50 dark:from-purple-900/10"
                        bgTo="to-fuchsia-50 dark:to-fuchsia-900/10"
                      />
                    </div>

                    <CollapsibleSection
                      title="Customer Type"
                      icon={<Tag className="text-purple-500" size={16} />}
                      isOpen={openSectionKey === "customerType"}
                      onToggle={() => toggleSection("customerType")}
                    >
                      <div className="grid grid-cols-3 gap-3">
                        {["Basic", "Advance", "Pro"].map((type) => (
                          <div
                            key={type}
                            className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all duration-300 ${
                              customerTypes[selectedLead.id!] === type
                                ? "bg-primary/10 border-primary text-primary"
                                : "bg-card border-border text-muted-foreground hover:bg-muted"
                            }`}
                            onClick={() =>
                              setCustomerType(selectedLead.id!, type)
                            }
                          >
                            <div
                              className={`w-4 h-4 rounded-full border mr-2 flex items-center justify-center transition-all ${
                                customerTypes[selectedLead.id!] === type
                                  ? "bg-primary border-primary"
                                  : "border-muted-foreground"
                              }`}
                            >
                              {customerTypes[selectedLead.id!] === type && (
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                              )}
                            </div>
                            <span className="text-sm font-medium">{type}</span>
                          </div>
                        ))}
                      </div>
                    </CollapsibleSection>

                    {customFields && customFields.length > 0 && (
                      <CollapsibleSection
                        title="Custom Fields"
                        icon={<Tag className="text-purple-500" size={16} />}
                        isOpen={openSectionKey === "customFields"}
                        onToggle={() => toggleSection("customFields")}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {customFields.map((field) => (
                            <EditableField
                              key={field.id}
                              leadId={selectedLead.id!}
                              field={field}
                              value={
                                (selectedLead as Record<string, unknown>)?.[
                                  field.name
                                ]
                              }
                            />
                          ))}
                        </div>
                      </CollapsibleSection>
                    )}

                    <CollapsibleSection
                      title="Contact Preview"
                      icon={<User className="text-primary" size={16} />}
                      isOpen={openSectionKey === "contactPreview"}
                      onToggle={() => toggleSection("contactPreview")}
                    >
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(selectedLead)
                          .filter(([key]) => isContactField(key))
                          .slice(0, 4)
                          .map(([key, value]) => (
                            <div key={key} className="flex">
                              <div className="w-24 text-muted-foreground truncate">
                                {formatLabel(key)}
                              </div>
                              <div className="font-medium text-foreground truncate">
                                {String(formatValue(key, value))}
                              </div>
                            </div>
                          ))}
                      </div>
                    </CollapsibleSection>

                    <CollapsibleSection
                      title="Qualifiers Preview"
                      icon={<Award className="text-success" size={16} />}
                      isOpen={openSectionKey === "qualifiersPreview"}
                      onToggle={() => toggleSection("qualifiersPreview")}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 text-sm">
                        {(() => {
                          const comment = selectedLead.comments;
                          if (!comment) return null;
                          const lines = comment
                            .split("\n")
                            .filter((line) => line.trim());
                          return lines.map((line, idx) => {
                            const sepIndex = line.indexOf(": ");
                            let label: string, value: string;
                            if (sepIndex !== -1) {
                              label = line.substring(0, sepIndex).trim();
                              value = line.substring(sepIndex + 2).trim();
                            } else {
                              label = line;
                              value = "";
                            }
                            return (
                              <div
                                key={idx}
                                className="flex items-center p-2 hover:bg-gray-100 transition duration-200"
                              >
                                <div className="w-32 flex-shrink-0 text-gray-600 font-semibold">
                                  {label}
                                </div>
                                <div className="font-medium truncate text-gray-800">
                                  {value || "N/A"}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </CollapsibleSection>
                  </div>
                )}

                {activeTab === "Contact" && (
                  <CollapsibleSection
                    title="Contact Details"
                    icon={<User className="text-primary" size={18} />}
                    isOpen={true}
                    onToggle={() => {}}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {Object.entries(selectedLead)
                        .filter(([key]) => isContactField(key))
                        .map(([key, value]) => (
                          <div key={key} className="flex">
                            <div className="w-32 flex-shrink-0 text-muted-foreground">
                              {formatLabel(key)}
                            </div>
                            <div className="font-medium text-foreground truncate">
                              {String(formatValue(key, value))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </CollapsibleSection>
                )}

                {activeTab === "Qualifiers" && (
                  <CollapsibleQualifierSection
                    title="Lead Qualifiers"
                    icon={<Award className="text-green-500" size={18} />}
                    defaultOpen={true}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 text-sm">
                      {(() => {
                        const comment = selectedLead.comments;
                        if (!comment) return null;
                        const lines = comment
                          .split("\n")
                          .filter((line) => line.trim());
                        return lines.map((line, idx) => {
                          const sepIndex = line.indexOf(": ");
                          let label: string, value: string;
                          if (sepIndex !== -1) {
                            label = line.substring(0, sepIndex).trim();
                            value = line.substring(sepIndex + 2).trim();
                          } else {
                            label = line;
                            value = "";
                          }
                          return (
                            <div
                              key={idx}
                              className="flex items-center p-2 hover:bg-gray-100 transition duration-200"
                            >
                              <div className="w-32 flex-shrink-0 text-gray-600 font-semibold">
                                {label}
                              </div>
                              <div className="font-medium truncate text-gray-800">
                                {value || "N/A"}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </CollapsibleQualifierSection>
                )}

                {activeTab === "Comments" && (
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="text-purple-500" size={18} />
                      <h3 className="text-lg font-semibold text-foreground">
                        Comments Thread
                      </h3>
                      <span className="ml-auto text-sm text-muted-foreground">
                        {commentsHistory.length} comments
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
                      {commentsHistory.length > 0 ? (
                        commentsHistory.map((comment, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 animate-fadeIn"
                          >
                            <div className="flex-shrink-0">
                              <div className="bg-gradient-to-br from-primary to-indigo-600 w-9 h-9 rounded-full flex items-center justify-center text-primary-foreground font-bold">
                                {comment.displayName.charAt(0)}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-baseline">
                                <span className="font-medium text-foreground">
                                  {comment.displayName || "Unknown User"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(comment.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <div className="mt-1 bg-muted rounded-lg p-3 text-sm transition-all hover:shadow-sm">
                                <p className="text-foreground">
                                  {comment.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <MessageSquare size={24} className="mx-auto mb-2" />
                          <p>No comments yet</p>
                          <p className="text-xs mt-1">
                            Be the first to comment
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-border pt-4">
                      <div className="relative">
                        <input
                          type="text"
                          value={customerComment}
                          onChange={(e) => setCustomerComment(e.target.value)}
                          className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm min-h-[100px] transition-all"
                          placeholder="Type a comment..."
                          style={{
                            height: "100px",
                            lineHeight: "1.5",
                            overflowY: "auto",
                            resize: "vertical",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                          Enter to add new line
                        </div>
                      </div>
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={handleSaveCustomerComment}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-transform hover:scale-[1.02] text-sm"
                          disabled={!customerComment.trim()}
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="bg-card px-4 py-3 flex items-center justify-between border-t border-border">
          <div className="flex-1 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-foreground">
                {Math.min(currentPage * itemsPerPage, sortedLeads.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {sortedLeads.length}
              </span>{" "}
              leads
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 text-sm rounded-md transition-all ${
                  currentPage === 1
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-background text-primary hover:bg-accent border border-input hover:shadow-sm"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className={`px-4 py-2 text-sm rounded-md transition-all ${
                  currentPage === totalPages
                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsTable;
