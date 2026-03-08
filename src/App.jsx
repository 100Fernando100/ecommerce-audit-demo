import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from "recharts";

// ── Demo Data (simulated audit results) ──
const healthScore = 62;

const adSpendData = [
  { platform: "Meta Ads", spend: 3200, revenue: 9600, roas: 3.0, color: "#4267B2" },
  { platform: "Google Ads", spend: 2800, revenue: 11200, roas: 4.0, color: "#34A853" },
  { platform: "TikTok Ads", spend: 1500, revenue: 2250, roas: 1.5, color: "#010101" },
];

const roiByChannel = [
  { channel: "Email (Klaviyo)", roi: 42, spend: 200, color: "#8B5CF6" },
  { channel: "Google Ads", roi: 4.0, spend: 2800, color: "#34A853" },
  { channel: "Meta Ads", roi: 3.0, spend: 3200, color: "#4267B2" },
  { channel: "Organic SEO", roi: 8.5, spend: 0, color: "#F59E0B" },
  { channel: "TikTok Ads", roi: 1.5, spend: 1500, color: "#EF4444" },
];

const trafficTrend = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  sessions: Math.floor(800 + Math.sin(i * 0.3) * 300 + Math.random() * 200),
  conversions: Math.floor(20 + Math.sin(i * 0.3) * 10 + Math.random() * 8),
}));

const funnelData = [
  { stage: "Visitors", value: 24500, pct: 100 },
  { stage: "Product View", value: 12250, pct: 50 },
  { stage: "Add to Cart", value: 3675, pct: 15 },
  { stage: "Checkout", value: 1470, pct: 6 },
  { stage: "Purchase", value: 735, pct: 3 },
];

const seoScores = [
  { metric: "Performance", score: 45 },
  { metric: "SEO", score: 68 },
  { metric: "Accessibility", score: 52 },
  { metric: "Best Practices", score: 71 },
  { metric: "Mobile", score: 38 },
];

const reviewsData = {
  google: { rating: 3.2, count: 47, unanswered: 12, period: "all time", monthlyAvg: 3.9, trend: "declining" },
  trustpilot: { rating: 3.8, count: 23, unanswered: 5, period: "all time", monthlyAvg: 1.9, trend: "stable" },
};

const competitors = [
  { name: "Luna Beauty Co.", source: "Client identified", google: 4.5, googleCount: 312, trustpilot: 4.3, trustpilotCount: 89 },
  { name: "Bella Skin Shop", source: "Client identified", google: 4.1, googleCount: 89, trustpilot: 4.0, trustpilotCount: 45 },
  { name: "Glow Essentials", source: "Client identified", google: 4.3, googleCount: 201, trustpilot: 4.4, trustpilotCount: 134 },
];
const competitorAvgRating = +(competitors.reduce((s, c) => s + c.google, 0) / competitors.length).toFixed(1);

const demographics = [
  { name: "Women 25-34", value: 35, color: "#8B5CF6" },
  { name: "Men 25-34", value: 22, color: "#3B82F6" },
  { name: "Women 35-44", value: 18, color: "#EC4899" },
  { name: "Men 35-44", value: 12, color: "#06B6D4" },
  { name: "Other", value: 13, color: "#94A3B8" },
];

// Attribution Model 40-20-40
const attributionData = [
  { channel: "Meta Ads", firstTouch: 42, middle: 12, lastTouch: 8, color: "#4267B2",
    revenue: 9600, firstPct: 42, middlePct: 18, lastPct: 8 },
  { channel: "Google Ads", firstTouch: 15, middle: 18, lastTouch: 38, color: "#34A853",
    revenue: 11200, firstPct: 15, middlePct: 27, lastPct: 38 },
  { channel: "Klaviyo Email", firstTouch: 3, middle: 35, lastTouch: 40, color: "#8B5CF6",
    revenue: 8400, firstPct: 3, middlePct: 52, lastPct: 40 },
  { channel: "Organic SEO", firstTouch: 28, middle: 25, lastTouch: 6, color: "#F59E0B",
    revenue: 4200, firstPct: 28, middlePct: 37, lastPct: 6 },
  { channel: "TikTok Ads", firstTouch: 12, middle: 10, lastTouch: 8, color: "#EF4444",
    revenue: 2250, firstPct: 12, middlePct: 15, lastPct: 8 },
];

const attributionWeighted = attributionData.map(d => ({
  channel: d.channel,
  color: d.color,
  revenue: d.revenue,
  weighted: Math.round(d.firstPct * 0.4 + d.middlePct * 0.2 + d.lastPct * 0.4),
  firstTouch: d.firstPct,
  middle: d.middlePct,
  lastTouch: d.lastPct,
}));

// New vs Repeat customer journeys
const newCustomerJourneys = [
  { path: "Meta Ad → Google Search → Email Signup → Welcome Email → Purchase", conversions: 125, revenue: 8750, pct: 28, avgDays: 12 },
  { path: "TikTok Ad → Meta Retarget → Google Ad → Purchase", conversions: 67, revenue: 3400, pct: 15, avgDays: 8 },
  { path: "Google Ad → SEO Page → Email Signup → Promo Email → Purchase", conversions: 98, revenue: 6860, pct: 22, avgDays: 15 },
  { path: "Organic SEO → Browse → Meta Retarget → Purchase", conversions: 82, revenue: 4920, pct: 18, avgDays: 6 },
  { path: "Meta Ad → Direct Visit → Purchase", conversions: 76, revenue: 3800, pct: 17, avgDays: 3 },
];

const repeatCustomerJourneys = [
  { path: "Klaviyo Promo Email → Click → Purchase", conversions: 215, revenue: 15050, pct: 35, avgDays: 0 },
  { path: "Klaviyo Back-in-Stock → Click → Purchase", conversions: 128, revenue: 10240, pct: 21, avgDays: 0 },
  { path: "Klaviyo Abandoned Cart → Click → Purchase", conversions: 95, revenue: 7600, pct: 15, avgDays: 1 },
  { path: "Direct Visit (bookmarked) → Purchase", conversions: 87, revenue: 5220, pct: 14, avgDays: 0 },
  { path: "Klaviyo Win-Back → Click → Browse → Purchase", conversions: 58, revenue: 3480, pct: 9, avgDays: 2 },
  { path: "Google Brand Search → Purchase", conversions: 37, revenue: 2590, pct: 6, avgDays: 0 },
];

const newVsRepeatSummary = {
  newCustomers: { count: 448, revenue: 27730, avgCAC: 16.74, avgOrderValue: 61.90, pctOfTotal: 38 },
  repeatCustomers: { count: 620, revenue: 44180, avgCAC: 0.32, avgOrderValue: 71.26, pctOfTotal: 62 },
};

const channelByCustomerType = [
  { channel: "Meta Ads", newRev: 8200, repeatRev: 1400, color: "#4267B2" },
  { channel: "Google Ads", newRev: 7600, repeatRev: 3600, color: "#34A853" },
  { channel: "Klaviyo Email", newRev: 1200, repeatRev: 36430, color: "#8B5CF6" },
  { channel: "Organic SEO", newRev: 3800, repeatRev: 400, color: "#F59E0B" },
  { channel: "TikTok Ads", newRev: 2130, repeatRev: 120, color: "#EF4444" },
  { channel: "Direct", newRev: 4800, repeatRev: 2230, color: "#94A3B8" },
];

const criticalFindings = [
  { severity: "critical", icon: "🔴", text: "TikTok Ads ROAS at 1.5x — losing money after fees. See TikTok Diagnostic for root cause analysis.", agent: "Ad Spend Optimizer" },
  { severity: "critical", icon: "🔴", text: "12 Google reviews unanswered (avg 3.2★). Competitors average 4.3★.", agent: "Social Proof Auditor" },
  { severity: "critical", icon: "🔴", text: "Mobile Performance score: 38/100. Losing 60%+ of mobile shoppers.", agent: "SEO Performance" },
  { severity: "critical", icon: "🔴", text: "Payment processing fees 4.2% vs industry 2.9% — overpaying $780/mo. See Profitability tab.", agent: "Profitability Leak" },
  { severity: "warning", icon: "🟡", text: "Email ROI is 42x but only gets 2.6% of marketing budget. Massive opportunity.", agent: "Marketing ROI" },
  { severity: "warning", icon: "🟡", text: "Cart-to-purchase drop: 80% abandonment. No recovery email flow active.", agent: "Customer Behavior" },
  { severity: "opportunity", icon: "🟢", text: "Customer LTV with Klaviyo is 22.6x ROI vs 5.98x without. See LTV & ROI tab.", agent: "Marketing ROI" },
];

// Profitability Leak Data
const profitabilityLeaks = [
  {
    category: "Payment Processing Fees",
    icon: "💳",
    currentCost: 2520,
    benchmarkCost: 1740,
    leak: 780,
    detail: "Current rate: 4.2% avg across Stripe + PayPal. Industry benchmark: 2.9%. You're on Stripe's default pricing — negotiating or switching to Stripe volume pricing could save significantly.",
    action: "Negotiate Stripe rate or enable Stripe billing portal for lower fees at your volume",
    effort: "1 hour",
    color: "#EF4444",
  },
  {
    category: "Shipping Cost vs Revenue",
    icon: "📦",
    currentCost: 4800,
    benchmarkCost: 3200,
    leak: 1600,
    detail: "Free shipping on orders >$50 costs avg $3.20/order (US) and $14.50/order (Canada). 23% of free-shipping orders barely qualify ($50-$55). Current policy treats all markets the same, but Canadian shipping costs 4.5x more than US. This erodes margin significantly on Canadian orders.",
    action: "Split shipping rules by country: US — free shipping at $65 + flat $3.99 under. Canada — free shipping at $100 + flat $7.99 under. Include shipping cost in product pricing for best sellers.",
    effort: "1 hour",
    color: "#F59E0B",
  },
  {
    category: "Return Rate Impact",
    icon: "↩️",
    currentCost: 3600,
    benchmarkCost: 2400,
    leak: 1200,
    detail: "Return rate: 12% vs industry avg 8%. Top return reasons: 'Not as described' (45%), 'Wrong size' (30%), 'Damaged' (15%). The 'not as described' issue suggests product photos/descriptions need improvement — fixable without changing the product.",
    action: "Improve product photos and add size guides. Address top 2 return reasons.",
    effort: "1 week",
    color: "#EF4444",
  },
  {
    category: "Discount & Coupon Erosion",
    icon: "🏷️",
    currentCost: 5400,
    benchmarkCost: 3600,
    leak: 1800,
    detail: "Average discount rate: 18% of revenue. 34% of orders use a coupon. Your welcome discount (15% off) is being reused — no single-use enforcement. Coupon aggregator sites list your codes publicly. You're training customers to never pay full price.",
    action: "Enforce single-use codes, remove from aggregator sites, shift to $ off vs % off",
    effort: "2 hours",
    color: "#EF4444",
  },
  {
    category: "Abandoned Checkout Recovery",
    icon: "🛒",
    currentCost: 0,
    benchmarkCost: 0,
    leak: 8820,
    detail: "80% cart abandonment with zero recovery. No abandoned cart email flow. No exit-intent popup. Industry standard recovery: 5-10% of abandoned carts. At 3,675 monthly abandonments × $100 AOV × 5% = $18,375 potential. Conservative estimate: $8,820/mo left on table.",
    action: "Activate Klaviyo abandoned cart flow (3-email sequence)",
    effort: "2 days",
    color: "#EF4444",
  },
  {
    category: "Platform & App Fees",
    icon: "🔧",
    currentCost: 890,
    benchmarkCost: 450,
    leak: 440,
    detail: "Running 12 Shopify apps at avg $74/mo total. 4 apps have overlapping functionality (2 email popups, 2 review apps). 2 apps unused in last 90 days. Consolidating saves $440/mo with no functionality loss.",
    action: "Audit Shopify apps — remove duplicates and unused",
    effort: "30 min",
    color: "#F59E0B",
  },
];

const totalLeaks = profitabilityLeaks.reduce((s, l) => s + l.leak, 0);
const totalCurrentCost = profitabilityLeaks.reduce((s, l) => s + l.currentCost, 0);

