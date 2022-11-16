import { addressConverter, transactions } from "evmosjs";
import { useState } from "react";
import { alertTxResult, buttonStyle } from "./faucet";
import { getMetamaskSender, signAndBroadcastWithMetamask } from "./metamask";
import { MAINNET_CHAIN, MAINNET_FEE } from "./constants";
import { getKeplrSender, signAndBroadcastKeplr } from "./keplr";

export default function MsgSend() {
  const [dest, setDest] = useState("");
  const [amount, setAmount] = useState("1000000000000000");
  const [sender, setSender] = useState<transactions.Sender>({
    accountAddress: "",
    accountNumber: 0,
    sequence: 0,
    pubkey: "",
  });
  const [walletProvider, setWalletProvider] = useState("");

  async function createTransaction() {
    if (dest === "" || amount === "" || sender.accountAddress === "") {
      alert("Please select your wallet and set the inputs");
      return;
    }

    let destInEvmosFormat = dest;
    if (dest.startsWith("0x")) {
      destInEvmosFormat = addressConverter.ethToEvmos(dest);
    }

    const params: transactions.MessageSendParams = {
      destinationAddress: destInEvmosFormat,
      amount: amount,
      denom: "aevmos",
    };

    return transactions.createMessageSend(
      MAINNET_CHAIN,
      sender,
      MAINNET_FEE,
      "workshop transaction",
      params
    );
  }

  return (
    <div className="w-full p-10 text-center">
      <h1 className="text-lg pt-10">Message Send</h1>
      <div className="flex flex-col text-center">
        <span>Sender:</span>
        <span>{sender.accountAddress}</span>
        <span>{sender.sequence}</span>
      </div>

      <div className="flex flex-row space-x-2 justify-center mt-2">
        <button
          className={buttonStyle}
          onClick={async () => {
            setSender(await getMetamaskSender());
            setWalletProvider("metamask");
          }}
        >
          Use Metamask
        </button>
        <button
          className={buttonStyle}
          onClick={async () => {
            setSender(await getKeplrSender());
            setWalletProvider("keplr");
          }}
        >
          Use Keplr
        </button>
      </div>

      <form className="flex flex-col w-full">
        <input
          className="text-black w-full my-2 rounded-md p-2"
          type="text"
          placeholder="0x.../evmos1..."
          value={dest}
          onChange={(e) => {
            setDest(e.target.value);
          }}
        />

        <div className="flex flex-row space-x-2 my-auto">
          <input
            className="text-black w-full rounded-md p-2"
            type="text"
            placeholder="10000"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
            }}
          />
          <span className="py-2">aevmos</span>
        </div>

        <button
          className={`${buttonStyle} mt-2`}
          onClick={async (e) => {
            e.preventDefault();
            let tx = await createTransaction();
            if (tx) {
              if (walletProvider === "metamask") {
                alertTxResult(await signAndBroadcastWithMetamask(sender, tx));
              } else {
                alertTxResult(await signAndBroadcastKeplr(sender, tx));
              }
            }
          }}
        >
          Send Transaction
        </button>
      </form>
    </div>
  );
}
