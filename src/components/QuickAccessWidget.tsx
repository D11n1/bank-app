import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  ArrowRight,
  Wallet,
  RefreshCw,
  PiggyBank,
  Briefcase,
  Building2,
} from "lucide-react";
import { AuthModal } from "./AuthModal";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getAccounts, getTransactions } from "@/lib/accounts";
import { transferMoney } from "@/lib/transfers";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
}

interface QuickAccessWidgetProps {
  userHasAccount?: boolean;
  balance?: number;
  recentTransactions?: Transaction[];
}

export default function QuickAccessWidget() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [balance, setBalance] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    if (!user?.id) return;

    setIsRefreshing(true);
    try {
      const { data: accounts } = await getAccounts(user.id);
      setAccounts(accounts || []);
      if (accounts?.[0]) {
        const accountId = selectedAccount || accounts[0].id;
        setSelectedAccount(accountId);
        const selectedAcc = accounts.find((acc) => acc.id === accountId);
        setBalance(selectedAcc?.balance || 0);
        const { data: trans } = await getTransactions(accountId);
        setRecentTransactions(
          (trans || []).map((t) => ({
            id: t.id,
            amount: t.amount,
            description: t.description,
            date: new Date(t.created_at).toLocaleDateString(),
          })),
        );
      }
    } catch (error: any) {
      console.error("Error fetching account data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch account data",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchData();

      // Set up real-time subscription
      const accountsChannel = supabase
        .channel("account_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "accounts",
            filter: `user_id=eq.${user.id}`,
          },
          () => fetchData(),
        )
        .subscribe();

      return () => {
        supabase.removeChannel(accountsChannel);
      };
    }
  }, [user, selectedAccount]);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "checking":
        return <Wallet className="h-4 w-4 text-blue-500" />;
      case "savings":
        return <PiggyBank className="h-4 w-4 text-green-500" />;
      case "business":
        return <Briefcase className="h-4 w-4 text-purple-500" />;
      case "admin_deposit":
        return <Building2 className="h-4 w-4 text-yellow-500" />;
      default:
        return <Wallet className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="w-[400px] p-6 bg-white/90 backdrop-blur-sm shadow-xl border-blue-100 hover:shadow-2xl transition-shadow duration-300">
      {!user ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Quick Access</h3>
            <Wallet className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-sm text-gray-500">
            Create an account to start banking with us
          </p>
          <Button className="w-full" onClick={() => setShowAuthModal(true)}>
            Request Account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Account Balance</h3>
            <RefreshCw
              className={`h-5 w-5 text-blue-500 cursor-pointer transition-transform ${isRefreshing ? "animate-spin" : "hover:scale-110"}`}
              onClick={fetchData}
            />
          </div>

          <Select
            value={selectedAccount}
            onValueChange={(value) => setSelectedAccount(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  <div className="flex items-center gap-2">
                    {getAccountIcon(account.account_type)}
                    <span>
                      {account.account_type.charAt(0).toUpperCase() +
                        account.account_type.slice(1)}{" "}
                      - {account.account_number}
                      (${account.balance.toFixed(2)})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <p className="text-3xl font-bold">${balance.toFixed(2)}</p>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setIsRefreshing(true);
              try {
                const formData = new FormData(e.target as HTMLFormElement);
                const amount = parseFloat(formData.get("amount") as string);
                const toAccount = formData.get("toAccount") as string;
                const description = formData.get("description") as string;

                await transferMoney({
                  fromAccountId: selectedAccount,
                  toAccountNumber: toAccount,
                  amount,
                  description,
                });

                (e.target as HTMLFormElement).reset();
                await fetchData();
              } catch (error: any) {
                console.error("Transfer error:", error);
                let errorMessage = "Failed to process transfer";

                if (error?.message?.includes("Insufficient funds")) {
                  errorMessage = "Insufficient funds to complete the transfer";
                } else if (
                  error?.message?.includes("Could not find recipient")
                ) {
                  errorMessage = "Invalid recipient account number";
                } else if (error?.message?.includes("same account")) {
                  errorMessage = "Cannot transfer to the same account";
                }

                toast({
                  variant: "destructive",
                  title: "Transfer Failed",
                  description: errorMessage,
                });
              } finally {
                setIsRefreshing(false);
              }
            }}
            className="space-y-4 mb-4"
          >
            <div className="space-y-2">
              <Label>Quick Transfer</Label>
              <Input
                name="toAccount"
                placeholder="Recipient Account #"
                required
              />
              <Input
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Amount"
                required
              />
              <Input name="description" placeholder="Description" required />
              <Button type="submit" className="w-full" disabled={isRefreshing}>
                {isRefreshing ? "Processing..." : "Transfer"}
              </Button>
            </div>
          </form>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500">
              Recent Transactions
            </h4>
            {recentTransactions.slice(0, 3).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-gray-500">{transaction.date}</p>
                </div>
                <p
                  className={`text-sm font-semibold ${
                    transaction.amount >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {transaction.amount >= 0 ? "+" : ""}$
                  {Math.abs(transaction.amount).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      <Toaster />
    </Card>
  );
}
