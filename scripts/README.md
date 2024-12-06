# Stealth-7702 Scripts

This guide details the manual steps to interact with the **Stealth-7702** project using CLI tools. The process uses the `stealthereum` tool, which can be found [here](https://github.com/kassandraoftroy/stealthereum-cli/tree/main).

---

## **Setup**

### Install Dependencies

```bash
bun install
```

### Run Scripts

```bash
bun run index.ts
```

### Environment Setup

- Clone `.env.example` and add your private keys before proceeding.

---

## **Steps**

### 1. Generate Keypair

**a.** Use `cast` to generate a new keypair:

```bash
cast wallet new
```

This generates:

- **Spending Key**
- **Viewing Key**

**b.** Generate the stealth meta address:

```bash
stealthereum get-meta-address -s SPENDING_KEY -v VIEWING_KEY
```

Example Output:

```plaintext
Stealth Meta Address: 0x02befc9141b10ae4acc8c47492e8cd8dbb658550d577363b6cb916d1d2746554f302befc9141b10ae4acc8c47492e8cd8dbb658550d577363b6cb916d1d2746554f3
```

**c. (Optional)** Register the meta address in the registry:

```bash
cast send 0x6538E6bf4B0eBd30A8Ea093027Ac2422ce5d6538 \
"registerKeys(uint256 schemeId, bytes calldata stealthMetaAddress)" \
"(0,STEALTH_META_ADDRESS)" \
--private-key PRIVATE_KEY \
--rpc-url https://odyssey.ithaca.xyz
```

---

### 2. Generate a Stealth Address

**a.** Generate a new stealth address from your stealth meta address:

```bash
stealthereum stealth-address -r STEALTH_META_ADDRESS
```

Example Output:

```plaintext
schemeId: 0
stealth_address: 0xf1207c2974649fbe782e2c94111df142c3708312
ephemeral_pubkey: 0x027f130cc5ed1bd1e6bc06ea7b6c83c7ec1207bebdc0de23ffec533fb0fcb09769
view_tag: 153
```

**b.** Announce the stealth address:

```bash
cast send 0x55649E01B5Df198D18D95b5cc5051630cfD45564 \
"announce(uint256 schemeId, address stealthAddress, bytes memory ephemeralPubKey, bytes memory metadata)" \
"(0,STEALTH_ADDRESS,EPHEMERAL_PUBKEY,0x99)" \
--private-key PRIVATE_KEY \
--rpc-url https://odyssey.ithaca.xyz
```

---

### 3. Send Funds

Transfer funds to the stealth address:

```bash
cast send STEALTH_ADDRESS \
--value 0.001ether \
--private-key PRIVATE_KEY \
--rpc-url https://odyssey.ithaca.xyz
```

---

### 4. Reveal Stealth Private Key

Reveal the stealth private key if the stealth address matches:

```bash
stealthereum reveal-stealth-key-no-file \
--spendingkey SPENDING_KEY \
--viewingkey VIEWING_KEY \
--stealthaddr STEALTH_ADDRESS \
--ephemeralpub EPHEMERAL_PUBKEY
```

Example Output:

```plaintext
stealth_priv_key: [REDACTED]
```

---

### 5. Upgrade to Kernel Smart Account

**a.** Authorize the stealth address to upgrade to a kernel smart account:

```bash
bun run src/7702/1_authorize.ts
```

**b.** Initialize the smart account in the same transaction.

---

### 6. Transact from Kernel Smart Account

Use the upgraded smart account for transactions. Execute the script:

```bash
bun run src/7702/2_send.ts
```

This demonstrates:

- Gas sponsorship through the **Pimlico Paymaster**.
- Compatibility with ERC-4337 infrastructure.

---

### 7. Automate the Process

Run the `index.ts` script for an end-to-end demonstration:

```bash
bun run index.ts
```

---

## **Additional Notes**

- Testnet: Odyssey (EIP-7702 compatible).
- Refer to the [stealthereum CLI](https://github.com/kassandraoftroy/stealthereum-cli/tree/main) for more information.
