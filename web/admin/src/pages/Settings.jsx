import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { C, F, R } from '@/tokens';
import { Pill, Btn, Card, CardHead, Page, PageHeader, Table, Spinner, Field, Input } from '@/components/ui';
import * as I from '@/components/ui/Icons';

export default function Settings() {
  const [tab, setTab] = useState('team');
  const [team, setTeam] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [logsTarget, setLogsTarget] = useState(null);
  const [newMember, setNewMember] = useState({ username: '', password: '', name: '', role: 'operator', permissions: [] });

  useEffect(() => {
    if (tab === 'team') {
      setLoading(true);
      api.team().then(setTeam).catch(() => {}).finally(() => setLoading(false));
    }
    if (tab === 'audit') {
      setLoading(true);
      api.logs({ limit: 100 }).then(d => setLogs(d.rows || [])).catch(() => {}).finally(() => setLoading(false));
    }
  }, [tab]);

  async function createMember() {
    try {
      await api.createTeamMember(newMember);
      const updated = await api.team();
      setTeam(updated);
      setShowCreate(false);
      setNewMember({ username: '', password: '', name: '', role: 'operator', permissions: [] });
    } catch (e) { alert(e.message); }
  }

  async function toggleMember(id) {
    await api.toggleTeamMember(id);
    setTeam(prev => prev.map(m => m.id === id ? { ...m, is_active: !m.is_active } : m));
  }

  if (resetTarget) return <ResetPassword member={resetTarget} onBack={() => setResetTarget(null)}/>;
  if (logsTarget) return <MemberLogs member={logsTarget} onBack={() => setLogsTarget(null)}/>;

  return (
    <>
      <PageHeader
        kicker="— Sistema —"
        title="Configuración"
        description="Equipo, permisos y auditoría del panel admin."
        actions={tab === 'team' ? <Btn variant="primary" size="md" icon={<I.Plus size={14}/>} onClick={() => setShowCreate(true)}>Agregar miembro</Btn> : null}
        tabs={[
          { id: 'team',     label: 'Equipo',     count: team.length },
          { id: 'platform', label: 'Plataforma' },
          { id: 'audit',    label: 'Auditoría' },
        ]}
        currentTab={tab} onTab={setTab}
      />
      <Page>
        {tab === 'team' && (
          <>
            {showCreate && (
              <Card style={{ marginBottom: 12 }}>
                <CardHead title="Nuevo miembro del equipo" right={<Btn variant="ghost" size="sm" icon={<I.X size={13}/>} onClick={() => setShowCreate(false)}/>}/>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <Field label="Nombre"><Input value={newMember.name} onChange={e => setNewMember(p => ({...p, name: e.target.value}))} placeholder="Nombre completo"/></Field>
                  <Field label="Usuario"><Input value={newMember.username} onChange={e => setNewMember(p => ({...p, username: e.target.value}))} placeholder="usuario123"/></Field>
                  <Field label="Contraseña"><Input type="password" value={newMember.password} onChange={e => setNewMember(p => ({...p, password: e.target.value}))} placeholder="••••••••"/></Field>
                  <Field label="Rol">
                    <select value={newMember.role} onChange={e => setNewMember(p => ({...p, role: e.target.value}))}
                      style={{ height: 34, padding: '0 10px', border: `1px solid ${C.line}`, borderRadius: R.md, fontFamily: F.sans, fontSize: 13, width: '100%' }}>
                      <option value="operator">Operador</option>
                      <option value="admin">Admin</option>
                    </select>
                  </Field>
                </div>
                <Btn variant="primary" size="md" icon={<I.Check size={14}/>} onClick={createMember} style={{ marginTop: 8 }}>Crear miembro</Btn>
              </Card>
            )}
            <Card bare>
              {loading ? <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Spinner size={24}/></div> : (
                <Table
                  columns={[
                    { h: 'Nombre', render: r => (
                      <div>
                        <div style={{ fontWeight: 600 }}>{r.name}</div>
                        <div style={{ fontFamily: F.mono, fontSize: 10.5, color: C.inkMuted }}>{r.username}</div>
                      </div>
                    )},
                    { h: 'Rol', render: r => <Pill tone={r.is_root ? 'violet' : r.role === 'admin' ? 'info' : 'neutral'} size="sm">{r.is_root ? 'Root' : r.role}</Pill> },
                    { h: 'Estado', render: r => <Pill tone={r.is_active ? 'ok' : 'neutral'} dot size="sm">{r.is_active ? 'Activo' : 'Inactivo'}</Pill> },
                    { h: 'Último login', render: r => r.last_login ? new Date(r.last_login).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }) : '—', mono: true },
                    { h: '', render: r => !r.is_root && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Btn variant="ghost" size="sm" onClick={() => setLogsTarget(r)}>Logs</Btn>
                        <Btn variant="ghost" size="sm" onClick={() => setResetTarget(r)}>Resetear</Btn>
                        <Btn variant="ghost" size="sm" onClick={() => toggleMember(r.id)}>
                          {r.is_active ? 'Desactivar' : 'Activar'}
                        </Btn>
                      </div>
                    )},
                  ]}
                  rows={team}
                />
              )}
            </Card>
          </>
        )}

        {tab === 'platform' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Card>
              <CardHead title="Integraciones"/>
              {[
                ['API principal',         'http://localhost:3000', 'ok'],
                ['PostgreSQL',            'Puerto 5434', 'ok'],
                ['Expo Push Notifications','Activo', 'ok'],
                ['Nginx',                  'Puerto 80/443', 'ok'],
              ].map(([n, d, s]) => (
                <div key={n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.lineSoft}` }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{n}</div>
                    <div style={{ fontFamily: F.mono, fontSize: 11, color: C.inkMuted }}>{d}</div>
                  </div>
                  <Pill tone="ok" dot size="sm">Activo</Pill>
                </div>
              ))}
            </Card>
            <Card>
              <CardHead title="Apps móviles conectadas"/>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { name: 'Doctor House (Paciente)', desc: 'React Native · iOS + Android', color: C.primary },
                  { name: 'Doctor House Pro (Médico)', desc: 'MobileDoctorPro · React Native', color: C.teal },
                ].map(app => (
                  <div key={app.name} style={{ padding: 14, border: `1px solid ${C.line}`, borderRadius: R.md, borderLeft: `3px solid ${app.color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{app.name}</div>
                        <div style={{ fontSize: 11.5, color: C.inkMuted, marginTop: 2 }}>{app.desc}</div>
                      </div>
                      <Pill tone="ok" dot size="sm">Conectada</Pill>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === 'audit' && (
          <Card bare>
            {loading ? <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Spinner size={24}/></div> : (
              <Table
                dense
                columns={[
                  { h: 'Cuándo', render: r => new Date(r.created_at).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }), mono: true, w: 130 },
                  { h: 'Admin', render: r => r.admin_name || r.admin_username },
                  { h: 'Acción', render: r => <span style={{ fontFamily: F.mono, color: C.primary, fontSize: 11.5 }}>{r.action}</span> },
                  { h: 'Tipo', key: 'target_type' },
                  { h: 'Detalles', render: r => r.details ? JSON.stringify(r.details).slice(0, 60) : '—', wrap: true },
                ]}
                rows={logs}
              />
            )}
          </Card>
        )}
      </Page>
    </>
  );
}

