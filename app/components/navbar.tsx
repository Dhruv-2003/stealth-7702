import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import sha256 from "sha256";
import { privateKeyToAccount } from "viem/accounts";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
} from "@chakra-ui/react";
import {
  updateAnnouncement,
  updateRegister,
  updateRegisterV2,
} from "@/utils/rollupMethods";
import { getStealthMetaAddress } from "@/utils/stealthMethods";

const Navbar = () => {
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [spendingKey, setSpendingKey] = useState<string>();
  const [viewingKey, setViewingKey] = useState<string>();
  const [userAddress, setUserAddress] = useState<string>();
  const [stealthMetaAddress, setStealthMetaAddress] = useState<string>();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const signAndGenerateKey = async () => {
    try {
      if (!walletClient) {
        return;
      }
      const signature = await walletClient.signMessage({
        account,
        message:
          "Sign this message to get access to your app-specific keys. Only Sign this Message while using this app",
      });
      console.log(signature);
      const portion = signature.slice(2, 66);

      const privateKey = sha256(`0x${portion}`);
      console.log(`0x${privateKey}`);

      const newAccount = privateKeyToAccount(`0x${privateKey}`);
      console.log(newAccount);

      setUserAddress(newAccount.address);
      setSpendingKey(`0x${privateKey}`);
      setViewingKey(`0x${privateKey}`);
      onOpen();
    } catch (error) {
      console.log(error);
    }
  };

  const getMetaAddress = async () => {
    try {
      if (!spendingKey || !viewingKey) {
        console.log("Please sign and generate keys");
        return;
      }

      const metaAddress = await getStealthMetaAddress(spendingKey, viewingKey);
      console.log(metaAddress);
      if (metaAddress) {
        setStealthMetaAddress(metaAddress.slice(0, -1));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const registerMetaAddress = async () => {
    try {
      if (!userAddress || !stealthMetaAddress) {
        console.log("Please sign and generate keys , or get meta address");
        return;
      }
      //@ts-ignore
      await updateRegisterV2(userAddress, stealthMetaAddress, 0, spendingKey);
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-screen bg-gradient-to-r from-white via-blue-100 to-rose-200">
      <div className="flex mt-4 justify-between mx-6">
        <div className="">
          <p className="font-semibold text-2xl">CrypticCloak</p>
        </div>
        <div className="flex">
          <button
            onClick={() => signAndGenerateKey()}
            className="bg-white mx-3 border border-blue-500 rounded-xl px-6 py-1 text-lg text-blue-500 font-semibold"
          >
            Register
          </button>
          <ConnectButton accountStatus="address" showBalance={false} />
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Generate your Stealth Meta Address</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div className="flex flex-col">
              <div className="mt-4 flex flex-col">
                <p className="text-md text-gray-600">
                  User app-specific Address
                </p>
                <p className="text-lg text-gray-800">
                  {/* {userAddress.slice(0, 10)}....
                  {userAddress.slice(-15)} */}
                  {userAddress}
                </p>
                <p className="text-md mt-10 text-gray-600">
                  Stealth Meta data Address
                </p>
                {stealthMetaAddress ? (
                  <p className="text-lg text-gray-800">
                    {stealthMetaAddress.slice(0, 20)}....
                    {stealthMetaAddress.slice(-15)}
                  </p>
                ) : (
                  <button
                    onClick={() => getMetaAddress()}
                    className="px-6 mt-6 mx-auto flex justify-center py-2 bg-blue-500 text-white text-xl rounded-xl font-semibold border hover:scale-105 hover:bg-white hover:border-blue-500 hover:text-blue-500 duration-200"
                  >
                    Generate
                  </button>
                )}

                <p className="text-lg text-gray-800"></p>
              </div>
              <div className="mt-6 flex flex-col">
                <button
                  onClick={() => registerMetaAddress()}
                  className="px-6 mx-auto flex justify-center py-2 bg-blue-500 text-white text-xl rounded-xl font-semibold border hover:scale-105 hover:bg-white hover:border-blue-500 hover:text-blue-500 duration-200"
                >
                  Register
                </button>
              </div>
            </div>
          </ModalBody>
          <ModalFooter></ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Navbar;

// export default Modal;
// export default dynamic(() => Promise.resolve(Navbar), { ssr: false });
