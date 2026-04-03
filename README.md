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

### Deeplink Protocols

BitShares Wallet registers the following protocol handlers for receiving transaction signing requests from external applications:

| Protocol | Chain | Description |
|----------|-------|-------------|
| `bitshares://` | BTS, BTS_TEST | Standard BitShares deeplinks |
| `rawbitshares://` | BTS, BTS_TEST | Raw (unencrypted) BitShares deeplinks |
| `vaulta://` | EOS, BEOS, TLOS | Standard Vaulta/EOS-family deeplinks |
| `rawvaulta://` | EOS, BEOS, TLOS | Raw (unencrypted) Vaulta/EOS-family deeplinks |

#### Deeplink Format

```
rawbitshares://api?chain=BTS&request=ENCODED_JSON
rawvaulta://api?chain=EOS&request=ENCODED_JSON
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
