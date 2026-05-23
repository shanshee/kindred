// Cloud search + file picker modal + Browse Files entry tile

// ── Compact cloud thumb (uses MockArt with a different file id from FILES) ──
function CloudThumb({ file, height = 60, rounded = 8 }) {
  // Reuse FILES[].thumb gradients via the matching thumbArt id
  const sourceFile = FILES.find(f => f.id === file.thumbArt) || FILES[0];
  return (
    <div style={{
      position: 'relative', width: '100%', height,
      borderRadius: rounded, overflow: 'hidden',
      background: sourceFile.thumb,
      boxShadow: 'inset 0 0 0 .5px rgba(0,0,0,.06)',
      flexShrink: 0,
    }}>
      <MockArt fileId={file.thumbArt} variant="thumb" />
    </div>
  );
}

// ── Global search popover ──────────────────────────────────────────────────
// Anchored beneath the sidebar search button. Searches both workspace files
// AND connected cloud storage. Results group: workspace first, then cloud.
function SearchPopover({ open, onClose, anchorRect, onAddFromCloud, onAssignFromCloud, onOpenFile, onCloudDragStart }) {
  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else setQuery('');
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const q = query.trim().toLowerCase();
  const matchWorkspace = q
    ? FILES.filter(f => f.title.toLowerCase().includes(q) || f.kind.toLowerCase().includes(q))
    : FILES.slice(0, 3);
  const matchCloud = q
    ? CLOUD_FILES.filter(f => f.title.toLowerCase().includes(q) || f.folder.toLowerCase().includes(q) || f.kind.toLowerCase().includes(q))
    : CLOUD_FILES.slice(0, 4);

  const left = anchorRect ? anchorRect.left : 230;
  const top  = anchorRect ? anchorRect.bottom + 6 : 80;

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(15,17,21,.18)',
        backdropFilter: 'blur(2px)', zIndex: 950,
      }} />
      <div className="fade-in" style={{
        position: 'fixed', left, top, width: 480, zIndex: 951,
        background: 'var(--bg)', borderRadius: 14,
        border: '.5px solid var(--border)',
        boxShadow: '0 24px 60px -16px rgba(0,0,0,.25), 0 4px 12px rgba(0,0,0,.06)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column', maxHeight: '70vh',
      }}>
        {/* Input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 16px',
          borderBottom: '.5px solid var(--border)',
        }}>
          <Icon name="search" size={16} style={{ color: 'var(--fg-muted)' }} />
          <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files, folders, or people…"
            style={{
              flex: 1, border: 0, outline: 'none', background: 'transparent',
              fontSize: 14, color: 'var(--fg)', fontFamily: 'inherit',
            }} />
          <kbd style={{
            fontSize: 10, padding: '2px 6px', borderRadius: 4,
            background: 'var(--surface-2)', color: 'var(--fg-muted)',
          }}>esc</kbd>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '6px 0 8px' }}>
          {/* Workspace section */}
          {matchWorkspace.length > 0 && (
            <SearchSection title="In this workspace" count={matchWorkspace.length}>
              {matchWorkspace.map(f => (
                <SearchRow key={f.id} file={f} inWorkspace
                  onOpen={() => { onClose(); onOpenFile(f); }} />
              ))}
            </SearchSection>
          )}
          {/* Cloud section */}
          {matchCloud.length > 0 && (
            <SearchSection
              title="In your Dropbox"
              count={matchCloud.length}
              icon={<CloudIcon />}>
              {matchCloud.map(f => (
                <SearchRow key={f.id} file={f}
                  onAdd={() => onAddFromCloud(f)}
                  onAssign={() => onAssignFromCloud(f)}
                  onDragStart={(file, ev) => { onClose(); onCloudDragStart?.(file, ev); }} />
              ))}
            </SearchSection>
          )}
          {q && matchWorkspace.length === 0 && matchCloud.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--fg-muted)', fontSize: 13 }}>
              No files match "<strong style={{ color: 'var(--fg)' }}>{query}</strong>"
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '8px 14px',
          borderTop: '.5px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 16,
          fontSize: 11, color: 'var(--fg-muted)',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <KbdMini>↑↓</KbdMini> navigate
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <KbdMini>↵</KbdMini> open
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <KbdMini>⌘</KbdMini><KbdMini>↵</KbdMini> add to workspace
          </span>
          <span style={{ marginLeft: 'auto' }}>
            <CloudIcon /> Connected via Dropbox
          </span>
        </div>
      </div>
    </>
  );
}

