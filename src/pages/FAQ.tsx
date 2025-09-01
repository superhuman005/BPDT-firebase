
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

const FAQ = () => {
  const faqs = [
    {
      question: "How long does it take to generate a business plan?",
      answer: "Our AI-powered tool can generate a comprehensive business plan in just a few minutes after you complete the form."
    },
    {
      question: "Can I edit my business plan after it's generated?",
      answer: "Yes, you can go back and modify any section of your business plan and regenerate it with the updated information."
    },
    {
      question: "What format is the business plan exported in?",
      answer: "Your business plan can be exported as a professional PDF document that's ready for investors and stakeholders."
    },
    {
      question: "Is my business information secure?",
      answer: "Yes, we take data security seriously. All your business information is encrypted and stored securely."
    },
    {
      question: "Can I create multiple business plans?",
      answer: "Absolutely! You can create as many business plans as you need for different ventures or iterations."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h1>
          <p className="text-gray-600">Find answers to common questions about our business plan generator</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
