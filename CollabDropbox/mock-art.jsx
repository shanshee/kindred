// Realistic per-file mock artwork. Each file id maps to a detailed SVG scene
// that resembles its kind: mobile UI mockups, brand spreads, video keyframes,
// icon sheets, etc. Drawn at viewBox 400x300 and stretched to fit any size.
//
// Renders inside the colored gradient backdrop already on the file thumb.

function MockArt({ fileId, variant = 'thumb' }) {
  // variant: 'thumb' (small card), 'hero' (preview canvas / share hero)
  switch (fileId) {
    case 'f1': return <AriaHero variant={variant} />;
    case 'f2': return <SettingsEmpty variant={variant} />;
    case 'f3': return <OnboardingStep variant={variant} />;
    case 'f4': return <BrandGuidelines variant={variant} />;
    case 'f5': return <TitleSequence variant={variant} />;
    case 'f6': return <BotanicalPattern variant={variant} />;
    case 'f7': return <SettingsV2 variant={variant} />;
    case 'f8': return <MarketingHero variant={variant} />;
    case 'f9': return <IconSet variant={variant} />;
    case 'f10': return <EditorialCover variant={variant} />;
    case 'p1': return <PoolSearchResults variant={variant} />;
    case 'p2': return <PoolPricing variant={variant} />;
    case 'p3': return <PoolIconAudit variant={variant} />;
    case 'p4': return <PoolErrorState variant={variant} />;
    default: return null;
  }
}

const SVG = ({ children, style }) => (
  <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"
       style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', ...style }}>
    {children}
  </svg>
);

// ── f1 Aria — Hero Frame ──────────────────────────────────────────────────
// Marketing hero: warm gradient bg, big headline, eyebrow, CTA pill, soft shapes.
function AriaHero({ variant }) {
  return (
    <SVG>
      <defs>
        <linearGradient id="ah-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbe6d4" />
          <stop offset="1" stopColor="#d8927b" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#ah-bg)" />
      {/* abstract sun */}
      <circle cx="320" cy="80" r="60" fill="#fff" opacity=".5" />
      <circle cx="320" cy="80" r="42" fill="#f4b58e" opacity=".7" />
      {/* horizon stroke */}
      <path d="M0 220 Q200 180 400 220 V300 H0Z" fill="#a85e44" opacity=".25" />
      <path d="M0 245 Q180 215 400 250 V300 H0Z" fill="#7a3f2c" opacity=".30" />
      {/* eyebrow */}
      <rect x="28" y="38" width="46" height="6" rx="2" fill="#3b1e10" opacity=".55" />
      {/* headline lines */}
      <rect x="28" y="58"  width="220" height="14" rx="3" fill="#3b1e10" opacity=".85" />
      <rect x="28" y="78"  width="180" height="14" rx="3" fill="#3b1e10" opacity=".85" />
      <rect x="28" y="98"  width="140" height="14" rx="3" fill="#3b1e10" opacity=".85" />
      {/* sub */}
      <rect x="28" y="128" width="160" height="5" rx="2" fill="#3b1e10" opacity=".4" />
      <rect x="28" y="138" width="140" height="5" rx="2" fill="#3b1e10" opacity=".4" />
      {/* CTA pill */}
      <rect x="28" y="170" width="118" height="28" rx="14" fill="#3b1e10" opacity=".88" />
      <rect x="42" y="181" width="60" height="6" rx="2" fill="#fff" opacity=".95" />
      <circle cx="128" cy="184" r="3" fill="#fff" opacity=".95" />
    </SVG>
  );
}

