// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { exec } from "child_process";
// import {} from "../../binary/stealthereum"

const cliPath = "../../../backend/Stealthereum-cli/target/release/stealthereum";

const getMetaAddress = (spendingKey: string, viewingKey: string) => {
  //  "stealthereum get-meta-address -s 0x6d2f70a47ddf455feb6a785b9787265f28897546bd1316224300aed627ef8cfc -v 0xa2e9f98f845bb6a8d2db0a2a17a9d185fc97afd1b7949983ee367f9f08a5e0b7"
  const command = `${cliPath} get-meta-address -s ${spendingKey} -v ${viewingKey}`;
  exectueCommand(command);
};

const exectueCommand = (command: string) => {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`Error output: ${stderr}`);
      return;
    }

    const result = stdout.trim();
    console.log(`Output: ${result}`);
  });
};

// import  {} from '../../../backend/Stealth_server'
type Data = {
  name: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method != "POST") return res.status(405).send("Method Not Allowed");

  // const {} = req.body;

  try {
    getMetaAddress(
      "0x6d2f70a47ddf455feb6a785b9787265f28897546bd1316224300aed627ef8cfc",
      "0xa2e9f98f845bb6a8d2db0a2a17a9d185fc97afd1b7949983ee367f9f08a5e0b7"
    );

    const result = "";
    console.log(result);

    // we'll have to see if we want to run the Thread and produce the output
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: "Result undefined" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
}
