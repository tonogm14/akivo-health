// sidebar.jsx
function Sidebar({ admin, dark, toggleDark, onLogout, collapsed, onToggleCollapse, isMobile, onClose }) {
  const T = useT();
  const { path, navigate } = useNav();
  const [hov, setHov] = useState(null);

  const navItems = [
    { href: '/admin/inicio', label: 'Inicio', icon: <Ic.Home /> },
    { href: '/admin/aplicaciones', label: 'Aplicaciones', icon: <Ic.FileText /> },
    { href: '/admin/consultas', label: 'Consultas', icon: <Ic.Activity /> },
    { href: '/admin/doctores', label: 'Doctores', icon: <Ic.Users />, adminOnly: true },
    { href: '/admin/usuarios', label: 'Usuarios', icon: <Ic.Settings />, adminOnly: true },
    { href: '/admin/auditoria', label: 'Auditoría', icon: <Ic.History />, adminOnly: true },
  ].filter(i => !i.adminOnly || admin.is_root || admin.role === 'admin');

  const initials = (admin.name || admin.username || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const col = collapsed && !isMobile;

  const go = (href) => { navigate(href); if (isMobile) onClose(); };

  return (
    <>
      {isMobile && (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: T.bgOverlay, zIndex: 49 }} />
      )}
      <div style={{
        width: isMobile ? 280 : (col ? 72 : 260),
        flexShrink: 0, background: T.bgSide, borderRight: `1px solid ${T.border}`,
        display: 'flex', flexDirection: 'column', height: '100vh',
        position: isMobile ? 'fixed' : 'sticky', top: 0, left: isMobile ? 0 : undefined,
        zIndex: isMobile ? 50 : 1, transition: 'width 0.2s ease', overflowX: 'hidden', overflowY: 'auto',
      }}>

        {/* Logo */}
        <div style={{
          padding: col ? '18px 0' : '18px 18px', borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: col ? 'center' : 'space-between',
          flexShrink: 0, minHeight: 62
        }}>
          {!col && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 30, height: 30, background: T.accent, borderRadius: 7,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, letterSpacing: -0.3, lineHeight: 1.2 }}>
                Doctor House
                <div style={{ fontSize: 11, fontWeight: 500, color: T.inkMuted }}>Admin</div>
              </div>
            </div>
          )}
          {col && (
            <div style={{
              width: 30, height: 30, background: T.accent, borderRadius: 7,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
          )}
          {isMobile && (
            <button onClick={onClose} style={{
              background: 'none', border: 'none',
              color: T.inkSoft, cursor: 'pointer', padding: 4
            }}><Ic.X /></button>
          )}
        </div>

        {/* Profile */}
        {!col ? (
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`,
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800, flexShrink: 0
              }}>
                {initials}
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: T.ink,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {admin.name || admin.username}
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                  background: admin.role === 'admin' ? T.accentSoft : T.bgHover,
                  color: admin.role === 'admin' ? T.accent : T.inkSoft
                }}>
                  {admin.role === 'admin' ? 'ADMINISTRADOR' : 'OPERADOR'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            padding: '12px 0', borderBottom: `1px solid ${T.border}`,
            display: 'flex', justifyContent: 'center', flexShrink: 0
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`,
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800
            }}>
              {initials}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(item => {
            const isActive = path.startsWith(item.href);
            const isHov = hov === item.href;
            return (
              <button key={item.href} onClick={() => go(item.href)}
                onMouseEnter={() => setHov(item.href)}
                onMouseLeave={() => setHov(null)}
                title={col ? item.label : undefined}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: col ? 0 : 10,
                  justifyContent: col ? 'center' : 'flex-start',
                  padding: col ? '10px 0' : '9px 12px',
                  borderRadius: 9, border: 'none', cursor: 'pointer', width: '100%',
                  background: isActive ? T.bgActive : isHov ? T.bgHover : 'transparent',
                  color: isActive ? T.accent : isHov ? T.ink : T.inkSoft,
                  fontWeight: isActive ? 700 : 500, fontSize: 14,
                  transition: 'background 0.12s, color 0.12s', textAlign: 'left',
                }}>
                <span style={{ color: 'inherit', flexShrink: 0 }}>{item.icon}</span>
                {!col && <span style={{ fontSize: 14 }}>{item.label}</span>}
                {isActive && !col && (
                  <div style={{
                    marginLeft: 'auto', width: 6, height: 6,
                    borderRadius: '50%', background: T.accent
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '8px 8px 16px', borderTop: `1px solid ${T.border}`,
          display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0
        }}>
          {/* Dark/light toggle */}
          <button onClick={toggleDark}
            onMouseEnter={() => setHov('__dark')} onMouseLeave={() => setHov(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: col ? 0 : 10,
              justifyContent: col ? 'center' : 'flex-start',
              padding: col ? '10px 0' : '9px 12px', borderRadius: 9, border: 'none',
              cursor: 'pointer', width: '100%',
              background: hov === '__dark' ? T.bgHover : 'transparent', color: T.inkSoft,
              fontWeight: 500, fontSize: 14, transition: 'background 0.12s'
            }}>
            {dark ? <Ic.Sun /> : <Ic.Moon />}
            {!col && <span>{dark ? 'Modo claro' : 'Modo oscuro'}</span>}
          </button>

          {/* Collapse (desktop only) */}
          {!isMobile && (
            <button onClick={onToggleCollapse}
              onMouseEnter={() => setHov('__col')} onMouseLeave={() => setHov(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: col ? 0 : 10,
                justifyContent: col ? 'center' : 'flex-start',
                padding: col ? '10px 0' : '9px 12px', borderRadius: 9, border: 'none',
                cursor: 'pointer', width: '100%',
                background: hov === '__col' ? T.bgHover : 'transparent', color: T.inkSoft,
                fontWeight: 500, fontSize: 14, transition: 'background 0.12s'
              }}>
              {col ? <Ic.ChevronRight /> : <Ic.ChevronLeft />}
              {!col && <span style={{ fontSize: 14 }}>Contraer</span>}
            </button>
          )}

          {/* Logout */}
          <button onClick={onLogout}
            onMouseEnter={() => setHov('__out')} onMouseLeave={() => setHov(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: col ? 0 : 10,
              justifyContent: col ? 'center' : 'flex-start',
              padding: col ? '10px 0' : '9px 12px', borderRadius: 9, border: 'none',
              cursor: 'pointer', width: '100%',
              background: hov === '__out' ? T.redSoft : 'transparent',
              color: hov === '__out' ? T.red : T.inkSoft,
              fontWeight: 500, fontSize: 14, transition: 'background 0.12s, color 0.12s'
            }}>
            <Ic.Logout />
            {!col && <span style={{ fontSize: 14 }}>Cerrar sesión</span>}
          </button>
        </div>
      </div>
    </>
  );
}
