// Share / Delivery view — polished external presentation page

function ShareView({ file, onBack }) {
  const owner = TEAM.find(t => t.id === file.owner);
  const collaborators = TEAM.filter(t => t.id !== file.owner).slice(0, 3);

  return (
    <div style={{
      flex: 1, overflow: 'auto',
      background: 'var(--bg-canvas)',
    }}>
      {/* Top ribbon — feels like a public page, lighter chrome */}
      <div style={{
        height: 52, padding: '0 32px',
        display: 'flex', alignItems: 'center', gap: 16,
        borderBottom: '.5px solid var(--border)',
        background: 'var(--bg)',
      }}>
        <button onClick={onBack} style={{ ...ghostBtn, height: 28, padding: '0 10px', fontSize: 12 }}>
          <Icon name="arrow-left" size={14} />
          Back
        </button>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 12px 5px 8px',
          borderRadius: 999,
          background: 'var(--surface-2)',
          border: '.5px solid var(--border)',
          fontSize: 12, color: 'var(--fg-muted)',
        }}>
          <Icon name="link" size={13} />
          kindred.app/s/aria-hero-9c2f
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={ghostBtn}>
            <Icon name="comment" size={14} />
            Comment
          </button>
          <button style={ghostBtn}>
            <Icon name="download" size={14} />
            Download
          </button>
          <button style={primaryBtn}>
            <Icon name="link" size={14} />
            Copy link
          </button>
        </div>
      </div>

      {/* Hero */}
      <div style={{
        maxWidth: 960, margin: '0 auto', padding: '48px 32px 80px',
      }}>
        {/* Meta strip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18,
          fontSize: 12, color: 'var(--fg-muted)',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'hsl(150 55% 48%)',
            }} />
            <span style={{ color: 'hsl(150 55% 32%)', fontWeight: 500 }}>Approved</span>
          </span>
          <span>·</span>
          <span>Aria — Mobile App</span>
          <span>·</span>
          <span>Delivered {file.updated}</span>
        </div>

        {/* Title */}
        <h1 style={{
          margin: 0, fontSize: 44, fontWeight: 500, letterSpacing: '-.03em',
          lineHeight: 1.05, color: 'var(--fg)',
        }}>
          {file.title}
        </h1>
        <p style={{
          margin: '16px 0 32px', fontSize: 17, lineHeight: 1.55, color: 'var(--fg-muted)',
          maxWidth: 640, textWrap: 'pretty',
        }}>
          The lead frame for the new home experience — calmer composition, warmer palette,
          and a single clear call-to-action. Final hand-off includes 1× and 2× exports plus
          editable source.
        </p>

        {/* Hero preview */}
        <div style={{
          position: 'relative',
          aspectRatio: '16 / 10',
          borderRadius: 18,
          background: file.thumb,
          boxShadow: '0 30px 80px -30px rgba(0,0,0,.25), 0 1px 0 rgba(255,255,255,.5) inset',
          overflow: 'hidden',
          marginBottom: 24,
        }}>
          <MockArt fileId={file.id} variant="hero" />

          {/* Floating action bar */}
          <div style={{
            position: 'absolute', bottom: 18, right: 18,
            display: 'flex', gap: 4, padding: 4,
            background: 'rgba(20,15,10,.72)',
            backdropFilter: 'blur(20px)',
            borderRadius: 10,
          }}>
            {[
              { icon: 'eye', label: 'View' },
              { icon: 'download', label: 'Download' },
              { icon: 'comment', label: 'Comment' },
            ].map(b => (
              <button key={b.label} title={b.label} style={{
                width: 30, height: 30, borderRadius: 7, border: 0,
                background: 'transparent', color: '#fff',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: .85,
              }}>
                <Icon name={b.icon} size={14} />
              </button>
            ))}
          </div>
        </div>

        {/* File meta strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 0,
          background: 'var(--surface)',
          border: '.5px solid var(--border)',
          borderRadius: 14,
          marginBottom: 32,
          overflow: 'hidden',
        }}>
          {[
            { label: 'Format', value: `${file.kind} · ${file.size}` },
            { label: 'Version', value: `${file.version} (final)` },
            { label: 'Delivered', value: file.updated },
            { label: 'Project', value: 'Aria — Mobile App' },
          ].map((m, i) => (
            <div key={m.label} style={{
              padding: '16px 18px',
              borderLeft: i > 0 ? '.5px solid var(--border)' : 'none',
            }}>
              <div style={{
                fontSize: 10, fontWeight: 600, letterSpacing: '.08em',
                textTransform: 'uppercase', color: 'var(--fg-muted)',
                marginBottom: 6,
              }}>{m.label}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)' }}>
                {m.value}
              </div>
            </div>
          ))}
        </div>

        {/* Team / credits */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32,
        }}>
          <div>
            <div style={{
              fontSize: 11, fontWeight: 600, letterSpacing: '.08em',
              textTransform: 'uppercase', color: 'var(--fg-muted)',
              marginBottom: 14,
            }}>Owner</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar user={owner} size={40} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{owner.name}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>{owner.role}</div>
              </div>
            </div>
          </div>
          <div>
            <div style={{
              fontSize: 11, fontWeight: 600, letterSpacing: '.08em',
              textTransform: 'uppercase', color: 'var(--fg-muted)',
              marginBottom: 14,
            }}>Reviewers</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex' }}>
                {collaborators.map((u, i) => (
                  <Avatar key={u.id} user={u} size={32} stack={i > 0} ring={true} />
                ))}
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
                {collaborators.map(c => c.name.split(' ')[0]).join(', ')} approved
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.ShareView = ShareView;
