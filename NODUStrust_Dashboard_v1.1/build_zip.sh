#!/usr/bin/env bash
set -euo pipefail
ZIP_NAME="NODUStrust_Dashboard_v1.1.zip"
ROOT_DIR="NODUStrust_Dashboard_v1.1"

if ! command -v zip >/dev/null 2>&1; then
  echo "zip command not found — please install zip. On mac: brew install zip; on debian: sudo apt install zip"
  exit 2
fi

zip -r "$ZIP_NAME" "$ROOT_DIR"

echo "Created $ZIP_NAME"