// ── f2 Settings — Empty State ─────────────────────────────────────────────
// App settings screen; sidebar + form rows + empty illustration on the right.
function SettingsEmpty() {
  return (
    <SVG>
      <rect width="400" height="300" fill="#f3f5fa" />
      {/* window chrome */}
      <rect x="0" y="0" width="400" height="30" fill="#fff" />
      <circle cx="14" cy="15" r="4" fill="#ff5f57" />
      <circle cx="28" cy="15" r="4" fill="#febc2e" />
      <circle cx="42" cy="15" r="4" fill="#28c840" />
      {/* sidebar */}
      <rect x="0" y="30" width="100" height="270" fill="#fff" />
      {[0,1,2,3,4].map(i => (
        <g key={i}>
          <rect x="14" y={50 + i*30} width="14" height="14" rx="3" fill="#c5cad6" opacity={i===2?.9:.5} />
          <rect x="34" y={55 + i*30} width="50" height="5" rx="2" fill={i===2?"#1f2937":"#9aa0ad"} />
        </g>
      ))}
      {/* main */}
      <rect x="116" y="46" width="120" height="10" rx="3" fill="#1f2937" />
      <rect x="116" y="62" width="180" height="5" rx="2" fill="#9aa0ad" />
      {/* form rows */}
      {[0,1,2].map(i => (
        <g key={i}>
          <rect x="116" y={90 + i*44} width="268" height="36" rx="6" fill="#fff" />
          <rect x="128" y={102 + i*44} width="60" height="5" rx="2" fill="#1f2937" />
          <rect x="128" y={113 + i*44} width="120" height="4" rx="2" fill="#9aa0ad" />
          <rect x="350" y={104 + i*44} width="22" height="14" rx="7" fill={i===0?"#3b6cf5":"#c5cad6"} />
          <circle cx={i===0?366:357} cy={111 + i*44} r="5" fill="#fff" />
        </g>
      ))}
      {/* empty illustration card */}
      <rect x="116" y="232" width="268" height="52" rx="8" fill="#fff" />
      <circle cx="142" cy="258" r="14" fill="#e6ebf4" />
      <rect x="166" y="248" width="80" height="6" rx="2" fill="#1f2937" />
      <rect x="166" y="260" width="140" height="4" rx="2" fill="#9aa0ad" />
      <rect x="166" y="268" width="100" height="4" rx="2" fill="#9aa0ad" />
    </SVG>
  );
}

// ── f3 Onboarding — Step 02 ───────────────────────────────────────────────
// Phone mockup with onboarding card, progress dots, illustration.
function OnboardingStep() {
  return (
    <SVG>
      <defs>
        <linearGradient id="ob-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ddd0ee" />
          <stop offset="1" stopColor="#a78bcc" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#ob-bg)" />
      {/* floating dots */}
      <circle cx="60"  cy="60"  r="20" fill="#fff" opacity=".4" />
      <circle cx="340" cy="240" r="32" fill="#7a55ad" opacity=".3" />
      <circle cx="50"  cy="240" r="10" fill="#fff" opacity=".5" />
      {/* phone */}
      <g transform="translate(140 30)">
        <rect x="0" y="0" width="120" height="240" rx="20" fill="#1a1325" />
        <rect x="6" y="6" width="108" height="228" rx="14" fill="#f6f0fb" />
        {/* notch */}
        <rect x="48" y="10" width="24" height="6" rx="3" fill="#1a1325" />
        {/* illustration block */}
        <rect x="18" y="30" width="84" height="70" rx="10" fill="#cdb6e9" />
        <circle cx="42" cy="58" r="12" fill="#fff" />
        <path d="M30 95 Q60 70 90 95 Z" fill="#9270c2" />
        {/* title */}
        <rect x="18" y="116" width="76" height="8" rx="2" fill="#2a1c40" />
        <rect x="18" y="130" width="62" height="8" rx="2" fill="#2a1c40" />
        {/* body */}
        <rect x="18" y="148" width="84" height="3" rx="1" fill="#7d6f96" />
        <rect x="18" y="156" width="72" height="3" rx="1" fill="#7d6f96" />
        <rect x="18" y="164" width="80" height="3" rx="1" fill="#7d6f96" />
        {/* progress dots */}
        <circle cx="46" cy="184" r="3" fill="#7d6f96" opacity=".4" />
        <circle cx="60" cy="184" r="4" fill="#6a48a0" />
        <circle cx="74" cy="184" r="3" fill="#7d6f96" opacity=".4" />
        {/* CTA */}
        <rect x="18" y="200" width="84" height="22" rx="11" fill="#2a1c40" />
        <rect x="42" y="208" width="36" height="6" rx="2" fill="#fff" />
      </g>
    </SVG>
  );
}

