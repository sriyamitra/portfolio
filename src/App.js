import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import accenture from "./accenture.jpg";
import EY from "./EY.jpg";
import symbiosis from "./symbiosis.jpg";
import ts from "./ts.jpg";
import ucdavis from "./ucdavis.jpg";
import engg from "./engg.jpg";

/* ============================================================
   MUSIC-STREAMING PORTFOLIO — Sriya Mitra
   Dark streaming aesthetic · violet accent · interactive CDs
   ============================================================ */

const T = {
  bg: "#0d0d0f",
  fg: "#f0eef5",
  card: "#1a1a1f",
  cardFg: "#e8e5f0",
  primary: "#b347f5",
  secondary: "#252530",
  muted: "#2e2e3a",
  mutedFg: "#8a8a9a",
  border: "rgba(255,255,255,0.07)",
  radius: 12,
};

/* ---------------- seeded generative cover art ---------------- */
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function coverSVG(motif, seed) {
  const r = mulberry32(seed);
  const W = 400,
    H = 400;
  let inner = "";
  const gray = (a, l = 220) => `rgba(${l},${l},${l + 10},${a})`;
  if (motif === "bars") {
    // analytics histogram
    for (let i = 0; i < 26; i++) {
      const h = 40 + r() * 220 * Math.exp(-Math.pow((i - 9) / 7, 2)) + r() * 50;
      inner += `<rect x="${20 + i * 14}" y="${
        330 - h
      }" width="9" height="${h}" fill="${gray(0.55 + r() * 0.3)}" rx="2"/>`;
    }
    inner += `<path d="M 20 ${300 - r() * 60} ${Array.from(
      { length: 12 },
      (_, i) => `L ${20 + i * 33} ${290 - r() * 130}`
    ).join(" ")}" stroke="${gray(0.8)}" stroke-width="2.5" fill="none"/>`;
    inner += `<rect x="20" y="30" width="120" height="14" rx="4" fill="${gray(
      0.35
    )}"/><rect x="20" y="54" width="70" height="9" rx="3" fill="${gray(
      0.2
    )}"/>`;
  } else if (motif === "grid") {
    // glass facade panels
    for (let i = 0; i < 5; i++)
      for (let j = 0; j < 5; j++) {
        inner += `<rect x="${12 + i * 78}" y="${
          12 + j * 78
        }" width="70" height="70" fill="${gray(
          0.08 + r() * 0.35
        )}" stroke="${gray(0.3)}" stroke-width="1.5"/>`;
        if (r() > 0.6)
          inner += `<rect x="${20 + i * 78}" y="${22 + j * 78}" width="${
            20 + r() * 34
          }" height="7" rx="2" fill="${gray(0.5)}"/>`;
      }
  } else if (motif === "circuit") {
    // circuit traces
    for (let i = 0; i < 34; i++) {
      const x = r() * W,
        y = r() * H,
        dx = (r() > 0.5 ? 1 : -1) * (30 + r() * 90);
      inner += `<path d="M ${x} ${y} h ${dx} v ${
        (r() > 0.5 ? 1 : -1) * (20 + r() * 70)
      }" stroke="${gray(0.35 + r() * 0.3)}" stroke-width="2" fill="none"/>`;
      inner += `<circle cx="${x}" cy="${y}" r="${2.5 + r() * 3}" fill="${gray(
        0.7
      )}"/>`;
    }
  } else if (motif === "network") {
    // node graph
    const pts = Array.from({ length: 16 }, () => [
      30 + r() * 340,
      30 + r() * 340,
    ]);
    pts.forEach((p, i) =>
      pts.forEach((q, j) => {
        if (j > i && Math.hypot(p[0] - q[0], p[1] - q[1]) < 160)
          inner += `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${
            q[1]
          }" stroke="${gray(0.22)}" stroke-width="1.2"/>`;
      })
    );
    pts.forEach((p) => {
      inner += `<circle cx="${p[0]}" cy="${p[1]}" r="${
        3 + r() * 5
      }" fill="${gray(0.75)}"/>`;
    });
  } else if (motif === "dashboard") {
    // KPI dashboard tiles
    inner += `<rect x="18" y="18" width="230" height="150" rx="8" fill="${gray(
      0.1
    )}" stroke="${gray(0.25)}"/>`;
    inner += `<path d="M 34 140 ${Array.from(
      { length: 8 },
      (_, i) => `L ${34 + i * 27} ${130 - r() * 90}`
    ).join(" ")}" stroke="${gray(0.75)}" stroke-width="3" fill="none"/>`;
    inner += `<rect x="262" y="18" width="120" height="70" rx="8" fill="${gray(
      0.14
    )}"/><rect x="262" y="98" width="120" height="70" rx="8" fill="${gray(
      0.1
    )}"/>`;
    for (let i = 0; i < 8; i++)
      inner += `<rect x="${18 + i * 47}" y="${
        196 + r() * 10
      }" width="34" height="${60 + r() * 120}" rx="4" fill="${gray(
        0.2 + r() * 0.35
      )}"/>`;
  } else if (motif === "waves") {
    // forecast contours
    for (let k = 0; k < 9; k++) {
      let d = `M 0 ${60 + k * 38}`;
      for (let x = 0; x <= W; x += 20)
        d += ` L ${x} ${
          60 + k * 38 + Math.sin(x / 50 + k) * (10 + k * 3) + r() * 8
        }`;
      inner += `<path d="${d}" stroke="${gray(
        0.2 + k * 0.06
      )}" stroke-width="2" fill="none"/>`;
    }
  } else if (motif === "orbits") {
    // ML pipeline orbits
    for (let k = 0; k < 6; k++) {
      inner += `<ellipse cx="200" cy="200" rx="${50 + k * 28}" ry="${
        (50 + k * 28) * 0.45
      }" transform="rotate(${-20 + k * 8} 200 200)" stroke="${gray(
        0.3
      )}" stroke-width="1.5" fill="none"/>`;
      const a = r() * Math.PI * 2;
      inner += `<circle cx="${200 + Math.cos(a) * (50 + k * 28)}" cy="${
        200 + Math.sin(a) * (50 + k * 28) * 0.45
      }" r="5" fill="${gray(0.8)}"/>`;
    }
    inner += `<circle cx="200" cy="200" r="26" fill="${gray(0.6)}"/>`;
  } else if (motif === "glow") {
    // minimal bright disc
    inner += `<circle cx="200" cy="200" r="150" fill="rgba(255,255,255,0.55)"/><circle cx="200" cy="200" r="90" fill="rgba(255,255,255,0.5)"/>`;
  } else if (motif === "city") {
    // night skyline
    for (let i = 0; i < 14; i++) {
      const h = 80 + r() * 240,
        x = i * 29;
      inner += `<rect x="${x}" y="${
        H - h
      }" width="24" height="${h}" fill="${gray(0.12 + r() * 0.15)}"/>`;
      for (let w = 0; w < 14; w++)
        if (r() > 0.55)
          inner += `<rect x="${x + 3 + (w % 3) * 7}" y="${
            H - h + 8 + Math.floor(w / 3) * 16
          }" width="4" height="6" fill="${gray(0.7)}"/>`;
    }
  } else if (motif === "campus") {
    // arch / tree silhouettes
    inner += `<rect x="0" y="300" width="400" height="100" fill="${gray(
      0.15
    )}"/>`;
    for (let i = 0; i < 6; i++) {
      const x = 30 + i * 65;
      inner += `<circle cx="${x}" cy="${190 - r() * 40}" r="${
        34 + r() * 22
      }" fill="${gray(0.18 + r() * 0.14)}"/><rect x="${
        x - 4
      }" y="200" width="8" height="110" fill="${gray(0.3)}"/>`;
    }
  } else {
    // scatter fallback
    for (let i = 0; i < 60; i++)
      inner += `<circle cx="${r() * W}" cy="${r() * H}" r="${
        1 + r() * 4
      }" fill="${gray(0.4 + r() * 0.4)}"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#26262e"/><rect width="${W}" height="${H}" fill="url(#v)"/>${inner}<defs><radialGradient id="v" cx="35%" cy="30%" r="90%"><stop offset="0%" stop-color="rgba(120,120,140,0.35)"/><stop offset="100%" stop-color="rgba(10,10,14,0.5)"/></radialGradient></defs></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/* emoji layered over dimmed generative art — used for project albums */
function emojiCover(emoji, motif, seed) {
  const base = coverSVG(motif, seed);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <image href="${base}" width="400" height="400"/>
    <circle cx="200" cy="200" r="120" fill="rgba(13,13,15,0.45)"/>
    <text x="200" y="235" font-size="130" text-anchor="middle">${emoji}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/* ---------------- data ---------------- */
const ALBUMS = [
  {
    id: "accenture",
    type: "Experience",
    title: "Accenture",
    artist: "Analyst",
    year: "2023 – 2025",
    genre: "Strategy & Consulting",
    motif: "bars",
    seed: 11,
    skills: ["SQL", "Salesforce Marketing Cloud", "Power BI", "Segmentation"],
    description:
      "Owned audience segmentation and campaign analytics at scale for 100K+ users.",
    tracks: [
      {
        title:
          "Owned SQL-based audience segmentation across 4+ data sources for 40+ campaigns targeting 100K+ users",
        duration: "4:02",
      },
      {
        title:
          "Cut campaign time-to-launch from 4 weeks to 2 by standardizing segmentation and automating audience builds",
        duration: "3:28",
      },
      {
        title:
          "Built real-time Power BI dashboards tracking campaign KPIs for stakeholders",
        duration: "3:11",
      },
      {
        title:
          "Analyzed engagement and conversion metrics to surface trends and underperforming segments",
        duration: "2:54",
      },
      {
        title:
          "Mentored 10+ analysts globally and rolled out standardized workflow guidelines, reducing execution errors",
        duration: "3:45",
      },
    ],
  },
  {
    id: "ey",
    type: "Experience",
    title: "Ernst & Young",
    artist: "Consultant",
    year: "2022",
    genre: "Data Privacy & Governance",
    motif: "grid",
    seed: 23,
    skills: ["Competitive Analysis", "Data Quality", "Governance"],
    description:
      "Advised on data privacy platform selection and governance automation.",
    tracks: [
      {
        title:
          "Led competitive analysis across data privacy platforms, driving vendor selection for the client",
        duration: "3:37",
      },
      {
        title:
          "Performed data quality audits and mapped governance workflows to identify automation gaps",
        duration: "3:19",
      },
    ],
  },
  {
    id: "tcs",
    type: "Experience",
    title: "Tata Consultancy Services",
    artist: "Software Engineer",
    year: "2019 – 2021",
    genre: "Enterprise Integration",
    motif: "circuit",
    seed: 37,
    skills: ["SAP PI/PO", "CPI", "Dell Boomi", "ETL Automation"],
    description: "Built enterprise B2B data pipelines and kept them healthy.",
    tracks: [
      {
        title:
          "Built and owned 15+ enterprise B2B data pipelines enabling ETL automation across client systems",
        duration: "4:16",
      },
      {
        title:
          "Designed monitoring and alerting frameworks to proactively resolve data disruptions",
        duration: "3:02",
      },
    ],
  },
  {
    id: "roloscan",
    type: "Project",
    title: "RoloScan",
    artist: "Product Analyst",
    year: "2026",
    genre: "Agentic AI Networking App",
    motif: "dashboard",
    seed: 41,
    emoji: "\ud83d\uddc2\ufe0f",
    skills: ["Python", "Product Analytics", "Dashboards"],
    description: "Survey analytics that reshaped a product roadmap.",
    tracks: [
      {
        title:
          "Surfaced an unaddressed customer segment through Python-based survey analysis, reshaping the product roadmap",
        duration: "3:33",
      },
    ],
  },
  {
    id: "jobmatch",
    type: "Project",
    title: "JobMatch AI",
    artist: "ML Engineer",
    year: "2026",
    genre: "Job Recommendation System",
    motif: "orbits",
    seed: 53,
    emoji: "\ud83c\udfaf",
    skills: ["Kafka", "ML Ranking", "Vector Search (ChromaDB)"],
    description: "Streaming ingestion meets adaptive ranking.",
    tracks: [
      {
        title: "Architected a Kafka pipeline ingesting 50K+ job listings",
        duration: "3:58",
      },
      {
        title:
          "Designed a 3-stage ML ranking and adaptive personalization system",
        duration: "4:07",
      },
    ],
  },
  {
    id: "budget",
    type: "Project",
    title: "Marketing Budget Optimization",
    artist: "Data Analyst",
    year: "2025",
    genre: "Econometrics",
    motif: "network",
    seed: 61,
    emoji: "\ud83d\udcca",
    skills: ["R", "Regression", "Hypothesis Testing"],
    description: "Regression evidence behind a $20M reallocation.",
    tracks: [
      {
        title:
          "Built regression models on 3,600 observations to recommend reallocation of a $20M marketing budget",
        duration: "3:41",
      },
    ],
  },
  {
    id: "prevision",
    type: "Project",
    title: "Prevision 2023",
    artist: "Market Researcher",
    year: "2023",
    genre: "Telecom Market Forecasting",
    motif: "waves",
    seed: 71,
    emoji: "\ud83d\udce1",
    skills: ["Market Research", "Forecasting"],
    description: "Broadband research feeding industry growth projections.",
    tracks: [
      {
        title:
          "Conducted broadband market research informing growth projections for a telecom forecast report",
        duration: "3:14",
      },
    ],
  },
  {
    id: "ucdavis",
    type: "Education",
    title: "UC Davis",
    artist: "MS, Business Analytics",
    year: "2025 – 2026",
    genre: "GPA 3.9 / 4",
    motif: "campus",
    seed: 83,
    skills: ["Machine Learning", "Statistical Modeling", "Experimental Design"],
    description: "Graduate analytics at the University of California, Davis.",
    tracks: [
      { title: "Machine Learning", duration: "3:20" },
      { title: "Statistical Modeling", duration: "3:05" },
      { title: "Experimental Design", duration: "2:48" },
      { title: "Hypothesis Testing", duration: "2:56" },
      { title: "Predictive Analytics", duration: "3:12" },
    ],
  },
  {
    id: "symbiosis",
    type: "Education",
    title: "Symbiosis IDTM",
    artist: "MBA, Analytics & Finance",
    year: "2021 – 2023",
    genre: "GPA 8.36 / 10",
    motif: "glow",
    seed: 89,
    skills: ["Analytics", "Finance"],
    description: "Symbiosis Institute of Digital & Telecom Management.",
    tracks: [
      { title: "Ranked 3rd of 160", duration: "3:33" },
      { title: "Postgraduate Merit Scholar", duration: "3:03" },
    ],
  },
  {
    id: "gtu",
    type: "Education",
    title: "Gujarat Technological University",
    artist: "BE, Electronics & Communication Engineering",
    year: "2015 – 2019",
    genre: "GPA 7.88 / 10",
    motif: "city",
    seed: 97,
    skills: ["Electronics", "Communication Engineering"],
    description: "Undergraduate engineering foundation.",
    tracks: [
      {
        title: "BE, Electronics & Communication Engineering",
        duration: "4:00",
      },
    ],
  },
];

/* ============================================================
   PHOTOS — swap album covers here. For each album id, set:
     src: an image URL, an imported file, or a base64 data URI
     pos: where the image sits inside the disc, as "x% y%"
          ("50% 18%" = centered horizontally, near the top —
           lower the second number to move the image UP,
           raise it to move it DOWN; first number moves left/right)
     zoom: optional, 1 = normal. 1.2 zooms in 20%.
   Any album not listed here keeps its generated abstract art.
   ============================================================ */
const PHOTOS = {
  ucdavis: { src: ucdavis, pos: "100% 100%", zoom: 1 },
  accenture: { src: accenture, pos: "10% 99%", zoom: 1.75 },
  tcs: { src: ts, pos: "40% 15%" },
  ey: { src: EY, pos: "50% 20%", zoom: 1 },
  symbiosis: { src: symbiosis, pos: "50% 20%", zoom: 1 },
  gtu: { src: engg, pos: "100% 0%", zoom: 1 },
};

const COVERS = Object.fromEntries(
  ALBUMS.map((a) => [
    a.id,
    PHOTOS[a.id]?.src ||
      (a.emoji
        ? emojiCover(a.emoji, a.motif, a.seed)
        : coverSVG(a.motif, a.seed)),
  ])
);

/* ---------------- reduced motion hook ---------------- */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = (e) => setReduced(e.matches);
    mq.addEventListener?.("change", fn);
    return () => mq.removeEventListener?.("change", fn);
  }, []);
  return reduced;
}

/* ============================================================
   CD — reusable interactive disc
   - idle by default; hover = smooth spin-up; leave = ease out
   - click-drag left/right scratches the disc
   - `spinning` prop forces playback spin
   - respects prefers-reduced-motion
   ============================================================ */
function CD({
  image,
  size = 420,
  spinning = false,
  label,
  position,
  zoom,
  edit = false,
  onAdjust,
}) {
  position = position || "50% 18%";
  zoom = zoom || 1;
  const lastY = useRef(0);
  const [copied, setCopied] = useState(false);
  const reduced = usePrefersReducedMotion();
  const rotRef = useRef(null);
  const angle = useRef(0);
  const vel = useRef(0);
  const hovered = useRef(false);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const dragVel = useRef(0);
  const [cursor, setCursor] = useState("grab");

  useEffect(() => {
    let raf;
    const tick = () => {
      if (!dragging.current) {
        const target =
          !reduced && !edit && (hovered.current || spinning) ? 2.0 : 0;
        vel.current += (target - vel.current) * 0.045; // easing on start/stop
        if (Math.abs(vel.current) < 0.002 && target === 0) vel.current = 0;
        angle.current += vel.current;
      }
      if (rotRef.current)
        rotRef.current.style.transform = `rotate(${angle.current}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [spinning, reduced, edit]);

  const onPointerDown = (e) => {
    dragging.current = true;
    lastX.current = e.clientX;
    lastY.current = e.clientY;
    dragVel.current = 0;
    if (!edit) setCursor("grabbing");
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastX.current;
    const dy = e.clientY - lastY.current;
    lastX.current = e.clientX;
    lastY.current = e.clientY;
    if (edit) {
      // EDIT MODE: drag repositions the photo inside the disc
      onAdjust && onAdjust(dx, dy, 0, size);
      return;
    }
    const d = dx * 0.45; // DJ scratch: rotation follows the drag
    angle.current += d;
    dragVel.current = dragVel.current * 0.6 + d * 0.4;
  };
  const onWheel = (e) => {
    if (!edit) return;
    e.preventDefault();
    onAdjust && onAdjust(0, 0, e.deltaY, size); // scroll = zoom
  };
  const copyValues = (e) => {
    e.stopPropagation();
    const text = `pos: "${position}", zoom: ${zoom}`;
    try {
      navigator.clipboard.writeText(text);
    } catch (_) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    vel.current = reduced ? 0 : dragVel.current; // momentum handoff, then eases
    setCursor("grab");
  };

  const s = size;
  const layer = { position: "absolute", inset: 0, borderRadius: "50%" };
  return (
    <div
      role="img"
      aria-label={label || "Album disc"}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onWheel={onWheel}
      onPointerEnter={() => (hovered.current = true)}
      onPointerLeave={() => {
        hovered.current = false;
        endDrag();
      }}
      style={{
        width: s,
        height: s,
        position: "relative",
        borderRadius: "50%",
        cursor: edit ? "move" : cursor,
        touchAction: "none",
        userSelect: "none",
        flexShrink: 0,
        boxShadow: "0 24px 70px rgba(0,0,0,0.55), 0 6px 18px rgba(0,0,0,0.35)",
        outline: edit ? "2px dashed #b347f5" : "none",
        outlineOffset: 6,
      }}
    >
      {/* rotating group: disc body, photo, grooves, rings */}
      <div ref={rotRef} style={{ ...layer, willChange: "transform" }}>
        {/* glossy pastel disc body */}
        <div
          style={{
            ...layer,
            background:
              "radial-gradient(circle at 30% 26%, #ffffff 0%, #f6f3fa 22%, #e9e4f4 42%, #dcd8ec 62%, #d3d9ea 80%, #e4e2ee 100%)",
            boxShadow:
              "inset 0 0 40px rgba(255,255,255,0.75), inset 0 0 6px rgba(255,255,255,0.9)",
          }}
        />
        {/* photo — pastel wash, inset 8%, sits high */}
        <div
          style={{
            position: "absolute",
            inset: "8%",
            borderRadius: "50%",
            overflow: "hidden",
          }}
        >
          <img
            src={image}
            alt=""
            draggable={false}
            style={{
              width: "100%",
              height: "112%",
              objectFit: "cover",
              objectPosition: position,
              transform: `scale(${zoom})`,
              transformOrigin: "center",
              filter:
                "saturate(0.45) brightness(1.12) contrast(0.85) hue-rotate(-8deg)",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(160deg, rgba(214,222,246,0.28), rgba(238,228,248,0.22))",
              mixBlendMode: "screen",
            }}
          />
        </div>
        {/* fine concentric grooves */}
        <div
          style={{
            ...layer,
            background:
              "repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.10) 0px, rgba(255,255,255,0.10) 1px, transparent 1px, transparent 4px)",
            opacity: 0.5,
            mixBlendMode: "overlay",
          }}
        />
        {/* thin translucent inner ring at ~42% */}
        <div
          style={{
            position: "absolute",
            left: "29%",
            top: "29%",
            width: "42%",
            height: "42%",
            borderRadius: "50%",
            border: "1.5px solid rgba(255,255,255,0.55)",
            boxShadow: "0 0 8px rgba(255,255,255,0.25)",
          }}
        />
        {/* center hole ~20% */}
        <div
          style={{
            position: "absolute",
            left: "40%",
            top: "40%",
            width: "20%",
            height: "20%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 42% 38%, #ffffff 0%, #eeeaf6 35%, #dcd8ea 70%, #cfd3e4 100%)",
            border: "2px solid rgba(255,255,255,0.85)",
            boxShadow:
              "inset 0 2px 8px rgba(140,140,170,0.35), 0 1px 6px rgba(120,120,150,0.3)",
          }}
        />
      </div>
      {/* static diagonal glare, upper-left */}
      <div
        style={{
          ...layer,
          pointerEvents: "none",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.18) 22%, transparent 45%)",
          mixBlendMode: "screen",
        }}
      />
      <div
        style={{
          ...layer,
          pointerEvents: "none",
          boxShadow: "inset 0 0 30px rgba(255,255,255,0.28)",
        }}
      />
      {edit && (
        <button
          onClick={copyValues}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            left: "50%",
            top: "100%",
            transform: "translate(-50%, 12px)",
            background: "#1a1a1f",
            color: copied ? "#7ee787" : "#e8e5f0",
            border: "1px solid rgba(179,71,245,0.6)",
            borderRadius: 8,
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            padding: "6px 12px",
            cursor: "pointer",
            whiteSpace: "nowrap",
            zIndex: 5,
          }}
        >
          {copied
            ? "copied!"
            : `pos: "${position}" · zoom: ${zoom} · click to copy`}
        </button>
      )}
    </div>
  );
}

