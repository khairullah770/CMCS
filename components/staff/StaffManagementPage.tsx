"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import {
  Check,
  Edit3,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  Upload,
  UserCheck,
  UserRound,
  X,
} from "lucide-react";
import { PageHeader } from "../common/PageHeader";
import { equipmentFunctions } from "../../lib/dummy-data/equipment";
import { users } from "../../lib/dummy-data/mock-data";
import {
  staffFunctions,
  staffSeed,
  StaffFunction,
  StaffMember,
} from "../../lib/dummy-data/staff";

type StaffType = "Freelancer" | "External Crew";
type Availability = "Available" | "Unavailable";
type RecordStatus = "Active" | "Inactive";

type CrewForm = {
  profileImage: string;
  firstName: string;
  lastName: string;
  prefix: string;
  jobTitle: string;
  staffType: StaffType;
  functions: StaffFunction[];
  expertise: string;
  experience: string;
  mobile: string;
  telephone: string;
  email: string;
  city: string;
  country: string;
  managedBy: string;
  company: string;
  supplier: string;
  availabilityStatus: Availability;
  recordStatus: RecordStatus;
};

const idFor = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const functionOptions = Array.from(
  new Map(
    [
      ...staffFunctions,
      ...equipmentFunctions.map((role) => ({ department: "RESOURCES", role })),
    ].map((item) => [`${item.department}:${item.role}`, item]),
  ).values(),
);

  const companyEmployees = Object.values(users);

function functionKey(item: StaffFunction) {
  return `${item.department}:${item.role}`;
}

function functionsFor(staff: StaffMember) {
  return staff.functions?.length ? staff.functions : [staff.function];
}

function normalizeStaff(staff: StaffMember): StaffMember {
  const functions = functionsFor(staff);
  return {
    ...staff,
    functions,
    staffType:
      staff.staffType ?? (staff.freelance ? "Freelancer" : "External Crew"),
    experience: staff.experience ?? "",
    mobile: staff.mobile ?? "",
    telephone: staff.telephone ?? "",
    email:
      staff.email ??
      `${staff.firstName.toLowerCase()}.${staff.lastName.toLowerCase()}@cmcs.tv`,
    supplier: staff.supplier ?? "",
    availabilityStatus:
      staff.availabilityStatus ??
      (staff.unavailable.length ? "Unavailable" : "Available"),
    recordStatus: staff.recordStatus ?? "Active",
  };
}

function formFromStaff(staff?: StaffMember): CrewForm {
  const current = staff ? normalizeStaff(staff) : null;
  return {
    profileImage: current?.profileImage ?? "",
    firstName: current?.firstName ?? "",
    lastName: current?.lastName ?? "",
    prefix: current?.prefix ?? "Mr.",
    jobTitle: current?.jobTitle ?? "",
    staffType: current?.staffType ?? "Freelancer",
    functions: current?.functions ?? [functionOptions[0]],
    expertise: current?.expertise.join(", ") ?? "",
    experience: current?.experience ?? "",
    mobile: current?.mobile ?? "",
    telephone: current?.telephone ?? "",
    email: current?.email ?? "",
    city: current?.address.city ?? "",
    country: current?.address.country ?? "Afghanistan",
    managedBy: current?.managedBy ?? "Head of Operations",
    company: current?.companies[0]?.company ?? "",
    supplier: current?.supplier ?? "",
    availabilityStatus: current?.availabilityStatus ?? "Available",
    recordStatus: current?.recordStatus ?? "Active",
  };
}

