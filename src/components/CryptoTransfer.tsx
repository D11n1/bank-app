import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useToast } from "./ui/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { purchaseCrypto } from "@/lib/crypto";
import { getExchangeRate } from "@/lib/changelly";

export default function CryptoTransfer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [exchangeRate, setExchangeRate] = useState(0);
  const [amount, setAmount] = useState("");
  const [estimatedEth, setEstimatedEth] = useState(0);

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

    const fetchExchangeRate = async () => {
      try {
        const rate = await getExchangeRate("USD", "ETH");
        setExchangeRate(rate);
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
      }
    };

    fetchAccounts();
    fetchExchangeRate();

    // Refresh exchange rate every 30 seconds
    const interval = setInterval(fetchExchangeRate, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Update estimated ETH when amount or exchange rate changes
  useEffect(() => {
    if (amount && exchangeRate) {
      const amountNum = parseFloat(amount);
      if (!isNaN(amountNum)) {
        setEstimatedEth(amountNum * exchangeRate);
      }
    } else {
      setEstimatedEth(0);
    }
  }, [amount, exchangeRate]);

  const handleBuy = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const amountUsd = parseFloat(formData.get("amount") as string);
      const ethAddress = formData.get("address") as string;

      const { exchange } = await purchaseCrypto({
        userId: user.id,
        accountId: selectedAccount,
        amountUsd,
        ethAddress,
      });

      toast({
        title: "Purchase Initiated",
        description: `Your purchase of ${exchange.expected_amount} ETH is being processed`,
      });

      e.currentTarget.reset();
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
      <form onSubmit={handleBuy} className="space-y-4">
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
          <Label>Amount (USD)</Label>
          <Input
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Enter amount in USD"
            required
            disabled={loading}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {estimatedEth > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Estimated ETH: {estimatedEth.toFixed(6)} ETH
              {parseFloat(amount) >= 2000 && (
                <span className="text-amber-600 block mt-1">
                  Note: Transactions over $2,000 require KYC verification
                </span>
              )}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>ETH Address</Label>
          <Input
            name="address"
            placeholder="Enter ETH address"
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
            "Buy ETH"
          )}
        </Button>
      </form>
    </Card>
  );
}
