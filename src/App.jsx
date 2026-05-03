import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const fmtMoney = (n) =>
  n == null ? "N/D" : `$${Number(n).toLocaleString("es-MX")}`;

const fmtN = (n) =>
  n == null ? "N/D" : Number(n).toLocaleString("es-MX");

const safe = (n) => n ?? 0;

const delta = (a, b) =>
  a && b ? (((b - a) / a) * 100).toFixed(1) : null;

function Card({ title, value }) {
  return (
    <div style={styles.card}>
      <p style={styles.sub}>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

function Alert({ type, text }) {
  const colors = {
    ok: "#22C55E",
    warn: "#F59E0B",
    bad: "#EF4444"
  };

  return (
    <div style={{
      background: colors[type] + "22",
      border: `1px solid ${colors[type]}`,
      padding: 12,
      borderRadius: 8,
      marginBottom: 10
    }}>
      {text}
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

function getAdsInsights(ads) {
  const insights = [];
  if (!ads) return insights;

  if (ads.roasEstimado == null) {
    insights.push({ type: "warn", text: "Ads activos, pero faltan datos de ventas para calcular ROAS real." });
  } else if (ads.roasEstimado < 3) {
    insights.push({ type: "bad", text: "ROAS bajo — campaña no rentable." });
  } else if (ads.roasEstimado < 6) {
    insights.push({ type: "warn", text: "ROAS medio — optimizar campaña." });
  } else {
    insights.push({ type: "ok", text: "ROAS alto — campaña escalable." });
  }

  if (ads.costoPorConv == null) {
    insights.push({ type: "warn", text: "Falta registrar conversaciones para calcular costo por conversación." });
  } else if (ads.costoPorConv > 25) {
    insights.push({ type: "bad", text: "Costo por conversación alto." });
  } else if (ads.costoPorConv < 15) {
    insights.push({ type: "ok", text: "Costo por conversación eficiente." });
  }

  return insights;
}

export default function App() {
  const [reports, setReports] = useState([]);
  const [mes, setMes] = useState("");
  const [tab, setTab] = useState("resumen");
  const [status, setStatus] = useState("Cargando...");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("monthly_reports")
        .select("*")
        .order("month", { ascending: true });

      if (error) {
        setStatus("Error: " + error.message);
        return;
      }

      setReports(data || []);
      setMes(data?.[data.length - 1]?.month || "");
      setStatus("Conectado a Supabase");
    }

    load();
  }, []);

  const current = reports.find((r) => r.month === mes);
  const prevIndex = reports.findIndex((r) => r.month === mes) - 1;
  const prev = reports[prevIndex];

  if (!current) return <div style={styles.container}>{status}</div>;

  const ventas = current.ventas || {};
  const whatsapp = current.whatsapp || {};
  const ads = current.ads || null;
  const redes = current.redes || {};
  const ig = redes.ig || {};
  const fb = redes.fb || {};

  const ticket = ventas.ordenes ? ventas.ingresos / ventas.ordenes : 0;
  const ingresoPorMensaje = whatsapp.mensajes ? ventas.ingresos / whatsapp.mensajes : 0;

  const crecimiento =
    prev?.ventas?.ingresos
      ? delta(prev.ventas.ingresos, ventas.ingresos)
      : null;

  const chartData = reports.map((r) => ({
    mes: r.label,
    ingresos: safe(r.ventas?.ingresos)
  }));

  const redesChart = [
    { plataforma: "Instagram", visualizaciones: safe(ig.vis), alcance: safe(ig.alcance), clics: safe(ig.clics), seguidores: safe(ig.segNuevos) },
    { plataforma: "Facebook", visualizaciones: safe(fb.vis), alcance: safe(fb.alcance), clics: safe(fb.clics), seguidores: safe(fb.segNuevos) }
  ];

  const insights = [];

  if (whatsapp.tasaConv < 20) {
    insights.push({ type: "bad", text: "Conversión baja en WhatsApp." });
  } else if (whatsapp.tasaConv > 25) {
    insights.push({ type: "ok", text: "Alta conversión en WhatsApp." });
  }

  if (whatsapp.t1Resp > 20) {
    insights.push({ type: "warn", text: "Tiempo de respuesta alto." });
  }

  if (ingresoPorMensaje > 500) {
    insights.push({ type: "ok", text: "Alto valor por conversación." });
  }

  return (
    <div style={styles.container}>
      <h1>Centro de Control Comercial BX</h1>
      <p style={styles.sub}>{status}</p>

      <div style={styles.selector}>
        {reports.map((r) => (
          <button
            key={r.month}
            onClick={() => setMes(r.month)}
            style={{
              ...styles.btn,
              background: mes === r.month ? "#3B82F6" : "#162844"
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div style={styles.tabs}>
        {["resumen", "whatsapp", "redes", "ads", "insights"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              ...styles.tab,
              borderBottom: tab === t ? "2px solid #3B82F6" : "none"
            }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === "resumen" && (
        <>
          <div style={styles.grid4}>
            <Card title="Ingresos" value={fmtMoney(ventas.ingresos)} />
            <Card title="Órdenes" value={ventas.ordenes} />
            <Card title="Ticket" value={fmtMoney(ticket)} />
            <Card title="Crecimiento" value={crecimiento ? `${crecimiento}%` : "N/D"} />
          </div>

          <Box title="Ingresos por mes">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid stroke="#1E3A5F" />
                <XAxis dataKey="mes" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip formatter={(v) => fmtMoney(v)} />
                <Bar dataKey="ingresos" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </>
      )}

      {tab === "whatsapp" && (
        <div style={styles.grid4}>
          <Card title="Mensajes" value={whatsapp.mensajes} />
          <Card title="Conversión" value={`${whatsapp.tasaConv}%`} />
          <Card title="Resp. inicial" value={`${whatsapp.t1Resp} min`} />
          <Card title="Ingreso x msg" value={fmtMoney(ingresoPorMensaje)} />
        </div>
      )}

      {tab === "redes" && (
        <>
          <div style={styles.grid4}>
            <Card title="IG visualizaciones" value={fmtN(ig.vis)} />
            <Card title="IG alcance" value={fmtN(ig.alcance)} />
            <Card title="FB visualizaciones" value={fmtN(fb.vis)} />
            <Card title="FB alcance" value={fmtN(fb.alcance)} />
          </div>

          <div style={styles.grid4}>
            <Card title="IG seguidores" value={fmtN(ig.segNuevos)} />
            <Card title="FB seguidores" value={fmtN(fb.segNuevos)} />
            <Card title="IG clics" value={fmtN(ig.clics)} />
            <Card title="FB clics" value={fmtN(fb.clics)} />
          </div>

          <Box title="Visualizaciones por plataforma">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={redesChart}>
                <CartesianGrid stroke="#1E3A5F" />
                <XAxis dataKey="plataforma" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip />
                <Bar dataKey="visualizaciones" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          <Box title="Clics por plataforma">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={redesChart}>
                <CartesianGrid stroke="#1E3A5F" />
                <XAxis dataKey="plataforma" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip />
                <Bar dataKey="clics" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </>
      )}

      {tab === "ads" && (
        <>
          {!ads ? (
            <Box title="Ads">
              <p>No hay datos de campañas</p>
            </Box>
          ) : (
            <>
              <div style={styles.grid4}>
                <Card title="Inversión" value={fmtMoney(ads.inversion)} />
                <Card title="Alcance" value={fmtN(ads.alcance)} />
                <Card title="Clics" value={fmtN(ads.clics)} />
                <Card title="Conversaciones" value={fmtN(ads.conversaciones)} />
              </div>

              <div style={styles.grid4}>
                <Card title="Costo x Conv." value={ads.costoPorConv == null ? "N/D" : `$${ads.costoPorConv}`} />
                <Card title="ROAS Directo" value={ads.roasDirecto == null ? "N/D" : `${ads.roasDirecto}x`} />
                <Card title="ROAS Estimado" value={ads.roasEstimado == null ? "N/D" : `${ads.roasEstimado}x`} />
                <Card title="Ingresos Estimados" value={fmtMoney(ads.ingresosEstimados)} />
              </div>

              <Box title="Diagnóstico Ads">
                {getAdsInsights(ads).map((i, idx) => (
                  <Alert key={idx} type={i.type} text={i.text} />
                ))}
              </Box>
            </>
          )}
        </>
      )}

      {tab === "insights" && (
        <Box title="Diagnóstico General">
          {insights.length === 0 && <p>Todo en rango</p>}
          {insights.map((i, idx) => (
            <Alert key={idx} type={i.type} text={i.text} />
          ))}
        </Box>
      )}
    </div>
  );
}

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
    fontWeight: "bold",
    cursor: "pointer"
  },
  tabs: { display: "flex", gap: 20, marginBottom: 20, overflowX: "auto" },
  tab: {
    background: "transparent",
    color: "white",
    border: "none",
    cursor: "pointer",
    paddingBottom: 8
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: 16,
    marginBottom: 16
  },
  card: {
    background: "#162844",
    padding: 20,
    borderRadius: 12
  },
  box: {
    background: "#162844",
    padding: 20,
    borderRadius: 12,
    marginTop: 20
  }
};
