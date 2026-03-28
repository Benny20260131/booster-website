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

// ─── Liquid Glass 样式常量 ────────────────────────────────────────
const LG = {
  // 主色：红色玻璃
  primary: {
    background: "linear-gradient(145deg, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.14) 100%), rgba(200,16,46,0.68)",
    backdropFilter: "blur(28px) saturate(200%)",
    WebkitBackdropFilter: "blur(28px) saturate(200%)",
    border: "1px solid rgba(255,255,255,0.42)",
    boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(0,0,0,0.10), 0 8px 32px rgba(200,16,46,0.28), 0 2px 8px rgba(0,0,0,0.08)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
  },
  // 幽灵：透明玻璃
  ghost: {
    background: "linear-gradient(145deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.18) 100%)",
    backdropFilter: "blur(24px) saturate(180%)",
    WebkitBackdropFilter: "blur(24px) saturate(180%)",
    border: "1px solid rgba(200,16,46,0.28)",
    boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.70), inset 0 -1px 0 rgba(200,16,46,0.06), 0 4px 16px rgba(0,0,0,0.06)",
    color: "#C8102E",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
  },
  // 悬停时通用 delta
  hoverOn:  (el) => { el.style.transform = "translateY(-2px) scale(1.025)"; el.style.filter = "brightness(1.08)"; },
  hoverOff: (el) => { el.style.transform = "none"; el.style.filter = "none"; },
};

const CAT_META = {
  "实验耗材": { icon: "🧪", color: "#FFE8EC" },
  "质控分析工具酶": { icon: "🔬", color: "#E8F5E9" },
  "超滤离心管": { icon: "⚗️", color: "#FFF3E0" },
  "质控试剂盒": { icon: "💊", color: "#FCE4EC" },
  "早期研发": { icon: "🧫", color: "#E0F7FA" },
  "化学试剂与小分子": { icon: "⚗️", color: "#FFF8E1" },
};

// ─── 中英文分类对照表 ───────────────────────────────────────
const CAT_EN = {
  "实验耗材": "Lab Consumables",
  "质控分析工具酶": "QC Enzymes",
  "超滤离心管": "Ultrafiltration Tubes",
  "质控试剂盒": "QC Kits",
  "早期研发": "Early R&D",
  "化学试剂与小分子": "Chemical Reagents",
};
const SUB_EN = {
  "吸头": "Pipette Tips", "低吸附吸头": "Low-Bind Tips",
  "离心管": "Centrifuge Tubes", "低吸附离心管": "Low-Bind Tubes",
  "冻存管": "Cryo Tubes", "冻存盒": "Cryo Boxes",
  "PCR管": "PCR Tubes", "PCR单管": "PCR Single Tube",
  "PCR板": "PCR Plates", "PCR双色板": "PCR Dual-Color Plate",
  "PCR封板膜": "PCR Sealing Film", "PCR 8联管盖": "PCR Strip Caps",
  "PCR磁棒套": "Magnetic Rod Sleeve",
  "培养板": "Culture Plates", "培养瓶": "Culture Flasks", "培养皿": "Culture Dishes",
  "细胞工厂": "Cell Factory", "细胞摇瓶": "Cell Shake Flask",
  "细胞推板": "Cell Roller Bottle", "细胞刮刀": "Cell Scraper",
  "细胞过滤器": "Cell Strainer",
  "深孔板": "Deep Well Plates", "酶标板": "ELISA Plates",
  "试剂瓶": "Reagent Bottles", "试剂槽": "Reagent Reservoirs",
  "移液管": "Serological Pipettes", "离心瓶": "Centrifuge Bottles",
  "真空过滤系统": "Vacuum Filtration", "针式过滤器": "Syringe Filters",
  "工具酶": "Enzyme Tools", "试剂盒": "Reagent Kits",
  "超滤离心管": "Ultrafiltration Tubes",
  "生物试剂": "Biological Reagents", "有机溶剂化学试剂": "Organic Solvents",
  "ADC": "ADC", "ADC-Linker-Payload": "ADC-Linker-Payload",
  "PROTAC": "PROTAC", "SiRNA": "SiRNA", "通用": "General",
};
// 翻译分类/子分类名
const tCat = (lang, cat) => lang === "zh" ? cat : (CAT_EN[cat] || cat);
const tSub = (lang, sub) => lang === "zh" ? sub : (SUB_EN[sub] || sub);

