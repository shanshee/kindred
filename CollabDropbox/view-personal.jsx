// Personal space — priority-driven work dashboard.
//
// Default view groups files into three priority bands:
//   1. Needs your attention — interrupts (review status, unread, mentions)
//   2. In progress           — active work others have engaged with (comments > 0)
//   3. Drafts                — private/unshared drafts (no engagement yet)
//
// Filters take a secondary, type-tab position. When a filter is active, the
// view collapses to a flat grid for that status.

// Roughly orders relative timestamps ("just now" → "2h ago" → "Yesterday" → "3d ago").
function recencyRank(u) {
  if (!u) return 999999;
  const s = String(u).toLowerCase();
  if (s.includes('just')) return 0;
  if (s.includes('m ago')) return parseInt(s) || 1;
  if (s.includes('h ago')) return (parseInt(s) || 1) * 60;
  if (s.includes('yesterday')) return 60 * 24;
  if (s.includes('d ago')) return (parseInt(s) || 1) * 60 * 24;
  return 50000;
}

// Display name for a person id. 'me' reads as "Yusuf" in shared/team
// contexts (the pool), where "You" would feel out of place.
function displayName(id) {
  const p = TEAM.find(t => t.id === id);
  if (!p) return null;
  return p.isMe ? 'Yusuf' : p.name.split(' ')[0];
}

// First team a person belongs to (used to show who routed pool work in).
function teamNameFor(id) {
  return TEAMS.find(t => t.members.includes(id))?.name || null;
}

