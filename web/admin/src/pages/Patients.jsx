import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { C, F, R } from '@/tokens';
import { Pill, Btn, Card, CardHead, Page, PageHeader, Table, Kpi, Spinner, Input } from '@/components/ui';
import * as I from '@/components/ui/Icons';

const STATUS_MAP = {
  pending:   ['warn',    'Pendiente'],
  matched:   ['info',    'Asignada'],
  on_way:    ['info',    'En camino'],
  arrived:   ['violet',  'Llegó'],
  in_consultation: ['teal','En consulta'],
  completed: ['ok',      'Completada'],
  cancelled: ['neutral', 'Cancelada'],
};

export default function Patients() {
  const [detail, setDetail] = useState(null);
  if (detail) return <PatientDetail id={detail} onBack={() => setDetail(null)}/>;
  return <PatientList onOpen={setDetail}/>;
}

function PatientList({ onOpen }) {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.patients({ search, limit: 100 })
      .then(d => { setRows(d.rows || d || []); setTotal(d.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <>
      <PageHeader
        kicker="— Operación —"
        title="Pacientes"
        description="Usuarios registrados en la plataforma cliente."
        actions={<Btn variant="paper" size="md" icon={<I.Download size={14}/>}>Exportar</Btn>}
      />
      <Page>
        <Card bare={true} style={{ marginBottom: 12, padding: 12, border: `1px solid ${C.line}`, borderRadius: 10, background: '#fff' }}>
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, teléfono..." icon={<I.Search size={14}/>}/>
        </Card>
        <Card bare>
          {loading ? (
            <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Spinner size={24}/></div>
          ) : (
            <Table
              onRowClick={r => onOpen(r.id)}
              columns={[
                { h: 'ID', key: 'id', mono: true, w: 80 },
                { h: 'Nombre', render: r => <strong>{r.name || <span style={{ color: C.inkSubtle }}>Sin nombre</span>}</strong> },
                { h: 'Teléfono', key: 'phone', mono: true },
                { h: 'Registrado', render: r => new Date(r.created_at).toLocaleDateString('es-PE') },
                { h: 'Visitas', align: 'right', mono: true, render: r => r.visit_count ?? '—' },
                { h: '', w: 24, render: () => <I.ChevR size={14} color={C.inkSubtle}/> },
              ]}
              rows={rows}
            />
          )}
        </Card>
      </Page>
    </>
  );
}

function PatientDetail({ id, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.patientDetail(id).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Spinner size={28}/></div>;
  if (!data) return <div style={{ padding: 32, color: C.inkMuted }}>Paciente no encontrado</div>;

  const { stats = {}, visits = [] } = data;

  return (
    <>
      <PageHeader
        kicker="— Paciente —"
        title={data.name || data.phone}
        description={<span style={{ fontFamily: F.mono, color: C.inkMuted }}>{data.phone}</span>}
        actions={<Btn variant="paper" size="md" icon={<I.ChevL size={14}/>} onClick={onBack}>Volver</Btn>}
      />
      <Page>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 12 }}>
          <Kpi label="Consultas" value={parseInt(stats.total) || 0}/>
          <Kpi label="Completadas" value={parseInt(stats.completed) || 0} accent={C.green}/>
          <Kpi mono label="Total gastado" value={stats.total_spent ? `S/ ${parseFloat(stats.total_spent).toLocaleString('es-PE',{minimumFractionDigits:2})}` : '—'}/>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 12 }}>
          <Card>
            <CardHead title="Datos del paciente"/>
            {[
              ['ID', data.id],
              ['Nombre', data.name],
              ['Teléfono', data.phone],
              ['Registrado', data.created_at ? new Date(data.created_at).toLocaleDateString('es-PE') : null],
              ['Push activo', data.has_push ? 'Sí' : 'No'],
            ].filter(([,v]) => v != null).map(([k, v]) => (
              <div key={k} style={{ display: 'grid', gridTemplateColumns: '110px 1fr', padding: '6px 0', borderBottom: `1px solid ${C.lineSoft}`, fontSize: 12.5 }}>
                <div style={{ color: C.inkMuted }}>{k}</div>
                <div style={{ fontWeight: 500, fontFamily: ['ID','Teléfono'].includes(k) ? F.mono : 'inherit', fontSize: ['ID'].includes(k) ? 10.5 : 12.5, wordBreak: 'break-all' }}>{v}</div>
              </div>
            ))}
          </Card>

          <Card bare>
            <CardHead title={`Historial de visitas (${visits.length})`}/>
            {visits.length === 0 ? (
              <div style={{ padding: 24, color: C.inkMuted, fontSize: 13 }}>Sin visitas registradas</div>
            ) : (
              <Table
                columns={[
                  { h: 'Fecha', render: r => new Date(r.created_at).toLocaleDateString('es-PE') },
                  { h: 'Estado', render: r => {
                    const [t, l] = STATUS_MAP[r.status] || ['neutral', r.status];
                    return <Pill tone={t} dot size="sm">{l}</Pill>;
                  }},
                  { h: 'Doctor', render: r => r.doctor_name || <span style={{ color: C.inkSubtle }}>Sin asignar</span> },
                  { h: 'Zona', render: r => r.address?.split(',')[0] || '—' },
                  { h: 'Monto', align: 'right', mono: true, render: r => {
                    const total = (parseFloat(r.amount)||0) + (parseFloat(r.tip)||0);
                    return total > 0 ? `S/ ${total.toFixed(2)}` : '—';
                  }},
                  { h: '★', align: 'right', w: 50, mono: true, render: r => r.rating ? r.rating + '★' : '—' },
                ]}
                rows={visits}
              />
            )}
          </Card>
        </div>
      </Page>
    </>
  );
}
