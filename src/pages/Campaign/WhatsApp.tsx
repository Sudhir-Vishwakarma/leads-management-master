import React, { useState } from 'react';

// Mock data for lists and templates
const contactLists = [
  { id: '1', name: 'Premium Customers', count: 125 },
  { id: '2', name: 'New Leads', count: 200 },
  { id: '3', name: 'Inactive Users', count: 85 },
  { id: '4', name: 'VIP Members', count: 50 },
  { id: '5', name: 'Region - North', count: 150 },
];

const templates = [
  { id: '1', name: 'Welcome Offer', content: 'Hi {name}, welcome! Get 20% OFF with code WELCOME20', hasImage: true },
  { id: '2', name: 'Flash Sale', content: 'Final hours! 50% OFF everything today only.', hasImage: false },
  { id: '3', name: 'Appointment Reminder', content: 'Reminder: Your appointment is tomorrow at {time}', hasImage: true },
  { id: '4', name: 'Feedback Request', content: 'How was your experience? Share feedback:', hasImage: false },
];

const WhatsApp = () => {
  // State management
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Handler functions
  const handleSendCampaign = () => {
    if (!selectedList || !selectedTemplate) return;
    alert(`Campaign sent to ${contactLists.find(l => l.id === selectedList)?.count} contacts!`);
  };

  const handleCreateTemplate = () => {
    if (newTemplateName && newTemplateContent) {
      alert(`Template "${newTemplateName}" created!`);
      setIsCreatingTemplate(false);
      setNewTemplateName('');
      setNewTemplateContent('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">WhatsApp Campaign</h1>

      {/* Select List Section */}
      <section className="mb-12 p-6 bg-white rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700">1. Select Contact List</h2>
          <span className="text-sm text-gray-500">
            {selectedList ? `${contactLists.find(l => l.id === selectedList)?.count} contacts selected` : 'No list selected'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contactLists.map(list => (
            <div 
              key={list.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedList === list.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedList(list.id)}
            >
              <h3 className="font-medium text-gray-800">{list.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{list.count} contacts</p>
            </div>
          ))}
        </div>
      </section>

      {/* Select Template Section */}
      <section className="mb-12 p-6 bg-white rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700">2. Select Template</h2>
          <button 
            onClick={() => setIsCreatingTemplate(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Create Template
          </button>
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
            {templates.map(template => (
              <div 
                key={template.id}
                className={`border-2 rounded-xl overflow-hidden transition-all ${
                  selectedTemplate === template.id 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-200'
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="p-4">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-800">{template.name}</h3>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                      {template.hasImage ? 'Image + Text' : 'Text Only'}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-3 text-sm">{template.content}</p>
                </div>
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex space-x-4">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                    Delete
                  </button>
                  <button 
                    className="text-gray-600 hover:text-gray-800 text-sm font-medium ml-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPreview(true);
                    }}
                  >
                    Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Shoot Section */}
      <section className="p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">3. Send Campaign</h2>
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            {selectedList && (
              <p className="text-gray-600">
                Sending to: <span className="font-medium">{contactLists.find(l => l.id === selectedList)?.name}</span>
              </p>
            )}
            {selectedTemplate && (
              <p className="text-gray-600">
                Using template: <span className="font-medium">{templates.find(t => t.id === selectedTemplate)?.name}</span>
              </p>
            )}
          </div>
          <button
            onClick={handleSendCampaign}
            disabled={!selectedList || !selectedTemplate}
            className={`px-8 py-3 rounded-lg text-white font-medium ${
              selectedList && selectedTemplate
                ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Send to {selectedList ? contactLists.find(l => l.id === selectedList)?.count : '0'} Contacts
          </button>
        </div>
      </section>

      {/* Create Template Modal */}
      {isCreatingTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Create New Template</h3>
            </div>
            
            <div className="p-6">
              <div className="mb-5">
                <label className="block text-gray-700 mb-2">Template Name</label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Offer Notification"
                />
              </div>
              
              <div className="mb-5">
                <label className="block text-gray-700 mb-2">Content</label>
                <textarea
                  value={newTemplateContent}
                  onChange={(e) => setNewTemplateContent(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Hi {name}, we have a special offer for you..."
                />
              </div>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700">
                  Add Image
                </button>
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700">
                  Add Emoji
                </button>
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700">
                  Add Button
                </button>
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700">
                  Add Icon
                </button>
              </div>
            </div>
            
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setIsCreatingTemplate(false)}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 mr-4"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200 flex justify-between">
              <h3 className="text-lg font-medium">Template Preview</h3>
              <button 
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="bg-[#dcf8c6] p-4 rounded-lg">
                <p className="text-gray-800">
                  {templates.find(t => t.id === selectedTemplate)?.content || 'Preview content here...'}
                </p>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <p>This is a preview of how your template will appear</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsApp;