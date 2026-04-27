// views/usuarios.jsx
function ManagementView({ token, admin, setView }) {
    const T = useT();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [resetTarget, setResetTarget] = useState(null);

    const [form, setForm] = useState({ name: '', username: '', password: '', role: 'user', permissions: [] });

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetch('/admin/users', { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) setUsers(await res.json());
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [token]);

    const toggleStatus = async (id, current) => {
        try {
            const res = await fetch(`/admin/users/${id}/toggle`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) load();
        } catch { }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(form)
            });
            if (res.ok) { setShowAdd(false); setForm({ name: '', username: '', password: '', role: 'user', permissions: [] }); load(); }
        } catch { }
    };

    const modules = [
        { id: 'overview', label: 'Finanzas' },
        { id: 'apps', label: 'Candidatos' },
        { id: 'consultations', label: 'Consultas' },
        { id: 'doctors', label: 'Médicos Activos' },
        { id: 'management', label: 'Usuarios/Config' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <SectionLabel>Control de Accesos Administrativos</SectionLabel>
                    <div style={{ fontSize: 13, color: T.inkSoft }}>Gestiona quién puede entrar a cada módulo del sistema.</div>
                </div>
                <button onClick={() => setShowAdd(true)} style={{
                    background: T.accent, color: '#fff', border: 'none', borderRadius: 8,
                    padding: '12px 24px', fontWeight: 800, cursor: 'pointer', boxShadow: T.shadowSm
                }}>+ Crear Nuevo Usuario</button>
            </div>

            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: `1px solid ${T.border}`, textAlign: 'left', background: T.bgInput + '22' }}>
                            {['NOMBRE / USUARIO', 'ROL', 'ESTADO', 'MÓDULOS PERMITIDOS', 'ÚLTIMO ACCESO', ''].map(h => (
                                <th key={h} style={{ padding: '14px 20px', fontSize: 10, fontWeight: 700, color: T.inkMuted, textTransform: 'uppercase' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ padding: 60, textAlign: 'center', color: T.inkMuted }}>Cargando usuarios...</td></tr>
                        ) : users.map(u => (
                            <tr key={u.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                                <td style={{ padding: '16px 20px' }}>
                                    <div style={{ fontWeight: 700, color: T.ink }}>{u.name}</div>
                                    <div style={{ fontSize: 12, color: T.inkSoft }}>@{u.username}</div>
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                    <span style={{
                                        fontSize: 10, fontWeight: 900, padding: '4px 10px', borderRadius: 6,
                                        background: u.is_root ? T.purpleSoft : (u.role === 'admin' ? T.accentSoft : T.bgInput),
                                        color: u.is_root ? T.purple : (u.role === 'admin' ? T.accent : T.inkSoft)
                                    }}>{u.is_root ? 'PROPIETARIO' : u.role.toUpperCase()}</span>
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: u.is_active ? T.green : T.red }} />
                                        <span style={{ fontSize: 11, fontWeight: 700, color: u.is_active ? T.green : T.red }}>
                                            {u.is_active ? 'ACTIVO' : 'INACTIVO'}
                                        </span>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                    {u.is_root || u.role === 'admin' ? <span style={{ fontSize: 11, color: T.accent, fontWeight: 700 }}>Privilegios Totales</span> : (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            {(u.permissions || []).map(p => <span key={p} style={{ fontSize: 9, fontWeight: 800, background: T.bgInput, padding: '2px 6px', borderRadius: 4 }}>{p.toUpperCase()}</span>)}
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '16px 20px', fontSize: 12, color: T.inkSoft }}>{fmtDateShort(u.last_login)}</td>
                                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                    {!u.is_root && (
                                        <button onClick={() => toggleStatus(u.id, u.is_active)} style={{ background: u.is_active ? T.redSoft : T.greenSoft, border: 'none', color: u.is_active ? T.red : T.green, padding: 8, borderRadius: 8, cursor: 'pointer' }}>
                                            {u.is_active ? <Ic.AlertCircle /> : <Ic.Check />}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            {showAdd && (
                <div style={{ position: 'fixed', inset: 0, background: T.bgOverlay, backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <Card style={{ width: 500, padding: 32, boxShadow: T.shadow }}>
                        <h3 style={{ margin: '0 0 20px' }}>Nuevo Usuario</h3>
                        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <input required placeholder="Nombre" style={{ padding: 12, borderRadius: 8, background: T.bgInput, border: `1px solid ${T.border}`, color: T.ink }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            <input required placeholder="Usuario" style={{ padding: 12, borderRadius: 8, background: T.bgInput, border: `1px solid ${T.border}`, color: T.ink }} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                            <input required type="password" placeholder="Contraseña" style={{ padding: 12, borderRadius: 8, background: T.bgInput, border: `1px solid ${T.border}`, color: T.ink }} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <button type="button" onClick={() => setShowAdd(false)} style={{ padding: 12, borderRadius: 8, background: T.bgInput, border: `1px solid ${T.border}`, color: T.ink }}>Cancelar</button>
                                <button type="submit" style={{ padding: 12, borderRadius: 8, background: T.accent, border: 'none', color: '#fff', fontWeight: 800 }}>Crear</button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
