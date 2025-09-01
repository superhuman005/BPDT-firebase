import { useState, useEffect } from "react";
import { BusinessPlanForm } from "@/components/BusinessPlanForm";
import { BusinessPlanPreview } from "@/components/BusinessPlanPreview";
import { Dashboard } from "@/components/Dashboard";
import { ProfileCompletion } from "@/components/ProfileCompletion";
import { UserGuide } from "@/components/UserGuide";
import { Button } from "@/components/ui/button";
import { FileText, Download, Sparkles, ArrowLeft } from "lucide-react";
import { usePlan } from "@/contexts/PlanContext";
import { useAuth } from "@/contexts/AuthContext";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export interface BusinessPlanData {
  companyName: string;
  sector: string;
  productsServices: string;
  purposeValue: string;
  managementTeam: string;
  statusProgress: string;
  goalsMilestones: string;
  industryOverview: string;
  marketAnalysis: string;
  trendAnalysis: string;
  marketDemographics: string;
  buyingFactors: string;
  competitiveAnalysis: string;
  entryStrategies: string;
  swotAnalysis: string;
  generalMarketingStrategies: string;
  uniqueSellingPoint: string;
  promotionStrategies: string;
  salesProcesses: string;
  distributionStrategies: string;
  marketingChannels: string;
  location: string;
  systemsInternalControl: string;
  trainingRegulatory: string;
  vendorsInventory: string;
  manufacturingProduction: string;
  paymentCustomerPolicies: string;
  operationsManagementTeam: string;
  funding: string;
  startupCost: string;
  overheadCosts: string;
  salesForecast: string;
  salesHistory: string;
  risks: string;
  exitStrategy: string;
  emergencyResponsePlan: string;
  appendices: string;
  attachments?: File[];
  businessDescription: string;
  marketOpportunities: string;
  marketActivities: string;
  operations: string;
  financialSummary: string;
  theAsk: string;
}

type ViewMode = "dashboard" | "form" | "preview";

interface IndexProps {
  primaryColor?: string;
  secondaryColor?: string;
}

const Index = ({
  primaryColor = "#364693",
  secondaryColor = "#a43579",
}: IndexProps) => {
  const [currentView, setCurrentView] = useState<ViewMode>("dashboard");
  const [businessPlanData, setBusinessPlanData] = useState<BusinessPlanData | null>(null);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const { savePlan, updatePlan, savedPlans } = usePlan();
  const { user } = useAuth();

  useEffect(() => {
    const checkProfileCompletion = async (userId: string) => {
      try {
        const profileSnap = await getDoc(doc(db, "profiles", userId));
        if (profileSnap.exists()) {
          const data = profileSnap.data();

          const isComplete = data?.full_name && data?.region;
          setProfileComplete(!!isComplete);

          if (!data.name || !data.phone) {
            setShowGuide(true);
          }

          if (isComplete && savedPlans.length === 0) {
            const hasSeenGuide = localStorage.getItem("hasSeenGuide");
            if (!hasSeenGuide) {
              setShowGuide(true);
            }
          }
        } else {
          setProfileComplete(false);
        }
      } catch (error) {
        console.error("Error checking profile completion:", error);
        setProfileComplete(false);
      }
    };

    if (user?.uid) {
      checkProfileCompletion(user.uid);
    }
  }, [user, savedPlans.length]);

  const handleProfileComplete = () => {
    setProfileComplete(true);
    setShowGuide(true);
  };

  const handleGuideClose = () => {
    setShowGuide(false);
    localStorage.setItem("hasSeenGuide", "true");
  };

  const handleCreateNew = () => {
    setBusinessPlanData(null);
    setEditingPlanId(null);
    setCurrentView("form");
  };

  const handleEditPlan = (planId: string) => {
    const plan = savedPlans.find((p) => p.id === planId);
    if (plan) {
      setBusinessPlanData(plan.data);
      setEditingPlanId(planId);
      setCurrentView("form");
    }
  };

  const handleFormSubmit = async (data: BusinessPlanData) => {
    setBusinessPlanData(data);

    try {
      if (editingPlanId) {
        await updatePlan(editingPlanId, data);
      } else {
        const newPlanId = await savePlan(data);
        setEditingPlanId(newPlanId);
      }

      setCurrentView("preview");
    } catch (error) {
      console.error("Error saving plan:", error);
    }
  };

  const handleBackToForm = () => {
    setCurrentView("form");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setBusinessPlanData(null);
    setEditingPlanId(null);
  };

  if (profileComplete === false) {
    return <ProfileCompletion onComplete={handleProfileComplete} />;
  }

  if (profileComplete === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(to bottom right, ${primaryColor}11, white 50%, ${secondaryColor}11)`,
      }}
    >
      {currentView === "form" && (
        <div
          className="relative overflow-hidden py-16"
          style={{
            background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <Button
                variant="outline"
                onClick={handleBackToDashboard}
                className="text-white border-white hover:bg-white hover:text-blue-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="text-white text-sm">
                {editingPlanId ? "Editing Plan" : "Creating New Plan"}
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-4xl font-bold text-white mb-4">
                {editingPlanId ? "Edit Your Business Plan" : "Create Your Professional Business Plan"}
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                {editingPlanId
                  ? "Update your business plan with new information and insights."
                  : "Generate comprehensive, investor-ready business plans in minutes. Our guided process helps you articulate your vision and strategy."}
              </p>
              <div className="flex items-center justify-center space-x-8 text-blue-100">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>16 Key Sections</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>PDF Download</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5" />
                  <span>AI-Powered Suggestions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === "dashboard" && (
          <Dashboard onCreateNew={handleCreateNew} onEditPlan={handleEditPlan} />
        )}

        {currentView === "form" && (
          <BusinessPlanForm
            onSubmit={handleFormSubmit}
            initialData={businessPlanData}
            isEditing={!!editingPlanId}
            onBack={handleBackToDashboard}
          />
        )}

        {currentView === "preview" && businessPlanData && (
          <BusinessPlanPreview
            data={businessPlanData}
            onBack={handleBackToForm}
            onBackToDashboard={handleBackToDashboard}
            planId={editingPlanId}
          />
        )}
      </div>

      {showGuide && <UserGuide onClose={handleGuideClose} />}
    </div>
  );
};

export default Index;
