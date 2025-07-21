import { useEffect } from "react";
import { setupChatToLeadSync, getConnectedWABA } from "../firebase";
import { getAuth } from "firebase/auth";


export const useWABASync = () => {
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user?.phoneNumber) return;
    
    const sanitizedPhone = user.phoneNumber.replace(/[^\d]/g, "");
    
    const initializeSync = async () => {
      try {
        const wabaId = await getConnectedWABA(sanitizedPhone);
        return setupChatToLeadSync(sanitizedPhone, wabaId);
      } catch (error) {
        console.error("WABA sync setup failed:", error);
        // Fallback to direct WhatsApp API fetch if Firestore sync fails
        return fetchWhatsAppLeads(sanitizedPhone);
      }
    };
    
    const unsubscribePromise = initializeSync();
    
    return () => {
      unsubscribePromise.then(unsubscribe => unsubscribe && unsubscribe());
    };
  }, []);
};

// New function to directly fetch WhatsApp leads when Firestore sync fails
const fetchWhatsAppLeads = async (userPhone: string) => {
  try {
    const response = await fetch(
      "https://graph.facebook.com/v19.0/593329000520625/discussion",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_WHATSAPP_TOKEN}`,
        },
      }
    );
    
    if (!response.ok) throw new Error("WhatsApp API request failed");
    
    const data = await response.json();
    const validLeads = data.data
      .filter((chat: any) => chat.leadScore >= 70)
      .map((chat: any) => ({
        id: chat.id,
        name: chat.client_name || `+${chat.id}`,
        whatsapp_number_: chat.id,
        comments: "Synced from WhatsApp API",
        platform: "WhatsApp",
        lead_status: "New Lead",
        created_time: new Date().toISOString(),
        is_chat_lead: true,
        leadScore: chat.leadScore,
      }));
    
    // Store in Firestore
    const batch = writeBatch(db);
    validLeads.forEach((lead: Lead) => {
      const leadRef = doc(collection(db, `crm_users/${userPhone}/leads`));
      batch.set(leadRef, lead);
    });
    await batch.commit();
  } catch (error) {
    console.error("Direct WhatsApp API fetch failed:", error);
  }
};

