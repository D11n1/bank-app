import { supabase } from "./supabase";

export const getAccounts = async (userId: string) => {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .returns<any[]>();
  return { data, error };
};

export const getTransactions = async (
  accountId: string,
  page = 1,
  pageSize = 10,
) => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from("transactions")
    .select("*", { count: "exact" })
    .eq("account_id", accountId)
    .order("created_at", { ascending: false })
    .range(start, end);

  return { data, error, count };
};

export const createTransaction = async ({
  accountId,
  amount,
  description,
  type,
}: {
  accountId: string;
  amount: number;
  description: string;
  type: "deposit" | "withdrawal" | "transfer";
}) => {
  const { data, error } = await supabase.from("transactions").insert([
    {
      account_id: accountId,
      amount,
      description,
      transaction_type: type,
    },
  ]);
  return { data, error };
};

export const deleteAccount = async (accountId: string) => {
  const { error } = await supabase
    .from("accounts")
    .delete()
    .eq("id", accountId);

  if (error) throw error;
  return { success: true };
};

import { getBankTokenContract } from "./contracts";
import { ethers } from "ethers";

export const mintBankTokens = async (amount: number) => {
  const provider = new ethers.JsonRpcProvider(
    `https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`,
  );
  const wallet = new ethers.Wallet(import.meta.env.PRIVATE_KEY, provider);
  const tokenContract = getBankTokenContract(provider).connect(wallet);

  const tx = await tokenContract.mint(
    import.meta.env.VITE_BANK_ADMIN_ADDRESS,
    ethers.parseEther(amount.toString()),
  );
  await tx.wait();
};

export const requestAccount = async ({
  userId,
  accountType,
}: {
  userId: string;
  accountType: string;
}) => {
  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, email")
    .eq("id", userId)
    .single();

  // Check if email is an admin email (ends with @bankco.com)
  const isAdminEmail = profile?.email?.endsWith("@bankco.com");

  // Validate account type based on user role and email
  if (isAdminEmail && accountType !== "admin_deposit") {
    throw new Error("Admin emails can only request admin deposit accounts");
  }

  if (!isAdminEmail && accountType === "admin_deposit") {
    throw new Error("Only admin emails can request admin deposit accounts");
  }

  // Additional check for admin role
  if (profile?.is_admin && accountType !== "admin_deposit") {
    throw new Error("Admins can only request admin deposit accounts");
  }

  if (!profile?.is_admin && accountType === "admin_deposit") {
    throw new Error("Only admins can request admin deposit accounts");
  }
  const { data: request, error } = await supabase
    .from("account_requests")
    .insert([
      {
        user_id: userId,
        account_type: accountType,
        status: "pending",
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return { request };
};