// ─── 产品名称/规格 中→英词汇替换 ──────────────────────────────
// 长词/复合词优先放前面（先匹配长字符串）
const _NAME_MAP = [
  // 复合专有名词（长词先匹配）
  ["重组胰蛋白酶","Recombinant Trypsin"],["重组赖氨酰内切酶","Recombinant Lys-C"],
  ["自动化导电吸头","Automation Conductive Tip"],
  ["糖苷酶F 快速","PNGase F Rapid"],["糖苷酶F 普通","PNGase F Standard"],["糖苷酶F","PNGase F"],
  ["N糖标准品","N-Glycan Standard"],["N糖试剂盒","N-Glycan Kit"],
  ["高甘露糖混标","High Mannose Mixed Std"],["高唾液酸","High Sialic Acid"],
  ["超滤离心管","Ultrafiltration Tube"],
  ["磷酸二氢钠","Sodium Dihydrogen Phosphate"],["磷酸氢二钠","Disodium Hydrogen Phosphate"],
  ["磷酸二氢钾","Potassium Dihydrogen Phosphate"],
  ["乙酸乙酯","Ethyl Acetate"],["二氯甲烷","Dichloromethane"],
  // 消毒/材质
  ["辐照灭菌","Radiation Sterilized"],["灭菌","Sterile"],["无菌","Sterile"],["冻干","Lyophilized"],
  ["亲水","Hydrophilic"],["疏水","Hydrophobic"],["低吸附","Low-Bind"],["导电","Conductive"],
  // 结构特征
  ["带滤芯","w/Filter"],["带刻度","Graduated"],["不带刻度","Non-Graduated"],
  ["加长粗款","Extended Wide"],["加长细款","Extended Slim"],["加长","Extended"],
  ["宽口","Wide-Mouth"],["窄口","Narrow-Mouth"],["广口","Wide-Mouth"],["广颈","Wide-Neck"],
  ["全裙边","Full Skirt"],["半裙边","Semi Skirt"],["无裙边","No Skirt"],
  ["高裙边","Tall Skirt"],["宽裙边","Wide Skirt"],
  ["圆底","Round-Bottom"],["锥底","Conical"],["V底","V-Bottom"],["U底","U-Bottom"],["平底","Flat-Bottom"],
  ["可立","Self-Standing"],["可拆","Removable"],
  // 颜色/外观
  ["透明","Clear"],["黑色","Black"],["白色","White"],["黄色","Yellow"],
  ["蓝色","Blue"],["红色","Red"],["避光","Light-Protected"],["双色","Dual-Color"],
  // 包装形式
  ["盒装","Boxed"],["袋装","Bagged"],["独立包装","Indiv.Wrapped"],["散装","Bulk"],
  // 材质
  ["聚丙烯","PP"],["聚苯乙烯","PS"],["聚乙烯","PE"],["玻璃底","Glass Bottom"],
  // 通用产品名
  ["吸头","Pipette Tip"],["离心管","Centrifuge Tube"],["培养皿","Culture Dish"],
  ["培养瓶","Culture Flask"],["培养板","Culture Plate"],["摇瓶","Shake Flask"],
  ["细胞工厂","Cell Factory"],["细胞刮刀","Cell Scraper"],["细胞过滤器","Cell Strainer"],
  ["深孔板","Deep Well Plate"],["酶标板","ELISA Plate"],["试剂槽","Reagent Reservoir"],
  ["试剂瓶","Reagent Bottle"],["移液管","Serological Pipette"],
  ["针式过滤器","Syringe Filter"],["过滤系统","Filtration System"],
  // 自动化
  ["自动化","Automation"],["高通量","High-Throughput"],
  // 酶/试剂类
  ["重组","Recombinant"],["质谱级","MS-Grade"],["质量控制","QC"],
  ["唾液酸酶","Sialidase"],["赖氨酰内切酶","Lys-C Endoprotease"],["胰蛋白酶","Trypsin"],
  ["稀释液","Dilution Buffer"],["磁珠","Magnetic Beads"],["游离糖链","Free Glycans"],["捕获","Capture"],
  ["标准品","Standard"],["检测","Detection"],["分析","Analysis"],
  ["纯化","Purification"],["提取","Extraction"],["预处理","Pretreatment"],
  // 化学试剂
  ["无水","Anhydrous"],["二水","Dihydrate"],["三水","Trihydrate"],
  ["氯化钠","Sodium Chloride"],["氯化钾","Potassium Chloride"],["氯化铵","Ammonium Chloride"],
  ["氯化钙","Calcium Chloride"],["氯化镁","Magnesium Chloride"],
  ["硫酸钠","Sodium Sulfate"],["硫酸铵","Ammonium Sulfate"],["硫酸镁","Magnesium Sulfate"],
  ["碳酸钠","Sodium Carbonate"],["碳酸氢钠","Sodium Bicarbonate"],["乙酸钠","Sodium Acetate"],
  ["正己烷","n-Hexane"],["乙腈","Acetonitrile"],["甲醇","Methanol"],["乙醇","Ethanol"],
  ["丙酮","Acetone"],["石英砂","Quartz Sand"],["草酸","Oxalic Acid"],
  // 规格级别
  ["制备级","Prep Grade"],["梯度","Gradient"],["分析纯","AR"],["色谱纯","HPLC Grade"],
  ["超纯","Ultra-Pure"],["分子生物学级","Mol.Bio.Grade"],
];
// 长词先替换（中盒必须在盒前面）
const _SPEC_MAP = [
  ["中盒","inner-box"],["独立包装","Indiv.Wrapped"],
  ["盒","box"],["箱","case"],["袋","bag"],["叠","stack"],["架","rack"],
  ["瓶","btl"],["桶","drum"],["支","pcs"],["个","pcs"],["包","pack"],
  ["克","g"],["千克","kg"],["毫克","mg"],["微克","µg"],["毫升","mL"],["升","L"],
];
function tName(lang, name) {
  if (lang === "zh" || !name) return name || "";
  let s = name.replace(/，/g, ", ").replace(/（/g, " (").replace(/）/g, ")").replace(/。/g, ". ");
  for (const [zh, en] of _NAME_MAP) s = s.split(zh).join(en);
  // 在英文字母/数字与中文字符之间插入空格，清理多余空格
  s = s.replace(/([a-zA-Z])([0-9])/g, "$1 $2").replace(/([0-9])([a-zA-Z])/g, "$1 $2");
  return s.replace(/\s{2,}/g, " ").trim();
}
function tSpec(lang, spec) {
  if (lang === "zh" || !spec) return spec || "";
  let s = spec.replace(/，/g, ", ").replace(/（/g, " (").replace(/）/g, ")");
  for (const [zh, en] of _SPEC_MAP) s = s.split(zh).join(en);
  return s.replace(/\s{2,}/g, " ").trim();
}

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
          <button key={l} onClick={() => setLang(l)} style={{ background: lang===l ? "linear-gradient(145deg,rgba(255,255,255,0.30),rgba(255,255,255,0.12))" : "transparent", backdropFilter: lang===l ? "blur(12px)" : "none", color: "#fff", border: lang===l ? "1px solid rgba(255,255,255,0.40)" : "none", borderRadius: 6, padding: "2px 10px", fontSize: 11, cursor: "pointer", fontFamily: T.font, fontWeight: lang===l ? 700 : 400, boxShadow: lang===l ? "inset 0 1px 0 rgba(255,255,255,0.50), 0 2px 6px rgba(0,0,0,0.10)" : "none", transition: "all 0.2s" }}>
            {l === "zh" ? "中文" : "EN"}
          </button>
        ))}
      </div>
    </div>
  );
}