// Competitive Intelligence Calendar
const competitorEvents = [
  { competitor: "Amazon", type: "Prime Day", start: "2026-07-14", end: "2026-07-15", impact: "high", color: "#FF9900",
    action: "Pause Google Shopping Ads (CPCs spike 40-60%). Run email-only flash sale to existing list. Emphasize 'local shipping' and 'support small business'.",
    leak: "Ad CPCs increase 40-60% during Prime Day. $1,200-$1,800 wasted if you compete on Google Shopping." },
  { competitor: "Amazon", type: "Black Friday / Cyber Monday", start: "2026-11-27", end: "2026-11-30", impact: "high", color: "#FF9900",
    action: "Don't compete on price. Launch 'Early Access' sale 1 week before for email subscribers. On BFCM, focus on bundles + free gift, not discounts.",
    leak: "Discounting to match Amazon erodes brand value. Customers who buy on BFCM discount rarely return at full price." },
  { competitor: "Amazon", type: "Back to School", start: "2026-08-15", end: "2026-09-05", impact: "medium", color: "#FF9900",
    action: "If your products overlap with BTS category, launch targeted campaign 1 week earlier. If not, this is a low-competition window for your niche.",
    leak: "Moderate CPC increases in overlapping categories." },
  { competitor: "Costco", type: "Seasonal Liquidation", start: "2026-06-15", end: "2026-07-05", impact: "medium", color: "#E31837",
    action: "Costco liquidation drives bargain hunters. Shift messaging to quality/premium positioning. Avoid price matching — you can't win on volume.",
    leak: "Customers comparing your $85 product to Costco's $29 alternative. Price-match requests increase." },
  { competitor: "Costco", type: "Holiday Gift Sets", start: "2026-11-01", end: "2026-12-20", impact: "medium", color: "#E31837",
    action: "Create exclusive gift bundles not available at Costco. Emphasize personalization, gift wrapping, local delivery. Target 'gift for someone special' vs bulk buying.",
    leak: "Gift buyers default to Costco for convenience. You lose consideration if you don't offer bundles." },
  { competitor: "Local Competitor (Luna Beauty)", type: "Anniversary Sale", start: "2026-04-10", end: "2026-04-17", impact: "medium", color: "#8B5CF6",
    action: "Monitor their offers via Outscraper. If they discount >20%, run a 'why we're different' campaign focusing on reviews and quality. Don't match their discount.",
    leak: "Direct competitor sale pulls shared audience. ~15% traffic dip expected during their sale." },
  { competitor: "Shopify Ecosystem", type: "Shopify Summer Sale", start: "2026-06-01", end: "2026-06-07", impact: "low", color: "#96BF48",
    action: "Shopify promotes sales across their ecosystem. Participate for free visibility — even a small 10% off gets you featured in Shopify's marketing emails.",
    leak: "Missing free exposure. Low risk, moderate upside." },
  { competitor: "Your Own", type: "🟢 Opportunity Window: Post-Prime Day", start: "2026-07-16", end: "2026-07-31", impact: "opportunity", color: "#10B981",
    action: "CPCs drop 30-40% post-Prime Day. Increase Google Ads budget 50% for 2 weeks. Shoppers who didn't find what they wanted on Amazon are actively searching.",
    leak: "None — this is pure opportunity. Historically highest ROAS period of summer." },
  { competitor: "Your Own", type: "🟢 Opportunity: January New Year", start: "2026-01-05", end: "2026-01-31", impact: "opportunity", color: "#10B981",
    action: "New Year resolution buyers are high-intent. Launch 'New Year, New You' campaign. Email list + retargeting. Low competition, low CPCs.",
    leak: "None — competitors are recovering from BFCM. Window of low competition." },
  { competitor: "Your Own", type: "🟢 Opportunity: Pre-Mother's Day", start: "2026-04-20", end: "2026-05-10", impact: "opportunity", color: "#10B981",
    action: "Gift buyers start searching 3 weeks before. Launch gift guides, bundles with gift wrap option. Heavy email to male subscribers.",
    leak: "None — seasonal demand surge in your category." },
];

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getMarketStatus(events) {
  const today = new Date().toISOString().slice(0, 10);
  const active = events.filter(e => today >= e.start && today <= e.end);
  if (active.some(e => e.impact === "high")) return { status: "HIGH COMPETITION", color: "#EF4444", message: "Major competitor campaign active. Shift to email + retention. Avoid bidding wars.", active };
  if (active.some(e => e.impact === "medium")) return { status: "MODERATE COMPETITION", color: "#F59E0B", message: "Competitor activity detected. Monitor closely. Adjust bids, don't pause.", active };
  if (active.some(e => e.impact === "opportunity")) return { status: "OPPORTUNITY WINDOW", color: "#10B981", message: "Low competition period. Increase ad spend. Push acquisition campaigns.", active };
  return { status: "NORMAL MARKET", color: "#3B82F6", message: "No major competitor events. Run standard campaigns. Focus on optimization.", active: [] };
}

// LTV Data
const ltvByPurchase = [1, 2, 3, 4, 5, 6, 7, 8].map(n => {
  const revenue = n * 100;
  const adCost = 16.74;
  const emailCost = n > 1 ? (n - 1) * 0.32 : 0;
  const totalCost = adCost + emailCost;
  const roi = revenue / totalCost;
  const profit = revenue - totalCost;
  return { purchase: `Purchase ${n}`, purchases: n, revenue, totalCost: +totalCost.toFixed(2), roi: +roi.toFixed(1), profit: +profit.toFixed(2) };
});

const ltvComparison = [
  { scenario: "No Email", purchases: 1, ltv: 100, cac: 16.74, roi: 5.98, profit: 83.26, color: "#EF4444" },
  { scenario: "Basic Email", purchases: 2, ltv: 200, cac: 17.06, roi: 11.72, profit: 182.94, color: "#F59E0B" },
  { scenario: "Good Klaviyo", purchases: 4, ltv: 400, cac: 17.70, roi: 22.6, profit: 382.30, color: "#8B5CF6" },
  { scenario: "Great Klaviyo", purchases: 6, ltv: 600, cac: 18.34, roi: 32.7, profit: 581.66, color: "#10B981" },
  { scenario: "Loyalty Program", purchases: 8, ltv: 800, cac: 18.98, roi: 42.1, profit: 781.02, color: "#3B82F6" },
];

// TikTok Diagnostic Data
const tiktokDiagnostic = [
  {
    area: "Creative Quality",
    score: 25,
    status: "critical",
    findings: [
      "Using repurposed Facebook ads (horizontal format, not TikTok-native)",
      "No hook in first 2 seconds — 78% scroll past",
      "Brand-heavy intro instead of UGC-style content",
      "No trending audio or effects used",
    ],
    recommendation: "Create TikTok-native vertical video with UGC style. Test creator partnerships.",
  },
  {
    area: "Product-Market Fit",
    score: 55,
    status: "warning",
    findings: [
      "Average product price: $85 — above TikTok impulse buy range ($15-50)",
      "Product category performs average on TikTok (not trending)",
      "No unboxing or demo content showing product in use",
    ],
    recommendation: "Test lower-priced entry products or bundles under $50. Create demo/unboxing content.",
  },
  {
    area: "Landing Page (Mobile)",
    score: 20,
    status: "critical",
    findings: [
      "Mobile Performance: 38/100 — page takes 6.2s to load",
      "98% of TikTok traffic is mobile — losing most visitors",
      "No TikTok-specific landing page (sends to generic homepage)",
      "Checkout requires 5 steps — TikTok users expect 2-3 max",
    ],
    recommendation: "Create dedicated mobile-optimized landing page for TikTok traffic. Target <2s load time.",
  },
  {
    area: "Targeting",
    score: 45,
    status: "warning",
    findings: [
      "Broad targeting — no interest refinement",
      "Not using TikTok Pixel custom audiences",
      "Missing lookalike audiences from existing customers",
      "Demographics don't match buyer profile (targeting 18-24 but buyers are 25-34)",
    ],
    recommendation: "Install TikTok Pixel, build custom audiences from purchasers, create lookalikes, narrow to 25-34.",
  },
  {
    area: "Attribution Gap",
    score: 65,
    status: "info",
    findings: [
      "TikTok 7-day view-through window may overcount — but also may undercount",
      "14 conversions tracked by Google that had TikTok view in prior 7 days",
      "Real ROAS may be ~2.1x when including assisted conversions (vs 1.5x direct)",
      "Still below breakeven after platform fees even with correction",
    ],
    recommendation: "Implement UTM tracking + server-side events for accurate cross-platform attribution.",
  },
];

// ── Components ──

function AnimatedNumber({ target, duration = 1500, prefix = "", suffix = "", decimals = 0 }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(eased * target);
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return <span ref={ref}>{prefix}{current.toFixed(decimals)}{suffix}</span>;
}

function HealthGauge({ score }) {
  const angle = (score / 100) * 180;
  const color = score < 40 ? "#EF4444" : score < 70 ? "#F59E0B" : "#10B981";
  const label = score < 40 ? "Critical" : score < 70 ? "Needs Work" : "Healthy";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width="220" height="130" viewBox="0 0 220 130">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
        <path d="M 20 120 A 90 90 0 0 1 200 120" fill="none" stroke="#1E293B" strokeWidth="18" strokeLinecap="round" />
        <path d="M 20 120 A 90 90 0 0 1 200 120" fill="none" stroke="url(#gaugeGrad)" strokeWidth="18" strokeLinecap="round"
          strokeDasharray={`${(angle / 180) * 283} 283`}
          style={{ transition: "stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }} />
        <line x1="110" y1="120" x2={110 + 70 * Math.cos(Math.PI - (angle * Math.PI) / 180)}
          y2={120 - 70 * Math.sin(Math.PI - (angle * Math.PI) / 180)}
          stroke={color} strokeWidth="3" strokeLinecap="round"
          style={{ transition: "all 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }} />
        <circle cx="110" cy="120" r="6" fill={color} />
      </svg>
      <div style={{ fontSize: 42, fontWeight: 800, color, letterSpacing: -2, lineHeight: 1 }}>
        <AnimatedNumber target={score} />
      </div>
      <div style={{ fontSize: 14, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: 2 }}>{label}</div>
    </div>
  );
}

function MetricCard({ label, value, subtext, trend, delay = 0 }) {
  const trendColor = trend === "up" ? "#10B981" : trend === "down" ? "#EF4444" : "#94A3B8";
  const trendIcon = trend === "up" ? "↗" : trend === "down" ? "↘" : "→";

  return (
    <div style={{
      background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
      borderRadius: 16, padding: "24px 20px", border: "1px solid #334155",
      animationDelay: `${delay}ms`, flex: 1, minWidth: 160,
    }}>
      <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "#F8FAFC", letterSpacing: -1 }}>{value}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
        <span style={{ color: trendColor, fontWeight: 700, fontSize: 14 }}>{trendIcon}</span>
        <span style={{ fontSize: 12, color: "#94A3B8" }}>{subtext}</span>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title, agent }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, marginTop: 40 }}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      <div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#F8FAFC", letterSpacing: -0.5 }}>{title}</h2>
        <span style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>Agent: {agent}</span>
      </div>
    </div>
  );
}

function FunnelBar({ stage, value, pct, maxValue, delay }) {
  const width = (value / maxValue) * 100;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
      <div style={{ width: 100, fontSize: 13, color: "#94A3B8", fontWeight: 500, textAlign: "right", flexShrink: 0 }}>{stage}</div>
      <div style={{ flex: 1, height: 32, background: "#1E293B", borderRadius: 8, overflow: "hidden", position: "relative" }}>
        <div style={{
          width: `${width}%`, height: "100%",
          background: `linear-gradient(90deg, #3B82F6 0%, ${pct < 10 ? "#EF4444" : pct < 30 ? "#F59E0B" : "#3B82F6"} 100%)`,
          borderRadius: 8, transition: "width 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
          transitionDelay: `${delay}ms`,
        }} />
        <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, fontWeight: 700, color: "#F8FAFC" }}>
          {value.toLocaleString()} ({pct}%)
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ platform, rating, count, unanswered, competitorAvg, period, monthlyAvg, trend }) {
  const gap = competitorAvg - rating;
  return (
    <div style={{
      background: "#0F172A", borderRadius: 12, padding: 20,
      border: `1px solid ${rating < 3.5 ? "#7F1D1D" : "#334155"}`, flex: 1, minWidth: 220,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC" }}>{platform}</div>
        <div style={{ fontSize: 9, color: "#64748B", background: "#1E293B", padding: "2px 6px", borderRadius: 4 }}>
          Source: {platform.includes("Google") ? "Google Business Profile API" : "Trustpilot API"}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontSize: 36, fontWeight: 800, color: rating < 3.5 ? "#EF4444" : "#F59E0B" }}>{rating}</span>
        <span style={{ fontSize: 14, color: "#64748B" }}>/ 5.0</span>
      </div>
      <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>
        {count} reviews ({period})
      </div>
      <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>
        ~{monthlyAvg} new reviews/month • Trend: <span style={{ color: trend === "declining" ? "#EF4444" : "#F59E0B" }}>{trend}</span>
      </div>
      <div style={{ fontSize: 12, color: "#EF4444", fontWeight: 600, marginTop: 8 }}>
        ⚠ {unanswered} unanswered
      </div>
      <div style={{ fontSize: 11, color: "#64748B", marginTop: 8, padding: "6px 0", borderTop: "1px solid #1E293B" }}>
        Gap vs competitors: <span style={{ color: "#EF4444", fontWeight: 700 }}>-{gap.toFixed(1)}★</span>
      </div>
    </div>
  );
}

