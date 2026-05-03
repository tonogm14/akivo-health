import { C, F, R } from '@/tokens';
import { Pill, Btn, Card, CardHead, Page, PageHeader, Table } from '@/components/ui';
import * as I from '@/components/ui/Icons';

export default function Support() {
  return (
    <>
      <PageHeader kicker="— Operación —" title="Soporte" description="Tickets de pacientes y médicos."
        actions={<Btn variant="primary" size="md" icon={<I.Plus size={14}/>}>Nuevo ticket</Btn>}
      />
      <Page>
        <div style={{ padding: 32, textAlign: 'center', color: C.inkMuted }}>
          <I.Headset size={32} color={C.lineStrong}/>
          <div style={{ marginTop: 12, fontSize: 14 }}>Módulo de soporte en construcción</div>
          <div style={{ fontSize: 12.5, marginTop: 4 }}>Los tickets se gestionarán aquí próximamente.</div>
        </div>
      </Page>
    </>
  );
}
