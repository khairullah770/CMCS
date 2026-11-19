"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Bell,
  BellRing,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  Download,
  FileText,
  ListFilter,
  Mail,
  Pencil,
  Plus,
  Repeat2,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { PageHeader } from "../common/PageHeader";
import { StatCard } from "../common/StatCard";

type ReminderCategory =
  | "Subscriptions"
  | "Equipment Maintenance"
  | "Company & Legal Renewals"
  | "General Reminders";
type ReminderStatus = "Upcoming" | "Due today" | "Overdue";
type Reminder = {
  id: string;
  title: string;
  category: ReminderCategory;
  provider: string;
  responsible: string;
  department: string;
  dueDate: string;
  recurrence: string;
  cost: string;
  notes: string;
  notifications: number[];
  inApp: boolean;
  email: boolean;
};

const categories: ReminderCategory[] = [
  "Subscriptions",
  "Equipment Maintenance",
  "Company & Legal Renewals",
  "General Reminders",
];
const departments = ["All departments", "Administration", "Finance", "IT", "Operations"];
const people = ["All responsible people", "Ayesha Khan", "Bilal Ahmed", "Sarah Wilson", "Omar Shah"];
const notificationDays = [30, 15, 7, 3, 2, 1];

const seedReminders: Reminder[] = [
  {
    id: "rem-1",
    title: "Adobe Creative Cloud",
    category: "Subscriptions",
    provider: "Adobe",
    responsible: "Ayesha Khan",
    department: "IT",
    dueDate: "2026-11-18",
    recurrence: "Monthly",
    cost: "120",
    notes: "Review active seats before renewal.",
    notifications: [30, 15, 7, 3, 1],
    inApp: true,
    email: true,
  },
  {
    id: "rem-2",
    title: "Generator service",
    category: "Equipment Maintenance",
    provider: "PowerCare Services",
    responsible: "Bilal Ahmed",
    department: "Operations",
    dueDate: "2026-11-20",
    recurrence: "Quarterly",
    cost: "350",
    notes: "Include oil and filter replacement.",
    notifications: [15, 7, 3, 1],
    inApp: true,
    email: false,
  },
  {
    id: "rem-3",
    title: "Trade license renewal",
    category: "Company & Legal Renewals",
    provider: "SECP",
    responsible: "Sarah Wilson",
    department: "Administration",
    dueDate: "2026-12-03",
    recurrence: "Yearly",
    cost: "75",
    notes: "Documents are ready in the legal records folder.",
    notifications: [30, 15, 7, 3, 1],
    inApp: true,
    email: true,
  },
  {
    id: "rem-4",
    title: "Office insurance",
    category: "Company & Legal Renewals",
    provider: "SecureLife",
    responsible: "Omar Shah",
    department: "Finance",
    dueDate: "2026-11-12",
    recurrence: "Yearly",
    cost: "1800",
    notes: "Confirm updated equipment valuation.",
    notifications: [30, 15, 7, 3, 2, 1],
    inApp: true,
    email: true,
  },
  {
    id: "rem-5",
    title: "Team offsite booking",
    category: "General Reminders",
    provider: "The Garden House",
    responsible: "Ayesha Khan",
    department: "Administration",
    dueDate: "2026-11-14",
    recurrence: "Does not repeat",
    cost: "600",
    notes: "Confirm final guest count.",
    notifications: [7, 3, 1],
    inApp: true,
    email: false,
  },
];

const initialForm: Omit<Reminder, "id"> = {
  title: "",
  category: "Subscriptions",
  provider: "",
  responsible: "Ayesha Khan",
  department: "Administration",
  dueDate: "2026-11-28",
  recurrence: "Does not repeat",
  cost: "",
  notes: "",
  notifications: [30, 15, 7, 3, 2, 1],
  inApp: true,
  email: true,
};

function getStatus(dueDate: string): ReminderStatus {
  const today = new Date("2026-11-14T00:00:00");
  const due = new Date(`${dueDate}T00:00:00`);
  if (due < today) return "Overdue";
  if (due.getTime() === today.getTime()) return "Due today";
  return "Upcoming";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(`${value}T00:00:00`),
  );
}

function categoryClass(category: ReminderCategory) {
  return category.toLowerCase().replace(/[^a-z]+/g, "-").replace(/(^-|-$)/g, "");
}

