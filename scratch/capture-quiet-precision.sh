#!/usr/bin/env bash
set -e
DIR="/home/samudra/Projects/VisualSCode/VisualCode/PharmaVigil/scratch/screenshots/quiet-precision"
mkdir -p "$DIR"

echo "Capturing Desktop viewports (1280x850)..."
firefox --headless --window-size=1280,850 --screenshot="$DIR/desktop_home.png" "http://localhost:3000" 2>/dev/null || true
firefox --headless --window-size=1280,850 --screenshot="$DIR/desktop_pharmacist.png" "http://localhost:3000/pharmacist" 2>/dev/null || true
firefox --headless --window-size=1280,850 --screenshot="$DIR/desktop_doctor.png" "http://localhost:3000/doctor" 2>/dev/null || true
firefox --headless --window-size=1280,850 --screenshot="$DIR/desktop_patient.png" "http://localhost:3000/patient" 2>/dev/null || true
firefox --headless --window-size=1280,850 --screenshot="$DIR/desktop_admin.png" "http://localhost:3000/admin" 2>/dev/null || true
firefox --headless --window-size=1280,850 --screenshot="$DIR/desktop_extract.png" "http://localhost:3000/pharmacist/cases/case_rx_9021_01/extract" 2>/dev/null || true
firefox --headless --window-size=1280,850 --screenshot="$DIR/desktop_results.png" "http://localhost:3000/pharmacist/cases/case_rx_9021_01/results" 2>/dev/null || true
firefox --headless --window-size=1280,850 --screenshot="$DIR/desktop_triage.png" "http://localhost:3000/doctor/tasks/alert_ddi_001" 2>/dev/null || true

echo "Capturing Mobile viewports (390x844)..."
firefox --headless --window-size=390,844 --screenshot="$DIR/mobile_pharmacist.png" "http://localhost:3000/pharmacist" 2>/dev/null || true
firefox --headless --window-size=390,844 --screenshot="$DIR/mobile_doctor.png" "http://localhost:3000/doctor" 2>/dev/null || true
firefox --headless --window-size=390,844 --screenshot="$DIR/mobile_patient.png" "http://localhost:3000/patient" 2>/dev/null || true
firefox --headless --window-size=390,844 --screenshot="$DIR/mobile_admin.png" "http://localhost:3000/admin" 2>/dev/null || true

echo "Capture complete."
ls -lh "$DIR"
