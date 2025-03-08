import { ethers } from "ethers";
import BankTokenABI from "../contracts/artifacts/BankToken.json";
import BankVaultABI from "../contracts/artifacts/BankVault.json";

const BANK_TOKEN_ADDRESS = import.meta.env.VITE_BANK_TOKEN_ADDRESS;
const BANK_VAULT_ADDRESS = import.meta.env.VITE_BANK_VAULT_ADDRESS;

export const getBankTokenContract = (provider: ethers.Provider) => {
  return new ethers.Contract(BANK_TOKEN_ADDRESS, BankTokenABI.abi, provider);
};

export const getBankVaultContract = (provider: ethers.Provider) => {
  return new ethers.Contract(BANK_VAULT_ADDRESS, BankVaultABI.abi, provider);
};

export const depositTokens = async (amount: string) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const vault = getBankVaultContract(provider).connect(signer);
  const token = getBankTokenContract(provider).connect(signer);

  // First approve the vault to spend tokens
  const approveTx = await token.approve(
    BANK_VAULT_ADDRESS,
    ethers.parseEther(amount),
  );
  await approveTx.wait();

  // Then deposit
  const tx = await vault.deposit(ethers.parseEther(amount));
  return await tx.wait();
};

export const withdrawTokens = async (amount: string) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const vault = getBankVaultContract(provider).connect(signer);

  const tx = await vault.withdraw(ethers.parseEther(amount));
  return await tx.wait();
};

export const getTokenBalance = async (address: string) => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const vault = getBankVaultContract(provider);
  const balance = await vault.getBalance(address);
  return ethers.formatEther(balance);
};