export function RemindersPage() {
  const [reminders, setReminders] = useState(seedReminders);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [department, setDepartment] = useState("All departments");
  const [responsible, setResponsible] = useState("All responsible people");
  const [status, setStatus] = useState("All statuses");
  const [dialog, setDialog] = useState<"new" | Reminder | null>(null);
  const [form, setForm] = useState(initialForm);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(new Date("2026-11-01T00:00:00"));

  const filtered = useMemo(
    () =>
      reminders.filter((reminder) => {
        const matchesQuery =
          !query ||
          `${reminder.title} ${reminder.provider}`.toLowerCase().includes(query.toLowerCase());
        return (
          matchesQuery &&
          (category === "All categories" || reminder.category === category) &&
          (department === "All departments" || reminder.department === department) &&
          (responsible === "All responsible people" || reminder.responsible === responsible) &&
          (status === "All statuses" || getStatus(reminder.dueDate) === status)
        );
      }),
    [category, department, query, reminders, responsible, status],
  );

  const counts = useMemo(
    () => ({
      total: reminders.length,
      upcoming: reminders.filter((item) => getStatus(item.dueDate) === "Upcoming").length,
      today: reminders.filter((item) => getStatus(item.dueDate) === "Due today").length,
      overdue: reminders.filter((item) => getStatus(item.dueDate) === "Overdue").length,
    }),
    [reminders],
  );

  const monthDays = useMemo(() => {
    const first = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [calendarMonth]);

  function openNew() {
    setForm({ ...initialForm });
    setAttachments([]);
    setDialog("new");
  }

  function openEdit(reminder: Reminder) {
    const { id: _id, ...values } = reminder;
    setForm(values);
    setAttachments([]);
    setDialog(reminder);
  }

  function saveReminder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim() || !form.dueDate) return;
    if (dialog === "new") {
      setReminders((current) => [...current, { ...form, id: `rem-${Date.now()}` }]);
    } else if (dialog) {
      setReminders((current) => current.map((item) => (item.id === dialog.id ? { ...form, id: item.id } : item)));
    }
    setDialog(null);
  }

  function toggleNotification(day: number) {
    setForm((current) => ({
      ...current,
      notifications: current.notifications.includes(day)
        ? current.notifications.filter((item) => item !== day)
        : [...current.notifications, day].sort((a, b) => b - a),
    }));
  }

  function deleteReminder(id: string) {
    setReminders((current) => current.filter((item) => item.id !== id));
    setDialog(null);
  }

  return (
    <section className="page-section reminders-page">
      <PageHeader
        eyebrow="WORKSPACE / REMINDERS"
        title="Reminders & Renewals"
        copy="Keep subscriptions, maintenance, and important renewals on track."
        action="Add reminder"
        onAction={openNew}
      />

      <div className="stat-grid reminders-stat-grid">
        <StatCard label="Total reminders" value={String(counts.total)} sub="Across all categories" icon={Bell} />
        <StatCard label="Upcoming" value={String(counts.upcoming)} sub="Next 30 days" icon={Clock3} tone="indigo" />
        <StatCard label="Due today" value={String(counts.today)} sub="Needs attention today" icon={CalendarDays} tone="green" />
        <StatCard label="Overdue" value={String(counts.overdue)} sub="Requires follow-up" icon={CircleAlert} tone="red" />
      </div>

      <div className="reminders-toolbar panel">
        <div className="reminders-search">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reminders..." />
        </div>
        <div className="reminders-filters">
          <ListFilter size={15} />
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option>All categories</option>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={department} onChange={(event) => setDepartment(event.target.value)}>
            {departments.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={responsible} onChange={(event) => setResponsible(event.target.value)}>
            {people.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option>All statuses</option>
            <option>Upcoming</option>
            <option>Due today</option>
            <option>Overdue</option>
          </select>
        </div>
      </div>

      <div className="reminders-viewbar">
        <div>
          <h2>Upcoming reminders</h2>
          <p>{filtered.length} reminders matching your filters</p>
        </div>
        <div className="reminders-view-toggle">
          <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}><FileText size={14} /> List</button>
          <button className={view === "calendar" ? "active" : ""} onClick={() => setView("calendar")}><CalendarDays size={14} /> Calendar</button>
        </div>
      </div>

      {view === "list" ? (
        <div className="panel reminders-list-panel">
          {filtered.length === 0 ? (
            <div className="reminders-empty"><Bell size={24} /><strong>No reminders found</strong><span>Try adjusting your filters or add a new reminder.</span></div>
          ) : (
            <div className="reminders-list">
              {filtered.map((reminder) => {
                const itemStatus = getStatus(reminder.dueDate);
                return (
                  <article className="reminder-row" key={reminder.id}>
                    <div className={`reminder-category-icon ${categoryClass(reminder.category)}`}>
                      {reminder.category === "Subscriptions" ? <Repeat2 size={17} /> : reminder.category === "Equipment Maintenance" ? <SettingsIcon /> : reminder.category === "Company & Legal Renewals" ? <FileText size={17} /> : <Bell size={17} />}
                    </div>
                    <div className="reminder-main">
                      <div className="reminder-title-line"><strong>{reminder.title}</strong><span className={`reminder-status ${itemStatus.toLowerCase().replace(" ", "-")}`}><span />{itemStatus}</span></div>
                      <p>{reminder.provider} · {reminder.department} · {reminder.responsible}</p>
                    </div>
                    <div className="reminder-date"><small>Due date</small><strong>{formatDate(reminder.dueDate)}</strong></div>
                    <div className="reminder-repeat"><small>Recurrence</small><strong>{reminder.recurrence}</strong></div>
                    <div className="reminder-actions">
                      <button className="icon-button" onClick={() => openEdit(reminder)} aria-label={`Edit ${reminder.title}`}><Pencil size={15} /></button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="panel reminders-calendar-panel">
          <div className="calendar-heading">
            <button className="icon-button" onClick={() => setCalendarMonth((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))}><ChevronLeft size={17} /></button>
            <strong>{new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(calendarMonth)}</strong>
            <button className="icon-button" onClick={() => setCalendarMonth((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))}><ChevronRight size={17} /></button>
          </div>
          <div className="calendar-weekdays">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}</div>
          <div className="calendar-grid">
            {monthDays.map((date) => {
              const dateKey = date.toISOString().slice(0, 10);
              const dayItems = filtered.filter((item) => item.dueDate === dateKey);
              return <div className={`calendar-day ${date.getMonth() !== calendarMonth.getMonth() ? "muted" : ""}`} key={dateKey}><span>{date.getDate()}</span>{dayItems.map((item) => <button key={item.id} className={`calendar-event ${getStatus(item.dueDate).toLowerCase().replace(" ", "-")}`} onClick={() => openEdit(item)}>{item.title}</button>)}</div>;
            })}
          </div>
        </div>
      )}

      {dialog && (
        <div className="reminder-dialog-backdrop" role="presentation">
          <form className="reminder-dialog" onSubmit={saveReminder}>
            <div className="reminder-dialog-heading"><div><span className="eyebrow">REMINDER DETAILS</span><h2>{dialog === "new" ? "Add reminder" : "Edit reminder"}</h2><p>Set the details and notification schedule.</p></div><button type="button" className="icon-button" onClick={() => setDialog(null)} aria-label="Close"><X size={18} /></button></div>
            <div className="reminder-form-grid">
              <label className="full">Title<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Internet subscription" /></label>
              <label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as ReminderCategory })}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label>Due date<input required type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></label>
              <label>Service provider<input value={form.provider} onChange={(event) => setForm({ ...form, provider: event.target.value })} placeholder="Company or vendor" /></label>
              <label>Recurrence<select value={form.recurrence} onChange={(event) => setForm({ ...form, recurrence: event.target.value })}><option>Does not repeat</option><option>Monthly</option><option>Quarterly</option><option>Every 6 months</option><option>Yearly</option></select></label>
              <label>Responsible person<select value={form.responsible} onChange={(event) => setForm({ ...form, responsible: event.target.value })}>{people.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label>
              <label>Department<select value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })}>{departments.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label>
              <label>Cost<input type="number" min="0" value={form.cost} onChange={(event) => setForm({ ...form, cost: event.target.value })} placeholder="0.00" /></label>
              <label className="full">Attachments<div className="attachment-picker"><input type="file" multiple onChange={(event) => setAttachments(Array.from(event.target.files ?? []))} /><Download size={15} /><span>{attachments.length ? `${attachments.length} file${attachments.length > 1 ? "s" : ""} selected` : "Upload supporting documents"}</span></div></label>
              <label className="full">Notes<textarea rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Add context for the person responsible..." /></label>
            </div>
            <div className="notification-settings"><div><strong>Notify me</strong><span>Choose when CMCS should send a reminder before the due date.</span></div><div className="notification-day-list">{notificationDays.map((day) => <button type="button" className={form.notifications.includes(day) ? "selected" : ""} key={day} onClick={() => toggleNotification(day)}>{form.notifications.includes(day) && <Check size={12} />}{day}d</button>)}</div><div className="notification-channels"><label><input type="checkbox" checked={form.inApp} onChange={(event) => setForm({ ...form, inApp: event.target.checked })} /><BellRing size={14} /> In-app</label><label><input type="checkbox" checked={form.email} onChange={(event) => setForm({ ...form, email: event.target.checked })} /><Mail size={14} /> Email</label></div></div>
            <div className="reminder-dialog-actions">{dialog !== "new" && <button type="button" className="button button-danger" onClick={() => deleteReminder(dialog.id)}><Trash2 size={14} /> Delete</button>}<span /><button type="button" className="button button-secondary" onClick={() => setDialog(null)}>Cancel</button><button type="submit" className="button button-primary"><Check size={14} /> Save reminder</button></div>
          </form>
        </div>
      )}
    </section>
  );
}

function SettingsIcon() {
  return <Repeat2 size={17} />;
}
