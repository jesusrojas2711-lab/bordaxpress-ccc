import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const fmtMoney = (n) =>
  n == null ? "N/D" : `$${Number(n).toLocaleString("es-MX")}`;

const TABS = ["Resumen", "Ventas", "WhatsApp", "Ads", "Comparativo"];

export default function App() {
  const [reports, setReports] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [activeTab, setActiveTab] = useState("Resumen");

  useEffect(() => {
    async function loadReports() {
      const { data } = await supabase
        .from("monthly_reports")
        .select("*")
        .order("month", { ascending: true });

      setReports(data || []);
      setSelectedMonth(data?.[data.length - 1]?.month || "");
    }

    loadReports();
  }, []);

  const current = reports.find((r) => r.month === selectedMonth);
  if (!current) return null;

  const ventas = current.ventas;
  const whatsapp = current.whatsapp;
  const ads = current.ads;

  const chartData = reports.map((r) => ({
    mes: r.label,
    ingresos: r.ventas?.ingresos || 0
  }));

  return (
    <div style={styles.container}>
      <h1>Centro de Control Comercial BX</h1>

      {/* selector mes */}
      <div style={styles.selector}>
        {reports.map((r) => (
          <button
            key={r.month}
            onClick={() => setSelectedMonth(r.month)}
            style={{
              ...styles.btn,
              background: selectedMonth === r.month ? "#3B82F6" : "#162844"
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* tabs */}
      <div style={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              ...styles.tab,
              borderBottom:
                activeTab === t ? "2px solid #3B82F6" : "none"
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* contenido */}
      {activeTab === "Resumen" && (
        <>
          <div style={styles.grid4}>
            <Card title="Ingresos" value={fmtMoney(ventas.ingresos)} />
            <Card title="Órdenes" value={ventas.ordenes} />
            <Card title="Conversión WA" value={`${whatsapp.tasaConv}%`} />
            <Card title="Mensajes" value={whatsapp.mensajes} />
          </div>

          <Box title="Ingresos por mes">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid stroke="#1E3A5F" />
                <XAxis dataKey="mes" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip />
                <Bar dataKey="ingresos" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </>
      )}

      {activeTab === "Ventas" && (
        <Box title="Servicios">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={current.servicios} dataKey="valor" nameKey="name">
                {current.servicios.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      )}

      {activeTab === "WhatsApp" && (
        <Box title="Tendencia WhatsApp">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={reports.map(r => ({
              mes: r.label,
              mensajes: r.whatsapp.mensajes
            }))}>
              <XAxis dataKey="mes" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip />
              <Line dataKey="mensajes" stroke="#3B82F6" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}

      {activeTab === "Ads" && ads && (
        <Box title="Ads">
          <div style={styles.grid3}>
            <Card title="Inversión" value={fmtMoney(ads.inversion)} />
            <Card title="ROAS" value={ads.roasDirecto} />
            <Card title="Conversaciones" value={ads.conversaciones} />
          </div>
        </Box>
      )}

      {activeTab === "Comparativo" && (
        <Box title="Comparación mensual">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="ingresos" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </div>
  );
}

/* UI */
function Card({ title, value }) {
  return (
    <div style={styles.card}>
      <p style={styles.sub}>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

function Box({ title, children }) {
  return (
    <div style={styles.box}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

/* estilos */
const styles = {
  container: { background: "#0F1E35", color: "white", padding: 30 },
  selector: { marginBottom: 20 },
  btn: { padding: 10, marginRight: 10, borderRadius: 6, border: "none" },
  tabs: { display: "flex", gap: 20, marginBottom: 20 },
  tab: { background: "transparent", color: "white", border: "none", cursor: "pointer" },
  grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 },
  card: { background: "#162844", padding: 15, borderRadius: 10 },
  box: { background: "#162844", padding: 20, marginTop: 20, borderRadius: 10 },
  sub: { color: "#94A3B8" }
};

const colors = ["#3B82F6","#22C55E","#F59E0B","#EF4444","#8B5CF6","#06B6D4"];
