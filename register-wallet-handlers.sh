#!/bin/bash
set -e

# Directories
PROJECT_DIR="/home/jrc/Downloads/Appimage/DECDEUS/Q4-Apps/BitShares-Wallet-generic"
APPIMAGE_PATH="/home/jrc/Downloads/Appimage/DECDEUS/Q4-Apps/archive/BitShares-Wallet/dist/BitSharesWalletSetup.AppImage"
ELECTRON_PATH="$PROJECT_DIR/node_modules/electron/dist/electron"
ICON_PATH="$PROJECT_DIR/resources/icons/512x512.png"
DESKTOP_FILE="$HOME/.local/share/applications/bitshares-wallet.desktop"

echo "=== BitShares Wallet Deeplink Handler Registration ==="
echo ""

# Choose running target
echo "Choose which version you want to register as the deep link handler:"
echo "1) Packaged AppImage (Recommended)"
echo "   Path: $APPIMAGE_PATH"
echo "2) Development Version (Launches source code via local electron)"
echo "   Command: $ELECTRON_PATH $PROJECT_DIR"
echo ""

# Check non-interactive / parameter fallback
choice="$1"
if [ -z "$choice" ]; then
    read -p "Enter choice [1 or 2]: " choice
fi

if [ "$choice" = "1" ]; then
    if [ ! -f "$APPIMAGE_PATH" ]; then
        echo "Warning: AppImage not found at $APPIMAGE_PATH."
        echo "Please build the AppImage first or choose option 2."
        exit 1
    fi
    EXEC_CMD="$APPIMAGE_PATH %U"
    echo "Registering AppImage..."
elif [ "$choice" = "2" ]; then
    if [ ! -f "$ELECTRON_PATH" ]; then
        echo "Error: Local electron binary not found. Run 'npm install' first."
        exit 1
    fi
    EXEC_CMD="$ELECTRON_PATH $PROJECT_DIR %U"
    echo "Registering Development version..."
else
    echo "Invalid choice. Exiting."
    exit 1
fi

# Create desktop entry
echo "Creating desktop file at $DESKTOP_FILE..."
cat <<EOF > "$DESKTOP_FILE"
[Desktop Entry]
Name=BitShares Wallet
Comment=BitShares Wallet is a stand-alone key-manager and signing app for BitShares and EOS based blockchains.
Exec=$EXEC_CMD
Terminal=false
Type=Application
Icon=$ICON_PATH
MimeType=x-scheme-handler/bitshares;x-scheme-handler/rawbitshares;x-scheme-handler/vaulta;x-scheme-handler/rawvaulta;
Categories=Utility;
StartupWMClass=BitShares Wallet
EOF

chmod +x "$DESKTOP_FILE"

# Register scheme associations in mimeapps.list
MIMEAPPS_LIST="$HOME/.config/mimeapps.list"
echo "Updating MIME associations in $MIMEAPPS_LIST..."

# Ensure [Default Applications] exists
if ! grep -q "\[Default Applications\]" "$MIMEAPPS_LIST"; then
    echo -e "\n[Default Applications]" >> "$MIMEAPPS_LIST"
fi

schemes=(
    "x-scheme-handler/bitshares"
    "x-scheme-handler/rawbitshares"
    "x-scheme-handler/vaulta"
    "x-scheme-handler/rawvaulta"
)

for scheme in "${schemes[@]}"; do
    # Remove existing associations for these schemes to avoid duplicates
    sed -i "\|^$scheme=|d" "$MIMEAPPS_LIST"
    # Insert new association under [Default Applications]
    sed -i "/\[Default Applications\]/a $scheme=bitshares-wallet.desktop" "$MIMEAPPS_LIST"
done

# Update desktop database
echo "Updating desktop database..."
update-desktop-database "$HOME/.local/share/applications/"

echo "Registration complete! The new BitShares Wallet is now configured as the default handler for all deep link schemes."
