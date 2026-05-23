// Shared data + helpers for the workspace prototype

const TEAM = [
  { id: 'me',    name: 'You',          role: 'Design Lead',     hue: 218, initials: 'YO', isMe: true,
    avatarBg: '#1f2937', online: true },
  { id: 'maya',  name: 'Maya Okafor',   role: 'Senior Designer', hue: 16,  initials: 'MO',
    avatarBg: '#c2410c', online: true },
  { id: 'jonas', name: 'Jonas Lind',    role: 'Brand Designer',  hue: 142, initials: 'JL',
    avatarBg: '#15803d', online: false },
  { id: 'priya', name: 'Priya Shah',    role: 'Product Designer',hue: 280, initials: 'PS',
    avatarBg: '#6d28d9', online: true },
  { id: 'theo',  name: 'Theo Marchetti',role: 'Motion Designer', hue: 200, initials: 'TM',
    avatarBg: '#0e7490', online: true },
  { id: 'rin',   name: 'Rin Watanabe',  role: 'Illustrator',     hue: 340, initials: 'RW',
    avatarBg: '#be185d', online: false },
];

// Each "thumb" is a CSS gradient — we don't have real images, so we generate
// distinctive abstract previews per file kind. Titles use platform/project
// tags ("Aria iOS —", "Brand Refresh —") the way design teams actually name
// deliverables in shared folders.
const FILES = [
  { id: 'f1', title: 'Aria iOS — Onboarding Hero',          kind: 'PNG', size: '4.2 MB',
    owner: 'maya',  status: 'review',   comments: 7, unread: 3, mentionsMe: true,
    requestedBy: 'maya', version: 'v4', updated: '2h ago',
    thumb: 'linear-gradient(135deg, #f8d7c4 0%, #e8a98a 45%, #c47b6c 100%)',
    accent: 'hsl(18 60% 60%)' },
  { id: 'f2', title: 'Aria iOS — Notifications (Empty)',    kind: 'FIG', size: '12 MB',
    owner: 'me',    status: 'draft',    comments: 2, unread: 0,
    version: 'v1', updated: '14m ago',
    thumb: 'linear-gradient(160deg, #eef2f7 0%, #d8e1ee 60%, #b8c7df 100%)',
    accent: 'hsl(218 35% 60%)' },
  { id: 'f3', title: 'Aria iOS — Plan Selection',           kind: 'PNG', size: '2.1 MB',
    owner: 'priya', status: 'approved', comments: 12, unread: 0,
    version: 'v5', updated: 'Yesterday',
    thumb: 'linear-gradient(150deg, #e7dcf3 0%, #c8b3e3 50%, #9b7fc9 100%)',
    accent: 'hsl(270 35% 60%)' },
  { id: 'f4', title: 'Brand Refresh — Guidelines 2026',     kind: 'PDF', size: '8.7 MB',
    owner: 'jonas', status: 'final',    comments: 4, unread: 1, mentionsMe: true,
    version: 'v2', updated: '1d ago',
    thumb: 'linear-gradient(180deg, #d4e4d6 0%, #a8c8ac 60%, #7ba383 100%)',
    accent: 'hsl(140 25% 55%)' },
  { id: 'f5', title: 'Aria — Launch Reel · Title Card',     kind: 'MP4', size: '24 MB',
    owner: 'theo',  status: 'review',   comments: 9, unread: 2,
    requestedBy: 'theo', version: 'v2', updated: '3h ago',
    thumb: 'linear-gradient(45deg, #1a2435 0%, #2a3850 40%, #4a5d7e 100%)',
    accent: 'hsl(218 30% 35%)', dark: true },
  { id: 'f6', title: 'Brand Refresh — Botanical Pattern',   kind: 'AI',  size: '18 MB',
    owner: 'rin',   status: 'draft',    comments: 1, unread: 0,
    version: 'v1', updated: '5h ago',
    thumb: 'linear-gradient(135deg, #fde7ec 0%, #f6c2cf 55%, #e58fab 100%)',
    accent: 'hsl(340 50% 65%)' },
  { id: 'f7', title: 'Aria iOS — Privacy Settings v2',      kind: 'PNG', size: '3.6 MB',
    owner: 'me',    status: 'review',   comments: 5, unread: 4,
    version: 'v2', updated: '6h ago', urgent: true,
    thumb: 'linear-gradient(125deg, #f5e9d4 0%, #e8cfa3 55%, #c89e6c 100%)',
    accent: 'hsl(36 45% 60%)' },
  { id: 'f8', title: 'Aria.com — Spring Hero (Variant B)',  kind: 'PNG', size: '5.1 MB',
    owner: 'maya',  status: 'draft',    comments: 0, version: 'v1', updated: '30m ago',
    thumb: 'linear-gradient(115deg, #e6f0ee 0%, #b8d4cc 55%, #7fb0a3 100%)',
    accent: 'hsl(170 25% 55%)' },
  { id: 'f9', title: 'Aria iOS — Tab Bar Icons',            kind: 'SVG', size: '420 KB',
    owner: 'priya', status: 'review',   comments: 3, version: 'v4', updated: '1d ago',
    thumb: 'linear-gradient(135deg, #ecedf0 0%, #c4c8d4 55%, #8a92a8 100%)',
    accent: 'hsl(220 10% 55%)' },
  { id: 'f10', title: 'Editorial Q3 — Cover Study',         kind: 'PSD', size: '64 MB',
    owner: 'rin',   status: 'final',    comments: 6, version: 'v3', updated: '2d ago',
    thumb: 'linear-gradient(155deg, #f4e1c1 0%, #d9a978 55%, #a36c3f 100%)',
    accent: 'hsl(28 50% 50%)' },

  // Unclaimed work — owned by the shared "Design Team" pool until someone
  // picks it up. Surfaced in the pool card at the top of "Your team".
  { id: 'p1', title: 'Aria iOS — Search Results',           kind: 'FIG', size: '6.8 MB',
    owner: 'pool',  status: 'draft',    comments: 0, version: 'v1', updated: '1h ago',
    assignedBy: 'me',
    thumb: 'linear-gradient(150deg, #eef0f3 0%, #d6d9e0 60%, #b4b9c6 100%)',
    accent: 'hsl(222 12% 58%)' },
  { id: 'p2', title: 'Aria.com — Pricing Section',          kind: 'PNG', size: '3.2 MB',
    owner: 'pool',  status: 'draft',    comments: 0, version: 'v1', updated: '3h ago',
    assignedBy: 'maya',
    thumb: 'linear-gradient(135deg, #edeef1 0%, #d4d7dd 55%, #aeb3bf 100%)',
    accent: 'hsl(220 10% 56%)' },
  { id: 'p3', title: 'Brand Refresh — Icon Audit',          kind: 'PDF', size: '1.4 MB',
    owner: 'pool',  status: 'draft',    comments: 0, version: 'v1', updated: 'Yesterday',
    assignedBy: 'jonas',
    thumb: 'linear-gradient(160deg, #f0efed 0%, #dad8d3 58%, #bcb9b1 100%)',
    accent: 'hsl(40 8% 56%)' },
  { id: 'p4', title: 'Aria iOS — Error States',             kind: 'FIG', size: '9.1 MB',
    owner: 'pool',  status: 'review',   comments: 2, version: 'v2', updated: '4h ago',
    reviewer: 'maya',
    thumb: 'linear-gradient(145deg, #eceef2 0%, #d2d6de 55%, #aab0bd 100%)',
    accent: 'hsl(224 12% 56%)' },
];

