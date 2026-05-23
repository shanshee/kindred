// Workspace view — main team grid with drag-drop targets

function WorkspaceView({ density, onPersonClick, onFileOpen, dragState, setDragState, onBrowseFiles, files, addedCloudFiles, onAssignFile, pendingAssign, onConfirmPendingAssign, onCancelPendingAssign }) {
  const dense = density === 'compact';

  // Files-per-person map (pulled from live state)
  const byOwner = {};
  TEAM.forEach(t => { byOwner[t.id] = files.filter(f => f.owner === t.id); });
  // Unclaimed work owned by the shared pool.
  const poolFiles = files.filter(f => f.owner === 'pool');

  // ── Needs your attention ────────────────────────────────────────────────
  // Files that require review, feedback, or action — *not* generic recents.
  // Inclusion rules (any one):
  //   • assigned to me (owner === 'me')
  //   • new comments / @mentions for me
  //   • status === 'review' (waiting on someone)
  // Sorted: assigned-to-me first, then mentions, then review queue,
  // then by recency of update.
  const recencyRank = (u) => {
    if (!u) return 999;
    const s = String(u).toLowerCase();
    if (s.includes('just')) return 0;
    if (s.includes('m ago')) return parseInt(s) || 1;
    if (s.includes('h ago')) return (parseInt(s) || 1) * 60;
    if (s.includes('yesterday')) return 60 * 24;
    if (s.includes('d ago')) return (parseInt(s) || 1) * 60 * 24;
    return 500;
  };
  const attention = files
    // Pool (unclaimed) work has its own card — keep it out of the personal queue.
    .filter(f => f.owner !== 'pool' && (f.owner === 'me' || f.mentionsMe || f.unread > 0 || f.status === 'review'))
    .map(f => {
      // Determine the dominant reason — drives accent. ONE primary signal per card.
      let reason;
      if (f.owner === 'me' && f.status === 'review') reason = 'review-mine';
      else if (f.status === 'review' && f.mentionsMe) reason = 'review';
      else if (f.owner === 'me') reason = 'assigned';
      else if (f.mentionsMe) reason = 'mention';
      else if (f.status === 'review') reason = 'review';
      else reason = 'comments';
      // Priority score (lower = earlier). Red urgency first, then amber, then neutral.
      // Within tier: urgent flag > unread count > recency.
      const tierRank = { 'review-mine': 0, 'review': 1, 'assigned': 2, 'mention': 3, 'comments': 4 };
      const score =
        tierRank[reason] * 1000
        + (f.urgent ? -100 : 0)
        + (-1 * Math.min(f.unread || 0, 10))
        + recencyRank(f.updated) * 0.001;
      return { ...f, _reason: reason, _score: score };
    })
    .sort((a, b) => a._score - b._score)
    .slice(0, 5);

  const meInReview = files.filter(f => f.owner === 'me' && f.status === 'review').length;
  const mentionCount = files.filter(f => f.mentionsMe && f.unread > 0).length;

  return (
    <div style={{
      flex: 1, overflow: 'auto', padding: dense ? '12px 32px 60px' : '14px 32px 80px',
      background: 'var(--bg-canvas)',
    }}>
      {/* Hero header */}
      {/* Hero — Upload / New file actions live in the GlobalNav now, so the
          hero is just identity copy. No more duplicate creation buttons. */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          fontSize: 11, fontWeight: 500, letterSpacing: '.08em',
          textTransform: 'uppercase', color: 'var(--fg-muted)',
          marginBottom: 10,
        }}>
          Aria — Mobile App · Workspace
        </div>
        <h1 style={{
          margin: 0, fontSize: 32, fontWeight: 500, letterSpacing: '-.025em',
          color: 'var(--fg)', lineHeight: 1.1,
        }}>
          Good afternoon, Yusuf.
        </h1>
        <p style={{
          margin: '8px 0 0', fontSize: 14, color: 'var(--fg-muted)',
          maxWidth: 540,
        }}>
          <span style={{ color: 'var(--fg)' }}>{attention.length} item{attention.length === 1 ? '' : 's'}</span> need your attention.
          Drag any card onto a teammate to reassign.
        </p>
      </div>

      {/* Needs your attention — work queue, not file list */}
      <div style={{ marginBottom: 36 }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          marginBottom: 14, gap: 16,
        }}>
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              fontSize: 17, fontWeight: 500, letterSpacing: '-.012em',
              color: 'var(--fg)',
            }}>
              Needs your attention
              {attention.length > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  padding: '2px 8px', borderRadius: 999,
                  background: 'var(--accent-soft)', color: 'var(--accent)',
                  fontVariantNumeric: 'tabular-nums',
                }}>{attention.length}</span>
              )}
            </div>
            <div style={{
              fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 4,
              letterSpacing: '-.005em',
            }}>
              {meInReview > 0 || mentionCount > 0 ? (
                <>
                  {meInReview > 0 && <strong style={{ color: 'var(--fg)', fontWeight: 500 }}>{meInReview} waiting on your review</strong>}
                  {meInReview > 0 && mentionCount > 0 && <span style={{ margin: '0 6px', opacity: .4 }}>·</span>}
                  {mentionCount > 0 && <>{mentionCount} mention{mentionCount > 1 ? 's' : ''}</>}
                </>
              ) : (
                <>Files needing your review, feedback, or action</>
              )}
            </div>
          </div>
        </div>

        {attention.length === 0 ? (
          <AttentionEmptyState />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(attention.length, 4)}, minmax(0, 1fr))`,
            gap: 14,
            // Extra breathing room after the hero card so primary/secondary
            // tasks read as separate groups without a hard divider.
            alignItems: 'start',
          }}>
            {attention.slice(0, 4).map((f, i) => (
              <div key={f.id} style={{ marginLeft: i === 1 ? 8 : 0 }}>
                <AttentionCard file={f}
                  dragState={dragState} setDragState={setDragState}
                  onAssignDrop={onAssignFile}
                  onOpen={() => onFileOpen(f)} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Team grid */}
      <SectionHeader
        title="Your team"
        count={TEAM.length}
        right={
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 12, color: 'var(--fg-muted)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'hsl(150 55% 48%)' }} />
              4 online
            </span>
            <button style={{ ...ghostBtn, padding: '6px 10px', fontSize: 12 }}>
              <Icon name="plus" size={12} stroke={2} /> Invite
            </button>
          </div>
        }
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(3, minmax(0, 1fr))`,
        gap: 16,
      }}>
        {/* Shared pool — always the first card in the team grid. */}
        <TeamPoolTile files={poolFiles}
          dragState={dragState} setDragState={setDragState}
          pendingAssign={pendingAssign}
          onPickForAssign={onConfirmPendingAssign}
          onFileOpen={onFileOpen}
          onClick={() => onPersonClick(POOL)} />
        {TEAM.map(person => (
          <PersonTile key={person.id} person={person} files={byOwner[person.id]}
            dragState={dragState} setDragState={setDragState}
            pendingAssign={pendingAssign}
            onPickForAssign={onConfirmPendingAssign}
            onFileOpen={onFileOpen}
            onClick={() => onPersonClick(person)} />
        ))}
      </div>

      {pendingAssign && (
        <div style={{
          position: 'fixed', left: '50%', bottom: 28,
          transform: 'translateX(-50%)',
          display: 'inline-flex', alignItems: 'center', gap: 12,
          padding: '10px 12px 10px 16px', borderRadius: 999,
          background: 'var(--fg)', color: 'var(--bg)',
          fontSize: 13, fontWeight: 500,
          boxShadow: '0 18px 40px -10px rgba(0,0,0,.35)',
          zIndex: 970,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: 999,
            background: 'var(--accent)',
            boxShadow: '0 0 0 4px rgba(59,108,245,.25)',
          }}></span>
          Pick a teammate to assign <strong style={{ fontWeight: 600 }}>"{pendingAssign.title}"</strong>
          <button onClick={onCancelPendingAssign} style={{
            marginLeft: 4,
            display: 'inline-flex', alignItems: 'center', gap: 4,
            height: 24, padding: '0 10px', borderRadius: 999,
            background: 'rgba(255,255,255,.12)', color: 'var(--bg)',
            border: 0, fontSize: 11.5, fontWeight: 500, cursor: 'pointer',
          }}>Cancel</button>
        </div>
      )}

      <div style={{
        marginTop: 28, padding: '16px 18px',
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--surface)',
        border: '.5px dashed var(--border-strong)',
        borderRadius: 12,
        color: 'var(--fg-muted)', fontSize: 13,
      }}>
        <Icon name="sparkle" size={16} style={{ color: 'var(--accent)' }} />
        <span>
          <span style={{ color: 'var(--fg)', fontWeight: 500 }}>Tip · </span>
          Drag a file from "Recently active" onto any teammate to reassign it. Hold ⌥ to duplicate.
        </span>
      </div>
    </div>
  );
}

