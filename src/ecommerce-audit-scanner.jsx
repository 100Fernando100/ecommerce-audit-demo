import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────
// REVENUE LEAK DETECTOR — Multicomm.ai
// Lead-magnet scanner: prospect enters URL → AI audit → CTA
// ─────────────────────────────────────────────────────────────

const INDUSTRY_BENCHMARKS = {
  fashion: { cr: 2.3, aov: 65, speed: 2.8, label: "Fashion & Apparel" },
  beauty: { cr: 2.5, aov: 52, speed: 2.5, label: "Beauty & Skincare" },
  electronics: { cr: 1.8, aov: 120, speed: 3.1, label: "Electronics" },
  home: { cr: 2.1, aov: 85, speed: 2.9, label: "Home & Garden" },
  food: { cr: 3.2, aov: 38, speed: 2.3, label: "Food & Beverage" },
  sports: { cr: 2.0, aov: 72, speed: 2.7, label: "Sports & Outdoors" },
  general: { cr: 2.2, aov: 68, speed: 2.7, label: "General / Other" },
};

const SEV = {
  critical: { color: "#FF3B30", bg: "#FF3B3010", tag: "CRITICAL", icon: "⛔" },
  high: { color: "#FF9500", bg: "#FF950010", tag: "HIGH IMPACT", icon: "⚠️" },
  medium: { color: "#5AC8FA", bg: "#5AC8FA10", tag: "MEDIUM", icon: "ℹ️" },
  low: { color: "#636366", bg: "#63636610", tag: "LOW", icon: "💡" },
};

const LABELS = {
  en: {
    hero: "Revenue Leak Detector",
    heroSub: "Find out how much money your store is losing — in 30 seconds",
    placeholder: "Enter your store URL...",
    scan: "Scan My Store",
    scanning: "Analyzing...",
    poweredBy: "AI-Powered • CPA-Level Financial Diagnostics • Bilingual EN/ES",
    industry: "Industry",
    healthScore: "Store Health",
    findings: "Diagnostic Findings",
    quickWins: "Quick Wins — Do These First",
    crossBorder: "Cross-Border Compliance",
    revenueLeak: "Revenue Leak Calculator",
    revenueLeakSub: "Enter your store metrics to see what you're leaving on the table",
    currentRev: "Current Annual Revenue",
    projectedRev: "Projected Revenue",
    leakDetected: "Revenue Leak Detected",
    recovery: "Potential annual recovery by fixing identified issues",
    industryAvg: "Industry Avg CR",
    yourGap: "Your Gap vs Industry",
    visitors: "Monthly Visitors",
    currentCR: "Current CR (%)",
    avgOrder: "Avg Order Value ($)",
    cta: "Want to recover this revenue?",
    ctaSub: "Book a free 15-minute Growth Scan to review your full report",
    ctaBtn: "Book My Growth Scan",
    filterAll: "All", filterCritical: "Critical", filterHigh: "High",
    filterTrust: "Trust", filterUx: "UX", filterSpeed: "Speed", filterConversion: "Conversion",
    storeDetected: "issues detected",
    effortQuick: "Quick Win", effortMod: "Moderate", effortMajor: "Major Effort",
    problem: "Problem", impact: "Financial Impact", fix: "Recommended Fix",
    demoNote: "Demo mode — AI analysis available when connected to Claude API",
  },
  es: {
    hero: "Detector de Fugas de Ingresos",
    heroSub: "Descubrí cuánto dinero está perdiendo tu tienda — en 30 segundos",
    placeholder: "Ingresá la URL de tu tienda...",
    scan: "Escanear Mi Tienda",
    scanning: "Analizando...",
    poweredBy: "Impulsado por IA • Diagnóstico Financiero Nivel CPA • Bilingüe EN/ES",
    industry: "Industria",
    healthScore: "Salud de la Tienda",
    findings: "Hallazgos del Diagnóstico",
    quickWins: "Victorias Rápidas — Hacé Esto Primero",
    crossBorder: "Cumplimiento Transfronterizo",
    revenueLeak: "Calculadora de Fugas de Ingresos",
    revenueLeakSub: "Ingresá las métricas de tu tienda para ver cuánto estás dejando en la mesa",
    currentRev: "Ingresos Anuales Actuales",
    projectedRev: "Ingresos Proyectados",
    leakDetected: "Fuga de Ingresos Detectada",
    recovery: "Recuperación anual potencial al corregir los problemas identificados",
    industryAvg: "CR Promedio Industria",
    yourGap: "Tu Brecha vs Industria",
    visitors: "Visitantes Mensuales",
    currentCR: "CR Actual (%)",
    avgOrder: "Orden Promedio ($)",
    cta: "¿Querés recuperar estos ingresos?",
    ctaSub: "Agendá un Growth Scan gratuito de 15 minutos para revisar tu reporte completo",
    ctaBtn: "Agendar Mi Growth Scan",
    filterAll: "Todo", filterCritical: "Crítico", filterHigh: "Alto",
    filterTrust: "Confianza", filterUx: "UX", filterSpeed: "Velocidad", filterConversion: "Conversión",
    storeDetected: "problemas detectados",
    effortQuick: "Rápido", effortMod: "Moderado", effortMajor: "Esfuerzo Mayor",
    problem: "Problema", impact: "Impacto Financiero", fix: "Solución Recomendada",
    demoNote: "Modo demo — análisis IA disponible al conectar con Claude API",
  },
};