function PersonalView({ person, density, onBack, onFileOpen, dragState, setDragState, files, onAssignFile }) {
  const myFiles = files.filter(f => f.owner === person.id);
  const dense = density === 'compact';
  const isMe = !!person.isMe;
  const isPool = !!person.isPool;

  const counts = {
    draft:    myFiles.filter(f => f.status === 'draft').length,
    review:   myFiles.filter(f => f.status === 'review').length,
    final:    myFiles.filter(f => f.status === 'final').length,
    approved: myFiles.filter(f => f.status === 'approved').length,
  };

  const [filter, setFilter] = React.useState('all');

  // ── Priority buckets (used when filter === 'all') ───────────────────────
  const needsAttention = myFiles.filter(f =>
    f.status === 'review' || (f.unread || 0) > 0 || f.mentionsMe
  );
  const attentionIds = new Set(needsAttention.map(f => f.id));
  const inProgress = myFiles.filter(f =>
    !attentionIds.has(f.id)
    && ['draft', 'final'].includes(f.status)
    && (f.comments || 0) > 0
  );
  const drafts = myFiles.filter(f =>
    !attentionIds.has(f.id)
    && f.status === 'draft'
    && (f.comments || 0) === 0
  );

  // Header summary signals — short, scannable, only what's non-zero.
  const newCommentsTotal = myFiles.reduce((sum, f) => sum + (f.unread || 0), 0);
  const summaryBits = [];
  if (counts.review > 0) {
    summaryBits.push(`${counts.review} ${isMe ? 'waiting on your review' : 'in review'}`);
  }
  if (newCommentsTotal > 0) {
    summaryBits.push(`${newCommentsTotal} new comment${newCommentsTotal === 1 ? '' : 's'}`);
  }
  if (counts.draft > 0) {
    summaryBits.push(`${counts.draft} draft${counts.draft === 1 ? '' : 's'}`);
  }

  const filterDef = [
    { id: 'all',      label: 'All',       count: myFiles.length },
    { id: 'draft',    label: 'Drafts',    count: counts.draft },
    { id: 'review',   label: 'In review', count: counts.review },
    { id: 'final',    label: 'Final',     count: counts.final },
    { id: 'approved', label: 'Approved',  count: counts.approved },
  ];
  const filteredFlat = filter === 'all' ? null : myFiles.filter(f => f.status === filter);

  // ── Right-panel data ────────────────────────────────────────────────────
  // Files this person cares about right now: their own + ones they've been
  // pulled into. Drives the activity feed.
  const involvedFiles = files.filter(f =>
    f.owner === person.id || (f.mentionsMe && isMe) || (f.requestedBy === person.id)
  );

  const updatedTodayCount = myFiles.filter(f => /just|m ago|h ago/i.test(f.updated)).length;
  // Insights are written as actionable observations — first the number (which
  // we render bold in the panel), then a phrase that tells the user what to do
  // about it. We avoid generic "X comments across Y" language.
  const insights = [];
  if (newCommentsTotal > 0) {
    insights.push({
      n: newCommentsTotal,
      text: isMe
        ? `new comment${newCommentsTotal === 1 ? '' : 's'} need your attention`
        : `new comment${newCommentsTotal === 1 ? '' : 's'} on their files`,
    });
  }
  if (updatedTodayCount > 0) {
    insights.push({
      n: updatedTodayCount,
      text: isMe
        ? `file${updatedTodayCount === 1 ? '' : 's'} were updated by your team today`
        : `file${updatedTodayCount === 1 ? '' : 's'} updated today`,
    });
  }
  if (counts.review > 0) {
    insights.push({
      n: counts.review,
      text: isMe
        ? `waiting on your review`
        : `in review`,
    });
  }

  // Most-recent file the user could resume — never the same as the top of
  // the attention list, since that already has its own emphasis.
  const continueWorkingFile = [...myFiles]
    .filter(f => !needsAttention.some(a => a.id === f.id))
    .sort((a, b) => recencyRank(a.updated) - recencyRank(b.updated))[0]
    || myFiles.sort((a, b) => recencyRank(a.updated) - recencyRank(b.updated))[0];

  // Activity feed: one event per involved file, prioritized
  // (commented > sent for review > updated). Sorted by recency.
  const activity = involvedFiles.map(f => {
    const owner = TEAM.find(p => p.id === f.owner);
    let actor, verb;
    if ((f.unread || 0) > 0 && f.owner !== person.id) {
      // Comment from the file's owner on a file the viewer is involved with
      actor = owner; verb = 'commented on';
    } else if ((f.unread || 0) > 0 && f.owner === person.id) {
      // Someone else commented on the viewer's file — pick a stable teammate
      const others = TEAM.filter(t => t.id !== person.id);
      actor = others[(f.id.charCodeAt(f.id.length - 1) || 0) % others.length];
      verb = 'commented on';
    } else if (f.status === 'review') {
      actor = owner; verb = 'sent for review';
    } else {
      actor = owner; verb = 'updated';
    }
    return { id: f.id, actor, verb, file: f, time: f.updated };
  })
  .filter(a => a.actor) // skip if actor lookup failed
  .sort((a, b) => recencyRank(a.time) - recencyRank(b.time))
  .slice(0, 7);

  return (
    <div style={{
      flex: 1, overflow: 'auto',
      background: 'var(--bg-canvas)',
    }}>
      <div style={{
        display: 'flex', gap: 36,
        padding: dense ? '12px 32px 60px' : '14px 32px 80px',
        alignItems: 'flex-start',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
      {/* Header — identity + scannable signals. No eyebrow; the topbar
          crumb already establishes location. */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 22,
        marginBottom: 36,
      }}>
        <Avatar user={person} size={64} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            margin: 0, fontSize: 28, fontWeight: 500, letterSpacing: '-.02em',
            display: 'flex', alignItems: 'center', gap: 10, color: 'var(--fg)',
            lineHeight: 1.1,
          }}>
            {person.name}
            {person.online && <span style={{
              fontSize: 11, fontWeight: 500, color: 'hsl(150 55% 32%)',
              background: 'hsl(150 55% 96%)', padding: '3px 8px', borderRadius: 999,
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'hsl(150 55% 48%)' }} />
              Online
            </span>}
          </h1>
          <div style={{ fontSize: 13.5, color: 'var(--fg-muted)', marginTop: 6 }}>
            {person.role}
          </div>
          {summaryBits.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
              marginTop: 10, fontSize: 12.5,
              color: 'var(--fg)', fontWeight: 500,
            }}>
              {summaryBits.map((bit, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span style={{ opacity: .3, color: 'var(--fg-muted)' }}>·</span>}
                  <span>{bit}</span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button style={ghostBtn}>
            <Icon name="comment" size={14} />
            Message
          </button>
          <button style={primaryBtn}>
            <Icon name="plus" size={14} stroke={2} />
            Assign work
          </button>
        </div>
      </div>

      {/* Subtle filter tabs — quieter than the sections; right-aligned, no
          divider line. Secondary to the priority hierarchy below. */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        marginBottom: 18, gap: 14,
      }}>
        <span style={{
          fontSize: 11, fontWeight: 400, letterSpacing: '.04em',
          textTransform: 'uppercase', color: 'var(--fg-muted)',
          opacity: .7,
          marginRight: 'auto',
        }}>
          {filter === 'all' ? 'Sorted by priority' : `Filter · ${filterDef.find(f => f.id === filter)?.label}`}
        </span>
        <div style={{ display: 'flex', gap: 14 }}>
          {filterDef.map(c => {
            const active = filter === c.id;
            return (
              <button key={c.id} onClick={() => setFilter(c.id)}
                style={{
                  display: 'inline-flex', alignItems: 'baseline', gap: 4,
                  padding: 0, border: 0, background: 'transparent',
                  color: active ? 'rgba(21,23,27,.78)' : 'rgba(21,23,27,.45)',
                  fontSize: 11.5, fontWeight: active ? 500 : 400,
                  cursor: 'pointer',
                  transition: 'color .12s, font-weight .12s',
                }}>
                {c.label}
                <span style={{
                  fontSize: 10, opacity: .55,
                  fontVariantNumeric: 'tabular-nums', fontWeight: 400,
                }}>{c.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sections (priority view) or flat list (filtered view) */}
      {filter === 'all' ? (
        myFiles.length === 0 ? (
          <PersonalEmpty isMe={isMe} />
        ) : (
          <>
            <WorkSection
              title={isPool ? 'In review' : 'Needs your attention'}
              hint={isPool ? 'Work currently being reviewed'
                : (isMe ? 'Reviews, mentions, and new comments' : 'Open reviews and fresh activity')}
              files={needsAttention}
              isMe={isMe}
              isPool={isPool}
              onFileOpen={onFileOpen}
              emptyMessage={isPool ? 'Nothing in review.'
                : (isMe ? 'You’re all caught up.' : 'Nothing waiting.')}
              emphasis
            />
            {(inProgress.length > 0 || drafts.length === 0) && (
              <WorkSection
                title="In progress"
                hint={isMe ? 'What you’re actively working on' : 'Active work others have engaged with'}
                files={inProgress}
                isMe={isMe}
                isPool={isPool}
                onFileOpen={onFileOpen}
                emptyMessage="Nothing in progress."
                hideWhenEmpty={drafts.length > 0}
              />
            )}
            {drafts.length > 0 && (
              <WorkSection
                title={isPool ? 'Awaiting owner' : 'Drafts'}
                hint={isPool ? 'Unclaimed — needs an owner'
                  : (isMe ? 'Not yet shared' : 'Unshared drafts')}
                files={drafts}
                isMe={isMe}
                isPool={isPool}
                onFileOpen={onFileOpen}
                hideStatusPill
              />
            )}
          </>
        )
      ) : (
        filteredFlat.length > 0 ? (
          <WorkGrid files={filteredFlat} isMe={isMe} onFileOpen={onFileOpen} />
        ) : (
          <div style={{
            padding: '60px 20px', textAlign: 'center',
            color: 'var(--fg-muted)', fontSize: 13,
            border: '.5px dashed var(--border-strong)',
            borderRadius: 12,
          }}>
            No files in this status.
          </div>
        )
      )}
        </div>

        <RightPanel
          isMe={isMe}
          continueWorkingFile={continueWorkingFile}
          insights={insights}
          activity={activity}
          onFileOpen={onFileOpen}
        />
      </div>
    </div>
  );
}

// ── Right-side context panel ───────────────────────────────────────────────
// Sticky within the personal view's scroll container. Three sections, each
// a quiet vertical list — soft hairline dividers, no boxed cards.
function RightPanel({ isMe, continueWorkingFile, insights, activity, onFileOpen }) {
  return (
    <aside style={{
      width: 320, flexShrink: 0,
      position: 'sticky', top: 0,
      alignSelf: 'flex-start',
      // Soft tint anchors the panel as a tool surface — distinct from the
      // canvas, but lighter than any card so it doesn't compete.
      background: 'rgba(15,17,21,.022)',
      borderRadius: 16,
      padding: '20px 18px',
    }}>
      {continueWorkingFile && (
        <PanelSection title={isMe ? 'Pick up where you left off' : 'Their latest work'}>
          <button
            onClick={() => onFileOpen?.(continueWorkingFile)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              width: '100%', padding: '8px 6px', borderRadius: 8,
              background: 'transparent', border: 0,
              cursor: 'pointer', textAlign: 'left',
              transition: 'background .12s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--surface)';
              const arrow = e.currentTarget.querySelector('[data-cw-arrow]');
              if (arrow) arrow.style.transform = 'translateX(2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              const arrow = e.currentTarget.querySelector('[data-cw-arrow]');
              if (arrow) arrow.style.transform = 'translateX(0)';
            }}>
            <div style={{
              width: 44, height: 44, borderRadius: 8, flexShrink: 0,
              background: continueWorkingFile.thumb,
              boxShadow: 'inset 0 0 0 .5px rgba(0,0,0,.06)',
              position: 'relative', overflow: 'hidden',
            }}>
              <MockArt fileId={continueWorkingFile.id} variant="thumb" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12.5, fontWeight: 500, color: 'var(--fg)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                letterSpacing: '-.005em',
              }}>{continueWorkingFile.title}</div>
              <div style={{
                fontSize: 11, color: 'var(--fg-muted)', marginTop: 2,
              }}>
                Last opened {continueWorkingFile.updated}
              </div>
            </div>
            <Icon name="chevron-r" size={14} stroke={1.8}
              style={{
                color: 'var(--fg-muted)', flexShrink: 0,
                transition: 'transform .15s cubic-bezier(.3,.7,.4,1)',
              }}
              data-cw-arrow="" />
          </button>
        </PanelSection>
      )}

      {insights.length > 0 && (
        <PanelSection title="Quick insights">
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {insights.map((it, i) => (
              <li key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 0',
                fontSize: 12, color: 'var(--fg)', lineHeight: 1.45,
              }}>
                <span style={{
                  width: 4, height: 4, borderRadius: 999,
                  background: 'var(--fg-muted)', flexShrink: 0, opacity: .5,
                }} />
                <span>
                  <span style={{ fontWeight: 600 }}>{it.n}</span>{' '}
                  <span style={{ color: 'rgba(21,23,27,.7)' }}>{it.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </PanelSection>
      )}

      {activity.length > 0 && (
        <PanelSection title="Activity" last>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {activity.map((item, i) => (
              <ActivityRow key={item.id} item={item}
                isLast={i === activity.length - 1}
                onOpen={() => onFileOpen?.(item.file)} />
            ))}
          </div>
          <button style={{
            marginTop: 10, padding: '6px 0',
            background: 'transparent', border: 0,
            color: 'var(--fg-muted)', fontSize: 11.5, fontWeight: 500,
            cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 4,
            transition: 'color .12s, gap .15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--fg)'; e.currentTarget.style.gap = '6px'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fg-muted)'; e.currentTarget.style.gap = '4px'; }}>
            View all activity
            <Icon name="chevron-r" size={11} stroke={1.8} />
          </button>
        </PanelSection>
      )}
    </aside>
  );
}

function PanelSection({ title, children, last }) {
  return (
    <div style={{
      paddingBottom: last ? 0 : 18,
      marginBottom: last ? 0 : 18,
      borderBottom: last ? 0 : '.5px solid rgba(15,17,21,.06)',
    }}>
      <div style={{
        fontSize: 10.5, fontWeight: 600, letterSpacing: '.08em',
        textTransform: 'uppercase', color: 'var(--fg-muted)',
        marginBottom: 12,
      }}>{title}</div>
      {children}
    </div>
  );
}

function ActivityRow({ item, isLast, onOpen }) {
  const { actor, verb, file, time } = item;
  const isUnread = (file.unread || 0) > 0;
  return (
    <button onClick={onOpen}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '10px 8px', borderRadius: 7,
        background: 'transparent', border: 0,
        // Hairline divider between rows — uses the panel's tint level so the
        // line reads as separation, not a heavy border.
        borderBottom: isLast ? 0 : '.5px solid rgba(15,17,21,.05)',
        cursor: 'pointer', textAlign: 'left',
        width: '100%',
        transition: 'background .12s',
        position: 'relative',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
        background: actor.avatarBg, color: '#fff',
        fontSize: 9, fontWeight: 700, letterSpacing: '.02em',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: 1,
        position: 'relative',
      }}>
        {actor.initials}
        {isUnread && (
          <span style={{
            position: 'absolute', top: -1, right: -1,
            width: 7, height: 7, borderRadius: 999,
            background: 'hsl(4 55% 56%)',
            boxShadow: '0 0 0 1.5px rgba(15,17,21,.022)',
          }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, color: 'var(--fg)', lineHeight: 1.45,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {/* Bold actor + verb together — the action phrase pops. File title
              follows in a quieter weight to keep the row scannable. */}
          <span style={{ fontWeight: 600, color: 'var(--fg)' }}>
            {actor.isMe ? 'You' : actor.name.split(' ')[0]} {verb}
          </span>
          {' '}<span style={{ color: 'rgba(21,23,27,.62)', fontWeight: 400 }}>{file.title}</span>
        </div>
        <div style={{
          fontSize: 10.5, color: 'var(--fg-muted)', marginTop: 2,
        }}>
          {time}
        </div>
      </div>
    </button>
  );
}

// ── Section ────────────────────────────────────────────────────────────────
// Emphasis lifts the heading typography only — we explicitly DON'T wrap the
// section in a tinted container, since that creates dead space when there
// are few items. Visual priority comes from heading scale + the first card
// carrying slightly more weight.
function WorkSection({ title, hint, files, isMe, isPool, onFileOpen, emptyMessage, hideStatusPill, hideWhenEmpty, emphasis }) {
  if (files.length === 0 && (hideWhenEmpty || !emptyMessage)) return null;
  return (
    <section style={{ marginBottom: 32 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 10,
        marginBottom: emphasis ? 14 : 12,
      }}>
        <h2 style={{
          margin: 0,
          fontSize: emphasis ? 16 : 14,
          fontWeight: 600,
          letterSpacing: '-.012em', color: 'var(--fg)',
          lineHeight: 1.15,
        }}>{title}</h2>
        {files.length > 0 && (
          <span style={{
            fontSize: emphasis ? 12.5 : 11.5, color: 'var(--fg-muted)',
            fontVariantNumeric: 'tabular-nums', fontWeight: 500,
          }}>{files.length}</span>
        )}
        {hint && <span style={{
          marginLeft: 4,
          fontSize: 11.5, fontWeight: 400,
          color: 'rgba(21,23,27,.48)',
        }}>{hint}</span>}
      </div>
      {files.length > 0 ? (
        <WorkGrid files={files} isMe={isMe} isPool={isPool} onFileOpen={onFileOpen}
          hideStatusPill={hideStatusPill}
          layout={emphasis ? 'flex' : 'grid'}
          firstEmphasis={emphasis} />
      ) : (
        <div style={{
          padding: '20px 0',
          color: 'var(--fg-muted)', fontSize: 13,
        }}>
          {emptyMessage}
        </div>
      )}
    </section>
  );
}

// Flex layout for the priority section: cards keep a fixed width so they sit
// intentionally on the left when there's just one, and wrap cleanly into rows
// when there are many. Grid layout for secondary sections — they fill rows.
function WorkGrid({ files, isMe, isPool, onFileOpen, hideStatusPill, layout = 'grid', firstEmphasis }) {
  if (layout === 'flex') {
    return (
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        {files.map((f, i) => (
          <div key={f.id} className="fade-in"
            style={{
              width: 256, flexShrink: 0,
              animationDelay: `${i * 40}ms`,
            }}>
            <WorkCard file={f} isMe={isMe} isPool={isPool}
              hideStatusPill={hideStatusPill}
              emphasis={firstEmphasis && i === 0}
              onOpen={() => onFileOpen?.(f)} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
      gap: 14,
    }}>
      {files.map(f => (
        <WorkCard key={f.id} file={f} isMe={isMe} isPool={isPool} hideStatusPill={hideStatusPill}
          onOpen={() => onFileOpen?.(f)} />
      ))}
    </div>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────
// Activity signal answers "what's new on this file?" — chosen by priority.
// A muted accent dot precedes high-attention signals (mention, new comments)
// for visual consistency with the workspace dashboard's hero indicator.
function WorkCard({ file, isMe, isPool, onOpen, hideStatusPill, emphasis }) {
  const [hover, setHover] = React.useState(false);

  const signal = (() => {
    // Pool (Design Team) cards answer "who owns this right now?" —
    // a named reviewer, or who routed it in and from which team.
    if (isPool) {
      if (file.status === 'review') {
        const r = displayName(file.reviewer);
        return { text: r ? `In review by ${r}` : 'In review', accent: false };
      }
      const by = displayName(file.assignedBy);
      const team = teamNameFor(file.assignedBy);
      if (by) {
        return { text: team ? `Assigned by ${by} · ${team}` : `Assigned by ${by}`, accent: false };
      }
      return null;
    }
    if (file.mentionsMe && isMe) return { text: 'You were mentioned', accent: true };
    if ((file.unread || 0) > 0) {
      const n = file.unread;
      const noun = n === 1 ? 'comment' : 'comments';
      // Action-oriented phrasing for the file's owner; passive for observers.
      const text = isMe ? `${n} new ${noun} to review` : `${n} new ${noun}`;
      return { text, accent: true };
    }
    if (file.status === 'review') {
      return { text: isMe ? 'Needs your review' : 'Awaiting review', accent: false };
    }
    return null;
  })();

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onOpen}
      style={{
        position: 'relative',
        background: 'var(--surface)',
        border: '.5px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'pointer',
        transform: hover ? 'translateY(-1px)' : 'none',
        transition: 'transform .18s cubic-bezier(.3,.7,.4,1), box-shadow .18s, border-color .18s',
        boxShadow: hover
          ? '0 10px 26px -12px rgba(0,0,0,.14), 0 1px 2px rgba(0,0,0,.04)'
          : emphasis
            ? '0 4px 14px -5px rgba(0,0,0,.09), 0 1px 2px rgba(0,0,0,.05)'
            : '0 1px 0 rgba(0,0,0,.02), 0 1px 2px rgba(0,0,0,.03)',
        userSelect: 'none',
      }}
    >
      {/* Thumbnail */}
      <div style={{
        position: 'relative', height: 132,
        background: file.thumb,
      }}>
        <MockArt fileId={file.id} variant="thumb" />
        <div style={{
          position: 'absolute', top: 10, left: 10,
          padding: '2px 6px', borderRadius: 4,
          background: KIND_META[file.kind]?.color || '#999',
          color: '#fff',
          fontSize: 9.5, fontWeight: 700, letterSpacing: '.04em',
        }}>{file.kind}</div>

        {/* Hover affordance — minimal text-only pill */}
        <div style={{
          position: 'absolute', bottom: 10, right: 10,
          padding: '3px 9px', borderRadius: 999,
          background: 'rgba(255,255,255,.92)',
          border: '.5px solid rgba(15,17,21,.06)',
          fontSize: 10.5, fontWeight: 500, color: 'var(--fg)',
          backdropFilter: 'blur(6px)',
          opacity: hover ? 1 : 0,
          transform: hover ? 'translateY(0)' : 'translateY(2px)',
          transition: 'opacity .15s, transform .18s cubic-bezier(.3,.7,.4,1)',
          pointerEvents: 'none',
        }}>
          {file.status === 'review' ? 'Review' : 'Open'}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '12px 14px 13px' }}>
        <div style={{
          fontSize: 13.5, fontWeight: 500, letterSpacing: '-.005em',
          color: 'var(--fg)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: signal || !hideStatusPill ? 8 : 6,
        }}>{file.title}</div>

        {(!hideStatusPill || signal) && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
            marginBottom: 6,
          }}>
            {!hideStatusPill && <StatusPill status={file.status} />}
            {signal && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 11.5, fontWeight: 500,
                color: signal.accent ? 'var(--fg)' : 'var(--fg-muted)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {signal.accent && (
                  <span style={{
                    width: 5, height: 5, borderRadius: 999,
                    background: 'hsl(4 55% 56%)', flex: 'none',
                  }} />
                )}
                {signal.text}
              </span>
            )}
          </div>
        )}

        <div style={{
          fontSize: 11, color: 'var(--fg-muted)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          Updated {file.updated}
        </div>
      </div>
    </div>
  );
}

function PersonalEmpty({ isMe }) {
  return (
    <div style={{
      padding: '80px 20px', textAlign: 'center',
      color: 'var(--fg-muted)', fontSize: 13,
      border: '.5px dashed var(--border-strong)',
      borderRadius: 14,
      background: 'var(--surface)',
    }}>
      <div style={{
        fontSize: 15, fontWeight: 500, color: 'var(--fg)', marginBottom: 4,
      }}>{isMe ? 'No active work yet' : 'No files yet'}</div>
      <div>{isMe ? 'Files you own will show up here.' : `${(isMe ? 'You' : 'They').toString()} haven’t started anything in this workspace.`}</div>
    </div>
  );
}

window.PersonalView = PersonalView;
