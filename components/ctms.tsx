"use client";

import { useEffect, useMemo, useState } from "react";

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
