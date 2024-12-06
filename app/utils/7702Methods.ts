import { kernelV3Implabi } from "@/abi/kernelV3Implementation";
import {
  KERNEL_V3_1_IMPLEMENTATION,
  MULTI_CHAIN_VALIDATOR,
} from "@/constants/address";
import { toEcdsaKernelSmartAccount } from "permissionless/accounts";
import { createSmartAccountClient } from "permissionless";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { concat, http, zeroAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { writeContract } from "viem/actions";
import { signAuthorization } from "viem/experimental";
import { Config } from "wagmi";
import { getPublicClient } from "wagmi/actions";
import { entryPoint07Address } from "viem/account-abstraction";
import dotenv from "dotenv";
dotenv.config({
  path: "./.env.local",
});

const PIMLICO_API_KEY = process.env.NEXT_PUBLIC_PIMLICO_API_KEY;

export const authorizeSmartAccountUpgrade = async (
  config: Config,
  stealthPrivateKey: `0x${string}`,
  sponsorPrivateKey: `0x${string}`
) => {
  const stealthAccount = privateKeyToAccount(stealthPrivateKey);
  const sponsorAccount = privateKeyToAccount(sponsorPrivateKey);

  const publicClient = getPublicClient(config);
  if (!publicClient) {
    throw new Error("Failed to get public client");
  }

  const authorization = await signAuthorization(publicClient, {
    account: stealthAccount,
    contractAddress: KERNEL_V3_1_IMPLEMENTATION,
    delegate: sponsorAccount,
  });

  const txHash = await writeContract(publicClient, {
    address: stealthAccount.address,
    abi: kernelV3Implabi,
    functionName: "initialize",
    args: [
      concat(["0x01", MULTI_CHAIN_VALIDATOR]),
      zeroAddress,
      stealthAccount.address,
      "0x",
    ],
    account: sponsorAccount,
    authorizationList: [authorization],
  });

  return txHash;
};

export const performSponsoredTransaction = async (
  config: Config,
  stealthPrivateKey: `0x${string}`,
  tx: {
    to: `0x${string}`;
    data: `0x${string}`;
    value: bigint;
  }
) => {
  const publicClient = getPublicClient(config);
  if (!publicClient) {
    throw new Error("Failed to get public client");
  }

  const stealthAccount = privateKeyToAccount(stealthPrivateKey);

  const kernelSmartEOA = await toEcdsaKernelSmartAccount({
    client: publicClient,
    owners: [stealthAccount],
    address: stealthAccount.address,
  });

  const paymasterClient = createPimlicoClient({
    transport: http(
      `https://api.pimlico.io/v2/911867/rpc?apikey=${PIMLICO_API_KEY}`
    ),
    entryPoint: {
      address: entryPoint07Address,
      version: "0.7",
    },
  });

  const smartAccountClient = createSmartAccountClient({
    account: kernelSmartEOA,
    chain: publicClient.chain,
    paymaster: paymasterClient,
    bundlerTransport: http(
      `https://api.pimlico.io/v2/911867/rpc?apikey=${PIMLICO_API_KEY}`
    ),
    userOperation: {
      estimateFeesPerGas: async () =>
        (await paymasterClient.getUserOperationGasPrice()).fast,
    },
  });

  const txHash = await smartAccountClient.sendTransaction({
    to: tx.to,
    data: tx.data,
    value: tx.value,
  });

  return txHash;
};