const KbdMini = ({ children }) => (
  <kbd style={{
    fontSize: 10, padding: '0 4px', minWidth: 14, height: 14, lineHeight: '14px',
    display: 'inline-block', textAlign: 'center',
    borderRadius: 3, background: 'var(--surface-2)',
    border: '.5px solid var(--border)', color: 'var(--fg-muted)',
    fontFamily: 'inherit',
  }}>{children}</kbd>
);

const CloudIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
       style={{ display: 'inline-block', verticalAlign: '-2px', color: 'var(--fg-muted)' }}>
    <path d="M7 18a5 5 0 0 1-1-9.9A6 6 0 0 1 18 9a4 4 0 0 1 0 9z" />
  </svg>
);

function SearchSection({ title, count, icon, children }) {
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '10px 16px 6px',
        fontSize: 10, fontWeight: 600, letterSpacing: '.08em',
        textTransform: 'uppercase', color: 'var(--fg-muted)',
      }}>
        {icon}
        <span>{title}</span>
        {count != null && <span style={{ opacity: .6 }}>· {count}</span>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function SearchRow({ file, inWorkspace, onAdd, onAssign, onOpen, onDragStart }) {
  const [hover, setHover] = React.useState(false);
  const startDrag = (e) => {
    if (e.button !== 0 || inWorkspace) return;
    const sx = e.clientX, sy = e.clientY;
    let started = false;
    const move = (ev) => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (!started && (dx * dx + dy * dy) > 25) {
        started = true;
        onDragStart?.(file, ev);
      }
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseDown={startDrag}
      onClick={onOpen}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '8px 16px',
        cursor: inWorkspace ? (onOpen ? 'pointer' : 'default') : 'grab',
        background: hover ? 'var(--surface-2)' : 'transparent',
        transition: 'background .1s',
        userSelect: 'none',
      }}>
      <div style={{ width: 56, height: 40, flexShrink: 0 }}>
        <CloudThumb file={inWorkspace ? { thumbArt: file.id } : file} height={40} rounded={6} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 500, color: 'var(--fg)',
          letterSpacing: '-.005em', marginBottom: 3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{file.title}</div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 11, color: 'var(--fg-muted)',
        }}>
          <KindTag kind={file.kind} />
          <span>{inWorkspace ? `Workspace · ${TEAM.find(t => t.id === file.owner)?.name.split(' ')[0] || ''}` : file.folder}</span>
          <span>·</span>
          <span>{file.updated}</span>
        </div>
      </div>
      {hover && !inWorkspace && (
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={(e) => { e.stopPropagation(); onAssign(); }}
            style={miniGhostBtn}>Assign…</button>
          <button onClick={(e) => { e.stopPropagation(); onAdd(); }}
            style={miniSolidBtn}>
            <Icon name="plus" size={11} stroke={2.4} /> Add
          </button>
        </div>
      )}
      {hover && inWorkspace && (
        <div style={{ display: 'flex', gap: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--fg-muted)', padding: '4px 8px' }}>
            <Icon name="check" size={11} stroke={2.2} style={{ verticalAlign: '-1px', marginRight: 4 }} />
            In workspace
          </span>
        </div>
      )}
    </div>
  );
}

const miniGhostBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  height: 24, padding: '0 9px', borderRadius: 6,
  background: 'transparent', color: 'var(--fg)',
  border: '.5px solid var(--border)', fontSize: 11, fontWeight: 500, cursor: 'pointer',
};
const miniSolidBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  height: 24, padding: '0 9px', borderRadius: 6,
  background: 'var(--fg)', color: 'var(--bg)',
  border: 0, fontSize: 11, fontWeight: 500, cursor: 'pointer',
};

