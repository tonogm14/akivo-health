import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { C, F } from '@/tokens';
import { Pill, Btn, Card, CardHead, Page, PageHeader, Spinner } from '@/components/ui';
import * as I from '@/components/ui/Icons';

export default function Reviews() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [acting, setActing] = useState(null);

  function load() {
    setLoading(true);
    api.reviews(tab !== 'all' ? { status: tab } : {})
      .then(d => setRows(d.rows || d || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [tab]);

  async function handleAction(id, action) {
    setActing(id);
    try {
      if (action === 'hide')    await api.hideReview(id);
      if (action === 'restore') await api.restoreReview(id);
      setRows(prev => prev.map(r => r.id === id
        ? { ...r, status: action === 'hide' ? 'hidden' : 'visible' }
        : r
      ));
    } catch (e) { alert(e.message); }
    setActing(null);
  }

  const allCount    = rows.length;
  const hiddenCount = rows.filter(r => r.status === 'hidden').length;

  return (
    <>
      <PageHeader
        kicker="— Calidad —"
        title="Reseñas"
        description="Moderación de calificaciones de pacientes."
        tabs={[
          { id: 'all',    label: 'Todas',   count: allCount },
          { id: 'hidden', label: 'Ocultas', count: hiddenCount },
        ]}
        currentTab={tab} onTab={setTab}
      />
      <Page>
        {loading ? (
          <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Spinner size={24}/></div>
        ) : (
          <Card bare>
            {rows.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center', color: C.inkMuted }}>Sin reseñas</div>
            )}
            {rows.map((r, i) => (
              <div key={r.id} style={{
                padding: '14px 16px',
                borderBottom: i < rows.length - 1 ? `1px solid ${C.lineSoft}` : 'none',
                opacity: r.status === 'hidden' ? 0.6 : 1,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ color: C.amber, fontSize: 14 }}>{'★'.repeat(r.rating || 0)}{'☆'.repeat(5-(r.rating||0))}</span>
                      {r.patient_name && (
                        <span style={{ fontWeight: 600, fontSize: 12.5 }}>{r.patient_name}</span>
                      )}
                      {r.doctor_name && (
                        <span style={{ fontSize: 12, color: C.inkMuted }}>→ Dr. {r.doctor_name}</span>
                      )}
                      <span style={{ fontFamily: F.mono, fontSize: 10.5, color: C.inkSubtle }}>{r.visit_id}</span>
                      <span style={{ fontSize: 11.5, color: C.inkSubtle }}>
                        {r.created_at ? new Date(r.created_at).toLocaleDateString('es-PE') : ''}
                      </span>
                    </div>
                    {r.description && (
                      <p style={{ margin: '4px 0', fontSize: 13, color: C.ink, lineHeight: 1.5 }}>{r.description}</p>
                    )}
                    {r.tags?.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                        {r.tags.map(t => <Pill key={t} tone="info" size="sm">{t}</Pill>)}
                      </div>
                    )}
                    {r.tip > 0 && (
                      <div style={{ marginTop: 4, fontSize: 11.5, color: C.green }}>
                        Propina: S/ {parseFloat(r.tip).toFixed(2)}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {r.status === 'hidden' && <Pill tone="neutral" size="sm">Oculta</Pill>}
                    {r.status === 'flagged' && <Pill tone="danger" size="sm" dot>Reportada</Pill>}
                    {r.status === 'hidden' ? (
                      <Btn variant="paper" size="sm" disabled={acting === r.id} onClick={() => handleAction(r.id, 'restore')}>
                        Restaurar
                      </Btn>
                    ) : (
                      <Btn variant="ghost" size="sm" disabled={acting === r.id} onClick={() => handleAction(r.id, 'hide')}>
                        Ocultar
                      </Btn>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </Card>
        )}
      </Page>
    </>
  );
}
