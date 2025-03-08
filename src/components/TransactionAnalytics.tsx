import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TransactionAnalytics({
  accountId,
}: {
  accountId: string;
}) {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalSpent: 0,
    totalReceived: 0,
    dailyTransactions: [],
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!accountId) return;

      try {
        const { data: transactions } = await supabase
          .from("transactions")
          .select("*")
          .eq("account_id", accountId)
          .order("created_at", { ascending: true });

        if (!transactions) return;

        const spent = transactions
          .filter((t) => t.amount < 0)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const received = transactions
          .filter((t) => t.amount > 0)
          .reduce((sum, t) => sum + t.amount, 0);

        // Group by date for chart
        const dailyData = transactions.reduce((acc, t) => {
          const date = new Date(t.created_at).toLocaleDateString();
          if (!acc[date]) acc[date] = { date, amount: 0 };
          acc[date].amount += t.amount;
          return acc;
        }, {});

        setAnalytics({
          totalSpent: spent,
          totalReceived: received,
          dailyTransactions: Object.values(dailyData),
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [accountId]);

  if (loading) {
    return (
      <Card className="p-6">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Transaction Analytics</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <TrendingDown className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-sm text-gray-500">Total Spent</p>
            <p className="text-xl font-bold">
              ${analytics.totalSpent.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <div>
            <p className="text-sm text-gray-500">Total Received</p>
            <p className="text-xl font-bold">
              ${analytics.totalReceived.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={analytics.dailyTransactions}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#3b82f6"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
