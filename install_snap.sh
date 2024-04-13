ts-node ./.erb/scripts/clean.js dist && npm run build
npx electron-packager release/app battery-notifier --overwrite --platform=linux --output=release/build --prune=true --out=out
snapcraft -v
sudo snap remove battery-notifier
sudo snap install battery-notifier_0.1.0_amd64.snap --dangerous
snap run battery-notifier
