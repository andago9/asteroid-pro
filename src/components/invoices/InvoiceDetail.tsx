import { X, DollarSign, CreditCard, FileText, Package, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Invoice, INV_STATUS_STYLES, calcInvoiceTotals, calcTotalPaid, calcBalance,
  formatInvCurrency, formatInvDate, formatInvDateTime,
} from "@/lib/invoice-data";

interface Props {
  invoice: Invoice | null;
  onClose: () => void;
  onRegisterPayment: (invoiceId: string) => void;
}

export function InvoiceDetail({ invoice, onClose, onRegisterPayment }: Props) {
  if (!invoice) return null;

  const totals = calcInvoiceTotals(invoice.items, invoice.discount);
  const paid = calcTotalPaid(invoice.payments);
  const balance = calcBalance(invoice);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-full sm:w-[560px] bg-background border-l border-border z-50 overflow-y-auto shadow-2xl"
      >
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-mono text-primary font-bold">{invoice.invoiceNumber}</span>
                <Badge className={`text-[10px] ${INV_STATUS_STYLES[invoice.status]}`}>{invoice.status}</Badge>
              </div>
              <h2 className="text-lg font-bold">{invoice.client}</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
          </div>

          {/* Register payment */}
          {(invoice.status === "Pendiente" || invoice.status === "Parcial" || invoice.status === "Vencida") && (
            <Button className="w-full" onClick={() => onRegisterPayment(invoice.id)}>
              <DollarSign className="h-4 w-4 mr-1" /> Registrar Pago
            </Button>
          )}

          {/* Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Emisión</p>
              <p className="font-medium">{formatInvDate(invoice.issueDate)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Vencimiento</p>
              <p className="font-medium">{formatInvDate(invoice.dueDate)}</p>
            </div>
          </div>

          {/* Products */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Package className="h-3 w-3" /> Productos
            </h4>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-center">Cant.</TableHead>
                    <TableHead className="text-right">P. Unit.</TableHead>
                    <TableHead className="text-center">IVA</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="text-xs font-medium">{item.productName}</TableCell>
                      <TableCell className="text-xs text-center">{item.quantity}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{formatInvCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-xs text-center">{item.taxRate}%</TableCell>
                      <TableCell className="text-xs text-right font-mono font-bold">{formatInvCurrency(item.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-lg bg-muted/30 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono">{formatInvCurrency(totals.subtotal)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-destructive">
                <span>Descuento ({invoice.discount}%)</span>
                <span className="font-mono">-{formatInvCurrency(totals.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Impuestos</span>
              <span className="font-mono">{formatInvCurrency(totals.taxTotal)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold">
              <span>Total</span>
              <span className="font-mono">{formatInvCurrency(totals.total)}</span>
            </div>
            <div className="flex justify-between text-success">
              <span>Pagado</span>
              <span className="font-mono">{formatInvCurrency(paid)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Saldo</span>
              <span className={`font-mono ${balance > 0 ? "text-destructive" : "text-success"}`}>
                {formatInvCurrency(balance)}
              </span>
            </div>
          </div>

          {/* Payments */}
          {invoice.payments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <CreditCard className="h-3 w-3" /> Pagos Registrados
              </h4>
              <div className="space-y-2">
                {invoice.payments.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20">
                    <div>
                      <p className="text-xs font-medium">{p.method} — {p.reference || "Sin ref."}</p>
                      <p className="text-[10px] text-muted-foreground">{formatInvDate(p.date)}</p>
                    </div>
                    <span className="text-sm font-mono font-bold text-success">+{formatInvCurrency(p.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <FileText className="h-3 w-3" /> Notas
              </h4>
              <p className="text-sm bg-muted/30 rounded-lg p-3">{invoice.notes}</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
