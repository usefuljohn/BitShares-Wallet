# Comparison & Compatibility: BitShares Keychain vs. BeetEOS

This document details the modifications, alignments, and architectural differences between **BitShares Keychain** and the upstream **BeetEOS** client, specifically focusing on PMA (Prediction Market Asset) tool compatibility and general feature parity.

---

## 1. Architectural & Core Alignments

Both wallets share the same database schemas, encryption models, and transaction signing pipelines. The following core components are **functionally identical** (byte-for-byte matches):

*   **`src/lib/blockchains/BitShares.js`**: Core BitShares transaction building and signing.
*   **`src/lib/inject.js`**: Handles injecting transaction requests into the wallet UI.
*   **`src/lib/BeetServer.js`**: Socket server setup for handling incoming socket connections.
*   **`src/store/modules/`** (except `SettingsStore`): Store logic for `AccountStore`, `OriginStore`, `WalletStore`, and `WhitelistStore`.

---

## 2. Deeplink & PMA Compatibility

To prevent OS-level protocol hijacking and registration conflicts when multiple wallets are installed simultaneously:
*   **BeetEOS** registers and handles `beeteos://` and `rawbeeteos://` schemes.
*   **BitShares Keychain** registers and handles **only** its own unique schemes: `bitshares://`, `rawbitshares://`, `vaulta://`, and `rawvaulta://`.
*   Both wallets use the exact same background parser (`_parseDeeplink`) and UI raw-link handler (`raw-link.vue`) to sign and broadcast the payload. Any third-party dApp or tool targeting BitShares Keychain must call it using the `bitshares://` scheme.

---

## 3. Key Enhancements in BitShares Keychain

BitShares Keychain includes critical stability fixes and UX enhancements not present in BeetEOS:

*   **Improved Auto-Lock Timeout**: 
    *   Default inactivity lock-out time extended from **2 minutes to 10 minutes**.
    *   Maximum limit expanded to **120 minutes** (compared to 30 minutes in BeetEOS).
    *   Includes a smart timer formatter (`Xh Ymin` for values $\ge 60$ minutes).
*   **Startup Loading State**: Prevents the alarming "No Wallet Found" flash message on startup by introducing a `loading` guard while local databases initialize.
*   **Robust Deeplink Processing**: Uses `argv.find()` to search command line arguments instead of relying on `argv.at(-1)`, which is fragile and fails under some launch environments.
*   **Platform Bugfix**: Replaced deprecated `.contains()` with `.includes()` in deep link parsing to prevent failures on macOS environments.
*   **Modular Codebase**: Extracted Electron/IPC event listeners from the massive `main-menu.vue` file into a clean composable (`useSigningHandlers.js`).

---

## 4. Omitted Features (BeetEOS Only)

To keep BitShares Keychain streamlined and focused on secure local/deeplink workflows, the following upstream experimental features were intentionally left out:

*   **QR Code Handling**: `qr.vue` and the corresponding `processQR` background handler.
*   **TOTP Authenticator**: `totp.vue`, `totpCode`, and `totpDeeplink` API methods.
*   **dApp Socket.IO Controls**: Manual socket server management buttons (BitShares Keychain auto-starts the Socket.IO server on boot).
