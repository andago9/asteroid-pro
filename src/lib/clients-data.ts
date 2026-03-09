import { format } from "date-fns";
import { es } from "date-fns/locale";

// ── Types ──────────────────────────────────────────────
export type ClientStatus = "Prospecto" | "Cliente activo" | "Cliente inactivo";
export type ClientSource = "Referido" | "Web" | "WhatsApp" | "Redes sociales" | "Evento";
export type ContactChannel = "WhatsApp" | "Email" | "Llamada" | "Reunión";
export type InteractionType = "Llamada" | "Email" | "Reunión" | "WhatsApp";
export type DocType = "NIT" | "CC" | "CE" | "Pasaporte" | "RFC" | "RUC" | "Otro";

export interface Interaction {
  id: string;
  date: string;
  type: InteractionType;
  note: string;
  nextFollowUp?: string;
}

export interface Client {
  id: string;
  // basic
  name: string;
  docType: DocType;
  docNumber: string;
  sector: string;
  address: string;
  city: string;
  state: string;
  country: string;
  website: string;
  // contact
  contactPerson: string;
  contactRole: string;
  phone: string;
  email: string;
  preferredChannel: ContactChannel;
  // commercial
  status: ClientStatus;
  source: ClientSource;
  responsible: string;
  potentialValue: number;
  // extra
  notes: string;
  tags: string[];
  interactions: Interaction[];
  createdAt: string;
}

// ── Constants ──────────────────────────────────────────
export const SECTORS = [
  "Tecnología", "Salud", "Comercio", "Educación", "Finanzas",
  "Energía", "Manufactura", "Servicios", "Gobierno", "Otro",
];

export const CLIENT_STATUSES: ClientStatus[] = ["Prospecto", "Cliente activo", "Cliente inactivo"];
export const CLIENT_SOURCES: ClientSource[] = ["Referido", "Web", "WhatsApp", "Redes sociales", "Evento"];
export const CONTACT_CHANNELS: ContactChannel[] = ["WhatsApp", "Email", "Llamada", "Reunión"];
export const INTERACTION_TYPES: InteractionType[] = ["Llamada", "Email", "Reunión", "WhatsApp"];
export const DOC_TYPES: DocType[] = ["NIT", "CC", "CE", "Pasaporte", "RFC", "RUC", "Otro"];

export const STATUS_STYLES: Record<ClientStatus, string> = {
  "Prospecto": "bg-info/10 text-info",
  "Cliente activo": "bg-success/10 text-success",
  "Cliente inactivo": "bg-muted text-muted-foreground",
};

// ── Empty client factory ───────────────────────────────
export function emptyClient(): Omit<Client, "id" | "createdAt" | "interactions"> {
  return {
    name: "", docType: "NIT", docNumber: "", sector: "", address: "",
    city: "", state: "", country: "", website: "",
    contactPerson: "", contactRole: "", phone: "", email: "",
    preferredChannel: "Email",
    status: "Prospecto", source: "Web", responsible: "", potentialValue: 0,
    notes: "", tags: [],
  };
}

