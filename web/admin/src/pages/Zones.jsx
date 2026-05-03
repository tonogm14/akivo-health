import { C, F } from '@/tokens';
import { Btn, Card, CardHead, Page, PageHeader, Table } from '@/components/ui';
import * as I from '@/components/ui/Icons';

const ZONES = [
  { zone: 'Lince',        doctors: 18, consults: 420, avgEta: 17 },
  { zone: 'Miraflores',   doctors: 24, consults: 390, avgEta: 19 },
  { zone: 'San Isidro',   doctors: 21, consults: 360, avgEta: 18 },
  { zone: 'Surco',        doctors: 29, consults: 340, avgEta: 22 },
  { zone: 'San Borja',    doctors: 16, consults: 290, avgEta: 20 },
  { zone: 'Jesús María',  doctors: 14, consults: 260, avgEta: 21 },
  { zone: 'Pueblo Libre', doctors: 10, consults: 190, avgEta: 23 },
  { zone: 'Barranco',     doctors:  8, consults: 150, avgEta: 25 },
];

export default function Zones() {
  const max = Math.max(...ZONES.map(z => z.consults));
  return (
    <>
      <PageHeader kicker="— Comercial —" title="Zonas de cobertura" description="Distritos activos en Lima Metropolitana."
        actions={<>
          <Btn variant="paper" size="md" icon={<I.Download size={14}/>}>Exportar</Btn>
          <Btn variant="primary" size="md" icon={<I.Plus size={14}/>}>Activar zona</Btn>
        </>}
      />
      <Page>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 12 }}>
          <Card>
            <CardHead title="Mapa de cobertura" subtitle="Lima · zonas activas"/>
            <div style={{ position: 'relative', height: 440, background: C.bg, borderRadius: 8, overflow: 'hidden', border: `1px solid ${C.line}` }}>
              <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
                <defs>
                  <pattern id="zg" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke={C.line} strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#zg)"/>
                {[
                  { name: 'Lince',       x: 200, y: 200, r: 55, hot: 0.95 },
                  { name: 'Miraflores',  x: 280, y: 300, r: 65, hot: 0.88 },
                  { name: 'San Isidro',  x: 240, y: 250, r: 50, hot: 0.82 },
                  { name: 'Surco',       x: 370, y: 340, r: 70, hot: 0.75 },
                  { name: 'San Borja',   x: 330, y: 270, r: 48, hot: 0.68 },
                  { name: 'Jesús María', x: 155, y: 185, r: 46, hot: 0.62 },
                  { name: 'Pueblo L.',   x: 115, y: 215, r: 42, hot: 0.48 },
                  { name: 'Barranco',    x: 230, y: 365, r: 36, hot: 0.38 },
                ].map(z => (
                  <g key={z.name}>
                    <circle cx={z.x} cy={z.y} r={z.r} fill={C.primary} opacity={z.hot * 0.35}/>
                    <text x={z.x} y={z.y - 2} textAnchor="middle" fontSize="11" fontWeight="600" fill={C.ink} fontFamily={F.sans}>{z.name}</text>
                    <text x={z.x} y={z.y + 13} textAnchor="middle" fontSize="9" fill={C.inkMuted} fontFamily={F.mono}>{Math.round(z.hot * 420)} consult.</text>
                  </g>
                ))}
              </svg>
              <div style={{ position: 'absolute', bottom: 12, left: 12, background: '#fff', padding: '6px 10px', borderRadius: 6, boxShadow: '0 1px 4px rgba(0,0,0,.1)', fontSize: 10 }}>
                <div style={{ fontWeight: 600, marginBottom: 3 }}>Densidad</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: C.inkMuted }}>Baja</span>
                  <div style={{ width: 60, height: 6, background: `linear-gradient(90deg, ${C.primary}20, ${C.primary})`, borderRadius: 2 }}/>
                  <span style={{ color: C.inkMuted }}>Alta</span>
                </div>
              </div>
            </div>
          </Card>
          <Card bare>
            <CardHead style={{ padding: '14px 16px 12px', margin: 0 }} title="Detalle por zona"/>
            <Table dense columns={[
              { h: 'Zona', key: 'zone' },
              { h: 'Médicos', align: 'right', mono: true, key: 'doctors' },
              { h: 'Consultas', align: 'right', mono: true, key: 'consults' },
              { h: 'ETA', align: 'right', mono: true, render: r => `${r.avgEta} min` },
              { h: '', render: r => (
                <div style={{ width: 60, height: 5, background: C.lineSoft, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${(r.consults/max)*100}%`, height: '100%', background: C.primary }}/>
                </div>
              )},
            ]} rows={ZONES}/>
          </Card>
        </div>
      </Page>
    </>
  );
}
