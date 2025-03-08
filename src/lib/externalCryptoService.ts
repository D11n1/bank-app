import { supabase } from "./supabase";

// Interface for external crypto service providers
interface CryptoServiceProvider {
  getExchangeRate: (
    fromCurrency: string,
    toCurrency: string,
  ) => Promise<number>;
  createExchange: (params: {
    fromCurrency: string;
    toCurrency: string;
    amount: number;
    address: string;
  }) => Promise<any>;
  getExchangeStatus: (exchangeId: string) => Promise<any>;
}

// Mock implementation for development
class MockCryptoService implements CryptoServiceProvider {
  async getExchangeRate(
    fromCurrency: string,
    toCurrency: string,
  ): Promise<number> {
    console.log(`Getting exchange rate from ${fromCurrency} to ${toCurrency}`);

    // Mock rates for common pairs
    const mockRates: Record<string, number> = {
      USD_ETH: 0.0005, // $1 = 0.0005 ETH
      USD_BTC: 0.00002, // $1 = 0.00002 BTC
      ETH_USD: 2000, // 1 ETH = $2000
      BTC_USD: 50000, // 1 BTC = $50000
    };

    const key = `${fromCurrency}_${toCurrency}`;
    return mockRates[key] || 0.0005; // Default fallback rate
  }

  async createExchange(params: {
    fromCurrency: string;
    toCurrency: string;
    amount: number;
    address: string;
  }): Promise<any> {
    const { fromCurrency, toCurrency, amount, address } = params;
    console.log(
      `Creating exchange from ${fromCurrency} to ${toCurrency} for ${amount}`,
    );

    // Calculate expected amount based on fixed rate
    const rate = await this.getExchangeRate(fromCurrency, toCurrency);
    const expectedAmount = amount * rate;

    // Generate mock transaction ID
    const txId = `tx-${Math.random().toString(36).substring(2, 10)}`;

    return {
      id: `exchange-${Math.random().toString(36).substring(2, 10)}`,
      from_currency: fromCurrency,
      to_currency: toCurrency,
      amount: amount,
      expected_amount: expectedAmount.toFixed(6),
      address_to: address,
      status: "pending",
      tx_hash: txId,
    };
  }

  async getExchangeStatus(exchangeId: string): Promise<any> {
    console.log(`Getting status for exchange ${exchangeId}`);
    return {
      id: exchangeId,
      status: "completed",
      timestamp: new Date().toISOString(),
    };
  }
}

// Factory to get the appropriate service based on configuration
export const getCryptoService = (): CryptoServiceProvider => {
  // In production, you would check environment variables to determine which service to use
  // For now, always return the mock service
  return new MockCryptoService();
};

// Function to handle external crypto purchases
export const processExternalCryptoPurchase = async ({
  accountId,
  userId,
  amountUsd,
  cryptoType,
  walletAddress,
}: {
  accountId: string;
  userId: string;
  amountUsd: number;
  cryptoType: string;
  walletAddress: string;
}) => {
  const cryptoService = getCryptoService();

  // 1. Check if user has sufficient balance
  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("balance")
    .eq("id", accountId)
    .single();

  if (accountError) throw accountError;
  if (account.balance < amountUsd) throw new Error("Insufficient funds");

  // 2. Get exchange rate and expected crypto amount
  const exchangeRate = await cryptoService.getExchangeRate("USD", cryptoType);
  const cryptoAmount = amountUsd * exchangeRate;

  // 3. Create exchange order through external service
  const exchange = await cryptoService.createExchange({
    fromCurrency: "USD",
    toCurrency: cryptoType,
    amount: amountUsd,
    address: walletAddress,
  });

  // 4. Create crypto order record
  const { data: order, error: orderError } = await supabase
    .from("crypto_orders")
    .insert([
      {
        user_id: userId,
        account_id: accountId,
        amount_usd: amountUsd,
        amount_eth: cryptoAmount,
        eth_address: walletAddress,
        status: "pending",
        tx_hash: exchange.tx_hash,
      },
    ])
    .select()
    .single();

  if (orderError) throw orderError;

  // 5. Transfer money from user account to admin account
  const { error: transferError } = await supabase.rpc("transfer_money", {
    p_from_account_id: accountId,
    p_to_account_id: "admin", // Admin account handles the actual purchase
    p_amount: amountUsd,
    p_description: `Buy ${cryptoAmount.toFixed(6)} ${cryptoType}`,
  });

  if (transferError) throw transferError;

  // 6. In a real system, you would now initiate the actual purchase through the external service
  // For now, we'll just simulate it by updating the order status
  setTimeout(async () => {
    await supabase
      .from("crypto_orders")
      .update({ status: "completed" })
      .eq("id", order.id);
  }, 5000); // Simulate 5-second processing time

  return {
    success: true,
    orderId: order.id,
    expectedAmount: cryptoAmount,
    txHash: exchange.tx_hash,
  };
};
