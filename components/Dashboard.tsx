"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  FileText,
  GanttChartSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ReceiptText,
  ShieldCheck,
  Users,
  Wallet,
  UserRound,
  HardDrive,
  ListTodo,
  CalendarClock,
  ClipboardCheck,
  UserCheck,
  BellRing,
  UserCircle,
  Package,
  Settings2,
  X,
  Contact,
  CircleDollarSign,
  CalendarCheck2,
} from "lucide-react";
import {
  Approval,
  Client,
  Invoice,
  Notification,
  Project,
  Quotation,
  RateCardTemplate,
  Role,
  User,
} from "../lib/types";
import {
  defaultNotifications,
  notificationStorageKey,
  clientsSeed,
  projectsSeed,
  quotationSeed,
  invoiceSeed,
  readNotifications,
  users,
} from "../lib/dummy-data/mock-data";
import { PageHeader } from "./common/PageHeader";
import { ProjectTable } from "./projects/ProjectTable";
import { ProjectDialog } from "./projects/ProjectDialog";
import { ProjectDetailModal } from "./projects/ProjectDetailModal";
import { ProjectCalendar } from "./calendar/ProjectCalendar";
import { DashboardHome } from "./dashboard/DashboardHome";
import { CeoDashboardHome } from "./dashboard/CeoDashboardHome";
import { CeoApprovals } from "./ceo/CeoApprovals";
import { FinancePage } from "./finance/FinancePage";
import { InvoicePage } from "./finance/InvoicePage";
import { QuotationManagement } from "./finance/QuotationManagement";
import { PaymentsPage } from "./finance/PaymentsPage";
import { ExpensesPage } from "./finance/ExpensesPage";
import { SalariesPage } from "./finance/SalariesPage";
import { EquipmentRentalPage } from "./finance/EquipmentRentalPage";
import { EmployeesPage } from "./employees/EmployeesPage";
import { ModulePage } from "./modules/ModulePage";
import { TechnicalEmployeePage } from "./technical/TechnicalEmployeePage";
import { AdministrationEmployeePage } from "./employees/AdministrationEmployeePage";
import { OperationsTasksPage } from "./operations/OperationsTasksPage";
import { FinanceDashboard } from "./finance/FinanceDashboard";
import { ProductionPage, ProjectCreationView } from "./production/ProductionPage";
import { RateCardPage } from "./production/RateCardPage";
import { AdministrationPage } from "./administration/AdministrationPage";
import { ClientManagementPage } from "./clients/ClientManagementPage";
import { EquipmentManagementPage } from "./equipment/EquipmentManagementPage";
import { StaffManagementPage } from "./staff/StaffManagementPage";
import { RemindersPage } from "./reminders/RemindersPage";

const nav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Production", icon: ClipboardList },
  { label: "Clients", icon: Contact },
  { label: "Assignments", icon: Users },
  { label: "Employees", icon: CalendarDays },
  { label: "Finance", icon: Wallet },
  { label: "Expenses", icon: ReceiptText },
  { label: "Documents", icon: FileText },
  { label: "Reports", icon: BarChart3 },
];

const operationsNav = nav
  .filter((item) => item.label !== "Expenses")
  .map((item) =>
    item.label === "Assignments" ? { ...item, label: "Tasks", icon: ListTodo } : item,
  );

const ceoNav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Production", icon: ClipboardList },
  { label: "Clients", icon: Contact },
  { label: "Project Approvals", icon: CheckCircle2 },
  { label: "Notifications", icon: Bell },
  { label: "Employees", icon: CalendarDays },
  { label: "Finance", icon: Wallet },
  { label: "Reports", icon: BarChart3 },
];

const technicalNav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "My Projects", icon: ClipboardList },
  { label: "Clients", icon: Contact },
  { label: "My Tasks", icon: ListTodo },
  { label: "My Schedule", icon: CalendarClock },
  { label: "Equipment & Resources", icon: HardDrive },
  { label: "Attendance", icon: UserCheck },
  { label: "Leave Requests", icon: ClipboardCheck },
  { label: "Notifications", icon: BellRing },
  { label: "My Profile", icon: UserCircle },
];

const financeNav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Clients", icon: Contact },
  { label: "Payments", icon: Wallet },
  { label: "Expenses", icon: ClipboardCheck },
  { label: "Salaries", icon: DollarSign },
  { label: "Equipment Rental", icon: Package },
  { label: "Production", icon: ClipboardList },
  { label: "Documents", icon: FileText },
  { label: "Reports", icon: BarChart3 },
];

