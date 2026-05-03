import { useState, useEffect } from “react”;
import {
BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
Tooltip, ResponsiveContainer, Legend,
PieChart, Pie, Cell, AreaChart, Area
} from “recharts”;
import { supabase } from “./supabaseClient”;

// ─── PALETA ────────────────────────────────────────────────────────────────────
const C = {
navy:      “#0F1E35”,
navyMid:   “#162844”,
navyLight: “#1E3A5F”,
blue:      “#2563EB”,
blueLight: “#3B82F6”,
teal:      “#0D9488”,
tealLight: “#14B8A6”,
gold:      “#D4A843”,
goldLight: “#F0C060”,
green:     “#059669”,
greenLight:”#10B981”,
red:       “#DC2626”,
redLight:  “#EF4444”,
amber:     “#D97706”,
gray1:     “#F8FAFC”,
gray2:     “#E2E8F0”,
gray3:     “#94A3B8”,
gray4:     “#64748B”,
white:     “#FFFFFF”,
text:      “#E2E8F0”,
textMuted: “#94A3B8”,
};

const CHART_COLORS = [C.blueLight, C.tealLight, C.goldLight, C.greenLight, C.redLight, “#A78BFA”, “#FB923C”];

// ─── UTILIDADES ────────────────────────────────────────────────────────────────
const fmt = (n) => n == null ? “N/D” : `$${Number(n).toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const fmtN = (n) => n == null ? “N/D” : Number(n).toLocaleString(“es-MX”);
const fmtPct = (n) => n == null ? “N/D” : `${n}%`;
const delta = (a, b) => a && b ? (((b - a) / a) * 100).toFixed(1) : null;

function DeltaBadge({ feb, mar, inverse = false }) {
const d = delta(feb, mar);
if (d === null) return <span style={{ color: C.textMuted, fontSize: 11 }}>N/D</span>;
const positive = inverse ? parseFloat(d) <= 0 : parseFloat(d) >= 0;
return (
<span style={{
background: positive ? “#064E3B22” : “#7F1D1D22”,
color: positive ? C.greenLight : C.redLight,
border: `1px solid ${positive ? C.green + "44" : C.red + "44"}`,
borderRadius: 6, padding: “2px 8px”, fontSize: 11, fontWeight: 700,
letterSpacing: “0.02em”,
}}>
{positive ? “▲” : “▼”} {Math.abs(parseFloat(d))}%
</span>
);
}

// ─── COMPONENTES BASE ──────────────────────────────────────────────────────────
function Card({ children, style = {}, glow = false }) {
return (
<div style={{
background: `linear-gradient(135deg, ${C.navyMid}ee, ${C.navyLight}aa)`,
border: `1px solid ${C.navyLight}88`,
borderRadius: 16, padding: “20px 24px”,
backdropFilter: “blur(12px)”,
boxShadow: glow
? `0 0 0 1px ${C.blueLight}22, 0 8px 32px #00000055, 0 0 60px ${C.blue}11`
: “0 4px 24px #00000044”,
transition: “transform 0.2s, box-shadow 0.2s”,
…style,
}}>
{children}
</div>
);
}

function KPICard({ label, value, sub, delta: d, color = C.blueLight, icon, small = false }) {
const [hovered, setHovered] = useState(false);
return (
<div
onMouseEnter={() => setHovered(true)}
onMouseLeave={() => setHovered(false)}
style={{
background: hovered
? `linear-gradient(135deg, ${C.navyLight}ff, ${C.navyMid}ff)`
: `linear-gradient(135deg, ${C.navyMid}ee, ${C.navyLight}99)`,
border: `1px solid ${hovered ? color + "55" : C.navyLight + "88"}`,
borderRadius: 14, padding: small ? “16px 18px” : “20px 22px”,
boxShadow: hovered ? `0 8px 32px #00000066, 0 0 30px ${color}22` : “0 4px 16px #00000033”,
transform: hovered ? “translateY(-2px)” : “none”,
transition: “all 0.25s”,
cursor: “default”,
position: “relative”, overflow: “hidden”,
}}
>
<div style={{
position: “absolute”, right: -15, top: -15,
width: 80, height: 80, borderRadius: “50%”,
background: `radial-gradient(circle, ${color}18, transparent 70%)`,
pointerEvents: “none”,
}} />
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “flex-start”, marginBottom: 8 }}>
<span style={{ fontSize: 11, color: C.textMuted, textTransform: “uppercase”, letterSpacing: “0.08em”, fontWeight: 600 }}>{label}</span>
{icon && <span style={{ fontSize: 16, opacity: 0.7 }}>{icon}</span>}
</div>
<div style={{ fontSize: small ? 22 : 28, fontWeight: 800, color: color, fontFamily: “‘DM Serif Display’, Georgia, serif”, lineHeight: 1.1, marginBottom: 6 }}>
{value}
</div>
<div style={{ display: “flex”, alignItems: “center”, gap: 8 }}>
{sub && <span style={{ fontSize: 11, color: C.textMuted }}>{sub}</span>}
{d && <DeltaBadge {…d} />}
</div>
</div>
);
}

function SectionTitle({ children, accent = C.blueLight }) {
return (
<div style={{ display: “flex”, alignItems: “center”, gap: 12, marginBottom: 20 }}>
<div style={{ width: 3, height: 22, background: `linear-gradient(180deg, ${accent}, ${accent}44)`, borderRadius: 2 }} />
<h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: “0.04em”, textTransform: “uppercase” }}>
{children}
</h2>
</div>
);
}

function CustomTooltip({ active, payload, label }) {
if (!active || !payload?.length) return null;
return (
<div style={{
background: C.navy, border: `1px solid ${C.navyLight}`,
borderRadius: 10, padding: “10px 14px”, boxShadow: “0 8px 24px #000a”,
}}>
<div style={{ color: C.textMuted, fontSize: 11, marginBottom: 6 }}>{label}</div>
{payload.map((p, i) => (
<div key={i} style={{ color: p.color, fontSize: 13, fontWeight: 700 }}>
{p.name}: {typeof p.value === “number” && p.value > 999 ? fmt(p.value) : p.value}
</div>
))}
</div>
);
}

