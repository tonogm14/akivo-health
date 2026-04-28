// views/usuario_detalle.jsx
function UserDetailView({ token, admin, userId }) {
    const T = useT();
    const { navigate } = useNav();
    const [user, setUser] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [logsLoading, setLogsLoading] = useState(false);

    const [dateFrom, setDateFrom] = useState('');
    const [search, setSearch] = useState('');

    const [resetModal, setResetModal] = useState(false);
    const [newPass, setNewPass] = useState('');
    const [adminPass, setAdminPass] = useState('');

    const loadUser = async () => {
        try {
            const res = await fetch(`/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) setUser(await res.json());
        } catch { }
    };

    const loadLogs = async () => {
        setLogsLoading(true);
        try {
            let url = `/admin/users/${userId}/logs?`;
            if (dateFrom) url += `dateFrom=${dateFrom}&`;
            if (search) url += `search=${search}`;

            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) setLogs(await res.json());
        } catch { } finally { setLogsLoading(false); }
    };

    useEffect(() => {
        loadUser();
        loadLogs();
    }, [userId, token]);

    useEffect(() => {
        const timer = setTimeout(() => { loadLogs(); }, 300);
        return () => clearTimeout(timer);
    }, [dateFrom, search]);

    const toggleStatus = async () => {
        try {
            const res = await fetch(`/admin/users/${userId}/toggle`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) loadUser();
        } catch { }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/admin/users/${userId}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ newPassword: newPass, adminPassword: adminPass })
            });
            if (res.ok) { alert('Contraseña actualizada'); setResetModal(false); setNewPass(''); setAdminPass(''); }
            else { const d = await res.json(); alert(d.error || 'Error'); }
        } catch { }
    };

    if (!user) return <div style={{ padding: 40, textAlign: 'center', color: T.inkMuted }}>Cargando perfil...</div>;

    const logLink = (l) => {
        if (l.target_type === 'doctor_application') return `/admin/aplicaciones?id=${l.target_id}`;
        if (l.target_type === 'doctor') return `/admin/doctores?id=${l.target_id}`;
        if (l.target_type === 'doctor_visit' || l.target_type === 'visit') return `/admin/consultas?id=${l.target_id}`;
        return null;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button onClick={() => navigate('/admin/usuarios')} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 12px', color: T.inkSoft, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                    <Ic.ArrowLeft size={16} /> Volver
                </button>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Perfil de Staff</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
                {/* Left column: Profile Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <Card style={{ padding: 28, textAlign: 'center' }}>
                        <div style={{ width: 80, height: 80, borderRadius: 24, background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, margin: '0 auto 16px' }}>
                            {user.name[0]}
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: T.ink }}>{user.name}</div>
                        <div style={{ fontSize: 14, color: T.inkSoft, marginBottom: 20 }}>@{user.username}</div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                <span style={{ color: T.inkMuted }}>Rol:</span>
                                <span style={{ fontWeight: 700, color: T.accent }}>{user.role.toUpperCase()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                <span style={{ color: T.inkMuted }}>Estado:</span>
                                <span style={{ fontWeight: 700, color: user.is_active ? T.green : T.red }}>{user.is_active ? 'ACTIVO' : 'INACTIVO'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                <span style={{ color: T.inkMuted }}>ID Root:</span>
                                <span style={{ fontWeight: 700 }}>{user.is_root ? 'Sí' : 'No'}</span>
                            </div>
                        </div>

                        <Divider style={{ margin: '20px 0' }} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {!user.is_root && (
                                <button onClick={toggleStatus} style={{ width: '100%', padding: 12, borderRadius: 10, border: 'none', background: user.is_active ? T.redSoft : T.greenSoft, color: user.is_active ? T.red : T.green, fontWeight: 800, cursor: 'pointer' }}>
                                    {user.is_active ? 'Desactivar Cuenta' : 'Activar Cuenta'}
                                </button>
                            )}
                            <button onClick={() => setResetModal(true)} style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: T.bgInput, color: T.ink, fontWeight: 800, cursor: 'pointer' }}>
                                Cambiar Contraseña
                            </button>
                        </div>
                    </Card>
                </div>

                {/* Right column: Logs & Filters */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <Card style={{ padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <SectionLabel>Historial de Actividad (Logs)</SectionLabel>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.bgInput, color: T.ink, fontSize: 13 }} />
                                <input placeholder="Buscar acción..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.bgInput, color: T.ink, fontSize: 13, width: 200 }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {logsLoading ? <div style={{ padding: 40, textAlign: 'center', color: T.inkMuted }}>Filtrando registros...</div> : (
                                <>
                                    {logs.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: T.inkMuted }}>No se encontraron acciones con estos filtros.</div> : logs.map(l => {
                                        const link = logLink(l);
                                        return (
                                            <div key={l.id} style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontSize: 14, fontWeight: 800, color: T.ink }}>{l.action.toUpperCase().replace(/_/g, ' ')}</div>
                                                    <div style={{ fontSize: 12, color: T.inkSoft }}>{fmtDate(l.created_at)} • {l.target_type}</div>
                                                </div>
                                                {link && (
                                                    <button onClick={() => navigate(link)} style={{ background: T.accentSoft, border: 'none', color: T.accent, borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                                                        Ver Objetivo →
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Reset Modal */}
            {resetModal && (
                <div style={{ position: 'fixed', inset: 0, background: T.bgOverlay, backdropFilter: 'blur(4px)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <Card style={{ width: 400, padding: 32, boxShadow: T.shadow }}>
                        <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 800 }}>Resetear Contraseña</h3>
                        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <SectionLabel>Nueva Contraseña para {user.username}</SectionLabel>
                                <input required type="password" placeholder="••••••••" style={{ width: '100%', padding: 12, borderRadius: 10, background: T.bgInput, border: `1px solid ${T.border}`, color: T.ink }} value={newPass} onChange={e => setNewPass(e.target.value)} />
                            </div>
                            <div>
                                <SectionLabel>Tu Contraseña de Administrador</SectionLabel>
                                <input required type="password" placeholder="••••••••" style={{ width: '100%', padding: 12, borderRadius: 10, background: T.bgInput, border: `1px solid ${T.border}`, color: T.ink }} value={adminPass} onChange={e => setAdminPass(e.target.value)} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                                <button type="button" onClick={() => setResetModal(false)} style={{ padding: 12, borderRadius: 10, border: `1px solid ${T.border}`, background: 'transparent', color: T.inkSoft, fontWeight: 700, cursor: 'pointer' }}>Cancelar</button>
                                <button type="submit" style={{ padding: 12, borderRadius: 10, border: 'none', background: T.red, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Confirmar Reset</button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
