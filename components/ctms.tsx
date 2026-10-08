"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Archive,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  FileBarChart,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  PanelLeft,
  Search,
  Settings,
  ShieldCheck,
  Truck,
  Users,
  WalletCards,
  X,
} from "lucide-react";

type Role =
  | "ceo"
  | "hoo"
  | "production"
  | "technical"
  | "finance"
  | "hr"
  | "admin"
  | "employee";
type User = {
  employeeId: string;
  email: string;
  password: string;
  name: string;
  firstName: string;
  role: string;
  department: string;
};
type Workflow = {
  project: "upcoming" | "in_progress" | "completed";
  assignment: "pending" | "accepted";
  invoice: "not_created" | "draft" | "submitted" | "approved";
  payment: number;
};

const users: Record<Role, User> = {
  ceo: {
    employeeId: "CHN-CEO-001",
    email: "ceo@demo.chinar.tv",
    password: "ChinarCEO@2026",
    name: "Ahmad Khan",
    firstName: "Ahmad",
    role: "CEO",
    department: "Management",
  },
  hoo: {
    employeeId: "CHN-HOO-001",
    email: "hoo@demo.chinar.tv",
    password: "ChinarOps@2026",
    name: "Wali Khan",
    firstName: "Wali",
    role: "Head of Operations",
    department: "Operations",
  },
  production: {
    employeeId: "CHN-PROD-001",
    email: "production@demo.chinar.tv",
    password: "ChinarProd@2026",
    name: "Hafizullah Khan",
    firstName: "Hafizullah",
    role: "Production Manager",
    department: "Production",
  },
  technical: {
    employeeId: "CHN-TECH-001",
    email: "technical@demo.chinar.tv",
    password: "ChinarTech@2026",
    name: "Shoaib Ahmad",
    firstName: "Shoaib",
    role: "Technical Manager",
    department: "Technical / IT",
  },
  finance: {
    employeeId: "CHN-FIN-001",
    email: "finance@demo.chinar.tv",
    password: "ChinarFinance@2026",
    name: "Farid Ahmad",
    firstName: "Farid",
    role: "Finance Officer",
    department: "Finance",
  },
  hr: {
    employeeId: "CHN-HR-001",
    email: "hr@demo.chinar.tv",
    password: "ChinarHR@2026",
    name: "Zainab Ahmad",
    firstName: "Zainab",
    role: "HR Manager",
    department: "Human Resources",
  },
  admin: {
    employeeId: "CHN-ADM-001",
    email: "admin@demo.chinar.tv",
    password: "ChinarAdmin@2026",
    name: "Mohammad Wali",
    firstName: "Mohammad",
    role: "System Administrator",
    department: "Administration",
  },
  employee: {
    employeeId: "CHN-EMP-001",
    email: "employee@demo.chinar.tv",
    password: "ChinarEmployee@2026",
    name: "Ahmad Rahimi",
    firstName: "Ahmad",
    role: "Employee",
    department: "Production",
  },
};
const data: Record<
  Role,
  { labels: string[]; metrics: string[]; panels: string[]; copy: string }
