import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp, FaUsers, FaFileAlt, FaPaperPlane, FaChevronRight, FaPlus, FaEye, FaTrash, FaEdit, FaSearch, FaChevronDown, FaTimes } from 'react-icons/fa';
import { SyncLoader } from 'react-spinners';
import { useCustomerType } from '../../context/CustomerTypeContext';

const WhatsAppCampaign = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCustomerType, setSelectedCustomerType] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { getLeadsByType } = useCustomerType();
  
  // Get lead counts by type
  const basicLeads = getLeadsByType('Basic');
  const advanceLeads = getLeadsByType('Advance');
  const proLeads = getLeadsByType('Pro');
  
  // Customer type options
  const customerTypes = [
    { id: 'Basic', name: 'Basic Customers', count: basicLeads.length },
    { id: 'Advance', name: 'Advance Customers', count: advanceLeads.length },
    { id: 'Pro', name: 'Pro Customers', count: proLeads.length },
  ];
  
  // Mock data
  const templates = [
    { id: 1, name: 'Welcome Offer', content: 'Hi {name}, welcome to our service! Use code WELCOME20 for 20% off your first purchase.', hasImage: false },
    { id: 2, name: 'Flash Sale', content: '🔥 FLASH SALE! Today only! Get 50% off on all premium plans. Limited time offer!', hasImage: true },
    { id: 3, name: 'Account Update', content: 'Hi {name}, your account has been updated successfully. Contact support if you have questions.', hasImage: false },
    { id: 4, name: 'Renewal Reminder', content: 'Your subscription is expiring in 3 days. Renew now to continue enjoying our services.', hasImage: false },
  ];
  
  const timelineSteps = [
    { title: 'Select Customer Type', icon: <FaUsers /> },
    { title: 'Choose Template', icon: <FaFileAlt /> },
    { title: 'Send Campaign', icon: <FaPaperPlane /> },
  ];

  // Filter types based on search
  const filteredTypes = customerTypes.filter(type => 
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
  
  const handleCreateTemplate = () => {
    if (newTemplateName.trim() && newTemplateContent.trim()) {
      alert(`Template "${newTemplateName}" created successfully!`);
      setIsCreatingTemplate(false);
      setNewTemplateName('');
      setNewTemplateContent('');
    }
  };
  
  const handleSendCampaign = () => {
    if (!selectedCustomerType || !selectedTemplate) return;
    
    setIsSending(true);
    setSendProgress(0);
    
    const interval = setInterval(() => {
      setSendProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsSending(false);
            alert('Campaign sent successfully!');
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };
  
  const getSelectedLeadCount = () => {
    if (!selectedCustomerType) return 0;
    const type = customerTypes.find(t => t.id === selectedCustomerType);
    return type ? type.count : 0;
  };
  
  const getSelectedTemplate = () => {
    if (!selectedTemplate) return null;
    return templates.find(t => t.id === selectedTemplate);
  };

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
              <h2 className="text-xl font-bold text-gray-800 mb-6">Campaign Setup</h2>
              
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
                        <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          currentStep >= index 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {step.icon}
                        </div>
                        <button
                          onClick={() => setCurrentStep(index)}
                          className={`text-left flex-1 ${
                            currentStep === index 
                              ? 'text-blue-600 font-bold' 
                              : 'text-gray-600'
                          }`}
                        >
                          <span className="block text-sm">Step {index + 1}</span>
                          <span className="block font-medium">{step.title}</span>
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
                <h3 className="font-bold text-blue-800 mb-2">Campaign Summary</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span className="text-gray-600">Customer Type:</span>
                    <span className="font-medium">
                      {selectedCustomerType 
                        ? customerTypes.find(t => t.id === selectedCustomerType)?.name 
                        : 'Not selected'}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Contacts:</span>
                    <span className="font-medium">{getSelectedLeadCount()}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Template:</span>
                    <span className="font-medium">
                      {selectedTemplate 
                        ? templates.find(t => t.id === selectedTemplate)?.name 
                        : 'Not selected'}
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
                                ? 'border-blue-500 ring-2 ring-blue-200' 
                                : 'border-gray-300'
                            } rounded-xl py-3 px-4 text-left flex justify-between items-center hover:border-blue-500 transition-colors`}
                          >
                            <span className="truncate">
                              {selectedCustomerType 
                                ? customerTypes.find(t => t.id === selectedCustomerType)?.name
                                : 'Select customer type'}
                            </span>
                            <FaChevronDown 
                              className={`text-gray-500 transition-transform ${
                                dropdownOpen ? 'rotate-180' : ''
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
                                      onChange={(e) => setSearchTerm(e.target.value)}
                                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      autoFocus
                                    />
                                    {searchTerm && (
                                      <button
                                        onClick={() => setSearchTerm('')}
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
                                    filteredTypes.map(type => (
                                      <div 
                                        key={type.id}
                                        className={`px-4 py-3 hover:bg-blue-50 cursor-pointer ${
                                          selectedCustomerType === type.id 
                                            ? 'bg-blue-50 font-medium' 
                                            : ''
                                        }`}
                                        onClick={() => {
                                          setSelectedCustomerType(type.id);
                                          setDropdownOpen(false);
                                        }}
                                      >
                                        <div className="flex justify-between">
                                          <span>{type.name}</span>
                                          <span className="text-gray-500">{type.count} contacts</span>
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
                            <h3 className="font-medium text-blue-800 mb-2">Selected Type</h3>
                            <div className="flex justify-between items-center">
                              <p className="font-medium">
                                {customerTypes.find(t => t.id === selectedCustomerType)?.name}
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
                
                {/* Step 1: Choose Template */}
                {currentStep === 1 && (
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <FaFileAlt className="text-purple-500" />
                        Choose Template
                      </h2>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsCreatingTemplate(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        <FaPlus /> Create Template
                      </motion.button>
                    </div>
                    
                    {templates.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">No templates available</p>
                        <button
                          onClick={() => setIsCreatingTemplate(true)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Create your first template
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {templates.map((template) => (
                          <motion.div
                            key={template.id}
                            whileHover={{ y: -5 }}
                            className={`border rounded-xl overflow-hidden transition-all ${
                              selectedTemplate === template.id
                                ? "border-blue-500 ring-2 ring-blue-200"
                                : "border-gray-200 hover:border-blue-300"
                            }`}
                            onClick={() => setSelectedTemplate(template.id)}
                          >
                            <div className="p-5">
                              <div className="flex justify-between">
                                <h3 className="font-bold text-gray-800">
                                  {template.name}
                                </h3>
                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                                  {template.hasImage ? "Image + Text" : "Text Only"}
                                </span>
                              </div>
                              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-600 text-sm">
                                  {template.content}
                                </p>
                              </div>
                            </div>
                            <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex space-x-4">
                              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                                <FaEdit /> Edit
                              </button>
                              <button className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1">
                                <FaTrash /> Delete
                              </button>
                              <button
                                className="text-gray-600 hover:text-gray-800 text-sm font-medium ml-auto flex items-center gap-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowPreview(true);
                                }}
                              >
                                <FaEye /> Preview
                              </button>
                            </div>
                          </motion.div>
                        ))}
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
                      <h3 className="font-bold text-blue-800 mb-4">Campaign Summary</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-5 rounded-lg border border-blue-100">
                          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <FaUsers className="text-blue-500" /> Customer Type
                          </h4>
                          {selectedCustomerType ? (
                            <div>
                              <p className="font-bold text-lg">
                                {customerTypes.find(t => t.id === selectedCustomerType)?.name}
                              </p>
                              <p className="text-gray-600 mt-1">{getSelectedLeadCount()} contacts</p>
                            </div>
                          ) : (
                            <p className="text-gray-500">No type selected</p>
                          )}
                        </div>
                        
                        <div className="bg-white p-5 rounded-lg border border-blue-100">
                          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <FaFileAlt className="text-purple-500" /> Message Template
                          </h4>
                          {selectedTemplate ? (
                            <div>
                              <p className="font-bold text-lg">{templates.find(t => t.id === selectedTemplate)?.name}</p>
                              <p className="text-gray-600 mt-1 text-sm line-clamp-1">
                                {templates.find(t => t.id === selectedTemplate)?.content}
                              </p>
                            </div>
                          ) : (
                            <p className="text-gray-500">No template selected</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <h3 className="font-bold text-gray-800 mb-4">Send Campaign</h3>
                      <p className="text-gray-600 mb-6">
                        Review your campaign details and click the button below to send your
                        WhatsApp campaign to {getSelectedLeadCount()} contacts.
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
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Sending Campaign</h3>
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
                  <label className="block text-gray-700 font-medium mb-2">Content</label>
                  <textarea
                    value={newTemplateContent}
                    onChange={(e) => setNewTemplateContent(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Hi {name}, we have a special offer for you..."
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Use placeholders like {"{name}"} or {"{time}"} that will be replaced with actual data
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
        {showPreview && selectedTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-2xl w-full max-w-md"
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-bold">Template Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <FaWhatsapp className="text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">Your Business</p>
                    <p className="text-xs text-gray-500">Business Account</p>
                  </div>
                </div>
                
                <div className="bg-[#dcf8c6] p-4 rounded-lg rounded-tl-none">
                  <p className="text-gray-800">
                    {getSelectedTemplate()?.content || "Preview content here..."}
                  </p>
                </div>
                
                {getSelectedTemplate()?.hasImage && (
                  <div className="mt-3 bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 flex items-center justify-center text-gray-500">
                    Image Preview
                  </div>
                )}
                
                <div className="mt-6 text-sm text-gray-500">
                  <p>This is a preview of how your template will appear to recipients</p>
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