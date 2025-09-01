import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
// import { Loader } from "@/components/shared/Loader"; // adjust thader component pah




export const SubscriptionGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const userId = user.uid;

        // 1. Check if the user has an admin invite
        const inviteQuery = query(
          collection(db, "admin_user_invites"),
          where("email", "==", user.email)
        );
        const inviteSnap = await getDocs(inviteQuery);
        const hasAdminInvite = !inviteSnap.empty;

        // 2. Check if user has admin role
        const rolesQuery = query(
          collection(db, "user_roles"),
          where("user_id", "==", userId),
          where("role", "==", "admin")
        );
        const rolesSnap = await getDocs(rolesQuery);
        const isAdmin = !rolesSnap.empty;

        if (hasAdminInvite || isAdmin) {
          setLoading(false);
          return;
        }

        // 3. Check if user has an active subscription
        const subQuery = query(
          collection(db, "user_subscriptions"),
          where("user_id", "==", userId),
          where("status", "==", "active")
        );
        const subSnap = await getDocs(subQuery);
        const hasActiveSubscription = !subSnap.empty;

        if (hasActiveSubscription) {
          setLoading(false);
          return;
        }

        // 4. Check if user has completed profile
        const profileRef = doc(db, "profiles", userId);
        const profileSnap = await getDoc(profileRef);
        const profile = profileSnap.exists() ? profileSnap.data() : null;

        const profileComplete =
          profile &&
          profile.full_name &&
          profile.region &&
          profile.location &&
          profile.business_industry;

        if (!profileComplete) {
          navigate("/complete-profile");
        } else {
          navigate("/pricing");
        }
      } catch (error) {
        console.error("Subscription check failed:", error);
        navigate("/error");
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, navigate]);

  // if (loading) return <Loader />;

  // return <>{children}</>;
};