> = {
  ceo: {
    labels: [
      "Active productions",
      "On-air this week",
      "Team utilisation",
      "Monthly spend",
    ],
    metrics: ["24", "86.4", "78", "$284.6"],
    panels: ["Broadcast schedule", "Recent activity", "Performance overview"],
    copy: "Here’s the business pulse across Chinar TV today.",
  },
  hoo: {
    labels: [
      "Today’s projects",
      "Pending assignments",
      "Delayed projects",
      "Field teams active",
    ],
    metrics: ["08", "05", "03", "12"],
    panels: ["Today’s operations", "Assignment queue", "Operational alerts"],
    copy: "Coordinate today’s projects, teams, and field operations.",
  },
  production: {
    labels: [
      "Today’s programmes",
      "Crew on assignment",
      "Production readiness",
      "Open incidents",
    ],
    metrics: ["10", "42", "91", "03"],
    panels: [
      "Today’s production plan",
      "Production activity",
      "Output overview",
    ],
    copy: "Keep today’s productions moving smoothly and on schedule.",
  },
  technical: {
    labels: [
      "Open incidents",
      "Systems online",
      "Maintenance due",
      "Assets assigned",
    ],
    metrics: ["04", "99.8", "06", "128"],
    panels: [
      "Technical operations",
      "Incident activity",
      "Infrastructure health",
    ],
    copy: "Keep studios, systems, and broadcast infrastructure reliable.",
  },
  finance: {
    labels: [
      "Outstanding invoices",
      "Paid this month",
      "Awaiting approval",
      "Monthly spend",
    ],
    metrics: ["18", "$184.2", "07", "$284.6"],
    panels: ["Invoices & payments", "Finance activity", "Cash flow overview"],
    copy: "Stay on top of invoices, payments, and the month’s financial health.",
  },
  hr: {
    labels: ["Total employees", "Present today", "On leave", "Open requests"],
    metrics: ["148", "136", "12", "08"],
    panels: ["Today’s attendance", "People activity", "People overview"],
    copy: "Support your people with a clear view of attendance and team wellbeing.",
  },
  admin: {
    labels: [
      "Pending requests",
      "Active users",
      "Documents due",
      "Open actions",
    ],
    metrics: ["14", "148", "09", "22"],
    panels: ["Admin requests", "Latest activity", "Workspace health"],
    copy: "Manage the workspace, requests, and day-to-day administration.",
  },
  employee: {
    labels: [
      "My open tasks",
      "Due today",
      "Completed this week",
      "Leave balance",
    ],
    metrics: ["08", "03", "17", "12 days"],
    panels: ["My tasks today", "My recent activity", "My workload"],
    copy: "Here’s the work assigned to you today.",
  },
};
const initialWorkflow: Workflow = {
  project: "upcoming",
  assignment: "pending",
  invoice: "not_created",
  payment: 0,
};

export function Login({ onLogin }: { onLogin: (u: User) => void }) {
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [demo, setDemo] = useState(false);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const found = Object.values(users).find(
      (u) =>
        u.email === identity.trim().toLowerCase() ||
        u.employeeId.toLowerCase() === identity.trim().toLowerCase(),
    );
    if (!found || found.password !== password)
      return setError("Those credentials did not match a demo account.");
    onLogin(found);
  }
  return (
    <section className="auth-screen">
      <div className="auth-form-panel">
        <div className="auth-form-wrap">
          <div className="mobile-auth-logo">
            <img src="/assets/chinar-logo.png" alt="Chinar logo" />
          </div>
          <div className="auth-form-head">
            <span className="eyebrow">CMCS</span>
            <h2>Welcome back</h2>
            <p>Chinar Media Consulting Service — Management System</p>
          </div>
          <form className="auth-form" onSubmit={submit}>
            <label>
              Employee ID or Email
              <input
                required
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                placeholder="Enter employee ID or email"
              />
            </label>
            <label>
              Password
              <div className="password-field">
                <input
                  required
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShow(!show)}
                >
                  {show ? "Hide" : "Show"}
                </button>
              </div>
            </label>
            {error && <p className="auth-error">{error}</p>}
            <button className="auth-submit" type="submit">
              Sign In<span>→</span>
            </button>
          </form>
          <button
            className="demo-accounts-toggle"
            onClick={() => setDemo(!demo)}
          >
            Demo Accounts <span>⌄</span>
          </button>
          {demo && (
            <div className="demo-list">
              {Object.entries(users).map(([key, u]) => (
                <button
                  key={key}
                  onClick={() => {
                    setIdentity(u.email);
                    setPassword(u.password);
                  }}
                >
                  {u.role} · {u.email}
                </button>
              ))}
            </div>
          )}
          <p className="auth-authorized">
            ▣ Authorized Chinar TV personnel only
          </p>
          <p className="auth-help">
            Need access? Contact your Admin or HR manager.
          </p>
        </div>
      </div>
    </section>
  );
}

const ceoNavigation = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Operations",
    icon: ClipboardList,
    children: ["All Projects", "Upcoming Projects", "Active Projects", "Delayed Projects", "Completed Projects"],
  },
  {
    label: "Assignments",
    icon: Users,
    children: ["Assignment Overview", "Pending Responses", "Employee Workload"],
  },
  {
    label: "Resources",
    icon: Truck,
    children: ["Employees", "OB Vans", "Equipment", "Resource Bookings", "Rentals"],
  },
  {
    label: "Finance",
    icon: WalletCards,
    children: ["Finance Overview", "Invoices", "Payments", "Expenses", "Outstanding"],
  },
  {
    label: "Reports",
    icon: FileBarChart,
    children: ["Project Reports", "Financial Reports", "Employee / Resource Reports", "Operational Analytics"],
  },
  { label: "Notifications", icon: Bell, count: 4 },
  { label: "Audit Logs", icon: ShieldCheck },
  { label: "Archive", icon: Archive },
  { label: "Settings", icon: Settings },
];