function SectionHeader({ title, count, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      marginBottom: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <h2 style={{
          margin: 0, fontSize: 14, fontWeight: 600,
          letterSpacing: '-.005em', color: 'var(--fg)',
        }}>{title}</h2>
        {count != null && <span style={{ fontSize: 13, color: 'var(--fg-muted)' }}>{count}</span>}
      </div>
      {right}
    </div>
  );
}

// Person tile — a delegation target. Three layered states:
//   • idle      → neutral card; hover reveals "Assign work" / "View tasks"
//   • drag-near → any file being dragged tints all tiles with an accent ring
//                 + a faint "Drop to assign" cue, signaling drop targets
//   • drag-over → cursor on this tile: scale up, full accent ring, big
//                 centered "Assign to {name}" overlay, then green confirm
function PersonTile({ person, files, dragState, setDragState, onClick, pendingAssign, onPickForAssign, onFileOpen }) {
  const ref = React.useRef(null);
  const [isOver, setIsOver] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const [justDropped, setJustDropped] = React.useState(false);
  const isPickable = !!pendingAssign;
  const isDragActive = dragState?.active === true;
  const isDragNear = isDragActive && !isOver;

  // Track whether the drag pointer is over this tile
  React.useEffect(() => {
    if (!dragState?.active) { setIsOver(false); return; }
    const onMove = (e) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const inside = e.clientX >= r.left && e.clientX <= r.right
                   && e.clientY >= r.top  && e.clientY <= r.bottom;
      setIsOver(inside);
      setDragState(s => s.active ? { ...s, hoverPersonId: inside ? person.id : (s.hoverPersonId === person.id ? null : s.hoverPersonId) } : s);
    };
    const onUp = (e) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const inside = e.clientX >= r.left && e.clientX <= r.right
                   && e.clientY >= r.top  && e.clientY <= r.bottom;
      if (inside) {
        setJustDropped(true);
        setTimeout(() => setJustDropped(false), 900);
      }
      setIsOver(false);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragState?.active, person.id, setDragState]);

  const inReview = files.filter(f => f.status === 'review').length;
  const total = files.length;

  const restingShadow = '0 1px 0 rgba(0,0,0,.02), 0 1px 2px rgba(0,0,0,.03)';
  const hoverShadow   = '0 8px 22px -10px rgba(0,0,0,.12), 0 1px 2px rgba(0,0,0,.04)';
  const nearShadow    = '0 0 0 1px var(--accent-soft), 0 1px 2px rgba(0,0,0,.04)';
  const overShadow    = '0 0 0 4px var(--accent-soft), 0 12px 32px -12px rgba(0,0,0,.18)';

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={(e) => {
        if (isPickable) { e.stopPropagation(); onPickForAssign?.(person.id); return; }
        onClick?.(e);
      }}
      style={{
        position: 'relative',
        background: 'var(--surface)',
        border: '.5px solid var(--border)',
        borderRadius: 16,
        padding: 18,
        cursor: 'pointer',
        transition: 'transform .2s cubic-bezier(.3,.7,.4,1), box-shadow .2s, border-color .2s, background .2s',
        transform: isOver
          ? 'scale(1.015)'
          : justDropped
            ? 'scale(1.01)'
            : (hover && !isDragActive ? 'translateY(-1px)' : 'none'),
        borderColor: isOver || isPickable
          ? 'var(--accent)'
          : justDropped
            ? 'hsl(150 55% 48%)'
            : isDragNear
              ? 'rgba(59,108,245,.45)'
              : (hover ? 'var(--border-strong)' : 'var(--border)'),
        boxShadow: isOver
          ? overShadow
          : isPickable
            ? '0 0 0 2px var(--accent-soft)'
            : isDragNear
              ? nearShadow
              : (hover ? hoverShadow : restingShadow),
      }}
    >
      {/* Drop affordance — full overlay when cursor is on this tile */}
      {isOver && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 16, pointerEvents: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--accent-soft)',
          backdropFilter: 'blur(2px)',
          zIndex: 2,
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 16px', borderRadius: 999,
            background: 'var(--accent)', color: '#fff',
            fontSize: 13, fontWeight: 500,
            boxShadow: '0 8px 20px -6px rgba(59,108,245,.5)',
          }}>
            <Icon name="plus" size={14} stroke={2.2} />
            Assign to {person.isMe ? 'yourself' : person.name.split(' ')[0]}
          </div>
        </div>
      )}

      {/* Drag-near hint — appears on every other tile while a drag is in flight */}
      {isDragNear && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 10.5, fontWeight: 600, letterSpacing: '.04em',
          textTransform: 'uppercase',
          color: 'var(--accent)', opacity: .75,
          pointerEvents: 'none',
        }}>
          <Icon name="plus" size={11} stroke={2.2} />
          Drop to assign
        </div>
      )}

      {justDropped && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 999,
          background: 'hsl(150 55% 96%)', color: 'hsl(150 55% 32%)',
          fontSize: 11, fontWeight: 500,
          animation: 'fadeOut .9s ease forwards',
        }}>
          <Icon name="check" size={12} stroke={2.2} />
          Assigned
        </div>
      )}

      {/* Header — name, role, hover-revealed actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Avatar user={person} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14, fontWeight: 500, color: 'var(--fg)',
            letterSpacing: '-.005em',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{person.name}</span>
            {person.isMe && (
              <span style={{
                fontSize: 10, fontWeight: 500, padding: '1px 6px',
                borderRadius: 4, background: 'var(--surface-2)',
                color: 'var(--fg-muted)',
              }}>You</span>
            )}
          </div>
          <div style={{
            fontSize: 12, color: 'var(--fg-muted)', marginTop: 2,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {person.role}
            {person.online && (
              <>
                <span style={{ opacity: .35 }}>·</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: 999, background: 'hsl(150 55% 48%)' }} />
                  Online
                </span>
              </>
            )}
          </div>
        </div>
        {/* Hover actions — secondary to drag interaction; hidden while a drag
            is in flight so they don't compete with the drop target overlay. */}
        <div style={{
          display: 'flex', gap: 4,
          opacity: hover && !isDragActive && !isPickable ? 1 : 0,
          transform: hover && !isDragActive ? 'translateX(0)' : 'translateX(4px)',
          pointerEvents: hover && !isDragActive && !isPickable ? 'auto' : 'none',
          transition: 'opacity .15s, transform .18s cubic-bezier(.3,.7,.4,1)',
        }}>
          <PersonAction icon="plus" label="Assign work"
            onClick={(e) => { e.stopPropagation(); /* placeholder */ }} />
          <PersonAction icon="eye" label="View tasks"
            onClick={(e) => { e.stopPropagation(); onClick?.(e); }} />
        </div>
      </div>

      {/* Stats — focused on delegation: who's already loaded, who's blocking. */}
      <div style={{
        display: 'flex', gap: 18, padding: '10px 0',
        borderTop: '.5px solid var(--border)',
        borderBottom: '.5px solid var(--border)',
        marginBottom: 14,
      }}>
        <Stat label="Assigned" value={total} />
        <Stat label="In review" value={inReview} accent={inReview > 0} />
      </div>

      {/* In-progress strip — labelled, clickable thumbnails */}
      {files.length > 0 && (
        <div style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '.06em',
          textTransform: 'uppercase', color: 'var(--fg-muted)',
          marginBottom: 8,
        }}>In progress</div>
      )}

      <div style={{ display: 'flex', gap: 6 }}>
        {files.slice(0, 3).map(f => (
          <button key={f.id}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onFileOpen?.(f); }}
            title={f.title}
            style={{
              flex: 1, height: 56, padding: 0, border: 0,
              borderRadius: 7,
              background: f.thumb,
              boxShadow: 'inset 0 0 0 .5px rgba(0,0,0,.06)',
              position: 'relative', overflow: 'hidden',
              cursor: 'pointer', transition: 'transform .15s, box-shadow .15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = 'inset 0 0 0 .5px rgba(0,0,0,.08), 0 4px 10px -4px rgba(0,0,0,.18)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'inset 0 0 0 .5px rgba(0,0,0,.06)';
            }}>
            <MockArt fileId={f.id} variant="thumb" />
            <div style={{
              position: 'absolute', bottom: 4, left: 4,
              fontSize: 8, fontWeight: 600, padding: '1px 4px',
              borderRadius: 3, background: 'rgba(0,0,0,.5)', color: '#fff',
              letterSpacing: '.04em',
              zIndex: 1,
            }}>{f.kind}</div>
          </button>
        ))}
        {files.length === 0 && (
          <div style={{
            flex: 1, height: 56, borderRadius: 7,
            border: `.5px dashed ${isDragActive ? 'var(--accent)' : 'var(--border-strong)'}`,
            background: isDragActive ? 'var(--accent-soft)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 6,
            fontSize: 11, fontWeight: 500,
            color: isDragActive ? 'var(--accent)' : 'var(--fg-muted)',
            transition: 'background .15s, border-color .15s, color .15s',
          }}>
            {isDragActive
              ? <>Drop here to assign</>
              : <>No work assigned</>}
          </div>
        )}
        {files.length > 3 && (
          <div style={{
            flex: 1, height: 56, borderRadius: 7,
            background: 'var(--surface-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, color: 'var(--fg-muted)', fontWeight: 500,
          }}>+{files.length - 3}</div>
        )}
      </div>
    </div>
  );
}