// ── f4 Brand Guidelines ───────────────────────────────────────────────────
// PDF spread: cover-style layout, color palette, type sample.
function BrandGuidelines() {
  return (
    <SVG>
      <rect width="400" height="300" fill="#eaf0eb" />
      {/* two pages spread */}
      <rect x="20"  y="30" width="170" height="240" rx="3" fill="#fff" />
      <rect x="210" y="30" width="170" height="240" rx="3" fill="#fff" />
      {/* spine */}
      <rect x="198" y="30" width="4" height="240" fill="#000" opacity=".06" />
      {/* left page — cover */}
      <rect x="36"  y="50" width="22" height="22" rx="3" fill="#5e8460" />
      <rect x="36"  y="86"  width="118" height="14" rx="2" fill="#1f2a20" />
      <rect x="36"  y="106" width="86"  height="14" rx="2" fill="#1f2a20" />
      <rect x="36"  y="240" width="60"  height="4" rx="2" fill="#5e8460" />
      <rect x="36"  y="248" width="40"  height="4" rx="2" fill="#5e8460" opacity=".6" />
      {/* right page — palette + type */}
      <rect x="226" y="50" width="50"  height="6" rx="2" fill="#5e8460" />
      <rect x="226" y="62" width="100" height="4" rx="2" fill="#9aac9c" />
      {/* color swatches */}
      <g transform="translate(226 86)">
        {[
          { c: '#1f2a20' }, { c: '#5e8460' }, { c: '#a8c8ac' },
          { c: '#dde6dc' }, { c: '#f6c168' }, { c: '#c75a3c' },
        ].map((s, i) => (
          <g key={i} transform={`translate(${(i % 3) * 50} ${Math.floor(i/3) * 50})`}>
            <rect width="44" height="32" rx="4" fill={s.c} />
            <rect y="36" width="30" height="3" rx="1" fill="#1f2a20" />
            <rect y="42" width="20" height="3" rx="1" fill="#9aac9c" />
          </g>
        ))}
      </g>
      {/* type sample */}
      <text x="226" y="220" fontFamily="serif" fontSize="34" fontWeight="700" fill="#1f2a20">Aa</text>
      <rect x="270" y="210" width="80" height="4" rx="1" fill="#1f2a20" />
      <rect x="270" y="220" width="60" height="3" rx="1" fill="#9aac9c" />
      <rect x="270" y="228" width="70" height="3" rx="1" fill="#9aac9c" />
      <rect x="226" y="248" width="120" height="3" rx="1" fill="#9aac9c" />
      <rect x="226" y="256" width="100" height="3" rx="1" fill="#9aac9c" />
    </SVG>
  );
}

// ── f5 Title Sequence — MP4 ───────────────────────────────────────────────
// Cinematic dark frame with timecode, big condensed title, play overlay.
function TitleSequence() {
  return (
    <SVG>
      <defs>
        <linearGradient id="ts-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0e1628" />
          <stop offset="1" stopColor="#3a4a6c" />
        </linearGradient>
        <radialGradient id="ts-glow" cx="0.3" cy="0.5" r="0.6">
          <stop offset="0" stopColor="#6f8fc7" stopOpacity=".55" />
          <stop offset="1" stopColor="#6f8fc7" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill="url(#ts-bg)" />
      <rect width="400" height="300" fill="url(#ts-glow)" />
      {/* grid lines */}
      <line x1="0" y1="200" x2="400" y2="200" stroke="#fff" strokeOpacity=".06" />
      <line x1="0" y1="240" x2="400" y2="240" stroke="#fff" strokeOpacity=".06" />
      {/* title */}
      <text x="40" y="158" fontFamily="serif" fontSize="64" fontWeight="700"
            fill="#f4ead6" letterSpacing="-2">LOOP</text>
      <rect x="40" y="174" width="80" height="3" fill="#f4ead6" opacity=".7" />
      <text x="40" y="198" fontFamily="monospace" fontSize="9"
            fill="#f4ead6" opacity=".6" letterSpacing="2">A FILM IN MOTION · 02:14</text>
      {/* timecode strip */}
      <rect x="0" y="270" width="400" height="30" fill="#000" opacity=".5" />
      <rect x="0" y="270" width="180" height="2" fill="#f4ead6" />
      <text x="14" y="289" fontFamily="monospace" fontSize="9" fill="#f4ead6" opacity=".7">00:01:14</text>
      <text x="362" y="289" fontFamily="monospace" fontSize="9" fill="#f4ead6" opacity=".5">02:14</text>
      {/* play button */}
      <circle cx="340" cy="60" r="20" fill="#f4ead6" opacity=".9" />
      <path d="M334 51 L334 69 L350 60 Z" fill="#0e1628" />
    </SVG>
  );
}

