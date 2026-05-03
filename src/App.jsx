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

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  bg:        "#080E1A",
  surface:   "#0D1626",
  surfaceUp: "#121E30",
  border:    "#1C2E45",
  borderHi:  "#2A4065",
  blue:      "#3B82F6",
  blueDim:   "#1D4ED8",
  blueGlow:  "#3B82F622",
  cyan:      "#22D3EE",
  teal:      "#14B8A6",
  green:     "#10B981",
  greenDim:  "#065F46",
  gold:      "#F59E0B",
  goldDim:   "#92400E",
  red:       "#F43F5E",
  redDim:    "#881337",
  purple:    "#A78BFA",
  text:      "#E2E8F0",
  textMid:   "#94A3B8",
  textDim:   "#475569",
  white:     "#FFFFFF",
};

const CH = ["#3B82F6","#14B8A6","#F59E0B","#10B981","#F43F5E","#A78BFA","#22D3EE","#FB923C"];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const $   = (n) => n == null ? "—" : `$${Number(n).toLocaleString("es-MX",{minimumFractionDigits:0,maximumFractionDigits:0})}`;
const $k  = (n) => n == null ? "—" : n >= 1000 ? `$${(n/1000).toFixed(1)}k` : $(n);
const N   = (n) => n == null ? "—" : Number(n).toLocaleString("es-MX");
const Pct = (n) => n == null ? "—" : `${Number(n).toFixed(1)}%`;
const Chg = (a,b) => (a==null||b==null||a===0) ? null : (((b-a)/a)*100);

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080E1A; color: #E2E8F0; font-family: 'Inter', system-ui, sans-serif; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: #0D1626; }
  ::-webkit-scrollbar-thumb { background: #1C2E45; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #2A4065; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse  { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
  @keyframes spin   { to { transform: rotate(360deg); } }

  .fade-up { animation: fadeUp 0.38s ease both; }
  .fade-in { animation: fadeIn 0.3s ease both; }

  .kpi-card { transition: transform 0.22s, box-shadow 0.22s; }
  .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 12px 32px #00000060, 0 0 0 1px #3B82F620 !important; }

  .tab-btn  { transition: all 0.18s; }
  .tab-btn:hover  { color: #E2E8F0 !important; background: #1C2E4566 !important; }

  .month-btn { transition: all 0.18s; }
  .month-btn:hover { background: #1C2E45 !important; }

  .grid-4  { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
  .grid-3  { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
  .grid-2  { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .grid-13 { display:grid; grid-template-columns:1fr 1.5fr; gap:16px; }
  .grid-31 { display:grid; grid-template-columns:1.5fr 1fr; gap:16px; }

  @media (max-width:1024px) {
    .grid-4 { grid-template-columns:repeat(2,1fr); }
    .grid-3 { grid-template-columns:repeat(2,1fr); }
    .grid-2, .grid-13, .grid-31 { grid-template-columns:1fr; }
  }
  @media (max-width:600px) {
    .grid-4, .grid-3 { grid-template-columns:1fr; }
  }
`;

// ─── BASE COMPONENTS ──────────────────────────────────────────────────────────
function Card({ children, style={}, delay=0 }) {
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

function SLabel({ children, accent=T.blue }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
      <div style={{ width:3, height:18, background:`linear-gradient(180deg,${accent},${accent}44)`, borderRadius:2, flexShrink:0 }}/>
      <span style={{ fontSize:11, fontWeight:700, color:T.textMid, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'Space Grotesk',sans-serif" }}>
        {children}
      </span>
    </div>
  );
}

function Badge({ children, color=T.blue, style={} }) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center",
      background:`${color}18`, color,
      border:`1px solid ${color}40`,
      borderRadius:6, padding:"2px 9px",
      fontSize:11, fontWeight:700, letterSpacing:"0.04em",
      ...style,
    }}>
      {children}
    </span>
  );
}

function Delta({ prev, curr, inverse=false, size=11 }) {
  const chg = Chg(prev, curr);
  if (chg === null) return <span style={{color:T.textDim,fontSize:size}}>—</span>;
  const up = inverse ? chg <= 0 : chg >= 0;
  const color = up ? T.green : T.red;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:3,
      background:`${color}18`, color,
      border:`1px solid ${color}40`,
      borderRadius:6, padding:"2px 8px",
      fontSize:size, fontWeight:700,
    }}>
      {up ? "▲" : "▼"} {Math.abs(chg).toFixed(1)}%
    </span>
  );
}

function KPI({ label, value, sub, prev, curr, inverse=false, color=T.blue, icon, delay=0 }) {
  return (
    <div className="kpi-card fade-up" style={{
      background: `linear-gradient(135deg,${T.surface},${T.surfaceUp})`,
      border:`1px solid ${T.border}`,
      borderRadius:14, padding:"18px 20px",
      position:"relative", overflow:"hidden",
      animationDelay:`${delay}ms`,
    }}>
      <div style={{ position:"absolute", right:-10, top:-10, width:70, height:70, borderRadius:"50%", background:`radial-gradient(circle,${color}18,transparent 70%)`, pointerEvents:"none" }}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
        <span style={{ fontSize:10, fontWeight:600, color:T.textDim, textTransform:"uppercase", letterSpacing:"0.1em" }}>{label}</span>
        {icon && <span style={{ fontSize:15, opacity:0.6 }}>{icon}</span>}
      </div>
      <div style={{ fontSize:26, fontWeight:800, color, fontFamily:"'Space Grotesk',sans-serif", lineHeight:1, marginBottom:8 }}>
        {value}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
        {sub && <span style={{ fontSize:11, color:T.textDim }}>{sub}</span>}
        {prev != null && curr != null && <Delta prev={prev} curr={curr} inverse={inverse} />}
      </div>
    </div>
  );
}

function TTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 14px", boxShadow:"0 8px 24px #000a" }}>
      {label && <div style={{ color:T.textMid, fontSize:11, marginBottom:6 }}>{label}</div>}
      {payload.map((p,i) => (
        <div key={i} style={{ color:p.color||T.text, fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:p.color, display:"inline-block", flexShrink:0 }}/>
          {p.name}: <strong>{typeof p.value==="number" && p.value>999 ? $(p.value) : p.value}</strong>
        </div>
      ))}
    </div>
  );
}

function Empty({ msg="Sin datos para este periodo" }) {
  return (
    <div style={{ textAlign:"center", padding:"40px 24px" }}>
      <div style={{ fontSize:36, marginBottom:10, opacity:0.3 }}>◌</div>
      <div style={{ color:T.textDim, fontSize:13 }}>{msg}</div>
    </div>
  );
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id:"resumen",    label:"Resumen",    icon:"◈" },
  { id:"ventas",     label:"Ventas",     icon:"◆" },
  { id:"whatsapp",   label:"WhatsApp",   icon:"◎" },
  { id:"redes",      label:"Redes",      icon:"◇" },
  { id:"ads",        label:"Ads",        icon:"▲" },
  { id:"insights",   label:"Insights",   icon:"✦" },
  { id:"decisiones", label:"Decisiones", icon:"⬡" },
];

// ─── TAB RESUMEN ─────────────────────────────────────────────────────────────
function TabResumen({ d, prev, months, byMonth }) {
  const v  = d.ventas    || {};
  const w  = d.whatsapp  || {};
  const a  = d.ads       || {};
  const vp = prev?.ventas    || {};
  const wp = prev?.whatsapp  || {};

  const ingMsg  = w.mensajes && v.ingresos ? Math.round(v.ingresos / w.mensajes) : null;
  const pingMsg = wp.mensajes && vp.ingresos ? Math.round(vp.ingresos / wp.mensajes) : null;

  const compareData = [
    { name:"Ingresos", actual: v.ingresos ?? 0, anterior: vp.ingresos ?? 0 },
    { name:"Ordenes",  actual: (v.ordenes ?? 0) * 1000, anterior: (vp.ordenes ?? 0) * 1000 },
    { name:"Mensajes WA", actual: (w.mensajes ?? 0) * 300, anterior: (wp.mensajes ?? 0) * 300 },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div className="grid-4">
        <KPI label="Ingresos del mes"    value={$k(v.ingresos)} color={T.green}  icon="💰" sub="MXN"            prev={vp.ingresos} curr={v.ingresos} delay={0}/>
        <KPI label="Ordenes cerradas"    value={N(v.ordenes)}   color={T.blue}   icon="📦" sub="pedidos"        prev={vp.ordenes}  curr={v.ordenes}  delay={60}/>
        <KPI label="Ticket promedio"     value={$(v.ingresos&&v.ordenes ? Math.round(v.ingresos/v.ordenes) : null)} color={T.gold} icon="🎯" sub="por orden" prev={vp.ingresos&&vp.ordenes?vp.ingresos/vp.ordenes:null} curr={v.ingresos&&v.ordenes?v.ingresos/v.ordenes:null} delay={120}/>
        <KPI label="Ingreso x mensaje"   value={ingMsg ? `$${N(ingMsg)}` : "—"} color={T.teal} icon="💬" sub="eficiencia WA" prev={pingMsg} curr={ingMsg} delay={180}/>
      </div>
      <div className="grid-4">
        <KPI label="Mensajes WA"         value={N(w.mensajes)}   color={T.cyan}   icon="📲" prev={wp.mensajes}  curr={w.mensajes}  delay={240}/>
        <KPI label="Tasa conversion WA"  value={Pct(w.tasaConv)} color={T.green}  icon="✅" prev={wp.tasaConv}  curr={w.tasaConv}  delay={300}/>
        <KPI label="Inversion Ads"       value={$(a.inversion)}  color={T.gold}   icon="📣" sub={a.plataforma}  delay={360}/>
        <KPI label="ROAS estimado"       value={a.roasEstimado ? `${Number(a.roasEstimado).toFixed(1)}x` : "—"} color={T.purple} icon="📈" delay={420}/>
      </div>

      <div className="grid-2">
        <Card delay={100}>
          <SLabel accent={T.blue}>Comparativo vs mes anterior</SLabel>
          {months.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={compareData}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
                <XAxis dataKey="name" tick={{ fill:T.textMid, fontSize:11 }}/>
                <YAxis tick={{ fill:T.textMid, fontSize:10 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}/>
                <Tooltip content={<TTip/>}/>
                <Legend wrapperStyle={{ color:T.textMid, fontSize:11 }}/>
                <Bar dataKey="anterior" name="Anterior" fill={T.border}   radius={[4,4,0,0]}/>
                <Bar dataKey="actual"   name="Actual"   fill={T.blue}     radius={[4,4,0,0]}/>
              </ComposedChart>
            </ResponsiveContainer>
          ) : <Empty msg="Se necesitan al menos 2 meses para comparar"/>}
        </Card>

        <Card delay={160}>
          <SLabel accent={T.teal}>Canales de venta</SLabel>
          {v.ordenes ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={[
                      { name:"WhatsApp", value: v.whatsapp ?? 0 },
                      { name:"Tienda",   value: v.tienda   ?? 0 },
                    ]}
                    cx="50%" cy="50%" innerRadius={42} outerRadius={60}
                    paddingAngle={4} dataKey="value"
                  >
                    <Cell fill={T.teal}/><Cell fill={T.gold}/>
                  </Pie>
                  <Tooltip content={<TTip/>}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:8 }}>
                {[
                  { label:"WhatsApp", val:v.whatsapp, color:T.teal },
                  { label:"Tienda",   val:v.tienda,   color:T.gold },
                ].map((r,i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:r.color }}/>
                      <span style={{ color:T.textMid, fontSize:12 }}>{r.label}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ color:T.text, fontWeight:700, fontSize:13 }}>{N(r.val)}</span>
                      <Badge color={r.color}>{v.ordenes ? `${((r.val??0)/v.ordenes*100).toFixed(0)}%` : "—"}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : <Empty/>}
        </Card>
      </div>
    </div>
  );
}

// ─── TAB VENTAS ───────────────────────────────────────────────────────────────
function TabVentas({ d, prev, months, byMonth }) {
  const v  = d.ventas    || {};
  const sv = d.servicios || [];
  const vp = prev?.ventas || {};

  const topSvcs = [...sv].sort((a,b) => b.valor - a.valor);

  const trendData = months.map(m => ({
    mes:      byMonth[m]?.label?.slice(0,3) || m,
    ingresos: byMonth[m]?.ventas?.ingresos ?? 0,
    ordenes:  byMonth[m]?.ventas?.ordenes  ?? 0,
  }));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div className="grid-3">
        <KPI label="Ingresos totales" value={$(v.ingresos)}  color={T.green} icon="💰" sub="MXN"       prev={vp.ingresos} curr={v.ingresos} delay={0}/>
        <KPI label="Ordenes"          value={N(v.ordenes)}   color={T.blue}  icon="📦"                  prev={vp.ordenes}  curr={v.ordenes}  delay={60}/>
        <KPI label="Ticket promedio"  value={$(v.ingresos&&v.ordenes ? Math.round(v.ingresos/v.ordenes) : null)} color={T.gold} icon="🎯" prev={vp.ingresos&&vp.ordenes?Math.round(vp.ingresos/vp.ordenes):null} curr={v.ingresos&&v.ordenes?Math.round(v.ingresos/v.ordenes):null} delay={120}/>
      </div>

      <div className="grid-31">
        <Card delay={80}>
          <SLabel accent={T.blue}>Ingresos por servicio</SLabel>
          {topSvcs.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topSvcs} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} horizontal={false}/>
                <XAxis type="number" tick={{ fill:T.textMid, fontSize:10 }} tickFormatter={v => $(v)}/>
                <YAxis dataKey="name" type="category" tick={{ fill:T.text, fontSize:11 }} width={92}/>
                <Tooltip content={<TTip/>}/>
                <Bar dataKey="valor" name="Ingresos" radius={[0,6,6,0]}>
                  {topSvcs.map((_,i) => <Cell key={i} fill={CH[i % CH.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <Empty/>}
        </Card>

        <Card delay={140}>
          <SLabel accent={T.teal}>Participacion por servicio</SLabel>
          {topSvcs.length && v.ingresos ? (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {topSvcs.slice(0,7).map((s,i) => {
                const pct = (s.valor / v.ingresos * 100).toFixed(1);
                return (
                  <div key={i}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ color:T.text, fontSize:12, fontWeight:500 }}>{s.name}</span>
                      <span style={{ color:CH[i%CH.length], fontSize:12, fontWeight:700 }}>{$(s.valor)}</span>
                    </div>
                    <div style={{ height:5, background:T.border, borderRadius:3 }}>
                      <div style={{ height:"100%", width:`${pct}%`, background:CH[i%CH.length], borderRadius:3, transition:"width 0.8s ease" }}/>
                    </div>
                    <div style={{ color:T.textDim, fontSize:10, marginTop:2 }}>{pct}%</div>
                  </div>
                );
              })}
            </div>
          ) : <Empty/>}
        </Card>
      </div>

      <Card delay={180}>
        <SLabel accent={T.green}>Tendencia de ingresos</SLabel>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="gIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={T.green} stopOpacity={0.25}/>
                <stop offset="95%" stopColor={T.green} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
            <XAxis dataKey="mes" tick={{ fill:T.textMid, fontSize:11 }}/>
            <YAxis tick={{ fill:T.textMid, fontSize:10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`}/>
            <Tooltip content={<TTip/>}/>
            <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke={T.green} fill="url(#gIngresos)" strokeWidth={2.5} dot={{ r:4, fill:T.green }}/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

// ─── TAB WHATSAPP ─────────────────────────────────────────────────────────────
function TabWhatsApp({ d, prev, months, byMonth }) {
  const w  = d.whatsapp || {};
  const v  = d.ventas   || {};
  const wp = prev?.whatsapp || {};
  const vp = prev?.ventas   || {};

  const ingMsg  = w.mensajes && v.ingresos ? Math.round(v.ingresos / w.mensajes) : null;
  const pingMsg = wp.mensajes && vp.ingresos ? Math.round(vp.ingresos / wp.mensajes) : null;

  const trendData = months.map(m => ({
    mes:      byMonth[m]?.label?.slice(0,3) || m,
    mensajes: byMonth[m]?.whatsapp?.mensajes  ?? 0,
    intencion:byMonth[m]?.whatsapp?.intencion ?? 0,
    tasaConv: byMonth[m]?.whatsapp?.tasaConv  ?? 0,
  }));

  const funnel = [
    { name:"Mensajes totales",   value: w.mensajes  ?? 0, fill:T.blue  },
    { name:"Con intencion",      value: w.intencion ?? 0, fill:T.teal  },
    { name:"Ventas confirmadas", value: w.ventas    ?? 0, fill:T.green },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div className="grid-4">
        <KPI label="Mensajes totales"    value={N(w.mensajes)}    color={T.blue}  icon="💬" prev={wp.mensajes}    curr={w.mensajes}    delay={0}/>
        <KPI label="Promedio diario"     value={w.promedioDiario ?? "—"} color={T.cyan}  icon="📊" prev={wp.promedioDiario} curr={w.promedioDiario} delay={60}/>
        <KPI label="Con intencion"       value={N(w.intencion)}   color={T.gold}  icon="🎯" sub="conversaciones"  prev={wp.intencion}   curr={w.intencion}   delay={120}/>
        <KPI label="Tasa de conversion"  value={Pct(w.tasaConv)}  color={T.green} icon="✅" prev={wp.tasaConv}    curr={w.tasaConv}    delay={180}/>
      </div>
      <div className="grid-4">
        <KPI label="T. primera respuesta" value={w.t1Resp != null ? `${w.t1Resp} min` : "—"} color={w.t1Resp!=null&&w.t1Resp<=20 ? T.green : T.gold} icon="⏱" prev={wp.t1Resp} curr={w.t1Resp} inverse delay={240}/>
        <KPI label="Duracion conv."        value={w.tConvActiva != null ? `${w.tConvActiva} min` : "—"} color={T.teal} icon="🕐" delay={300}/>
        <KPI label="% con intencion"       value={Pct(w.pctIntencion)} color={T.blue} icon="📐" prev={wp.pctIntencion} curr={w.pctIntencion} delay={360}/>
        <KPI label="Ingreso x mensaje"     value={ingMsg ? `$${N(ingMsg)}` : "—"} color={T.green} icon="💵" prev={pingMsg} curr={ingMsg} delay={420}/>
      </div>

      <div className="grid-2">
        <Card delay={100}>
          <SLabel accent={T.teal}>Embudo de conversion</SLabel>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {funnel.map((f,i) => {
              const pct = funnel[0].value ? (f.value / funnel[0].value * 100).toFixed(1) : 0;
              return (
                <div key={i} style={{ background:`${f.fill}0e`, border:`1px solid ${f.fill}28`, borderRadius:10, padding:"14px 16px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ color:T.textMid, fontSize:12 }}>{f.name}</span>
                    <span style={{ color:f.fill, fontWeight:800, fontSize:18, fontFamily:"'Space Grotesk',sans-serif" }}>{N(f.value)}</span>
                  </div>
                  <div style={{ height:4, background:T.border, borderRadius:2 }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:f.fill, borderRadius:2, transition:"width 0.9s ease" }}/>
                  </div>
                  <span style={{ color:T.textDim, fontSize:10, marginTop:4, display:"block" }}>{pct}% del total</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card delay={160}>
          <SLabel accent={T.blue}>Tendencia mensual WA</SLabel>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
              <XAxis dataKey="mes" tick={{ fill:T.textMid, fontSize:11 }}/>
              <YAxis tick={{ fill:T.textMid, fontSize:10 }}/>
              <Tooltip content={<TTip/>}/>
              <Legend wrapperStyle={{ color:T.textMid, fontSize:11 }}/>
              <Line type="monotone" dataKey="mensajes"  name="Mensajes"  stroke={T.blue}  strokeWidth={2.5} dot={{ r:4, fill:T.blue }}/>
              <Line type="monotone" dataKey="intencion" name="Intencion" stroke={T.teal}  strokeWidth={2.5} dot={{ r:4, fill:T.teal }}/>
              <Line type="monotone" dataKey="tasaConv"  name="Conv %"    stroke={T.green} strokeWidth={2}   dot={{ r:3, fill:T.green }} strokeDasharray="4 3"/>
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

// ─── TAB REDES ────────────────────────────────────────────────────────────────
function TabRedes({ d, prev, months, byMonth }) {
  const r   = d.redes || {};
  const ig  = r.ig || {};
  const fb  = r.fb || {};
  const rp  = prev?.redes || {};
  const igp = rp.ig || {};
  const fbp = rp.fb || {};

  const totalVis   = (ig.vis??0)       + (fb.vis??0);
  const totalSeg   = (ig.segNuevos??0) + (fb.segNuevos??0);
  const totalClics = (ig.clics??0)     + (fb.clics??0);
  const totalAlc   = (ig.alcance??0)   + (fb.alcance??0);
  const prevVis    = (igp.vis??0)      + (fbp.vis??0);
  const prevSeg    = (igp.segNuevos??0)+ (fbp.segNuevos??0);

  const trendData = months.map(m => {
    const ri = byMonth[m]?.redes?.ig || {};
    const rf = byMonth[m]?.redes?.fb || {};
    return {
      mes:    byMonth[m]?.label?.slice(0,3) || m,
      ig_seg: ri.segNuevos ?? 0,
      fb_seg: rf.segNuevos ?? 0,
      ig_vis: ri.vis ?? 0,
      fb_vis: rf.vis ?? 0,
    };
  });

  const platforms = [
    { label:"Instagram", color:T.gold, data:[["Visualizaciones",ig.vis],["Alcance",ig.alcance],["Interacciones",ig.inter],["Seg. nuevos",ig.segNuevos],["Visitas perfil",ig.visitas],["Clics",ig.clics]] },
    { label:"Facebook",  color:T.blue, data:[["Visualizaciones",fb.vis],["Alcance",fb.alcance],["Interacciones",fb.inter],["Seg. nuevos",fb.segNuevos],["Visitas perfil",fb.visitas],["Clics",fb.clics]] },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div className="grid-4">
        <KPI label="Visualizaciones totales" value={N(totalVis)}   color={T.blue}  icon="👁"  prev={prevVis}  curr={totalVis}   delay={0}/>
        <KPI label="Alcance combinado"        value={N(totalAlc)}   color={T.teal}  icon="📡"                   delay={60}/>
        <KPI label="Seguidores nuevos"        value={N(totalSeg)}   color={T.green} icon="👥"  prev={prevSeg}  curr={totalSeg}   delay={120}/>
        <KPI label="Clics totales"            value={N(totalClics)} color={T.gold}  icon="🔗"                   delay={180}/>
      </div>

      <div className="grid-2">
        <Card delay={80}>
          <SLabel accent={T.blue}>Seguidores nuevos</SLabel>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
              <XAxis dataKey="mes" tick={{ fill:T.textMid, fontSize:11 }}/>
              <YAxis tick={{ fill:T.textMid, fontSize:10 }}/>
              <Tooltip content={<TTip/>}/>
              <Legend wrapperStyle={{ color:T.textMid, fontSize:11 }}/>
              <Bar dataKey="ig_seg" name="Instagram" fill={T.gold} radius={[4,4,0,0]}/>
              <Bar dataKey="fb_seg" name="Facebook"  fill={T.blue} radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card delay={140}>
          <SLabel accent={T.teal}>Visualizaciones</SLabel>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
              <XAxis dataKey="mes" tick={{ fill:T.textMid, fontSize:11 }}/>
              <YAxis tick={{ fill:T.textMid, fontSize:10 }} tickFormatter={v => v>=1000 ? `${(v/1000).toFixed(0)}k` : v}/>
              <Tooltip content={<TTip/>}/>
              <Legend wrapperStyle={{ color:T.textMid, fontSize:11 }}/>
              <Bar dataKey="ig_vis" name="Instagram" fill={T.gold} radius={[4,4,0,0]}/>
              <Bar dataKey="fb_vis" name="Facebook"  fill={T.blue} radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid-2">
        {platforms.map(({ label, color, data }) => (
          <Card key={label} delay={180}>
            <SLabel accent={color}>{label}</SLabel>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {data.map(([k,v],i) => (
                <div key={i} style={{ background:T.surfaceUp, borderRadius:8, padding:"10px 12px" }}>
                  <div style={{ color:T.textDim, fontSize:10, marginBottom:4, textTransform:"uppercase", letterSpacing:"0.06em" }}>{k}</div>
                  <div style={{ color: v!=null ? T.text : T.textDim, fontWeight: v!=null ? 700 : 400, fontSize:16, fontFamily:"'Space Grotesk',sans-serif" }}>
                    {v!=null ? N(v) : "—"}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── TAB ADS ──────────────────────────────────────────────────────────────────
function TabAds({ d, prev, months, byMonth }) {
  const a  = d.ads  || {};
  const ap = prev?.ads || {};

  const hasData = (a.inversion ?? 0) > 0;

  const roasData = [
    { name:"Inversion",         value: a.inversion         ?? 0, fill:T.red   },
    { name:"Ingresos directos", value: a.ingresosDirectos  ?? 0, fill:T.blue  },
    { name:"Ingresos estimados",value: a.ingresosEstimados ?? 0, fill:T.green },
  ];

  const trendAds = months.map(m => ({
    mes:       byMonth[m]?.label?.slice(0,3) || m,
    inversion: byMonth[m]?.ads?.inversion    ?? 0,
    clics:     byMonth[m]?.ads?.clics        ?? 0,
  }));

  const metrics = [
    { label:"CTR estimado",      val: a.clics&&a.alcance ? Pct(a.clics/a.alcance*100) : "—",                                                                   color:T.blue   },
    { label:"Conv. / Clics",     val: a.clics&&a.conversaciones ? Pct(a.conversaciones/a.clics*100) : "—",                                                     color:T.teal   },
    { label:"Ventas / Conv.",    val: a.conversaciones&&a.ventasDirectas ? Pct(a.ventasDirectas/a.conversaciones*100) : "—",                                    color:T.green  },
    { label:"ROI neto estimado", val: a.inversion&&a.ingresosEstimados ? `${(((a.ingresosEstimados-a.inversion)/a.inversion)*100).toFixed(0)}%` : "—",         color:T.gold   },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      {!hasData && (
        <Card delay={0} style={{ background:`${T.gold}10`, border:`1px solid ${T.gold}30`, padding:"14px 18px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:18 }}>⚠️</span>
            <span style={{ color:T.gold, fontSize:13, fontWeight:600 }}>Sin campana activa este mes. Los valores de retorno aparecen en cero.</span>
          </div>
        </Card>
      )}

      <div className="grid-4">
        <KPI label="Inversion total"  value={$(a.inversion)}      color={T.gold}   icon="💸" sub={a.plataforma} prev={ap.inversion}      curr={a.inversion}      delay={0}/>
        <KPI label="Alcance Ads"      value={N(a.alcance)}         color={T.blue}   icon="📡"                    delay={60}/>
        <KPI label="Clics generados"  value={N(a.clics)}           color={T.cyan}   icon="👆"                    prev={ap.clics}           curr={a.clics}           delay={120}/>
        <KPI label="Conversaciones"   value={N(a.conversaciones)}  color={T.teal}   icon="💬"                    prev={ap.conversaciones}  curr={a.conversaciones}  delay={180}/>
      </div>
      <div className="grid-4">
        <KPI label="Costo por conv."  value={a.costoPorConv ? `$${Number(a.costoPorConv).toFixed(2)}` : "—"} color={T.red}    icon="💲" prev={ap.costoPorConv}  curr={a.costoPorConv}  inverse delay={240}/>
        <KPI label="Ventas directas"  value={N(a.ventasDirectas)}  color={T.green}  icon="✅"                    prev={ap.ventasDirectas}  curr={a.ventasDirectas}  delay={300}/>
        <KPI label="ROAS directo"     value={a.roasDirecto  ? `${Number(a.roasDirecto).toFixed(1)}x`  : "—"} color={T.teal}   icon="⚡" prev={ap.roasDirecto}    curr={a.roasDirecto}    delay={360}/>
        <KPI label="ROAS estimado"    value={a.roasEstimado ? `${Number(a.roasEstimado).toFixed(1)}x` : "—"} color={T.purple} icon="🚀" prev={ap.roasEstimado}   curr={a.roasEstimado}   delay={420}/>
      </div>

      <div className="grid-2">
        <Card delay={100}>
          <SLabel accent={T.green}>Inversion vs retorno</SLabel>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={roasData}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
              <XAxis dataKey="name" tick={{ fill:T.textMid, fontSize:11 }}/>
              <YAxis tick={{ fill:T.textMid, fontSize:10 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`}/>
              <Tooltip content={<TTip/>}/>
              <Bar dataKey="value" name="Monto" radius={[6,6,0,0]}>
                {roasData.map((e,i) => <Cell key={i} fill={e.fill}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card delay={160}>
          <SLabel accent={T.gold}>Rendimiento</SLabel>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:18 }}>
            {metrics.map((m,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:T.surfaceUp, borderRadius:10, padding:"12px 16px" }}>
                <span style={{ color:T.textMid, fontSize:12 }}>{m.label}</span>
                <span style={{ color:m.color, fontWeight:800, fontSize:18, fontFamily:"'Space Grotesk',sans-serif" }}>{m.val}</span>
              </div>
            ))}
          </div>
          <SLabel accent={T.blue}>Evolucion mensual</SLabel>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={trendAds}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border}/>
              <XAxis dataKey="mes" tick={{ fill:T.textMid, fontSize:10 }}/>
              <YAxis tick={{ fill:T.textMid, fontSize:9 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`}/>
              <Tooltip content={<TTip/>}/>
              <Line type="monotone" dataKey="inversion" name="Inversion" stroke={T.gold} strokeWidth={2} dot={{ r:3 }}/>
              <Line type="monotone" dataKey="clics"     name="Clics"     stroke={T.blue} strokeWidth={2} dot={{ r:3 }}/>
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

// ─── TAB INSIGHTS ─────────────────────────────────────────────────────────────
function TabInsights({ d, prev }) {
  const v  = d.ventas   || {};
  const w  = d.whatsapp || {};
  const a  = d.ads      || {};
  const vp = prev?.ventas   || {};
  const wp = prev?.whatsapp || {};

  const items = [];

  if (w.tasaConv != null) {
    if (w.tasaConv < 15)
      items.push({ color:T.red,    icon:"🔴", cat:"WhatsApp", title:"Conversion critica",    body:`Tasa de ${Pct(w.tasaConv)}, por debajo del 15%. Revisar guion de ventas y velocidad de seguimiento.` });
    else if (w.tasaConv < 25)
      items.push({ color:T.gold,   icon:"🟡", cat:"WhatsApp", title:"Conversion moderada",   body:`Conversion de ${Pct(w.tasaConv)}. Hay margen. Un catalogo de precios visible o automatizacion puede impulsar el cierre.` });
    else
      items.push({ color:T.green,  icon:"🟢", cat:"WhatsApp", title:"Conversion saludable",  body:`Conversion de ${Pct(w.tasaConv)}: por encima del benchmark. Documentar el guion actual para el equipo.` });
  }
  if (w.t1Resp != null) {
    if (w.t1Resp > 30)
      items.push({ color:T.red,    icon:"🔴", cat:"WhatsApp", title:"Tiempo de respuesta alto",       body:`Primera respuesta en ${w.t1Resp} min. Clientes pierden interes rapidamente. Implementar respuesta automatica.` });
    else if (w.t1Resp > 10)
      items.push({ color:T.gold,   icon:"🟡", cat:"WhatsApp", title:"Tiempo de respuesta mejorable",  body:`${w.t1Resp} minutos. Meta: menos de 5 min para maximizar conversion.` });
    else
      items.push({ color:T.green,  icon:"🟢", cat:"WhatsApp", title:"Tiempo de respuesta optimo",     body:`Respuesta en ${w.t1Resp} min. Excelente. Habilitar respuesta automatica fuera de horario.` });
  }
  if (v.ingresos && w.mensajes) {
    const ipm = v.ingresos / w.mensajes;
    if (ipm < 400)
      items.push({ color:T.red,    icon:"🔴", cat:"Eficiencia", title:"Ingreso por mensaje bajo",  body:`$${Math.round(ipm)} por mensaje. Muchas conversaciones no convierten. Calificar mejor los prospectos.` });
    else if (ipm < 800)
      items.push({ color:T.gold,   icon:"🟡", cat:"Eficiencia", title:"Ingreso por mensaje medio", body:`$${Math.round(ipm)} por mensaje. Aceptable. Subir ticket con paquetes o combos de servicios.` });
    else
      items.push({ color:T.green,  icon:"🟢", cat:"Eficiencia", title:"Ingreso por mensaje alto",  body:`$${Math.round(ipm)} por mensaje. Canal muy eficiente. Escalar el volumen de conversaciones.` });
  }
  if ((a.inversion ?? 0) > 0) {
    const roas = a.roasEstimado ?? 0;
    if (roas < 2)
      items.push({ color:T.red,    icon:"🔴", cat:"Ads", title:"ROAS bajo",        body:`ROAS de ${roas.toFixed(1)}x. La campana no cubre con margen. Revisar segmentacion y creativos.` });
    else if (roas < 5)
      items.push({ color:T.gold,   icon:"🟡", cat:"Ads", title:"ROAS moderado",    body:`ROAS de ${roas.toFixed(1)}x. Rentable. Optimizar audiencias y horarios de publicacion.` });
    else
      items.push({ color:T.green,  icon:"🟢", cat:"Ads", title:"ROAS excelente",   body:`ROAS de ${roas.toFixed(1)}x. Campana muy rentable. Aumentar presupuesto para escalar.` });

    const cpc = a.costoPorConv ?? 0;
    if (cpc > 50)
      items.push({ color:T.red,    icon:"🔴", cat:"Ads", title:"Costo por conv. alto",        body:`$${cpc.toFixed(2)} por conversacion. Revisar objetivo y CTA de la campana.` });
    else if (cpc > 20)
      items.push({ color:T.gold,   icon:"🟡", cat:"Ads", title:"Costo por conv. mejorable",   body:`$${cpc.toFixed(2)} por conversacion. Rango aceptable. Probar variantes de anuncio.` });
    else if (cpc > 0)
      items.push({ color:T.green,  icon:"🟢", cat:"Ads", title:"Costo por conv. eficiente",   body:`$${cpc.toFixed(2)} por conversacion. Eficiente. Mantener configuracion actual.` });
  } else {
    items.push({ color:T.textMid, icon:"⚪", cat:"Ads", title:"Sin campana activa", body:"No se invirtio en publicidad. Una campana inicial de $1,000–$1,500 MXN puede generar trafico calificado." });
  }
  if (vp.ingresos && v.ingresos) {
    const chg = Chg(vp.ingresos, v.ingresos);
    if (chg != null) {
      if (chg < 0)
        items.push({ color:T.red,   icon:"🔴", cat:"Ventas", title:"Ingresos en caida",    body:`Ingresos bajaron ${Math.abs(chg).toFixed(1)}%. Revisar si es estacionalidad o perdida de demanda.` });
      else if (chg < 10)
        items.push({ color:T.gold,  icon:"🟡", cat:"Ventas", title:"Crecimiento lento",    body:`Crecimiento de ${chg.toFixed(1)}%. Activar Ads o campana de reactivacion de clientes.` });
      else
        items.push({ color:T.green, icon:"🟢", cat:"Ventas", title:"Crecimiento positivo", body:`Ingresos crecieron ${chg.toFixed(1)}% vs mes anterior. Identificar que lo impulso y replicarlo.` });
    }
  }

  if (!items.length) return <Empty msg="Sin suficientes datos para generar insights"/>;

  const cats = [...new Set(items.map(x => x.cat))];
  const prioColors = { "🔴":T.red, "🟡":T.gold, "🟢":T.green, "⚪":T.textMid };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <Card delay={0} style={{ padding:"14px 20px" }}>
        <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
          {[["🔴","Alertas criticas",T.red],["🟡","Oportunidades",T.gold],["🟢","Puntos fuertes",T.green]].map(([ic,lb,cl]) => (
            <div key={lb} style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:20 }}>{ic}</span>
              <div>
                <div style={{ fontSize:22, fontWeight:800, color:cl, fontFamily:"'Space Grotesk',sans-serif" }}>{items.filter(x=>x.icon===ic).length}</div>
                <div style={{ fontSize:11, color:T.textDim }}>{lb}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {cats.map(cat => (
        <div key={cat}>
          <div style={{ color:T.textDim, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8, marginLeft:4 }}>{cat}</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {items.filter(x => x.cat===cat).map((ins,i) => (
              <Card key={i} delay={i*50} style={{ padding:"16px 20px", borderLeft:`3px solid ${ins.color}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <span style={{ fontSize:15 }}>{ins.icon}</span>
                  <span style={{ color:ins.color, fontWeight:700, fontSize:14 }}>{ins.title}</span>
                  <Badge color={ins.color}>{ins.cat}</Badge>
                </div>
                <p style={{ color:T.textMid, fontSize:13, lineHeight:1.7, margin:0 }}>{ins.body}</p>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── TAB DECISIONES ───────────────────────────────────────────────────────────
function TabDecisiones({ d, prev }) {
  const v  = d.ventas    || {};
  const w  = d.whatsapp  || {};
  const a  = d.ads       || {};
  const sv = d.servicios || [];
  const vp = prev?.ventas || {};

  const topSvc = [...sv].sort((a,b) => b.valor - a.valor)[0];
  const ingMsg = w.mensajes && v.ingresos ? Math.round(v.ingresos / w.mensajes) : 0;

  const decs = [];

  if ((a.roasEstimado??0) >= 5 && (a.costoPorConv??0) < 25 && (a.inversion??0) > 0) {
    decs.push({ prioridad:"ALTA", color:T.green, icon:"📣", titulo:"Escalar presupuesto Meta Ads", desc:`ROAS de ${Number(a.roasEstimado).toFixed(1)}x y costo de $${Number(a.costoPorConv).toFixed(2)} por conversion confirman una campana eficiente. Incrementar inversion un 50–100%.`, accion:`Subir de ${$(a.inversion)} a aprox. ${$(Math.round((a.inversion??0)*1.75))} MXN el proximo mes.` });
  } else if (!(a.inversion??0)) {
    decs.push({ prioridad:"ALTA", color:T.gold, icon:"📣", titulo:"Activar primera campana Meta Ads", desc:"Sin inversion publicitaria este mes. Una campana segmentada puede duplicar el flujo de prospectos desde redes.", accion:"Iniciar con $1,200–$1,500 MXN. Objetivo: mensajes a WhatsApp. Audiencia: similar a clientes actuales." });
  }

  if ((w.t1Resp??0) > 15) {
    decs.push({ prioridad:"ALTA", color:T.red, icon:"⏱", titulo:"Reducir tiempo de respuesta en WhatsApp", desc:`${w.t1Resp} minutos de primera respuesta. Por encima de 10 min la tasa de cierre cae significativamente.`, accion:"Activar mensaje automatico con menu: precios, servicios, cotizacion. Meta: respuesta en menos de 5 min." });
  }

  if ((w.tasaConv??0) < 20) {
    decs.push({ prioridad:"MEDIA", color:T.gold, icon:"📝", titulo:"Mejorar guion de conversion", desc:`Conversion de ${Pct(w.tasaConv)} por debajo del objetivo. Posibles causas: precio no visible, sin urgencia, sin cierre explicito.`, accion:"Revisar los ultimos 10 chats sin cierre. Identificar punto de abandono. Agregar CTA directa al final de cada respuesta." });
  }

  if (topSvc) {
    decs.push({ prioridad:"MEDIA", color:T.blue, icon:"🏆", titulo:`Reforzar servicio lider: ${topSvc.name}`, desc:`${topSvc.name} genero ${$(topSvc.valor)} este mes, siendo el servicio de mayor ingreso.`, accion:`Publicar 2–3 casos de exito de ${topSvc.name} en redes. Crear oferta de paquete con servicio complementario.` });
  }

  if (ingMsg > 800) {
    decs.push({ prioridad:"MEDIA", color:T.teal, icon:"💬", titulo:"Escalar volumen de conversaciones", desc:`$${ingMsg.toLocaleString("es-MX")} de ingreso por mensaje. Canal WhatsApp altamente eficiente.`, accion:"Incluir boton directo a WhatsApp en todos los anuncios, stories y bio de IG/FB." });
  }

  decs.push({ prioridad:"BAJA", color:T.purple, icon:"📊", titulo:"Documentar metricas como baseline", desc:"Con tres meses de datos es posible establecer promedios mensuales de referencia para detectar anomalias rapidamente.", accion:"Registrar ticket promedio, ingreso por mensaje y ROAS como KPIs objetivo para el siguiente trimestre." });

  const prioOrder = { ALTA:0, MEDIA:1, BAJA:2 };
  decs.sort((a,b) => prioOrder[a.prioridad] - prioOrder[b.prioridad]);
  const prioColors = { ALTA:T.red, MEDIA:T.gold, BAJA:T.purple };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {decs.map((dec,i) => (
        <Card key={i} delay={i*55} style={{ padding:"18px 22px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12, flexWrap:"wrap", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:18 }}>{dec.icon}</span>
              <span style={{ color:dec.color, fontWeight:700, fontSize:14 }}>{dec.titulo}</span>
            </div>
            <Badge color={prioColors[dec.prioridad]}>PRIORIDAD {dec.prioridad}</Badge>
          </div>
          <p style={{ color:T.textMid, fontSize:13, lineHeight:1.7, marginBottom:12 }}>{dec.desc}</p>
          <div style={{ background:`${dec.color}0d`, border:`1px solid ${dec.color}25`, borderRadius:8, padding:"10px 14px", display:"flex", alignItems:"flex-start", gap:10 }}>
            <span style={{ color:dec.color, fontSize:12, flexShrink:0, marginTop:1 }}>▶</span>
            <span style={{ color:T.text, fontSize:12, lineHeight:1.6 }}>{dec.accion}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,     setTab]     = useState("resumen");
  const [mes,     setMes]     = useState(null);
  const [DATA,    setDATA]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [err,     setErr]     = useState(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("monthly_reports")
        .select("*")
        .order("month", { ascending: true });

      if (error) { setErr(error.message); setLoading(false); return; }
      if (!data?.length) { setErr("No hay datos en monthly_reports."); setLoading(false); return; }

      const months  = data.map(r => r.month);
      const labels  = Object.fromEntries(data.map(r => [r.month, r.label]));
      const byMonth = Object.fromEntries(data.map(r => [r.month, {
        label:    r.label,
        ventas:   r.ventas,
        servicios:r.servicios,
        whatsapp: r.whatsapp,
        redes:    r.redes,
        ads:      r.ads ?? null,
      }]));

      setDATA({ months, labels, byMonth });
      setMes(months[months.length - 1]);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:T.bg }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:36, height:36, border:`3px solid ${T.border}`, borderTop:`3px solid ${T.blue}`, borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }}/>
        <div style={{ color:T.textMid, fontSize:13, letterSpacing:"0.06em", fontFamily:"system-ui,sans-serif" }}>CARGANDO DATOS...</div>
      </div>
    </div>
  );

  if (err) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:T.bg, flexDirection:"column", gap:12 }}>
      <div style={{ fontSize:32 }}>⚠️</div>
      <div style={{ color:T.red, fontSize:14, fontWeight:600, fontFamily:"system-ui,sans-serif" }}>Error de conexion</div>
      <div style={{ color:T.textMid, fontSize:12, maxWidth:360, textAlign:"center", fontFamily:"system-ui,sans-serif" }}>{err}</div>
    </div>
  );

  if (!DATA || !mes) return null;

  const { months, labels, byMonth } = DATA;
  const curIdx  = months.indexOf(mes);
  const curData = byMonth[mes] || {};
  const prevData = curIdx > 0 ? byMonth[months[curIdx - 1]] : null;

  const sharedProps = { d:curData, prev:prevData, months, byMonth };

  const tabContent = {
    resumen:    <TabResumen    {...sharedProps}/>,
    ventas:     <TabVentas     {...sharedProps}/>,
    whatsapp:   <TabWhatsApp   {...sharedProps}/>,
    redes:      <TabRedes      {...sharedProps}/>,
    ads:        <TabAds        {...sharedProps}/>,
    insights:   <TabInsights   d={curData} prev={prevData}/>,
    decisiones: <TabDecisiones d={curData} prev={prevData}/>,
  };

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ minHeight:"100vh", background:T.bg, fontFamily:"'Inter',system-ui,sans-serif", color:T.text }}>

        {/* HEADER */}
        <header style={{
          background: `linear-gradient(90deg,${T.surface},${T.surfaceUp})`,
          borderBottom:`1px solid ${T.border}`,
          padding:"0 28px",
          position:"sticky", top:0, zIndex:100,
          backdropFilter:"blur(20px)",
        }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", height:60, gap:12, flexWrap:"wrap" }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{
                width:36, height:36, borderRadius:10,
                background:`linear-gradient(135deg,${T.blue},${T.teal})`,
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:`0 0 20px ${T.blue}50`,
                fontSize:16, fontWeight:900, color:"#fff", flexShrink:0,
                fontFamily:"'Space Grotesk',sans-serif",
              }}>B</div>
              <div>
                <div style={{ fontSize:14, fontWeight:800, color:T.white, letterSpacing:"0.05em", fontFamily:"'Space Grotesk',sans-serif" }}>
                  CENTRO DE CONTROL COMERCIAL
                </div>
                <div style={{ fontSize:10, color:T.textDim, letterSpacing:"0.08em" }}>
                  BordaXpress · Panel Ejecutivo
                </div>
              </div>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ color:T.textDim, fontSize:10, letterSpacing:"0.08em", textTransform:"uppercase" }}>Periodo</span>
              <div style={{ display:"flex", background:`${T.border}66`, borderRadius:8, padding:3, gap:2 }}>
                {months.map(m => (
                  <button key={m} className="month-btn" onClick={() => setMes(m)} style={{
                    background: mes===m ? T.blue : "transparent",
                    color: mes===m ? T.white : T.textMid,
                    border:"none", borderRadius:6, padding:"5px 14px",
                    fontSize:12, fontWeight:700, cursor:"pointer",
                    boxShadow: mes===m ? `0 2px 10px ${T.blue}50` : "none",
                    fontFamily:"'Inter',sans-serif",
                  }}>
                    {labels[m]}
                  </button>
                ))}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:T.green, animation:"pulse 2s infinite" }}/>
                <span style={{ color:T.textDim, fontSize:10, letterSpacing:"0.06em" }}>EN VIVO</span>
              </div>
            </div>
          </div>

          <div style={{ display:"flex", overflowX:"auto" }}>
            {TABS.map(t => (
              <button key={t.id} className="tab-btn" onClick={() => setTab(t.id)} style={{
                background:"transparent",
                color: tab===t.id ? T.white : T.textMid,
                border:"none",
                borderBottom:`2px solid ${tab===t.id ? T.blue : "transparent"}`,
                padding:"10px 16px 9px",
                fontSize:12, fontWeight: tab===t.id ? 700 : 400,
                cursor:"pointer", whiteSpace:"nowrap",
                display:"flex", alignItems:"center", gap:6,
                letterSpacing:"0.02em",
                fontFamily:"'Inter',sans-serif",
              }}>
                <span style={{ opacity: tab===t.id ? 1 : 0.5 }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </header>

        {/* CONTENT */}
        <main style={{ maxWidth:1200, margin:"0 auto", padding:"24px 20px 60px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18, flexWrap:"wrap" }}>
            <span style={{ color:T.textDim, fontSize:11 }}>BordaXpress CCC</span>
            <span style={{ color:T.border, fontSize:11 }}>›</span>
            <span style={{ color:T.blue, fontSize:11, fontWeight:600 }}>{TABS.find(t => t.id===tab)?.label}</span>
            <span style={{ color:T.border, fontSize:11 }}>›</span>
            <span style={{ color:T.textDim, fontSize:11 }}>{labels[mes]}</span>
            {prevData && <Badge color={T.textDim} style={{ fontSize:10 }}>vs {labels[months[curIdx-1]]}</Badge>}
          </div>

          <div key={`${tab}-${mes}`} className="fade-in">
            {tabContent[tab]}
          </div>
        </main>

        {/* FOOTER */}
        <footer style={{ borderTop:`1px solid ${T.border}`, padding:"14px 28px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
          <span style={{ color:T.textDim, fontSize:11 }}>BordaXpress CCC · Uso interno · Direccion General</span>
          <span style={{ color:T.textDim, fontSize:11 }}>Ultimo dato: {labels[months[months.length-1]]}</span>
        </footer>
      </div>
    </>
  );
}
