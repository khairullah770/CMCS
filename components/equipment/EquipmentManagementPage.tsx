"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import {
  Check,
  CircleDollarSign,
  ChevronLeft,
  ChevronRight,
  Building2,
  Download,
  Edit3,
  Eye,
  Image as ImageIcon,
  Package,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { PageHeader } from "../common/PageHeader";
import {
  equipmentCompanies,
  equipmentFunctions,
  equipmentSeed,
  equipmentSuppliers,
  Equipment,
  EquipmentCompany,
  EquipmentFunction,
  EquipmentStatus,
  EquipmentSupplier,
} from "../../lib/dummy-data/equipment";

const pageSize = 8;

function ManagementDropdown({
  label,
  items,
  itemCounts,
  totalCount,
  selected,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: {
  label: "Function" | "Company";
  items: string[];
  itemCounts?: Record<string, number>;
  totalCount?: number;
  selected: string | null;
  onSelect: (value: string | null) => void;
  onCreate: (value: string) => void;
  onRename: (from: string, to: string) => void;
  onDelete: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const pluralLabel = label === "Company" ? "companies" : "functions";

  function submitDraft() {
    const value = draft.trim();
    if (!value) {
      setError(`${label} name is required.`);
      return;
    }
    if (items.some((item) => item.toLowerCase() === value.toLowerCase() && item !== editing)) {
      setError(`${label} already exists.`);
      return;
    }
    if (editing) onRename(editing, value);
    else onCreate(value);
    setDraft("");
    setEditing(null);
    setError("");
  }

  return (
    <div className="equipment-management-dropdown">
      <button
        type="button"
        className={`equipment-dropdown-trigger ${selected ? "has-value" : ""}`}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <span>{selected ?? `All ${pluralLabel}`}</span>
        <ChevronRight size={14} className={open ? "dropdown-chevron-open" : ""} />
      </button>
      {open && (
        <div className="equipment-dropdown-menu">
          <button type="button" className="equipment-dropdown-option all-option" onClick={() => { onSelect(null); setOpen(false); }}>
            <span>All {pluralLabel}</span>
            {totalCount !== undefined && <span className="equipment-dropdown-count">{totalCount}</span>}
          </button>
          {items.map((item) => (
            <div className="equipment-managed-option" key={item}>
              <button type="button" className={selected === item ? "selected" : ""} onClick={() => { onSelect(selected === item ? null : item); setOpen(false); }}>
                <span className="equipment-dropdown-item-name">{item}</span>
                {itemCounts && <span className="equipment-dropdown-count">{itemCounts[item] ?? 0}</span>}
              </button>
              <button type="button" className="equipment-option-action" onClick={() => { setEditing(item); setDraft(item); setError(""); }} aria-label={`Edit ${item}`}>
                <Edit3 size={12} />
              </button>
              <button type="button" className="equipment-option-action danger-text" onClick={() => onDelete(item)} aria-label={`Delete ${item}`}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <div className="equipment-dropdown-editor">
            {editing && <small>Editing {label.toLowerCase()}</small>}
            <input
              value={draft}
              onChange={(event) => { setDraft(event.target.value); setError(""); }}
              onKeyDown={(event) => { if (event.key === "Enter") submitDraft(); }}
              placeholder={`New ${label.toLowerCase()} name`}
              aria-label={`${editing ? "Edit" : "New"} ${label.toLowerCase()} name`}
            />
            {error && <span className="field-error">{error}</span>}
            <div>
              {editing && <button type="button" onClick={() => { setEditing(null); setDraft(""); setError(""); }}>Cancel</button>}
              <button type="button" className="equipment-create-option" onClick={submitDraft}>
                <Plus size={12} /> {editing ? "Save changes" : `Create ${label}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function nextEquipmentId(items: Equipment[]) {
  const max = items.reduce((highest, item) => {
    const number = Number(item.id.replace("EQP-", ""));
    return Number.isFinite(number) ? Math.max(highest, number) : highest;
  }, 0);
  return `EQP-${String(max + 1).padStart(4, "0")}`;
}

function EquipmentDialog({
  equipment,
  existingItems,
  availableFunctions,
  availableCompanies,
  onClose,
  onSave,
}: {
  equipment?: Equipment;
  existingItems: Equipment[];
  availableFunctions: string[];
  availableCompanies: string[];
  onClose: () => void;
  onSave: (item: Equipment) => void;
}) {
  const [name, setName] = useState(equipment?.name ?? "");
  const [initialValue, setInitialValue] = useState(String(equipment?.initialValue ?? ""));
  const [currency, setCurrency] = useState(equipment?.currency ?? "USD");
  const [supplier, setSupplier] = useState<EquipmentSupplier>(equipment?.supplier ?? "No Supplier");
  const [company, setCompany] = useState<EquipmentCompany>(equipment?.company ?? availableCompanies[0] ?? "");
  const [functions, setFunctions] = useState<EquipmentFunction[]>(equipment?.functions ?? []);
  const [ata, setAta] = useState(equipment?.ata ?? false);
  const [ataInformation, setAtaInformation] = useState(equipment?.ataInformation ?? "");
  const [status, setStatus] = useState<EquipmentStatus>(equipment?.status ?? "Active");
  const [image, setImage] = useState(equipment?.image ?? "");
  const [error, setError] = useState("");

  function toggleFunction(value: EquipmentFunction) {
    setFunctions((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = Number(initialValue);
    if (!name.trim()) return setError("Equipment name is required.");
    if (!initialValue.trim() || !Number.isFinite(value) || value < 0) {
      return setError("Initial value must be a non-negative number.");
    }
    if (!company) return setError("Select exactly one company.");
    if (!functions.length) return setError("Select at least one function.");
    const id = equipment?.id ?? nextEquipmentId(existingItems);
    if (existingItems.some((item) => item.id === id && item.id !== equipment?.id)) {
      return setError("This equipment ID already exists.");
    }
    onSave({
      id,
      name: name.trim(),
      initialValue: value,
      currency,
      supplier,
      company,
      functions,
      ata,
      ataInformation: ata ? ataInformation.trim() : "",
      status,
      image,
    });
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <div className="dialog equipment-dialog">
        <div className="dialog-head">
          <div>
            <span className="eyebrow">{equipment ? "EDIT EQUIPMENT" : "NEW EQUIPMENT"}</span>
            <h2>{equipment ? "Update equipment" : "Add equipment"}</h2>
            <p>Equipment IDs are generated automatically for new records.</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <form className="dialog-form" onSubmit={submit}>
          <div className="equipment-form-grid">
            <label>Equipment Name *<input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Cinema Camera" /></label>
            <label>Equipment ID<input value={equipment?.id ?? nextEquipmentId(existingItems)} readOnly /></label>
            <label>Initial Value *<input type="number" min="0" step="0.01" value={initialValue} onChange={(event) => setInitialValue(event.target.value)} placeholder="0.00" /></label>
            <label>Currency<select value={currency} onChange={(event) => setCurrency(event.target.value)}><option>USD</option><option>AFN</option><option>EUR</option></select></label>
            <label>Company *<select value={company} onChange={(event) => setCompany(event.target.value as EquipmentCompany)}>{availableCompanies.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Supplier<select value={supplier} onChange={(event) => setSupplier(event.target.value as EquipmentSupplier)}>{equipmentSuppliers.map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>
          <fieldset className="equipment-functions-field">
            <legend>Functions * <small>Choose one or more</small></legend>
            <div className="equipment-function-options">{availableFunctions.map((item) => <button type="button" key={item} className={functions.includes(item) ? "selected" : ""} onClick={() => toggleFunction(item)}><span>{functions.includes(item) && <Check size={12} />}</span>{item}</button>)}</div>
            <div className="equipment-tags">{functions.map((item) => <span key={item}>{item}<button type="button" onClick={() => toggleFunction(item)} aria-label={`Remove ${item}`}><X size={12} /></button></span>)}</div>
          </fieldset>
          <div className="equipment-form-grid equipment-form-secondary">
            <label className="equipment-checkbox"><input type="checkbox" checked={ata} onChange={(event) => setAta(event.target.checked)} /> ATA equipment</label>
            <label>Status<select value={status} onChange={(event) => setStatus(event.target.value as EquipmentStatus)}><option>Active</option><option>Inactive</option></select></label>
          </div>
          {ata && <label>ATA Code / Information<textarea rows={2} value={ataInformation} onChange={(event) => setAtaInformation(event.target.value)} placeholder="Optional ATA code or field information" /></label>}
          <label className="equipment-upload">Equipment Image<input type="file" accept="image/*" onChange={handleImage} /><span><Upload size={15} /> Upload image</span></label>
          {image && <div className="equipment-image-preview"><img src={image} alt="Equipment preview" /><button type="button" onClick={() => setImage("")} aria-label="Remove image"><X size={14} /></button></div>}
          {error && <p className="field-error">{error}</p>}
          <div className="dialog-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit">{equipment ? "Save changes" : "Add equipment"}</button></div>
        </form>
      </div>
    </div>
  );
}

function EquipmentDetails({ equipment, onClose }: { equipment: Equipment; onClose: () => void }) {
  return <div className="dialog-backdrop" role="presentation"><div className="dialog equipment-details-dialog"><div className="dialog-head"><div><span className="eyebrow">EQUIPMENT DETAILS</span><h2>{equipment.name}</h2><p>{equipment.id} · {equipment.company}</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button></div>{equipment.image ? <img className="equipment-detail-image" src={equipment.image} alt="" /> : <div className="equipment-detail-placeholder"><Package size={28} /></div>}<div className="equipment-detail-grid"><div><small>Initial value</small><strong>{equipment.currency} {equipment.initialValue.toLocaleString()}</strong></div><div><small>Supplier</small><strong>{equipment.supplier}</strong></div><div><small>Functions</small><strong>{equipment.functions.join(", ")}</strong></div><div><small>ATA</small><strong>{equipment.ata ? equipment.ataInformation || "Enabled" : "Not enabled"}</strong></div></div><div className="dialog-actions"><button className="button button-secondary" onClick={onClose}>Close</button></div></div></div>;
}

export function EquipmentManagementPage() {
  const [items, setItems] = useState<Equipment[]>(equipmentSeed);
  const [functions, setFunctions] = useState<string[]>(equipmentFunctions);
  const [companies, setCompanies] = useState<string[]>(equipmentCompanies);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | EquipmentStatus>("All");
  const [functionFilter, setFunctionFilter] = useState<EquipmentFunction | null>(null);
  const [companyFilter, setCompanyFilter] = useState<EquipmentCompany | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<"new" | Equipment | null>(null);
  const [details, setDetails] = useState<Equipment | null>(null);
  const activeFilterCount = Number(Boolean(query)) + Number(statusFilter !== "All") + Number(Boolean(functionFilter)) + Number(Boolean(companyFilter));
  const totalValue = items.reduce((total, item) => total + item.initialValue, 0);
  const functionCounts = useMemo(() => functions.reduce<Record<string, number>>((counts, value) => {
    counts[value] = items.reduce((total, item) => total + Number(item.functions.includes(value)), 0);
    return counts;
  }, {}), [functions, items]);
  const companyCounts = useMemo(() => companies.reduce<Record<string, number>>((counts, value) => {
    counts[value] = items.reduce((total, item) => total + Number(item.company === value), 0);
    return counts;
  }, {}), [companies, items]);

  const filtered = useMemo(() => items.filter((item) => {
    const searchable = `${item.id} ${item.name} ${item.company} ${item.supplier} ${item.functions.join(" ")}`.toLowerCase();
    return searchable.includes(query.toLowerCase()) && (statusFilter === "All" || item.status === statusFilter) && (!functionFilter || item.functions.includes(functionFilter)) && (!companyFilter || item.company === companyFilter);
  }), [items, query, statusFilter, functionFilter, companyFilter]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  const allVisibleSelected = visibleItems.length > 0 && visibleItems.every((item) => selectedIds.includes(item.id));

  function updateFilters(update: () => void) {
    update();
    setPage(1);
  }

  function saveItem(item: Equipment) {
    setItems((current) => current.some((existing) => existing.id === item.id) ? current.map((existing) => existing.id === item.id ? item : existing) : [item, ...current]);
    setDialog(null);
  }

  function createFunction(value: string) {
    setFunctions((current) => [...current, value]);
    setFunctionFilter(value);
    setPage(1);
  }

  function renameFunction(from: string, to: string) {
    setFunctions((current) => current.map((item) => item === from ? to : item));
    setItems((current) => current.map((item) => ({
      ...item,
      functions: item.functions.map((itemFunction) => itemFunction === from ? to : itemFunction),
    })));
    if (functionFilter === from) setFunctionFilter(to);
  }

  function deleteFunction(value: string) {
    if (items.some((item) => item.functions.length === 1 && item.functions.includes(value))) {
      window.alert(`"${value}" cannot be deleted while it is the only function on equipment. Add another function first.`);
      return;
    }
    if (!window.confirm(`Delete the function "${value}" and remove it from associated equipment?`)) return;
    setFunctions((current) => current.filter((item) => item !== value));
    setItems((current) => current.map((item) => ({
      ...item,
      functions: item.functions.filter((itemFunction) => itemFunction !== value),
    })));
    if (functionFilter === value) setFunctionFilter(null);
  }

  function createCompany(value: string) {
    setCompanies((current) => [...current, value]);
    setCompanyFilter(value);
    setPage(1);
  }

  function renameCompany(from: string, to: string) {
    setCompanies((current) => current.map((item) => item === from ? to : item));
    setItems((current) => current.map((item) => item.company === from ? { ...item, company: to } : item));
    if (companyFilter === from) setCompanyFilter(to);
  }

  function deleteCompany(value: string) {
    if (items.some((item) => item.company === value)) {
      window.alert(`"${value}" cannot be deleted while equipment is assigned to it. Reassign the equipment first.`);
      return;
    }
    if (!window.confirm(`Delete the company "${value}"?`)) return;
    setCompanies((current) => current.filter((item) => item !== value));
    if (companyFilter === value) setCompanyFilter(null);
  }

  function deleteSelected() {
    if (!selectedIds.length || !window.confirm(`Delete ${selectedIds.length} selected equipment record${selectedIds.length === 1 ? "" : "s"}?`)) return;
    setItems((current) => current.filter((item) => !selectedIds.includes(item.id)));
    setSelectedIds([]);
  }

  function toggleBulkStatus(status: EquipmentStatus) {
    if (!selectedIds.length) return;
    setItems((current) => current.map((item) => selectedIds.includes(item.id) ? { ...item, status } : item));
    setSelectedIds([]);
  }

  function exportCsv() {
    const headers = ["Equipment ID", "Equipment Name", "Initial Value", "Currency", "Company", "Functions", "Supplier", "ATA", "Status"];
    const rows = filtered.map((item) => [item.id, item.name, item.initialValue, item.currency, item.company, item.functions.join("; "), item.supplier, item.ata ? "Yes" : "No", item.status]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "cmcs-equipment.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function toggleVisibleSelection() {
    setSelectedIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleItems.some((item) => item.id === id))
        : Array.from(new Set([...current, ...visibleItems.map((item) => item.id)])),
    );
  }

  function clearFilters() {
    setQuery("");
    setStatusFilter("All");
    setFunctionFilter(null);
    setCompanyFilter(null);
    setPage(1);
  }

  return <section className="page-section equipment-page">
    <PageHeader eyebrow="RESOURCES / EQUIPMENT" title="Equipment Management" copy="Track, maintain and allocate the production equipment available to CMCS teams." action="Add Equipment" onAction={() => setDialog("new")} />
    <div className="equipment-stat-row">
      <div className="panel equipment-stat"><span className="equipment-stat-icon equipment-stat-icon-blue"><Package size={17} /></span><span><strong>{items.length}</strong><small>Total equipment</small></span><em>All records</em></div>
      <div className="panel equipment-stat"><span className="equipment-stat-icon equipment-stat-icon-green"><Check size={17} /></span><span><strong>{items.filter((item) => item.status === "Active").length}</strong><small>Active equipment</small></span><em>{items.filter((item) => item.status === "Inactive").length} inactive</em></div>
      <div className="panel equipment-stat"><span className="equipment-stat-icon equipment-stat-icon-purple"><CircleDollarSign size={17} /></span><span><strong>USD {totalValue.toLocaleString()}</strong><small>Portfolio value</small></span><em>Initial value</em></div>
      <div className="panel equipment-stat"><span className="equipment-stat-icon equipment-stat-icon-amber"><Building2 size={17} /></span><span><strong>{new Set(items.map((item) => item.company)).size}</strong><small>Companies</small></span><em>{items.filter((item) => item.ata).length} ATA records</em></div>
    </div>
    <div className="equipment-layout">
      <div className="equipment-main">
        <div className="equipment-toolbar">
          <label className="inline-search"><Search size={15} /><input value={query} onChange={(event) => updateFilters(() => setQuery(event.target.value))} placeholder="Search equipment..." /></label>
          <ManagementDropdown label="Function" items={functions} itemCounts={functionCounts} totalCount={items.length} selected={functionFilter} onSelect={(value) => updateFilters(() => setFunctionFilter(value))} onCreate={createFunction} onRename={renameFunction} onDelete={deleteFunction} />
          <ManagementDropdown label="Company" items={companies} itemCounts={companyCounts} totalCount={items.length} selected={companyFilter} onSelect={(value) => updateFilters(() => setCompanyFilter(value))} onCreate={createCompany} onRename={renameCompany} onDelete={deleteCompany} />
          <div className="filter-tabs">{(["All", "Active", "Inactive"] as const).map((filter) => <button key={filter} className={statusFilter === filter ? "selected" : ""} onClick={() => updateFilters(() => setStatusFilter(filter))}>{filter}</button>)}</div><button className="button button-secondary" onClick={exportCsv}><Download size={14} /> Export</button>
        </div>
        {selectedIds.length > 0 && <div className="equipment-bulk-bar"><strong>{selectedIds.length} selected</strong><button onClick={() => toggleBulkStatus("Active")}>Activate</button><button onClick={() => toggleBulkStatus("Inactive")}>Deactivate</button><button className="danger-text" onClick={deleteSelected}><Trash2 size={14} /> Delete</button></div>}
        <div className="panel equipment-table-panel"><div className="equipment-table-heading"><div><h2>Equipment inventory</h2><p>Review and manage all production assets.</p></div><span>Updated just now</span></div><div className="table-wrap"><table className="equipment-table"><thead><tr><th><input type="checkbox" checked={allVisibleSelected} onChange={toggleVisibleSelection} aria-label="Select all visible equipment" /></th><th>Equipment ID</th><th>Equipment Name</th><th>Image</th><th>Initial Value</th><th>Company</th><th>Functions</th><th>Supplier</th><th>ATA</th><th>Status</th><th>Actions</th></tr></thead><tbody>{visibleItems.map((item) => <tr key={item.id}><td><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => setSelectedIds((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])} aria-label={`Select ${item.name}`} /></td><td><strong className="equipment-id">{item.id}</strong></td><td><button className="equipment-name-button" onClick={() => setDetails(item)}>{item.name}</button></td><td>{item.image ? <img className="equipment-thumb" src={item.image} alt="" /> : <span className="equipment-no-image"><ImageIcon size={14} /></span>}</td><td>{item.currency} {item.initialValue.toLocaleString()}</td><td>{item.company}</td><td><div className="equipment-table-tags">{item.functions.slice(0, 2).map((value) => <span key={value}>{value}</span>)}{item.functions.length > 2 && <span>+{item.functions.length - 2}</span>}</div></td><td>{item.supplier}</td><td>{item.ata ? <span className="ata-mark">Yes</span> : "—"}</td><td><span className={`status-pill ${item.status.toLowerCase()}`}>{item.status}</span></td><td><div className="equipment-actions"><button className="icon-button" onClick={() => setDetails(item)} aria-label={`View ${item.name}`}><Eye size={14} /></button><button className="icon-button" onClick={() => setDialog(item)} aria-label={`Edit ${item.name}`}><Edit3 size={14} /></button><button className="icon-button danger-text" onClick={() => { if (window.confirm(`Delete ${item.name}?`)) setItems((current) => current.filter((entry) => entry.id !== item.id)); }} aria-label={`Delete ${item.name}`}><Trash2 size={14} /></button></div></td></tr>)}</tbody></table></div>{!visibleItems.length && <div className="empty-state"><Search size={28} /><h3>No matching equipment</h3><p>Try changing your search or filters.</p></div>}<div className="equipment-pagination"><span>Showing {filtered.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span><div><button disabled={page === 1} onClick={() => setPage((current) => current - 1)} aria-label="Previous page"><ChevronLeft size={15} /></button><strong>Page {page} of {pageCount}</strong><button disabled={page === pageCount} onClick={() => setPage((current) => current + 1)} aria-label="Next page"><ChevronRight size={15} /></button></div></div></div>
      </div>
      
    </div>
    {dialog && <EquipmentDialog equipment={dialog === "new" ? undefined : dialog} existingItems={items} availableFunctions={functions} availableCompanies={companies} onClose={() => setDialog(null)} onSave={saveItem} />}
    {details && <EquipmentDetails equipment={details} onClose={() => setDetails(null)} />}
  </section>;
}
