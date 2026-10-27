/**
 * Image Pre-Processor for Clinical OCR
 * Optimizes prescription camera snapshots and scans via HTML5 Canvas
 * prior to Tesseract character recognition.
 */

export interface PreprocessOptions {
  maxDimension?: number;
  enhanceContrast?: boolean;
  grayscale?: boolean;
  rotationDegrees?: number; // 0, 90, 180, 270
}

const DEFAULT_MAX_DIMENSION = 1800;

/**
 * Loads an image source (File, Blob, or Data URI) into an HTMLImageElement
 */
export function loadImageElement(
  source: File | Blob | string,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) =>
      reject(new Error("Failed to load prescription image: " + err));

    if (typeof source === "string") {
      img.src = source;
    } else {
      const url = URL.createObjectURL(source);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.src = url;
    }
  });
}

/**
 * Pre-processes an image for OCR by scaling, rotating, and applying contrast stretching
 */
export async function preprocessImageForOcr(
  source: File | Blob | string | HTMLImageElement,
  options: PreprocessOptions = {},
): Promise<HTMLCanvasElement> {
  const {
    maxDimension = DEFAULT_MAX_DIMENSION,
    enhanceContrast = true,
    grayscale = true,
    rotationDegrees = 0,
  } = options;

  const img =
    source instanceof HTMLImageElement
      ? source
      : await loadImageElement(source);

  let origWidth = img.naturalWidth || img.width;
  let origHeight = img.naturalHeight || img.height;

  // Calculate target dimensions
  let scale = 1;
  const maxSide = Math.max(origWidth, origHeight);
  if (maxSide > maxDimension) {
    scale = maxDimension / maxSide;
  }

  const scaledWidth = Math.round(origWidth * scale);
  const scaledHeight = Math.round(origHeight * scale);

  // Normalize rotation angle (0, 90, 180, 270)
  const angle = ((rotationDegrees % 360) + 360) % 360;
  const isQuarterTurn = angle === 90 || angle === 270;

  const canvas = document.createElement("canvas");
  canvas.width = isQuarterTurn ? scaledHeight : scaledWidth;
  canvas.height = isQuarterTurn ? scaledWidth : scaledHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to obtain 2D canvas rendering context");
  }

  ctx.save();

  // Apply rotation matrix
  if (angle === 90) {
    ctx.translate(canvas.width, 0);
    ctx.rotate((90 * Math.PI) / 180);
  } else if (angle === 180) {
    ctx.translate(canvas.width, canvas.height);
    ctx.rotate((180 * Math.PI) / 180);
  } else if (angle === 270) {
    ctx.translate(0, canvas.height);
    ctx.rotate((270 * Math.PI) / 180);
  }

  // Draw image scaled
  ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
  ctx.restore();

  // Apply pixel-level transformations (Grayscale & Contrast stretch)
  if (grayscale || enhanceContrast) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const len = data.length;

    // First pass: calculate min & max luminance for contrast stretching
    let minLuma = 255;
    let maxLuma = 0;

    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Standard Rec. 601 luma formula
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      if (luma < minLuma) minLuma = luma;
      if (luma > maxLuma) maxLuma = luma;
    }

    // Guard against solid-color edge case
    const lumaRange = maxLuma - minLuma;
    const canStretch = enhanceContrast && lumaRange > 20;

    // Second pass: apply transformation
    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      let luma = 0.299 * r + 0.587 * g + 0.114 * b;

      if (canStretch) {
        luma = ((luma - minLuma) / lumaRange) * 255;
      }

      // Clamp
      const finalVal = Math.max(0, Math.min(255, Math.round(luma)));

      data[i] = finalVal; // R
      data[i + 1] = finalVal; // G
      data[i + 2] = finalVal; // B
      // Alpha remains data[i + 3]
    }

    ctx.putImageData(imageData, 0, 0);
  }

  return canvas;
}
