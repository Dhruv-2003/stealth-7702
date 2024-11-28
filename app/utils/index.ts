import { Config } from "wagmi";
import { retrieveAnnouncements } from "./contractMethods";
import { checkStealth } from "./stealthMethods";
import { hexToNumber } from "viem";

type ScanAnnouncementsParams = {
  spendingKey: `0x${string}`;
  viewingKey: `0x${string}`;
};

export type Announcement = {
  caller: `0x${string}`;
  stealthAddress: `0x${string}`;
  metadata: `0x${string}`;
  ephemeralPubKey: `0x${string}`;
  viewTag: number;
};

export const scanAnnouncements = async (
  config: Config,
  params: ScanAnnouncementsParams
) => {
  const announcementLogs = await retrieveAnnouncements(config);
  console.log(announcementLogs);

  if (!announcementLogs) {
    throw new Error("Failed to retrieve announcements");
  }

  const checkedAnnouncements = await announcementLogs.filter(
    async (announcement) => {
      if (
        !announcement.args.stealthAddress ||
        !announcement.args.metadata ||
        !announcement.args.ephemeralPubKey
      ) {
        console.log("Invalid announcement");
        return false;
      }

      return await checkStealth(
        params.spendingKey,
        params.viewingKey,
        announcement.args.stealthAddress,
        announcement.args.ephemeralPubKey,
        hexToNumber(announcement.args.metadata)
      );
    }
  );

  // Only need the args from the announcement logs for which args are present, otherwise it's an invalid announcement
  const validAnnouncements = checkedAnnouncements.map((announcement) => {
    return {
      caller: announcement.args.caller!,
      stealthAddress: announcement.args.stealthAddress!,
      metadata: announcement.args.metadata!,
      ephemeralPubKey: announcement.args.ephemeralPubKey!,
      viewTag: hexToNumber(announcement.args.metadata!),
    };
  });

  return validAnnouncements;
};