// ── Mock data ──────────────────────────────────────────
export const MOCK_CLIENTS: Client[] = [
  {
    id: "1", name: "TechCorp Solutions", docType: "NIT", docNumber: "900123456-7",
    sector: "Tecnología", address: "Av. Reforma 222", city: "CDMX", state: "CDMX", country: "México",
    website: "https://techcorp.mx",
    contactPerson: "Laura Méndez", contactRole: "Directora Comercial",
    phone: "+52 555 1234", email: "laura@techcorp.mx", preferredChannel: "Email",
    status: "Cliente activo", source: "Referido", responsible: "Carlos M.",
    potentialValue: 120000,
    notes: "Cliente corporativo con alto potencial de crecimiento.",
    tags: ["premium", "tecnología"],
    createdAt: "2024-06-15",
    interactions: [
      { id: "i1", date: "2025-01-10", type: "Reunión", note: "Kick-off del proyecto de e-commerce", nextFollowUp: "2025-02-01" },
      { id: "i2", date: "2025-02-05", type: "Llamada", note: "Seguimiento de avances fase 1" },
    ],
  },
  {
    id: "2", name: "Innovatech Labs", docType: "RFC", docNumber: "INN210301XY9",
    sector: "Tecnología", address: "Calle Innovación 45", city: "Monterrey", state: "Nuevo León", country: "México",
    website: "https://innovatech.com",
    contactPerson: "Pedro Ruiz", contactRole: "CEO",
    phone: "+52 555 5678", email: "pedro@innovatech.com", preferredChannel: "WhatsApp",
    status: "Prospecto", source: "Web", responsible: "Ana R.",
    potentialValue: 45000,
    notes: "Interesados en desarrollo de aplicación móvil.",
    tags: ["startup", "móvil"],
    createdAt: "2025-01-20",
    interactions: [
      { id: "i3", date: "2025-01-22", type: "Email", note: "Envío de propuesta comercial", nextFollowUp: "2025-02-10" },
    ],
  },
  {
    id: "3", name: "Digital Minds", docType: "NIT", docNumber: "800456789-1",
    sector: "Servicios", address: "Blvd. Zapopan 102", city: "Guadalajara", state: "Jalisco", country: "México",
    website: "https://dminds.io",
    contactPerson: "Sofía Castro", contactRole: "Gerente de Proyectos",
    phone: "+52 555 9012", email: "sofia@dminds.io", preferredChannel: "Reunión",
    status: "Cliente activo", source: "Evento", responsible: "Carlos M.",
    potentialValue: 80000,
    notes: "Agencia aliada para proyectos de diseño.",
    tags: ["agencia", "diseño"],
    createdAt: "2024-03-10",
    interactions: [
      { id: "i4", date: "2025-01-15", type: "Reunión", note: "Revisión de contrato de alianza", nextFollowUp: "2025-03-15" },
      { id: "i5", date: "2024-12-01", type: "Llamada", note: "Acuerdo de tarifas para 2025" },
    ],
  },
  {
    id: "4", name: "GreenEnergy MX", docType: "RFC", docNumber: "GEM190514AB3",
    sector: "Energía", address: "Parque Industrial Norte Km 5", city: "Querétaro", state: "Querétaro", country: "México",
    website: "https://greenenergy.mx",
    contactPerson: "Roberto Salinas", contactRole: "Director General",
    phone: "+52 555 3456", email: "roberto@greenenergy.mx", preferredChannel: "Llamada",
    status: "Cliente activo", source: "Referido", responsible: "María P.",
    potentialValue: 200000,
    notes: "Proyecto de monitoreo de plantas solares en desarrollo.",
    tags: ["energía", "IoT", "premium"],
    createdAt: "2023-11-01",
    interactions: [
      { id: "i6", date: "2025-02-20", type: "Reunión", note: "Demo de dashboard de monitoreo" },
      { id: "i7", date: "2025-01-05", type: "Email", note: "Envío de cotización para fase 2", nextFollowUp: "2025-02-28" },
    ],
  },
  {
    id: "5", name: "EduPlat", docType: "NIT", docNumber: "901234567-0",
    sector: "Educación", address: "Calle Universidad 88", city: "CDMX", state: "CDMX", country: "México",
    website: "https://eduplat.com",
    contactPerson: "Carmen Vega", contactRole: "Fundadora",
    phone: "+52 555 7890", email: "carmen@eduplat.com", preferredChannel: "WhatsApp",
    status: "Cliente inactivo", source: "Redes sociales", responsible: "Ana R.",
    potentialValue: 25000,
    notes: "Pausa temporal por reestructuración interna.",
    tags: ["edtech"],
    createdAt: "2024-08-22",
    interactions: [
      { id: "i8", date: "2024-11-10", type: "WhatsApp", note: "Confirmación de pausa del proyecto" },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────
export function formatCurrency(val: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(val);
}

export function formatDate(d: string) {
  try {
    return format(new Date(d), "dd MMM yyyy", { locale: es });
  } catch {
    return d;
  }
}
