import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PAYMENT_METHODS, PaymentMethodType, formatInvCurrency } from "@/lib/invoice-data";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  balance: number;
  onSave: (data: { date: string; amount: number; method: PaymentMethodType; reference: string }) => void;
}

export function PaymentDialog({ open, onOpenChange, balance, onSave }: Props) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [amount, setAmount] = useState(balance);
  const [method, setMethod] = useState<PaymentMethodType>("Transferencia");
  const [reference, setReference] = useState("");

  const handleSave = () => {
    if (amount <= 0) return;
    onSave({ date, amount, method, reference });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">Saldo pendiente: <span className="font-bold font-mono text-foreground">{formatInvCurrency(balance)}</span></p>

        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de pago</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Monto</Label>
              <Input type="number" min={1} max={balance} value={amount} onChange={e => setAmount(Number(e.target.value))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Método de pago</Label>
            <Select value={method} onValueChange={v => setMethod(v as PaymentMethodType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Referencia</Label>
            <Input value={reference} onChange={e => setReference(e.target.value)} placeholder="Nº de transacción o referencia" />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={amount <= 0}>Registrar Pago</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