function toStaffMember(form: CrewForm, existing?: StaffMember): StaffMember {
  const functions = form.functions.length
    ? form.functions
    : [functionOptions[0]];
  return {
    ...(existing ?? {
      id: idFor("STF"),
      loginAssigned: false,
      uiLanguage: "English",
      address: { street: "", city: "", country: "", zipCode: "" },
      identity: { nationalId: "", passport: "", dateOfBirth: "" },
      contract: {
        employmentType: "External",
        startDate: "",
        endDate: "",
        salary: "",
      },
      group: "Production",
      companies: [],
      contracts: [],
      bookings: [],
      unavailable: [],
    }),
    managedBy: form.managedBy,
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    prefix: form.prefix,
    jobTitle: form.jobTitle.trim(),
    freelance: form.staffType === "Freelancer",
    staffType: form.staffType,
    function: functions[0],
    functions,
    expertise: form.expertise
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    experience: form.experience.trim(),
    mobile: form.mobile.trim(),
    telephone: form.telephone.trim(),
    email: form.email.trim(),
    supplier: form.supplier,
    availabilityStatus: form.availabilityStatus,
    recordStatus: form.recordStatus,
    address: {
      ...(existing?.address ?? { street: "", zipCode: "" }),
      city: form.city.trim(),
      country: form.country.trim(),
    },
    companies: form.company
      ? [
          {
            id: existing?.companies[0]?.id ?? idFor("SC"),
            company: form.company,
          },
        ]
      : [],
  };
}

function Avatar({
  staff,
  large = false,
}: {
  staff: StaffMember;
  large?: boolean;
}) {
  return (
    <span className={large ? "staff-profile-avatar" : "staff-avatar"}>
      {staff.profileImage ? (
        <img src={staff.profileImage} alt="" />
      ) : (
        `${staff.firstName[0] ?? ""}${staff.lastName[0] ?? ""}`
      )}
    </span>
  );
}

function EmployeeAssignments({
  availableFunctions,
  assignments,
  onToggleFunction,
}: {
  availableFunctions: StaffFunction[];
  assignments: Record<string, StaffFunction[]>;
  onToggleFunction: (employeeId: string, staffFunction: StaffFunction) => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(
    companyEmployees[0]?.employeeId ?? "",
  );
  const selected = companyEmployees.find(
    (employee) => employee.employeeId === selectedId,
  );
  const filteredEmployees = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return companyEmployees.filter(
      (employee) =>
        !needle ||
        `${employee.name} ${employee.email} ${employee.department} ${employee.role}`
          .toLowerCase()
          .includes(needle),
    );
  }, [query]);
  const selectedAssignments = selected ? assignments[selected.employeeId] ?? [] : [];

  return (
    <div className="employee-assignment-layout">
      <div className="panel employee-directory">
        <div className="employee-directory-heading">
          <div>
            <h2>Company employees</h2>
            <p>{companyEmployees.length} existing employee records</p>
          </div>
          <span>{filteredEmployees.length}</span>
        </div>
        <label className="inline-search employee-directory-search">
          <Search size={14} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search employees..."
            aria-label="Search company employees"
          />
        </label>
        <div className="employee-directory-list">
          {filteredEmployees.map((employee) => {
            const employeeFunctions = assignments[employee.employeeId] ?? [];
            return (
              <button
                key={employee.employeeId}
                className={selected?.employeeId === employee.employeeId ? "selected" : ""}
                onClick={() => setSelectedId(employee.employeeId)}
              >
                <span className="employee-directory-avatar">
                  {employee.firstName.slice(0, 2).toUpperCase()}
                </span>
                <span>
                  <strong>{employee.name}</strong>
                  <small>{employee.role}</small>
                  <em>{employee.department}</em>
                </span>
                <b>{employeeFunctions.length}</b>
              </button>
            );
          })}
          {!filteredEmployees.length && (
            <div className="empty-state">
              <Search size={24} />
              <p>No employees match your search.</p>
            </div>
          )}
        </div>
      </div>

      {selected ? (
        <div className="panel employee-assignment-panel">
          <div className="employee-assignment-header">
            <div className="staff-profile-identity">
              <span className="staff-profile-avatar employee-assignment-avatar">
                {selected.firstName.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <span className="eyebrow">{selected.employeeId}</span>
                <h2>{selected.name}</h2>
                <p>
                  {selected.role} · {selected.department}
                </p>
              </div>
            </div>
            <UserCheck size={20} />
          </div>
          <div className="employee-assignment-body">
            <div className="crew-detail-heading">
              <div>
                <strong>Assign functions</strong>
                <p>Select the functions this employee can support.</p>
              </div>
              <span className="crew-status active">
                {selectedAssignments.length} assigned
              </span>
            </div>
            <div className="crew-function-options">
              {availableFunctions.map((item) => (
                <label className="crew-function-option" key={functionKey(item)}>
                  <input
                    type="checkbox"
                    checked={selectedAssignments.some(
                      (value) => functionKey(value) === functionKey(item),
                    )}
                    onChange={() =>
                      onToggleFunction(selected.employeeId, item)
                    }
                  />
                  <span>{item.role}</span>
                  <small>{item.department}</small>
                </label>
              ))}
            </div>
            <div className="employee-assignment-note">
              <Check size={14} />
              <span>
                Assignments update this existing employee record. No duplicate
                staff profile will be created.
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="panel staff-no-selection">
          Select an employee to assign functions.
        </div>
      )}
    </div>
  );
}

