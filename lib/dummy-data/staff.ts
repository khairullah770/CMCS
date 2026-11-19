export type StaffFunction = {
  department: string;
  role: string;
};

export type StaffContract = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  employmentType: string;
  salary: string;
};

export type StaffBooking = {
  id: string;
  project: string;
  role: string;
  startDate: string;
  endDate: string;
  status: "Confirmed" | "Tentative";
};

export type StaffUnavailable = {
  id: string;
  startDate: string;
  endDate: string;
  status: "Unavailable" | "On leave";
  reason: string;
  type: string;
  detail: string;
};

export type StaffCompany = {
  id: string;
  company: string;
};

export type StaffMember = {
  id: string;
  managedBy: string;
  firstName: string;
  lastName: string;
  prefix: string;
  jobTitle: string;
  freelance: boolean;
  function: StaffFunction;
  functions?: StaffFunction[];
  expertise: string[];
  staffType?: "Freelancer" | "External Crew";
  experience?: string;
  mobile?: string;
  telephone?: string;
  email?: string;
  supplier?: string;
  availabilityStatus?: "Available" | "Unavailable";
  recordStatus?: "Active" | "Inactive";
  group: string;
  profileImage?: string;
  loginAssigned: boolean;
  uiLanguage: string;
  address: { street: string; city: string; country: string; zipCode: string };
  identity: { nationalId: string; passport: string; dateOfBirth: string };
  contract: { employmentType: string; startDate: string; endDate: string; salary: string };
  companies: StaffCompany[];
  contracts: StaffContract[];
  bookings: StaffBooking[];
  unavailable: StaffUnavailable[];
};

export const staffFunctions: StaffFunction[] = [
  { department: "ENG", role: "Cameraman" },
  { department: "ENG", role: "Editor" },
  { department: "ENG", role: "Sound Engineer" },
  { department: "PROD", role: "Producer" },
  { department: "PROD", role: "Production Coordinator" },
  ...equipmentFunctions.map((role) => ({ department: "RESOURCES", role })),
];

export const staffGroups = ["Operations", "Production", "Creative", "Administration"];

export const staffSeed: StaffMember[] = [
  {
    id: "STF-0001", managedBy: "Head of Operations", firstName: "Farid", lastName: "Ahmadi", prefix: "Mr.",
    jobTitle: "Senior Cameraman", freelance: false, function: staffFunctions[0], expertise: ["Documentary", "Live broadcast"],
    group: "Operations", loginAssigned: true, uiLanguage: "English",
    address: { street: "Darulaman Road", city: "Kabul", country: "Afghanistan", zipCode: "1001" },
    identity: { nationalId: "AF-20481", passport: "P-481920", dateOfBirth: "1988-04-12" },
    contract: { employmentType: "Full time", startDate: "2021-03-01", endDate: "", salary: "1800 USD" },
    companies: [{ id: "SC-1", company: "CMCS" }],
    contracts: [{ id: "CT-1", title: "Employment agreement 2024", startDate: "2024-01-01", endDate: "2025-12-31", employmentType: "Full time", salary: "1800 USD" }],
    bookings: [{ id: "BK-1", project: "Kabul News Hour", role: "Camera lead", startDate: "2025-02-10", endDate: "2025-02-14", status: "Confirmed" }],
    unavailable: [],
  },
  {
    id: "STF-0002", managedBy: "CEO", firstName: "Laila", lastName: "Nouri", prefix: "Ms.",
    jobTitle: "Senior Producer", freelance: true, function: staffFunctions[3], expertise: ["Current affairs", "Script writing"],
    group: "Production", loginAssigned: true, uiLanguage: "Dari",
    address: { street: "Wazir Akbar Khan", city: "Kabul", country: "Afghanistan", zipCode: "1002" },
    identity: { nationalId: "AF-20992", passport: "P-552190", dateOfBirth: "1991-09-18" },
    contract: { employmentType: "Freelance", startDate: "2023-08-15", endDate: "2025-08-14", salary: "2200 USD" },
    companies: [{ id: "SC-2", company: "Chinar TV" }, { id: "SC-3", company: "CMCS" }],
    contracts: [{ id: "CT-2", title: "Freelance production contract", startDate: "2023-08-15", endDate: "2025-08-14", employmentType: "Freelance", salary: "2200 USD" }],
    bookings: [{ id: "BK-2", project: "Morning Brief", role: "Producer", startDate: "2025-03-03", endDate: "2025-03-07", status: "Tentative" }],
    unavailable: [{ id: "NA-1", startDate: "2025-04-01", endDate: "2025-04-05", status: "On leave", reason: "Personal leave", type: "Leave", detail: "Approved annual leave" }],
  },
];
import { equipmentFunctions } from "./equipment";
