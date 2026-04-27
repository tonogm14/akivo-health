// views/auditoria.jsx
function LogsView({ token }) {
    const T = useT();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/admin/logs?page=${page}&search=${search}`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                const d = await res.json();
                setLogs(d.rows);
                setTotal(d.total);
            }
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [token, page, search]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <SectionLabel>Registro de Auditoría (Logs)</SectionLabel>
                <input placeholder="Buscar por acción o administrador..." style={{ padding: '9px 14px', borderRadius: 9, border: `1px solid ${T.border}`, background: T.bgInput, color: T.ink, fontSize: 13, width: 320 }} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>

            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: `1px solid ${T.border}`, textAlign: 'left', background: T.bgInput + '22' }}>
                            {['FECHA', 'ACCION', 'TIPO', 'TARGET ID', 'ADMINISTRADOR'].map(h => (
                                <th key={h} style={{ padding: '12px 20px', fontSize: 10, fontWeight: 700, color: T.inkMuted, textTransform: 'uppercase' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan={5} style={{ padding: 60, textAlign: 'center', color: T.inkMuted }}>Cargando logs...</td></tr> : logs.map(l => (
                            <tr key={l.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                                <td style={{ padding: '14px 20px', fontSize: 12, color: T.inkSoft }}>{fmtDate(l.created_at)}</td>
                                <td style={{ padding: '14px 20px' }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{l.action.toUpperCase().replace(/_/g, ' ')}</div>
                                </td>
                                <td style={{ padding: '14px 20px', fontSize: 11, color: T.inkMuted }}>{l.target_type}</td>
                                <td style={{ padding: '14px 20px', fontSize: 11, color: T.inkMuted, fontFamily: 'monospace' }}>{l.target_id?.slice(0, 8)}...</td>
                                <td style={{ padding: '14px 20px' }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: T.accent }}>{l.admin_name}</div>
                                    <div style={{ fontSize: 11, color: T.inkSoft }}>@{l.admin_username}</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 10 }}>
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '8px 16px', borderRadius: 8, background: T.bgCard, border: `1px solid ${T.border}`, color: T.ink, cursor: page === 1 ? 'not-allowed' : 'pointer' }}>Anterior</button>
                <div style={{ padding: '8px 16px', color: T.inkSoft }}>Página {page}</div>
                <button disabled={logs.length < 50} onClick={() => setPage(p => p + 1)} style={{ padding: '8px 16px', borderRadius: 8, background: T.bgCard, border: `1px solid ${T.border}`, color: T.ink, cursor: logs.length < 50 ? 'not-allowed' : 'pointer' }}>Siguiente</button>
            </div>
        </div>
    );
}
