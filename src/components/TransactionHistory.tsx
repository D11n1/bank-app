import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { getAccounts, getTransactions } from "@/lib/accounts";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export default function TransactionHistory() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up real-time subscription for transaction changes
    const transactionsChannel = supabase
      .channel("transaction_history_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        () => fetchTransactions(),
      )
      .subscribe();
    const fetchTransactions = async () => {
      if (user?.id) {
        const { data: accounts } = await getAccounts(user.id);
        if (accounts?.[0]) {
          const { data, count } = await getTransactions(
            accounts[0].id,
            currentPage,
            pageSize,
          );
          setTotalPages(Math.ceil((count || 0) / pageSize));
          setTransactions(data || []);
        }
        setLoading(false);
      }
    };

    fetchTransactions();

    return () => {
      supabase.removeChannel(transactionsChannel);
    };
  }, [user, currentPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Transaction History</h2>
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between py-4 border-b last:border-0"
          >
            <div>
              <p className="font-medium">{transaction.description}</p>
              <p className="text-sm text-gray-500">
                {new Date(transaction.created_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-400 capitalize">
                Type: {transaction.transaction_type}
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

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
