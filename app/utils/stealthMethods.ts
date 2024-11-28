import init, {
  check_stealth,
  get_stealth_meta_address,
  new_stealth_address,
  reveal_stealth_key,
} from "../pkg/stealth_lib.js";

export const getStealthMetaAddress = async (
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

export type StealthAddressData = {
  schemeId: number;
  stealthAddress: `0x${string}`;
  ephemeralPublicKey: `0x${string}`;
  viewTag: number;
};

export const getNewStealthAddress = async (
  metaAddress: string
): Promise<StealthAddressData | undefined> => {
  try {
    await init();

    const output = new_stealth_address(metaAddress);
    console.log(output);

    const data: StealthAddressData = {
      schemeId: output.scheme_id,
      stealthAddress: output.address,
      ephemeralPublicKey: output.ephemeral_pubkey,
      viewTag: output.view_tag,
    };

    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const revealStealthKey = async (
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

export const checkStealth = async (
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
