import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
  AreaChart, Area, ComposedChart
} from "recharts";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const T = {
  bg: "#080E1A",
  surface: "#0D1626",
  surfaceUp: "#121E30",
  border: "#1C2E45",
  borderHi: "#2A4065",
  blue: "#3B82F6",
  teal: "#14B8A6",
  green: "#10B981",
  gold: "#F59E0B",
  red: "#F43F5E",
  purple: "#A78BFA",
  cyan: "#22D3EE",
  text: "#E2E8F0",
  textMid: "#94A3B8",
  textDim: "#475569",
  white: "#FFFFFF",
};

const CH = ["#3B82F6", "#14B8A6", "#F59E0B", "#10B981", "#F43F5E", "#A78BFA", "#22D3EE", "#FB923C"];

const $ = (n) => n == null ? "—" : `$${Number(n).toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const N = (n) => n == null ? "—" : Number(n).toLocaleString("es-MX");
const Pct = (n) => n == null ? "—" : `${Number(n).toFixed(1)}%`;
const Chg = (a, b) => (a == null || b == null || a === 0) ? null : (((b - a) / a) * 100);

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; background: #080E1A; color: #E2E8F0; font-family: 'Inter', system-ui, sans-serif; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  .fade-up { animation: fadeUp 0.38s ease both; }
  .fade-in { animation: fadeIn 0.3s ease both; }
  .kpi-card { transition: transform 0.22s, box-shadow 0.22s; }
  .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 12px 32px #00000060, 0 0 0 1px #3B82F620 !important; }
  .tab-btn { transition: all 0.18s; }
  .tab-btn:hover { color: #E2E8F0 !important; background: #1C2E4566 !important; }
  .month-btn { transition: all 0.18s; }
  .month-btn:hover { background: #1C2E45 !important; }
  .grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
  .grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
  .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .grid-31 { display:grid; grid-template-columns:1.5fr 1fr; gap:16px; }
  @media (max-width:1024px) {
    .grid-4 { grid-template-columns:repeat(2,1fr); }
    .grid-3 { grid-template-columns:repeat(2,1fr); }
    .grid-2, .grid-31 { grid-template-columns:1fr; }
  }
  @media (max-width:600px) {
    .grid-4, .grid-3 { grid-template-columns:1fr; }
  }
`;

function Card({ children, style = {}, delay = 0 }) {
  return (
    <div className="fade-up" style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 14,
      padding: "20px 22px",
      boxShadow: "0 4px 16px #00000040",
      animationDelay: `${delay}ms`,
      ...style,
    }}>
      {children}
    </div>
  );
}

function SLabel({ children, accent = T.blue }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <div style={{ width: 3, height: 18, background: `linear-gradient(180deg,${accent},${accent}44)`, borderRadius: 2 }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: T.textMid, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Space Grotesk',sans-serif" }}>
        {children}
      </span>
    </div>
  );
}

function Badge({ children, color = T.blue, style = {} }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      background: `${color}18`,
      color,
      border: `1px solid ${color}40`,
      borderRadius: 6,
      padding: "2px 9px",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.04em",
      ...style,
    }}>
      {children}
    </span>
  );
}

function Delta({ prev, curr, inverse = false }) {
  const chg = Chg(prev, curr);
  if (chg === null) return <span style={{ color: T.textDim, fontSize: 11 }}>—</span>;

  const up = inverse ? chg <= 0 : chg >= 0;
  const color = up ? T.green : T.red;

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 3,
      background: `${color}18`,
      color,
      border: `1px solid ${color}40`,
      borderRadius: 6,
      padding: "2px 8px",
      fontSize: 11,
      fontWeight: 700,
    }}>
      {up ? "▲" : "▼"} {Math.abs(chg).toFixed(1)}%
    </span>
  );
}

