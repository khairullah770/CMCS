"use client";

import { useMemo, useRef, useState } from "react";
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
  type: string;
  rotation: number;
};

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

async function pageAsJpeg(page: ScanPage) {
  const image = await loadImage(page.dataUrl);
  const quarterTurns = ((page.rotation / 90) % 4 + 4) % 4;
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
    dimensions: { width: canvas.width, height: canvas.height } as ImageDimensions,
  };
}

function textBytes(value: string) {
  return new TextEncoder().encode(value);
}

function joinBytes(chunks: Uint8Array[]) {
  const result = new Uint8Array(chunks.reduce((total, chunk) => total + chunk.length, 0));
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
      throw new Error("PDF uploads cannot be combined with additional pages in the browser.");
    }
    return dataUrlToBlob(pages[0].dataUrl);
  }

  const jpegPages = await Promise.all(pages.map(pageAsJpeg));
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const chunks: Uint8Array[] = [
    new Uint8Array([37, 80, 68, 70, 45, 49, 46, 51, 10, 37, 255, 255, 255, 255, 10]),
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
    const scale = Math.min(pageWidth / dimensions.width, pageHeight / dimensions.height);
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
  const [scannedDocuments, setScannedDocuments] = useState<ScannedDocument[]>([]);
  const [scannerTemplate, setScannerTemplate] = useState<RateCardTemplate | null>(
    null,
  );
  const [scannerName, setScannerName] = useState("");
  const [scannerPages, setScannerPages] = useState<ScanPage[]>([]);
  const [scannerReplacingId, setScannerReplacingId] = useState<string | null>(
    null,
  );
  const [scannerError, setScannerError] = useState("");
  const [scannerSaving, setScannerSaving] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
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
    setScannerTemplate(null);
    setScannerName("");
    setScannerPages([]);
    setScannerReplacingId(null);
    setScannerError("");
    setScannerSaving(false);
  }

  function openScanner(template: RateCardTemplate, existing?: ScannedDocument) {
    setScannerTemplate(template);
    setScannerName(existing?.name ?? "");
    setScannerPages(existing?.pages ?? []);
    setScannerReplacingId(existing?.id ?? null);
    setScannerError("");
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
      if (files.some((file) => file.type === "application/pdf") && files.length > 1) {
        throw new Error("Upload a PDF by itself, or upload image pages together.");
      }
      const pages = await Promise.all(
        files.map(async (file) => ({
          id: `${file.name}-${file.lastModified}-${Math.random()}`,
          dataUrl: await readFileAsDataUrl(file),
          type: file.type,
          rotation: 0,
        })),
      );
      setScannerPages((current) => [...current, ...pages]);
    } catch (error) {
      setScannerError(
        error instanceof Error ? error.message : "The document could not be added.",
      );
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

  async function saveScannedDocument() {
    const trimmedName = scannerName.trim();
    if (!scannerTemplate || !trimmedName || !scannerPages.length) {
      setScannerError("Enter a document name and add at least one page.");
      return;
    }
    setScannerSaving(true);
    setScannerError("");
    try {
      const pdfBlob = await buildImagePdf(scannerPages);
      const reader = new FileReader();
      const pdfDataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("The document could not be saved."));
        reader.readAsDataURL(pdfBlob);
      });
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
      onNotify(existing ? "Scanned document replaced." : "Scanned document archived.");
      closeScanner();
    } catch (error) {
      setScannerError(
        error instanceof Error ? error.message : "The document could not be saved.",
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
    return (
      <section className="page-section rate-template-page">
        <PageHeader
          eyebrow="PRODUCTION / RATE CARD TEMPLATES / DOCUMENT ARCHIVE"
          title={scannerReplacingId ? "Replace archived document" : "Scan document"}
          copy={`Archive supporting documents under ${scannerTemplate.name}.`}
        />
        <div className="rate-document-scanner">
          <div className="rate-document-scanner-main">
            <section className="panel rate-document-scanner-toolbar">
              <div>
                <span className="eyebrow">DOCUMENT PAGES</span>
                <h2>{scannerPages.length ? `${scannerPages.length} page${scannerPages.length === 1 ? "" : "s"} ready` : "Add your first page"}</h2>
                <p>Use your camera on mobile or upload PDF, JPG and PNG files from your device.</p>
              </div>
              <div className="rate-document-scanner-actions">
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => cameraInputRef.current?.click()}
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
                        <iframe title={`Document page ${index + 1}`} src={page.dataUrl} />
                      ) : (
                        <img
                          src={page.dataUrl}
                          alt={`Scanned document page ${index + 1}`}
                          style={{ transform: `rotate(${page.rotation}deg)` }}
                        />
                      )}
                      <span>Page {index + 1}</span>
                    </div>
                    <div className="rate-document-page-actions">
                      {page.type !== "application/pdf" && (
                        <button
                          type="button"
                          className="icon-button"
                          title="Rotate page"
                          aria-label={`Rotate page ${index + 1}`}
                          onClick={() => rotateScannerPage(page.id)}
                        >
                          <RotateCw size={15} />
                        </button>
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
                <p>Capture a page with your camera or choose a document from your computer.</p>
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
              <button type="button" className="button button-secondary" onClick={closeScanner}>
                <X size={14} /> Cancel
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={() => void saveScannedDocument()}
                disabled={scannerSaving}
              >
                <Save size={14} /> {scannerSaving ? "Saving..." : "Save document"}
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
              {scannedDocuments.filter((document) => document.templateId === template.id).length > 0 && (
                <div className="rate-template-archive">
                  <div className="rate-template-archive-heading">
                    <span><FileText size={13} /> Archived documents</span>
                    <small>{scannedDocuments.filter((document) => document.templateId === template.id).length}</small>
                  </div>
                  {scannedDocuments
                    .filter((document) => document.templateId === template.id)
                    .map((document) => (
                      <div className="rate-template-archive-item" key={document.id}>
                        <span>
                          <strong>{document.name}</strong>
                          <small>{document.pages.length} page{document.pages.length === 1 ? "" : "s"} · {document.createdAt}</small>
                        </span>
                        <div>
                          <button type="button" className="icon-button" title="View document" aria-label={`View ${document.name}`} onClick={() => openSavedDocument(document)}>
                            <Eye size={14} />
                          </button>
                          <button type="button" className="icon-button" title="Download document" aria-label={`Download ${document.name}`} onClick={() => openSavedDocument(document, true)}>
                            <Download size={14} />
                          </button>
                          <button type="button" className="icon-button" title="Replace document" aria-label={`Replace ${document.name}`} onClick={() => openScanner(template, document)}>
                            <ScanLine size={14} />
                          </button>
                          <button type="button" className="icon-button danger-text" title="Delete document" aria-label={`Delete ${document.name}`} onClick={() => deleteSavedDocument(document.id)}>
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
