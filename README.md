# Stealth Address Experiment with EIP-7702

This repository is a **demo application** showcasing the use of **stealth addresses** and **EIP-7702** to improve privacy and usability in Ethereum transactions. The approach demonstrates how recipients can maintain privacy while enabling transactions from new stealth accounts using **smart account upgrades**.

NOTE: Only live on Odyssey network. Can obtain test funds from [here](https://odyssey-fba0638ec5f46615.testnets.rollbridge.app/)

**[Live Demo](https://youtu.be/YGspcdghsqo)**

---

## **About the Experiment**

### **What are Stealth Addresses?**

Stealth addresses are a privacy-preserving mechanism that allows to transfer funds to a **unique, new** account for recipient. The recipient can then claim ownership of this account using their **main account keys** without exposing any public links.

---

### **The Challenge**

A common issue with stealth addresses is the need for **gas** to move assets out of the new stealth account. Sending ETH from the main wallet creates a **public link** between accounts, compromising privacy. Solutions like **gas ticketing** are in development.

---

### **How EIP-7702 Helps**

EIP-7702 introduces a significant improvement:

- It allows upgrading a stealth account to a **Kernel Smart Account** (ERC-4337-compatible).
- The upgrade enables the use of **ERC-4337 infrastructure** for gas sponsorship, eliminating the need for ETH in the stealth account while maintaining **complete privacy**. Currently uses Pimlico as a paymaster

---

## **Repository Structure**

### **`app/`**

The frontend demo built with **Next.js**, showcasing the complete stealth address flow:

- User registration and scanning for stealth addresses.
- Authorization and transaction execution using smart accounts.

📖 Refer to the [App README](./app/README.md) for setup and usage.

---

### **`scripts/`**

CLI tools for manual interaction with stealth addresses, including:

- Generating stealth meta addresses.
- Announcing stealth addresses.
- Upgrading to smart accounts and executing transactions.

📖 Refer to the [Scripts README](./scripts/README.md) for detailed steps.

---

## **Important Notes**

- **Demo Purpose Only**: Do **not** use real funds with this application.
- For questions or discussions, feel free to reach out on Twitter: [@0xdhruva](https://twitter.com/0xdhruva).
- This is a **simple implementation** of stealth addresses and EIP-7702. Further improvements and refinements are possible.
- It follows the [ERC5564](https://eips.ethereum.org/EIPS/eip-5564) & [ERC6538](https://eips.ethereum.org/EIPS/eip-6538)

## **References**

- [Smart-EOA by Destiner](https://github.com/Destiner/smart-eoa/tree/main)
- [erc5564-stealth](https://github.com/Dhruv-2003/erc5564-stealth)

---

Thank you for exploring this experiment! 🚀