// ─── TABS ──────────────────────────────────────────────────────────────────────
const TABS = [
{ id: “resumen”,       label: “Resumen Ejecutivo”, icon: “⬡” },
{ id: “ventas”,        label: “Ventas”,            icon: “◈” },
{ id: “whatsapp”,      label: “WhatsApp”,          icon: “◎” },
{ id: “redes”,         label: “Redes Sociales”,    icon: “◇” },
{ id: “ads”,           label: “Ads”,               icon: “▲” },
{ id: “comparativo”,   label: “Comparativo”,       icon: “⊞” },
{ id: “oportunidades”, label: “Oportunidades”,     icon: “✦” },
];

// ─── PESTAÑA: RESUMEN EJECUTIVO ────────────────────────────────────────────────
function TabResumen({ mes, DATA }) {
const v = DATA.ventas[mes];
const w = DATA.whatsapp[mes];
const a = DATA.ads[mes];
const months = DATA.months;
const vFeb = DATA.ventas[months[0]];
const vMar = DATA.ventas[months[months.length - 1]];
const wFeb = DATA.whatsapp[months[0]];
const wMar = DATA.whatsapp[months[months.length - 1]];

const interpretacion = mes === “2026-03”
? “Marzo 2026 registró el mayor crecimiento mensual desde el inicio de la estrategia digital: +46.3% en ingresos y +37% en ticket promedio. La primera campaña de Meta Ads generó 90 conversaciones con un ROAS estimado de 17.7x. WhatsApp consolidó su posición como canal comercial principal, mejorando la tasa de conversión del 15.7% al 26.6% y reduciendo el tiempo de primera respuesta de 62 a 19 minutos. El segmento institucional (ITSON, UNISON, Grupo Aceites del Mayo) representó las órdenes de mayor volumen del mes.”
: “Febrero 2026 marcó el arranque de la estrategia digital de BordaXpress sin inversión publicitaria. Los 94 pedidos y $171,064 MXN en ingresos reflejan la base operativa real del negocio. WhatsApp generó el 68% de las órdenes del mes con una tasa de conversión del 15.7%. El canal de tienda física aportó el 32% restante. Base sólida para escalar con publicidad pagada.”;

const ingFeb = vFeb.ingresos;
const ingMar = vMar.ingresos;

const chartData = months.map((m) => ({
mes: DATA.labels[m].slice(0, 3),
ingresos: DATA.ventas[m].ingresos,
ordenes: DATA.ventas[m].ordenes,
}));

return (
<div style={{ display: “flex”, flexDirection: “column”, gap: 24 }}>
<div style={{ display: “grid”, gridTemplateColumns: “repeat(4, 1fr)”, gap: 14 }}>
<KPICard label=“Ingresos del Mes” value={fmt(v.ingresos)} icon=“💰” color={C.greenLight}
sub=“MXN total” d={{ feb: ingFeb, mar: ingMar }} />
<KPICard label=“Ordenes Cerradas” value={fmtN(v.ordenes)} icon=“📦” color={C.blueLight}
sub=“pedidos” d={{ feb: vFeb.ordenes, mar: vMar.ordenes }} />
<KPICard label=“Ticket Promedio” value={fmt(v.ingresos / v.ordenes)} icon=“🎯” color={C.goldLight}
sub=“por orden” d={{ feb: ingFeb / vFeb.ordenes, mar: ingMar / vMar.ordenes }} />
<KPICard label=“Mensajes WhatsApp” value={fmtN(w.mensajes)} icon=“💬” color={C.tealLight}
sub=“total mes” d={{ feb: wFeb.mensajes, mar: wMar.mensajes }} />
</div>

```
  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
    <KPICard label="Conversion WA" value={fmtPct(w.tasaConv)} icon="📈" color={C.greenLight}
      sub="estimada" d={{ feb: wFeb.tasaConv, mar: wMar.tasaConv }} />
    <KPICard label="Inversion Ads" value={a ? fmt(a.inversion) : "$0"} icon="📣" color={C.goldLight}
      sub={a ? "Meta Ads" : "Sin campana"} />
    <KPICard label="ROAS Directo" value={a ? `${a.roasDirecto.toFixed(1)}x` : "—"} icon="⚡" color={C.blueLight}
      sub={a ? "retorno comprobado" : "sin datos"} />
    <KPICard label="ROAS Estimado" value={a ? `${a.roasEstimado.toFixed(1)}x` : "—"} icon="🚀" color={C.greenLight}
      sub={a ? "con atribucion WA" : "sin datos"} />
  </div>

  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
    <Card>
      <SectionTitle accent={C.greenLight}>Ingresos por Mes</SectionTitle>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.navyLight + "44"} />
          <XAxis dataKey="mes" tick={{ fill: C.textMuted, fontSize: 12 }} />
          <YAxis tick={{ fill: C.textMuted, fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="ingresos" name="Ingresos" fill={C.blueLight} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>

    <Card>
      <SectionTitle accent={C.tealLight}>Interpretacion del Periodo</SectionTitle>
      <p style={{ color: C.textMuted, fontSize: 13, lineHeight: 1.75, margin: 0, fontStyle: "normal", letterSpacing: "0.01em" }}>
        {interpretacion}
      </p>
    </Card>
  </div>

  <Card>
    <SectionTitle accent={C.goldLight}>Distribucion por Canal de Origen</SectionTitle>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
      <KPICard small label="WhatsApp" value={fmtN(v.whatsapp)} sub="ordenes via WA"
        color={C.tealLight} icon="💬"
        d={{ feb: vFeb.whatsapp, mar: vMar.whatsapp }} />
      <KPICard small label="Tienda Fisica" value={fmtN(v.tienda)} sub="ordenes presenciales"
        color={C.goldLight} icon="🏪"
        d={{ feb: vFeb.tienda, mar: vMar.tienda, inverse: true }} />
      <KPICard small label="% Canal Digital" value={`${((v.whatsapp / v.ordenes) * 100).toFixed(1)}%`}
        sub="de ordenes totales" color={C.blueLight} icon="📱" />
    </div>
  </Card>
</div>
```

);
}