function StaffDialog({
  staff,
  availableFunctions,
  onCreateFunction,
  onClose,
  onSave,
}: {
  staff?: StaffMember;
  availableFunctions: StaffFunction[];
  onCreateFunction: (staffFunction: StaffFunction) => void;
  onClose: () => void;
  onSave: (staff: StaffMember) => void;
}) {
  const [form, setForm] = useState<CrewForm>(() => formFromStaff(staff));
  const [error, setError] = useState("");
  const [customFunction, setCustomFunction] = useState("");
  const [customDepartment, setCustomDepartment] = useState("RESOURCES");
  const update = <K extends keyof CrewForm>(key: K, value: CrewForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string")
        update("profileImage", reader.result);
    };
    reader.readAsDataURL(file);
  }

  function toggleFunction(item: StaffFunction) {
    setForm((current) => ({
      ...current,
      functions: current.functions.some(
        (value) => functionKey(value) === functionKey(item),
      )
        ? current.functions.filter(
            (value) => functionKey(value) !== functionKey(item),
          )
        : [...current.functions, item],
    }));
  }

  function addCustomFunction() {
    const role = customFunction.trim();
    if (!role) return;
    if (
      availableFunctions.some(
        (item) => item.role.toLowerCase() === role.toLowerCase(),
      )
    ) {
      setError("This function already exists.");
      return;
    }
    const item = { department: customDepartment, role };
    onCreateFunction(item);
    setForm((current) => ({
      ...current,
      functions: [...current.functions, item],
    }));
    setCustomFunction("");
    setError("");
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.jobTitle.trim()
    ) {
      setError("First name, last name and job title are required.");
      return;
    }
    if (!form.functions.length) {
      setError("Select at least one function.");
      return;
    }
    onSave(toStaffMember(form, staff));
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <div className="dialog crew-dialog">
        <div className="dialog-head">
          <div>
            <span className="eyebrow">
              {staff ? "EDIT CREW PROFILE" : "NEW CREW PROFILE"}
            </span>
            <h2>
              {staff
                ? "Update staff member"
                : "Add freelancer or external crew"}
            </h2>
            <p>
              Keep production talent ready for project assignments and rate
              cards.
            </p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <form className="crew-form" onSubmit={submit}>
          <section className="crew-form-section">
            <div className="crew-form-section-heading">
              <UserRound size={15} />
              <div>
                <strong>Personal information</strong>
                <small>Identify this crew member.</small>
              </div>
            </div>
            <div className="crew-form-grid">
              <label className="crew-image-field">
                Profile image
                <input type="file" accept="image/*" onChange={handleImage} />
                <span>
                  {form.profileImage ? (
                    <img src={form.profileImage} alt="" />
                  ) : (
                    <Upload size={16} />
                  )}
                  <b>{form.profileImage ? "Change image" : "Upload image"}</b>
                </span>
              </label>
              <div className="crew-form-grid crew-form-grid-nested">
                <label>
                  Prefix
                  <select
                    value={form.prefix}
                    onChange={(event) => update("prefix", event.target.value)}
                  >
                    <option>Mr.</option>
                    <option>Ms.</option>
                    <option>Dr.</option>
                  </select>
                </label>
                <label>
                  First name *
                  <input
                    value={form.firstName}
                    onChange={(event) =>
                      update("firstName", event.target.value)
                    }
                  />
                </label>
                <label>
                  Last name *
                  <input
                    value={form.lastName}
                    onChange={(event) => update("lastName", event.target.value)}
                  />
                </label>
                <label>
                  Job title *
                  <input
                    value={form.jobTitle}
                    onChange={(event) => update("jobTitle", event.target.value)}
                    placeholder="e.g. Camera Operator"
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="crew-form-section">
            <div className="crew-form-section-heading">
              <Check size={15} />
              <div>
                <strong>Professional information</strong>
                <small>Connect skills to existing Resources functions.</small>
              </div>
            </div>
            <div className="crew-form-grid">
              <label>
                Staff type
                <select
                  value={form.staffType}
                  onChange={(event) =>
                    update("staffType", event.target.value as StaffType)
                  }
                >
                  <option>Freelancer</option>
                  <option>External Crew</option>
                </select>
              </label>
              <label>
                Experience <span className="crew-optional">Optional</span>
                <input
                  value={form.experience}
                  onChange={(event) => update("experience", event.target.value)}
                  placeholder="e.g. 8 years"
                />
              </label>
            </div>
            <div className="crew-field-label">
              Functions{" "}
              <span className="crew-optional">Select one or more</span>
            </div>
            <div className="crew-function-options">
              {availableFunctions.map((item) => (
                <label className="crew-function-option" key={functionKey(item)}>
                  <input
                    type="checkbox"
                    checked={form.functions.some(
                      (value) => functionKey(value) === functionKey(item),
                    )}
                    onChange={() => toggleFunction(item)}
                  />
                  <span>{item.role}</span>
                  <small>{item.department}</small>
                </label>
              ))}
            </div>
            <div className="crew-custom-function">
              <select
                value={customDepartment}
                onChange={(event) => setCustomDepartment(event.target.value)}
                aria-label="Custom function department"
              >
                <option>RESOURCES</option>
                <option>ENG</option>
                <option>PROD</option>
              </select>
              <input
                value={customFunction}
                onChange={(event) => setCustomFunction(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addCustomFunction();
                  }
                }}
                placeholder="Create custom function"
                aria-label="Custom function name"
              />
              <button
                type="button"
                className="button button-secondary"
                onClick={addCustomFunction}
              >
                <Plus size={13} /> Add function
              </button>
            </div>
            <label>
              Expertise / skills{" "}
              <span className="crew-optional">Comma-separated tags</span>
              <input
                value={form.expertise}
                onChange={(event) => update("expertise", event.target.value)}
                placeholder="Documentary, live broadcast, editing"
              />
            </label>
          </section>

          <section className="crew-form-section">
            <div className="crew-form-section-heading">
              <Phone size={15} />
              <div>
                <strong>Contact information</strong>
                <small>How operations can reach this crew member.</small>
              </div>
            </div>
            <div className="crew-form-grid">
              <label>
                Mobile
                <input
                  value={form.mobile}
                  onChange={(event) => update("mobile", event.target.value)}
                />
              </label>
              <label>
                Telephone
                <input
                  value={form.telephone}
                  onChange={(event) => update("telephone", event.target.value)}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                />
              </label>
              <label>
                City
                <input
                  value={form.city}
                  onChange={(event) => update("city", event.target.value)}
                />
              </label>
              <label>
                Country
                <input
                  value={form.country}
                  onChange={(event) => update("country", event.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="crew-form-section">
            <div className="crew-form-section-heading">
              <MapPin size={15} />
              <div>
                <strong>Management information</strong>
                <small>Availability and ownership for planning.</small>
              </div>
            </div>
            <div className="crew-form-grid">
              <label>
                Managed by
                <input
                  value={form.managedBy}
                  onChange={(event) => update("managedBy", event.target.value)}
                />
              </label>
              <label>
                Company
                <input
                  value={form.company}
                  onChange={(event) => update("company", event.target.value)}
                  placeholder="No company"
                />
              </label>
              <label>
                Supplier <span className="crew-optional">Optional</span>
                <input
                  value={form.supplier}
                  onChange={(event) => update("supplier", event.target.value)}
                  placeholder="No supplier"
                />
              </label>
              <label>
                Availability status
                <select
                  value={form.availabilityStatus}
                  onChange={(event) =>
                    update(
                      "availabilityStatus",
                      event.target.value as Availability,
                    )
                  }
                >
                  <option>Available</option>
                  <option>Unavailable</option>
                </select>
              </label>
              <label>
                Record status
                <select
                  value={form.recordStatus}
                  onChange={(event) =>
                    update("recordStatus", event.target.value as RecordStatus)
                  }
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </label>
            </div>
          </section>
          {error && <p className="field-error">{error}</p>}
          <div className="dialog-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="button button-primary">
              {staff ? "Save changes" : "Add staff member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function StaffManagementPage() {
  const [items, setItems] = useState<StaffMember[]>(() =>
    staffSeed.map(normalizeStaff),
  );
  const [availableFunctions, setAvailableFunctions] =
    useState<StaffFunction[]>(functionOptions);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<StaffType | "All">("All");
  const [availabilityFilter, setAvailabilityFilter] = useState<
    Availability | "All"
  >("All");
  const [functionFilter, setFunctionFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(staffSeed[0]?.id ?? "");
  const [dialog, setDialog] = useState<"new" | StaffMember | null>(null);
  const [notice, setNotice] = useState("");
  const [staffView, setStaffView] = useState<"Crew" | "Employees">("Crew");
  const [employeeAssignments, setEmployeeAssignments] = useState<
    Record<string, StaffFunction[]>
  >({});

  const selected = items.find((item) => item.id === selectedId) ?? null;
  const functionRoles = availableFunctions.map((item) => item.role);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      const currentFunctions = functionsFor(item);
      const matchesQuery =
        !needle ||
        `${item.firstName} ${item.lastName} ${item.jobTitle} ${item.email} ${currentFunctions.map((value) => value.role).join(" ")}`
          .toLowerCase()
          .includes(needle);
      const matchesType = typeFilter === "All" || item.staffType === typeFilter;
      const matchesAvailability =
        availabilityFilter === "All" ||
        item.availabilityStatus === availabilityFilter;
      const matchesFunction =
        functionFilter === "All" ||
        currentFunctions.some((value) => value.role === functionFilter);
      return (
        matchesQuery && matchesType && matchesAvailability && matchesFunction
      );
    });
  }, [availabilityFilter, functionFilter, items, query, typeFilter]);

  function saveStaff(staff: StaffMember) {
    setItems((current) =>
      current.some((item) => item.id === staff.id)
        ? current.map((item) =>
            item.id === staff.id ? normalizeStaff(staff) : item,
          )
        : [normalizeStaff(staff), ...current],
    );
    setSelectedId(staff.id);
    setDialog(null);
    setNotice("Staff profile saved.");
  }

  function removeStaff(staff: StaffMember) {
    if (
      !window.confirm(`Delete ${staff.firstName} ${staff.lastName}'s profile?`)
    )
      return;
    const remaining = items.filter((item) => item.id !== staff.id);
    setItems(remaining);
    setSelectedId(remaining[0]?.id ?? "");
    setNotice("Staff profile deleted.");
  }

  return (
    <section className="page-section staff-page crew-page">
      <PageHeader
        eyebrow="RESOURCES / STAFF"
        title={staffView === "Crew" ? "Freelancer & external crew" : "Employees"}
        copy={
          staffView === "Crew"
            ? "Manage production talent, availability and function assignments for CMCS projects."
            : "View company employees and assign them to relevant production functions."
        }
        action={staffView === "Crew" ? "Add staff" : undefined}
        onAction={staffView === "Crew" ? () => setDialog("new") : undefined}
      />
      <div className="staff-view-tabs" role="tablist" aria-label="Staff views">
        {(["Crew", "Employees"] as const).map((view) => (
          <button
            key={view}
            role="tab"
            aria-selected={staffView === view}
            className={staffView === view ? "selected" : ""}
            onClick={() => setStaffView(view)}
          >
            {view}
            {view === "Employees" && <small>{companyEmployees.length}</small>}
          </button>
        ))}
      </div>
      {staffView === "Employees" && (
        <EmployeeAssignments
          availableFunctions={availableFunctions}
          assignments={employeeAssignments}
          onToggleFunction={(employeeId, staffFunction) =>
            setEmployeeAssignments((current) => {
              const assigned = current[employeeId] ?? [];
              const exists = assigned.some(
                (item) => functionKey(item) === functionKey(staffFunction),
              );
              return {
                ...current,
                [employeeId]: exists
                  ? assigned.filter(
                      (item) => functionKey(item) !== functionKey(staffFunction),
                    )
                  : [...assigned, staffFunction],
              };
            })
          }
        />
      )}
      {staffView === "Crew" && (
        <>
      <div className="staff-summary-row">
        <div className="panel staff-summary-card">
          <UserRound size={18} />
          <strong>{items.length}</strong>
          <small>Total crew profiles</small>
        </div>
        <div className="panel staff-summary-card">
          <UserRound size={18} />
          <strong>
            {items.filter((item) => item.staffType === "Freelancer").length}
          </strong>
          <small>Freelancers</small>
        </div>
        <div className="panel staff-summary-card">
          <Check size={18} />
          <strong>
            {
              items.filter((item) => item.availabilityStatus === "Available")
                .length
            }
          </strong>
          <small>Available now</small>
        </div>
        <div className="panel staff-summary-card">
          <Mail size={18} />
          <strong>
            {items.filter((item) => item.recordStatus === "Active").length}
          </strong>
          <small>Active records</small>
        </div>
      </div>

      <div className="crew-toolbar panel">
        <label className="inline-search">
          <Search size={14} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, title or skill..."
          />
        </label>
        <select
          value={functionFilter}
          onChange={(event) => setFunctionFilter(event.target.value)}
          aria-label="Filter by function"
        >
          <option value="All">All functions</option>
          {functionRoles.map((role) => (
            <option key={role}>{role}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(event) =>
            setTypeFilter(event.target.value as StaffType | "All")
          }
          aria-label="Filter by staff type"
        >
          <option value="All">All staff types</option>
          <option>Freelancer</option>
          <option>External Crew</option>
        </select>
        <select
          value={availabilityFilter}
          onChange={(event) =>
            setAvailabilityFilter(event.target.value as Availability | "All")
          }
          aria-label="Filter by availability"
        >
          <option value="All">All availability</option>
          <option>Available</option>
          <option>Unavailable</option>
        </select>
      </div>

      <div className="crew-layout">
        <div className="panel crew-directory">
          <div className="crew-directory-heading">
            <div>
              <h2>Staff directory</h2>
              <p>
                {filtered.length} of {items.length} profiles
              </p>
            </div>
            <span>
              {functionFilter === "All" ? "All functions" : functionFilter}
            </span>
          </div>
          <div className="crew-directory-list">
            {filtered.map((staff) => (
              <button
                key={staff.id}
                className={selected?.id === staff.id ? "selected" : ""}
                onClick={() => setSelectedId(staff.id)}
              >
                <Avatar staff={staff} />
                <span>
                  <strong>
                    {staff.prefix} {staff.firstName} {staff.lastName}
                  </strong>
                  <small>{staff.jobTitle}</small>
                  <em>
                    {staff.staffType} ·{" "}
                    {functionsFor(staff)
                      .map((item) => item.role)
                      .join(", ")}
                  </em>
                </span>
                <b
                  className={
                    staff.availabilityStatus === "Available"
                      ? "crew-available"
                      : "crew-unavailable"
                  }
                >
                  {staff.availabilityStatus}
                </b>
              </button>
            ))}
            {!filtered.length && (
              <div className="empty-state">
                <Search size={24} />
                <p>No matching crew profiles.</p>
              </div>
            )}
          </div>
        </div>

        {selected ? (
          <div className="panel crew-profile">
            <div className="crew-profile-header">
              <div className="staff-profile-identity">
                <Avatar staff={selected} large />
                <div>
                  <span className="eyebrow">
                    {selected.id} · {selected.staffType}
                  </span>
                  <h2>
                    {selected.prefix} {selected.firstName} {selected.lastName}
                  </h2>
                  <p>{selected.jobTitle}</p>
                  <div className="staff-tags">
                    {functionsFor(selected).map((item) => (
                      <span key={functionKey(item)}>{item.role}</span>
                    ))}
                    {selected.expertise.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="staff-profile-actions">
                <button
                  className="button button-secondary"
                  onClick={() => setDialog(selected)}
                >
                  <Edit3 size={14} /> Edit
                </button>
                <button
                  className="icon-button danger-text"
                  onClick={() => removeStaff(selected)}
                  aria-label="Delete staff"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="crew-profile-body">
              <section className="crew-detail-section">
                <div className="crew-detail-heading">
                  <strong>Professional information</strong>
                  <span
                    className={`crew-status ${selected.recordStatus === "Active" ? "active" : "inactive"}`}
                  >
                    {selected.recordStatus}
                  </span>
                </div>
                <div className="crew-detail-grid">
                  <div>
                    <small>Functions</small>
                    <strong>
                      {functionsFor(selected)
                        .map((item) => item.role)
                        .join(", ")}
                    </strong>
                  </div>
                  <div>
                    <small>Experience</small>
                    <strong>{selected.experience || "Not specified"}</strong>
                  </div>
                  <div>
                    <small>Availability</small>
                    <strong>{selected.availabilityStatus}</strong>
                  </div>
                  <div>
                    <small>Supplier</small>
                    <strong>{selected.supplier || "No supplier"}</strong>
                  </div>
                </div>
              </section>
              <section className="crew-detail-section">
                <div className="crew-detail-heading">
                  <strong>Contact information</strong>
                </div>
                <div className="crew-detail-grid">
                  <div>
                    <small>
                      <Phone size={11} /> Mobile
                    </small>
                    <strong>{selected.mobile || "Not provided"}</strong>
                  </div>
                  <div>
                    <small>
                      <Phone size={11} /> Telephone
                    </small>
                    <strong>{selected.telephone || "Not provided"}</strong>
                  </div>
                  <div>
                    <small>
                      <Mail size={11} /> Email
                    </small>
                    <strong>{selected.email || "Not provided"}</strong>
                  </div>
                  <div>
                    <small>
                      <MapPin size={11} /> Location
                    </small>
                    <strong>
                      {[selected.address.city, selected.address.country]
                        .filter(Boolean)
                        .join(", ") || "Not provided"}
                    </strong>
                  </div>
                </div>
              </section>
              <section className="crew-detail-section">
                <div className="crew-detail-heading">
                  <strong>Management information</strong>
                </div>
                <div className="crew-detail-grid">
                  <div>
                    <small>Managed by</small>
                    <strong>{selected.managedBy}</strong>
                  </div>
                  <div>
                    <small>Company</small>
                    <strong>
                      {selected.companies[0]?.company || "No company"}
                    </strong>
                  </div>
                  <div>
                    <small>Record ID</small>
                    <strong>{selected.id}</strong>
                  </div>
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="panel staff-no-selection">
            Select a staff member to view their profile.
          </div>
        )}
      </div>

      {notice && (
        <button className="staff-notice" onClick={() => setNotice("")}>
          {notice}
          <X size={13} />
        </button>
      )}
      {dialog && (
        <StaffDialog
          staff={dialog === "new" ? undefined : dialog}
          availableFunctions={availableFunctions}
          onCreateFunction={(staffFunction) =>
            setAvailableFunctions((current) => [...current, staffFunction])
          }
          onClose={() => setDialog(null)}
          onSave={saveStaff}
        />
      )}
        </>
      )}
    </section>
  );
}
