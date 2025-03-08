import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  // Deploy BankToken
  const BankToken = await ethers.getContractFactory("BankToken");
  const bankToken = await BankToken.deploy();
  await bankToken.waitForDeployment();
  console.log(`BankToken deployed to: ${await bankToken.getAddress()}`);

  // Deploy BankVault
  const BankVault = await ethers.getContractFactory("BankVault");
  const bankVault = await BankVault.deploy(await bankToken.getAddress());
  await bankVault.waitForDeployment();
  console.log(`BankVault deployed to: ${await bankVault.getAddress()}`);

  // Update .env file with contract addresses
  const envPath = path.join(__dirname, "../.env");
  let envContent = fs.readFileSync(envPath, "utf8");

  envContent = envContent.replace(
    /VITE_BANK_TOKEN_ADDRESS=.*/,
    `VITE_BANK_TOKEN_ADDRESS=${await bankToken.getAddress()}`,
  );
  envContent = envContent.replace(
    /VITE_BANK_VAULT_ADDRESS=.*/,
    `VITE_BANK_VAULT_ADDRESS=${await bankVault.getAddress()}`,
  );

  fs.writeFileSync(envPath, envContent);

  console.log("Environment variables updated successfully");

  // Grant minter role to vault
  const tx = await bankToken.grantRole(
    await bankToken.MINTER_ROLE(),
    await bankVault.getAddress(),
  );
  await tx.wait();
  console.log("Granted minter role to vault");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