// ── f6 Botanical Pattern ──────────────────────────────────────────────────
// Repeating leaves on a soft pink ground.
function BotanicalPattern() {
  const leaves = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 7; c++) {
      const x = 30 + c * 56 + (r % 2 ? 28 : 0);
      const y = 30 + r * 56;
      leaves.push(
        <g key={`${r}-${c}`} transform={`translate(${x} ${y}) rotate(${(r + c) * 18})`}>
          <path d="M0 -16 Q8 0 0 16 Q-8 0 0 -16Z" fill="#c25681" opacity=".7" />
          <path d="M0 -10 L0 10" stroke="#8e3a5c" strokeWidth="1" opacity=".6" />
        </g>
      );
    }
  }
  return (
    <SVG>
      <rect width="400" height="300" fill="#fbe2e9" />
      {leaves}
      {/* small floral accents */}
      {[[80,80],[260,140],[340,220],[120,220]].map(([x,y],i)=>(
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r="4" fill="#fff" />
          <circle r="2" fill="#e08bb0" />
        </g>
      ))}
    </SVG>
  );
}

// ── f7 Settings v2 ────────────────────────────────────────────────────────
// Warmer revisited settings: profile card + toggles + accent.
function SettingsV2() {
  return (
    <SVG>
      <rect width="400" height="300" fill="#faf2e2" />
      <rect x="30" y="30" width="340" height="240" rx="14" fill="#fff" />
      {/* profile header */}
      <circle cx="74" cy="76" r="22" fill="#d8a86a" />
      <rect x="74" y="98" width="2" height="0" />
      <rect x="106" y="62" width="120" height="9" rx="3" fill="#3b2a18" />
      <rect x="106" y="78" width="80"  height="5" rx="2" fill="#a08767" />
      {/* tabs */}
      <rect x="50" y="116" width="60" height="22" rx="11" fill="#3b2a18" />
      <rect x="62" y="124" width="36" height="6" rx="2" fill="#fff" />
      <rect x="120" y="116" width="60" height="22" rx="11" fill="#f1e6cf" />
      <rect x="132" y="124" width="36" height="6" rx="2" fill="#a08767" />
      {/* form rows */}
      {[0,1,2].map(i => (
        <g key={i}>
          <rect x="50" y={156 + i*32} width="300" height="24" rx="6" fill="#faf2e2" />
          <rect x="62" y={166 + i*32} width="80" height="5" rx="2" fill="#3b2a18" />
          <rect x="320" y={162 + i*32} width="22" height="12" rx="6" fill={i===1?"#d8a86a":"#cfc4ad"} />
          <circle cx={i===1?336:326} cy={168 + i*32} r="4" fill="#fff" />
        </g>
      ))}
    </SVG>
  );
}

