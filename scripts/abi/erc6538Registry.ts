export const erc6538RegistryAbi = [
  { type: "constructor", inputs: [], stateMutability: "nonpayable" },
  {
    type: "function",
    name: "DOMAIN_SEPARATOR",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "ERC6538REGISTRY_ENTRY_TYPE_HASH",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "incrementNonce",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "nonceOf",
    inputs: [{ name: "registrant", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "registerKeys",
    inputs: [
      { name: "schemeId", type: "uint256", internalType: "uint256" },
      {
        name: "stealthMetaAddress",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "registerKeysOnBehalf",
    inputs: [
      { name: "registrant", type: "address", internalType: "address" },
      { name: "schemeId", type: "uint256", internalType: "uint256" },
      { name: "signature", type: "bytes", internalType: "bytes" },
      {
        name: "stealthMetaAddress",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "stealthMetaAddressOf",
    inputs: [
      { name: "registrant", type: "address", internalType: "address" },
      { name: "schemeId", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bytes", internalType: "bytes" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "NonceIncremented",
    inputs: [
      {
        name: "registrant",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "newNonce",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "StealthMetaAddressSet",
    inputs: [
      {
        name: "registrant",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "schemeId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "stealthMetaAddress",
        type: "bytes",
        indexed: false,
        internalType: "bytes",
      },
    ],
    anonymous: false,
  },
  {
    type: "error",
    name: "ERC6538Registry__InvalidSignature",
    inputs: [],
  },
] as const;
