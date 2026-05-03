import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const fmtMoney = (n) =>
  n == null ? "N/D" : `$${Number(n).toLocaleString("es-MX")}`;

export default function App() {
  const [reports, setReports] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [status, setStatus] = useState("Cargando...");

  useEffect(() => {
    async function loadReports() {
      const { data, error } = await supabase
        .from("monthly_reports")
        .select("*")
        .order("month", { ascending: true });

      if (error) {
        setStatus("Error: " + error.message);
        return;
      }

      setReports(data || []);
      setSelectedMonth(data?.[data.length - 1]?.month || "");
      setStatus("Conectado a Supabase");
    }

    loadReports();
  }, []);

  const current = reports.find((r) => r.month === selectedMonth);
  const ventas = current?.ventas || {};
  const whatsapp = current?.whatsapp || {};
  const ads = current?.ads || {};

  const ticket = ventas.ordenes ? ventas.ingresos / ventas.ordenes : null;

  const index = reports.findIndex((r) => r.month === selectedMonth);
  const prev = reports[index - 1];

  const growth =
    prev && prev.ventas?.ingresos
      ? ((ventas.ingresos - prev.ventas.ingresos) / prev.ventas.ingresos) * 100
      : null;

  const chartData = reports.map((r) => ({
    mes: r.label,
    ingresos: r.ventas?.ingresos || 0
  }));

  return (
    <div style={styles.container}>
      <h1>Centro de Control Comercial BX</h1>
      <p style={styles.sub}>{status}</p>

      {/* selector */}
      <div style={styles.selector}>
        {reports.map((r) => (
          <button
            key={r.month}
            onClick={() => setSelectedMonth(r.month)}
            style={{
              ...styles.btn,
              background:
                selectedMonth === r.month ? "#3B82F6" : "#162844"
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {current && (
        <>
          <h2>{current.label} {current.month}</h2>

          {/* KPIs */}
          <div style={styles.grid4}>
            <Card title="Ingresos" value={fmtMoney(ventas.ingresos)} />
            <Card title="Órdenes" value={ventas.ordenes} />
            <Card title="Ticket" value={fmtMoney(ticket)} />
            <Card
              title="Crecimiento"
              value={
                growth == null
                  ? "N/D"
                  : `${growth > 0 ? "+" : ""}${growth.toFixed(1)}%`
              }
            />
          </div>

          {/* gráfica ingresos */}
          <Box title="Ingresos por mes">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
                <XAxis dataKey="mes" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip formatter={(v) => fmtMoney(v)} />
                <Bar dataKey="ingresos" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* servicios */}
          <Box title="Servicios">
            <div style={styles.split}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={current.servicios}
                    dataKey="valor"
                    nameKey="name"
                    outerRadius={90}
                  >
                    {current.servicios.map((_, i) => (
                      <Cell
                        key={i}
                        fill={colors[i % colors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmtMoney(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              <div>
                {current.servicios
                  .sort((a, b) => b.valor - a.valor)
                  .slice(0, 5)
                  .map((s) => (
                    <div key={s.name}>
                      <strong>{s.name}</strong>
                      <div style={styles.sub}>{fmtMoney(s.valor)}</div>
                    </div>
                  ))}
              </div>
            </div>
          </Box>

          {/* whatsapp */}
          <Box title="WhatsApp">
            <div style={styles.grid3}>
              <Card title="Mensajes" value={whatsapp.mensajes} />
              <Card title="Tasa cierre" value={`${whatsapp.tasaConv}%`} />
              <Card title="Tiempo resp." value={`${whatsapp.t1Resp} min`} />
            </div>
          </Box>

          {/* ads */}
          {ads && (
            <Box title="Ads">
              <div style={styles.grid3}>
                <Card title="Inversión" value={fmtMoney(ads.inversion)} />
                <Card title="ROAS" value={ads.roasDirecto} />
                <Card title="Conversaciones" value={ads.conversaciones} />
              </div>
            </Box>
          )}
        </>
      )}
    </div>
  );
}

/* COMPONENTES */

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

/* ESTILOS */

const styles = {
  container: {
    background: "#0F1E35",
    color: "white",
    minHeight: "100vh",
    padding: 30,
    fontFamily: "Arial"
  },
  sub: { color: "#94A3B8" },
  selector: { margin: "20px 0" },
  btn: {
    padding: "10px 18px",
    marginRight: 10,
    borderRadius: 8,
    border: "none",
    color: "white",
    fontWeight: "bold"
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 16
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 16
  },
  split: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20
  },
  card: {
    background: "#162844",
    padding: 20,
    borderRadius: 14
  },
  box: {
    background: "#162844",
    padding: 20,
    borderRadius: 14,
    marginTop: 20
  }
};

const colors = [
  "#3B82F6",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4"
];
