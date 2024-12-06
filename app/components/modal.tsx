import React, { useRef } from "react";
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  useTabs,
} from "@chakra-ui/react";
import {
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
  Button,
  RadioGroup,
  Radio,
  HStack,
} from "@chakra-ui/react";
import { useState } from "react";
import {
  getNewStealthAddress,
  revealStealthKey,
  StealthAddressData,
} from "@/utils/stealthMethods";

import { useAccount, useConfig, usePublicClient, useWalletClient } from "wagmi";

import {
  createWalletClient,
  encodeFunctionData,
  erc20Abi,
  erc721Abi,
  http,
  parseEther,
  parseUnits,
  zeroHash,
} from "viem";

import sha256 from "sha256";
import { privateKeyToAccount } from "viem/accounts";
import { RepeatIcon, CheckCircleIcon } from "@chakra-ui/icons";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import {
  announceStealthAddress,
  getStealthMetaAddressOf,
} from "@/utils/contractMethods";
import { Announcement, scanAnnouncements } from "@/utils";
import {
  authorizeSmartAccountUpgrade,
  performSponsoredTransaction,
} from "@/utils/7702Methods";
import dotenv from "dotenv";
import { prepareTransaction } from "@/utils/transferMethods";

dotenv.config();

const SPONSOR_PRIVATE_KEY = process.env.NEXT_PUBLIC_SPONSOR_PRIVATE_KEY;
if (!SPONSOR_PRIVATE_KEY) {
  throw new Error("SPONSOR_PRIVATE_KEY is required");
}

