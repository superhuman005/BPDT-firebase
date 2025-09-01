import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Sparkles, Save, Info, Lightbulb, ExternalLink, Upload } from "lucide-react";
import { BusinessPlanData } from "@/pages/Index";
import { AITextarea } from "@/components/AITextarea";
import { usePlan } from "@/contexts/PlanContext";

interface BusinessPlanFormProps {
  onSubmit: (data: BusinessPlanData) => void;
  initialData?: BusinessPlanData | null;
  isEditing?: boolean;
  onBack?: () => void;
}

const formSections = [
  { 
    title: "The Business", 
    fields: ["companyName", "sector", "productsServices", "purposeValue", "managementTeam", "statusProgress", "goalsMilestones"],
    tip: "Define your business fundamentals - what you do, who leads it, and where you're headed."
  },
  { 
    title: "Industry Analysis", 
    fields: ["industryOverview", "marketAnalysis", "trendAnalysis", "marketDemographics", "buyingFactors", "competitiveAnalysis", "entryStrategies"],
    tip: "Thoroughly analyze your industry landscape, market conditions, and competitive environment."
  },
  { 
    title: "Marketing and Sales Strategies", 
    fields: ["swotAnalysis", "generalMarketingStrategies", "uniqueSellingPoint", "promotionStrategies", "salesProcesses", "distributionStrategies", "marketingChannels"],
    tip: "Develop comprehensive strategies to reach customers and drive sales growth."
  },
  { 
    title: "Operations and Management", 
    fields: ["location", "systemsInternalControl", "trainingRegulatory", "vendorsInventory", "manufacturingProduction", "paymentCustomerPolicies", "operationsManagementTeam"],
    tip: "Detail your operational framework and management structure for daily business execution."
  },
  { 
    title: "Financial Plan", 
    fields: ["funding", "startupCost", "overheadCosts", "salesForecast", "salesHistory", "risks", "exitStrategy", "emergencyResponsePlan"],
    tip: "Present your financial projections, funding needs, and risk management strategies."
  },
  { 
    title: "Appendices", 
    fields: ["appendices"],
    tip: "Include supporting documents, charts, and additional information that supports your business plan."
  },
  { 
    title: "Executive Summary", 
    fields: ["businessDescription", "marketOpportunities", "marketActivities", "operations", "financialSummary", "theAsk"],
    tip: "Write this last - provide a compelling overview that summarizes your entire business plan."
  }
];

const fieldLabels: Record<string, string> = {
  // The Business
  companyName: "Company Name",
  sector: "Business Sector",
  productsServices: "Products and Services",
  purposeValue: "Purpose and Value Proposition",
  managementTeam: "Management Team",
  statusProgress: "Current Status and Progress",
  goalsMilestones: "Goals and Milestones",
  
  // Industry Analysis
  industryOverview: "Industry Overview",
  marketAnalysis: "Market Analysis",
  trendAnalysis: "Trend Analysis",
  marketDemographics: "Market Demographics",
  buyingFactors: "Buying Factors",
  competitiveAnalysis: "Competitive Analysis",
  entryStrategies: "Entry Strategies",
  
  // Marketing and Sales Strategies
  swotAnalysis: "SWOT Analysis",
  generalMarketingStrategies: "General Marketing Strategies",
  uniqueSellingPoint: "Unique Selling Point (USP)",
  promotionStrategies: "Promotion Strategies",
  salesProcesses: "Sales Processes",
  distributionStrategies: "Distribution Strategies",
  marketingChannels: "Marketing Channels",
  
  // Operations and Management
  location: "Location",
  systemsInternalControl: "Systems and Internal Control Procedures",
  trainingRegulatory: "Training and Regulatory Requirements",
  vendorsInventory: "Vendors and Inventory",
  manufacturingProduction: "Manufacturing/Production Processes",
  paymentCustomerPolicies: "Payment and Customer Policies",
  operationsManagementTeam: "Operations Management Team",
  
  // Financial Plan
  funding: "Funding Requirements",
  startupCost: "Startup Costs",
  overheadCosts: "Overhead Costs",
  salesForecast: "Sales Forecast",
  salesHistory: "Sales History",
  risks: "Financial Risks",
  exitStrategy: "Exit Strategy",
  emergencyResponsePlan: "Emergency Response Plan",
  
  // Appendices
  appendices: "Supporting Documents and Appendices",
  
  // Executive Summary
  businessDescription: "Business Description",
  marketOpportunities: "Market Opportunities",
  marketActivities: "Market Activities",
  operations: "Operations Summary",
  financialSummary: "Financial Summary",
  theAsk: "The Ask (Funding Request)"
};

