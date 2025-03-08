import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";
import { Loader2 } from "lucide-react";
import { processCryptoPurchase } from "@/lib/internalTransfer";
import { useAuth } from "@/hooks/useAuth";

export default function InternalCryptoTransfer() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const accountId = formData.get("accountId") as string;
      const amountUsd = parseFloat(formData.get("amountUsd") as string);
      const walletAddress = formData.get("walletAddress") as string;

      // Calculate crypto amount based on fixed rate
      // In production, you would get this from your internal rate system
      const cryptoAmount = amountUsd * 0.0005; // Example rate: 1 USD = 0.0005 ETH

      await processCryptoPurchase({
        accountId,
        userId: user.id,
        amountUsd,
        cryptoType: "ETH",
        cryptoAmount,
        walletAddress,
      });

      toast({
        title: "Purchase Successful",
        description: `You have purchased ${cryptoAmount.toFixed(6)} ETH`,
      });

      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Purchase Failed",
        description: error.message || "Failed to process purchase",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Internal Crypto Transfer</h2>
      <form onSubmit={handlePurchase} className="space-y-4">
        <div className="space-y-2">
          <Label>Account ID</Label>
          <Input
            name="accountId"
            placeholder="Enter your account ID"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label>Amount (USD)</Label>
          <Input
            name="amountUsd"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Enter amount in USD"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label>Wallet Address</Label>
          <Input
            name="walletAddress"
            placeholder="Enter your wallet address"
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
            "Purchase Crypto"
          )}
        </Button>
      </form>
    </Card>
  );
}
