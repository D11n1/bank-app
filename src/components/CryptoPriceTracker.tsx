import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Loader2 } from "lucide-react";

interface CryptoPrice {
  symbol: string;
  price_usd: number;
}

export default function CryptoPriceTracker() {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple&vs_currencies=usd",
        );
        const data = await response.json();
        const formattedPrices = [
          { symbol: "BTC", price_usd: data.bitcoin.usd },
          { symbol: "ETH", price_usd: data.ethereum.usd },
          { symbol: "XRP", price_usd: data.ripple.usd },
        ];
        setPrices(formattedPrices);
      } catch (error) {
        console.error("Error fetching prices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Crypto Prices</h3>
      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {prices.map((crypto) => (
            <div
              key={crypto.symbol}
              className="flex justify-between items-center"
            >
              <span className="font-medium">{crypto.symbol}</span>
              <span>${crypto.price_usd.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