function KPI({ label, value, sub, prev, curr, inverse = false, color = T.blue, icon, delay = 0 }) {
  return (
    <div className="kpi-card fade-up" style={{
      background: `linear-gradient(135deg,${T.surface},${T.surfaceUp})`,
      border: `1px solid ${T.border}`,
      borderRadius: 14,
      padding: "18px 20px",
      position: "relative",
      overflow: "hidden",
      animationDelay: `${delay}ms`,
    }}>
      <div style={{ position: "absolute", right: -10, top: -10, width: 70, height: 70, borderRadius: "50%", background: `radial-gradient(circle,${color}18,transparent 70%)` }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: T.textDim, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
        {icon && <span style={{ fontSize: 15, opacity: 0.6 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1, marginBottom: 8 }}>
        {value}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {sub && <span style={{ fontSize: 11, color: T.textDim }}>{sub}</span>}
        {prev != null && curr != null && <Delta prev={prev} curr={curr} inverse={inverse} />}
      </div>
    </div>
  );
}

function TTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", boxShadow: "0 8px 24px #000a" }}>
      {label && <div style={{ color: T.textMid, fontSize: 11, marginBottom: 6 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || T.text, fontSize: 13, fontWeight: 600 }}>
          {p.name}: <strong>{typeof p.value === "number" && p.value > 999 ? $(p.value) : p.value}</strong>
        </div>
      ))}
    </div>
  );
}

function Empty({ msg = "Sin datos para este periodo" }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 24px" }}>
      <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.3 }}>◌</div>
      <div style={{ color: T.textDim, fontSize: 13 }}>{msg}</div>
    </div>
  );
}

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setErrorMsg("Correo o contraseña incorrectos");

    setLoading(false);
  }

  return (
    <>
      <style>{STYLES}</style>
      <div style={{
        minHeight: "100vh",
        background: `linear-gradient(160deg, ${T.bg} 0%, #0F1E35 100%)`,
        color: T.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        <form onSubmit={handleLogin} className="fade-up" style={{
          width: "100%",
          maxWidth: 420,
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 18,
          padding: 32,
          boxShadow: "0 20px 60px #00000080",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${T.blue}, ${T.teal})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: T.white,
              fontWeight: 900,
              fontFamily: "'Space Grotesk', sans-serif",
              boxShadow: `0 0 20px ${T.blue}55`,
            }}>
              B
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontFamily: "'Space Grotesk', sans-serif" }}>BordaXpress CCC</h1>
              <p style={{ margin: "4px 0 0", color: T.textDim, fontSize: 12 }}>Panel ejecutivo interno</p>
            </div>
          </div>

          <p style={{ color: T.textMid, marginBottom: 22, fontSize: 14, lineHeight: 1.6 }}>
            Inicia sesión para acceder al Centro de Control Comercial.
          </p>

          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

          {errorMsg && (
            <p style={{ color: T.red, fontSize: 13, marginBottom: 14 }}>
              {errorMsg}
            </p>
          )}

          <button type="submit" disabled={loading} style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 10,
            border: "none",
            background: T.blue,
            color: T.white,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
          }}>
            {loading ? "Entrando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: `1px solid ${T.border}`,
  background: T.surfaceUp,
  color: T.white,
  marginBottom: 14,
  outline: "none",
  fontSize: 14,
};

const TABS = [
  { id: "resumen", label: "Resumen", icon: "◈" },
  { id: "ventas", label: "Ventas", icon: "◆" },
  { id: "whatsapp", label: "WhatsApp", icon: "◎" },
  { id: "redes", label: "Redes", icon: "◇" },
  { id: "ads", label: "Ads", icon: "▲" },
  { id: "insights", label: "Insights", icon: "✦" },
  { id: "decisiones", label: "Decisiones", icon: "⬡" },
];

