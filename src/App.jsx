import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
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
  const ticket = ventas.ordenes ? ventas.ingresos / ventas.ordenes : null;

  // 🔥 crecimiento mes vs mes
  const currentIndex = reports.findIndex((r) => r.month === selectedMonth);
  const prev = reports[currentIndex - 1];

  const growth =
    prev && prev.ventas?.ingresos
      ? ((ventas.ingresos - prev.ventas.ingresos) / prev.ventas.ingresos) * 100
      : null;

  // 📊 data gráfica
  const chartData = reports.map((r) => ({
    mes: r.label,
    ingresos: r.ventas?.ingresos || 0
  }));

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0F1E35",
      color: "white",
      fontFamily: "Arial, sans-serif",
      padding: 28
    }}>
      <h1 style={{ marginTop: 0 }}>
        Centro de Control Comercial BordaXpress
      </h1>
      <p style={{ color: "#94A3B8" }}>{status}</p>

      {/* selector */}
      <div style={{ marginTop: 20, marginBottom: 24 }}>
        {reports.map((r) => (
          <button
            key={r.month}
            onClick={() => setSelectedMonth(r.month)}
            style={{
              padding: "10px 18px",
              marginRight: 10,
              borderRadius: 8,
              border: "none",
              background: selectedMonth === r.month ? "#3B82F6" : "#162844",
              color: "white",
              fontWeight: "bold"
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
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginTop: 16
          }}>
            <Card title="Ingresos" value={fmtMoney(ventas.ingresos)} />
            <Card title="Órdenes" value={ventas.ordenes} />
            <Card title="Ticket promedio" value={fmtMoney(ticket)} />
            <Card
              title="Crecimiento"
              value={
                growth == null
                  ? "N/D"
                  : `${growth > 0 ? "+" : ""}${growth.toFixed(1)}%`
              }
            />
          </div>

          {/* gráfica */}
          <div style={{
            background: "#162844",
            padding: 20,
            borderRadius: 14,
            marginTop: 20
          }}>
            <h3 style={{ marginTop: 0 }}>Ingresos por mes</h3>

            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
                  <XAxis dataKey="mes" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip formatter={(value) => fmtMoney(value)} />
                  <Bar dataKey="ingresos" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div style={{
      background: "#162844",
      padding: 20,
      borderRadius: 14
    }}>
      <p style={{ color: "#94A3B8", margin: 0 }}>{title}</p>
      <h2 style={{ marginBottom: 0 }}>{value}</h2>
    </div>
  );
}