// Shared pool tile — the first card in "Your team". Holds unclaimed work.
// Deliberately quieter than a person tile: neutral mark, muted metrics,
// no online status. It's a calm holding area, not a teammate.
function TeamPoolTile({ files, dragState, setDragState, onClick, pendingAssign, onPickForAssign, onFileOpen }) {
  const ref = React.useRef(null);
  const [isOver, setIsOver] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const [justDropped, setJustDropped] = React.useState(false);
  const isPickable = !!pendingAssign;
  const isDragActive = dragState?.active === true;
  const isDragNear = isDragActive && !isOver;

  React.useEffect(() => {
    if (!dragState?.active) { setIsOver(false); return; }
    const onMove = (e) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const inside = e.clientX >= r.left && e.clientX <= r.right
                   && e.clientY >= r.top  && e.clientY <= r.bottom;
      setIsOver(inside);
      setDragState(s => s.active ? { ...s, hoverPersonId: inside ? 'pool' : (s.hoverPersonId === 'pool' ? null : s.hoverPersonId) } : s);
    };
    const onUp = (e) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const inside = e.clientX >= r.left && e.clientX <= r.right
                   && e.clientY >= r.top  && e.clientY <= r.bottom;
      if (inside) { setJustDropped(true); setTimeout(() => setJustDropped(false), 900); }
      setIsOver(false);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragState?.active, setDragState]);

  // "Unassigned" = work not yet in review; the rest is mid-review.
  const inReview = files.filter(f => f.status === 'review').length;
  const unassigned = files.filter(f => f.status !== 'review').length;

  const restingShadow = '0 1px 0 rgba(0,0,0,.02), 0 1px 2px rgba(0,0,0,.03)';
  const hoverShadow   = '0 8px 22px -10px rgba(0,0,0,.12), 0 1px 2px rgba(0,0,0,.04)';
  const nearShadow    = '0 0 0 1px var(--accent-soft), 0 1px 2px rgba(0,0,0,.04)';
  const overShadow    = '0 0 0 4px var(--accent-soft), 0 12px 32px -12px rgba(0,0,0,.18)';

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={(e) => {
        if (isPickable) { e.stopPropagation(); onPickForAssign?.('pool'); return; }
        onClick?.(e);
      }}
      style={{
        position: 'relative',
        background: 'var(--surface)',
        border: '.5px solid var(--border)',
        borderRadius: 16,
        padding: 18,
        cursor: 'pointer',
        transition: 'transform .2s cubic-bezier(.3,.7,.4,1), box-shadow .2s, border-color .2s',
        transform: isOver ? 'scale(1.015)' : justDropped ? 'scale(1.01)' : (hover && !isDragActive ? 'translateY(-1px)' : 'none'),
        borderColor: isOver || isPickable
          ? 'var(--accent)'
          : justDropped ? 'hsl(150 55% 48%)'
          : isDragNear ? 'rgba(59,108,245,.45)'
          : (hover ? 'var(--border-strong)' : 'var(--border)'),
        boxShadow: isOver ? overShadow
          : isPickable ? '0 0 0 2px var(--accent-soft)'
          : isDragNear ? nearShadow
          : (hover ? hoverShadow : restingShadow),
      }}
    >
      {/* Drop affordance */}
      {isOver && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 16, pointerEvents: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--accent-soft)', backdropFilter: 'blur(2px)', zIndex: 2,
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 16px', borderRadius: 999,
            background: 'var(--accent)', color: '#fff',
            fontSize: 13, fontWeight: 500,
            boxShadow: '0 8px 20px -6px rgba(59,108,245,.5)',
          }}>
            <Icon name="plus" size={14} stroke={2.2} />
            Move to shared queue
          </div>
        </div>
      )}
      {isDragNear && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 10.5, fontWeight: 600, letterSpacing: '.04em',
          textTransform: 'uppercase', color: 'var(--accent)', opacity: .75,
          pointerEvents: 'none',
        }}>
          <Icon name="plus" size={11} stroke={2.2} />
          Drop to queue
        </div>
      )}
      {justDropped && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 999,
          background: 'hsl(150 55% 96%)', color: 'hsl(150 55% 32%)',
          fontSize: 11, fontWeight: 500,
          animation: 'fadeOut .9s ease forwards',
        }}>
          <Icon name="check" size={12} stroke={2.2} />
          Added to queue
        </div>
      )}

      {/* Header — neutral mark, no online status, no person identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: 'var(--surface-2)',
          border: '.5px solid var(--border)',
          color: 'var(--fg-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="workspace" size={19} stroke={1.6} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14, fontWeight: 500, color: 'var(--fg)',
            letterSpacing: '-.005em',
          }}>Design Team</div>
          <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>
            Shared queue · unclaimed work
          </div>
        </div>
        <div style={{
          display: 'flex', gap: 4,
          opacity: hover && !isDragActive && !isPickable ? 1 : 0,
          transform: hover && !isDragActive ? 'translateX(0)' : 'translateX(4px)',
          pointerEvents: hover && !isDragActive && !isPickable ? 'auto' : 'none',
          transition: 'opacity .15s, transform .18s cubic-bezier(.3,.7,.4,1)',
        }}>
          <PersonAction icon="eye" label="View queue"
            onClick={(e) => { e.stopPropagation(); onClick?.(e); }} />
        </div>
      </div>

      {/* Metrics — softer than a person tile: muted numbers, no accent. */}
      <div style={{
        display: 'flex', gap: 18, padding: '10px 0',
        borderTop: '.5px solid var(--border)',
        borderBottom: '.5px solid var(--border)',
        marginBottom: 14,
      }}>
        <PoolStat label="Unassigned" value={unassigned} />
        <PoolStat label="In review" value={inReview} muted />
      </div>

      {/* Unclaimed file strip — files waiting for ownership */}
      {files.length > 0 && (
        <div style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '.06em',
          textTransform: 'uppercase', color: 'var(--fg-muted)',
          marginBottom: 8,
        }}>Unclaimed</div>
      )}
      <div style={{ display: 'flex', gap: 6 }}>
        {files.slice(0, 3).map(f => (
          <button key={f.id}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onFileOpen?.(f); }}
            title={f.title}
            style={{
              flex: 1, height: 56, padding: 0, border: 0,
              borderRadius: 7, background: f.thumb,
              boxShadow: 'inset 0 0 0 .5px rgba(0,0,0,.06)',
              position: 'relative', overflow: 'hidden',
              cursor: 'pointer', transition: 'transform .15s, box-shadow .15s, opacity .15s',
              // Slightly softened — unclaimed work reads as quieter than
              // owned work until someone picks it up.
              opacity: 0.95,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = 'inset 0 0 0 .5px rgba(0,0,0,.08), 0 4px 10px -4px rgba(0,0,0,.18)';
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'inset 0 0 0 .5px rgba(0,0,0,.06)';
              e.currentTarget.style.opacity = '0.95';
            }}>
            <MockArt fileId={f.id} variant="thumb" />
            <div style={{
              position: 'absolute', bottom: 4, left: 4,
              fontSize: 8, fontWeight: 600, padding: '1px 4px',
              borderRadius: 3, background: 'rgba(0,0,0,.5)', color: '#fff',
              letterSpacing: '.04em', zIndex: 1,
            }}>{f.kind}</div>
          </button>
        ))}
        {files.length === 0 && (
          <div style={{
            flex: 1, height: 56, borderRadius: 7,
            border: `.5px dashed ${isDragActive ? 'var(--accent)' : 'var(--border-strong)'}`,
            background: isDragActive ? 'var(--accent-soft)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 500,
            color: isDragActive ? 'var(--accent)' : 'var(--fg-muted)',
            transition: 'background .15s, border-color .15s, color .15s',
          }}>
            {isDragActive ? 'Drop here to queue' : 'Nothing unclaimed'}
          </div>
        )}
        {files.length > 3 && (
          <div style={{
            flex: 1, height: 56, borderRadius: 7,
            background: 'var(--surface-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, color: 'var(--fg-muted)', fontWeight: 500,
          }}>+{files.length - 3}</div>
        )}
      </div>
    </div>
  );
}

