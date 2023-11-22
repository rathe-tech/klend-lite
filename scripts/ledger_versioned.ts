import { Connection, PublicKey, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from "@solana/spl-token";

import Solana from "@ledgerhq/hw-app-solana";
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";

(async () => {
  // Check your derivative address path via the ledger live app.
  const bip32path = "44'/501'";

  const connection = new Connection("https://api.mainnet-beta.solana.com");
  const transport = await TransportNodeHid.create();
  const solana = new Solana(transport);

  // Acquire the hardware wallet address.
  const raw = await solana.getAddress(bip32path);
  const wallet = new PublicKey(raw.address);
  console.log(wallet.toString());

  // Let's create an stSOL token account. You should not have one.
  const mint = new PublicKey("7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj");
  const ata = await getAssociatedTokenAddress(mint, wallet);
  const instruction = createAssociatedTokenAccountInstruction(wallet, ata, wallet, mint);

  // Create and sign a transaction via Ledger.
  const { blockhash } = await connection.getLatestBlockhash();
  const message = new TransactionMessage({
    payerKey: wallet,
    recentBlockhash: blockhash,
    instructions: [instruction]
  });
  const transaction = new VersionedTransaction(message.compileToV0Message());
  const signed = await solana.signTransaction(bip32path, Buffer.from(transaction.message.serialize()));
  transaction.addSignature(wallet, signed.signature);

  // Simulate the transaction is valid.
  const simulated = await connection.simulateTransaction(transaction);
  console.log(simulated);

  // Broadcast the transaction to the blockchain.
  const sig = await connection.sendRawTransaction(transaction.serialize());
  console.log(sig);
})();
