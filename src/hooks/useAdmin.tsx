import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase/firebase";
import { useToast } from "./use-toast";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  addDoc,
} from "firebase/firestore";

type UserRole = "admin" | "editor" | null;

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.uid) return;

      try {
        const roleRef = doc(db, "user_roles", user.uid);
        const roleSnap = await getDoc(roleRef);

        if (roleSnap.exists()) {
          const role = roleSnap.data().role as UserRole;
          setUserRole(role);
          setIsAdmin(role === "admin");
        } else {
          setUserRole(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, [user]);

  const makeUserAdmin = async (uid: string) => {
    try {
      const roleRef = doc(db, "user_roles", uid);
      await updateDoc(roleRef, { role: "admin" });
      toast({ title: "Success", description: "User promoted to admin" });
    } catch (error) {
      console.error("Error making user admin:", error);
      toast({ title: "Error", description: "Could not promote user" });
    }
  };

  const makeUserEditor = async (uid: string) => {
    try {
      const roleRef = doc(db, "user_roles", uid);
      await updateDoc(roleRef, { role: "editor" });
      toast({ title: "Success", description: "User role updated to editor" });
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({ title: "Error", description: "Could not update user role" });
    }
  };

  const bulkInviteUsers = async (emails: string[]) => {
    try {
      const batch = emails.map(async (email) => {
        return addDoc(collection(db, "admin_user_invites"), {
          admin_id: user?.uid || "",
          email,
          status: "invited",
        });
      });

      await Promise.all(batch);

      toast({
        title: "Invitations Sent",
        description: "Users have been invited successfully",
      });
    } catch (error) {
      console.error("Error inviting users:", error);
      toast({
        title: "Error",
        description: "Could not invite users",
      });
    }
  };

  const fetchAllUserAnalytics = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "user_analytics"));
      return querySnapshot.docs.map((doc) => doc.data());
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error",
        description: "Could not load analytics data",
      });
      return [];
    }
  };

  const fetchSummary = async () => {
    try {
      const summaryRef = doc(db, "analytics_summary", "summary");
      const docSnap = await getDoc(summaryRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error("Error fetching summary:", error);
      toast({ title: "Error", description: "Could not load summary" });
      return null;
    }
  };

  return {
    isAdmin,
    userRole,
    makeUserAdmin,
    makeUserEditor,
    bulkInviteUsers,
    fetchAllUserAnalytics,
    fetchSummary,
  };
};
