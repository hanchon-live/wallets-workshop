import { useEffect, useState } from "react";
import { addressConverter } from "evmosjs";

declare global {
  interface Window {
    ethereum?: any;
    keplr?: any;
    getOfflineSigner?: any;
  }
}

export async function getKeplrAddress() {
  try {
    await window.keplr.enable("evmos_9001-2");
    const offlineSigner = window.getOfflineSigner("evmos_9001-2");
    const wallets = await offlineSigner.getAccounts();
    return wallets[0].address;
  } catch (e) {
    return "";
  }
}

export async function getMetamaskAddress() {
  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    return accounts[0];
  } catch (e) {
    return "";
  }
}

export async function alertTxResult(response: any) {
  if (response.tx_response.code !== 0) {
    return alert(`Transaction Failed:${response.tx_response.raw_log}`);
  } else {
    return alert(`Transaction sent! ${response.tx_response.txhash}`);
  }
}

export const buttonStyle = "border-green-300 border-2 rounded-lg p-2";

export default function Faucet() {
  const [wallet, setWallet] = useState("");
  const [faucetWalletEvmos, setFaucetWalletEvmos] = useState("");
  const [faucetWalletEth, setFaucetWalletEth] = useState("");
  const [balance, setBalance] = useState("");
  useEffect(() => {
    (async () => {
      const res = await fetch("http://localhost:8080/address");
      const values = await res.json();
      setFaucetWalletEth(values.eth);
      setFaucetWalletEvmos(values.evmos);
    })();

    (async () => {
      const res = await fetch("http://localhost:8080/balance");
      const values = await res.json();
      setBalance(values.balance);
    })();
  });
  return (
    <div className="flex flex-col">
      <div className="flex flex-col w-full text-center p-2">
        <h1>Faucet Wallet:</h1>
        <h2>{faucetWalletEvmos}</h2>
        <h2>{faucetWalletEth}</h2>
        <h1>Balance:</h1>
        <h2>{balance}</h2>
      </div>
      <div className="flex flex-row space-x-7 py-5 mx-auto">
        <button
          className={buttonStyle}
          onClick={async () => {
            const tempWallet = await getMetamaskAddress();
            setWallet(addressConverter.ethToEvmos(tempWallet));
          }}
        >
          Get Address Metamask
        </button>
        <button
          className={buttonStyle}
          onClick={async () => {
            const tempWallet = await getKeplrAddress();
            setWallet(tempWallet);
          }}
        >
          Get Address Keplr
        </button>
      </div>
      <div className="flex flex-col w-full text-center">
        <div className="text-lg">Selected Wallet</div>
        <div>{wallet}</div>
      </div>
      <div className="flex justify-center py-2">
        <button
          className={buttonStyle}
          onClick={async () => {
            const res = await fetch(`http://localhost:8080/faucet/${wallet}`);
            const response = await res.json();
            alertTxResult(response);
          }}
        >
          Request coins
        </button>
      </div>
    </div>
  );
}
