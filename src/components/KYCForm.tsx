import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function KYCForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.target as HTMLFormElement);
    const fullName = formData.get("fullName") as string;
    const dateOfBirth = formData.get("dateOfBirth") as string;
    const address = formData.get("address") as string;
    const documentType = formData.get("documentType") as string;
    const documentNumber = formData.get("documentNumber") as string;
    const documentUrl = formData.get("documentUrl") as string;

    try {
      const { error } = await supabase.from("kyc_requests").insert([
        {
          user_id: user.id,
          full_name: fullName,
          date_of_birth: dateOfBirth,
          address,
          document_type: documentType,
          document_number: documentNumber,
          document_url: documentUrl,
          status: "pending",
        },
      ]);

      if (error) throw error;

      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">KYC Verification</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Legal Name</Label>
          <Input id="fullName" name="fullName" required disabled={loading} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Full Address</Label>
          <Input id="address" name="address" required disabled={loading} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="documentType">Document Type</Label>
          <Select name="documentType" required>
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="passport">Passport</SelectItem>
              <SelectItem value="drivers_license">Driver's License</SelectItem>
              <SelectItem value="national_id">National ID</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="documentNumber">Document Number</Label>
          <Input
            id="documentNumber"
            name="documentNumber"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="documentUrl">Document Image URL</Label>
          <Input
            id="documentUrl"
            name="documentUrl"
            type="url"
            placeholder="https://example.com/document.jpg"
            required
            disabled={loading}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && (
          <p className="text-sm text-green-500">
            KYC request submitted successfully! Please wait for admin approval.
          </p>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit KYC"
          )}
        </Button>
      </form>
    </Card>
  );
}
