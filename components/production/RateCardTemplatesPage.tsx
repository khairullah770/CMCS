"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import {
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  Edit3,
  Eye,
  FilePlus2,
  FileText,
  FolderOpen,
  ImagePlus,
  Maximize2,
  Minus,
  Plus,
  RotateCw,
  Save,
  ScanLine,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { PageHeader } from "../common/PageHeader";
import {
  equipmentFunctions,
  equipmentSeed,
} from "../../lib/dummy-data/equipment";
import { staffFunctions, staffSeed } from "../../lib/dummy-data/staff";
import { RateCardRate, RateCardTemplate } from "../../lib/types";
import { rateKey, RateMap } from "../../lib/rate-cards";

type Resource = {
  key: string;
  id: string;
  name: string;
  detail: string;
  kind: "Equipment" | "Staff";
  functionName: string;
};

type ScanPage = {
  id: string;
  dataUrl: string;
  processedDataUrl?: string;
  type: string;
  captured?: boolean;
  rotation: number;
  corners?: Point[];
  filter: ScanFilter;
  brightness: number;
  contrast: number;
};

type Point = { x: number; y: number };
type ScanFilter =
  | "Original"
  | "Auto Enhance"
  | "Grayscale"
  | "Black & White"
  | "Color Enhancement";

type ScannedDocument = {
  id: string;
  templateId: string;
  name: string;
  createdAt: string;
  pages: ScanPage[];
  pdfDataUrl: string;
};

type ImageDimensions = {
  width: number;
  height: number;
};

const initialRates = (): RateMap => {
  const rates: RateMap = {};
  equipmentSeed.forEach((item, index) => {
    rates[rateKey("Equipment", item.id)] = {
      cost: 35 + index * 5,
      selling: 60 + index * 8,
      type: item.company === "CMCS" ? "Internal" : "External",
      unit: "Per Day",
      currency: "USD",
    };
  });
  staffSeed.forEach((item, index) => {
    rates[rateKey("Staff", item.id)] = {
      cost: 900 + index * 150,
      selling: 1250 + index * 200,
      type: item.freelance ? "External" : "Internal",
      unit: "Per Project",
      currency: "USD",
    };
  });
  return rates;
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Unable to read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

function dataUrlToBytes(dataUrl: string) {
  const base64 = dataUrl.split(",")[1];
  if (!base64) throw new Error("The document data is invalid.");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function dataUrlToBlob(dataUrl: string) {
  const [header] = dataUrl.split(",");
  const mime = header.match(/data:([^;]+)/)?.[1] ?? "application/octet-stream";
  return new Blob([dataUrlToBytes(dataUrl)], { type: mime });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to preview this image."));
    image.src = dataUrl;
  });
}

declare global {
  interface Window {
    cv?: {
      onRuntimeInitialized?: () => void;
      Mat: new () => any;
      imread: (source: CanvasImageSource) => any;
      imshow: (canvas: HTMLCanvasElement, mat: any) => void;
      cvtColor: (...args: any[]) => void;
      gaussianBlur: (...args: any[]) => void;
      Canny: (...args: any[]) => void;
      findContours: (...args: any[]) => void;
      contourArea: (contour: any) => number;
      approxPolyDP: (...args: any[]) => void;
      arcLength: (...args: any[]) => number;
      isContourConvex: (contour: any) => boolean;
      warpPerspective: (...args: any[]) => void;
      getPerspectiveTransform: (...args: any[]) => any;
      matFromArray: (...args: any[]) => any;
      CV_32FC2: number;
      getPerspectiveTransformCorners: (...args: any[]) => any;
      waitKey: (delay: number) => void;
      COLOR_RGBA2GRAY: number;
      COLOR_RGBA2RGB: number;
      THRESH_BINARY: number;
      RETR_LIST: number;
      CHAIN_APPROX_SIMPLE: number;
      INTER_CUBIC: number;
      INTER_LINEAR: number;
      BORDER_CONSTANT: number;
      MatVector: new () => any;
      Scalar: new (...args: number[]) => any;
      Size: new (width: number, height: number) => any;
      Point: new (x: number, y: number) => any;
      SORT_ASCENDING: number;
      sortCorners: (corners: Point[]) => Point[];
      outlineContour: (contour: any) => any;
    };
  }
}

function loadOpenCv() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.cv?.Mat) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-cmcs-opencv]",
    );
    if (existing) {
      existing.addEventListener(
        "load",
        () => {
          if (window.cv?.onRuntimeInitialized) {
            window.cv.onRuntimeInitialized = () => resolve();
          } else if (window.cv?.Mat) {
            resolve();
          }
        },
        { once: true },
      );
      existing.addEventListener(
        "error",
        () => reject(new Error("OpenCV.js could not be loaded.")),
        { once: true },
      );
      return;
    }
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://docs.opencv.org/4.10.0/opencv.js";
    script.dataset.cmcsOpencv = "true";
    script.onload = () => {
      if (window.cv?.onRuntimeInitialized) {
        window.cv.onRuntimeInitialized = () => resolve();
      } else {
        resolve();
      }
    };
    script.onerror = () => reject(new Error("OpenCV.js could not be loaded."));
    document.head.appendChild(script);
  });
}

function sortCorners(points: Point[]) {
  const bySum = [...points].sort((a, b) => a.x + a.y - (b.x + b.y));
  const byDiff = [...points].sort((a, b) => a.x - a.y - (b.x - b.y));
  return [bySum[0], byDiff[0], bySum[3], byDiff[3]].map((point) => ({
    x: Math.round(point.x),
    y: Math.round(point.y),
  }));
}

async function detectDocumentCorners(dataUrl: string): Promise<Point[] | null> {
  if (!window.cv?.Mat) return null;
  let source: any = null;
  let gray: any = null;
  let blurred: any = null;
  let edges: any = null;
  let contours: any = null;
  let hierarchy: any = null;
  try {
    const image = await loadImage(dataUrl);
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 1400 / Math.max(image.width, image.height));
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    source = window.cv.imread(canvas);
    gray = new window.cv.Mat();
    blurred = new window.cv.Mat();
    edges = new window.cv.Mat();
    contours = new window.cv.MatVector();
    hierarchy = new window.cv.Mat();
    window.cv.cvtColor(source, gray, window.cv.COLOR_RGBA2GRAY);
    window.cv.gaussianBlur(gray, blurred, new window.cv.Size(5, 5), 0);
    window.cv.Canny(blurred, edges, 60, 180);
    window.cv.findContours(
      edges,
      contours,
      hierarchy,
      window.cv.RETR_LIST,
      window.cv.CHAIN_APPROX_SIMPLE,
    );

    let best: Point[] | null = null;
    let bestArea = 0;
    for (let index = 0; index < contours.size(); index += 1) {
      const contour = contours.get(index);
      const area = window.cv.contourArea(contour);
      if (area < canvas.width * canvas.height * 0.05) {
        contour.delete();
        continue;
      }
      const perimeter = window.cv.arcLength(contour, true);
      for (const epsilon of [0.01, 0.02, 0.03, 0.04]) {
        const polygon = new window.cv.Mat();
        window.cv.approxPolyDP(contour, polygon, epsilon * perimeter, true);
        if (polygon.rows === 4 && window.cv.isContourConvex(polygon)) {
          const points: Point[] = [];
          for (let pointIndex = 0; pointIndex < 4; pointIndex += 1) {
            const point = polygon.intPtr(pointIndex, 0);
            points.push({
              x: Math.round((point[0] / canvas.width) * 1000),
              y: Math.round((point[1] / canvas.height) * 1000),
            });
          }
          if (area > bestArea) {
            bestArea = area;
            best = sortCorners(points);
          }
        }
        polygon.delete();
      }
      contour.delete();
    }
    return best;
  } catch {
    return null;
  } finally {
    source?.delete();
    gray?.delete();
    blurred?.delete();
    edges?.delete();
    contours?.delete();
    hierarchy?.delete();
  }
}

