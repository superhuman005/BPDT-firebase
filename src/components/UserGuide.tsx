
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronRight, FileText, Download, BarChart3, Plus } from "lucide-react";

interface UserGuideProps {
  onClose: () => void;
}

export const UserGuide = ({ onClose }: UserGuideProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Business Plan Pro!",
      content: "Let's take a quick tour to help you get started with creating professional business plans.",
      icon: <FileText className="h-8 w-8 text-blue-600" />,
      position: "center"
    },
    {
      title: "Dashboard Overview",
      content: "This is your dashboard where you can see your plan statistics and manage all your business plans.",
      icon: <BarChart3 className="h-6 w-6 text-green-600" />,
      position: "top-left",
      highlight: ".grid.grid-cols-1.md\\:grid-cols-3"
    },
    {
      title: "Create New Plans",
      content: "Click this button to start creating a new business plan. Our guided process will help you through each section.",
      icon: <Plus className="h-6 w-6 text-blue-600" />,
      position: "top-right",
      highlight: "button:has(svg):contains('Create New Plan')"
    },
    {
      title: "Manage Your Plans",
      content: "Here you'll see all your saved business plans. You can edit them anytime or download them as PDFs.",
      icon: <Download className="h-6 w-6 text-purple-600" />,
      position: "bottom-center",
      highlight: ".grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3"
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const skipTour = () => {
    onClose();
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {step.icon}
              <h3 className="text-lg font-semibold">{step.title}</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={skipTour}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {step.content}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex space-x-2">
              {currentStep > 0 && (
                <Button variant="outline" size="sm" onClick={skipTour}>
                  Skip Tour
                </Button>
              )}
              <Button size="sm" onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