function ResetPassword({ member, onBack }) {
  const [newPassword, setNewPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function handleReset() {
    if (!newPassword || !adminPassword) return;
    setSaving(true);
    try {
      await api.resetTeamPassword(member.id, newPassword, adminPassword);
      setDone(true);
    } catch (e) { alert(e.message); }
    setSaving(false);
  }

  return (
    <>
      <PageHeader
        kicker="— Equipo —"
        title={`Resetear contraseña · ${member.name}`}
        description={<span style={{ fontFamily: F.mono, color: C.inkMuted }}>{member.username}</span>}
        actions={<Btn variant="paper" size="md" icon={<I.ChevL size={14}/>} onClick={onBack}>Volver</Btn>}
      />
      <Page>
        <Card style={{ maxWidth: 420 }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Contraseña actualizada</div>
              <div style={{ color: C.inkMuted, fontSize: 13, marginBottom: 16 }}>El miembro deberá usar la nueva contraseña en su próximo inicio de sesión.</div>
              <Btn variant="paper" size="md" onClick={onBack}>Volver al equipo</Btn>
            </div>
          ) : (
            <>
              <CardHead title="Cambio de contraseña"/>
              <Field label="Nueva contraseña" required>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 8 caracteres"/>
              </Field>
              <Field label="Tu contraseña (confirmación)" required>
                <Input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="Tu contraseña actual"/>
              </Field>
              <Btn
                variant="primary" size="md" full
                icon={<I.Lock size={14}/>}
                disabled={!newPassword || !adminPassword || saving}
                onClick={handleReset}
              >
                {saving ? 'Guardando...' : 'Confirmar cambio'}
              </Btn>
            </>
          )}
        </Card>
      </Page>
    </>
  );
}

function MemberLogs({ member, onBack }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.teamMemberLogs(member.id).then(setLogs).catch(() => {}).finally(() => setLoading(false));
  }, [member.id]);

  return (
    <>
      <PageHeader
        kicker="— Equipo —"
        title={`Historial · ${member.name}`}
        description={<span style={{ fontFamily: F.mono, color: C.inkMuted }}>{member.username}</span>}
        actions={<Btn variant="paper" size="md" icon={<I.ChevL size={14}/>} onClick={onBack}>Volver</Btn>}
      />
      <Page>
        <Card bare>
          {loading ? (
            <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Spinner size={24}/></div>
          ) : logs.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: C.inkMuted }}>Sin actividad registrada</div>
          ) : (
            <Table
              dense
              columns={[
                { h: 'Cuándo', render: r => new Date(r.created_at).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }), mono: true, w: 130 },
                { h: 'Acción', render: r => <span style={{ fontFamily: F.mono, color: C.primary, fontSize: 11.5 }}>{r.action}</span> },
                { h: 'Tipo', key: 'target_type' },
                { h: 'Detalles', render: r => r.details ? JSON.stringify(r.details).slice(0, 80) : '—', wrap: true },
              ]}
              rows={logs}
            />
          )}
        </Card>
      </Page>
    </>
  );
}