const Modal = () => {
  const { address: account, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const config = useConfig();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  const [receiverAddress, setReceieverAddress] = useState<`0x${string}`>();
  const [stealthMetaAddress, setStealthMetaAddress] = useState<string>();
  const [stealthAddressData, setStealthAddressData] =
    useState<StealthAddressData>();

  const [tokenAddress, setTokenAddress] = useState<`0x${string}`>("0xe");
  const [amount, setAmount] = useState<string>();
  const [calldata, setCalldata] = useState<`0x${string}`>();

  const [checkReceiverData, setCheckReceiverData] = useState<boolean>(false);
  const [checkTokenTransfer, setCheckTokenTransfer] = useState<boolean>(false);

  const [spendingKey, setSpendingKey] = useState<string>();
  const [viewingKey, setViewingKey] = useState<string>();

  const [announcements, setAnnouncements] = useState<Announcement[]>();
  const [stealthKey, setStealthKey] = useState<`0x${string}`>();

  const toast = useToast();
  const [page, setPage] = useState<number>(0);
  const [transactionHash, setTransactionHash] = useState<string>();
  const [chooseStealthAddress, setChooseStealthAddress] = useState<string>();
  const [announced, setAnnounced] = useState<boolean>(false);
  const [stealthCode, setStealthCode] = useState<`0x${string}` | null>(null);

  const [txType, setTxType] = useState<string>("1");

  const { selectedIndex, setSelectedIndex } = useTabs({});

  const handleSwitchToTab = (tabIndex: number) => {
    setSelectedIndex(tabIndex);
  };

  const steps = [
    { title: "Generation", description: "Stealth Address" },
    { title: "Transfer", description: "Transfer funds" },
    { title: "Announce", description: "Announce SA and EPK" },
  ];

  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });

  const handleStepper = () => {
    const condition = true;

    if (condition) {
      if (activeStep < steps.length) {
        setActiveStep(activeStep + 1);
      }
    }
  };

  // To get the stealth meta address for the user and then create a new stealth address
  const handleGetReceiverData = async () => {
    try {
      if (!receiverAddress) {
        console.log("No Receiver Address Found");
        throw new Error("Receiver Address not found");
      }

      const stealthMetaAddress = await getStealthMetaAddressOf(config, {
        receiverAddress: receiverAddress,
        schemeId: 0,
      });
      console.log("Stealth meta address", stealthMetaAddress);

      if (!stealthMetaAddress) {
        console.log("No Metadata address found");
        throw new Error("Recepient not registered");
      }
      setStealthMetaAddress(stealthMetaAddress);

      const stealthAddressData = await getNewStealthAddress(stealthMetaAddress);
      setStealthAddressData(stealthAddressData);
      if (
        stealthAddressData?.stealthAddress &&
        stealthAddressData?.ephemeralPublicKey
      ) {
        setCheckReceiverData(true);
      } else {
        throw new Error("Stealth Address not found");
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        // @ts-ignore
        description: `There was an error generating stealth address for the user ${error.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Sign & generate app specific keys for the user
  const signAndGenerateKey = async () => {
    try {
      if (!walletClient) {
        return;
      }

      const signature = await walletClient.signMessage({
        account,
        message: `Sign this message to get access to your app-specific keys. \n \nOnly Sign this Message while using the trusted app`,
      });
      const portion = signature.slice(2, 66);

      const privateKey = sha256(`0x${portion}`);

      const newAccount = privateKeyToAccount(`0x${privateKey}`);

      setSpendingKey(`0x${privateKey}`);
      setViewingKey(`0x${privateKey}`);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        // @ts-ignore
        description: `An error occured while generating keys ${error.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle the announcement of the stealth address
  const handleAnnounce = async () => {
    try {
      if (!stealthAddressData) {
        console.log("No Stealth address found");
        throw new Error("Stealth Address not found");
      }

      // update the Registery contract with the stealth address data
      await announceStealthAddress(config, {
        schemeId: 0,
        stealthAddress: stealthAddressData.stealthAddress,
        ephemeralPublicKey: stealthAddressData.ephemeralPublicKey,
        viewTag: stealthAddressData.viewTag,
      });

      setAnnounced(true);
      handleStepper();
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        // @ts-ignore
        description: `An error occured while announcing stealth address ${error.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Scan for the user's ephemeral public key set
  const handleScan = async () => {
    try {
      if (!spendingKey || !viewingKey) {
        console.log("Please sign and generate keys");
        throw new Error("Keys not found");
      }
      toast({
        title: "Scanning for Announcements",
        description: "Scanning for announcements for the user",
        status: "loading",
        isClosable: true,
      });
      const data = await scanAnnouncements(config, {
        spendingKey: spendingKey as `0x${string}`,
        viewingKey: viewingKey as `0x${string}`,
      });
      toast.closeAll();
      if (data.length > 0) {
        setAnnouncements(data);
        toast({
          title: "Announcements Found",
          description: "Announcements found for the user",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else if (data.length == 0) {
        toast({
          title: "No Announcements Found",
          description: "No announcements found for the user",
          status: "info",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast.closeAll();
      console.log(error);
    }
  };

  const handleRevealStealthKey = async () => {
    try {
      if (!spendingKey || !viewingKey) {
        console.log("Please sign and generate keys");
        throw new Error("Keys not found");
      }
      if (!stealthAddressData) {
        console.log("No Stealth address found");
        throw new Error("Stealth Address not found");
      }
      const data = await revealStealthKey(
        spendingKey,
        viewingKey,
        stealthAddressData?.stealthAddress,
        stealthAddressData?.ephemeralPublicKey
      );
      console.log(data);
      if (data) {
        const formatted = data.slice(0, 66);
        // @ts-ignore
        setStealthKey(formatted);
        return formatted;
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        // @ts-ignore
        description: `An error occured while revealing stealth key ${error.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const checkStealthAddress = async (stealthAddress: `0x${string}`) => {
    if (!stealthAddress) {
      console.log("No Stealth Address Found");
      return;
    }

    if (!publicClient) {
      console.log("No Public Client Found");
      return;
    }

    const code = await publicClient.getCode({
      address: stealthAddress,
    });

    console.log(code);
    if (code) {
      setStealthCode(code);
      toast({
        title: "Code found at stealth address",
        description: "Code found at the stealth address. No need to upgrade",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleAuthorizeUpgrade = async () => {
    try {
      const stealthKey = await handleRevealStealthKey();
      if (!stealthKey) {
        console.log("No Stealth Key Found");
        throw new Error("Stealth Key not found");
      }

      const txHash = await authorizeSmartAccountUpgrade(
        config,
        stealthKey as `0x${string}`,
        SPONSOR_PRIVATE_KEY as `0x${string}`
      );

      console.log(`Authorize Upgrade Transaction Hash: ${txHash}`);

      setTransactionHash(txHash);
      const txReciept = await publicClient?.waitForTransactionReceipt({
        hash: txHash,
      });

      console.log(txReciept);
      if (stealthAddressData) {
        checkStealthAddress(stealthAddressData?.stealthAddress);
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        // @ts-ignore
        description: `An error occured while authorizing upgrade`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Token Transfer from sender to stealth address
  const handleTransfer = async () => {
    try {
      if (!stealthAddressData || !amount || !walletClient || !publicClient) {
        console.log("Invalid inputs");
        throw new Error("Invalid Inputs");
      }

      const tx = await prepareTransaction({
        publicClient: publicClient,
        tokenAddress: tokenAddress,
        fromAddress: walletClient.account.address,
        receiverAddress: stealthAddressData.stealthAddress,
        amount: amount,
        txType: txType,
        calldata: calldata,
      });

      if (!tx) {
        console.log("No transaction found");
        throw new Error("No transaction found");
      }

      const txHash = await walletClient.sendTransaction({
        to: tx.to,
        value: tx.value,
        data: tx.data,
      });

      if (txHash) {
        setCheckTokenTransfer(true);
        setTransactionHash(txHash);
      }

      const transaction = await publicClient?.waitForTransactionReceipt({
        hash: txHash,
      });

      console.log(transaction);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        // @ts-ignore
        description: `An error occured while transferring the funds`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSponsoredTransaction = async () => {
    try {
      if (!stealthKey) {
        console.log("No Stealth Key Found");
        throw new Error("Stealth Key not found");
      }

      if (!publicClient || !chain) {
        console.log("No Public Client Found");
        return;
      }

      const account = privateKeyToAccount(stealthKey);

      if (!receiverAddress || !amount || !tokenAddress) {
        throw new Error("Invalid Inputs");
      }

      const tx = await prepareTransaction({
        publicClient: publicClient,
        tokenAddress: tokenAddress,
        fromAddress: account.address,
        receiverAddress: receiverAddress,
        amount: amount,
        txType: txType,
        calldata: calldata,
      });

      if (!tx) {
        console.log("No transaction found");
        throw new Error("No transaction found");
      }

      const txHash = await performSponsoredTransaction(config, stealthKey, tx);
      console.log(`Transaction Hash: ${txHash}`);

      setTransactionHash(txHash);

      const txReciept = await publicClient?.waitForTransactionReceipt({
        hash: txHash,
      });
      console.log(txReciept);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        // @ts-ignore
        description: `An error occured while processing the tx`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <div className="w-screen bg-gradient-to-r from-white via-blue-100 to-rose-200">
      <div className="flex flex-col mx-auto justify-between w-full">
        <div className="mt-20 flex mx-auto justify-center">
          <Tabs index={selectedIndex} variant="soft-rounded" colorScheme="blue">
            <div className="flex mx-auto px-2 w-[380px] py-1 bg-white rounded-xl">
              <TabList>
                <Tab onClick={() => setSelectedIndex(0)}>Transfer</Tab>
                <Tab onClick={() => setSelectedIndex(1)}>
                  Transact / Account
                </Tab>
                <Tab
                  onClick={() => {
                    setSelectedIndex(2);
                  }}
                >
                  Scan
                </Tab>
              </TabList>
            </div>
            <TabPanels>
              <TabPanel>
                <div className="flex flex-col px-6 py-2 bg-white rounded-xl w-full mt-6">
                  {/* <p className="font-mono text-md">Transfer</p> */}
                  <Stepper className="mt-3" size="sm" index={activeStep}>
                    {steps.map((step, index) => (
                      <Step key={index}>
                        <StepIndicator>
                          <StepStatus
                            complete={<StepIcon />}
                            incomplete={<StepNumber />}
                            active={<StepNumber />}
                          />
                        </StepIndicator>

                        <Box flexShrink="0">
                          <StepTitle>{step.title}</StepTitle>
                          <StepDescription>{step.description}</StepDescription>
                        </Box>

                        <StepSeparator />
                      </Step>
                    ))}
                  </Stepper>
                  <div className="mt-5 flex flex-col"></div>
                  {activeStep == 0 && page == 0 && (
                    <div>
                      {!checkReceiverData && (
                        <div className="flex flex-col">
                          <div className="mt-5 flex flex-col">
                            <p className="text-md text-gray-600">
                              address of receiver
                            </p>
                            <input
                              type="text"
                              className="px-4 mt-2 py-3 border border-gray-100 rounded-xl w-full"
                              placeholder="Enter address of receiver"
                              onChange={(e) =>
                                // @ts-ignore
                                setReceieverAddress(e.target.value)
                              }
                            ></input>
                          </div>
                          <div className="mt-7 mx-auto">
                            <button
                              onClick={() => {
                                toast.promise(handleGetReceiverData(), {
                                  success: {
                                    title: "Stealth Address Generated",
                                    description:
                                      "Stealth Address has been successfully generated",
                                  },
                                  loading: {
                                    title: "Generating Stealth Address",
                                    description:
                                      "Stealth Address is being generated",
                                  },
                                  error: {},
                                });
                              }}
                              className="px-6 mx-auto flex justify-center py-2 bg-blue-500 text-white text-xl rounded-xl font-semibold border hover:scale-105 hover:bg-white hover:border-blue-500 hover:text-blue-500 duration-200"
                            >
                              Generate Stealth for Receiver
                            </button>
                          </div>
                          <div className="mt-3 flex justify-center text-center mx-auto mb-3">
                            <p className="text-sm text-gray-500 w-2/3 text-center">
                              The identity of the receiver will be masked using
                              the stealth address
                            </p>
                          </div>
                        </div>
                      )}
                      {checkReceiverData && (
                        <div className="flex flex-col">
                          <div className="mt-1 flex flex-col">
                            <p className="text-lg text-center text-blue-600">
                              Addresses Generated
                            </p>
                          </div>
                          <div className="mt-4 flex flex-col">
                            <p className="text-md text-gray-600">
                              Stealth Address
                            </p>
                            <p className="text-lg mt-1 text-gray-600">
                              {stealthAddressData?.stealthAddress}
                            </p>
                          </div>
                          <div className="mt-4 flex flex-col">
                            <p className="text-md text-gray-600">
                              Ephemeral Public Key
                            </p>
                            <p className="text-lg mt-1 text-gray-600">
                              {stealthAddressData?.ephemeralPublicKey.slice(
                                0,
                                15
                              )}
                              ....
                              {stealthAddressData?.ephemeralPublicKey.slice(-5)}
                            </p>
                          </div>
                          <div className="mt-4 flex flex-col">
                            <p className="text-md text-gray-600">View Tag</p>
                            <p className="text-lg mt-1 text-gray-600">
                              {stealthAddressData?.viewTag}
                            </p>
                          </div>
                          <div className="mt-4 flex flex-col">
                            <p className="text-md text-gray-600">
                              Meta Address
                            </p>
                            <p className="text-lg mt-1 text-gray-600">
                              {stealthMetaAddress?.slice(0, 20)}....
                              {stealthMetaAddress?.slice(-15)}
                            </p>
                          </div>
                          <div className="w-full flex mt-6 justify-between">
                            <button className=""></button>
                            <button
                              onClick={() => {
                                setPage((currPage) => currPage + 1);
                                setActiveStep(activeStep + 1);
                              }}
                              className="bg-white border border-blue-500 rounded-xl px-7 py-1 text-lg text-blue-500 font-semibold"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {activeStep == 1 && page == 1 && (
                    <div>
                      {!checkTokenTransfer && (
                        <div className="flex flex-col">
                          <div className="mt-4 flex flex-col">
                            <p className="text-md text-gray-600">
                              Sending Assets to
                            </p>
                            <p className="text-lg mt-1 text-gray-600">
                              {stealthAddressData?.stealthAddress}
                            </p>
                          </div>

                          <div className="mt-5 flex flex-col">
                            <p className="text-md text-gray-600">
                              Transaction Type
                            </p>
                            <RadioGroup
                              value={txType}
                              onChange={(e) => setTxType(e)}
                              className="bg-white h-12 mt-1 rounded-xl px-1 py-0.5 text-md text-blue-500 font-semibold"
                            >
                              <HStack gap={6}>
                                <Radio value="1"> ETH</Radio>
                                <Radio value="2">Token</Radio>
                                <Radio value="3"> NFT</Radio>
                              </HStack>
                            </RadioGroup>
                          </div>

                          <div className="mt-5 flex flex-col">
                            <p className="text-md text-gray-600">
                              Amount / TokenId
                            </p>
                            <div className="flex w-full items-center">
                              <input
                                className="px-4 mt-2 py-3 border border-gray-100 rounded-xl text-2xl w-3/4"
                                placeholder="0"
                                onChange={(e) => setAmount(e.target.value)}
                              ></input>
                            </div>
                            {(txType == "2" || txType == "3") && (
                              <>
                                <p className="text-md text-gray-600 mt-3">
                                  Token Address
                                </p>
                                <div className="flex w-full items-center">
                                  <input
                                    onChange={(e) =>
                                      setTokenAddress(
                                        e.target.value as `0x${string}`
                                      )
                                    }
                                    placeholder="0x..."
                                    className="px-4 mt-2 py-3 border border-gray-100 rounded-xl text-2xl w-3/4"
                                  ></input>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="mt-7 mx-auto">
                            <button
                              onClick={() => {
                                toast.promise(handleTransfer(), {
                                  success: {
                                    title: "Token Transfered",
                                    description:
                                      "Transaction has been successfully completed",
                                  },
                                  loading: {
                                    title: "Transferring Funds",
                                    description:
                                      "Transaction is being processed",
                                  },
                                  error: {},
                                });
                              }}
                              className="px-6 mx-auto flex justify-center py-2 bg-blue-500 text-white text-xl rounded-xl font-semibold border hover:scale-105 hover:bg-white hover:border-blue-500 hover:text-blue-500 duration-200"
                            >
                              Transfer Funds
                            </button>
                          </div>
                          <div className="mt-3 flex justify-center text-center mx-auto mb-3">
                            <p className="text-sm text-gray-500 w-2/3 text-center">
                              The identity of the receiver will be masked using
                              the stealth address
                            </p>
                          </div>
                        </div>
                      )}{" "}
                      {checkTokenTransfer && (
                        <div className="flex flex-col">
                          <div className="mt-1 flex flex-col">
                            <p className="text-lg text-center text-blue-600">
                              Token Transfered
                            </p>
                          </div>
                          <div className="mt-4 flex flex-col">
                            <p className="text-md text-gray-600">
                              Transaction hash
                            </p>
                            <a
                              target="_blank"
                              href={`${chain?.blockExplorers?.default.url}/tx/${transactionHash}`}
                              className="text-lg mt-1 text-gray-600"
                            >
                              {/* {transactionHash.slice(0, 15)}....
                              {transactionHash?.slice(-5)} */}
                              {transactionHash}
                            </a>
                          </div>
                          <div className="w-full flex mt-6 justify-between">
                            <button
                              onClick={() => {
                                setPage((currPage) => currPage - 1);
                                setActiveStep(activeStep - 1);
                                setStealthAddressData(undefined);
                              }}
                              className="bg-white border border-blue-500 rounded-xl px-7 py-1 text-lg text-blue-500 font-semibold"
                            >
                              Prev
                            </button>
                            <button
                              onClick={() => {
                                setPage((currPage) => currPage + 1);
                                setActiveStep(activeStep + 1);
                              }}
                              className="bg-white border border-blue-500 rounded-xl px-7 py-1 text-lg text-blue-500 font-semibold"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {activeStep == 2 && (
                    <div>
                      {!announced ? (
                        <div className="mt-5 flex flex-col">
                          <div className="mx-auto">
                            <button
                              onClick={() => {
                                toast.promise(handleAnnounce(), {
                                  success: {
                                    title: "Stealth Address Announced",
                                    description:
                                      "Stealth Address has been successfully announced",
                                  },
                                  loading: {
                                    title: "Announcing Stealth Address",
                                    description:
                                      "Stealth Address is being announced",
                                  },
                                  error: {},
                                });
                              }}
                              className="px-6 mx-auto flex justify-center py-2 bg-blue-500 text-white text-xl rounded-xl font-semibold border hover:scale-105 hover:bg-white hover:border-blue-500 hover:text-blue-500 duration-200"
                            >
                              Announce Stealth Address
                            </button>
                          </div>
                          <div className="mt-3 flex justify-center text-center mx-auto mb-3">
                            <p className="text-sm text-gray-500 w-2/3 text-center">
                              The identity of the receiver will be masked using
                              the stealth address
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-10 flex flex-col justify-center mx-auto">
                          <div className="mt-1 flex flex-col">
                            <p className="text-lg text-center text-blue-600">
                              Token Transfered successfully to the new stealth
                              address. Share the txHash below
                            </p>
                          </div>
                          <div className="mt-4 flex flex-col">
                            <p className="text-md text-gray-600">
                              Transaction hash
                            </p>
                            <a
                              target="_blank"
                              href={`${chain?.blockExplorers?.default.url}/tx/${transactionHash}`}
                              className="text-lg mt-1 text-gray-600"
                            >
                              {/* {transactionHash.slice(0, 15)}....
                              {transactionHash?.slice(-5)} */}
                              {transactionHash}
                            </a>
                          </div>
                          <CheckCircleIcon className="text-3xl" color="green" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabPanel>
              <TabPanel>
                <div className="flex flex-col px-6 py-2 bg-white rounded-xl w-full mt-6">
                  {/* <p className="font-mono text-md">Transact from your</p> */}
                  <div className="mt-4 flex flex-col">
                    <p className="text-md text-gray-600">
                      Transact from Stealth Address
                    </p>
                    <p className="text-sm mt-1.5 text-gray-600">
                      {stealthAddressData?.stealthAddress}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-col">
                    <p className="text-md text-gray-600">Transaction Type</p>
                    <RadioGroup
                      value={txType}
                      onChange={(e) => setTxType(e)}
                      className="bg-white h-12 mt-1 rounded-xl px-1 py-0.5 text-md text-blue-500 font-semibold"
                    >
                      <HStack gap={6}>
                        <Radio value="1"> ETH</Radio>
                        <Radio value="2">Token</Radio>
                        <Radio value="3"> NFT</Radio>
                        <Radio value="4">Custom</Radio>
                      </HStack>
                    </RadioGroup>
                  </div>

                  <div className="mt-5 flex flex-col">
                    <p className="text-md text-gray-600">Value / TokenId</p>
                    <div className="flex w-full items-center">
                      <input
                        className="px-4 mt-2 py-3 mx-3 border border-gray-100 rounded-xl text-2xl w-1/4"
                        placeholder="0"
                        onChange={(e) => setAmount(e.target.value)}
                      ></input>
                      {/* token address input text*/}
                    </div>
                    {(txType == "2" || txType == "3") && (
                      <>
                        <p className="text-md text-gray-600 mt-3">
                          Token Address
                        </p>
                        <div className="flex w-full items-center">
                          <input
                            onChange={(e) =>
                              setTokenAddress(e.target.value as `0x${string}`)
                            }
                            placeholder="0x..."
                            className="px-4 mt-2 py-3 border border-gray-100 rounded-xl text-2xl w-3/4"
                          ></input>
                        </div>
                      </>
                    )}
                    {txType == "4" && (
                      <>
                        <p className="text-md text-gray-600 mt-3">calldata</p>
                        <div className="flex w-full items-center">
                          <input
                            onChange={(e) =>
                              setCalldata(e.target.value as `0x${string}`)
                            }
                            placeholder="0x..."
                            className="px-4 mt-2 py-3 border border-gray-100 rounded-xl text-2xl w-3/4"
                          ></input>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="mt-5 flex flex-col">
                    <p className="text-md text-gray-600">To</p>
                    <input
                      // @ts-ignore
                      onChange={(e) => setReceieverAddress(e.target.value)}
                      className="px-4 mt-2 py-3 border border-gray-100 rounded-xl w-[420px]"
                      placeholder="Enter address of receiving wallet"
                    ></input>
                  </div>
                  <div className="mt-5 flex flex-col">
                    <p className="text-md text-gray-600">txhash</p>
                    <a
                      target="_blank"
                      href={`${chain?.blockExplorers?.default.url}/tx/${transactionHash}`}
                      className="text-md text-gray-600"
                    >
                      {transactionHash}
                    </a>
                  </div>
                  <div className="mt-7 mx-auto flex flex-col">
                    <button
                      onClick={() => handleSponsoredTransaction()}
                      disabled={stealthCode ? false : true}
                      className={`px-6 py-2 w-full mx-auto bg-blue-500 text-white text-xl rounded-xl font-semibold border ${
                        stealthCode
                          ? "hover:scale-105 hover:bg-white hover:border-blue-500 hover:text-blue-500 duration-200"
                          : "bg-gray-500"
                      }`}
                    >
                      Transact
                    </button>
                    {!stealthCode && <p>Account not upgraded</p>}
                  </div>
                  <div className="mt-3 flex justify-center text-center mx-auto mb-3">
                    <p className="text-sm text-gray-500 w-[300px] text-center">
                      Assets will be withdrawn from Stealth and deposited into
                      the provided wallet addrress. Transactions are sent via
                      pimlico paymaster to your Kernel Smart account
                    </p>
                  </div>
                </div>
              </TabPanel>
              <TabPanel>
                <div className="flex flex-col w-[460px] px-6 py-2 bg-white rounded-xl mt-6">
                  <div className="flex w-full justify-between">
                    <p className="text-md text-gray-600">Stealth Addresses</p>
                    <div className="flex">
                      <p className="mr-2 text-xl">Scan</p>
                      <RepeatIcon
                        className=" cursor-pointer text-2xl"
                        onClick={() => {
                          handleScan();
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-7 flex flex-col">
                    <ul>
                      {announcements &&
                        announcements.map((data) => {
                          return (
                            <li
                              key={data.stealthAddress}
                              className={`${
                                chooseStealthAddress &&
                                "border-blue-500 cursor-pointer"
                              } border px-3 w-full py-1 mt-2 rounded-xl bg-slate-100 cursor-pointer`}
                              onClick={() => {
                                setChooseStealthAddress(data.stealthAddress);
                                setStealthAddressData({
                                  schemeId: 0,
                                  stealthAddress: data.stealthAddress,
                                  ephemeralPublicKey: data.ephemeralPubKey,
                                  viewTag: data.viewTag,
                                });
                                checkStealthAddress(data.stealthAddress);
                              }}
                            >
                              {data.stealthAddress}
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                  <div className="flex flex-col justify-center mx-auto mt-6 w-full">
                    {spendingKey ? (
                      <>
                        <button
                          onClick={() => {
                            if (stealthCode) {
                              handleSwitchToTab(1);
                              setTransactionHash("");
                            } else {
                              toast({
                                title: "Error",
                                // @ts-ignore
                                description: `Stealth Address not upgraded`,
                                status: "error",
                                duration: 5000,
                                isClosable: true,
                              });
                            }
                          }}
                          className="px-6 py-2 w-2/3 mx-auto bg-blue-500 text-white text-xl rounded-xl font-semibold border hover:scale-105 hover:bg-white hover:border-blue-500 hover:text-blue-500 duration-200"
                        >
                          Transact
                        </button>
                        <button
                          onClick={() => {
                            handleRevealStealthKey();
                            onOpen();
                          }}
                          className="px-6 mt-6 py-2 w-2/3 mx-auto bg-blue-500 text-white text-xl rounded-xl font-semibold border hover:scale-105 hover:bg-white hover:border-blue-500 hover:text-blue-500 duration-200"
                        >
                          Reveal key
                        </button>
                        {!stealthCode && (
                          <button
                            onClick={() => {
                              toast.promise(handleAuthorizeUpgrade(), {
                                success: {
                                  title: "Upgrade Authorized",
                                  description:
                                    "Upgrade has been successfully authorized",
                                },
                                loading: {
                                  title: "Authorizing Upgrade",
                                  description: "Upgrade is being authorized",
                                },
                                error: {},
                              });
                            }}
                            className="px-6 mt-6 py-2 w-2/3 mx-auto bg-blue-500 text-white text-xl rounded-xl font-semibold border hover:scale-105 hover:bg-white hover:border-blue-500 hover:text-blue-500 duration-200"
                          >
                            Authorize Upgrade
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          toast.promise(signAndGenerateKey(), {
                            success: {
                              title: "Keys generated",
                              description:
                                "App-specific keys have been successfully generated",
                            },
                            loading: {
                              title: "Generating Keys",
                              description:
                                "Keys are being generated. Please sign the message in your wallet",
                            },
                            error: {},
                          });
                        }}
                        className="px-6 py-2 w-2/3 mx-auto bg-blue-500 text-white text-xl rounded-xl font-semibold border hover:scale-105 hover:bg-white hover:border-blue-500 hover:text-blue-500 duration-200"
                      >
                        Login
                      </button>
                    )}

                    <AlertDialog
                      // @ts-ignore
                      leastDestructiveRef={cancelRef}
                      isOpen={isOpen}
                      onClose={onClose}
                    >
                      <AlertDialogOverlay>
                        <AlertDialogContent>
                          <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Stealth Private Key
                          </AlertDialogHeader>

                          <AlertDialogBody>{stealthKey}</AlertDialogBody>
                          <AlertDialogFooter>
                            {/* @ts-ignore */}
                            <Button ref={cancelRef} onClick={onClose}>
                              Close
                            </Button>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialogOverlay>
                    </AlertDialog>
                  </div>
                </div>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Modal;
