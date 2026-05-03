import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { C, F } from '@/tokens';
import { Pill, Btn, Card, Page, PageHeader, Table, Kpi, Spinner } from '@/components/ui';
import * as I from '@/components/ui/Icons';

export default function Payouts() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.payouts()
      .then(d => { setRows(d.rows || d || []); setSummary(d.summary || null); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        kicker="— Comercial —"
        title="Pagos & Payouts"
        description="Liquidación a médicos y estado de pagos."
        actions={<>
          <Btn variant="paper" size="md" icon={<I.Download size={14}/>}>Exportar</Btn>
          <Btn variant="primary" size="md" icon={<I.Send size={14}/>}>Ejecutar lote</Btn>
        </>}
      />
      <Page>
        {summary && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 12 }}>
            <Kpi mono label="Recaudado" value={`S/ ${parseFloat(summary.total_collected || 0).toLocaleString('es-PE',{minimumFractionDigits:2})}`} accent={C.green}/>
            <Kpi mono label="Propinas" value={`S/ ${parseFloat(summary.total_tips || 0).toLocaleString('es-PE',{minimumFractionDigits:2})}`} accent={C.amber}/>
            <Kpi label="Pendientes" value={parseInt(summary.pending_count) || 0} accent={C.red}/>
          </div>
        )}
        {loading ? (
          <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Spinner size={24}/></div>
        ) : (
          <Card bare>
            {rows.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: C.inkMuted }}>Sin registros de pagos</div>
            ) : (
              <Table
                columns={[
                  { h: 'ID', key: 'id', mono: true, w: 80 },
                  { h: 'Paciente', render: r => r.patient_name || '—' },
                  { h: 'Doctor', render: r => r.doctor_name || '—' },
                  { h: 'Monto', align: 'right', mono: true, render: r => `S/ ${parseFloat(r.amount || 0).toFixed(2)}` },
                  { h: 'Propina', align: 'right', mono: true, render: r => r.tip > 0 ? `S/ ${parseFloat(r.tip).toFixed(2)}` : '—' },
                  { h: 'Método', render: r => r.payment_method || '—' },
                  { h: 'Estado', render: r => {
                    const map = { confirmed: ['ok','Pagado'], paid: ['ok','Pagado'], pending: ['warn','Pendiente'], refunded: ['neutral','Reembolsado'] };
                    const [t, l] = map[r.status] || ['neutral', r.status];
                    return <Pill tone={t} dot size="sm">{l}</Pill>;
                  }},
                  { h: 'Fecha', render: r => r.created_at ? new Date(r.created_at).toLocaleDateString('es-PE') : '—' },
                ]}
                rows={rows}
              />
            )}
          </Card>
        )}
      </Page>
    </>
  );
}
