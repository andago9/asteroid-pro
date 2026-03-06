import { Package, Plus } from "lucide-react";
import { motion } from "framer-motion";

const products = [
  { id: "1", name: "Diseño de Página Web", type: "Servicio", description: "Diseño y desarrollo de sitios web responsive", price: "$15,000", status: "Activo" },
  { id: "2", name: "Identidad Visual", type: "Servicio", description: "Logo, paleta de colores, tipografía y guía de marca", price: "$8,000", status: "Activo" },
  { id: "3", name: "Desarrollo de Software", type: "Servicio", description: "Desarrollo a medida de aplicaciones web y móviles", price: "$50,000+", status: "Activo" },
  { id: "4", name: "Consultoría TI", type: "Servicio", description: "Asesoría en arquitectura, infraestructura y procesos", price: "$3,000/hr", status: "Activo" },
  { id: "5", name: "Hosting Administrado", type: "Producto", description: "Servidores administrados con soporte 24/7", price: "$2,500/mes", status: "Activo" },
  { id: "6", name: "SEO & Marketing Digital", type: "Servicio", description: "Estrategia de posicionamiento y campañas digitales", price: "$12,000/mes", status: "Pausado" },
];

export default function Productos() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" /> Productos & Servicios
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">{products.length} registros</p>
        </div>
        <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Nuevo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl p-5 hover:glow-primary transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{p.type}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${p.status === "Activo" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                {p.status}
              </span>
            </div>
            <h3 className="text-sm font-semibold mb-1">{p.name}</h3>
            <p className="text-xs text-muted-foreground mb-3">{p.description}</p>
            <p className="text-base font-bold font-mono text-primary">{p.price}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
