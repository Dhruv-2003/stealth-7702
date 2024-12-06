import {
  concat,
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  zeroAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { odysseyTestnet } from "viem/chains";
import {
  getStealthAddress,
  getStealthMetaAddress,
  revealStealthKey,
} from "./stealth/methods";
import {
  announceStealthAddress,
  getStealthMetaAddressOf,
  registerKeys,
} from "./contractMethods";
import { signAuthorization } from "viem/experimental";
import {
  KERNEL_V3_1_IMPLEMENTATION,
  MULTI_CHAIN_VALIDATOR,
} from "../constants/address";
import { writeContract } from "viem/actions";
import kernelV3ImplementationAbi from "../abi/kernelV3Implementation";

const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY as `0x${string}`;
if (!OWNER_PRIVATE_KEY) {
  throw new Error("OWNER_PRIVATE_KEY is not set");
}

const SENDER_PRIVATE_KEY = process.env.SENDER_PRIVATE_KEY as `0x${string}`;
if (!SENDER_PRIVATE_KEY) {
  throw new Error("SENDER_PRIVATE_KEY is not set");
}

const SPONSOR_PRIVATE_KEY = process.env.SPONSOR_PRIVATE_KEY as `0x${string}`;
if (!SPONSOR_PRIVATE_KEY) {
  throw new Error("SPONSOR_PRIVATE_KEY is not set");
}

async function main() {
  const account = privateKeyToAccount(OWNER_PRIVATE_KEY);

  const publicClient = createPublicClient({
    chain: odysseyTestnet,
    transport: http(),
  });

  const walletClient = createWalletClient({
    chain: odysseyTestnet,
    transport: http(),
    account,
  });

  // 1. Create your meta-address
  const stealthMetaAddress = await getStealthMetaAddress(
    OWNER_PRIVATE_KEY,
    OWNER_PRIVATE_KEY
  );

  if (!stealthMetaAddress) {
    throw new Error("Failed to create stealth meta address");
  }

  // 2. Register your meta-address
  const registerTxHash = await registerKeys(
    {
      publicClient,
      walletClient,
    },
    {
      schemeId: 0,
      stealthMetaAddress: stealthMetaAddress as `0x${string}`,
    }
  );

  const senderAccount = privateKeyToAccount(SENDER_PRIVATE_KEY);
  const senderWalletClient = createWalletClient({
    chain: odysseyTestnet,
    transport: http(),
    account: senderAccount,
  });
  const receiverAddress = account.address;

  // 3. Get the stealth meta address record of the user
  const stealthMetaAddressOf = await getStealthMetaAddressOf(
    {
      publicClient,
      walletClient: senderWalletClient,
    },
    {
      schemeId: 0,
      receiverAddress,
    }
  );

  if (!stealthMetaAddressOf) {
    throw new Error("Failed to get stealth meta address of the user");
  }

  // 4. Generate new stealth address
  const stealthAddressData = await getStealthAddress(stealthMetaAddressOf);

  if (!stealthAddressData) {
    throw new Error("Failed to generate stealth address");
  }

  // 5. Send funds to the stealth address
  const transferTx = await senderWalletClient.sendTransaction({
    to: stealthAddressData.stealthAddress,
    value: parseEther("0.0001"),
  });

  // 6. Announce the stealth address info
  const announceTx = await announceStealthAddress(
    {
      publicClient,
      walletClient: senderWalletClient,
    },
    {
      schemeId: 0,
      stealthAddress: stealthAddressData.stealthAddress,
      ephemeralPublicKey: stealthAddressData.ephemeralPublicKey,
      viewTag: stealthAddressData.viewTag,
    }
  );

  //  (optionally) can scan for announcements for the account by retrieving and checking the stealth address

  // 7. Reveal the stealth key
  const stealthKey = await revealStealthKey(
    OWNER_PRIVATE_KEY,
    OWNER_PRIVATE_KEY,
    stealthAddressData.stealthAddress,
    stealthAddressData.ephemeralPublicKey
  );

  if (!stealthKey) {
    throw new Error("Failed to reveal stealth key");
  }

  const stealthKeyAccount = privateKeyToAccount(stealthKey as `0x${string}`);

  // 8. Authorizing tx upgrade ( Script src/7702/1_authorize.ts )

  // 9. Sending a sponsored transaction ( Script src/7702/2_send.ts )
}

main();
