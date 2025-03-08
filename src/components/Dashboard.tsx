import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import AccountDashboard from "./AccountDashboard";
import TransferMoney from "./TransferMoney";
import TransactionHistory from "./TransactionHistory";
import CryptoTransfer from "./CryptoTransfer";
import ExternalTransfer from "./ExternalTransfer";
import CryptoPriceTracker from "./CryptoPriceTracker";
import TransactionAnalytics from "./TransactionAnalytics";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { getAccounts } from "@/lib/accounts";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedAccount, setSelectedAccount] = useState("");

  useEffect(() => {
    const fetchAccounts = async () => {
      if (user?.id) {
        const { data: accounts } = await getAccounts(user.id);
        if (accounts?.[0]) {
          setSelectedAccount(accounts[0].id);
        }
      }
    };

    fetchAccounts();
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
        ← Back
      </Button>

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <AccountDashboard />
        </TabsContent>

        <TabsContent value="transfer">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TransferMoney />
            <ExternalTransfer accountId={selectedAccount} />
            <CryptoPriceTracker />
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-6">
            <TransactionAnalytics accountId={selectedAccount} />
            <TransactionHistory />
          </div>
        </TabsContent>

        <TabsContent value="crypto">
          <CryptoTransfer accountId={selectedAccount} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
