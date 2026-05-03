import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/client';
import { useLiveStream } from '@/hooks/useLiveStream';
import { C, F, R } from '@/tokens';
import { Pill, Btn, Card, CardHead, Page, PageHeader, Table, Spinner, Field, Input } from '@/components/ui';
import * as I from '@/components/ui/Icons';

export default function LiveControl() {
  const [tab, setTab] = useState('visits');
  const { events, connected, clear } = useLiveStream();
  const [liveVisits, setLiveVisits] = useState([]);
  const [liveDoctors, setLiveDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pushModal, setPushModal] = useState(null); // { type: 'user'|'doctor'|'broadcast', id?, name? }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [v, d] = await Promise.all([api.activeVisits(), api.activeDoctors()]);
      setLiveVisits(v || []);
      setLiveDoctors(d || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 30s
  useEffect(() => {
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  // Update from SSE
  useEffect(() => {
    if (!events.length) return;
    const last = events[0];
    if (last.type === 'visit_created' || last.type === 'visit_matched' || last.type === 'visit_completed' || last.type === 'visit_cancelled') {
      load();
    }
  }, [events]);

  const activeVisits  = liveVisits.filter(v => ['pending','matched','on_way','arrived','in_consultation'].includes(v.status));
  const onlineDoctors = liveDoctors.filter(d => d.is_available);

  return (
    <>
      <PageHeader
        kicker="— Control bidireccional —"
        title="Control en vivo"
        description="Vista en tiempo real + control remoto de las apps cliente y profesional."
        actions={<>
          <Pill tone={connected ? 'ok' : 'warn'} dot>{connected ? '● Stream activo' : '○ Sin stream'}</Pill>
          <Btn variant="paper" size="md" icon={<I.Refresh size={14}/>} onClick={load}>Refrescar</Btn>
          <Btn variant="primary" size="md" icon={<I.Broadcast size={14}/>} onClick={() => setPushModal({ type: 'broadcast' })}>Broadcast</Btn>
        </>}
        tabs={[
          { id: 'visits',  label: 'Visitas activas',  count: activeVisits.length },
          { id: 'doctors', label: 'Médicos online',   count: onlineDoctors.length },
          { id: 'feed',    label: 'Feed en vivo' },
        ]}
        currentTab={tab} onTab={setTab}
      />

      {pushModal && <PushModal modal={pushModal} onClose={() => setPushModal(null)}/>}

      <Page>
        {/* Live counters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 12 }}>
          <Card style={{ borderLeft: `3px solid ${C.primary}` }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 }}>Visitas activas</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.ink }}>{activeVisits.length}</div>
            <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 2 }}>en progreso ahora</div>
          </Card>
          <Card style={{ borderLeft: `3px solid ${C.green}` }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 }}>Médicos online</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.ink }}>{onlineDoctors.length}</div>
            <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 2 }}>disponibles ahora</div>
          </Card>
          <Card style={{ borderLeft: `3px solid ${C.amber}` }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 }}>Sin asignar</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: liveVisits.filter(v=>v.status==='pending').length > 0 ? C.amber : C.ink }}>
              {liveVisits.filter(v => v.status === 'pending').length}
            </div>
            <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 2 }}>esperando doctor</div>
          </Card>
          <Card style={{ borderLeft: `3px solid ${C.teal}` }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 }}>Médicos totales</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.ink }}>{liveDoctors.length}</div>
            <div style={{ fontSize: 11, color: C.inkMuted, marginTop: 2 }}>registrados activos</div>
          </Card>
        </div>

        {tab === 'visits' && (
          <Card bare>
            {loading ? (
              <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Spinner size={24}/></div>
            ) : (
              <Table
                columns={[
                  { h: 'ID', key: 'id', mono: true, w: 100 },
                  { h: 'Estado', render: r => {
                    const map = { pending:['warn','Pendiente'], matched:['info','Asignada'], on_way:['teal','En camino'], arrived:['violet','Llegó'], in_consultation:['ok','En consulta'] };
                    const [t,l] = map[r.status] || ['neutral', r.status];
                    return <Pill tone={t} dot size="sm">{l}</Pill>;
                  }},
                  { h: 'Paciente', render: r => r.patient_name || r.user_phone || r.user_id },
                  { h: 'Doctor', render: r => r.doctor_name || <span style={{ color: C.amberSoft }}>Sin asignar</span> },
                  { h: 'Urgencia', key: 'urgency', render: r => <span style={{ textTransform: 'capitalize' }}>{r.urgency}</span> },
                  { h: 'Dirección', render: r => (r.address || '').split(',')[0] },
                  { h: 'Creada', render: r => new Date(r.created_at).toLocaleTimeString('es-PE') },
                  { h: 'Acciones', render: r => (
                    <div style={{ display: 'flex', gap: 4 }}>
                      {r.user_id && (
                        <Btn variant="paper" size="sm" icon={<I.Mobile size={12}/>} onClick={e => { e.stopPropagation(); setPushModal({ type: 'user', id: r.user_id, name: r.patient_name || 'Paciente' }); }}>
                          Push
                        </Btn>
                      )}
                      {r.doctor_id && (
                        <Btn variant="paper" size="sm" icon={<I.Mobile size={12}/>} onClick={e => { e.stopPropagation(); setPushModal({ type: 'doctor', id: r.doctor_id, name: r.doctor_name || 'Doctor' }); }}>
                          Pro
                        </Btn>
                      )}
                    </div>
                  )},
                ]}
                rows={activeVisits}
              />
            )}
            {!loading && activeVisits.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center', color: C.inkMuted }}>No hay visitas activas en este momento</div>
            )}
          </Card>
        )}

        {tab === 'doctors' && (
          <Card bare>
            {loading ? (
              <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Spinner size={24}/></div>
            ) : (
              <Table
                columns={[
                  { h: 'ID', key: 'id', mono: true, w: 80 },
                  { h: 'Médico', render: r => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: r.is_available ? C.greenSoft : C.lineSoft, color: r.is_available ? C.green : C.inkMuted, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>
                        {(r.name || '').split(' ').slice(-2).map(s => s[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{r.name}</div>
                        <div style={{ fontFamily: F.mono, fontSize: 10.5, color: C.inkMuted }}>{r.specialty}</div>
                      </div>
                    </div>
                  )},
                  { h: 'Estado', render: r => <Pill tone={r.is_available ? 'ok' : 'neutral'} dot size="sm">{r.is_available ? 'Disponible' : 'No disponible'}</Pill> },
                  { h: 'Teléfono', key: 'phone', mono: true },
                  { h: 'Acciones', render: r => (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Btn variant="paper" size="sm" icon={<I.Mobile size={12}/>} onClick={() => setPushModal({ type: 'doctor', id: r.id, name: r.name })}>
                        Push Pro
                      </Btn>
                      <Btn variant="ghost" size="sm" icon={r.is_available ? <I.Lock size={12}/> : <I.Unlock size={12}/>}
                        onClick={async () => {
                          await api.toggleDoctorAvailability(r.id);
                          setLiveDoctors(prev => prev.map(d => d.id === r.id ? { ...d, is_available: !d.is_available } : d));
                        }}>
                        {r.is_available ? 'Pausar' : 'Activar'}
                      </Btn>
                    </div>
                  )},
                ]}
                rows={liveDoctors}
              />
            )}
          </Card>
        )}

        {tab === 'feed' && (
          <Card bare style={{ maxHeight: 500, display: 'flex', flexDirection: 'column' }}>
            <CardHead
              style={{ padding: '14px 16px 10px', margin: 0 }}
              title="Feed en vivo · SSE"
              subtitle={connected ? '● recibiendo eventos en tiempo real' : '○ esperando conexión'}
              right={<Btn variant="ghost" size="sm" onClick={clear}>Limpiar</Btn>}
            />
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 14px' }}>
              {events.length === 0 && (
                <div style={{ padding: '32px 0', textAlign: 'center', color: C.inkMuted, fontSize: 13 }}>Sin eventos aún</div>
              )}
              {events.map((ev, i) => {
                const toneColors = { visit_created: C.primary, visit_matched: C.teal, visit_completed: C.green, visit_cancelled: C.red, doctor_online: C.green, doctor_offline: C.inkSubtle };
                const dot = toneColors[ev.type] || C.inkSubtle;
                return (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < events.length - 1 ? `1px solid ${C.lineSoft}` : 'none' }}>
                    <div style={{ width: 6, height: 6, marginTop: 7, borderRadius: '50%', background: dot, flexShrink: 0 }}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, color: C.ink }}>{ev.message || ev.type}</div>
                      <div style={{ fontFamily: F.mono, fontSize: 10, color: C.inkMuted, marginTop: 2 }}>
                        {new Date(ev.ts || Date.now()).toLocaleTimeString('es-PE')} · {ev.type}
                        {ev.visitId && <> · <span style={{ color: C.primary }}>VST-{ev.visitId}</span></>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </Page>
    </>
  );
}

function PushModal({ modal, onClose }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('all');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function send() {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    try {
      if (modal.type === 'broadcast') {
        await api.pushBroadcast({ target, title, body });
      } else if (modal.type === 'user') {
        await api.pushToUser(modal.id, { title, body });
      } else if (modal.type === 'doctor') {
        await api.pushToDoctor(modal.id, { title, body });
      }
      setSent(true);
      setTimeout(() => { setSent(false); onClose(); }, 1500);
    } catch (e) { alert(e.message); }
    setSending(false);
  }

  const isBroadcast = modal.type === 'broadcast';
  const targetLabel = isBroadcast ? 'Broadcast' : modal.type === 'user' ? `Paciente · ${modal.name}` : `Dr. ${modal.name} (Pro)`;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(14,22,32,0.5)', zIndex: 59 }}/>
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 440, background: '#fff', borderRadius: 12, padding: 24,
        zIndex: 60, boxShadow: '0 20px 60px rgba(14,22,32,0.25)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, display: 'flex', alignItems: 'center', gap: 8 }}>
              <I.Mobile size={16} color={C.primary}/> Enviar notificación push
            </div>
            <div style={{ fontSize: 12, color: C.inkMuted, marginTop: 2 }}>→ {targetLabel}</div>
          </div>
          <Btn variant="ghost" size="sm" icon={<I.X size={14}/>} onClick={onClose}/>
        </div>

        {isBroadcast && (
          <Field label="Destino">
            <select value={target} onChange={e => setTarget(e.target.value)} style={{ width: '100%', height: 34, padding: '0 10px', border: `1px solid ${C.line}`, borderRadius: R.md, fontFamily: F.sans, fontSize: 13 }}>
              <option value="all">Todos (pacientes + médicos)</option>
              <option value="users">Solo pacientes (app cliente)</option>
              <option value="doctors">Solo médicos (app Pro)</option>
            </select>
          </Field>
        )}

        <Field label="Título" required>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Aviso importante"/>
        </Field>
        <Field label="Mensaje" required>
          <textarea value={body} onChange={e => setBody(e.target.value)}
            placeholder="Contenido de la notificación..."
            style={{ width: '100%', minHeight: 80, padding: 10, border: `1px solid ${C.line}`, borderRadius: R.md, fontFamily: F.sans, fontSize: 13, resize: 'vertical' }}
          />
        </Field>

        <div style={{ marginTop: 4, padding: '8px 10px', background: C.primarySoft, borderRadius: R.md, fontSize: 11.5, color: C.primary, marginBottom: 14 }}>
          <strong>Vista previa:</strong> [{title || 'Título'}] {body || 'Mensaje...'}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="primary" size="md" full icon={<I.Send size={14}/>} onClick={send} disabled={sending || sent || !title.trim() || !body.trim()}>
            {sent ? '✓ Enviado' : sending ? 'Enviando...' : 'Enviar notificación'}
          </Btn>
          <Btn variant="paper" size="md" onClick={onClose}>Cancelar</Btn>
        </div>
      </div>
    </>
  );
}
