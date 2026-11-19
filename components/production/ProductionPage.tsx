"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Copy,
  DollarSign,
  ExternalLink,
  FileCheck2,
  MapPin,
  Package,
  Plus,
  Search,
  Save,
  Send,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import {
  EmployeeTask,
  Project,
  Quotation,
  QuotationItem,
  TaskStatus,
  User,
} from "../../lib/types";
import {
  attendanceToday,
  employeeAttendance,
} from "../../lib/dummy-data/mock-data";
import { PageHeader } from "../common/PageHeader";
import { StatCard } from "../common/StatCard";
import { clientsSeed } from "../../lib/dummy-data/mock-data";
import { equipmentSeed } from "../../lib/dummy-data/equipment";
import { staffFunctions, staffSeed } from "../../lib/dummy-data/staff";
import { QuotationPreview } from "../finance/QuotationManagement";

// ─── Production-specific task seed ───────────────────────────────────────────

const PROD_TASKS_KEY = "cmcsProductionTasks";

const productionTasksSeed: EmployeeTask[] = [
  {
    id: "TSK-PROD-001",
    projectId: "PRJ-2026-0042",
    title: "Shoot community awareness sequences",
    description:
      "Film the planned sequences for the UNDP community awareness campaign. Ensure all locations are scouted and crew briefed.",
    dueDate: "2026-10-18",
    status: "In Progress",
    progress: 60,
    priority: "High",
    assignedTo: "Hafizullah Khan",
  },
  {
    id: "TSK-PROD-002",
    projectId: "PRJ-2026-0036",
    title: "Set up lighting and camera rigs",
    description:
      "Prepare the full lighting grid and camera positions for the Herat Cultural Heritage Series shoot.",
    dueDate: "2026-10-14",
    status: "Completed",
    progress: 100,
    priority: "High",
    assignedTo: "Hafizullah Khan",
  },
  {
    id: "TSK-PROD-003",
    projectId: "PRJ-2026-0045",
    title: "Pre-production location scouting",
    description:
      "Scout and document the key filming locations in Kabul for the documentary pre-production phase.",
    dueDate: "2026-10-20",
    status: "Pending",
    progress: 0,
    priority: "Medium",
    assignedTo: "Hafizullah Khan",
  },
  {
    id: "TSK-PROD-004",
    projectId: "PRJ-2026-0052",
    title: "Coordinate crew assignments for Women in Media Forum",
    description:
      "Confirm all crew roles, brief the team, and distribute the production schedule for the UN Women documentary.",
    dueDate: "2026-10-24",
    status: "Pending",
    progress: 0,
    priority: "Medium",
    assignedTo: "Hafizullah Khan",
  },
  {
    id: "TSK-PROD-005",
    projectId: "PRJ-2026-0031",
    title: "Final review of training footage",
    description:
      "Review all raw footage from the Youth Media Training Series and prepare it for post-production.",
    dueDate: "2026-10-07",
    status: "Completed",
    progress: 100,
    priority: "Low",
    assignedTo: "Ahmad Rahimi",
  },
];

// ─── helpers ─────────────────────────────────────────────────────────────────

const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const priorityClass = (p: string) => p.toLowerCase();

// ─── Task progress modal ──────────────────────────────────────────────────────

