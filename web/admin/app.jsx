// app.jsx — router, DashboardApp, Main, entry point

const ROUTES = {
  '/admin/inicio':       { title:'Inicio',       adminOnly:false },
  '/admin/aplicaciones': { title:'Aplicaciones', adminOnly:false },
  '/admin/consultas':    { title:'Consultas',     adminOnly:true  },
  '/admin/doctores':     { title:'Doctores',      adminOnly:true  },
};

function DashboardApp({ admin, token, onLogout, dark, toggleDark }) {
  const T = useT();
  const { path, navigate } = useNav();
  const [collapsed, setCollapsed]     = useState(false);
  const [isMobile, setIsMobile]       = useState(window.innerWidth < 900);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Redirect to default view if path not recognised
  useEffect(() => {
    if (!ROUTES[path]) {
      navigate(admin.role === 'admin' ? '/admin/inicio' : '/admin/aplicaciones');
    }
  }, [path]);

  const routeInfo = ROUTES[path] || {};
  const title = routeInfo.title || 'Admin';

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:T.bg }}>
      {(!isMobile || sidebarOpen) && (
        <Sidebar admin={admin} dark={dark} toggleDark={toggleDark} onLogout={onLogout}
          collapsed={collapsed} onToggleCollapse={() => setCollapsed(c => !c)}
          isMobile={isMobile} onClose={() => setSidebarOpen(false)} />
      )}

      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        {/* Top bar */}
        <div style={{ height:58, borderBottom:`1px solid ${T.border}`, background:T.bgCard,
          display:'flex', alignItems:'center', padding:'0 22px', gap:14,
          position:'sticky', top:0, zIndex:10, boxShadow:T.shadowSm, flexShrink:0 }}>
          {isMobile && (
            <button onClick={() => setSidebarOpen(o => !o)}
              style={{ background:'none', border:'none', color:T.inkSoft,
                cursor:'pointer', padding:4, display:'flex' }}>
              <Ic.Menu />
            </button>
          )}
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10, fontWeight:600, color:T.inkMuted,
              textTransform:'uppercase', letterSpacing:0.8, marginBottom:1 }}>
              Doctor House · {admin.role === 'admin' ? 'Administrador' : 'Operador'}
            </div>
            <div style={{ fontSize:15, fontWeight:800, color:T.ink }}>{title}</div>
          </div>
          <button onClick={toggleDark}
            style={{ background:T.bgInput, border:`1px solid ${T.border}`, borderRadius:8,
              padding:'6px 10px', color:T.inkSoft, cursor:'pointer',
              display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:600 }}>
            {dark ? <Ic.Sun /> : <Ic.Moon />}
            {!isMobile && <span style={{ fontSize:12 }}>{dark ? 'Claro' : 'Oscuro'}</span>}
          </button>
        </div>

        {/* Page content */}
        <main style={{ flex:1, padding:isMobile?16:28, maxWidth:1400,
          width:'100%', margin:'0 auto', boxSizing:'border-box' }}>
          {path === '/admin/inicio'       && admin.role === 'admin' && <OverviewView token={token} />}
          {path === '/admin/aplicaciones' && <ApplicationsView token={token} />}
          {path === '/admin/consultas'    && admin.role === 'admin' && <ConsultationsView token={token} />}
          {path === '/admin/doctores'     && admin.role === 'admin' && <DoctorsView token={token} />}
        </main>
      </div>
    </div>
  );
}

function Main() {
  const [auth, setAuth] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dh_admin_auth')) || null; } catch { return null; }
  });
  const [dark, setDark] = useState(() => {
    const s = localStorage.getItem('dh_dark');
    return s !== null ? s === 'true' : true;
  });

  // Client-side router state
  const [path, setPath] = useState(window.location.pathname);
  const navigate = (to) => {
    window.history.pushState({}, '', to);
    setPath(to);
  };
  useEffect(() => {
    const handler = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  // Base CSS — injected once
  useEffect(() => {
    if (document.getElementById('dh-css')) return;
    const s = document.createElement('style');
    s.id = 'dh-css';
    s.textContent = `
      *, *::before, *::after { box-sizing: border-box; }
      body { margin: 0; font-family: 'Manrope', -apple-system, system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
      input, select, textarea, button { font-family: inherit; }
      ::-webkit-scrollbar { width: 5px; height: 5px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.25); border-radius: 4px; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(128,128,128,0.45); }
      input[type=date]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
    `;
    document.head.appendChild(s);
  }, []);

  useEffect(() => {
    const t = dark ? DARK : LIGHT;
    document.body.style.background = t.bg;
    document.body.style.color = t.ink;
    localStorage.setItem('dh_dark', String(dark));
    let optStyle = document.getElementById('dh-opt');
    if (!optStyle) { optStyle = document.createElement('style'); optStyle.id = 'dh-opt'; document.head.appendChild(optStyle); }
    optStyle.textContent = `select option { background: ${t.bgCard}; color: ${t.ink}; }`;
  }, [dark]);

  const handleLogin = (data) => {
    localStorage.setItem('dh_admin_auth', JSON.stringify(data));
    setAuth(data);
    // Navigate to default view after login
    const dest = data.admin.role === 'admin' ? '/admin/inicio' : '/admin/aplicaciones';
    navigate(dest);
  };
  const handleLogout = () => {
    localStorage.removeItem('dh_admin_auth');
    setAuth(null);
    navigate('/admin/');
  };
  const toggleDark = () => setDark(d => !d);
  const theme = dark ? DARK : LIGHT;

  return (
    <ThemeCtx.Provider value={theme}>
      <NavCtx.Provider value={{ path, navigate }}>
        {auth
          ? <DashboardApp admin={auth.admin} token={auth.token}
              onLogout={handleLogout} dark={dark} toggleDark={toggleDark} />
          : <Login onLogin={handleLogin} dark={dark} toggleDark={toggleDark} />
        }
      </NavCtx.Provider>
    </ThemeCtx.Provider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Main />);
