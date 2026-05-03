import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/client';
import { C, F, R } from '@/tokens';
import { Pill, Btn, Card, CardHead, Page, PageHeader, Table, Kpi, Input, Spinner } from '@/components/ui';
import * as I from '@/components/ui/Icons';

const STATUS_MAP = {
  pending:   ['warn',   'Pendiente'],
  matched:   ['info',   'Asignada'],
  on_way:    ['info',   'En camino'],
  arrived:   ['violet', 'Llegó'],
  in_consultation: ['teal', 'En consulta'],
  completed: ['ok',     'Completada'],
  cancelled: ['neutral','Cancelada'],
};

export default function Consultations() {
  const [tab, setTab] = useState('all');
  const [detail, setDetail] = useState(null);

  if (detail) return <ConsultDetail id={detail} onBack={() => setDetail(null)}/>;
  return <ConsultList tab={tab} setTab={setTab} onOpen={setDetail}/>;
}

function ConsultList({ tab, setTab, onOpen }) {
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const LIMIT = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: LIMIT, offset: page * LIMIT };
      if (tab !== 'all') params.status = tab;
      if (search) params.search = search;
      const [data, s] = await Promise.all([api.consults(params), api.consultStats(params)]);
      setRows(data.rows || []);
      setTotal(data.total || 0);
      setStats(s);
    } catch {}
    setLoading(false);
  }, [tab, search, page]);

  useEffect(() => { load(); }, [load]);

  const statuses = ['pending','matched','on_way','arrived','in_consultation','completed','cancelled'];

  return (
    <>
      <PageHeader
        kicker="— Operación —"
        title="Consultas"
        description="Historial completo de visitas en la plataforma."
        actions={<>
          <Btn variant="paper" size="md" icon={<I.Download size={14}/>}>Exportar CSV</Btn>
        </>}
        tabs={[
          { id: 'all', label: 'Todas', count: total },
          { id: 'matched', label: 'En curso' },
          { id: 'completed', label: 'Completadas' },
          { id: 'cancelled', label: 'Canceladas' },
        ]}
        currentTab={tab} onTab={t => { setTab(t); setPage(0); }}
      />
      <Page>
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 12 }}>
            <Kpi label="Total" value={stats.total}/>
            <Kpi label="Activas" value={stats.active} accent={C.primary}/>
            <Kpi label="Completadas" value={stats.completed} accent={C.green}/>
            <Kpi label="Canceladas" value={stats.cancelled}/>
            <Kpi mono label="Revenue" value={stats.revenue ? `S/ ${parseFloat(stats.revenue).toLocaleString('es-PE',{minimumFractionDigits:2})}` : '—'}/>
          </div>
        )}

        <Card bare={true} pad={12} style={{ marginBottom: 12, padding: 12, border: `1px solid ${C.line}`, borderRadius: 10, background: '#fff' }}>
          <Input
            value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Buscar por ID, paciente, doctor..."
            icon={<I.Search size={14}/>}
          />
        </Card>

        <Card bare>
          {loading ? (
            <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Spinner size={24}/></div>
          ) : (
            <Table
              onRowClick={r => onOpen(r.id)}
              columns={[
                { h: 'ID', key: 'id', mono: true, w: 120 },
                { h: 'Fecha', render: r => new Date(r.created_at).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' }) },
                { h: 'Estado', render: r => {
                  const [tone, label] = STATUS_MAP[r.status] || ['neutral', r.status];
                  return <Pill tone={tone} dot size="sm">{label}</Pill>;
                }},
                { h: 'Paciente', render: r => r.patient_name || '—' },
                { h: 'Doctor', render: r => r.doctor_name || <span style={{ color: C.inkSubtle }}>Sin asignar</span> },
                { h: 'Zona', key: 'address', render: r => r.address?.split(',')[0] || '—' },
                { h: 'Monto', align: 'right', mono: true, render: r => r.amount ? `S/ ${parseFloat(r.amount).toFixed(2)}` : '—' },
                { h: '★', align: 'right', mono: true, w: 50, render: r => r.rating ? r.rating + '★' : '—' },
                { h: '', w: 24, render: () => <I.ChevR size={14} color={C.inkSubtle}/> },
              ]}
              rows={rows}
            />
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderTop: `1px solid ${C.line}`, fontSize: 12, color: C.inkMuted }}>
            <span>Mostrando {rows.length} de {total}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <Btn variant="paper" size="sm" icon={<I.ChevL size={12}/>} disabled={page === 0} onClick={() => setPage(p => p - 1)}>Anterior</Btn>
              <Btn variant="paper" size="sm" iconRight={<I.ChevR size={12}/>} disabled={(page + 1) * LIMIT >= total} onClick={() => setPage(p => p + 1)}>Siguiente</Btn>
            </div>
          </div>
        </Card>
      </Page>
    </>
  );
}

