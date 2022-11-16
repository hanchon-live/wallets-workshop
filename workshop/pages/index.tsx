import Head from "next/head";
import Faucet from "../src/components/faucet";
import MsgSend from "../src/components/msgsend";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className="bg-gray-700 text-white">
      <Head>
        <title>Wallet workshop</title>
        <meta name="description" content="Evmosjs example" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Wallet workshop</h1>
        <Faucet />
        <MsgSend />
      </main>
    </div>
  );
}
