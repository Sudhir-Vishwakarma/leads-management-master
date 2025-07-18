import { useState, useEffect, useRef, useCallback } from "react";
import {
  WhatsAppTemplate,
  fetchWhatsAppTemplates,
} from "../../services/WhatsAppTemplates";
import { getAuth } from "firebase/auth";
import app from "../../config/firebase";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaWhatsapp,
  FaUsers,
  FaFileAlt,
  FaPaperPlane,
  FaChevronRight,
  FaPlus,
  FaEye,
  // FaTrash,
  // FaEdit,
  FaSearch,
  FaChevronDown,
  FaTimes,
  FaSpinner,
  FaChevronLeft,
} from "react-icons/fa";
import { SyncLoader } from "react-spinners";
import { useCustomerType } from "../../context/CustomerTypeContext";

const WhatsAppCampaign = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCustomerType, setSelectedCustomerType] = useState<
    string | null
  >(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateContent, setNewTemplateContent] = useState("");
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // State for API templates
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [previewedTemplate, setPreviewedTemplate] =
    useState<WhatsAppTemplate | null>(null);

  const { getLeadsByType } = useCustomerType();

  // Get lead counts by type
  const basicLeads = getLeadsByType("Basic");
  const advanceLeads = getLeadsByType("Advance");
  const proLeads = getLeadsByType("Pro");

  // Customer type options
  const customerTypes = [
    { id: "Basic", name: "Basic Customers", count: basicLeads.length },
    { id: "Advance", name: "Advance Customers", count: advanceLeads.length },
    { id: "Pro", name: "Pro Customers", count: proLeads.length },
  ];

  const timelineSteps = [
    { title: "Select Customer Type", icon: <FaUsers /> },
    { title: "Choose Template", icon: <FaFileAlt /> },
    { title: "Send Campaign", icon: <FaPaperPlane /> },
  ];

  // Filter types based on search
  const filteredTypes = customerTypes.filter((type) =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Simulate loading
  useEffect(() => {
    setIsLoadingLeads(true);
    const timer = setTimeout(() => {
      setIsLoadingLeads(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Fetch WhatsApp templates
  const fetchTemplates = useCallback(async (nextPage?: string) => {
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Get user phone number - adjust based on your auth structure
      const userPhone = user.phoneNumber || "";

      setIsLoadingTemplates(true);
      const { templates: newTemplates, nextPage: nextPageUrl } =
        await fetchWhatsAppTemplates(userPhone, nextPage);

      setTemplates((prev) =>
        nextPage ? [...prev, ...newTemplates] : newTemplates
      );
      setNextPageToken(nextPageUrl);
      setTemplateError(null);
      setConnectionError(null);
    } catch (error) {
      console.error("Failed to fetch templates", error);

      // Handle specific errors
      if (error.message.includes("No WABA connected")) {
        setConnectionError(
          "No WhatsApp Business Account connected. Please connect a WABA in settings."
        );
      } else if (
        error.message.includes("User document not found") ||
        error.message.includes("Failed to initialize")
      ) {
        setConnectionError("Account setup incomplete. Please contact support.");
      } else {
        setTemplateError("Failed to load templates. Please try again later.");
      }
    } finally {
      setIsLoadingTemplates(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleCreateTemplate = () => {
    if (newTemplateName.trim() && newTemplateContent.trim()) {
      alert(`Template "${newTemplateName}" created successfully!`);
      setIsCreatingTemplate(false);
      setNewTemplateName("");
      setNewTemplateContent("");
    }
  };

  const handleSendCampaign = () => {
    if (!selectedCustomerType || !selectedTemplate) return;

    setIsSending(true);
    setSendProgress(0);

    const interval = setInterval(() => {
      setSendProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsSending(false);
            alert("Campaign sent successfully!");
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const getSelectedLeadCount = () => {
    if (!selectedCustomerType) return 0;
    const type = customerTypes.find((t) => t.id === selectedCustomerType);
    return type ? type.count : 0;
  };

  const getSelectedTemplate = () => {
    if (!selectedTemplate) return null;
    return templates.find((t) => t.id === selectedTemplate);
  };

  // Template navigation functions
  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const goToNextPage = () => {
    const totalPages = Math.ceil(templates.length / 4);
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    } else if (nextPageToken && !isLoadingMore) {
      setIsLoadingMore(true);
      fetchTemplates(nextPageToken).then(() => {
        setCurrentPage(currentPage + 1);
      });
    }
  };

  const handlePreviewTemplate = (template: WhatsAppTemplate) => {
    setPreviewedTemplate(template);
  };

  // Get current templates for display (4 per page)
  const getCurrentTemplates = () => {
    const startIndex = currentPage * 4;
    return templates.slice(startIndex, startIndex + 4);
  };

  const currentTemplates = getCurrentTemplates();
  const totalPages = Math.ceil(templates.length / 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
            <FaWhatsapp className="text-green-500" />
            WhatsApp Campaign
          </h1>
          <p className="text-gray-600 mt-2">
            Create and send personalized WhatsApp messages to your customers
          </p>
        </motion.div>

        {/* Interactive Timeline */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Timeline Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:w-1/4"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Campaign Setup
              </h2>

              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200"></div>

                <div className="space-y-8">
                  {timelineSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className="relative"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            currentStep >= index
                              ? "bg-blue-600 text-white"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {step.icon}
                        </div>
                        <button
                          onClick={() => setCurrentStep(index)}
                          className={`text-left flex-1 ${
                            currentStep === index
                              ? "text-blue-600 font-bold"
                              : "text-gray-600"
                          }`}
                        >
                          <span className="block text-sm">
                            Step {index + 1}
                          </span>
                          <span className="block font-medium">
                            {step.title}
                          </span>
                        </button>
                      </div>

                      {index < timelineSteps.length - 1 && (
                        <div className="absolute left-4 top-8 h-8 w-0.5 bg-blue-200"></div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-10 bg-blue-50 rounded-lg p-4 border border-blue-100"
              >
                <h3 className="font-bold text-blue-800 mb-2">
                  Campaign Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span className="text-gray-600">Customer Type:</span>
                    <span className="font-medium">
                      {selectedCustomerType
                        ? customerTypes.find(
                            (t) => t.id === selectedCustomerType
                          )?.name
                        : "Not selected"}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Contacts:</span>
                    <span className="font-medium">
                      {getSelectedLeadCount()}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Template:</span>
                    <span className="font-medium">
                      {selectedTemplate
                        ? templates.find((t) => t.id === selectedTemplate)?.name
                        : "Not selected"}
                    </span>
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Step Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="md:w-3/4"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-lg"
              >
                {/* Step 0: Select Customer Type */}
                {currentStep === 0 && (
                  <div className="p-6">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <FaUsers className="text-blue-500" />
                        Select Customer Type
                      </h2>
                      <p className="text-gray-600 mt-2">
                        Choose a customer segment for your campaign
                      </p>
                    </div>

                    {isLoadingLeads ? (
                      <div className="flex justify-center py-12">
                        <SyncLoader color="#3B82F6" size={12} />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="relative" ref={dropdownRef}>
                          <label className="block text-gray-700 font-medium mb-2">
                            Select Customer Type
                          </label>

                          <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className={`w-full bg-white border ${
                              dropdownOpen
                                ? "border-blue-500 ring-2 ring-blue-200"
                                : "border-gray-300"
                            } rounded-xl py-3 px-4 text-left flex justify-between items-center hover:border-blue-500 transition-colors`}
                          >
                            <span className="truncate">
                              {selectedCustomerType
                                ? customerTypes.find(
                                    (t) => t.id === selectedCustomerType
                                  )?.name
                                : "Select customer type"}
                            </span>
                            <FaChevronDown
                              className={`text-gray-500 transition-transform ${
                                dropdownOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          <AnimatePresence>
                            {dropdownOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute z-50 mt-2 w-full bg-white shadow-lg rounded-xl overflow-hidden"
                              >
                                <div className="p-3 border-b">
                                  <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                      type="text"
                                      placeholder="Search customer types..."
                                      value={searchTerm}
                                      onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                      }
                                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      autoFocus
                                    />
                                    {searchTerm && (
                                      <button
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                      >
                                        <FaTimes />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <div className="overflow-y-auto max-h-80">
                                  <div
                                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-gray-500 border-b"
                                    onClick={() => {
                                      setSelectedCustomerType(null);
                                      setDropdownOpen(false);
                                    }}
                                  >
                                    Clear selection
                                  </div>

                                  {filteredTypes.length > 0 ? (
                                    filteredTypes.map((type) => (
                                      <div
                                        key={type.id}
                                        className={`px-4 py-3 hover:bg-blue-50 cursor-pointer ${
                                          selectedCustomerType === type.id
                                            ? "bg-blue-50 font-medium"
                                            : ""
                                        }`}
                                        onClick={() => {
                                          setSelectedCustomerType(type.id);
                                          setDropdownOpen(false);
                                        }}
                                      >
                                        <div className="flex justify-between">
                                          <span>{type.name}</span>
                                          <span className="text-gray-500">
                                            {type.count} contacts
                                          </span>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="py-4 text-center text-gray-500">
                                      No customer types found
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {selectedCustomerType && (
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                            <h3 className="font-medium text-blue-800 mb-2">
                              Selected Type
                            </h3>
                            <div className="flex justify-between items-center">
                              <p className="font-medium">
                                {
                                  customerTypes.find(
                                    (t) => t.id === selectedCustomerType
                                  )?.name
                                }
                              </p>
                              <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                {getSelectedLeadCount()} contacts
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="mt-10 flex justify-end">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={!selectedCustomerType}
                            className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
                              selectedCustomerType
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-200 text-gray-500 cursor-not-allowed"
                            }`}
                            onClick={() => setCurrentStep(1)}
                          >
                            Next: Choose Template
                            <FaChevronRight />
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 1: Choose Template - WhatsApp Style */}
                {currentStep === 1 && (
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <FaFileAlt className="text-purple-500" />
                        Choose Template
                      </h2>
                      {/* <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsCreatingTemplate(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        <FaPlus /> Create Template
                      </motion.button> */}
                    </div>

                    {isLoadingTemplates ? (
                      <div className="flex justify-center py-12">
                        <SyncLoader color="#3B82F6" size={12} />
                      </div>
                    ) : templateError ? (
                      <div className="text-center py-8 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-red-600 font-medium">
                          {templateError}
                        </p>
                        <button
                          onClick={() => fetchTemplates()}
                          className="mt-4 text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-2 mx-auto"
                        >
                          <FaSpinner
                            className={isLoadingTemplates ? "animate-spin" : ""}
                          />
                          Retry
                        </button>
                      </div>
                    ) : templates.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">
                          No templates available
                        </p>
                        <button
                          onClick={() => setIsCreatingTemplate(true)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Create your first template
                        </button>
                      </div>
                    ) : (
                      <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-2 gap-6 mb-8">
                          {currentTemplates.slice(0, 4).map((template) => (
                            <motion.div
                              key={template.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              whileHover={{ y: -5 }}
                              className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
                            >
                              <div className="p-5">
                                <h4 className="font-bold text-gray-800 truncate">
                                  {template.name}
                                </h4>
                                <p className="text-gray-600 mt-2 text-sm line-clamp-3">
                                  {template.content}
                                </p>
                              </div>
                              <div className="p-3 bg-gray-50 flex justify-between">
                                <button
                                  onClick={() =>
                                    handlePreviewTemplate(template)
                                  }
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                                >
                                  <FaEye className="mr-1" /> Preview
                                </button>
                                <button
                                  onClick={() =>
                                    setSelectedTemplate(template.id)
                                  }
                                  className={`text-sm px-3 py-1 rounded-full ${
                                    selectedTemplate === template.id
                                      ? "bg-green-500 text-white"
                                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                  }`}
                                >
                                  {selectedTemplate === template.id
                                    ? "✓ Selected"
                                    : "Select"}
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Template Navigation */}
                        <div className="flex items-center justify-center mt-6">
                          <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 0}
                            className={`p-3 rounded-full ${
                              currentPage === 0
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            <FaChevronLeft className="text-xl" />
                          </button>

                          <div className="mx-4 text-center">
                            <p className="text-gray-700">
                              Page {currentPage + 1} of {totalPages}{" "}
                              {nextPageToken ? "+" : ""}
                            </p>
                            <p className="text-sm text-gray-500">
                              Showing {currentTemplates.length} of{" "}
                              {templates.length} templates
                            </p>
                          </div>

                          <button
                            onClick={goToNextPage}
                            disabled={
                              (currentPage + 1) * 4 >= templates.length &&
                              !nextPageToken
                            }
                            className={`p-3 rounded-full ${
                              (currentPage + 1) * 4 >= templates.length &&
                              !nextPageToken
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {isLoadingMore ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <FaChevronRight className="text-xl" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="mt-10 flex justify-between">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center gap-2"
                        onClick={() => setCurrentStep(0)}
                      >
                        <FaChevronRight className="rotate-180" /> Back
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={!selectedTemplate}
                        className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
                          selectedTemplate
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                        onClick={() => setCurrentStep(2)}
                      >
                        Next: Send Campaign
                        <FaChevronRight />
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Step 2: Send Campaign */}
                {currentStep === 2 && (
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <FaPaperPlane className="text-green-500" />
                        Send Campaign
                      </h2>
                      <div className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                        Ready to send
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-6 mb-8">
                      <h3 className="font-bold text-blue-800 mb-4">
                        Campaign Summary
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-5 rounded-lg border border-blue-100">
                          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <FaUsers className="text-blue-500" /> Customer Type
                          </h4>
                          {selectedCustomerType ? (
                            <div>
                              <p className="font-bold text-lg">
                                {
                                  customerTypes.find(
                                    (t) => t.id === selectedCustomerType
                                  )?.name
                                }
                              </p>
                              <p className="text-gray-600 mt-1">
                                {getSelectedLeadCount()} contacts
                              </p>
                            </div>
                          ) : (
                            <p className="text-gray-500">No type selected</p>
                          )}
                        </div>

                        <div className="bg-white p-5 rounded-lg border border-blue-100">
                          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <FaFileAlt className="text-purple-500" /> Message
                            Template
                          </h4>
                          {selectedTemplate ? (
                            <div>
                              <p className="font-bold text-lg">
                                {
                                  templates.find(
                                    (t) => t.id === selectedTemplate
                                  )?.name
                                }
                              </p>
                              <p className="text-gray-600 mt-1 text-sm line-clamp-1">
                                {
                                  templates.find(
                                    (t) => t.id === selectedTemplate
                                  )?.content
                                }
                              </p>
                            </div>
                          ) : (
                            <p className="text-gray-500">
                              No template selected
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <h3 className="font-bold text-gray-800 mb-4">
                        Send Campaign
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Review your campaign details and click the button below
                        to send your WhatsApp campaign to{" "}
                        {getSelectedLeadCount()} contacts.
                      </p>

                      <div className="flex justify-between">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium flex items-center gap-2"
                          onClick={() => setCurrentStep(1)}
                        >
                          <FaChevronRight className="rotate-180" /> Back
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={!selectedCustomerType || !selectedTemplate}
                          onClick={handleSendCampaign}
                          className={`px-8 py-3 rounded-lg font-medium flex items-center gap-3 ${
                            selectedCustomerType && selectedTemplate
                              ? "bg-green-600 hover:bg-green-700 text-white shadow-lg"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          <FaWhatsapp className="text-xl" />
                          Send to {getSelectedLeadCount()} Contacts
                        </motion.button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Modals */}

      {/* Sending Progress Modal */}
      <AnimatePresence>
        {isSending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 w-full max-w-md"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                  <FaWhatsapp className="text-blue-600 text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Sending Campaign
                </h3>
                <p className="text-gray-600 mb-6">
                  Sending to {getSelectedLeadCount()} contacts
                </p>

                <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${sendProgress}%` }}
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full"
                  ></motion.div>
                </div>

                <p className="text-lg font-medium text-gray-700">
                  {sendProgress}% complete
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Template Modal */}
      <AnimatePresence>
        {isCreatingTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl"
            >
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800">
                  Create New Template
                </h3>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Offer Notification"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">
                    Content
                  </label>
                  <textarea
                    value={newTemplateContent}
                    onChange={(e) => setNewTemplateContent(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Hi {name}, we have a special offer for you..."
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Use placeholders like {"{name}"} or {"{time}"} that will be
                    replaced with actual data
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 flex items-center gap-2">
                    <FaPlus /> Add Image
                  </button>
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 flex items-center gap-2">
                    <FaPlus /> Add Emoji
                  </button>
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 flex items-center gap-2">
                    <FaPlus /> Add Button
                  </button>
                </div>
              </div>

              <div className="flex justify-end p-6 border-t border-gray-200 gap-4">
                <button
                  onClick={() => setIsCreatingTemplate(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateTemplate}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium"
                >
                  Create Template
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Preview Modal */}
      <AnimatePresence>
        {previewedTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-2xl w-full max-w-md flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                <h3 className="text-xl font-bold">Template Preview</h3>
                <button
                  onClick={() => setPreviewedTemplate(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Area */}
              <div className="overflow-y-auto p-6">
                {/* Sender Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <FaWhatsapp className="text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">Your Business</p>
                    <p className="text-xs text-gray-500">Business Account</p>
                  </div>
                </div>

                {/* Message Bubble */}
                <div className="relative max-w-[85%]">
                  {/* Message Bubble Background */}
                  <div
                    className="relative bg-[#dcf8c6] p-3 shadow-md z-10"
                    style={{
                      borderTopLeftRadius: "0px",
                      borderTopRightRadius: "16px",
                      borderBottomRightRadius: "16px",
                      borderBottomLeftRadius: "16px",
                    }}
                  >
                    {/* Header Image */}
                    {previewedTemplate.headerUrl && (
                      <div className="mb-2 rounded-md overflow-hidden">
                        <img
                          src={previewedTemplate.headerUrl}
                          alt="Header"
                          className="w-full h-40 object-cover rounded-md"
                        />
                      </div>
                    )}

                    {/* Text Content */}
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {previewedTemplate.content}
                    </p>

                    {/* Footer */}
                    {previewedTemplate.footerText && (
                      <div className="mt-2 text-xs text-gray-600 text-left">
                        {previewedTemplate.footerText}
                      </div>
                    )}

                    {/* Buttons */}
                    {previewedTemplate.buttons &&
                      previewedTemplate.buttons.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {previewedTemplate.buttons.map((button, index) => (
                            <div
                              key={index}
                              className={`text-sm text-center px-3 py-2 rounded-md cursor-pointer truncate ${
                                button.type === "URL"
                                  ? "bg-blue-100 text-blue-700"
                                  : button.type === "PHONE_NUMBER"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {button.text}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>

                  {/* Message Tail (sharp corner) */}
                  {/* <div
                    className="absolute left-[-8px] top-0 w-4 h-4 bg-[#dcf8c6] z-0"
                    style={{
                      clipPath: "polygon(0 0, 100% 0, 0 100%)",
                    }}
                  ></div> */}
                  {/* <div
                    className="absolute -left-[6px] top-3 w-3 h-3 bg-[#dcf8c6] z-0 rotate-45"
                    style={{
                      borderRadius: "0 0 0 2px",
                    }}
                  ></div> */}
                </div>

                {/* Disclaimer */}
                <div className="mt-6 text-sm text-gray-500">
                  <p>
                    This is a preview of how your template will appear to
                    recipients.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WhatsAppCampaign;