function NavHeader({ lang, section, setSection, user, onLogin, onRegister, onLogout }) {
  const [hovered, setHovered] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
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

        {user ? (
          /* ── 已登录态 ── */
          <div style={{ position: "relative" }}>
            <div onClick={() => setShowUserMenu(v => !v)}
              style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "4px 10px 4px 4px", borderRadius: 10, background: showUserMenu ? "rgba(200,16,46,0.06)" : "transparent", transition: "background 0.2s" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${T.red},${T.redDark})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                {user.name.charAt(0)}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.red, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</span>
              <span style={{ fontSize: 10, color: "#aaa" }}>▾</span>
            </div>
            {showUserMenu && (
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)", border: "1px solid rgba(200,16,46,0.12)", borderRadius: 14, boxShadow: "0 12px 40px rgba(0,0,0,0.12)", padding: "16px", minWidth: 220, zIndex: 100 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.red, marginBottom: 2 }}>{user.name}</div>
                {user.company && <div style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>{user.company}</div>}
                {user.position && <div style={{ fontSize: 12, color: "#aaa", marginBottom: 10 }}>{user.position}</div>}
                <div style={{ fontSize: 12, color: "#666", marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #f0f0f0" }}>{user.email}</div>
                <button onClick={() => { onLogout(); setShowUserMenu(false); }}
                  onMouseEnter={e => LG.hoverOn(e.currentTarget)} onMouseLeave={e => LG.hoverOff(e.currentTarget)}
                  style={{ width: "100%", ...LG.ghost, borderRadius: 8, padding: "7px", fontSize: 12, fontFamily: T.font }}>
                  {lang === "zh" ? "退出登录" : "Logout"}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ── 未登录态 ── */
          <>
            <button onClick={onLogin} className="lg-btn"
              onMouseEnter={e => LG.hoverOn(e.currentTarget)} onMouseLeave={e => LG.hoverOff(e.currentTarget)}
              style={{ ...LG.ghost, borderRadius: 10, padding: "6px 16px", fontSize: 12, fontFamily: T.font }}>
              {lang === "zh" ? "登录" : "Login"}
            </button>
            <button onClick={onRegister} className="lg-btn"
              onMouseEnter={e => LG.hoverOn(e.currentTarget)} onMouseLeave={e => LG.hoverOff(e.currentTarget)}
              style={{ ...LG.primary, borderRadius: 10, padding: "7px 16px", fontSize: 12, fontFamily: T.font }}>
              {lang === "zh" ? "注册" : "Register"}
            </button>
          </>
        )}
      </header>
    </div>
  );
}


// ═══════ 通用 Modal 遮罩 ═══════
function ModalOverlay({ onClose, children }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.50)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(30px)", borderRadius: 20, boxShadow: "0 24px 80px rgba(0,0,0,0.18)", width: "100%", maxWidth: 480, position: "relative", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}

// ═══════ 登录 Modal ═══════
function LoginModal({ lang, onClose, onSuccess, onSwitchRegister }) {
  const [tab, setTab] = useState("email");
  const [step, setStep] = useState(1);
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [localMode, setLocalMode] = useState(false);

  const sendOtp = async () => {
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, type: tab }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "发送失败"); setLoading(false); return; }
      setToken(data.token || "");
      setStep(2);
    } catch {
      // 本地预览模式（Vite dev，CF Functions 不可用）
      setLocalMode(true);
      setStep(2);
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    setError(""); setLoading(true);
    try {
      if (localMode) {
        // 本地固定验证码
        if (otp.trim() !== "888888") { setError("验证码错误（本地预览模式固定验证码为 888888）"); setLoading(false); return; }
        const users = JSON.parse(localStorage.getItem("bsd_users") || "[]");
        const found = users.find(u => u.email === contact || u.phone === contact);
        if (!found) { setError("该账号未注册，请先注册"); setLoading(false); return; }
        onSuccess(found); return;
      }
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, otp }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "验证失败"); setLoading(false); return; }
      const users = JSON.parse(localStorage.getItem("bsd_users") || "[]");
      const found = users.find(u => u.email === data.email);
      if (!found) { setError("该账号未注册，请先注册"); setLoading(false); return; }
      onSuccess(found);
    } catch (e) {
      setError("网络错误，请重试");
    }
    setLoading(false);
  };

  const inputStyle = { width: "100%", border: "1.5px solid #eee", borderRadius: 10, padding: "12px 14px", fontSize: 15, fontFamily: "inherit", outline: "none", color: "#333", background: "#fafafa", boxSizing: "border-box", transition: "border-color 0.2s" };
  const btnPrimary = { ...LG.primary, width: "100%", borderRadius: 12, padding: "13px", fontSize: 15, fontFamily: "inherit", marginTop: 8, cursor: loading ? "not-allowed" : "pointer" };

  return (
    <ModalOverlay onClose={onClose}>
      {/* 头部 */}
      <div style={{ background: "linear-gradient(135deg,#9B0023,#C8102E)", padding: "24px 28px 20px" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 18, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 28, height: 28, color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        <h2 style={{ color: "#fff", margin: 0, fontSize: 20, fontWeight: 800 }}>{lang === "zh" ? "登录账号" : "Login"}</h2>
        <p style={{ color: "rgba(255,255,255,0.8)", margin: "4px 0 0", fontSize: 13 }}>{lang === "zh" ? "欢迎回到博仕达生物" : "Welcome back to Booster Bio"}</p>
      </div>

      <div style={{ padding: "24px 28px 28px" }}>
        {step === 1 && <>
          {/* Tab 切换 */}
          <div style={{ display: "flex", background: "#f5f5f5", borderRadius: 10, padding: 3, marginBottom: 20 }}>
            {[["email", lang === "zh" ? "📧 邮箱验证" : "📧 Email"], ["phone", lang === "zh" ? "📱 手机号" : "📱 Phone"]].map(([k, label]) => (
              <button key={k} onClick={() => { setTab(k); setContact(""); setError(""); }}
                style={{ flex: 1, padding: "8px", border: "none", borderRadius: 8, fontSize: 13, fontWeight: tab === k ? 700 : 500, color: tab === k ? "#C8102E" : "#888", background: tab === k ? "#fff" : "transparent", cursor: "pointer", boxShadow: tab === k ? "0 2px 8px rgba(0,0,0,0.08)" : "none", transition: "all 0.2s", fontFamily: "inherit" }}>
                {label}
              </button>
            ))}
          </div>

          <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>
            {tab === "email" ? (lang === "zh" ? "邮箱地址" : "Email") : (lang === "zh" ? "手机号码" : "Phone")}
          </label>
          <input value={contact} onChange={e => setContact(e.target.value)}
            onFocus={e => e.target.style.borderColor = "#C8102E"} onBlur={e => e.target.style.borderColor = "#eee"}
            onKeyDown={e => e.key === "Enter" && sendOtp()}
            placeholder={tab === "email" ? "请输入注册邮箱" : "请输入手机号"} style={inputStyle} />

          {error && <p style={{ color: "#C8102E", fontSize: 13, margin: "8px 0 0" }}>⚠ {error}</p>}
          <button onClick={sendOtp} disabled={loading || !contact.trim()} className="lg-btn" onMouseEnter={e=>!(loading||!contact.trim())&&LG.hoverOn(e.currentTarget)} onMouseLeave={e=>LG.hoverOff(e.currentTarget)} style={{ ...btnPrimary, opacity: (loading || !contact.trim()) ? 0.6 : 1 }}>
            {loading ? "发送中..." : (lang === "zh" ? "发送验证码" : "Send Code")}
          </button>
        </>}

        {step === 2 && <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, padding: "10px 14px", background: "#FFF5F7", borderRadius: 10, border: "1px solid rgba(200,16,46,0.15)" }}>
            <span style={{ fontSize: 18 }}>📬</span>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#C8102E" }}>验证码已发送</p>
              <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{localMode ? `本地预览模式，固定验证码：888888` : `已发送至 ${contact}`}</p>
            </div>
          </div>

          <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 6 }}>输入 6 位验证码</label>
          <input value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onFocus={e => e.target.style.borderColor = "#C8102E"} onBlur={e => e.target.style.borderColor = "#eee"}
            onKeyDown={e => e.key === "Enter" && verifyOtp()}
            placeholder="请输入验证码" maxLength={6}
            style={{ ...inputStyle, fontSize: 22, letterSpacing: 8, textAlign: "center", fontWeight: 700 }} />

          {error && <p style={{ color: "#C8102E", fontSize: 13, margin: "8px 0 0" }}>⚠ {error}</p>}
          <button onClick={verifyOtp} disabled={loading || otp.length !== 6} className="lg-btn" onMouseEnter={e=>!(loading||otp.length!==6)&&LG.hoverOn(e.currentTarget)} onMouseLeave={e=>LG.hoverOff(e.currentTarget)} style={{ ...btnPrimary, opacity: (loading || otp.length !== 6) ? 0.6 : 1 }}>
            {loading ? "验证中..." : (lang === "zh" ? "登录" : "Login")}
          </button>
          <button onClick={() => { setStep(1); setOtp(""); setError(""); }} style={{ width: "100%", background: "transparent", border: "none", color: "#888", fontSize: 13, cursor: "pointer", marginTop: 8, fontFamily: "inherit" }}>
            ← 重新获取验证码
          </button>
        </>}

        <p style={{ textAlign: "center", fontSize: 13, color: "#888", marginTop: 20, marginBottom: 0 }}>
          还没有账号？
          <span onClick={onSwitchRegister} style={{ color: "#C8102E", fontWeight: 600, cursor: "pointer", marginLeft: 4 }}>立即注册</span>
        </p>
      </div>
    </ModalOverlay>
  );
}

