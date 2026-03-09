import { X, ArrowUpRight, ArrowDownRight, Calendar, CreditCard, User, FileText, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Movement, FinanceCategory, PaymentMethod, formatFinanceCurrency, formatFinanceDate } from "@/lib/finance-data";

interface Props {
  movement: Movement | null;
  onClose: () => void;
  categories: FinanceCategory[];
  paymentMethods: PaymentMethod[];
}

export function MovementDetail({ movement, onClose, categories, paymentMethods }: Props) {
  if (!movement) return null;

  const category = categories.find(c => c.id === movement.categoryId);
  const method = paymentMethods.find(p => p.id === movement.paymentMethodId);
  const isIncome = movement.type === "Ingreso";

  const Row = ({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm">{value || "—"}</p>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-background border-l border-border z-50 overflow-y-auto shadow-2xl"
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isIncome ? (
                <div className="p-2 rounded-lg bg-success/10"><ArrowUpRight className="h-5 w-5 text-success" /></div>
              ) : (
                <div className="p-2 rounded-lg bg-destructive/10"><ArrowDownRight className="h-5 w-5 text-destructive" /></div>
              )}
              <div>
                <p className="text-lg font-bold">{isIncome ? "+" : "-"}{formatFinanceCurrency(movement.amount)}</p>
                <Badge variant={isIncome ? "default" : "secondary"} className="text-[10px]">{movement.type}</Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
          </div>

          {/* Status */}
          <Badge variant={movement.status === "Confirmado" ? "default" : "outline"} className="text-xs">
            {movement.status}
          </Badge>

          {/* Details */}
          <div className="space-y-1 divide-y divide-border/30">
            <Row icon={Calendar} label="Fecha" value={formatFinanceDate(movement.date)} />
            <Row icon={Tag} label="Categoría" value={category?.name || "—"} />
            <Row icon={CreditCard} label="Método de pago" value={method?.name || "—"} />
            {movement.client && <Row icon={User} label="Cliente" value={movement.client} />}
            {movement.provider && <Row icon={User} label="Proveedor" value={movement.provider} />}
            <Row icon={FileText} label="Descripción" value={movement.description} />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
