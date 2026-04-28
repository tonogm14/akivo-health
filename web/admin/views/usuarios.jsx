// views/usuarios.jsx
function ManagementView({ token, admin }) {
    const T = useT();
    const { navigate } = useNav();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ name: '', username: '', password: '', role: 'user', permissions: [] });

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetch('/admin/users', { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) setUsers(await res.json());
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [token]);

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
                            <HoverRow key={u.id} onClick={() => navigate(`/admin/usuarios/${u.id}`)} style={{ borderBottom: `1px solid ${T.border}`, cursor: 'pointer' }}>
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
                                    <Ic.ChevronRight size={18} color={T.inkMuted} />
                                </td>
                            </HoverRow>
                        ))}
                    </tbody>
                </table>
            </Card>

            {/* CREATE MODAL */}
            {showAdd && (
                <div style={{ position: 'fixed', inset: 0, background: T.bgOverlay, backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <Card style={{ width: 520, padding: 32, boxShadow: T.shadow }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.ink }}>Nuevo Usuario Administrativo</h3>
                            <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: T.inkSoft, cursor: 'pointer' }}><Ic.X /></button>
                        </div>
                        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <SectionLabel style={{ marginBottom: 4 }}>Información Personal</SectionLabel>
                                <input required placeholder="Nombre completo" style={{ padding: 12, borderRadius: 10, background: T.bgInput, border: `1px solid ${T.border}`, color: T.ink, outline: 'none' }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <SectionLabel style={{ marginBottom: 4 }}>Usuario</SectionLabel>
                                    <input required placeholder="@usuario" style={{ padding: 12, borderRadius: 10, background: T.bgInput, border: `1px solid ${T.border}`, color: T.ink, outline: 'none' }} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <SectionLabel style={{ marginBottom: 4 }}>Contraseña</SectionLabel>
                                    <input required type="password" placeholder="••••••••" style={{ padding: 12, borderRadius: 10, background: T.bgInput, border: `1px solid ${T.border}`, color: T.ink, outline: 'none' }} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <SectionLabel style={{ marginBottom: 0 }}>Nivel de Acceso</SectionLabel>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <button type="button" onClick={() => setForm({ ...form, role: 'user', permissions: [] })}
                                        style={{
                                            padding: '12px', borderRadius: 10, border: `1px solid ${form.role === 'user' ? T.accent : T.border}`,
                                            background: form.role === 'user' ? T.accentSoft : 'transparent',
                                            color: form.role === 'user' ? T.accent : T.inkSoft,
                                            fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                                        }}>Operador</button>
                                    <button type="button" onClick={() => setForm({ ...form, role: 'admin', permissions: modules.map(m => m.id) })}
                                        style={{
                                            padding: '12px', borderRadius: 10, border: `1px solid ${form.role === 'admin' ? T.accent : T.border}`,
                                            background: form.role === 'admin' ? T.accentSoft : 'transparent',
                                            color: form.role === 'admin' ? T.accent : T.inkSoft,
                                            fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                                        }}>Administrador</button>
                                </div>
                            </div>
                            {form.role === 'user' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <SectionLabel style={{ marginBottom: 0 }}>Permisos de Módulo</SectionLabel>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                        {modules.map(m => {
                                            const active = form.permissions.includes(m.id);
                                            return (
                                                <label key={m.id} style={{
                                                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                                                    borderRadius: 10, border: `1px solid ${active ? T.accent : T.border}`,
                                                    background: active ? T.accentSoft : T.bgInput,
                                                    cursor: 'pointer', transition: 'all 0.2s'
                                                }}>
                                                    <input type="checkbox" checked={active} style={{ cursor: 'pointer' }}
                                                        onChange={e => {
                                                            const p = e.target.checked ? [...form.permissions, m.id] : form.permissions.filter(x => x !== m.id);
                                                            setForm({ ...form, permissions: p });
                                                        }} />
                                                    <span style={{ fontSize: 12, fontWeight: 600, color: active ? T.accent : T.inkSoft }}>{m.label}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
                                <button type="button" onClick={() => setShowAdd(false)} style={{ padding: 14, borderRadius: 10, border: `1px solid ${T.border}`, background: 'transparent', color: T.inkSoft, fontWeight: 700, cursor: 'pointer' }}>Cancelar</button>
                                <button type="submit" style={{ padding: 14, borderRadius: 10, border: 'none', background: T.accent, color: '#fff', fontWeight: 800, cursor: 'pointer', boxShadow: `0 4px 12px ${T.accent}44` }}>Crear Usuario</button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
