import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { C, F, R } from '@/tokens';
import { Pill, Btn, Card, CardHead, Page, PageHeader, Table, Spinner, Field, Input } from '@/components/ui';
import * as I from '@/components/ui/Icons';

export default function Coupons() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ code: '', description: '', discount_type: 'percentage', discount_value: '', max_uses: '', expires_at: '' });

  useEffect(() => {
    api.coupons().then(d => setRows(d.rows || d || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    try {
      await api.createCoupon(form);
      const updated = await api.coupons();
      setRows(updated.rows || updated || []);
      setCreating(false);
    } catch (e) { alert(e.message); }
  }

  return (
    <>
      <PageHeader kicker="— Comercial —" title="Cupones & Promociones" description="Códigos de descuento activos en la plataforma."
        actions={<Btn variant="primary" size="md" icon={<I.Plus size={14}/>} onClick={() => setCreating(true)}>Crear cupón</Btn>}/>
      <Page>
        <div style={{ display: 'grid', gridTemplateColumns: creating ? '1fr 360px' : '1fr', gap: 12 }}>
          <Card bare>
            {loading ? (
              <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}><Spinner size={24}/></div>
            ) : (
              <Table
                columns={[
                  { h: 'Código', render: r => <strong style={{ fontFamily: F.mono, color: C.primary }}>{r.code}</strong> },
                  { h: 'Descripción', key: 'description', wrap: true },
                  { h: 'Descuento', render: r => r.discount_type === 'percentage' ? `${r.discount_value}%` : `S/ ${r.discount_value}`, mono: true, align: 'right' },
                  { h: 'Usos', align: 'right', mono: true, render: r => `${r.used_count || 0}${r.max_uses ? ' / ' + r.max_uses : ''}` },
                  { h: 'Vence', render: r => r.expires_at ? new Date(r.expires_at).toLocaleDateString('es-PE') : 'Sin vencimiento', mono: true },
                  { h: 'Estado', render: r => <Pill tone={r.is_active ? 'ok' : 'neutral'} dot size="sm">{r.is_active ? 'Activo' : 'Inactivo'}</Pill> },
                ]}
                rows={rows}
              />
            )}
          </Card>
          {creating && (
            <Card>
              <CardHead title="Nuevo cupón" right={<Btn variant="ghost" size="sm" icon={<I.X size={13}/>} onClick={() => setCreating(false)}/>}/>
              <Field label="Código" required><Input value={form.code} onChange={e => setForm(p=>({...p,code:e.target.value.toUpperCase()}))} placeholder="EJEMPLO20" mono/></Field>
              <Field label="Descripción"><Input value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} placeholder="20% off primera consulta"/></Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Tipo">
                  <select value={form.discount_type} onChange={e => setForm(p=>({...p,discount_type:e.target.value}))}
                    style={{ width: '100%', height: 34, padding: '0 10px', border: `1px solid ${C.line}`, borderRadius: R.md, fontFamily: F.sans, fontSize: 13 }}>
                    <option value="percentage">Porcentaje %</option>
                    <option value="fixed">Monto fijo S/</option>
                  </select>
                </Field>
                <Field label="Valor" required><Input value={form.discount_value} onChange={e => setForm(p=>({...p,discount_value:e.target.value}))} placeholder="20" mono/></Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Usos máx."><Input value={form.max_uses} onChange={e => setForm(p=>({...p,max_uses:e.target.value}))} placeholder="1000" mono/></Field>
                <Field label="Vence"><Input type="date" value={form.expires_at} onChange={e => setForm(p=>({...p,expires_at:e.target.value}))} mono/></Field>
              </div>
              <Btn variant="primary" size="md" full icon={<I.Check size={14}/>} onClick={handleCreate}>Crear cupón</Btn>
            </Card>
          )}
        </div>
      </Page>
    </>
  );
}
