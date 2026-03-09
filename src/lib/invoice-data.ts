import { format } from "date-fns";
import { es } from "date-fns/locale";

// ── Types ──────────────────────────────────────────────
export type InvoiceStatus = "Pendiente" | "Pagada" | "Parcial" | "Vencida" | "Cancelada";
export type PaymentMethodType = "Efectivo" | "Transferencia" | "Tarjeta" | "Nequi" | "Daviplata" | "PayPal" | "Otro";

export interface InvoiceItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // per-item tax %
  subtotal: number;
}

export interface InvoicePayment {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethodType;
  reference: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  client: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  discount: number; // general %
  payments: InvoicePayment[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ── Constants ──────────────────────────────────────────
export const INVOICE_STATUSES: InvoiceStatus[] = ["Pendiente", "Pagada", "Parcial", "Vencida", "Cancelada"];
export const PAYMENT_METHODS: PaymentMethodType[] = ["Efectivo", "Transferencia", "Tarjeta", "Nequi", "Daviplata", "PayPal", "Otro"];

export const INV_STATUS_STYLES: Record<InvoiceStatus, string> = {
  Pendiente: "bg-warning/10 text-warning",
  Pagada: "bg-success/10 text-success",
  Parcial: "bg-info/10 text-info",
  Vencida: "bg-destructive/10 text-destructive",
  Cancelada: "bg-muted text-muted-foreground",
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
export function calcItemSubtotal(qty: number, price: number, taxRate: number): number {
  return qty * price * (1 + taxRate / 100);
}

export function calcInvoiceTotals(items: InvoiceItem[], discount: number) {
  const rawSubtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const taxTotal = items.reduce((s, i) => s + i.quantity * i.unitPrice * (i.taxRate / 100), 0);
  const discountAmount = rawSubtotal * (discount / 100);
  const total = rawSubtotal - discountAmount + taxTotal;
  return { subtotal: rawSubtotal, taxTotal, discountAmount, total };
}

export function calcTotalPaid(payments: InvoicePayment[]): number {
  return payments.reduce((s, p) => s + p.amount, 0);
}

export function calcBalance(invoice: Invoice): number {
  return calcInvoiceTotals(invoice.items, invoice.discount).total - calcTotalPaid(invoice.payments);
}

// ── Factories ──────────────────────────────────────────
export function emptyInvoiceItem(): InvoiceItem {
  return { id: `ii-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, productName: "", quantity: 1, unitPrice: 0, taxRate: 16, subtotal: 0 };
}

export function emptyInvoice(): Omit<Invoice, "id" | "invoiceNumber" | "payments" | "createdAt" | "updatedAt"> {
  const today = new Date().toISOString().split("T")[0];
  const due = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
  return {
    client: "", issueDate: today, dueDate: due,
    status: "Pendiente",
    items: [emptyInvoiceItem()],
    discount: 0, notes: "",
  };
}

let invoiceCounter = 6;
export function nextInvoiceNumber() {
  return `FAC-${String(invoiceCounter++).padStart(3, "0")}`;
}

// ── Mock data ──────────────────────────────────────────
export const MOCK_INVOICES: Invoice[] = [
  {
    id: "inv1", invoiceNumber: "FAC-001",
    client: "TechCorp Solutions", issueDate: "2025-03-01", dueDate: "2025-03-31",
    status: "Pagada",
    items: [
      { id: "ii1", productName: "Desarrollo de Software", quantity: 1, unitPrice: 50000, taxRate: 16, subtotal: 58000 },
      { id: "ii2", productName: "Hosting Administrado", quantity: 12, unitPrice: 2500, taxRate: 16, subtotal: 34800 },
    ],
    discount: 5,
    payments: [
      { id: "pay1", date: "2025-03-10", amount: 88160, method: "Transferencia", reference: "TRF-20250310-001" },
    ],
    notes: "Factura por proyecto e-commerce.",
    createdAt: "2025-03-01T10:00:00", updatedAt: "2025-03-10T14:00:00",
  },
  {
    id: "inv2", invoiceNumber: "FAC-002",
    client: "GreenEnergy MX", issueDate: "2025-03-05", dueDate: "2025-04-04",
    status: "Pendiente",
    items: [
      { id: "ii3", productName: "Consultoría TI", quantity: 20, unitPrice: 3000, taxRate: 16, subtotal: 69600 },
    ],
    discount: 0,
    payments: [],
    notes: "Consultoría migración cloud.",
    createdAt: "2025-03-05T11:00:00", updatedAt: "2025-03-05T11:00:00",
  },
  {
    id: "inv3", invoiceNumber: "FAC-003",
    client: "Digital Minds", issueDate: "2025-02-15", dueDate: "2025-03-15",
    status: "Parcial",
    items: [
      { id: "ii4", productName: "SEO & Marketing Digital", quantity: 3, unitPrice: 12000, taxRate: 16, subtotal: 41760 },
    ],
    discount: 0,
    payments: [
      { id: "pay2", date: "2025-02-28", amount: 20000, method: "Transferencia", reference: "TRF-20250228-005" },
    ],
    notes: "Paquete marketing 3 meses, pago parcial.",
    createdAt: "2025-02-15T09:00:00", updatedAt: "2025-02-28T10:00:00",
  },
  {
    id: "inv4", invoiceNumber: "FAC-004",
    client: "EduPlat", issueDate: "2025-01-10", dueDate: "2025-02-09",
    status: "Vencida",
    items: [
      { id: "ii5", productName: "Diseño de Página Web", quantity: 1, unitPrice: 15000, taxRate: 16, subtotal: 17400 },
    ],
    discount: 0,
    payments: [],
    notes: "Factura vencida — seguimiento pendiente.",
    createdAt: "2025-01-10T08:00:00", updatedAt: "2025-01-10T08:00:00",
  },
  {
    id: "inv5", invoiceNumber: "FAC-005",
    client: "Innovatech Labs", issueDate: "2025-03-06", dueDate: "2025-04-05",
    status: "Pagada",
    items: [
      { id: "ii6", productName: "Diseño de Página Web", quantity: 1, unitPrice: 15000, taxRate: 16, subtotal: 17400 },
      { id: "ii7", productName: "Hosting Administrado", quantity: 12, unitPrice: 2500, taxRate: 16, subtotal: 34800 },
    ],
    discount: 0,
    payments: [
      { id: "pay3", date: "2025-03-07", amount: 52200, method: "Tarjeta", reference: "TC-20250307-012" },
    ],
    notes: "Convertida desde cotización COT-005.",
    createdAt: "2025-03-06T10:00:00", updatedAt: "2025-03-07T10:00:00",
  },
];

// ── Helpers ────────────────────────────────────────────
export function formatInvCurrency(val: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(val);
}

export function formatInvDate(d: string) {
  try { return format(new Date(d), "dd MMM yyyy", { locale: es }); }
  catch { return d; }
}

export function formatInvDateTime(d: string) {
  try { return format(new Date(d), "dd MMM HH:mm", { locale: es }); }
  catch { return d; }
}
