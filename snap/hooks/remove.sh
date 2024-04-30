#!/bin/bash

# Destination path
destinationPath="$SNAP_USER_DATA/.config/autostart/battery-notifier.desktop"

# Check if the file exists and remove it
if [ -f "$destinationPath" ]; then
  rm "$destinationPath"
fi