// ═══════ 注册 Modal ═══════
const COUNTRY_CODES = [
  // 亚太
  { code: "+86",  flag: "🇨🇳", name: "中国 China" },
  { code: "+852", flag: "🇭🇰", name: "香港 Hong Kong" },
  { code: "+853", flag: "🇲🇴", name: "澳门 Macau" },
  { code: "+886", flag: "🇹🇼", name: "台湾 Taiwan" },
  { code: "+81",  flag: "🇯🇵", name: "日本 Japan" },
  { code: "+82",  flag: "🇰🇷", name: "韩国 Korea" },
  { code: "+65",  flag: "🇸🇬", name: "新加坡 Singapore" },
  { code: "+60",  flag: "🇲🇾", name: "马来西亚 Malaysia" },
  { code: "+66",  flag: "🇹🇭", name: "泰国 Thailand" },
  { code: "+84",  flag: "🇻🇳", name: "越南 Vietnam" },
  { code: "+62",  flag: "🇮🇩", name: "印尼 Indonesia" },
  { code: "+63",  flag: "🇵🇭", name: "菲律宾 Philippines" },
  { code: "+95",  flag: "🇲🇲", name: "缅甸 Myanmar" },
  { code: "+855", flag: "🇰🇭", name: "柬埔寨 Cambodia" },
  { code: "+856", flag: "🇱🇦", name: "老挝 Laos" },
  { code: "+61",  flag: "🇦🇺", name: "澳大利亚 Australia" },
  { code: "+64",  flag: "🇳🇿", name: "新西兰 New Zealand" },
  { code: "+91",  flag: "🇮🇳", name: "印度 India" },
  { code: "+92",  flag: "🇵🇰", name: "巴基斯坦 Pakistan" },
  { code: "+880", flag: "🇧🇩", name: "孟加拉 Bangladesh" },
  { code: "+94",  flag: "🇱🇰", name: "斯里兰卡 Sri Lanka" },
  { code: "+977", flag: "🇳🇵", name: "尼泊尔 Nepal" },
  { code: "+93",  flag: "🇦🇫", name: "阿富汗 Afghanistan" },
  { code: "+98",  flag: "🇮🇷", name: "伊朗 Iran" },
  // 中东
  { code: "+971", flag: "🇦🇪", name: "阿联酋 UAE" },
  { code: "+966", flag: "🇸🇦", name: "沙特 Saudi Arabia" },
  { code: "+972", flag: "🇮🇱", name: "以色列 Israel" },
  { code: "+90",  flag: "🇹🇷", name: "土耳其 Turkey" },
  { code: "+962", flag: "🇯🇴", name: "约旦 Jordan" },
  { code: "+961", flag: "🇱🇧", name: "黎巴嫩 Lebanon" },
  { code: "+964", flag: "🇮🇶", name: "伊拉克 Iraq" },
  { code: "+965", flag: "🇰🇼", name: "科威特 Kuwait" },
  { code: "+974", flag: "🇶🇦", name: "卡塔尔 Qatar" },
  { code: "+973", flag: "🇧🇭", name: "巴林 Bahrain" },
  { code: "+968", flag: "🇴🇲", name: "阿曼 Oman" },
  // 欧洲
  { code: "+44",  flag: "🇬🇧", name: "英国 UK" },
  { code: "+49",  flag: "🇩🇪", name: "德国 Germany" },
  { code: "+33",  flag: "🇫🇷", name: "法国 France" },
  { code: "+39",  flag: "🇮🇹", name: "意大利 Italy" },
  { code: "+34",  flag: "🇪🇸", name: "西班牙 Spain" },
  { code: "+31",  flag: "🇳🇱", name: "荷兰 Netherlands" },
  { code: "+32",  flag: "🇧🇪", name: "比利时 Belgium" },
  { code: "+41",  flag: "🇨🇭", name: "瑞士 Switzerland" },
  { code: "+43",  flag: "🇦🇹", name: "奥地利 Austria" },
  { code: "+46",  flag: "🇸🇪", name: "瑞典 Sweden" },
  { code: "+47",  flag: "🇳🇴", name: "挪威 Norway" },
  { code: "+45",  flag: "🇩🇰", name: "丹麦 Denmark" },
  { code: "+358", flag: "🇫🇮", name: "芬兰 Finland" },
  { code: "+48",  flag: "🇵🇱", name: "波兰 Poland" },
  { code: "+420", flag: "🇨🇿", name: "捷克 Czech Rep." },
  { code: "+36",  flag: "🇭🇺", name: "匈牙利 Hungary" },
  { code: "+40",  flag: "🇷🇴", name: "罗马尼亚 Romania" },
  { code: "+30",  flag: "🇬🇷", name: "希腊 Greece" },
  { code: "+351", flag: "🇵🇹", name: "葡萄牙 Portugal" },
  { code: "+353", flag: "🇮🇪", name: "爱尔兰 Ireland" },
  { code: "+7",   flag: "🇷🇺", name: "俄罗斯 Russia" },
  { code: "+380", flag: "🇺🇦", name: "乌克兰 Ukraine" },
  // 北美
  { code: "+1",   flag: "🇺🇸", name: "美国 USA" },
  { code: "+1",   flag: "🇨🇦", name: "加拿大 Canada" },
  { code: "+52",  flag: "🇲🇽", name: "墨西哥 Mexico" },
  // 南美
  { code: "+55",  flag: "🇧🇷", name: "巴西 Brazil" },
  { code: "+54",  flag: "🇦🇷", name: "阿根廷 Argentina" },
  { code: "+56",  flag: "🇨🇱", name: "智利 Chile" },
  { code: "+57",  flag: "🇨🇴", name: "哥伦比亚 Colombia" },
  { code: "+51",  flag: "🇵🇪", name: "秘鲁 Peru" },
  // 非洲
  { code: "+27",  flag: "🇿🇦", name: "南非 South Africa" },
  { code: "+20",  flag: "🇪🇬", name: "埃及 Egypt" },
  { code: "+234", flag: "🇳🇬", name: "尼日利亚 Nigeria" },
  { code: "+254", flag: "🇰🇪", name: "肯尼亚 Kenya" },
  { code: "+212", flag: "🇲🇦", name: "摩洛哥 Morocco" },
  { code: "+216", flag: "🇹🇳", name: "突尼斯 Tunisia" },
  { code: "+custom", flag: "✏️", name: "自定义 Custom..." },
];

