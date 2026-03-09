import { format } from "date-fns";
import { es } from "date-fns/locale";

// ── Types ──────────────────────────────────────────────
export type MovementType = "Ingreso" | "Gasto";
export type MovementStatus = "Pendiente" | "Confirmado";

export interface FinanceCategory {
  id: string;
  name: string;
  type: MovementType;
}

export interface PaymentMethod {
  id: string;
  name: string;
}

export interface Movement {
  id: string;
  type: MovementType;
  date: string;
  amount: number;
  categoryId: string;
  paymentMethodId: string;
  client: string;
  provider: string;
  description: string;
  status: MovementStatus;
  createdAt: string;
}

// ── Constants ──────────────────────────────────────────
export const MOVEMENT_TYPES: MovementType[] = ["Ingreso", "Gasto"];
export const MOVEMENT_STATUSES: MovementStatus[] = ["Pendiente", "Confirmado"];

export const DEFAULT_CATEGORIES: FinanceCategory[] = [
  { id: "cat-1", name: "Servicios", type: "Ingreso" },
  { id: "cat-2", name: "Venta de productos", type: "Ingreso" },
  { id: "cat-3", name: "Suscripciones", type: "Ingreso" },
  { id: "cat-4", name: "Otros ingresos", type: "Ingreso" },
  { id: "cat-5", name: "Arriendo", type: "Gasto" },
  { id: "cat-6", name: "Servicios públicos", type: "Gasto" },
  { id: "cat-7", name: "Nómina", type: "Gasto" },
  { id: "cat-8", name: "Marketing", type: "Gasto" },
  { id: "cat-9", name: "Software", type: "Gasto" },
  { id: "cat-10", name: "Impuestos", type: "Gasto" },
  { id: "cat-11", name: "Otros gastos", type: "Gasto" },
];

export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "pm-1", name: "Efectivo" },
  { id: "pm-2", name: "Transferencia" },
  { id: "pm-3", name: "Tarjeta" },
  { id: "pm-4", name: "Nequi" },
  { id: "pm-5", name: "Daviplata" },
  { id: "pm-6", name: "PayPal" },
];

export const MOCK_MOVEMENTS: Movement[] = [
  {
    id: "m1", type: "Ingreso", date: "2025-03-05", amount: 45000,
    categoryId: "cat-1", paymentMethodId: "pm-2",
    client: "TechCorp Solutions", provider: "",
    description: "Pago Portal E-Commerce", status: "Confirmado",
    createdAt: "2025-03-05",
  },
  {
    id: "m2", type: "Gasto", date: "2025-03-04", amount: 3200,
    categoryId: "cat-9", paymentMethodId: "pm-3",
    client: "", provider: "AWS",
    description: "Servidores - Febrero", status: "Confirmado",
    createdAt: "2025-03-04",
  },
  {
    id: "m3", type: "Ingreso", date: "2025-03-03", amount: 32000,
    categoryId: "cat-1", paymentMethodId: "pm-2",
    client: "GreenEnergy MX", provider: "",
    description: "Pago Fase 2 monitoreo", status: "Confirmado",
    createdAt: "2025-03-03",
  },
  {
    id: "m4", type: "Gasto", date: "2025-03-01", amount: 68000,
    categoryId: "cat-7", paymentMethodId: "pm-2",
    client: "", provider: "",
    description: "Nómina quincenal", status: "Confirmado",
    createdAt: "2025-03-01",
  },
  {
    id: "m5", type: "Ingreso", date: "2025-02-28", amount: 8200,
    categoryId: "cat-1", paymentMethodId: "pm-2",
    client: "EduPlat", provider: "",
    description: "Consultoría educativa", status: "Confirmado",
    createdAt: "2025-02-28",
  },
  {
    id: "m6", type: "Gasto", date: "2025-02-25", amount: 5500,
    categoryId: "cat-8", paymentMethodId: "pm-3",
    client: "", provider: "Meta Ads",
    description: "Campaña publicitaria febrero", status: "Confirmado",
    createdAt: "2025-02-25",
  },
  {
    id: "m7", type: "Ingreso", date: "2025-02-20", amount: 60000,
    categoryId: "cat-1", paymentMethodId: "pm-2",
    client: "Digital Minds", provider: "",
    description: "Desarrollo app móvil - Milestone 2", status: "Confirmado",
    createdAt: "2025-02-20",
  },
  {
    id: "m8", type: "Gasto", date: "2025-02-15", amount: 12000,
    categoryId: "cat-5", paymentMethodId: "pm-2",
    client: "", provider: "Inmobiliaria Centro",
    description: "Arriendo oficina febrero", status: "Confirmado",
    createdAt: "2025-02-15",
  },
  {
    id: "m9", type: "Gasto", date: "2025-03-07", amount: 1800,
    categoryId: "cat-9", paymentMethodId: "pm-3",
    client: "", provider: "Figma",
    description: "Licencia anual Figma", status: "Pendiente",
    createdAt: "2025-03-07",
  },
  {
    id: "m10", type: "Ingreso", date: "2025-03-08", amount: 15000,
    categoryId: "cat-3", paymentMethodId: "pm-4",
    client: "Innovatech Labs", provider: "",
    description: "Suscripción mensual plataforma", status: "Pendiente",
    createdAt: "2025-03-08",
  },
];

// ── Helpers ────────────────────────────────────────────
export function formatFinanceCurrency(val: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency", currency: "MXN", maximumFractionDigits: 0,
  }).format(val);
}

export function formatFinanceDate(d: string) {
  try {
    return format(new Date(d), "dd MMM yyyy", { locale: es });
  } catch {
    return d;
  }
}

export function emptyMovement(): Omit<Movement, "id" | "createdAt"> {
  return {
    type: "Ingreso",
    date: new Date().toISOString().split("T")[0],
    amount: 0,
    categoryId: "",
    paymentMethodId: "",
    client: "",
    provider: "",
    description: "",
    status: "Pendiente",
  };
}
