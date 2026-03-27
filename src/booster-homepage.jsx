import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { getProductImage as _getImageFromMap } from "./data/imageLoader.js";
import ALL_PRODUCTS from "./data/all-products.json";

const T = {
  red: "#C8102E", redDark: "#9B0023", redLight: "#FFE8EC", redSoft: "#FFF1F3",
  navy: "#C8102E", blue: "#C8102E", blueLight: "#FFE8EC",
  bg: "#FFFFFF", bgSoft: "#FFF5F7", bgDark: "#1A1A2E",
  textPrimary: "#C8102E", textSecondary: "#E0465A", border: "#F5D0D6",
  fontHead: '"Fustat","SF Pro Display",-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif',
  font: '"Inter","SF Pro Text",-apple-system,BlinkMacSystemFont,"Helvetica Neue","PingFang SC","Microsoft YaHei",sans-serif',
  shadow: "0 1px 10px rgba(0,0,0,0.05)", shadowHover: "0 8px 30px rgba(0,0,0,0.08)",
  radius: 16,
};

const CAT_META = {
  "实验耗材": { icon: "🧪", color: "#FFE8EC" },
  "质控分析工具酶": { icon: "🔬", color: "#E8F5E9" },
  "超滤离心管": { icon: "⚗️", color: "#FFF3E0" },
  "质控试剂盒": { icon: "💊", color: "#FCE4EC" },
  "早期研发": { icon: "🧫", color: "#E0F7FA" },
  "化学试剂与小分子": { icon: "⚗️", color: "#FFF8E1" },
};

function getProductImage(sku) {
  return _getImageFromMap(sku, "", "main") || null;
}

const PAGE_SIZE = 20;

// ═══════ Animated Counter (Mac style) ═══════
function AnimNum({ value, suffix = "", duration = 2000 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) setStarted(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);
  useEffect(() => {
    if (!started) return;
    const num = parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
    const isFloat = String(value).includes(".");
    let start = 0; const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      const cur = num * ease;
      setDisplay(isFloat ? cur.toFixed(1) : Math.floor(cur));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, value, duration]);
  return <span ref={ref}>{display}{suffix}</span>;
}

// ═══════ Mac Glassmorphism Card ═══════
function GlassCard({ children, style, hover = true }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)", borderRadius: T.radius, border: "1px solid rgba(200,16,46,0.08)", boxShadow: "0 4px 24px rgba(200,16,46,0.04), inset 0 1px 0 rgba(255,255,255,0.8)", transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)", cursor: hover ? "pointer" : "default", ...style }}
      onMouseEnter={hover ? e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(200,16,46,0.08), inset 0 1px 0 rgba(255,255,255,0.8)"; } : undefined}
      onMouseLeave={hover ? e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(200,16,46,0.04), inset 0 1px 0 rgba(255,255,255,0.8)"; } : undefined}>
      {children}
    </div>
  );
}

// ═══════ SECTIONS ═══════

function TopBar({ lang, setLang }) {
  return (
    <div style={{ background: "linear-gradient(90deg,#9B0023,#C8102E,#9B0023)", color: "rgba(255,255,255,0.92)", fontSize: 12, padding: "6px 0", fontFamily: T.font, textAlign: "center", position: "relative" }}>
      <span style={{ fontWeight: 500, letterSpacing: 0.3 }}>
        {lang === "zh" ? "🎉 2026 新品发布 — 国产替代系列全面升级" : "🎉 2026 New Products — Domestic Alternative Series Fully Upgraded"}
      </span>
      <div style={{ position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 2 }}>
        {["zh","en"].map(l => (
          <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? "rgba(255,255,255,0.2)" : "transparent", color: "#fff", border: "none", borderRadius: 4, padding: "1px 8px", fontSize: 11, cursor: "pointer", fontFamily: T.font, fontWeight: lang === l ? 700 : 400 }}>
            {l === "zh" ? "中文" : "EN"}
          </button>
        ))}
      </div>
    </div>
  );
}

