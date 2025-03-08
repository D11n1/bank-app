import { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useAuth } from "@/hooks/useAuth";
import { requestAccount } from "@/lib/accounts";
import { Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export default function AccountManagement() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.target as HTMLFormElement);
    const accountType = formData.get("accountType") as string;

    try {
      await requestAccount({
        userId: user.id,
        accountType,
      });

      setSuccess(true);
      setIsOpen(false);
      window.location.reload(); // Refresh to show new request
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Request New Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request New Account</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Select the type of account you would like to request.
          </p>
        </DialogHeader>
        <form onSubmit={handleCreateAccount} className="space-y-4">
          <div className="space-y-2">
            <Label>Account Type</Label>
            <Select name="accountType" required>
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                {!user?.profile?.is_admin ? (
                  <>
                    <SelectItem value="checking">Checking Account</SelectItem>
                    <SelectItem value="savings">Savings Account</SelectItem>
                    <SelectItem value="business">Business Account</SelectItem>
                  </>
                ) : (
                  <SelectItem value="admin_deposit">
                    Admin Deposit Account
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && (
            <p className="text-sm text-green-500">
              Account request submitted successfully!
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Request...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
