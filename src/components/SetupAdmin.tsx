import { useEffect } from 'react';
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from '@/contexts/AuthContext';

export const SetupAdmin = () => {
  const { user } = useAuth();

  useEffect(() => {
    const setupAdminUser = async () => {
      if (user && user.email === 'sam.ola13@gmail.com') {
        try {
          const roleDocRef = doc(db, "user_roles", user.uid);
          const roleDocSnap = await getDoc(roleDocRef);

          if (!roleDocSnap.exists() || roleDocSnap.data().role !== "admin") {
            await setDoc(roleDocRef, {
              user_id: user.uid,
              role: "admin"
            });

            console.log("Admin role assigned to sam.ola13@gmail.com");
          }
        } catch (error) {
          console.error("Error setting up admin user:", error);
        }
      }
    };

    setupAdminUser();
  }, [user]);

  return null;
};
