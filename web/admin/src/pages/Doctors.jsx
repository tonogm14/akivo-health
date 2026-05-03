import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { C, F, R } from '@/tokens';
import { Pill, Btn, IconBtn, Card, CardHead, Page, PageHeader, Table, Kpi, Input, Spinner, Field } from '@/components/ui';
import * as I from '@/components/ui/Icons';

export default function Doctors() {
  const [detail, setDetail] = useState(null);
  if (detail) return <DoctorDetail id={detail} onBack={() => setDetail(null)}/>;
  return <DoctorList onOpen={setDetail}/>;
}

function DoctorList({ onOpen }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.doctors().then(setRows).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = rows.filter(r => {
    const matchTab = tab === 'all' || (tab === 'active' && r.is_active) || (tab === 'inactive' && !r.is_active);
    const matchSearch = !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.cmp_license?.includes(search);
    return matchTab && matchSearch;
  });

  return (
    <>
      <PageHeader
        kicker="— Operación —"
        title="Médicos"
        description="Doctores registrados en la red Doctor House Pro."
        actions={<Btn variant="paper" size="md" icon={<I.Download size={14}/>}>Exportar</Btn>}
        tabs={[
          { id: 'all',      label: 'Todos',    count: rows.length },
          { id: 'active',   label: 'Activos',  count: rows.filter(r => r.is_active).length },
          { id: 'inactive', label: 'Inactivos',count: rows.filter(r => !r.is_active).length },
        ]}
        currentTab={tab} onTab={setTab}
      />
      <Page>
        <Card bare={true} pad={12} style={{ marginBottom: 12, padding: 12, border: `1px solid ${C.line}`, borderRadius: 10, background: '#fff' }}>
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, CMP..." icon={<I.Search size={14}/>}/>
        </Card>
        <Card bare>
          {loading ? (
            <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Spinner size={24}/></div>
          ) : (
            <Table
              onRowClick={r => onOpen(r.id)}
              columns={[
                { h: 'ID', key: 'id', mono: true, w: 80 },
                { h: 'Médico', render: r => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.primarySoft, color: C.primary, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>
                      {(r.name || '').split(' ').slice(-2).map(s => s[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{r.name}</div>
                      <div style={{ fontFamily: F.mono, fontSize: 10.5, color: C.inkMuted }}>CMP {r.cmp_license}</div>
                    </div>
                  </div>
                )},
                { h: 'Especialidad', key: 'specialty' },
                { h: 'Distritos', render: r => (r.districts || []).slice(0,2).join(', ') + ((r.districts || []).length > 2 ? ` +${r.districts.length-2}` : '') },
                { h: 'Estado', render: r => <Pill tone={r.is_active ? 'ok' : 'neutral'} dot size="sm">{r.is_active ? 'Activo' : 'Inactivo'}</Pill> },
                { h: 'Disponible', render: r => <Pill tone={r.is_available ? 'teal' : 'neutral'} dot size="sm">{r.is_available ? 'En línea' : 'Fuera'}</Pill> },
                { h: '', w: 24, render: () => <I.ChevR size={14} color={C.inkSubtle}/> },
              ]}
              rows={filtered}
            />
          )}
        </Card>
      </Page>
    </>
  );
}

function DoctorDetail({ id, onBack }) {
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deactivating, setDeactivating] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    Promise.all([api.doctor(id), api.doctorStats(id)])
      .then(([d, s]) => { setData(d); setStats(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDeactivate() {
    if (!reason.trim()) return;
    await api.deactivateDoctor(id, reason);
    setData(d => ({ ...d, is_active: false }));
    setDeactivating(false);
  }

  if (loading) return <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Spinner size={28}/></div>;
  if (!data) return null;

  return (
    <>
      <PageHeader
        kicker="— Médico —"
        title={<span>{data.name} <span style={{ fontWeight: 400, color: C.inkMuted }}>· <span style={{ fontFamily: F.mono }}>{data.id}</span></span></span>}
        description={<>
          <Pill tone={data.is_active ? 'ok' : 'neutral'} dot>{data.is_active ? 'Activo' : 'Inactivo'}</Pill>
          <span style={{ color: C.inkMuted, marginLeft: 10 }}>{data.specialty} · CMP {data.cmp_license}</span>
        </>}
        actions={<>
          <Btn variant="paper" size="md" icon={<I.ChevL size={14}/>} onClick={onBack}>Volver</Btn>
          {data.is_active && <Btn variant="danger" size="md" icon={<I.Warn size={14}/>} onClick={() => setDeactivating(true)}>Desactivar</Btn>}
        </>}
      />
      <Page>
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 12 }}>
            <Kpi label="Visitas totales" value={parseInt(stats.total_visits) || 0}/>
            <Kpi label="Completadas" value={parseInt(stats.completed_visits) || 0} accent={C.green}/>
            <Kpi label="Calificación" value={stats.avg_rating ? `★ ${parseFloat(stats.avg_rating).toFixed(2)}` : '—'} accent={C.amber}/>
            <Kpi mono label="Revenue" value={stats.total_revenue ? `S/ ${parseFloat(stats.total_revenue).toLocaleString('es-PE',{minimumFractionDigits:2})}` : '—'}/>
          </div>
        )}
        {deactivating && (
          <Card style={{ marginBottom: 12, borderColor: C.red }}>
            <CardHead title="Desactivar médico" right={<IconBtn icon={<I.X size={13}/>} onClick={() => setDeactivating(false)}/>}/>
            <Field label="Motivo (requerido)" required>
              <textarea value={reason} onChange={e => setReason(e.target.value)}
                style={{ width: '100%', minHeight: 70, padding: 10, border: `1px solid ${C.line}`, borderRadius: R.md, fontFamily: F.sans, fontSize: 13, resize: 'vertical', marginBottom: 10 }}/>
            </Field>
            <Btn variant="danger" size="sm" onClick={handleDeactivate} disabled={!reason.trim()}>Confirmar desactivación</Btn>
          </Card>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Card>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 10, marginBottom: 12 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.primarySoft, color: C.primary, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 10 }}>
                  {(data.name || '').split(' ').slice(-2).map(s => s[0]).join('')}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{data.name}</div>
                <div style={{ fontSize: 12, color: C.inkMuted }}>{data.email}</div>
                <div style={{ fontSize: 12, color: C.inkMuted }}>{data.phone}</div>
              </div>
              {[
                ['Especialidad', data.specialty],
                ['Sub-especialidad', data.sub_specialty],
                ['CMP', data.cmp_license],
                ['Universidad', data.university],
                ['Experiencia', data.experience_years ? `${data.experience_years} años` : null],
                ['DNI', data.dni_number],
                ['Fecha nac.', data.birth_date],
              ].filter(([,v]) => v).map(([k,v]) => (
                <div key={k} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', padding: '6px 0', borderBottom: `1px solid ${C.lineSoft}`, fontSize: 12.5 }}>
                  <div style={{ color: C.inkMuted }}>{k}</div>
                  <div style={{ fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </Card>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Card>
              <CardHead title="Distritos de cobertura"/>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(data.districts || []).map(d => <Pill key={d} tone="info" size="sm">{d}</Pill>)}
                {!(data.districts?.length) && <span style={{ color: C.inkMuted, fontSize: 12.5 }}>Sin distritos asignados</span>}
              </div>
            </Card>
            <Card>
              <CardHead title="Datos de pago"/>
              {[
                ['Método', data.payment_method],
                ['Datos', data.payment_data ? JSON.stringify(data.payment_data) : null],
              ].filter(([,v]) => v).map(([k,v]) => (
                <div key={k} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', padding: '6px 0', borderBottom: `1px solid ${C.lineSoft}`, fontSize: 12.5 }}>
                  <div style={{ color: C.inkMuted }}>{k}</div>
                  <div style={{ fontWeight: 500, fontFamily: F.mono }}>{v}</div>
                </div>
              ))}
            </Card>
            {data.bio && (
              <Card>
                <CardHead title="Biografía"/>
                <p style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.6 }}>{data.bio}</p>
              </Card>
            )}
          </div>
        </div>
      </Page>
    </>
  );
}
