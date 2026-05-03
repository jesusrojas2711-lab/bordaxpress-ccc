import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const fmtMoney = (n) =>
  n == null ? "N/D" : `$${Number(n).toLocaleString("es-MX")}`;

const fmtN = (n) =>
  n == null ? "N/D" : Number(n).toLocaleString("es-MX");

const pct = (n) =>
  n == null ? "N/D" : `${Number(n).toFixed(1)}%`;

const safe = (n) => n ?? 0;

const calcDelta = (prev, current) =>
  prev && current ? ((current - prev) / prev) * 100 : null;

const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

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
  const currentIndex = reports.findIndex((r) => r.month === mes);
  const prev = reports[currentIndex - 1];

  if (!current) return <div style={styles.container}>{status}</div>;

  const ventas = current.ventas || {};
  const whatsapp = current.whatsapp || {};
  const redes = current.redes || {};
  const ig = redes.ig || {};
  const fb = redes.fb || {};
  const ads = current.ads || null;
  const servicios = current.servicios || [];

  const ticket = ventas.ordenes ? ventas.ingresos / ventas.ordenes : null;
  const crecimiento = prev?.ventas?.ingresos
    ? calcDelta(prev.ventas.ingresos, ventas.ingresos)
    : null;

  const pctWhatsapp = ventas.ordenes && ventas.whatsapp
    ? (ventas.whatsapp / ventas.ordenes) * 100
    : null;

  const ingresoPorMensaje = whatsapp.mensajes
    ? ventas.ingresos / whatsapp.mensajes
    : null;

  const roi = ads?.inversion && ads?.ingresosEstimados
    ? ((ads.ingresosEstimados - ads.inversion) / ads.inversion) * 100
    : null;

  const conversionAds = ads?.conversaciones && ads?.ventasDirectas
    ? (ads.ventasDirectas / ads.conversaciones) * 100
    : null;

  const costoPorClic = ads?.inversion && ads?.clics
    ? ads.inversion / ads.clics
    : null;

  const totalVisualizaciones = safe(ig.vis) + safe(fb.vis);
  const totalAlcance = safe(ig.alcance) + safe(fb.alcance);
  const totalClicsRedes = safe(ig.clics) + safe(fb.clics);
  const totalSeguidores = safe(ig.segNuevos) + safe(fb.segNuevos);

  const ingresosChart = reports.map((r) => ({
    mes: r.label,
    ingresos: safe(r.ventas?.ingresos),
    ordenes: safe(r.ventas?.ordenes)
  }));

  const redesChart = [
    { plataforma: "Instagram", visualizaciones: safe(ig.vis), alcance: safe(ig.alcance), clics: safe(ig.clics) },
    { plataforma: "Facebook", visualizaciones: safe(fb.vis), alcance: safe(fb.alcance), clics: safe(fb.clics) }
  ];

  const adsChart = ads ? [
    { name: "Inversión", valor: safe(ads.inversion) },
    { name: "Ing. directo", valor: safe(ads.ingresosDirectos) },
    { name: "Ing. estimado", valor: safe(ads.ingresosEstimados) }
  ] : [];

  const insights = [];

  if (crecimiento != null) {
    insights.push({
      type: crecimiento >= 0 ? "ok" : "bad",
      text: crecimiento >= 0
        ? `Ingresos crecieron ${crecimiento.toFixed(1)}% vs mes anterior.`
        : `Ingresos bajaron ${Math.abs(crecimiento).toFixed(1)}% vs mes anterior.`
    });
  }

  if (whatsapp.tasaConv != null) {
    if (whatsapp.tasaConv < 20) insights.push({ type: "bad", text: "Conversión de WhatsApp baja. Revisar cierre y seguimiento." });
    else if (whatsapp.tasaConv >= 25) insights.push({ type: "ok", text: "Conversión de WhatsApp saludable. Canal con potencial de escala." });
    else insights.push({ type: "warn", text: "Conversión de WhatsApp aceptable, pero todavía mejorable." });
  }

  if (whatsapp.t1Resp != null && whatsapp.t1Resp > 20) {
    insights.push({ type: "warn", text: "Tiempo de primera respuesta alto. Meta sugerida: menos de 10 minutos." });
  }

  if (ingresoPorMensaje != null) {
    if (ingresoPorMensaje < 300) insights.push({ type: "bad", text: "Ingreso por mensaje bajo. Puede haber tráfico poco calificado o baja calidad de cierre." });
    else if (ingresoPorMensaje >= 600) insights.push({ type: "ok", text: "Ingreso por mensaje alto. Buen valor comercial por conversación." });
  }

  if (ads) {
    if (ads.roasEstimado == null) insights.push({ type: "warn", text: "Ads activo, pero faltan datos de ventas para calcular ROAS real/estimado." });
    else if (ads.roasEstimado >= 6) insights.push({ type: "ok", text: "ROAS estimado alto. Evaluar escalar presupuesto gradualmente." });
    else if (ads.roasEstimado < 3) insights.push({ type: "bad", text: "ROAS bajo. No escalar hasta corregir campaña o proceso de cierre." });

    if (ads.costoPorConv == null) insights.push({ type: "warn", text: "Falta registrar conversaciones de Ads para medir costo por conversación." });
    else if (ads.costoPorConv > 25) insights.push({ type: "bad", text: "Costo por conversación alto. Revisar creatividad, segmentación o objetivo." });
    else if (ads.costoPorConv < 15) insights.push({ type: "ok", text: "Costo por conversación eficiente." });
  }

  const decisiones = [];

  if (ads?.roasEstimado >= 6 && ads?.costoPorConv <= 20) {
    decisiones.push("Escalar inversión de Ads de forma gradual (+20% a +30%) y monitorear calidad de conversaciones.");
  }

  if (whatsapp.t1Resp > 20) {
    decisiones.push("Priorizar reducción de tiempo de respuesta en WhatsApp antes de aumentar tráfico.");
  }

  if (whatsapp.tasaConv < 20) {
    decisiones.push("Revisar guiones, seguimiento y atajos de WhatsApp para elevar conversión.");
  }

  if (pctWhatsapp > 70) {
    decisiones.push("WhatsApp concentra la mayoría de ventas. Fortalecer medición de origen y seguimiento comercial.");
  }

  if (servicios.length > 0) {
    const topServicio = [...servicios].sort((a, b) => b.valor - a.valor)[0];
    decisiones.push(`Servicio líder del mes: ${topServicio.name}. Considerar reforzar contenido/oferta sobre este servicio.`);
  }

  if (decisiones.length === 0) {
    decisiones.push("Mantener operación actual y seguir acumulando datos para decisiones más precisas.");
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={{ margin: 0 }}>Centro de Control Comercial BX</h1>
          <p style={styles.sub}>{status}</p>
        </div>
        <span style={styles.live}>● EN VIVO</span>
      </header>

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
        {["resumen", "ventas", "whatsapp", "redes", "ads", "insights", "decisiones"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              ...styles.tab,
              color: tab === t ? "white" : "#94A3B8",
              borderBottom: tab === t ? "2px solid #3B82F6" : "2px solid transparent"
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
            <Card title="Órdenes" value={fmtN(ventas.ordenes)} />
            <Card title="Ticket promedio" value={fmtMoney(ticket)} />
            <Card title="Crecimiento" value={crecimiento == null ? "N/D" : `${crecimiento.toFixed(1)}%`} />
          </div>

          <div style={styles.grid4}>
            <Card title="% Ventas WA" value={pctWhatsapp == null ? "N/D" : pct(pctWhatsapp)} />
            <Card title="Ingreso x mensaje" value={fmtMoney(ingresoPorMensaje)} />
            <Card title="Visualizaciones" value={fmtN(totalVisualizaciones)} />
            <Card title="Clics redes" value={fmtN(totalClicsRedes)} />
          </div>

          <Box title="Ingresos por mes">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ingresosChart}>
                <CartesianGrid stroke="#1E3A5F" />
                <XAxis dataKey="mes" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip formatter={(v) => fmtMoney(v)} />
                <Bar dataKey="ingresos" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </>
      )}

      {tab === "ventas" && (
        <>
          <div style={styles.grid4}>
            <Card title="Ingresos" value={fmtMoney(ventas.ingresos)} />
            <Card title="Órdenes" value={fmtN(ventas.ordenes)} />
            <Card title="WhatsApp" value={fmtN(ventas.whatsapp)} />
            <Card title="Tienda física" value={fmtN(ventas.tienda)} />
          </div>

          <Box title="Ingresos por servicio">
            {servicios.length === 0 ? (
              <p style={styles.sub}>No hay datos de servicios para este mes.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={servicios} dataKey="valor" nameKey="name" outerRadius={100}>
                    {servicios.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmtMoney(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Box>

          <Box title="Top servicios">
            {[...servicios].sort((a, b) => b.valor - a.valor).slice(0, 5).map((s, i) => (
              <div key={s.name} style={styles.row}>
                <strong>{i + 1}. {s.name}</strong>
                <span>{fmtMoney(s.valor)}</span>
              </div>
            ))}
          </Box>
        </>
      )}

      {tab === "whatsapp" && (
        <>
          <div style={styles.grid4}>
            <Card title="Mensajes" value={fmtN(whatsapp.mensajes)} />
            <Card title="Intención" value={fmtN(whatsapp.intencion)} />
            <Card title="Conversión" value={whatsapp.tasaConv == null ? "N/D" : `${whatsapp.tasaConv}%`} />
            <Card title="Resp. inicial" value={whatsapp.t1Resp == null ? "N/D" : `${whatsapp.t1Resp} min`} />
          </div>

          <div style={styles.grid4}>
            <Card title="Promedio diario" value={whatsapp.promedioDiario ?? "N/D"} />
            <Card title="Ventas WA" value={whatsapp.ventas ?? "N/D"} />
            <Card title="Ingreso x mensaje" value={fmtMoney(ingresoPorMensaje)} />
            <Card title="% intención" value={whatsapp.pctIntencion == null ? "N/D" : `${whatsapp.pctIntencion}%`} />
          </div>
        </>
      )}

      {tab === "redes" && (
        <>
          <div style={styles.grid4}>
            <Card title="Visualizaciones" value={fmtN(totalVisualizaciones)} />
            <Card title="Alcance" value={fmtN(totalAlcance)} />
            <Card title="Clics" value={fmtN(totalClicsRedes)} />
            <Card title="Seguidores nuevos" value={fmtN(totalSeguidores)} />
          </div>

          <Box title="Visualizaciones por plataforma">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={redesChart}>
                <CartesianGrid stroke="#1E3A5F" />
                <XAxis dataKey="plataforma" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip />
                <Bar dataKey="visualizaciones" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          <Box title="Detalle redes">
            <div style={styles.grid2}>
              <Platform title="Instagram" data={ig} />
              <Platform title="Facebook" data={fb} />
            </div>
          </Box>
        </>
      )}

      {tab === "ads" && (
        <>
          {!ads ? (
            <Box title="Ads">
              <p style={styles.sub}>No hay datos de campañas para este mes.</p>
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
                <Card title="Costo x clic" value={fmtMoney(costoPorClic)} />
                <Card title="Costo x conv." value={ads.costoPorConv == null ? "N/D" : fmtMoney(ads.costoPorConv)} />
                <Card title="ROAS directo" value={ads.roasDirecto == null ? "N/D" : `${ads.roasDirecto}x`} />
                <Card title="ROAS estimado" value={ads.roasEstimado == null ? "N/D" : `${ads.roasEstimado}x`} />
              </div>

              <div style={styles.grid4}>
                <Card title="ROI" value={roi == null ? "N/D" : pct(roi)} />
                <Card title="% Conv Ads" value={conversionAds == null ? "N/D" : pct(conversionAds)} />
                <Card title="Ingresos directos" value={fmtMoney(ads.ingresosDirectos)} />
                <Card title="Ingresos estimados" value={fmtMoney(ads.ingresosEstimados)} />
              </div>

              <Box title="Inversión vs retorno">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={adsChart}>
                    <CartesianGrid stroke="#1E3A5F" />
                    <XAxis dataKey="name" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip formatter={(v) => fmtMoney(v)} />
                    <Bar dataKey="valor" fill="#10B981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </>
          )}
        </>
      )}

      {tab === "insights" && (
        <Box title="Diagnóstico automático">
          {insights.length === 0 && <p style={styles.sub}>Todo en rango.</p>}
          {insights.map((i, idx) => <Alert key={idx} type={i.type} text={i.text} />)}
        </Box>
      )}

      {tab === "decisiones" && (
        <Box title="Decisiones sugeridas">
          {decisiones.map((d, idx) => (
            <div key={idx} style={styles.decision}>
              <span>▶</span>
              <p>{d}</p>
            </div>
          ))}
        </Box>
      )}
    </div>
  );
}

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

function Alert({ type, text }) {
  const map = {
    ok: "#10B981",
    warn: "#F59E0B",
    bad: "#EF4444"
  };

  return (
    <div style={{
      background: `${map[type]}22`,
      border: `1px solid ${map[type]}`,
      borderRadius: 10,
      padding: 14,
      marginBottom: 10
    }}>
      {text}
    </div>
  );
}

function Platform({ title, data }) {
  return (
    <div style={styles.platform}>
      <h4>{title}</h4>
      <p>Visualizaciones: {fmtN(data.vis)}</p>
      <p>Alcance: {fmtN(data.alcance)}</p>
      <p>Interacciones: {fmtN(data.inter)}</p>
      <p>Seguidores nuevos: {fmtN(data.segNuevos)}</p>
      <p>Visitas perfil: {fmtN(data.visitas)}</p>
      <p>Clics: {fmtN(data.clics)}</p>
    </div>
  );
}

const styles = {
  container: {
    background: "linear-gradient(160deg, #0F1E35 0%, #0A1525 60%, #0B1E33 100%)",
    color: "white",
    minHeight: "100vh",
    padding: 30,
    fontFamily: "Arial, sans-serif"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  live: {
    background: "#10B98122",
    color: "#10B981",
    border: "1px solid #10B98155",
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: "bold"
  },
  sub: {
    color: "#94A3B8"
  },
  selector: {
    margin: "24px 0 18px"
  },
  btn: {
    padding: "10px 18px",
    marginRight: 10,
    borderRadius: 8,
    border: "none",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer"
  },
  tabs: {
    display: "flex",
    gap: 16,
    marginBottom: 24,
    overflowX: "auto"
  },
  tab: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "10px 0",
    fontWeight: "bold",
    letterSpacing: ".04em"
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginBottom: 16
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16
  },
  card: {
    background: "#162844",
    padding: 20,
    borderRadius: 14,
    border: "1px solid #1E3A5F88"
  },
  box: {
    background: "#162844",
    padding: 22,
    borderRadius: 14,
    border: "1px solid #1E3A5F88",
    marginTop: 20
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #1E3A5F88",
    padding: "10px 0"
  },
  platform: {
    background: "#0F1E35",
    padding: 18,
    borderRadius: 12,
    border: "1px solid #1E3A5F88"
  },
  decision: {
    display: "flex",
    gap: 10,
    background: "#0F1E35",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    border: "1px solid #1E3A5F88"
  }
};
