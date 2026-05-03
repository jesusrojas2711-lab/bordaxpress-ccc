import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient.js";

export default function App() {
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState("Cargando datos...");

  useEffect(() => {
    async function loadReports() {
      const { data, error } = await supabase
        .from("monthly_reports")
        .select("month, label, ventas")
        .order("month", { ascending: true });

      if (error) {
        console.error(error);
        setStatus("Error conectando con Supabase");
        return;
      }

      setReports(data || []);
      setStatus("Conectado a Supabase");
    }

    loadReports();
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0F1E35",
      color: "white",
      fontFamily: "Arial",
      padding: "40px"
    }}>
      <h1>Centro de Control Comercial BordaXpress</h1>
      <p>{status}</p>

      {reports.map((report) => (
        <div key={report.month} style={{
          background: "#162844",
          padding: "20px",
          marginTop: "16px",
          borderRadius: "12px"
        }}>
          <h2>{report.label} {report.month}</h2>
          <p>Ingresos: ${report.ventas?.ingresos?.toLocaleString("es-MX")}</p>
          <p>Órdenes: {report.ventas?.ordenes}</p>
        </div>
      ))}
    </div>
  );
}
