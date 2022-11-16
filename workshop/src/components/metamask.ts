import { signatureToPubkey } from "@hanchon/signature-to-pubkey";
import { addressConverter, provider, transactions } from "evmosjs";
import { getSender } from "./chain";
import { MAINNET_CHAIN, ENDPOINT_URL } from "./constants";
import { getMetamaskAddress } from "./faucet";

export async function getMetamaskSender() {
  const mmAddress = await getMetamaskAddress();

  const address = addressConverter.ethToEvmos(mmAddress);
  const signature = await window.ethereum.request({
    method: "personal_sign",
    params: [mmAddress, "generate_pubkey"],
  });
  const message = Buffer.from([
    50, 215, 18, 245, 169, 63, 252, 16, 225, 169, 71, 95, 254, 165, 146, 216,
    40, 162, 115, 78, 147, 125, 80, 182, 25, 69, 136, 250, 65, 200, 94, 178,
  ]);
  const pubkey = signatureToPubkey(signature, message);

  return getSender(address, pubkey);
}

export async function signAndBroadcastWithMetamask(
  sender: transactions.Sender,
  tx: transactions.TxGenerated
) {
  // EIP712
  const signature = await window.ethereum.request({
    method: "eth_signTypedData_v4",
    params: [
      addressConverter.evmosToEth(sender.accountAddress),
      JSON.stringify(tx.eipToSign),
    ],
  });

  const extension = transactions.signatureToWeb3Extension(
    MAINNET_CHAIN,
    sender,
    signature
  );

  const txToBroadcast = transactions.createTxRawEIP712(
    tx.legacyAmino.body,
    tx.legacyAmino.authInfo,
    extension
  );

  const postOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: provider.generatePostBodyBroadcast(txToBroadcast),
  };

  let broadcastPost = await fetch(
    `${ENDPOINT_URL}${provider.generateEndpointBroadcast()}`,
    postOptions
  );

  return await broadcastPost.json();
}
