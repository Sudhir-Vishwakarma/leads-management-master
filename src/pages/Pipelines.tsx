import React from 'react';

const Pipelines = () => {
  const pipelines = [
    {
      id: 1,
      name: "Lead Generation",
      stages: ["New", "Contacted", "Qualified", "Proposal"],
      value: "$25,000",
      deals: 12
    },
    {
      id: 2,
      name: "Sales Pipeline",
      stages: ["Lead", "Meeting", "Proposal", "Negotiation", "Closed"],
      value: "$42,500",
      deals: 8
    },
    {
      id: 3,
      name: "Onboarding",
      stages: ["Signed", "Setup", "Training", "Active"],
      value: "$18,750",
      deals: 5
    }
  ];

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Sales Pipelines</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pipelines.map((pipeline) => (
            <div key={pipeline.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-600 p-4">
                <h2 className="text-xl font-bold text-white">{pipeline.name}</h2>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{pipeline.value}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Deals</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{pipeline.deals}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Stages</h3>
                  <div className="space-y-2">
                    {pipeline.stages.map((stage, index) => (
                      <div 
                        key={index} 
                        className="flex items-center bg-gray-50 dark:bg-gray-700 rounded p-2"
                      >
                        <div className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full mr-2">
                          {index + 1}
                        </div>
                        <span className="text-gray-900 dark:text-white">{stage}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200">
                  View Pipeline
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Create New Pipeline</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pipeline Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter pipeline name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stages (comma separated)
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Stage 1, Stage 2, Stage 3"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
            >
              Create Pipeline
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Pipelines;