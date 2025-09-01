import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Plus, BarChart3 } from "lucide-react";
import { usePlan } from "@/contexts/PlanContext";
import { PlanCard } from "@/components/PlanCard";

interface DashboardProps {
  onCreateNew: () => void;
  onEditPlan: (planId: string) => void;

  primaryColor?: string; // heading
  secondaryColor?: string; // subtitle

  plansCreatedGradient?: string; // custom card gradient
  downloadsRemainingGradient?: string; // custom card gradient
  totalDownloadsGradient?: string; // custom card gradient
}

export const Dashboard = ({
  onCreateNew,
  onEditPlan,
  primaryColor = "#364693",
  secondaryColor = "#a43579",

  plansCreatedGradient = "linear-gradient(to right, #364693, #a43579)", // blue-purple
  downloadsRemainingGradient = "linear-gradient(to right, #10B981, #059669)", // green-emerald
  totalDownloadsGradient = "linear-gradient(to right, #8B5CF6, #EC4899)", // purple-pink
}: DashboardProps) => {
  const {
    savedPlans,
    remainingDownloads,
    totalPlansCreated,
    loading,
  } = usePlan();

  const totalDownloads = savedPlans.reduce(
    (sum, plan) => sum + plan.downloadCount,
    0
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your business plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card
          className="text-white border-0"
          style={{ background: plansCreatedGradient }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Plans Created
            </CardTitle>
            <FileText className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPlansCreated}</div>
            <p className="text-xs opacity-80">
              Total business plans generated
            </p>
          </CardContent>
        </Card>

        <Card
          className="text-white border-0"
          style={{ background: downloadsRemainingGradient }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Downloads Remaining
            </CardTitle>
            <Download className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{remainingDownloads}</div>
            <p className="text-xs opacity-80">PDF downloads available</p>
          </CardContent>
        </Card>

        <Card
          className="text-white border-0"
          style={{ background: totalDownloadsGradient }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Downloads
            </CardTitle>
            <BarChart3 className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDownloads}</div>
            <p className="text-xs opacity-80">Plans downloaded to date</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: primaryColor }}
            >
              Your Business Plans
            </h2>
            <p className="text-gray-600" style={{ color: secondaryColor }}>
              Manage and edit your saved business plans
            </p>
          </div>
          <Button
            onClick={onCreateNew}
            className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Plan</span>
          </Button>
        </div>
      </div>

      {/* Plans Grid */}
      {savedPlans.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: primaryColor }}
            >
              No business plans yet
            </h3>
            <p className="mb-6" style={{ color: secondaryColor }}>
              Create your first business plan to get started
            </p>
            <Button
              onClick={onCreateNew}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onEdit={onEditPlan} />
          ))}
        </div>
      )}
    </div>
  );
};
