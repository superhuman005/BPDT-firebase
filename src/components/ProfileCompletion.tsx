import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, MapPin, Building } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ProfileCompletionProps {
  onComplete: () => void;
}

const regions = [
  "North America", "South America", "Europe", "Asia", "Africa", "Oceania"
];

const industries = [
  "Technology", "Healthcare", "Finance", "Education", "Manufacturing", 
  "Retail", "Hospitality", "Agriculture", "Construction", "Transportation",
  "Energy", "Entertainment", "Consulting", "Real Estate", "Other"
];

export const ProfileCompletion = ({ onComplete }: ProfileCompletionProps) => {
  const [formData, setFormData] = useState({
    fullName: "",
    region: "",
    location: "",
    businessIndustry: ""
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.region || !formData.location || !formData.businessIndustry) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (!user?.uid || !user.email) {
        throw new Error("User not authenticated");
      }

      const userRef = doc(db, "profiles", user.uid);

      await setDoc(userRef, {
        id: user.uid,
        email: user.email,
        full_name: formData.fullName,
        region: formData.region,
        location: formData.location,
        business_industry: formData.businessIndustry,
      }, { merge: true });

      toast({
        title: "Success",
        description: "Profile completed successfully!",
      });

      onComplete();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to complete profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <User className="h-6 w-6 text-blue-600" />
            Complete Your Profile
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Please provide some basic information to get started with creating your business plan.
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Full Name *
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <Label htmlFor="region" className="text-sm font-medium text-gray-700">
                Region *
              </Label>
              <Select 
                value={formData.region} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Location *
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter your city/country"
                required
              />
            </div>

            <div>
              <Label htmlFor="businessIndustry" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Building className="h-3 w-3" />
                Business Industry *
              </Label>
              <Select 
                value={formData.businessIndustry} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, businessIndustry: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your business industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Completing..." : "Complete Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
