import { erc5564AnnouncerAbi } from "@/abi/erc5564Announcer";
import { ERC5564AnnouncerAddress } from "@/constants/address";
import { createPublicClient, http } from "viem";
import { baseSepolia, odysseyTestnet } from "viem/chains";
import { Contract, JsonRpcProvider } from "ethers";

async function main() {
  const publicClient = await createPublicClient({
    chain: odysseyTestnet,
    transport: http(),
  });

  const currentBlock = await publicClient.getBlockNumber();

  console.log(`Current block: ${currentBlock}`);

  const logs = await publicClient.getContractEvents({
    abi: erc5564AnnouncerAbi,
    address: ERC5564AnnouncerAddress,
    fromBlock: currentBlock - BigInt(100000),
    toBlock: currentBlock,
  });

  console.log(logs);

  //   const provider = new JsonRpcProvider(odysseyTestnet.rpcUrls.default.http[0]);
  //   const contract = new Contract(
  //     ERC5564AnnouncerAddress,
  //     erc5564AnnouncerAbi,
  //     provider
  //   );

  //   const filters = await contract.queryFilter(contract.getEvent("Announcement"), );
  //   console.log(filters);
}
main();
