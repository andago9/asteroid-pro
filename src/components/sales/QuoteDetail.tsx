import { X, Clock, User, FileText, Package, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Quote, STATUS_STYLES, calcQuoteTotals,
  formatSalesCurrency, formatSalesDate, formatSalesDateTime,
} from "@/lib/sales-data";

interface Props {
  quote: Quote | null;
  onClose: () => void;
  onConvert: (quoteId: string) => void;
}

export function QuoteDetail({ quote, onClose, onConvert }: Props) {
  if (!quote) return null;

  const totals = calcQuoteTotals(quote.items, quote.taxRate, quote.generalDiscount);

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
                <span className="text-sm font-mono text-primary font-bold">{quote.quoteNumber}</span>
                <Badge className={`text-[10px] ${STATUS_STYLES[quote.status]}`}>{quote.status}</Badge>
              </div>
              <h2 className="text-lg font-bold">{quote.client}</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
          </div>

          {/* Convert button */}
          {quote.status === "Aprobada" && (
            <Button className="w-full" onClick={() => onConvert(quote.id)}>
              <DollarSign className="h-4 w-4 mr-1" /> Convertir en Venta
            </Button>
          )}

          {/* Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Vendedor</p>
              <p className="font-medium">{quote.seller}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Fecha cotización</p>
              <p className="font-medium">{formatSalesDate(quote.quoteDate)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Vencimiento</p>
              <p className="font-medium">{formatSalesDate(quote.expiryDate)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Creada</p>
              <p className="font-medium">{formatSalesDateTime(quote.createdAt)}</p>
            </div>
          </div>

          {/* Products */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Package className="h-3 w-3" /> Productos / Servicios
            </h4>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-center">Cant.</TableHead>
                    <TableHead className="text-right">P. Unit.</TableHead>
                    <TableHead className="text-center">Desc.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quote.items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="text-xs font-medium">{item.productName}</TableCell>
                      <TableCell className="text-xs text-center">{item.quantity}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{formatSalesCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-xs text-center">{item.discount}%</TableCell>
                      <TableCell className="text-xs text-right font-mono font-bold">{formatSalesCurrency(item.subtotal)}</TableCell>
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
              <span className="font-mono">{formatSalesCurrency(totals.subtotal)}</span>
            </div>
            {quote.generalDiscount > 0 && (
              <div className="flex justify-between text-destructive">
                <span>Descuento ({quote.generalDiscount}%)</span>
                <span className="font-mono">-{formatSalesCurrency(totals.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Impuestos ({quote.taxRate}%)</span>
              <span className="font-mono">{formatSalesCurrency(totals.taxAmount)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-lg font-bold">
              <span>Total</span>
              <span className="font-mono text-primary">{formatSalesCurrency(totals.total)}</span>
            </div>
          </div>

          {/* Notes */}
          {quote.notes && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <FileText className="h-3 w-3" /> Notas
              </h4>
              <p className="text-sm bg-muted/30 rounded-lg p-3 leading-relaxed">{quote.notes}</p>
            </div>
          )}

          {/* Activity */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Historial
            </h4>
            <div className="space-y-0">
              {quote.activity.map((act, i) => (
                <div key={act.id} className="flex items-start gap-3 py-2 relative">
                  {i < quote.activity.length - 1 && (
                    <div className="absolute left-[11px] top-8 bottom-0 w-px bg-border/40" />
                  )}
                  <div className="p-1 rounded-full bg-muted shrink-0 z-10">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs">{act.action}</p>
                    <p className="text-[10px] text-muted-foreground">{act.user} · {formatSalesDateTime(act.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
