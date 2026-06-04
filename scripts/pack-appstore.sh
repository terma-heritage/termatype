#!/bin/bash
set -e

APP_NAME="TermaType"
IDENTIFIER="org.terma.termatype"
TEAM_ID="ETM8V4BA5N"
# Mac Installer Distribution certificate — create in Apple Developer portal if not yet done
INSTALLER_CERT="3rd Party Mac Developer Installer: Thupten Chakrishar (${TEAM_ID})"

echo "==> Building Tauri app for Mac App Store (universal binary)..."
npm run tauri -- build --bundles app --target universal-apple-darwin \
  --config src-tauri/tauri.appstore.conf.json

APP_PATH="src-tauri/target/universal-apple-darwin/release/bundle/macos/${APP_NAME}.app"

if [ ! -d "$APP_PATH" ]; then
  echo "ERROR: App bundle not found at $APP_PATH"
  exit 1
fi

echo "==> Creating signed .pkg installer..."
xcrun productbuild \
  --sign "$INSTALLER_CERT" \
  --component "$APP_PATH" /Applications \
  "${APP_NAME}.pkg"

echo "==> Done! Created ${APP_NAME}.pkg"
echo ""
echo "To upload to App Store Connect:"
echo "  xcrun altool --upload-app --type macos --file \"${APP_NAME}.pkg\" \\"
echo "    --apiKey \$APPLE_API_KEY_ID --apiIssuer \$APPLE_API_ISSUER"
echo ""
echo "Or drag ${APP_NAME}.pkg into Transporter.app"
