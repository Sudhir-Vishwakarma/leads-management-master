// import { useCallback } from "react";
// import { Lead } from "../services/firebase";

// // Helper function to extract lead score from various formats
// export const getLeadScoreValue = (lead: Lead): number => {
//   // Handle numeric values directly
//   if (typeof lead.leadScore === 'number') {
//     return lead.leadScore;
//   }
  
//   // Handle string representations
//   if (typeof lead.leadScore === 'string') {
//     const parsed = parseInt(lead.leadScore, 10);
//     if (!isNaN(parsed)) return parsed;
//   }
  
//   // Try to extract from comments
//   const match = lead.comments?.match(/🏆 Lead Score: (\d+)/);
//   if (match) {
//     const parsed = parseInt(match[1], 10);
//     if (!isNaN(parsed)) return parsed;
//   }
  
//   return 0;
// };

// export const useLeadScoreFilter = () => {
//   const filterLeadsByScore = useCallback((leads: Lead[]): Lead[] => {
//     return leads.filter(lead => {
//       const score = getLeadScoreValue(lead);
      
//       // For chat leads, only show if score >= 70
//       if (lead.is_chat_lead) {
//         return score >= 70;
//       }
      
//       // Show all non-chat leads
//       return true;
//     });
//   }, []);

//   return { filterLeadsByScore, getLeadScoreValue };
// };




import { useCallback } from "react";
import { Lead } from "../services/firebase";

export const getLeadScoreValue = (lead: Lead): number => {
  if (typeof lead.leadScore === 'number') {
    return lead.leadScore;
  }
  
  if (typeof lead.leadScore === 'string') {
    const parsed = parseInt(lead.leadScore, 10);
    if (!isNaN(parsed)) return parsed;
  }
  
  return 0;
};

export const useLeadScoreFilter = () => {
  const filterLeadsByScore = useCallback((leads: Lead[]): Lead[] => {
    return leads.filter(lead => {
      const score = getLeadScoreValue(lead);
      
      if (lead.is_chat_lead) {
        return score >= 70;
      }
      
      return true;
    });
  }, []);

  return { filterLeadsByScore, getLeadScoreValue };
};