async function correctedPageDataUrl(page: ScanPage): Promise<string> {
  const image = await loadImage(page.dataUrl);
  const canvas = document.createElement("canvas");
  let outputWidth = image.width;
  let outputHeight = image.height;

  if (page.corners?.length === 4) {
    const cv = window.cv;
    if (cv?.Mat) {
      let source: any = null;
      let destination: any = null;
      let matrix: any = null;
      let sourcePoints: any = null;
      let destinationPoints: any = null;
      try {
        const sourceCanvas = document.createElement("canvas");
        sourceCanvas.width = image.width;
        sourceCanvas.height = image.height;
        sourceCanvas.getContext("2d")?.drawImage(image, 0, 0);
        source = cv.imread(sourceCanvas);
        destination = new cv.Mat();
        const normalizedCorners = sortCorners(
          page.corners.map((point) => ({
            x: Math.max(0, Math.min(1000, point.x)),
            y: Math.max(0, Math.min(1000, point.y)),
          })),
        );
        const pixels = normalizedCorners.map((point) => ({
          x: (point.x / 1000) * image.width,
          y: (point.y / 1000) * image.height,
        }));
        const topWidth = Math.hypot(
          pixels[1].x - pixels[0].x,
          pixels[1].y - pixels[0].y,
        );
        const bottomWidth = Math.hypot(
          pixels[2].x - pixels[3].x,
          pixels[2].y - pixels[3].y,
        );
        const leftHeight = Math.hypot(
          pixels[3].x - pixels[0].x,
          pixels[3].y - pixels[0].y,
        );
        const rightHeight = Math.hypot(
          pixels[2].x - pixels[1].x,
          pixels[2].y - pixels[1].y,
        );
        outputWidth = Math.round(Math.max(topWidth, bottomWidth));
        outputHeight = Math.round(Math.max(leftHeight, rightHeight));
        outputWidth = Math.max(80, Math.min(outputWidth, 2400));
        outputHeight = Math.max(80, Math.min(outputHeight, 2400));
        sourcePoints = cv.matFromArray(
          4,
          1,
          cv.CV_32FC2,
          pixels.flatMap((point) => [point.x, point.y]),
        );
        destinationPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
          0,
          0,
          outputWidth - 1,
          0,
          outputWidth - 1,
          outputHeight - 1,
          0,
          outputHeight - 1,
        ]);
        matrix = cv.getPerspectiveTransform(sourcePoints, destinationPoints);
        cv.warpPerspective(
          source,
          destination,
          matrix,
          new cv.Size(outputWidth, outputHeight),
        );
        canvas.width = outputWidth;
        canvas.height = outputHeight;
        cv.imshow(canvas, destination);
        if (page.rotation % 360 !== 0) {
          const rotatedCanvas = document.createElement("canvas");
          const quarterTurns = (((page.rotation / 90) % 4) + 4) % 4;
          const rotated = quarterTurns % 2 === 1;
          rotatedCanvas.width = rotated ? canvas.height : canvas.width;
          rotatedCanvas.height = rotated ? canvas.width : canvas.height;
          const rotatedContext = rotatedCanvas.getContext("2d");
          if (!rotatedContext)
            throw new Error("The cropped image could not be rotated.");
          rotatedContext.translate(
            rotatedCanvas.width / 2,
            rotatedCanvas.height / 2,
          );
          rotatedContext.rotate((quarterTurns * Math.PI) / 2);
          rotatedContext.drawImage(
            canvas,
            -canvas.width / 2,
            -canvas.height / 2,
          );
          return await finishEnhancement(rotatedCanvas, page);
        }
        return await finishEnhancement(canvas, { ...page, rotation: 0 });
      } finally {
        source?.delete();
        destination?.delete();
        matrix?.delete();
        sourcePoints?.delete();
        destinationPoints?.delete();
      }
    }
  }

  const quarterTurns = (((page.rotation / 90) % 4) + 4) % 4;
  const rotated = quarterTurns % 2 === 1;
  canvas.width = rotated ? image.height : image.width;
  canvas.height = rotated ? image.width : image.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image processing is unavailable.");
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate((quarterTurns * Math.PI) / 2);
  context.drawImage(image, -image.width / 2, -image.height / 2);
  return finishEnhancement(canvas, page);
}

async function finishEnhancement(canvas: HTMLCanvasElement, page: ScanPage) {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return canvas.toDataURL("image/jpeg", 0.92);
  if (
    page.filter !== "Original" ||
    page.brightness !== 0 ||
    page.contrast !== 100
  ) {
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = pixels.data;
    const contrast =
      (259 * (page.contrast + 255)) / (255 * (259 - page.contrast));
    for (let index = 0; index < data.length; index += 4) {
      let red = data[index];
      let green = data[index + 1];
      let blue = data[index + 2];
      if (page.filter === "Grayscale" || page.filter === "Black & White") {
        const gray = red * 0.299 + green * 0.587 + blue * 0.114;
        if (page.filter === "Black & White") {
          const value = gray > 150 ? 255 : 0;
          red = green = blue = value;
        } else {
          red = green = blue = gray;
        }
      }
      if (
        page.filter === "Color Enhancement" ||
        page.filter === "Auto Enhance"
      ) {
        const average = (red + green + blue) / 3;
        red = average + (red - average) * 1.12;
        green = average + (green - average) * 1.12;
        blue = average + (blue - average) * 1.12;
      }
      const adjustedContrast = contrast * (red - 128) + 128 + page.brightness;
      data[index] = Math.max(0, Math.min(255, adjustedContrast));
      data[index + 1] = Math.max(
        0,
        Math.min(255, contrast * (green - 128) + 128 + page.brightness),
      );
      data[index + 2] = Math.max(
        0,
        Math.min(255, contrast * (blue - 128) + 128 + page.brightness),
      );
    }
    context.putImageData(pixels, 0, 0);
  }
  return canvas.toDataURL("image/jpeg", 0.92);
}

async function pageAsJpeg(page: ScanPage) {
  const image = await loadImage(page.dataUrl);
  const quarterTurns = (((page.rotation / 90) % 4) + 4) % 4;
  const rotated = quarterTurns % 2 === 1;
  const canvas = document.createElement("canvas");
  canvas.width = rotated ? image.height : image.width;
  canvas.height = rotated ? image.width : image.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser cannot prepare this document.");
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate((quarterTurns * Math.PI) / 2);
  context.drawImage(image, -image.width / 2, -image.height / 2);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
  return {
    bytes: dataUrlToBytes(dataUrl),
    dimensions: {
      width: canvas.width,
      height: canvas.height,
    } as ImageDimensions,
  };
}

function textBytes(value: string) {
  return new TextEncoder().encode(value);
}

function joinBytes(chunks: Uint8Array[]) {
  const result = new Uint8Array(
    chunks.reduce((total, chunk) => total + chunk.length, 0),
  );
  let offset = 0;
  chunks.forEach((chunk) => {
    result.set(chunk, offset);
    offset += chunk.length;
  });
  return result;
}

