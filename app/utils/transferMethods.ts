import { Config } from "wagmi";
import {
  erc20Abi,
  parseEther,
  parseUnits,
  erc721Abi,
  zeroHash,
  encodeFunctionData,
  PublicClient,
} from "viem";
import { getAccount, getPublicClient, getWalletClient } from "wagmi/actions";
// import { ethers } from "ethers";

export async function prepareTransaction({
  tokenAddress,
  fromAddress,
  publicClient,
  receiverAddress,
  amount,
  txType,
  calldata,
}: {
  tokenAddress?: `0x${string}`;
  fromAddress?: `0x${string}`;
  publicClient: PublicClient;
  receiverAddress: `0x${string}`;
  amount: string;
  txType: string;
  calldata?: `0x${string}`;
}) {
  let tx:
    | {
        to: `0x${string}`;
        data: `0x${string}`;
        value: bigint;
      }
    | undefined;

  if (!receiverAddress || !amount) {
    console.log("No Receiver Address or Amount Found");
    return;
  }

  if (txType == "1") {
    tx = {
      to: receiverAddress as `0x${string}`,
      value: parseEther(amount),
      data: zeroHash,
    };
  } else if (txType == "2" && tokenAddress) {
    const tokenDecimals = await publicClient?.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "decimals",
    });

    const data = encodeFunctionData({
      abi: erc20Abi,
      functionName: "transfer",
      args: [receiverAddress, parseUnits(amount, tokenDecimals)],
    });

    tx = {
      to: tokenAddress,
      value: parseEther(amount),
      data: data,
    };
  } else if (txType == "3" && tokenAddress && fromAddress) {
    const data = encodeFunctionData({
      abi: erc721Abi,
      functionName: "transferFrom",
      args: [fromAddress, receiverAddress, BigInt(amount)],
    });

    tx = {
      to: tokenAddress,
      value: parseEther(amount),
      data: data,
    };
  } else if (txType == "4" && calldata) {
    tx = {
      to: receiverAddress as `0x${string}`,
      value: parseEther(amount),
      data: calldata as `0x${string}`,
    };
  } else {
    console.log("Invalid Transaction Type");
    return;
  }

  return tx;
}

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