const fieldPlaceholders: Record<string, string> = {
  // The Business
  companyName: "Enter your company name",
  sector: "e.g., Technology, Healthcare, Manufacturing, Retail",
  productsServices: "Describe your main products and services...",
  purposeValue: "Outline your company's mission and value proposition...",
  managementTeam: "Introduce key management team members and their roles...",
  statusProgress: "Describe current business status and recent progress...",
  goalsMilestones: "Define your short-term and long-term business goals...",
  
  // Industry Analysis
  industryOverview: "Provide an overview of your industry landscape...",
  marketAnalysis: "Analyze your target market size and characteristics...",
  trendAnalysis: "Identify key industry trends and market movements...",
  marketDemographics: "Describe your target customer demographics...",
  buyingFactors: "Explain what drives customer purchasing decisions...",
  competitiveAnalysis: "Analyze your main competitors and their strategies...",
  entryStrategies: "Outline your market entry and expansion strategies...",
  
  // Marketing and Sales Strategies
  swotAnalysis: "Analyze your Strengths, Weaknesses, Opportunities, and Threats...",
  generalMarketingStrategies: "Describe your overall marketing approach...",
  uniqueSellingPoint: "Define what makes your business unique...",
  promotionStrategies: "Outline your promotional and advertising strategies...",
  salesProcesses: "Describe your sales methodology and processes...",
  distributionStrategies: "Explain how you'll distribute your products/services...",
  marketingChannels: "List your marketing channels and tactics...",
  
  // Operations and Management
  location: "Describe your business location and facilities...",
  systemsInternalControl: "Outline your operational systems and controls...",
  trainingRegulatory: "Describe training programs and regulatory compliance...",
  vendorsInventory: "Detail vendor relationships and inventory management...",
  manufacturingProduction: "Explain your production or service delivery processes...",
  paymentCustomerPolicies: "Outline payment terms and customer service policies...",
  operationsManagementTeam: "Describe your operational management structure...",
  
  // Financial Plan
  funding: "Specify funding requirements and sources...",
  startupCost: "Detail initial startup costs and investments...",
  overheadCosts: "List ongoing operational expenses...",
  salesForecast: "Provide sales projections and assumptions...",
  salesHistory: "Include historical sales data if available...",
  risks: "Identify potential financial risks and mitigation strategies...",
  exitStrategy: "Describe potential exit opportunities...",
  emergencyResponsePlan: "Outline contingency plans for financial emergencies...",
  
  // Appendices
  appendices: "List supporting documents, charts, and additional materials...",
  
  // Executive Summary
  businessDescription: "Provide a concise business overview...",
  marketOpportunities: "Summarize key market opportunities...",
  marketActivities: "Describe planned market activities...",
  operations: "Summarize operational plans and capabilities...",
  financialSummary: "Highlight key financial projections and metrics...",
  theAsk: "Clearly state your funding request and intended use..."
};

