import { Users, Plus, Search, Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const clients = [
  { id: "1", name: "TechCorp Solutions", contact: "Laura Méndez", email: "laura@techcorp.mx", phone: "+52 555 1234", location: "CDMX", type: "Corporativo", projects: 3, pending: "$45,000" },
  { id: "2", name: "Innovatech Labs", contact: "Pedro Ruiz", email: "pedro@innovatech.com", phone: "+52 555 5678", location: "Monterrey", type: "Startup", projects: 1, pending: "$12,000" },
  { id: "3", name: "Digital Minds", contact: "Sofía Castro", email: "sofia@dminds.io", phone: "+52 555 9012", location: "Guadalajara", type: "Agencia", projects: 2, pending: "$0" },
  { id: "4", name: "GreenEnergy MX", contact: "Roberto Salinas", email: "roberto@greenenergy.mx", phone: "+52 555 3456", location: "Querétaro", type: "Corporativo", projects: 4, pending: "$78,500" },
  { id: "5", name: "EduPlat", contact: "Carmen Vega", email: "carmen@eduplat.com", phone: "+52 555 7890", location: "CDMX", type: "Startup", projects: 1, pending: "$8,200" },
];

export default function Clientes() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Clientes
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">{clients.length} clientes registrados</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-sm">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input placeholder="Buscar cliente..." className="bg-transparent border-none outline-none text-xs w-40 placeholder:text-muted-foreground" />
          </div>
          <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Nuevo Cliente
          </button>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider p-4">Cliente</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider p-4">Contacto</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider p-4">Ubicación</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider p-4">Tipo</th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider p-4">Proyectos</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider p-4">Por Cobrar</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="p-4">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.contact}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" /> {c.email}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Phone className="h-3 w-3" /> {c.phone}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-xs">
                      <MapPin className="h-3 w-3 text-muted-foreground" /> {c.location}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{c.type}</span>
                  </td>
                  <td className="p-4 text-center font-mono">{c.projects}</td>
                  <td className="p-4 text-right font-mono font-medium">
                    <span className={c.pending === "$0" ? "text-success" : "text-warning"}>{c.pending}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
