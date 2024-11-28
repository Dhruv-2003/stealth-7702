import Modal from "@/components/modal";
import Navbar from "@/components/navbar";

import {
  checkStealth,
  getNewStealthAddress,
  getStealthMetaAddress,
  revealStealthKey,
} from "@/utils/stealthMethods";
import { useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import sha256 from "sha256";

import { privateKeyToAccount } from "viem/accounts";
export default function Home() {
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [spendingKey, setSpendingKey] = useState<string>();
  const [viewingKey, setViewingKey] = useState<string>();
  const [stealthMetaAddress, setStealthMetaAddress] = useState<string>();
  const [stealthAddress, setStealthAddress] = useState<string>();
  const [ephemeralPublicKey, setEphemeralPublicKey] = useState<string>();

  const checkFlow = async () => {
    if (!spendingKey) {
      console.log("No Spending Key Found");
      return;
    }
    if (!viewingKey) {
      console.log("No Viewing Key Found");
      return;
    }
    const stealthMetaAddress = await getStealthMetaAddress(
      spendingKey,
      viewingKey
    );
    if (!stealthMetaAddress) {
      return;
      console.log("No Metadata address found");
    }
    setStealthMetaAddress(stealthMetaAddress);
    const data = await getNewStealthAddress(stealthMetaAddress);
    if (!data) {
      console.log("No Metadata address found");
      return;
    }
    const { schemeId, stealthAddress, ephemeralPublicKey, viewTag } = data;
    setStealthAddress(stealthAddress);
    setEphemeralPublicKey(ephemeralPublicKey);

    const revealData = await revealStealthKey(
      spendingKey,
      viewingKey,
      stealthAddress,
      ephemeralPublicKey
    );
    if (!revealData) {
      console.log("No Reveal Stealth Key Found");
      return;
    }

    const stealthPrivateKey = revealData;
    console.log(stealthPrivateKey);
  };

  const signAndGenerateKey = async () => {
    try {
      if (!walletClient) {
        return;
      }
      const signature = await walletClient.signMessage({
        account,
        message: `Sign this message to get access to your app-specific keys. \n \nOnly Sign this Message while using the trusted app`,
      });
      console.log(signature);
      const portion = signature.slice(2, 66);

      const privateKey = sha256(`0x${portion}`);
      console.log(`0x${privateKey}`);

      const newAccount = privateKeyToAccount(`0x${privateKey}`);
      console.log(newAccount);

      setSpendingKey(`0x${privateKey}`);
      setViewingKey(`0x${privateKey}`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-r from-white via-blue-100 to-rose-200">
      <div className="flex flex-col justify-center mx-auto w-full">
        <Navbar />
        <div className="mx-auto w-full">
          <Modal />
        </div>
      </div>
    </div>
  );
}