function RegisterModal({ lang, onClose, onSuccess, onSwitchLogin }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", dialCode: "+86", company: "", position: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const zh = lang === "zh";

  const submit = async () => {
    setError("");
    if (!form.name.trim()) { setError(zh ? "请填写姓名" : "Please enter your name"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError(zh ? "请输入正确的邮箱地址" : "Please enter a valid email address"); return; }
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 5) { setError(zh ? "请输入正确的手机号码" : "Please enter a valid phone number"); return; }
    if (!form.company.trim()) { setError(zh ? "请填写公司名称" : "Please enter your company name"); return; }

    setLoading(true);
    const dial = form.dialCode === "+custom" ? (form.customDial || "") : form.dialCode;
    const fullPhone = `${dial} ${form.phone.trim()}`;
    const userData = { name: form.name.trim(), email: form.email.trim(), phone: fullPhone, company: form.company.trim(), position: form.position.trim() };
    try {
      const res = await fetch("/api/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || (zh ? "注册失败，请重试" : "Registration failed, please try again")); setLoading(false); return; }
    } catch {
      // local preview mode, continue
    }

    const users = JSON.parse(localStorage.getItem("bsd_users") || "[]");
    if (users.find(u => u.email === userData.email)) { setError(zh ? "该邮箱已注册，请直接登录" : "This email is already registered, please login"); setLoading(false); return; }
    users.push(userData);
    localStorage.setItem("bsd_users", JSON.stringify(users));
    setLoading(false);
    setDone(true);
    setTimeout(() => onSuccess(userData), 2500);
  };

  const inputStyle = (err) => ({ width: "100%", border: `1.5px solid ${err ? "#C8102E" : "#eee"}`, borderRadius: 10, padding: "11px 14px", fontSize: 14, fontFamily: "inherit", outline: "none", color: "#333", background: "#fafafa", boxSizing: "border-box", transition: "border-color 0.2s" });
  const label = (text, required) => (
    <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>
      {text}{required && <span style={{ color: "#C8102E", marginLeft: 2 }}>*</span>}
    </label>
  );

  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ maxWidth: 520, width: "100%" }}>
        {/* 头部 */}
        <div style={{ background: "linear-gradient(135deg,#9B0023,#C8102E)", padding: "24px 28px 20px" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 18, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 28, height: 28, color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          <h2 style={{ color: "#fff", margin: 0, fontSize: 20, fontWeight: 800 }}>{lang === "zh" ? "注册账号" : "Create Account"}</h2>
          <p style={{ color: "rgba(255,255,255,0.8)", margin: "4px 0 0", fontSize: 13 }}>{lang === "zh" ? "加入博仕达生物，获取专属服务" : "Join Booster Bio for exclusive services"}</p>
        </div>

        <div style={{ padding: "24px 28px 28px" }}>
          {done ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
              <h3 style={{ color: "#C8102E", margin: "0 0 8px", fontSize: 20 }}>{zh ? "注册成功！" : "Registration Successful!"}</h3>
              <p style={{ color: "#666", fontSize: 14, margin: 0 }}>{zh ? "欢迎加入博仕达生物，正在为您登录..." : "Welcome to Booster Bio, logging you in..."}</p>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  {label(zh ? "姓名" : "Full Name", true)}
                  <input value={form.name} onChange={e => set("name", e.target.value)}
                    onFocus={e => e.target.style.borderColor = "#C8102E"} onBlur={e => e.target.style.borderColor = "#eee"}
                    placeholder={zh ? "请输入真实姓名" : "Your full name"} style={inputStyle()} />
                </div>
                <div>
                  {label(zh ? "职位" : "Job Title")}
                  <input value={form.position} onChange={e => set("position", e.target.value)}
                    onFocus={e => e.target.style.borderColor = "#C8102E"} onBlur={e => e.target.style.borderColor = "#eee"}
                    placeholder={zh ? "如：采购经理（选填）" : "e.g. Procurement Manager (optional)"} style={inputStyle()} />
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                {label(zh ? "公司名称" : "Company / Institution", true)}
                <input value={form.company} onChange={e => set("company", e.target.value)}
                  onFocus={e => e.target.style.borderColor = "#C8102E"} onBlur={e => e.target.style.borderColor = "#eee"}
                  placeholder={zh ? "请输入公司/机构全称" : "Full company or institution name"} style={inputStyle()} />
              </div>

              <div style={{ marginTop: 14 }}>
                {label(zh ? "邮箱地址" : "Email Address", true)}
                <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                  onFocus={e => e.target.style.borderColor = "#C8102E"} onBlur={e => e.target.style.borderColor = "#eee"}
                  placeholder={zh ? "用于登录和接收通知" : "Used for login and notifications"} style={inputStyle()} />
              </div>

              <div style={{ marginTop: 14 }}>
                {label(zh ? "手机号码" : "Mobile Number", true)}
                <div style={{ display: "flex", gap: 8 }}>
                  <select value={form.dialCode} onChange={e => set("dialCode", e.target.value)}
                    style={{ border: "1.5px solid #eee", borderRadius: 10, padding: "11px 8px", fontSize: 13, fontFamily: "inherit", outline: "none", color: "#333", background: "#fafafa", cursor: "pointer", flexShrink: 0, width: 160 }}>
                    {COUNTRY_CODES.map((c, i) => (
                      <option key={i} value={c.code}>{c.flag} {c.code !== "+custom" ? c.code : ""} {c.name}</option>
                    ))}
                  </select>
                  {form.dialCode === "+custom" && (
                    <input value={form.customDial || ""} onChange={e => set("customDial", e.target.value.replace(/[^\d+]/g, ""))}
                      placeholder="+xxx"
                      style={{ border: "1.5px solid #C8102E", borderRadius: 10, padding: "11px 10px", fontSize: 14, fontFamily: "inherit", outline: "none", color: "#333", background: "#fafafa", width: 72, flexShrink: 0 }} />
                  )}
                  <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value.replace(/[^\d\s\-]/g, ""))}
                    onFocus={e => e.target.style.borderColor = "#C8102E"} onBlur={e => e.target.style.borderColor = "#eee"}
                    placeholder={zh ? "请输入手机号码" : "Phone number"} style={{ ...inputStyle(), flex: 1 }} />
                </div>
              </div>

              {error && <p style={{ color: "#C8102E", fontSize: 13, margin: "12px 0 0", padding: "8px 12px", background: "#FFF5F7", borderRadius: 8 }}>⚠ {error}</p>}

              <button onClick={submit} disabled={loading} className="lg-btn"
                onMouseEnter={e=>!loading&&LG.hoverOn(e.currentTarget)} onMouseLeave={e=>LG.hoverOff(e.currentTarget)}
                style={{ ...LG.primary, width: "100%", borderRadius: 12, padding: "13px", fontSize: 15, fontFamily: "inherit", marginTop: 18, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
                {loading ? (zh ? "提交中..." : "Submitting...") : (zh ? "立即注册" : "Create Account")}
              </button>

              <p style={{ textAlign: "center", fontSize: 13, color: "#888", marginTop: 16, marginBottom: 0 }}>
                {zh ? "已有账号？" : "Already have an account? "}
                <span onClick={onSwitchLogin} style={{ color: "#C8102E", fontWeight: 600, cursor: "pointer", marginLeft: 4 }}>
                  {zh ? "直接登录" : "Login"}
                </span>
              </p>
            </>
          )}
        </div>
      </div>
    </ModalOverlay>
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


function HeroSection({ lang, onBrowse, onSearch }) {
  const [q, setQ] = useState("");
  const doSearch = () => { if (q.trim()) onSearch(q.trim()); };
  return (
    <div style={{ background: "transparent", position: "relative", overflow: "hidden", minHeight: 580, display: "flex", alignItems: "center" }}>
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
            <button onClick={onBrowse} className="lg-btn"
              onMouseEnter={e => LG.hoverOn(e.currentTarget)} onMouseLeave={e => LG.hoverOff(e.currentTarget)}
              style={{ ...LG.primary, borderRadius: 16, padding: "14px 28px", fontSize: 15, fontFamily: T.font, display: "flex", alignItems: "center", gap: 8 }}>
              {lang === "zh" ? "浏览产品目录" : "Browse Products"}
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>→</span>
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

        {/* ── 全宽搜索框 ── */}
        <div style={{ gridColumn: "1 / -1", marginTop: 40 }}>
          <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.88)", backdropFilter: "blur(24px) saturate(180%)", border: "1.5px solid rgba(200,16,46,0.18)", borderRadius: 20, padding: "6px 8px 6px 22px", boxShadow: "0 8px 40px rgba(200,16,46,0.12), inset 0 1px 0 rgba(255,255,255,0.9)", maxWidth: 720, margin: "0 auto" }}>
            <span style={{ fontSize: 18, opacity: 0.4, marginRight: 10, flexShrink: 0 }}>🔍</span>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === "Enter" && doSearch()}
              placeholder={lang === "zh" ? "搜索产品货号、名称、规格..." : "Search by SKU, name or specification..."}
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 16, fontFamily: T.font, color: "#333", padding: "10px 0" }}
            />
            <button onClick={doSearch} className="lg-btn"
              onMouseEnter={e => LG.hoverOn(e.currentTarget)} onMouseLeave={e => LG.hoverOff(e.currentTarget)}
              style={{ ...LG.primary, borderRadius: 14, padding: "11px 26px", fontSize: 15, fontFamily: T.font, whiteSpace: "nowrap", flexShrink: 0 }}>
              {lang === "zh" ? "搜索产品" : "Search"}
            </button>
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
                <div style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary, marginBottom: 4 }}>{tCat(lang, cat)}</div>
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
            <button key={i} onClick={() => setActiveSol(i)} className="lg-btn"
              onMouseEnter={e => LG.hoverOn(e.currentTarget)} onMouseLeave={e => LG.hoverOff(e.currentTarget)}
              style={{ ...(activeSol===i ? LG.primary : LG.ghost), borderRadius: 24, padding: "8px 20px", fontSize: 13, fontFamily: T.font, display: "flex", alignItems: "center", gap: 6 }}>
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
      <button onClick={handleSubmit} disabled={status === "sending"} className="lg-btn"
        onMouseEnter={e => status!=="sending" && LG.hoverOn(e.currentTarget)} onMouseLeave={e => LG.hoverOff(e.currentTarget)}
        style={{ ...LG.primary, borderRadius: 10, padding: "12px 28px", fontSize: 14, fontFamily: T.font, width: "100%", opacity: status === "sending" ? 0.6 : 1, cursor: status === "sending" ? "not-allowed" : "pointer" }}>
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
        <span style={{ fontSize: 15, fontWeight: 700, color: "#333", fontFamily: T.fontHead, letterSpacing: 0.2 }}>{lang === "zh" ? "上海市生物医药行业协会" : "Shanghai Biopharmaceutical Industry Assoc."}</span>
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
                <span style={{ fontSize: 14 }}>{meta.icon}</span><span style={{ flex: 1 }}>{tCat(lang, cat)}</span><span style={{ fontSize: 11, color: T.textSecondary }}>{count}</span>
              </div>
              {isA && subs.length > 1 && subs.map(([sub, sc]) => (
                <div key={sub} onClick={() => { setActiveSub(activeSub===sub?null:sub); setPage(0); }} style={{ padding: "5px 16px 5px 40px", fontSize: 12, cursor: "pointer", color: activeSub===sub ? T.red : T.textSecondary, fontWeight: activeSub===sub ? 600 : 400 }}>{tSub(lang, sub) || (lang === "zh" ? "其他" : "Other")} ({sc})</div>
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
                      <div><div style={{ fontWeight: 500, color: T.red, lineHeight: 1.3 }}>{tName(lang, p.name)||"—"}</div>{p.sub && <div style={{ fontSize: 11, color: T.textSecondary }}>{tSub(lang, p.sub)}</div>}</div>
                    </div>
                  </td>
                  <td style={tdS}><span style={{ fontSize: 11, background: T.redLight, padding: "2px 7px", borderRadius: 4, color: T.red }}>{tCat(lang, p.cat)}</span></td>
                  <td style={tdS}><span style={{ fontSize: 12, color: T.textSecondary }}>{tSpec(lang, p.spec)||"—"}</span></td>
                  <td style={tdS}><button onClick={e=>{e.stopPropagation();onViewDetail(p)}} className="lg-btn" onMouseEnter={e=>LG.hoverOn(e.currentTarget)} onMouseLeave={e=>LG.hoverOff(e.currentTarget)} style={{...LG.primary, borderRadius:6, padding:"4px 12px", fontSize:11, fontFamily:T.font}}>{lang==="zh"?"详情":"Details"}</button></td>
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
function PgBtn({ l, a, d, o }) {
  return <button onClick={d?undefined:o} className={a||d?"":"lg-btn"}
    onMouseEnter={e=>!d&&!a&&LG.hoverOn(e.currentTarget)} onMouseLeave={e=>LG.hoverOff(e.currentTarget)}
    style={{ ...(a?LG.primary:LG.ghost), minWidth:30, height:30, borderRadius:6, fontSize:12, fontFamily:T.font, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 6px", opacity:d?0.35:1, cursor:d?"default":"pointer" }}>{l}</button>;
}
function pgn(c, t) { const p = []; if(t<=7){for(let i=0;i<t;i++)p.push(i);return p;} p.push(0); if(c>3)p.push("..."); for(let i=Math.max(1,c-1);i<=Math.min(t-2,c+1);i++)p.push(i); if(c<t-4)p.push("..."); p.push(t-1); return p; }

// ═══════ 询价 Modal ═══════
function InquiryModal({ lang, product: p, onClose }) {
  const zh = lang === "zh";
  const [form, setForm] = useState({ name: "", email: "", phone: "", qty: "", note: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { alert(zh ? "请填写姓名" : "Please enter your name"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { alert(zh ? "请输入正确的邮箱" : "Invalid email"); return; }
    setStatus("sending");
    const productLine = `【产品询价】\n货号（SKU）：${p.sku}\n产品名称：${p.name || "—"}\n品牌：${p.brand || "—"}\n规格：${p.spec || "—"}\n分类：${p.cat || "—"}`;
    const qtyLine = form.qty ? `\n采购数量/需求：${form.qty}` : "";
    const noteLine = form.note ? `\n备注：${form.note}` : "";
    const message = productLine + qtyLine + noteLine;
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, company: form.phone || "—", message }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      // 本地预览模式 fallback — 直接打开 mailto
      const subject = encodeURIComponent(`【询价】${p.sku} ${p.name || ""}`);
      const body = encodeURIComponent(`${message}\n\n联系人：${form.name}\n邮箱：${form.email}${form.phone ? "\n电话：" + form.phone : ""}`);
      window.open(`mailto:service@tflabservice.com?subject=${subject}&body=${body}`);
      setStatus("success");
    }
  };

  const iStyle = { width: "100%", border: "1.5px solid #eee", borderRadius: 10, padding: "11px 14px", fontSize: 14, fontFamily: "inherit", outline: "none", color: "#333", background: "#fafafa", boxSizing: "border-box", transition: "border-color 0.2s" };
  const lbl = (text, req) => <label style={{ fontSize: 13, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>{text}{req && <span style={{ color: T.red, marginLeft: 2 }}>*</span>}</label>;

  return (
    <ModalOverlay onClose={onClose}>
      <div style={{ maxWidth: 500, width: "100%" }}>
        {/* 头部 */}
        <div style={{ background: "linear-gradient(135deg,#9B0023,#C8102E)", padding: "22px 28px 18px", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 14, right: 16, background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: 28, height: 28, color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          <h2 style={{ color: "#fff", margin: 0, fontSize: 19, fontWeight: 800 }}>📧 {zh ? "产品询价" : "Product Inquiry"}</h2>
          <p style={{ color: "rgba(255,255,255,0.8)", margin: "4px 0 0", fontSize: 12 }}>{zh ? "填写后我们将在 1 个工作日内与您联系" : "We'll respond within 1 business day"}</p>
        </div>

        <div style={{ padding: "20px 28px 26px" }}>
          {/* 产品信息（只读展示） */}
          <div style={{ background: "#FFF5F7", border: "1px solid rgba(200,16,46,0.12)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>🧪</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.red, marginBottom: 2 }}>{tName(lang, p.name) || p.sku}</div>
              <div style={{ fontSize: 12, color: "#888" }}>
                <code style={{ background: T.redLight, color: T.red, padding: "1px 6px", borderRadius: 3, fontWeight: 600, marginRight: 8 }}>{p.sku}</code>
                {p.brand && <span style={{ marginRight: 8 }}>{p.brand}</span>}
                {p.spec && <span>{tSpec(lang, p.spec)}</span>}
              </div>
            </div>
          </div>

          {status === "success" ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <h3 style={{ color: T.red, margin: "0 0 8px", fontSize: 18 }}>{zh ? "询价已发送！" : "Inquiry Sent!"}</h3>
              <p style={{ color: "#666", fontSize: 14, margin: "0 0 20px" }}>{zh ? "我们会在 1 个工作日内通过邮件回复您。" : "We'll reply to your email within 1 business day."}</p>
              <button onClick={onClose} className="lg-btn" onMouseEnter={e=>LG.hoverOn(e.currentTarget)} onMouseLeave={e=>LG.hoverOff(e.currentTarget)}
                style={{ ...LG.primary, borderRadius: 10, padding: "10px 28px", fontSize: 14, fontFamily: "inherit" }}>
                {zh ? "关闭" : "Close"}
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  {lbl(zh ? "姓名" : "Name", true)}
                  <input value={form.name} onChange={e => set("name", e.target.value)}
                    onFocus={e => e.target.style.borderColor = T.red} onBlur={e => e.target.style.borderColor = "#eee"}
                    placeholder={zh ? "请输入姓名" : "Your name"} style={iStyle} />
                </div>
                <div>
                  {lbl(zh ? "联系电话" : "Phone")}
                  <input value={form.phone} onChange={e => set("phone", e.target.value)}
                    onFocus={e => e.target.style.borderColor = T.red} onBlur={e => e.target.style.borderColor = "#eee"}
                    placeholder={zh ? "选填" : "Optional"} style={iStyle} />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                {lbl(zh ? "邮箱地址" : "Email", true)}
                <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                  onFocus={e => e.target.style.borderColor = T.red} onBlur={e => e.target.style.borderColor = "#eee"}
                  placeholder={zh ? "用于接收报价回复" : "We'll reply to this address"} style={iStyle} />
              </div>
              <div style={{ marginTop: 12 }}>
                {lbl(zh ? "采购数量 / 需求" : "Quantity / Requirements")}
                <input value={form.qty} onChange={e => set("qty", e.target.value)}
                  onFocus={e => e.target.style.borderColor = T.red} onBlur={e => e.target.style.borderColor = "#eee"}
                  placeholder={zh ? "如：100 盒，或描述具体需求" : "e.g. 100 boxes, or describe needs"} style={iStyle} />
              </div>
              <div style={{ marginTop: 12 }}>
                {lbl(zh ? "备注留言" : "Additional Notes")}
                <textarea value={form.note} onChange={e => set("note", e.target.value)}
                  onFocus={e => e.target.style.borderColor = T.red} onBlur={e => e.target.style.borderColor = "#eee"}
                  rows={3} placeholder={zh ? "其他要求或说明（选填）" : "Other requirements (optional)"}
                  style={{ ...iStyle, resize: "vertical" }} />
              </div>
              {status === "error" && <p style={{ color: T.red, fontSize: 13, margin: "10px 0 0", padding: "8px 12px", background: "#FFF5F7", borderRadius: 8 }}>❌ {zh ? "发送失败，请稍后重试或邮件联系 service@tflabservice.com" : "Send failed. Please email service@tflabservice.com"}</p>}
              <button onClick={handleSubmit} disabled={status === "sending"} className="lg-btn"
                onMouseEnter={e => status !== "sending" && LG.hoverOn(e.currentTarget)} onMouseLeave={e => LG.hoverOff(e.currentTarget)}
                style={{ ...LG.primary, width: "100%", borderRadius: 12, padding: "13px", fontSize: 15, fontFamily: "inherit", marginTop: 16, cursor: status === "sending" ? "not-allowed" : "pointer", opacity: status === "sending" ? 0.7 : 1 }}>
                {status === "sending" ? (zh ? "发送中..." : "Sending...") : (zh ? "提交询价" : "Submit Inquiry")}
              </button>
            </>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
}

// ═══════ PRODUCT DETAIL ═══════
function ProductDetailView({ product: p, lang, onBack, onViewDetail }) {
  const meta = CAT_META[p.cat]||{icon:"📦",color:"#F5F5F5"};
  const [tab, setTab] = useState(0);
  const [showInquiry, setShowInquiry] = useState(false);
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
              <span style={{ fontSize: 11, background: T.redLight, padding: "3px 8px", borderRadius: 4, color: T.red }}>{tCat(lang, p.cat)}</span>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: T.red, margin: "0 0 6px", lineHeight: 1.3 }}>{tName(lang, p.name)||p.sku}</h1>
            <div style={{ fontSize: 13, color: T.textSecondary, marginBottom: 18 }}>{lang==="zh"?"货号":"SKU"}: <code style={{ color: T.red, background: T.redLight, padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>{p.sku}</code></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px", marginBottom: 20, fontSize: 13 }}>
              {[[lang==="zh"?"品牌":"Brand",p.brand],[lang==="zh"?"规格":"Spec",tSpec(lang,p.spec)||"—"],[lang==="zh"?"分类":"Category",tCat(lang,p.cat)],[lang==="zh"?"子分类":"Sub",tSub(lang,p.sub)||"—"]].map(([k,v],i) => (
                <div key={i}><div style={{ fontSize: 11, fontWeight: 600, color: T.textSecondary, textTransform: "uppercase", marginBottom: 2 }}>{k}</div><div style={{ fontWeight: 500, color: T.red }}>{v}</div></div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowInquiry(true)} className="lg-btn" onMouseEnter={e=>LG.hoverOn(e.currentTarget)} onMouseLeave={e=>LG.hoverOff(e.currentTarget)} style={{...LG.primary, borderRadius:8, padding:"10px 22px", fontSize:13, fontFamily:T.font}}>📧 {lang==="zh"?"立即询价":"Quote"}</button>
              <button className="lg-btn" onMouseEnter={e=>LG.hoverOn(e.currentTarget)} onMouseLeave={e=>LG.hoverOff(e.currentTarget)} style={{...LG.ghost, borderRadius:8, padding:"10px 22px", fontSize:13, fontFamily:T.font}}>📄 {lang==="zh"?"产品说明书":"Datasheet"}</button>
            </div>
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", borderBottom: `1px solid ${T.border}` }}>
            {tabs.map((tb,i) => <div key={i} onClick={() => setTab(i)} style={{ padding: "12px 20px", fontSize: 13, fontWeight: tab===i?600:400, color: tab===i?T.red:T.textSecondary, borderBottom: tab===i?`2px solid ${T.red}`:"2px solid transparent", cursor: "pointer" }}>{tb}</div>)}
          </div>
          <div style={{ padding: "20px 28px", fontSize: 14, color: T.textSecondary, lineHeight: 1.8, minHeight: 100 }}>
            {tab===0 && <p>{p.brand} {tName(lang, p.name)}{lang==="zh"?"，":". "}{lang==="zh"?`适用于${p.cat}相关应用。`:`For ${tCat("en",p.cat)} applications.`}</p>}
            {tab===1 && <table style={{width:"100%",borderCollapse:"collapse",fontSize:14,color:T.red}}><tbody>{[[lang==="zh"?"货号":"SKU",p.sku],[lang==="zh"?"品牌":"Brand",p.brand],[lang==="zh"?"规格":"Spec",tSpec(lang,p.spec)||"—"],[lang==="zh"?"分类":"Cat",tCat(lang,p.cat)]].map(([k,v],i) => <tr key={i} style={{borderBottom:`1px solid ${T.border}`}}><td style={{padding:"8px 12px 8px 0",fontWeight:600,width:150,color:T.textSecondary}}>{k}</td><td style={{padding:"8px 0"}}>{v}</td></tr>)}</tbody></table>}
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
                <div style={{ fontSize: 12, fontWeight: 600, color: T.red, lineHeight: 1.3 }}>{tName(lang, r.name)||"—"}</div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>}

      {showInquiry && <InquiryModal lang={lang} product={p} onClose={() => setShowInquiry(false)} />}
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

  // ── Auth state ──
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("bsd_user") || "null"); } catch { return null; } });
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLoginSuccess = useCallback((u) => { localStorage.setItem("bsd_user", JSON.stringify(u)); setUser(u); setShowLogin(false); setShowRegister(false); }, []);
  const handleRegisterSuccess = useCallback((u) => { handleLoginSuccess(u); }, [handleLoginSuccess]);
  const handleLogout = useCallback(() => { localStorage.removeItem("bsd_user"); setUser(null); }, []);

  const go = useCallback((s) => { setSection(s); setDetailProduct(null); if(s!=="products"){ setProductCat(null); setSearch(""); } window.scrollTo?.({top:0,behavior:"smooth"}); }, []);
  const goProducts = useCallback((cat) => { setProductCat(cat||null); setSection("products"); setDetailProduct(null); window.scrollTo?.({top:0,behavior:"smooth"}); }, []);
  const goDetail = useCallback((p) => { setDetailProduct(p); setSection("products"); window.scrollTo?.({top:0,behavior:"smooth"}); }, []);

  return (
    <div style={{ fontFamily: T.font, color: T.red, WebkitFontSmoothing: "antialiased", minHeight: "100vh", background: "transparent", position: "relative" }}>
      {/* ── 全页固定视频背景 ── */}
      <video autoPlay muted loop playsInline style={{ position: "fixed", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: -2, pointerEvents: "none", transform: "scaleX(-1)" }}>
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>
      <div style={{ position: "fixed", inset: 0, background: "rgba(255,255,255,0.60)", zIndex: -1, pointerEvents: "none" }} />
      <style>{`
        * { box-sizing: border-box; margin: 0; }
        input::placeholder, textarea::placeholder { color: #E8A0AB; }
        button:hover { opacity: 0.92; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 3px; }
        @keyframes fadeSlide { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { from { transform: scale(1); opacity: 0.03; } to { transform: scale(1.1); opacity: 0.06; } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes lgShimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        .lg-btn { position:relative; overflow:hidden; }
        .lg-btn::after { content:""; position:absolute; inset:0; background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.18) 50%,transparent 60%); background-size:200% 100%; animation:lgShimmer 3.5s linear infinite; pointer-events:none; border-radius:inherit; }
      `}</style>
      <TopBar lang={lang} setLang={setLang} />
      <NavHeader lang={lang} section={section} setSection={go} user={user} onLogin={() => setShowLogin(true)} onRegister={() => setShowRegister(true)} onLogout={handleLogout} />

      {section === "home" && <>
        <HeroSection lang={lang} onBrowse={() => goProducts(null)} onSearch={(q) => { setSearch(q); go("products"); }} />
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

      {/* ── Auth Modals ── */}
      {showLogin && <LoginModal lang={lang} onClose={() => setShowLogin(false)} onSuccess={handleLoginSuccess} onSwitchRegister={() => { setShowLogin(false); setShowRegister(true); }} />}
      {showRegister && <RegisterModal lang={lang} onClose={() => setShowRegister(false)} onSuccess={handleRegisterSuccess} onSwitchLogin={() => { setShowRegister(false); setShowLogin(true); }} />}
    </div>
  );
}