function TabResumen({ d, prev, months, byMonth }) {
  const v = d.ventas || {};
  const w = d.whatsapp || {};
  const a = d.ads || {};
  const vp = prev?.ventas || {};
  const wp = prev?.whatsapp || {};

  const ingMsg = w.mensajes && v.ingresos ? Math.round(v.ingresos / w.mensajes) : null;
  const pingMsg = wp.mensajes && vp.ingresos ? Math.round(vp.ingresos / wp.mensajes) : null;

  const compareData = [
    { name: "Ingresos", actual: v.ingresos ?? 0, anterior: vp.ingresos ?? 0 },
    { name: "Ordenes", actual: (v.ordenes ?? 0) * 1000, anterior: (vp.ordenes ?? 0) * 1000 },
    { name: "Mensajes WA", actual: (w.mensajes ?? 0) * 300, anterior: (wp.mensajes ?? 0) * 300 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="grid-4">
        <KPI label="Ingresos del mes" value={$(v.ingresos)} color={T.green} icon="💰" sub="MXN" prev={vp.ingresos} curr={v.ingresos} />
        <KPI label="Ordenes cerradas" value={N(v.ordenes)} color={T.blue} icon="📦" sub="pedidos" prev={vp.ordenes} curr={v.ordenes} />
        <KPI label="Ticket promedio" value={$(v.ingresos && v.ordenes ? Math.round(v.ingresos / v.ordenes) : null)} color={T.gold} icon="🎯" sub="por orden" prev={vp.ingresos && vp.ordenes ? vp.ingresos / vp.ordenes : null} curr={v.ingresos && v.ordenes ? v.ingresos / v.ordenes : null} />
        <KPI label="Ingreso x mensaje" value={ingMsg ? `$${N(ingMsg)}` : "—"} color={T.teal} icon="💬" sub="eficiencia WA" prev={pingMsg} curr={ingMsg} />
      </div>

      <div className="grid-4">
        <KPI label="Mensajes WA" value={N(w.mensajes)} color={T.cyan} icon="📲" prev={wp.mensajes} curr={w.mensajes} />
        <KPI label="Tasa conversion WA" value={Pct(w.tasaConv)} color={T.green} icon="✅" prev={wp.tasaConv} curr={w.tasaConv} />
        <KPI label="Inversion Ads" value={$(a.inversion)} color={T.gold} icon="📣" sub={a.plataforma} />
        <KPI label="ROAS estimado" value={a.roasEstimado ? `${Number(a.roasEstimado).toFixed(1)}x` : "—"} color={T.purple} icon="📈" />
      </div>

      <Card>
        <SLabel accent={T.blue}>Comparativo vs mes anterior</SLabel>
        {months.length > 1 ? (
          <ResponsiveContainer width="100%" height={230}>
            <ComposedChart data={compareData}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
              <XAxis dataKey="name" tick={{ fill: T.textMid, fontSize: 11 }} />
              <YAxis tick={{ fill: T.textMid, fontSize: 10 }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
              <Tooltip content={<TTip />} />
              <Legend wrapperStyle={{ color: T.textMid, fontSize: 11 }} />
              <Bar dataKey="anterior" name="Anterior" fill={T.border} radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="Actual" fill={T.blue} radius={[4, 4, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : <Empty msg="Se necesitan al menos 2 meses para comparar" />}
      </Card>
    </div>
  );
}

function TabVentas({ d, prev, months, byMonth }) {
  const v = d.ventas || {};
  const sv = d.servicios || [];
  const vp = prev?.ventas || {};
  const topSvcs = [...sv].sort((a, b) => b.valor - a.valor);

  const trendData = months.map((m) => ({
    mes: byMonth[m]?.label?.slice(0, 3) || m,
    ingresos: byMonth[m]?.ventas?.ingresos ?? 0,
    ordenes: byMonth[m]?.ventas?.ordenes ?? 0,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="grid-3">
        <KPI label="Ingresos totales" value={$(v.ingresos)} color={T.green} icon="💰" sub="MXN" prev={vp.ingresos} curr={v.ingresos} />
        <KPI label="Ordenes" value={N(v.ordenes)} color={T.blue} icon="📦" prev={vp.ordenes} curr={v.ordenes} />
        <KPI label="Ticket promedio" value={$(v.ingresos && v.ordenes ? Math.round(v.ingresos / v.ordenes) : null)} color={T.gold} icon="🎯" />
      </div>

      <div className="grid-31">
        <Card>
          <SLabel accent={T.blue}>Ingresos por servicio</SLabel>
          {topSvcs.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topSvcs} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} horizontal={false} />
                <XAxis type="number" tick={{ fill: T.textMid, fontSize: 10 }} tickFormatter={(v) => $(v)} />
                <YAxis dataKey="name" type="category" tick={{ fill: T.text, fontSize: 11 }} width={92} />
                <Tooltip content={<TTip />} />
                <Bar dataKey="valor" name="Ingresos" radius={[0, 6, 6, 0]}>
                  {topSvcs.map((_, i) => <Cell key={i} fill={CH[i % CH.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty />}
        </Card>

        <Card>
          <SLabel accent={T.teal}>Participacion por servicio</SLabel>
          {topSvcs.length && v.ingresos ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topSvcs.slice(0, 7).map((s, i) => {
                const p = (s.valor / v.ingresos * 100).toFixed(1);
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ color: T.text, fontSize: 12, fontWeight: 500 }}>{s.name}</span>
                      <span style={{ color: CH[i % CH.length], fontSize: 12, fontWeight: 700 }}>{$(s.valor)}</span>
                    </div>
                    <div style={{ height: 5, background: T.border, borderRadius: 3 }}>
                      <div style={{ height: "100%", width: `${p}%`, background: CH[i % CH.length], borderRadius: 3 }} />
                    </div>
                    <div style={{ color: T.textDim, fontSize: 10, marginTop: 2 }}>{p}%</div>
                  </div>
                );
              })}
            </div>
          ) : <Empty />}
        </Card>
      </div>

      <Card>
        <SLabel accent={T.green}>Tendencia de ingresos</SLabel>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
            <XAxis dataKey="mes" tick={{ fill: T.textMid, fontSize: 11 }} />
            <YAxis tick={{ fill: T.textMid, fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<TTip />} />
            <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke={T.green} fill={T.green + "33"} strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function TabWhatsApp({ d, prev, months, byMonth }) {
  const w = d.whatsapp || {};
  const v = d.ventas || {};
  const wp = prev?.whatsapp || {};
  const vp = prev?.ventas || {};

  const ingMsg = w.mensajes && v.ingresos ? Math.round(v.ingresos / w.mensajes) : null;
  const pingMsg = wp.mensajes && vp.ingresos ? Math.round(vp.ingresos / wp.mensajes) : null;

  const trendData = months.map((m) => ({
    mes: byMonth[m]?.label?.slice(0, 3) || m,
    mensajes: byMonth[m]?.whatsapp?.mensajes ?? 0,
    intencion: byMonth[m]?.whatsapp?.intencion ?? 0,
    tasaConv: byMonth[m]?.whatsapp?.tasaConv ?? 0,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="grid-4">
        <KPI label="Mensajes totales" value={N(w.mensajes)} color={T.blue} icon="💬" prev={wp.mensajes} curr={w.mensajes} />
        <KPI label="Promedio diario" value={w.promedioDiario ?? "—"} color={T.cyan} icon="📊" prev={wp.promedioDiario} curr={w.promedioDiario} />
        <KPI label="Con intencion" value={N(w.intencion)} color={T.gold} icon="🎯" sub="conversaciones" prev={wp.intencion} curr={w.intencion} />
        <KPI label="Tasa conversion" value={Pct(w.tasaConv)} color={T.green} icon="✅" prev={wp.tasaConv} curr={w.tasaConv} />
      </div>

      <div className="grid-4">
        <KPI label="T. primera respuesta" value={w.t1Resp != null ? `${w.t1Resp} min` : "—"} color={w.t1Resp != null && w.t1Resp <= 20 ? T.green : T.gold} icon="⏱" prev={wp.t1Resp} curr={w.t1Resp} inverse />
        <KPI label="Duracion conv." value={w.tConvActiva != null ? `${w.tConvActiva} min` : "—"} color={T.teal} icon="🕐" />
        <KPI label="% con intencion" value={Pct(w.pctIntencion)} color={T.blue} icon="📐" prev={wp.pctIntencion} curr={w.pctIntencion} />
        <KPI label="Ingreso x mensaje" value={ingMsg ? `$${N(ingMsg)}` : "—"} color={T.green} icon="💵" prev={pingMsg} curr={ingMsg} />
      </div>

      <Card>
        <SLabel accent={T.blue}>Tendencia mensual WhatsApp</SLabel>
        <ResponsiveContainer width="100%" height={230}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
            <XAxis dataKey="mes" tick={{ fill: T.textMid, fontSize: 11 }} />
            <YAxis tick={{ fill: T.textMid, fontSize: 10 }} />
            <Tooltip content={<TTip />} />
            <Legend wrapperStyle={{ color: T.textMid, fontSize: 11 }} />
            <Line type="monotone" dataKey="mensajes" name="Mensajes" stroke={T.blue} strokeWidth={2.5} />
            <Line type="monotone" dataKey="intencion" name="Intencion" stroke={T.teal} strokeWidth={2.5} />
            <Line type="monotone" dataKey="tasaConv" name="Conv %" stroke={T.green} strokeWidth={2} strokeDasharray="4 3" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function TabRedes({ d, prev, months, byMonth }) {
  const r = d.redes || {};
  const ig = r.ig || {};
  const fb = r.fb || {};

  // 🔵 Unificado
  const totalVis = (ig.vis ?? 0) + (fb.vis ?? 0);
  const totalAlc = (ig.alcance ?? 0) + (fb.alcance ?? 0);
  const totalInter = (ig.inter ?? 0) + (fb.inter ?? 0);
  const totalSeg = (ig.segNuevos ?? 0) + (fb.segNuevos ?? 0);
  const totalClics = (ig.clics ?? 0) + (fb.clics ?? 0);

  const trendData = months.map((m) => {
    const ri = byMonth[m]?.redes?.ig || {};
    const rf = byMonth[m]?.redes?.fb || {};
    return {
      mes: byMonth[m]?.label?.slice(0, 3) || m,
      ig_seg: ri.segNuevos ?? 0,
      fb_seg: rf.segNuevos ?? 0,
      ig_vis: ri.vis ?? 0,
      fb_vis: rf.vis ?? 0,
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* 🔥 UNIFICADO */}
      <div className="grid-4">
        <KPI label="Visualizaciones totales" value={N(totalVis)} color={T.blue} icon="👁" />
        <KPI label="Alcance total" value={N(totalAlc)} color={T.teal} icon="📡" />
        <KPI label="Interacciones totales" value={N(totalInter)} color={T.purple} icon="⚡" />
        <KPI label="Seguidores nuevos" value={N(totalSeg)} color={T.green} icon="👥" />
      </div>

      <div className="grid-2">
        <Card>
          <SLabel accent={T.gold}>Instagram</SLabel>
          <div className="grid-3">
            <KPI label="Visualizaciones" value={N(ig.vis)} color={T.gold} />
            <KPI label="Alcance" value={N(ig.alcance)} color={T.teal} />
            <KPI label="Interacciones" value={N(ig.inter)} color={T.purple} />
            <KPI label="Seguidores" value={N(ig.segNuevos)} color={T.green} />
            <KPI label="Visitas perfil" value={N(ig.visitas)} color={T.cyan} />
            <KPI label="Clics" value={N(ig.clics)} color={T.blue} />
          </div>
        </Card>

        <Card>
          <SLabel accent={T.blue}>Facebook</SLabel>
          <div className="grid-3">
            <KPI label="Visualizaciones" value={N(fb.vis)} color={T.blue} />
            <KPI label="Alcance" value={N(fb.alcance)} color={T.teal} />
            <KPI label="Interacciones" value={N(fb.inter)} color={T.purple} />
            <KPI label="Seguidores" value={N(fb.segNuevos)} color={T.green} />
            <KPI label="Clics" value={N(fb.clics)} color={T.cyan} />
          </div>
        </Card>
      </div>

      <Card>
        <SLabel accent={T.blue}>Seguidores nuevos</SLabel>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
            <XAxis dataKey="mes" tick={{ fill: T.textMid, fontSize: 11 }} />
            <YAxis tick={{ fill: T.textMid, fontSize: 10 }} />
            <Tooltip content={<TTip />} />
            <Legend />
            <Bar dataKey="ig_seg" name="Instagram" fill={T.gold} />
            <Bar dataKey="fb_seg" name="Facebook" fill={T.blue} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

    </div>
  );
}

function TabAds({ d, prev, months, byMonth }) {
  const a = d.ads || {};
  const ap = prev?.ads || {};
  const hasData = (a.inversion ?? 0) > 0;

  const roasData = [
    { name: "Inversion", value: a.inversion ?? 0, fill: T.red },
    { name: "Ingresos directos", value: a.ingresosDirectos ?? 0, fill: T.blue },
    { name: "Ingresos estimados", value: a.ingresosEstimados ?? 0, fill: T.green },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {!hasData && (
        <Card style={{ background: `${T.gold}10`, border: `1px solid ${T.gold}30`, padding: "14px 18px" }}>
          <span style={{ color: T.gold, fontSize: 13, fontWeight: 600 }}>⚠️ Sin campaña activa este mes.</span>
        </Card>
      )}

      <div className="grid-4">
        <KPI label="Inversion total" value={$(a.inversion)} color={T.gold} icon="💸" sub={a.plataforma} prev={ap.inversion} curr={a.inversion} />
        <KPI label="Alcance Ads" value={N(a.alcance)} color={T.blue} icon="📡" />
        <KPI label="Clics generados" value={N(a.clics)} color={T.cyan} icon="👆" prev={ap.clics} curr={a.clics} />
        <KPI label="Conversaciones" value={N(a.conversaciones)} color={T.teal} icon="💬" prev={ap.conversaciones} curr={a.conversaciones} />
      </div>

      <div className="grid-4">
        <KPI label="Costo por conv." value={a.costoPorConv ? `$${Number(a.costoPorConv).toFixed(2)}` : "—"} color={T.red} icon="💲" prev={ap.costoPorConv} curr={a.costoPorConv} inverse />
        <KPI label="Ventas directas" value={N(a.ventasDirectas)} color={T.green} icon="✅" />
        <KPI label="ROAS directo" value={a.roasDirecto ? `${Number(a.roasDirecto).toFixed(1)}x` : "—"} color={T.teal} icon="⚡" />
        <KPI label="ROAS estimado" value={a.roasEstimado ? `${Number(a.roasEstimado).toFixed(1)}x` : "—"} color={T.purple} icon="🚀" />
      </div>

      <Card>
        <SLabel accent={T.green}>Inversion vs retorno</SLabel>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={roasData}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
            <XAxis dataKey="name" tick={{ fill: T.textMid, fontSize: 11 }} />
            <YAxis tick={{ fill: T.textMid, fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<TTip />} />
            <Bar dataKey="value" name="Monto" radius={[6, 6, 0, 0]}>
              {roasData.map((e, i) => <Cell key={i} fill={e.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

function TabInsights({ d, prev }) {
  const v = d.ventas || {};
  const w = d.whatsapp || {};
  const a = d.ads || {};
  const vp = prev?.ventas || {};

  const items = [];

  if (w.tasaConv != null) {
    if (w.tasaConv < 20) items.push({ color: T.red, icon: "🔴", title: "Conversión baja", body: `Tasa de ${Pct(w.tasaConv)}. Revisar guion de ventas y seguimiento.` });
    else items.push({ color: T.green, icon: "🟢", title: "Conversión saludable", body: `Tasa de ${Pct(w.tasaConv)}. Canal con potencial de escala.` });
  }

  if (w.t1Resp != null && w.t1Resp > 20) {
    items.push({ color: T.gold, icon: "🟡", title: "Respuesta lenta", body: `Primera respuesta en ${w.t1Resp} min. Meta sugerida: menos de 10 min.` });
  }

  if ((a.inversion ?? 0) > 0 && a.roasEstimado != null) {
    if (a.roasEstimado >= 5) items.push({ color: T.green, icon: "🟢", title: "ROAS alto", body: `ROAS estimado de ${a.roasEstimado}x. Evaluar escalar presupuesto.` });
    else items.push({ color: T.gold, icon: "🟡", title: "ROAS moderado", body: `ROAS estimado de ${a.roasEstimado}x. Optimizar antes de escalar.` });
  }

  if (vp.ingresos && v.ingresos) {
    const chg = Chg(vp.ingresos, v.ingresos);
    if (chg < 0) items.push({ color: T.red, icon: "🔴", title: "Ingresos en caída", body: `Ingresos bajaron ${Math.abs(chg).toFixed(1)}% vs mes anterior.` });
    else items.push({ color: T.green, icon: "🟢", title: "Crecimiento positivo", body: `Ingresos crecieron ${chg.toFixed(1)}% vs mes anterior.` });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {items.length === 0 && <Empty msg="Sin suficientes datos para generar insights" />}
      {items.map((ins, i) => (
        <Card key={i} style={{ borderLeft: `3px solid ${ins.color}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span>{ins.icon}</span>
            <strong style={{ color: ins.color }}>{ins.title}</strong>
          </div>
          <p style={{ color: T.textMid, fontSize: 13, lineHeight: 1.7 }}>{ins.body}</p>
        </Card>
      ))}
    </div>
  );
}

function TabDecisiones({ d, prev }) {
  const w = d.whatsapp || {};
  const a = d.ads || {};
  const sv = d.servicios || [];
  const topSvc = [...sv].sort((a, b) => b.valor - a.valor)[0];

  const decs = [];

  if ((a.roasEstimado ?? 0) >= 5 && (a.inversion ?? 0) > 0) {
    decs.push({ color: T.green, title: "Escalar Meta Ads", desc: "La campaña muestra retorno suficiente para probar incremento de inversión gradual." });
  }

  if ((w.t1Resp ?? 0) > 15) {
    decs.push({ color: T.red, title: "Reducir tiempo de respuesta", desc: "Priorizar automatización y respuestas rápidas en WhatsApp." });
  }

  if (topSvc) {
    decs.push({ color: T.blue, title: `Reforzar ${topSvc.name}`, desc: `Servicio líder del mes con ${$(topSvc.valor)}. Crear más contenido y oferta sobre este servicio.` });
  }

  if (!decs.length) {
    decs.push({ color: T.gold, title: "Mantener operación", desc: "No hay señales críticas. Seguir acumulando datos para decisiones más precisas." });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {decs.map((d, i) => (
        <Card key={i}>
          <strong style={{ color: d.color }}>{d.title}</strong>
          <p style={{ color: T.textMid, fontSize: 13, lineHeight: 1.7 }}>{d.desc}</p>
        </Card>
      ))}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("resumen");
  const [mes, setMes] = useState(null);
  const [DATA, setDATA] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
  if (!session) return;

  async function load() {
    const { data, error } = await supabase
      .from("monthly_reports")
      .select("*")
      .order("month", { ascending: true });

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }

 // =========================
// FACEBOOK API
// =========================

try {
  const PAGE_ID = "1150339298440018";
  const PAGE_TOKEN = import.meta.env.VITE_FB_PAGE_TOKEN;

  // FOLLOWERS

  const followersRes = await fetch(
    `https://graph.facebook.com/v23.0/${PAGE_ID}?fields=followers_count&access_token=${PAGE_TOKEN}`
  );

  const followersData = await followersRes.json();

  // INSIGHTS

  const insightsRes = await fetch(
    `https://graph.facebook.com/v23.0/${PAGE_ID}/insights?metric=page_impressions,page_post_engagements&period=day&access_token=${PAGE_TOKEN}`
  );

  const insightsData = await insightsRes.json();

  console.log("FOLLOWERS:", followersData);
  console.log("INSIGHTS:", insightsData);

  let fbReach = 0;
  let fbInteractions = 0;
  let fbViews = 0;

  if (insightsData?.data) {
    insightsData.data.forEach((metric) => {
      const total =
        metric.values?.reduce(
          (acc, v) => acc + (v.value || 0),
          0
        ) || 0;

      if (metric.name === "page_impressions") {
        fbViews = total;
        fbReach = total;
      }

      if (metric.name === "page_post_engagements") {
        fbInteractions = total;
      }
    });
  }

  // INSERTAR DATOS EN EL MES MÁS RECIENTE

  if (data?.length) {
    const latest = data[data.length - 1];

    latest.redes = {
      ...latest.redes,

      fb: {
        ...(latest.redes?.fb || {}),

        segNuevos:
          followersData.followers_count || 0,

        alcance: fbReach,

        inter: fbInteractions,

        vis: fbViews,
      },
    };
  }
} catch (e) {
  console.error("Facebook API Error:", e);
}

    if (!data?.length) {
      setErr("No hay datos en monthly_reports.");
      setLoading(false);
      return;
    }

    const months = data.map((r) => r.month);

    const labels = Object.fromEntries(
      data.map((r) => [r.month, r.label])
    );

    const byMonth = Object.fromEntries(
      data.map((r) => [
        r.month,
        {
          label: r.label,
          ventas: r.ventas,
          servicios: r.servicios,
          whatsapp: r.whatsapp,
          redes: r.redes,
          ads: r.ads ?? null,
        },
      ])
    );

    setDATA({ months, labels, byMonth });

    const savedMonth = localStorage.getItem("bx_selected_month");

    const defaultMonth =
      savedMonth && months.includes(savedMonth)
        ? savedMonth
        : months[months.length - 1];

    setMes(defaultMonth);
    setLoading(false);
  }

  load();
}, [session]);

  if (authLoading) {
    return (
      <>
        <style>{STYLES}</style>
        <div style={{ minHeight: "100vh", background: T.bg, color: T.textMid, display: "flex", alignItems: "center", justifyContent: "center" }}>
          Cargando sesión...
        </div>
      </>
    );
  }

  if (!session) return <LoginScreen />;

  if (loading) {
    return (
      <>
        <style>{STYLES}</style>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 36, height: 36, border: `3px solid ${T.border}`, borderTop: `3px solid ${T.blue}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
            <div style={{ color: T.textMid, fontSize: 13 }}>CARGANDO DATOS...</div>
          </div>
        </div>
      </>
    );
  }

  if (err) {
    return (
      <>
        <style>{STYLES}</style>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg, flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 32 }}>⚠️</div>
          <div style={{ color: T.red, fontSize: 14, fontWeight: 600 }}>Error de conexión</div>
          <div style={{ color: T.textMid, fontSize: 12, maxWidth: 360, textAlign: "center" }}>{err}</div>
        </div>
      </>
    );
  }

  if (!DATA || !mes) return null;

  const { months, labels, byMonth } = DATA;
  const curIdx = months.indexOf(mes);
  const curData = byMonth[mes] || {};
  const prevData = curIdx > 0 ? byMonth[months[curIdx - 1]] : null;
  const sharedProps = { d: curData, prev: prevData, months, byMonth };

  const tabContent = {
    resumen: <TabResumen {...sharedProps} />,
    ventas: <TabVentas {...sharedProps} />,
    whatsapp: <TabWhatsApp {...sharedProps} />,
    redes: <TabRedes {...sharedProps} />,
    ads: <TabAds {...sharedProps} />,
    insights: <TabInsights d={curData} prev={prevData} />,
    decisiones: <TabDecisiones d={curData} prev={prevData} />,
  };

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Inter',system-ui,sans-serif", color: T.text }}>
        <header style={{
          background: `linear-gradient(90deg,${T.surface},${T.surfaceUp})`,
          borderBottom: `1px solid ${T.border}`,
          padding: "0 28px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(20px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `linear-gradient(135deg,${T.blue},${T.teal})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 20px ${T.blue}50`,
                fontSize: 16,
                fontWeight: 900,
                color: "#fff",
                fontFamily: "'Space Grotesk',sans-serif",
              }}>
                B
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.white, letterSpacing: "0.05em", fontFamily: "'Space Grotesk',sans-serif" }}>
                  CENTRO DE CONTROL COMERCIAL
                </div>
                <div style={{ fontSize: 10, color: T.textDim, letterSpacing: "0.08em" }}>
                  BordaXpress · Panel Ejecutivo
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: T.textDim, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>Periodo</span>
              <div style={{ display: "flex", background: `${T.border}66`, borderRadius: 8, padding: 3, gap: 2 }}>
                {months.map((m) => (
                  <button
                    key={m}
                    className="month-btn"
                    onClick={() => {
                      setMes(m);
                      localStorage.setItem("bx_selected_month", m);
                    }}
                    style={{
                      background: mes === m ? T.blue : "transparent",
                      color: mes === m ? T.white : T.textMid,
                      border: "none",
                      borderRadius: 6,
                      padding: "5px 14px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {labels[m]}
                  </button>
                ))}
              </div>

              <button
                onClick={() => supabase.auth.signOut()}
                style={{
                  background: T.border,
                  color: T.text,
                  border: `1px solid ${T.borderHi}`,
                  borderRadius: 8,
                  padding: "6px 12px",
                  fontSize: 12,
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>

          <div style={{ display: "flex", overflowX: "auto" }}>
            {TABS.map((t) => (
              <button key={t.id} className="tab-btn" onClick={() => setTab(t.id)} style={{
                background: "transparent",
                color: tab === t.id ? T.white : T.textMid,
                border: "none",
                borderBottom: `2px solid ${tab === t.id ? T.blue : "transparent"}`,
                padding: "10px 16px 9px",
                fontSize: 12,
                fontWeight: tab === t.id ? 700 : 400,
                cursor: "pointer",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}>
                <span style={{ opacity: tab === t.id ? 1 : 0.5 }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </header>

        <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px 60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
            <span style={{ color: T.textDim, fontSize: 11 }}>BordaXpress CCC</span>
            <span style={{ color: T.border, fontSize: 11 }}>›</span>
            <span style={{ color: T.blue, fontSize: 11, fontWeight: 600 }}>{TABS.find((t) => t.id === tab)?.label}</span>
            <span style={{ color: T.border, fontSize: 11 }}>›</span>
            <span style={{ color: T.textDim, fontSize: 11 }}>{labels[mes]}</span>
            {prevData && <Badge color={T.textDim} style={{ fontSize: 10 }}>vs {labels[months[curIdx - 1]]}</Badge>}
          </div>

          <div key={`${tab}-${mes}`} className="fade-in">
            {tabContent[tab]}
          </div>
        </main>

        <footer style={{ borderTop: `1px solid ${T.border}`, padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ color: T.textDim, fontSize: 11 }}>BordaXpress CCC · Uso interno · Dirección General</span>
          <span style={{ color: T.textDim, fontSize: 11 }}>Último dato: {labels[months[months.length - 1]]}</span>
        </footer>
      </div>
    </>
  );
}
