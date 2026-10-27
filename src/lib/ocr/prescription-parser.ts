/**
 * Clinical Prescription Parser
 * Parses raw Tesseract OCR text into structured prescription line items
 * using clinical shorthand heuristics and medical pattern recognition.
 */

import type { ParsedClinicalItem, ClinicalDosageForm, OcrWordDetail } from "./types";

const HEADER_IGNORE_REGEX = /^(?:dr\.?|doctor|hospital|clinic|patient|date|age|gender|reg(?:\s*#|\s*no)?|phone|tel|email|address|rx:?\s*$)/i;

const FORM_PATTERNS: Array<{ regex: RegExp; form: ClinicalDosageForm }> = [
  { regex: /\b(?:tab(?:let)?s?|tab\.)\b/i, form: "TABLET" },
  { regex: /\b(?:cap(?:sule)?s?|cap\.)\b/i, form: "CAPSULE" },
  { regex: /\b(?:syr(?:up)?s?|syr\.)\b/i, form: "SYRUP" },
  { regex: /\b(?:inj(?:ection)?s?|inj\.)\b/i, form: "INJECTION" },
  { regex: /\b(?:oint(?:ment)?s?|oint\.)\b/i, form: "OINTMENT" },
  { regex: /\b(?:drops?)\b/i, form: "DROPS" },
];

const STRENGTH_REGEX = /(\d+(?:\.\d+)?)\s*(mg|g|mcg|ml|iu|units?|%)\b/i;

const FREQUENCY_REGEX = /\b(OD|BD|BID|TDS|TID|QID|Q4H|Q6H|Q8H|Q12H|HS|SOS|PRN|STAT|ONCE DAILY|TWICE DAILY|THRICE DAILY)\b/i;

const DURATION_REGEX = /(?:for|x)?\s*(\d+)\s*(days?|weeks?|months?)\b/i;

const ROUTE_REGEX = /\b(oral|po|topical|iv|im|sublingual|inhalation|ophthalmic|otic)\b/i;

/**
 * Normalizes frequency string to canonical representation
 */
function normalizeFrequency(freqStr: string): string {
  const upper = freqStr.toUpperCase();
  if (upper === "ONCE DAILY" || upper === "1 TAB OD") return "OD";
  if (upper === "TWICE DAILY" || upper === "BID") return "BD";
  if (upper === "THRICE DAILY" || upper === "TDS") return "TID";
  return upper;
}

/**
 * Calculates average OCR confidence for a given line of text based on word bounding confidences
 */
function computeLineConfidence(lineText: string, words?: OcrWordDetail[]): number {
  if (!words || words.length === 0) return 0.85;

  const lineWords = lineText.toLowerCase().split(/\s+/).filter(Boolean);
  if (lineWords.length === 0) return 0.85;

  let totalConf = 0;
  let matchCount = 0;

  for (const lw of lineWords) {
    const matched = words.find((w) => w.text.toLowerCase().includes(lw));
    if (matched) {
      totalConf += matched.confidence;
      matchCount++;
    }
  }

  if (matchCount === 0) return 0.85;
  const avg = totalConf / matchCount;
  // Normalize Tesseract 0-100 to 0.0-1.0
  return Math.min(1.0, Math.max(0.1, Math.round((avg / 100) * 100) / 100));
}

/**
 * Parses raw OCR multiline text into structured clinical items
 */
export function parsePrescriptionText(
  rawText: string,
  words?: OcrWordDetail[]
): ParsedClinicalItem[] {
  if (!rawText || !rawText.trim()) {
    return [];
  }

  const rawLines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  const items: ParsedClinicalItem[] = [];
  let itemCounter = 1;

  for (const line of rawLines) {
    // Clean leading Rx: or numbering (e.g. "1.", "1)", "- ")
    const cleanLine = line.replace(/^(?:rx:?|\d+[\.\)]|-)\s*/i, "").trim();
    if (!cleanLine) continue;

    // A valid medication candidate line must possess at least one clinical indicator:
    // dosage form (Tab/Cap/etc.), strength (mg/g/ml), or administration frequency
    const hasForm = FORM_PATTERNS.some(({ regex }) => regex.test(cleanLine));
    const hasStrength = STRENGTH_REGEX.test(cleanLine);
    const hasFrequency = FREQUENCY_REGEX.test(cleanLine);

    if (!hasForm && !hasStrength && !hasFrequency) {
      continue;
    }

    // 1. Detect Dosage Form
    let dosageForm: ClinicalDosageForm | undefined;
    for (const { regex, form } of FORM_PATTERNS) {
      if (regex.test(cleanLine)) {
        dosageForm = form;
        break;
      }
    }

    // 2. Detect Strength
    let strengthValue: number | undefined;
    let strengthUnit: string | undefined;
    const strengthMatch = cleanLine.match(STRENGTH_REGEX);
    if (strengthMatch) {
      strengthValue = parseFloat(strengthMatch[1]);
      strengthUnit = strengthMatch[2].toLowerCase();
    }

    // 3. Detect Frequency
    let frequency: string | undefined;
    const freqMatch = cleanLine.match(FREQUENCY_REGEX);
    if (freqMatch) {
      frequency = normalizeFrequency(freqMatch[1]);
    }

    // 4. Detect Duration
    let durationValue: number | undefined;
    let durationUnit: string | undefined;
    const durMatch = cleanLine.match(DURATION_REGEX);
    if (durMatch) {
      durationValue = parseInt(durMatch[1], 10);
      durationUnit = durMatch[2].toLowerCase();
    }

    // 5. Detect Route
    let route = "ORAL";
    const routeMatch = cleanLine.match(ROUTE_REGEX);
    if (routeMatch) {
      route = routeMatch[1].toUpperCase();
      if (route === "PO") route = "ORAL";
    }

    // 6. Extract Brand / Drug Name
    // Remove form prefixes (e.g., "Tab.", "Cap."), strengths, frequency, and duration
    let candidateName = cleanLine;

    // Strip dosage form prefix
    candidateName = candidateName.replace(/\b(?:tab(?:let)?s?|cap(?:sule)?s?|syr(?:up)?s?|inj(?:ection)?s?|oint(?:ment)?s?|drops?)\.?\s*/i, "");

    // Cut everything from strength onwards or '-' onwards
    if (strengthMatch && strengthMatch.index !== undefined) {
      const beforeStrength = candidateName.slice(0, strengthMatch.index).trim();
      if (beforeStrength.length >= 3) {
        candidateName = beforeStrength;
      }
    }

    // Remove any trailing delimiters or numbers
    candidateName = candidateName
      .replace(/[-–—,:]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // If candidate name is empty, fall back to line fragment
    const brandText = candidateName.length >= 2 ? candidateName : cleanLine.slice(0, 30);

    const confidence = computeLineConfidence(line, words);

    // If it looks like a valid line with strength or form, mark confidence higher
    const hasClinicalSignals = !!(strengthValue || dosageForm || frequency);

    items.push({
      id: `item-${Date.now()}-${itemCounter++}`,
      rawExtractedText: line,
      brandText,
      strengthValue,
      strengthUnit,
      dosageForm: dosageForm || (route === "ORAL" ? "TABLET" : undefined),
      doseValue: 1,
      doseUnit: dosageForm ? dosageForm.toLowerCase() : "unit",
      route,
      frequency: frequency || "OD",
      durationValue: durationValue || 7,
      durationUnit: durationUnit || "days",
      confidence: hasClinicalSignals ? Math.max(0.75, confidence) : confidence,
      matchStatus: "UNRESOLVED",
    });
  }

  // If strict clinical patterns found 0 items, fall back to converting each
  // non-empty line into an unresolved draft item so no raw text is lost
  if (items.length === 0 && rawLines.length > 0) {
    for (const line of rawLines) {
      const cleanLine = line.replace(/^(?:rx:?|\d+[\.\)]|-)\s*/i, "").trim();
      if (cleanLine.length < 3) continue;
      items.push({
        id: `item-${Date.now()}-${itemCounter++}`,
        rawExtractedText: line,
        brandText: cleanLine,
        doseValue: 1,
        doseUnit: "unit",
        route: "ORAL",
        frequency: "OD",
        durationValue: 7,
        durationUnit: "days",
        confidence: 0.5,
        matchStatus: "UNRESOLVED",
      });
    }
  }

  return items;
}
