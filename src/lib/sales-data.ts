import { format } from "date-fns";
import { es } from "date-fns/locale";

// ── Types ──────────────────────────────────────────────
export type QuoteStatus = "Borrador" | "Enviada" | "Aprobada" | "Rechazada" | "Convertida";

export interface QuoteItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number; // percentage
  subtotal: number;
}

export interface QuoteActivity {
  id: string;
  date: string;
  user: string;
  action: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  client: string;
  quoteDate: string;
  expiryDate: string;
  status: QuoteStatus;
  seller: string;
  items: QuoteItem[];
  taxRate: number; // percentage
  generalDiscount: number; // percentage
  notes: string;
  activity: QuoteActivity[];
  createdAt: string;
  updatedAt: string;
}

// ── Constants ──────────────────────────────────────────
export const QUOTE_STATUSES: QuoteStatus[] = ["Borrador", "Enviada", "Aprobada", "Rechazada", "Convertida"];
export const SELLERS = ["Carlos M.", "Ana R.", "María P.", "Jorge L."];

export const STATUS_STYLES: Record<QuoteStatus, string> = {
  Borrador: "bg-muted text-muted-foreground",
  Enviada: "bg-info/10 text-info",
  Aprobada: "bg-success/10 text-success",
  Rechazada: "bg-destructive/10 text-destructive",
  Convertida: "bg-primary/10 text-primary",
};

export const AVAILABLE_PRODUCTS = [
  { name: "Diseño de Página Web", price: 15000 },
  { name: "Identidad Visual", price: 8000 },
  { name: "Desarrollo de Software", price: 50000 },
  { name: "Consultoría TI", price: 3000 },
  { name: "Hosting Administrado", price: 2500 },
  { name: "SEO & Marketing Digital", price: 12000 },
];

// ── Calculations ───────────────────────────────────────
export function calcItemSubtotal(qty: number, price: number, discount: number): number {
  return qty * price * (1 - discount / 100);
}

export function calcQuoteTotals(items: QuoteItem[], taxRate: number, generalDiscount: number) {
  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  const discountAmount = subtotal * (generalDiscount / 100);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * (taxRate / 100);
  const total = afterDiscount + taxAmount;
  return { subtotal, discountAmount, taxAmount, total };
}

