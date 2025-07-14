import { useEffect } from "react";
import { setupChatToLeadSync } from "../../services/Firebasesync";
import { getConnectedWABA } from "../../services/firebase";
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
      }
    };
    
    const unsubscribePromise = initializeSync();
    
    return () => {
      unsubscribePromise.then(unsubscribe => unsubscribe && unsubscribe());
    };
  }, []);
};