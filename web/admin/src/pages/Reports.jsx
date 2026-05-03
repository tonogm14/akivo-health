import { useState } from 'react';
import { api } from '@/api/client';
import { C, F, R } from '@/tokens';
import { Btn, Card, CardHead, Page, PageHeader, Field, Input } from '@/components/ui';
import * as I from '@/components/ui/Icons';

const REPORTS = [
  {
    id: 'consultations',
    title: 'Consultas',
    desc: 'Visitas, pacientes, médicos, pagos, calificaciones',
    Icon: I.Activity,
    color: C.primary,
  },
  {
    id: 'payouts',
    title: 'Pagos & Propinas',
    desc: 'Todos los movimientos de pago con método y estado',
    Icon: I.Wallet,
    color: C.green,
  },
  {
    id: 'doctors',
    title: 'Médicos',
    desc: 'Perfil, especialidad, CMP, visitas, calificación',
    Icon: I.Doctor,
    color: C.teal,
  },
];

export default function Reports() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exporting, setExporting] = useState(null);

  async function doExport(type) {
    setExporting(type);
    try {
      await api.exportCsv({
        type,
        ...(dateFrom ? { date_from: dateFrom } : {}),
        ...(dateTo ? { date_to: dateTo } : {}),
      });
    } catch (e) { alert('Error al exportar: ' + e.message); }
    setExporting(null);
  }

  return (
    <>
      <PageHeader
        kicker="— Inteligencia —"
        title="Reportes & Exportaciones"
        description="Descarga datos reales de la plataforma en formato CSV."
      />
      <Page>
        <Card style={{ marginBottom: 16 }}>
          <CardHead title="Filtro de período"/>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <Field label="Desde" style={{ minWidth: 160 }}>
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} mono/>
            </Field>
            <Field label="Hasta" style={{ minWidth: 160 }}>
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} mono/>
            </Field>
            <Btn variant="ghost" size="md" onClick={() => { setDateFrom(''); setDateTo(''); }}>Limpiar</Btn>
          </div>
          {dateFrom && dateTo && (
            <div style={{ marginTop: 8, fontSize: 12, color: C.inkMuted }}>
              Período: {new Date(dateFrom + 'T00:00').toLocaleDateString('es-PE')} — {new Date(dateTo + 'T00:00').toLocaleDateString('es-PE')}
            </div>
          )}
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {REPORTS.map(r => (
            <Card key={r.id}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ width: 38, height: 38, background: r.color + '18', color: r.color, borderRadius: 10, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <r.Icon size={20}/>
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>{r.title}</div>
                  <div style={{ fontSize: 11.5, color: C.inkMuted, marginTop: 2, lineHeight: 1.4 }}>{r.desc}</div>
                </div>
              </div>
              <Btn
                variant="paper" size="sm" full
                icon={exporting === r.id ? null : <I.Download size={12}/>}
                disabled={!!exporting}
                onClick={() => doExport(r.id)}
              >
                {exporting === r.id ? 'Descargando...' : 'Descargar CSV'}
              </Btn>
            </Card>
          ))}
        </div>

        <Card style={{ marginTop: 12 }}>
          <CardHead title="Sobre los reportes"/>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: C.inkSoft }}>
            <div>• Los archivos CSV incluyen BOM UTF-8 para compatibilidad con Excel en español.</div>
            <div>• Sin filtro de período: se exportan todos los registros (máx. 5,000 filas).</div>
            <div>• El reporte <strong>Consultas</strong> incluye síntomas, médico asignado, datos de pago y calificación.</div>
            <div>• El reporte <strong>Médicos</strong> no tiene filtro por fecha — siempre exporta el padrón completo.</div>
          </div>
        </Card>
      </Page>
    </>
  );
}
