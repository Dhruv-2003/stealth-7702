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

const kernelSmartEOA = await toEcdsaKernelSmartAccount({
  client: client,
  owners: [account],
  address: account.address,
});

const paymasterClient = createPimlicoClient({
  transport: http(
    "https://api.pimlico.io/v2/911867/rpc?apikey=pim_S72izExnBrN7dZ5ZuzgVYh"
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
    "https://api.pimlico.io/v2/911867/rpc?apikey=pim_S72izExnBrN7dZ5ZuzgVYh"
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
