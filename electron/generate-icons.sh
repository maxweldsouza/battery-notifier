#!/bin/bash

# Check if an argument is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <path_to_png_image>"
    exit 1
fi

INPUT_IMAGE="$1"
BASE_DIRECTORY=$(dirname "$INPUT_IMAGE")
ASSETS_DIR="${BASE_DIRECTORY}/icons"
BASENAME=$(basename "$INPUT_IMAGE" .png)

# Create the assets/icons directory if it doesn't exist
mkdir -p "$ASSETS_DIR"

# Define the sizes
SIZES=(1024 512 256 128 96 64 48 32 24 16)

# Loop through the sizes and generate the resized images in assets/icons/
for SIZE in "${SIZES[@]}"; do
    OUTPUT_IMAGE="${ASSETS_DIR}/${SIZE}x${SIZE}.png"
    convert "$INPUT_IMAGE" -resize "${SIZE}x${SIZE}" "$OUTPUT_IMAGE"
    echo "Generated ${OUTPUT_IMAGE}"
done
