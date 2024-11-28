import { transferABI } from "@/constants/ERC20";
import { erc721ABI } from "wagmi";
import { getAccount, getPublicClient, getWalletClient } from "wagmi/actions";
// import { ethers } from "ethers";

// export async function transferERC20(
//   tokenAddress: any, //ERC20_TOKEN_ADDRESS
//   signer: any,
//   amount: string,
//   Recipient_Wallet_Address: string
// ) {
//   try {
//     const token = new ethers.Contract(tokenAddress, transferABI, signer);
//     const amountTransfer = ethers.parseUnits(amount, 18);
//     await token
//       .transfer(Recipient_Wallet_Address, amountTransfer)
//       .then((transferResult: any) => {
//         console.log("transferResult", transferResult);
//       })
//       .catch((error: any) => {
//         console.error("Error", error);
//       });
//   } catch (error) {
//     console.error("Error transferring tokens:", error);
//   }
// }
export const transferNFT = async (
  tokenAddress: `0x${string}`,
  stealthAddress: `0x${string}`,
  amount: bigint
) => {
  const publicClient = await getPublicClient();
  const walletClient = await getWalletClient();
  const account = await getAccount();
  if (!walletClient?.account) {
    console.log("Account not found");
    return;
  }
  try {
    const data = await publicClient?.simulateContract({
      account: walletClient?.account,
      address: tokenAddress,
      abi: erc721ABI,
      functionName: "transferFrom",
      args: [walletClient?.account.address, stealthAddress, amount],
    });
    console.log(data);
    if (!walletClient) {
      console.log("Wallet client not found");
      return;
    }
    // @ts-ignore
    const hash = await walletClient.writeContract(data.request);
    console.log("Transaction Sent");
    const transaction = await publicClient.waitForTransactionReceipt({
      hash: hash,
    });
    console.log(transaction);
  } catch (error) {
    console.log(error);
  }
};

export const transferNativeToken = async (
  walletClient: any,
  account: any,
  value: number,
  to: string
) => {
  try {
    const hash = await walletClient.sendTransaction({
      account: account,
      to: to,
      value: value,
    });
    console.log(hash);
  } catch (error) {
    console.log(error);
  }
};
