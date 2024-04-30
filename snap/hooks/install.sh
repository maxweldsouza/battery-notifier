#!/bin/bash

# Source and destination paths
sourcePath="$SNAP/snap/gui/battery-notifier.desktop"
destinationPath="$SNAP_USER_DATA/.config/autostart/battery-notifier.desktop"

# Create destination directory if it doesn't exist
mkdir -p "$(dirname "$destinationPath")"

# Check if the destination file does not exist and copy the source file to the destination
if [ ! -f "$destinationPath" ]; then
  cp "$sourcePath" "$destinationPath"
fi
