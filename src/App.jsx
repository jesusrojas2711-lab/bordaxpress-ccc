import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

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

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0F1E35",
      color: "white",
      fontFamily: "Arial, sans-serif",
      padding: 40
    }}>
      <h1>Centro de Control Comercial BordaXpress</h1>
      <p style={{ color: "#94A3B8" }}>{status}</p>

      <div style={{ marginTop: 24, marginBottom: 32 }}>
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

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginTop: 20
          }}>
            <Card title="Ingresos" value={fmtMoney(ventas.ingresos)} />
            <Card title="Órdenes" value={ventas.ordenes} />
            <Card title="Ticket promedio" value={fmtMoney(ticket)} />
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
      padding: 24,
      borderRadius: 14
    }}>
      <p style={{ color: "#94A3B8", margin: 0 }}>{title}</p>
      <h2 style={{ marginBottom: 0 }}>{value}</h2>
    </div>
  );
}
