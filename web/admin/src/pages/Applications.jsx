import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { C, F, R } from '@/tokens';
import { Pill, Btn, Card, CardHead, Page, PageHeader, Table, Spinner } from '@/components/ui';
import * as I from '@/components/ui/Icons';

const STATUS_MAP = {
  pending:   ['warn',  'Pendiente'],
  approved:  ['ok',    'Aprobada'],
  rejected:  ['danger','Rechazada'],
};

export default function Applications() {
  const [detail, setDetail] = useState(null);
  if (detail) return <AppDetail id={detail} onBack={() => setDetail(null)}/>;
  return <AppList onOpen={setDetail}/>;
}

function AppList({ onOpen }) {
  const [rows, setRows]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]     = useState('pending');

  useEffect(() => {
    api.applications().then(d => setRows(d.rows || d)).catch(() => []).finally(() => setLoading(false));
  }, []);

  const filtered = tab === 'all' ? rows : rows.filter(r => tab === 'pending' ? r.status === 'pending' : r.status === tab);

  return (
    <>
      <PageHeader
        kicker="— Validación —"
        title="Aplicaciones de doctores"
        description="Solicitudes de profesionales para unirse a la red."
        tabs={[
          { id: 'pending',  label: 'Pendientes', count: rows.filter(r => r.status === 'pending').length },
          { id: 'approved', label: 'Aprobadas',  count: rows.filter(r => r.status === 'approved').length },
          { id: 'rejected', label: 'Rechazadas', count: rows.filter(r => r.status === 'rejected').length },
          { id: 'all',      label: 'Todas',       count: rows.length },
        ]}
        currentTab={tab} onTab={setTab}
      />
      <Page>
        <Card bare>
          {loading ? (
            <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Spinner size={24}/></div>
          ) : (
            <Table
              onRowClick={r => onOpen(r.id)}
              columns={[
                { h: 'ID', key: 'id', mono: true, w: 100 },
                { h: 'Aplicante', render: r => (
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: C.inkMuted }}>{r.specialty}</div>
                  </div>
                )},
                { h: 'Email', key: 'email', mono: true },
                { h: 'Teléfono', key: 'phone', mono: true },
                { h: 'CMP', key: 'cmp_license', mono: true },
                { h: 'Enviada', render: r => new Date(r.created_at).toLocaleDateString('es-PE') },
                { h: 'Estado', render: r => {
                  const [tone, label] = STATUS_MAP[r.status] || ['neutral', r.status];
                  return <Pill tone={tone} dot size="sm">{label}</Pill>;
                }},
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

const STEPS = [
  { id: 'personal',     label: '1. Datos personales' },
  { id: 'professional', label: '2. Profesional' },
  { id: 'docs',         label: '3. Documentos' },
  { id: 'background',   label: '4. Antecedentes' },
  { id: 'kyc',          label: '5. KYC / Identidad' },
  { id: 'interview',    label: '6. Entrevista' },
  { id: 'contract',     label: '7. Contrato y final' },
];

function AppDetail({ id, onBack }) {
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep]   = useState('personal');
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.application(id).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  async function handleApprove() {
    setSaving(true);
    try {
      await api.approveApp(id);
      setData(d => ({ ...d, status: 'approved' }));
    } catch (e) { alert(e.message); }
    setSaving(false);
  }

  async function handleReject() {
    if (!rejectReason.trim()) return;
    setSaving(true);
    try {
      await api.rejectApp(id, rejectReason);
      setData(d => ({ ...d, status: 'rejected' }));
      setRejecting(false);
    } catch (e) { alert(e.message); }
    setSaving(false);
  }

  if (loading) return <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Spinner size={28}/></div>;
  if (!data) return null;

  const isPending = data.status === 'pending';
  const [statusTone] = STATUS_MAP[data.status] || ['neutral'];

  return (
    <>
      <PageHeader
        kicker="— Aplicación —"
        title={<span>{data.name} <span style={{ fontWeight: 400, color: C.inkMuted }}>· <span style={{ fontFamily: F.mono }}>{data.id}</span></span></span>}
        description={<>
          <Pill tone={statusTone} dot>{data.status}</Pill>
          <span style={{ color: C.inkMuted, marginLeft: 8 }}>{data.specialty} · {new Date(data.created_at).toLocaleDateString('es-PE')}</span>
        </>}
        actions={<>
          <Btn variant="paper" size="md" icon={<I.ChevL size={14}/>} onClick={onBack}>Volver</Btn>
          {isPending && <>
            <Btn variant="danger" size="md" icon={<I.X size={14}/>} onClick={() => setRejecting(true)}>Rechazar</Btn>
            <Btn variant="ok" size="md" icon={<I.Check size={14}/>} onClick={handleApprove} disabled={saving}>
              {saving ? 'Procesando...' : 'Aprobar'}
            </Btn>
          </>}
        </>}
      />
      <Page>
        {rejecting && (
          <Card style={{ marginBottom: 12, borderColor: C.red }}>
            <CardHead title="Rechazar aplicación"/>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Motivo del rechazo (será enviado por email)..."
              style={{ width: '100%', minHeight: 80, padding: 10, border: `1px solid ${C.line}`, borderRadius: R.md, fontFamily: F.sans, fontSize: 13, resize: 'vertical', marginBottom: 10 }}/>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="danger" size="sm" onClick={handleReject} disabled={!rejectReason.trim() || saving}>Confirmar rechazo</Btn>
              <Btn variant="paper" size="sm" onClick={() => setRejecting(false)}>Cancelar</Btn>
            </div>
          </Card>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 12 }}>
          {/* Stepper */}
          <Card bare style={{ position: 'sticky', top: 80, alignSelf: 'flex-start' }}>
            <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.lineSoft}`, fontSize: 10.5, fontWeight: 600, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.4 }}>Pasos</div>
            {STEPS.map((s, i) => {
              const active = step === s.id;
              return (
                <button key={s.id} onClick={() => setStep(s.id)} style={{
                  width: '100%', textAlign: 'left', padding: '9px 14px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: active ? C.primarySoft : 'transparent',
                  border: 'none', borderLeft: `3px solid ${active ? C.primary : 'transparent'}`,
                  cursor: 'pointer', fontSize: 12.5,
                  color: active ? C.primary : C.inkSoft, fontWeight: active ? 600 : 400,
                  borderBottom: i < STEPS.length - 1 ? `1px solid ${C.lineSoft}` : 'none',
                }}>
                  {s.label}
                </button>
              );
            })}
          </Card>

          {/* Content */}
          <Card>
            <CardHead title={STEPS.find(s => s.id === step)?.label || ''}/>
            <AppStepContent data={data} step={step}/>
          </Card>
        </div>
      </Page>
    </>
  );
}

function AppStepContent({ data, step }) {
  const fields = {
    personal: [
      ['Nombre completo', data.name],
      ['Email', data.email],
      ['Teléfono', data.phone],
      ['DNI', data.dni_number],
      ['Fecha nacimiento', data.birth_date],
    ],
    professional: [
      ['Especialidad', data.specialty],
      ['Sub-especialidad', data.sub_specialty],
      ['CMP', data.cmp_license],
      ['Universidad', data.university],
      ['Años de experiencia', data.experience_years],
      ['Distritos', (data.districts || []).join(', ')],
    ],
    docs: [['Documentos', data.documents ? JSON.stringify(data.documents, null, 2) : 'Sin documentos']],
    background: [['Información adicional', data.bio || 'Sin información']],
    kyc: [['Estado KYC', 'Pendiente verificación manual']],
    interview: [['Estado entrevista', 'Pendiente programar']],
    contract: [['Estado contrato', data.status === 'approved' ? 'Firmado y activo' : 'Pendiente']],
  };

  const items = fields[step] || [];
  return (
    <div>
      {items.map(([k, v]) => (
        <div key={k} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', padding: '8px 0', borderBottom: `1px solid ${C.lineSoft}`, fontSize: 12.5 }}>
          <div style={{ color: C.inkMuted, fontWeight: 600 }}>{k}</div>
          <div style={{ color: C.inkSoft, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{v || '—'}</div>
        </div>
      ))}
    </div>
  );
}
