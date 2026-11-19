"use client";

import React from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  FileText,
  ReceiptText,
  Users,
  X,
} from "lucide-react";
import {
  Approval,
  Invoice,
  Project,
  ProjectApprovalStatus,
  Quotation,
} from "../../lib/types";
import { formatDate, money } from "../../lib/dummy-data/mock-data";
import { CeoApproval } from "../ceo/CeoApproval";

const getApprovalStatus = (project: Project): ProjectApprovalStatus =>
  project.approvalStatus ??
  (project.status === "Rejected" ? "Rejected" : "Approved");

const getProgressStatus = (project: Project) =>
  getApprovalStatus(project) === "Approved"
    ? project.progressStatus ?? project.status
    : "Not started";

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="project-info-card">
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}

export function ProjectDetailModal({
  selected,
  isCeo,
  isFinance,
  isHoo = false,
  quotation,
  invoice,
  approval,
  onClose,
  onQuotationAction,
  onInvoiceAction,
  onResubmit,
  onApprovalSubmit,
}: {
  selected: Project;
  isCeo: boolean;
  isFinance?: boolean;
  isHoo?: boolean;
  quotation?: Quotation;
  invoice?: Invoice;
  approval?: { status: Approval; comment: string };
  onClose: () => void;
  onQuotationAction?: () => void;
  onInvoiceAction?: () => void;
  onResubmit?: () => void;
  onApprovalSubmit: (project: Project, status: Approval, comment: string) => void;
}) {
  const projectApproval = getApprovalStatus(selected);
  const progress = getProgressStatus(selected);
  const totalCost = selected.resourceCosts ?? selected.budget;
  const sellingAmount = selected.sellingAmount ?? selected.budget;
  const discount = selected.discount ?? 0;
  const tax = selected.tax ?? 0;
  const profit = sellingAmount - totalCost - discount + tax;

  return (
    <div className="project-detail-backdrop" role="presentation">
      <section className="project-detail-screen" aria-label="Project details">
        <header className="project-detail-header">
          <button className="button button-secondary" onClick={onClose}>
            <ArrowLeft size={15} /> Back to projects
          </button>
          <button className="icon-button" onClick={onClose} aria-label="Close project details">
            <X size={18} />
          </button>
        </header>

        <div className="project-detail-title">
          <div>
            <span className="eyebrow">PROJECT DETAILS / {selected.id}</span>
            <h1>{selected.name}</h1>
            <p>{selected.client} · Created {formatDate(selected.createdAt ?? selected.start)}</p>
          </div>
          <div className="project-detail-statuses">
            <span className={`status-pill project-approval-${projectApproval.toLowerCase().replaceAll(" ", "-")}`}>
              {projectApproval}
            </span>
            <span className={`status-pill ${progress.toLowerCase().replaceAll(" ", "-")}`}>
              {progress}
            </span>
          </div>
        </div>

        <div className="project-detail-actions">
          <button className="button button-secondary" onClick={onQuotationAction}>
            <FileText size={15} /> {quotation ? "View quotation" : "Quotation"}
          </button>
          <button className="button button-secondary" onClick={onInvoiceAction}>
            <ReceiptText size={15} /> {invoice ? "View invoice" : "Invoice"}
          </button>
        </div>

        {projectApproval === "Changes Requested" && (
          <div className="project-revision-panel">
            <div>
              <strong>Changes requested</strong>
              <p>Update the requested information and resubmit this project for approval.</p>
              {(selected.revisionComments ?? []).map((comment) => (
                <blockquote key={comment}>{comment}</blockquote>
              ))}
              {approval?.comment && <blockquote>{approval.comment}</blockquote>}
            </div>
            {isHoo && onResubmit && (
              <button className="button button-primary" onClick={onResubmit}>
                <CheckCircle2 size={15} /> Resubmit for approval
              </button>
            )}
          </div>
        )}

        {isCeo && approval?.status === "Pending approval" ? (
          <CeoApproval project={selected} approval={approval} onSubmit={onApprovalSubmit} />
        ) : (
          <div className="project-detail-grid">
            <section className="project-detail-card project-detail-wide">
              <div className="project-detail-card-heading">
                <div>
                  <span className="eyebrow">PROJECT OVERVIEW</span>
                  <h2>Project information</h2>
                </div>
                <CalendarDays size={18} />
              </div>
              <div className="project-info-grid">
                <InfoCard label="Project ID" value={selected.id} />
                <InfoCard label="Project title" value={selected.name} />
                <InfoCard label="Client" value={selected.client} />
                <InfoCard label="Category" value={selected.category ?? selected.department} />
                <InfoCard label="Production manager" value={selected.owner} />
                <InfoCard label="Production dates" value={`${formatDate(selected.start)} - ${formatDate(selected.end)}`} />
                <InfoCard label="Approval status" value={<span className={`status-pill project-approval-${projectApproval.toLowerCase().replaceAll(" ", "-")}`}>{projectApproval}</span>} />
                <InfoCard label="Project progress" value={<span className={`status-pill ${progress.toLowerCase().replaceAll(" ", "-")}`}>{progress}</span>} />
              </div>
              <div className="project-description">
                <span>Description</span>
                <p>{selected.description ?? "No project description has been added."}</p>
              </div>
            </section>

            <section className="project-detail-card">
              <div className="project-detail-card-heading">
                <div>
                  <span className="eyebrow">RESOURCES & SCHEDULE</span>
                  <h2>Delivery plan</h2>
                </div>
                <Users size={18} />
              </div>
              <div className="project-detail-list">
                <InfoCard label="Selected equipment" value={(selected.selectedEquipment ?? []).join(", ")} />
                <InfoCard label="Assigned staff" value={(selected.assignedEmployees ?? []).join(", ") || selected.owner} />
                <InfoCard label="Services" value={(selected.services ?? []).join(", ")} />
                <InfoCard label="Booking dates" value={`${formatDate(selected.start)} - ${formatDate(selected.end)}`} />
                <InfoCard label="Resource costs" value={money(totalCost)} />
              </div>
            </section>

            <section className="project-detail-card">
              <div className="project-detail-card-heading">
                <div>
                  <span className="eyebrow">FINANCIAL INFORMATION</span>
                  <h2>Project value</h2>
                </div>
                <ReceiptText size={18} />
              </div>
              <div className="project-detail-list">
                <InfoCard label="Total cost" value={money(totalCost)} />
                <InfoCard label="Selling amount" value={money(sellingAmount)} />
                <InfoCard label="Estimated profit" value={money(profit)} />
                <InfoCard label="Discount" value={money(discount)} />
                <InfoCard label="Tax" value={money(tax)} />
                <InfoCard label="Payment terms" value={selected.paymentTerms ?? "As agreed in quotation"} />
              </div>
            </section>
          </div>
        )}

        <div className="project-document-summary">
          <span><FileText size={14} /> {quotation ? `${quotation.id} · ${money(quotation.amount)}` : "No quotation linked"}</span>
          <span><ReceiptText size={14} /> {invoice ? `${invoice.id} · ${money(invoice.amount)}` : "No invoice linked"}</span>
        </div>
      </section>
    </div>
  );
}
