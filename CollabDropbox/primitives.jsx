// Shared primitives: Avatar, StatusPill, FileThumb, FileCard, Sidebar, Topbar

function Avatar({ user, size = 32, ring = false, stack }) {
  if (!user) return null;
  const fontSize = Math.max(10, Math.round(size * 0.36));
  return (
    <div
      title={user.name}
      style={{
        width: size, height: size, borderRadius: '50%',
        background: user.avatarBg, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize, fontWeight: 600, letterSpacing: '-.01em', flexShrink: 0,
        boxShadow: ring ? `0 0 0 2px var(--bg), 0 0 0 ${ring === true ? 3 : ring + 2}px var(--accent)` : 'none',
        marginLeft: stack ? -size * 0.3 : 0,
        position: 'relative', userSelect: 'none',
      }}
    >
      {user.initials}
      {user.online && (
        <span style={{
          position: 'absolute', right: 0, bottom: 0,
          width: size * 0.28, height: size * 0.28, borderRadius: '50%',
          background: 'hsl(150 55% 48%)',
          boxShadow: '0 0 0 2px var(--bg)',
        }} />
      )}
    </div>
  );
}

function StatusPill({ status, size = 'sm' }) {
  const m = STATUS_META[status];
  if (!m) return null;
  const pad = size === 'sm' ? '3px 8px 3px 7px' : '5px 10px 5px 9px';
  const fs = size === 'sm' ? 11 : 12;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: pad, borderRadius: 999, fontSize: fs, fontWeight: 500,
      background: m.bg, color: m.fg, lineHeight: 1,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot }} />
      {m.label}
    </span>
  );
}

function KindTag({ kind }) {
  const c = KIND_META[kind]?.color || '#999';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 6px', borderRadius: 4,
      fontSize: 10, fontWeight: 600, letterSpacing: '.04em',
      background: c, color: '#fff',
    }}>{kind}</span>
  );
}

// Realistic per-file preview. Uses the MockArt module to render a detailed
// scene matching the file's kind (mobile UI, brand spread, video keyframe...).
function FileThumb({ file, height = 140, decorative = true, rounded = 10 }) {
  return (
    <div style={{
      position: 'relative', width: '100%', height,
      borderRadius: rounded, overflow: 'hidden',
      background: file.thumb,
      boxShadow: 'inset 0 0 0 .5px rgba(0,0,0,.06)',
    }}>
      {decorative && <MockArt fileId={file.id} variant="thumb" />}
      <div style={{
        position: 'absolute', top: 10, left: 10,
        display: 'flex', gap: 6, alignItems: 'center',
      }}>
        <KindTag kind={file.kind} />
      </div>
      <div style={{
        position: 'absolute', bottom: 10, right: 10,
        padding: '3px 7px', borderRadius: 5,
        background: 'rgba(20,20,20,.55)', color: '#fff',
        fontSize: 10, fontWeight: 500, letterSpacing: '.02em',
        backdropFilter: 'blur(8px)',
      }}>{file.version}</div>
    </div>
  );
}