const administratorNav = [
  { label: "Dashboard",              icon: LayoutDashboard },
  { label: "Clients",                icon: Contact },
  { label: "User Management",        icon: Users },
  { label: "Roles & Permissions",    icon: ShieldCheck },
  { label: "Department Management",  icon: ClipboardList },
  { label: "Notifications",          icon: Bell },
  { label: "Audit Logs",             icon: BarChart3 },
  { label: "Documents & Templates",  icon: FileText },
  { label: "System Settings",        icon: ClipboardCheck },
  { label: "Backup & System Health", icon: HardDrive },
];

const RATE_CARD_TEMPLATES_KEY = "cmcs-rate-card-templates";

const administrationEmployeeNav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Clients", icon: Contact },
  { label: "Administrative Tasks", icon: ClipboardList },
  { label: "Employees", icon: Users },
  { label: "Documents & Records", icon: FileText },
  { label: "Assets & Inventory", icon: Package },
  { label: "Office Maintenance", icon: Settings2 },
  { label: "Meetings & Schedule", icon: CalendarDays },
  { label: "Requests", icon: ClipboardCheck },
  { label: "Notifications", icon: BellRing },
  { label: "My Profile", icon: UserCircle },
];

const productionNav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "My Tasks", icon: ListTodo },
  { label: "Production", icon: ClipboardList },
  { label: "Quotations", icon: FileText },
  { label: "Clients", icon: Contact },
  { label: "Attendance", icon: UserCheck },
];

const resourceTabs = ["Client", "Staff", "Equipment"] as const;
type ResourceTab = (typeof resourceTabs)[number];
const resourceMeta: Record<ResourceTab, { icon: typeof Contact; description: string; count: string }> = {
  Client: { icon: Contact, description: "Manage client relationships and project contacts.", count: "CRM" },
  Staff: { icon: Users, description: "Coordinate staff records and resource availability.", count: "People" },
  Equipment: { icon: Package, description: "Track production assets, value and availability.", count: "14 assets" },
};