/* ---------------- small bits ---------------- */
const NAV = [
  { id: "home", label: "Home", icon: "M3 11.5 12 4l9 7.5M5.5 10v9h13v-9" },
  {
    id: "Experience",
    label: "Experience",
    icon: "M4 8h16v11H4zM9 8V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v2",
  },
  { id: "Project", label: "Projects", icon: "m9 7-5 5 5 5m6-10 5 5-5 5" },
  {
    id: "Education",
    label: "Education",
    icon: "m12 4 10 5-10 5L2 9l10-5Zm-6 8v4c0 1.5 2.7 3 6 3s6-1.5 6-3v-4",
  },
  {
    id: "about",
    label: "About",
    icon: "M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-7 9c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5",
  },
];

function Icon({ d, size = 18, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

function Chip({ children }) {
  return (
    <span
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 11,
        letterSpacing: 0.3,
        color: T.cardFg,
        background: T.muted,
        border: `1px solid ${T.border}`,
        padding: "4px 10px",
        borderRadius: 999,
      }}
    >
      {children}
    </span>
  );
}

/* ============================================================ */
export default function App() {
  const [section, setSection] = useState("home");
  const [editMode, setEditMode] = useState(false);
  const [tweaks, setTweaks] = useState({}); // live pos/zoom overrides per album id

  const parsePos = (str) => {
    const m = (str || "50% 18%").match(/([\d.]+)%\s+([\d.]+)%/);
    return m ? [parseFloat(m[1]), parseFloat(m[2])] : [50, 18];
  };
  const photoFor = (id) => {
    if (tweaks[id]) return tweaks[id];
    const base = PHOTOS[id] || {};
    const [x, y] = parsePos(base.pos);
    return { x, y, zoom: base.zoom || 1 };
  };
  const posStr = (id) => {
    const p = photoFor(id);
    return `${Math.round(p.x)}% ${Math.round(p.y)}%`;
  };
  const zoomVal = (id) => Math.round(photoFor(id).zoom * 100) / 100;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const adjustPhoto = (id) => (dx, dy, dWheel, discSize) => {
    setTweaks((t) => {
      const p = t[id] || photoFor(id);
      return {
        ...t,
        [id]: {
          x: clamp(p.x - (dx / discSize) * 130, 0, 100),
          y: clamp(p.y - (dy / discSize) * 130, 0, 100),
          zoom: clamp(p.zoom - dWheel * 0.0012, 1, 2.5),
        },
      };
    });
  };
  const [activeAlbum, setActiveAlbum] = useState(null); // album id or null
  const [nowPlaying, setNowPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const featured = ALBUMS[0];
  const open = activeAlbum ? ALBUMS.find((a) => a.id === activeAlbum) : null;
  const np = nowPlaying ? ALBUMS.find((a) => a.id === nowPlaying) : null;

  const play = useCallback((id) => {
    setNowPlaying(id);
    setIsPlaying(true);
  }, []);
  const step = (dir) => {
    const idx = np ? ALBUMS.findIndex((a) => a.id === np.id) : 0;
    const next = ALBUMS[(idx + dir + ALBUMS.length) % ALBUMS.length];
    setNowPlaying(next.id);
    setIsPlaying(true);
  };

  const visible = useMemo(() => {
    if (section === "home") return ALBUMS;
    return ALBUMS.filter((a) => a.type === section);
  }, [section]);

  const go = (id) => {
    setSection(id);
    setActiveAlbum(null);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        background: T.bg,
        color: T.fg,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&family=DM+Sans:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-thumb { background: ${T.muted}; border-radius: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        .card { transition: background .25s ease, transform .25s ease; }
        .card:hover { background: ${T.secondary} !important; transform: translateY(-3px); }
        .navbtn:hover { color: ${T.fg} !important; background: rgba(255,255,255,0.04) !important; }
        .trackrow:hover { background: rgba(255,255,255,0.05) !important; }
        .pill:hover { transform: scale(1.04); }
        .pill { transition: transform .15s ease; }
        button:focus-visible, [role="button"]:focus-visible { outline: 2px solid ${T.primary}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          .card, .pill { transition: none; }
          .card:hover { transform: none; }
        }
      `}</style>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* ---------------- sidebar ---------------- */}
        <aside
          style={{
            width: 250,
            flexShrink: 0,
            borderRight: `1px solid ${T.border}`,
            padding: "22px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            overflowY: "auto",
          }}
        >
          <div style={{ padding: "0 12px 4px" }}>
            <div
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                fontSize: 20,
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <span style={{ color: T.primary }}>♪</span> Portfolio
            </div>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                color: T.mutedFg,
                marginTop: 4,
              }}
            >
              Sriya Mitra · 2026
            </div>
          </div>
          <div style={{ height: 14 }} />
          {NAV.map((n) => {
            const active = section === n.id;
            return (
              <button
                key={n.id}
                className="navbtn"
                onClick={() => go(n.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  background: active ? "rgba(179,71,245,0.14)" : "transparent",
                  color: active ? T.primary : T.mutedFg,
                  border: "none",
                  borderRadius: 8,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14.5,
                  fontWeight: 500,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background .2s, color .2s",
                }}
              >
                <Icon d={n.icon} /> {n.label}
              </button>
            );
          })}
          <div style={{ height: 18 }} />
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10.5,
              letterSpacing: 2,
              color: T.mutedFg,
              padding: "0 12px 10px",
              textTransform: "uppercase",
            }}
          >
            Your Library
          </div>
          {ALBUMS.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                setActiveAlbum(a.id);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "7px 10px",
                background:
                  activeAlbum === a.id
                    ? "rgba(255,255,255,0.05)"
                    : "transparent",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                textAlign: "left",
                color: T.fg,
              }}
            >
              <img
                src={COVERS[a.id]}
                alt=""
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
              <span style={{ minWidth: 0 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 13.5,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {a.title}
                </span>
                <span
                  style={{ display: "block", fontSize: 11.5, color: T.mutedFg }}
                >
                  {a.type}
                </span>
              </span>
            </button>
          ))}
          <div style={{ flex: 1 }} />
          {/* EDIT PHOTO POSITIONS — uncomment this block to re-enable the visual editor
          <button onClick={() => setEditMode(m => !m)} style={{
            margin: "14px 8px 4px", padding: "10px 14px", borderRadius: 10,
            background: editMode ? "rgba(179,71,245,0.18)" : "transparent",
            border: `1px dashed ${editMode ? T.primary : T.border}`,
            color: editMode ? T.primary : T.mutedFg, cursor: "pointer",
            fontFamily: "'DM Mono', monospace", fontSize: 11.5, letterSpacing: 0.4,
            textAlign: "left",
          }}>
            {editMode ? "✕ Exit photo edit mode" : "✎ Edit photo positions"}
          </button>
          {editMode && (
            <div style={{ padding: "4px 12px 8px", fontSize: 11, lineHeight: 1.55, color: T.mutedFg, fontFamily: "'DM Sans', sans-serif" }}>
              Drag inside a disc to move its photo. Scroll on a disc to zoom.
              Click the badge under a disc to copy its values, then paste them
              into the PHOTOS block in the code to make them permanent.
            </div>
          )}
          */}
        </aside>

        {/* ---------------- main ---------------- */}
        <main style={{ flex: 1, overflowY: "auto", padding: "26px 30px 40px" }}>
          {open ? (
            /* ---------- album detail ---------- */
            <div>
              <button
                onClick={() => setActiveAlbum(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: T.mutedFg,
                  cursor: "pointer",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 12,
                  marginBottom: 22,
                  padding: 4,
                }}
              >
                ← Back
              </button>
              <div
                style={{
                  display: "flex",
                  gap: 44,
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                }}
              >
                <CD
                  image={COVERS[open.id]}
                  position={posStr(open.id)}
                  zoom={zoomVal(open.id)}
                  edit={editMode}
                  onAdjust={adjustPhoto(open.id)}
                  size={Math.min(420, window.innerWidth - 380)}
                  label={`${open.title} disc`}
                  spinning={isPlaying && nowPlaying === open.id}
                />
                <div style={{ flex: 1, minWidth: 320 }}>
                  <div
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 11,
                      letterSpacing: 2.5,
                      color: T.primary,
                      textTransform: "uppercase",
                    }}
                  >
                    {open.type} · {open.genre}
                  </div>
                  <h1
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 800,
                      fontSize: 44,
                      margin: "10px 0 6px",
                      lineHeight: 1.05,
                    }}
                  >
                    {open.title}
                  </h1>
                  <div
                    style={{ color: T.mutedFg, fontSize: 15, marginBottom: 14 }}
                  >
                    {open.artist} ·{" "}
                    <span
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 13,
                      }}
                    >
                      {open.year}
                    </span>
                  </div>
                  <p
                    style={{
                      color: T.cardFg,
                      fontSize: 14.5,
                      maxWidth: 560,
                      margin: "0 0 16px",
                    }}
                  >
                    {open.description}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      marginBottom: 22,
                    }}
                  >
                    {open.skills.map((s) => (
                      <Chip key={s}>{s}</Chip>
                    ))}
                  </div>
                  <button
                    className="pill"
                    onClick={() =>
                      nowPlaying === open.id && isPlaying
                        ? setIsPlaying(false)
                        : play(open.id)
                    }
                    style={{
                      background: T.primary,
                      color: "#fff",
                      border: "none",
                      borderRadius: 999,
                      padding: "12px 30px",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: 14.5,
                      cursor: "pointer",
                      marginBottom: 30,
                    }}
                  >
                    {nowPlaying === open.id && isPlaying
                      ? "❚❚ Pause"
                      : "▶ Play"}
                  </button>
                  {/* tracklist */}
                  <div style={{ borderTop: `1px solid ${T.border}` }}>
                    {open.tracks.map((t, i) => (
                      <div
                        key={i}
                        className="trackrow"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "34px 1fr 60px",
                          gap: 12,
                          alignItems: "center",
                          padding: "13px 10px",
                          borderBottom: `1px solid ${T.border}`,
                          borderRadius: 8,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 12.5,
                            color: T.mutedFg,
                          }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span style={{ fontSize: 14, color: T.cardFg }}>
                          {t.title}
                        </span>
                        <span
                          style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 12.5,
                            color: T.mutedFg,
                            textAlign: "right",
                          }}
                        >
                          {t.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : section === "about" ? (
            /* ---------- about ---------- */
            <div style={{ maxWidth: 640, paddingTop: 20 }}>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11,
                  letterSpacing: 2.5,
                  color: T.primary,
                  textTransform: "uppercase",
                }}
              >
                Artist Bio
              </div>
              <h1
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: 42,
                  margin: "12px 0 18px",
                }}
              >
                Sriya Mitra
              </h1>
              <p style={{ fontSize: 15.5, lineHeight: 1.7, color: T.cardFg }}>
                Analyst and builder working where marketing, data engineering,
                and product analytics meet. Six years across Accenture, EY, and
                TCS — from enterprise data pipelines to audience segmentation
                for 100K+ users — now completing an MS in Business Analytics at
                UC Davis.
              </p>
              <p style={{ fontSize: 15.5, lineHeight: 1.7, color: T.mutedFg }}>
                Every album in this library is a real role or project. Press
                play, spin a record, and browse the tracklists.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginTop: 18,
                }}
              >
                {[
                  "SQL",
                  "Python",
                  "R",
                  "Power BI",
                  "Kafka",
                  "Salesforce Marketing Cloud",
                  "ML",
                  "Forecasting",
                ].map((s) => (
                  <Chip key={s}>{s}</Chip>
                ))}
              </div>
            </div>
          ) : (
            /* ---------- home / filtered grids ---------- */
            <div>
              {section === "home" && (
                <div
                  style={{
                    borderRadius: 18,
                    padding: "34px 40px",
                    marginBottom: 38,
                    background:
                      "linear-gradient(115deg, #6d2bd9 0%, #8a35ea 45%, #b347f5 100%)",
                    display: "flex",
                    alignItems: "center",
                    gap: 40,
                    flexWrap: "wrap",
                    boxShadow: "0 20px 60px rgba(120,50,220,0.25)",
                  }}
                >
                  <CD
                    image={COVERS[featured.id]}
                    position={posStr(featured.id)}
                    zoom={zoomVal(featured.id)}
                    edit={editMode}
                    onAdjust={adjustPhoto(featured.id)}
                    size={230}
                    label="Featured: Accenture"
                    spinning={isPlaying && nowPlaying === featured.id}
                  />
                  <div style={{ minWidth: 260 }}>
                    <div
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 11,
                        letterSpacing: 3,
                        color: "rgba(255,255,255,0.75)",
                        textTransform: "uppercase",
                      }}
                    >
                      Currently Featured
                    </div>
                    <h1
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 800,
                        fontSize: 52,
                        margin: "8px 0 6px",
                        color: "#fff",
                        lineHeight: 1,
                      }}
                    >
                      {featured.title}
                    </h1>
                    <div
                      style={{
                        color: "rgba(255,255,255,0.85)",
                        fontSize: 15,
                        marginBottom: 22,
                      }}
                    >
                      {featured.artist} ·{" "}
                      <span
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 13.5,
                        }}
                      >
                        {featured.year}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <button
                        className="pill"
                        onClick={() => play(featured.id)}
                        style={{
                          background: "#fff",
                          color: "#5d1fb8",
                          border: "none",
                          borderRadius: 999,
                          padding: "12px 28px",
                          fontWeight: 700,
                          fontSize: 14.5,
                          cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        ▶ Play
                      </button>
                      <button
                        className="pill"
                        onClick={() => setActiveAlbum(featured.id)}
                        style={{
                          background: "rgba(255,255,255,0.14)",
                          color: "#fff",
                          border: "1px solid rgba(255,255,255,0.4)",
                          borderRadius: 999,
                          padding: "12px 26px",
                          fontWeight: 600,
                          fontSize: 14.5,
                          cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <h2
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 22,
                  margin: "0 0 20px",
                }}
              >
                {section === "home"
                  ? "Your Discography"
                  : `${section}${section === "Education" ? "" : "s"}`}
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(215px, 1fr))",
                  gap: 18,
                }}
              >
                {visible.map((a) => (
                  <div
                    key={a.id}
                    className="card"
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveAlbum(a.id)}
                    onKeyDown={(e) => e.key === "Enter" && setActiveAlbum(a.id)}
                    style={{
                      background: T.card,
                      borderRadius: 14,
                      padding: "22px 18px 20px",
                      border: `1px solid ${T.border}`,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    <CD
                      image={COVERS[a.id]}
                      position={posStr(a.id)}
                      zoom={zoomVal(a.id)}
                      edit={editMode}
                      onAdjust={adjustPhoto(a.id)}
                      size={172}
                      label={`${a.title} disc`}
                      spinning={isPlaying && nowPlaying === a.id}
                    />
                    <div style={{ width: "100%" }}>
                      <div
                        style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 700,
                          fontSize: 16.5,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {a.title}
                      </div>
                      <div
                        style={{ color: T.mutedFg, fontSize: 13, marginTop: 3 }}
                      >
                        {a.artist}
                      </div>
                      <div
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          color: T.mutedFg,
                          fontSize: 12,
                          marginTop: 5,
                        }}
                      >
                        {a.year}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ---------------- player bar ---------------- */}
      <footer
        style={{
          height: 82,
          flexShrink: 0,
          borderTop: `1px solid ${T.border}`,
          background: "#111114",
          display: "flex",
          alignItems: "center",
          padding: "0 22px",
          gap: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            width: 280,
            minWidth: 0,
          }}
        >
          {np ? (
            <>
              <img
                src={COVERS[np.id]}
                alt=""
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  objectFit: "cover",
                  animation: isPlaying ? "spin 6s linear infinite" : "none",
                  border: `2px solid ${T.muted}`,
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }
                @media (prefers-reduced-motion: reduce) { footer img { animation: none !important; } }`}</style>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {np.title}
                </div>
                <div style={{ fontSize: 12, color: T.mutedFg }}>
                  {np.artist}
                </div>
              </div>
            </>
          ) : (
            <span style={{ color: T.mutedFg, fontSize: 13.5 }}>
              Nothing playing
            </span>
          )}
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
          }}
        >
          <button
            onClick={() => step(-1)}
            aria-label="Previous"
            style={{
              background: "none",
              border: "none",
              color: T.mutedFg,
              cursor: "pointer",
            }}
          >
            <Icon d="M6 5v14M18 6l-9 6 9 6V6" size={20} />
          </button>
          <button
            className="pill"
            onClick={() => (np ? setIsPlaying((p) => !p) : play(featured.id))}
            aria-label={isPlaying ? "Pause" : "Play"}
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              background: T.primary,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: 15,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>
          <button
            onClick={() => step(1)}
            aria-label="Next"
            style={{
              background: "none",
              border: "none",
              color: T.mutedFg,
              cursor: "pointer",
            }}
          >
            <Icon d="M18 5v14M6 6l9 6-9 6V6" size={20} />
          </button>
        </div>
        <div
          style={{
            width: 280,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: T.mutedFg,
            }}
          >
            {np
              ? `${np.tracks.length} track${np.tracks.length > 1 ? "s" : ""}`
              : "—"}
          </span>
          <div
            style={{
              width: 90,
              height: 4,
              borderRadius: 2,
              background: T.muted,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: isPlaying ? "62%" : "0%",
                height: "100%",
                background: T.primary,
                transition: "width 1s ease",
              }}
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
