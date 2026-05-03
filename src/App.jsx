import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

export default function App() {
  const [status, setStatus] = useState("Iniciando...");
  const [reports, setReports] = useState([]);

  useEffect(() => {
    async function test() {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!url || !key) {
        setStatus("Faltan variables de Supabase en Vercel");
        return;
      }

      try {
        const supabase = createClient(url, key);

        const { data, error } = await supabase
          .from("monthly_reports")
          .select("month, label, ventas")
          .order("month", { ascending: true });

        if (error) {
          setStatus("Error Supabase: " + error.message);
          return;
        }

        setReports(data || []);
        setStatus("Conectado a Supabase");
      } catch (err) {
        setStatus("Error JS: " + err.message);
      }
    }

    test();
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0F1E35",
      color: "white",
      fontFamily: "Arial",
      padding: 40
    }}>
      <h1>BordaXpress CCC</h1>
      <p>{status}</p>

      {reports.map((r) => (
        <div key={r.month} style={{ background: "#162844", padding: 20, marginTop: 16, borderRadius: 12 }}>
          <h2>{r.label} - {r.month}</h2>
          <p>Ingresos: ${r.ventas?.ingresos?.toLocaleString("es-MX")}</p>
          <p>Órdenes: {r.ventas?.ordenes}</p>
        </div>
      ))}
    </div>
  );
}
