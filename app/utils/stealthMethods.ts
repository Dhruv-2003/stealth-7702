import init, {
  check_stealth,
  get_stealth_meta_address,
  new_stealth_address,
  reveal_stealth_key,
} from "../pkg/stealth_lib.js";

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