// ─── PESTAÑA: VENTAS ───────────────────────────────────────────────────────────
function TabVentas({ mes, DATA }) {
const v = DATA.ventas[mes];
const servicios = DATA.servicios[mes];
const months = DATA.months;
const vFeb = DATA.ventas[months[0]];
const vMar = DATA.ventas[months[months.length - 1]];

const canalData = [
{ name: “WhatsApp”,     value: v.whatsapp, fill: C.tealLight },
{ name: “Tienda Fisica”, value: v.tienda,   fill: C.goldLight },
];

const topServicios = […servicios].sort((a, b) => b.valor - a.valor).slice(0, 5);

return (
<div style={{ display: “flex”, flexDirection: “column”, gap: 20 }}>
<div style={{ display: “grid”, gridTemplateColumns: “repeat(3, 1fr)”, gap: 14 }}>
<KPICard label=“Ingresos Totales” value={fmt(v.ingresos)} color={C.greenLight} icon=“💰”
sub=“MXN” d={{ feb: vFeb.ingresos, mar: vMar.ingresos }} />
<KPICard label=“Ordenes” value={fmtN(v.ordenes)} color={C.blueLight} icon=“📦”
d={{ feb: vFeb.ordenes, mar: vMar.ordenes }} />
<KPICard label=“Ticket Promedio” value={fmt(v.ingresos / v.ordenes)} color={C.goldLight} icon=“🎯”
d={{ feb: vFeb.ingresos / vFeb.ordenes, mar: vMar.ingresos / vMar.ordenes }} />
</div>

```
  <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
    <Card>
      <SectionTitle accent={C.blueLight}>Ingresos por Servicio</SectionTitle>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={servicios} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke={C.navyLight + "33"} horizontal={false} />
          <XAxis type="number" tick={{ fill: C.textMuted, fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <YAxis dataKey="name" type="category" tick={{ fill: C.text, fontSize: 11 }} width={90} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="valor" name="Ingresos" radius={[0, 6, 6, 0]}>
            {servicios.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>

    <Card>
      <SectionTitle accent={C.tealLight}>Canal de Origen</SectionTitle>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={canalData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
            paddingAngle={3} dataKey="value">
            {canalData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: C.textMuted, fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
        {canalData.map((c, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.fill }} />
              <span style={{ color: C.textMuted, fontSize: 12 }}>{c.name}</span>
            </div>
            <span style={{ color: C.text, fontWeight: 700, fontSize: 13 }}>{c.value} ordenes</span>
          </div>
        ))}
      </div>
    </Card>
  </div>

  <Card>
    <SectionTitle accent={C.goldLight}>Top 5 Servicios por Ingreso</SectionTitle>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {topServicios.map((s, i) => {
        const pct = (s.valor / v.ingresos * 100).toFixed(1);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: CHART_COLORS[i] + "22",
              border: `1px solid ${CHART_COLORS[i]}44`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: CHART_COLORS[i], fontWeight: 800, fontSize: 12,
            }}>
              {i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{s.name}</span>
                <span style={{ color: CHART_COLORS[i], fontSize: 13, fontWeight: 700 }}>{fmt(s.valor)}</span>
              </div>
              <div style={{ height: 4, background: C.navyLight, borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${pct}%`, background: CHART_COLORS[i], borderRadius: 2, transition: "width 0.8s ease" }} />
              </div>
            </div>
            <span style={{ color: C.textMuted, fontSize: 11, width: 40, textAlign: "right" }}>{pct}%</span>
          </div>
        );
      })}
    </div>
  </Card>
</div>
```

);
}

// ─── PESTAÑA: WHATSAPP ─────────────────────────────────────────────────────────
function TabWhatsApp({ mes, DATA }) {
const w = DATA.whatsapp[mes];
const months = DATA.months;
const wFeb = DATA.whatsapp[months[0]];
const wMar = DATA.whatsapp[months[months.length - 1]];

const funnel = [
{ name: “Mensajes Totales”,        value: w.mensajes,        fill: C.blueLight },
{ name: “Con Intencion de Compra”, value: w.intencion,       fill: C.tealLight },
{ name: “Ventas Confirmadas”,      value: w.ventas ?? “N/C”, fill: C.greenLight },
];

const tendenciaData = months.map((m) => ({
mes: DATA.labels[m].slice(0, 3),
mensajes: DATA.whatsapp[m].mensajes,
intencion: DATA.whatsapp[m].intencion,
conv: DATA.whatsapp[m].tasaConv,
}));

return (
<div style={{ display: “flex”, flexDirection: “column”, gap: 20 }}>
<div style={{ display: “grid”, gridTemplateColumns: “repeat(4, 1fr)”, gap: 14 }}>
<KPICard label=“Mensajes Totales” value={fmtN(w.mensajes)} color={C.blueLight} icon=“💬”
d={{ feb: wFeb.mensajes, mar: wMar.mensajes }} />
<KPICard label=“Promedio Diario” value={w.promedioDiario} color={C.tealLight} icon=“📊”
d={{ feb: wFeb.promedioDiario, mar: wMar.promedioDiario }} />
<KPICard label=“Con Intencion” value={fmtN(w.intencion)} color={C.goldLight} icon=“🎯”
sub=“conversaciones” d={{ feb: wFeb.intencion, mar: wMar.intencion }} />
<KPICard label=“Tasa Conversion” value={fmtPct(w.tasaConv)} color={C.greenLight} icon=“✅”
d={{ feb: wFeb.tasaConv, mar: wMar.tasaConv }} />
</div>

```
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
    <Card>
      <SectionTitle accent={C.tealLight}>Embudo de Conversion WA</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
        {funnel.map((f, i) => {
          const pct = typeof f.value === "number" ? ((f.value / w.mensajes) * 100).toFixed(1) : null;
          return (
            <div key={i} style={{
              background: `${f.fill}11`, border: `1px solid ${f.fill}33`,
              borderRadius: 12, padding: "14px 18px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: C.textMuted, fontSize: 12 }}>{f.name}</span>
                <span style={{ color: f.fill, fontWeight: 800, fontSize: 18 }}>
                  {typeof f.value === "number" ? fmtN(f.value) : f.value}
                </span>
              </div>
              {pct && (
                <div style={{ height: 6, background: C.navyLight, borderRadius: 3 }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: f.fill, borderRadius: 3, transition: "width 0.8s ease" }} />
                </div>
              )}
              {pct && <div style={{ color: C.textMuted, fontSize: 10, marginTop: 4 }}>{pct}% del total</div>}
            </div>
          );
        })}
      </div>
    </Card>

    <Card>
      <SectionTitle accent={C.blueLight}>Tiempos de Respuesta</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
        <div style={{ background: `${C.goldLight}11`, border: `1px solid ${C.goldLight}33`, borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ color: C.textMuted, fontSize: 11, marginBottom: 4 }}>PRIMERA RESPUESTA</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 36, fontWeight: 800, color: w.t1Resp <= 20 ? C.greenLight : C.goldLight, fontFamily: "'DM Serif Display', Georgia, serif" }}>
              {w.t1Resp}
            </span>
            <span style={{ color: C.textMuted, fontSize: 14 }}>minutos</span>
          </div>
          <div style={{ color: C.textMuted, fontSize: 11, marginTop: 4 }}>
            {w.t1Resp <= 20 ? "Excelente — por debajo del benchmark" : "Oportunidad de mejora — meta: <20 min"}
          </div>
        </div>
        <div style={{ background: `${C.tealLight}11`, border: `1px solid ${C.tealLight}33`, borderRadius: 12, padding: "16px 20px" }}>
          <div style={{ color: C.textMuted, fontSize: 11, marginBottom: 4 }}>DURACION CONV. ACTIVA</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 36, fontWeight: 800, color: C.tealLight, fontFamily: "'DM Serif Display', Georgia, serif" }}>
              {w.tConvActiva}
            </span>
            <span style={{ color: C.textMuted, fontSize: 14 }}>minutos</span>
          </div>
        </div>
        <div style={{ background: `${C.blueLight}11`, border: `1px solid ${C.blueLight}33`, borderRadius: 12, padding: "14px 18px" }}>
          <div style={{ color: C.textMuted, fontSize: 11, marginBottom: 4 }}>% MENSAJES CON INTENCION</div>
          <span style={{ fontSize: 28, fontWeight: 800, color: C.blueLight, fontFamily: "'DM Serif Display', Georgia, serif" }}>
            {w.pctIntencion}%
          </span>
        </div>
      </div>
    </Card>
  </div>

  <Card>
    <SectionTitle accent={C.goldLight}>Tendencia mensual</SectionTitle>
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={tendenciaData}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.navyLight + "44"} />
        <XAxis dataKey="mes" tick={{ fill: C.textMuted, fontSize: 12 }} />
        <YAxis tick={{ fill: C.textMuted, fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ color: C.textMuted, fontSize: 12 }} />
        <Line type="monotone" dataKey="mensajes" name="Mensajes" stroke={C.blueLight} strokeWidth={2.5} dot={{ r: 5, fill: C.blueLight }} />
        <Line type="monotone" dataKey="intencion" name="Intencion" stroke={C.tealLight} strokeWidth={2.5} dot={{ r: 5, fill: C.tealLight }} />
      </LineChart>
    </ResponsiveContainer>
  </Card>
