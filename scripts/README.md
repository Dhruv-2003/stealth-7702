# stealth-7702

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.22. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

# Steps

1a . `cast wallet new` - to generate a new keypair which is gonna be the spending key and viewing key

Address: 0xA7629E521ac756dbB1914F87476954a0643a1A65
Private key:

1b .`target/debug/stealthereum get-meta-address -s SPENDING_KEY -v VIEWING_KEY ` to generate the stealth meta address for this account

Stealth Meta address : 0x02befc9141b10ae4acc8c47492e8cd8dbb658550d577363b6cb916d1d2746554f302befc9141b10ae4acc8c47492e8cd8dbb658550d577363b6cb916d1d2746554f3

2a . `target/release/stealthereum stealth-address -r STEALTH_META_ADDRESS` to get a new stealth address for this stealth-meta address, and this will also give ephemeral_pubkey as well as tags

schemeId:0|stealth_address:0xf1207c2974649fbe782e2c94111df142c3708312|ephepmeral_pubkey:0x027f130cc5ed1bd1e6bc06ea7b6c83c7ec1207bebdc0de23ffec533fb0fcb09769|view_tag:153

3. `cast send 0x9D0CF5672A4FFfaa6BA58DB070Ae1Da8D0F130af "announce(uint256 schemeId,address stealthAddress,bytes memory ephemeralPubKey,bytes memory metadata)" "(0,0xf1207c2974649fbe782e2c94111df142c3708312,0x027f130cc5ed1bd1e6bc06ea7b6c83c7ec1207bebdc0de23ffec533fb0fcb09769,0x99)" --private-key PRIVATE_KEY  --rpc-url https://odyssey.ithaca.xyz` to annouce the newly used stealth address and allowing the recipient to recover funds

4. `cast send 0xf1207c2974649fbe782e2c94111df142c3708312 --value 0.001ether --private-key PRIVATE_KEY  --rpc-url https://odyssey.ithaca.xyz` to send funds to the new stealth account on odyssey testnet for now, as EIP7702 is available here

5. `target/release/stealthereum reveal-stealth-key-no-file --spendingkey ${spendingKey} --viewingkey ${viewingKey} --stealthaddr ${stealthAddress} --ephemeralpub ${ephemeralPublicKey}` to reveal the stealth addres in case it's a match

stealth_priv_key :

NOTE : Don't forget to clone .env.example and add your private keys before proceeding

6. `bun run 1_authorize.ts` to sign the authorisation to upgrade the stealth EOA to a kernel smart account i.e. ERC4337 implementation done by Zero Dev, along with initialising it in the same tx

7. `bun run 2_send.ts` that shows once the account is a smart account, it can be just used out of the box with current ERC4337 infra using the bundler and paymaster for the tx, so gas sponsorship is being used here

## Issues

- The one issue I can think of here is the issue about the initialisation of the smart account and almost all implementation needs this to be done which is not right, as in theory somebody could just use the authorisation along with some other init parameters and totally front run the tx for upgrade, resulting in a direct takeover of account depending on the type of implementation for the smart account.
