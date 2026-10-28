#!/usr/bin/env bash
set -e
DIR="/home/samudra/Projects/VisualSCode/VisualCode/PharmaVigil/scratch/screenshots/detail-views"
mkdir -p "$DIR"

PAGES=(
  "pharmacist_extract:http://localhost:3000/pharmacist/cases/case_rx_9021_01/extract"
  "pharmacist_results:http://localhost:3000/pharmacist/cases/case_rx_9021_01/results"
  "doctor_triage_task:http://localhost:3000/doctor/tasks/alert_ddi_001"
  "doctor_prescription_new:http://localhost:3000/doctor/prescriptions/new"
  "patient_prescription_detail:http://localhost:3000/patient/prescriptions/case_rx_9021_01"
)

for ITEM in "${PAGES[@]}"; do
  NAME=$(echo "$ITEM" | cut -d':' -f1)
  URL=$(echo "$ITEM" | cut -d':' -f2-)
  FILE="$DIR/${NAME}.png"
  echo "Capturing $NAME from $URL..."
  firefox --headless --window-size=1280,900 --screenshot="$FILE" "$URL" 2>/dev/null || true
done

echo "Detail capture complete:"
ls -lh "$DIR"