// ── f8 Marketing Hero Variant ─────────────────────────────────────────────
// Editorial: image left, copy right.
function MarketingHero() {
  return (
    <SVG>
      <rect width="400" height="300" fill="#e8f0ed" />
      {/* image block */}
      <rect x="20" y="20" width="180" height="260" rx="6" fill="#7fb0a3" />
      <circle cx="110" cy="120" r="44" fill="#b6d6cc" />
      <path d="M40 230 Q110 195 180 230 V280 H40Z" fill="#5b8d80" />
      <circle cx="76" cy="64" r="6" fill="#fff" opacity=".7" />
      {/* copy column */}
      <rect x="220" y="40" width="32" height="6" rx="2" fill="#3a5e54" />
      <rect x="220" y="62"  width="160" height="11" rx="3" fill="#1f3a32" />
      <rect x="220" y="80"  width="140" height="11" rx="3" fill="#1f3a32" />
      <rect x="220" y="98"  width="100" height="11" rx="3" fill="#1f3a32" />
      <rect x="220" y="130" width="160" height="4" rx="2" fill="#5b8d80" />
      <rect x="220" y="140" width="140" height="4" rx="2" fill="#5b8d80" />
      <rect x="220" y="150" width="120" height="4" rx="2" fill="#5b8d80" />
      <rect x="220" y="160" width="150" height="4" rx="2" fill="#5b8d80" />
      <rect x="220" y="190" width="80"  height="26" rx="13" fill="#1f3a32" />
      <rect x="232" y="200" width="40"  height="6" rx="2" fill="#fff" />
      {/* footer meta */}
      <rect x="220" y="252" width="40" height="3" rx="1" fill="#5b8d80" />
      <rect x="220" y="260" width="80" height="3" rx="1" fill="#5b8d80" opacity=".7" />
    </SVG>
  );
}

