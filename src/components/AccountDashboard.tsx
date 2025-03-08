import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { supabase } from "@/lib/supabase";
import { Button } from "./ui/button";

import { getAccounts, getTransactions, deleteAccount } from "@/lib/accounts";
import { useAuth } from "@/hooks/useAuth";
import {
  Loader2,
  ArrowUpDown,
  Clock,
  Trash2,
  Wallet,
  Briefcase,
  PiggyBank,
  Building2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import AccountManagement from "./AccountManagement";

export default function AccountDashboard() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState(null);

  useEffect(() => {
    // Set up real-time subscription for account changes
    const accountsChannel = supabase
      .channel("account_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "accounts",
          filter: `user_id=eq.${user?.id}`,
        },
        () => fetchData(),
      )
      .subscribe();

    // Set up real-time subscription for transaction changes
    const transactionsChannel = supabase
      .channel("transaction_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `account_id=eq.${selectedAccountId}`,
        },
        () => fetchData(),
      )
      .subscribe();

    // Initial fetch
    const fetchData = async () => {
      if (user?.id) {
        const { data: accountsData } = await getAccounts(user.id);
        setAccounts(accountsData || []);

        if (accountsData?.[0]) {
          const accountId = selectedAccountId || accountsData[0].id;
          setSelectedAccountId(accountId);
          const { data: transData } = await getTransactions(accountId);
          setTransactions(transData || []);
        }
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      supabase.removeChannel(accountsChannel);
      supabase.removeChannel(transactionsChannel);
    };
  }, [user, selectedAccountId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Management */}
      <div className="flex justify-end">
        <div className="w-48">
          <AccountManagement />
        </div>
      </div>

      {/* Account Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map((account) => (
          <Card
            key={account.id}
            className={`p-6 cursor-pointer transition-all duration-200 ${
              selectedAccountId === account.id ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => setSelectedAccountId(account.id)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2">
                  {account.account_type === "checking" && (
                    <Wallet className="h-5 w-5 text-blue-500" />
                  )}
                  {account.account_type === "savings" && (
                    <PiggyBank className="h-5 w-5 text-green-500" />
                  )}
                  {account.account_type === "business" && (
                    <Briefcase className="h-5 w-5 text-purple-500" />
                  )}
                  {account.account_type === "admin_deposit" && (
                    <Building2 className="h-5 w-5 text-yellow-500" />
                  )}
                  <h3 className="text-lg font-semibold capitalize">
                    {account.account_type} Account
                  </h3>
                </div>
                <p className="text-sm text-gray-500">
                  Account #{account.account_number}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    const transferTab = document.querySelector(
                      '[value="transfer"]',
                    ) as HTMLElement;
                    if (transferTab) transferTab.click();
                  }}
                >
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Transfer
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Account</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this account? This
                        action cannot be undone. Any remaining balance will be
                        lost.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await deleteAccount(account.id);
                            window.location.reload();
                          } catch (error) {
                            console.error("Error deleting account:", error);
                          }
                        }}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <p className="text-3xl font-bold">${account.balance.toFixed(2)}</p>
          </Card>
        ))}
      </div>

      {/* Recent Transactions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <Clock className="h-5 w-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div>
                <p className="font-medium">{transaction.description}</p>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.created_at).toLocaleDateString()}
                </p>
              </div>
              <p
                className={`font-semibold ${
                  transaction.amount >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {transaction.amount >= 0 ? "+" : ""}$
                {Math.abs(transaction.amount).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
