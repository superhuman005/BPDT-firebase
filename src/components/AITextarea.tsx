
import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { AIService } from "@/services/aiService";

interface AITextareaProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  fieldType: string;
  companyName?: string;
  industry?: string;
  className?: string;
}

export const AITextarea = ({
  id,
  value,
  onChange,
  placeholder,
  fieldType,
  companyName,
  industry,
  className
}: AITextareaProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const generateSuggestions = async () => {
    setIsLoading(true);
    try {
      const aiService = AIService.getInstance();
      const newSuggestions = await aiService.generatePredictiveText(
        fieldType,
        value,
        companyName,
        industry
      );
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error generating suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestion = (suggestion: string) => {
    const newValue = value ? `${value}\n\n${suggestion}` : suggestion;
    onChange(newValue);
    setShowSuggestions(false);
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`min-h-[120px] resize-none pr-12 ${className}`}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={generateSuggestions}
          disabled={isLoading}
          className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-blue-50"
          title="Generate AI suggestions"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 text-blue-600" />
          )}
        </Button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <Card className="p-4 border border-blue-200 bg-blue-50/50">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">AI Suggestions</span>
          </div>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => applySuggestion(suggestion)}
                className="w-full text-left p-3 text-sm bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSuggestions(false)}
            className="mt-2 text-gray-500 hover:text-gray-700"
          >
            Close suggestions
          </Button>
        </Card>
      )}
    </div>
  );
};
