#!/usr/bin/env bash
set -e
DIR="/home/samudra/Projects/VisualSCode/VisualCode/PharmaVigil/scratch/screenshots/viewport-audit"
mkdir -p "$DIR"

ROUTES=("pharmacist" "doctor" "patient" "admin")
VIEWPORTS=("360,640" "390,844" "768,1024" "1024,768" "1280,800" "1440,900")

for VP in "${VIEWPORTS[@]}"; do
  W=$(echo $VP | cut -d',' -f1)
  H=$(echo $VP | cut -d',' -f2)
  for R in "${ROUTES[@]}"; do
    FILE="$DIR/${R}_${W}px.png"
    firefox --headless --window-size="$W,$H" --screenshot="$FILE" "http://localhost:3000/$R" 2>/dev/null || true
  done
done
echo "Capture complete."
ls -lh "$DIR"
