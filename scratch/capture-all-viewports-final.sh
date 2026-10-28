#!/usr/bin/env bash
set -e
DIR="/home/samudra/Projects/VisualSCode/VisualCode/PharmaVigil/scratch/screenshots/final-pass"
mkdir -p "$DIR"

PORTALS=("pharmacist" "doctor" "patient" "admin")
VIEWPORTS=(
  "360,640"
  "390,844"
  "768,1024"
  "900,800"
  "1024,768"
  "1280,850"
  "1440,900"
)

echo "Capturing all 7 viewports across all 4 portals..."
for VP in "${VIEWPORTS[@]}"; do
  W=$(echo "$VP" | cut -d',' -f1)
  H=$(echo "$VP" | cut -d',' -f2)
  for P in "${PORTALS[@]}"; do
    FILE="$DIR/${P}_${W}px.png"
    echo "Capturing $P at ${W}x${H}..."
    firefox --headless --window-size="$W,$H" --screenshot="$FILE" "http://localhost:3000/$P" 2>/dev/null || true
  done
done

echo "Capturing key detail views at 900px and 1280px..."
firefox --headless --window-size=900,800 --screenshot="$DIR/extract_900px.png" "http://localhost:3000/pharmacist/cases/case_rx_9021_01/extract" 2>/dev/null || true
firefox --headless --window-size=1280,850 --screenshot="$DIR/extract_1280px.png" "http://localhost:3000/pharmacist/cases/case_rx_9021_01/extract" 2>/dev/null || true
firefox --headless --window-size=900,800 --screenshot="$DIR/results_900px.png" "http://localhost:3000/pharmacist/cases/case_rx_9021_01/results" 2>/dev/null || true
firefox --headless --window-size=1280,850 --screenshot="$DIR/results_1280px.png" "http://localhost:3000/pharmacist/cases/case_rx_9021_01/results" 2>/dev/null || true

echo "All captures complete:"
ls -lh "$DIR"
