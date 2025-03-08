import { ethers } from "ethers";
import { Alchemy, Network } from "alchemy-sdk";

// Configure Alchemy SDK
const config = {
  apiKey: import.meta.env.VITE_ALCHEMY_API_KEY || "demo",
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(config);

export const getProvider = () => {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return new ethers.JsonRpcProvider(
    alchemy.config.getProvider().connection.url,
  );
};

export const getEthPrice = async () => {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
    );
    const data = await response.json();
    return data.ethereum.usd;
  } catch (error) {
    console.error("Error fetching ETH price:", error);
    throw error;
  }
};

export const depositCrypto = async (amount: string, toAddress: string) => {
  const provider = getProvider();
  if (!provider) throw new Error("No provider available");

  try {
    const signer = await provider.getSigner();
    const tx = await signer.sendTransaction({
      to: toAddress,
      value: ethers.parseEther(amount),
    });
    return tx;
  } catch (error) {
    console.error("Error depositing crypto:", error);
    throw error;
  }
};

export const withdrawCrypto = async (amount: string, toAddress: string) => {
  const provider = getProvider();
  if (!provider) throw new Error("No provider available");

  try {
    const signer = await provider.getSigner();
    const tx = await signer.sendTransaction({
      to: toAddress,
      value: ethers.parseEther(amount),
    });
    return tx;
  } catch (error) {
    console.error("Error withdrawing crypto:", error);
    throw error;
  }
};
