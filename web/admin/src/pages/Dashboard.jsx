import { useState, useEffect } from 'react';
import { C, F } from '@/tokens';
import { api } from '@/api/client';
import { useLiveStream } from '@/hooks/useLiveStream';
import { Kpi, Card, CardHead, Page, PageHeader, Pill, Btn, Table, Sparkline, Bars } from '@/components/ui';
import * as I from '@/components/ui/Icons';

export default function Dashboard({ onOpenConsult }) {
  const [view, setView] = useState('exec');
  const [stats, setStats] = useState(null);
  const { events, connected } = useLiveStream();

  useEffect(() => {
    api.stats().then(setStats).catch(() => {});
  }, []);

  return view === 'exec'
    ? <DashExec stats={stats} onSwitch={setView} view={view} onOpenConsult={onOpenConsult}/>
    : <DashOps stats={stats} onSwitch={setView} view={view} events={events} connected={connected} onOpenConsult={onOpenConsult}/>;
}

function DashExec({ stats, onSwitch, view, onOpenConsult }) {
  const s = stats || {};
  return (
    <>
      <PageHeader
        kicker="— Panel ejecutivo —"
        title="Dashboard"
        description="Métricas clave de la red."
        actions={<>
          <Btn variant="paper" size="md" icon={<I.Download size={14}/>}>Exportar</Btn>
        </>}
        tabs={[{ id: 'exec', label: 'Ejecutivo' }, { id: 'ops', label: 'Operativo' }]}
        currentTab={view} onTab={onSwitch}
      />
      <Page>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 12 }}>
          <Kpi big mono label="Ingresos · mes" value={s.finance ? `S/ ${s.finance.total_billed?.toLocaleString('es-PE',{minimumFractionDigits:2})}` : '—'} hint="total facturado"/>
          <Kpi big label="Consultas · mes" value={s.applications ? Object.values(s.applications).reduce((a,b)=>a+b,0) : '—'} hint="todas las consultas"/>
          <Kpi big label="Aplicaciones" value={s.applications?.pending ?? '—'} hint="pendientes" accent={s.applications?.pending > 0 ? C.amber : undefined}/>
          <Kpi big mono label="Comisiones" value={s.finance ? `S/ ${s.finance.commissions?.toLocaleString('es-PE',{minimumFractionDigits:2})}` : '—'}/>
        </div>

        {s.growth?.length > 0 && (
          <Card style={{ marginBottom: 12 }}>
            <CardHead title="Visitas · últimos 7 días" subtitle="Doctor House · Lima"/>
            <Bars data={s.growth.map(g => ({ v: parseInt(g.visits), label: g.date }))} h={140}/>
          </Card>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          <Card style={{ borderLeft: `3px solid ${C.amber}` }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 }}>Aplicaciones pendientes</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.ink, letterSpacing: -0.6 }}>{s.applications?.pending ?? '—'}</div>
            <Btn variant="paper" size="sm" full style={{ marginTop: 12 }} iconRight={<I.ChevR size={12}/>}>Revisar aplicaciones</Btn>
          </Card>
          <Card style={{ borderLeft: `3px solid ${C.primary}` }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 }}>Aprobadas hoy</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.ink, letterSpacing: -0.6 }}>{s.daily?.approved_today ?? '—'}</div>
            <Btn variant="paper" size="sm" full style={{ marginTop: 12 }} iconRight={<I.ChevR size={12}/>}>Ver todas</Btn>
          </Card>
          <Card style={{ borderLeft: `3px solid ${C.green}` }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 }}>Profit estimado</div>
            <div style={{ fontFamily: F.mono, fontSize: 24, fontWeight: 700, color: C.ink, letterSpacing: -0.6 }}>
              {s.finance ? `S/ ${s.finance.profit?.toLocaleString('es-PE',{minimumFractionDigits:2})}` : '—'}
            </div>
            <Btn variant="paper" size="sm" full style={{ marginTop: 12 }} iconRight={<I.ChevR size={12}/>}>Ir a finanzas</Btn>
          </Card>
        </div>
      </Page>
    </>
  );
}

function DashOps({ stats, onSwitch, view, events, connected, onOpenConsult }) {
  return (
    <>
      <PageHeader
        kicker="— Panel operativo —"
        title="Dashboard"
        description="Vista en tiempo real de consultas y eventos."
        actions={<>
          <Pill tone={connected ? 'ok' : 'warn'} dot>{connected ? '● Stream activo' : '○ Conectando...'}</Pill>
        </>}
        tabs={[{ id: 'exec', label: 'Ejecutivo' }, { id: 'ops', label: 'Operativo' }]}
        currentTab={view} onTab={onSwitch}
      />
      <Page>
        <Card bare style={{ maxHeight: 480, display: 'flex', flexDirection: 'column' }}>
          <CardHead
            style={{ padding: '14px 16px 10px', margin: 0 }}
            title="Feed en vivo"
            subtitle={connected ? '● actualizándose en tiempo real' : '○ esperando conexión...'}
            right={<Btn variant="ghost" size="sm" onClick={() => {}}>Limpiar</Btn>}
          />
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 14px' }}>
            {events.length === 0 && (
              <div style={{ padding: '24px 0', textAlign: 'center', color: C.inkMuted, fontSize: 13 }}>
                {connected ? 'Esperando eventos...' : 'Sin conexión al stream'}
              </div>
            )}
            {events.map((ev, i) => {
              const toneMap = { visit_created: 'info', visit_matched: 'ok', visit_completed: 'ok', visit_cancelled: 'danger', doctor_online: 'teal', doctor_offline: 'neutral' };
              const tone = toneMap[ev.type] || 'neutral';
              const toneColors = { info: C.primary, ok: C.green, danger: C.red, teal: C.teal, neutral: C.inkSubtle, warn: C.amber };
              return (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < events.length - 1 ? `1px solid ${C.lineSoft}` : 'none' }}>
                  <div style={{ width: 6, height: 6, marginTop: 6, borderRadius: '50%', background: toneColors[tone], flexShrink: 0 }}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.35 }}>{ev.message || ev.type}</div>
                    <div style={{ fontFamily: F.mono, fontSize: 10, color: C.inkMuted, marginTop: 2 }}>
                      {new Date(ev.ts || Date.now()).toLocaleTimeString('es-PE')} · {ev.type}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </Page>
    </>
  );
}
