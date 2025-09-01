
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Edit, Calendar, BarChart3 } from "lucide-react";
import { SavedPlan, usePlan } from "@/contexts/PlanContext";
import { generatePDF } from "@/utils/pdfGenerator";

interface PlanCardProps {
  plan: SavedPlan;
  onEdit: (planId: string) => void;
}

export const PlanCard = ({ plan, onEdit }: PlanCardProps) => {
  const { incrementDownload, remainingDownloads } = usePlan();

  const handleDownload = async () => {
    if (remainingDownloads <= 0) {
      return;
    }
    
    try {
      generatePDF(plan.data);
      await incrementDownload(plan.id);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleEdit = () => {
    onEdit(plan.id);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <CardDescription className="flex items-center space-x-2 mt-1">
                <Calendar className="h-3 w-3" />
                <span>Created {plan.createdAt.toLocaleDateString()}</span>
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <div className="flex items-center justify-between mb-2">
              <span>Sector:</span>
              <span className="font-medium">{plan.data.sector || 'Not specified'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                Downloads:
              </span>
              <span className="font-medium">{plan.downloadCount}</span>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleEdit}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button 
              size="sm"
              onClick={handleDownload}
              disabled={remainingDownloads <= 0}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>

          <div className="text-xs text-center">
            {remainingDownloads > 0 ? (
              <span className="text-green-600">
                {remainingDownloads} downloads remaining
              </span>
            ) : (
              <span className="text-red-600">
                No downloads remaining
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