function TaskModal({
  task,
  project,
  onClose,
  onProgress,
}: {
  task: EmployeeTask;
  project?: Project;
  onClose: () => void;
  onProgress: (value: number) => void;
}) {
  const [val, setVal] = useState(task.progress);
  return (
    <div className="dialog-backdrop">
      <div className="dialog prod-task-dialog">
        <div className="dialog-head">
          <div>
            <span className="eyebrow">PRODUCTION / {task.id}</span>
            <h2>{task.title}</h2>
            <p>{project?.name ?? task.projectId}</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="prod-task-meta">
          <span>
            <small>Priority</small>
            <b className={`prod-priority ${priorityClass(task.priority)}`}>
              {task.priority}
            </b>
          </span>
          <span>
            <small>Due date</small>
            <strong>{fmtDate(task.dueDate)}</strong>
          </span>
          <span>
            <small>Assigned to</small>
            <strong>{task.assignedTo}</strong>
          </span>
          <span>
            <small>Status</small>
            <span
              className={`status-pill ${task.status
                .toLowerCase()
                .replaceAll(" ", "-")}`}
            >
              {task.status}
            </span>
          </span>
        </div>

        {task.description && (
          <p className="prod-task-desc">{task.description}</p>
        )}

        <label className="prod-progress-label">
          Update progress — {val}%
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={val}
            onChange={(e) => setVal(Number(e.target.value))}
          />
          <div className="prod-progress-bar">
            <span style={{ width: `${val}%` }} />
          </div>
        </label>

        <div className="dialog-actions">
          <button className="button button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="button button-primary"
            onClick={() => {
              onProgress(val);
              onClose();
            }}
          >
            <Send size={14} /> Save progress
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard view ───────────────────────────────────────────────────────────

function DashboardView({
  user,
  tasks,
  projects,
  onSelectTask,
  onNavigate,
}: {
  user: User;
  tasks: EmployeeTask[];
  projects: Project[];
  onSelectTask: (task: EmployeeTask) => void;
  onNavigate: (page: string) => void;
}) {
  const myProjects = projects.filter(
    (p) =>
      p.department === "Production" ||
      p.owner === user.name ||
      p.assignedEmployees?.includes(user.name),
  );

  const metrics = {
    projects: myProjects.length,
    pending: tasks.filter((t) => t.status === "Pending").length,
    active: tasks.filter((t) => t.status === "In Progress").length,
    completed: tasks.filter((t) => t.status === "Completed").length,
  };

  const prodAttendance = attendanceToday.filter(
    (a) => a.department === "Production",
  );
  const present = prodAttendance.filter((a) => a.status === "Present").length;

  return (
    <section className="page-section prod-workspace">
      <PageHeader
        eyebrow="PRODUCTION / DASHBOARD"
        title={`Good morning, ${user.firstName}`}
        copy="Overview of your production projects, tasks, and team attendance."
      />

      {/* Stats */}
      <div className="stat-grid prod-stat-grid">
        <StatCard
          label="My projects"
          value={String(metrics.projects)}
          sub="Production dept"
          icon={ClipboardList}
        />
        <StatCard
          label="Pending tasks"
          value={String(metrics.pending)}
          sub="Not yet started"
          icon={Clock3}
          tone="purple"
        />
        <StatCard
          label="In progress"
          value={String(metrics.active)}
          sub="Active work"
          icon={Activity}
          tone="indigo"
        />
        <StatCard
          label="Completed"
          value={String(metrics.completed)}
          sub="Delivered"
          icon={CheckCircle2}
          tone="green"
        />
      </div>

      {/* Dashboard grid */}
      <div className="prod-dashboard-grid">
        {/* Tasks overview */}
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h2>My tasks</h2>
              <p>Latest assigned production work.</p>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate("My Tasks")}
            >
              View all <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="prod-task-list">
            {tasks.slice(0, 4).map((task) => {
              const proj = projects.find((p) => p.id === task.projectId);
              return (
                <button
                  key={task.id}
                  className="prod-task-row"
                  onClick={() => onSelectTask(task)}
                >
                  <div className="prod-task-row-main">
                    <strong>{task.title}</strong>
                    <small>{proj?.name ?? task.projectId}</small>
                  </div>
                  <div className="prod-task-row-right">
                    <div className="prod-mini-progress">
                      <span style={{ width: `${task.progress}%` }} />
                    </div>
                    <small>{task.progress}%</small>
                    <span
                      className={`status-pill ${task.status
                        .toLowerCase()
                        .replaceAll(" ", "-")}`}
                    >
                      {task.status}
                    </span>
                  </div>
                </button>
              );
            })}
            {!tasks.length && (
              <p className="prod-empty-note">No tasks assigned yet.</p>
            )}
          </div>
        </div>

        {/* Projects summary */}
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h2>Active projects</h2>
              <p>Production projects you are leading or part of.</p>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate("Projects")}
            >
              View all <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="prod-proj-list">
            {myProjects.slice(0, 4).map((proj) => (
              <div key={proj.id} className="prod-proj-row">
                <span
                  className={`prod-proj-dot ${proj.status
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
                />
                <div className="prod-proj-info">
                  <strong>{proj.name}</strong>
                  <small>
                    {proj.client} · Lead: {proj.owner}
                  </small>
                </div>
                <div className="prod-mini-progress">
                  <span style={{ width: `${proj.progress}%` }} />
                </div>
                <small>{proj.progress}%</small>
              </div>
            ))}
            {!myProjects.length && (
              <p className="prod-empty-note">No production projects found.</p>
            )}
          </div>
        </div>

        {/* Today's attendance */}
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h2>Production attendance today</h2>
              <p>
                {present} of {prodAttendance.length} present
              </p>
            </div>
            <CalendarDays size={16} />
          </div>
          <div className="prod-att-list">
            {prodAttendance.map((person) => (
              <div key={person.name} className="prod-att-row">
                <span
                  className={`prod-att-dot prod-att-${person.status.toLowerCase()}`}
                />
                <div className="prod-att-info">
                  <strong>{person.name}</strong>
                  <small>{person.department}</small>
                </div>
                <span className={`status-pill ${person.status.toLowerCase()}`}>
                  {person.status}
                </span>
                <time>{person.time}</time>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Tasks view ───────────────────────────────────────────────────────────────

function MyTasksView({
  tasks,
  projects,
  onSelectTask,
}: {
  tasks: EmployeeTask[];
  projects: Project[];
  onSelectTask: (task: EmployeeTask) => void;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "All">("All");
  const [priorityFilter, setPriorityFilter] = useState<
    "All" | "High" | "Medium" | "Low"
  >("All");

  const visible = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (statusFilter === "All" || t.status === statusFilter) &&
          (priorityFilter === "All" || t.priority === priorityFilter) &&
          `${t.title} ${t.id} ${t.assignedTo}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [tasks, query, statusFilter, priorityFilter],
  );

  return (
    <section className="page-section prod-workspace">
      <PageHeader
        eyebrow="PRODUCTION / MY TASKS"
        title="My tasks"
        copy="Review assigned tasks, priorities, and update your progress."
      />

      {/* Summary cards */}
      <div className="prod-task-summary">
        {(
          [
            { label: "Total", count: tasks.length, cls: "" },
            {
              label: "Pending",
              count: tasks.filter((t) => t.status === "Pending").length,
              cls: "amber",
            },
            {
              label: "In Progress",
              count: tasks.filter((t) => t.status === "In Progress").length,
              cls: "blue",
            },
            {
              label: "Completed",
              count: tasks.filter((t) => t.status === "Completed").length,
              cls: "green",
            },
          ] as const
        ).map((item) => (
          <div
            key={item.label}
            className={`prod-task-chip prod-task-chip-${item.cls}`}
          >
            <strong>{item.count}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="prod-toolbar">
        <label className="inline-search">
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks…"
          />
        </label>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as TaskStatus | "All")
          }
        >
          <option value="All">All statuses</option>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) =>
            setPriorityFilter(
              e.target.value as "All" | "High" | "Medium" | "Low",
            )
          }
        >
          <option value="All">All priorities</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>

      {/* Task cards */}
      <div className="prod-task-cards">
        {visible.map((task) => {
          const proj = projects.find((p) => p.id === task.projectId);
          return (
            <article key={task.id} className="panel prod-task-card">
              <div className="prod-task-card-head">
                <div>
                  <span className="eyebrow">{task.id}</span>
                  <h3>{task.title}</h3>
                  <small>{proj?.name ?? task.projectId}</small>
                </div>
                <span
                  className={`status-pill ${task.status
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
                >
                  {task.status}
                </span>
              </div>

              {task.description && (
                <p className="prod-task-card-desc">{task.description}</p>
              )}

              <div className="prod-task-card-meta">
                <span>
                  <b
                    className={`prod-priority ${priorityClass(task.priority)}`}
                  >
                    {task.priority} priority
                  </b>
                </span>
                <span>
                  <Clock3 size={12} /> Due {fmtDate(task.dueDate)}
                </span>
                <span>
                  <UserRound size={12} /> {task.assignedTo}
                </span>
              </div>

              <div className="prod-task-card-progress">
                <div className="prod-task-progress-bar">
                  <span style={{ width: `${task.progress}%` }} />
                </div>
                <small>{task.progress}% complete</small>
              </div>

              <button
                className="button button-secondary prod-task-card-btn"
                onClick={() => onSelectTask(task)}
              >
                Update progress <ExternalLink size={13} />
              </button>
            </article>
          );
        })}
        {!visible.length && (
          <div className="empty-state">
            <ClipboardList size={28} />
            <h3>No tasks found</h3>
            <p>Try adjusting the filters or search term.</p>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Projects view ────────────────────────────────────────────────────────────

type ProjectResource = {
  id: string;
  name: string;
  type: "Equipment" | "Staff" | "Services";
  function: string;
  quantity: number;
  start: string;
  end: string;
  unit: "Per Hour" | "Per Day" | "Per Project";
  costRate: number;
  sellingRate: number;
  currency: "USD" | "AFN";
  discount: number;
  tax: number;
  notes: string;
};

export function ProjectCreationView({
  projects,
  user,
  project: existingProject,
  quotation: existingQuotation,
  onBack,
  onNotify,
  onSubmitProject,
  onUpdateProject,
}: {
  projects: Project[];
  user: User;
  project?: Project;
  quotation?: Quotation;
  onBack: () => void;
  onNotify: (message: string) => void;
  onSubmitProject?: (project: Project, quotation: Quotation) => void;
  onUpdateProject?: (project: Project, quotation: Quotation) => void;
}) {
  const isEditing = Boolean(existingProject && existingQuotation);
  const [projectId, setProjectId] = useState(
    existingProject?.id ?? `PRJ-2026-${String(Date.now()).slice(-4)}`,
  );
  const [projectStatus, setProjectStatus] = useState<
    "Upcoming" | "In Progress" | "Completed"
  >(
    existingProject?.progressStatus ??
      (existingProject?.status === "Rejected"
        ? "Upcoming"
        : existingProject?.status) ??
      "Upcoming",
  );
  const [approvalStatus, setApprovalStatus] = useState<
    | "Draft"
    | "Under Review"
    | "Revision Requested"
    | "Rejected"
    | "Approved"
  >(
    existingProject?.approvalStatus === "Changes Requested"
      ? "Revision Requested"
      : existingProject?.approvalStatus ??
      (existingQuotation?.status === "Approved" ? "Approved" : "Under Review"),
  );
  const [clientId, setClientId] = useState(
    existingProject?.clientId ??
      clientsSeed.find((client) => client.name === existingProject?.client)?.id ??
      clientsSeed[0]?.id ??
      "",
  );
  const [title, setTitle] = useState(
    existingProject?.name ?? existingQuotation?.project ?? "",
  );
  const [validity, setValidity] = useState(
    existingQuotation?.validity ?? "One Month",
  );
  const [form, setForm] = useState({
    program: existingProject?.description ?? "",
    manager: existingProject?.owner ?? user.name,
    version: "V1",
    country: "Afghanistan",
    city: "Kabul",
    start: existingProject?.start ?? "",
    end: existingProject?.end ?? "",
  });
  const [resourceType, setResourceType] =
    useState<ProjectResource["type"]>("Equipment");
  const [resourceFunction, setResourceFunction] = useState("All functions");
  const [resourceSearch, setResourceSearch] = useState("");
  const [resources, setResources] = useState<ProjectResource[]>(() =>
    existingQuotation?.items?.map((item) => ({
      id: item.id,
      name: item.description,
      type:
        item.subcategory === "Staff"
          ? "Staff"
          : item.subcategory === "Services"
            ? "Services"
            : "Equipment",
      function: item.category ?? "Production",
      quantity: item.quantity,
      start: existingProject?.start
        ? `${existingProject.start}T08:00`
        : "2026-11-18T08:00",
      end: existingProject?.end
        ? `${existingProject.end}T17:00`
        : "2026-11-18T17:00",
      unit: "Per Project",
      costRate: item.unitPrice,
      sellingRate: item.unitPrice,
      currency: "USD",
      discount: 0,
      tax: item.taxRate,
      notes: "",
    })) ?? [],
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [resourceView, setResourceView] = useState<"resources" | "schedule">(
    "resources",
  );
  const [financialTab, setFinancialTab] = useState<
    "Amount Quoted" | "Cost" | "Settings" | "Comment"
  >("Amount Quoted");
  const [currency, setCurrency] = useState<"USD" | "AFN">("USD");
  const [exchangeRate, setExchangeRate] = useState(70);
  const [settings, setSettings] = useState({
    paymentTerms:
      existingProject?.paymentTerms ??
      existingQuotation?.paymentTerm ??
      "30 days",
    discount: existingProject?.discount ?? existingQuotation?.discount ?? 0,
    fees: 0,
    tax: existingProject?.tax ?? existingQuotation?.taxRate ?? 5,
  });
  const [notes, setNotes] = useState({
    internal: "",
    financial: "",
    instructions: "",
  });
  const [saved, setSaved] = useState(false);
  const [printData, setPrintData] = useState<{
    quotation: Quotation;
    project: Project;
  } | null>(null);

  useEffect(() => {
    if (!printData) return;

    const printTimer = window.setTimeout(() => {
      window.print();
      setPrintData(null);
    }, 0);

    return () => window.clearTimeout(printTimer);
  }, [printData]);

  const selectedClient = clientsSeed.find((client) => client.id === clientId);
  const updateForm = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const functions =
    resourceType === "Equipment"
      ? [
          "All functions",
          ...Array.from(
            new Set(equipmentSeed.flatMap((item) => item.functions)),
          ),
        ]
      : resourceType === "Staff"
        ? [
            "All functions",
            ...Array.from(new Set(staffFunctions.map((item) => item.role))),
          ]
        : ["All functions", "Post-production", "Production"];
  const availableResources = useMemo(() => {
    const raw =
      resourceType === "Equipment"
        ? equipmentSeed
            .filter((item) => item.status === "Active")
            .map((item) => ({
              id: item.id,
              name: item.name,
              function: item.functions[0],
              detail: item.company,
            }))
        : resourceType === "Staff"
          ? staffSeed.map((item) => ({
              id: item.id,
              name: `${item.firstName} ${item.lastName}`,
              function: item.function.role,
              detail: item.freelance ? "External" : "Internal",
            }))
          : [
              {
                id: "SVC-001",
                name: "Post-production editing",
                function: "Post-production",
                detail: "CMCS Services",
              },
              {
                id: "SVC-002",
                name: "Location sound mix",
                function: "Post-production",
                detail: "CMCS Services",
              },
              {
                id: "SVC-003",
                name: "Production coordination",
                function: "Production",
                detail: "External Services",
              },
            ];
    return raw.filter(
      (item) =>
        (resourceFunction === "All functions" ||
          item.function === resourceFunction) &&
        `${item.name} ${item.id} ${item.detail}`
          .toLowerCase()
          .includes(resourceSearch.toLowerCase()),
    );
  }, [resourceType, resourceFunction, resourceSearch]);
  const financials = useMemo(() => {
    const multiplier = (item: ProjectResource) =>
      item.unit === "Per Project"
        ? 1
        : item.unit === "Per Hour"
          ? Math.max(
              1,
              Math.ceil(
                (new Date(item.end).getTime() -
                  new Date(item.start).getTime()) /
                  3600000,
              ),
            )
          : Math.max(
              1,
              Math.ceil(
                (new Date(item.end).getTime() -
                  new Date(item.start).getTime()) /
                  86400000,
              ),
            );
    const costBy = (type: ProjectResource["type"]) =>
      resources
        .filter((item) => item.type === type)
        .reduce(
          (sum, item) => sum + item.costRate * item.quantity * multiplier(item),
          0,
        );
    const sellingBy = (type: ProjectResource["type"]) =>
      resources
        .filter((item) => item.type === type)
        .reduce(
          (sum, item) =>
            sum + item.sellingRate * item.quantity * multiplier(item),
          0,
        );
    const selling =
      sellingBy("Equipment") + sellingBy("Staff") + sellingBy("Services");
    const discount = selling * (settings.discount / 100);
    const subtotal = selling - discount;
    const tax = (subtotal + settings.fees) * (settings.tax / 100);
    const cost = costBy("Equipment") + costBy("Staff") + costBy("Services");
    return {
      costBy,
      sellingBy,
      selling,
      discount,
      subtotal,
      tax,
      cost,
      total: subtotal + settings.fees,
      includingTax: subtotal + settings.fees + tax,
      profit: subtotal + settings.fees - cost,
    };
  }, [resources, settings]);
  const conflicts = resources.filter(
    (item, index) =>
      resources.some(
        (other, otherIndex) =>
          otherIndex !== index &&
          other.id === item.id &&
          other.start < item.end &&
          other.end > item.start,
      ) ||
      (item.type === "Staff" &&
        staffSeed
          .find((staff) => staff.id === item.id)
          ?.bookings.some(
            (booking) =>
              booking.startDate < item.end.slice(0, 10) &&
              booking.endDate > item.start.slice(0, 10),
          )),
  );
  const addResource = (resource: {
    id: string;
    name: string;
    function: string;
  }) => {
    const isStaff = resourceType === "Staff";
    const index = isStaff
      ? staffSeed.findIndex((item) => item.id === resource.id)
      : equipmentSeed.findIndex((item) => item.id === resource.id);
    const defaultRate =
      resourceType === "Services"
        ? { cost: 120, selling: 220, unit: "Per Project" as const }
        : isStaff
          ? {
              cost: 900 + Math.max(index, 0) * 150,
              selling: 1250 + Math.max(index, 0) * 200,
              unit: "Per Project" as const,
            }
          : {
              cost: 35 + Math.max(index, 0) * 5,
              selling: 60 + Math.max(index, 0) * 8,
              unit: "Per Day" as const,
            };
    setResources((current) => [
      ...current,
      {
        id: resource.id,
        name: resource.name,
        type: resourceType,
        function: resource.function,
        quantity: 1,
        start: "2026-11-18T08:00",
        end: "2026-11-18T17:00",
        unit: defaultRate.unit,
        costRate: defaultRate.cost,
        sellingRate: defaultRate.selling,
        currency,
        discount: 0,
        tax: settings.tax,
        notes: "",
      },
    ]);
  };
  const updateResource = (
    id: string,
    key: keyof ProjectResource,
    value: string | number,
  ) =>
    setResources((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    );
  const save = () => {
    setSaved(true);
    onNotify(`${projectId} saved as a draft`);
    window.setTimeout(() => setSaved(false), 1800);
  };
  const submit = () => {
    if (!title.trim() || !clientId || !form.manager.trim() || !validity.trim()) {
      onNotify(
        "Complete the project title, client, production manager, and validity first",
      );
      return;
    }

    const quotationDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const resourceMultiplier = (item: ProjectResource) =>
      item.unit === "Per Project"
        ? 1
        : item.unit === "Per Hour"
          ? Math.max(
              1,
              Math.ceil(
                (new Date(item.end).getTime() -
                  new Date(item.start).getTime()) /
                  3600000,
              ),
            )
          : Math.max(
              1,
              Math.ceil(
                (new Date(item.end).getTime() -
                  new Date(item.start).getTime()) /
                  86400000,
              ),
            );
    const quotationItems: QuotationItem[] = resources.length
      ? resources.map((item, index) => ({
          id: `production-${item.id}-${index}`,
          itemNo: String(index + 1),
          category: "Production",
          subcategory: item.type,
          description: item.name,
          quantity: item.quantity,
          days: resourceMultiplier(item),
          unitPrice: item.sellingRate,
          taxRate: settings.tax,
        }))
      : [
          {
            id: "production-default",
            itemNo: "1",
            category: "Production",
            subcategory: "Equipment",
            description: "Production equipment",
            quantity: 1,
            days: 1,
            unitPrice: 0,
            taxRate: settings.tax,
          },
        ];
    const printProject: Project = {
      id: projectId,
      name: title,
      client: selectedClient?.name ?? clientId,
      clientId,
      owner: form.manager,
      start: form.start || new Date().toISOString().slice(0, 10),
      end: form.end || form.start || new Date().toISOString().slice(0, 10),
      progress: 0,
      status: projectStatus,
      department: "Production",
      budget: financials.total,
      approvalStatus: "Under Review",
      progressStatus: projectStatus,
      createdAt: new Date().toISOString().slice(0, 10),
      description:
        form.program || `Production for ${selectedClient?.name ?? clientId}.`,
      services: resources
        .filter((item) => item.type === "Services")
        .map((item) => item.name),
      selectedEquipment: resources
        .filter((item) => item.type === "Equipment")
        .map((item) => item.name),
      assignedEmployees: resources
        .filter((item) => item.type === "Staff")
        .map((item) => item.name),
      resourceCosts: financials.cost,
      sellingAmount: financials.selling,
      discount: financials.discount,
      tax: financials.tax,
      paymentTerms: settings.paymentTerms,
      submissionHistory: [
        { date: new Date().toISOString().slice(0, 10), status: "Under Review", actor: user.name },
      ],
    };
    const quotation: Quotation = {
      id:
        existingQuotation?.id ??
        `QTN-${projectId.replace("PRJ-", "")}`,
      projectId,
      project: title,
      vendor: "Chinar TV",
      amount: financials.total,
      submittedBy: form.manager,
      submitted: quotationDate,
      status: "Under Review",
      quotationDate,
      validity: validity.trim(),
      customerDetails: selectedClient?.name ?? clientId,
      contactPerson: selectedClient?.contactPerson ?? "N/A",
      paymentTerm: settings.paymentTerms,
      deliveryTime: "As scheduled",
      warranty: "N/A",
      items: quotationItems,
      subtotal: financials.selling,
      discount: financials.discount,
      discountType: "fixed",
      mediaRights: settings.fees,
      total: financials.total,
      notes: notes.financial || "The above rates correspond to the cost for one day.",
      history: [
        ...(existingQuotation?.history ?? []),
        {
          status: "Under Review",
          date: quotationDate,
          actor: user.name,
          note: "Project and quotation submitted together for review",
        },
      ],
    };

    setApprovalStatus("Under Review");
    if (isEditing) {
      onUpdateProject?.(printProject, quotation);
    } else {
      onSubmitProject?.(printProject, quotation);
    }
    onNotify(`${projectId} and ${quotation.id} submitted for review`);
    setPrintData({ quotation, project: printProject });
  };
  const duplicate = () => {
    setProjectId(`PRJ-2026-${String(Date.now()).slice(-4)}`);
    setApprovalStatus("Draft");
    onNotify("Project duplicated as a new draft");
  };

  return (
    <section className="page-section prod-workspace pc-workspace">
      {printData && (
        <div className="production-print-preview">
          <QuotationPreview
            quotation={printData.quotation}
            project={printData.project}
          />
        </div>
      )}
      <div className="pc-topbar">
        <div>
          <span className="pc-kicker">PRODUCTION / PROJECTS / CREATION</span>
          <h1>{title || (isEditing ? "Edit production project" : "New production project")}</h1>
          <p>
            Build the project brief, resource schedule and financial estimate in
            one workspace.
          </p>
        </div>
        <div className="pc-toolbar-actions">
          <button className="pc-button ghost" onClick={onBack}>
            <ArrowLeft size={14} /> Projects
          </button>
          <button className="pc-button secondary" onClick={duplicate}>
            <Copy size={14} /> Duplicate
          </button>
          <button
            className="pc-button secondary"
            onClick={() => {
              if (window.confirm("Delete this unsaved project?")) onBack();
            }}
          >
            <Trash2 size={14} /> Delete
          </button>
          <button className="pc-button secondary" onClick={save}>
            <Save size={14} /> {saved ? "Saved" : "Save"}
          </button>
          <button className="pc-button primary" onClick={submit}>
            <Send size={14} /> Validate / submit
          </button>
        </div>
      </div>
      <div className="pc-meta-strip">
        <span>
          <small>Project ID</small>
          <strong>{projectId}</strong>
        </span>
        <span>
          <small>Execution status</small>
          <select
            value={projectStatus}
            onChange={(e) =>
              setProjectStatus(e.target.value as typeof projectStatus)
            }
          >
            <option>Upcoming</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </span>
        <span>
          <small>Approval status</small>
          <strong className="pending">{approvalStatus}</strong>
        </span>
        <span>
          <small>Quote date</small>
          <strong>11 Nov 2026</strong>
        </span>
        <span>
          <small>Prepared by</small>
          <strong>{user.name}</strong>
        </span>
      </div>
      <div className="pc-layout">
        <main>
          <section className="pc-panel">
            <div className="pc-section-heading">
              <div>
                <span className="pc-kicker">01 / PROJECT INFORMATION</span>
                <h2>Project brief</h2>
              </div>
            </div>
            <div className="pc-form-section">
              <h3>Client information</h3>
              <div className="pc-form-grid">
                <label>
                  Client
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                  >
                    {clientsSeed.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name} · {client.id}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Contact
                  <select
                    value={selectedClient?.contactPerson ?? ""}
                    onChange={() => undefined}
                  >
                    {selectedClient && (
                      <option>{selectedClient.contactPerson}</option>
                    )}
                  </select>
                </label>
                <label>
                  TV program
                  <input
                    value={form.program}
                    onChange={(e) => updateForm("program", e.target.value)}
                  />
                </label>
                <label>
                  Production manager
                  <input
                    value={form.manager}
                    onChange={(e) => updateForm("manager", e.target.value)}
                  />
                </label>
              </div>
            </div>
            <div className="pc-form-section">
              <h3>Project details</h3>
              <div className="pc-form-grid">
                <label>
                  Project title
                  <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Kabul Community Stories"
                  />
                </label>
                <label>
                  Version
                  <input
                    value={form.version}
                    onChange={(e) => updateForm("version", e.target.value)}
                  />
                </label>
                <label>
                  Validity
                  <input
                    required
                    value={validity}
                    onChange={(e) => setValidity(e.target.value)}
                    placeholder="e.g. One Month"
                  />
                </label>
                <label>
                  Country
                  <input
                    value={form.country}
                    onChange={(e) => updateForm("country", e.target.value)}
                  />
                </label>
                <label>
                  City
                  <input
                    value={form.city}
                    onChange={(e) => updateForm("city", e.target.value)}
                  />
                </label>
              </div>
            </div>
            <div className="pc-form-section">
              <h3>Project booking period</h3>
              <div className="pc-form-grid two">
                <label>
                  Overall start date
                  <input
                    type="date"
                    value={form.start}
                    onChange={(e) => updateForm("start", e.target.value)}
                  />
                </label>
                <label>
                  Overall end date
                  <input
                    type="date"
                    value={form.end}
                    onChange={(e) => updateForm("end", e.target.value)}
                  />
                </label>
              </div>
            </div>
          </section>
          <section className="pc-panel pc-resources-panel">
            <div className="pc-section-heading">
              <div>
                <span className="pc-kicker">02 / RESOURCES WORKSPACE</span>
                <h2>Resources and schedule</h2>
              </div>
            </div>
            <div className="pc-view-tabs">
              <button
                className={resourceView === "resources" ? "active" : ""}
                onClick={() => setResourceView("resources")}
              >
                <Package size={14} /> Resources
              </button>
              <button
                className={resourceView === "schedule" ? "active" : ""}
                onClick={() => setResourceView("schedule")}
              >
                <CalendarDays size={14} /> Schedule
              </button>
            </div>
            {resourceView === "resources" ? (
              <>
                <div className="pc-resource-tabs">
                  {(
                    [
                      "Equipment",
                      "Staff",
                      "Services",
                    ] as ProjectResource["type"][]
                  ).map((type) => (
                    <button
                      key={type}
                      className={resourceType === type ? "active" : ""}
                      onClick={() => {
                        setResourceType(type);
                        setResourceFunction("All functions");
                      }}
                    >
                      {type}
                      <span>
                        {resources.filter((item) => item.type === type).length}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="pc-picker-toolbar">
                  <select
                    value={resourceFunction}
                    onChange={(e) => setResourceFunction(e.target.value)}
                  >
                    {functions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                  <label className="pc-search">
                    <Search size={14} />
                    <input
                      value={resourceSearch}
                      onChange={(e) => setResourceSearch(e.target.value)}
                      placeholder="Search resources"
                    />
                  </label>
                </div>
                <div className="pc-resource-list">
                  {availableResources.map((resource) => (
                    <button
                      type="button"
                      className="pc-resource-option"
                      key={resource.id}
                      onClick={() => addResource(resource)}
                    >
                      <span className="pc-resource-icon">
                        {resourceType === "Equipment" ? (
                          <Package size={15} />
                        ) : resourceType === "Staff" ? (
                          <UserRound size={15} />
                        ) : (
                          <FileCheck2 size={15} />
                        )}
                      </span>
                      <span>
                        <strong>{resource.name}</strong>
                        <small>
                          {resource.id} · {resource.function} ·{" "}
                          {resource.detail}
                        </small>
                      </span>
                      <span className="pc-availability">Add</span>
                    </button>
                  ))}
                </div>
                <div className="pc-bookings">
                  <div className="pc-table-heading">
                    <h3>
                      Selected resources <span>{resources.length}</span>
                    </h3>
                    {conflicts.length > 0 && (
                      <span className="pc-conflict">
                        <AlertTriangle size={14} /> {conflicts.length} booking
                        conflict{conflicts.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div className="pc-table-wrap">
                    <table className="pc-table">
                      <thead>
                        <tr>
                          <th>Resource</th>
                          <th>Function</th>
                          <th>Type</th>
                          <th>Qty</th>
                          <th>Booking start</th>
                          <th>Booking end</th>
                          <th>Rate card / unit</th>
                          <th>Cost</th>
                          <th>Selling</th>
                          <th>Discount</th>
                          <th>Tax</th>
                          <th>Total cost</th>
                          <th>Total selling</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resources.map((item) => (
                          <tr
                            key={item.id + item.start}
                            className={
                              conflicts.includes(item) ? "conflict-row" : ""
                            }
                          >
                            <td>
                              <strong>{item.name}</strong>
                              <small>{item.id}</small>
                            </td>
                            <td>{item.function}</td>
                            <td>{item.type}</td>
                            <td>
                              <input
                                className="pc-table-input"
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) =>
                                  updateResource(
                                    item.id,
                                    "quantity",
                                    Math.max(1, Number(e.target.value) || 1),
                                  )
                                }
                              />
                            </td>
                            <td>
                              <input
                                className="pc-table-input"
                                type="datetime-local"
                                value={item.start}
                                onChange={(e) =>
                                  updateResource(
                                    item.id,
                                    "start",
                                    e.target.value,
                                  )
                                }
                              />
                            </td>
                            <td>
                              <input
                                className="pc-table-input"
                                type="datetime-local"
                                value={item.end}
                                onChange={(e) =>
                                  updateResource(item.id, "end", e.target.value)
                                }
                              />
                            </td>
                            <td>
                              <select
                                className="pc-table-input"
                                value={item.unit}
                                onChange={(e) =>
                                  updateResource(
                                    item.id,
                                    "unit",
                                    e.target.value,
                                  )
                                }
                              >
                                <option>Per Hour</option>
                                <option>Per Day</option>
                                <option>Per Project</option>
                              </select>
                              <small>{item.currency}</small>
                            </td>
                            <td>
                              <input
                                className="pc-table-input"
                                type="number"
                                value={item.costRate}
                                onChange={(e) =>
                                  updateResource(
                                    item.id,
                                    "costRate",
                                    Number(e.target.value) || 0,
                                  )
                                }
                              />
                            </td>
                            <td>
                              <input
                                className="pc-table-input"
                                type="number"
                                value={item.sellingRate}
                                onChange={(e) =>
                                  updateResource(
                                    item.id,
                                    "sellingRate",
                                    Number(e.target.value) || 0,
                                  )
                                }
                              />
                            </td>
                            <td>
                              <input
                                className="pc-table-input"
                                type="number"
                                min={0}
                                max={100}
                                value={item.discount}
                                onChange={(e) =>
                                  updateResource(
                                    item.id,
                                    "discount",
                                    Number(e.target.value) || 0,
                                  )
                                }
                              />
                              %
                            </td>
                            <td>
                              <input
                                className="pc-table-input"
                                type="number"
                                min={0}
                                value={item.tax}
                                onChange={(e) =>
                                  updateResource(
                                    item.id,
                                    "tax",
                                    Number(e.target.value) || 0,
                                  )
                                }
                              />
                              %
                            </td>
                            <td>
                              {item.currency}{" "}
                              {(item.costRate * item.quantity).toLocaleString()}
                            </td>
                            <td>
                              {item.currency}{" "}
                              {(
                                item.sellingRate *
                                item.quantity *
                                (1 - item.discount / 100)
                              ).toLocaleString()}
                            </td>
                            <td>
                              <button
                                className="pc-table-action"
                                onClick={() =>
                                  setEditingId(
                                    editingId === item.id ? null : item.id,
                                  )
                                }
                              >
                                Edit
                              </button>
                              <button
                                className="pc-table-action danger"
                                onClick={() =>
                                  setResources((current) =>
                                    current.filter(
                                      (resource) => resource.id !== item.id,
                                    ),
                                  )
                                }
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!resources.length && (
                      <div className="pc-empty table-empty">
                        Choose a Function, then select resources to add them to
                        the project.
                      </div>
                    )}
                  </div>
                  {editingId && (
                    <div className="pc-booking-editor">
                      <label>
                        Booking notes
                        <textarea
                          value={
                            resources.find((item) => item.id === editingId)
                              ?.notes ?? ""
                          }
                          onChange={(e) =>
                            updateResource(editingId, "notes", e.target.value)
                          }
                        />
                      </label>
                      <p className="pc-rate-note">
                        <Check size={14} /> Rate snapshot saved with this
                        project. Active Rate Card values can be adjusted by
                        authorized users.
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="pc-schedule">
                <div className="pc-schedule-head">
                  <div>
                    <h3>Calendar and timeline</h3>
                    <p>
                      Individual booking durations and availability warnings.
                    </p>
                  </div>
                  <span className="pc-calendar-label">
                    <CalendarDays size={14} /> November 2026
                  </span>
                </div>
                {resources.map((item) => (
                  <div className="pc-timeline-row" key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <small>
                        {item.start.replace("T", " ")} —{" "}
                        {item.end.replace("T", " ")}
                      </small>
                    </div>
                    <div className="pc-timeline-track">
                      <span
                        className={conflicts.includes(item) ? "conflict" : ""}
                        style={{
                          left: "8%",
                          width: item.unit === "Per Project" ? "82%" : "36%",
                        }}
                      />
                    </div>
                    <strong
                      className={
                        conflicts.includes(item)
                          ? "pc-warning-text"
                          : "pc-available-text"
                      }
                    >
                      {conflicts.includes(item) ? "Conflict" : "Available"}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
        <aside>
          <section className="pc-panel pc-financial-panel">
            <div className="pc-section-heading">
              <div>
                <span className="pc-kicker">03 / FINANCIAL INFORMATION</span>
                <h2>Financial estimate</h2>
              </div>
              <select
                className="pc-currency-select"
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value as typeof currency);
                  setResources((current) =>
                    current.map((item) => ({
                      ...item,
                      currency: e.target.value as "USD" | "AFN",
                    })),
                  );
                }}
              >
                <option>USD</option>
                <option>AFN</option>
              </select>
            </div>
            <div className="pc-financial-tabs">
              {(["Amount Quoted", "Cost", "Settings", "Comment"] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    className={financialTab === tab ? "active" : ""}
                    onClick={() => setFinancialTab(tab)}
                  >
                    {tab}
                  </button>
                ),
              )}
            </div>
            {financialTab === "Amount Quoted" && (
              <div className="pc-financial-list">
                <FinancialLine
                  label="Staff"
                  value={financials.sellingBy("Staff")}
                  currency={currency}
                />
                <FinancialLine
                  label="Equipment"
                  value={financials.sellingBy("Equipment")}
                  currency={currency}
                />
                <FinancialLine
                  label="Services"
                  value={financials.sellingBy("Services")}
                  currency={currency}
                />
                <FinancialLine
                  label="Copyrights"
                  value={0}
                  currency={currency}
                />
                <FinancialLine label="Supplies" value={0} currency={currency} />
                <FinancialLine
                  label="Project total without fees"
                  value={financials.subtotal}
                  currency={currency}
                />
                <FinancialLine
                  label="Project total with fees"
                  value={financials.total}
                  currency={currency}
                />
                <div className="pc-total-line emphasized">
                  <span>Amount including tax</span>
                  <strong>
                    {currency} {financials.includingTax.toLocaleString()}
                  </strong>
                </div>
              </div>
            )}
            {financialTab === "Cost" && (
              <div className="pc-financial-list">
                <FinancialLine
                  label="Staff cost"
                  value={financials.costBy("Staff")}
                  currency={currency}
                />
                <FinancialLine
                  label="Equipment cost"
                  value={financials.costBy("Equipment")}
                  currency={currency}
                />
                <FinancialLine
                  label="Services cost"
                  value={financials.costBy("Services")}
                  currency={currency}
                />
                <FinancialLine
                  label="Copyrights cost"
                  value={0}
                  currency={currency}
                />
                <FinancialLine
                  label="Supplies cost"
                  value={0}
                  currency={currency}
                />
                <div className="pc-total-line">
                  <span>Total cost</span>
                  <strong>
                    {currency} {financials.cost.toLocaleString()}
                  </strong>
                </div>
                <div className="pc-profit-line">
                  <span>Estimated profit</span>
                  <strong>
                    {currency} {financials.profit.toLocaleString()}
                  </strong>
                </div>
              </div>
            )}
            {financialTab === "Settings" && (
              <div className="pc-form-grid single">
                <label>
                  Payment terms
                  <select
                    value={settings.paymentTerms}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        paymentTerms: e.target.value,
                      }))
                    }
                  >
                    <option>Due on receipt</option>
                    <option>30 days</option>
                    <option>60 days</option>
                  </select>
                </label>
                <label>
                  Project discount (%)
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={settings.discount}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        discount: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </label>
                <label>
                  Additional fees
                  <input
                    type="number"
                    min={0}
                    value={settings.fees}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        fees: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </label>
                <label>
                  Tax management (%)
                  <input
                    type="number"
                    min={0}
                    value={settings.tax}
                    onChange={(e) =>
                      setSettings((current) => ({
                        ...current,
                        tax: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </label>
                <label>
                  Exchange rate ({currency} to AFN)
                  <input
                    type="number"
                    min={1}
                    value={exchangeRate}
                    onChange={(e) =>
                      setExchangeRate(Number(e.target.value) || 1)
                    }
                  />
                </label>
                <p className="pc-rate-note">
                  <DollarSign size={14} /> Currency is explicit. USD and AFN
                  totals are never combined. Exchange rate: 1 USD ={" "}
                  {exchangeRate} AFN.
                </p>
              </div>
            )}
            {financialTab === "Comment" && (
              <div className="pc-form-grid single">
                <label>
                  Internal notes
                  <textarea
                    value={notes.internal}
                    onChange={(e) =>
                      setNotes((current) => ({
                        ...current,
                        internal: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Financial notes
                  <textarea
                    value={notes.financial}
                    onChange={(e) =>
                      setNotes((current) => ({
                        ...current,
                        financial: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Special instructions
                  <textarea
                    value={notes.instructions}
                    onChange={(e) =>
                      setNotes((current) => ({
                        ...current,
                        instructions: e.target.value,
                      }))
                    }
                  />
                </label>
              </div>
            )}
          </section>
          <section className="pc-panel pc-summary-panel">
            <div className="pc-section-heading">
              <div>
                <span className="pc-kicker">04 / APPROVAL WORKFLOW</span>
                <h2>Review readiness</h2>
              </div>
            </div>
            <div className="pc-check-list">
              <span>
                <Check size={14} /> Project information
              </span>
              <span className={resources.length ? "" : "muted"}>
                {resources.length ? (
                  <Check size={14} />
                ) : (
                  <AlertTriangle size={14} />
                )}{" "}
                Resources selected
              </span>
              <span className={conflicts.length ? "warn" : ""}>
                {conflicts.length ? (
                  <AlertTriangle size={14} />
                ) : (
                  <Check size={14} />
                )}{" "}
                Availability checked
              </span>
            </div>
            <p className="pc-approval-copy">
              HOO submissions route to CEO and Finance. Approval remains
              separate from execution status.
            </p>
            <button className="pc-button primary full" onClick={submit}>
              <Send size={14} /> Submit for approval
            </button>
          </section>
        </aside>
      </div>
    </section>
  );
}

function FinancialLine({
  label,
  value,
  currency,
}: {
  label: string;
  value: number;
  currency: "USD" | "AFN";
}) {
  return (
    <div className="pc-financial-line">
      <input
        className="pc-financial-label-input"
        defaultValue={label}
        aria-label={`Customize ${label} label`}
      />
      <label className="pc-financial-value-input">
        <span className="pc-financial-currency">{currency}</span>
        <input
          type="number"
          min={0}
          step="any"
          defaultValue={value}
          aria-label={`Customize ${label} amount`}
        />
      </label>
    </div>
  );
}

function ProjectsView({
  projects,
  user,
  onNotify,
}: {
  projects: Project[];
  user: User;
  onNotify: (message: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [creating, setCreating] = useState(false);

  const myProjects = useMemo(
    () =>
      projects.filter(
        (p) =>
          p.department === "Production" ||
          p.owner === user.name ||
          p.assignedEmployees?.includes(user.name),
      ),
    [projects, user],
  );

  const visible = useMemo(
    () =>
      myProjects.filter(
        (p) =>
          (statusFilter === "All" || p.status === statusFilter) &&
          `${p.name} ${p.client} ${p.id} ${p.owner}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [myProjects, statusFilter, query],
  );

  if (creating) {
    return (
      <ProjectCreationView
        projects={projects}
        user={user}
        onBack={() => setCreating(false)}
        onNotify={onNotify}
      />
    );
  }

  return (
    <section className="page-section prod-workspace">
      <div className="pc-page-heading">
        <div>
          <span className="pc-kicker">PRODUCTION / PROJECTS</span>
          <h1>Projects</h1>
          <p>Manage production briefs, resources, schedules and approvals.</p>
        </div>
        <button className="pc-button primary" onClick={() => setCreating(true)}>
          <Plus size={15} /> Create new project
        </button>
      </div>

      <div className="prod-toolbar">
        <label className="inline-search">
          <Search size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects…"
          />
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All statuses</option>
          <option>In Progress</option>
          <option>Upcoming</option>
          <option>Completed</option>
        </select>
      </div>

      <div className="prod-proj-cards">
        {visible.map((proj) => {
          const isLead = proj.owner === user.name;
          return (
            <article key={proj.id} className="panel prod-proj-card">
              <div className="prod-proj-card-head">
                <div>
                  <span className="eyebrow">{proj.id}</span>
                  <h3>{proj.name}</h3>
                </div>
                <span
                  className={`status-pill ${proj.status
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
                >
                  {proj.status}
                </span>
              </div>

              <div className="prod-proj-card-meta">
                <div>
                  <small>Client</small>
                  <strong>{proj.client}</strong>
                </div>
                <div>
                  <small>Project Lead</small>
                  <strong className={isLead ? "prod-lead-you" : ""}>
                    <Users size={12} /> {proj.owner}
                    {isLead && <span className="prod-lead-badge">You</span>}
                  </strong>
                </div>
                <div>
                  <small>Schedule</small>
                  <strong>
                    {fmtDate(proj.start)} – {fmtDate(proj.end)}
                  </strong>
                </div>
                <div>
                  <small>Department</small>
                  <strong>{proj.department}</strong>
                </div>
              </div>

              <div className="prod-proj-card-progress">
                <div className="prod-proj-progress-bar">
                  <span style={{ width: `${proj.progress}%` }} />
                </div>
                <small>{proj.progress}% complete</small>
              </div>

              {proj.assignedEmployees?.length ? (
                <div className="prod-proj-team">
                  <small>Team ({proj.assignedEmployees.length})</small>
                  <div className="prod-team-avatars">
                    {proj.assignedEmployees.slice(0, 4).map((name) => (
                      <span
                        key={name}
                        className="prod-team-avatar"
                        title={name}
                      >
                        {name.slice(0, 2).toUpperCase()}
                      </span>
                    ))}
                    {proj.assignedEmployees.length > 4 && (
                      <span className="prod-team-more">
                        +{proj.assignedEmployees.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
        {!visible.length && (
          <div className="empty-state">
            <ClipboardList size={28} />
            <h3>No projects found</h3>
            <p>Try adjusting the filters.</p>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Attendance view ──────────────────────────────────────────────────────────

function AttendanceView({ user }: { user: User }) {
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  const myRecord = employeeAttendance.find((rec) => rec.employee === user.name);

  const present =
    myRecord?.records.filter((r) => r.status === "Present").length ?? 0;
  const late = myRecord?.records.filter((r) => r.status === "Late").length ?? 0;
  const absent =
    myRecord?.records.filter((r) => r.status === "Absent").length ?? 0;

  function handleCheckIn() {
    const now = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setCheckedIn(true);
    setCheckInTime(now);
  }

  return (
    <section className="page-section prod-workspace">
      <PageHeader
        eyebrow="PRODUCTION / ATTENDANCE"
        title="Attendance"
        copy="Track your check-in, attendance history, and monthly record."
      />

      {/* Hero card */}
      <div className="panel prod-att-hero">
        <div className="prod-att-identity">
          <div className="prod-att-avatar">
            {user.firstName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="eyebrow">EMPLOYEE RECORD</span>
            <h2>{user.name}</h2>
            <p>
              {user.role} · {user.employeeId}
            </p>
          </div>
        </div>

        <div className="prod-att-live">
          {checkedIn ? (
            <>
              <span className="prod-att-live-dot" />
              <div>
                <strong>Checked in</strong>
                <small>At {checkInTime}</small>
              </div>
            </>
          ) : (
            <div>
              <strong>Not checked in</strong>
              <small>12 October 2026</small>
            </div>
          )}
        </div>

        <div className="prod-att-location">
          <MapPin size={14} />
          <div>
            <small>WORK LOCATION</small>
            <strong>CMCS Production Office</strong>
          </div>
        </div>

        <div className="prod-att-actions">
          {!checkedIn ? (
            <button className="button button-primary" onClick={handleCheckIn}>
              <CheckCircle2 size={14} /> Check in
            </button>
          ) : (
            <button
              className="button button-secondary"
              onClick={() => {
                setCheckedIn(false);
                setCheckInTime(null);
              }}
            >
              Check out
            </button>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div className="prod-att-summary">
        <div className="prod-att-chip prod-att-chip-green">
          <strong>{present}</strong>
          <span>Days present</span>
        </div>
        <div className="prod-att-chip prod-att-chip-amber">
          <strong>{late}</strong>
          <span>Late check-ins</span>
        </div>
        <div className="prod-att-chip prod-att-chip-red">
          <strong>{absent}</strong>
          <span>Days absent</span>
        </div>
        <div className="prod-att-chip prod-att-chip-blue">
          <strong>{myRecord?.completedProjects ?? 0}</strong>
          <span>Completed projects</span>
        </div>
      </div>

      {/* History table */}
      <div className="panel">
        <div className="panel-heading">
          <div>
            <h2>Attendance history</h2>
            <p>Recent daily records — last 5 working days.</p>
          </div>
          <CalendarDays size={16} />
        </div>
        <div className="table-wrap">
          <table className="prod-att-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Check-in time</th>
              </tr>
            </thead>
            <tbody>
              {myRecord?.records.map((rec) => (
                <tr key={rec.date}>
                  <td>{fmtDate(rec.date)}</td>
                  <td>
                    <span className={`status-pill ${rec.status.toLowerCase()}`}>
                      {rec.status}
                    </span>
                  </td>
                  <td>{rec.time}</td>
                </tr>
              ))}
              {!myRecord?.records.length && (
                <tr>
                  <td
                    colSpan={3}
                    style={{ textAlign: "center", color: "#9aa5b5" }}
                  >
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ─── Main ProductionPage export ───────────────────────────────────────────────

export function ProductionPage({
  active,
  user,
  projects,
  onNotify,
}: {
  active: string;
  user: User;
  projects: Project[];
  onNotify: (message: string) => void;
}) {
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<EmployeeTask | null>(null);

  // Load / seed tasks from localStorage
  useEffect(() => {
    const saved = window.localStorage.getItem(PROD_TASKS_KEY);
    if (saved) {
      try {
        setTasks(JSON.parse(saved) as EmployeeTask[]);
      } catch {
        setTasks(productionTasksSeed);
      }
    } else {
      setTasks(productionTasksSeed);
    }
  }, []);

  useEffect(() => {
    if (tasks.length)
      window.localStorage.setItem(PROD_TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  function updateProgress(task: EmployeeTask, progress: number) {
    const nextStatus: TaskStatus =
      progress >= 100 ? "Completed" : progress > 0 ? "In Progress" : "Pending";
    const next = { ...task, progress, status: nextStatus };
    setTasks((cur) => cur.map((t) => (t.id === task.id ? next : t)));
    onNotify(`${task.id} updated to ${progress}%`);
  }

  const myTasks = useMemo(
    () => tasks.filter((t) => t.assignedTo === user.name),
    [tasks, user.name],
  );

  // ── Route to sub-views ──────────────────────────────────────────────────────
  if (active === "My Tasks")
    return (
      <>
        <MyTasksView
          tasks={myTasks}
          projects={projects}
          onSelectTask={setSelectedTask}
        />
        {selectedTask && (
          <TaskModal
            task={selectedTask}
            project={projects.find((p) => p.id === selectedTask.projectId)}
            onClose={() => setSelectedTask(null)}
            onProgress={(v) => {
              updateProgress(selectedTask, v);
              setSelectedTask(null);
            }}
          />
        )}
      </>
    );

  if (active === "Projects")
    return (
      <ProjectsView
        projects={projects}
        user={user}
        onNotify={onNotify}
      />
    );

  if (active === "Attendance") return <AttendanceView user={user} />;

  // ── Default: Dashboard ──────────────────────────────────────────────────────
  return (
    <>
      <DashboardView
        user={user}
        tasks={myTasks}
        projects={projects}
        onSelectTask={setSelectedTask}
        onNavigate={onNotify}
      />
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          project={projects.find((p) => p.id === selectedTask.projectId)}
          onClose={() => setSelectedTask(null)}
          onProgress={(v) => {
            updateProgress(selectedTask, v);
            setSelectedTask(null);
          }}
        />
      )}
    </>
  );
}