export function Dashboard({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  const role =
    (Object.keys(users) as Role[]).find(
      (key) => users[key].email === user.email,
    ) ?? "employee";

  const isCeo = role === "ceo";
  const isHoo = role === "hoo";
  const isFinance = role === "finance";
  const isTechnical = role === "technical";
  const isProduction = role === "production";
  const isAdministrator = role === "admin";
  const isAdministrationEmployee = role === "administrationEmployee";
  const [active, setActive] = useState("Dashboard");
  const [productionView, setProductionView] = useState<
    | "Projects"
    | "Project Calendar"
    | "Rate Card"
    | "Quotations"
    | "Invoices"
  >("Projects");
  const [showProjectWorkspace, setShowProjectWorkspace] = useState(false);
  const [resourceTab, setResourceTab] = useState<ResourceTab>("Equipment");
  const [projects, setProjects] = useState<Project[]>(projectsSeed);
  const [clients, setClients] = useState<Client[]>(clientsSeed);
  const [customFilter, setCustomFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<"new" | null>(null);
  const [selected, setSelected] = useState<Project | null>(null);
  const [financeProjectId, setFinanceProjectId] = useState<string | null>(null);
  const [invoiceProjectId, setInvoiceProjectId] = useState<string | null>(null);
  const [createdQuotations, setCreatedQuotations] = useState<Quotation[]>([]);
  const [rateCardTemplates, setRateCardTemplates] = useState<RateCardTemplate[]>([]);
  const [workspaceEdit, setWorkspaceEdit] = useState<{
    project: Project;
    quotation?: Quotation;
  } | null>(null);
  const [approvals, setApprovals] = useState<
    Record<string, { status: Approval; comment: string }>
  >({});
  const [notifications, setNotifications] =
    useState<Notification[]>(defaultNotifications);
  const [quotationApprovals, setQuotationApprovals] = useState<
    Record<string, { status: string; comment: string }>
  >({});
  const [toast, setToast] = useState("");
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setNotifications([...defaultNotifications, ...readNotifications()]);
    const storedRateCardTemplates = window.localStorage.getItem(RATE_CARD_TEMPLATES_KEY);
    if (storedRateCardTemplates) {
      try {
        const parsed = JSON.parse(storedRateCardTemplates) as Partial<RateCardTemplate>[];
        const today = new Date().toISOString().slice(0, 10);
        setRateCardTemplates(
          parsed.map((template, index) => ({
            id: template.id ?? `RAT-${Date.now()}-${index}`,
            name: template.name ?? "Untitled template",
            functions: template.functions ?? [],
            resourceKeys: template.resourceKeys ?? Object.keys(template.rates ?? {}),
            rates: template.rates ?? {},
            createdAt: template.createdAt ?? today,
            updatedAt: template.updatedAt ?? template.createdAt ?? today,
            validity: template.validity ?? "30 days",
          })),
        );
      } catch (error) {
        console.error("Failed to restore saved rate card templates:", error);
        window.localStorage.removeItem(RATE_CARD_TEMPLATES_KEY);
      }
    }
    const storedClients = window.localStorage.getItem("cmcs-clients");
    if (storedClients) {
      try {
        setClients(JSON.parse(storedClients) as Client[]);
      } catch (error) {
        console.error("Failed to restore saved clients:", error);
        window.localStorage.removeItem("cmcs-clients");
      }
    }
  }, []);

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          (customFilter === "All" ||
            (p.approvalStatus ??
              (p.status === "Rejected" ? "Rejected" : "Approved")) === customFilter) &&
          `${p.id} ${p.name} ${p.client} ${p.owner}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [projects, customFilter, search],
  );

  function notify(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(""), 2600);
  }

  function persistClients(nextClients: Client[]) {
    setClients(nextClients);
    window.localStorage.setItem("cmcs-clients", JSON.stringify(nextClients));
  }

  function saveRateCardTemplate(template: RateCardTemplate) {
    const nextTemplates = [...rateCardTemplates, template];
    setRateCardTemplates(nextTemplates);
    window.localStorage.setItem(
      RATE_CARD_TEMPLATES_KEY,
      JSON.stringify(nextTemplates),
    );
    notify(`Rate card template "${template.name}" saved`);
  }

  function updateRateCardTemplate(template: RateCardTemplate) {
    const nextTemplates = rateCardTemplates.map((current) =>
      current.id === template.id ? template : current,
    );
    setRateCardTemplates(nextTemplates);
    window.localStorage.setItem(
      RATE_CARD_TEMPLATES_KEY,
      JSON.stringify(nextTemplates),
    );
    notify(`Rate card template "${template.name}" updated`);
  }

  function deleteRateCardTemplate(templateId: string) {
    const nextTemplates = rateCardTemplates.filter(
      (template) => template.id !== templateId,
    );
    setRateCardTemplates(nextTemplates);
    window.localStorage.setItem(
      RATE_CARD_TEMPLATES_KEY,
      JSON.stringify(nextTemplates),
    );
    notify("Rate card template deleted");
  }

  function createClientId() {
    const year = new Date().getFullYear();
    const nextNumber =
      clients.reduce((highest, client) => {
        const match = client.id.match(/(\d+)$/);
        return Math.max(highest, match ? Number(match[1]) : 0);
      }, 0) + 1;
    return `CLT-${year}-${String(nextNumber).padStart(4, "0")}`;
  }

  function saveClient(client: Client) {
    if (!isCeo && !isHoo) {
      return { ok: false, message: "Only the CEO and Head of Operations can manage clients." };
    }
    const duplicate = clients.some(
      (existing) =>
        existing.id !== client.id &&
        (existing.name.trim().toLowerCase() === client.name.trim().toLowerCase() ||
          (client.email &&
            existing.email.trim().toLowerCase() === client.email.trim().toLowerCase())),
    );
    if (duplicate) {
      return { ok: false, message: "A client with this name or email already exists." };
    }
    const savedClient = {
      ...client,
      id: client.id || createClientId(),
    };
    const exists = clients.some((existing) => existing.id === savedClient.id);
    persistClients(
      exists
        ? clients.map((existing) => (existing.id === savedClient.id ? savedClient : existing))
        : [savedClient, ...clients],
    );
    return { ok: true };
  }

  function deleteClient(clientId: string) {
    if (!isCeo && !isHoo) {
      return { ok: false, message: "Only the CEO and Head of Operations can delete clients." };
    }
    if (projects.some((project) => project.clientId === clientId)) {
      return { ok: false, message: "This client has linked projects and cannot be deleted." };
    }
    persistClients(clients.filter((client) => client.id !== clientId));
    return { ok: true };
  }

  function createQuickClient(name: string) {
    if (!isCeo && !isHoo) return null;
    const normalizedName = name.trim();
    if (!normalizedName || clients.some((client) => client.name.toLowerCase() === normalizedName.toLowerCase())) {
      return null;
    }
    const client: Client = {
      id: createClientId(),
      name: normalizedName,
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      type: "Company",
      notes: "",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    persistClients([client, ...clients]);
    return client;
  }

  function addNotification(notification: Omit<Notification, "id" | "time">) {
    const next: Notification = {
      ...notification,
      id: `NTF-${Date.now()}`,
      time: "Just now",
    };
    const updated = [...readNotifications(), next];
    window.localStorage.setItem(notificationStorageKey, JSON.stringify(updated));
    setNotifications([...defaultNotifications, ...updated]);
  }

  function saveProject(project: Project) {
    if (role === "ceo" || isFinance) {
      notify(
        isFinance
          ? "Finance accounts cannot create projects."
          : "CEO accounts have read-only project permissions.",
      );
      return;
    }
    const existing = projects.some((item) => item.id === project.id);
    const savedProject =
      existing &&
      isHoo &&
      project.approvalStatus === "Changes Requested"
        ? {
            ...project,
            approvalStatus: "Under Review" as const,
            submissionHistory: [
              ...(project.submissionHistory ?? []),
              { date: new Date().toISOString().slice(0, 10), status: "Under Review", actor: user.name },
            ],
          }
        : !existing && isHoo
          ? {
              ...project,
              approvalStatus: "Under Review" as const,
              progressStatus: "Upcoming" as const,
            }
          : project;
    setProjects((current) =>
      existing
        ? current.map((item) => (item.id === savedProject.id ? savedProject : item))
        : [savedProject, ...current],
    );
    if (!existing && role === "hoo") {
      setApprovals((current) => ({
        ...current,
        [savedProject.id]: { status: "Pending approval", comment: "" },
      }));
      addNotification({
        title: "New project requires approval",
        detail: `Head of Operations submitted ${savedProject.name}.`,
        kind: "Project approval",
        recipient: "ceo",
      });
    }
    setDialog(null);
    notify("Project saved successfully");
  }

  function submitProductionProject(project: Project, quotation: Quotation) {
    setProjects((current) => [
      project,
      ...current.filter((item) => item.id !== project.id),
    ]);
    setCreatedQuotations((current) => [
      quotation,
      ...current.filter(
        (item) => item.id !== quotation.id && item.projectId !== quotation.projectId,
      ),
    ]);
    setApprovals((current) => ({
      ...current,
      [project.id]: { status: "Pending approval", comment: "" },
    }));
    addNotification({
      title: "Project and quotation submitted",
      detail: `${project.id} and ${quotation.id} are linked and under review.`,
      kind: "Project approval",
      recipient: "ceo",
    });
  }

  function updateProductionProject(project: Project, quotation: Quotation) {
    setProjects((current) =>
      current.map((item) => (item.id === project.id ? project : item)),
    );
    setCreatedQuotations((current) => [
      quotation,
      ...current.filter(
        (item) => item.id !== quotation.id && item.projectId !== quotation.projectId,
      ),
    ]);
    setWorkspaceEdit(null);
    setShowProjectWorkspace(false);
    notify(`${project.id} and ${quotation.id} updated without creating duplicates`);
  }

  function updateApproval(project: Project, status: Approval, comment: string) {
    const nextApprovalStatus =
      status === "Pending approval" ? "Under Review" : status;
    setApprovals((current) => ({
      ...current,
      [project.id]: { status, comment },
    }));
    setProjects((current) =>
      current.map((item) =>
        item.id === project.id
          ? {
              ...item,
              approvalStatus: nextApprovalStatus,
              progressStatus:
                status === "Approved"
                  ? item.progressStatus ?? "Upcoming"
                  : item.progressStatus,
              status: status === "Approved"
                ? item.progressStatus ?? "Upcoming"
                : status === "Rejected"
                  ? "Rejected"
                  : item.status,
              revisionComments:
                status === "Changes Requested"
                  ? [...(item.revisionComments ?? []), comment].filter(Boolean)
                  : item.revisionComments,
              submissionHistory: [
                ...(item.submissionHistory ?? []),
                { date: new Date().toISOString().slice(0, 10), status: nextApprovalStatus, actor: user.name },
              ],
            }
          : item,
      ),
    );
    if (status === "Approved" || status === "Rejected" || status === "Changes Requested") {
      addNotification({
        title: `Project ${status.toLowerCase()}`,
        detail: `${project.name} was ${status.toLowerCase()} by the CEO.`,
        kind: "Project update",
        recipient: "hoo",
      });
    }
    setSelected(null);
    notify(`Project ${status.toLowerCase()}.`);
  }

  function updateQuotation(id: string, status: string, comment: string) {
    setQuotationApprovals((current) => ({
      ...current,
      [id]: { status, comment },
    }));
    notify(`Quotation ${status.toLowerCase()}.`);
  }

  function notifyQuotationSubmission(quotation: Quotation, project: Project) {
    addNotification({
      title: "Quotation requires approval",
      detail: `${quotation.id} for ${project.name} was submitted by Finance.`,
      kind: "Quotation",
      recipient: "ceo",
    });
    addNotification({
      title: "Quotation ready for review",
      detail: `${quotation.id} for ${project.name} is ready for HOO review.`,
      kind: "Quotation",
      recipient: "hoo",
    });
  }

  function notifyInvoiceSubmission(invoice: Invoice, project: Project) {
    addNotification({
      title: "Invoice requires approval",
      detail: `${invoice.id} for ${project.name} was submitted by Finance.`,
      kind: "Invoice",
      recipient: "ceo",
    });
    notify(`${invoice.id} submitted for CEO review.`);
  }

  function notifyInvoiceRevision(
    invoice: Invoice,
    project: Project,
    comment: string,
  ) {
    addNotification({
      title: "Invoice revision requested",
      detail: `${invoice.id} for ${project.name} needs changes: ${comment}`,
      kind: "Invoice",
      recipient: "finance",
    });
    notify(`${invoice.id} revision request sent to Finance.`);
  }

  const visibleNotifications = notifications.filter(
    (notification) =>
      notification.recipient === "all" || notification.recipient === role,
  );

  const visibleNav = isTechnical
    ? technicalNav
    : isAdministrationEmployee
      ? administrationEmployeeNav
    : isAdministrator
      ? administratorNav
    : isCeo
    ? ceoNav
    : isHoo
      ? operationsNav
    : isFinance
      ? financeNav
    : isProduction
      ? productionNav
    : nav.filter((item) => item.label !== "Expenses");
  const showResources = isCeo || isHoo;
  const navigationItems = [
    ...(showResources
      ? visibleNav
        .filter((item) => item.label !== "Clients")
        .concat({ label: "Resources", icon: Package })
      : visibleNav),
  ];
  if (!navigationItems.some((item) => item.label === "Reminders")) {
    navigationItems.push({ label: "Reminders", icon: CalendarCheck2 });
  }

  return (
    <div className={"app-shell is-visible " + (isHoo ? "heo-shell" : "")}>
      <aside
        id="main-navigation"
        className={
          "sidebar " +
          (isHoo ? "heo-sidebar " : "") +
          (mobile ? "mobile-open" : "")
        }
      >
        <div className="brand">
          <div className="brand-mark">
            <img src="/assets/chinar-logo.png" alt="CMCS" />
          </div>
          <div>
            <strong>CMCS</strong>
            <span>Management workspace</span>
          </div>
          <button
            className="sidebar-close icon-button"
            onClick={() => setMobile(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
        <div className={isHoo ? "heo-role-badge" : "role-chip"}>
          <ShieldCheck size={14} />{" "}
          {isHoo ? "HEO CONTROL CENTRE" : user.role}
        </div>
        <nav className="primary-nav">
          {navigationItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={"nav-item " + (active === label ? "active" : "")}
              onClick={() => {
                if (label === "Quotations") {
                  setProductionView("Quotations");
                  setActive("Production");
                } else {
                  setActive(label);
                  if (label === "Production") setProductionView("Projects");
                }
                setMobile(false);
              }}
            >
              <Icon size={17} />
              {label}
              {label === "Project Approvals" && (
                <span className="nav-count">
                  {Object.values(approvals).filter(
                    (item) => item.status === "Pending approval",
                  ).length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar">
              {user.firstName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <strong>{user.name}</strong>
              <span>{user.role}</span>
            </div>
            <button className="icon-button" onClick={onLogout} aria-label="Log out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      {mobile && (
        <button
          className="sidebar-backdrop"
          onClick={() => setMobile(false)}
          aria-label="Close navigation"
        />
      )}
      <main className="main-content">
        <header className="topbar">
          <button
            className="menu-button"
            onClick={() => setMobile(true)}
            aria-label="Open navigation"
            aria-expanded={mobile}
            aria-controls="main-navigation"
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumbs">
            <span>CMCS workspace</span>
            <b>/</b>
            <strong>{active}</strong>
          </div>
          <div className="topbar-actions">
            <div className="avatar">
              {user.firstName.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="page-content">
          {active === "Dashboard" &&
            (isTechnical ? (
              <TechnicalEmployeePage
                active={active}
                user={user}
                projects={projects}
                onNotify={notify}
              />
            ) : isAdministrationEmployee ? (
              <AdministrationEmployeePage active={active} user={user} onNotify={notify} />
            ) : isCeo || isHoo ? (
              <CeoDashboardHome
                projects={projects}
                notifications={visibleNotifications}
                onNavigate={setActive}
                onSelect={setSelected}
              />
            ) : isFinance ? (
              <FinanceDashboard
                projects={projects}
                onNotify={notify}
                onNavigate={(section, view) => {
                  // Map view-based navigation to the new individual sidebar sections
                  if (view === "quotations") {
                    setProductionView("Quotations");
                    setActive("Production");
                  } else if (view === "invoices") {
                    setProductionView("Invoices");
                    setActive("Production");
                  } else if (view === "payments") {
                    setActive("Payments");
                  } else if (view === "expenses") {
                    setActive("Expenses");
                  } else {
                    setActive(section);
                  }
                }}
              />
            ) : isProduction ? (
              <ProductionPage
                active="Dashboard"
                user={user}
                projects={projects}
                onNotify={notify}
              />
            ) : isAdministrator ? (
              <AdministrationPage
                active="Dashboard"
                user={user}
                onNotify={notify}
              />
            ) : (
              <DashboardHome
                projects={projects}
                onNavigate={setActive}
                onSelect={setSelected}
                createLabel={
                  isHoo ? undefined : isFinance ? undefined : "New project"
                }
                showExecutiveInsights={!isHoo}
              />
            ))}
          {active === "Project Approvals" && (
            <CeoApprovals
              projects={projects}
              approvals={approvals}
              onSubmit={updateApproval}
              onSelect={setSelected}
            />
          )}
          {active === "Payments" && (
            <PaymentsPage
              projects={projects}
              canManage={isFinance}
            />
          )}
          {/* ── CEO/other roles: combined Finance tab ── */}
          {active === "Finance" && (
            <FinancePage
              projects={projects}
              onNotify={notify}
              role={role}
            />
          )}
          {active === "Resources" && showResources && (
            <section className="page-section resources-page">
              <PageHeader
                eyebrow="RESOURCES"
                title="Resources"
                copy="Manage the people, equipment and operational resources used by CMCS."
              />
              <div className="resources-command-bar">
                <div>
                  <span className="eyebrow">RESOURCE WORKSPACE</span>
                  <strong>{resourceTab} workspace</strong>
                  <p>{resourceMeta[resourceTab].description}</p>
                </div>
                <span className="resources-command-status"><span /> Live workspace</span>
              </div>
              <div className="resources-tabs" role="tablist" aria-label="Resource categories">
                {resourceTabs.map((tab) => (
                  <button
                    key={tab}
                    role="tab"
                    aria-selected={resourceTab === tab}
                    className={resourceTab === tab ? "selected" : ""}
                    onClick={() => setResourceTab(tab)}
                  >
                    {(() => { const Icon = resourceMeta[tab].icon; return <Icon size={15} />; })()}
                    <span>{tab}</span>
                    <small>{resourceMeta[tab].count}</small>
                  </button>
                ))}
              </div>
              {resourceTab === "Client" && (
                <ClientManagementPage
                  clients={clients}
                  projects={projects}
                  user={user}
                  canManage={isCeo || isHoo}
                  onSave={saveClient}
                  onDelete={deleteClient}
                />
              )}
              {resourceTab === "Equipment" && <EquipmentManagementPage />}
              {resourceTab === "Staff" && <StaffManagementPage />}
              {resourceTab !== "Client" && resourceTab !== "Equipment" && resourceTab !== "Staff" && (
                <ModulePage
                  active={`Resources / ${resourceTab}`}
                  user={user}
                  onNotify={notify}
                />
              )}
            </section>
          )}
          {active === "Clients" && !showResources && (
            <ClientManagementPage
              clients={clients}
              projects={projects}
              user={user}
              canManage={isCeo || isHoo}
              onSave={saveClient}
              onDelete={deleteClient}
            />
          )}
          {active === "Equipment" && <EquipmentManagementPage />}
          {active === "Expenses" && (
            <ExpensesPage projects={projects} role={role} onNotify={notify} />
          )}
          {active === "Salaries" && (
            <SalariesPage projects={projects} onNotify={notify} />
          )}
          {active === "Equipment Rental" && (
            <EquipmentRentalPage projects={projects} onNotify={notify} />
          )}
          {isTechnical && active !== "Dashboard" && active !== "Clients" && (
            <TechnicalEmployeePage
              active={active}
              user={user}
              projects={projects}
              onNotify={notify}
            />
          )}
          {isProduction &&
            active !== "Dashboard" &&
            active !== "Clients" &&
            active !== "Production" && (
            <ProductionPage
              active={active}
              user={user}
              projects={projects}
              onNotify={notify}
            />
          )}
          {/* ── Administrator: full admin department ── */}
          {isAdministrator && active !== "Clients" && (
            <AdministrationPage
              active={active}
              user={user}
              onNotify={notify}
            />
          )}
          {isAdministrationEmployee && active !== "Dashboard" && active !== "Employees" && active !== "Clients" && (
            <AdministrationEmployeePage active={active} user={user} onNotify={notify} />
          )}
          {isAdministrationEmployee && active === "Employees" && (
            <EmployeesPage projects={projects} isAdministrator />
          )}
          {active === "Notifications" && !isTechnical && !isAdministrationEmployee && (
            <section className="page-section">
              <PageHeader
                eyebrow="EXECUTIVE / NOTIFICATIONS"
                title="Notifications"
                copy="Approval requests and operational updates for the CEO."
              />
              <div className="panel ceo-notification-list">
                {visibleNotifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => {
                      if (notification.kind === "Invoice") {
                        setProductionView("Invoices");
                        setActive("Production");
                      } else if (notification.kind === "Quotation" && isFinance) {
                        setProductionView("Quotations");
                        setActive("Production");
                      } else {
                        setActive(
                          notification.kind === "Project approval"
                              ? "Project Approvals"
                              : notification.kind === "Quotation"
                                ? "Production"
                                : "Projects",
                        );
                      }
                    }}
                  >
                    <span className="notification-icon">
                      <Bell size={13} />
                    </span>
                    <span>
                      <strong>{notification.title}</strong>
                      <small>{notification.detail}</small>
                      <time>{notification.time}</time>
                    </span>
                    <ArrowUpRight size={14} />
                  </button>
                ))}
              </div>
            </section>
          )}
          {active === "Reminders" && <RemindersPage />}
          {active === "Production" && (
            <section className="page-section production-module">
              <PageHeader
                eyebrow="PRODUCTION"
                title="Production"
                copy="Manage projects and review the production calendar."
              />
              <div className="production-subsections">
                <div className="production-subsection-tabs">
                  <button
                    className={productionView === "Projects" ? "active" : ""}
                    onClick={() => setProductionView("Projects")}
                  >
                    <ClipboardList size={15} />
                    Projects
                    <span className="nav-count">{projects.length}</span>
                  </button>
                  <button
                    className={
                      productionView === "Project Calendar" ? "active" : ""
                    }
                    onClick={() => setProductionView("Project Calendar")}
                  >
                    <GanttChartSquare size={15} />
                    Project Calendar
                  </button>
                  <button
                    className={productionView === "Rate Card" ? "active" : ""}
                    onClick={() => setProductionView("Rate Card")}
                  >
                    <CircleDollarSign size={15} />
                    Rate Card
                  </button>
                  {(isCeo || isHoo || isFinance) && (
                    <button
                      className={productionView === "Invoices" ? "active" : ""}
                      onClick={() => setProductionView("Invoices")}
                    >
                      <ReceiptText size={15} />
                      Invoices
                    </button>
                  )}
                  {(isCeo || isHoo || isFinance) && (
                    <button
                      className={productionView === "Quotations" ? "active" : ""}
                      onClick={() => setProductionView("Quotations")}
                    >
                      <FileText size={15} />
                      Quotations
                    </button>
                  )}
                </div>
                {productionView === "Projects" ? (
                  <>
                    {showProjectWorkspace ? (
                      <ProjectCreationView
                        projects={projects}
                        user={user}
                        project={workspaceEdit?.project}
                        quotation={workspaceEdit?.quotation}
                        onBack={() => {
                          setWorkspaceEdit(null);
                          setShowProjectWorkspace(false);
                        }}
                        onNotify={notify}
                        onSubmitProject={submitProductionProject}
                        onUpdateProject={updateProductionProject}
                      />
                    ) : (
                    <>
                    <PageHeader
                      eyebrow=""
                      title="Projects"
                      copy=""
                      action={
                        isCeo || isFinance
                          ? undefined
                          : isHoo
                            ? "Create project"
                            : "New project"
                      }
                      onAction={() =>
                        isHoo
                          ? setShowProjectWorkspace(true)
                          : setDialog("new")
                      }
                    />
                    <div className="filter-bar">
                      <label className="custom-filter">
                        Filter projects
                        <select
                          value={customFilter}
                          onChange={(e) => setCustomFilter(e.target.value)}
                        >
                          <option value="All">All projects</option>
                          <option value="Under Review">Under review</option>
                          <option value="Approved">Approved</option>
                          <option value="Changes Requested">Changes requested</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </label>
                      <label className="inline-search">
                        <Search size={15} />
                        <input
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Search projects..."
                        />
                      </label>
                    </div>
                    <div className="panel">
                      {filtered.length ? (
                        <ProjectTable projects={filtered} onSelect={setSelected} />
                      ) : (
                        <div className="empty-state">
                          <Search size={30} />
                          <h3>No matching projects</h3>
                          <p>Try another keyword or clear the current filters.</p>
                        </div>
                      )}
                    </div>
                    </>
                    )}
                  </>
                ) : productionView === "Project Calendar" ? (
                  <ProjectCalendar
                    projects={projects.filter((project) =>
                      ["Upcoming", "In Progress", "Completed"].includes(
                        project.status,
                      ),
                    )}
                    onSelect={setSelected}
                  />
                ) : productionView === "Rate Card" ? (
                  <RateCardPage
                    canManage={isCeo || isHoo}
                    templates={rateCardTemplates}
                    onCreate={saveRateCardTemplate}
                    onUpdate={updateRateCardTemplate}
                    onDelete={deleteRateCardTemplate}
                    onNotify={notify}
                    preparedBy={user.name}
                  />
                ) : productionView === "Invoices" ? (
                  <InvoicePage
                    projects={projects}
                    initialProjectId={invoiceProjectId}
                    canReview={isCeo}
                    canSubmit={isFinance}
                    initialSection="invoices"
                    onSubmitted={notifyInvoiceSubmission}
                    onRevisionRequested={notifyInvoiceRevision}
                  />
                ) : (
                  <QuotationManagement
                    projects={projects}
                    additionalQuotations={createdQuotations}
                    onNotify={notify}
                    onQuotationSubmitted={notifyQuotationSubmission}
                    onEditProject={(quotation, project) => {
                      setWorkspaceEdit({ project, quotation });
                      setProductionView("Projects");
                      setActive("Production");
                      setShowProjectWorkspace(true);
                    }}
                    onOpenProject={(project) => {
                      setWorkspaceEdit({ project });
                      setProductionView("Projects");
                      setActive("Production");
                      setShowProjectWorkspace(true);
                    }}
                    initialProjectId={financeProjectId}
                    reviewChangesLabel={false}
                    reviewOnly={false}
                  />
                )}
              </div>
            </section>
          )}
          {active === "Tasks" && isHoo && (
            <OperationsTasksPage projects={projects} onNotify={notify} />
          )}
          {(active === "Employees" && !isAdministrationEmployee) && (
            <EmployeesPage projects={projects} isAdministrator={isAdministrator} />
          )}
          {[
            "Assignments",
            "Documents",
            "Reports",
            "Settings",
            "Staff",
          ].includes(active) && (
            <ModulePage active={active} user={user} onNotify={notify} />
          )}
        </div>
      </main>
      {dialog === "new" && !isCeo && !isFinance && !isTechnical && (
        <ProjectDialog
          onClose={() => setDialog(null)}
          onSave={saveProject}
          currentUser={user}
          existingProjectIds={projects.map((project) => project.id)}
          isHoo={isHoo}
          clients={clients}
          onCreateClient={createQuickClient}
        />
      )}
      {selected && (
        <ProjectDetailModal
          selected={selected}
          isCeo={isCeo}
          isHoo={isHoo}
          approval={approvals[selected.id]}
          onClose={() => setSelected(null)}
          isFinance={isFinance}
          invoice={invoiceSeed.find((invoice) => invoice.projectId === selected.id)}
          quotation={
            quotationSeed.find((quotation) => quotation.projectId === selected.id)
          }
          onQuotationAction={() => {
            setSelected(null);
            setFinanceProjectId(selected.id);
            setProductionView("Quotations");
            setActive("Production");
          }}
          onInvoiceAction={() => {
            setSelected(null);
            setInvoiceProjectId(selected.id);
            setProductionView("Invoices");
            setActive("Production");
          }}
          onResubmit={
            isHoo && selected.approvalStatus === "Changes Requested"
              ? () => {
                  updateApproval(selected, "Pending approval", "");
                  setSelected(null);
                }
              : undefined
          }
          onApprovalSubmit={updateApproval}
        />
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