// Compact card used in personal-space grids and the dragging ghost.
function FileCard({ file, density = 'comfortable', onOpen, dragging, onDragStart, draggable = true, compact }) {
  const owner = TEAM.find(t => t.id === file.owner);
  const dense = density === 'compact';
  const thumbH = compact ? 96 : (dense ? 110 : 134);
  return (
    <div
      onClick={onOpen}
      onMouseDown={onDragStart}
      style={{
        position: 'relative',
        background: 'var(--surface)',
        border: '.5px solid var(--border)',
        borderRadius: 14,
        padding: dense ? 10 : 12,
        cursor: draggable ? 'grab' : 'pointer',
        transition: 'box-shadow .18s, transform .18s, border-color .18s',
        boxShadow: dragging
          ? '0 18px 50px -12px rgba(0,0,0,.25), 0 0 0 1px var(--accent)'
          : '0 1px 0 rgba(0,0,0,.02), 0 1px 2px rgba(0,0,0,.03)',
        transform: dragging ? 'scale(1.02) rotate(-1.5deg)' : 'none',
        opacity: dragging === 'placeholder' ? 0.35 : 1,
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        if (dragging) return;
        e.currentTarget.style.boxShadow = '0 4px 14px -4px rgba(0,0,0,.10), 0 1px 2px rgba(0,0,0,.05)';
        e.currentTarget.style.borderColor = 'var(--border-strong)';
      }}
      onMouseLeave={(e) => {
        if (dragging) return;
        e.currentTarget.style.boxShadow = '0 1px 0 rgba(0,0,0,.02), 0 1px 2px rgba(0,0,0,.03)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      <FileThumb file={file} height={thumbH} />
      <div style={{ padding: dense ? '10px 2px 2px' : '12px 2px 2px' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: 10, marginBottom: 6,
        }}>
          <div style={{
            fontSize: dense ? 13 : 14, fontWeight: 500, color: 'var(--fg)',
            letterSpacing: '-.01em', lineHeight: 1.25,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{file.title}</div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 8,
        }}>
          <StatusPill status={file.status} />
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 11, color: 'var(--fg-muted)',
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon name="comment" size={12} stroke={1.6} />
              {file.comments}
            </span>
            {!compact && <Avatar user={owner} size={18} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── GlobalNav ──────────────────────────────────────────────────────────────
// Top-level system bar — brand, search, and global account/notification
// actions. Sticky across every view. Page-contextual actions (e.g. Share)
// are passed in via the `right` slot.
//
// The brand column matches the sidebar width (220px) and extends the
// sidebar's right border upward, so the global nav reads on the same
// vertical grid as the page below.
function GlobalNav({ onOpenSearch, searchBtnRef, onUpload, onNewFile, right }) {
  return (
    <header style={{
      // Defined header band — 16px symmetric vertical padding around the
      // 44px search yields a 76px toolbar that reads as a system layer
      // distinct from page content.
      height: 76, flexShrink: 0,
      display: 'flex', alignItems: 'stretch',
      borderBottom: '.5px solid var(--border)',
      background: 'var(--bg)',
      position: 'relative', zIndex: 10,
    }}>
      {/* Brand column — same 220px as the sidebar below */}
      <div style={{
        width: 220, flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 14px',
        borderRight: '.5px solid var(--border)',
      }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7,
          background: 'var(--fg)', color: 'var(--bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, letterSpacing: '-.04em',
        }}>◆</div>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-.01em' }}>Kindred</div>
        <Icon name="chevron-d" size={14} style={{ marginLeft: 'auto', opacity: .4 }} />
      </div>

      {/* Main column — flex layout, left-aligned to the content grid.
          Search + Upload + New file form one workflow group at the page's
          left rail (matching the page title and card grid). System cluster
          (Share, bell, avatar) is pushed to the right edge with
          marginLeft: auto. Padding (32px) matches page content padding so
          the search starts on the same vertical line as the H1 below. */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center',
        padding: '0 32px',
        gap: 12,
        minWidth: 0,
      }}>
        {/* Workflow group — search is the dominant entry point; Upload
            and New file are the secondary actions tied to creation. */}
        <button ref={searchBtnRef} onClick={onOpenSearch} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          height: 44, padding: '0 14px', borderRadius: 12,
          background: 'rgba(15,17,21,.045)',
          border: '.5px solid var(--border)',
          color: 'var(--fg-muted)',
          fontSize: 13, cursor: 'text',
          width: 480, maxWidth: '46vw', minWidth: 240,
          boxShadow: '0 1px 2px rgba(0,0,0,.04), 0 1px 0 rgba(0,0,0,.02)',
          transition: 'background .12s, border-color .12s, box-shadow .15s',
          flexShrink: 1,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--surface)';
          e.currentTarget.style.borderColor = 'var(--border-strong)';
          e.currentTarget.style.boxShadow = '0 4px 12px -4px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(15,17,21,.045)';
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,.04), 0 1px 0 rgba(0,0,0,.02)';
        }}>
          <Icon name="search" size={15} />
          <span style={{ flex: 1, textAlign: 'left' }}>Search files, folders, people…</span>
          <kbd style={{
            fontSize: 10.5, padding: '1px 6px', borderRadius: 4,
            background: 'var(--bg)', border: '.5px solid var(--border)',
            fontFamily: 'inherit', color: 'var(--fg-muted)',
            letterSpacing: '.02em',
          }}>⌘K</kbd>
        </button>

        {/* Workflow actions — "New file" is the primary CTA (filled),
            "Upload" is the supporting secondary action. Order matches
            Dropbox: primary creation first, then upload. */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <NavPrimaryAction   icon="plus"   label="New file" onClick={onNewFile} />
          <NavSecondaryAction icon="upload" label="Upload"   onClick={onUpload} />
        </div>

        {/* System cluster — pushed to the right edge. marginLeft: auto
            absorbs all leftover space, giving the spec's wide gap before
            Share. */}
        <div style={{
          marginLeft: 'auto',
          display: 'flex', alignItems: 'center', gap: 8,
          flexShrink: 0,
        }}>
          {right}
          <button style={iconBtnStyle()}><Icon name="bell" size={16} /></button>
          <Avatar user={TEAM[0]} size={28} />
        </div>
      </div>
    </header>
  );
}

