import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";
import { depositCrypto, withdrawCrypto } from "@/lib/web3";

export default function TestCrypto() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const amount = formData.get("amount") as string;
      const toAddress = formData.get("address") as string;

      const tx = await depositCrypto(amount, toAddress);

      toast({
        title: "Transaction Sent",
        description: `Hash: ${tx.hash}`,
      });

      e.currentTarget.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Test Sepolia Integration</h2>
      <form onSubmit={handleDeposit} className="space-y-4">
        <div className="space-y-2">
          <Label>Amount (ETH)</Label>
          <Input
            name="amount"
            type="number"
            step="0.001"
            min="0.001"
            placeholder="Enter amount in ETH"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>To Address</Label>
          <Input name="address" placeholder="Enter ETH address" required />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending..." : "Send ETH"}
        </Button>
      </form>
    </Card>
  );
}
