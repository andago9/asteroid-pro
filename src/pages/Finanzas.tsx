import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
import { StatCard } from "@/components/StatCard";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const cashFlowData = [
  { month: "Ene", ingresos: 120000, gastos: 85000 },
  { month: "Feb", ingresos: 95000, gastos: 78000 },
  { month: "Mar", ingresos: 145000, gastos: 92000 },
  { month: "Abr", ingresos: 110000, gastos: 88000 },
  { month: "May", ingresos: 160000, gastos: 95000 },
  { month: "Jun", ingresos: 135000, gastos: 102000 },
];

const transactions = [
  { desc: "Pago TechCorp - Portal E-Commerce", amount: "+$45,000", type: "in", date: "Mar 5" },
  { desc: "AWS Servidores - Febrero", amount: "-$3,200", type: "out", date: "Mar 4" },
  { desc: "Pago GreenEnergy - Fase 2", amount: "+$32,000", type: "in", date: "Mar 3" },
  { desc: "Nómina quincenal", amount: "-$68,000", type: "out", date: "Mar 1" },
  { desc: "Pago EduPlat - Consultoría", amount: "+$8,200", type: "in", date: "Feb 28" },
];

export default function Finanzas() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <DollarSign className="h-6 w-6 text-primary" /> Finanzas
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Balance General" value="$487,200" icon={DollarSign} variant="primary" trend={{ value: "+15% vs mes anterior", positive: true }} />
        <StatCard title="Ingresos (Mes)" value="$145,000" icon={TrendingUp} variant="success" trend={{ value: "+22%", positive: true }} />
        <StatCard title="Gastos (Mes)" value="$92,000" icon={TrendingDown} variant="default" trend={{ value: "+8%", positive: false }} />
        <StatCard title="Por Cobrar" value="$143,700" icon={ArrowUpRight} variant="secondary" subtitle="5 facturas pendientes" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4">Flujo de Caja</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 18%, 18%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(220, 10%, 55%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(220, 10%, 55%)" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 22%, 11%)", border: "1px solid hsl(222, 18%, 18%)", borderRadius: "8px", fontSize: "12px" }} />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="ingresos" fill="hsl(207, 72%, 50%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gastos" fill="hsl(43, 91%, 58%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4">Movimientos Recientes</h3>
          <div className="space-y-3">
            {transactions.map((t, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  {t.type === "in" ? (
                    <ArrowUpRight className="h-4 w-4 text-success shrink-0" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-destructive shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{t.desc}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{t.date}</p>
                  </div>
                </div>
                <span className={`text-xs font-mono font-bold shrink-0 ${t.type === "in" ? "text-success" : "text-destructive"}`}>
                  {t.amount}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
