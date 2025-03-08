import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";
import { Loader2 } from "lucide-react";
import { processExternalCryptoPurchase } from "@/lib/externalCryptoService";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function ExternalCryptoTransfer() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [cryptoType, setCryptoType] = useState("ETH");

  useEffect(() => {
    const fetchAccounts = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from("accounts")
          .select("*")
          .eq("user_id", user.id);
        setAccounts(data || []);
        if (data?.[0]) {
          setSelectedAccount(data[0].id);
        }
      }
    };

    fetchAccounts();
  }, [user]);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const amountUsd = parseFloat(formData.get("amountUsd") as string);
      const walletAddress = formData.get("walletAddress") as string;

      const result = await processExternalCryptoPurchase({
        accountId: selectedAccount,
        userId: user.id,
        amountUsd,
        cryptoType,
        walletAddress,
      });

      toast({
        title: "Purchase Initiated",
        description: `Order placed for ${result.expectedAmount.toFixed(6)} ${cryptoType}. Transaction hash: ${result.txHash}`,
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
    <Card className="p-6 bg-white">
      <h2 className="text-2xl font-bold mb-6">External Crypto Purchase</h2>
      <form onSubmit={handlePurchase} className="space-y-4">
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
          <Label>Cryptocurrency</Label>
          <Select value={cryptoType} onValueChange={setCryptoType}>
            <SelectTrigger>
              <SelectValue placeholder="Select cryptocurrency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
              <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
              <SelectItem value="XRP">Ripple (XRP)</SelectItem>
            </SelectContent>
          </Select>
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
            defaultValue={window.ethereum?.selectedAddress || ""}
            pattern="^0x[a-fA-F0-9]{40}$"
            title="Please enter a valid Ethereum address starting with 0x"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Buy ${cryptoType}`
          )}
        </Button>
      </form>
    </Card>
  );
}
