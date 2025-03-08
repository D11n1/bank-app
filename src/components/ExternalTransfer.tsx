import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useToast } from "./ui/use-toast";
import { Loader2, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { initiateWithdrawal } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

export default function ExternalTransfer({ accountId }: { accountId: string }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const amount = parseFloat(formData.get("amount") as string);

      // Create deposit request
      const { error } = await supabase.from("deposit_requests").insert([
        {
          account_id: accountId,
          amount: amount,
          status: "pending",
        },
      ]);

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "Your deposit request has been submitted for review",
      });

      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: error.message || "Failed to submit deposit request",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const amount = parseFloat(formData.get("amount") as string);

      await initiateWithdrawal(amount * 100, accountId);

      toast({
        title: "Withdrawal Initiated",
        description: `Withdrawal request for $${amount.toFixed(2)} has been initiated`,
      });

      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Withdrawal Failed",
        description: error.message || "Failed to process withdrawal",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <Tabs defaultValue="deposit" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
        </TabsList>

        <TabsContent value="deposit">
          <form onSubmit={handleDeposit} className="space-y-4">
            <div className="space-y-2">
              <Label>Amount to Deposit</Label>
              <Input
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Enter amount"
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
                <>
                  <ArrowDownToLine className="mr-2 h-4 w-4" />
                  Request Deposit
                </>
              )}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="withdraw">
          <form onSubmit={handleWithdrawal} className="space-y-4">
            <div className="space-y-2">
              <Label>Amount to Withdraw</Label>
              <Input
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Enter amount"
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
                <>
                  <ArrowUpFromLine className="mr-2 h-4 w-4" />
                  Withdraw
                </>
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
