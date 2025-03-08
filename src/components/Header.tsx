import React from "react";
import { Button } from "./ui/button";
import { AdminRequestsBadge } from "./AdminRequestsBadge";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  logo?: string;
  isLoggedIn?: boolean;
  onLogin?: () => void;
  onRegister?: () => void;
}

const Header = ({
  logo = "BankCo",
  isLoggedIn = false,
  onLogin = () => {},
  onRegister = () => {},
}: HeaderProps) => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const menuItems = [
    {
      title: "Personal Banking",
      items: [
        { title: "Checking", href: "#" },
        { title: "Savings", href: "#" },
        { title: "Credit Cards", href: "#" },
      ],
    },
    {
      title: "Business Banking",
      items: [
        { title: "Business Accounts", href: "#" },
        { title: "Merchant Services", href: "#" },
        { title: "Business Loans", href: "#" },
      ],
    },
    {
      title: "Investments",
      items: [
        { title: "Retirement", href: "#" },
        { title: "Stocks & ETFs", href: "#" },
        { title: "Wealth Management", href: "#" },
      ],
    },
    {
      title: "About",
      items: [
        { title: "Contact Us", href: "/contact" },
        { title: "FAQ", href: "/faq" },
        { title: "Careers", href: "#" },
        { title: "Locations", href: "#" },
      ],
    },
  ];

  return (
    <header className="w-full h-20 bg-white border-b border-gray-200 fixed top-0 left-0 z-50 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <a
            href="/"
            className="text-2xl font-bold text-blue-600"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
          >
            {logo}
          </a>
        </div>

        {/* Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {menuItems.map((item) => (
              <NavigationMenuItem key={item.title}>
                <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {item.items.map((subItem) => (
                      <li key={subItem.title}>
                        <NavigationMenuLink asChild>
                          <a
                            href={subItem.href}
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                            )}
                          >
                            <div className="text-sm font-medium leading-none">
                              {subItem.title}
                            </div>
                          </a>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          {loading ? (
            <div className="w-[200px] flex justify-end">
              <div className="h-9 w-24 bg-gray-200 animate-pulse rounded-md" />
            </div>
          ) : !isLoggedIn ? (
            <>
              <Button
                variant="outline"
                onClick={onLogin}
                className="hidden sm:inline-flex"
              >
                Login
              </Button>
              <Button onClick={onRegister}>Register</Button>
            </>
          ) : (
            <div className="flex items-center space-x-4 animate-in fade-in duration-300">
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => navigate("/profile")}>
                Profile
              </Button>
              {user?.profile?.is_admin && (
                <Button
                  variant="ghost"
                  onClick={() => navigate("/admin")}
                  className="relative"
                >
                  Admin
                  <AdminRequestsBadge />
                </Button>
              )}
              <Button
                variant="outline"
                onClick={async () => {
                  if (!window.ethereum?.selectedAddress) {
                    try {
                      await window.ethereum?.request({
                        method: "eth_requestAccounts",
                      });
                      // Request to switch to mainnet
                      await window.ethereum?.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: "0x1" }], // 0x1 is mainnet
                      });
                    } catch (error) {
                      console.error("Failed to connect wallet:", error);
                    }
                  }
                }}
              >
                {window.ethereum?.selectedAddress
                  ? `${window.ethereum.selectedAddress.slice(0, 6)}...${window.ethereum.selectedAddress.slice(-4)}`
                  : "Connect Wallet"}
              </Button>
              <Button
                variant="ghost"
                onClick={async () => {
                  await signOut();
                  navigate("/");
                }}
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