// ── f9 Icon Set — Geometric ───────────────────────────────────────────────
// 4x3 grid of stroked icons on graph paper.
function IconSet() {
  const icons = [
    (g) => <g {...g}><rect x="-12" y="-12" width="24" height="24" rx="3" /></g>,
    (g) => <g {...g}><circle r="14" /></g>,
    (g) => <g {...g}><path d="M-12 12 L0 -12 L12 12 Z" /></g>,
    (g) => <g {...g}><path d="M-12 0 L0 -12 L12 0 L0 12 Z" /></g>,
    (g) => <g {...g}><circle r="6" /><circle r="14" /></g>,
    (g) => <g {...g}><path d="M-12 -12 L12 12 M12 -12 L-12 12" /></g>,
    (g) => <g {...g}><path d="M-12 0 L12 0 M0 -12 L0 12" /></g>,
    (g) => <g {...g}><path d="M-12 8 Q0 -16 12 8" /></g>,
    (g) => <g {...g}><rect x="-12" y="-8" width="24" height="16" rx="2" /><circle r="3" /></g>,
    (g) => <g {...g}><path d="M-12 -8 L0 4 L12 -8 L0 -16 Z" /><path d="M-12 4 L0 16 L12 4" /></g>,
    (g) => <g {...g}><path d="M-12 0 A12 12 0 0 1 12 0" /><path d="M-6 0 A6 6 0 0 1 6 0" /></g>,
    (g) => <g {...g}><rect x="-10" y="-12" width="20" height="20" rx="2" /><path d="M-4 -2 L0 4 L8 -6" /></g>,
  ];
  return (
    <SVG>
      <rect width="400" height="300" fill="#f2f3f5" />
      {/* graph paper */}
      <g stroke="#d6d9df" strokeWidth=".5" opacity=".7">
        {Array.from({length: 14}).map((_,i)=> <line key={`h${i}`} x1="0" y1={i*22} x2="400" y2={i*22} />)}
        {Array.from({length: 19}).map((_,i)=> <line key={`v${i}`} x1={i*22} y1="0" x2={i*22} y2="300" />)}
      </g>
      {/* icons */}
      {icons.map((Ico, i) => {
        const col = i % 4, row = Math.floor(i / 4);
        const cx = 70 + col * 88;
        const cy = 70 + row * 80;
        return (
          <g key={i} transform={`translate(${cx} ${cy})`}>
            <Ico fill="none" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      })}
    </SVG>
  );
}

// ── f10 Editorial Cover Study ─────────────────────────────────────────────
// Magazine cover: hero photo block, masthead, cover lines.
function EditorialCover() {
  return (
    <SVG>
      <rect width="400" height="300" fill="#e8d4b1" />
      {/* photo area */}
      <rect x="40" y="30" width="320" height="180" fill="#a36c3f" />
      <circle cx="200" cy="120" r="56" fill="#d9a978" />
      <path d="M40 178 Q140 130 240 178 Q320 220 360 200 V210 H40 Z" fill="#7a4a25" />
      <circle cx="120" cy="78" r="8" fill="#f4e1c1" opacity=".7" />
      {/* masthead */}
      <text x="40" y="22" fontFamily="serif" fontSize="22" fontWeight="700"
            fill="#3a210d" letterSpacing="-1">VOLUME</text>
      <text x="180" y="22" fontFamily="serif" fontSize="22" fontWeight="400"
            fill="#3a210d" letterSpacing="-1">/ 04</text>
      <line x1="40" y1="26" x2="360" y2="26" stroke="#3a210d" strokeWidth=".5" />
      {/* cover lines */}
      <text x="40" y="240" fontFamily="serif" fontSize="20" fontWeight="700" fill="#3a210d">A Quieter</text>
      <text x="40" y="260" fontFamily="serif" fontSize="20" fontWeight="700" fill="#3a210d">Way of Working</text>
      <rect x="40" y="270" width="120" height="3" rx="1" fill="#3a210d" />
      <rect x="40" y="278" width="80"  height="3" rx="1" fill="#3a210d" opacity=".6" />
      {/* meta */}
      <rect x="280" y="240" width="80" height="3" rx="1" fill="#3a210d" />
      <rect x="280" y="248" width="60" height="3" rx="1" fill="#3a210d" opacity=".6" />
      <rect x="280" y="256" width="70" height="3" rx="1" fill="#3a210d" opacity=".6" />
    </SVG>
  );
}

// ── p1 Aria iOS — Search Results ──────────────────────────────────────────
// Mobile search screen: search field + a list of result rows.
function PoolSearchResults() {
  return (
    <SVG>
      <rect width="400" height="300" fill="#eef1f6" />
      <rect x="0" y="0" width="400" height="28" fill="#fff" />
      <rect x="150" y="13" width="100" height="5" rx="2" fill="#c5cad6" />
      {/* search field */}
      <rect x="22" y="42" width="356" height="36" rx="18" fill="#fff" />
      <circle cx="48" cy="60" r="7" fill="none" stroke="#3b6cf5" strokeWidth="3" />
      <line x1="53" y1="65" x2="60" y2="72" stroke="#3b6cf5" strokeWidth="3" strokeLinecap="round" />
      <rect x="70" y="56" width="110" height="7" rx="3" fill="#c5cad6" />
      {/* result rows */}
      {[0,1,2,3].map(i => (
        <g key={i}>
          <rect x="22" y={96 + i*49} width="46" height="38" rx="8" fill={i===0?"#d6e0f8":"#dde1e9"} />
          <rect x="82" y={104 + i*49} width={150 - i*14} height="7" rx="3" fill="#3a4150" />
          <rect x="82" y={119 + i*49} width={232 - i*22} height="5" rx="2" fill="#a7adba" />
          <rect x="340" y={110 + i*49} width="38" height="14" rx="7" fill={i===0?"#3b6cf5":"#e2e5ec"} />
        </g>
      ))}
    </SVG>
  );
}

// ── p2 Aria.com — Pricing Section ─────────────────────────────────────────
// Web pricing layout: centered heading + three plan columns.
function PoolPricing() {
  return (
    <SVG>
      <rect width="400" height="300" fill="#f7f8fa" />
      {/* heading */}
      <rect x="140" y="30" width="120" height="11" rx="4" fill="#2a3142" />
      <rect x="160" y="50" width="80" height="5" rx="2" fill="#a7adba" />
      {/* three plan columns */}
      {[0,1,2].map(i => {
        const x = 32 + i*120;
        const featured = i === 1;
        return (
          <g key={i}>
            <rect x={x} y={featured ? 78 : 90} width="108" height={featured ? 184 : 160}
                  rx="12" fill="#fff"
                  stroke={featured ? '#3b6cf5' : '#e4e7ee'} strokeWidth={featured ? 2 : 1} />
            <rect x={x+18} y={(featured?78:90)+18} width="44" height="6" rx="3" fill="#6b7280" />
            <rect x={x+18} y={(featured?78:90)+34} width="60" height="13" rx="3" fill="#2a3142" />
            {[0,1,2].map(j => (
              <g key={j}>
                <circle cx={x+24} cy={(featured?78:90)+66 + j*20} r="4"
                        fill={featured ? '#3b6cf5' : '#cbd0da'} />
                <rect x={x+34} y={(featured?78:90)+62 + j*20} width={56 - j*8} height="5" rx="2" fill="#a7adba" />
              </g>
            ))}
            <rect x={x+18} y={(featured?78:90)+(featured?150:126)} width="72" height="22" rx="11"
                  fill={featured ? '#3b6cf5' : '#eef0f4'} />
          </g>
        );
      })}
    </SVG>
  );
}

// ── p3 Brand Refresh — Icon Audit ─────────────────────────────────────────
// Audit sheet: header row + a grid of icon glyphs with status ticks.
function PoolIconAudit() {
  const glyphs = [
    (p) => <circle r="9" {...p} />,
    (p) => <rect x="-9" y="-9" width="18" height="18" rx="3" {...p} />,
    (p) => <path d="M-9 8 L0 -9 L9 8 Z" {...p} />,
    (p) => <path d="M-9 0 L0 -9 L9 0 L0 9 Z" {...p} />,
    (p) => <path d="M-9 -9 L9 9 M9 -9 L-9 9" {...p} />,
    (p) => <path d="M-9 0 A9 9 0 0 1 9 0" {...p} />,
    (p) => <path d="M-9 0 L9 0 M0 -9 L0 9" {...p} />,
    (p) => <path d="M-9 6 Q0 -12 9 6" {...p} />,
    (p) => <><circle r="4" {...p} /><circle r="9" {...p} /></>,
    (p) => <rect x="-8" y="-9" width="16" height="18" rx="2" {...p} />,
  ];
  return (
    <SVG>
      <rect width="400" height="300" fill="#faf9f7" />
      {/* header */}
      <rect x="28" y="28" width="120" height="9" rx="3" fill="#34302a" />
      <rect x="28" y="44" width="200" height="5" rx="2" fill="#b3aea4" />
      <line x1="28" y1="62" x2="372" y2="62" stroke="#e6e3dd" strokeWidth="1" />
      {/* icon grid */}
      {glyphs.map((G, i) => {
        const col = i % 5, row = Math.floor(i / 5);
        const cx = 60 + col*70, cy = 110 + row*78;
        const ok = i % 3 !== 2;
        return (
          <g key={i}>
            <rect x={cx-30} y={cy-30} width="60" height="60" rx="10" fill="#fff" stroke="#e6e3dd" strokeWidth="1" />
            <g transform={`translate(${cx} ${cy-4})`}>
              <G fill="none" stroke="#5b554c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <circle cx={cx} cy={cy+22} r="4" fill={ok ? '#3aa66f' : '#d98a3d'} />
          </g>
        );
      })}
    </SVG>
  );
}

// ── p4 Aria iOS — Error States ────────────────────────────────────────────
// Mobile screen with a centered error illustration, message, and retry CTA.
function PoolErrorState() {
  return (
    <SVG>
      <rect width="400" height="300" fill="#eef0f4" />
      <rect x="0" y="0" width="400" height="28" fill="#fff" />
      {/* error illustration */}
      <circle cx="200" cy="108" r="46" fill="#fdece6" />
      <circle cx="200" cy="108" r="30" fill="none" stroke="#e8896b" strokeWidth="4" />
      <line x1="200" y1="94" x2="200" y2="112" stroke="#e8896b" strokeWidth="5" strokeLinecap="round" />
      <circle cx="200" cy="123" r="3.2" fill="#e8896b" />
      {/* message */}
      <rect x="120" y="176" width="160" height="9" rx="4" fill="#2a3142" />
      <rect x="96" y="196" width="208" height="5" rx="2" fill="#a7adba" />
      <rect x="120" y="208" width="160" height="5" rx="2" fill="#a7adba" />
      {/* retry button */}
      <rect x="130" y="234" width="140" height="34" rx="17" fill="#3b6cf5" />
      <rect x="170" y="247" width="60" height="7" rx="3" fill="#fff" />
    </SVG>
  );
}

window.MockArt = MockArt;
