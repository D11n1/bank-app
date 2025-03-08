import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  Check,
  X,
  Users,
  CreditCard,
  ArrowUpDown,
  Shield,
  Mail,
} from "lucide-react";
import { AnalyticsCard } from "./admin/AnalyticsCard";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accountRequests, setAccountRequests] = useState([]);
  const [depositRequests, setDepositRequests] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [kycRequests, setKYCRequests] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    userGrowth: [],
    transactionVolume: [],
    accountGrowth: [],
    depositTrends: [],
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAccounts: 0,
    totalTransactions: 0,
    adminBalance: 0,
  });

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select(
        `
        *,
        accounts:accounts(count),
        account_requests:account_requests(count)
      `,
      )
      .order("created_at", { ascending: false });
    setUsers(data || []);
  };

  const setupAdminAccount = async () => {
    try {
      const { error } = await supabase.rpc("setup_admin_deposit_account");
      if (error) {
        console.error("Error setting up admin account:", error);
        return;
      }
      await fetchStats();
    } catch (error) {
      console.error("Error setting up admin account:", error);
    }
  };

  const fetchStats = async () => {
    const { count: userCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: accountCount } = await supabase
      .from("accounts")
      .select("*", { count: "exact", head: true });

    const { count: transactionCount } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true });

    const { data: adminAccount } = await supabase
      .from("accounts")
      .select("id, balance")
      .eq("account_type", "admin_deposit")
      .single();

    if (adminAccount?.id) {
      const { data: adminTransactions } = await supabase
        .from("transactions")
        .select("*")
        .eq("account_id", adminAccount.id)
        .order("created_at", { ascending: false });
      setTransactions(adminTransactions || []);
    }

    setStats({
      totalUsers: userCount || 0,
      totalAccounts: accountCount || 0,
      totalTransactions: transactionCount || 0,
      adminBalance: adminAccount?.balance || 0,
    });
  };

  const handleKYCRequest = async (requestId: string, approve: boolean) => {
    try {
      const { error } = await supabase
        .from("kyc_requests")
        .update({
          status: approve ? "approved" : "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) throw error;

      if (approve) {
        const { data: kycRequest } = await supabase
          .from("kyc_requests")
          .select("user_id")
          .eq("id", requestId)
          .single();

        if (kycRequest) {
          await supabase
            .from("profiles")
            .update({ kyc_verified: true })
            .eq("id", kycRequest.user_id);
        }
      }

      fetchRequests();
    } catch (error) {
      console.error("Error handling KYC request:", error);
    }
  };

  const fetchRequests = async () => {
    const { data: accountReqs } = await supabase
      .from("account_requests")
      .select(
        `
        *,
        profiles:user_id (*)
      `,
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    const { data: depositReqs } = await supabase
      .from("deposit_requests")
      .select(
        `
        *,
        accounts (account_number, user_id, profiles:user_id (full_name, email))
      `,
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    const { data: kycReqs } = await supabase
      .from("kyc_requests")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    setAccountRequests(accountReqs || []);
    setDepositRequests(depositReqs || []);
    setKYCRequests(kycReqs || []);
    setLoading(false);
  };

  const handleAccountRequest = async (
    requestId: string,
    approve: boolean,
    initialDeposit?: number,
  ) => {
    try {
      if (approve) {
        const { error } = await supabase.rpc("approve_account_request", {
          request_id: requestId,
          initial_deposit: initialDeposit || 0,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("account_requests")
          .update({ status: "rejected", updated_at: new Date().toISOString() })
          .eq("id", requestId);
        if (error) throw error;
      }
      await fetchRequests();
      await fetchStats();
    } catch (error) {
      console.error("Error handling account request:", error.message);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDepositRequest = async (requestId: string, approve: boolean) => {
    try {
      if (approve) {
        await supabase.rpc("approve_deposit_request", {
          request_id: requestId,
        });
      } else {
        await supabase
          .from("deposit_requests")
          .update({ status: "rejected", updated_at: new Date().toISOString() })
          .eq("id", requestId);
      }
      fetchRequests();
    } catch (error) {
      console.error("Error handling deposit request:", error);
    }
  };

  const fetchAnalytics = async () => {
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();

    const { data: users } = await supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", dates[0]);

    const { data: transactions } = await supabase
      .from("transactions")
      .select("amount, created_at")
      .gte("created_at", dates[0]);

    const { data: accounts } = await supabase
      .from("accounts")
      .select("created_at")
      .gte("created_at", dates[0]);

    const userGrowth = dates.map((date) => ({
      date,
      count: (users || []).filter((u) => u.created_at.startsWith(date)).length,
    }));

    const transactionVolume = dates.map((date) => ({
      date,
      volume: (transactions || [])
        .filter((t) => t.created_at.startsWith(date))
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
    }));

    const accountGrowth = dates.map((date) => ({
      date,
      count: (accounts || []).filter((a) => a.created_at.startsWith(date))
        .length,
    }));

    setAnalyticsData({
      userGrowth,
      transactionVolume,
      accountGrowth,
      depositTrends: transactionVolume,
    });
  };

  useEffect(() => {
    const setupSubscriptions = async () => {
      const accountRequestsChannel = supabase
        .channel("admin_account_requests")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "account_requests" },
          () => fetchRequests(),
        )
        .subscribe();

      const depositRequestsChannel = supabase
        .channel("admin_deposit_requests")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "deposit_requests" },
          () => fetchRequests(),
        )
        .subscribe();

      const accountsChannel = supabase
        .channel("admin_accounts")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "accounts" },
          () => fetchStats(),
        )
        .subscribe();

      const transactionsChannel = supabase
        .channel("admin_transactions")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "transactions" },
          () => fetchStats(),
        )
        .subscribe();

      await setupAdminAccount();
      await fetchRequests();
      await fetchStats();
      await fetchUsers();
      await fetchAnalytics();

      return () => {
        supabase.removeChannel(accountRequestsChannel);
        supabase.removeChannel(depositRequestsChannel);
        supabase.removeChannel(accountsChannel);
        supabase.removeChannel(transactionsChannel);
      };
    };

    setupSubscriptions();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <AnalyticsCard
          title="User Growth"
          data={analyticsData.userGrowth}
          dataKey="count"
          color="#3b82f6"
        />
        <AnalyticsCard
          title="Transaction Volume ($)"
          data={analyticsData.transactionVolume}
          dataKey="volume"
          color="#10b981"
        />
        <AnalyticsCard
          title="Account Growth"
          data={analyticsData.accountGrowth}
          dataKey="count"
          color="#8b5cf6"
        />
        <AnalyticsCard
          title="Deposit Trends ($)"
          data={analyticsData.depositTrends}
          dataKey="volume"
          color="#f59e0b"
        />
      </div>

      <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
        ← Back
      </Button>

      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <Users className="h-10 w-10 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <CreditCard className="h-10 w-10 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Total Accounts</p>
                <h3 className="text-2xl font-bold">{stats.totalAccounts}</h3>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <ArrowUpDown className="h-10 w-10 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Total Transactions</p>
                <h3 className="text-2xl font-bold">
                  {stats.totalTransactions}
                </h3>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <Shield className="h-10 w-10 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Admin Balance</p>
                <h3 className="text-2xl font-bold">
                  ${stats.adminBalance.toFixed(2)}
                </h3>
              </div>
            </div>
          </Card>
        </div>

        {/* Requests Management */}
        <Card className="p-6">
          <Tabs defaultValue="accounts" className="space-y-6">
            <TabsList>
              <TabsTrigger value="accounts">Account Requests</TabsTrigger>
              <TabsTrigger value="deposits">Deposit Requests</TabsTrigger>
              <TabsTrigger value="kyc">KYC Requests</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="admin-deposits">Admin Deposits</TabsTrigger>
            </TabsList>

            <TabsContent value="accounts">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Pending Account Requests</h2>
                {accountRequests.length === 0 ? (
                  <p className="text-gray-500">No pending account requests</p>
                ) : (
                  accountRequests.map((request) => (
                    <Card key={request.id} className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {request.profiles?.full_name || "Unknown User"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {request.profiles?.email || "No email"}
                          </p>
                          <p className="text-sm">
                            Account Type: {request.account_type}
                          </p>
                          <div className="space-y-2">
                            <Label>Initial Deposit</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Enter initial deposit"
                              defaultValue="0"
                            />
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={(e) => {
                              const card = e.currentTarget.closest(".p-4");
                              const input = card?.querySelector("input");
                              const initialDeposit = parseFloat(
                                input?.value || "0",
                              );
                              handleAccountRequest(
                                request.id,
                                true,
                                initialDeposit,
                              );
                            }}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleAccountRequest(request.id, false)
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="deposits">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Pending Deposit Requests</h2>
                {depositRequests.length === 0 ? (
                  <p className="text-gray-500">No pending deposit requests</p>
                ) : (
                  depositRequests.map((request) => (
                    <Card key={request.id} className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {request.accounts.profiles.full_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Account #{request.accounts.account_number}
                          </p>
                          <p className="text-sm">
                            Amount: ${request.amount.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() =>
                              handleDepositRequest(request.id, true)
                            }
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleDepositRequest(request.id, false)
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="kyc">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">
                  KYC Verification Requests
                </h2>
                {kycRequests.length === 0 ? (
                  <p className="text-gray-500">No pending KYC requests</p>
                ) : (
                  kycRequests.map((request) => (
                    <Card key={request.id} className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <p className="font-medium">{request.full_name}</p>
                          <p className="text-sm text-gray-500">
                            DOB:{" "}
                            {new Date(
                              request.date_of_birth,
                            ).toLocaleDateString()}
                          </p>
                          <p className="text-sm">Address: {request.address}</p>
                          <p className="text-sm">
                            Document: {request.document_type} -{" "}
                            {request.document_number}
                          </p>
                          <a
                            href={request.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:underline"
                          >
                            View Document
                          </a>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => handleKYCRequest(request.id, true)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleKYCRequest(request.id, false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="users">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Registered Users</h2>
                <div className="grid gap-4">
                  {users.map((user) => (
                    <Card key={user.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{user.full_name}</p>
                            {user.is_admin && (
                              <Shield
                                className="h-4 w-4 text-blue-500"
                                title="Admin"
                              />
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Mail className="h-4 w-4" />
                            <p>{user.email}</p>
                          </div>
                          <div className="text-sm">
                            <p>
                              Joined:{" "}
                              {new Date(user.created_at).toLocaleDateString()}
                            </p>
                            <p>Active Accounts: {user.accounts.length}</p>
                            <p>
                              Pending Requests: {user.account_requests.length}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {!user.is_admin && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                await supabase
                                  .from("profiles")
                                  .update({ is_admin: true })
                                  .eq("id", user.id);
                                fetchUsers();
                              }}
                            >
                              Make Admin
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="admin-deposits">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Admin Deposit History</h2>
                <Card className="p-4">
                  <form
                    className="mb-6"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const amount = parseFloat(
                        (e.target as HTMLFormElement).amount.value,
                      );
                      try {
                        await setupAdminAccount();
                        // Mint tokens to admin address
                        try {
                          await mintBankTokens(amount);
                        } catch (error) {
                          console.log("Token minting skipped in development");
                        }

                        // Then update database
                        await supabase.rpc("top_up_admin_account", {
                          p_amount: amount,
                        });
                        await fetchStats();
                        (e.target as HTMLFormElement).reset();
                      } catch (error) {
                        console.error("Error topping up admin account:", error);
                        alert("Error topping up admin account");
                      }
                    }}
                  >
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Label htmlFor="amount">Top Up Amount</Label>
                        <Input
                          id="amount"
                          name="amount"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Enter amount to add"
                          required
                        />
                      </div>
                      <Button type="submit" className="mt-8">
                        Top Up
                      </Button>
                    </div>
                  </form>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Current Balance</h3>
                    <p className="text-2xl font-bold text-green-600">
                      ${stats.adminBalance.toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {transactions?.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex justify-between items-center p-2 border-b last:border-0"
                      >
                        <div>
                          <p className="font-medium">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(
                              transaction.created_at,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <p
                          className={
                            transaction.amount > 0
                              ? "text-green-600 font-semibold"
                              : "text-red-600 font-semibold"
                          }
                        >
                          {transaction.amount > 0 ? "+" : ""}$
                          {transaction.amount.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