</div>
```

);
}

// ─── PESTAÑA: REDES SOCIALES ───────────────────────────────────────────────────
function TabRedes({ mes, DATA }) {
const r = DATA.redes[mes];
const months = DATA.months;
const rFeb = DATA.redes[months[0]];
const rMar = DATA.redes[months[months.length - 1]];

const segData = months.map((m) => ({
mes: DATA.labels[m].slice(0, 3),
ig: DATA.redes[m].ig.segNuevos,
fb: DATA.redes[m].fb.segNuevos,
}));

const visData = months.map((m) => ({
mes: DATA.labels[m].slice(0, 3),
ig: DATA.redes[m].ig.vis ?? 0,
fb: DATA.redes[m].fb.vis ?? 0,
}));

const metricCards = [
{ label: “IG Seguidores Nuevos”, val: r.ig.segNuevos, feb: rFeb.ig.segNuevos, mar: rMar.ig.segNuevos, color: C.goldLight, icon: “📸” },
{ label: “FB Seguidores Nuevos”, val: r.fb.segNuevos, feb: rFeb.fb.segNuevos, mar: rMar.fb.segNuevos, color: C.blueLight, icon: “👥” },
{ label: “IG Visitas al Perfil”,  val: r.ig.visitas,  feb: rFeb.ig.visitas,   mar: rMar.ig.visitas,   color: C.tealLight, icon: “👁” },
{ label: “FB Visualizaciones”,   val: r.fb.vis,       feb: rFeb.fb.vis,       mar: rMar.fb.vis,       color: C.greenLight, icon: “▶” },
];

return (
<div style={{ display: “flex”, flexDirection: “column”, gap: 20 }}>
<div style={{ display: “grid”, gridTemplateColumns: “repeat(4, 1fr)”, gap: 14 }}>
{metricCards.map((m, i) => (
<KPICard key={i} label={m.label} value={m.val != null ? fmtN(m.val) : “N/D”}
color={m.color} icon={m.icon}
d={m.feb != null && m.mar != null ? { feb: m.feb, mar: m.mar } : undefined} />
))}
</div>

```
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
    <Card>
      <SectionTitle accent={C.blueLight}>Seguidores Nuevos por Plataforma</SectionTitle>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={segData}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.navyLight + "33"} />
          <XAxis dataKey="mes" tick={{ fill: C.textMuted, fontSize: 12 }} />
          <YAxis tick={{ fill: C.textMuted, fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: C.textMuted, fontSize: 12 }} />
          <Bar dataKey="ig" name="Instagram" fill={C.goldLight} radius={[4, 4, 0, 0]} />
          <Bar dataKey="fb" name="Facebook"  fill={C.blueLight} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>

    <Card>
      <SectionTitle accent={C.tealLight}>Visualizaciones Totales</SectionTitle>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={visData}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.navyLight + "33"} />
          <XAxis dataKey="mes" tick={{ fill: C.textMuted, fontSize: 12 }} />
          <YAxis tick={{ fill: C.textMuted, fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: C.textMuted, fontSize: 12 }} />
          <Bar dataKey="ig" name="Instagram" fill={C.goldLight} radius={[4, 4, 0, 0]} />
          <Bar dataKey="fb" name="Facebook"  fill={C.blueLight} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  </div>

  <Card>
    <SectionTitle accent={C.goldLight}>Detalle por Plataforma — {DATA.labels[mes]}</SectionTitle>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {[
        { key: "ig", label: "Instagram", color: C.goldLight, icon: "📸", data: r.ig },
        { key: "fb", label: "Facebook",  color: C.blueLight, icon: "👥", data: r.fb },
      ].map(({ label, color, icon, data }) => (
        <div key={label} style={{ background: `${color}08`, border: `1px solid ${color}22`, borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span style={{ color: color, fontWeight: 700, fontSize: 15 }}>{label}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              ["Visualizaciones", data.vis],
              ["Alcance",         data.alcance],
              ["Interacciones",   data.inter],
              ["Seg. Nuevos",     data.segNuevos],
              ["Visitas Perfil",  data.visitas],
              ["Clics",           data.clics],
            ].map(([k, v], i) => (
              <div key={i} style={{ borderBottom: `1px solid ${color}18`, paddingBottom: 6 }}>
                <div style={{ color: C.textMuted, fontSize: 10, marginBottom: 2 }}>{k}</div>
                <div style={{ color: v != null ? C.text : C.textMuted, fontWeight: v != null ? 700 : 400, fontSize: 14 }}>
                  {v != null ? fmtN(v) : "N/D"}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </Card>
</div>
```

);
}

// ─── PESTAÑA: ADS ──────────────────────────────────────────────────────────────
function TabAds({ mes, DATA }) {
const a = DATA.ads[mes];

if (!a) {
return (
<Card style={{ textAlign: “center”, padding: “60px 40px” }}>
<div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
<div style={{ color: C.text, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Sin campana en este periodo</div>
<div style={{ color: C.textMuted, fontSize: 14 }}>No hubo inversion publicitaria en {DATA.labels[mes]}.</div>
<div style={{ color: C.textMuted, fontSize: 14, marginTop: 8 }}>La primera campana de Meta Ads se activo en Marzo 2026.</div>
</Card>
);
}

const roasData = [
{ name: “Inversion”,          value: a.inversion,          fill: C.redLight   },
{ name: “Ingresos Directos”,  value: a.ingresosDirectos,   fill: C.blueLight  },
{ name: “Ingresos Estimados”, value: a.ingresosEstimados,  fill: C.greenLight },
];

return (
<div style={{ display: “flex”, flexDirection: “column”, gap: 20 }}>
<div style={{ display: “grid”, gridTemplateColumns: “repeat(4, 1fr)”, gap: 14 }}>
<KPICard label="Inversion Total"  value={fmt(a.inversion)}              color={C.goldLight}  icon="💸" sub="Meta Ads" />
<KPICard label="Clics Generados"  value={fmtN(a.clics)}                 color={C.blueLight}  icon="👆" />
<KPICard label="Conversaciones"   value={fmtN(a.conversaciones)}        color={C.tealLight}  icon="💬" />
<KPICard label=“Costo por Conv.”  value={`$${a.costoPorConv.toFixed(2)}`} color={C.greenLight} icon=“🎯” />
</div>

```
  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
    <KPICard label="Ventas Directas"   value={fmtN(a.ventasDirectas)}        color={C.blueLight}  icon="✅" sub="atribuidas a Ads" />
    <KPICard label="Ingresos Directos" value={fmt(a.ingresosDirectos)}        color={C.greenLight} icon="💰" />
    <KPICard label="ROAS Directo"      value={`${a.roasDirecto.toFixed(1)}x`} color={C.tealLight}  icon="⚡" sub="retorno comprobado" />
    <KPICard label="ROAS Estimado"     value={`${a.roasEstimado.toFixed(1)}x`} color={C.goldLight}  icon="🚀" sub="con atribucion WA" />
  </div>

  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
    <Card>
      <SectionTitle accent={C.greenLight}>Inversion vs Retorno</SectionTitle>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={roasData}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.navyLight + "33"} />
          <XAxis dataKey="name" tick={{ fill: C.textMuted, fontSize: 11 }} />
          <YAxis tick={{ fill: C.textMuted, fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" name="Monto" radius={[6, 6, 0, 0]}>
            {roasData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>

    <Card>
      <SectionTitle accent={C.goldLight}>Analisis de Rendimiento</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { label: "Tasa de clic (CTR estimado)", val: `${((a.clics / 5000) * 100).toFixed(2)}%`,                               note: "clics / alcance estimado",    color: C.blueLight  },
          { label: "Conversaciones / Clics",       val: `${((a.conversaciones / a.clics) * 100).toFixed(1)}%`,                   note: "eficiencia post-clic",         color: C.tealLight  },
          { label: "Ventas directas / Conv.",      val: `${((a.ventasDirectas / a.conversaciones) * 100).toFixed(1)}%`,           note: "cierre directo Ads",           color: C.greenLight },
          { label: "ROI neto estimado",            val: `+${(((a.ingresosEstimados - a.inversion) / a.inversion) * 100).toFixed(0)}%`, note: "sobre inversion de $1,270", color: C.goldLight  },
        ].map((m, i) => (
          <div key={i} style={{ background: `${m.color}11`, border: `1px solid ${m.color}22`, borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: C.textMuted, fontSize: 11 }}>{m.label}</div>
                <div style={{ color: C.textMuted, fontSize: 10 }}>{m.note}</div>
              </div>
              <span style={{ color: m.color, fontWeight: 800, fontSize: 20, fontFamily: "'DM Serif Display', Georgia, serif" }}>
                {m.val}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
</div>
```

);
}

// ─── PESTAÑA: COMPARATIVO ──────────────────────────────────────────────────────
function TabComparativo({ DATA }) {
const months = DATA.months;
const vFeb = DATA.ventas[months[0]];
const vMar = DATA.ventas[months[months.length - 1]];
const wFeb = DATA.whatsapp[months[0]];
const wMar = DATA.whatsapp[months[months.length - 1]];
const rFeb = DATA.redes[months[0]];
const rMar = DATA.redes[months[months.length - 1]];
const adsMar = DATA.ads[months[months.length - 1]];

const comparativo = [
{ categoria: “💰 Ventas”,         metrica: “Ingresos Totales”,     feb: vFeb.ingresos,                  mar: vMar.ingresos,                  fmt: fmt     },
{ categoria: “💰 Ventas”,         metrica: “Ordenes”,              feb: vFeb.ordenes,                   mar: vMar.ordenes,                   fmt: fmtN    },
{ categoria: “💰 Ventas”,         metrica: “Ticket Promedio”,      feb: vFeb.ingresos / vFeb.ordenes,   mar: vMar.ingresos / vMar.ordenes,   fmt: fmt     },
{ categoria: “💬 WhatsApp”,       metrica: “Mensajes Totales”,     feb: wFeb.mensajes,                  mar: wMar.mensajes,                  fmt: fmtN    },
{ categoria: “💬 WhatsApp”,       metrica: “Tasa Conversion”,      feb: wFeb.tasaConv,                  mar: wMar.tasaConv,                  fmt: fmtPct  },
{ categoria: “💬 WhatsApp”,       metrica: “Tiempo 1a Respuesta”,  feb: wFeb.t1Resp,                    mar: wMar.t1Resp,                    fmt: (v) => `${v} min`, inverse: true },
{ categoria: “📱 Redes Sociales”, metrica: “IG Seguidores Nuevos”, feb: rFeb.ig.segNuevos,              mar: rMar.ig.segNuevos,              fmt: fmtN    },
{ categoria: “📱 Redes Sociales”, metrica: “FB Seguidores Nuevos”, feb: rFeb.fb.segNuevos,              mar: rMar.fb.segNuevos,              fmt: fmtN    },
{ categoria: “📱 Redes Sociales”, metrica: “FB Visualizaciones”,   feb: rFeb.fb.vis,                    mar: rMar.fb.vis,                    fmt: fmtN    },
{ categoria: “📣 Ads”,           metrica: “Inversion”,            feb: 0,                              mar: adsMar ? adsMar.inversion : 0,  fmt: fmt     },
{ categoria: “📣 Ads”,           metrica: “ROAS Estimado”,        feb: null,                           mar: adsMar ? adsMar.roasEstimado : null, fmt: (v) => v ? `${v.toFixed(1)}x` : “—” },
];

const areaData = months.map((m) => ({
mes: DATA.labels[m].slice(0, 3),
ingresos: DATA.ventas[m].ingresos,
mensajes: DATA.whatsapp[m].mensajes * 200,
}));

const categorias = […new Set(comparativo.map((r) => r.categoria))];
const colors = {
“💰 Ventas”:         C.greenLight,
“💬 WhatsApp”:       C.tealLight,
“📱 Redes Sociales”: C.blueLight,
“📣 Ads”:           C.goldLight,
};

return (
<div style={{ display: “flex”, flexDirection: “column”, gap: 20 }}>
<Card>
<SectionTitle accent={C.blueLight}>Tendencia General — Ingresos vs Actividad Digital</SectionTitle>
<ResponsiveContainer width="100%" height={220}>
<AreaChart data={areaData}>
<defs>
<linearGradient id="gI" x1="0" y1="0" x2="0" y2="1">
<stop offset="5%"  stopColor={C.greenLight} stopOpacity={0.3} />
<stop offset="95%" stopColor={C.greenLight} stopOpacity={0}   />
</linearGradient>
<linearGradient id="gM" x1="0" y1="0" x2="0" y2="1">
<stop offset="5%"  stopColor={C.tealLight} stopOpacity={0.3} />
<stop offset="95%" stopColor={C.tealLight} stopOpacity={0}   />
</linearGradient>
</defs>
<CartesianGrid strokeDasharray=“3 3” stroke={C.navyLight + “44”} />
<XAxis dataKey=“mes” tick={{ fill: C.textMuted, fontSize: 12 }} />
<YAxis tick={{ fill: C.textMuted, fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
<Tooltip content={<CustomTooltip />} />
<Legend wrapperStyle={{ color: C.textMuted, fontSize: 12 }} />
<Area type="monotone" dataKey="ingresos" name="Ingresos"            stroke={C.greenLight} fill="url(#gI)" strokeWidth={2.5} />
<Area type="monotone" dataKey="mensajes" name="Actividad WA (x200)" stroke={C.tealLight}  fill="url(#gM)" strokeWidth={2.5} />
</AreaChart>
</ResponsiveContainer>
</Card>

```
  {categorias.map((cat) => (
    <Card key={cat}>
      <SectionTitle accent={colors[cat] || C.blueLight}>{cat}</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 0 }}>
        {["Metrica", "Febrero 2026", "Marzo 2026", "Variacion"].map((h, i) => (
          <div key={i} style={{
            padding: "8px 12px", background: C.navyLight + "55",
            color: C.textMuted, fontSize: 11, fontWeight: 700, textTransform: "uppercase",
            borderBottom: `1px solid ${C.navyLight}`,
            textAlign: i > 0 ? "center" : "left",
          }}>{h}</div>
        ))}
        {comparativo.filter((r) => r.categoria === cat).map((row, i) => {
          const d = row.feb != null && row.mar != null ? delta(row.feb, row.mar) : null;
          const positive = d !== null ? (row.inverse ? parseFloat(d) <= 0 : parseFloat(d) >= 0) : null;
          const bg = i % 2 === 0 ? "transparent" : C.navyLight + "22";
          return [
            <div key={`l${i}`} style={{ padding: "10px 12px", background: bg, color: C.text, fontSize: 13, borderBottom: `1px solid ${C.navyLight}33` }}>
              {row.metrica}
            </div>,
            <div key={`f${i}`} style={{ padding: "10px 12px", background: bg, color: C.textMuted, fontSize: 13, fontWeight: 600, textAlign: "center", borderBottom: `1px solid ${C.navyLight}33` }}>
              {row.feb != null ? row.fmt(row.feb) : "—"}
            </div>,
            <div key={`m${i}`} style={{ padding: "10px 12px", background: bg, color: C.text, fontSize: 13, fontWeight: 700, textAlign: "center", borderBottom: `1px solid ${C.navyLight}33` }}>
              {row.mar != null ? row.fmt(row.mar) : "—"}
            </div>,
            <div key={`d${i}`} style={{ padding: "10px 12px", background: bg, textAlign: "center", borderBottom: `1px solid ${C.navyLight}33`, display: "flex", justifyContent: "center", alignItems: "center" }}>
              {d !== null ? (
                <span style={{ color: positive ? C.greenLight : C.redLight, fontWeight: 700, fontSize: 12 }}>
                  {positive ? "▲" : "▼"} {Math.abs(parseFloat(d))}%
                </span>
              ) : <span style={{ color: C.textMuted, fontSize: 12 }}>—</span>}
            </div>,
          ];
        })}
      </div>
    </Card>
  ))}
</div>
```

);
}

// ─── PESTAÑA: OPORTUNIDADES ────────────────────────────────────────────────────
function TabOportunidades() {
const insights = [
{
tipo: “Oportunidad”, prioridad: “ALTA”, color: C.greenLight,
titulo: “Escalar Meta Ads con presupuesto incremental”,
desc: “Con ROAS estimado de 17.7x en la primera campana, duplicar o triplicar la inversion ($2,500-$3,800 MXN) puede generar $25K-$75K adicionales sin cambios operativos. La primera campana valido el canal.”,
metrica: “ROAS 17.7x -> Potencial: $44,625 MXN con $2,520 inversion”,
accion: “Definir presupuesto mensual y segmentacion de audiencia para Abril.”,
},
{
tipo: “Oportunidad”, prioridad: “ALTA”, color: C.greenLight,
titulo: “Segmento institucional y empresarial (B2B)”,
desc: “ITSON, UNISON, Grupo Aceites del Mayo y Ramiro Chavez (98 piezas en una sola orden) representan ordenes de alto valor. Crear una propuesta comercial B2B con descuentos por volumen puede incrementar el ticket promedio un 30-50%.”,
metrica: “Ticket institucional promedio: ~$10,000-$37,570 vs $2,498 general”,
accion: “Disenar cotizador B2B y presentar a los 5 clientes institucionales activos.”,
},
{
tipo: “Oportunidad”, prioridad: “MEDIA”, color: C.tealLight,
titulo: “Catalogo digital en WhatsApp Business”,
desc: “Con 334 mensajes/mes y 91 conversaciones con intencion de compra, un catalogo oficial de servicios con precios reduce el ciclo de venta, acorta el tiempo de respuesta y mejora la tasa de cierre.”,
metrica: “Tasa de conversion actual: 26.6% -> Meta: 35-40% con catalogo activo”,
accion: “Activar catalogo en WhatsApp Business con los 7 servicios principales y precios base.”,
},
{
tipo: “Oportunidad”, prioridad: “MEDIA”, color: C.tealLight,
titulo: “Programa de recompra para clientes recurrentes”,
desc: “Clientes como Rosalina Mendivil (4 ordenes en 2 meses), Andrea Gonzalez (5+ pedidos), Carlos Yocupicio y Jose Valenzuela representan mas del 20% de ordenes. Un recordatorio proactivo o descuento de recompra incrementaria la frecuencia.”,
metrica: “20%+ de clientes con 2+ compras -> Si recompran 1 vez mas: ~+$30K MXN”,
accion: “Crear lista de clientes recurrentes en WhatsApp y disenar mensaje de seguimiento.”,
},
{
tipo: “Atencion”, prioridad: “ALTA”, color: C.amber,
titulo: “Atribucion de ventas desde Ads no confirmada”,
desc: “Las 90 conversaciones generadas por Ads no tienen seguimiento de cierre verificado. El ROAS de 17.7x es estimado. Sin un sistema de tracking de origen (UTM o codigo de campana), no se puede medir el ROI real.”,
metrica: “Solo 11 ventas directas confirmadas de 90 conversaciones Ads (12.2% cierre)”,
accion: “Implementar pregunta estandar como nos conociste en WhatsApp y registrar en hoja.”,
},
{
tipo: “Atencion”, prioridad: “MEDIA”, color: C.amber,
titulo: “Tiempo de primera respuesta WA aun mejorable”,
desc: “Aunque bajo de 62 a 19 minutos (-69%), el benchmark de alta conversion es menos de 5 minutos. Cada minuto adicional en la primera respuesta reduce la probabilidad de cierre. Meta: respuesta automatica en menos de 2 min + humana en menos de 10 min.”,
metrica: “Feb: 62 min -> Mar: 19 min -> Meta Abril: menos de 10 min”,
accion: “Activar mensaje automatico de bienvenida en WhatsApp Business con menu de opciones.”,
},
{
tipo: “Atencion”, prioridad: “BAJA”, color: C.blueLight,
titulo: “Datos de Instagram incompletos en Marzo”,
desc: “No se tienen visualizaciones ni alcance de Instagram para Marzo 2026. Esto impide analizar el impacto de los Ads en la plataforma y tomar decisiones de contenido.”,
metrica: “IG Marzo: 3 de 6 metricas sin dato”,
accion: “Conectar Meta Business Suite y exportar informe completo el primer dia habil de cada mes.”,
},
];

const prioColors = { ALTA: C.redLight, MEDIA: C.amber, BAJA: C.blueLight };

return (
<div style={{ display: “flex”, flexDirection: “column”, gap: 16 }}>
<Card style={{ padding: “16px 22px” }}>
<div style={{ display: “grid”, gridTemplateColumns: “repeat(3, 1fr)”, gap: 16 }}>
{[
{ label: “Oportunidades identificadas”, val: 4, color: C.greenLight },
{ label: “Puntos de atencion”,          val: 3, color: C.amber      },
{ label: “Acciones sugeridas”,          val: 7, color: C.blueLight  },
].map((s, i) => (
<div key={i} style={{ textAlign: “center” }}>
<div style={{ fontSize: 36, fontWeight: 800, color: s.color, fontFamily: “‘DM Serif Display’, Georgia, serif” }}>{s.val}</div>
<div style={{ color: C.textMuted, fontSize: 12 }}>{s.label}</div>
</div>
))}
</div>
</Card>

```
  {insights.map((ins, i) => (
    <Card key={i} style={{ padding: "18px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: ins.color }}>{ins.tipo}</span>
          <div style={{ width: 1, height: 14, background: C.navyLight }} />
          <span style={{ color: ins.color, fontWeight: 700, fontSize: 13 }}>{ins.titulo}</span>
        </div>
        <span style={{
          background: prioColors[ins.prioridad] + "22",
          color: prioColors[ins.prioridad],
          border: `1px solid ${prioColors[ins.prioridad]}44`,
          borderRadius: 6, padding: "2px 10px", fontSize: 10, fontWeight: 800,
          letterSpacing: "0.06em",
        }}>
          PRIORIDAD {ins.prioridad}
        </span>
      </div>
      <p style={{ color: C.textMuted, fontSize: 13, lineHeight: 1.65, margin: "0 0 10px 0" }}>{ins.desc}</p>
      <div style={{ background: `${ins.color}0d`, border: `1px solid ${ins.color}22`, borderRadius: 8, padding: "8px 14px", marginBottom: 10 }}>
        <span style={{ color: ins.color, fontSize: 12, fontWeight: 700 }}>📊 {ins.metrica}</span>
      </div>
      <div style={{ background: C.navyLight + "33", borderRadius: 8, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: C.tealLight, fontSize: 11 }}>▶</span>
        <span style={{ color: C.text, fontSize: 12 }}>{ins.accion}</span>
      </div>
    </Card>
  ))}
</div>
```

);
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function App() {
const [activeTab, setActiveTab] = useState(“resumen”);
const [mes, setMes] = useState(null);
const [DATA, setDATA] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
async function fetchData() {
const { data, error } = await supabase
.from(“monthly_reports”)
.select(”*”)
.order(“month”, { ascending: true });

```
  if (error) {
    console.error("Error cargando datos:", error);
    setLoading(false);
    return;
  }

  const months   = data.map((r) => r.month);
  const labels   = Object.fromEntries(data.map((r) => [r.month, r.label]));
  const ventas   = Object.fromEntries(data.map((r) => [r.month, r.ventas]));
  const servicios = Object.fromEntries(data.map((r) => [r.month, r.servicios]));
  const whatsapp = Object.fromEntries(data.map((r) => [r.month, r.whatsapp]));
  const redes    = Object.fromEntries(data.map((r) => [r.month, r.redes]));
  const ads      = Object.fromEntries(data.map((r) => [r.month, r.ads ?? null]));

  setDATA({ months, labels, ventas, servicios, whatsapp, redes, ads });
  setMes(months[months.length - 1]);
  setLoading(false);
}

fetchData();
```

}, []);

if (loading) {
return (
<div style={{
minHeight: “100vh”, display: “flex”, alignItems: “center”, justifyContent: “center”,
background: “#0F1E35”, color: “#94A3B8”, fontSize: 14,
letterSpacing: “0.06em”, fontFamily: “system-ui, sans-serif”,
}}>
CARGANDO DATOS…
</div>
);
}

if (!DATA || !mes) {
return (
<div style={{
minHeight: “100vh”, display: “flex”, alignItems: “center”, justifyContent: “center”,
background: “#0F1E35”, color: “#EF4444”, fontSize: 14,
fontFamily: “system-ui, sans-serif”,
}}>
No se pudieron cargar los datos.
</div>
);
}

const tabContent = {
resumen:       <TabResumen      mes={mes} DATA={DATA} />,
ventas:        <TabVentas       mes={mes} DATA={DATA} />,
whatsapp:      <TabWhatsApp     mes={mes} DATA={DATA} />,
redes:         <TabRedes        mes={mes} DATA={DATA} />,
ads:           <TabAds          mes={mes} DATA={DATA} />,
comparativo:   <TabComparativo  DATA={DATA} />,
oportunidades: <TabOportunidades />,
};

return (
<div style={{
minHeight: “100vh”,
background: `linear-gradient(160deg, ${C.navy} 0%, #0A1525 50%, #0B1E33 100%)`,
fontFamily: “‘Outfit’, ‘DM Sans’, system-ui, sans-serif”,
color: C.text,
}}>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=DM+Serif+Display&display=swap" rel="stylesheet" />

```
  {/* Header */}
  <div style={{
    background: `linear-gradient(90deg, ${C.navyMid} 0%, ${C.navyLight}88 100%)`,
    borderBottom: `1px solid ${C.navyLight}`,
    padding: "0 32px",
    position: "sticky", top: 0, zIndex: 100,
    backdropFilter: "blur(16px)",
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `linear-gradient(135deg, ${C.blue}, ${C.teal})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 16px ${C.blue}55`,
          fontSize: 16, fontWeight: 900, color: C.white,
        }}>B</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.white, letterSpacing: "0.06em" }}>
            CENTRO DE CONTROL COMERCIAL
          </div>
          <div style={{ fontSize: 10, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            BordaXpress · Sistema Ejecutivo
          </div>
        </div>
      </div>

      {/* Selector de mes */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: C.textMuted, fontSize: 11, letterSpacing: "0.06em" }}>PERIODO</span>
        <div style={{ display: "flex", background: C.navyLight + "66", borderRadius: 8, padding: 3 }}>
          {DATA.months.map((m) => (
            <button key={m} onClick={() => setMes(m)} style={{
              background: mes === m ? C.blueLight : "transparent",
              color: mes === m ? C.white : C.textMuted,
              border: "none", borderRadius: 6, padding: "5px 14px",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: mes === m ? `0 2px 8px ${C.blue}44` : "none",
            }}>
              {DATA.labels[m]}
            </button>
          ))}
        </div>
        <span style={{
          background: C.greenLight + "22", color: C.greenLight,
          border: `1px solid ${C.greenLight}44`,
          borderRadius: 6, padding: "3px 10px", fontSize: 10, fontWeight: 700,
          letterSpacing: "0.04em",
        }}>● EN VIVO</span>
      </div>
    </div>

    {/* Tabs */}
    <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
      {TABS.map((tab) => (
        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
          background: "transparent",
          color: activeTab === tab.id ? C.white : C.textMuted,
          border: "none",
          borderBottom: `2px solid ${activeTab === tab.id ? C.blueLight : "transparent"}`,
          padding: "12px 18px 10px",
          fontSize: 12, fontWeight: activeTab === tab.id ? 700 : 500,
          cursor: "pointer", whiteSpace: "nowrap",
          transition: "all 0.2s",
          display: "flex", alignItems: "center", gap: 6,
          letterSpacing: "0.02em",
        }}>
          <span style={{ opacity: activeTab === tab.id ? 1 : 0.6 }}>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  </div>

  {/* Contenido */}
  <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 60px" }}>
    {/* Breadcrumb */}
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
      <span style={{ color: C.textMuted, fontSize: 11 }}>BordaXpress CCC</span>
      <span style={{ color: C.navyLight, fontSize: 11 }}>›</span>
      <span style={{ color: C.blueLight, fontSize: 11, fontWeight: 600 }}>
        {TABS.find((t) => t.id === activeTab)?.label}
      </span>
      <span style={{ color: C.navyLight, fontSize: 11 }}>›</span>
      <span style={{ color: C.textMuted, fontSize: 11 }}>{DATA.labels[mes]} 2026</span>
    </div>

    {tabContent[activeTab]}
  </div>

  {/* Footer */}
  <div style={{
    borderTop: `1px solid ${C.navyLight}55`,
    padding: "16px 32px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  }}>
    <span style={{ color: C.textMuted, fontSize: 11 }}>
      BordaXpress CCC · Datos Feb-Mar 2026 · Uso interno — Direccion General
    </span>
    <span style={{ color: C.textMuted, fontSize: 11 }}>
      Ultima actualizacion: {DATA.labels[mes]} 2026
    </span>
  </div>
</div>
```

);
}
