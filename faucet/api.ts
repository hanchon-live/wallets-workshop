import express from "express";
import { Request, Response } from "express";
import cors from "cors";
import { Wallet } from "@ethersproject/wallet";
import { seed } from "./constants";
import { addressConverter, provider, transactions } from "evmosjs";
import {
  broadcast,
  getSender,
  MAINNET_CHAIN,
  MAINNET_FEE,
  signTransactionUsingEIP712,
} from "@hanchon/evmos-ts-wallet";
const app = express();
app.use(cors());

const wallet = Wallet.fromMnemonic(seed);
const denom = "aevmos";
const url = "https://rest.bd.evmos.org:1317";

app.get("/address", async (_, res: Response) => {
  res.send(
    `{"eth":"${wallet.address}","evmos":"${addressConverter.ethToEvmos(
      wallet.address
    )}"}`
  );
});

// Create the balance endpoint
app.get("/balance", async (_, res: Response) => {
  const endpoint = provider.generateEndpointBalanceByDenom(
    addressConverter.ethToEvmos(wallet.address),
    denom
  );

  const balance: provider.BalanceByDenomResponse = await (
    await fetch(`${url}${endpoint}`)
  ).json();

  res.send(`{"balance":"${balance.balance?.amount || "0"} aevmos"}`);
});

// Faucet endpoint
app.get("/faucet/:address", async (req: Request, res: Response) => {
  let address = req.params.address;

  // The address must be in evmos1 format
  if (address.startsWith("0x")) {
    address = addressConverter.ethToEvmos(address);
  }

  // Get our wallet information
  const sender = await getSender(wallet, url);

  // Create the message send params
  const params: transactions.MessageSendParams = {
    destinationAddress: address,
    amount: "10000000000000000",
    denom,
  };

  // Create the transaction
  const tx = transactions.createMessageSend(
    MAINNET_CHAIN,
    sender,
    MAINNET_FEE,
    "workshop faucet",
    params
  );

  // Sign the transaction
  const signedTx = await signTransactionUsingEIP712(
    wallet,
    sender.accountAddress,
    tx,
    MAINNET_CHAIN
  );

  // Broadcast it
  const txRes = await broadcast(signedTx, url);

  res.send(JSON.stringify(txRes));
});

app.listen(8080, () => {
  console.log("server running");
});