// ── File picker modal ──────────────────────────────────────────────────────
function FilePickerModal({ open, onClose, onAddFromCloud, onAssignFromCloud, onCloudDragStart }) {
  const [query, setQuery] = React.useState('');
  const [folder, setFolder] = React.useState('all');
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else { setQuery(''); setFolder('all'); }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const q = query.trim().toLowerCase();
  let visible = CLOUD_FILES;
  if (folder !== 'all') {
    const folderName = CLOUD_FOLDERS.find(f => f.id === folder)?.name;
    visible = visible.filter(f => f.folder === folderName);
  }
  if (q) visible = visible.filter(f =>
    f.title.toLowerCase().includes(q) ||
    f.folder.toLowerCase().includes(q) ||
    f.kind.toLowerCase().includes(q));

  const recent = CLOUD_FILES.slice(0, 4);

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(15,17,21,.32)',
        backdropFilter: 'blur(4px)', zIndex: 950,
      }} />
      <div className="fade-in-noxform" style={{
        position: 'fixed', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(820px, 92vw)', height: 'min(620px, 88vh)',
        zIndex: 951,
        background: 'var(--bg)', borderRadius: 16,
        border: '.5px solid var(--border)',
        boxShadow: '0 30px 80px -20px rgba(0,0,0,.32)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 22px',
          display: 'flex', alignItems: 'center', gap: 12,
          borderBottom: '.5px solid var(--border)',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--accent-soft)', color: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CloudIcon size={16} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Browse files</div>
            <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>
              From Dropbox · Files stay where they are; only references are added.
            </div>
          </div>
          <button onClick={onClose} style={iconBtnStyle()}>
            <Icon name="arrow-left" size={14} />
          </button>
        </div>

        {/* Search */}
        <div style={{
          padding: '12px 22px',
          borderBottom: '.5px solid var(--border)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px', borderRadius: 8,
            background: 'var(--surface-2)',
            border: '.5px solid var(--border)',
          }}>
            <Icon name="search" size={14} style={{ color: 'var(--fg-muted)' }} />
            <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your Dropbox…"
              style={{
                flex: 1, border: 0, outline: 'none', background: 'transparent',
                fontSize: 13, color: 'var(--fg)', fontFamily: 'inherit',
              }} />
          </div>
        </div>

        {/* Body — folders rail + grid */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <div style={{
            width: 200, flexShrink: 0,
            borderRight: '.5px solid var(--border)',
            padding: '12px 8px', overflow: 'auto',
            display: 'flex', flexDirection: 'column', gap: 1,
          }}>
            <div style={{
              padding: '6px 12px',
              fontSize: 10, fontWeight: 600, letterSpacing: '.06em',
              textTransform: 'uppercase', color: 'var(--fg-muted)',
            }}>Folders</div>
            {[{ id: 'all', name: 'All files', count: CLOUD_FILES.length }, ...CLOUD_FOLDERS].map(f => {
              const active = folder === f.id;
              return (
                <button key={f.id} onClick={() => setFolder(f.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '7px 10px', borderRadius: 7, border: 0,
                    background: active ? 'var(--surface-2)' : 'transparent',
                    color: active ? 'var(--fg)' : 'var(--fg-muted)',
                    fontSize: 12.5, fontWeight: active ? 500 : 400,
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'background .12s',
                  }}>
                  <Icon name={f.id === 'all' ? 'files' : 'folder'} size={14} />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                  <span style={{ fontSize: 11, opacity: .55 }}>{f.count}</span>
                </button>
              );
            })}
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '16px 22px' }}>
            {!q && folder === 'all' && (
              <div style={{ marginBottom: 22 }}>
                <div style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: '.08em',
                  textTransform: 'uppercase', color: 'var(--fg-muted)',
                  marginBottom: 12,
                }}>Recent</div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                  gap: 12,
                }}>
                  {recent.map(f => (
                    <PickerCard key={f.id} file={f} compact
                      onAdd={() => onAddFromCloud(f)}
                      onAssign={() => onAssignFromCloud(f)}
                      onDragStart={(file, ev) => { onClose(); onCloudDragStart?.(file, ev); }} />
                  ))}
                </div>
              </div>
            )}

            <div style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '.08em',
              textTransform: 'uppercase', color: 'var(--fg-muted)',
              marginBottom: 12,
            }}>{q ? `Results (${visible.length})` : (folder === 'all' ? 'All files' : CLOUD_FOLDERS.find(f => f.id === folder)?.name)}</div>

            {visible.length === 0 ? (
              <div style={{
                padding: '60px 20px', textAlign: 'center',
                color: 'var(--fg-muted)', fontSize: 13,
                border: '.5px dashed var(--border-strong)', borderRadius: 12,
              }}>
                No files found.
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 12,
              }}>
                {visible.map(f => (
                  <PickerCard key={f.id} file={f}
                    onAdd={() => onAddFromCloud(f)}
                    onAssign={() => onAssignFromCloud(f)}
                    onDragStart={(file, ev) => { onClose(); onCloudDragStart?.(file, ev); }} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function PickerCard({ file, onAdd, onAssign, compact, onDragStart }) {
  const [hover, setHover] = React.useState(false);
  const startDrag = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('button')) return;
    const sx = e.clientX, sy = e.clientY;
    let started = false;
    const move = (ev) => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (!started && (dx * dx + dy * dy) > 25) {
        started = true;
        onDragStart?.(file, ev);
      }
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseDown={startDrag}
      style={{
        position: 'relative',
        background: 'var(--surface)',
        border: '.5px solid var(--border)',
        borderRadius: 10,
        padding: 10,
        cursor: 'grab',
        userSelect: 'none',
        transition: 'border-color .15s, box-shadow .15s, transform .15s',
        borderColor: hover ? 'var(--border-strong)' : 'var(--border)',
        boxShadow: hover ? '0 6px 18px -6px rgba(0,0,0,.10)' : 'none',
      }}>
      <CloudThumb file={file} height={compact ? 76 : 96} rounded={6} />
      <div style={{
        marginTop: 8,
        fontSize: 12.5, fontWeight: 500, color: 'var(--fg)',
        letterSpacing: '-.005em',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{file.title}</div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 10.5, color: 'var(--fg-muted)', marginTop: 4,
      }}>
        <KindTag kind={file.kind} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.folder}</span>
      </div>
      {/* Hover quick add */}
      <div style={{
        position: 'absolute', inset: 0, padding: 10, borderRadius: 10,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
        gap: 4, opacity: hover ? 1 : 0, pointerEvents: hover ? 'auto' : 'none',
        transition: 'opacity .12s',
        background: 'linear-gradient(180deg, transparent 50%, rgba(255,255,255,.4) 100%)',
      }}>
        <button onClick={onAssign} style={{ ...miniGhostBtn, height: 26, fontSize: 11.5,
          background: 'rgba(255,255,255,.95)' }}>Assign…</button>
        <button onClick={onAdd} style={{ ...miniSolidBtn, height: 26, fontSize: 11.5 }}>
          <Icon name="plus" size={11} stroke={2.4} /> Add
        </button>
      </div>
    </div>
  );
}