const ceoPeriods = {
  Today: { projects: "24", active: "11", upcoming: "5", delayed: "3", completed: "7", revenue: "$284.6k", outstanding: "$42.8k", invoices: "6" },
  "This Week": { projects: "31", active: "14", upcoming: "9", delayed: "4", completed: "12", revenue: "$512.4k", outstanding: "$68.2k", invoices: "9" },
  "This Month": { projects: "48", active: "19", upcoming: "13", delayed: "6", completed: "26", revenue: "$1.24m", outstanding: "$184.6k", invoices: "17" },
  "This Year": { projects: "186", active: "22", upcoming: "18", delayed: "9", completed: "137", revenue: "$8.62m", outstanding: "$428.3k", invoices: "24" },
  "Custom Range": { projects: "36", active: "16", upcoming: "8", delayed: "4", completed: "18", revenue: "$768.2k", outstanding: "$96.4k", invoices: "11" },
} as const;

function CeoDashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [active, setActive] = useState("Dashboard");
  const [period, setPeriod] = useState<keyof typeof ceoPeriods>("Today");
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const metrics = ceoPeriods[period];
  const greeting = new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 18 ? "Good Afternoon" : "Good Evening";
  const initials = user.firstName.slice(0, 2).toUpperCase();

  return (
    <div className="app-shell is-visible ceo-shell">
      <aside className={"sidebar ceo-sidebar " + (mobileNavOpen ? "mobile-open" : "")}>
        <div className="brand">
          <div className="brand-mark"><img src="/assets/chinar-logo.png" alt="CMCS" /></div>
          <div><strong>CMCS</strong><span>Executive workspace</span></div>
          <button className="sidebar-close" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <div className="ceo-role-badge"><ShieldCheck size={14} /><span>CEO CONTROL CENTRE</span></div>
        <nav className="ceo-nav" aria-label="CEO navigation">
          {ceoNavigation.map(({ label, icon: Icon, children, count }) => (
            <div key={label} className="ceo-nav-group">
              <button className={"nav-item " + (active === label ? "active" : "")} onClick={() => setActive(label)}>
                <Icon className="nav-icon" size={17} strokeWidth={1.8} />{label}
                {count && <span className="nav-count">{count}</span>}
                {children && <ChevronDown className="ceo-nav-chevron" size={14} />}
              </button>
              {children && active === label && <div className="ceo-subnav">{children.map((child) => <button key={child} onClick={() => setActive(child)}>{child}</button>)}</div>}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="help-card"><span className="help-icon"><HelpCircle size={14} /></span><div><strong>Need a hand?</strong><span>Visit the help centre</span></div></div>
          <div className="user-mini"><div className="avatar avatar-indigo">{initials}</div><div><strong>{user.name}</strong><span>{user.role}</span></div><button className="icon-button" onClick={onLogout} aria-label="Log out"><LogOut size={16} /></button></div>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar ceo-topbar">
          <button className="menu-button" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
          <div className="breadcrumbs"><span>Executive workspace</span><b>/</b><strong>{active}</strong></div>
          <div className="topbar-actions">
            <label className="ceo-search"><Search size={16} /><input placeholder="Search projects, people..." aria-label="Search" /></label>
            <button className="icon-button notification-button" aria-label="Notifications"><Bell size={19} /><span className="notification-count">4</span></button>
            <div className="topbar-divider" />
            <div className="ceo-profile-wrap">
              <button className="ceo-profile-button" onClick={() => setProfileOpen(!profileOpen)}>
                <div className="avatar avatar-indigo">{initials}</div><span><strong>{user.name}</strong><small>CEO</small></span><ChevronDown size={14} />
              </button>
              {profileOpen && <div className="ceo-profile-menu"><button><Users size={14} />My Profile</button><button><Settings size={14} />Account Settings</button><button><HelpCircle size={14} />Help</button><button onClick={onLogout}><LogOut size={14} />Logout</button></div>}
            </div>
          </div>
        </header>
        <div className="page-content ceo-content">
          <section className="ceo-dashboard-head">
            <div><p className="eyebrow">Tuesday, 07 October 2026</p><h1>{greeting}, CEO</h1><p className="heading-copy">Here&apos;s what&apos;s happening across CMCS today.</p></div>
            <div className="ceo-head-date"><CalendarDays size={16} /><span>07 October 2026</span></div>
          </section>
          <div className="ceo-period-bar"><span>Performance period</span><div>{(Object.keys(ceoPeriods) as Array<keyof typeof ceoPeriods>).map((item) => <button key={item} className={period === item ? "selected" : ""} onClick={() => setPeriod(item)}>{item}</button>)}</div></div>
          <section className="ceo-kpis">
            {[
              ["Total Projects", metrics.projects, "+12.5%", "purple", ClipboardList],
              ["Active Projects", metrics.active, "+8.4%", "blue", Clock3],
              ["Upcoming Projects", metrics.upcoming, "+16.2%", "green", CalendarDays],
              ["Delayed Projects", metrics.delayed, "+2.1%", "red", AlertTriangle],
              ["Completed Projects", metrics.completed, "+18.7%", "teal", CheckCircle2],
              ["Total Revenue", metrics.revenue, "+14.8%", "purple", CircleDollarSign],
              ["Outstanding Payments", metrics.outstanding, "Needs attention", "orange", WalletCards],
              ["Pending Invoices", metrics.invoices, "Awaiting review", "yellow", FileText],
            ].map(([label, value, change, color, Icon]) => (
              <article className={"ceo-kpi " + color} key={label as string}><div><span>{label as string}</span><Icon size={18} /></div><strong>{value as string}</strong><small>{(color === "red" || color === "orange" || color === "yellow") ? <b>{change as string}</b> : <em>{change as string}</em>} <span>vs previous period</span></small></article>
            ))}
          </section>
          <section className="ceo-section-heading"><div><p className="eyebrow">PRIORITIES</p><h2>Action Required</h2><p>Items that need your attention today.</p></div><button className="text-button" onClick={() => setActive("Notifications")}>View all <span>→</span></button></section>
          <section className="ceo-actions-grid">
            {[
              ["Critical", "UNDP Videography Project is delayed by 2 days", "PRJ-2026-0042 · Operations", "Review project", AlertTriangle],
              ["High", "3 employees have not responded to assignments", "Assignment queue · Production", "Review responses", Users],
              ["Medium", "Invoice INV-2026-021 is awaiting review", "Finance · $18,400", "Open invoice", FileText],
              ["Warning", "OB Van 02 is currently under maintenance", "Resources · Returns 09 Oct", "View resource", Truck],
            ].map(([severity, title, meta, action, Icon]) => <article className={"ceo-action-card " + String(severity).toLowerCase()} key={title as string}><div className="ceo-action-icon"><Icon size={17} /></div><div><span className="ceo-severity">{severity as string}</span><strong>{title as string}</strong><small>{meta as string}</small></div><button onClick={() => setActive(String(action))}>{action as string}<span>→</span></button></article>)}
          </section>
          <section className="ceo-main-grid">
            <article className="ceo-panel ceo-projects-panel"><div className="panel-heading"><div><h2>Project Overview</h2><p>Live view of your company&apos;s project portfolio.</p></div><button className="text-button" onClick={() => setActive("All Projects")}>View all <span>→</span></button></div><div className="ceo-project-list">
              {[["UNDP Community Awareness Videography", "UNDP · PRJ-2026-0042", "In Progress", "72%", "Oct 12, 2026", "blue"], ["National Election Coverage", "IEC · PRJ-2026-0038", "Delayed", "48%", "Oct 08, 2026", "red"], ["Kabul City Documentary", "Ministry of Culture · PRJ-2026-0045", "Upcoming", "18%", "Oct 18, 2026", "purple"], ["Youth Media Training Series", "UNICEF · PRJ-2026-0031", "Completed", "100%", "Oct 05, 2026", "green"]].map(([name, client, status, progress, date, color]) => <div className="ceo-project-row" key={name}><div className={"project-thumb thumb-" + color}>{(name as string).slice(0, 2).toUpperCase()}</div><div className="ceo-project-name"><strong>{name}</strong><small>{client}</small></div><span className={"ceo-status " + String(status).toLowerCase().replace(" ", "-")}>{status}</span><div className="ceo-progress"><span>{progress}</span><i><b style={{ width: progress as string }} /></i></div><time>{date}</time><button aria-label={"More options for " + name}><MoreHorizontal size={16} /></button></div>)}</div></article>
            <article className="ceo-panel"><div className="panel-heading"><div><h2>Resource Status</h2><p>Availability across the company.</p></div><button className="text-button" onClick={() => setActive("Resources")}>Manage <span>→</span></button></div><div className="ceo-resource-stat"><div><Users size={16} /><span>Employees available</span><strong>86%</strong></div><i><b style={{ width: "86%" }} /></i></div><div className="ceo-resource-stat"><div><Truck size={16} /><span>OB Vans operational</span><strong>5 / 6</strong></div><i className="warning"><b style={{ width: "83%" }} /></i></div><div className="ceo-resource-stat"><div><PanelLeft size={16} /><span>Equipment in use</span><strong>72%</strong></div><i><b style={{ width: "72%" }} /></i></div><div className="ceo-leave-note"><Clock3 size={15} /><span><strong>12 employees</strong> are on approved leave today.</span></div></article>
          </section>
          <section className="ceo-lower-grid"><article className="ceo-panel"><div className="panel-heading"><div><h2>Finance Snapshot</h2><p>Current period performance.</p></div><button className="text-button" onClick={() => setActive("Finance Overview")}>View finance <span>→</span></button></div><div className="ceo-finance-list"><div><span>Collected revenue</span><strong>$241,800</strong><em>+14.8%</em></div><div><span>Outstanding balances</span><strong>$42,800</strong><b>12 accounts</b></div><div><span>Invoices pending</span><strong>6</strong><b>Needs review</b></div></div></article><article className="ceo-panel"><div className="panel-heading"><div><h2>Recent Activity</h2><p>Latest company updates.</p></div><button className="text-button">View all <span>→</span></button></div><div className="ceo-activity"><p><CheckCircle2 size={15} /><span><strong>Project completed</strong> — Youth Media Training Series<small>32 minutes ago</small></span></p><p><FileText size={15} /><span><strong>Invoice submitted</strong> — INV-2026-024<small>2 hours ago</small></span></p><p><Users size={15} /><span><strong>Assignment accepted</strong> — Ahmad Rahimi<small>3 hours ago</small></span></p></div></article></section>
        </div>
      </main>
    </div>
  );
}

export function Dashboard({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  const role =
    (Object.keys(users) as Role[]).find((k) => users[k].email === user.email) ||
    "employee";
  const roleData = data[role];
  const [workflow, setWorkflow] = useState<Workflow>(initialWorkflow);
  const [active, setActive] = useState("Overview");
  useEffect(() => {
    const saved = localStorage.getItem("cmcsProjectWorkflow");
    if (saved) setWorkflow(JSON.parse(saved));
  }, []);
  function update(p: Partial<Workflow>) {
    const next = { ...workflow, ...p };
    setWorkflow(next);
    localStorage.setItem("cmcsProjectWorkflow", JSON.stringify(next));
  }
  const action = useMemo(() => {
    if (role === "hoo" && workflow.assignment === "pending")
      return ["Confirm Team", () => update({ assignment: "accepted" })];
    if (role === "employee" && workflow.assignment === "pending")
      return ["Accept Assignment", () => update({ assignment: "accepted" })];
    if (role === "employee" && workflow.project === "upcoming")
      return ["Start My Work", () => update({ project: "in_progress" })];
    if (role === "employee" && workflow.project === "in_progress")
      return ["Complete My Work", () => update({ project: "completed" })];
    if (
      role === "finance" &&
      workflow.project === "completed" &&
      workflow.invoice === "not_created"
    )
      return ["Create Invoice", () => update({ invoice: "draft" })];
    if (role === "finance" && workflow.invoice === "draft")
      return [
        "Submit for Admin Review",
        () => update({ invoice: "submitted" }),
      ];
    if (role === "admin" && workflow.invoice === "submitted")
      return ["Approve Invoice", () => update({ invoice: "approved" })];
    if (
      role === "finance" &&
      workflow.invoice === "approved" &&
      workflow.payment < 4500
    )
      return ["Record Payment", () => update({ payment: 4500 })];
    return null;
  }, [role, workflow]);
  if (role === "ceo") return <CeoDashboard user={user} onLogout={onLogout} />;
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <img src="/assets/chinar-logo.png" alt="" />
          </div>
          <div>
            <strong>CMCS</strong>
            <span>Management system</span>
          </div>
        </div>
        <div className="workspace-label">Workspace</div>
        <div className="workspace-switcher">
          <div className="workspace-avatar">CM</div>
          <div>
            <strong>Chinar Television</strong>
            <span>Operations workspace</span>
          </div>
        </div>
        <nav className="primary-nav">
          {[
            "Overview",
            "Programming",
            "Projects",
            "People",
            "Assets & inventory",
            "Finance",
          ].map((item, i) => (
            <button
              key={item}
              className={"nav-item " + (active === item ? "active" : "")}
              onClick={() => setActive(item)}
            >
              <span className="nav-icon">
                {["⌂", "▦", "◈", "♙", "▣", "◒"][i]}
              </span>
              {item}
              {item === "Projects" && <span className="nav-count">8</span>}
            </button>
          ))}
        </nav>
        <div className="workspace-label nav-section-label">Workspace tools</div>
        <nav className="secondary-nav">
          {["Reports", "Calendar", "Settings"].map((item) => (
            <button
              className="nav-item"
              key={item}
              onClick={() => setActive(item)}
            >
              {item}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="help-card">
            <span className="help-icon">?</span>
            <div>
              <strong>Need a hand?</strong>
              <span>Visit the help centre</span>
            </div>
          </div>
          <div className="user-mini">
            <div className="avatar avatar-indigo">
              {user.firstName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <strong>{user.name}</strong>
              <span>{user.role}</span>
            </div>
            <button className="logout-button" onClick={onLogout}>
              ↪ Log out
            </button>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Workspace</span>
            <b>/</b>
            <strong>{active}</strong>
          </div>
          <div className="topbar-actions">
            <button className="icon-button">⌕</button>
            <button className="icon-button">♢</button>
            <div className="topbar-divider" />
            <div className="user-context">
              <strong>{user.name}</strong>
              <span>{user.role}</span>
            </div>
            <button className="logout-button topbar-logout" onClick={onLogout}>
              ↪ Log out
            </button>
            <div className="avatar avatar-indigo">
              {user.firstName.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="page-content">
          <section className="page-heading">
            <div>
              <p className="eyebrow">Tuesday, 07 October 2026</p>
              <h1>
                Good morning, {user.firstName} <span className="wave">✦</span>
              </h1>
              <p className="heading-copy">{roleData.copy}</p>
            </div>
            <div className="heading-actions">
              <button className="button button-secondary">
                Export report ↓
              </button>
              <button className="button button-primary">+ New action</button>
            </div>
          </section>
          <section className="metric-grid">
            {roleData.labels.map((label, i) => (
              <article className="metric-card" key={label}>
                <div className="metric-top">
                  <span className="metric-label">{label}</span>
                  <span className="metric-icon purple">◈</span>
                </div>
                <strong className="metric-value">{roleData.metrics[i]}</strong>
                <div className="metric-meta">
                  <span className="trend-up">
                    ↗ {i === 2 ? "4.8" : "12.5"}%
                  </span>
                  <span>vs last month</span>
                </div>
              </article>
            ))}
          </section>
          <section className="panel-grid">
            {roleData.panels.map((panel, i) => (
              <article className="dashboard-panel" key={panel}>
                <div className="panel-heading">
                  <h2>{panel}</h2>
                  <button className="text-button">View all →</button>
                </div>
                <div className="empty-state">
                  <span>{["◷", "▤", "◒"][i]}</span>
                  <p>{active} data is ready for your workspace.</p>
                  <small>Updates will appear here as the team works.</small>
                </div>
              </article>
            ))}
          </section>
          <article className="workflow-card">
            <div className="workflow-card-head">
              <div>
                <p className="eyebrow">CONNECTED DEMO WORKFLOW</p>
                <h2>UNDP Community Awareness Videography</h2>
                <p>PRJ-2026-0042 · UNDP · Kabul · Oct 12–15, 2026</p>
              </div>
              <span
                className={
                  "workflow-status " + workflow.project.replace("_", "-")
                }
              >
                {workflow.project === "in_progress"
                  ? "In Progress"
                  : workflow.project[0].toUpperCase() +
                    workflow.project.slice(1)}
              </span>
            </div>
            <div className="workflow-stepper">
              <span className="done">Project</span>
              <i />
              <span
                className={workflow.assignment === "accepted" ? "done" : ""}
              >
                Assignment
              </span>
              <i />
              <span className={workflow.project === "completed" ? "done" : ""}>
                Delivery
              </span>
              <i />
              <span className={workflow.invoice === "approved" ? "done" : ""}>
                Finance
              </span>
            </div>
            <div className="workflow-actions">
              {action ? (
                <button
                  className="button button-primary"
                  onClick={action[1] as () => void}
                >
                  {action[0] as string}
                </button>
              ) : (
                <span className="workflow-muted">
                  Workflow is waiting for the next team action.
                </span>
              )}
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