function NavHeader({ lang, section, setSection, search, setSearch }) {
  const [sf, setSf] = useState(false);
  const [hovered, setHovered] = useState(null);
  const navItems = lang === "zh"
    ? [["home","首页"],["products","产品中心"],["solutions","解决方案"],["contact","联系我们"]]
    : [["home","Home"],["products","Products"],["solutions","Solutions"],["contact","Contact"]];
  return (
    <div style={{ position: "sticky", top: 20, zIndex: 50, display: "flex", justifyContent: "center", padding: "0 16px", pointerEvents: "none" }}>
      <header style={{
        pointerEvents: "all",
        display: "flex", alignItems: "center", gap: 8,
        background: "rgba(255,255,255,0.30)",
        backdropFilter: "blur(50px) saturate(180%)",
        WebkitBackdropFilter: "blur(50px) saturate(180%)",
        borderRadius: 16,
        border: "1px solid rgba(0,0,0,0.10)",
        boxShadow: "inset 0px 4px 4px 0px rgba(255,255,255,0.25), 0 8px 32px rgba(200,16,46,0.08)",
        padding: "8px 16px",
        fontFamily: T.font,
        gap: 4,
      }}>
        {/* Logo */}
        <div onClick={() => setSection("home")} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "4px 10px", borderRadius: 10, flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${T.red}, ${T.redDark})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 800, fontFamily: T.fontHead }}>B</div>
          <span style={{ fontSize: 14, fontWeight: 800, color: T.red, fontFamily: T.fontHead, letterSpacing: -0.3 }}>{lang === "zh" ? "博仕达" : "BOOSTER"}</span>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 18, background: "rgba(200,16,46,0.15)", margin: "0 4px" }} />

        {/* Nav links */}
        {navItems.map(([k, label]) => (
          <div key={k} onClick={() => setSection(k)}
            onMouseEnter={() => setHovered(k)} onMouseLeave={() => setHovered(null)}
            style={{
              padding: "6px 14px", fontSize: 13, fontWeight: section === k ? 600 : 500,
              color: section === k ? T.red : hovered === k ? T.red : "#555",
              cursor: "pointer", borderRadius: 10, transition: "all 0.15s",
              background: section === k ? "rgba(200,16,46,0.08)" : hovered === k ? "rgba(200,16,46,0.04)" : "transparent",
            }}>{label}</div>
        ))}

        {/* Divider */}
        <div style={{ width: 1, height: 18, background: "rgba(200,16,46,0.15)", margin: "0 4px" }} />

        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", background: sf ? "rgba(200,16,46,0.06)" : "rgba(0,0,0,0.04)", borderRadius: 10, padding: "0 10px", height: 32, border: sf ? `1.5px solid ${T.red}` : "1.5px solid transparent", transition: "all 0.2s", width: 160 }}>
          <span style={{ fontSize: 12, opacity: 0.45, marginRight: 5 }}>🔍</span>
          <input value={search} onChange={e => { setSearch(e.target.value); if (e.target.value) setSection("products"); }}
            placeholder={lang === "zh" ? "搜索产品..." : "Search..."}
            onFocus={() => setSf(true)} onBlur={() => setSf(false)}
            style={{ border: "none", outline: "none", background: "transparent", flex: 1, fontSize: 12, fontFamily: T.font, color: "#333" }} />
        </div>

        {/* CTA */}
        <button onClick={() => setSection("contact")} style={{
          background: `rgba(200,16,46,0.85)`,
          backdropFilter: "blur(2px)",
          color: "#fff", border: "none", borderRadius: 12, padding: "7px 16px",
          fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: T.font,
          boxShadow: "inset 0px 4px 4px 0px rgba(255,255,255,0.20), 0 2px 8px rgba(200,16,46,0.3)",
          display: "flex", alignItems: "center", gap: 6, transition: "transform 0.2s",
          marginLeft: 4,
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          {lang === "zh" ? "联系我们" : "Contact"}
          <span style={{ width: 16, height: 16, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>→</span>
        </button>
      </header>
    </div>
  );
}


function DNACanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let tick = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const W = 360, H = 360;
    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width  = W + "px";
    canvas.style.height = H + "px";
    ctx.scale(DPR, DPR);

    const N      = 52;    // points per helix
    const AMP    = 64;    // oscillation radius
    const TURNS  = 2.6;   // full helical turns visible
    const HLEN   = 310;   // helix axis length (in rotated space)

    // Returns position in the rotated (tilted) coordinate frame
    const getP = (i, phase) => {
      const t     = (i / N) * Math.PI * 2 * TURNS + tick + phase;
      const y_rot = -HLEN / 2 + (i / N) * HLEN;
      const x_rot = Math.sin(t) * AMP;
      const depth = Math.sin(t); // -1 back → +1 front
      return { x: x_rot, y: y_rot, depth };
    };

    const hexToRgb = h => [
      parseInt(h.slice(1,3),16),
      parseInt(h.slice(3,5),16),
      parseInt(h.slice(5,7),16)
    ];
    const COLORS = ["#C8102E", "#8B0FC8"]; // red strand, purple strand
    const RGBS   = COLORS.map(hexToRgb);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // transparent — blends with page background

      // ── Rotate canvas 45 degrees around centre ───────────────
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.rotate(-Math.PI / 4);   // –45°  (top-left → bottom-right)

      // ── Rungs ─────────────────────────────────────────────────
      for (let i = 0; i <= N; i++) {
        const p1 = getP(i, 0);
        const p2 = getP(i, Math.PI);
        const depth = (p1.depth + 1) / 2;          // 0–1
        const alpha = 0.15 + depth * 0.30;
        const gr = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        gr.addColorStop(0,   `rgba(200,16,46,${alpha})`);
        gr.addColorStop(0.5, `rgba(220,100,190,${alpha * 0.55})`);
        gr.addColorStop(1,   `rgba(139,15,200,${alpha})`);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = gr;
        ctx.lineWidth = 0.7 + depth * 0.7;
        ctx.stroke();
      }

      // ── Strands — 3-pass soft glow ────────────────────────────
      COLORS.forEach((col, si) => {
        const phase = si * Math.PI;
        const [r, g, b] = RGBS[si];
        [
          { lw: 9,   a: 0.07 },
          { lw: 4,   a: 0.22 },
          { lw: 1.8, a: 0.95 },
        ].forEach(({ lw, a }) => {
          ctx.beginPath();
          for (let i = 0; i <= N; i++) {
            const p = getP(i, phase);
            i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
          }
          ctx.strokeStyle = `rgba(${r},${g},${b},${a})`;
          ctx.lineWidth = lw;
          ctx.stroke();
        });
      });

      // ── Node dots ─────────────────────────────────────────────
      for (let i = 0; i <= N; i++) {
        COLORS.forEach((col, si) => {
          const { x, y, depth } = getP(i, si * Math.PI);
          const [r, g, b] = RGBS[si];
          const sc = (depth + 1) / 2;
          const rd = 2.2 + sc * 3.2;
          const al = 0.45 + sc * 0.55;

          // soft outer halo
          ctx.beginPath();
          ctx.arc(x, y, rd + 6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${al * 0.10})`;
          ctx.fill();

          // core with radial highlight
          const dg = ctx.createRadialGradient(x - rd*0.3, y - rd*0.3, 0, x, y, rd);
          dg.addColorStop(0, `rgba(255,210,230,${al})`);
          dg.addColorStop(1, `rgba(${r},${g},${b},${al})`);
          ctx.beginPath();
          ctx.arc(x, y, rd, 0, Math.PI * 2);
          ctx.fillStyle = dg;
          ctx.fill();
        });
      }

      ctx.restore();

      tick -= 0.020;
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas ref={canvasRef}
      style={{ borderRadius: 24, display: "block",
        boxShadow: "none" }} />
  );
}


function HeroSection({ lang, onBrowse, onSolutions }) {
  return (
    <div style={{ background: "#FFFFFF", position: "relative", overflow: "hidden", minHeight: 580, display: "flex", alignItems: "center" }}>
      {/* Background glow blobs */}
      <div style={{ position: "absolute", top: -120, left: -80, width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,180,190,0.55) 0%, rgba(200,16,46,0.12) 60%, transparent 80%)", filter: "blur(60px)", animation: "glowPulse 6s ease-in-out infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 40, left: 120, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,120,140,0.35) 0%, transparent 70%)", filter: "blur(40px)", animation: "glowPulse 8s ease-in-out infinite 1s", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -60, right: 200, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,200,210,0.4) 0%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "72px 40px 80px", position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center", width: "100%" }}>

        {/* ── LEFT: Content ── */}
        <div>
          {/* Social proof */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(200,16,46,0.15)", borderRadius: 24, padding: "6px 16px", marginBottom: 28, boxShadow: "0 2px 12px rgba(200,16,46,0.08)" }}>
            <span style={{ fontSize: 13 }}>{"★★★★★".split("").map((s,i)=><span key={i} style={{color:"#FF801E"}}>{s}</span>)}</span>
            <span style={{ fontSize: 12, color: "#666", fontFamily: T.font }}>{lang === "zh" ? "已服务 200+ 家科研机构" : "Trusted by 200+ Research Institutions"}</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: T.fontHead, fontSize: "clamp(40px,4.5vw,68px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, margin: "0 0 20px", color: "#0D0D0D" }}>
            {lang === "zh"
              ? <><span style={{ color: T.red }}>降本增效</span><br />助力科研前行</>
              : <><span style={{ color: T.red }}>Smarter Science,</span><br />Faster Progress</>}
          </h1>

          {/* Sub */}
          <p style={{ fontFamily: T.font, fontSize: 17, color: "#555", lineHeight: 1.75, maxWidth: 480, margin: "0 0 36px", letterSpacing: -0.5 }}>
            {lang === "zh"
              ? "创新项目孵化 · 工程服务 · 企业管家服务 · 供应链服务 · 产业园区运营，携手中国工程院士领衔技术团队，促进社会绿色发展。"
              : "Innovation Incubation · Engineering · Enterprise Services · Supply Chain · Industrial Park Operations — partnered with CAS academician-led technical teams."}
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={onBrowse}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              style={{
                background: "rgba(200,16,46,0.88)", backdropFilter: "blur(2px)",
                color: "#fff", border: "none", borderRadius: 16, padding: "14px 28px",
                fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: T.font,
                boxShadow: "inset 0px 4px 4px 0px rgba(255,255,255,0.25), 0 4px 20px rgba(200,16,46,0.35)",
                display: "flex", alignItems: "center", gap: 8, transition: "transform 0.2s ease",
              }}>
              {lang === "zh" ? "浏览产品目录" : "Browse Products"}
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>→</span>
            </button>
            <button onClick={onSolutions}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(200,16,46,0.06)"; e.currentTarget.style.borderColor = T.red; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "rgba(200,16,46,0.2)"; }}
              style={{
                background: "rgba(255,255,255,0.5)", backdropFilter: "blur(8px)",
                color: T.red, border: "1.5px solid rgba(200,16,46,0.2)", borderRadius: 16,
                padding: "14px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer",
                fontFamily: T.font, transition: "all 0.2s",
              }}>
              {lang === "zh" ? "节能解决方案" : "Energy Solutions"}
            </button>
          </div>
        </div>

        {/* ── RIGHT: DNA Canvas ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          {/* Outer ambient glow */}
          <div style={{ position: "absolute", width: 400, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,16,80,0.12) 0%, rgba(140,10,180,0.06) 55%, transparent 80%)", filter: "blur(50px)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <DNACanvas />
          </div>
          {/* Floating badge - clients */}
          <div style={{ position: "absolute", bottom: -10, right: -10, background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)", border: "1px solid rgba(200,16,46,0.12)", borderRadius: 14, padding: "10px 16px", boxShadow: "0 4px 20px rgba(0,0,0,0.10)", fontFamily: T.font, zIndex: 2 }}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>{lang === "zh" ? "年服务企业" : "Annual Clients"}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.red, fontFamily: T.fontHead, lineHeight: 1 }}>200<span style={{ fontSize: 13, fontWeight: 600 }}>+</span></div>
          </div>
          {/* Floating badge - SKUs */}
          <div style={{ position: "absolute", top: -10, left: -10, background: "rgba(255,255,255,0.88)", backdropFilter: "blur(20px)", border: "1px solid rgba(160,10,180,0.15)", borderRadius: 14, padding: "10px 16px", boxShadow: "0 4px 20px rgba(0,0,0,0.10)", fontFamily: T.font, zIndex: 2 }}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>{lang === "zh" ? "产品型号" : "Product SKUs"}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#a020b0", fontFamily: T.fontHead, lineHeight: 1 }}>1800<span style={{ fontSize: 13, fontWeight: 600 }}>+</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}


function CategorySection({ lang, onSelectCat }) {
  const cats = useMemo(() => { const m = {}; ALL_PRODUCTS.forEach(p => m[p.cat]=(m[p.cat]||0)+1); return Object.entries(m).sort((a,b)=>b[1]-a[1]); }, []);
  const colors = ["#FFE8EC","#FFF1F3","#FFF3E0","#FCE4EC","#F3E5F5","#E0F7FA","#FFF8E1"];
  return (
    <section style={{ maxWidth: 1280, margin: "0 auto", padding: "64px 32px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: T.navy, margin: "0 0 8px" }}>{lang === "zh" ? "产品中心" : "Products"}</h2>
        <p style={{ fontSize: 15, color: T.textSecondary }}>{lang === "zh" ? "七大产品线，覆盖实验全流程" : "Seven product lines covering the entire workflow"}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: 14 }}>
        {cats.map(([cat, count], i) => {
          const meta = CAT_META[cat] || { icon: "📦" };
          return (
            <GlassCard key={cat} style={{ padding: "28px 16px", textAlign: "center" }}>
              <div onClick={() => onSelectCat(cat)}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>{meta.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary, marginBottom: 4 }}>{cat}</div>
                <div style={{ fontSize: 12, color: T.textSecondary }}>{count.toLocaleString()} {lang === "zh" ? "个产品" : "products"}</div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}

// ═══════ Energy Solutions (from PDF) ═══════
function SolutionsSection({ lang }) {
  const [activeSol, setActiveSol] = useState(0);
  const solutions = [
    {
      icon: "🏢", emoji: "❄️",
      title: lang === "zh" ? "机房空调节能机组" : "Server Room AC Energy Saver",
      tag: lang === "zh" ? "节能30%+" : "Save 30%+",
      desc: lang === "zh" ? "IDC数据机房改造专用机，原空调风冷外机更换为机房空调节能器，制冷节能达30%以上。有效降低PUE指标0.1-0.4，降低空调尖峰用电负荷30%。" : "Dedicated IDC data center retrofit unit. Replace air-cooled outdoor units for 30%+ cooling energy savings, reducing PUE by 0.1-0.4.",
      advantages: lang === "zh"
        ? [["⚡","节能","制冷节能30%以上，降低PUE 0.1-0.4"],["🕐","节时","一体化设计，安装方便，大大缩短施工时间"],["🔧","维护方便","片式冷凝器模组化设计，方便清洗维护"]]
        : [["⚡","Energy","30%+ cooling savings, PUE reduced 0.1-0.4"],["🕐","Fast Install","Integrated design, quick on-site deployment"],["🔧","Easy Maintenance","Modular plate condenser, easy to clean"]],
      scenes: lang === "zh" ? ["数据中心机房","数据传输机房","云机房","企业数据中心"] : ["Data Centers","Telecom Rooms","Cloud Rooms","Enterprise DC"],
      cases: lang === "zh" ? [{name:"上海电信机房",rate:"40%"}] : [{name:"Shanghai Telecom",rate:"40%"}],
      stats: [{v:"30",s:"%+",l:lang==="zh"?"节能率":"Savings"},{v:"0.4",s:"",l:lang==="zh"?"PUE降低":"PUE Drop"},{v:"40",s:"%",l:lang==="zh"?"案例最高":"Best Case"}],
    },
    {
      icon: "🏭", emoji: "🌊",
      title: lang === "zh" ? "片式蒸发冷高效热泵机组" : "Evaporative Heat Pump System",
      tag: lang === "zh" ? "SCOP 4.5+" : "SCOP 4.5+",
      desc: lang === "zh" ? "采用先进的板管蒸发冷却技术，全系列制冷能效系数(标况4.5以上)远超国家一级能效标准(3.40)。目前能效最高、最节能的中央空调产品。" : "Advanced plate-tube evaporative cooling. SCOP 4.5+ (standard), far exceeding China's Class 1 efficiency (3.40). The most efficient central AC product available.",
      advantages: lang === "zh"
        ? [["⚡","节能","能效远超国家一级标准，节能15%-30%"],["💧","节水","蒸发冷却技术，耗水量远低于传统冷却塔"],["📐","节地","紧凑设计，占地面积小"]]
        : [["⚡","Energy","Far exceeds Class 1 standard, 15-30% savings"],["💧","Water","Evaporative cooling uses far less water"],["📐","Space","Compact design, small footprint"]],
      scenes: lang === "zh" ? ["商场","GMP厂房","酒店","医院","办公楼","实验室"] : ["Malls","GMP Plants","Hotels","Hospitals","Offices","Labs"],
      cases: lang === "zh" ? [{name:"江苏某光电厂",rate:"30%"},{name:"湖北某产业园",rate:"40%"}] : [{name:"Jiangsu Optics",rate:"30%"},{name:"Hubei Park",rate:"40%"}],
      stats: [{v:"4.5",s:"+",l:"SCOP"},{v:"30",s:"%+",l:lang==="zh"?"节能率":"Savings"},{v:"15",s:"%",l:lang==="zh"?"节水":"Water Saved"}],
    },
    {
      icon: "🌀", emoji: "🌬️",
      title: lang === "zh" ? "多联机预冷节能器" : "VRF Pre-Cooling Energy Saver",
      tag: lang === "zh" ? "节能15%+" : "Save 15%+",
      desc: lang === "zh" ? "适用于任何多联机应用场景。原多联机外机外置多联机预冷节能器，设备节能可达15%以上。分段式设计，运输方便，安装便捷。" : "For any VRF application. External pre-cooler achieves 15%+ energy savings. Modular design for easy transport and installation.",
      advantages: lang === "zh"
        ? [["⚡","节能","设备节能15%以上"],["📦","安装便捷","分段式设计，现场接水电即可使用"],["🔄","通用性强","适用于任何多联机品牌"]]
        : [["⚡","Energy","15%+ device energy savings"],["📦","Easy Install","Modular, connect water & power on-site"],["🔄","Universal","Works with any VRF brand"]],
      scenes: lang === "zh" ? ["GMP厂房","办公楼","实验室"] : ["GMP Plants","Offices","Labs"],
      cases: lang === "zh" ? [{name:"浙江某办公楼",rate:"23%"},{name:"美团总部大楼",rate:"20%"}] : [{name:"Zhejiang Office",rate:"23%"},{name:"Meituan HQ",rate:"20%"}],
      stats: [{v:"15",s:"%+",l:lang==="zh"?"节能率":"Savings"},{v:"23",s:"%",l:lang==="zh"?"案例最高":"Best Case"},{v:"0",s:"",l:lang==="zh"?"停机改造":"Downtime"}],
    },
    {
      icon: "🧊", emoji: "🌡️",
      title: lang === "zh" ? "R436C高效节能制冷剂" : "R436C High-Efficiency Refrigerant",
      tag: lang === "zh" ? "用量省40%" : "40% Less Usage",
      desc: lang === "zh" ? "密度仅为R22的40%，充注量仅为R22的40%；压力低效率高，吸排气温度均低于R22，汽化潜热远超R22。适用于家用空调、中央空调、冷冻冷藏、热泵等。" : "Density only 40% of R22, charging volume 40% of R22. Lower pressure, higher efficiency. Applicable to residential AC, central AC, refrigeration, and heat pumps.",
      advantages: lang === "zh"
        ? [["📉","密度小","充注量仅为R22的40%，降低压缩机负荷"],["⚡","效率高","压力低，提高压缩机效率"],["🔥","热损少","吸排气温度低，降低不可逆热损失"]]
        : [["📉","Low Density","40% charge of R22, reduces compressor load"],["⚡","Efficient","Lower pressure, higher compressor efficiency"],["🔥","Less Loss","Lower temps reduce irreversible heat loss"]],
      scenes: lang === "zh" ? ["家用空调","风冷模块机","冷藏冷冻","中央冷水机组","冰水机","热泵"] : ["Home AC","Air-cooled Modules","Refrigeration","Chillers","Ice Machines","Heat Pumps"],
      cases: lang === "zh" ? [{name:"宝钢（三菱）",rate:"33.3%"},{name:"同济大学（日立）",rate:"24.3%"},{name:"中国航天（美的）",rate:"22%"}] : [{name:"Baosteel",rate:"33.3%"},{name:"Tongji Univ",rate:"24.3%"},{name:"CASC",rate:"22%"}],
      stats: [{v:"40",s:"%",l:lang==="zh"?"用量节省":"Less Charge"},{v:"33",s:"%",l:lang==="zh"?"案例最高":"Best Case"},{v:"0",s:"",l:"ODP"}],
    },
    {
      icon: "💧", emoji: "🌊",
      title: lang === "zh" ? "中温水大温差机组" : "Medium-Temp Large Delta-T System",
      tag: lang === "zh" ? "系统节能15-20%" : "System Save 15-20%",
      desc: lang === "zh" ? "二冷9/17℃中温水大温差水系统，中温水末端减少除湿，主机节能12%以上，冷冻水泵节能4%，供回水管道减少损耗2-4%，系统简单故障率低。" : "9/17°C medium-temp large delta-T system. Reduces dehumidification, 12%+ chiller savings, 4% pump savings, 2-4% pipe loss reduction.",
      advantages: lang === "zh"
        ? [["⚡","主机节能","中温水主机节能12%以上"],["💧","减少除湿","末端减少无效除湿，提升舒适度"],["🔧","系统简单","故障率低，减少维修费"]]
        : [["⚡","Chiller","12%+ chiller energy savings"],["💧","Less Dehum","Reduces unnecessary dehumidification"],["🔧","Simple","Low failure rate, less maintenance"]],
      scenes: lang === "zh" ? ["商场","酒店","医院","办公楼"] : ["Malls","Hotels","Hospitals","Offices"],
      cases: lang === "zh" ? [{name:"苏州某企业大楼",rate:"25.5%"}] : [{name:"Suzhou Enterprise",rate:"25.5%"}],
      stats: [{v:"20",s:"%",l:lang==="zh"?"系统节能":"Sys Savings"},{v:"12",s:"%+",l:lang==="zh"?"主机节能":"Chiller"},{v:"25.5",s:"%",l:lang==="zh"?"案例最高":"Best Case"}],
    },
  ];

  const sol = solutions[activeSol];

  return (
    <section style={{ background: T.redSoft, padding: "64px 0", position: "relative" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-block", background: T.redLight, color: T.red, fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 20, marginBottom: 12, letterSpacing: 0.5 }}>{lang === "zh" ? "临界 · 相变  中温水 · 大温差" : "CRITICAL PHASE · MEDIUM TEMP"}</div>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: T.navy, margin: "0 0 8px" }}>{lang === "zh" ? "节能空调解决方案" : "Energy-Saving HVAC Solutions"}</h2>
          <p style={{ fontSize: 15, color: T.textSecondary }}>{lang === "zh" ? "节能 · 节水 · 节地 · 节材 — 助力企业降本增效" : "Save Energy · Water · Space · Materials"}</p>
        </div>

        {/* Solution Tabs */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 32, flexWrap: "wrap" }}>
          {solutions.map((s, i) => (
            <button key={i} onClick={() => setActiveSol(i)} style={{
              background: activeSol === i ? T.red : "#fff", color: activeSol === i ? "#fff" : T.red,
              border: activeSol === i ? `1px solid ${T.red}` : `1px solid ${T.border}`, borderRadius: 24, padding: "8px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: T.font, transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6
            }}>
              <span>{s.icon}</span> {s.title}
            </button>
          ))}
        </div>

        {/* Active Solution Detail */}
        <div key={activeSol} style={{ animation: "fadeSlide 0.4s ease" }}>
          {/* Stats Row - Mac style animated counters */}
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 28 }}>
            {sol.stats.map((st, i) => (
              <GlassCard key={i} hover={false} style={{ padding: "20px 32px", textAlign: "center", minWidth: 150 }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: T.red, letterSpacing: -1, fontVariantNumeric: "tabular-nums" }}>
                  <AnimNum value={st.v} suffix={st.s} duration={1500 + i * 300} />
                </div>
                <div style={{ fontSize: 12, color: T.textSecondary, marginTop: 4, fontWeight: 500 }}>{st.l}</div>
              </GlassCard>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Left: Description + Advantages */}
            <div>
              <GlassCard hover={false} style={{ padding: "28px", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 32 }}>{sol.emoji}</span>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: T.navy, margin: 0 }}>{sol.title}</h3>
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.red, background: T.redLight, padding: "2px 8px", borderRadius: 4 }}>{sol.tag}</span>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: T.textSecondary, lineHeight: 1.75, margin: 0 }}>{sol.desc}</p>
              </GlassCard>

              {/* Advantages */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {sol.advantages.map(([icon, title, desc], i) => (
                  <GlassCard key={i} hover={false} style={{ padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
                    <div><div style={{ fontSize: 14, fontWeight: 600, color: T.navy, marginBottom: 2 }}>{title}</div><div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.5 }}>{desc}</div></div>
                  </GlassCard>
                ))}
              </div>
            </div>

            {/* Right: Application Scenes + Cases */}
            <div>
              <GlassCard hover={false} style={{ padding: "24px", marginBottom: 16 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: T.navy, margin: "0 0 14px", textTransform: "uppercase", letterSpacing: 0.5 }}>{lang === "zh" ? "📍 应用场景" : "📍 Applications"}</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {sol.scenes.map((s, i) => (
                    <span key={i} style={{ background: T.redLight, color: T.red, fontSize: 13, fontWeight: 500, padding: "6px 14px", borderRadius: 20, border: `1px solid ${T.border}` }}>{s}</span>
                  ))}
                </div>
              </GlassCard>

              <GlassCard hover={false} style={{ padding: "24px" }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: T.navy, margin: "0 0 14px", textTransform: "uppercase", letterSpacing: 0.5 }}>{lang === "zh" ? "📊 案例分享" : "📊 Case Studies"}</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {sol.cases.map((c, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: T.redLight, borderRadius: 12, border: `1px solid ${T.border}` }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: T.red }}>{c.name}</span>
                      <span style={{ fontSize: 22, fontWeight: 700, color: T.redDark }}>{lang === "zh" ? "节电率 " : "Saved "}{c.rate}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Patents note */}
              <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
                {[lang === "zh" ? "🏅 多项国家专利" : "🏅 Patents", lang === "zh" ? "📋 国家检测认证" : "📋 Certified"].map((t, i) => (
                  <div key={i} style={{ flex: 1, background: "#fff", borderRadius: 10, padding: "12px 14px", textAlign: "center", fontSize: 13, fontWeight: 600, color: T.red, border: `1px solid ${T.border}` }}>{t}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsBar({ lang }) {
  const stats = lang === "zh"
    ? [{v:"4700",s:"+",l:"产品 SKU"},{v:"500",s:"+",l:"合作客户"},{v:"30",s:"%+",l:"最高节能率"},{v:"12",s:"+",l:"国家专利"}]
    : [{v:"4700",s:"+",l:"Product SKUs"},{v:"500",s:"+",l:"Clients"},{v:"30",s:"%+",l:"Max Savings"},{v:"12",s:"+",l:"Patents"}];
  return (
    <section style={{ background: `linear-gradient(135deg, ${T.navy} 0%, #2D2D52 100%)`, padding: "52px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32, textAlign: "center" }}>
        {stats.map((s, i) => (
          <div key={i}>
            <div style={{ fontSize: 44, fontWeight: 700, color: "#fff", letterSpacing: -1, fontVariantNumeric: "tabular-nums" }}><AnimNum value={s.v} suffix={s.s} duration={2000+i*300} /></div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ContactForm({ lang }) {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [status, setStatus] = useState("idle");
  const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 14, fontFamily: T.font, outline: "none", boxSizing: "border-box", background: "#fff", color: T.textPrimary };
  const handleSubmit = async () => {
    if (!form.name || !form.message) { alert(lang === "zh" ? "请填写姓名和留言内容" : "Please fill in name and message"); return; }
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok && data.success) { setStatus("success"); setForm({ name: "", email: "", company: "", message: "" }); }
      else { setStatus("error"); }
    } catch { setStatus("error"); }
    setTimeout(() => setStatus("idle"), 5000);
  };
  return (
    <GlassCard hover={false} style={{ padding: "28px" }}>
      {[
        { lb: lang === "zh" ? "姓名" : "Name", key: "name" },
        { lb: lang === "zh" ? "邮箱" : "Email", key: "email" },
        { lb: lang === "zh" ? "单位名称" : "Organization", key: "company" },
      ].map(({ lb, key }) => (
        <div key={key} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>{lb}</div>
          <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inputStyle} />
        </div>
      ))}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>{lang === "zh" ? "留言内容" : "Message"}</div>
        <textarea rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} style={{ ...inputStyle, resize: "vertical" }} />
      </div>
      {status === "success" && <div style={{ background: "#E8F5E9", color: "#2E7D32", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 14 }}>✅ {lang === "zh" ? "留言已发送，我们会尽快联系您！" : "Message sent!"}</div>}
      {status === "error" && <div style={{ background: "#FFEBEE", color: "#C62828", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 14 }}>❌ {lang === "zh" ? "发送失败，请发邮件至 service@tflabservice.com" : "Send failed."}</div>}
      <button onClick={handleSubmit} disabled={status === "sending"} style={{ background: status === "sending" ? "#ccc" : T.red, color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: status === "sending" ? "not-allowed" : "pointer", fontFamily: T.font, width: "100%" }}>
        {status === "sending" ? (lang === "zh" ? "发送中..." : "Sending...") : (lang === "zh" ? "提交留言" : "Submit")}
      </button>
    </GlassCard>
  );
}

function ContactSection({ lang }) {
  const info = lang === "zh"
    ? [{icon:"📍",l:"公司地址",v:"上海市浦东新区锦绣东路2777弄19号楼10层"},{icon:"📞",l:"联系电话",v:"139-1641-3233"},{icon:"📧",l:"电子邮箱",v:"service@tflabservice.com"},{icon:"👤",l:"联系人",v:"上海博仕达生物工程有限公司"},{icon:"🕐",l:"工作时间",v:"周一至周五 9:00-18:00"}]
    : [{icon:"📍",l:"Address",v:"19F-10, 2777 Jinxiu East Rd, Pudong, Shanghai"},{icon:"📞",l:"Phone",v:"139-1641-3233"},{icon:"📧",l:"Email",v:"service@tflabservice.com"},{icon:"👤",l:"Contact",v:"Shanghai Booster Bioengineering Co., Ltd."},{icon:"🕐",l:"Hours",v:"Mon-Fri 9:00-18:00 CST"}];
  return (
    <section style={{ background: T.redSoft, padding: "64px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: T.navy, margin: "0 0 8px" }}>{lang === "zh" ? "联系我们" : "Contact Us"}</h2>
          <p style={{ fontSize: 15, color: T.textSecondary }}>{lang === "zh" ? "我们的团队随时为您提供支持" : "Our team is ready to help"}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {info.map((c, i) => (
              <GlassCard key={i} hover={false} style={{ padding: "18px 20px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                <span style={{ fontSize: 22 }}>{c.icon}</span>
                <div><div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{c.l}</div><div style={{ fontSize: 15, fontWeight: 500, color: T.textPrimary }}>{c.v}</div></div>
              </GlassCard>
            ))}
          </div>
          <ContactForm lang={lang} />
        </div>
      </div>
    </section>
  );
}

function TrustedBy({ lang }) {
  return (
    <div style={{ background: "#FAFAFA", borderTop: "1px solid rgba(0,0,0,0.05)", padding: "32px 40px", textAlign: "center", fontFamily: T.font }}>
      <p style={{ fontSize: 12, color: "#AAA", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 20, fontWeight: 600 }}>
        {lang === "zh" ? "受到国内外顶级机构认可" : "Trusted by Top-Tier Institutions"}
      </p>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(200,16,46,0.12)", borderRadius: 14, padding: "10px 24px", boxShadow: "0 2px 16px rgba(200,16,46,0.06)" }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: `linear-gradient(135deg, ${T.red}, ${T.redDark})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 800, fontFamily: T.fontHead }}>协</div>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#333", fontFamily: T.fontHead, letterSpacing: 0.2 }}>上海市生物医药行业协会</span>
      </div>
    </div>
  );
}


function Footer({ lang }) {
  return (
    <footer style={{ background: T.bgDark, color: "rgba(255,255,255,0.55)", fontFamily: T.font, padding: "40px 32px 20px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${T.red}, #FF6B81)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700 }}>B</div>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{lang === "zh" ? "博仕达 BOOSTER" : "BOOSTER"}</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 320 }}>{lang === "zh" ? "上海博仕达生物工程有限公司（BOOSTER）— 全力为生命科技类企业提供专业化整体服务的一站式平台。" : "BOOSTER — A one-stop professional service platform for life science enterprises."}</p>
          </div>
          <div style={{ display: "flex", gap: 48 }}>
            {(lang === "zh" ? [["产品",["实验耗材","质控分析工具酶","超滤离心管","质控试剂盒"]],["服务",["工程服务","供应链服务","企业管家","产业园运营"]],["公司",["联系我们","新闻动态","合作伙伴","招贤纳士"]]] : [["Products",["Lab Consumables","QC Enzymes","Ultrafiltration","QC Kits"]],["Services",["Engineering","Supply Chain","Enterprise","Park Ops"]],["Company",["Contact","News","Partners","Careers"]]]).map(([t, links], i) => (
              <div key={i}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>{t}</div>
                {links.map((lk, li) => <div key={li} style={{ fontSize: 13, padding: "3px 0", cursor: "pointer" }}>{lk}</div>)}
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16, display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.5 }}>
          <span>{lang === "zh" ? "© 2026 上海博仕达生物工程有限公司（BOOSTER）" : "© 2026 BOOSTER Bio-Technology Co., Ltd."}</span>
          <span>{lang === "zh" ? "仅供研究使用" : "For Research Use Only"}</span>
        </div>
      </div>
    </footer>
  );
}

// ═══════ PRODUCT CATALOG ═══════
function ProductCatalogSection({ lang, initialCat, search, onViewDetail }) {
  const [activeCat, setActiveCat] = useState(initialCat);
  const [activeSub, setActiveSub] = useState(null);
  const [page, setPage] = useState(0);
  useEffect(() => { setActiveCat(initialCat); setActiveSub(null); setPage(0); }, [initialCat]);
  const cats = useMemo(() => { const m = {}; ALL_PRODUCTS.forEach(p => m[p.cat]=(m[p.cat]||0)+1); return Object.entries(m).sort((a,b)=>b[1]-a[1]); }, []);
  const subCats = useMemo(() => { const m = {}; ALL_PRODUCTS.forEach(p => { if(!m[p.cat]) m[p.cat]={}; m[p.cat][p.sub||""]=(m[p.cat][p.sub||""]||0)+1; }); const r={}; for(const[c,s] of Object.entries(m)) r[c]=Object.entries(s).sort((a,b)=>b[1]-a[1]); return r; }, []);
  const filtered = useMemo(() => {
    let list = ALL_PRODUCTS;
    if (activeCat) list = list.filter(p => p.cat === activeCat);
    if (activeSub) list = list.filter(p => p.sub === activeSub);
    if (search.trim()) { const q = search.trim().toLowerCase(); list = list.filter(p => [p.sku,p.name,p.sub,p.spec].some(f => (f||"").toLowerCase().includes(q))); }
    return list;
  }, [activeCat, activeSub, search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageProducts = filtered.slice(page*PAGE_SIZE, (page+1)*PAGE_SIZE);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 32px 64px", display: "flex", gap: 24 }}>
      <div style={{ width: 220, flexShrink: 0 }}>
        <GlassCard hover={false} style={{ padding: 0, overflow: "hidden", position: "sticky", top: 80 }}>
          <div style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: T.navy, borderBottom: `1px solid ${T.border}` }}>{lang === "zh" ? "产品分类" : "Categories"}</div>
          <div onClick={() => { setActiveCat(null); setActiveSub(null); setPage(0); }} style={{ padding: "9px 16px", fontSize: 13, cursor: "pointer", fontWeight: !activeCat ? 600 : 400, color: !activeCat ? T.red : T.textSecondary, background: !activeCat ? T.redLight : "transparent", borderLeft: !activeCat ? `3px solid ${T.red}` : "3px solid transparent" }}>
            {lang === "zh" ? "全部" : "All"} ({ALL_PRODUCTS.length})
          </div>
          {cats.map(([cat, count]) => {
            const meta = CAT_META[cat]||{icon:"📦"}; const isA = activeCat===cat; const subs = subCats[cat]||[];
            return (<div key={cat}>
              <div onClick={() => { setActiveCat(cat); setActiveSub(null); setPage(0); }} style={{ padding: "9px 16px", fontSize: 13, cursor: "pointer", fontWeight: isA ? 600 : 400, color: isA&&!activeSub ? T.red : T.textSecondary, background: isA&&!activeSub ? T.redLight : "transparent", borderLeft: isA&&!activeSub ? `3px solid ${T.red}` : "3px solid transparent", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14 }}>{meta.icon}</span><span style={{ flex: 1 }}>{cat}</span><span style={{ fontSize: 11, color: T.textSecondary }}>{count}</span>
              </div>
              {isA && subs.length > 1 && subs.map(([sub, sc]) => (
                <div key={sub} onClick={() => { setActiveSub(activeSub===sub?null:sub); setPage(0); }} style={{ padding: "5px 16px 5px 40px", fontSize: 12, cursor: "pointer", color: activeSub===sub ? T.red : T.textSecondary, fontWeight: activeSub===sub ? 600 : 400 }}>{sub || "其他"} ({sc})</div>
              ))}
            </div>);
          })}
        </GlassCard>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: T.textSecondary, marginBottom: 10 }}>{filtered.length.toLocaleString()} {lang === "zh" ? "个产品" : "products"}</div>
        <GlassCard hover={false} style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: T.font, color: T.red }}>
            <thead><tr style={{ background: T.redLight }}>
              <th style={thS}>{lang==="zh"?"货号":"SKU"}</th><th style={{...thS,textAlign:"left"}}>{lang==="zh"?"产品名称":"Product"}</th><th style={thS}>{lang==="zh"?"分类":"Category"}</th><th style={thS}>{lang==="zh"?"规格":"Spec"}</th><th style={thS}></th>
            </tr></thead>
            <tbody>
              {pageProducts.map((p,i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${T.border}`, cursor: "pointer" }} onClick={() => onViewDetail(p)}
                  onMouseEnter={e => e.currentTarget.style.background=T.redSoft} onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                  <td style={tdS}><code style={{ fontSize: 11, color: T.red, background: T.redLight, padding: "2px 6px", borderRadius: 4 }}>{p.sku}</code></td>
                  <td style={{...tdS, textAlign:"left"}}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {getProductImage(p.sku) && <img src={getProductImage(p.sku)} alt="" style={{ width: 36, height: 36, objectFit: "contain", borderRadius: 4, background: T.redLight, flexShrink: 0 }} />}
                      <div><div style={{ fontWeight: 500, color: T.red, lineHeight: 1.3 }}>{p.name||"—"}</div>{p.sub && <div style={{ fontSize: 11, color: T.textSecondary }}>{p.sub}</div>}</div>
                    </div>
                  </td>
                  <td style={tdS}><span style={{ fontSize: 11, background: T.redLight, padding: "2px 7px", borderRadius: 4, color: T.red }}>{p.cat}</span></td>
                  <td style={tdS}><span style={{ fontSize: 12, color: T.textSecondary }}>{p.spec||"—"}</span></td>
                  <td style={tdS}><button onClick={e=>{e.stopPropagation();onViewDetail(p)}} style={{ background: T.red, color: "#fff", border: "none", borderRadius: 5, padding: "4px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: T.font }}>{lang==="zh"?"详情":"Details"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
        {totalPages > 1 && <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 16 }}>
          <PgBtn l="‹" d={page===0} o={() => setPage(page-1)} />
          {pgn(page, totalPages).map((p,i) => p==="..."?<span key={i} style={{padding:"0 4px",color:T.textSecondary}}>…</span>:<PgBtn key={i} l={String(p+1)} a={p===page} o={() => setPage(p)} />)}
          <PgBtn l="›" d={page>=totalPages-1} o={() => setPage(page+1)} />
        </div>}
      </div>
    </div>
  );
}

const thS = { padding: "9px 10px", fontSize: 11, fontWeight: 700, color: T.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, textAlign: "center", whiteSpace: "nowrap" };
const tdS = { padding: "9px 10px", textAlign: "center", verticalAlign: "middle" };
function PgBtn({ l, a, d, o }) { return <button onClick={d?undefined:o} style={{ minWidth: 30, height: 30, borderRadius: 6, border: a ? `1px solid ${T.red}` : `1px solid ${T.border}`, background: a ? T.red : "#fff", color: a ? "#fff" : d ? "#ddd" : T.red, fontSize: 12, cursor: d ? "default" : "pointer", fontFamily: T.font, display: "flex", alignItems: "center", justifyContent: "center" }}>{l}</button>; }
function pgn(c, t) { const p = []; if(t<=7){for(let i=0;i<t;i++)p.push(i);return p;} p.push(0); if(c>3)p.push("..."); for(let i=Math.max(1,c-1);i<=Math.min(t-2,c+1);i++)p.push(i); if(c<t-4)p.push("..."); p.push(t-1); return p; }

// ═══════ PRODUCT DETAIL ═══════
function ProductDetailView({ product: p, lang, onBack, onViewDetail }) {
  const meta = CAT_META[p.cat]||{icon:"📦",color:"#F5F5F5"};
  const [tab, setTab] = useState(0);
  const tabs = lang==="zh"?["产品描述","技术参数","使用说明","储存运输"]:["Description","Specs","Instructions","Storage"];
  const related = useMemo(() => ALL_PRODUCTS.filter(r => r.sku!==p.sku && r.cat===p.cat && r.sub===p.sub).slice(0,6), [p.sku,p.cat,p.sub]);
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 32px 64px" }}>
      <div onClick={onBack} style={{ fontSize: 13, color: T.red, cursor: "pointer", marginBottom: 16, fontWeight: 500 }}>{lang==="zh"?"← 返回产品列表":"← Back"}</div>
      <GlassCard hover={false} style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex" }}>
          <div style={{ width: 320, minHeight: 300, background: T.redLight, display: "flex", alignItems: "center", justifyContent: "center", borderRight: `1px solid ${T.border}`, padding: 20, flexShrink: 0 }}>
            {getProductImage(p.sku) ? <img src={getProductImage(p.sku)} alt={p.name} style={{ maxWidth: "100%", maxHeight: 260, objectFit: "contain", borderRadius: 8 }} /> : <div style={{ fontSize: 72, opacity: 0.3 }}>{meta.icon}</div>}
          </div>
          <div style={{ flex: 1, padding: "24px 28px" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.red, background: T.redLight, padding: "3px 8px", borderRadius: 4 }}>{p.brand}</span>
              <span style={{ fontSize: 11, background: T.redLight, padding: "3px 8px", borderRadius: 4, color: T.red }}>{p.cat}</span>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: T.red, margin: "0 0 6px", lineHeight: 1.3 }}>{p.name||p.sku}</h1>
            <div style={{ fontSize: 13, color: T.textSecondary, marginBottom: 18 }}>{lang==="zh"?"货号":"SKU"}: <code style={{ color: T.red, background: T.redLight, padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>{p.sku}</code></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px", marginBottom: 20, fontSize: 13 }}>
              {[[lang==="zh"?"品牌":"Brand",p.brand],[lang==="zh"?"规格":"Spec",p.spec||"—"],[lang==="zh"?"分类":"Category",p.cat],[lang==="zh"?"子分类":"Sub",p.sub||"—"]].map(([k,v],i) => (
                <div key={i}><div style={{ fontSize: 11, fontWeight: 600, color: T.textSecondary, textTransform: "uppercase", marginBottom: 2 }}>{k}</div><div style={{ fontWeight: 500, color: T.red }}>{v}</div></div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ background: T.red, color: "#fff", border: "none", borderRadius: 8, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>📧 {lang==="zh"?"立即询价":"Quote"}</button>
              <button style={{ background: "#fff", color: T.red, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: T.font }}>📄 {lang==="zh"?"产品说明书":"Datasheet"}</button>
            </div>
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", borderBottom: `1px solid ${T.border}` }}>
            {tabs.map((tb,i) => <div key={i} onClick={() => setTab(i)} style={{ padding: "12px 20px", fontSize: 13, fontWeight: tab===i?600:400, color: tab===i?T.red:T.textSecondary, borderBottom: tab===i?`2px solid ${T.red}`:"2px solid transparent", cursor: "pointer" }}>{tb}</div>)}
          </div>
          <div style={{ padding: "20px 28px", fontSize: 14, color: T.textSecondary, lineHeight: 1.8, minHeight: 100 }}>
            {tab===0 && <p>{p.brand} {p.name}，{lang==="zh"?`适用于${p.cat}相关应用。`:`For ${p.cat} applications.`}</p>}
            {tab===1 && <table style={{width:"100%",borderCollapse:"collapse",fontSize:14,color:T.red}}><tbody>{[[lang==="zh"?"货号":"SKU",p.sku],[lang==="zh"?"品牌":"Brand",p.brand],[lang==="zh"?"规格":"Spec",p.spec||"—"],[lang==="zh"?"分类":"Cat",p.cat]].map(([k,v],i) => <tr key={i} style={{borderBottom:`1px solid ${T.border}`}}><td style={{padding:"8px 12px 8px 0",fontWeight:600,width:150,color:T.textSecondary}}>{k}</td><td style={{padding:"8px 0"}}>{v}</td></tr>)}</tbody></table>}
            {tab===2 && <p>{lang==="zh"?"详细使用说明请参考产品随附说明书。":"See product datasheet for instructions."}</p>}
            {tab===3 && <p>{lang==="zh"?"请按照产品标签储存。常见条件：室温、2-8°C、-20°C。":"Store per label. RT, 2-8°C, or -20°C."}</p>}
          </div>
        </div>
      </GlassCard>
      {related.length > 0 && <div style={{ marginTop: 28 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: T.red, marginBottom: 14 }}>{lang==="zh"?"相关产品":"Related"}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {related.map((r,i) => (
            <GlassCard key={i} style={{ padding: 14 }}>
              <div onClick={() => { onViewDetail(r); window.scrollTo?.({top:0,behavior:"smooth"}); }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  {getProductImage(r.sku) ? <img src={getProductImage(r.sku)} alt="" style={{ width: 32, height: 32, objectFit: "contain", borderRadius: 4, background: T.redLight }} /> : <span style={{ fontSize: 24 }}>{meta.icon}</span>}
                  <code style={{ fontSize: 10, color: T.red, background: T.redLight, padding: "1px 5px", borderRadius: 3 }}>{r.sku}</code>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.red, lineHeight: 1.3 }}>{r.name||"—"}</div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>}
    </div>
  );
}

// ═══════ MAIN APP ═══════
export default function BoosterHomepage() {
  const [lang, setLang] = useState("zh");
  const [section, setSection] = useState("home");
  const [search, setSearch] = useState("");
  const [productCat, setProductCat] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);

  const go = useCallback((s) => { setSection(s); setDetailProduct(null); if(s!=="products"){ setProductCat(null); setSearch(""); } window.scrollTo?.({top:0,behavior:"smooth"}); }, []);
  const goProducts = useCallback((cat) => { setProductCat(cat||null); setSection("products"); setDetailProduct(null); window.scrollTo?.({top:0,behavior:"smooth"}); }, []);
  const goDetail = useCallback((p) => { setDetailProduct(p); setSection("products"); window.scrollTo?.({top:0,behavior:"smooth"}); }, []);

  return (
    <div style={{ fontFamily: T.font, color: T.red, WebkitFontSmoothing: "antialiased", minHeight: "100vh", background: "#FFFFFF" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; }
        input::placeholder, textarea::placeholder { color: #E8A0AB; }
        button:hover { opacity: 0.92; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 3px; }
        @keyframes fadeSlide { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { from { transform: scale(1); opacity: 0.03; } to { transform: scale(1.1); opacity: 0.06; } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
      <TopBar lang={lang} setLang={setLang} />
      <NavHeader lang={lang} section={section} setSection={go} search={search} setSearch={setSearch} />

      {section === "home" && <>
        <HeroSection lang={lang} onBrowse={() => goProducts(null)} onSolutions={() => go("solutions")} />
        <CategorySection lang={lang} onSelectCat={goProducts} />
        <SolutionsSection lang={lang} />
        <StatsBar lang={lang} />
        <ContactSection lang={lang} />
      </>}

      {section === "products" && !detailProduct && <ProductCatalogSection lang={lang} initialCat={productCat} search={search} onViewDetail={goDetail} />}
      {section === "products" && detailProduct && <ProductDetailView product={detailProduct} lang={lang} onBack={() => setDetailProduct(null)} onViewDetail={goDetail} />}
      {section === "solutions" && <><SolutionsSection lang={lang} /><StatsBar lang={lang} /></>}
      {section === "contact" && <ContactSection lang={lang} />}

      <TrustedBy lang={lang} />
      <Footer lang={lang} />
    </div>
  );
}
