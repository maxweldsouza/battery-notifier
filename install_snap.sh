cd electron || exit
ts-node ./.erb/scripts/clean.js dist && npm run build
cd ..
snapcraft -v
sudo snap remove battery-notifier
sudo snap install battery-notifier_0.2.1_amd64.snap --dangerous
snap run battery-notifier
