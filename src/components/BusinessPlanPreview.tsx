import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ArrowLeft, FileText, Home } from "lucide-react";
import { BusinessPlanData } from "@/pages/Index";
import { generatePDF } from "@/utils/pdfGenerator";
import { usePlan } from "@/contexts/PlanContext";

interface BusinessPlanPreviewProps {
  data: BusinessPlanData;
  onBack: () => void;
  onBackToDashboard?: () => void;
  planId?: string | null;
}

export const BusinessPlanPreview = ({ data, onBack, onBackToDashboard, planId }: BusinessPlanPreviewProps) => {
  const { incrementDownload, remainingDownloads } = usePlan();

  const handleDownload = () => {
    if (remainingDownloads > 0) {
      generatePDF(data);
      if (planId) {
        incrementDownload(planId);
      }
    }
  };

  const sections = [
    // Executive Summary
    { title: "Executive Summary", subsections: [
      { title: "Business Description", content: data.businessDescription },
      { title: "Market Opportunities", content: data.marketOpportunities },
      { title: "Market Activities", content: data.marketActivities },
      { title: "Operations", content: data.operations },
      { title: "Financial Summary", content: data.financialSummary },
      { title: "The Ask", content: data.theAsk },
    ]},
    
    // The Business
    { title: "The Business", subsections: [
      { title: "Company Overview", content: `${data.companyName} operates in the ${data.sector} sector.` },
      { title: "Products and Services", content: data.productsServices },
      { title: "Purpose and Value Proposition", content: data.purposeValue },
      { title: "Management Team", content: data.managementTeam },
      { title: "Current Status and Progress", content: data.statusProgress },
      { title: "Goals and Milestones", content: data.goalsMilestones },
    ]},
    
    // Industry Analysis
    { title: "Industry Analysis", subsections: [
      { title: "Industry Overview", content: data.industryOverview },
      { title: "Market Analysis", content: data.marketAnalysis },
      { title: "Trend Analysis", content: data.trendAnalysis },
      { title: "Market Demographics", content: data.marketDemographics },
      { title: "Buying Factors", content: data.buyingFactors },
      { title: "Competitive Analysis", content: data.competitiveAnalysis },
      { title: "Entry Strategies", content: data.entryStrategies },
    ]},
    
    // Marketing and Sales Strategies
    { title: "Marketing and Sales Strategies", subsections: [
      { title: "SWOT Analysis", content: data.swotAnalysis },
      { title: "General Marketing Strategies", content: data.generalMarketingStrategies },
      { title: "Unique Selling Point (USP)", content: data.uniqueSellingPoint },
      { title: "Promotion Strategies", content: data.promotionStrategies },
      { title: "Sales Processes", content: data.salesProcesses },
      { title: "Distribution Strategies", content: data.distributionStrategies },
      { title: "Marketing Channels", content: data.marketingChannels },
    ]},
    
    // Operations and Management
    { title: "Operations and Management", subsections: [
      { title: "Location", content: data.location },
      { title: "Systems and Internal Control Procedures", content: data.systemsInternalControl },
      { title: "Training and Regulatory Requirements", content: data.trainingRegulatory },
      { title: "Vendors and Inventory", content: data.vendorsInventory },
      { title: "Manufacturing/Production Processes", content: data.manufacturingProduction },
      { title: "Payment and Customer Policies", content: data.paymentCustomerPolicies },
      { title: "Operations Management Team", content: data.operationsManagementTeam },
    ]},
    
    // Financial Plan
    { title: "Financial Plan", subsections: [
      { title: "Funding Requirements", content: data.funding },
      { title: "Startup Costs", content: data.startupCost },
      { title: "Overhead Costs", content: data.overheadCosts },
      { title: "Sales Forecast", content: data.salesForecast },
      { title: "Sales History", content: data.salesHistory },
      { title: "Financial Risks", content: data.risks },
      { title: "Exit Strategy", content: data.exitStrategy },
      { title: "Emergency Response Plan", content: data.emergencyResponsePlan },
    ]},
    
    // Appendices
    { title: "Appendices", subsections: [
      { title: "Supporting Documents", content: data.appendices },
    ]},
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header with actions */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Edit</span>
          </Button>
          
          {onBackToDashboard && (
            <Button 
              variant="outline" 
              onClick={onBackToDashboard}
              className="flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FileText className="h-4 w-4" />
            <span>Business Plan Preview</span>
          </div>
          <div className="text-sm text-gray-500">
            Downloads remaining: {remainingDownloads}
          </div>
          <Button 
            onClick={handleDownload}
            disabled={remainingDownloads === 0}
            className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </Button>
        </div>
      </div>

      {remainingDownloads === 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            You have no downloads remaining. Contact support to upgrade your plan.
          </p>
        </div>
      )}

      {/* Business Plan Content */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="text-center border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            {data.companyName}
          </CardTitle>
          <p className="text-lg text-gray-600">Business Plan</p>
          <p className="text-sm text-gray-500 mt-2">
            Generated on {new Date().toLocaleDateString()}
          </p>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="space-y-8">
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="border-b border-gray-100 pb-8 last:border-b-0">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="bg-blue-600 text-white text-lg font-medium px-3 py-1 rounded mr-4">
                    {sectionIndex + 1}
                  </span>
                  {section.title}
                </h1>
                
                <div className="space-y-6 pl-8">
                  {section.subsections.map((subsection, subIndex) => (
                    subsection.content && (
                      <div key={subIndex}>
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">
                          {subsection.title}
                        </h2>
                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {subsection.content}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center mt-8 py-6 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          This business plan was generated using Business Plan Pro
        </p>
      </div>
    </div>
  );
};