// ── Main Dashboard ──
export default function ECommerceAuditDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const totalSpend = adSpendData.reduce((s, d) => s + d.spend, 0);
  const totalRevenue = adSpendData.reduce((s, d) => s + d.revenue, 0);

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "ads", label: "Ad Spend", icon: "💰" },
    { id: "attribution", label: "Attribution", icon: "🔀" },
    { id: "seo", label: "SEO & Traffic", icon: "🔍" },
    { id: "customers", label: "Customers", icon: "👥" },
    { id: "reputation", label: "Reputation", icon: "⭐" },
    { id: "ltv", label: "LTV & ROI", icon: "📈" },
    { id: "profitability", label: "Profit Leaks", icon: "🔍" },
    { id: "growth", label: "List Growth", icon: "📧" },
    { id: "calendar", label: "Comp. Calendar", icon: "📅" },
    { id: "tiktok", label: "TikTok Diagnostic", icon: "🔬" },
    { id: "actions", label: "Actions", icon: "🎯" },
  ];

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      background: "linear-gradient(180deg, #020617 0%, #0F172A 100%)",
      color: "#F8FAFC", minHeight: "100vh", padding: "0",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)",
        borderBottom: "1px solid #334155", padding: "28px 32px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#3B82F6", textTransform: "uppercase", letterSpacing: 3, marginBottom: 4 }}>
              Multicomm.ai — E-Commerce Audit
            </div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: -1, background: "linear-gradient(90deg, #F8FAFC, #94A3B8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Demo Store Analytics
            </h1>
            <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
              6-Agent Audit • Last 30 days • Generated March 8, 2026
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{
              padding: "4px 12px", borderRadius: 6, background: "#F59E0B20",
              border: "1px solid #F59E0B40", fontSize: 11, fontWeight: 700, color: "#F59E0B",
            }}>
              DEMO DATA
            </div>
            <div style={{
              background: "#0F172A", borderRadius: 12, padding: "12px 20px",
              border: "1px solid #334155", display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ fontSize: 12, color: "#64748B" }}>Business Health</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: healthScore < 70 ? "#F59E0B" : "#10B981" }}>{healthScore}</span>
              <span style={{ fontSize: 12, color: "#64748B" }}>/100</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginTop: 24, flexWrap: "wrap" }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "10px 18px", borderRadius: 10, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6,
              background: activeTab === tab.id ? "#3B82F6" : "transparent",
              color: activeTab === tab.id ? "#FFF" : "#94A3B8",
              transition: "all 0.2s",
            }}>
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "24px 32px", maxWidth: 1200, margin: "0 auto" }}>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div>
            <div style={{ display: "flex", gap: 24, justifyContent: "center", margin: "20px 0 32px" }}>
              <HealthGauge score={healthScore} />
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
              <MetricCard label="Total Ad Spend" value={`$${totalSpend.toLocaleString()}`} subtext="last 30 days" trend="down" />
              <MetricCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} subtext="from paid channels" trend="up" delay={100} />
              <MetricCard label="Blended ROAS" value={`${(totalRevenue / totalSpend).toFixed(1)}x`} subtext="target: 4.0x" trend="down" delay={200} />
              <MetricCard label="Conversion Rate" value="3.0%" subtext="industry avg: 3.5%" trend="down" delay={300} />
            </div>

            <SectionTitle icon="🎯" title="Critical Findings" agent="All 6 Agents" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {criticalFindings.map((f, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  background: "#0F172A", borderRadius: 12, padding: "14px 18px",
                  border: `1px solid ${f.severity === "critical" ? "#7F1D1D" : f.severity === "warning" ? "#78350F" : "#1E3A2F"}`,
                }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{f.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: "#E2E8F0", lineHeight: 1.5 }}>{f.text}</div>
                    <div style={{ fontSize: 11, color: "#64748B", marginTop: 4 }}>{f.agent}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── AD SPEND ── */}
        {activeTab === "ads" && (
          <div>
            <SectionTitle icon="💰" title="Ad Spend Analysis" agent="#8 Ad Spend Optimizer" />
            <div style={{ background: "#1E293B", borderRadius: 8, padding: "8px 14px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#64748B" }}>
              <span>📡</span><span>Sources: Meta Ads API (meta-ads-mcp) • Google Ads API (@samihalawa/google-ads-mcp-server) • TikTok Marketing API (AdsMCP)</span>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
              {adSpendData.map((d, i) => (
                <div key={i} style={{
                  flex: 1, minWidth: 200, background: "#0F172A", borderRadius: 14, padding: 20,
                  border: `1px solid ${d.roas < 2 ? "#7F1D1D" : "#334155"}`,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: d.color }}>{d.platform}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>Spend</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#F8FAFC" }}>${d.spend.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>Revenue</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#10B981" }}>${d.revenue.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>ROAS</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: d.roas < 2 ? "#EF4444" : d.roas < 3.5 ? "#F59E0B" : "#10B981" }}>{d.roas}x</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 300 }}>
                <h3 style={{ fontSize: 15, color: "#94A3B8", fontWeight: 600, marginBottom: 16 }}>ROAS by Platform</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={adSpendData} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="platform" tick={{ fill: "#94A3B8", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#F8FAFC" }} />
                    <Bar dataKey="roas" radius={[8, 8, 0, 0]}>
                      {adSpendData.map((d, i) => <Cell key={i} fill={d.roas < 2 ? "#EF4444" : d.roas < 3.5 ? "#F59E0B" : "#10B981"} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, minWidth: 300 }}>
                <h3 style={{ fontSize: 15, color: "#94A3B8", fontWeight: 600, marginBottom: 16 }}>Spend Distribution</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={adSpendData} dataKey="spend" nameKey="platform" cx="50%" cy="50%" innerRadius={60} outerRadius={100} strokeWidth={2} stroke="#0F172A">
                      {adSpendData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#F8FAFC" }} formatter={(v) => `$${v.toLocaleString()}`} />
                    <Legend wrapperStyle={{ fontSize: 12, color: "#94A3B8" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ background: "#0F172A", borderRadius: 12, padding: 20, marginTop: 24, border: "1px solid #334155" }}>
              <h3 style={{ fontSize: 15, color: "#94A3B8", fontWeight: 600, marginBottom: 12 }}>ROI by Channel (Marketing ROI Analyst)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={roiByChannel} layout="vertical" barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis type="number" tick={{ fill: "#94A3B8", fontSize: 12 }} />
                  <YAxis dataKey="channel" type="category" tick={{ fill: "#94A3B8", fontSize: 12 }} width={120} />
                  <Tooltip contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#F8FAFC" }} formatter={(v) => `${v}x ROI`} />
                  <Bar dataKey="roi" radius={[0, 8, 8, 0]}>
                    {roiByChannel.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── ATTRIBUTION 40-20-40 ── */}
        {activeTab === "attribution" && (
          <div>
            <SectionTitle icon="🔀" title="Attribution Model (40-20-40)" agent="#7 Marketing ROI Analyst" />

            {/* Model Explanation */}
            <div style={{
              background: "linear-gradient(135deg, #1E293B, #0F172A)", borderRadius: 14, padding: 24,
              border: "1px solid #334155", marginBottom: 28,
            }}>
              <div style={{ display: "flex", justifyContent: "center", gap: 0, flexWrap: "wrap", marginBottom: 16 }}>
                {[
                  { label: "First Touch", pct: "40%", desc: "Who brought them in?", color: "#3B82F6", icon: "🎯" },
                  { label: "Middle Touches", pct: "20%", desc: "Who nurtured them?", color: "#F59E0B", icon: "🔄" },
                  { label: "Last Touch", pct: "40%", desc: "Who closed the sale?", color: "#10B981", icon: "💰" },
                ].map((step, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center" }}>
                    <div style={{
                      textAlign: "center", padding: "16px 24px", minWidth: 160,
                      background: step.color + "15", borderRadius: 12,
                      border: `1px solid ${step.color}40`,
                    }}>
                      <div style={{ fontSize: 24, marginBottom: 4 }}>{step.icon}</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: step.color }}>{step.pct}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC", marginTop: 2 }}>{step.label}</div>
                      <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>{step.desc}</div>
                    </div>
                    {i < 2 && <div style={{ fontSize: 24, color: "#334155", padding: "0 8px" }}>→</div>}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 13, color: "#94A3B8", textAlign: "center", margin: 0 }}>
                Credit is split across the customer journey: 40% to the channel that first attracted the customer,
                20% to nurturing touchpoints, and 40% to the channel that closed the sale.
              </p>
            </div>

            {/* Weighted Attribution Score */}
            <h3 style={{ fontSize: 15, color: "#94A3B8", fontWeight: 600, marginBottom: 16 }}>Weighted Attribution Score by Channel</h3>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 32 }}>
              <div style={{ flex: 2, minWidth: 350 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={attributionWeighted} barSize={36}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="channel" tick={{ fill: "#94A3B8", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} label={{ value: "Weighted Score", angle: -90, position: "insideLeft", fill: "#64748B", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#F8FAFC" }}
                      formatter={(v, name) => [`${v}%`, name === "weighted" ? "Weighted Score" : name]}
                    />
                    <Bar dataKey="weighted" radius={[8, 8, 0, 0]}>
                      {attributionWeighted.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {attributionWeighted.sort((a, b) => b.weighted - a.weighted).map((d, i) => (
                    <div key={i} style={{
                      background: "#0F172A", borderRadius: 10, padding: "12px 16px",
                      border: `1px solid ${i === 0 ? d.color + "60" : "#1E293B"}`,
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color }} />
                        <span style={{ fontSize: 13, color: "#E2E8F0", fontWeight: 600 }}>{d.channel}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: d.color }}>{d.weighted}%</span>
                        <div style={{ fontSize: 11, color: "#64748B" }}>${d.revenue.toLocaleString()} rev</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stacked Attribution Breakdown */}
            <h3 style={{ fontSize: 15, color: "#94A3B8", fontWeight: 600, marginBottom: 16 }}>Attribution Breakdown: First vs Middle vs Last Touch</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={attributionWeighted} layout="vertical" barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="channel" type="category" tick={{ fill: "#94A3B8", fontSize: 12 }} width={110} />
                <Tooltip contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#F8FAFC" }} formatter={(v) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#94A3B8" }} />
                <Bar dataKey="firstTouch" name="First Touch (40%)" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="middle" name="Middle (20%)" stackId="a" fill="#F59E0B" />
                <Bar dataKey="lastTouch" name="Last Touch (40%)" stackId="a" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* New vs Repeat Summary Cards */}
            <h3 style={{ fontSize: 15, color: "#94A3B8", fontWeight: 600, marginBottom: 16, marginTop: 32 }}>New vs Repeat Customers</h3>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
              {[
                { type: "New Customers", icon: "🆕", color: "#3B82F6", ...newVsRepeatSummary.newCustomers },
                { type: "Repeat Customers", icon: "🔁", color: "#8B5CF6", ...newVsRepeatSummary.repeatCustomers },
              ].map((seg, i) => (
                <div key={i} style={{
                  flex: 1, minWidth: 280, background: "#0F172A", borderRadius: 14, padding: 22,
                  border: `1px solid ${seg.color}40`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                    <span style={{ fontSize: 22 }}>{seg.icon}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: seg.color }}>{seg.type}</span>
                    <span style={{
                      marginLeft: "auto", padding: "3px 10px", borderRadius: 20,
                      background: seg.color + "20", fontSize: 13, fontWeight: 700, color: seg.color,
                    }}>{seg.pctOfTotal}% of sales</span>
                  </div>
                  <div style={{ display: "flex", gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>Orders</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#F8FAFC" }}>{seg.count}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>Revenue</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#10B981" }}>${seg.revenue.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>Avg CAC</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: seg.avgCAC > 5 ? "#F59E0B" : "#10B981" }}>${seg.avgCAC}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>Avg Order</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#F8FAFC" }}>${seg.avgOrderValue}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Revenue by Channel: New vs Repeat */}
            <h3 style={{ fontSize: 15, color: "#94A3B8", fontWeight: 600, marginBottom: 16 }}>Revenue by Channel: New vs Repeat</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={channelByCustomerType} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="channel" tick={{ fill: "#94A3B8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#F8FAFC" }} formatter={(v) => `$${v.toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#94A3B8" }} />
                <Bar dataKey="newRev" name="New Customers" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="repeatRev" name="Repeat Customers" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            {/* Journey Paths - Tabbed New vs Repeat */}
            <div style={{ marginTop: 32 }}>
              <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, color: "#94A3B8", fontWeight: 600, margin: 0 }}>Customer Journey Paths</h3>
              </div>

              {/* New Customer Journeys */}
              <div style={{
                display: "inline-block", padding: "5px 14px", borderRadius: 20, marginBottom: 12,
                background: "#3B82F620", color: "#3B82F6", fontSize: 13, fontWeight: 700,
              }}>
                🆕 New Customer Journeys (multi-touch, 40-20-40 applies)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
                {newCustomerJourneys.map((j, i) => (
                  <div key={i} style={{
                    background: "#0F172A", borderRadius: 10, padding: "12px 16px",
                    border: `1px solid ${i === 0 ? "#3B82F620" : "#1E293B"}`,
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 6, background: "#1E293B",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 800, color: "#3B82F6", flexShrink: 0,
                    }}>#{i + 1}</div>
                    <div style={{ flex: 2, fontSize: 12, color: "#E2E8F0" }}>
                      {j.path.split(" → ").map((step, si, arr) => (
                        <span key={si}>
                          <span style={{
                            padding: "2px 6px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                            background: step.includes("Meta") ? "#4267B215" : step.includes("Google") ? "#34A85315" :
                              step.includes("Email") || step.includes("Welcome") || step.includes("Promo") ? "#8B5CF615" :
                              step.includes("SEO") || step.includes("Browse") ? "#F59E0B15" :
                              step.includes("TikTok") ? "#EF444415" : step.includes("Direct") ? "#94A3B815" : "#10B98115",
                            color: step.includes("Meta") || step.includes("Retarget") ? "#4267B2" : step.includes("Google") ? "#34A853" :
                              step.includes("Email") || step.includes("Welcome") || step.includes("Promo") || step.includes("Signup") ? "#8B5CF6" :
                              step.includes("SEO") || step.includes("Browse") ? "#F59E0B" :
                              step.includes("TikTok") ? "#EF4444" : step.includes("Direct") ? "#94A3B8" : "#10B981",
                          }}>{step}</span>
                          {si < arr.length - 1 && <span style={{ color: "#334155", padding: "0 4px", fontSize: 10 }}>→</span>}
                        </span>
                      ))}
                    </div>
                    <div style={{ textAlign: "center", minWidth: 55 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#F8FAFC" }}>{j.conversions}</div>
                      <div style={{ fontSize: 10, color: "#64748B" }}>sales</div>
                    </div>
                    <div style={{ textAlign: "center", minWidth: 65 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#10B981" }}>${j.revenue.toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: "#64748B" }}>revenue</div>
                    </div>
                    <div style={{ textAlign: "center", minWidth: 50 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#F59E0B" }}>{j.avgDays}d</div>
                      <div style={{ fontSize: 10, color: "#64748B" }}>avg time</div>
                    </div>
                    <div style={{
                      padding: "3px 8px", borderRadius: 6, background: "#1E293B",
                      fontSize: 11, fontWeight: 700, color: "#64748B", flexShrink: 0,
                    }}>{j.pct}%</div>
                  </div>
                ))}
              </div>

              {/* Repeat Customer Journeys */}
              <div style={{
                display: "inline-block", padding: "5px 14px", borderRadius: 20, marginBottom: 12,
                background: "#8B5CF620", color: "#8B5CF6", fontSize: 13, fontWeight: 700,
              }}>
                🔁 Repeat Customer Journeys (Klaviyo-driven, near-zero CAC)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {repeatCustomerJourneys.map((j, i) => (
                  <div key={i} style={{
                    background: "#0F172A", borderRadius: 10, padding: "12px 16px",
                    border: `1px solid ${i === 0 ? "#8B5CF620" : "#1E293B"}`,
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 6, background: "#1E293B",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 800, color: "#8B5CF6", flexShrink: 0,
                    }}>#{i + 1}</div>
                    <div style={{ flex: 2, fontSize: 12, color: "#E2E8F0" }}>
                      {j.path.split(" → ").map((step, si, arr) => (
                        <span key={si}>
                          <span style={{
                            padding: "2px 6px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                            background: step.includes("Klaviyo") || step.includes("Email") ? "#8B5CF615" :
                              step.includes("Google") ? "#34A85315" : step.includes("Direct") || step.includes("bookmark") ? "#94A3B815" :
                              step.includes("Browse") ? "#F59E0B15" : "#10B98115",
                            color: step.includes("Klaviyo") || step.includes("Email") ? "#8B5CF6" :
                              step.includes("Google") ? "#34A853" : step.includes("Direct") || step.includes("bookmark") ? "#94A3B8" :
                              step.includes("Browse") ? "#F59E0B" :
                              step.includes("Click") ? "#3B82F6" : "#10B981",
                          }}>{step}</span>
                          {si < arr.length - 1 && <span style={{ color: "#334155", padding: "0 4px", fontSize: 10 }}>→</span>}
                        </span>
                      ))}
                    </div>
                    <div style={{ textAlign: "center", minWidth: 55 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#F8FAFC" }}>{j.conversions}</div>
                      <div style={{ fontSize: 10, color: "#64748B" }}>sales</div>
                    </div>
                    <div style={{ textAlign: "center", minWidth: 65 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#10B981" }}>${j.revenue.toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: "#64748B" }}>revenue</div>
                    </div>
                    <div style={{ textAlign: "center", minWidth: 50 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: j.avgDays === 0 ? "#10B981" : "#F59E0B" }}>
                        {j.avgDays === 0 ? "instant" : `${j.avgDays}d`}
                      </div>
                      <div style={{ fontSize: 10, color: "#64748B" }}>avg time</div>
                    </div>
                    <div style={{
                      padding: "3px 8px", borderRadius: 6, background: "#1E293B",
                      fontSize: 11, fontWeight: 700, color: "#64748B", flexShrink: 0,
                    }}>{j.pct}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Insight - Updated */}
            <div style={{
              background: "linear-gradient(135deg, #1E293B, #0F172A)", borderRadius: 14, padding: 24,
              border: "1px solid #8B5CF640", marginTop: 28,
            }}>
              <h3 style={{ fontSize: 15, color: "#8B5CF6", fontWeight: 700, marginBottom: 12 }}>💡 Attribution Insight</h3>
              <p style={{ fontSize: 15, color: "#E2E8F0", lineHeight: 1.7, margin: 0 }}>
                <strong style={{ color: "#8B5CF6" }}>62% of your revenue comes from repeat customers</strong> — and their journeys are 
                radically simpler. Repeat customers receive a Klaviyo email, click, and buy. No ads needed. 
                CAC for repeat customers is <strong style={{ color: "#10B981" }}>$0.32</strong> vs 
                <strong style={{ color: "#F59E0B" }}> $16.74</strong> for new customers — a <strong>52x difference</strong>.
              </p>
              <p style={{ fontSize: 15, color: "#E2E8F0", lineHeight: 1.7, margin: "12px 0 0" }}>
                For <strong style={{ color: "#3B82F6" }}>new customers</strong>, the 40-20-40 model shows Meta Ads brings them in (first touch), 
                Google/SEO nurtures (middle), and email closes. Average conversion takes <strong>6-15 days</strong> across multiple touchpoints.
                For <strong style={{ color: "#8B5CF6" }}>repeat customers</strong>, Klaviyo is first touch AND last touch — 
                the email IS the entire journey. 35% of repeat sales come from a single promo email click.
              </p>
              <p style={{ fontSize: 15, color: "#E2E8F0", lineHeight: 1.7, margin: "12px 0 0" }}>
                <strong style={{ color: "#EF4444" }}>The opportunity:</strong> You're spending $7,500/mo on ads to acquire new customers at $16.74 each, 
                but only $200/mo on Klaviyo which generates <strong style={{ color: "#10B981" }}>$36,430/mo from repeat customers</strong>. 
                Every dollar invested in growing your email list and improving Klaviyo flows has 
                <strong style={{ color: "#10B981" }}> compounding returns</strong> — ads bring a customer once, 
                email monetizes them forever.
              </p>
            </div>
          </div>
        )}

        {/* ── SEO & TRAFFIC ── */}
        {activeTab === "seo" && (
          <div>
            <SectionTitle icon="🔍" title="SEO & Traffic Performance" agent="#9 SEO Performance Agent" />
            <div style={{ background: "#1E293B", borderRadius: 8, padding: "8px 14px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#64748B" }}>
              <span>📡</span><span>Sources: GA4 Analytics Data API • Google Search Console API • Lighthouse (Roier SEO)</span>
            </div>

            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 32 }}>
              <div style={{ flex: 2, minWidth: 350 }}>
                <h3 style={{ fontSize: 15, color: "#94A3B8", fontWeight: 600, marginBottom: 16 }}>Sessions & Conversions (30 days)</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={trafficTrend}>
                    <defs>
                      <linearGradient id="sessGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="day" tick={{ fill: "#94A3B8", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#F8FAFC" }} />
                    <Area type="monotone" dataKey="sessions" stroke="#3B82F6" fill="url(#sessGrad)" strokeWidth={2} />
                    <Line type="monotone" dataKey="conversions" stroke="#10B981" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <h3 style={{ fontSize: 15, color: "#94A3B8", fontWeight: 600, marginBottom: 16 }}>Lighthouse Scores</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={seoScores}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: "#94A3B8", fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "#64748B", fontSize: 10 }} />
                    <Radar dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {seoScores.map((s, i) => (
                <div key={i} style={{
                  flex: 1, minWidth: 140, background: "#0F172A", borderRadius: 12, padding: 16, textAlign: "center",
                  border: `1px solid ${s.score < 50 ? "#7F1D1D" : "#334155"}`,
                }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: s.score < 50 ? "#EF4444" : s.score < 70 ? "#F59E0B" : "#10B981" }}>{s.score}</div>
                  <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>{s.metric}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CUSTOMERS ── */}
        {activeTab === "customers" && (
          <div>
            <SectionTitle icon="👥" title="Customer Behavior" agent="#5 Customer Behavior Analyst" />
            <div style={{ background: "#1E293B", borderRadius: 8, padding: "8px 14px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#64748B" }}>
              <span>📡</span><span>Sources: GA4 Analytics Data API (demographics, events, funnels) • Klaviyo (email flows, abandoned cart)</span>
            </div>

            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 32 }}>
              <div style={{ flex: 1, minWidth: 300 }}>
                <h3 style={{ fontSize: 15, color: "#94A3B8", fontWeight: 600, marginBottom: 16 }}>Demographics</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={demographics} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} strokeWidth={2} stroke="#0F172A">
                      {demographics.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#F8FAFC" }} formatter={(v) => `${v}%`} />
                    <Legend wrapperStyle={{ fontSize: 12, color: "#94A3B8" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, minWidth: 300 }}>
                <h3 style={{ fontSize: 15, color: "#94A3B8", fontWeight: 600, marginBottom: 16 }}>Conversion Funnel</h3>
                <div style={{ padding: "10px 0" }}>
                  {funnelData.map((d, i) => (
                    <FunnelBar key={i} {...d} maxValue={funnelData[0].value} delay={i * 200} />
                  ))}
                </div>
              </div>
            </div>

            <div style={{
              background: "linear-gradient(135deg, #1E293B, #0F172A)", borderRadius: 14, padding: 24,
              border: "1px solid #334155",
            }}>
              <h3 style={{ fontSize: 15, color: "#F59E0B", fontWeight: 700, marginBottom: 12 }}>💡 Key Insight</h3>
              <p style={{ fontSize: 15, color: "#E2E8F0", lineHeight: 1.7, margin: 0 }}>
                Women 25-34 represent <strong style={{ color: "#8B5CF6" }}>35% of customers</strong> but your ad creative targets men predominantly.
                Realigning creative assets to match actual demographics could increase ROAS by an estimated <strong style={{ color: "#10B981" }}>25-40%</strong>.
                Additionally, the <strong style={{ color: "#EF4444" }}>80% cart abandonment rate</strong> combined with no active Klaviyo recovery flow means
                you're leaving approximately <strong style={{ color: "#F59E0B" }}>$8,820/month</strong> on the table.
              </p>
            </div>
          </div>
        )}

        {/* ── REPUTATION ── */}
        {activeTab === "reputation" && (
          <div>
            <SectionTitle icon="⭐" title="Social Proof & Reputation" agent="#10 Social Proof Auditor" />

            {/* Data source notice */}
            <div style={{
              background: "#1E293B", borderRadius: 8, padding: "8px 14px", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#64748B",
            }}>
              <span>📡</span>
              <span>Data sources: Google Business Profile API, Trustpilot API, Outscraper MCP | Competitors: identified by client during intake</span>
            </div>

            {/* Your Ratings */}
            <h3 style={{ fontSize: 15, color: "#94A3B8", fontWeight: 600, marginBottom: 12 }}>Your Ratings</h3>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
              <ReviewCard platform="Google Reviews" {...reviewsData.google} competitorAvg={competitorAvgRating} />
              <ReviewCard platform="Trustpilot" {...reviewsData.trustpilot} competitorAvg={competitorAvgRating} />
            </div>

            {/* Named Competitors */}
            <h3 style={{ fontSize: 15, color: "#94A3B8", fontWeight: 600, marginBottom: 12 }}>Competitor Comparison (client-identified)</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
              {/* Header */}
              <div style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
                background: "#334155", borderRadius: 10, fontSize: 11, fontWeight: 700, color: "#94A3B8",
              }}>
                <div style={{ flex: 2 }}>Competitor</div>
                <div style={{ flex: 1, textAlign: "center" }}>Google ★</div>
                <div style={{ flex: 1, textAlign: "center" }}>Google Reviews</div>
                <div style={{ flex: 1, textAlign: "center" }}>Trustpilot ★</div>
                <div style={{ flex: 1, textAlign: "center" }}>Trustpilot Reviews</div>
                <div style={{ flex: 1, textAlign: "center" }}>Source</div>
              </div>
              {/* Your store row */}
              <div style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                background: "#0F172A", borderRadius: 10, border: "1px solid #7F1D1D",
              }}>
                <div style={{ flex: 2, fontSize: 13, fontWeight: 700, color: "#F8FAFC" }}>Your Store ⬅</div>
                <div style={{ flex: 1, textAlign: "center", fontSize: 18, fontWeight: 800, color: "#EF4444" }}>{reviewsData.google.rating}</div>
                <div style={{ flex: 1, textAlign: "center", fontSize: 13, color: "#94A3B8" }}>{reviewsData.google.count}</div>
                <div style={{ flex: 1, textAlign: "center", fontSize: 18, fontWeight: 800, color: "#F59E0B" }}>{reviewsData.trustpilot.rating}</div>
                <div style={{ flex: 1, textAlign: "center", fontSize: 13, color: "#94A3B8" }}>{reviewsData.trustpilot.count}</div>
                <div style={{ flex: 1, textAlign: "center", fontSize: 10, color: "#64748B" }}>Your data</div>
              </div>
              {/* Competitor rows */}
              {competitors.map((c, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                  background: "#0F172A", borderRadius: 10, border: "1px solid #1E293B",
                }}>
                  <div style={{ flex: 2, fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>{c.name}</div>
                  <div style={{ flex: 1, textAlign: "center", fontSize: 18, fontWeight: 800, color: "#10B981" }}>{c.google}</div>
                  <div style={{ flex: 1, textAlign: "center", fontSize: 13, color: "#94A3B8" }}>{c.googleCount}</div>
                  <div style={{ flex: 1, textAlign: "center", fontSize: 18, fontWeight: 800, color: "#10B981" }}>{c.trustpilot}</div>
                  <div style={{ flex: 1, textAlign: "center", fontSize: 13, color: "#94A3B8" }}>{c.trustpilotCount}</div>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <span style={{ fontSize: 9, color: "#64748B", background: "#1E293B", padding: "2px 6px", borderRadius: 4 }}>{c.source}</span>
                  </div>
                </div>
              ))}
              {/* Average row */}
              <div style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
                background: "#1E293B", borderRadius: 10,
              }}>
                <div style={{ flex: 2, fontSize: 12, fontWeight: 700, color: "#94A3B8" }}>COMPETITOR AVERAGE</div>
                <div style={{ flex: 1, textAlign: "center", fontSize: 18, fontWeight: 800, color: "#10B981" }}>{competitorAvgRating}</div>
                <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: "#64748B" }}>{Math.round(competitors.reduce((s,c) => s + c.googleCount, 0) / competitors.length)} avg</div>
                <div style={{ flex: 1, textAlign: "center", fontSize: 18, fontWeight: 800, color: "#10B981" }}>
                  {(competitors.reduce((s,c) => s + c.trustpilot, 0) / competitors.length).toFixed(1)}
                </div>
                <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: "#64748B" }}>{Math.round(competitors.reduce((s,c) => s + c.trustpilotCount, 0) / competitors.length)} avg</div>
                <div style={{ flex: 1 }}></div>
              </div>
            </div>

            {/* Corrected Insight */}
            <div style={{ background: "#0F172A", borderRadius: 14, padding: 24, border: "1px solid #7F1D1D" }}>
              <h3 style={{ fontSize: 15, color: "#EF4444", fontWeight: 700, marginBottom: 12 }}>⚠️ Reputation Gap Analysis</h3>
              <p style={{ fontSize: 14, color: "#E2E8F0", lineHeight: 1.7, margin: 0 }}>
                Your Google rating (<strong style={{ color: "#EF4444" }}>{reviewsData.google.rating}★</strong>) is
                <strong style={{ color: "#EF4444" }}> {(competitorAvgRating - reviewsData.google.rating).toFixed(1)} stars below</strong> the
                average of your 3 named competitors ({competitors.map(c => c.name).join(", ")}).
              </p>
              <p style={{ fontSize: 14, color: "#E2E8F0", lineHeight: 1.7, margin: "12px 0 0" }}>
                <strong style={{ color: "#F59E0B" }}>About responding to reviews:</strong> Responding to the {reviewsData.google.unanswered + reviewsData.trustpilot.unanswered} unanswered
                reviews won't directly change your star rating — ratings are based on product/service quality.
                However, <strong>89% of consumers read business responses</strong> before purchasing. Responding shows future
                buyers that you care, can resolve issues that lead to updated ratings, and prevents escalation.
                It's a trust signal, not a rating hack.
              </p>
              <p style={{ fontSize: 14, color: "#E2E8F0", lineHeight: 1.7, margin: "12px 0 0" }}>
                <strong style={{ color: "#10B981" }}>To actually improve your rating:</strong> Implement a post-purchase review
                request flow in Klaviyo targeting satisfied customers (those with repeat purchases or high order values).
                Satisfied customers rarely leave reviews unprompted — but 70% will when asked.
                This is how {competitors[0].name} built up {competitors[0].googleCount} reviews at {competitors[0].google}★.
              </p>
            </div>
          </div>
        )}

        {/* ── LTV & ROI ── */}
        {activeTab === "ltv" && (
          <div>
            <SectionTitle icon="📈" title="Customer Lifetime Value & ROI" agent="#7 Marketing ROI Analyst" />

            {/* The Big Comparison */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
              <div style={{
                flex: 1, minWidth: 260, background: "#0F172A", borderRadius: 14, padding: 24,
                border: "1px solid #EF444440", textAlign: "center",
              }}>
                <div style={{ fontSize: 12, color: "#EF4444", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
                  Without Klaviyo (1 purchase)
                </div>
                <div style={{ fontSize: 13, color: "#64748B", marginBottom: 4 }}>Customer buys once, never returns</div>
                <div style={{ fontSize: 48, fontWeight: 800, color: "#EF4444", letterSpacing: -2 }}>5.98x</div>
                <div style={{ fontSize: 13, color: "#94A3B8" }}>ROI</div>
                <div style={{ marginTop: 12, fontSize: 12, color: "#64748B" }}>
                  $100 revenue / $16.74 CAC = $83.26 profit
                </div>
              </div>
              <div style={{
                flex: 1, minWidth: 260, background: "#0F172A", borderRadius: 14, padding: 24,
                border: "1px solid #10B98140", textAlign: "center",
                boxShadow: "0 0 30px #10B98110",
              }}>
                <div style={{ fontSize: 12, color: "#10B981", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
                  With Klaviyo (4 purchases)
                </div>
                <div style={{ fontSize: 13, color: "#64748B", marginBottom: 4 }}>Customer receives emails, buys 3 more times</div>
                <div style={{ fontSize: 48, fontWeight: 800, color: "#10B981", letterSpacing: -2 }}>22.6x</div>
                <div style={{ fontSize: 13, color: "#94A3B8" }}>ROI</div>
                <div style={{ marginTop: 12, fontSize: 12, color: "#64748B" }}>
                  $400 revenue / $17.70 total cost = $382.30 profit
                </div>
              </div>
              <div style={{
                flex: 1, minWidth: 260, background: "#0F172A", borderRadius: 14, padding: 24,
                border: "1px solid #3B82F640", textAlign: "center",
              }}>
                <div style={{ fontSize: 12, color: "#3B82F6", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
                  Difference
                </div>
                <div style={{ fontSize: 13, color: "#64748B", marginBottom: 4 }}>Same $16.74 ad spend, 3.78x more return</div>
                <div style={{ fontSize: 48, fontWeight: 800, color: "#3B82F6", letterSpacing: -2 }}>+278%</div>
                <div style={{ fontSize: 13, color: "#94A3B8" }}>more profit per customer</div>
                <div style={{ marginTop: 12, fontSize: 12, color: "#64748B" }}>
                  $382.30 vs $83.26 = $299.04 extra per customer
                </div>
              </div>
            </div>

            {/* ROI Growth Chart */}
            <h3 style={{ fontSize: 15, color: "#94A3B8", fontWeight: 600, marginBottom: 16 }}>ROI Growth Per Additional Purchase</h3>
            <div style={{ background: "#0F172A", borderRadius: 14, padding: 20, border: "1px solid #334155", marginBottom: 28 }}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={ltvByPurchase}>
                  <defs>
                    <linearGradient id="roiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="purchase" tick={{ fill: "#94A3B8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} tickFormatter={(v) => `${v}x`} />
                  <Tooltip contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#F8FAFC" }}
                    formatter={(v, name) => [name === "roi" ? `${v}x` : `$${v}`, name === "roi" ? "ROI" : name === "revenue" ? "Revenue" : "Total Cost"]} />
                  <Area type="monotone" dataKey="roi" stroke="#8B5CF6" fill="url(#roiGrad)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 12 }}>
                <span style={{ fontSize: 12, color: "#64748B" }}>1st purchase: <strong style={{ color: "#F59E0B" }}>5.98x</strong></span>
                <span style={{ fontSize: 12, color: "#64748B" }}>4th purchase: <strong style={{ color: "#8B5CF6" }}>22.6x</strong></span>
                <span style={{ fontSize: 12, color: "#64748B" }}>8th purchase: <strong style={{ color: "#10B981" }}>42.1x</strong></span>
              </div>
            </div>

            {/* Scenario Comparison */}
            <h3 style={{ fontSize: 15, color: "#94A3B8", fontWeight: 600, marginBottom: 16 }}>LTV Scenarios: Email Strategy Impact</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
              {ltvComparison.map((s, i) => (
                <div key={i} style={{
                  background: "#0F172A", borderRadius: 12, padding: "14px 20px",
                  border: `1px solid ${i === 2 ? s.color + "60" : "#1E293B"}`,
                  display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
                  boxShadow: i === 2 ? `0 0 20px ${s.color}10` : "none",
                }}>
                  <div style={{ minWidth: 140 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.scenario}</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>{s.purchases} purchase{s.purchases > 1 ? "s" : ""} per customer</div>
                  </div>
                  <div style={{ flex: 1, height: 24, background: "#1E293B", borderRadius: 12, overflow: "hidden", minWidth: 200 }}>
                    <div style={{
                      width: `${(s.roi / 45) * 100}%`, height: "100%", borderRadius: 12,
                      background: `linear-gradient(90deg, ${s.color}80, ${s.color})`,
                      transition: "width 1s ease-out",
                    }} />
                  </div>
                  <div style={{ display: "flex", gap: 20 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.roi}x</div>
                      <div style={{ fontSize: 10, color: "#64748B" }}>ROI</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#F8FAFC" }}>${s.ltv}</div>
                      <div style={{ fontSize: 10, color: "#64748B" }}>LTV</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#10B981" }}>${s.profit.toFixed(0)}</div>
                      <div style={{ fontSize: 10, color: "#64748B" }}>profit</div>
                    </div>
                  </div>
                  {i === 2 && <div style={{ padding: "3px 10px", borderRadius: 20, background: "#8B5CF620", fontSize: 11, fontWeight: 700, color: "#8B5CF6" }}>YOUR CURRENT POTENTIAL</div>}
                </div>
              ))}
            </div>

            {/* Scale Impact */}
            <div style={{
              background: "linear-gradient(135deg, #1E3A5F, #1E293B)", borderRadius: 16, padding: 28,
              border: "1px solid #3B82F6", textAlign: "center",
            }}>
              <div style={{ fontSize: 13, color: "#3B82F6", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
                At Scale: 448 New Customers/Month
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap", marginTop: 16 }}>
                <div>
                  <div style={{ fontSize: 13, color: "#EF4444", fontWeight: 600, marginBottom: 4 }}>Without Email Retention</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "#EF4444" }}>$37,300</div>
                  <div style={{ fontSize: 12, color: "#64748B" }}>annual profit (448 × $83.26)</div>
                </div>
                <div style={{ fontSize: 40, color: "#334155", alignSelf: "center" }}>→</div>
                <div>
                  <div style={{ fontSize: 13, color: "#10B981", fontWeight: 600, marginBottom: 4 }}>With Klaviyo (4 purchases)</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: "#10B981" }}>$171,270</div>
                  <div style={{ fontSize: 12, color: "#64748B" }}>annual profit (448 × $382.30)</div>
                </div>
              </div>
              <div style={{ fontSize: 42, fontWeight: 800, color: "#F8FAFC", marginTop: 20, letterSpacing: -2 }}>
                +$133,970/year
              </div>
              <div style={{ fontSize: 14, color: "#94A3B8", marginTop: 4 }}>
                additional profit from email retention alone
              </div>
            </div>
          </div>
        )}

        {/* ── PROFITABILITY LEAKS ── */}
        {activeTab === "profitability" && (
          <div>
            <SectionTitle icon="🔍" title="Profitability Leak Analysis" agent="#7 Profitability Leak Analyst" />
            <div style={{ background: "#1E293B", borderRadius: 8, padding: "8px 14px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#64748B" }}>
              <span>📡</span><span>Sources: Shopify/WooCommerce order data • Payment processor reports • Shipping cost data • Coupon usage logs</span>
            </div>

            {/* Summary Cards */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
              <div style={{
                flex: 1, minWidth: 200, background: "#0F172A", borderRadius: 14, padding: 22,
                border: "1px solid #EF444440", textAlign: "center",
              }}>
                <div style={{ fontSize: 11, color: "#EF4444", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Total Monthly Leaks</div>
                <div style={{ fontSize: 42, fontWeight: 800, color: "#EF4444", letterSpacing: -2 }}>${totalLeaks.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>money lost or left on table per month</div>
              </div>
              <div style={{
                flex: 1, minWidth: 200, background: "#0F172A", borderRadius: 14, padding: 22,
                border: "1px solid #10B98140", textAlign: "center",
              }}>
                <div style={{ fontSize: 11, color: "#10B981", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Annual Impact</div>
                <div style={{ fontSize: 42, fontWeight: 800, color: "#10B981", letterSpacing: -2 }}>${(totalLeaks * 12).toLocaleString()}</div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>potential savings + recovered revenue per year</div>
              </div>
              <div style={{
                flex: 1, minWidth: 200, background: "#0F172A", borderRadius: 14, padding: 22,
                border: "1px solid #3B82F640", textAlign: "center",
              }}>
                <div style={{ fontSize: 11, color: "#3B82F6", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Leak Categories</div>
                <div style={{ fontSize: 42, fontWeight: 800, color: "#3B82F6", letterSpacing: -2 }}>{profitabilityLeaks.length}</div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>areas identified with actionable fixes</div>
              </div>
            </div>

            {/* Leak Bars - Sorted by Size */}
            <h3 style={{ fontSize: 15, color: "#94A3B8", fontWeight: 600, marginBottom: 16 }}>Leaks by Impact (Monthly $)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={[...profitabilityLeaks].sort((a, b) => b.leak - a.leak)} layout="vertical" barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis type="number" tick={{ fill: "#94A3B8", fontSize: 11 }} tickFormatter={(v) => `$${(v/1000).toFixed(1)}k`} />
                <YAxis dataKey="category" type="category" tick={{ fill: "#94A3B8", fontSize: 11 }} width={180} />
                <Tooltip contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#F8FAFC" }} formatter={(v) => `$${v.toLocaleString()}/mo`} />
                <Bar dataKey="leak" radius={[0, 8, 8, 0]}>
                  {[...profitabilityLeaks].sort((a, b) => b.leak - a.leak).map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Detailed Leak Cards */}
            <h3 style={{ fontSize: 15, color: "#94A3B8", fontWeight: 600, marginBottom: 16, marginTop: 28 }}>Detailed Analysis</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {profitabilityLeaks.sort((a, b) => b.leak - a.leak).map((leak, i) => (
                <div key={i} style={{
                  background: "#0F172A", borderRadius: 14, padding: 20,
                  border: `1px solid ${leak.leak > 1000 ? "#7F1D1D" : "#334155"}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 24 }}>{leak.icon}</span>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#F8FAFC" }}>{leak.category}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "#64748B" }}>Current</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#EF4444" }}>${leak.currentCost.toLocaleString()}/mo</div>
                      </div>
                      {leak.benchmarkCost > 0 && (
                        <>
                          <span style={{ color: "#334155" }}>→</span>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 11, color: "#64748B" }}>Benchmark</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: "#10B981" }}>${leak.benchmarkCost.toLocaleString()}/mo</div>
                          </div>
                        </>
                      )}
                      <div style={{
                        padding: "6px 14px", borderRadius: 8, background: "#EF444420",
                        border: "1px solid #EF444440",
                      }}>
                        <div style={{ fontSize: 11, color: "#EF4444" }}>Leak</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#EF4444" }}>${leak.leak.toLocaleString()}/mo</div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    fontSize: 13, color: "#CBD5E1", lineHeight: 1.6, marginBottom: 12,
                    padding: "10px 12px", background: "#1E293B", borderRadius: 8,
                  }}>
                    {leak.detail}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <div style={{ fontSize: 13, color: "#10B981", fontWeight: 600 }}>
                      ✅ {leak.action}
                    </div>
                    <div style={{
                      padding: "3px 10px", borderRadius: 6, background: "#1E293B",
                      fontSize: 11, fontWeight: 600, color: "#94A3B8",
                    }}>{leak.effort}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Line */}
            <div style={{
              background: "linear-gradient(135deg, #1E293B, #0F172A)", borderRadius: 16, padding: 28,
              border: "1px solid #EF4444", marginTop: 28, textAlign: "center",
            }}>
              <div style={{ fontSize: 13, color: "#EF4444", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
                Total Recoverable Revenue
              </div>
              <div style={{ fontSize: 48, fontWeight: 800, color: "#F8FAFC", letterSpacing: -2 }}>
                ${totalLeaks.toLocaleString()}/mo
              </div>
              <div style={{ fontSize: 15, color: "#94A3B8", marginTop: 4 }}>
                = <strong style={{ color: "#10B981" }}>${(totalLeaks * 12).toLocaleString()}/year</strong> in savings + recovered revenue
              </div>
              <div style={{ fontSize: 13, color: "#64748B", marginTop: 12 }}>
                Most fixes take less than 1 day to implement • No additional ad spend required
              </div>
            </div>
          </div>
        )}

        {/* ── EMAIL LIST GROWTH ── */}
        {activeTab === "growth" && (() => {
          const subscriberValue = 12;
          const currentListSize = 2840;
          const monthlyTraffic = 24500;
          const currentCaptureRate = 1.2;
          const currentMonthlyCapture = Math.round(monthlyTraffic * currentCaptureRate / 100);

          const growthStrategies = [
            {
              category: "On-Site Capture (Free)",
              icon: "🌐",
              color: "#3B82F6",
              tactics: [
                { name: "Exit-Intent Popup (10% off)", captureRate: 3.5, monthlySubs: Math.round(monthlyTraffic * 0.035), cost: 0, effort: "2 hours", priority: "high" },
                { name: "Embedded signup in blog/content", captureRate: 0.8, monthlySubs: Math.round(monthlyTraffic * 0.008), cost: 0, effort: "1 hour", priority: "medium" },
                { name: "Checkout opt-in checkbox", captureRate: 1.2, monthlySubs: Math.round(735 * 0.45), cost: 0, effort: "30 min", priority: "high" },
                { name: "Spin-to-win wheel (gamified)", captureRate: 5.0, monthlySubs: Math.round(monthlyTraffic * 0.02), cost: 0, effort: "3 hours", priority: "medium" },
              ]
            },
            {
              category: "Paid Acquisition",
              icon: "💰",
              color: "#F59E0B",
              tactics: [
                { name: "Meta Lead Ads → Klaviyo signup", captureRate: null, monthlySubs: 320, cost: 640, effort: "1 day", priority: "high" },
                { name: "Google Ads landing page capture", captureRate: null, monthlySubs: 180, cost: 450, effort: "1 day", priority: "medium" },
                { name: "Instagram Story swipe-up offer", captureRate: null, monthlySubs: 150, cost: 300, effort: "4 hours", priority: "medium" },
              ]
            },
            {
              category: "Post-Purchase & Referral",
              icon: "🔁",
              color: "#8B5CF6",
              tactics: [
                { name: "Referral program (give 15%, get 15%)", captureRate: null, monthlySubs: 110, cost: 0, effort: "1 day", priority: "high" },
                { name: "Package insert with QR code", captureRate: null, monthlySubs: 85, cost: 50, effort: "2 hours", priority: "medium" },
                { name: "Post-purchase review → subscribe flow", captureRate: null, monthlySubs: 65, cost: 0, effort: "3 hours", priority: "medium" },
                { name: "SMS opt-in at checkout", captureRate: null, monthlySubs: 95, cost: 0, effort: "1 hour", priority: "high" },
              ]
            },
          ];

          const totalNewSubs = growthStrategies.reduce((sum, cat) =>
            sum + cat.tactics.reduce((s, t) => s + t.monthlySubs, 0), 0);
          const totalMonthlyCost = growthStrategies.reduce((sum, cat) =>
            sum + cat.tactics.reduce((s, t) => s + t.cost, 0), 0);

          const projectionMonths = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => {
            const withGrowth = currentListSize + (totalNewSubs * m);
            const without = currentListSize + (currentMonthlyCapture * m);
            return {
              month: m === 0 ? "Now" : `M${m}`,
              withGrowth,
              without,
              revenueWith: Math.round(withGrowth * 0.03 * 100 * 0.35),
              revenueWithout: Math.round(without * 0.03 * 100 * 0.35),
            };
          });

          return (
          <div>
            <SectionTitle icon="📧" title="Email List Growth Strategy" agent="#7 Marketing ROI Analyst + #5 Customer Behavior" />

            {/* Current State */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
              {[
                { label: "Current List Size", value: currentListSize.toLocaleString(), sub: "active subscribers", color: "#94A3B8" },
                { label: "Monthly Capture", value: currentMonthlyCapture.toString(), sub: `${currentCaptureRate}% capture rate`, color: "#EF4444" },
                { label: "Subscriber Value", value: `$${subscriberValue}`, sub: "projected LTV per email", color: "#10B981" },
                { label: "Potential Monthly Capture", value: totalNewSubs.toLocaleString(), sub: "with all strategies active", color: "#8B5CF6" },
              ].map((m, i) => (
                <div key={i} style={{
                  flex: 1, minWidth: 180, background: "#0F172A", borderRadius: 12, padding: 18,
                  border: `1px solid ${m.color}30`,
                }}>
                  <div style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>{m.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{m.sub}</div>
                </div>
              ))}
            </div>

            {/* Growth Strategies */}
            {growthStrategies.map((cat, ci) => (
              <div key={ci} style={{ marginBottom: 24 }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px",
                  borderRadius: 20, background: cat.color + "15", marginBottom: 12,
                }}>
                  <span style={{ fontSize: 16 }}>{cat.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: cat.color }}>{cat.category}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {cat.tactics.map((t, ti) => (
                    <div key={ti} style={{
                      background: "#0F172A", borderRadius: 10, padding: "12px 16px",
                      border: `1px solid ${t.priority === "high" ? cat.color + "30" : "#1E293B"}`,
                      display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
                    }}>
                      {t.priority === "high" && (
                        <span style={{
                          padding: "2px 8px", borderRadius: 4, background: "#10B98120",
                          fontSize: 10, fontWeight: 700, color: "#10B981", flexShrink: 0,
                        }}>HIGH PRIORITY</span>
                      )}
                      <div style={{ flex: 2, minWidth: 200 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>{t.name}</div>
                      </div>
                      <div style={{ textAlign: "center", minWidth: 70 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#8B5CF6" }}>+{t.monthlySubs}</div>
                        <div style={{ fontSize: 10, color: "#64748B" }}>subs/mo</div>
                      </div>
                      <div style={{ textAlign: "center", minWidth: 70 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#10B981" }}>
                          ${(t.monthlySubs * subscriberValue).toLocaleString()}
                        </div>
                        <div style={{ fontSize: 10, color: "#64748B" }}>value/mo</div>
                      </div>
                      <div style={{ textAlign: "center", minWidth: 60 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: t.cost === 0 ? "#10B981" : "#F59E0B" }}>
                          {t.cost === 0 ? "Free" : `$${t.cost}`}
                        </div>
                        <div style={{ fontSize: 10, color: "#64748B" }}>cost/mo</div>
                      </div>
                      <div style={{
                        padding: "3px 8px", borderRadius: 6, background: "#1E293B",
                        fontSize: 11, fontWeight: 600, color: "#94A3B8", flexShrink: 0,
                      }}>{t.effort}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* 12-Month Projection */}
            <h3 style={{ fontSize: 15, color: "#94A3B8", fontWeight: 600, marginBottom: 16, marginTop: 8 }}>
              12-Month List Growth Projection
            </h3>
            <div style={{ background: "#0F172A", borderRadius: 14, padding: 20, border: "1px solid #334155", marginBottom: 28 }}>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={projectionMonths}>
                  <defs>
                    <linearGradient id="growGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#F8FAFC" }}
                    formatter={(v, name) => [v.toLocaleString(), name === "withGrowth" ? "With Growth Strategy" : "Current Pace"]} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "#94A3B8" }} />
                  <Area type="monotone" dataKey="withGrowth" name="With Growth Strategy" stroke="#8B5CF6" fill="url(#growGrad)" strokeWidth={3} />
                  <Area type="monotone" dataKey="without" name="Current Pace" stroke="#64748B" fill="none" strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 12 }}>
                <span style={{ fontSize: 12, color: "#64748B" }}>
                  Now: <strong style={{ color: "#F8FAFC" }}>{currentListSize.toLocaleString()}</strong>
                </span>
                <span style={{ fontSize: 12, color: "#64748B" }}>
                  12mo (current): <strong style={{ color: "#94A3B8" }}>{(currentListSize + currentMonthlyCapture * 12).toLocaleString()}</strong>
                </span>
                <span style={{ fontSize: 12, color: "#64748B" }}>
                  12mo (growth): <strong style={{ color: "#8B5CF6" }}>{(currentListSize + totalNewSubs * 12).toLocaleString()}</strong>
                </span>
              </div>
            </div>

            {/* Revenue Projection */}
            <h3 style={{ fontSize: 15, color: "#94A3B8", fontWeight: 600, marginBottom: 16 }}>
              Projected Monthly Email Revenue
            </h3>
            <div style={{ background: "#0F172A", borderRadius: 14, padding: 20, border: "1px solid #334155", marginBottom: 28 }}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={projectionMonths.filter((_, i) => i % 2 === 0 || i === projectionMonths.length - 1)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#F8FAFC" }}
                    formatter={(v) => [`$${v.toLocaleString()}`, ""]} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "#94A3B8" }} />
                  <Bar dataKey="revenueWith" name="With Growth" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={28} />
                  <Bar dataKey="revenueWithout" name="Current Pace" fill="#334155" radius={[4, 4, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Line */}
            <div style={{
              background: "linear-gradient(135deg, #2D1B69, #1E293B)", borderRadius: 16, padding: 28,
              border: "1px solid #8B5CF6", textAlign: "center",
            }}>
              <div style={{ fontSize: 13, color: "#8B5CF6", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>
                12-Month Email Growth Impact
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap", marginTop: 16 }}>
                <div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: "#8B5CF6" }}>
                    {(currentListSize + totalNewSubs * 12).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: "#94A3B8" }}>subscribers in 12 months</div>
                </div>
                <div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: "#10B981" }}>
                    ${(totalNewSubs * 12 * subscriberValue).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: "#94A3B8" }}>projected value of new subscribers</div>
                </div>
                <div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: "#F59E0B" }}>
                    ${(totalMonthlyCost * 12).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: "#94A3B8" }}>total cost (12 months)</div>
                </div>
              </div>
              <div style={{ marginTop: 20, fontSize: 14, color: "#E2E8F0" }}>
                Every $1 invested in list growth generates an estimated <strong style={{ color: "#10B981", fontSize: 18 }}>
                  ${Math.round(totalNewSubs * 12 * subscriberValue / (totalMonthlyCost * 12 || 1))}
                </strong> in customer lifetime value
              </div>
              <div style={{ fontSize: 13, color: "#64748B", marginTop: 8 }}>
                Based on ${subscriberValue} LTV per subscriber • 3% conversion rate • $100 avg order • 3.5 repeat purchases
              </div>
            </div>
          </div>
          );
        })()}

        {/* ── COMPETITIVE CALENDAR ── */}
        {activeTab === "calendar" && (() => {
          const marketStatus = getMarketStatus(competitorEvents);

          return (
          <div>
            <SectionTitle icon="📅" title="Competitive Intelligence Calendar" agent="#12 Competitor Benchmark Agent" />
            <div style={{ background: "#1E293B", borderRadius: 8, padding: "8px 14px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#64748B" }}>
              <span>📡</span><span>Sources: Outscraper (competitor monitoring) • Historical ad cost data • Industry event calendars • n8n webhook-ready</span>
            </div>

            {/* Market Status Banner */}
            <div style={{
              background: "#0F172A", borderRadius: 14, padding: 22, marginBottom: 28,
              border: `2px solid ${marketStatus.color}`,
              display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: 16, height: 16, borderRadius: "50%", background: marketStatus.color,
                  boxShadow: `0 0 12px ${marketStatus.color}80`,
                  animation: "pulse 2s infinite",
                }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: marketStatus.color, letterSpacing: 2 }}>
                    CURRENT STATUS: {marketStatus.status}
                  </div>
                  <div style={{ fontSize: 13, color: "#CBD5E1", marginTop: 4 }}>{marketStatus.message}</div>
                </div>
              </div>
              <div style={{
                padding: "6px 14px", borderRadius: 8, background: "#1E293B",
                border: `1px solid ${marketStatus.color}40`, fontSize: 11, color: "#94A3B8",
              }}>
                n8n webhook: ready to trigger
              </div>
            </div>

            {/* Year Timeline */}
            <h3 style={{ fontSize: 15, color: "#94A3B8", fontWeight: 600, marginBottom: 16 }}>2026 Competitive Landscape</h3>
            <div style={{ background: "#0F172A", borderRadius: 14, padding: 20, border: "1px solid #334155", marginBottom: 28 }}>
              {/* Month headers */}
              <div style={{ display: "flex", gap: 0, marginBottom: 12 }}>
                {months.map((m, i) => (
                  <div key={i} style={{
                    flex: 1, textAlign: "center", fontSize: 11, fontWeight: 600,
                    color: new Date().getMonth() === i ? "#3B82F6" : "#64748B",
                    borderBottom: new Date().getMonth() === i ? "2px solid #3B82F6" : "1px solid #1E293B",
                    paddingBottom: 6,
                  }}>{m}</div>
                ))}
              </div>

              {/* Event bars */}
              {competitorEvents.map((event, i) => {
                const startMonth = parseInt(event.start.split("-")[1]) - 1;
                const startDay = parseInt(event.start.split("-")[2]);
                const endMonth = parseInt(event.end.split("-")[1]) - 1;
                const endDay = parseInt(event.end.split("-")[2]);
                const leftPct = ((startMonth + startDay / 30) / 12) * 100;
                const widthPct = Math.max(((endMonth - startMonth) + (endDay - startDay) / 30) / 12 * 100, 2);

                return (
                  <div key={i} style={{ position: "relative", height: 28, marginBottom: 4 }}>
                    <div style={{
                      position: "absolute", left: `${leftPct}%`, width: `${widthPct}%`,
                      height: 22, borderRadius: 4, top: 3,
                      background: event.impact === "opportunity" ? "#10B98130" : `${event.color}30`,
                      border: `1px solid ${event.impact === "opportunity" ? "#10B981" : event.color}60`,
                      display: "flex", alignItems: "center", paddingLeft: 6, overflow: "hidden",
                    }}>
                      <span style={{
                        fontSize: 9, fontWeight: 600, whiteSpace: "nowrap",
                        color: event.impact === "opportunity" ? "#10B981" : event.color,
                      }}>
                        {event.competitor === "Your Own" ? event.type : `${event.competitor}: ${event.type}`}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Legend */}
              <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
                {[
                  { label: "High Competition (Pause/Pivot)", color: "#EF4444" },
                  { label: "Medium Competition (Monitor)", color: "#F59E0B" },
                  { label: "Opportunity Window (Attack)", color: "#10B981" },
                ].map((l, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#94A3B8" }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: l.color + "40", border: `1px solid ${l.color}` }} />
                    {l.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Event Cards */}
            <h3 style={{ fontSize: 15, color: "#94A3B8", fontWeight: 600, marginBottom: 16 }}>Event Details & Strategic Actions</h3>

            {/* Threats first, then opportunities */}
            {["Competitive Threats", "Opportunity Windows"].map((section, si) => {
              const filtered = si === 0
                ? competitorEvents.filter(e => e.impact !== "opportunity")
                : competitorEvents.filter(e => e.impact === "opportunity");

              return (
                <div key={si} style={{ marginBottom: 24 }}>
                  <div style={{
                    display: "inline-block", padding: "5px 14px", borderRadius: 20, marginBottom: 12,
                    background: si === 0 ? "#EF444420" : "#10B98120",
                    color: si === 0 ? "#EF4444" : "#10B981",
                    fontSize: 13, fontWeight: 700,
                  }}>
                    {si === 0 ? "⚔️" : "🟢"} {section}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {filtered.map((event, i) => (
                      <div key={i} style={{
                        background: "#0F172A", borderRadius: 12, padding: "16px 18px",
                        border: `1px solid ${event.impact === "high" ? "#7F1D1D" : event.impact === "opportunity" ? "#1E3A2F" : "#334155"}`,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 10, height: 10, borderRadius: "50%",
                              background: event.impact === "opportunity" ? "#10B981" : event.impact === "high" ? "#EF4444" : "#F59E0B",
                            }} />
                            <span style={{ fontSize: 14, fontWeight: 700, color: event.color }}>{event.competitor}</span>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "#F8FAFC" }}>{event.type}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 12, color: "#94A3B8" }}>{event.start} → {event.end}</span>
                            <span style={{
                              padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                              background: event.impact === "high" ? "#EF444420" : event.impact === "opportunity" ? "#10B98120" : "#F59E0B20",
                              color: event.impact === "high" ? "#EF4444" : event.impact === "opportunity" ? "#10B981" : "#F59E0B",
                            }}>
                              {event.impact.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Strategic Action */}
                        <div style={{
                          fontSize: 13, color: "#10B981", lineHeight: 1.6, marginBottom: 8,
                          padding: "8px 12px", background: "#1E293B", borderRadius: 8,
                          borderLeft: "3px solid #10B98140",
                        }}>
                          <strong style={{ color: "#CBD5E1" }}>Action: </strong>{event.action}
                        </div>

                        {/* Leak Warning */}
                        {event.leak && event.impact !== "opportunity" && (
                          <div style={{
                            fontSize: 12, color: "#EF4444", lineHeight: 1.5,
                            padding: "6px 12px", background: "#1E293B", borderRadius: 8,
                            borderLeft: "3px solid #EF444440",
                          }}>
                            <strong>⚠️ Budget Leak Risk: </strong>{event.leak}
                          </div>
                        )}
                        {event.leak && event.impact === "opportunity" && (
                          <div style={{
                            fontSize: 12, color: "#10B981", lineHeight: 1.5,
                            padding: "6px 12px", background: "#1E293B", borderRadius: 8,
                            borderLeft: "3px solid #10B98140",
                          }}>
                            <strong>💰 Opportunity: </strong>{event.leak}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* n8n Integration Note */}
            <div style={{
              background: "linear-gradient(135deg, #1E293B, #0F172A)", borderRadius: 14, padding: 24,
              border: "1px solid #3B82F640", marginTop: 8,
            }}>
              <h3 style={{ fontSize: 15, color: "#3B82F6", fontWeight: 700, marginBottom: 12 }}>🔗 Automation Ready (n8n)</h3>
              <p style={{ fontSize: 13, color: "#E2E8F0", lineHeight: 1.7, margin: 0 }}>
                This calendar exports a <strong style={{ color: "#3B82F6" }}>Market Status</strong> signal that can trigger n8n webhooks automatically.
                When a high-competition event starts, n8n can: pause Google Shopping campaigns, switch ad copy to "support local" messaging,
                trigger a flash sale email to your Klaviyo list, and alert you via Telegram/WhatsApp.
                When an opportunity window opens, n8n can: increase ad budgets, activate acquisition campaigns, and send "exclusive offer" emails.
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
                {[
                  { label: "Webhook trigger", value: "market_status_change", color: "#3B82F6" },
                  { label: "Payload", value: "status + active_events + actions", color: "#8B5CF6" },
                  { label: "Connected to", value: "Google Ads + Klaviyo + Telegram", color: "#10B981" },
                ].map((m, i) => (
                  <div key={i} style={{ background: "#1E293B", borderRadius: 8, padding: "8px 14px", flex: 1, minWidth: 160, textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{m.value}</div>
                    <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          );
        })()}

        {/* ── TIKTOK DIAGNOSTIC ── */}
        {activeTab === "tiktok" && (
          <div>
            <SectionTitle icon="🔬" title="TikTok Ads Diagnostic" agent="#8 Ad Spend Optimizer" />

            {/* Summary */}
            <div style={{
              background: "#0F172A", borderRadius: 14, padding: 22, marginBottom: 28,
              border: "1px solid #EF444440", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
            }}>
              <div style={{ fontSize: 48 }}>🎵</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#F8FAFC" }}>TikTok Ads: ROAS 1.5x</div>
                <div style={{ fontSize: 13, color: "#EF4444", fontWeight: 600 }}>Below breakeven after platform fees (~20%)</div>
                <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>
                  Spending $1,500/mo → Generating $2,250 revenue → Net after fees: ~$1,800 → <strong style={{ color: "#EF4444" }}>Losing ~$300/mo</strong>
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 14, color: "#64748B", marginBottom: 4 }}>Should you pause?</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#F59E0B" }}>Not yet.</div>
                <div style={{ fontSize: 11, color: "#94A3B8" }}>Fix these issues first ↓</div>
              </div>
            </div>

            {/* Diagnostic Areas */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {tiktokDiagnostic.map((d, i) => (
                <div key={i} style={{
                  background: "#0F172A", borderRadius: 14, padding: 22,
                  border: `1px solid ${d.status === "critical" ? "#7F1D1D" : d.status === "warning" ? "#78350F" : "#334155"}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{
                        fontSize: 13, fontWeight: 700,
                        color: d.status === "critical" ? "#EF4444" : d.status === "warning" ? "#F59E0B" : "#3B82F6",
                      }}>
                        {d.status === "critical" ? "🔴" : d.status === "warning" ? "🟡" : "🔵"} {d.area}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 100, height: 8, background: "#1E293B", borderRadius: 4, overflow: "hidden",
                      }}>
                        <div style={{
                          width: `${d.score}%`, height: "100%", borderRadius: 4,
                          background: d.score < 30 ? "#EF4444" : d.score < 50 ? "#F59E0B" : d.score < 70 ? "#3B82F6" : "#10B981",
                        }} />
                      </div>
                      <span style={{
                        fontSize: 16, fontWeight: 800,
                        color: d.score < 30 ? "#EF4444" : d.score < 50 ? "#F59E0B" : d.score < 70 ? "#3B82F6" : "#10B981",
                      }}>{d.score}</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    {d.findings.map((f, fi) => (
                      <div key={fi} style={{
                        display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6,
                        fontSize: 13, color: "#CBD5E1", lineHeight: 1.5,
                      }}>
                        <span style={{ color: "#64748B", flexShrink: 0 }}>•</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    background: "#1E293B", borderRadius: 8, padding: "10px 14px",
                    fontSize: 13, color: "#10B981", fontWeight: 500,
                  }}>
                    ✅ {d.recommendation}
                  </div>
                </div>
              ))}
            </div>

            {/* Decision Framework */}
            <div style={{
              background: "linear-gradient(135deg, #1E293B, #0F172A)", borderRadius: 14, padding: 24,
              border: "1px solid #F59E0B40", marginTop: 28,
            }}>
              <h3 style={{ fontSize: 15, color: "#F59E0B", fontWeight: 700, marginBottom: 16 }}>🧭 Decision Framework</h3>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[
                  { action: "Fix Now (Week 1-2)", items: ["Create mobile-optimized landing page", "Build TikTok-native UGC creative", "Narrow targeting to 25-34"], color: "#EF4444" },
                  { action: "Test (Week 3-4)", items: ["Run new creative for 2 weeks at $500 budget", "Track with proper UTM + Pixel", "Compare ROAS vs old creative"], color: "#F59E0B" },
                  { action: "Decide (Week 5)", items: ["ROAS > 2.5x → Scale budget", "ROAS 1.5-2.5x → Iterate creative", "ROAS < 1.5x → Reallocate to influencers"], color: "#10B981" },
                ].map((phase, i) => (
                  <div key={i} style={{ flex: 1, minWidth: 200 }}>
                    <div style={{
                      padding: "5px 12px", borderRadius: 8, display: "inline-block",
                      background: phase.color + "15", color: phase.color, fontSize: 13, fontWeight: 700, marginBottom: 10,
                    }}>{phase.action}</div>
                    {phase.items.map((item, ii) => (
                      <div key={ii} style={{ fontSize: 13, color: "#CBD5E1", marginBottom: 6, paddingLeft: 8, borderLeft: `2px solid ${phase.color}30` }}>
                        {item}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Influencer Alternative */}
            <div style={{
              background: "#0F172A", borderRadius: 14, padding: 24,
              border: "1px solid #8B5CF640", marginTop: 20,
            }}>
              <h3 style={{ fontSize: 15, color: "#8B5CF6", fontWeight: 700, marginBottom: 12 }}>💡 Alternative: Micro-Influencer Strategy</h3>
              <p style={{ fontSize: 13, color: "#E2E8F0", lineHeight: 1.7, margin: 0 }}>
                If TikTok Ads don't improve after the 5-week test, consider reallocating the budget to
                <strong style={{ color: "#8B5CF6" }}> micro-influencer partnerships</strong> (5K-50K followers).
                Influencer content performs like organic TikTok — higher completion rates, better engagement,
                and their audience already trusts them. Budget: <strong style={{ color: "#10B981" }}>$500/mo for 2-3 creators</strong> in your niche.
                They create authentic content you can also repurpose for your own TikTok, Instagram Reels, and Meta Ads.
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
                {[
                  { label: "Cost per creator", value: "$150-250/mo", color: "#F59E0B" },
                  { label: "Content pieces", value: "2-4 videos each", color: "#3B82F6" },
                  { label: "Expected reach", value: "15K-50K views", color: "#8B5CF6" },
                  { label: "Bonus", value: "Reusable for other platforms", color: "#10B981" },
                ].map((m, i) => (
                  <div key={i} style={{ background: "#1E293B", borderRadius: 8, padding: "8px 14px", flex: 1, minWidth: 140, textAlign: "center" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: m.color }}>{m.value}</div>
                    <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ACTIONS ── */}
        {activeTab === "actions" && (
          <div>
            <SectionTitle icon="🎯" title="Prioritized Action Plan" agent="#3 Report Writer" />

            {[
              { label: "This Week", color: "#EF4444", items: [
                { action: "Reduce TikTok Ads to $500 test budget", impact: "Save $1,000/mo immediately", effort: "5 min",
                  why: "TikTok ROAS is 1.5x — after platform fees (~20%) you're losing ~$300/mo. Instead of pausing entirely, reduce to a test budget while fixing creative and landing page issues (see TikTok Diagnostic tab)." },
                { action: "Respond to all 17 unanswered reviews", impact: "Trust signal for future buyers", effort: "2 hours",
                  why: "This won't directly raise your star rating — ratings reflect product/service quality. But 89% of consumers read business responses before purchasing. Responding shows you care and can prevent escalation. It's a trust signal, not a rating hack." },
                { action: "Fix mobile performance (optimize images, lazy load)", impact: "+40% mobile conversion potential", effort: "4 hours",
                  why: "Your mobile score is 38/100 with 6.2s load time. 60%+ of your traffic is mobile (especially from TikTok and Instagram). Every second of load time reduces conversions by ~7%. This is likely the single biggest conversion blocker." },
              ]},
              { label: "This Month", color: "#F59E0B", items: [
                { action: "Increase Klaviyo investment from 2.6% to 15% of marketing budget", impact: "42x ROI channel, est. +$6,300/mo revenue", effort: "1 day",
                  why: "You're spending $200/mo on email which generates 42x ROI — your best channel by far. The 15% benchmark ($1,125/mo) is the industry standard for e-commerce that depends on email retention. This doesn't mean paying $1,125 to Klaviyo — it means investing in building more flows (welcome series, win-back, VIP), better segmentation, and A/B testing content. Each repeat customer costs $0.32 vs $16.74 for a new one." },
                { action: "Activate cart abandonment email flow in Klaviyo", impact: "Recover est. $8,820/mo in lost revenue", effort: "2 days",
                  why: "80% of carts are abandoned with no recovery flow active. Industry average recovery rate from abandoned cart emails is 5-10%. With 3,675 monthly add-to-carts × $100 avg order × 5% recovery = ~$18,375 potential, conservatively $8,820/mo." },
                { action: "Realign ad creative to match Women 25-34 demographic", impact: "+25-40% ROAS improvement", effort: "3 days",
                  why: "Your #1 buyer segment is Women 25-34 (35% of purchases) but your ad creative targets men. You're paying to show the wrong message to the wrong audience. Matching creative to actual buyers is the highest-impact ad optimization." },
              ]},
              { label: "Next 90 Days", color: "#10B981", items: [
                { action: "Increase Google Ads budget by 30% ($840/mo more)", impact: "Est. +$3,360/mo additional revenue", effort: "Ongoing",
                  why: "Google Ads has 4.0x ROAS — your best-performing paid channel. For every $1 spent, $4 comes back. If it's proven at $2,800/mo, scaling 30% to $3,640/mo should proportionally generate ~$3,360/mo more. This increase should come from the TikTok Ads budget reduction, not additional spend." },
                { action: "Implement structured data (JSON-LD) for rich snippets", impact: "+15-25% organic click-through rate", effort: "1 day",
                  why: "When someone searches for your products on Google, your results currently show just a title and description. With structured data (a small invisible code added to your site), Google can show star ratings, prices, and availability directly in search results. These 'rich snippets' stand out and get 15-25% more clicks. It's free, done once, and the SEO agent detects exactly what's missing." },
                { action: "Test micro-influencer partnerships on TikTok ($500/mo)", impact: "Authentic content + audience access", effort: "Ongoing",
                  why: "Instead of running TikTok Ads that look like ads, partner with 2-3 micro-influencers (5K-50K followers) in your niche. They create authentic content that performs like organic TikTok — higher completion rates, better engagement, and their audience already trusts them. Budget: reallocate $500/mo from TikTok Ads reduction." },
                { action: "Launch post-purchase review request automation", impact: "Target 4.0+ star rating in 90 days", effort: "2 days",
                  why: "Satisfied customers rarely leave reviews unprompted — but 70% will when asked. A Klaviyo flow that emails customers 7 days after delivery (only those who didn't return) asking for a Google/Trustpilot review will steadily increase your review count and rating. This is how your competitor Luna Beauty Co. built 312 reviews at 4.5★." },
              ]},
            ].map((section, si) => (
              <div key={si} style={{ marginBottom: 28 }}>
                <div style={{
                  display: "inline-block", padding: "6px 16px", borderRadius: 20,
                  background: section.color + "20", color: section.color,
                  fontSize: 13, fontWeight: 700, marginBottom: 12,
                }}>
                  {section.label === "This Week" ? "🔴" : section.label === "This Month" ? "🟡" : "🟢"} {section.label}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {section.items.map((item, ii) => (
                    <div key={ii} style={{
                      background: "#0F172A", borderRadius: 12, padding: "16px 18px",
                      border: "1px solid #1E293B",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: item.why ? 10 : 0 }}>
                        <div style={{ flex: 2 }}>
                          <div style={{ fontSize: 14, color: "#F8FAFC", fontWeight: 600 }}>{item.action}</div>
                        </div>
                        <div style={{ flex: 1, textAlign: "center" }}>
                          <div style={{ fontSize: 12, color: "#10B981", fontWeight: 600 }}>{item.impact}</div>
                        </div>
                        <div style={{
                          padding: "4px 12px", borderRadius: 8, background: "#1E293B",
                          fontSize: 11, color: "#94A3B8", fontWeight: 600, flexShrink: 0,
                        }}>
                          {item.effort}
                        </div>
                      </div>
                      {item.why && (
                        <div style={{
                          fontSize: 12, color: "#94A3B8", lineHeight: 1.6,
                          padding: "10px 12px", background: "#1E293B", borderRadius: 8,
                          borderLeft: `3px solid ${section.color}40`,
                        }}>
                          <strong style={{ color: "#CBD5E1" }}>Why: </strong>{item.why}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div style={{
              background: "linear-gradient(135deg, #1E3A5F, #1E293B)", borderRadius: 16, padding: 28,
              border: "1px solid #3B82F6", marginTop: 16, textAlign: "center",
            }}>
              <div style={{ fontSize: 13, color: "#3B82F6", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
                Estimated Monthly Impact
              </div>
              <div style={{ fontSize: 48, fontWeight: 800, color: "#F8FAFC", letterSpacing: -2 }}>
                +$<AnimatedNumber target={18480} suffix="" />
              </div>
              <div style={{ fontSize: 15, color: "#94A3B8", marginTop: 4 }}>
                additional revenue if all recommendations implemented
              </div>
              <div style={{ fontSize: 13, color: "#64748B", marginTop: 12 }}>
                Powered by 6 AI agents • Multicomm.ai
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