// ── Browse Files entry tile (used inside the workspace recent strip) ───────
function BrowseFilesTile({ onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', flexDirection: 'column',
        background: hover ? 'var(--surface)' : 'var(--surface-2)',
        border: '1px dashed', borderColor: hover ? 'var(--accent)' : 'var(--border-strong)',
        borderRadius: 14,
        padding: 12,
        cursor: 'pointer',
        transition: 'all .15s',
        boxShadow: hover ? '0 6px 16px -6px rgba(59,108,245,.18)' : 'none',
      }}>
      <div style={{
        width: '100%', height: 96, borderRadius: 10,
        background: 'var(--bg)',
        border: '.5px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 8,
        color: hover ? 'var(--accent)' : 'var(--fg-muted)',
        transition: 'color .15s',
      }}>
        <CloudIcon size={22} />
        <div style={{
          fontSize: 11, fontWeight: 500,
          color: hover ? 'var(--accent)' : 'var(--fg-muted)',
        }}>Open Dropbox</div>
      </div>
      <div style={{ padding: '12px 2px 2px' }}>
        <div style={{
          fontSize: 13.5, fontWeight: 500, color: 'var(--fg)',
          letterSpacing: '-.005em', marginBottom: 4,
        }}>Browse files</div>
        <div style={{ fontSize: 11.5, color: 'var(--fg-muted)', lineHeight: 1.4 }}>
          Search or select from your Dropbox
        </div>
      </div>
    </div>
  );
}