// Shared queue pseudo-entity — lets pool work open in a person-style view
// and act as a drag-drop target like any teammate.
const POOL = {
  id: 'pool', name: 'Design Team', role: 'Shared queue',
  isPool: true, avatarBg: 'hsl(220 6% 64%)', initials: '◇', online: false,
};

// Comments live on a single "showcase" file (f1: Aria iOS — Onboarding Hero)
// for the preview screen. Phrasing mirrors how designers actually leave
// review notes — specific values, concrete suggestions, named alternatives.
const PIN_COMMENTS = [
  { id: 'c1', x: 24, y: 32, author: 'maya',  time: '2h',
    body: 'Vertical rhythm between the headline and the chip feels tight at this density — try -8 on the chip baseline?' },
  { id: 'c2', x: 68, y: 18, author: 'jonas', time: '1h',
    body: 'Crop is great. The warm tone could push a notch further — closer to #E8A47A so it sits with the new brand palette.' },
  { id: 'c3', x: 52, y: 72, author: 'priya', time: '34m',
    body: '“Get started” reads a bit generic for the hero. Try “Build your first space” or “Start your workspace”?' },
];

const VERSIONS = [
  { v: 'v4', label: 'Current', author: 'maya', time: 'Today, 14:02',
    note: 'Tightened headline-to-chip spacing, warmed gradient by ~8°, swapped CTA to “Start your workspace”.', current: true },
  { v: 'v3', author: 'maya', time: 'Yesterday, 18:40',
    note: 'Reworked hero — chip inline with headline, larger device-frame reveal area, removed secondary CTA.' },
  { v: 'v2', author: 'maya', time: 'Mon, 10:15',
    note: 'Second pass — added social-proof row, tested two CTAs (“Get started” vs “Try it free”).' },
  { v: 'v1', author: 'maya', time: 'Fri, 16:20',
    note: 'First pass — hero composition, single value prop, single CTA.' },
];

