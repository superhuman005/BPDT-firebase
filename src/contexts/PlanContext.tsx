import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { BusinessPlanData } from "@/pages/Index";
import { auth, db } from "../lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
  serverTimestamp,
  query,
  where,
  orderBy,
} from "firebase/firestore";

export interface SavedPlan {
  id: string;
  name: string;
  data: BusinessPlanData;
  createdAt: Date;
  updatedAt: Date;
  downloadCount: number;
}

interface PlanContextType {
  savedPlans: SavedPlan[];
  remainingDownloads: number;
  totalPlansCreated: number;
  savePlan: (data: BusinessPlanData) => Promise<string>;
  updatePlan: (id: string, data: BusinessPlanData) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  incrementDownload: (planId: string) => Promise<void>;
  loading: boolean;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error("usePlan must be used within a PlanProvider");
  }
  return context;
};

interface PlanProviderProps {
  children: ReactNode;
}

export const PlanProvider = ({ children }: PlanProviderProps) => {
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [remainingDownloads, setRemainingDownloads] = useState(3);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchPlans();
      fetchDownloadLimits();
    }
  }, [user]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const plansRef = collection(db, "business_plans");
      const q = query(plansRef, where("user_id", "==", user?.uid), orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);

      const plans: SavedPlan[] = snapshot.docs.map(docSnap => {
        const plan = docSnap.data();
        return {
          id: docSnap.id,
          name: plan.name,
          data: {
            companyName: plan.company_name || '',
            sector: plan.industry || '',
            productsServices: '',
            purposeValue: '',
            managementTeam: plan.management_team || '',
            statusProgress: '',
            goalsMilestones: '',
            industryOverview: '',
            marketAnalysis: '',
            trendAnalysis: '',
            marketDemographics: '',
            buyingFactors: '',
            competitiveAnalysis: plan.competitive_advantage || '',
            entryStrategies: '',
            swotAnalysis: '',
            generalMarketingStrategies: plan.marketing_strategy || '',
            uniqueSellingPoint: '',
            promotionStrategies: '',
            salesProcesses: '',
            distributionStrategies: '',
            marketingChannels: '',
            location: '',
            systemsInternalControl: '',
            trainingRegulatory: '',
            vendorsInventory: '',
            manufacturingProduction: '',
            paymentCustomerPolicies: '',
            operationsManagementTeam: '',
            funding: plan.funding_request || '',
            startupCost: '',
            overheadCosts: '',
            salesForecast: '',
            salesHistory: '',
            risks: plan.risk_analysis || '',
            exitStrategy: '',
            emergencyResponsePlan: '',
            appendices: '',
            attachments: [],
            businessDescription: plan.executive_summary || '',
            marketOpportunities: '',
            marketActivities: '',
            operations: plan.operational_plan || '',
            financialSummary: plan.financial_projections || '',
            theAsk: plan.funding_request || '',
          },
          createdAt: plan.created_at?.toDate?.() || new Date(),
          updatedAt: plan.updated_at?.toDate?.() || new Date(),
          downloadCount: plan.download_count || 0,
        };
      });

      setSavedPlans(plans);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load business plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDownloadLimits = async () => {
    try {
      const docRef = doc(db, "user_download_limits", user!.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          downloads_remaining: 3,
          downloads_used: 0,
        });
        setRemainingDownloads(3);
      } else {
        const data = docSnap.data();
        setRemainingDownloads(data.downloads_remaining);
      }
    } catch (err) {
      console.error("Failed to fetch download limits:", err);
      setRemainingDownloads(3);
    }
  };

  const savePlan = async (data: BusinessPlanData): Promise<string> => {
    try {
      const newPlanRef = doc(collection(db, "business_plans"));
      const payload = {
        user_id: user?.uid,
        name: data.companyName || "Untitled Plan",
        company_name: data.companyName,
        industry: data.sector,
        executive_summary: data.businessDescription,
        marketing_strategy: data.generalMarketingStrategies,
        operational_plan: data.operations,
        management_team: data.managementTeam,
        financial_projections: data.financialSummary,
        funding_request: data.funding,
        competitive_advantage: data.competitiveAnalysis,
        risk_analysis: data.risks,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        download_count: 0,
      };

      await setDoc(newPlanRef, payload);
      await fetchPlans();

      toast({ title: "Success", description: "Business plan saved successfully" });
      return newPlanRef.id;
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save business plan",
        variant: "destructive",
      });
      throw err;
    }
  };

  const updatePlan = async (id: string, data: BusinessPlanData) => {
    try {
      const planRef = doc(db, "business_plans", id);
      await updateDoc(planRef, {
        name: data.companyName || "Untitled Plan",
        company_name: data.companyName,
        industry: data.sector,
        executive_summary: data.businessDescription,
        marketing_strategy: data.generalMarketingStrategies,
        operational_plan: data.operations,
        management_team: data.managementTeam,
        financial_projections: data.financialSummary,
        funding_request: data.funding,
        competitive_advantage: data.competitiveAnalysis,
        risk_analysis: data.risks,
        updated_at: serverTimestamp(),
      });

      await fetchPlans();
      toast({ title: "Success", description: "Business plan updated successfully" });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update business plan",
        variant: "destructive",
      });
    }
  };

  const deletePlan = async (id: string) => {
    try {
      await deleteDoc(doc(db, "business_plans", id));
      await fetchPlans();
      toast({ title: "Success", description: "Business plan deleted successfully" });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete business plan",
        variant: "destructive",
      });
    }
  };

  const incrementDownload = async (planId: string) => {
    try {
      if (remainingDownloads <= 0) {
        toast({
          title: "Download Limit Reached",
          description: "You have reached your download limit of 3 plans.",
          variant: "destructive",
        });
        return;
      }

      const planRef = doc(db, "business_plans", planId);
      await updateDoc(planRef, {
        download_count: increment(1),
      });

      const userLimitRef = doc(db, "user_download_limits", user!.uid);
      await updateDoc(userLimitRef, {
        downloads_remaining: increment(-1),
        downloads_used: increment(1),
        updated_at: serverTimestamp(),
      });

      setRemainingDownloads(prev => prev - 1);
      await fetchPlans();
    } catch (err) {
      console.error("Failed to increment download count:", err);
      toast({
        title: "Error",
        description: "Failed to record download",
        variant: "destructive",
      });
    }
  };

  const totalPlansCreated = savedPlans.length;

  return (
    <PlanContext.Provider
      value={{
        savedPlans,
        remainingDownloads,
        totalPlansCreated,
        savePlan,
        updatePlan,
        deletePlan,
        incrementDownload,
        loading,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
};
