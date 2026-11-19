"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import {
  Building2,
  Edit3,
  FileText,
  ImagePlus,
  Mail,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import { Client, ClientType, Project, User } from "../../lib/types";
import { PageHeader } from "../common/PageHeader";

type Activity = {
  id: string;
  clientId: string;
  actionDate: string;
  actionType: string;
  subject: string;
  contact: string;
  priority: "Low" | "Medium" | "High";
  status: "Open" | "In Progress" | "Completed";
  managedBy: string;
};

const activitySeed: Activity[] = [
  {
    id: "ACT-001",
    clientId: "CLT-2026-0001",
    actionDate: "2026-10-24",
    actionType: "Meeting",
    subject: "Production brief review",
    contact: "UNDP Afghanistan",
    priority: "High",
    status: "In Progress",
    managedBy: "Wali Khan",
  },
  {
    id: "ACT-002",
    clientId: "CLT-2026-0002",
    actionDate: "2026-10-21",
    actionType: "Email",
    subject: "Sports package follow-up",
    contact: "Sports Programming Desk",
    priority: "Medium",
    status: "Open",
    managedBy: "Hafizullah Khan",
  },
];

const productionSeed = ["Documentary", "Commercial", "Live Broadcast", "News"];
const interestSeed = [
  "New client",
  "Returning client",
  "Strategic partner",
  "Vendor",
];
const relatedSeed = {
  Quotations: [
    {
      id: "QTN-2026-014",
      clientId: "CLT-2026-0001",
      title: "UNDP awareness production",
      status: "Submitted",
    },
  ],
  Invoices: [
    {
      id: "INV-2026-019",
      clientId: "CLT-2026-0001",
      title: "Production invoice",
      status: "Pending",
    },
  ],
};

