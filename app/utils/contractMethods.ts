import { erc5564AnnouncerAbi } from "@/abi/erc5564Announcer";
import { erc6538RegistryAbi } from "@/abi/erc6538Registry";
import {
  ERC5564AnnouncerAddress,
  ERC6638RegisteryAddress,
} from "@/constants/address";
import { config } from "process";
import { parseAbiItem, toHex, zeroHash } from "viem";
import { Config } from "wagmi";
import { getPublicClient, getWalletClient } from "wagmi/actions";

type RegisterKeysParams = {
  schemeId: number;
  stealthMetaAddress: `0x${string}`;
};

export const registerKeys = async (
  config: Config,
  params: RegisterKeysParams
) => {
  const publicClient = getPublicClient(config);
  const walletClient = await getWalletClient(config);

  const data = await publicClient?.simulateContract({
    address: ERC6638RegisteryAddress,
    abi: erc6538RegistryAbi,
    functionName: "registerKeys",
    args: [BigInt(params.schemeId), params.stealthMetaAddress],
  });

  if (!data) {
    throw new Error("Failed to simulate contract");
  }

  const txHash = await walletClient.writeContract(data?.request);

  const txReciept = await publicClient?.waitForTransactionReceipt({
    hash: txHash,
  });

  return txReciept;
};

type GetStealthMetaAddressOfParams = {
  schemeId: number;
  receiverAddress: `0x${string}`;
};

export const getStealthMetaAddressOf = async (
  config: Config,
  params: GetStealthMetaAddressOfParams
) => {
  const publicClient = getPublicClient(config);

  const data = await publicClient?.readContract({
    address: ERC6638RegisteryAddress,
    abi: erc6538RegistryAbi,
    functionName: "stealthMetaAddressOf",
    args: [params.receiverAddress, BigInt(params.schemeId)],
  });

  if (!data || data === zeroHash) {
    return undefined;
  }

  return data;
};

type RegisterKeysOnBehalfParams = {
  schemeId: number;
  stealthAddress: `0x${string}`;
  ephemeralPublicKey: `0x${string}`;
  viewTag: number;
};

export const announceStealthAddress = async (
  config: Config,
  params: RegisterKeysOnBehalfParams
) => {
  const publicClient = getPublicClient(config);
  const walletClient = await getWalletClient(config);

  const data = await publicClient?.simulateContract({
    address: ERC5564AnnouncerAddress,
    abi: erc5564AnnouncerAbi,
    functionName: "announce",
    args: [
      BigInt(params.schemeId),
      params.stealthAddress,
      params.ephemeralPublicKey,
      toHex(params.viewTag),
    ],
  });

  if (!data) {
    throw new Error("Failed to simulate contract");
  }

  const txHash = await walletClient.writeContract(data?.request);

  const txReciept = await publicClient?.waitForTransactionReceipt({
    hash: txHash,
  });

  return txReciept;
};

export const retrieveAnnouncements = async (config: Config) => {
  const publicClient = getPublicClient(config);

  const blockNumber = await publicClient?.getBlockNumber();
  if (!blockNumber) {
    throw new Error("Failed to get block number");
  }

  const logs = await publicClient?.getContractEvents({
    address: ERC5564AnnouncerAddress,
    abi: erc5564AnnouncerAbi,
    fromBlock: blockNumber - BigInt(100000),
    toBlock: blockNumber,
  });

  console.log(ERC5564AnnouncerAddress);

  return logs;
};
