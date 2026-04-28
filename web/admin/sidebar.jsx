// sidebar.jsx
function Sidebar({ token, admin, dark, toggleDark, onLogout, collapsed, onToggleCollapse, isMobile, onClose }) {
  const T = useT();
  const { path, navigate } = useNav();
  const [hov, setHov]                   = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileModal, setProfileModal]   = useState(false);
  const [pwModal, setPwModal]             = useState(false);
  const [profileName, setProfileName]     = useState(admin.name || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [pwForm, setPwForm]               = useState({ next: '', confirm: '' });
  const [pwSaving, setPwSaving]           = useState(false);
  const [modalMsg, setModalMsg]           = useState(null);

  const navItems = [
    { href: '/admin/inicio',       label: 'Inicio',       icon: <Ic.Home /> },
    { href: '/admin/aplicaciones', label: 'Aplicaciones', icon: <Ic.FileText /> },
    { href: '/admin/consultas',    label: 'Consultas',    icon: <Ic.Activity /> },
    { href: '/admin/doctores',     label: 'Doctores',     icon: <Ic.Users />,    adminOnly: true },
    { href: '/admin/usuarios',     label: 'Usuarios',     icon: <Ic.Settings />, adminOnly: true },
    { href: '/admin/auditoria',    label: 'Auditoría',    icon: <Ic.History />,  adminOnly: true },
  ].filter(i => !i.adminOnly || admin.is_root || admin.role === 'admin');

  const initials = (admin.name || admin.username || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const col      = collapsed && !isMobile;
  const go       = (href) => { navigate(href); if (isMobile) onClose(); };

  const roleBadge = admin.is_root
    ? { label: 'PROPIETARIO',  bg: T.purpleSoft,  color: T.purple }
    : admin.role === 'admin'
    ? { label: 'ADMINISTRADOR', bg: T.accentSoft,  color: T.accent }
    : { label: 'OPERADOR',      bg: T.bgHover,     color: T.inkSoft };

  const inpStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    background: T.bgInput, border: `1px solid ${T.border}`, color: T.ink,
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
  };

  const saveProfile = async () => {
    setProfileSaving(true); setModalMsg(null);
    try {
      const r = await fetch('/admin/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: profileName }),
      });
      setModalMsg(r.ok ? { ok: true, text: 'Perfil actualizado.' } : { ok: false, text: 'No se pudo guardar.' });
    } catch { setModalMsg({ ok: false, text: 'Error de conexión.' }); }
    setProfileSaving(false);
  };

  const changePassword = async () => {
    if (pwForm.next !== pwForm.confirm) { setModalMsg({ ok: false, text: 'Las contraseñas no coinciden.' }); return; }
    if (pwForm.next.length < 6)        { setModalMsg({ ok: false, text: 'Mínimo 6 caracteres.' }); return; }
    setPwSaving(true); setModalMsg(null);
    try {
      const r = await fetch('/admin/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: pwForm.next }),
      });
      if (r.ok) { setModalMsg({ ok: true, text: 'Contraseña actualizada.' }); setPwForm({ next: '', confirm: '' }); }
      else       { setModalMsg({ ok: false, text: 'No se pudo actualizar.' }); }
    } catch { setModalMsg({ ok: false, text: 'Error de conexión.' }); }
    setPwSaving(false);
  };

  function ProfileMenu({ popStyle }) {
    const menuItems = [
      {
        label: 'Mi perfil',
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
        action: () => { setProfileModal(true); setProfileMenuOpen(false); setModalMsg(null); setProfileName(admin.name || ''); },
      },
      {
        label: 'Cambiar contraseña',
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
        action: () => { setPwModal(true); setProfileMenuOpen(false); setModalMsg(null); setPwForm({ next: '', confirm: '' }); },
      },
    ];
    return (
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 10,
        boxShadow: T.shadow, overflow: 'hidden', ...popStyle }}>
        {menuItems.map(item => (
          <button key={item.label} onClick={item.action}
            onMouseEnter={e => e.currentTarget.style.background = T.bgHover}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
            style={{ width: '100%', padding: '11px 16px', background: 'none', border: 'none',
              textAlign: 'left', cursor: 'pointer', color: T.ink, fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 9 }}>
            {item.icon}{item.label}
          </button>
        ))}
        <div style={{ height: 1, background: T.border }} />
        <button onClick={onLogout}
          onMouseEnter={e => e.currentTarget.style.background = T.redSoft}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
          style={{ width: '100%', padding: '11px 16px', background: 'none', border: 'none',
            textAlign: 'left', cursor: 'pointer', color: T.red, fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 9 }}>
          <Ic.Logout />Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <>
      {isMobile && (
        <div onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: T.bgOverlay, zIndex: 49 }} />
      )}

      <div style={{
        width: isMobile ? 280 : (col ? 72 : 260), flexShrink: 0,
        background: T.bgSide, borderRight: `1px solid ${T.border}`,
        display: 'flex', flexDirection: 'column', height: '100vh',
        position: isMobile ? 'fixed' : 'sticky', top: 0, left: isMobile ? 0 : undefined,
        zIndex: isMobile ? 50 : 1, transition: 'width 0.2s ease', overflowX: 'hidden', overflowY: 'auto',
      }}>

        {/* Logo */}
        <div style={{
          padding: col ? '18px 0' : '18px 18px', borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: col ? 'center' : 'space-between',
          flexShrink: 0, minHeight: 62,
        }}>
          {!col && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, background: T.accent, borderRadius: 7,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
            <div style={{ width: 30, height: 30, background: T.accent, borderRadius: 7,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
          )}
          {isMobile && (
            <button onClick={onClose}
              style={{ background: 'none', border: 'none', color: T.inkSoft, cursor: 'pointer', padding: 4 }}>
              <Ic.X />
            </button>
          )}
        </div>

        {/* Profile — clickable, opens dropdown */}
        {!col ? (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setProfileMenuOpen(o => !o)}
              onMouseEnter={e => { if (!profileMenuOpen) e.currentTarget.style.background = T.bgHover; }}
              onMouseLeave={e => { if (!profileMenuOpen) e.currentTarget.style.background = 'none'; }}
              style={{
                width: '100%', background: profileMenuOpen ? T.bgHover : 'none', border: 'none',
                padding: '14px 18px', borderBottom: `1px solid ${T.border}`, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 11, textAlign: 'left',
              }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`,
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800 }}>
                {initials}
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.ink,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {admin.name || admin.username}
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                  background: roleBadge.bg, color: roleBadge.color }}>
                  {roleBadge.label}
                </span>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke={T.inkMuted} strokeWidth="2.5" style={{ flexShrink: 0,
                  transform: profileMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {profileMenuOpen && (
              <>
                <div onClick={() => setProfileMenuOpen(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 18 }} />
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 19 }}>
                  <ProfileMenu />
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{ padding: '12px 0', borderBottom: `1px solid ${T.border}`,
            display: 'flex', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
            <button onClick={() => setProfileMenuOpen(o => !o)}
              title={admin.name || admin.username}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%',
                background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`,
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800 }}>
                {initials}
              </div>
            </button>
            {profileMenuOpen && (
              <>
                <div onClick={() => setProfileMenuOpen(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 18 }} />
                <div style={{ position: 'absolute', left: '100%', top: 0, zIndex: 19,
                  marginLeft: 8, minWidth: 220 }}>
                  <ProfileMenu />
                </div>
              </>
            )}
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(item => {
            const isActive = path.startsWith(item.href);
            const isHov    = hov === item.href;
            return (
              <button key={item.href} onClick={() => go(item.href)}
                onMouseEnter={() => setHov(item.href)} onMouseLeave={() => setHov(null)}
                title={col ? item.label : undefined}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: col ? 0 : 10, justifyContent: col ? 'center' : 'flex-start',
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
                  <div style={{ marginLeft: 'auto', width: 6, height: 6,
                    borderRadius: '50%', background: T.accent }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer — theme toggle + collapse */}
        <div style={{ padding: '8px 8px 16px', borderTop: `1px solid ${T.border}`,
          display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
          <button onClick={toggleDark}
            onMouseEnter={() => setHov('__dark')} onMouseLeave={() => setHov(null)}
            style={{ display: 'flex', alignItems: 'center', gap: col ? 0 : 10,
              justifyContent: col ? 'center' : 'flex-start',
              padding: col ? '10px 0' : '9px 12px', borderRadius: 9, border: 'none',
              cursor: 'pointer', width: '100%',
              background: hov === '__dark' ? T.bgHover : 'transparent', color: T.inkSoft,
              fontWeight: 500, fontSize: 14, transition: 'background 0.12s' }}>
            {dark ? <Ic.Sun /> : <Ic.Moon />}
            {!col && <span>{dark ? 'Modo claro' : 'Modo oscuro'}</span>}
          </button>
          {!isMobile && (
            <button onClick={onToggleCollapse}
              onMouseEnter={() => setHov('__col')} onMouseLeave={() => setHov(null)}
              style={{ display: 'flex', alignItems: 'center', gap: col ? 0 : 10,
                justifyContent: col ? 'center' : 'flex-start',
                padding: col ? '10px 0' : '9px 12px', borderRadius: 9, border: 'none',
                cursor: 'pointer', width: '100%',
                background: hov === '__col' ? T.bgHover : 'transparent', color: T.inkSoft,
                fontWeight: 500, fontSize: 14, transition: 'background 0.12s' }}>
              {col ? <Ic.ChevronRight /> : <Ic.ChevronLeft />}
              {!col && <span style={{ fontSize: 14 }}>Contraer</span>}
            </button>
          )}
        </div>
      </div>

      {/* ── Profile modal ── */}
      {profileModal && (
        <div style={{ position: 'fixed', inset: 0, background: T.bgOverlay,
          backdropFilter: 'blur(4px)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: T.bgCard, borderRadius: 16, width: '100%', maxWidth: 420,
            boxShadow: T.shadow, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.border}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>Mi perfil</div>
              <button onClick={() => { setProfileModal(false); setModalMsg(null); }}
                style={{ background: T.bgHover, border: `1px solid ${T.border}`,
                  borderRadius: 7, padding: '5px 8px', color: T.inkSoft, cursor: 'pointer' }}>
                <Ic.X />
              </button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`,
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, fontWeight: 800 }}>
                  {initials}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: T.ink }}>
                    {admin.name || admin.username}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                    background: roleBadge.bg, color: roleBadge.color }}>{roleBadge.label}</span>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.inkMuted,
                  textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Nombre</div>
                <input value={profileName} onChange={e => setProfileName(e.target.value)}
                  style={inpStyle} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.inkMuted,
                  textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>Usuario</div>
                <div style={{ ...inpStyle, color: T.inkSoft, cursor: 'default',
                  display: 'flex', alignItems: 'center' }}>
                  @{admin.username}
                </div>
              </div>
              {modalMsg && (
                <div style={{ padding: '9px 12px', borderRadius: 8, marginBottom: 14,
                  background: modalMsg.ok ? T.greenSoft : T.redSoft,
                  color: modalMsg.ok ? T.green : T.red, fontSize: 13, fontWeight: 600 }}>
                  {modalMsg.text}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setProfileModal(false); setModalMsg(null); }}
                  style={{ flex: 1, padding: 10, borderRadius: 8, background: T.bgInput,
                    border: `1px solid ${T.border}`, color: T.ink, cursor: 'pointer', fontWeight: 600 }}>
                  Cancelar
                </button>
                <button onClick={saveProfile} disabled={profileSaving}
                  style={{ flex: 1, padding: 10, borderRadius: 8, background: T.accent,
                    border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 800,
                    opacity: profileSaving ? 0.7 : 1 }}>
                  {profileSaving ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Change password modal ── */}
      {pwModal && (
        <div style={{ position: 'fixed', inset: 0, background: T.bgOverlay,
          backdropFilter: 'blur(4px)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: T.bgCard, borderRadius: 16, width: '100%', maxWidth: 400,
            boxShadow: T.shadow, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${T.border}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>Cambiar contraseña</div>
              <button onClick={() => { setPwModal(false); setModalMsg(null); }}
                style={{ background: T.bgHover, border: `1px solid ${T.border}`,
                  borderRadius: 7, padding: '5px 8px', color: T.inkSoft, cursor: 'pointer' }}>
                <Ic.X />
              </button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.inkMuted,
                  textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
                  Nueva contraseña
                </div>
                <input type="password" value={pwForm.next} placeholder="Mínimo 6 caracteres"
                  onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
                  style={inpStyle} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.inkMuted,
                  textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
                  Confirmar contraseña
                </div>
                <input type="password" value={pwForm.confirm} placeholder="Repite la contraseña"
                  onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                  style={inpStyle} />
              </div>
              {modalMsg && (
                <div style={{ padding: '9px 12px', borderRadius: 8,
                  background: modalMsg.ok ? T.greenSoft : T.redSoft,
                  color: modalMsg.ok ? T.green : T.red, fontSize: 13, fontWeight: 600 }}>
                  {modalMsg.text}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setPwModal(false); setModalMsg(null); }}
                  style={{ flex: 1, padding: 10, borderRadius: 8, background: T.bgInput,
                    border: `1px solid ${T.border}`, color: T.ink, cursor: 'pointer', fontWeight: 600 }}>
                  Cancelar
                </button>
                <button onClick={changePassword} disabled={pwSaving}
                  style={{ flex: 1, padding: 10, borderRadius: 8, background: T.accent,
                    border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 800,
                    opacity: pwSaving ? 0.7 : 1 }}>
                  {pwSaving ? 'Guardando…' : 'Actualizar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
