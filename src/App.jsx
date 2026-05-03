import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { createClient } from "@supabase/supabase-js";

/* SUPABASE */
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

/* COLORES */
const C = {
  navy: "#0F1E35",
  navyMid: "#162844",
  navyLight: "#1E3A5F",
  blueLight: "#3B82F6",
  tealLight: "#14B8A6",
  goldLight: "#F0C060",
  greenLight: "#10B981",
  redLight: "#EF4444",
  text: "#E2E8F0",
  textMuted: "#94A3B8"
};

const CHART_COLORS = [
  "#3B82F6", "#22C55E", "#F59E0B",
  "#EF4444", "#8B5CF6", "#06B6D4"
];

/* FORMAT */
const fmt = (n) => n == null ? "N/D" : `$${Number(n).toLocaleString("es-MX")}`;
const fmtN = (n) => n == null ? "N/D" : Number(n).toLocaleString("es-MX");

/* APP */
export default function App() {
  const [DATA, setDATA] = useState(null);
  const [mes, setMes] = useState(null);
  const [tab, setTab] = useState("resumen");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("monthly_reports")
        .select("*")
        .order("month", { ascending: true });

      const months = data.map(r => r.month);

      setDATA({
        months,
        labels: Object.fromEntries(data.map(r => [r.month, r.label])),
        ventas: Object.fromEntries(data.map(r => [r.month, r.ventas])),
        servicios: Object.fromEntries(data.map(r => [r.month, r.servicios])),
        whatsapp: Object.fromEntries(data.map(r => [r.month, r.whatsapp])),
        ads: Object.fromEntries(data.map(r => [r.month, r.ads]))
      });

      setMes(months[months.length - 1]);
    }

    load();
  }, []);

  if (!DATA || !mes) {
    return (
      <div style={{ color: "white", background: "#0F1E35", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Cargando...
      </div>
    );
  }

  const v = DATA.ventas[mes];
  const w = DATA.whatsapp[mes];
  const s = DATA.servicios[mes];
  const a = DATA.ads[mes];

  return (
    <div style={{ background: "#0F1E35", minHeight: "100vh", color: "white", padding: 30 }}>
      
      <h1>Centro de Control Comercial</h1>

      {/* SELECTOR */}
      <div style={{ marginBottom: 20 }}>
        {DATA.months.map(m => (
          <button key={m} onClick={() => setMes(m)} style={{
            marginRight: 10,
            background: mes === m ? "#3B82F6" : "#162844",
            color: "white",
            padding: "8px 14px",
            border: "none",
            borderRadius: 6
          }}>
            {DATA.labels[m]}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
        <Card label="Ingresos" value={fmt(v.ingresos)} />
        <Card label="Órdenes" value={fmtN(v.ordenes)} />
        <Card label="Ticket" value={fmt(v.ingresos / v.ordenes)} />
        <Card label="Conversión WA" value={`${w.tasaConv}%`} />
      </div>

      {/* GRAFICA INGRESOS */}
      <Box title="Ingresos">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={DATA.months.map(m => ({
            mes: DATA.labels[m],
            ingresos: DATA.ventas[m].ingresos
          }))}>
            <CartesianGrid stroke="#1E3A5F" />
            <XAxis dataKey="mes" stroke="#94A3B8" />
            <YAxis stroke="#94A3B8" />
            <Tooltip />
            <Bar dataKey="ingresos" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* SERVICIOS */}
      <Box title="Servicios">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={s} dataKey="valor" nameKey="name" outerRadius={80}>
              {s.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </Box>

      {/* WHATSAPP */}
      <Box title="WhatsApp">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          <Card label="Mensajes" value={w.mensajes} />
          <Card label="Intención" value={w.intencion} />
          <Card label="Tiempo Resp." value={`${w.t1Resp} min`} />
        </div>
      </Box>

      {/* ADS */}
      {a && (
        <Box title="Ads">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            <Card label="Inversión" value={fmt(a.inversion)} />
            <Card label="ROAS" value={`${a.roasDirecto}x`} />
            <Card label="Conversaciones" value={a.conversaciones} />
          </div>
        </Box>
      )}

    </div>
  );
}

/* COMPONENTES */
function Card({ label, value }) {
  return (
    <div style={{ background: "#162844", padding: 15, borderRadius: 10 }}>
      <div style={{ color: "#94A3B8", fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 22 }}>{value}</div>
    </div>
  );
}

function Box({ title, children }) {
  return (
    <div style={{ background: "#162844", marginTop: 20, padding: 15, borderRadius: 10 }}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}