const STATUS_META = {
  draft:    { label: 'Draft',     dot: 'hsl(40 6% 60%)',  bg: 'rgba(0,0,0,.04)',         fg: 'rgba(0,0,0,.6)' },
  review:   { label: 'In review', dot: 'hsl(36 90% 55%)', bg: 'rgba(217,140,30,.10)',    fg: 'hsl(30 60% 38%)' },
  final:    { label: 'Final',     dot: 'hsl(218 70% 55%)',bg: 'rgba(59,108,245,.10)',    fg: 'hsl(218 70% 45%)' },
  approved: { label: 'Approved',  dot: 'hsl(150 55% 42%)',bg: 'rgba(38,150,90,.10)',     fg: 'hsl(150 55% 32%)' },
};

const KIND_META = {
  PNG: { color: '#3b6cf5' }, FIG: { color: '#a259ff' }, PDF: { color: '#e85d3c' },
  MP4: { color: '#1a1a1a' }, AI:  { color: '#ff9500' }, SVG: { color: '#34c759' },
  PSD: { color: '#0d8bd6' }, JPG: { color: '#3b6cf5' }, MOV: { color: '#1a1a1a' },
  KEY: { color: '#0d8bd6' }, ZIP: { color: '#7e7e7e' },
};

// Files in connected cloud storage — these aren't yet in the workspace.
// Search results & the file picker pull from here.
const CLOUD_FOLDERS = [
  { id: 'aria',     name: 'Aria — Mobile App',  count: 42 },
  { id: 'brand',    name: 'Brand Refresh',      count: 18 },
  { id: 'editorial',name: 'Editorial Q3',       count: 26 },
  { id: 'archive',  name: 'Archive 2024',       count: 184 },
  { id: 'shared',   name: 'Shared with team',   count: 67 },
];

const CLOUD_FILES = [
  { id: 'c1', title: 'Aria iOS — Profile Drawer',           kind: 'FIG', size: '8.4 MB',
    folder: 'Aria — Mobile App', updated: '32m ago', thumbArt: 'f2' },
  { id: 'c2', title: 'Aria iOS — Hero (Concept B)',         kind: 'PNG', size: '5.2 MB',
    folder: 'Aria — Mobile App', updated: '2h ago', thumbArt: 'f1' },
  { id: 'c3', title: 'Brand Refresh — Logo Lockup (Final)', kind: 'SVG', size: '120 KB',
    folder: 'Brand Refresh',     updated: 'Yesterday', thumbArt: 'f9' },
  { id: 'c4', title: 'Editorial Q3 — Cover Photoshoot',     kind: 'JPG', size: '14 MB',
    folder: 'Editorial Q3',      updated: '3d ago', thumbArt: 'f10' },
  { id: 'c5', title: 'Aria — Launch Reel (Alt Cut)',        kind: 'MOV', size: '38 MB',
    folder: 'Aria — Mobile App', updated: '5h ago', thumbArt: 'f5' },
  { id: 'c6', title: 'Brand Refresh — Type Specimen',       kind: 'PDF', size: '3.1 MB',
    folder: 'Brand Refresh',     updated: '1d ago', thumbArt: 'f4' },
  { id: 'c7', title: 'Brand Refresh — Pattern Library v2',  kind: 'AI',  size: '22 MB',
    folder: 'Brand Refresh',     updated: '4h ago', thumbArt: 'f6' },
  { id: 'c8', title: 'Aria iOS — Onboarding (Variant B)',   kind: 'FIG', size: '11 MB',
    folder: 'Aria — Mobile App', updated: '1h ago', thumbArt: 'f3' },
  { id: 'c9', title: 'Editorial Q3 — Spring Cover',         kind: 'PNG', size: '6.8 MB',
    folder: 'Editorial Q3',      updated: '6h ago', thumbArt: 'f8' },
  { id: 'c10', title: 'Aria iOS — Settings (Dark Mode)',    kind: 'PNG', size: '4.0 MB',
    folder: 'Aria — Mobile App', updated: '20m ago', thumbArt: 'f7' },
];

// Teams — groups of people work can be routed to. Assigning to a team
// load-balances onto the member with the lightest review queue.
const TEAMS = [
  { id: 'brand',     name: 'Brand Team', members: ['jonas', 'rin'],        color: 'hsl(140 30% 52%)' },
  { id: 'ios',       name: 'iOS Team',   members: ['maya', 'priya', 'me'], color: 'hsl(218 60% 58%)' },
  { id: 'marketing', name: 'Marketing',  members: ['maya', 'theo'],        color: 'hsl(28 70% 56%)' },
];

Object.assign(window, { TEAM, TEAMS, POOL, FILES, PIN_COMMENTS, VERSIONS, STATUS_META, KIND_META, CLOUD_FILES, CLOUD_FOLDERS });
