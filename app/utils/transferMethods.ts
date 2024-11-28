import { Config } from "wagmi";
import { erc20Abi, parseEther, parseUnits, erc721Abi } from "viem";
import { getAccount, getPublicClient, getWalletClient } from "wagmi/actions";
// import { ethers } from "ethers";

export async function transferERC20(
  config: Config,
  tokenAddress: `0x${string}`, //ERC20_TOKEN_ADDRESS
  receiverAddress: `0x${string}`,
  amount: number
) {
  try {
    const publicClient = getPublicClient(config);
    const walletClient = await getWalletClient(config);

    if (!walletClient?.account) {
      console.log("Account not found");
      return;
    }

    const tokenDecimals = await publicClient?.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "decimals",
    });

    const data = await publicClient?.simulateContract({
      account: walletClient?.account,
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "transferFrom",
      args: [
        walletClient?.account.address,
        receiverAddress,
        parseUnits(amount.toString(), Number(tokenDecimals)),
      ],
    });

    console.log(data);
    if (!data) {
      console.log("Wallet client not found");
      return;
    }

    const hash = await walletClient.writeContract(data.request);
    console.log("Transaction Sent");

    const transaction = await publicClient?.waitForTransactionReceipt({
      hash: hash,
    });
    console.log(transaction);
  } catch (error) {
    console.error("Error transferring tokens:", error);
  }
}

export const transferNFT = async (
  config: Config,
  tokenAddress: `0x${string}`,
  receiverAddress: `0x${string}`,
  tokenId: bigint
) => {
  const publicClient = getPublicClient(config);
  const walletClient = await getWalletClient(config);

  if (!walletClient?.account) {
    console.log("Account not found");
    return;
  }
  try {
    const data = await publicClient?.simulateContract({
      account: walletClient?.account,
      address: tokenAddress,
      abi: erc721Abi,
      functionName: "transferFrom",
      args: [walletClient?.account.address, receiverAddress, tokenId],
    });
    console.log(data);

    if (!data) {
      console.log("Failed to simulate contract");
      return;
    }

    const hash = await walletClient.writeContract(data.request);
    console.log("Transaction Sent");

    const transaction = await publicClient?.waitForTransactionReceipt({
      hash: hash,
    });
    console.log(transaction);
  } catch (error) {
    console.log(error);
  }
};

export const transferNativeToken = async (
  config: Config,
  value: number,
  to: `0x${string}`
) => {
  try {
    const walletClient = await getWalletClient(config);

    const hash = await walletClient.sendTransaction({
      to: to,
      value: parseEther(value.toString()),
    });

    console.log(hash);
  } catch (error) {
    console.log(error);
  }
};
