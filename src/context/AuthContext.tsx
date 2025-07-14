import React, { 
  createContext, 
  useContext, 
  useEffect, 
  useState,
  ReactNode 
} from "react";
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, firestore } from "../config/firebase";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  onboardingComplete: boolean;
  signOut: () => Promise<void>;
  refreshOnboardingStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [cleanPhone, setCleanPhone] = useState("");
  const [onboardingUnsubscribe, setOnboardingUnsubscribe] = useState<(() => void) | null>(null);

  // Function to check onboarding status
  const checkOnboardingStatus = async (phoneNumber: string) => {
    const clean = phoneNumber.replace(/\D/g, '');
    setCleanPhone(clean);
    
    // Only proceed if we have a valid phone number
    if (!clean) {
      setOnboardingComplete(false);
      return;
    }
    
    const userRef = doc(firestore, "crm_users", clean);
    const onboardingRef = doc(userRef, "Onboarding", "onboardingData");
    
    try {
      const docSnap = await getDoc(onboardingRef);
      if (docSnap.exists()) {
        setOnboardingComplete(docSnap.data().completed === true);
      } else {
        setOnboardingComplete(false);
      }
      
      // Setup real-time listener
      const unsubscribe = onSnapshot(onboardingRef, (doc) => {
        if (doc.exists()) {
          setOnboardingComplete(doc.data().completed === true);
        }
      });
      
      setOnboardingUnsubscribe(() => unsubscribe);
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setOnboardingComplete(false);
    }
  };

  // Add public refresh function
  const refreshOnboardingStatus = async () => {
    if (currentUser?.phoneNumber) {
      await checkOnboardingStatus(currentUser.phoneNumber);
    }
  };

  useEffect(() => {
    let unsubscribeAuth: () => void;

    try {
      unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        // Clean up any existing onboarding listener
        if (onboardingUnsubscribe) {
          onboardingUnsubscribe();
        }
        
        setCurrentUser(user);
        
        if (user?.phoneNumber) {
          await checkOnboardingStatus(user.phoneNumber);
        } else {
          setOnboardingComplete(false);
          setCleanPhone("");
        }
        
        setLoading(false);
      }, (error) => {
        console.error("Auth state error:", error);
        setLoading(false);
      });
    } catch (e) {
      console.error("Auth initialization error:", e);
      setLoading(false);
    }

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (onboardingUnsubscribe) onboardingUnsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setOnboardingComplete(false);
      setCleanPhone("");
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    onboardingComplete,
    signOut,
    refreshOnboardingStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};