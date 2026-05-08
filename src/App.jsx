import { useState, useEffect } from “react”;
import {
BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
AreaChart, Area, ComposedChart
} from “recharts”;
import { createClient } from “@supabase/supabase-js”;

const supabase = createClient(
import.meta.env.VITE_SUPABASE_URL,
import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ─── TOKENS ───────────────────────────────────────────────────────────────────
const T = {
bg:         “#070C16”,
surface:    “#0C1322”,
surfaceUp:  “#101929”,
surfaceMid: “#0F1826”,
border:     “#182030”,
borderSub:  “#1A2538”,
blue:       “#3B82F6”,
blueSoft:   “#2563EB”,
teal:       “#14B8A6”,
green:      “#10B981”,
gold:       “#F59E0B”,
red:        “#F43F5E”,
purple:     “#A78BFA”,
cyan:       “#22D3EE”,
text:       “#E8EDF5”,
textMid:    “#8B98B4”,
textDim:    “#3E4F68”,
white:      “#FFFFFF”,
accent:     “#1D4ED8”,
};

const CH = [”#3B82F6”,”#14B8A6”,”#F59E0B”,”#10B981”,”#F43F5E”,”#A78BFA”,”#22D3EE”,”#FB923C”];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const $   = (n) => n == null ? “—” : `$${Number(n).toLocaleString("es-MX",{minimumFractionDigits:0,maximumFractionDigits:0})}`;
const N   = (n) => n == null ? “—” : Number(n).toLocaleString(“es-MX”);
const Pct = (n) => n == null ? “—” : `${Number(n).toFixed(1)}%`;
const Chg = (a,b) => (a==null||b==null||a===0) ? null : (((b-a)/a)*100);

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const STYLES = `
@import url(‘https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap’);

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 16px; }
body {
background: #070C16;
color: #E8EDF5;
font-family: ‘Inter’, -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
-webkit-font-smoothing: antialiased;
line-height: 1.5;
}

::-webkit-scrollbar { width: 3px; height: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #182030; border-radius: 2px; }

@keyframes fadeUp {
from { opacity: 0; transform: translateY(12px); }
to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
@keyframes pulseGreen { 0%,100% { opacity:1; box-shadow: 0 0 0 0 #10B98144; } 60% { opacity:.7; box-shadow: 0 0 0 4px #10B98100; } }
@keyframes spin { to { transform: rotate(360deg); } }

.fade-up  { animation: fadeUp  0.4s cubic-bezier(.22,.68,0,1.2) both; }
.fade-in  { animation: fadeIn  0.28s ease both; }

.surface-card {
background: #0C1322;
border: 1px solid #182030;
border-radius: 16px;
transition: border-color 0.2s, box-shadow 0.2s;
}
.surface-card:hover { border-color: #1A2538; }

.kpi-card {
background: #0C1322;
border: 1px solid #182030;
border-radius: 14px;
padding: 22px 24px;
position: relative;
overflow: hidden;
transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
cursor: default;
}
.kpi-card:hover {
border-color: #243354;
transform: translateY(-1px);
box-shadow: 0 8px 28px #00000055;
}

.tab-pill {
display: flex; align-items: center; gap: 7px;
padding: 8px 18px;
border-radius: 8px;
font-size: 13px; font-weight: 500;
font-family: ‘Inter’, sans-serif;
cursor: pointer;
border: none;
background: transparent;
white-space: nowrap;
transition: background 0.15s, color 0.15s;
letter-spacing: 0.01em;
}
.tab-pill:hover { background: #101929; }
.tab-pill.active {
background: #182030;
font-weight: 700;
color: #E8EDF5 !important;
}

.month-chip {
padding: 5px 15px;
border-radius: 6px;
font-size: 12px; font-weight: 600;
font-family: ‘Inter’, sans-serif;
cursor: pointer;
border: none;
transition: background 0.15s, color 0.15s;
letter-spacing: 0.02em;
}
.month-chip.active { background: #3B82F6; color: #fff; box-shadow: 0 2px 10px #3B82F640; }
.month-chip:not(.active) { background: transparent; color: #8B98B4; }
.month-chip:not(.active):hover { background: #182030; color: #E8EDF5; }

.grid-4  { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
.grid-3  { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
.grid-2  { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.grid-31 { display:grid; grid-template-columns:1.6fr 1fr; gap:16px; }

@media (max-width:1100px) {
.grid-4  { grid-template-columns:repeat(2,1fr); }
.grid-3  { grid-template-columns:repeat(2,1fr); }
.grid-2, .grid-31 { grid-template-columns:1fr; }
}
@media (max-width:560px) {
.grid-4, .grid-3 { grid-template-columns:1fr; }
}

input[type=“email”], input[type=“password”] {
width: 100%;
background: #101929;
border: 1px solid #182030;
border-radius: 10px;
color: #E8EDF5;
font-family: ‘Inter’, sans-serif;
font-size: 14px;
outline: none;
padding: 13px 16px;
margin-bottom: 14px;
transition: border-color 0.15s;
}
input:focus { border-color: #3B82F6; }
input::placeholder { color: #3E4F68; }

button[type=“submit”] {
width: 100%;
background: #3B82F6;
color: #fff;
border: none;
border-radius: 10px;
padding: 13px 16px;
font-family: ‘Inter’, sans-serif;
font-size: 14px; font-weight: 700;
cursor: pointer;
transition: background 0.15s, opacity 0.15s;
}
button[type=“submit”]:hover { background: #2563EB; }
button[type=“submit”]:disabled { opacity: 0.6; cursor: not-allowed; }
`;

// ─── BASE COMPONENTS ──────────────────────────────────────────────────────────
function Card({ children, style={}, delay=0 }) {
return (
<div className=“surface-card fade-up” style={{ padding:“24px 26px”, animationDelay:`${delay}ms`, …style }}>
{children}
</div>
);
}

function SLabel({ children, accent=T.blue }) {
return (
<div style={{ display:“flex”, alignItems:“center”, gap:8, marginBottom:20 }}>
<div style={{ width:2, height:14, background:accent, borderRadius:2, opacity:0.8 }}/>
<span style={{
fontSize:10, fontWeight:700, color:T.textMid,
letterSpacing:“0.14em”, textTransform:“uppercase”,
fontFamily:”‘Space Grotesk’,sans-serif”,
}}>
{children}
</span>
</div>
);
}

function Badge({ children, color=T.blue, style={} }) {
return (
<span style={{
display:“inline-flex”, alignItems:“center”,
background:`${color}14`, color,
borderRadius:5, padding:“2px 8px”,
fontSize:10, fontWeight:700, letterSpacing:“0.05em”,
…style,
}}>
{children}
</span>
);
}

function Delta({ prev, curr, inverse=false }) {
const chg = Chg(prev, curr);
if (chg===null) return null;
const up = inverse ? chg<=0 : chg>=0;
const color = up ? T.green : T.red;
return (
<span style={{
display:“inline-flex”, alignItems:“center”, gap:2,
color, fontSize:11, fontWeight:700,
}}>
<span style={{ fontSize:9 }}>{up?“▲”:“▼”}</span>
{Math.abs(chg).toFixed(1)}%
</span>
);
}

function KPI({ label, value, sub, prev, curr, inverse=false, color=T.blue, delay=0 }) {
return (
<div className=“kpi-card fade-up” style={{ animationDelay:`${delay}ms` }}>
<div style={{ position:“absolute”, right:0, top:0, width:60, height:60, background:`radial-gradient(circle at 100% 0%,${color}12,transparent 70%)`, pointerEvents:“none” }}/>
<div style={{ fontSize:10, fontWeight:600, color:T.textDim, textTransform:“uppercase”, letterSpacing:“0.12em”, marginBottom:12 }}>
{label}
</div>
<div style={{ fontSize:28, fontWeight:700, color:T.text, fontFamily:”‘Space Grotesk’,sans-serif”, lineHeight:1, marginBottom:10, letterSpacing:”-0.01em” }}>
{value}
</div>
<div style={{ display:“flex”, alignItems:“center”, gap:10 }}>
{sub && <span style={{ fontSize:11, color:T.textDim }}>{sub}</span>}
{prev!=null && curr!=null && <Delta prev={prev} curr={curr} inverse={inverse}/>}
</div>
<div style={{ position:“absolute”, bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${color}40,transparent)`, borderRadius:“0 0 14px 14px” }}/>
</div>
);
}

function TTip({ active, payload, label }) {
if (!active || !payload?.length) return null;
return (
<div style={{ background:T.surfaceMid, border:`1px solid ${T.border}`, borderRadius:10, padding:“10px 14px”, boxShadow:“0 12px 32px #00000060”, minWidth:140 }}>
{label && <div style={{ color:T.textMid, fontSize:11, marginBottom:8, letterSpacing:“0.02em” }}>{label}</div>}
{payload.map((p,i) => (
<div key={i} style={{ display:“flex”, alignItems:“center”, gap:8, marginTop:i>0?5:0 }}>
<div style={{ width:6, height:6, borderRadius:“50%”, background:p.color, flexShrink:0 }}/>
<span style={{ color:T.textMid, fontSize:12 }}>{p.name}</span>
<span style={{ color:T.text, fontSize:12, fontWeight:700, marginLeft:“auto”, paddingLeft:12 }}>
{typeof p.value===“number” && p.value>999 ? $(p.value) : p.value}
</span>
</div>
))}
</div>
);
}

function Empty({ msg=“Sin datos para este periodo” }) {
return (
<div style={{ textAlign:“center”, padding:“44px 24px” }}>
<div style={{ width:32, height:32, border:`1px solid ${T.border}`, borderRadius:“50%”, margin:“0 auto 14px”, opacity:0.3 }}/>
<div style={{ color:T.textDim, fontSize:13, letterSpacing:“0.02em” }}>{msg}</div>
</div>
);
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen() {
const [email,    setEmail]    = useState(””);
const [password, setPassword] = useState(””);
const [errorMsg, setErrorMsg] = useState(””);
const [loading,  setLoading]  = useState(false);

async function handleLogin(e) {
e.preventDefault();
setLoading(true); setErrorMsg(””);
const { error } = await supabase.auth.signInWithPassword({ email, password });
if (error) setErrorMsg(“Correo o contraseña incorrectos.”);
setLoading(false);
}

return (
<>
<style>{STYLES}</style>
<div style={{
minHeight:“100vh”, background:T.bg, display:“flex”,
alignItems:“center”, justifyContent:“center”, padding:24,
}}>
<div style={{ width:“100%”, maxWidth:380 }}>
{/* Logo */}
<div style={{ textAlign:“center”, marginBottom:40 }}>
<div style={{
width:52, height:52, borderRadius:14,
background:`linear-gradient(135deg,${T.blue},${T.teal})`,
display:“flex”, alignItems:“center”, justifyContent:“center”,
margin:“0 auto 18px”, boxShadow:`0 8px 32px ${T.blue}40`,
fontSize:22, fontWeight:800, color:”#fff”,
fontFamily:”‘Space Grotesk’,sans-serif”,
}}>B</div>
<div style={{ fontSize:18, fontWeight:700, color:T.text, fontFamily:”‘Space Grotesk’,sans-serif”, letterSpacing:”-0.01em” }}>
BordaXpress
</div>
<div style={{ fontSize:12, color:T.textDim, marginTop:4, letterSpacing:“0.04em” }}>
CENTRO DE CONTROL COMERCIAL
</div>
</div>

```
      <form onSubmit={handleLogin} className="fade-up" style={{
        background:T.surface, border:`1px solid ${T.border}`,
        borderRadius:18, padding:"32px 28px",
        boxShadow:"0 24px 64px #00000070",
      }}>
        <div style={{ fontSize:15, fontWeight:600, color:T.text, marginBottom:6 }}>
          Acceso al panel
        </div>
        <div style={{ fontSize:13, color:T.textDim, marginBottom:24 }}>
          Ingresa tus credenciales para continuar.
        </div>

        <input type="email" placeholder="Correo electronico" value={email} onChange={e=>setEmail(e.target.value)} required/>
        <input type="password" placeholder="Contrasena" value={password} onChange={e=>setPassword(e.target.value)} required/>

        {errorMsg && (
          <div style={{ background:`${T.red}12`, border:`1px solid ${T.red}30`, borderRadius:8, padding:"9px 12px", color:T.red, fontSize:12, marginBottom:14 }}>
            {errorMsg}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Verificando..." : "Iniciar sesion"}
        </button>
      </form>

      <div style={{ textAlign:"center", marginTop:24, color:T.textDim, fontSize:11, letterSpacing:"0.04em" }}>
        USO INTERNO · DIRECCION GENERAL
      </div>
    </div>
  </div>
</>
```

);
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
const TABS = [
{ id:“resumen”,    label:“Resumen”    },
{ id:“ventas”,     label:“Ventas”     },
{ id:“whatsapp”,   label:“WhatsApp”   },
{ id:“redes”,      label:“Redes”      },
{ id:“ads”,        label:“Ads”        },
{ id:“insights”,   label:“Insights”   },
{ id:“decisiones”, label:“Decisiones” },
];

// ─── TAB RESUMEN ──────────────────────────────────────────────────────────────
function TabResumen({ d, prev, months, byMonth }) {
const v  = d.ventas   || {};
const w  = d.whatsapp || {};
const a  = d.ads      || {};
const vp = prev?.ventas   || {};
const wp = prev?.whatsapp || {};

const ingMsg  = w.mensajes && v.ingresos ? Math.round(v.ingresos/w.mensajes) : null;
const pingMsg = wp.mensajes && vp.ingresos ? Math.round(vp.ingresos/wp.mensajes) : null;

const compareData = [
{ name:“Ingresos”,    actual: v.ingresos??0,             anterior: vp.ingresos??0 },
{ name:“Ordenes”,     actual: (v.ordenes??0)*1000,       anterior: (vp.ordenes??0)*1000 },
{ name:“Mensajes WA”, actual: (w.mensajes??0)*300,       anterior: (wp.mensajes??0)*300 },
];

return (
<div style={{ display:“flex”, flexDirection:“column”, gap:14 }}>
<div className="grid-4">
<KPI label="Ingresos del mes"   value={$(v.ingresos)}  color={T.green} sub="MXN"           prev={vp.ingresos} curr={v.ingresos} delay={0}/>
<KPI label="Ordenes cerradas"   value={N(v.ordenes)}   color={T.blue}  sub="pedidos"       prev={vp.ordenes}  curr={v.ordenes}  delay={50}/>
<KPI label="Ticket promedio"    value={$(v.ingresos&&v.ordenes?Math.round(v.ingresos/v.ordenes):null)} color={T.gold} sub="por orden" prev={vp.ingresos&&vp.ordenes?vp.ingresos/vp.ordenes:null} curr={v.ingresos&&v.ordenes?v.ingresos/v.ordenes:null} delay={100}/>
<KPI label=“Ingreso por mensaje” value={ingMsg?`$${N(ingMsg)}`:”—”} color={T.teal} sub=“eficiencia WA” prev={pingMsg} curr={ingMsg} delay={150}/>
</div>

```
  <div className="grid-4">
    <KPI label="Mensajes WhatsApp"  value={N(w.mensajes)}    color={T.cyan}   prev={wp.mensajes}  curr={w.mensajes}  delay={200}/>
    <KPI label="Conversion WA"      value={Pct(w.tasaConv)}  color={T.green}  prev={wp.tasaConv}  curr={w.tasaConv}  delay={250}/>
    <KPI label="Inversion en Ads"   value={$(a.inversion)}   color={T.gold}   sub={a.plataforma}  delay={300}/>
    <KPI label="ROAS estimado"      value={a.roasEstimado?`${Number(a.roasEstimado).toFixed(1)}x`:"—"} color={T.purple} delay={350}/>
  </div>

  <Card delay={100}>
    <SLabel accent={T.blue}>Comparativo vs periodo anterior</SLabel>
    {months.length > 1 ? (
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={compareData} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false}/>
          <XAxis dataKey="name" tick={{ fill:T.textMid, fontSize:11 }} axisLine={false} tickLine={false}/>
          <YAxis tick={{ fill:T.textDim, fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
          <Tooltip content={<TTip/>}/>
          <Legend wrapperStyle={{ color:T.textMid, fontSize:11, paddingTop:12 }}/>
          <Bar dataKey="anterior" name="Anterior" fill={T.border}   radius={[4,4,0,0]} maxBarSize={48}/>
          <Bar dataKey="actual"   name="Actual"   fill={T.blue}     radius={[4,4,0,0]} maxBarSize={48}/>
        </ComposedChart>
      </ResponsiveContainer>
    ) : <Empty msg="Se necesitan al menos 2 meses para comparar"/>}
  </Card>
</div>
```

);
}

// ─── TAB VENTAS ───────────────────────────────────────────────────────────────
function TabVentas({ d, prev, months, byMonth }) {
const v   = d.ventas    || {};
const sv  = d.servicios || [];
const vp  = prev?.ventas || {};
const top = […sv].sort((a,b)=>b.valor-a.valor);

const trendData = months.map(m=>({
mes:      byMonth[m]?.label?.slice(0,3)||m,
ingresos: byMonth[m]?.ventas?.ingresos??0,
ordenes:  byMonth[m]?.ventas?.ordenes??0,
}));

return (
<div style={{ display:“flex”, flexDirection:“column”, gap:14 }}>
<div className="grid-3">
<KPI label="Ingresos totales" value={$(v.ingresos)} color={T.green} sub="MXN" prev={vp.ingresos} curr={v.ingresos} delay={0}/>
<KPI label="Ordenes"          value={N(v.ordenes)}  color={T.blue}            prev={vp.ordenes}  curr={v.ordenes}  delay={50}/>
<KPI label="Ticket promedio"  value={$(v.ingresos&&v.ordenes?Math.round(v.ingresos/v.ordenes):null)} color={T.gold} prev={vp.ingresos&&vp.ordenes?Math.round(vp.ingresos/vp.ordenes):null} curr={v.ingresos&&v.ordenes?Math.round(v.ingresos/v.ordenes):null} delay={100}/>
</div>

```
  <div className="grid-31">
    <Card delay={80}>
      <SLabel accent={T.blue}>Ingresos por servicio</SLabel>
      {top.length ? (
        <ResponsiveContainer width="100%" height={270}>
          <BarChart data={top} layout="vertical" barCategoryGap="25%">
            <CartesianGrid strokeDasharray="2 4" stroke={T.border} horizontal={false}/>
            <XAxis type="number" tick={{ fill:T.textDim, fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v=>$(v)}/>
            <YAxis dataKey="name" type="category" tick={{ fill:T.text, fontSize:11 }} width={94} axisLine={false} tickLine={false}/>
            <Tooltip content={<TTip/>}/>
            <Bar dataKey="valor" name="Ingreso" radius={[0,6,6,0]} maxBarSize={28}>
              {top.map((_,i)=><Cell key={i} fill={CH[i%CH.length]}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : <Empty/>}
    </Card>

    <Card delay={130}>
      <SLabel accent={T.teal}>Participacion</SLabel>
      {top.length && v.ingresos ? (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {top.slice(0,7).map((s,i)=>{
            const p=(s.valor/v.ingresos*100).toFixed(1);
            return (
              <div key={i}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ color:T.text, fontSize:12, fontWeight:500 }}>{s.name}</span>
                  <span style={{ color:CH[i%CH.length], fontSize:12, fontWeight:700 }}>{$(s.valor)}</span>
                </div>
                <div style={{ height:3, background:T.border, borderRadius:2 }}>
                  <div style={{ height:"100%", width:`${p}%`, background:CH[i%CH.length], borderRadius:2 }}/>
                </div>
                <div style={{ color:T.textDim, fontSize:10, marginTop:3 }}>{p}%</div>
              </div>
            );
          })}
        </div>
      ) : <Empty/>}
    </Card>
  </div>

  <Card delay={160}>
    <SLabel accent={T.green}>Evolucion de ingresos</SLabel>
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={trendData}>
        <defs>
          <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={T.green} stopOpacity={0.18}/>
            <stop offset="100%" stopColor={T.green} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false}/>
        <XAxis dataKey="mes" tick={{ fill:T.textMid, fontSize:11 }} axisLine={false} tickLine={false}/>
        <YAxis tick={{ fill:T.textDim, fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
        <Tooltip content={<TTip/>}/>
        <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke={T.green} fill="url(#gradIngresos)" strokeWidth={2.5} dot={{ r:4, fill:T.green, strokeWidth:0 }}/>
      </AreaChart>
    </ResponsiveContainer>
  </Card>
</div>
```

);
}

// ─── TAB WHATSAPP ─────────────────────────────────────────────────────────────
function TabWhatsApp({ d, prev, months, byMonth }) {
const w   = d.whatsapp || {};
const v   = d.ventas   || {};
const wp  = prev?.whatsapp || {};
const vp  = prev?.ventas   || {};

const ingMsg  = w.mensajes&&v.ingresos ? Math.round(v.ingresos/w.mensajes) : null;
const pingMsg = wp.mensajes&&vp.ingresos ? Math.round(vp.ingresos/wp.mensajes) : null;

const trendData = months.map(m=>({
mes:      byMonth[m]?.label?.slice(0,3)||m,
mensajes: byMonth[m]?.whatsapp?.mensajes??0,
intencion:byMonth[m]?.whatsapp?.intencion??0,
tasaConv: byMonth[m]?.whatsapp?.tasaConv??0,
}));

return (
<div style={{ display:“flex”, flexDirection:“column”, gap:14 }}>
<div className="grid-4">
<KPI label="Mensajes totales"   value={N(w.mensajes)}    color={T.blue}  prev={wp.mensajes}    curr={w.mensajes}    delay={0}/>
<KPI label=“Promedio diario”    value={w.promedioDiario??”—”} color={T.cyan} prev={wp.promedioDiario} curr={w.promedioDiario} delay={50}/>
<KPI label="Con intencion"      value={N(w.intencion)}   color={T.gold}  prev={wp.intencion}   curr={w.intencion}   delay={100}/>
<KPI label="Tasa conversion"    value={Pct(w.tasaConv)}  color={T.green} prev={wp.tasaConv}    curr={w.tasaConv}    delay={150}/>
</div>

```
  <div className="grid-4">
    <KPI label="Primera respuesta"  value={w.t1Resp!=null?`${w.t1Resp} min`:"—"} color={w.t1Resp!=null&&w.t1Resp<=20?T.green:T.gold} prev={wp.t1Resp} curr={w.t1Resp} inverse delay={200}/>
    <KPI label="Duracion conv."     value={w.tConvActiva!=null?`${w.tConvActiva} min`:"—"} color={T.teal} delay={250}/>
    <KPI label="% con intencion"    value={Pct(w.pctIntencion)} color={T.blue} prev={wp.pctIntencion} curr={w.pctIntencion} delay={300}/>
    <KPI label="Ingreso por mensaje" value={ingMsg?`$${N(ingMsg)}`:"—"} color={T.green} prev={pingMsg} curr={ingMsg} delay={350}/>
  </div>

  <Card delay={100}>
    <SLabel accent={T.blue}>Tendencia WhatsApp</SLabel>
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={trendData}>
        <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false}/>
        <XAxis dataKey="mes" tick={{ fill:T.textMid, fontSize:11 }} axisLine={false} tickLine={false}/>
        <YAxis tick={{ fill:T.textDim, fontSize:10 }} axisLine={false} tickLine={false}/>
        <Tooltip content={<TTip/>}/>
        <Legend wrapperStyle={{ color:T.textMid, fontSize:11, paddingTop:12 }}/>
        <Line type="monotone" dataKey="mensajes"  name="Mensajes"  stroke={T.blue}  strokeWidth={2.5} dot={{ r:4, fill:T.blue,  strokeWidth:0 }}/>
        <Line type="monotone" dataKey="intencion" name="Intencion" stroke={T.teal}  strokeWidth={2.5} dot={{ r:4, fill:T.teal,  strokeWidth:0 }}/>
        <Line type="monotone" dataKey="tasaConv"  name="Conv %"    stroke={T.green} strokeWidth={2}   dot={{ r:3, fill:T.green, strokeWidth:0 }} strokeDasharray="5 3"/>
      </LineChart>
    </ResponsiveContainer>
  </Card>
</div>
```

);
}

// ─── TAB REDES ────────────────────────────────────────────────────────────────
function TabRedes({ d, prev, months, byMonth }) {
const r  = d.redes || {};
const ig = r.ig || {};
const fb = r.fb || {};

const totalVis   = (ig.vis??0)+(fb.vis??0);
const totalAlc   = (ig.alcance??0)+(fb.alcance??0);
const totalInter = (ig.inter??0)+(fb.inter??0);
const totalSeg   = (ig.segNuevos??0)+(fb.segNuevos??0);
const totalClics = (ig.clics??0)+(fb.clics??0);

const trendData = months.map(m=>{
const ri=byMonth[m]?.redes?.ig||{};
const rf=byMonth[m]?.redes?.fb||{};
return {
mes:    byMonth[m]?.label?.slice(0,3)||m,
ig_seg: ri.segNuevos??0,
fb_seg: rf.segNuevos??0,
ig_vis: ri.vis??0,
fb_vis: rf.vis??0,
};
});

return (
<div style={{ display:“flex”, flexDirection:“column”, gap:14 }}>
<div className="grid-4">
<KPI label="Visualizaciones"   value={N(totalVis)}   color={T.blue}   delay={0}/>
<KPI label="Alcance total"     value={N(totalAlc)}   color={T.teal}   delay={50}/>
<KPI label="Interacciones"     value={N(totalInter)} color={T.purple} delay={100}/>
<KPI label="Seguidores nuevos" value={N(totalSeg)}   color={T.green}  delay={150}/>
</div>

```
  <div className="grid-2">
    <Card delay={80}>
      <SLabel accent={T.gold}>Instagram</SLabel>
      <div className="grid-3">
        <KPI label="Visualizaciones" value={N(ig.vis)}       color={T.gold}   delay={0}/>
        <KPI label="Alcance"         value={N(ig.alcance)}   color={T.teal}   delay={40}/>
        <KPI label="Interacciones"   value={N(ig.inter)}     color={T.purple} delay={80}/>
        <KPI label="Seguidores"      value={N(ig.segNuevos)} color={T.green}  delay={120}/>
        <KPI label="Visitas"         value={N(ig.visitas)}   color={T.cyan}   delay={160}/>
        <KPI label="Clics"           value={N(ig.clics)}     color={T.blue}   delay={200}/>
      </div>
    </Card>

    <Card delay={120}>
      <SLabel accent={T.blue}>Facebook</SLabel>
      <div className="grid-3">
        <KPI label="Visualizaciones" value={N(fb.vis)}       color={T.blue}   delay={0}/>
        <KPI label="Alcance"         value={N(fb.alcance)}   color={T.teal}   delay={40}/>
        <KPI label="Interacciones"   value={N(fb.inter)}     color={T.purple} delay={80}/>
        <KPI label="Seguidores"      value={N(fb.segNuevos)} color={T.green}  delay={120}/>
        <KPI label="Clics"           value={N(fb.clics)}     color={T.cyan}   delay={160}/>
      </div>
    </Card>
  </div>

  <Card delay={160}>
    <SLabel accent={T.blue}>Seguidores nuevos por mes</SLabel>
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={trendData} barCategoryGap="35%">
        <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false}/>
        <XAxis dataKey="mes" tick={{ fill:T.textMid, fontSize:11 }} axisLine={false} tickLine={false}/>
        <YAxis tick={{ fill:T.textDim, fontSize:10 }} axisLine={false} tickLine={false}/>
        <Tooltip content={<TTip/>}/>
        <Legend wrapperStyle={{ color:T.textMid, fontSize:11, paddingTop:12 }}/>
        <Bar dataKey="ig_seg" name="Instagram" fill={T.gold} radius={[4,4,0,0]} maxBarSize={40}/>
        <Bar dataKey="fb_seg" name="Facebook"  fill={T.blue} radius={[4,4,0,0]} maxBarSize={40}/>
      </BarChart>
    </ResponsiveContainer>
  </Card>
</div>
```

);
}

// ─── TAB ADS ──────────────────────────────────────────────────────────────────
function TabAds({ d, prev, months, byMonth }) {
const a  = d.ads  || {};
const ap = prev?.ads || {};
const hasData = (a.inversion??0) > 0;

const roasData = [
{ name:“Inversion”,          value: a.inversion??0,          fill:T.red   },
{ name:“Ingresos directos”,  value: a.ingresosDirectos??0,   fill:T.blue  },
{ name:“Ingresos estimados”, value: a.ingresosEstimados??0,  fill:T.green },
];

return (
<div style={{ display:“flex”, flexDirection:“column”, gap:14 }}>
{!hasData && (
<div style={{
background:`${T.gold}0c`, border:`1px solid ${T.gold}25`,
borderRadius:12, padding:“13px 18px”,
display:“flex”, alignItems:“center”, gap:12,
}}>
<div style={{ width:6, height:6, borderRadius:“50%”, background:T.gold, flexShrink:0 }}/>
<span style={{ color:T.gold, fontSize:13, fontWeight:500 }}>Sin campana activa este periodo.</span>
</div>
)}

```
  <div className="grid-4">
    <KPI label="Inversion total"  value={$(a.inversion)}         color={T.gold}   sub={a.plataforma} prev={ap.inversion}     curr={a.inversion}     delay={0}/>
    <KPI label="Alcance"          value={N(a.alcance)}            color={T.blue}                     delay={50}/>
    <KPI label="Clics generados"  value={N(a.clics)}              color={T.cyan}                     prev={ap.clics}         curr={a.clics}         delay={100}/>
    <KPI label="Conversaciones"   value={N(a.conversaciones)}     color={T.teal}                     prev={ap.conversaciones} curr={a.conversaciones} delay={150}/>
  </div>

  <div className="grid-4">
    <KPI label="Costo por conv."  value={a.costoPorConv?`$${Number(a.costoPorConv).toFixed(2)}`:"—"} color={T.red}    prev={ap.costoPorConv}  curr={a.costoPorConv}  inverse delay={200}/>
    <KPI label="Ventas directas"  value={N(a.ventasDirectas)}     color={T.green}                    delay={250}/>
    <KPI label="ROAS directo"     value={a.roasDirecto?`${Number(a.roasDirecto).toFixed(1)}x`:"—"}  color={T.teal}   delay={300}/>
    <KPI label="ROAS estimado"    value={a.roasEstimado?`${Number(a.roasEstimado).toFixed(1)}x`:"—"} color={T.purple} delay={350}/>
  </div>

  <Card delay={100}>
    <SLabel accent={T.green}>Inversion vs retorno</SLabel>
    <ResponsiveContainer width="100%" height={230}>
      <BarChart data={roasData} barCategoryGap="40%">
        <CartesianGrid strokeDasharray="2 4" stroke={T.border} vertical={false}/>
        <XAxis dataKey="name" tick={{ fill:T.textMid, fontSize:11 }} axisLine={false} tickLine={false}/>
        <YAxis tick={{ fill:T.textDim, fontSize:10 }} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
        <Tooltip content={<TTip/>}/>
        <Bar dataKey="value" name="Monto" radius={[6,6,0,0]} maxBarSize={72}>
          {roasData.map((e,i)=><Cell key={i} fill={e.fill}/>)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </Card>
</div>
```

);
}

// ─── TAB INSIGHTS ─────────────────────────────────────────────────────────────
function TabInsights({ d, prev }) {
const v  = d.ventas   || {};
const w  = d.whatsapp || {};
const a  = d.ads      || {};
const vp = prev?.ventas || {};

const items = [];

if (w.tasaConv!=null) {
if (w.tasaConv<20) items.push({ color:T.red,    status:“Atencion”, title:“Conversion baja”,      body:`Tasa de ${Pct(w.tasaConv)}. Revisar guion de ventas y seguimiento activo.` });
else               items.push({ color:T.green,  status:“Positivo”, title:“Conversion saludable”, body:`Tasa de ${Pct(w.tasaConv)}. Canal con potencial de escala sostenible.` });
}
if (w.t1Resp!=null && w.t1Resp>20) {
items.push({ color:T.gold, status:“Mejora”, title:“Respuesta lenta”, body:`Primera respuesta en ${w.t1Resp} min. Recomendado: menos de 10 min para mejorar conversion.` });
}
if ((a.inversion??0)>0 && a.roasEstimado!=null) {
if (a.roasEstimado>=5) items.push({ color:T.green,  status:“Positivo”, title:“ROAS alto”,     body:`ROAS estimado de ${a.roasEstimado}x. Campana eficiente. Evaluar incremento de presupuesto.` });
else                   items.push({ color:T.gold,   status:“Revisar”,  title:“ROAS moderado”, body:`ROAS estimado de ${a.roasEstimado}x. Optimizar segmentacion antes de escalar.` });
}
if (vp.ingresos && v.ingresos) {
const chg=Chg(vp.ingresos,v.ingresos);
if (chg!=null) {
if (chg<0) items.push({ color:T.red,   status:“Atencion”, title:“Ingresos en caida”,   body:`Caida de ${Math.abs(chg).toFixed(1)}% vs periodo anterior. Revisar causas operativas y de demanda.` });
else       items.push({ color:T.green, status:“Positivo”, title:“Crecimiento positivo”, body:`Ingresos crecieron ${chg.toFixed(1)}% vs periodo anterior.` });
}
}

return (
<div style={{ display:“flex”, flexDirection:“column”, gap:10 }}>
{!items.length && <Empty msg="Sin suficientes datos para generar insights"/>}
{items.map((ins,i)=>(
<div key={i} className=“surface-card fade-up” style={{
padding:“20px 24px”,
borderLeft:`3px solid ${ins.color}`,
animationDelay:`${i*60}ms`,
}}>
<div style={{ display:“flex”, alignItems:“center”, gap:10, marginBottom:8 }}>
<div style={{ width:6, height:6, borderRadius:“50%”, background:ins.color, flexShrink:0 }}/>
<Badge color={ins.color} style={{ fontSize:9, letterSpacing:“0.1em” }}>{ins.status.toUpperCase()}</Badge>
<span style={{ color:T.text, fontWeight:600, fontSize:14 }}>{ins.title}</span>
</div>
<p style={{ color:T.textMid, fontSize:13, lineHeight:1.7, margin:0, paddingLeft:16 }}>{ins.body}</p>
</div>
))}
</div>
);
}

// ─── TAB DECISIONES ───────────────────────────────────────────────────────────
function TabDecisiones({ d, prev }) {
const w  = d.whatsapp  || {};
const a  = d.ads       || {};
const sv = d.servicios || [];
const topSvc = […sv].sort((a,b)=>b.valor-a.valor)[0];

const decs = [];

if ((a.roasEstimado??0)>=5 && (a.inversion??0)>0) {
decs.push({ color:T.green, priority:“Alta”, title:“Escalar Meta Ads”, desc:“La campana muestra retorno suficiente para incrementar la inversion de manera gradual.” });
}
if ((w.t1Resp??0)>15) {
decs.push({ color:T.red, priority:“Alta”, title:“Reducir tiempo de respuesta”, desc:“Priorizar automatizacion y respuestas rapidas en WhatsApp para maximizar conversion.” });
}
if (topSvc) {
decs.push({ color:T.blue, priority:“Media”, title:`Reforzar ${topSvc.name}`, desc:`Servicio lider del periodo con ${$(topSvc.valor)}. Crear contenido y oferta destacada para este servicio.` });
}
if (!decs.length) {
decs.push({ color:T.gold, priority:“Info”, title:“Mantener operacion”, desc:“No hay senales criticas. Continuar acumulando datos para decisiones mas precisas el siguiente periodo.” });
}

const pColors = { Alta:T.red, Media:T.gold, Info:T.textMid };

return (
<div style={{ display:“flex”, flexDirection:“column”, gap:10 }}>
{decs.map((dec,i)=>(
<div key={i} className=“surface-card fade-up” style={{
padding:“22px 26px”,
animationDelay:`${i*60}ms`,
}}>
<div style={{ display:“flex”, justifyContent:“space-between”, alignItems:“flex-start”, marginBottom:10 }}>
<span style={{ color:T.text, fontWeight:700, fontSize:15 }}>{dec.title}</span>
<Badge color={pColors[dec.priority]||T.textMid} style={{ fontSize:9, letterSpacing:“0.1em” }}>
{dec.priority.toUpperCase()}
</Badge>
</div>
<p style={{ color:T.textMid, fontSize:13, lineHeight:1.75, margin:“0 0 14px” }}>{dec.desc}</p>
<div style={{ height:1, background:T.border }}/>
</div>
))}
</div>
);
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
const [tab,         setTab]         = useState(“resumen”);
const [mes,         setMes]         = useState(null);
const [DATA,        setDATA]        = useState(null);
const [loading,     setLoading]     = useState(true);
const [err,         setErr]         = useState(null);
const [session,     setSession]     = useState(null);
const [authLoading, setAuthLoading] = useState(true);

useEffect(()=>{
supabase.auth.getSession().then(({data})=>{
setSession(data.session);
setAuthLoading(false);
});
const { data: listener } = supabase.auth.onAuthStateChange((_e,s)=>setSession(s));
return () => listener.subscription.unsubscribe();
},[]);

useEffect(()=>{
if (!session) return;
async function load() {
const { data, error } = await supabase
.from(“monthly_reports”).select(”*”).order(“month”,{ascending:true});
if (error) { setErr(error.message); setLoading(false); return; }
if (!data?.length) { setErr(“No hay datos en monthly_reports.”); setLoading(false); return; }

```
  const months  = data.map(r=>r.month);
  const labels  = Object.fromEntries(data.map(r=>[r.month, r.label]));
  const byMonth = Object.fromEntries(data.map(r=>[r.month,{
    label:r.label, ventas:r.ventas, servicios:r.servicios,
    whatsapp:r.whatsapp, redes:r.redes, ads:r.ads??null,
  }]));

  setDATA({ months, labels, byMonth });
  const saved = localStorage.getItem("bx_selected_month");
  setMes(saved && months.includes(saved) ? saved : months[months.length-1]);
  setLoading(false);
}
load();
```

},[session]);

if (authLoading) return (
<>
<style>{STYLES}</style>
<div style={{ minHeight:“100vh”, background:T.bg, display:“flex”, alignItems:“center”, justifyContent:“center”, color:T.textDim, fontSize:13 }}>
Verificando sesion…
</div>
</>
);

if (!session) return <LoginScreen/>;

if (loading) return (
<>
<style>{STYLES}</style>
<div style={{ minHeight:“100vh”, background:T.bg, display:“flex”, alignItems:“center”, justifyContent:“center” }}>
<div style={{ textAlign:“center” }}>
<div style={{ width:32, height:32, border:`2px solid ${T.border}`, borderTop:`2px solid ${T.blue}`, borderRadius:“50%”, animation:“spin 0.8s linear infinite”, margin:“0 auto 16px” }}/>
<div style={{ color:T.textDim, fontSize:12, letterSpacing:“0.1em” }}>CARGANDO</div>
</div>
</div>
</>
);

if (err) return (
<>
<style>{STYLES}</style>
<div style={{ minHeight:“100vh”, background:T.bg, display:“flex”, alignItems:“center”, justifyContent:“center”, flexDirection:“column”, gap:12 }}>
<div style={{ color:T.red, fontSize:14, fontWeight:600 }}>Error de conexion</div>
<div style={{ color:T.textMid, fontSize:12, maxWidth:360, textAlign:“center” }}>{err}</div>
</div>
</>
);

if (!DATA||!mes) return null;

const { months, labels, byMonth } = DATA;
const curIdx   = months.indexOf(mes);
const curData  = byMonth[mes]||{};
const prevData = curIdx>0 ? byMonth[months[curIdx-1]] : null;
const shared   = { d:curData, prev:prevData, months, byMonth };

const tabContent = {
resumen:    <TabResumen    {…shared}/>,
ventas:     <TabVentas     {…shared}/>,
whatsapp:   <TabWhatsApp   {…shared}/>,
redes:      <TabRedes      {…shared}/>,
ads:        <TabAds        {…shared}/>,
insights:   <TabInsights   d={curData} prev={prevData}/>,
decisiones: <TabDecisiones d={curData} prev={prevData}/>,
};

return (
<>
<style>{STYLES}</style>
<div style={{ minHeight:“100vh”, background:T.bg, color:T.text, fontFamily:”‘Inter’,system-ui,sans-serif” }}>

```
    {/* ── TOP BAR ────────────────────────────────────────────────────── */}
    <div style={{
      background: T.surface,
      borderBottom:`1px solid ${T.border}`,
      padding:"0 36px",
      position:"sticky", top:0, zIndex:100,
      backdropFilter:"blur(24px)",
    }}>
      {/* Row 1: brand + controls */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", height:56, gap:16 }}>
        {/* Brand */}
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{
            width:32, height:32, borderRadius:9,
            background:`linear-gradient(135deg,${T.blue},${T.teal})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:14, fontWeight:800, color:"#fff",
            fontFamily:"'Space Grotesk',sans-serif",
            flexShrink:0,
          }}>B</div>
          <div style={{ borderRight:`1px solid ${T.border}`, paddingRight:20, marginRight:4 }}>
            <div style={{ fontSize:13, fontWeight:700, color:T.text, letterSpacing:"0.04em", fontFamily:"'Space Grotesk',sans-serif" }}>
              BordaXpress
            </div>
            <div style={{ fontSize:9, color:T.textDim, letterSpacing:"0.12em", marginTop:1 }}>
              CENTRO DE CONTROL COMERCIAL
            </div>
          </div>
          <div style={{ fontSize:11, color:T.textDim, letterSpacing:"0.04em" }}>
            Panel Ejecutivo
          </div>
        </div>

        {/* Controls */}
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {/* Live indicator */}
          <div style={{ display:"flex", alignItems:"center", gap:7, marginRight:4 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:T.green, animation:"pulseGreen 2.4s infinite" }}/>
            <span style={{ fontSize:10, color:T.textDim, letterSpacing:"0.1em" }}>EN VIVO</span>
          </div>

          {/* Month selector */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:10, color:T.textDim, letterSpacing:"0.1em" }}>PERIODO</span>
            <div style={{ display:"flex", background:T.border, borderRadius:8, padding:3, gap:2 }}>
              {months.map(m=>(
                <button key={m} className={`month-chip${mes===m?" active":""}`} onClick={()=>{setMes(m);localStorage.setItem("bx_selected_month",m);}}>
                  {labels[m]}
                </button>
              ))}
            </div>
          </div>

          {/* Sign out */}
          <button onClick={()=>supabase.auth.signOut()} style={{
            background:"transparent", color:T.textDim,
            border:`1px solid ${T.border}`, borderRadius:7,
            padding:"5px 12px", fontSize:11, cursor:"pointer",
            fontFamily:"'Inter',sans-serif", letterSpacing:"0.04em",
            transition:"border-color 0.15s, color 0.15s",
          }}
            onMouseEnter={e=>{e.target.style.borderColor=T.borderSub;e.target.style.color=T.textMid;}}
            onMouseLeave={e=>{e.target.style.borderColor=T.border;e.target.style.color=T.textDim;}}
          >
            Salir
          </button>
        </div>
      </div>

      {/* Row 2: tabs */}
      <div style={{ display:"flex", gap:2, paddingBottom:8, overflowX:"auto" }}>
        {TABS.map(t=>(
          <button key={t.id} className={`tab-pill${tab===t.id?" active":""}`}
            onClick={()=>setTab(t.id)}
            style={{ color: tab===t.id ? T.text : T.textMid }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>

    {/* ── CONTENT ────────────────────────────────────────────────────── */}
    <main style={{ maxWidth:1240, margin:"0 auto", padding:"32px 28px 80px" }}>
      {/* Section header */}
      <div style={{ marginBottom:28 }}>
        <div style={{ display:"flex", alignItems:"baseline", gap:10, flexWrap:"wrap" }}>
          <h1 style={{ fontSize:22, fontWeight:700, color:T.text, fontFamily:"'Space Grotesk',sans-serif", letterSpacing:"-0.01em", margin:0 }}>
            {TABS.find(t=>t.id===tab)?.label}
          </h1>
          <span style={{ fontSize:14, color:T.textDim }}>
            {labels[mes]}
          </span>
          {prevData && (
            <span style={{ fontSize:11, color:T.textDim }}>
              · comparado con {labels[months[curIdx-1]]}
            </span>
          )}
        </div>
        <div style={{ height:1, background:T.border, marginTop:16 }}/>
      </div>

      <div key={`${tab}-${mes}`} className="fade-in">
        {tabContent[tab]}
      </div>
    </main>

    {/* ── FOOTER ─────────────────────────────────────────────────────── */}
    <div style={{
      borderTop:`1px solid ${T.border}`,
      padding:"14px 36px",
      display:"flex", justifyContent:"space-between", alignItems:"center",
      gap:8, flexWrap:"wrap",
    }}>
      <span style={{ color:T.textDim, fontSize:10, letterSpacing:"0.06em" }}>
        BORDAXPRESS CCC · USO INTERNO · DIRECCION GENERAL
      </span>
      <span style={{ color:T.textDim, fontSize:10, letterSpacing:"0.04em" }}>
        Ultimo dato registrado: {labels[months[months.length-1]]}
      </span>
    </div>
  </div>
</>
```

);
}
