// Changelly API integration
const API_KEY = import.meta.env.VITE_CHANGELLY_API_KEY || "";
const BASE_URL = "https://api.changelly.com/v2";

export const getExchangeRate = async (
  fromCurrency: string,
  toCurrency: string,
) => {
  // Mock implementation for development
  console.log("Using mock Changelly rate implementation");

  // Mock rates for common pairs
  const mockRates = {
    USD_ETH: 0.0005, // $1 = 0.0005 ETH
    USD_BTC: 0.00002, // $1 = 0.00002 BTC
    ETH_USD: 2000, // 1 ETH = $2000
    BTC_USD: 50000, // 1 BTC = $50000
  };

  const key = `${fromCurrency}_${toCurrency}`;
  return mockRates[key] || 0.0005; // Default fallback rate
};

export const createExchange = async ({
  fromCurrency,
  toCurrency,
  amount,
  address,
}: {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  address: string;
}) => {
  // Mock implementation for development
  console.log("Using mock Changelly implementation");
  return {
    id: "mock-exchange-id-" + Math.random().toString(36).substring(2, 10),
    from_currency: fromCurrency,
    to_currency: toCurrency,
    expected_amount: (amount / 2000).toFixed(6), // Mock ETH conversion rate
    address_to: address,
    status: "pending",
  };
};

export const getExchangeStatus = async (exchangeId: string) => {
  // Mock implementation for development
  console.log("Using mock Changelly status implementation");
  return {
    id: exchangeId,
    status: "finished",
    timestamp: new Date().toISOString(),
  };
};
