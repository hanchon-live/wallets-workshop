import { proto, provider, transactions } from "evmosjs";
import { getSender } from "./chain";
import { ENDPOINT_URL, MAINNET_CHAIN } from "./constants";
import { getKeplrAddress } from "./faucet";

export async function getKeplrSender() {
  const address = await getKeplrAddress();

  const offlineSigner = window.getOfflineSigner(MAINNET_CHAIN.cosmosChainId);
  const wallets = await offlineSigner.getAccounts();
  const pubkey = Buffer.from(wallets[0].pubkey).toString("base64");

  return getSender(address, pubkey);
}

export async function signAndBroadcastKeplr(
  sender: transactions.Sender,
  tx: transactions.TxGenerated
) {
  // SignDirect
  await window.keplr.enable(MAINNET_CHAIN.cosmosChainId);
  const sign: {
    signed: {
      bodyBytes: Uint8Array;
      authInfoBytes: Uint8Array;
    };
    signature: {
      signature: string;
    };
  } = await window.keplr.signDirect(
    MAINNET_CHAIN.cosmosChainId,
    sender.accountAddress,
    {
      bodyBytes: tx.signDirect.body.serializeBinary(),
      authInfoBytes: tx.signDirect.authInfo.serializeBinary(),
      chainId: MAINNET_CHAIN.cosmosChainId,
      accountNumber: sender.accountNumber,
    },
    { isEthereum: true }
  );

  const txToBroadcast = proto.createTxRaw(
    sign.signed.bodyBytes,
    sign.signed.authInfoBytes,
    [new Uint8Array(Buffer.from(sign.signature.signature, "base64"))]
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
