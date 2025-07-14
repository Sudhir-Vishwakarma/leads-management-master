import { db } from "./firebase";
import { Lead } from "./firebase";
import { 
  collection, doc, getDocs, query, where, setDoc, onSnapshot, Timestamp 
} from "firebase/firestore";

export const setupChatToLeadSync = (userPhone: string, wabaId: string) => {
  const chatsRef = collection(db, `accounts/${wabaId}/discussion`);

  return onSnapshot(chatsRef, async (snapshot) => {
    for (const change of snapshot.docChanges()) {
      if (change.type === "added") {
        const chat = change.doc.data();
        const phoneNumber = change.doc.id;

        const leadsCollection = collection(db, `crm_users/${userPhone}/leads`);
        
        // 🔍 Check if a lead with same phone number already exists
        const q = query(leadsCollection, where("whatsapp_number_", "==", phoneNumber));
        const existingLeads = await getDocs(q);

        if (existingLeads.empty) {
          const newLead: Lead = {
            name: chat.client_name || `+${phoneNumber}`,
            email: "",
            phone: phoneNumber,
            whatsapp_number_: phoneNumber,
            comments: "Synced from WhatsApp chat",
            platform: "WhatsApp",
            lead_status: "New Lead",
            created_time: Timestamp.now().toDate().toISOString(),
            is_chat_lead: true,
          };

          const leadRef = doc(leadsCollection); // ✅ auto-ID
          await setDoc(leadRef, newLead);
        }
      }
    }
  });
};