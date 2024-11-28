import { createSmartAccountClient } from "permissionless";
import { toEcdsaKernelSmartAccount } from "permissionless/accounts";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { createPublicClient, http, parseEther, type Hex } from "viem";
import {
  createPaymasterClient,
  entryPoint07Address,
} from "viem/account-abstraction";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet, odysseyTestnet } from "viem/chains";

const client = createPublicClient({
  chain: odysseyTestnet,
  transport: http(),
});

const ownerPrivateKey = process.env.OWNER_PRIVATE_KEY as Hex | undefined;
if (!ownerPrivateKey) {
  throw new Error("OWNER_PRIVATE_KEY is required");
}
const account = privateKeyToAccount(ownerPrivateKey);

const PIMLICO_API_KEY = process.env.PIMLICO_API_KEY;
if (!PIMLICO_API_KEY) {
  throw new Error("PIMLICO_API_KEY is required");
}

const kernelSmartEOA = await toEcdsaKernelSmartAccount({
  client: client,
  owners: [account],
  address: account.address,
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
  chain: odysseyTestnet,
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
  to: "0x898d0DBd5850e086E6C09D2c83A26Bb5F1ff8C33",
  value: parseEther("0.0005"),
});

console.log("Transaction Hash", txHash);
