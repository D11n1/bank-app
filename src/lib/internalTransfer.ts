import { supabase } from "./supabase";

// Internal transfer system for moving funds between accounts
export const processInternalTransfer = async ({
  fromAccountId,
  toAccountId,
  amount,
  description,
}: {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description: string;
}) => {
  // Use Supabase RPC function to handle the transaction in a database transaction
  const { error } = await supabase.rpc("transfer_money", {
    p_from_account_id: fromAccountId,
    p_to_account_id: toAccountId,
    p_amount: amount,
    p_description: description,
  });

  if (error) throw error;

  return { success: true };
};

// Function to handle crypto purchases using internal funds
export const processCryptoPurchase = async ({
  accountId,
  userId,
  amountUsd,
  cryptoType,
  cryptoAmount,
  walletAddress,
}: {
  accountId: string;
  userId: string;
  amountUsd: number;
  cryptoType: string;
  cryptoAmount: number;
  walletAddress: string;
}) => {
  // 1. Check if user has sufficient balance
  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("balance")
    .eq("id", accountId)
    .single();

  if (accountError) throw accountError;
  if (account.balance < amountUsd) throw new Error("Insufficient funds");

  // 2. Create crypto purchase record
  const { data: purchase, error: purchaseError } = await supabase
    .from("crypto_purchases")
    .insert([
      {
        user_id: userId,
        account_id: accountId,
        amount_usd: amountUsd,
        amount_eth: cryptoAmount,
        eth_address: walletAddress,
        status: "pending",
      },
    ])
    .select()
    .single();

  if (purchaseError) throw purchaseError;

  // 3. Transfer money from user account to admin account
  const { error: transferError } = await supabase.rpc("transfer_money", {
    p_from_account_id: accountId,
    p_to_account_id: "admin", // Admin account handles the actual purchase
    p_amount: amountUsd,
    p_description: `Buy ${cryptoAmount} ${cryptoType}`,
  });

  if (transferError) throw transferError;

  // 4. Update purchase status to completed
  const { error: updateError } = await supabase
    .from("crypto_purchases")
    .update({ status: "completed" })
    .eq("id", purchase.id);

  if (updateError) throw updateError;

  return { success: true, purchaseId: purchase.id };
};