export const BusinessPlanForm = ({ onSubmit, initialData, isEditing = false, onBack }: BusinessPlanFormProps) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<BusinessPlanData>({
    // The Business
    companyName: "",
    sector: "",
    productsServices: "",
    purposeValue: "",
    managementTeam: "",
    statusProgress: "",
    goalsMilestones: "",
    
    // Industry Analysis
    industryOverview: "",
    marketAnalysis: "",
    trendAnalysis: "",
    marketDemographics: "",
    buyingFactors: "",
    competitiveAnalysis: "",
    entryStrategies: "",
    
    // Marketing and Sales Strategies
    swotAnalysis: "",
    generalMarketingStrategies: "",
    uniqueSellingPoint: "",
    promotionStrategies: "",
    salesProcesses: "",
    distributionStrategies: "",
    marketingChannels: "",
    
    // Operations and Management
    location: "",
    systemsInternalControl: "",
    trainingRegulatory: "",
    vendorsInventory: "",
    manufacturingProduction: "",
    paymentCustomerPolicies: "",
    operationsManagementTeam: "",
    
    // Financial Plan
    funding: "",
    startupCost: "",
    overheadCosts: "",
    salesForecast: "",
    salesHistory: "",
    risks: "",
    exitStrategy: "",
    emergencyResponsePlan: "",
    
    // Appendices
    appendices: "",
    attachments: [],
    
    // Executive Summary
    businessDescription: "",
    marketOpportunities: "",
    marketActivities: "",
    operations: "",
    financialSummary: "",
    theAsk: "",
  });

  const { updatePlan, savePlan } = usePlan();

  // Load initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Calculate progress based on filled fields
  const calculateProgress = () => {
    const totalFields = Object.keys(formData).length - 1; // Exclude attachments
    const filledFields = Object.entries(formData).filter(([key, value]) => 
      key !== 'attachments' && typeof value === 'string' && value.trim() !== ""
    ).length;
    return Math.round((filledFields / totalFields) * 100);
  };

  const progress = calculateProgress();
  const sectionProgress = ((currentSection + 1) / formSections.length) * 100;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      setFormData(prev => ({ ...prev, attachments: Array.from(files) }));
    }
  };

  const handleSaveProgress = () => {
    if (isEditing) {
      console.log('Saving progress for existing plan');
    } else {
      const planId = savePlan(formData);
      console.log('Saved new draft with ID:', planId);
    }
  };

  const handleNext = () => {
    if (currentSection < formSections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const renderField = (field: string) => {
    const isTextArea = !["companyName", "sector"].includes(field);
    
    // Special handling for Financial Plan section
    if (currentSection === 4 && field === "funding") {
      return (
        <div key={field} className="space-y-3">
          <Label htmlFor={field} className="text-sm font-medium text-gray-700 flex items-center gap-2">
            {fieldLabels[field]}
            <Sparkles className="h-3 w-3 text-blue-500" />
          </Label>
          
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200 mb-3">
            <ExternalLink className="h-4 w-4 text-blue-600" />
            <a 
              href="/financial-plan-sample.xlsx" 
              download 
              className="text-sm text-blue-700 hover:underline"
            >
              Download Financial Plan Sample Template
            </a>
          </div>
          
          <AITextarea
            id={field}
            value={formData[field as keyof BusinessPlanData] as string}
            onChange={(value) => handleInputChange(field, value)}
            placeholder={fieldPlaceholders[field]}
            fieldType={field}
            companyName={formData.companyName}
            industry={formData.sector}
          />
        </div>
      );
    }
    
    // Special handling for Appendices section
    if (field === "appendices") {
      return (
        <div key={field} className="space-y-3">
          <Label htmlFor={field} className="text-sm font-medium text-gray-700 flex items-center gap-2">
            {fieldLabels[field]}
            <Upload className="h-3 w-3 text-blue-500" />
          </Label>
          
          <AITextarea
            id={field}
            value={formData[field as keyof BusinessPlanData] as string}
            onChange={(value) => handleInputChange(field, value)}
            placeholder={fieldPlaceholders[field]}
            fieldType={field}
            companyName={formData.companyName}
            industry={formData.sector}
          />
          
          <div className="mt-4">
            <Label htmlFor="attachments" className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
              <Upload className="h-4 w-4" />
              Upload Supporting Documents
            </Label>
            <Input
              id="attachments"
              type="file"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {formData.attachments && formData.attachments.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                {formData.attachments.length} file(s) selected
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div key={field} className="space-y-3">
        <Label htmlFor={field} className="text-sm font-medium text-gray-700 flex items-center gap-2">
          {fieldLabels[field]}
          {isTextArea && <Sparkles className="h-3 w-3 text-blue-500" />}
        </Label>
        
        {isTextArea ? (
          <AITextarea
            id={field}
            value={formData[field as keyof BusinessPlanData] as string}
            onChange={(value) => handleInputChange(field, value)}
            placeholder={fieldPlaceholders[field]}
            fieldType={field}
            companyName={formData.companyName}
            industry={formData.sector}
          />
        ) : (
          <Input
            id={field}
            value={formData[field as keyof BusinessPlanData] as string}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={fieldPlaceholders[field]}
          />
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with back button */}
      {onBack && (
        <div className="mb-6">
          <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Section {currentSection + 1} of {formSections.length}</span>
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              Overall Progress: {progress}%
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSaveProgress}
              className="flex items-center space-x-1"
            >
              <Save className="h-3 w-3" />
              <span>Save Progress</span>
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="text-xs text-gray-500 text-right">
            Section Progress: {Math.round(sectionProgress)}%
          </div>
        </div>
      </div>

      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            {formSections[currentSection].title}
            <Sparkles className="h-5 w-5 text-blue-500" />
          </CardTitle>
          <CardDescription className="text-gray-600">
            {formSections[currentSection].tip}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {formSections[currentSection].fields.map((field) => 
            renderField(field)
          )}

          <div className="flex justify-between pt-6 border-t">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentSection === 0}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            {currentSection === formSections.length - 1 ? (
              <Button 
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
              >
                <span>{isEditing ? 'Update Business Plan' : 'Generate Business Plan'}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