// ── Build AI Prompt ──────────────────────────────────────────
const buildPrompt = (url, industry) => `You are a senior e-commerce CRO auditor with CPA-level financial expertise.
Analyze this store: ${url} | Industry: ${industry}

Return ONLY valid JSON (no markdown, no backticks, no preamble):
{
  "store_name": "detected name",
  "platform": "Shopify/WooCommerce/Other",
  "findings": [
    {
      "id": "unique_id",
      "category": "trust|ux|performance|conversion|compliance",
      "severity": "critical|high|medium|low",
      "title": "Short title",
      "description": "What is wrong",
      "impact": "Financial impact explanation",
      "fix": "Specific actionable fix",
      "conversion_impact": 0.05,
      "effort": "low|medium|high"
    }
  ],
  "scores": { "trust": 0-100, "ux": 0-100, "performance": 0-100, "conversion": 0-100, "overall": 0-100 },
  "quick_wins": ["top 3 immediate actions with estimated impact"],
  "cross_border_flags": ["USMCA/Carta Porte/duty compliance issues if any"]
}
Be thorough and quantitative. At least 6-8 findings across categories.`;

// ── Demo fallback data ───────────────────────────────────────
const getDemoData = (url) => ({
  store_name: url ? url.replace(/https?:\/\//, "").replace(/\/$/, "") : "demo-store.myshopify.com",
  platform: "Shopify",
  findings: [
    { id: "f1", category: "trust", severity: "critical", title: "No Customer Reviews Widget", description: "Product pages lack any visible review system. Social proof is the #1 conversion driver — stores without reviews see 15-25% lower conversion.", impact: "At average traffic levels, this represents $18,000-$30,000 in lost annual revenue.", fix: "Install Judge.me or Loox. Enable automated review request emails 7 days post-delivery. Feature reviews above the fold on all product pages.", conversion_impact: 0.15, effort: "low" },
    { id: "f2", category: "performance", severity: "critical", title: "Page Load Exceeds 4s on Mobile", description: "Homepage loads in 4.2s on mobile (target: <2.5s). Each additional second reduces conversions by ~7%.", impact: "The 1.7s excess costs an estimated 12% conversion drop — approximately $22,000/year in lost revenue.", fix: "Compress images to WebP. Remove 3 detected inactive app scripts. Implement lazy loading for below-fold images.", conversion_impact: 0.12, effort: "medium" },
    { id: "f3", category: "ux", severity: "high", title: "Add to Cart Below Fold on Mobile", description: "Primary CTA requires scrolling on 60%+ of mobile devices. Mobile users who can't see the buy button immediately are 40% less likely to convert.", impact: "With mobile traffic at ~70% of total, this affects the majority of potential buyers.", fix: "Implement a sticky 'Add to Cart' bar on mobile. Use Dawn theme's sticky-ATC feature or install a sticky cart app.", conversion_impact: 0.08, effort: "low" },
    { id: "f4", category: "trust", severity: "high", title: "Return Policy Buried 3+ Clicks Deep", description: "Refund/return policy not linked from product page or footer. Customers who can't quickly verify return options abandon carts at 2x the normal rate.", impact: "Visible return policies increase conversion by 8-12%. Major trust barrier at checkout.", fix: "Add 'Free Returns' or 'Easy Returns' badge on product pages near price. Link policy in footer and cart page.", conversion_impact: 0.09, effort: "low" },
    { id: "f5", category: "conversion", severity: "high", title: "No Urgency or Scarcity Signals", description: "No stock counters, limited-time offers, or shipping deadline indicators. These triggers increase add-to-cart rates by 5-15%.", impact: "Missing urgency = browsers who 'plan to come back' but never do. Estimated 6% lost conversions.", fix: "Add 'Only X left' indicators. Show 'Order within X hours for next-day delivery' countdown. Use subtle 'X people viewing' indicator.", conversion_impact: 0.06, effort: "low" },
    { id: "f6", category: "trust", severity: "medium", title: "Payment Badges Missing at Checkout", description: "Checkout doesn't prominently display Visa/Mastercard/PayPal trust badges or SSL indicators near payment form.", impact: "18% of cart abandonment is attributed to security concerns. Badges reduce this by 5-10%.", fix: "Add payment method icons below checkout button. Display 'Secure Checkout' with padlock. Show SSL badge.", conversion_impact: 0.04, effort: "low" },
    { id: "f7", category: "performance", severity: "medium", title: "12 Third-Party App Scripts Detected", description: "Store loads scripts from 12 apps, many unused or redundant. Adds ~800KB JavaScript and 1.2s to page load.", impact: "Script bloat degrades Core Web Vitals, hurting both conversions and Google rankings simultaneously.", fix: "Audit all installed apps. Remove unused in last 30 days. Consolidate overlapping functionality.", conversion_impact: 0.05, effort: "medium" },
    { id: "f8", category: "compliance", severity: "medium", title: "Cross-Border Shipping Not DDP-Configured", description: "International rates use flat-rate estimates rather than duty-inclusive DDP pricing. Post-purchase surprise fees are the #1 cause of cross-border returns.", impact: "Non-DDP shipping results in 15-25% return rates vs 8% for DDP. Plus chargeback risk.", fix: "Configure DDP shipping via Zonos or Global-e. Ensure duty/tax calculations happen at checkout, not delivery.", conversion_impact: 0.03, effort: "high" },
  ],
  scores: { trust: 48, ux: 58, performance: 42, conversion: 55, overall: 51 },
  quick_wins: [
    "Install a reviews app (Judge.me) and enable automated requests — estimated +15% conversion lift",
    "Implement sticky Add-to-Cart on mobile — estimated +8% conversion lift",
    "Add visible return policy badge on product pages — estimated +9% conversion lift",
  ],
  cross_border_flags: [
    "Flat-rate international shipping detected — recommend DDP to avoid surprise fees and chargebacks",
    "No Carta Porte compliance indicators for Mexico-bound shipments — critical for CFDI 4.0 / Carta Porte 3.1",
    "USMCA certificate of origin not referenced — may miss duty-free qualification for eligible goods",
  ],
});

// ── Animated counter ─────────────────────────────────────────
function Counter({ value, prefix = "", suffix = "" }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let frame;
    const start = performance.now();
    const dur = 1200;
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setN(Math.round(ease * value));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <span style={{ fontVariantNumeric: "tabular-nums" }}>{prefix}{n.toLocaleString()}{suffix}</span>;
}

// ── Score ring ───────────────────────────────────────────────
function ScoreRing({ score, size = 96, label }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ - (score / 100) * circ;
  const c = score >= 75 ? "#34C759" : score >= 55 ? "#FF9500" : score >= 35 ? "#FF6B35" : "#FF3B30";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1E293B" strokeWidth="6" />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: size * 0.3, fontWeight: 800, color: c }}>{score}</span>
        </div>
      </div>
      {label && <span style={{ fontSize: 10, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>{label}</span>}
    </div>
  );
}

// ── Finding card ─────────────────────────────────────────────
function Finding({ f, i, lang }) {
  const [open, setOpen] = useState(false);
  const s = SEV[f.severity];
  const t = LABELS[lang];
  const effortLabel = f.effort === "low" ? t.effortQuick : f.effort === "medium" ? t.effortMod : t.effortMajor;
  const effortColor = f.effort === "low" ? "#34C759" : f.effort === "medium" ? "#FF9500" : "#FF3B30";

  return (
    <div onClick={() => setOpen(!open)} style={{
      background: "#0F172A", border: `1px solid ${open ? s.color + "44" : "#1E293B"}`,
      borderRadius: 14, padding: "16px 20px", cursor: "pointer",
      transition: "all .25s ease", marginBottom: 8,
      animation: `slideUp .4s ease ${i * 60}ms both`,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ fontSize: 16, lineHeight: "24px" }}>{s.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: s.color, background: s.bg, padding: "2px 8px", borderRadius: 4, letterSpacing: ".08em" }}>{s.tag}</span>
            <span style={{ fontSize: 9, color: "#636366", background: "#1E293B", padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: ".06em" }}>{f.category}</span>
            <span style={{ fontSize: 9, color: effortColor, background: effortColor + "14", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>⚡ {effortLabel}</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#F2F2F7", lineHeight: 1.4 }}>{f.title}</div>
          {f.conversion_impact > 0 && (
            <span style={{ fontSize: 11, color: "#FF3B30", fontWeight: 700 }}>↓ {(f.conversion_impact * 100).toFixed(0)}% conversion impact</span>
          )}
        </div>
        <span style={{ color: "#3A3A3C", fontSize: 16, transition: "transform .25s", transform: open ? "rotate(180deg)" : "" }}>▾</span>
      </div>
      {open && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #1E293B", display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 9, color: "#636366", textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 700, marginBottom: 4 }}>{t.problem}</div>
            <p style={{ margin: 0, fontSize: 13, color: "#AEAEB2", lineHeight: 1.7 }}>{f.description}</p>
          </div>
          <div>
            <div style={{ fontSize: 9, color: "#636366", textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 700, marginBottom: 4 }}>{t.impact}</div>
            <p style={{ margin: 0, fontSize: 13, color: "#FF9500", lineHeight: 1.7 }}>{f.impact}</p>
          </div>
          <div style={{ background: "#34C75910", border: "1px solid #34C75930", borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 9, color: "#34C759", textTransform: "uppercase", letterSpacing: ".12em", fontWeight: 800, marginBottom: 4 }}>✓ {t.fix}</div>
            <p style={{ margin: 0, fontSize: 13, color: "#A8E6CF", lineHeight: 1.7 }}>{f.fix}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Revenue Calculator ───────────────────────────────────────
function RevenueCalc({ scores, industry, lang }) {
  const bench = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS.general;
  const t = LABELS[lang];
  const [traffic, setTraffic] = useState(50000);
  const [cr, setCr] = useState(1.4);
  const [aov, setAov] = useState(bench.aov);

  const overall = scores?.overall || 51;
  const lift = Math.min(((100 - overall) / 100) * 0.35, 0.5);
  const projCR = Math.min(cr * (1 + lift), bench.cr * 1.15);
  const curRev = traffic * (cr / 100) * aov * 12;
  const projRev = traffic * (projCR / 100) * aov * 12;
  const leak = projRev - curRev;

  const inputStyle = {
    background: "#0F172A", border: "1px solid #1E293B", borderRadius: 10,
    padding: "11px 14px", color: "#F2F2F7", fontSize: 15, fontWeight: 700,
    width: "100%", boxSizing: "border-box", fontFamily: "'JetBrains Mono', monospace",
    outline: "none", transition: "border-color .2s",
  };

  return (
    <div style={{ background: "#1E293B", borderRadius: 18, padding: 28, border: "1px solid #334155" }}>
      <h3 style={{ margin: "0 0 2px", fontSize: 17, fontWeight: 800, color: "#F2F2F7" }}>💰 {t.revenueLeak}</h3>
      <p style={{ margin: "0 0 22px", fontSize: 12, color: "#636366" }}>{t.revenueLeakSub}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
        {[
          [t.visitors, traffic, setTraffic, "number"],
          [t.currentCR, cr, setCr, "number"],
          [t.avgOrder, aov, setAov, "number"],
        ].map(([label, val, setter, type], idx) => (
          <div key={idx}>
            <div style={{ fontSize: 10, color: "#636366", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 700, marginBottom: 6 }}>{label}</div>
            <input type={type} step={idx === 1 ? "0.1" : "1"} value={val}
              onChange={e => setter(+e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = "#3B82F6"}
              onBlur={e => e.target.style.borderColor = "#1E293B"} />
          </div>
        ))}
      </div>

      {/* Current vs Projected */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 48px 1fr", gap: 12, alignItems: "center" }}>
        <div style={{ background: "#0F172A", borderRadius: 14, padding: 20, textAlign: "center", border: "1px solid #1E293B" }}>
          <div style={{ fontSize: 10, color: "#636366", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>{t.currentRev}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#F2F2F7", fontFamily: "'JetBrains Mono', monospace" }}>
            <Counter value={Math.round(curRev)} prefix="$" />
          </div>
          <div style={{ fontSize: 11, color: "#636366", marginTop: 4 }}>{cr}% CR</div>
        </div>
        <div style={{ textAlign: "center", fontSize: 22, color: "#34C759" }}>→</div>
        <div style={{ background: "#34C75910", borderRadius: 14, padding: 20, textAlign: "center", border: "1px solid #34C75930" }}>
          <div style={{ fontSize: 10, color: "#34C759", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>{t.projectedRev}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#34C759", fontFamily: "'JetBrains Mono', monospace" }}>
            <Counter value={Math.round(projRev)} prefix="$" />
          </div>
          <div style={{ fontSize: 11, color: "#636366", marginTop: 4 }}>{projCR.toFixed(1)}% CR</div>
        </div>
      </div>

      {/* Leak Banner */}
      <div style={{
        marginTop: 16, background: "linear-gradient(135deg, #FF3B3012, #FF950012)",
        border: "1px solid #FF3B3030", borderRadius: 14, padding: 22, textAlign: "center",
      }}>
        <div style={{ fontSize: 10, color: "#FF3B30", textTransform: "uppercase", letterSpacing: ".18em", fontWeight: 800, marginBottom: 4 }}>{t.leakDetected}</div>
        <div style={{ fontSize: 38, fontWeight: 900, color: "#FF3B30", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.1 }}>
          <Counter value={Math.round(leak)} prefix="$" suffix="/yr" />
        </div>
        <div style={{ fontSize: 11, color: "#AEAEB2", marginTop: 6 }}>{t.recovery}</div>
      </div>

      {/* Benchmark */}
      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: "#0F172A", borderRadius: 10, padding: 14, textAlign: "center", border: "1px solid #1E293B" }}>
          <div style={{ fontSize: 9, color: "#636366", textTransform: "uppercase", letterSpacing: ".08em" }}>{t.industryAvg}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#5AC8FA", fontFamily: "'JetBrains Mono', monospace" }}>{bench.cr}%</div>
        </div>
        <div style={{ background: "#0F172A", borderRadius: 10, padding: 14, textAlign: "center", border: "1px solid #1E293B" }}>
          <div style={{ fontSize: 9, color: "#636366", textTransform: "uppercase", letterSpacing: ".08em" }}>{t.yourGap}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: cr < bench.cr ? "#FF3B30" : "#34C759", fontFamily: "'JetBrains Mono', monospace" }}>
            {cr < bench.cr ? `−${(bench.cr - cr).toFixed(1)}%` : `+${(cr - bench.cr).toFixed(1)}%`}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Loading state ────────────────────────────────────────────
function Loader() {
  const steps = ["Trust Signals", "UX Patterns", "Performance", "Revenue Leaks", "Compliance"];
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % steps.length), 800);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ padding: "64px 0", textAlign: "center" }}>
      <div style={{ fontSize: 44, marginBottom: 16, animation: "pulse 1.6s ease-in-out infinite" }}>🔍</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#F2F2F7", marginBottom: 6 }}>Scanning Store...</div>
      <div style={{ fontSize: 12, color: "#636366", marginBottom: 28 }}>AI engine analyzing conversion patterns and financial signals</div>
      <div style={{ maxWidth: 280, margin: "0 auto", background: "#1E293B", borderRadius: 6, height: 4, overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(90deg,#3B82F6,#34C759)", height: "100%", borderRadius: 6, animation: "progress 2.5s ease-in-out infinite" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 24 }}>
        {steps.map((s, i) => (
          <span key={i} style={{
            fontSize: 10, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700,
            color: i === active ? "#3B82F6" : "#3A3A3C",
            transition: "color .3s",
          }}>{s}</span>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// MAIN APP
// ═════════════════════════════════════════════════════════════
export default function RevenuLeakDetector() {
  const [url, setUrl] = useState("");
  const [industry, setIndustry] = useState("general");
  const [lang, setLang] = useState("en");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  const t = LABELS[lang];

  const runScan = useCallback(async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [{ role: "user", content: buildPrompt(url, industry) }],
          tools: [{ type: "web_search_20250305", name: "web_search" }],
        }),
      });
      const data = await res.json();
      let text = "";
      if (data.content) for (const b of data.content) if (b.type === "text") text += b.text;
      const match = text.match(/\{[\s\S]*\}/);
      if (match) { setResult(JSON.parse(match[0])); }
      else throw new Error("parse");
    } catch (err) {
      setError(true);
      setResult(getDemoData(url));
    } finally {
      setLoading(false);
    }
  }, [url, industry]);

  const findings = result?.findings?.filter(f => {
    if (filter === "all") return true;
    if (filter === "critical") return f.severity === "critical";
    if (filter === "high") return f.severity === "high";
    return f.category === filter;
  }) || [];

  return (
    <div style={{ minHeight: "100vh", background: "#0F172A", color: "#F2F2F7", fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700;800&display=swap');
        @keyframes slideUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes pulse { 0%,100% { opacity:.4 } 50% { opacity:1 } }
        @keyframes progress { 0% { width:0 } 50% { width:100% } 100% { width:0 } }
        @keyframes glow { 0%,100% { box-shadow:0 0 16px #3B82F620 } 50% { box-shadow:0 0 32px #3B82F640 } }
        input:focus, select:focus { border-color:#3B82F6 !important; outline:none; box-shadow:0 0 0 3px #3B82F618 }
        ::selection { background:#3B82F650 }
        * { box-sizing: border-box; }
      `}</style>

      {/* ── Nav ── */}
      <nav style={{
        borderBottom: "1px solid #1E293B", padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#0F172Add", backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg,#3B82F6,#34C759)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 900, color: "#fff",
          }}>M</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#F2F2F7", letterSpacing: "-.02em" }}>Multicomm.ai</div>
            <div style={{ fontSize: 9, color: "#636366", letterSpacing: ".04em" }}>E-Commerce Growth Intelligence</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {["EN", "ES"].map(l => (
            <button key={l} onClick={() => setLang(l.toLowerCase())} style={{
              padding: "4px 10px", fontSize: 10, fontWeight: 700, borderRadius: 6, border: "1px solid #1E293B",
              cursor: "pointer", transition: "all .2s",
              background: lang === l.toLowerCase() ? "#3B82F6" : "transparent",
              color: lang === l.toLowerCase() ? "#fff" : "#636366",
            }}>{l}</button>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "40px 20px 80px" }}>

        {/* ── Hero ── */}
        {!result && !loading && (
          <div style={{ textAlign: "center", marginBottom: 44, animation: "fadeIn .5s ease" }}>
            <h1 style={{
              fontSize: 44, fontWeight: 900, margin: "0 0 10px", lineHeight: 1.05,
              background: "linear-gradient(135deg,#F2F2F7 30%,#3B82F6)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              letterSpacing: "-.03em",
            }}>{t.hero}</h1>
            <p style={{ fontSize: 16, color: "#8E8E93", margin: "0 0 6px" }}>{t.heroSub}</p>
            <p style={{ fontSize: 11, color: "#3A3A3C" }}>{t.poweredBy}</p>
          </div>
        )}

        {/* ── Input ── */}
        <div style={{
          background: "#1E293B", border: "1px solid #334155", borderRadius: 16,
          padding: 22, marginBottom: 28, animation: "fadeIn .35s ease",
        }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 340px" }}>
              <input type="url" value={url} onChange={e => setUrl(e.target.value)}
                placeholder={t.placeholder} onKeyDown={e => e.key === "Enter" && runScan()}
                style={{
                  width: "100%", padding: "13px 16px", background: "#0F172A", border: "1px solid #1E293B",
                  borderRadius: 10, color: "#F2F2F7", fontSize: 14, outline: "none",
                  fontFamily: "'JetBrains Mono', monospace", transition: "border-color .2s",
                }} />
            </div>
            <select value={industry} onChange={e => setIndustry(e.target.value)} style={{
              padding: "13px 14px", background: "#0F172A", border: "1px solid #1E293B",
              borderRadius: 10, color: "#F2F2F7", fontSize: 12, cursor: "pointer", minWidth: 130,
              appearance: "none", fontFamily: "'DM Sans', sans-serif",
            }}>
              {Object.entries(INDUSTRY_BENCHMARKS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <button onClick={runScan} disabled={loading || !url.trim()} style={{
              padding: "13px 28px", borderRadius: 10, border: "none", cursor: loading ? "not-allowed" : "pointer",
              background: loading ? "#1E293B" : "linear-gradient(135deg,#3B82F6,#2563EB)",
              color: "#fff", fontSize: 14, fontWeight: 800, letterSpacing: ".01em",
              transition: "all .25s", opacity: !url.trim() ? .45 : 1,
              fontFamily: "'DM Sans', sans-serif",
              animation: url.trim() && !loading ? "glow 2.2s ease-in-out infinite" : "none",
            }}>
              {loading ? t.scanning : t.scan}
            </button>
          </div>
        </div>

        {loading && <Loader />}

        {/* ── Error note ── */}
        {error && result && (
          <div style={{ background: "#FF950010", border: "1px solid #FF950030", borderRadius: 10, padding: 14, marginBottom: 20, textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 12, color: "#FF9500" }}>{t.demoNote}</p>
          </div>
        )}

        {/* ═══ RESULTS ═══ */}
        {result && (
          <div style={{ animation: "fadeIn .5s ease", display: "flex", flexDirection: "column", gap: 22 }}>

            {/* Store Header + Overall Score */}
            <div style={{
              background: "#1E293B", borderRadius: 18, padding: 26, border: "1px solid #334155",
              display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16,
            }}>
              <div>
                <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 800, color: "#F2F2F7" }}>{result.store_name}</h2>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 10, color: "#3B82F6", background: "#3B82F614", padding: "3px 10px", borderRadius: 5, fontWeight: 700 }}>{result.platform}</span>
                  <span style={{ fontSize: 10, color: "#636366", background: "#0F172A", padding: "3px 10px", borderRadius: 5 }}>
                    {result.findings?.length || 0} {t.storeDetected}
                  </span>
                </div>
              </div>
              <ScoreRing score={result.scores?.overall || 0} size={90} label={t.healthScore} />
            </div>

            {/* Category Scores */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
              {[
                ["trust", "🛡️", lang === "es" ? "Confianza" : "Trust"],
                ["ux", "📱", "UX"],
                ["performance", "⚡", lang === "es" ? "Velocidad" : "Speed"],
                ["conversion", "💳", lang === "es" ? "Conversión" : "Conversion"],
              ].map(([key, icon, label]) => (
                <div key={key} style={{ background: "#1E293B", borderRadius: 14, padding: 16, textAlign: "center", border: "1px solid #334155" }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                  <ScoreRing score={result.scores?.[key] || 0} size={68} label={label} />
                </div>
              ))}
            </div>

            {/* Revenue Calculator */}
            <RevenueCalc scores={result.scores} industry={industry} lang={lang} />

            {/* Quick Wins */}
            {result.quick_wins?.length > 0 && (
              <div style={{ background: "#1E293B", borderRadius: 18, padding: 26, border: "1px solid #34C75930" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: "#34C759" }}>⚡ {t.quickWins}</h3>
                {result.quick_wins.map((w, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 12, alignItems: "flex-start",
                    background: "#34C75908", border: "1px solid #34C75914", borderRadius: 10, padding: 14, marginBottom: 8,
                  }}>
                    <span style={{
                      background: "#34C759", color: "#000", fontWeight: 900, fontSize: 12,
                      minWidth: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{i + 1}</span>
                    <span style={{ fontSize: 13, color: "#D1FAE5", lineHeight: 1.6 }}>{w}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Cross-Border Flags */}
            {result.cross_border_flags?.length > 0 && (
              <div style={{ background: "#1E293B", borderRadius: 18, padding: 26, border: "1px solid #FF950030" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: "#FF9500" }}>🌎 {t.crossBorder}</h3>
                {result.cross_border_flags.map((f, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 10, alignItems: "flex-start",
                    background: "#FF950008", border: "1px solid #FF950014", borderRadius: 8, padding: 12, marginBottom: 8,
                  }}>
                    <span>🚨</span>
                    <span style={{ fontSize: 12, color: "#FDE68A", lineHeight: 1.6 }}>{f}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Findings */}
            <div style={{ background: "#1E293B", borderRadius: 18, padding: 26, border: "1px solid #334155" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 800, color: "#F2F2F7" }}>🔍 {t.findings}</h3>
              <div style={{ display: "flex", gap: 5, marginBottom: 16, flexWrap: "wrap" }}>
                {[
                  ["all", t.filterAll], ["critical", t.filterCritical], ["high", t.filterHigh],
                  ["trust", t.filterTrust], ["ux", t.filterUx], ["performance", t.filterSpeed], ["conversion", t.filterConversion],
                ].map(([key, label]) => (
                  <button key={key} onClick={() => setFilter(key)} style={{
                    padding: "5px 13px", fontSize: 10, fontWeight: 700, borderRadius: 6,
                    border: `1px solid ${filter === key ? "#3B82F6" : "#1E293B"}`,
                    background: filter === key ? "#3B82F614" : "transparent",
                    color: filter === key ? "#3B82F6" : "#636366",
                    cursor: "pointer", transition: "all .2s",
                  }}>{label}</button>
                ))}
              </div>
              {findings.map((f, i) => <Finding key={f.id} f={f} i={i} lang={lang} />)}
              {findings.length === 0 && (
                <p style={{ color: "#3A3A3C", fontSize: 13, textAlign: "center", padding: 24 }}>
                  {lang === "es" ? "Sin problemas en esta categoría ✓" : "No issues in this category ✓"}
                </p>
              )}
            </div>

            {/* CTA */}
            <div style={{
              background: "linear-gradient(135deg,#3B82F612,#34C75912)",
              border: "1px solid #3B82F630", borderRadius: 18, padding: 36, textAlign: "center",
            }}>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: "#F2F2F7", margin: "0 0 8px", letterSpacing: "-.02em" }}>{t.cta}</h3>
              <p style={{ fontSize: 13, color: "#8E8E93", margin: "0 0 22px" }}>{t.ctaSub}</p>
              <a href="https://calendly.com/multicomm-ai" target="_blank" rel="noopener noreferrer" style={{
                display: "inline-block", padding: "14px 36px", borderRadius: 10,
                background: "linear-gradient(135deg,#3B82F6,#2563EB)", color: "#fff",
                fontSize: 15, fontWeight: 800, textDecoration: "none",
                transition: "transform .2s", letterSpacing: ".01em",
              }}>{t.ctaBtn}</a>
              <p style={{ fontSize: 11, color: "#3A3A3C", marginTop: 14 }}>
                Fernando Sorokin • Multicomm.ai • CPA & AI Automation Consultant
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
