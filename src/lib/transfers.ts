import { supabase } from "./supabase";

import { getBankTokenContract, getBankVaultContract } from "./contracts";
import { ethers } from "ethers";

export const transferMoney = async ({
  fromAccountId,
  toAccountNumber,
  amount,
  description,
}: {
  fromAccountId: string;
  toAccountNumber: string;
  amount: number;
  description: string;
}) => {
  // Start a Supabase transaction
  const { data: fromAccount, error: fromError } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", fromAccountId)
    .single();

  if (fromError) throw new Error("Could not find source account");
  if (fromAccount.balance < amount) throw new Error("Insufficient funds");

  const { data: toAccount, error: toError } = await supabase
    .from("accounts")
    .select("*")
    .eq("account_number", toAccountNumber)
    .single();

  if (toError) throw new Error("Could not find recipient account");

  // In production, we would transfer tokens on blockchain
  // For now, we'll just update the database

  // Update database to reflect blockchain state
  const { error: transferError } = await supabase.rpc("transfer_money", {
    p_from_account_id: fromAccountId,
    p_to_account_id: toAccount.id,
    p_amount: amount,
    p_description: description,
  });

  if (transferError) throw transferError;

  return { success: true };
};