// ── Assign modal ───────────────────────────────────────────────────────────
// Triggered by "Assign…" on a cloud file. Routes the file to a person or a
// team. Each row surfaces a lightweight workload preview so assignment
// decisions feel informed without needing a separate dashboard.
function AssignModal({ file, files, onAssignPerson, onAssignTeam, onClose }) {
  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!file) return null;

  const q = query.trim().toLowerCase();
  const people = TEAM.filter(p => p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q));
  const teams  = TEAMS.filter(t => t.name.toLowerCase().includes(q));

  // Workload — how many files this person currently has in review.
  const reviewLoad = (personId) =>
    files.filter(f => f.owner === personId && f.status === 'review').length;

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(15,17,21,.35)',
        backdropFilter: 'blur(3px)', zIndex: 990,
      }} />
      <div className="fade-in-noxform" style={{
        position: 'fixed', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(440px, 92vw)', maxHeight: '78vh',
        zIndex: 991,
        background: 'var(--bg)', borderRadius: 16,
        border: '.5px solid var(--border)',
        boxShadow: '0 30px 80px -20px rgba(0,0,0,.34), 0 4px 14px rgba(0,0,0,.08)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 20px 14px' }}>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-.01em', color: 'var(--fg)' }}>
            Assign file…
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7, marginTop: 5,
            fontSize: 12.5, color: 'var(--fg-muted)',
          }}>
            <KindTag kind={file.kind} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {file.title}
            </span>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '0 20px 12px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '9px 12px', borderRadius: 9,
            background: 'var(--surface-2)',
            border: '.5px solid var(--border)',
          }}>
            <Icon name="search" size={14} style={{ color: 'var(--fg-muted)' }} />
            <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people or teams"
              style={{
                flex: 1, border: 0, outline: 'none', background: 'transparent',
                fontSize: 13, color: 'var(--fg)', fontFamily: 'inherit',
              }} />
          </div>
        </div>

        {/* Results */}
        <div style={{ flex: 1, overflow: 'auto', padding: '2px 0 10px' }}>
          {people.length > 0 && (
            <AssignSection title="People">
              {people.map(p => (
                <PersonAssignRow key={p.id} person={p}
                  reviewLoad={reviewLoad(p.id)}
                  onClick={() => onAssignPerson(p.id)} />
              ))}
            </AssignSection>
          )}
          {teams.length > 0 && (
            <AssignSection title="Teams">
              {teams.map(t => {
                // Unclaimed work is the actionable signal at assignment time.
                const unclaimed = files.filter(f => t.members.includes(f.owner) && f.status === 'draft').length;
                return (
                  <TeamAssignRow key={t.id} team={t}
                    unclaimed={unclaimed}
                    onClick={() => onAssignTeam(t.id)} />
                );
              })}
            </AssignSection>
          )}
          {q && people.length === 0 && teams.length === 0 && (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--fg-muted)', fontSize: 13 }}>
              No people or teams match "<strong style={{ color: 'var(--fg)' }}>{query}</strong>"
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function AssignSection({ title, children }) {
  return (
    <div>
      <div style={{
        padding: '10px 20px 6px',
        fontSize: 10, fontWeight: 600, letterSpacing: '.08em',
        textTransform: 'uppercase', color: 'var(--fg-muted)',
      }}>{title}</div>
      {children}
    </div>
  );
}

function PersonAssignRow({ person, reviewLoad, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 11,
        width: '100%', padding: '8px 20px', border: 0,
        background: hover ? 'var(--surface-2)' : 'transparent',
        cursor: 'pointer', textAlign: 'left',
        transition: 'background .1s',
      }}>
      <Avatar user={person} size={34} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 500, color: 'var(--fg)',
          letterSpacing: '-.005em',
        }}>{person.name}{person.isMe && <span style={{
          fontSize: 10, fontWeight: 500, color: 'var(--fg-muted)',
          marginLeft: 6,
        }}>· You</span>}</div>
        <div style={{
          fontSize: 11.5, color: 'var(--fg-muted)', marginTop: 1,
        }}>
          {reviewLoad > 0
            ? `${reviewLoad} in review`
            : 'Available'}
        </div>
      </div>
    </button>
  );
}

function TeamAssignRow({ team, unclaimed, onClick }) {
  const [hover, setHover] = React.useState(false);
  const members = team.members.map(id => TEAM.find(t => t.id === id)).filter(Boolean);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 11,
        width: '100%', padding: '8px 20px', border: 0,
        background: hover ? 'var(--surface-2)' : 'transparent',
        cursor: 'pointer', textAlign: 'left',
        transition: 'background .1s',
      }}>
      {/* Team mark — colored rounded square with stacked member initials */}
      <div style={{
        width: 34, height: 34, borderRadius: 9, flexShrink: 0,
        background: team.color, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="workspace" size={16} stroke={1.8} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 500, color: 'var(--fg)',
          letterSpacing: '-.005em',
        }}>{team.name}</div>
        <div style={{ fontSize: 11.5, color: 'var(--fg-muted)', marginTop: 1 }}>
          {unclaimed > 0 ? `${unclaimed} unclaimed` : 'No unclaimed work'}
        </div>
      </div>
      {/* Stacked member avatars */}
      <div style={{ display: 'flex' }}>
        {members.slice(0, 3).map((m, i) => (
          <div key={m.id} title={m.name} style={{
            width: 20, height: 20, borderRadius: '50%',
            background: m.avatarBg, color: '#fff',
            fontSize: 7.5, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginLeft: i > 0 ? -6 : 0,
            boxShadow: '0 0 0 1.5px var(--bg)',
          }}>{m.initials}</div>
        ))}
      </div>
    </button>
  );
}

Object.assign(window, { SearchPopover, FilePickerModal, AssignModal, BrowseFilesTile, CloudIcon, CloudThumb });