function ClientDialog({
  client,
  managers,
  productions,
  interests,
  onClose,
  onSave,
  onAddOption,
  onRemoveOption,
}: {
  client?: Client;
  managers: string[];
  productions: string[];
  interests: string[];
  onClose: () => void;
  onSave: (client: Client) => void;
  onAddOption: (kind: "production" | "interest", value: string) => void;
  onRemoveOption: (kind: "production" | "interest", value: string) => void;
}) {
  const [form, setForm] = useState({
    name: client?.name ?? "",
    type: client?.type ?? ("Company" as ClientType),
    prefix: client?.prefix ?? "Mr.",
    firstName: client?.firstName ?? "",
    lastName: client?.lastName ?? "",
    jobTitle: client?.jobTitle ?? "",
    production: client?.production ?? productions[0],
    interest: client?.interest ?? interests[0],
    managedBy: client?.managedBy ?? managers[0],
    phone: client?.phone ?? "",
    email: client?.email ?? "",
    address: client?.address ?? "",
    notes: client?.notes ?? "",
    profileImage: client?.profileImage ?? "",
  });
  const [error, setError] = useState("");
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const update = (key: string, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  function addCustomOption(kind: "production" | "interest") {
    const value = window.prompt(
      `Enter a custom ${kind === "production" ? "production" : "interest"}:`,
    )?.trim();
    if (!value) return;

    onAddOption(kind, value);
    update(kind, value);
  }
  function removeOption(kind: "production" | "interest") {
    const value = form[kind];
    const options = kind === "production" ? productions : interests;
    if (
      options.length <= 1 ||
      !window.confirm(`Remove "${value}" from the ${kind} options?`)
    ) {
      return;
    }

    onRemoveOption(kind, value);
    update(kind, options.find((option) => option !== value) ?? "");
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Client or company name is required.");
      return;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Enter a valid email address.");
      return;
    }
    onSave({
      ...form,
      id: client?.id ?? "",
      name: form.name.trim(),
      contactPerson: `${form.firstName} ${form.lastName}`.trim(),
      createdAt: client?.createdAt ?? new Date().toISOString().slice(0, 10),
    });
  }
  return (
    <div className="dialog-backdrop" role="presentation">
      <div
        className="dialog client-dialog client-profile-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-dialog-title"
      >
        <div className="dialog-head">
          <div>
            <span className="eyebrow">
              {client ? "EDIT CLIENT" : "NEW CLIENT"}
            </span>
            <h2 id="client-dialog-title">
              {client ? "Update client profile" : "Create client profile"}
            </h2>
            <p>
              Keep client details, contacts and commercial preferences in one
              place.
            </p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <form className="dialog-form" onSubmit={submit}>
          <div className="client-dialog-section client-details-section">
            <div className="client-section-title">
              <Building2 size={15} />
              <div>
                <strong>Client details</strong>
                <small>Basic identity and commercial preferences</small>
              </div>  
            </div>
            <div className="client-form-grid">
              <label className="client-span-2">
                <span className="client-field-label">
                  Client / Company Name{" "}
                  <span className="required-mark">*</span>
                </span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. United Nations Development Programme"
                />
              </label>
              <label>
                Managed By
                <input
                  value={form.managedBy}
                  onChange={(e) => update("managedBy", e.target.value)}
                  placeholder="Enter manager name"
                />
              </label>
              <label>
                Client Type
                <select
                  value={form.type}
                  onChange={(e) => update("type", e.target.value)}
                >
                  <option>Company</option>
                  <option>Organization</option>
                  <option>Individual</option>
                  <option> Government</option>
                </select>
              </label>
              <label>
                Production
                <div className="client-option-field">
                  <select
                    value={form.production}
                    onChange={(e) => update("production", e.target.value)}
                  >
                    {productions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => addCustomOption("production")}
                    aria-label="Add custom production"
                    title="Add custom production"
                  >
                    <Plus size={13} />
                  </button>
                  <button
                    type="button"
                    className="icon-button danger-text"
                    onClick={() => removeOption("production")}
                    aria-label="Remove selected production"
                    title="Remove selected production"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </label>
              <label>
                Interest
                <div className="client-option-field">
                  <select
                    value={form.interest}
                    onChange={(e) => update("interest", e.target.value)}
                  >
                    {interests.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => addCustomOption("interest")}
                    aria-label="Add custom interest"
                    title="Add custom interest"
                  >
                    <Plus size={13} />
                  </button>
                  <button
                    type="button"
                    className="icon-button danger-text"
                    onClick={() => removeOption("interest")}
                    aria-label="Remove selected interest"
                    title="Remove selected interest"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </label>
            </div>
          </div>
          <div className="client-dialog-section">
            <div className="client-section-title">
              <UserRound size={15} />
              <div>
                <strong>Contact information</strong>
                <small>Primary contact details for this client</small>
              </div>
            </div>
            <div className="client-form-grid">
              <label>
                Prefix
                <select
                  value={form.prefix}
                  onChange={(e) => update("prefix", e.target.value)}
                >
                  <option>Mr.</option>
                  <option>Ms.</option>
                  <option>Dr.</option>
                  <option>Prof.</option>
                  <option>Rev.</option>
                  <option>Mrs.</option>
                </select>
              </label>
              <label>
                First Name
                <input
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                />
              </label>
              <label>
                Last Name
                <input
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                />
              </label>
              <label>
                Job Title
                <input
                  value={form.jobTitle}
                  onChange={(e) => update("jobTitle", e.target.value)}
                  placeholder="Procurement manager"
                />
              </label>
              <label>
                Telephone
                <input
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder=""
                />
              </label>
              <label>
                Mobile
                <input placeholder="" />
              </label>
              <label className="client-span-2">
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder=""
                />
              </label>
              <label className="client-span-2">
                Address
                <input
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder="Street, city, country"
                />
              </label>
              <label className="client-span-2 client-image-upload">
                Profile Image
                <input
                  ref={profileImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) update("profileImage", URL.createObjectURL(file));
                  }}
                />
                <span>
                  {form.profileImage ? (
                    <img src={form.profileImage} alt="" />
                  ) : (
                    <ImagePlus size={18} />
                  )}
                  <b>
                    {form.profileImage
                      ? "Profile image selected"
                      : "Upload profile image"}
                  </b>
                  <small>PNG or JPG</small>
                </span>
                {form.profileImage && (
                  <button
                    type="button"
                    className="client-image-delete icon-button danger-text"
                    onClick={() => {
                      update("profileImage", "");
                      if (profileImageInputRef.current) {
                        profileImageInputRef.current.value = "";
                      }
                    }}
                    aria-label="Delete profile image"
                    title="Delete profile image"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </label>
            </div>
          </div>
          {error && <p className="field-error">{error}</p>}
          <div className="dialog-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="button button-primary" type="submit">
              {client ? "Save changes" : "Create client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ActivityDialog({
  activity,
  clientName,
  onClose,
  onSave,
}: {
  activity?: Activity;
  clientName: string;
  onClose: () => void;
  onSave: (activity: Activity) => void;
}) {
  const [form, setForm] = useState({
    actionDate: activity?.actionDate ?? new Date().toISOString().slice(0, 10),
    actionType: activity?.actionType ?? "Meeting",
    subject: activity?.subject ?? "",
    contact: activity?.contact ?? clientName,
    priority: activity?.priority ?? "Medium",
    status: activity?.status ?? "Open",
    managedBy: activity?.managedBy ?? "Wali Khan",
  });
  const update = (key: string, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  return (
    <div className="dialog-backdrop" role="presentation">
      <div className="dialog client-activity-dialog">
        <div className="dialog-head">
          <div>
            <span className="eyebrow">CLIENT ACTIVITY</span>
            <h2>{activity ? "Edit activity" : "Add activity"}</h2>
            <p>Track the next action for {clientName}.</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <form
          className="dialog-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSave({
              ...form,
              id: activity?.id ?? `ACT-${Date.now()}`,
              clientId: activity?.clientId ?? "",
              priority: form.priority as Activity["priority"],
              status: form.status as Activity["status"],
            });
          }}
        >
          <div className="client-form-grid">
            <label>
              Action Date
              <input
                type="date"
                value={form.actionDate}
                onChange={(e) => update("actionDate", e.target.value)}
              />
            </label>
            <label>
              Action Type
              <select
                value={form.actionType}
                onChange={(e) => update("actionType", e.target.value)}
              >
                <option>Meeting</option>
                <option>Call</option>
                <option>Email</option>
                <option>Follow-up</option>
              </select>
            </label>
            <label className="client-span-2">
              Subject
              <input
                required
                value={form.subject}
                onChange={(e) => update("subject", e.target.value)}
              />
            </label>
            <label>
              Contact
              <input
                value={form.contact}
                onChange={(e) => update("contact", e.target.value)}
              />
            </label>
            <label>
              Managed By
              <input
                value={form.managedBy}
                onChange={(e) => update("managedBy", e.target.value)}
              />
            </label>
            <label>
              Priority
              <select
                value={form.priority}
                onChange={(e) => update("priority", e.target.value)}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>
            <label>
              Status
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
              >
                <option>Open</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </label>
          </div>
          <div className="dialog-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="button button-primary">
              {activity ? "Save activity" : "Add activity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ClientManagementPage({
  clients,
  projects,
  user,
  canManage,
  onSave,
  onDelete,
}: {
  clients: Client[];
  projects: Project[];
  user: User;
  canManage: boolean;
  onSave: (client: Client) => { ok: boolean; message?: string };
  onDelete?: (id: string) => { ok: boolean; message?: string };
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | ClientType>("All");
  const [dialog, setDialog] = useState<"new" | Client | null>(null);
  const [activityDialog, setActivityDialog] = useState<Activity | "new" | null>(
    null,
  );
  const [selectedId, setSelectedId] = useState(clients[0]?.id ?? "");
  const [activeTab, setActiveTab] = useState<
    "Quotations" | "Projects" | "Follow-ups" | "Invoices"
  >("Quotations");
  const [notice, setNotice] = useState("");
  const [activities, setActivities] = useState<Activity[]>(activitySeed);
  const [productions, setProductions] = useState(productionSeed);
  const [interests, setInterests] = useState(interestSeed);
  const managers = [
    "Wali Khan",
    "Ahmad Khan",
    "Hafizullah Khan",
    "Zainab Ahmad",
  ];
  const filteredClients = useMemo(
    () =>
      clients.filter(
        (client) =>
          (typeFilter === "All" || client.type === typeFilter) &&
          `${client.id} ${client.name} ${client.contactPerson} ${client.email} ${client.phone}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [clients, query, typeFilter],
  );
  function saveClient(client: Client) {
    const result = onSave(client);
    if (!result.ok) {
      setNotice(result.message ?? "Unable to save client.");
      return;
    }
    setDialog(null);
    setNotice(client.id ? "Client updated." : "Client created.");
  }
  function deleteClient(client: Client) {
    if (!onDelete || !window.confirm(`Delete ${client.name}?`)) return;
    const result = onDelete(client.id);
    setNotice(
      result.ok
        ? "Client deleted."
        : (result.message ?? "Unable to delete client."),
    );
  }
  function saveActivity(activity: Activity) {
    setActivities((current) =>
      current.some((item) => item.id === activity.id)
        ? current.map((item) => (item.id === activity.id ? activity : item))
        : [{ ...activity, clientId: selectedId }, ...current],
    );
    setActivityDialog(null);
    setNotice("Activity saved.");
  }
  const selectedClient =
    clients.find((client) => client.id === selectedId) ?? null;
  const selectedMenuRecords = selectedClient
    ? activeTab === "Projects"
      ? projects
          .filter((project) => project.clientId === selectedClient.id)
          .map((project) => ({
            id: project.id,
            title: project.name,
            status: project.status,
          }))
      : activeTab === "Follow-ups"
        ? activities
            .filter((activity) => activity.clientId === selectedClient.id)
            .map((activity) => ({
              id: activity.id,
              title: activity.subject,
              status: activity.status,
            }))
        : relatedSeed[activeTab]
            .filter((record) => record.clientId === selectedClient.id)
            .map((record) => ({
              id: record.id,
              title: record.title,
              status: record.status,
            }))
    : [];
  return (
    <section className="page-section clients-page client-workspace">
      <PageHeader
        eyebrow="RESOURCES / CLIENT"
        title="Client management"
        copy="Manage client relationships, contacts, activities and commercial records."
        action={canManage ? "Create client" : undefined}
        onAction={() => setDialog("new")}
      />
      <div className="client-summary-row">
        <div className="panel client-summary-card">
          <span className="client-summary-icon client-summary-icon-purple">
            <Building2 size={18} />
          </span>
          <span>
            <strong>{clients.length}</strong>
            <small>Total clients</small>
          </span>
          <em>All records</em>
        </div>
        <div className="panel client-summary-card">
          <span className="client-summary-icon client-summary-icon-blue">
            <UserRound size={18} />
          </span>
          <span>
            <strong>
              {clients.filter((client) => client.type === "Individual").length}
            </strong>
            <small>Individual clients</small>
          </span>
          <em>
            {clients.filter((client) => client.type !== "Individual").length}{" "}
            organizations
          </em>
        </div>
        <div className="panel client-summary-card">
          <span className="client-summary-icon client-summary-icon-green">
            <Mail size={18} />
          </span>
          <span>
            <strong>{clients.filter((client) => client.email).length}</strong>
            <small>With email contact</small>
          </span>
          <em>
            {projects.filter((project) => project.clientId).length} linked
            projects
          </em>
        </div>
      </div>
      <div className="filter-bar clients-toolbar">
        <div className="client-search-wrap">
          <label className="inline-search">
            <Search size={15} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clients, ID, email or phone..."
            />
            {query && (
              <button
                type="button"
                className="client-clear-search"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <XCircle size={15} />
              </button>
            )}
          </label>
          <span className="client-results-count">
            {filteredClients.length} of {clients.length} clients
          </span>
        </div>
        <label className="custom-filter">
          Filter by type
          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value as "All" | ClientType)
            }
          >
            <option>All</option>
            <option>Individual</option>
            <option>Company</option>
            <option>Organization</option>
          </select>
        </label>
      </div>
      {notice && <p className="client-notice">{notice}</p>}
      <div className="panel client-table-panel">
        <div className="table-scroll">
          <table className="client-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Primary contact</th>
                <th>Type</th>
                <th>Production / Interest</th>
                <th>Projects</th>
                <th>Managed by</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  onClick={() => setSelectedId(client.id)}
                  className={
                    selectedId === client.id ? "client-row-selected" : ""
                  }
                >
                  <td>
                    <div className="client-name-cell">
                      <span className="client-avatar">
                        {client.profileImage ? (
                          <img src={client.profileImage} alt="" />
                        ) : (
                          client.name.slice(0, 2).toUpperCase()
                        )}
                      </span>
                      <span>
                        <strong>{client.name}</strong>
                        <small>{client.id}</small>
                      </span>
                    </div>
                  </td>
                  <td>
                    <strong className="client-contact-name">
                      {client.contactPerson || "Not provided"}
                    </strong>
                    <small>
                      {client.email || client.phone || "No contact details"}
                    </small>
                  </td>
                  <td>
                    <span className="client-type-badge">{client.type}</span>
                  </td>
                  <td>
                    <span className="client-focus">
                      {client.production || "General"}
                    </span>
                    <small>{client.interest || "Unspecified"}</small>
                  </td>
                  <td>
                    <span className="client-project-count">
                      {
                        projects.filter(
                          (project) => project.clientId === client.id,
                        ).length
                      }{" "}
                      linked
                    </span>
                  </td>
                  <td>
                    <span className="client-managed-by">
                      {client.managedBy || "Wali Khan"}
                    </span>
                  </td>
                  <td>
                    <div className="client-row-actions">
                      {canManage && (
                        <button
                          className="table-action-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDialog(client);
                          }}
                        >
                          <Edit3 size={13} />
                        </button>
                      )}
                      {canManage && (
                        <button
                          className="table-action-button danger-text"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteClient(client);
                          }}
                          aria-label={`Delete ${client.name}`}
                          title={`Delete ${client.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredClients.length && (
            <div className="empty-state">
              <Search size={28} />
              <h3>No clients found</h3>
              <p>Try another search or client type.</p>
            </div>
          )}
        </div>
      </div>
      {selectedClient && (
        <div className="client-related-panel panel">
          <div className="client-related-heading">
            <span>
              <span className="eyebrow">SELECTED CLIENT</span>
              <h2>{selectedClient.name}</h2>
              <p>
                {selectedClient.contactPerson || "No primary contact"} ·{" "}
                {selectedClient.id}
              </p>
            </span>
            <span className="client-related-status">{selectedClient.type}</span>
          </div>
          <div className="client-detail-tabs" role="tablist">
            {(
              ["Quotations", "Projects", "Follow-ups", "Invoices"] as const
            ).map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                <small>
                  {tab === "Follow-ups"
                    ? activities.filter(
                        (activity) => activity.clientId === selectedClient.id,
                      ).length
                    : tab === "Projects"
                      ? projects.filter(
                          (project) => project.clientId === selectedClient.id,
                        ).length
                      : relatedSeed[tab].filter(
                          (record) => record.clientId === selectedClient.id,
                        ).length}
                </small>
              </button>
            ))}
          </div>
          {activeTab === "Follow-ups" && canManage && (
            <div className="client-related-toolbar">
              <span>Manage next actions for this client.</span>
              <button
                className="button button-primary"
                onClick={() => setActivityDialog("new")}
              >
                <Plus size={13} /> Add follow-up
              </button>
            </div>
          )}
          <div className="client-related-list">
            {activeTab === "Follow-ups" ? (
              <>
                {activities
                  .filter((activity) => activity.clientId === selectedClient.id)
                  .map((activity) => (
                    <div key={activity.id} className="client-related-row">
                      <FileText size={15} />
                      <span>
                        <strong>{activity.subject}</strong>
                        <small>
                          {activity.actionDate} · {activity.actionType} ·{" "}
                          {activity.status}
                        </small>
                      </span>
                      {canManage && (
                        <span className="client-related-actions">
                          <button
                            className="table-action-button"
                            onClick={() => setActivityDialog(activity)}
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            className="table-action-button danger-text"
                            onClick={() =>
                              setActivities((current) =>
                                current.filter(
                                  (item) => item.id !== activity.id,
                                ),
                              )
                            }
                          >
                            <Trash2 size={12} />
                          </button>
                        </span>
                      )}
                    </div>
                  ))}
                {!activities.some(
                  (activity) => activity.clientId === selectedClient.id,
                ) && <p>No follow-ups found for this client.</p>}
              </>
            ) : selectedMenuRecords.length ? (
              selectedMenuRecords.map((record) => (
                <div key={record.id} className="client-related-row">
                  <FileText size={15} />
                  <strong>{record.title}</strong>
                  <small>{record.status}</small>
                </div>
              ))
            ) : (
              <p>No {activeTab.toLowerCase()} records found for this client.</p>
            )}
          </div>
        </div>
      )}
      {dialog && canManage && (
        <ClientDialog
          client={dialog === "new" ? undefined : dialog}
          managers={managers}
          productions={productions}
          interests={interests}
          onClose={() => setDialog(null)}
          onSave={saveClient}
          onAddOption={(kind, value) => {
            if (kind === "production")
              setProductions((current) =>
                current.includes(value) ? current : [...current, value],
              );
            else
              setInterests((current) =>
                current.includes(value) ? current : [...current, value],
              );
          }}
          onRemoveOption={(kind, value) => {
            if (kind === "production")
              setProductions((current) =>
                current.filter((option) => option !== value),
              );
            else
              setInterests((current) =>
                current.filter((option) => option !== value),
              );
          }}
        />
      )}
      {activityDialog && canManage && (
        <ActivityDialog
          activity={activityDialog === "new" ? undefined : activityDialog}
          clientName={
            clients.find((client) => client.id === selectedId)?.name ??
            "selected client"
          }
          onClose={() => setActivityDialog(null)}
          onSave={saveActivity}
        />
      )}
    </section>
  );
}