async function buildImagePdf(pages: ScanPage[]) {
  if (pages.some((page) => page.type === "application/pdf")) {
    if (pages.length !== 1) {
      throw new Error(
        "PDF uploads cannot be combined with additional pages in the browser.",
      );
    }
    return dataUrlToBlob(pages[0].dataUrl);
  }

  const jpegPages = await Promise.all(pages.map(pageAsJpeg));
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const chunks: Uint8Array[] = [
    new Uint8Array([
      37, 80, 68, 70, 45, 49, 46, 51, 10, 37, 255, 255, 255, 255, 10,
    ]),
  ];
  const offsets: number[] = [0];
  let offset = chunks[0].length;
  const objectNumbers = (index: number) => ({
    page: 3 + index * 3,
    content: 4 + index * 3,
    image: 5 + index * 3,
  });
  const addTextObject = (number: number, body: string) => {
    const bytes = textBytes(`${number} 0 obj\n${body}\nendobj\n`);
    offsets[number] = offset;
    chunks.push(bytes);
    offset += bytes.length;
  };

  addTextObject(1, "<< /Type /Catalog /Pages 2 0 R >>");
  addTextObject(
    2,
    `<< /Type /Pages /Kids [${jpegPages
      .map((_, index) => `${objectNumbers(index).page} 0 R`)
      .join(" ")}] /Count ${jpegPages.length} >>`,
  );

  jpegPages.forEach(({ bytes, dimensions }, index) => {
    const numbers = objectNumbers(index);
    const scale = Math.min(
      pageWidth / dimensions.width,
      pageHeight / dimensions.height,
    );
    const width = Math.max(1, dimensions.width * scale);
    const height = Math.max(1, dimensions.height * scale);
    addTextObject(
      numbers.page,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 ${numbers.image} 0 R >> >> /Contents ${numbers.content} 0 R >>`,
    );
    addTextObject(
      numbers.content,
      `<< /Length ${textBytes(`q ${width} 0 0 ${height} ${(pageWidth - width) / 2} ${(pageHeight - height) / 2} cm /Im0 Do Q`).length} >>\nstream\nq ${width} 0 0 ${height} ${(pageWidth - width) / 2} ${(pageHeight - height) / 2} cm /Im0 Do Q\nendstream`,
    );
    const imageHeader = textBytes(
      `${numbers.image} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${dimensions.width} /Height ${dimensions.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>\nstream\n`,
    );
    const imageFooter = textBytes("\nendstream\nendobj\n");
    offsets[numbers.image] = offset;
    chunks.push(imageHeader, bytes, imageFooter);
    offset += imageHeader.length + bytes.length + imageFooter.length;
  });

  const xrefOffset = offset;
  const objectCount = 5 + jpegPages.length * 3;
  const xref = [`xref\n0 ${objectCount}\n0000000000 65535 f \n`];
  for (let index = 1; index < objectCount; index += 1) {
    xref.push(`${String(offsets[index]).padStart(10, "0")} 00000 n \n`);
  }
  chunks.push(
    textBytes(
      `${xref.join("")}trailer\n<< /Size ${objectCount} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`,
    ),
  );
  return new Blob([joinBytes(chunks)], { type: "application/pdf" });
}

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );

function resourcesForFunction(functionName: string): Resource[] {
  return [
    ...equipmentSeed
      .filter((item) => item.functions.includes(functionName))
      .map((item) => ({
        key: rateKey("Equipment", item.id),
        id: item.id,
        name: item.name,
        detail: `${item.id} · ${item.company}`,
        kind: "Equipment" as const,
        functionName,
      })),
    ...staffSeed
      .filter((item) => item.function.role === functionName)
      .map((item) => ({
        key: rateKey("Staff", item.id),
        id: item.id,
        name: `${item.firstName} ${item.lastName}`,
        detail: `${item.id} · ${item.jobTitle}`,
        kind: "Staff" as const,
        functionName,
      })),
  ];
}

export function RateCardTemplatesPage({
  templates,
  canManage,
  onCreate,
  onUpdate,
  onDelete,
  onNotify,
  preparedBy = "Head of Operations",
}: {
  templates: RateCardTemplate[];
  canManage: boolean;
  onCreate: (template: RateCardTemplate) => void;
  onUpdate: (template: RateCardTemplate) => void;
  onDelete: (templateId: string) => void;
  onNotify: (message: string) => void;
  preparedBy?: string;
}) {
  const functions = useMemo(
    () =>
      Array.from(
        new Set([
          ...equipmentFunctions,
          ...staffFunctions.map((item) => item.role),
        ]),
      ),
    [],
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [expandedFunctions, setExpandedFunctions] = useState<string[]>([]);
  const [rates, setRates] = useState<RateMap>(initialRates);
  const [scannedDocuments, setScannedDocuments] = useState<ScannedDocument[]>(
    [],
  );
  const [scannerTemplate, setScannerTemplate] =
    useState<RateCardTemplate | null>(null);
  const [scannerName, setScannerName] = useState("");
  const [scannerPages, setScannerPages] = useState<ScanPage[]>([]);
  const [scannerReplacingId, setScannerReplacingId] = useState<string | null>(
    null,
  );
  const [scannerError, setScannerError] = useState("");
  const [scannerSaving, setScannerSaving] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<"environment" | "user">("environment");
  const [cameraSwitchAvailable, setCameraSwitchAvailable] = useState(false);
  const [adjustingPageId, setAdjustingPageId] = useState<string | null>(null);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [previewPageId, setPreviewPageId] = useState<string | null>(null);
  const [replacingPageId, setReplacingPageId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] =
    useState<ScanFilter>("Auto Enhance");
  const [processingPageId, setProcessingPageId] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const defaultRates = useMemo(initialRates, []);

  const resourceByKey = useMemo(() => {
    const all = functions.flatMap(resourcesForFunction);
    return new Map(all.map((resource) => [resource.key, resource]));
  }, [functions]);

  const selectedResourceList = selectedResources
    .map((key) => resourceByKey.get(key))
    .filter((resource): resource is Resource => Boolean(resource));

  function templateFunctions(template: RateCardTemplate) {
    if (template.functions.length) return template.functions;
    return Array.from(
      new Set(
        template.resourceKeys
          .map((key) => resourceByKey.get(key)?.functionName)
          .filter((functionName): functionName is string =>
            Boolean(functionName),
          ),
      ),
    );
  }

  function templateRate(template: RateCardTemplate, key: string) {
    return template.rates[key] ?? defaultRates[key];
  }

  function resetEditor() {
    setEditingId(null);
    setName("");
    setSelectedFunctions([]);
    setSelectedResources([]);
    setExpandedFunctions([]);
    setRates(initialRates());
  }

  function closeScanner() {
    stopCamera();
    setScannerTemplate(null);
    setScannerName("");
    setScannerPages([]);
    setScannerReplacingId(null);
    setScannerError("");
    setScannerSaving(false);
    setCameraOpen(false);
    setCameraSwitchAvailable(false);
    setAdjustingPageId(null);
    setEditingPageId(null);
    setPreviewPageId(null);
    setReplacingPageId(null);
  }

  function stopCamera() {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = null;
    }
  }

  async function openLiveCamera(facingMode: "environment" | "user" = cameraFacingMode) {
    setScannerError("");
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setCameraOpen(false);
      setScannerError(
        "Camera access requires HTTPS. Open this app through https://192.168.7.125:3000 or https://localhost:3000.",
      );
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setScannerError(
        "Live camera preview is not supported here. Use HTTPS or a current Chrome browser.",
      );
      return;
    }

    stopCamera();
    try {
      setCameraFacingMode(facingMode);
      setCameraOpen(true);

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch (error) {
        if (
          error instanceof DOMException &&
          ["OverconstrainedError", "NotFoundError"].includes(error.name)
        ) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } else {
          throw error;
        }
      }

      cameraStreamRef.current = stream;
      const attachStream = () => {
        if (!cameraVideoRef.current) return;
        cameraVideoRef.current.srcObject = stream;
        void cameraVideoRef.current.play().catch(() => {
          setScannerError("The camera preview could not start. Tap the screen and try again.");
        });
      };
      window.setTimeout(attachStream, 50);
      window.setTimeout(attachStream, 250);

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setCameraSwitchAvailable(
          devices.filter((device) => device.kind === "videoinput").length > 1,
        );
      } catch {
        setCameraSwitchAvailable(false);
      }
    } catch (error) {
      setCameraOpen(false);
      if (error instanceof DOMException) {
        switch (error.name) {
          case "NotAllowedError":
          case "PermissionDeniedError":
            setScannerError(
              "Camera permission was denied. Allow camera access in Chrome site settings, then try again.",
            );
            break;
          case "NotFoundError":
            setScannerError("No camera was found on this device.");
            break;
          case "NotReadableError":
            setScannerError("The camera is busy or unavailable. Close other apps using it and try again.");
            break;
          case "AbortError":
            setScannerError("Camera access was interrupted. Please try again.");
            break;
          default:
            setScannerError("The camera could not be opened. Check permissions and try again.");
        }
      } else {
        setScannerError("The camera could not be opened.");
      }
    }
  }

  function captureCameraPage() {
    const video = cameraVideoRef.current;
    if (!video || video.readyState < 2) {
      setScannerError(
        "The camera is still starting. Please wait and try again.",
      );
      return;
    }
    const canvas = document.createElement("canvas");
    const maxWidth = 1600;
    const scale = Math.min(1, maxWidth / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const context = canvas.getContext("2d");
    if (!context) {
      setScannerError("The camera image could not be prepared.");
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    const page: ScanPage = {
      id: `capture-${Date.now()}-${Math.random()}`,
      dataUrl,
      type: "image/jpeg",
      captured: true,
      rotation: 0,
      filter: "Auto Enhance",
      brightness: 0,
      contrast: 100,
    };
    setScannerPages((current) => [...current, page]);
    setProcessingPageId(page.id);
    void processCapturedPage(page);
  }

  useEffect(() => {
    return () => stopCamera();
  }, []);

  function openScanner(template: RateCardTemplate, existing?: ScannedDocument) {
    setScannerTemplate(template);
    setScannerName(existing?.name ?? "");
    setScannerPages(existing?.pages ?? []);
    setScannerReplacingId(existing?.id ?? null);
    setScannerError("");
    setEditingPageId(null);
    setPreviewPageId(null);
  }

  async function addScannerFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    setScannerError("");
    try {
      const files = Array.from(fileList);
      const unsupported = files.find(
        (file) =>
          !["application/pdf", "image/jpeg", "image/png"].includes(file.type),
      );
      if (unsupported) {
        throw new Error("Only PDF, JPG and PNG documents are supported.");
      }
      if (
        files.some((file) => file.type === "application/pdf") &&
        files.length > 1
      ) {
        throw new Error(
          "Upload a PDF by itself, or upload image pages together.",
        );
      }
      const pages = await Promise.all(
        files.map(async (file) => ({
          id: `${file.name}-${file.lastModified}-${Math.random()}`,
          dataUrl: await readFileAsDataUrl(file),
          type: file.type,
          rotation: 0,
          filter: "Auto Enhance" as ScanFilter,
          brightness: 0,
          contrast: 100,
        })),
      );
      setScannerPages((current) => [...current, ...pages]);
      pages.forEach((page) => {
        if (page.type !== "application/pdf") void processCapturedPage(page);
      });
    } catch (error) {
      setScannerError(
        error instanceof Error
          ? error.message
          : "The document could not be added.",
      );
    }
  }

  async function replaceScannerPage(pageId: string, fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setScannerError("Replacement pages must be JPG or PNG images.");
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const replacement: ScanPage = {
        id: pageId,
        dataUrl,
        type: file.type,
        captured: false,
        rotation: 0,
        filter: "Original",
        brightness: 0,
        contrast: 100,
      };
      setScannerPages((current) =>
        current.map((page) => (page.id === pageId ? replacement : page)),
      );
      setProcessingPageId(pageId);
      await processCapturedPage(replacement);
    } catch (error) {
      setScannerError(
        error instanceof Error
          ? error.message
          : "The page could not be replaced.",
      );
    } finally {
      setReplacingPageId(null);
    }
  }

  function removeScannerPage(pageId: string) {
    setScannerPages((current) => current.filter((page) => page.id !== pageId));
  }

  function rotateScannerPage(pageId: string) {
    setScannerPages((current) =>
      current.map((page) =>
        page.id === pageId
          ? { ...page, rotation: (page.rotation + 90) % 360 }
          : page,
      ),
    );
  }

  async function downloadScannerPage(page: ScanPage) {
    try {
      const dataUrl = await correctedPageDataUrl(page);
      const link = window.document.createElement("a");
      link.href = dataUrl;
      link.download = `${scannerName.trim().replace(/[^\w-]+/g, "-") || "scanned-page"}-page-${scannerPages.indexOf(page) + 1}.jpg`;
      link.click();
    } catch {
      setScannerError("The individual image could not be downloaded.");
    }
  }

  async function processCapturedPage(page: ScanPage) {
    setProcessingPageId(page.id);
    try {
      await loadOpenCv();
      const corners = await detectDocumentCorners(page.dataUrl);
      setScannerPages((current) =>
        current.map((item) =>
          item.id === page.id
            ? { ...item, corners: corners ?? item.corners }
            : item,
        ),
      );
      const updated = { ...page, corners: corners ?? page.corners };
      const processed = await correctedPageDataUrl(updated);
      setScannerPages((current) =>
        current.map((item) =>
          item.id === page.id ? { ...item, processedDataUrl: processed } : item,
        ),
      );
    } catch (error) {
      setScannerError(
        error instanceof Error
          ? error.message
          : "This page could not be processed.",
      );
    } finally {
      setProcessingPageId(null);
    }
  }

  async function updateProcessedPage(
    pageId: string,
    updates: Partial<ScanPage>,
  ) {
    setProcessingPageId(pageId);
    const current = scannerPages.find((page) => page.id === pageId);
    if (!current) return;
    try {
      const updated = { ...current, ...updates };
      const processed = await correctedPageDataUrl(updated);
      setScannerPages((items) =>
        items.map((item) =>
          item.id === pageId
            ? { ...updated, processedDataUrl: processed }
            : item,
        ),
      );
    } catch {
      setScannerError("The page preview could not be updated.");
    } finally {
      setProcessingPageId(null);
    }
  }

  function retakeCameraPage(pageId: string) {
    removeScannerPage(pageId);
    setCameraOpen(true);
    void openLiveCamera();
  }

  function updateCorner(
    pageId: string,
    cornerIndex: number,
    event: React.PointerEvent<SVGCircleElement>,
  ) {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = Math.max(
      0,
      Math.min(1000, ((event.clientX - rect.left) / rect.width) * 1000),
    );
    const y = Math.max(
      0,
      Math.min(1000, ((event.clientY - rect.top) / rect.height) * 1000),
    );
    const page = scannerPages.find((item) => item.id === pageId);
    if (!page) return;
    const corners = [...(page.corners ?? defaultScannerCorners())];
    corners[cornerIndex] = { x: Math.round(x), y: Math.round(y) };
    setScannerPages((current) =>
      current.map((item) => (item.id === pageId ? { ...item, corners } : item)),
    );
    void updateProcessedPage(pageId, { corners });
  }

  function defaultScannerCorners(): Point[] {
    return [
      { x: 80, y: 80 },
      { x: 920, y: 80 },
      { x: 920, y: 920 },
      { x: 80, y: 920 },
    ];
  }

  async function saveScannedDocument() {
    const trimmedName = scannerName.trim();
    if (!scannerTemplate || !trimmedName || !scannerPages.length) {
      setScannerError("Enter a document name and add at least one page.");
      return;
    }
    setScannerSaving(true);
    setScannerError("");
    try {
      if (scannerPages.some((page) => page.type === "application/pdf")) {
        if (scannerPages.length !== 1) {
          throw new Error(
            "PDF uploads cannot be combined with additional pages.",
          );
        }
        const pdfDataUrl = scannerPages[0].dataUrl;
        const existing = scannedDocuments.find(
          (document) => document.id === scannerReplacingId,
        );
        const savedDocument: ScannedDocument = {
          id: existing?.id ?? `DOC-${Date.now()}`,
          templateId: scannerTemplate.id,
          name: trimmedName,
          createdAt:
            existing?.createdAt ?? new Date().toISOString().slice(0, 10),
          pages: scannerPages,
          pdfDataUrl,
        };
        setScannedDocuments((current) =>
          existing
            ? current.map((document) =>
                document.id === existing.id ? savedDocument : document,
              )
            : [...current, savedDocument],
        );
        onNotify(
          existing
            ? "Scanned document replaced."
            : "Scanned document archived.",
        );
        closeScanner();
        return;
      }

      const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
      for (let index = 0; index < scannerPages.length; index += 1) {
        if (index > 0) pdf.addPage("a4");
        const page = scannerPages[index];
        const processed = await correctedPageDataUrl(page);
        const image = await loadImage(processed);
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const scale = Math.min(
          pageWidth / image.width,
          pageHeight / image.height,
        );
        const width = image.width * scale;
        const height = image.height * scale;
        pdf.addImage(
          processed,
          "JPEG",
          (pageWidth - width) / 2,
          (pageHeight - height) / 2,
          width,
          height,
          undefined,
          "FAST",
        );
      }
      const pdfDataUrl = pdf.output("dataurlstring");
      const existing = scannedDocuments.find(
        (document) => document.id === scannerReplacingId,
      );
      const savedDocument: ScannedDocument = {
        id: existing?.id ?? `DOC-${Date.now()}`,
        templateId: scannerTemplate.id,
        name: trimmedName,
        createdAt: existing?.createdAt ?? new Date().toISOString().slice(0, 10),
        pages: scannerPages,
        pdfDataUrl,
      };
      setScannedDocuments((current) =>
        existing
          ? current.map((document) =>
              document.id === existing.id ? savedDocument : document,
            )
          : [...current, savedDocument],
      );
      onNotify(
        existing ? "Scanned document replaced." : "Scanned document archived.",
      );
      closeScanner();
    } catch (error) {
      setScannerError(
        error instanceof Error
          ? error.message
          : "The document could not be saved.",
      );
      setScannerSaving(false);
    }
  }

  function openSavedDocument(document: ScannedDocument, download = false) {
    const blob = dataUrlToBlob(document.pdfDataUrl);
    const url = URL.createObjectURL(blob);
    if (download) {
      const link = window.document.createElement("a");
      link.href = url;
      link.download = `${document.name.replace(/[^\w-]+/g, "-")}.pdf`;
      link.click();
    } else {
      const popup = window.open(url, "_blank", "noopener,noreferrer");
      if (!popup) onNotify("Allow pop-ups to view the archived document.");
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  function deleteSavedDocument(documentId: string) {
    if (!window.confirm("Delete this archived document?")) return;
    setScannedDocuments((current) =>
      current.filter((document) => document.id !== documentId),
    );
    onNotify("Archived document deleted.");
  }

  function beginCreate() {
    resetEditor();
    setEditingId("new");
  }

  function beginEdit(template: RateCardTemplate) {
    setEditingId(template.id);
    setName(template.name);
    setSelectedFunctions(templateFunctions(template));
    setSelectedResources(template.resourceKeys);
    setExpandedFunctions(template.functions);
    setRates((current) => ({ ...current, ...template.rates }));
  }

  function toggleFunction(functionName: string) {
    const resources = resourcesForFunction(functionName).map(
      (item) => item.key,
    );
    setSelectedFunctions((current) =>
      current.includes(functionName)
        ? current.filter((item) => item !== functionName)
        : [...current, functionName],
    );
    setSelectedResources((current) =>
      current.some((key) => resources.includes(key))
        ? current.filter((key) => !resources.includes(key))
        : Array.from(new Set([...current, ...resources])),
    );
  }

  function toggleResource(resource: Resource) {
    setSelectedResources((current) =>
      current.includes(resource.key)
        ? current.filter((key) => key !== resource.key)
        : [...current, resource.key],
    );
    setSelectedFunctions((current) =>
      current.includes(resource.functionName)
        ? current
        : [...current, resource.functionName],
    );
  }

  function save() {
    const trimmedName = name.trim();
    if (!trimmedName || !selectedResources.length) {
      onNotify("Enter a template name and select at least one resource.");
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const existing = templates.find((template) => template.id === editingId);
    const template: RateCardTemplate = {
      id: existing?.id ?? `RAT-${Date.now()}`,
      name: trimmedName,
      functions: [...selectedFunctions],
      resourceKeys: [...selectedResources],
      rates: Object.fromEntries(
        selectedResources
          .filter((key) => rates[key])
          .map((key) => [key, rates[key]]),
      ),
      createdAt: existing?.createdAt ?? today,
      updatedAt: today,
      validity: existing?.validity ?? "30 days",
    };
    existing ? onUpdate(template) : onCreate(template);
    onNotify(
      existing ? "Rate card template updated." : "Rate card template created.",
    );
    resetEditor();
  }

  function downloadPdf(template: RateCardTemplate, print = true) {
    const popup = window.open("", "_blank", "width=900,height=700");
    if (!popup) {
      onNotify(
        print
          ? "Allow pop-ups to download the PDF."
          : "Allow pop-ups to view the PDF.",
      );
      return;
    }
    const grouped = templateFunctions(template)
      .map((functionName) => ({
        functionName,
        resources: template.resourceKeys
          .map((key) => resourceByKey.get(key))
          .filter((resource): resource is Resource =>
            Boolean(resource && resource.functionName === functionName),
          ),
      }))
      .filter((group) => group.resources.length);
    const currency =
      template.resourceKeys
        .map((key) => templateRate(template, key)?.currency)
        .find((value): value is "USD" | "AFN" => Boolean(value)) ?? "USD";
    let itemNumber = 0;
    popup.document.write(`<!doctype html>
      <html><head><title>${escapeHtml(template.name)} - Rate Card Template</title>
      <style>
        @page { size: A4; margin: 12mm; }
        * { box-sizing: border-box; }
        body { color: #171717; font: 9px Arial, sans-serif; margin: 0; }
        .quotation-paper { background: #fff; margin: 0 auto; max-width: 820px; padding: 34px 38px 28px; }
        .paper-header { align-items: stretch; display: grid; grid-template-columns: minmax(0, 1fr) 255px; margin: 0; }
        .logo { border-bottom: 1px solid #222; border-left: 0; border-right: 0; border-top: 0; display: block; height: 150px; object-fit: contain; padding: 8px; width: 100%; }
        .number-box { border: 1px solid #222; margin: 0; width: auto; }
        .number-box h2 { border-bottom: 1px solid #222; font-size: 15px; margin: 0; padding: 5px; text-align: center; }
        .number-box p { border-bottom: 1px solid #222; display: flex; font-size: 9px; justify-content: space-between; margin: 0; padding: 4px 7px; }
        .number-box p:last-child { border-bottom: 0; }
        .info-grid { border: 1px solid #222; border-top: 0; column-gap: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin: 0; row-gap: 0; }
        .info-cell { border-right: 1px solid #222; display: grid; margin: 0; min-height: 44px; }
        .info-cell:last-child { border-right: 0; }
        .info-cell.wide { grid-column: span 2; }
        .info-cell:nth-child(3) { border-right: 0; }
        .info-cell:nth-child(4) { border-top: 1px solid #222; }
        .info-cell:nth-child(n+5) { border-top: 1px solid #222; } 
        .info-cell b { border-bottom: 1px solid #222; padding: 4px 7px; }
        .info-cell span { padding: 5px 7px; }
        .rate-table { border-collapse: collapse; font-size: 8px; table-layout: fixed; margin: 0; width: 100%; }
        .rate-table th, .rate-table td { border: 1px solid #222; padding: 6px 5px; vertical-align: top; }
        .rate-table thead th { border-top: 0; }
        .rate-table th { font-size: 7px; font-weight: 700; text-align: center; }
        .rate-table thead { display: table-header-group; }
        .rate-table tr { break-inside: avoid; page-break-inside: avoid; }
        .rate-table th:nth-child(1) { width: 7%; }
        .rate-table th:nth-child(2) { width: 16%; }
        .rate-table th:nth-child(3) { width: 34%; }
        .rate-table th:nth-child(4) { width: 12%; }
        .rate-table th:nth-child(5), .rate-table th:nth-child(6) { width: 15.5%; }
        .rate-table td strong { display: block; }
        .rate-table td small { color: #555; display: block; font-size: 7px; margin-top: 2px; }
        .notes { border: 1px solid #222; border-top: 0; display: grid; grid-template-columns: 90px 1fr; margin: 0; min-height: 46px; }
        .notes b { padding: 7px; }
        .notes span { padding: 7px; }
.paper-footer {
    border: none;
    font-size: 8px;
    line-height: 1.5;
    margin: 0;
    padding: 8px;
    text-align: center;
}      </style></head><body>
      <article class="quotation-paper">
        <header class="paper-header">
          <img class="logo" src="${window.location.origin}/assets/chinar-logo.png" alt="Chinar TV" />
          <div class="number-box">
            <h2>RATE CARD</h2>
            <p><span>No:</span><strong>${escapeHtml(template.id)}</strong></p>
            <p><span>Date:</span><strong>${escapeHtml(template.createdAt)}</strong></p>
            <p><span>Updated:</span><strong>${escapeHtml(template.updatedAt)}</strong></p>
            <p><span>Validity:</span><strong>${escapeHtml(template.validity ?? "30 days")}</strong></p>
          </div>
        </header>
        <div class="info-grid">
          <div class="info-cell wide"><b>Rate Card Name:</b><span>${escapeHtml(template.name)}</span></div>
          <div class="info-cell"><b>Currency:</b><span>${currency}</span></div>
          <div class="info-cell"><b>Rate Type:</b><span>Cost &amp; Selling Rates</span></div>
          <div class="info-cell wide"><b>Prepared By:</b><span>${escapeHtml(preparedBy)}</span></div>
          <div class="info-cell wide"><b>Functions:</b><span>${escapeHtml(templateFunctions(template).join(", "))}</span></div>
        </div>
        <table class="rate-table">
          <thead><tr><th>Item</th><th>Function</th><th>Resource / Description</th><th>Unit</th><th>Cost Rate (${currency})</th><th>Selling Rate (${currency})</th></tr></thead>
          <tbody>${grouped
            .map((group) =>
              group.resources
                .map((resource) => {
                  itemNumber += 1;
                  const rate = templateRate(template, resource.key);
                  return `<tr><td>${itemNumber}</td><td>${escapeHtml(group.functionName)}</td>
                      <td><strong>${escapeHtml(resource.name)}</td>
                      <td>${escapeHtml(rate?.unit ?? "—")}</td>
                      <td>${rate?.cost.toLocaleString() ?? "—"}</td>
                      <td>${rate?.selling.toLocaleString() ?? "—"}</td></tr>`;
                })
                .join(""),
            )
            .join("")}</tbody>
        </table>
        <div class="notes"><b>Notes:</b><span>Rates are provided for cost and selling purposes. Rates are subject to availability and final confirmation.</span></div>
        <footer class="paper-footer">
          Add: House# 6, 3rd Street, Kolola Pushta, District 4, Kabul, Afghanistan.<br />
          Tel: +93 799 491112 &nbsp; Email: info@chinar.tv, www.chinar.tv
        </footer>
      </article>
      </body></html>`);
    popup.document.close();
    popup.focus();
    if (print) {
      window.setTimeout(() => popup.print(), 250);
    }
  }

  function viewPdf(template: RateCardTemplate) {
    downloadPdf(template, false);
  }

  if (editingId) {
    return (
      <section className="page-section rate-template-page">
        <PageHeader
          eyebrow="PRODUCTION / RATE CARD TEMPLATES"
          title={
            editingId === "new"
              ? "Create rate card template"
              : "Edit rate card template"
          }
          copy="Build a reusable resource selection from your existing production functions."
        />
        <div className="rate-template-editor">
          <div className="rate-template-editor-main">
            <section className="panel rate-template-step">
              <span className="eyebrow">STEP 1</span>
              <h2>Template name</h2>
              <p>
                Give this resource selection a clear name your team will
                recognize.
              </p>
              <input
                className="rate-template-name-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Documentary field production"
                autoFocus
              />
            </section>
            <section className="panel rate-template-step">
              <span className="eyebrow">STEP 2</span>
              <h2>Select production resources</h2>
              <p>
                Choose one or more functions, then include the resources you
                need.
              </p>
              <div className="rate-template-function-list">
                {functions.map((functionName) => {
                  const resources = resourcesForFunction(functionName);
                  const selectedCount = resources.filter((resource) =>
                    selectedResources.includes(resource.key),
                  ).length;
                  const expanded = expandedFunctions.includes(functionName);
                  return (
                    <div className="rate-template-function" key={functionName}>
                      <div className="rate-template-function-row">
                        <button
                          type="button"
                          className="rate-template-expand"
                          onClick={() =>
                            setExpandedFunctions((current) =>
                              current.includes(functionName)
                                ? current.filter(
                                    (item) => item !== functionName,
                                  )
                                : [...current, functionName],
                            )
                          }
                          aria-label={`${expanded ? "Collapse" : "Expand"} ${functionName}`}
                        >
                          {expanded ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </button>
                        <label className="rate-template-function-label">
                          <input
                            type="checkbox"
                            checked={selectedFunctions.includes(functionName)}
                            onChange={() => toggleFunction(functionName)}
                          />
                          <strong>{functionName}</strong>
                          <span>
                            {selectedCount}/{resources.length} resources
                          </span>
                        </label>
                      </div>
                      {expanded && (
                        <div className="rate-template-resource-list">
                          {resources.map((resource) => (
                            <label
                              className="rate-template-resource"
                              key={resource.key}
                            >
                              <input
                                type="checkbox"
                                checked={selectedResources.includes(
                                  resource.key,
                                )}
                                onChange={() => toggleResource(resource)}
                              />
                              <span>
                                <strong>{resource.name}</strong>
                                <small>{resource.detail}</small>
                              </span>
                            </label>
                          ))}
                          {!resources.length && (
                            <small>No resources available.</small>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
          <aside className="panel rate-template-summary">
            <div className="rate-template-summary-heading">
              <div>
                <span className="eyebrow">STEP 3</span>
                <h2>Selected resources</h2>
              </div>
              <span className="rate-card-total">
                {selectedResourceList.length}
              </span>
            </div>
            {selectedResourceList.length ? (
              <div className="rate-template-selected-list">
                {selectedResourceList.map((resource) => (
                  <div key={resource.key}>
                    <strong>{resource.name}</strong>
                    <small>
                      {resource.functionName} · {resource.kind}
                    </small>
                    <div className="rate-template-selected-rate">
                      <span>
                        <small>Cost rate</small>
                        <strong>
                          {rates[resource.key]?.currency}{" "}
                          {rates[resource.key]?.cost.toLocaleString()}
                        </strong>
                      </span>
                      <span>
                        <small>Selling rate</small>
                        <strong>
                          {rates[resource.key]?.currency}{" "}
                          {rates[resource.key]?.selling.toLocaleString()}
                        </strong>
                      </span>
                      <span>{rates[resource.key]?.type}</span>
                      <span>{rates[resource.key]?.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rate-template-empty">
                Select resources from the functions to build this template.
              </p>
            )}
            <div className="rate-template-summary-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={resetEditor}
              >
                <X size={14} /> Cancel
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={save}
              >
                <Save size={14} />{" "}
                {editingId === "new" ? "Save template" : "Update template"}
              </button>
            </div>
          </aside>
        </div>
      </section>
    );
  }

  if (scannerTemplate) {
    const editingPage = scannerPages.find((page) => page.id === editingPageId);
    const previewPage = scannerPages.find((page) => page.id === previewPageId);
    return (
      <section className="page-section rate-template-page">
        <PageHeader
          eyebrow="PRODUCTION / RATE CARD TEMPLATES / DOCUMENT ARCHIVE"
          title={
            scannerReplacingId ? "Replace archived document" : "Scan document"
          }
          copy={`Archive supporting documents under ${scannerTemplate.name}.`}
        />
        {previewPage && (
          <div
            className="rate-document-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label="Preview scanned page"
          >
            <div className="rate-document-preview-modal">
              <div className="rate-document-modal-header">
                <div>
                  <span className="eyebrow">PAGE PREVIEW</span>
                  <h2>Scanned image</h2>
                </div>
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Close preview"
                  onClick={() => setPreviewPageId(null)}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="rate-document-preview-stage">
                {previewPage.type === "application/pdf" ? (
                  <iframe title="Document preview" src={previewPage.dataUrl} />
                ) : (
                  <img
                    src={previewPage.processedDataUrl ?? previewPage.dataUrl}
                    alt="Selected scanned page preview"
                  />
                )}
              </div>
            </div>
          </div>
        )}
        {editingPage && (
          <div
            className="rate-document-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label="Edit scanned page"
          >
            <div className="rate-document-editor-modal">
              <div className="rate-document-modal-header">
                <div>
                  <span className="eyebrow">INDIVIDUAL PAGE EDITOR</span>
                  <h2>Edit scanned page</h2>
                </div>
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Close editor"
                  onClick={() => setEditingPageId(null)}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="rate-document-editor-body">
                <div className="rate-document-editor-stage">
                  <img
                    src={editingPage.processedDataUrl ?? editingPage.dataUrl}
                    alt="Page being edited"
                  />
                  <svg
                    className="rate-document-corner-overlay"
                    viewBox="0 0 1000 1000"
                    preserveAspectRatio="none"
                  >
                    <polygon
                      points={(editingPage.corners ?? defaultScannerCorners())
                        .map((point) => `${point.x},${point.y}`)
                        .join(" ")}
                    />
                    {(editingPage.corners ?? defaultScannerCorners()).map(
                      (point, cornerIndex) => (
                        <circle
                          key={cornerIndex}
                          cx={point.x}
                          cy={point.y}
                          r="18"
                          onPointerDown={(event) =>
                            event.currentTarget.setPointerCapture(
                              event.pointerId,
                            )
                          }
                          onPointerMove={(event) => {
                            if (
                              event.currentTarget.hasPointerCapture(
                                event.pointerId,
                              )
                            ) {
                              updateCorner(editingPage.id, cornerIndex, event);
                            }
                          }}
                          onPointerUp={(event) => {
                            if (
                              event.currentTarget.hasPointerCapture(
                                event.pointerId,
                              )
                            ) {
                              event.currentTarget.releasePointerCapture(
                                event.pointerId,
                              );
                            }
                          }}
                        />
                      ),
                    )}
                  </svg>
                </div>
                <aside className="rate-document-editor-tools">
                  <div className="rate-document-editor-tools-row">
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={async () => {
                        setProcessingPageId(editingPage.id);
                        const corners = await detectDocumentCorners(
                          editingPage.dataUrl,
                        );
                        await updateProcessedPage(editingPage.id, {
                          corners: corners ?? defaultScannerCorners(),
                        });
                        setProcessingPageId(null);
                      }}
                    >
                      <ScanLine size={14} /> Auto Detect
                    </button>
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() =>
                        void updateProcessedPage(editingPage.id, {
                          corners: defaultScannerCorners(),
                        })
                      }
                    >
                      <Maximize2 size={14} /> Manual Crop
                    </button>
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() =>
                        void updateProcessedPage(editingPage.id, {
                          corners: undefined,
                          rotation: 0,
                          filter: "Original",
                          brightness: 0,
                          contrast: 100,
                        })
                      }
                    >
                      <X size={14} /> Reset
                    </button>
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() =>
                        void updateProcessedPage(editingPage.id, {
                          rotation: (editingPage.rotation + 90) % 360,
                        })
                      }
                    >
                      <RotateCw size={14} /> Rotate
                    </button>
                  </div>
                  <div>
                    <span className="eyebrow">IMAGE FILTER</span>
                    <div className="rate-document-filter-list">
                      {(
                        [
                          "Original",
                          "Auto Enhance",
                          "Grayscale",
                          "Black & White",
                        ] as ScanFilter[]
                      ).map((filter) => (
                        <button
                          type="button"
                          key={filter}
                          className={
                            editingPage.filter === filter ? "selected" : ""
                          }
                          onClick={() =>
                            void updateProcessedPage(editingPage.id, { filter })
                          }
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="rate-document-range">
                    <span>
                      <b>Brightness</b>
                      <small>{editingPage.brightness}</small>
                    </span>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={editingPage.brightness}
                      onChange={(event) =>
                        void updateProcessedPage(editingPage.id, {
                          brightness: Number(event.target.value),
                        })
                      }
                    />
                  </label>
                  <label className="rate-document-range">
                    <span>
                      <b>Contrast</b>
                      <small>{editingPage.contrast}%</small>
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={editingPage.contrast}
                      onChange={(event) =>
                        void updateProcessedPage(editingPage.id, {
                          contrast: Number(event.target.value),
                        })
                      }
                    />
                  </label>
                  {processingPageId === editingPage.id && (
                    <small className="rate-document-processing">
                      Updating preview...
                    </small>
                  )}
                </aside>
              </div>
              <div className="rate-document-modal-footer">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setEditingPageId(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => setEditingPageId(null)}
                >
                  <Save size={14} /> Save changes
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="rate-document-scanner">
          <div className="rate-document-scanner-main">
            {cameraOpen && (
              <section className="rate-document-camera panel">
                <video ref={cameraVideoRef} playsInline muted />
                <div
                  className="rate-document-camera-guide"
                  aria-hidden="true"
                />
                <div className="rate-document-camera-controls">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => {
                      stopCamera();
                      setCameraOpen(false);
                      setCameraSwitchAvailable(false);
                    }}
                  >
                    <X size={15} /> Close
                  </button>
                  <button
                    type="button"
                    className="rate-document-capture"
                    aria-label="Capture document"
                    onClick={captureCameraPage}
                  >
                    <span />
                  </button>
                  {cameraSwitchAvailable ? (
                    <button
                      type="button"
                      className="button rate-document-camera-switch"
                      onClick={() =>
                        void openLiveCamera(
                          cameraFacingMode === "environment" ? "user" : "environment",
                        )
                      }
                    >
                      <RotateCw size={15} />
                      {cameraFacingMode === "environment" ? "Front" : "Rear"}
                    </button>
                  ) : (
                    <span />
                  )}
                </div>
              </section>
            )}
            <section className="panel rate-document-scanner-toolbar">
              <div>
                <span className="eyebrow">DOCUMENT PAGES</span>
                <h2>
                  {scannerPages.length
                    ? `${scannerPages.length} page${scannerPages.length === 1 ? "" : "s"} ready`
                    : "Add your first page"}
                </h2>
                <p>
                  Use your camera on mobile or upload PDF, JPG and PNG files
                  from your device.
                </p>
              </div>
              <div className="rate-document-scanner-actions">
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => void openLiveCamera()}
                >
                  <Camera size={15} /> Take photo
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => uploadInputRef.current?.click()}
                >
                  <Upload size={15} /> Upload document
                </button>
                <input
                  ref={cameraInputRef}
                  className="rate-document-hidden-input"
                  type="file"
                  accept="image/jpeg,image/png"
                  capture="environment"
                  onChange={(event) => {
                    void addScannerFiles(event.target.files);
                    event.currentTarget.value = "";
                  }}
                />
                <input
                  ref={uploadInputRef}
                  className="rate-document-hidden-input"
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  multiple
                  onChange={(event) => {
                    void addScannerFiles(event.target.files);
                    event.currentTarget.value = "";
                  }}
                />
                <input
                  ref={replaceInputRef}
                  className="rate-document-hidden-input"
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(event) => {
                    if (replacingPageId) {
                      void replaceScannerPage(
                        replacingPageId,
                        event.target.files,
                      );
                    }
                    event.currentTarget.value = "";
                  }}
                />
              </div>
            </section>
            {scannerError && (
              <div className="rate-document-scanner-error" role="alert">
                <FileText size={15} /> {scannerError}
              </div>
            )}
            {scannerPages.length ? (
              <div className="rate-document-page-grid">
                {scannerPages.map((page, index) => (
                  <article className="rate-document-page" key={page.id}>
                    <div className="rate-document-page-preview">
                      {page.type === "application/pdf" ? (
                        <iframe
                          title={`Document page ${index + 1}`}
                          src={page.dataUrl}
                        />
                      ) : (
                        <div className="rate-document-page-image">
                          <img
                            src={page.processedDataUrl ?? page.dataUrl}
                            alt={`Scanned document page ${index + 1}`}
                          />
                        </div>
                      )}
                      <span>Page {index + 1}</span>
                    </div>
                    <div className="rate-document-page-actions">
                      {page.type !== "application/pdf" && (
                        <>
                          <button
                            type="button"
                            className="icon-button"
                            title="Edit page"
                            aria-label={`Edit page ${index + 1}`}
                            onClick={() => setEditingPageId(page.id)}
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            type="button"
                            className="icon-button"
                            title="Preview page"
                            aria-label={`Preview page ${index + 1}`}
                            onClick={() => setPreviewPageId(page.id)}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            className="icon-button"
                            title="Replace page"
                            aria-label={`Replace page ${index + 1}`}
                            onClick={() => {
                              setReplacingPageId(page.id);
                              replaceInputRef.current?.click();
                            }}
                          >
                            <Upload size={15} />
                          </button>
                          <button
                            type="button"
                            className="icon-button"
                            title="Rotate page"
                            aria-label={`Rotate page ${index + 1}`}
                            onClick={() =>
                              void updateProcessedPage(page.id, {
                                rotation: (page.rotation + 90) % 360,
                              })
                            }
                          >
                            <RotateCw size={15} />
                          </button>
                          {page.captured && (
                            <button
                              type="button"
                              className="icon-button"
                              title="Retake page"
                              aria-label={`Retake page ${index + 1}`}
                              onClick={() => retakeCameraPage(page.id)}
                            >
                              <Camera size={15} />
                            </button>
                          )}
                        </>
                      )}
                      <button
                        type="button"
                        className="icon-button danger-text"
                        title="Remove page"
                        aria-label={`Remove page ${index + 1}`}
                        onClick={() => removeScannerPage(page.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </article>
                ))}
                <button
                  type="button"
                  className="rate-document-add-page"
                  onClick={() => uploadInputRef.current?.click()}
                >
                  <ImagePlus size={22} />
                  <strong>Add more pages</strong>
                  <small>JPG or PNG</small>
                </button>
              </div>
            ) : (
              <div className="panel rate-document-empty">
                <ScanLine size={30} />
                <h2>No pages added yet</h2>
                <p>
                  Capture a page with your camera or choose a document from your
                  computer.
                </p>
              </div>
            )}
          </div>
          <aside className="panel rate-document-scanner-summary">
            <span className="eyebrow">ARCHIVE DETAILS</span>
            <h2>{scannerTemplate.name}</h2>
            <label>
              Document name
              <input
                value={scannerName}
                onChange={(event) => setScannerName(event.target.value)}
                placeholder="e.g. Signed approval - January"
                autoFocus
              />
            </label>
            <div className="rate-document-format-note">
              <Check size={15} />
              Images will be combined into one PDF when saved.
            </div>
            <div className="rate-template-summary-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={closeScanner}
              >
                <X size={14} /> Cancel
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={() => void saveScannedDocument()}
                disabled={scannerSaving}
              >
                <Save size={14} />{" "}
                {scannerSaving ? "Saving..." : "Save document"}
              </button>
            </div>
          </aside>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section rate-template-page">
      <PageHeader
        eyebrow="PRODUCTION / RATE CARD TEMPLATES"
        title="Rate Card Templates"
        copy="Create and maintain reusable production resource selections for your team."
        action={canManage ? "Create template" : undefined}
        onAction={canManage ? beginCreate : undefined}
      />
      {!canManage && (
        <div className="rate-template-access-note">
          <FolderOpen size={16} /> Templates are managed by the Head of
          Operations.
        </div>
      )}
      {templates.length ? (
        <div className="rate-template-grid">
          {templates.map((template) => (
            <article className="panel rate-template-card" key={template.id}>
              <div className="rate-template-card-top">
                <div className="rate-template-card-icon">
                  <FilePlus2 size={18} />
                </div>
                <div className="rate-template-card-actions">
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => viewPdf(template)}
                    title="View PDF"
                    aria-label={`View ${template.name} PDF`}
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => downloadPdf(template)}
                    title="Download PDF"
                    aria-label={`Download ${template.name} PDF`}
                  >
                    <Download size={15} />
                  </button>
                  {canManage && (
                    <>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => beginEdit(template)}
                        title="Edit template"
                        aria-label={`Edit ${template.name}`}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        className="icon-button danger-text"
                        onClick={() => {
                          if (window.confirm(`Delete "${template.name}"?`))
                            onDelete(template.id);
                        }}
                        title="Delete template"
                        aria-label={`Delete ${template.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <h2>{template.name}</h2>
              <p>
                {templateFunctions(template).length} function
                {templateFunctions(template).length === 1 ? "" : "s"} ·{" "}
                {template.resourceKeys.length} resource
                {template.resourceKeys.length === 1 ? "" : "s"}
              </p>
              <div className="rate-template-card-functions">
                {templateFunctions(template).map((functionName) => (
                  <span key={functionName}>{functionName}</span>
                ))}
              </div>
              <button
                type="button"
                className="rate-template-scan-button"
                onClick={() => openScanner(template)}
              >
                <ScanLine size={14} /> Scan document
              </button>
              {scannedDocuments.filter(
                (document) => document.templateId === template.id,
              ).length > 0 && (
                <div className="rate-template-archive">
                  <div className="rate-template-archive-heading">
                    <span>
                      <FileText size={13} /> Archived documents
                    </span>
                    <small>
                      {
                        scannedDocuments.filter(
                          (document) => document.templateId === template.id,
                        ).length
                      }
                    </small>
                  </div>
                  {scannedDocuments
                    .filter((document) => document.templateId === template.id)
                    .map((document) => (
                      <div
                        className="rate-template-archive-item"
                        key={document.id}
                      >
                        <span>
                          <strong>{document.name}</strong>
                          <small>
                            {document.pages.length} page
                            {document.pages.length === 1 ? "" : "s"} ·{" "}
                            {document.createdAt}
                          </small>
                        </span>
                        <div>
                          <button
                            type="button"
                            className="icon-button"
                            title="View document"
                            aria-label={`View ${document.name}`}
                            onClick={() => openSavedDocument(document)}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            className="icon-button"
                            title="Download document"
                            aria-label={`Download ${document.name}`}
                            onClick={() => openSavedDocument(document, true)}
                          >
                            <Download size={14} />
                          </button>
                          <button
                            type="button"
                            className="icon-button"
                            title="Replace document"
                            aria-label={`Replace ${document.name}`}
                            onClick={() => openScanner(template, document)}
                          >
                            <ScanLine size={14} />
                          </button>
                          <button
                            type="button"
                            className="icon-button danger-text"
                            title="Delete document"
                            aria-label={`Delete ${document.name}`}
                            onClick={() => deleteSavedDocument(document.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
              <footer>
                <span>Created {template.createdAt}</span>
                <span>Updated {template.updatedAt}</span>
              </footer>
            </article>
          ))}
        </div>
      ) : (
        <div className="panel rate-template-empty-state">
          <FilePlus2 size={28} />
          <h2>No rate card templates yet</h2>
          <p>
            Create a template to organize frequently used production resources.
          </p>
          {canManage && (
            <button className="button button-primary" onClick={beginCreate}>
              Create your first template
            </button>
          )}
        </div>
      )}
    </section>
  );
}