// Filled primary action — the dominant CTA in the GlobalNav. Used for
// "New file" so creation is the most actionable target in the toolbar.
function NavPrimaryAction({ icon, label, onClick }) {
  const [h, setH] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        height: 44, padding: '0 16px', borderRadius: 12,
        background: h ? '#0a0c10' : 'var(--fg)',
        color: 'var(--bg)',
        border: 0,
        fontSize: 13, fontWeight: 500, cursor: 'pointer',
        letterSpacing: '-.005em',
        transition: 'background .12s, box-shadow .15s, transform .08s',
        boxShadow: h
          ? '0 4px 12px -4px rgba(0,0,0,.18), 0 1px 2px rgba(0,0,0,.06)'
          : '0 1px 2px rgba(0,0,0,.06)',
      }}>
      <Icon name={icon} size={14} stroke={2} />
      {label}
    </button>
  );
}

// Quiet ghost button used inside GlobalNav. Same height as the search input
// so the workflow cluster sits on a single visual baseline.
function NavSecondaryAction({ icon, label, onClick }) {
  const [h, setH] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        height: 44, padding: '0 14px', borderRadius: 12,
        background: h ? 'var(--surface)' : 'var(--surface-2)',
        border: '.5px solid var(--border)',
        color: 'var(--fg)',
        fontSize: 13, fontWeight: 500, cursor: 'pointer',
        transition: 'background .12s, border-color .12s',
        borderColor: h ? 'var(--border-strong)' : 'var(--border)',
      }}>
      <Icon name={icon} size={14} stroke={1.7} />
      {label}
    </button>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────