function ConsultDetail({ id, onBack }) {
  const [data, setData] = useState(null);
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('timeline');
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    api.consult(id).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (tab === 'chat' && chat === null) {
      api.consultChat(id).then(setChat).catch(() => setChat([]));
    }
  }, [tab]);

  async function handleCancel() {
    if (!cancelReason.trim()) return;
    try {
      await api.cancelVisit(id, cancelReason);
      setData(d => ({ ...d, status: 'cancelled' }));
      setCancelling(false);
    } catch (e) { alert(e.message); }
  }

  if (loading) return <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Spinner size={28}/></div>;
  if (!data) return <div style={{ padding: 32, color: C.inkMuted }}>No encontrado</div>;

  const [statusTone, statusLabel] = STATUS_MAP[data.status] || ['neutral', data.status];

  return (
    <>
      <PageHeader
        kicker="— Consulta —"
        title={<span>{data.id} <span style={{ fontWeight: 400, color: C.inkMuted }}>· {data.patient_name || data.user_id}</span></span>}
        description={<><Pill tone={statusTone} dot>{statusLabel}</Pill> <span style={{ color: C.inkMuted, marginLeft: 8 }}>{new Date(data.created_at).toLocaleString('es-PE')}</span></>}
        actions={<>
          <Btn variant="paper" size="md" icon={<I.ChevL size={14}/>} onClick={onBack}>Volver</Btn>
          {!['completed','cancelled'].includes(data.status) && (
            <Btn variant="danger" size="md" icon={<I.X size={14}/>} onClick={() => setCancelling(true)}>Cancelar</Btn>
          )}
        </>}
        tabs={[
          { id: 'timeline', label: 'Timeline' },
          { id: 'detail', label: 'Detalle médico' },
          { id: 'payment', label: 'Pago' },
          ...(data.report ? [{ id: 'report', label: 'Informe' }] : []),
          ...(data.prescriptions?.length ? [{ id: 'rx', label: `Recetas (${data.prescriptions.length})` }] : []),
          { id: 'chat', label: 'Chat' },
        ]}
        currentTab={tab} onTab={setTab}
      />
      <Page>
        {cancelling && (
          <Card style={{ marginBottom: 12, borderColor: C.red }}>
            <CardHead title="Confirmar cancelación" right={<Btn variant="ghost" size="sm" icon={<I.X size={12}/>} onClick={() => setCancelling(false)}/>}/>
            <textarea
              value={cancelReason} onChange={e => setCancelReason(e.target.value)}
              placeholder="Motivo de cancelación (requerido)..."
              style={{ width: '100%', minHeight: 80, padding: 10, border: `1px solid ${C.line}`, borderRadius: R.md, fontFamily: F.sans, fontSize: 13, resize: 'vertical', marginBottom: 10 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="danger" size="sm" onClick={handleCancel} disabled={!cancelReason.trim()}>Confirmar cancelación</Btn>
              <Btn variant="paper" size="sm" onClick={() => setCancelling(false)}>Cancelar</Btn>
            </div>
          </Card>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 12 }}>
          <Card>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>Paciente</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{data.patient_name || '—'}</div>
            <div style={{ fontSize: 11.5, color: C.inkMuted }}>{data.patient_age ? `${data.patient_age} años` : ''} {data.patient_phone || ''}</div>
          </Card>
          <Card>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>Doctor</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{data.doctor_name || <span style={{ color: C.inkSubtle }}>Sin asignar</span>}</div>
            <div style={{ fontFamily: F.mono, fontSize: 11, color: C.inkMuted }}>{data.specialty || ''} {data.cmp_license ? `· CMP ${data.cmp_license}` : ''}</div>
          </Card>
          <Card>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>Cobro</div>
            <div style={{ fontFamily: F.mono, fontSize: 22, fontWeight: 700 }}>{data.amount ? `S/ ${parseFloat(data.amount).toFixed(2)}` : '—'}</div>
            <div style={{ fontSize: 11.5, color: C.inkMuted }}>{data.payment_method || ''}</div>
          </Card>
          <Card>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>Urgencia</div>
            <div style={{ fontSize: 14, fontWeight: 700, textTransform: 'capitalize' }}>{data.urgency || '—'}</div>
            <div style={{ fontSize: 11.5, color: C.inkMuted }}>{data.service_type || ''}</div>
          </Card>
        </div>

        {tab === 'timeline' && (
          <Card>
            <CardHead title="Timeline de eventos"/>
            {(data.events || []).length === 0 && <div style={{ color: C.inkMuted, fontSize: 13 }}>Sin eventos registrados</div>}
            {(data.events || []).map((ev, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: i < data.events.length - 1 ? `1px solid ${C.lineSoft}` : 'none' }}>
                <div style={{ width: 2, background: C.line, alignSelf: 'stretch', marginLeft: 6, flexShrink: 0 }}/>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{ev.event_type}</div>
                  <div style={{ fontSize: 11.5, color: C.inkMuted, fontFamily: F.mono }}>{new Date(ev.created_at).toLocaleString('es-PE')}</div>
                  {ev.actor_name && <div style={{ fontSize: 11.5, color: C.inkSoft }}>{ev.actor_name}</div>}
                </div>
              </div>
            ))}
          </Card>
        )}

        {tab === 'detail' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Card>
              <CardHead title="Datos de la visita"/>
              {[
                ['ID Visita', data.id],
                ['Dirección', data.address],
                ['Urgencia', data.urgency],
                ['Tipo de servicio', data.service_type],
                ['Síntomas', (data.symptoms || []).join(', ')],
                ['ETA calculado', data.eta_minutes ? `${data.eta_minutes} min` : null],
                ['Motivo cancelación', data.cancel_reason],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', padding: '7px 0', borderBottom: `1px solid ${C.lineSoft}`, fontSize: 12.5 }}>
                  <div style={{ color: C.inkMuted }}>{k}</div>
                  <div style={{ fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </Card>

            <Card>
              <CardHead title="Paciente atendido"/>
              {[
                ['Nombre', data.patient_name],
                ['Edad', data.patient_age ? `${data.patient_age} años (${data.age_group || ''})` : data.age_group],
                ['Teléfono', data.patient_phone],
                ['Notas', data.patient_notes],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', padding: '7px 0', borderBottom: `1px solid ${C.lineSoft}`, fontSize: 12.5 }}>
                  <div style={{ color: C.inkMuted }}>{k}</div>
                  <div style={{ fontWeight: 500 }}>{v}</div>
                </div>
              ))}
              {data.medical_flags?.length > 0 && (
                <div style={{ padding: '10px 0' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>Flags médicos</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {data.medical_flags.map(f => <Pill key={f} tone="warn" size="sm">{f}</Pill>)}
                  </div>
                </div>
              )}
            </Card>

            {data.review && (
              <Card>
                <CardHead title="Reseña del paciente"/>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: C.amber, fontSize: 18 }}>{'★'.repeat(data.review.rating)}{'☆'.repeat(5-data.review.rating)}</span>
                  <span style={{ fontSize: 13, color: C.inkMuted }}>{data.review.rating}/5</span>
                </div>
                {data.review.tags?.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                    {data.review.tags.map(t => <Pill key={t} tone="info" size="sm">{t}</Pill>)}
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {tab === 'payment' && (
          <Card>
            <CardHead title="Estado del pago"/>
            {[
              ['Monto', data.amount ? `S/ ${parseFloat(data.amount).toFixed(2)}` : '—'],
              ['Propina', data.tip > 0 ? `S/ ${parseFloat(data.tip).toFixed(2)}` : null],
              ['Total', (data.amount && data.tip) ? `S/ ${(parseFloat(data.amount) + parseFloat(data.tip)).toFixed(2)}` : null],
              ['Método', data.payment_method],
              ['Estado', data.payment_status],
              ['Confirmado', data.payment_confirmed_at ? new Date(data.payment_confirmed_at).toLocaleString('es-PE') : null],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', padding: '7px 0', borderBottom: `1px solid ${C.lineSoft}`, fontSize: 12.5 }}>
                <div style={{ color: C.inkMuted }}>{k}</div>
                <div style={{ fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </Card>
        )}

        {tab === 'report' && data.report && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Card>
              <CardHead title="Informe clínico"/>
              {[
                ['Diagnóstico', data.report.diagnosis],
                ['Código', data.report.diagnosis_code],
                ['Notas clínicas', data.report.clinical_notes],
                ['Inicio consulta', data.report.consultation_started_at ? new Date(data.report.consultation_started_at).toLocaleString('es-PE') : null],
                ['Fin consulta', data.report.consultation_finished_at ? new Date(data.report.consultation_finished_at).toLocaleString('es-PE') : null],
                ['Duración', data.report.duration_minutes != null ? `${data.report.duration_minutes} min` : null],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', padding: '7px 0', borderBottom: `1px solid ${C.lineSoft}`, fontSize: 12.5 }}>
                  <div style={{ color: C.inkMuted }}>{k}</div>
                  <div style={{ fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </Card>
            <Card>
              <CardHead title="Signos vitales"/>
              {[
                ['Temperatura', data.report.temp_c != null ? `${data.report.temp_c} °C` : null],
                ['Presión arterial', data.report.bp_systolic ? `${data.report.bp_systolic}/${data.report.bp_diastolic} mmHg` : null],
                ['Frecuencia cardíaca', data.report.hr_bpm != null ? `${data.report.hr_bpm} lpm` : null],
                ['SpO₂', data.report.spo2_pct != null ? `${data.report.spo2_pct}%` : null],
                ['Frecuencia resp.', data.report.rr_rpm != null ? `${data.report.rr_rpm} rpm` : null],
                ['Peso', data.report.weight_kg != null ? `${data.report.weight_kg} kg` : null],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', padding: '7px 0', borderBottom: `1px solid ${C.lineSoft}`, fontSize: 12.5 }}>
                  <div style={{ color: C.inkMuted }}>{k}</div>
                  <div style={{ fontWeight: 600, fontFamily: F.mono }}>{v}</div>
                </div>
              ))}
              {![data.report.temp_c, data.report.bp_systolic, data.report.hr_bpm, data.report.spo2_pct].some(v => v != null) && (
                <div style={{ color: C.inkMuted, fontSize: 13 }}>Sin signos vitales registrados</div>
              )}
            </Card>
          </div>
        )}

        {tab === 'rx' && (
          <Card>
            <CardHead title="Recetas médicas"/>
            {(data.prescriptions || []).map((p, i) => (
              <div key={p.id} style={{ padding: '12px 0', borderBottom: i < data.prescriptions.length - 1 ? `1px solid ${C.lineSoft}` : 'none' }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{p.drug_name}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12, color: C.inkMuted }}>
                  {p.dose && <span>Dosis: <strong>{p.dose}</strong></span>}
                  {p.frequency && <span>Frecuencia: <strong>{p.frequency}</strong></span>}
                  {p.duration_days && <span>Duración: <strong>{p.duration_days} días</strong></span>}
                </div>
                {p.instructions && <div style={{ marginTop: 4, fontSize: 12.5, color: C.inkSoft }}>{p.instructions}</div>}
              </div>
            ))}
            {!(data.prescriptions?.length) && <div style={{ color: C.inkMuted, fontSize: 13 }}>Sin recetas</div>}
          </Card>
        )}

        {tab === 'chat' && (
          <Card>
            <CardHead title="Historial de chat"/>
            {chat === null && <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}><Spinner size={20}/></div>}
            {chat?.length === 0 && <div style={{ color: C.inkMuted, fontSize: 13 }}>Sin mensajes en esta consulta</div>}
            {chat && chat.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {chat.map((msg) => {
                  const isDoctor = msg.sender_type === 'doctor';
                  return (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isDoctor ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '72%', padding: '8px 12px',
                        background: isDoctor ? C.primarySoft : C.surfaceAlt,
                        border: `1px solid ${isDoctor ? C.primary + '33' : C.line}`,
                        borderRadius: isDoctor ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                        fontSize: 13,
                      }}>
                        {msg.text}
                      </div>
                      <div style={{ fontSize: 10.5, color: C.inkSubtle, marginTop: 2, display: 'flex', gap: 6 }}>
                        <span style={{ fontWeight: 600 }}>{msg.sender_name}</span>
                        <span>{new Date(msg.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}
      </Page>
    </>
  );
}
