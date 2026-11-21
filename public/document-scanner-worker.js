let cvReady = null;

self.onmessage = async (event) => {
  const { id, type, dataUrl, corners, width, height } = event.data;

  try {
    if (type === "detect") {
      await loadOpenCv();
      const result = await detectCorners(dataUrl);
      self.postMessage({ id, ok: true, corners: result });
      return;
    }

    if (type === "ping") {
      await loadOpenCv();
      self.postMessage({ id, ok: true });
    }
  } catch (error) {
    self.postMessage({
      id,
      ok: false,
      error: error instanceof Error ? error.message : "Document processing failed.",
    });
  }
};

function loadOpenCv() {
  if (cvReady) return cvReady;
  cvReady = new Promise((resolve, reject) => {
    if (typeof cv !== "undefined" && cv.Mat) {
      resolve();
      return;
    }

    self.importScripts("https://docs.opencv.org/4.10.0/opencv.js");
    const waitForCv = () => {
      if (typeof cv !== "undefined" && cv.Mat) {
        resolve();
      } else if (typeof cv !== "undefined" && cv instanceof Object) {
        cv.onRuntimeInitialized = () => resolve();
      } else {
        reject(new Error("OpenCV.js could not start in the worker."));
      }
    };
    setTimeout(waitForCv, 25);
  });
  return cvReady;
}

async function imageDataFromUrl(dataUrl) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, 900 / Math.max(bitmap.width, bitmap.height));
  const canvas = new OffscreenCanvas(
    Math.max(1, Math.round(bitmap.width * scale)),
    Math.max(1, Math.round(bitmap.height * scale)),
  );
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  bitmap.close();
  return { imageData, scale, canvasWidth: canvas.width, canvasHeight: canvas.height };
}

function sortCorners(points) {
  const bySum = [...points].sort((a, b) => a.x + a.y - (b.x + b.y));
  const byDiff = [...points].sort((a, b) => a.x - a.y - (b.x - b.y));
  return [
  bySum[0],  // Top Left
  byDiff[3], // Top Right
  bySum[3],  // Bottom Right
  byDiff[0]  // Bottom Left
];
}

function quadrilateralScore(points, canvasWidth, canvasHeight) {
  const ordered = sortCorners(points);
  const widths = [
    Math.hypot(ordered[1].x - ordered[0].x, ordered[1].y - ordered[0].y),
    Math.hypot(ordered[2].x - ordered[3].x, ordered[2].y - ordered[3].y),
  ];
  const heights = [
    Math.hypot(ordered[3].x - ordered[0].x, ordered[3].y - ordered[0].y),
    Math.hypot(ordered[2].x - ordered[1].x, ordered[2].y - ordered[1].y),
  ];
  const maxWidth = Math.max(...widths);
  const minWidth = Math.min(...widths);
  const maxHeight = Math.max(...heights);
  const minHeight = Math.min(...heights);
  if (!maxWidth || !maxHeight) return 0;
  const aspectScore = Math.min(maxWidth / maxHeight, maxHeight / maxWidth);
  const shapeScore = Math.min(minWidth / maxWidth, minHeight / maxHeight);
  const borderPenalty =
    ordered.filter((point) =>
      point.x < canvasWidth * 0.015 ||
      point.y < canvasHeight * 0.015 ||
      point.x > canvasWidth * 0.985 ||
      point.y > canvasHeight * 0.985
    ).length * 0.04;
  return shapeScore * 0.55 + aspectScore * 0.45 - borderPenalty;
}

async function detectCorners(dataUrl) {
  const { imageData, canvasWidth, canvasHeight } = await imageDataFromUrl(dataUrl);
  let source = null;
  let gray = null;
  let blurred = null;
  let edges = null;
  let dilated = null;
  let contours = null;
  let hierarchy = null;

  try {
    source = cv.matFromImageData(imageData);
    gray = new cv.Mat();
    blurred = new cv.Mat();
    edges = new cv.Mat();
    dilated = new cv.Mat();
    contours = new cv.MatVector();
    hierarchy = new cv.Mat();

    cv.cvtColor(source, gray, cv.COLOR_RGBA2GRAY);
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
    cv.Canny(blurred, edges, 45, 135);
    cv.dilate(edges, dilated, cv.Mat.ones(3, 3, cv.CV_8U), new cv.Point(-1, -1), 2);
    cv.findContours(dilated, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

    let best = null;
    let bestArea = canvasWidth * canvasHeight * 0.05;
    let bestScore = -1;

    for (let index = 0; index < contours.size(); index += 1) {
      const contour = contours.get(index);
      const area = cv.contourArea(contour);
      if (area < bestArea) {
        contour.delete();
        continue;
      }

      const perimeter = cv.arcLength(contour, true);
      for (const epsilon of [0.015, 0.02, 0.03, 0.04]) {
        const polygon = new cv.Mat();
        cv.approxPolyDP(contour, polygon, epsilon * perimeter, true);
        if (polygon.rows === 4 && cv.isContourConvex(polygon)) {
          const points = [];
          for (let pointIndex = 0; pointIndex < 4; pointIndex += 1) {
            const point = polygon.intPtr(pointIndex, 0);
            points.push({ x: point[0], y: point[1] });
          }
          const score = quadrilateralScore(points, canvasWidth, canvasHeight);
          if (area > bestArea && score > bestScore) {
            bestArea = area;
            bestScore = score;
            const ordered = sortCorners(points).map((point) => ({
              x: Math.round((point.x / canvasWidth) * 1000),
              y: Math.round((point.y / canvasHeight) * 1000),
            }));
            best = ordered;
          }
        }
        polygon.delete();
      }
      contour.delete();
    }

    return best;
  } finally {
    source?.delete();
    gray?.delete();
    blurred?.delete();
    edges?.delete();
    dilated?.delete();
    contours?.delete();
    hierarchy?.delete();
  }
}
