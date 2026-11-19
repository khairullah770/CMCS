export const equipmentFunctions: string[] = [
  "Camera",
  "Lighting",
  "Audio",
  "Accessories",
  "DSNG",
  "OB Van",
  "Transport",
] as const;

export const equipmentCompanies: string[] = [
  "Chinar TV",
  "CMCS",
  "External Production Unit",
] as const;

export const equipmentSuppliers: string[] = [
  "ABC Camera Rental",
  "Kabul Equipment Supplier",
  "Professional Audio Rental",
  "No Supplier",
] as const;

export type EquipmentFunction = string;
export type EquipmentCompany = string;
export type EquipmentSupplier = string;
export type EquipmentStatus = "Active" | "Inactive";

export type Equipment = {
  id: string;
  name: string;
  image?: string;
  initialValue: number;
  currency: string;
  company: EquipmentCompany;
  functions: EquipmentFunction[];
  supplier: EquipmentSupplier;
  ata: boolean;
  ataInformation: string;
  status: EquipmentStatus;
};

export const equipmentSeed: Equipment[] = [
  { id: "EQP-0001", name: "Sony FX6 Camera", initialValue: 6200, currency: "USD", company: "CMCS", functions: ["Camera"], supplier: "ABC Camera Rental", ata: false, ataInformation: "", status: "Active" },
  { id: "EQP-0002", name: "Canon C70 Camera", initialValue: 4100, currency: "USD", company: "Chinar TV", functions: ["Camera", "Accessories"], supplier: "ABC Camera Rental", ata: false, ataInformation: "", status: "Active" },
  { id: "EQP-0003", name: "Panasonic Camera", initialValue: 3600, currency: "USD", company: "External Production Unit", functions: ["Camera"], supplier: "Kabul Equipment Supplier", ata: true, ataInformation: "AT-203 / Field kit", status: "Inactive" },
  { id: "EQP-0004", name: "Heavy Duty Tripod", initialValue: 850, currency: "USD", company: "CMCS", functions: ["Camera", "Accessories"], supplier: "ABC Camera Rental", ata: false, ataInformation: "", status: "Active" },
  { id: "EQP-0005", name: "LED Light Panel", initialValue: 620, currency: "USD", company: "Chinar TV", functions: ["Lighting"], supplier: "Kabul Equipment Supplier", ata: false, ataInformation: "", status: "Active" },
  { id: "EQP-0006", name: "Studio Light Kit", initialValue: 2400, currency: "USD", company: "CMCS", functions: ["Lighting", "Accessories"], supplier: "Kabul Equipment Supplier", ata: true, ataInformation: "AT-118 / Studio A", status: "Active" },
  { id: "EQP-0007", name: "Wireless Microphone Set", initialValue: 1450, currency: "USD", company: "Chinar TV", functions: ["Audio"], supplier: "Professional Audio Rental", ata: false, ataInformation: "", status: "Active" },
  { id: "EQP-0008", name: "Audio Mixer", initialValue: 2850, currency: "USD", company: "CMCS", functions: ["Audio"], supplier: "Professional Audio Rental", ata: false, ataInformation: "", status: "Active" },
  { id: "EQP-0009", name: "DSNG Equipment", initialValue: 18500, currency: "USD", company: "External Production Unit", functions: ["DSNG", "Transport"], supplier: "Kabul Equipment Supplier", ata: true, ataInformation: "AT-901 / Satellite uplink", status: "Active" },
  { id: "EQP-0010", name: "OB Van Equipment", initialValue: 32000, currency: "USD", company: "CMCS", functions: ["OB Van", "Transport", "Audio"], supplier: "Kabul Equipment Supplier", ata: true, ataInformation: "AT-760 / OB Van 01", status: "Active" },
  { id: "EQP-0011", name: "Camera Monitor", initialValue: 980, currency: "USD", company: "Chinar TV", functions: ["Camera", "Accessories"], supplier: "No Supplier", ata: false, ataInformation: "", status: "Active" },
  { id: "EQP-0012", name: "Video Switcher", initialValue: 8900, currency: "USD", company: "CMCS", functions: ["OB Van", "Accessories"], supplier: "Kabul Equipment Supplier", ata: false, ataInformation: "", status: "Inactive" },
  { id: "EQP-0013", name: "Recording Device", initialValue: 3200, currency: "USD", company: "External Production Unit", functions: ["Camera", "Accessories"], supplier: "ABC Camera Rental", ata: false, ataInformation: "", status: "Active" },
  { id: "EQP-0014", name: "Camera Accessories Kit", initialValue: 1750, currency: "USD", company: "CMCS", functions: ["Accessories", "Camera"], supplier: "ABC Camera Rental", ata: false, ataInformation: "", status: "Active" },
];