// ── Empty factories ────────────────────────────────────
export function emptyQuoteItem(): QuoteItem {
  return { id: `qi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, productName: "", quantity: 1, unitPrice: 0, discount: 0, subtotal: 0 };
}

export function emptyQuote(): Omit<Quote, "id" | "quoteNumber" | "activity" | "createdAt" | "updatedAt"> {
  const today = new Date().toISOString().split("T")[0];
  const expiry = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
  return {
    client: "", quoteDate: today, expiryDate: expiry,
    status: "Borrador", seller: SELLERS[0],
    items: [emptyQuoteItem()],
    taxRate: 16, generalDiscount: 0, notes: "",
  };
}

// ── Counter ────────────────────────────────────────────
let quoteCounter = 6;
export function nextQuoteNumber() {
  return `COT-${String(quoteCounter++).padStart(3, "0")}`;
}

// ── Mock data ──────────────────────────────────────────
export const MOCK_QUOTES: Quote[] = [
  {
    id: "q1", quoteNumber: "COT-001",
    client: "TechCorp Solutions", quoteDate: "2025-03-01", expiryDate: "2025-03-31",
    status: "Aprobada", seller: "Carlos M.",
    items: [
      { id: "qi1", productName: "Desarrollo de Software", quantity: 1, unitPrice: 50000, discount: 0, subtotal: 50000 },
      { id: "qi2", productName: "Hosting Administrado", quantity: 12, unitPrice: 2500, discount: 10, subtotal: 27000 },
    ],
    taxRate: 16, generalDiscount: 5, notes: "Proyecto de e-commerce con hosting anual incluido.",
    activity: [
      { id: "qa1", date: "2025-03-01T10:00:00", user: "Carlos M.", action: "Cotización creada" },
      { id: "qa2", date: "2025-03-02T14:00:00", user: "Carlos M.", action: "Estado cambiado a Enviada" },
      { id: "qa3", date: "2025-03-05T09:00:00", user: "Carlos M.", action: "Estado cambiado a Aprobada" },
    ],
    createdAt: "2025-03-01T10:00:00", updatedAt: "2025-03-05T09:00:00",
  },
  {
    id: "q2", quoteNumber: "COT-002",
    client: "GreenEnergy MX", quoteDate: "2025-03-03", expiryDate: "2025-04-02",
    status: "Enviada", seller: "Ana R.",
    items: [
      { id: "qi3", productName: "Consultoría TI", quantity: 20, unitPrice: 3000, discount: 0, subtotal: 60000 },
      { id: "qi4", productName: "Diseño de Página Web", quantity: 1, unitPrice: 15000, discount: 5, subtotal: 14250 },
    ],
    taxRate: 16, generalDiscount: 0, notes: "Consultoría para migración a la nube + rediseño web.",
    activity: [
      { id: "qa4", date: "2025-03-03T11:00:00", user: "Ana R.", action: "Cotización creada" },
      { id: "qa5", date: "2025-03-04T10:00:00", user: "Ana R.", action: "Estado cambiado a Enviada" },
    ],
    createdAt: "2025-03-03T11:00:00", updatedAt: "2025-03-04T10:00:00",
  },
  {
    id: "q3", quoteNumber: "COT-003",
    client: "Digital Minds", quoteDate: "2025-03-04", expiryDate: "2025-04-03",
    status: "Borrador", seller: "María P.",
    items: [
      { id: "qi5", productName: "SEO & Marketing Digital", quantity: 6, unitPrice: 12000, discount: 0, subtotal: 72000 },
    ],
    taxRate: 16, generalDiscount: 10, notes: "Paquete de marketing digital por 6 meses.",
    activity: [
      { id: "qa6", date: "2025-03-04T15:00:00", user: "María P.", action: "Cotización creada" },
    ],
    createdAt: "2025-03-04T15:00:00", updatedAt: "2025-03-04T15:00:00",
  },
  {
    id: "q4", quoteNumber: "COT-004",
    client: "EduPlat", quoteDate: "2025-02-20", expiryDate: "2025-03-20",
    status: "Rechazada", seller: "Jorge L.",
    items: [
      { id: "qi6", productName: "Desarrollo de Software", quantity: 1, unitPrice: 50000, discount: 0, subtotal: 50000 },
      { id: "qi7", productName: "Identidad Visual", quantity: 1, unitPrice: 8000, discount: 0, subtotal: 8000 },
    ],
    taxRate: 16, generalDiscount: 0, notes: "Propuesta de plataforma educativa rechazada por presupuesto.",
    activity: [
      { id: "qa7", date: "2025-02-20T09:00:00", user: "Jorge L.", action: "Cotización creada" },
      { id: "qa8", date: "2025-02-22T14:00:00", user: "Jorge L.", action: "Estado cambiado a Enviada" },
      { id: "qa9", date: "2025-03-01T11:00:00", user: "Jorge L.", action: "Estado cambiado a Rechazada" },
    ],
    createdAt: "2025-02-20T09:00:00", updatedAt: "2025-03-01T11:00:00",
  },
  {
    id: "q5", quoteNumber: "COT-005",
    client: "Innovatech Labs", quoteDate: "2025-03-06", expiryDate: "2025-04-05",
    status: "Convertida", seller: "Carlos M.",
    items: [
      { id: "qi8", productName: "Diseño de Página Web", quantity: 1, unitPrice: 15000, discount: 0, subtotal: 15000 },
      { id: "qi9", productName: "Hosting Administrado", quantity: 12, unitPrice: 2500, discount: 0, subtotal: 30000 },
    ],
    taxRate: 16, generalDiscount: 0, notes: "Convertida en venta e ingreso registrado en finanzas.",
    activity: [
      { id: "qa10", date: "2025-03-06T08:00:00", user: "Carlos M.", action: "Cotización creada" },
      { id: "qa11", date: "2025-03-06T10:00:00", user: "Carlos M.", action: "Estado cambiado a Enviada" },
      { id: "qa12", date: "2025-03-07T09:00:00", user: "Carlos M.", action: "Estado cambiado a Aprobada" },
      { id: "qa13", date: "2025-03-07T10:00:00", user: "Carlos M.", action: "Convertida en venta" },
    ],
    createdAt: "2025-03-06T08:00:00", updatedAt: "2025-03-07T10:00:00",
  },
];

// ── Helpers ────────────────────────────────────────────
export function formatSalesCurrency(val: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(val);
}

export function formatSalesDate(d: string) {
  try {
    return format(new Date(d), "dd MMM yyyy", { locale: es });
  } catch {
    return d;
  }
}

export function formatSalesDateTime(d: string) {
  try {
    return format(new Date(d), "dd MMM HH:mm", { locale: es });
  } catch {
    return d;
  }
}
