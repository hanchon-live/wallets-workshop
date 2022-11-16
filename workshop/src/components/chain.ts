import { provider, transactions } from "evmosjs";
import { ENDPOINT_URL } from "./constants";

export async function getSender(address: string, pubkey: string) {
  const walletInfoEndpoint = provider.generateEndpointAccount(address);
  const res = await (
    await fetch(`${ENDPOINT_URL}${walletInfoEndpoint}`)
  ).json();
  const sender: transactions.Sender = {
    accountAddress: address,
    sequence: res.account.base_account.sequence,
    accountNumber: res.account.base_account.account_number,
    pubkey: pubkey,
  };

  return sender;
}
