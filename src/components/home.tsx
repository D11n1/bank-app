import { useState, useEffect } from "react";
import Header from "./Header";
import HeroSection from "./HeroSection";
import QuickAccessWidget from "./QuickAccessWidget";
import SecurityFeatures from "./SecurityFeatures";
import Footer from "./Footer";
import { AuthModal } from "./AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { getAccounts, getTransactions } from "@/lib/accounts";

const Home = () => {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [accountData, setAccountData] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchAccountData = async () => {
      if (user?.id) {
        const { data: accounts } = await getAccounts(user.id);
        if (accounts?.[0]) {
          setAccountData(accounts[0]);
          const { data: trans } = await getTransactions(accounts[0].id);
          setTransactions(trans || []);
        }
      }
    };

    fetchAccountData();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Header
        isLoggedIn={!!user}
        onLogin={() => setShowAuthModal(true)}
        onRegister={() => setShowAuthModal(true)}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Main Content */}
      <main className="pt-20">
        {/* Hero Section */}
        <HeroSection
          onGetStarted={() => setShowAuthModal(true)}
          isLoggedIn={!!user}
        />

        {/* Quick Access Widget Section */}
        <section className="relative z-10 -mt-20 mb-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-end">
              <QuickAccessWidget />
            </div>
          </div>
        </section>

        {/* Security Features */}
        <SecurityFeatures />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
