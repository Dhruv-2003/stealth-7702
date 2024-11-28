// "spendingKey": "0x6d2f70a47ddf455feb6a785b9787265f28897546bd1316224300aed627ef8cfc",
// "viewingKey": "0xa2e9f98f845bb6a8d2db0a2a17a9d185fc97afd1b7949983ee367f9f08a5e0b7",
// "metaAddress": "0x02f868433a12a9d57e355176a00ee6b5c80ed1fe2c939d81062e0251081994f039022290fba566a42824f283e54582fc4fefb0767f04551c748aa8bd8b66bef677cf",
// "stealthAddress": "0x084c53dad73b23f7d709fdcc2edbe5caa44bccce",
import init, {
  check_stealth,
  get_stealth_meta_address,
  new_stealth_address,
  reveal_stealth_key,
} from "../../pkg/stealth_lib.js";

const getStealthMetaAddress = async (
  spendingKey: string,
  viewingKey: string
): Promise<string | undefined> => {
  try {
    await init();
    const stealthMetaAddress = get_stealth_meta_address(
      spendingKey,
      viewingKey
    );

    return stealthMetaAddress;
  } catch (error) {
    console.log(error);
  }
};

const getStealthAddress = async (
  metaAddress: string
): Promise<
  | {
      schemeId: string;
      stealthAddress: `0x${string}`;
      ephemeralPublicKey: string;
      viewTag: number;
    }
  | undefined
> => {
  try {
    await init();

    const output = new_stealth_address(metaAddress) as {
      schemeId: string;
      stealthAddress: `0x${string}`;
      ephemeralPublicKey: string;
      viewTag: number;
    };

    console.log(output);
    return output;
  } catch (error) {
    console.log(error);
  }
};

const revealStealthKey = async (
  spendingKey: string,
  viewingKey: string,
  stealthAddress: string,
  ephemeralPublicKey: string
): Promise<string | undefined> => {
  try {
    await init();
    const stealthKey = reveal_stealth_key(
      spendingKey,
      viewingKey,
      stealthAddress,
      ephemeralPublicKey
    );
    return stealthKey;
  } catch (error) {
    console.log(error);
  }
};

const checkStealth = async (
  spendingKey: string,
  viewingKey: string,
  stealthAddress: string,
  ephemeralPublicKey: string,
  viewTag: number
): Promise<Boolean | undefined> => {
  try {
    await init();
    const check = check_stealth(
      stealthAddress,
      ephemeralPublicKey,
      viewingKey,
      spendingKey,
      viewTag
    );
    return check;
  } catch (error) {
    console.log(error);
  }
};

export {
  getStealthMetaAddress,
  getStealthAddress,
  revealStealthKey,
  checkStealth,
};
