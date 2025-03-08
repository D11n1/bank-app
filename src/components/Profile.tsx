import { useState } from "react";
import { Card } from "./ui/card";
import KYCForm from "./KYCForm";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
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

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);

      if (error) throw error;

      setSuccess(true);
      setIsEditing(false);
      // Update local user state
      user.profile.full_name = fullName;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
        ← Back
      </Button>

      <Card className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Profile</h2>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            {isEditing ? (
              <Input
                id="fullName"
                name="fullName"
                defaultValue={user?.profile?.full_name || ""}
                placeholder="Enter your full name"
                required
                disabled={loading}
              />
            ) : (
              <p className="text-lg">{user?.profile?.full_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <p className="text-lg">{user?.profile?.email}</p>
          </div>

          <div className="space-y-2">
            <Label>Account Type</Label>
            <p className="text-lg capitalize">
              {user?.profile?.is_admin ? "Administrator" : "Customer"}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Member Since</Label>
            <p className="text-lg">
              {new Date(user?.profile?.created_at).toLocaleDateString()}
            </p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && (
            <p className="text-sm text-green-500">
              Profile updated successfully!
            </p>
          )}

          {isEditing && (
            <div className="flex space-x-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          )}
        </form>
      </Card>

      {/* KYC Form */}
      <div className="mt-6">
        <KYCForm />
      </div>
    </div>
  );
}