// Quieter Stat variant for the pool tile — no accent, calm contrast.
function PoolStat({ label, value, muted }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{
        fontSize: 18, fontWeight: 500, letterSpacing: '-.01em',
        color: muted ? 'rgba(21,23,27,.55)' : 'rgba(21,23,27,.78)',
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</div>
      <div style={{ fontSize: 10.5, color: 'rgba(21,23,27,.45)', marginTop: 2,
        textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function PersonAction({ icon, label, onClick }) {
  const [h, setH] = React.useState(false);
  return (
    <button
      onMouseDown={(e) => e.stopPropagation()}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{
        width: 28, height: 28, borderRadius: 7, border: 0,
        background: h ? 'var(--surface-2)' : 'transparent',
        color: h ? 'var(--fg)' : 'var(--fg-muted)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', padding: 0,
        transition: 'background .12s, color .12s',
      }}
    >
      <Icon name={icon} size={14} stroke={1.7} />
    </button>
  );
}

function Stat({ label, value, accent, small }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{
        fontSize: small ? 14 : 18, fontWeight: 500, letterSpacing: '-.01em',
        // Calmer contrast for the metric — Dropbox-style numbers feel
        // informative, not bold/declarative.
        color: accent ? 'var(--accent)' : 'rgba(21,23,27,.78)',
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</div>
      <div style={{ fontSize: 10.5, color: 'rgba(21,23,27,.45)', marginTop: 2,
        textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

// Card wrapper that initiates drag on mousedown
function DraggableCard({ file, dragState, setDragState, onOpen, compact, onAssignDrop }) {
  const isDragging = dragState?.active && dragState.fileId === file.id;
  const onDragStart = (e) => {
    if (e.button !== 0) return;
    const startX = e.clientX, startY = e.clientY;
    let started = false;
    const move = (ev) => {
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      if (!started && (dx * dx + dy * dy) > 25) {
        started = true;
        setDragState({ active: true, fileId: file.id, x: ev.clientX, y: ev.clientY, hoverPersonId: null });
      } else if (started) {
        setDragState(s => ({ ...s, x: ev.clientX, y: ev.clientY }));
      }
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      setDragState(s => {
        if (started && s.hoverPersonId && s.hoverPersonId !== file.owner) {
          onAssignDrop?.(file.id, s.hoverPersonId);
        }
        return s;
      });
      setTimeout(() => setDragState({ active: false, fileId: null, x: 0, y: 0, hoverPersonId: null }), 50);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  return (
    <FileCard file={file} onOpen={(e) => { if (!dragState.active) onOpen?.(); }}
      onDragStart={onDragStart}
      dragging={isDragging ? 'placeholder' : false}
      compact={compact} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// "Needs your attention" card — calm, premium variant.
// Each card answers: WHY does this need my attention?
// Hierarchy: REASON (primary, ownership-explicit) > FILE NAME (secondary) >
// META (tertiary — provenance + comments + time).
//
// Priority is signaled by a single muted red dot reserved for "Needs your
// review" (the only true call-to-action). "Waiting on [person]" is medium —
// no dot, no urgency styling. Mentions/comments are low.

const firstName = (id) => TEAM.find(p => p.id === id)?.name.split(' ')[0];

const REASON_META = {
  'review-mine': {
    // Verb-first call to action — the only label that asks for action right now.
    getLabel: () => 'Review now',
    priority: 'high',
  },
  'review': {
    // Owner is on the hook — name them so it's clear who's blocking.
    getLabel: (f) => `Waiting on ${firstName(f.owner) || 'review'}`,
    priority: 'medium',
  },
  'assigned': {
    getLabel: () => 'Assigned to you',
    priority: 'medium',
  },
  'mention': {
    getLabel: () => 'You were mentioned',
    priority: 'low',
  },
  'comments': {
    getLabel: () => 'New comments',
    priority: 'low',
  },
};

// Muted, calm hue — not alert red. Reserved strictly for high-priority.
const PRIORITY_DOT = {
  high:   'hsl(4 55% 56%)',
  medium: null,
  low:    null,
};

// Meta for the tertiary row — same rule for every card: prioritize what
// changed (new comments), fall back to the timestamp alone with an "Updated"
// prefix so the row always reads as a complete thought.
function metaForReason(file) {
  if (file.unread > 0) {
    const n = file.unread;
    return {
      insight: `${n} new comment${n === 1 ? '' : 's'}`,
      time: file.updated,
    };
  }
  return { insight: null, time: `Updated ${file.updated}` };
}

// Who's the relevant collaborator for this card? Returned as a TEAM entry so
// we can render a tiny avatar — visual context that complements the label
// without repeating it.
function contextPerson(file, reasonKey) {
  const find = (id) => id && id !== 'me' ? TEAM.find(p => p.id === id) : null;
  switch (reasonKey) {
    case 'review-mine':
    case 'assigned':
      // Who handed this off to you?
      return find(file.requestedBy);
    case 'review':
    case 'mention':
    case 'comments':
      return find(file.owner);
    default:
      return null;
  }
}

function AttentionCard({ file, dragState, setDragState, onOpen, onAssignDrop }) {
  const isDragging = dragState?.active && dragState.fileId === file.id;
  const [hover, setHover] = React.useState(false);
  const reasonKey = file._reason || 'assigned';
  const reason = REASON_META[reasonKey];
  const isHigh = reason.priority === 'high';
  const dot = PRIORITY_DOT[reason.priority];
  const reasonLabel = reason.getLabel(file);
  const meta = metaForReason(file);
  const ctxPerson = contextPerson(file, reasonKey);

  const onDragStart = (e) => {
    if (e.button !== 0) return;
    const startX = e.clientX, startY = e.clientY;
    let started = false;
    const move = (ev) => {
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      if (!started && (dx * dx + dy * dy) > 25) {
        started = true;
        setDragState({ active: true, fileId: file.id, x: ev.clientX, y: ev.clientY, hoverPersonId: null });
      } else if (started) {
        setDragState(s => ({ ...s, x: ev.clientX, y: ev.clientY }));
      }
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      setDragState(s => {
        if (started && s.hoverPersonId && s.hoverPersonId !== file.owner) {
          onAssignDrop?.(file.id, s.hoverPersonId);
        }
        return s;
      });
      setTimeout(() => setDragState({ active: false, fileId: null, x: 0, y: 0, hoverPersonId: null }), 50);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  return (
    <div
      onMouseDown={onDragStart}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={(e) => { if (!dragState?.active) onOpen?.(e); }}
      style={{
        position: 'relative',
        background: 'var(--surface)',
        border: '.5px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'pointer',
        opacity: isDragging ? 0.4 : 1,
        // Hero card sits a touch larger at rest — so it stands out naturally,
        // not via color. Hover lifts everything by 1px on top of that.
        transform: (hover && !isDragging)
          ? (isHigh ? 'translateY(-1px) scale(1.015)' : 'translateY(-1px)')
          : (isHigh ? 'scale(1.015)' : 'translateY(0)'),
        transformOrigin: 'center top',
        transition: 'transform .25s cubic-bezier(.3,.7,.4,1), box-shadow .18s, border-color .18s',
        boxShadow: hover
          ? '0 14px 34px -14px rgba(0,0,0,.18), 0 2px 4px rgba(0,0,0,.04)'
          : isHigh
            ? '0 6px 18px -6px rgba(0,0,0,.10), 0 1px 2px rgba(0,0,0,.05)'
            : '0 1px 0 rgba(0,0,0,.02), 0 1px 2px rgba(0,0,0,.03)',
        userSelect: 'none',
      }}
    >
      {/* Thumbnail — kind chip only; no status badge, no scrim.
          MockArt fills the gradient with a realistic per-file mockup
          (uploaded files render their gradient/image instead). */}
      <div style={{
        position: 'relative',
        height: 112,
        background: file.thumb,
        overflow: 'hidden',
      }}>
        <MockArt fileId={file._thumbArt || file.id} variant="thumb" />
        <div style={{
          position: 'absolute', bottom: 10, left: 10,
          padding: '2px 6px', borderRadius: 5,
          background: file.dark ? 'rgba(255,255,255,.86)' : 'rgba(15,17,21,.55)',
          color: file.dark ? '#0f141c' : '#fff',
          fontSize: 9.5, fontWeight: 600, letterSpacing: '.04em',
          backdropFilter: 'blur(6px)',
          zIndex: 1,
        }}>{file.kind}</div>

        {/* Floating secondary actions — card click is the primary path
            (open file). Hover reveals only what isn't redundant: complete the
            task, or reach for less-common actions via the overflow menu. */}
        <div style={{
          position: 'absolute', top: 8, right: 8,
          display: 'flex', gap: 2,
          padding: 3, borderRadius: 999,
          background: 'rgba(255,255,255,.92)',
          border: '.5px solid rgba(15,17,21,.06)',
          boxShadow: '0 4px 12px -4px rgba(0,0,0,.14)',
          opacity: hover ? 1 : 0,
          transform: hover ? 'translateY(0)' : 'translateY(-4px)',
          transition: 'opacity .15s, transform .18s cubic-bezier(.3,.7,.4,1)',
          pointerEvents: hover ? 'auto' : 'none',
          backdropFilter: 'blur(8px)',
        }}>
          <QuickAction icon="check" label="Mark as done" onClick={(e) => { e.stopPropagation(); }} />
          <QuickAction icon="eye"   label="Review"       onClick={(e) => { e.stopPropagation(); onOpen?.(e); }} />
        </div>
      </div>

      {/* Body — reason primary, file name secondary, meta tertiary */}
      <div style={{ padding: '12px 14px 14px' }}>
        {/* Reason — primary signal. High-pri gets a touch more contrast.
            A small avatar on the right anchors collaboration context without
            competing with the label. */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 8, marginBottom: 4,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7, minWidth: 0,
            fontSize: isHigh ? 13 : 12.5,
            fontWeight: 600, letterSpacing: '-.005em',
            color: isHigh ? 'var(--fg)' : 'rgba(21,23,27,.82)',
          }}>
            {dot && (
              <span style={{
                width: 6, height: 6, borderRadius: 999,
                background: dot, flex: 'none',
              }} />
            )}
            <span style={{
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{reasonLabel}</span>
          </div>
          {ctxPerson && (
            <div title={ctxPerson.name} style={{
              width: 18, height: 18, borderRadius: '50%',
              background: ctxPerson.avatarBg, color: '#fff',
              fontSize: 8.5, fontWeight: 700, letterSpacing: '.02em',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 0 1.5px var(--surface)',
            }}>{ctxPerson.initials}</div>
          )}
        </div>

        {/* File name — secondary */}
        <div style={{
          fontSize: 13, fontWeight: 500, letterSpacing: '-.005em',
          color: 'rgba(21,23,27,.72)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: 6,
        }}>{file.title}</div>

        {/* Meta — tertiary. At most two pieces: one actionable insight + time. */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 11.5, color: 'var(--fg-muted)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {meta.insight && <span>{meta.insight}</span>}
          <span style={{ marginLeft: meta.insight ? 'auto' : 0 }}>{meta.time}</span>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, onClick }) {
  const [h, setH] = React.useState(false);
  return (
    <button
      onMouseDown={(e) => e.stopPropagation()}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{
        width: 26, height: 26, borderRadius: 999, border: 0,
        background: h ? 'var(--surface-2)' : 'transparent',
        color: h ? 'var(--fg)' : 'var(--fg-muted)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', padding: 0,
        transition: 'background .12s, color .12s',
      }}
    >
      <Icon name={icon} size={13} stroke={1.7} />
    </button>
  );
}

function AttentionEmptyState() {
  return (
    <div style={{
      padding: '28px 24px',
      borderRadius: 14,
      border: '.5px dashed var(--border-strong)',
      background: 'var(--surface)',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: 'hsl(150 50% 96%)', color: 'hsl(150 55% 35%)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="check" size={18} stroke={2} />
      </div>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--fg)', letterSpacing: '-.005em' }}>
          You're caught up
        </div>
        <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>
          Nothing's waiting on you right now. Check your team's progress below.
        </div>
      </div>
    </div>
  );
}

const primaryBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  height: 32, padding: '0 14px', borderRadius: 8,
  background: 'var(--fg)', color: 'var(--bg)',
  border: 0, fontSize: 13, fontWeight: 500, cursor: 'pointer',
  transition: 'background .12s, transform .08s',
};

const ghostBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  height: 32, padding: '0 12px', borderRadius: 8,
  background: 'var(--surface)', color: 'var(--fg)',
  border: '.5px solid var(--border)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
  transition: 'background .12s, border-color .12s',
};

Object.assign(window, { WorkspaceView, DraggableCard, primaryBtn, ghostBtn, SectionHeader });
