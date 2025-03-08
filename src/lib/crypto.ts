import { supabase } from "./supabase";
import { createExchange, getExchangeRate } from "./changelly";
import { ethers } from "ethers";
import { getBankTokenContract, getBankVaultContract } from "./contracts";

export const purchaseCrypto = async ({
  userId,
  accountId,
  amountUsd,
  ethAddress,
}: {
  userId: string;
  accountId: string;
  amountUsd: number;
  ethAddress: string;
}) => {
  // Check if user has enough balance
  const { data: account } = await supabase
    .from("accounts")
    .select("balance, account_number")
    .eq("id", accountId)
    .single();

  if (!account || account.balance < amountUsd) {
    throw new Error("Insufficient balance");
  }

  // Get current exchange rate
  const exchangeRate = await getExchangeRate("USD", "ETH");

  // Check if KYC is required (for amounts >= $2,000)
  const requiresKYC = amountUsd >= 2000;

  // Check if user has completed KYC if required
  if (requiresKYC) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("kyc_verified")
      .eq("id", userId)
      .single();

    if (!profile?.kyc_verified) {
      throw new Error(
        "KYC verification required for transactions over $2,000. Please complete KYC verification in your profile.",
      );
    }
  }

  // Create exchange order through Changelly
  const exchange = await createExchange({
    fromCurrency: "USD",
    toCurrency: "ETH",
    amount: amountUsd,
    address: ethAddress,
  });

  // Get blockchain contracts
  const provider = new ethers.JsonRpcProvider(
    `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`,
  );
  const wallet = new ethers.Wallet(import.meta.env.PRIVATE_KEY, provider);
  const token = getBankTokenContract(provider).connect(wallet);

  // Mint tokens directly to user's ETH address
  const mintTx = await token.mint(
    ethAddress,
    ethers.parseEther(amountUsd.toString()),
  );
  await mintTx.wait();

  // Create crypto purchase record
  const { error: purchaseError } = await supabase
    .from("crypto_purchases")
    .insert([
      {
        user_id: userId,
        account_id: accountId,
        amount_usd: amountUsd,
        amount_eth: exchange.expected_amount,
        eth_address: ethAddress,
        status: "pending",
      },
    ]);

  if (purchaseError) throw purchaseError;

  // Deduct from user's account
  const { error: transferError } = await supabase.rpc("transfer_money", {
    p_from_account_id: accountId,
    p_to_account_id: "admin", // Admin account handles the actual purchase
    p_amount: amountUsd,
    p_description: `Buy ${exchange.expected_amount} ETH`,
  });

  if (transferError) throw transferError;

  return { exchange };
};
