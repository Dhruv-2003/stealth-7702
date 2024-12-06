# Stealth Payments Frontend

This is a **Next.js-based dApp** for interacting with stealth addresses using app-specific keys. It securely processes stealth transactions through a **client-side WASM module** for improved performance and security. The code for the stealth module can be found [here](https://github.com/Dhruv-2003/erc5564-stealth)

---

## **Receiver Instructions**

1. **Register:**

   - Navigate to the dashboard and register yourself.
   - This adds your information to the ERC-6638 registry per spec.

2. **Scan for Stealth Addresses:**

   - Log in by signing a message.
   - Go to the **Scan** tab and click **Scan** to fetch announcements and validate those linked to you.

3. **Manage Stealth Addresses:**

   - Select an address to interact with.
   - Optionally, reveal and export the private key if needed.

4. **Upgrade to Kernel Smart Account:**

   - Authorize the upgrade. Note: Sponsorship for this comes from an internal wallet (mine—so no exploiting!).

5. **Transact:**
   - Use the **Transact** option to open the transfer tab.
   - Choose your transaction type, fill in details, and hit **Transfer**.
   - Transactions are handled via the Pimlico Paymaster and submitted on-chain.

---

## **Sender Instructions**

1. **Transfer Funds:**
   - Go to the **Transfer** tab and proceed as you would in a regular wallet.
   - The app will handle the extra announcement transaction for ERC-5564 (this can be abstracted in future versions).

---

## **Running Locally**

1. Clone the repository:
   ```bash
   git clone <repo_url>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

**Note:**  
This is a demo version, using **app-specific keys** for operations. Please do not use real funds or private keys.

For questions or contributions, feel free to reach out!
