import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function AdminRequestsBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Initial fetch
    fetchCount();

    // Subscribe to changes
    const accountsChannel = supabase
      .channel("account_requests_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "account_requests" },
        () => fetchCount(),
      )
      .subscribe();

    const depositsChannel = supabase
      .channel("deposit_requests_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "deposit_requests" },
        () => fetchCount(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(accountsChannel);
      supabase.removeChannel(depositsChannel);
    };
  }, []);

  const fetchCount = async () => {
    // Get account requests count
    const { count: accountCount } = await supabase
      .from("account_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    // Get deposit requests count
    const { count: depositCount } = await supabase
      .from("deposit_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    setCount((accountCount || 0) + (depositCount || 0));
  };

  if (count === 0) return null;

  return (
    <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
      <span className="text-white text-xs">{count}</span>
    </div>
  );
}
