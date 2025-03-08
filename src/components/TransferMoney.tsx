import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuth } from "@/hooks/useAuth";
import { transferMoney } from "@/lib/transfers";
import { getAccounts } from "@/lib/accounts";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function TransferMoney() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");

  useEffect(() => {
    const fetchAccounts = async () => {
      if (user?.id) {
        const { data } = await getAccounts(user.id);
        setAccounts(data || []);
        if (data?.[0]) {
          setSelectedAccount(data[0].id);
        }
      }
    };

    fetchAccounts();
  }, [user]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const amount = parseFloat(formData.get("amount") as string);
    const description = formData.get("description") as string;
    const recipientAccount = formData.get("recipientAccount") as string;

    try {
      await transferMoney({
        fromAccountId: selectedAccount,
        toAccountNumber: recipientAccount,
        amount,
        description,
      });

      toast({
        title: "Transfer Successful",
        description: `Successfully transferred $${amount.toFixed(2)}`,
        variant: "default",
      });

      (e.target as HTMLFormElement).reset();
    } catch (error) {
      let errorMessage = "Failed to process transfer";

      if (error.message.includes("Insufficient funds")) {
        errorMessage = "Insufficient funds to complete the transfer";
      } else if (error.message.includes("Could not find recipient")) {
        errorMessage = "Invalid recipient account number";
      } else if (error.message.includes("same account")) {
        errorMessage = "Cannot transfer to the same account";
      }

      toast({
        variant: "destructive",
        title: "Transfer Failed",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Transfer Money</h2>
      <form onSubmit={handleTransfer} className="space-y-4">
        <div className="space-y-2">
          <Label>From Account</Label>
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.account_type.charAt(0).toUpperCase() +
                    account.account_type.slice(1)}{" "}
                  - {account.account_number}
                  (${account.balance.toFixed(2)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipientAccount">To Account Number</Label>
          <Input
            id="recipientAccount"
            name="recipientAccount"
            placeholder="Enter recipient's account number"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Enter amount"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            name="description"
            placeholder="Enter transfer description"
            required
            disabled={loading}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Transfer"
          )}
        </Button>
      </form>
      <Toaster />
    </Card>
  );
}
