import { FolderKanban, Plus, Star } from "lucide-react";
import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  scores: {
    reconocimiento: number;
    riesgo: number;
    capital: number;
    retorno: number;
    factibilidad: number;
    dificultad: number;
    tiempo: number;
    alineacion: number;
  };
}

const weights = {
  reconocimiento: 0.10,
  riesgo: 0.15,
  capital: 0.10,
  retorno: 0.20,
  factibilidad: 0.15,
  dificultad: 0.10,
  tiempo: 0.10,
  alineacion: 0.10,
};

function calcScore(scores: Project["scores"]) {
  return Object.entries(weights).reduce((acc, [key, w]) => acc + scores[key as keyof typeof scores] * w, 0);
}

const projects: Project[] = [
  {
    id: "1", name: "Portal E-Commerce", description: "Plataforma de comercio electrónico B2C", status: "En desarrollo", progress: 65,
    scores: { reconocimiento: 4.0, riesgo: 3.5, capital: 4.0, retorno: 4.5, factibilidad: 4.2, dificultad: 3.0, tiempo: 3.5, alineacion: 4.0 },
  },
  {
    id: "2", name: "App Móvil Fintech", description: "Aplicación de pagos y transferencias", status: "Planeación", progress: 20,
    scores: { reconocimiento: 4.5, riesgo: 4.0, capital: 3.0, retorno: 4.8, factibilidad: 3.5, dificultad: 2.5, tiempo: 2.8, alineacion: 3.8 },
  },
  {
    id: "3", name: "Dashboard Analytics", description: "Panel de análisis de datos en tiempo real", status: "En desarrollo", progress: 80,
    scores: { reconocimiento: 3.5, riesgo: 3.0, capital: 4.5, retorno: 4.0, factibilidad: 4.8, dificultad: 3.5, tiempo: 4.0, alineacion: 4.5 },
  },
  {
    id: "4", name: "CRM Interno", description: "Sistema de gestión de relaciones con clientes", status: "Idea", progress: 5,
    scores: { reconocimiento: 3.0, riesgo: 2.5, capital: 4.0, retorno: 3.5, factibilidad: 4.0, dificultad: 3.8, tiempo: 3.5, alineacion: 4.2 },
  },
];

const statusBadge: Record<string, string> = {
  Idea: "bg-muted text-muted-foreground",
  Planeación: "bg-info/10 text-info",
  "En desarrollo": "bg-primary/10 text-primary",
  Pausado: "bg-warning/10 text-warning",
  Cancelado: "bg-destructive/10 text-destructive",
  Ejecutado: "bg-success/10 text-success",
};

export default function Proyectos() {
  const ranked = [...projects].sort((a, b) => calcScore(b.scores) - calcScore(a.scores));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-primary" /> Proyectos
          </h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">{projects.length} proyectos · Ranking por score</p>
        </div>
        <button className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Nuevo Proyecto
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {ranked.map((project, idx) => {
          const score = calcScore(project.scores);
          const radarData = [
            { c: "Reconocimiento", v: project.scores.reconocimiento },
            { c: "Riesgo", v: project.scores.riesgo },
            { c: "Capital", v: project.scores.capital },
            { c: "Retorno", v: project.scores.retorno },
            { c: "Factibilidad", v: project.scores.factibilidad },
            { c: "Dificultad", v: project.scores.dificultad },
            { c: "Tiempo", v: project.scores.tiempo },
            { c: "Alineación", v: project.scores.alineacion },
          ];

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card rounded-xl p-5 hover:glow-primary transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">#{idx + 1}</span>
                    <h3 className="text-base font-semibold">{project.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{project.description}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-secondary fill-secondary" />
                    <span className="text-lg font-bold">{score.toFixed(1)}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusBadge[project.status] || ""}`}>
                    {project.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <ResponsiveContainer width="100%" height={160}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(222, 18%, 18%)" />
                      <PolarAngleAxis dataKey="c" tick={{ fontSize: 8, fill: "hsl(220, 10%, 55%)" }} />
                      <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
                      <Radar dataKey="v" stroke="hsl(207, 72%, 50%)" fill="hsl(207, 72%, 50%)" fillOpacity={0.15} strokeWidth={1.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col justify-center space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Progreso</p>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden mt-1">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground mt-1">{project.progress}%</p>
                  </div>
                  {Object.entries(project.scores).slice(0, 4).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground capitalize">{key}</span>
                      <span className="font-mono font-medium">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
