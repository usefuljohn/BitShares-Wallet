# BitShares Wallet

A stand-alone key-manager and transaction signing application for BitShares and EOS-based blockchains.

## Features

- **Secure Key Storage** — Private keys are encrypted locally with your wallet password. Keys never leave your device.
- **Transaction Signing** — Sign transactions via local JSON files or raw deeplinks.
- **Multi-Chain Support** — BitShares (BTS), BTS Testnet, EOS, BEOS, and Telos.
- **Multiple Import Methods** — Cloud password, .bin backup file, memo key, or direct private key import (BitShares). Private key import for EOS chains.
- **Backup & Restore** — Export encrypted wallet backups and restore them on any machine.
- **dApp Management** — View and manage linked decentralized applications.
- **Multi-Language** — Available in 11 languages.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run start

# Build for production
npm run dist
```

## Setting Up with a BitShares Private Active Key

BitShares Wallet stores your private keys locally, encrypted with a wallet password you choose during setup. The **active key** is the authority required to sign transactions (transfers, limit orders, liquidity pool operations, etc.) on the BitShares blockchain.

### Import Methods for BitShares

When you select **BitShares (BTS)** as the chain during the Add Account wizard, three import methods are available:

| Method | What It Does | Grants Active Authority? |
|--------|-------------|--------------------------|
| **Cloud Password** | Derives active, owner, and memo keys from your account name + password | ✅ Yes |
| **Bin Backup File** | Extracts key pairs from a legacy `.bin` wallet backup | ✅ Yes (if the backup contains active keys) |
| **Memo Key Only** | Imports only the memo private key for reading encrypted memos | ❌ No — cannot sign transactions |

### Method 1: Cloud Password (Recommended)

This is the standard method for most BitShares accounts. The wallet derives your private active key deterministically from your cloud password — you never need to handle the raw WIF key directly.

**Steps:**

1. Launch BitShares Wallet and click **"Create a new wallet"** (or **"Add Account"** from the dashboard)
2. Enter a **wallet name** (this is a local label, not your blockchain account name)
3. Select **BitShares (BTS)** as the chain
4. Choose **"Using cloud password"** as the import method
5. Click **Next**
6. Enter your **BitShares account name** (e.g. `my-account`)
7. Enter your **cloud password** — this is the password you set when you created your BitShares account via the web wallet or another client
8. (Optional) Check **"Legacy key mode"** if your account was created with an older wallet that used the active key as the memo key
9. Click **Next**
10. Set a **wallet encryption password** — this encrypts all stored keys on disk
11. Click **Next** to complete the import

**How it works internally:** The wallet derives three keys from your cloud password using the BitShares key derivation convention:

```
active_key  = PrivateKey.fromSeed( accountName + "active" + password )
owner_key   = PrivateKey.fromSeed( accountName + "owner"  + password )
memo_key    = PrivateKey.fromSeed( accountName + "memo"   + password )
```

The wallet then verifies each derived public key against the on-chain account authorities before storing the encrypted private keys locally.

### Method 2: Bin Backup File

If you have a `.bin` wallet backup file exported from the BitShares reference web wallet or another client:

1. Select **"Import .bin file"** as the import method
2. Browse to your `.bin` file and enter the backup password
3. The wallet will decrypt the file, extract all key pairs, and look up matching on-chain accounts
4. Select which accounts to import, then set your wallet encryption password

### Method 3: Memo Key Only

This method imports **only** the memo private key, which allows you to decrypt incoming memo messages but does **not** grant the ability to sign or broadcast transactions. Use this if you only need to read encrypted memos.

### Security Notes

> ⚠️ **Your cloud password IS your private key.** Anyone who knows your account name and cloud password can derive your active and owner keys. Never share your cloud password.

- All private keys are encrypted with AES using your wallet password before being written to the local IndexedDB (via Dexie).
- Keys never leave the device — the wallet signs transactions locally and only broadcasts the signed result.
- If you need to use a **raw WIF private key** (e.g. `5K...`) directly, that workflow is available for EOS-family chains via the "Using private keys" import option. For BitShares, the Cloud Password method is the equivalent — it derives the WIF key internally.
- Always **back up your wallet** from the Settings menu after importing. The backup file is encrypted with your wallet password and can be restored on another machine.

## Deeplink Protocols

BitShares Wallet registers the following protocol handlers for receiving transaction signing requests from external applications:

| Protocol | Chain | Description |
|----------|-------|-------------|
| `bitshares://` | BTS, BTS_TEST | Standard BitShares deeplinks |
| `rawbitshares://` | BTS, BTS_TEST | Raw (unencrypted) BitShares deeplinks |
| `vaulta://` | EOS, BEOS, TLOS | Standard Vaulta/EOS-family deeplinks |
| `rawvaulta://` | EOS, BEOS, TLOS | Raw (unencrypted) Vaulta/EOS-family deeplinks |
| `beeteos://` | EOS, BEOS, TLOS | Legacy BeetEOS-compatible deeplinks |
| `rawbeeteos://` | EOS, BEOS, TLOS | Raw (unencrypted) BeetEOS-compatible deeplinks |
| `beet://` | BTS, BTS_TEST | Legacy Beet-compatible deeplinks |
| `rawbeet://` | BTS, BTS_TEST | Raw (unencrypted) Beet-compatible deeplinks |

#### Deeplink Format

```
rawbitshares://api?chain=BTS&request=ENCODED_JSON
rawvaulta://api?chain=EOS&request=ENCODED_JSON
rawbeeteos://api?chain=EOS&request=ENCODED_JSON
```

The `request` parameter is a URL-encoded JSON object containing the transaction payload. See `src/scripts/EOS/` for example deeplink generation scripts.

## Architecture

| Component | Description |
|-----------|-------------|
| `src/background.js` | Electron main process — IPC handlers, popups, deeplinks |
| `src/preload.js` | Secure IPC bridge between main and renderer |
| `src/components/` | Vue 3 single-file components |
| `src/lib/blockchains/` | Blockchain adapters (BitShares, EOS, BEOS, TLOS) |
| `src/store/` | Vuex state management (Wallet, Account, Settings) |
| `src/translations/` | i18n locale files (11 languages) |

## License

MIT

## Credits

Based on the original [Beet](https://github.com/bitshares/beet) wallet by the BitShares community.

© 2015-2017 Jakub Szwacz
© 2019-2026 usefuljohn