// Brand and search now live in the GlobalNav above; the sidebar is purely
// for navigation, projects, and the storage card.
function Sidebar({ view, setView, density }) {
  const items = [
    { id: 'home',      icon: 'home',      label: 'Home' },
    { id: 'files',     icon: 'files',     label: 'All files' },
    { id: 'workspace', icon: 'workspace', label: 'Workspace' },
    { id: 'projects',  icon: 'projects',  label: 'Projects' },
    { id: 'shared',    icon: 'shared',    label: 'Shared' },
  ];
  const current =
    view === 'workspace' ? 'workspace' :
    view === 'personal'  ? 'workspace' :
    view === 'preview'   ? 'workspace' :
    view === 'share'     ? 'shared'    : 'workspace';

  return (
    <aside style={{
      width: 220, flexShrink: 0,
      borderRight: '.5px solid var(--border)',
      background: 'var(--bg)',
      padding: '20px 14px',
      display: 'flex', flexDirection: 'column', gap: 24,
    }}>
      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {items.map(it => {
          const active = current === it.id;
          return (
            <button key={it.id}
              onClick={() => {
                if (it.id === 'workspace') setView('workspace');
                else if (it.id === 'shared') setView('share');
                else setView('workspace');
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: density === 'compact' ? '6px 8px' : '8px 10px',
                borderRadius: 7, border: 0,
                background: active ? 'var(--surface-2)' : 'transparent',
                color: active ? 'var(--fg)' : 'var(--fg-muted)',
                fontSize: 13, fontWeight: active ? 500 : 400,
                cursor: 'pointer', transition: 'background .12s, color .12s',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--surface-2)'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon name={it.icon} size={16} stroke={1.5} />
              {it.label}
            </button>
          );
        })}
      </nav>

      {/* Projects */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{
          padding: '0 8px',
          fontSize: 10, fontWeight: 600, letterSpacing: '.06em',
          textTransform: 'uppercase', color: 'var(--fg-muted)',
          marginBottom: 4,
        }}>Active projects</div>
        {[
          { name: 'Aria — Mobile App',   color: 'hsl(18 60% 60%)', count: 24 },
          { name: 'Brand Refresh',       color: 'hsl(140 25% 55%)',count: 8 },
          { name: 'Editorial Q3',        color: 'hsl(28 50% 60%)', count: 14 },
        ].map(p => (
          <button key={p.name} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '6px 10px', borderRadius: 6, border: 0, background: 'transparent',
            color: 'var(--fg)', fontSize: 12, cursor: 'pointer', textAlign: 'left',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }} />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
            <span style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{p.count}</span>
          </button>
        ))}
      </div>

      {/* Storage card */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{
          padding: 12, borderRadius: 10,
          background: 'var(--surface-2)', border: '.5px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--fg)' }}>Storage</span>
            <span style={{ fontSize: 10, color: 'var(--fg-muted)' }}>62%</span>
          </div>
          <div style={{ height: 4, borderRadius: 999, background: 'var(--border)', overflow: 'hidden' }}>
            <div style={{ width: '62%', height: '100%', background: 'var(--accent)' }} />
          </div>
          <div style={{ marginTop: 8, fontSize: 10, color: 'var(--fg-muted)' }}>62 of 100 GB used</div>
        </div>
      </div>
    </aside>
  );
}

// ── Topbar ─────────────────────────────────────────────────────────────────
// Page-level secondary header. Carries the breadcrumb context only — global
// account/search actions live in GlobalNav. Slimmer height to keep the
// system → page hierarchy clear.
function Topbar({ crumbs = [], right }) {
  return (
    <header style={{
      // Compact crumb row — visually merges with page content (no border)
      // so the GlobalNav reads as the only "system band". Height + page
      // padding-top combine to give 32–40px between header and page title.
      height: 36, flexShrink: 0,
      display: 'flex', alignItems: 'center',
      padding: '0 32px',
      background: 'var(--bg-canvas)',
      gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <Icon name="chevron-r" size={12} style={{ opacity: .35 }} />}
            <span style={{
              fontSize: 13,
              fontWeight: i === crumbs.length - 1 ? 500 : 400,
              color: i === crumbs.length - 1 ? 'var(--fg)' : 'var(--fg-muted)',
              cursor: c.onClick ? 'pointer' : 'default',
            }}
            onClick={c.onClick}>
              {c.label}
            </span>
          </React.Fragment>
        ))}
      </div>
      {right && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {right}
        </div>
      )}
    </header>
  );
}

function iconBtnStyle(active) {
  return {
    width: 30, height: 30, borderRadius: 7, border: 0,
    background: active ? 'var(--surface-2)' : 'transparent',
    color: 'var(--fg-muted)', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background .12s, color .12s',
  };
}

Object.assign(window, { Avatar, StatusPill, KindTag, FileThumb, FileCard, Sidebar, Topbar, GlobalNav, iconBtnStyle });
