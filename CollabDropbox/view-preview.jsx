// File preview view — image canvas with pin-based comments + version history

function PreviewView({ file, density, onBack, onShare, onUpdateFile }) {
  const [pins, setPins] = React.useState(PIN_COMMENTS);
  const [activePin, setActivePin] = React.useState('c1');
  const [tool, setTool] = React.useState('cursor'); // cursor | pin | draw | highlight
  const [showVersions, setShowVersions] = React.useState(false);
  const [activeVersion, setActiveVersion] = React.useState(
    () => VERSIONS.find(v => v.current)?.v || file.version
  );
  // Drawing state — strokes stored in 0–100 normalized coords so they scale
  // with the canvas. activeStroke is the in-progress stroke being drawn.
  // A ref mirrors activeStroke so the mouseup handler can commit exactly
  // once even if React replays the state-updater functions.
  const [strokes, setStrokes] = React.useState([]);
  const [activeStroke, setActiveStroke] = React.useState(null);
  const activeStrokeRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  const onCanvasClick = (e) => {
    if (tool !== 'pin') return;
    const r = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    const id = 'c' + (pins.length + 1) + '_' + Date.now();
    const newPin = { id, x, y, author: 'me', time: 'now', body: '' };
    setPins([...pins, newPin]);
    setActivePin(id);
    setTool('cursor');
  };

  // Drawing — start stroke on mousedown when draw/highlight tool is active.
  // Window-level move/up handlers let the user drag past the canvas edge
  // without losing the stroke.
  const onCanvasMouseDown = (e) => {
    if (tool !== 'draw' && tool !== 'highlight') return;
    if (e.button !== 0) return;
    e.preventDefault();
    const r = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    const newStroke = {
      id: 's' + Date.now(),
      mode: tool,
      points: [{ x, y }],
    };
    activeStrokeRef.current = newStroke;
    setActiveStroke(newStroke);
  };

  React.useEffect(() => {
    if (!activeStroke) return;
    const onMove = (e) => {
      const el = canvasRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
      const curr = activeStrokeRef.current;
      if (!curr) return;
      const updated = { ...curr, points: [...curr.points, { x, y }] };
      activeStrokeRef.current = updated;
      setActiveStroke(updated);
    };
    const onUp = () => {
      // Read the latest stroke from the ref — outside any state updater,
      // so this commits exactly once even if React replays an updater.
      const stroke = activeStrokeRef.current;
      activeStrokeRef.current = null;
      setActiveStroke(null);
      if (stroke && stroke.points.length > 1) {
        // Commit the stroke and drop a comment-anchor pin at its endpoint,
        // mirroring the pin-tool behavior. The pin's strokeId links them
        // so a finished drawing/highlight gets its own comment thread.
        setStrokes(prev => [...prev, stroke]);
        const last = stroke.points[stroke.points.length - 1];
        const pinId = 'c' + Date.now();
        setPins(prev => [...prev, {
          id: pinId,
          x: last.x, y: last.y,
          strokeId: stroke.id,
          author: 'me', time: 'now', body: '',
        }]);
        setActivePin(pinId);
        setTool('cursor');
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [activeStroke?.id]);

  // ⌘Z / Ctrl+Z — undo the last committed stroke. Also removes the
  // anchor pin we attached to it, so we don't leave orphan comments.
  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        setStrokes(prev => {
          if (!prev.length) return prev;
          const last = prev[prev.length - 1];
          setPins(pins => pins.filter(p => p.strokeId !== last.id));
          setActivePin(curr => {
            const droppedPin = pins.find(p => p.strokeId === last.id);
            return droppedPin && droppedPin.id === curr ? null : curr;
          });
          return prev.slice(0, -1);
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pins]);

  // Build an SVG path 'd' attribute from a list of {x, y} points.
  const pathFromPoints = (pts) => {
    if (!pts.length) return '';
    return 'M ' + pts.map(p => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' L ');
  };

  const allStrokes = activeStroke ? [...strokes, activeStroke] : strokes;

  // ── File progression state ─────────────────────────────────────────────
  // Reviewer = the file's current owner when status is 'review' and they
  // aren't you. Drives the inline chip + the right-panel context block.
  const reviewer = (file.status === 'review' && file.owner && file.owner !== 'me')
    ? TEAM.find(t => t.id === file.owner)
    : null;

  const [reviewModalOpen, setReviewModalOpen] = React.useState(false);
  const [reviewerMenuOpen, setReviewerMenuOpen] = React.useState(false);
  const reviewerChipRef = React.useRef(null);

  const submitReview = (reviewerId, message) => {
    onUpdateFile?.({ status: 'review', owner: reviewerId, requestedBy: 'me', reviewMessage: message || null });
    setReviewModalOpen(false);
  };

  const changeReviewer = (newReviewerId) => {
    onUpdateFile?.({ owner: newReviewerId });
    setReviewerMenuOpen(false);
  };

  const removeReviewer = () => {
    // Pulling the file back to draft cancels the review request.
    onUpdateFile?.({ status: 'draft', owner: 'me' });
    setReviewerMenuOpen(false);
  };

  const markFinal      = () => onUpdateFile?.({ status: 'final' });
  const requestApprove = () => onUpdateFile?.({ status: 'approved' });
  const reopen         = () => onUpdateFile?.({ status: 'draft', owner: 'me' });

  const ownerUser = TEAM.find(t => t.id === file.owner);

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: 'var(--bg-canvas)', minHeight: 0,
    }}>
      {/* File toolbar */}
      <div style={{
        height: 52, flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 20px',
        borderBottom: '.5px solid var(--border)',
        background: 'var(--bg)',
      }}>
        <button onClick={onBack} style={{ ...ghostBtn, height: 28, padding: '0 10px', fontSize: 12 }}>
          <Icon name="arrow-left" size={14} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <KindTag kind={file.kind} />
          <div style={{
            fontSize: 14, fontWeight: 500, letterSpacing: '-.005em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{file.title}</div>
          <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>· {file.size}</span>
          <StatusPill status={file.status} />
          {/* Inline reviewer chip — click to change/remove. Only shown
              while the file is in review and assigned to a teammate. */}
          {reviewer && (
            <button ref={reviewerChipRef}
              onClick={(e) => { e.stopPropagation(); setReviewerMenuOpen(o => !o); }}
              title={`Reviewing: ${reviewer.name}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                height: 24, padding: '0 8px 0 4px', borderRadius: 999,
                background: 'var(--surface-2)',
                border: '.5px solid var(--border)',
                color: 'var(--fg)',
                fontSize: 11.5, fontWeight: 500, cursor: 'pointer',
                transition: 'background .12s, border-color .12s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
              <span style={{
                width: 18, height: 18, borderRadius: '50%',
                background: reviewer.avatarBg, color: '#fff',
                fontSize: 8.5, fontWeight: 700, letterSpacing: '.02em',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>{reviewer.initials}</span>
              {reviewer.name.split(' ')[0]}
              <Icon name="chevron-d" size={11} stroke={1.6} style={{ opacity: .55 }} />
            </button>
          )}
        </div>

        {/* Center toolbar */}
        <div style={{
          display: 'flex', gap: 2, padding: 3,
          background: 'var(--surface-2)', borderRadius: 9,
          border: '.5px solid var(--border)',
        }}>
          {[
            { id: 'cursor',    icon: 'cursor',    label: 'Select' },
            { id: 'pin',       icon: 'pin',       label: 'Comment' },
            { id: 'draw',      icon: 'draw',      label: 'Draw' },
            { id: 'highlight', icon: 'highlight', label: 'Highlight' },
          ].map(t => {
            const active = tool === t.id;
            return (
              <button key={t.id}
                title={t.label}
                onClick={() => setTool(t.id)}
                style={{
                  width: 30, height: 26, borderRadius: 6, border: 0,
                  background: active ? 'var(--bg)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--fg-muted)',
                  cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: active ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                  transition: 'all .12s',
                }}>
                <Icon name={t.icon} size={14} stroke={1.7} />
              </button>
            );
          })}
        </div>

        {/* Collaborators */}
        <div style={{ display: 'flex', alignItems: 'center', marginRight: 4 }}>
          {TEAM.filter(t => t.online).slice(0, 3).map((u, i) => (
            <Avatar key={u.id} user={u} size={24} ring={true} stack={i > 0} />
          ))}
        </div>

        <button onClick={() => setShowVersions(v => !v)} style={{
          ...ghostBtn, height: 28, padding: '0 10px', fontSize: 12,
          background: showVersions ? 'var(--surface-2)' : 'var(--surface)',
        }}>
          <Icon name="clock" size={13} />
          {activeVersion}
        </button>
        <button onClick={onShare} style={{
          ...ghostBtn, height: 28, padding: '0 10px', fontSize: 12,
        }}>
          <Icon name="share" size={13} />
          Share
        </button>
        {/* State CTA — single visible action that progresses the file
            through Draft → Review → Final → Approved. */}
        <StateCTA file={file}
          onRequestReview={() => setReviewModalOpen(true)}
          onMarkFinal={markFinal}
          onRequestApproval={requestApprove}
          onReopen={reopen} />
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Canvas area */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 32, position: 'relative',
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,.06) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          minHeight: 0, overflow: 'hidden',
          cursor: tool === 'pin' ? 'crosshair' : 'default',
        }}>
          <div
            ref={canvasRef}
            onClick={onCanvasClick}
            onMouseDown={onCanvasMouseDown}
            style={{
              position: 'relative',
              width: 'min(720px, 100%)',
              aspectRatio: '4 / 3',
              borderRadius: 12,
              background: file._dataUrl ? '#0f141c' : file.thumb,
              boxShadow: '0 24px 60px -20px rgba(0,0,0,.25), 0 4px 12px rgba(0,0,0,.06)',
              overflow: 'hidden',
              cursor: (tool === 'pin' || tool === 'draw' || tool === 'highlight') ? 'crosshair' : 'default',
            }}
          >
            {file._dataUrl && /^image\//.test(file._mimeType || '') ? (
              <img src={file._dataUrl} alt={file.title}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'contain', display: 'block',
                  userSelect: 'none', pointerEvents: 'none',
                }} />
            ) : file._dataUrl && file._mimeType === 'application/pdf' ? (
              <embed src={file._dataUrl} type="application/pdf"
                style={{
                  width: '100%', height: '100%',
                  display: 'block', border: 0,
                }} />
            ) : (
              <MockArt fileId={file.id} variant="hero" />
            )}

            {/* Stroke overlay — draw + highlight annotations */}
            {allStrokes.length > 0 && (
              <svg viewBox="0 0 100 100" preserveAspectRatio="none"
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  pointerEvents: 'none',
                }}>
                {allStrokes.map(s => {
                  const isHighlight = s.mode === 'highlight';
                  return (
                    <path key={s.id}
                      d={pathFromPoints(s.points)}
                      stroke={isHighlight ? '#FFD24D' : 'var(--accent)'}
                      strokeWidth={isHighlight ? 18 : 2.5}
                      strokeOpacity={isHighlight ? 0.42 : 1}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      vectorEffect="non-scaling-stroke" />
                  );
                })}
              </svg>
            )}

            {/* Pins */}
            {pins.map((p, i) => {
              const author = TEAM.find(t => t.id === p.author) || TEAM[0];
              const isActive = activePin === p.id;
              return (
                <button key={p.id}
                  onClick={(e) => { e.stopPropagation(); setActivePin(p.id); }}
                  style={{
                    position: 'absolute',
                    left: `${p.x}%`, top: `${p.y}%`,
                    transform: 'translate(-50%, -100%)',
                    width: 30, height: 30, borderRadius: '50% 50% 50% 4px',
                    background: isActive ? 'var(--accent)' : '#fff',
                    color: isActive ? '#fff' : 'var(--fg)',
                    border: 0, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 600,
                    boxShadow: isActive
                      ? '0 4px 14px -2px rgba(59,108,245,.55), 0 0 0 3px var(--accent-soft)'
                      : '0 4px 12px rgba(0,0,0,.18)',
                    transition: 'transform .15s, box-shadow .15s',
                    zIndex: isActive ? 3 : 2,
                    transform: `translate(-50%, -100%) ${isActive ? 'scale(1.1)' : ''}`,
                  }}>
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Floating tool hint */}
          {(tool === 'pin' || tool === 'draw' || tool === 'highlight') && (
            <div style={{
              position: 'absolute', bottom: 24, left: '50%',
              transform: 'translateX(-50%)',
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '8px 14px', borderRadius: 999,
              background: 'var(--fg)', color: 'var(--bg)',
              fontSize: 12, fontWeight: 500,
              boxShadow: '0 8px 20px -4px rgba(0,0,0,.3)',
            }}>
              {tool === 'pin'       && 'Click anywhere on the image to drop a pin'}
              {tool === 'draw'      && 'Click and drag to draw on the image'}
              {tool === 'highlight' && 'Click and drag to highlight an area'}
              {(tool === 'draw' || tool === 'highlight') && (
                <kbd style={{
                  fontSize: 10, padding: '1px 5px', borderRadius: 3,
                  background: 'rgba(255,255,255,.14)', color: 'var(--bg)',
                  fontFamily: 'inherit',
                }}>⌘Z to undo</kbd>
              )}
            </div>
          )}
        </div>

        {/* Right rail */}
        {showVersions ? (
          <VersionRail activeVersion={activeVersion} setActiveVersion={setActiveVersion}
            onClose={() => setShowVersions(false)} />
        ) : (
          <CommentRail pins={pins} activePin={activePin} setActivePin={setActivePin}
            file={file} ownerUser={ownerUser} setPins={setPins}
            reviewer={reviewer} />
        )}
      </div>

      {/* Review request modal */}
      {reviewModalOpen && (
        <ReviewModal file={file}
          onSubmit={submitReview}
          onClose={() => setReviewModalOpen(false)} />
      )}

      {/* Reviewer change menu — anchored to the chip */}
      {reviewerMenuOpen && reviewer && (
        <ReviewerMenu anchorRef={reviewerChipRef}
          currentId={reviewer.id}
          onChange={changeReviewer}
          onRemove={removeReviewer}
          onClose={() => setReviewerMenuOpen(false)} />
      )}
    </div>
  );
}

// ── State CTA — the single visible primary action that progresses the file ─
function StateCTA({ file, onRequestReview, onMarkFinal, onRequestApproval, onReopen }) {
  const baseStyle = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    height: 28, padding: '0 12px',
    fontSize: 12, fontWeight: 500, cursor: 'pointer',
  };
  switch (file.status) {
    case 'draft':
      return (
        <button onClick={onRequestReview} style={{ ...primaryBtn, ...baseStyle }}>
          <Icon name="eye" size={13} />
          Request review
        </button>
      );
    case 'review':
      return (
        <button onClick={onMarkFinal} style={{ ...primaryBtn, ...baseStyle }}>
          <Icon name="check" size={13} stroke={2} />
          Mark as final
        </button>
      );
    case 'final':
      return (
        <button onClick={onRequestApproval} style={{ ...primaryBtn, ...baseStyle }}>
          <Icon name="sparkle" size={13} />
          Request approval
        </button>
      );
    case 'approved':
      return (
        <button onClick={onReopen} style={{ ...ghostBtn, ...baseStyle }}>
          <Icon name="arrow-left" size={13} />
          Reopen
        </button>
      );
    default:
      return null;
  }
}

// ── Review request modal ───────────────────────────────────────────────────
function ReviewModal({ file, onSubmit, onClose }) {
  const teammates = TEAM.filter(t => !t.isMe);
  const [reviewerId, setReviewerId] = React.useState(teammates[0]?.id || '');
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const reviewer = TEAM.find(t => t.id === reviewerId);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(15,17,21,.35)',
      backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 990,
      animation: 'fadeInOpacity .15s ease both',
    }}
    onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        style={{
          width: 440, maxWidth: '92vw',
          background: 'var(--surface)',
          borderRadius: 14,
          boxShadow: '0 24px 60px -12px rgba(0,0,0,.30), 0 4px 16px rgba(0,0,0,.08)',
          overflow: 'hidden',
        }}>
        <div style={{ padding: '18px 20px 14px' }}>
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-.01em', color: 'var(--fg)' }}>
            Request review
          </div>
          <div style={{
            fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 4,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{file.title}</div>
        </div>

        <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Reviewer picker */}
          <div>
            <label style={{
              display: 'block', fontSize: 11, fontWeight: 500,
              color: 'var(--fg-muted)', textTransform: 'uppercase',
              letterSpacing: '.06em', marginBottom: 6,
            }}>Assign reviewer</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {teammates.map(p => {
                const active = reviewerId === p.id;
                return (
                  <button key={p.id} onClick={() => setReviewerId(p.id)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 7,
                      height: 32, padding: '0 10px 0 4px', borderRadius: 999,
                      background: active ? 'var(--accent-soft)' : 'var(--surface-2)',
                      border: `.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                      color: active ? 'var(--accent)' : 'var(--fg)',
                      fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
                      transition: 'background .12s, border-color .12s, color .12s',
                    }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: p.avatarBg, color: '#fff',
                      fontSize: 9, fontWeight: 700,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>{p.initials}</span>
                    {p.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional message */}
          <div>
            <label style={{
              display: 'block', fontSize: 11, fontWeight: 500,
              color: 'var(--fg-muted)', textTransform: 'uppercase',
              letterSpacing: '.06em', marginBottom: 6,
            }}>Optional message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`What should ${reviewer ? reviewer.name.split(' ')[0] : 'they'} look at?`}
              rows={3}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '8px 10px', borderRadius: 9,
                background: 'var(--surface-2)',
                border: '.5px solid var(--border)',
                fontFamily: 'inherit', fontSize: 12.5, color: 'var(--fg)',
                resize: 'vertical', minHeight: 64,
                outline: 'none',
              }} />
          </div>
        </div>

        <div style={{
          padding: '12px 16px',
          borderTop: '.5px solid var(--border)',
          display: 'flex', justifyContent: 'flex-end', gap: 8,
          background: 'var(--bg-canvas)',
        }}>
          <button onClick={onClose} style={{ ...ghostBtn, height: 30, padding: '0 12px', fontSize: 12 }}>
            Cancel
          </button>
          <button onClick={() => onSubmit(reviewerId, message)}
            disabled={!reviewerId}
            style={{
              ...primaryBtn, height: 30, padding: '0 14px', fontSize: 12,
              opacity: reviewerId ? 1 : .5,
              cursor: reviewerId ? 'pointer' : 'not-allowed',
            }}>
            <Icon name="eye" size={13} />
            Send for review
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Reviewer change/remove menu ────────────────────────────────────────────
function ReviewerMenu({ anchorRef, currentId, onChange, onRemove, onClose }) {
  const [pos, setPos] = React.useState(null);
  const ref = React.useRef(null);

  React.useLayoutEffect(() => {
    const r = anchorRef.current?.getBoundingClientRect();
    if (r) setPos({ left: r.left, top: r.bottom + 6 });
  }, [anchorRef]);

  React.useEffect(() => {
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)
          && !anchorRef.current?.contains(e.target)) onClose();
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [anchorRef, onClose]);

  if (!pos) return null;
  const teammates = TEAM.filter(t => !t.isMe);

  return (
    <div ref={ref} style={{
      position: 'fixed', left: pos.left, top: pos.top,
      width: 220,
      background: 'var(--surface)',
      border: '.5px solid var(--border)',
      borderRadius: 10,
      boxShadow: '0 14px 36px -10px rgba(0,0,0,.20), 0 2px 6px rgba(0,0,0,.06)',
      padding: 6,
      zIndex: 980,
      animation: 'fadeInOpacity .12s ease both',
    }}>
      <div style={{
        padding: '6px 10px 6px',
        fontSize: 10.5, fontWeight: 600, letterSpacing: '.06em',
        textTransform: 'uppercase', color: 'var(--fg-muted)',
      }}>Change reviewer</div>
      {teammates.map(p => {
        const isCurrent = p.id === currentId;
        return (
          <button key={p.id}
            onClick={() => !isCurrent && onChange(p.id)}
            disabled={isCurrent}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              width: '100%', padding: '7px 8px', borderRadius: 7,
              background: 'transparent', border: 0,
              color: isCurrent ? 'var(--fg-muted)' : 'var(--fg)',
              fontSize: 12.5, cursor: isCurrent ? 'default' : 'pointer',
              textAlign: 'left',
              transition: 'background .12s',
            }}
            onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.background = 'var(--surface-2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
            <span style={{
              width: 20, height: 20, borderRadius: '50%',
              background: p.avatarBg, color: '#fff',
              fontSize: 8.5, fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>{p.initials}</span>
            <span style={{ flex: 1 }}>{p.name.split(' ')[0]}</span>
            {isCurrent && <Icon name="check" size={12} stroke={2} style={{ color: 'var(--accent)' }} />}
          </button>
        );
      })}
      <div style={{ height: 1, background: 'var(--border)', margin: '6px 4px' }} />
      <button onClick={onRemove}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          width: '100%', padding: '7px 8px', borderRadius: 7,
          background: 'transparent', border: 0,
          color: 'hsl(4 60% 48%)',
          fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
          textAlign: 'left',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(4 80% 97%)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
        <Icon name="arrow-left" size={13} stroke={1.7} />
        Cancel review request
      </button>
    </div>
  );
}

function CommentRail({ pins, activePin, setActivePin, file, ownerUser, setPins, reviewer }) {
  const status = STATUS_META[file.status] || STATUS_META.draft;
  return (
    <aside style={{
      width: 320, flexShrink: 0,
      borderLeft: '.5px solid var(--border)',
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', minHeight: 0,
    }}>
      {/* Status context block — quietly reinforces what state the file is
          in and who's blocking it. No controls live here; progression
          happens via the toolbar CTA. */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '.5px solid var(--border)',
        display: 'flex', flexDirection: 'column', gap: 4,
        background: 'var(--bg-canvas)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          fontSize: 12, fontWeight: 500, color: 'var(--fg)',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: 999,
            background: status.dot, flexShrink: 0,
          }} />
          Status · {status.label}
        </div>
        {reviewer ? (
          <div style={{
            fontSize: 11.5, color: 'var(--fg-muted)',
            marginLeft: 13,
          }}>
            Waiting on <span style={{ color: 'var(--fg)', fontWeight: 500 }}>{reviewer.name.split(' ')[0]}</span>
          </div>
        ) : file.status === 'final' ? (
          <div style={{ fontSize: 11.5, color: 'var(--fg-muted)', marginLeft: 13 }}>
            Marked final — request approval when ready
          </div>
        ) : file.status === 'approved' ? (
          <div style={{ fontSize: 11.5, color: 'var(--fg-muted)', marginLeft: 13 }}>
            Approved — locked for changes
          </div>
        ) : (
          <div style={{ fontSize: 11.5, color: 'var(--fg-muted)', marginLeft: 13 }}>
            Draft — request review when ready
          </div>
        )}
      </div>

      <div style={{
        padding: '14px 16px',
        borderBottom: '.5px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Comments</div>
          <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>
            {pins.length} threads · {file.comments} replies
          </div>
        </div>
        <button style={iconBtnStyle()}><Icon name="more" size={14} /></button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
        {pins.map((p, i) => {
          const author = TEAM.find(t => t.id === p.author) || TEAM[0];
          const isActive = activePin === p.id;
          return (
            <div key={p.id}
              onClick={() => setActivePin(p.id)}
              style={{
                padding: '14px 16px', cursor: 'pointer',
                background: isActive ? 'var(--accent-soft)' : 'transparent',
                borderLeft: '2px solid', borderLeftColor: isActive ? 'var(--accent)' : 'transparent',
                transition: 'background .12s',
              }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50% 50% 50% 4px',
                  background: 'var(--accent)', color: '#fff', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 600,
                  marginTop: 2,
                }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <Avatar user={author} size={18} />
                    <span style={{ fontSize: 12, fontWeight: 500 }}>{author.name.split(' ')[0]}</span>
                    <span style={{ fontSize: 11, color: 'var(--fg-muted)' }}>· {p.time}</span>
                  </div>
                  {isActive ? (
                    <textarea
                      value={p.body || ''}
                      autoFocus={!p.body}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setPins(prev => prev.map(x => x.id === p.id ? { ...x, body: e.target.value } : x))}
                      placeholder={p.strokeId ? 'Comment on this drawing…' : 'Type a comment…'}
                      rows={3}
                      style={{
                        width: '100%', boxSizing: 'border-box', marginTop: 6,
                        padding: '7px 9px', borderRadius: 8,
                        background: 'var(--surface)',
                        border: '.5px solid var(--border)',
                        fontFamily: 'inherit', fontSize: 12.5, color: 'var(--fg)',
                        lineHeight: 1.45,
                        resize: 'vertical', minHeight: 56,
                        outline: 'none',
                      }}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-soft)'; }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }} />
                  ) : (
                    <div style={{ fontSize: 12.5, color: 'var(--fg)', lineHeight: 1.45, marginTop: 6 }}>
                      {p.body || <span style={{ color: 'var(--fg-muted)', fontStyle: 'italic' }}>
                        {p.strokeId ? 'Comment on this drawing…' : 'Type a comment…'}
                      </span>}
                    </div>
                  )}
                  {isActive && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 10, fontSize: 11 }}>
                      <button style={{
                        padding: '4px 10px', borderRadius: 6, border: 0,
                        background: 'var(--surface-2)', color: 'var(--fg)',
                        fontSize: 11, fontWeight: 500, cursor: 'pointer',
                      }}>Reply</button>
                      <button style={{
                        padding: '4px 10px', borderRadius: 6, border: 0,
                        background: 'transparent', color: 'var(--fg-muted)',
                        fontSize: 11, fontWeight: 500, cursor: 'pointer',
                      }}>Resolve</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply box */}
      <div style={{
        padding: 12, borderTop: '.5px solid var(--border)',
        display: 'flex', gap: 10, alignItems: 'center',
      }}>
        <Avatar user={TEAM[0]} size={26} />
        <div style={{
          flex: 1, padding: '7px 12px', borderRadius: 999,
          background: 'var(--surface-2)', border: '.5px solid var(--border)',
          fontSize: 12, color: 'var(--fg-muted)', cursor: 'text',
        }}>Add a comment…</div>
      </div>
    </aside>
  );
}

function VersionRail({ activeVersion, setActiveVersion, onClose }) {
  return (
    <aside style={{
      width: 320, flexShrink: 0,
      borderLeft: '.5px solid var(--border)',
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', minHeight: 0,
    }}>
      <div style={{
        padding: '14px 16px', borderBottom: '.5px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Version history</div>
          <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>
            Draft → In review → Final → Approved
          </div>
        </div>
        <button onClick={onClose} style={iconBtnStyle()}>
          <Icon name="arrow-left" size={14} />
        </button>
      </div>

      {/* Status timeline */}
      <div style={{ padding: '20px 18px', borderBottom: '.5px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {[
            { id: 'draft', label: 'Draft', done: true },
            { id: 'review', label: 'Review', done: true, current: true },
            { id: 'final', label: 'Final', done: false },
            { id: 'approved', label: 'Approved', done: false },
          ].map((s, i, arr) => (
            <React.Fragment key={s.id}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: s.current ? 'var(--accent)' : s.done ? 'var(--fg)' : 'var(--surface-2)',
                  border: '.5px solid', borderColor: s.done || s.current ? 'transparent' : 'var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 9,
                  boxShadow: s.current ? '0 0 0 4px var(--accent-soft)' : 'none',
                }}>
                  {s.done && !s.current && <Icon name="check" size={10} stroke={2.5} />}
                  {s.current && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 500,
                  color: s.current ? 'var(--accent)' : s.done ? 'var(--fg)' : 'var(--fg-muted)',
                }}>{s.label}</span>
              </div>
              {i < arr.length - 1 && (
                <div style={{
                  flex: 1, height: 1, marginBottom: 18,
                  background: arr[i + 1].done || arr[i + 1].current ? 'var(--fg)' : 'var(--border)',
                }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Version list */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
        {VERSIONS.map((v, i) => {
          const author = TEAM.find(t => t.id === v.author) || TEAM[0];
          const isActive = activeVersion === v.v;
          return (
            <button key={v.v} onClick={() => setActiveVersion(v.v)}
              style={{
                width: '100%', padding: '14px 16px', textAlign: 'left',
                background: isActive ? 'var(--accent-soft)' : 'transparent',
                border: 0, borderLeft: '2px solid', borderLeftColor: isActive ? 'var(--accent)' : 'transparent',
                cursor: 'pointer', transition: 'background .12s',
                display: 'flex', gap: 12, alignItems: 'flex-start',
              }}>
              <div style={{
                fontSize: 13, fontWeight: 600,
                color: isActive ? 'var(--accent)' : 'var(--fg)',
                fontVariantNumeric: 'tabular-nums',
                flexShrink: 0, paddingTop: 1,
              }}>{v.v}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Avatar user={author} size={16} />
                  <span style={{ fontSize: 11.5, fontWeight: 500 }}>{author.name.split(' ')[0]}</span>
                  <span style={{ fontSize: 11, color: 'var(--fg-muted)' }}>· {v.time}</span>
                  {v.current && (
                    <span style={{
                      marginLeft: 'auto', fontSize: 10, fontWeight: 500,
                      padding: '1px 6px', borderRadius: 4,
                      background: 'var(--accent)', color: '#fff',
                    }}>Current</span>
                  )}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', lineHeight: 1.5 }}>
                  {v.note}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

window.PreviewView = PreviewView;
