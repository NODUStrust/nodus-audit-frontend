#!/usr/bin/env bash
set -euo pipefail
MSG=${1:-"Audit sync"}

if [ ! -d .git ]; then
  git init
  git add .
  git commit -m "Initial scaffold"
  echo "Initialized git repo (local). Add remote and push if desired."
else
  git add .
  git commit -m "$MSG" || echo "No changes to commit"
fi
