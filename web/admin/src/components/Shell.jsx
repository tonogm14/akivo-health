import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { C, F, S } from '@/tokens';
import { Logo } from '@/components/ui/Icons';
import * as I from '@/components/ui/Icons';

const NAV = [
  { section: 'PRINCIPAL', items: [
    { k: 'dashboard',    label: 'Dashboard',        Icon: I.Dashboard },
    { k: 'consults',     label: 'Consultas',        Icon: I.Stethoscope, badge: null },
    { k: 'doctors',      label: 'Médicos',          Icon: I.Doctor },
    { k: 'applications', label: 'Aplicaciones',     Icon: I.Apply, badgeTone: 'amber' },
    { k: 'patients',     label: 'Pacientes',        Icon: I.Patient },
    { k: 'live',         label: 'Control en vivo',  Icon: I.Broadcast, badgeTone: 'ok' },
  ]},
  { section: 'COMERCIAL', items: [
    { k: 'payouts',  label: 'Pagos & Payouts', Icon: I.Wallet },
    { k: 'reviews',  label: 'Reseñas',         Icon: I.Star },
    { k: 'coupons',  label: 'Cupones',          Icon: I.Tag },
    { k: 'zones',    label: 'Zonas',            Icon: I.Map },
  ]},
  { section: 'SISTEMA', items: [
    { k: 'support',  label: 'Soporte',          Icon: I.Headset },
    { k: 'reports',  label: 'Reportes',         Icon: I.Chart },
    { k: 'apidocs',  label: 'API Docs',         Icon: I.Doc },
    { k: 'settings', label: 'Configuración',    Icon: I.Settings },
  ]},
];

export default function Shell({ route, onNav, children }) {
  const { admin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (k) => route === k ||
    (k === 'consults'  && route === 'consultDetail') ||
    (k === 'doctors'   && route === 'doctorDetail') ||
    (k === 'applications' && route === 'applicationDetail') ||
    (k === 'patients'  && route === 'patientDetail');

  const initials = admin?.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || 'AD';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
      {/* Sidebar */}
      <aside style={{
        width: 248, background: C.sidebar, color: C.sidebarText,
        position: 'sticky', top: 0, height: '100vh',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '18px 20px', borderBottom: `1px solid ${C.sidebarLine}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo size={28}/>
          <div>
            <div style={{ fontFamily: F.sans, fontSize: 14, fontWeight: 600, color: '#fff' }}>Doctor House</div>
            <div style={{ fontFamily: F.mono, fontSize: 9.5, color: C.sidebarMuted, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 1 }}>Admin · v 3.1</div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          {NAV.map(sec => (
            <div key={sec.section} style={{ marginBottom: 16 }}>
              <div style={{ padding: '6px 10px', fontFamily: F.mono, fontSize: 9.5, color: C.sidebarMuted, letterSpacing: 1.5 }}>{sec.section}</div>
              {sec.items.map(it => {
                const active = isActive(it.k);
                return (
                  <button key={it.k} onClick={() => onNav(it.k)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '8px 10px', border: 'none', cursor: 'pointer', textAlign: 'left',
                    background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                    color: active ? '#fff' : C.sidebarText,
                    fontFamily: F.sans, fontSize: 13, fontWeight: active ? 600 : 400,
                    borderRadius: 6, marginBottom: 1, position: 'relative',
                  }}>
                    {active && <span style={{ position: 'absolute', left: -10, top: 6, bottom: 6, width: 3, background: '#fff', borderRadius: 2 }}/>}
                    <it.Icon size={16} color={active ? '#fff' : C.sidebarText}/>
                    <span style={{ flex: 1 }}>{it.label}</span>
                    {it.badge && (
                      <span style={{
                        padding: '1px 6px', fontFamily: F.mono, fontSize: 10,
                        background: it.badgeTone === 'red' ? C.red : it.badgeTone === 'amber' ? C.amber : it.badgeTone === 'ok' ? C.green : 'rgba(255,255,255,0.15)',
                        color: '#fff', borderRadius: 9,
                      }}>{it.badge}</span>
                    )}
                    {it.k === 'live' && (
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 4px #4ADE80' }}/>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Status footer */}
        <div style={{ padding: 12, borderTop: `1px solid ${C.sidebarLine}`, fontFamily: F.mono, fontSize: 10, color: C.sidebarMuted }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span>SLA · 99.97%</span>
            <span style={{ color: '#7CC295' }}>● Operacional</span>
          </div>
          <div>Servidor Lima — API activo</div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <header style={{
          height: 56, background: C.surface, borderBottom: `1px solid ${C.line}`,
          display: 'flex', alignItems: 'center', padding: '0 22px', gap: 16,
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          <div style={{ flex: 1, maxWidth: 480, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.inkMuted, pointerEvents: 'none', display: 'flex' }}>
              <I.Search size={15}/>
            </span>
            <input placeholder="Buscar consulta, doctor, paciente..." style={{
              width: '100%', height: 34, padding: '0 12px 0 32px',
              border: `1px solid ${C.line}`, background: C.surfaceAlt,
              borderRadius: 6, fontFamily: F.sans, fontSize: 12.5, outline: 'none', color: C.ink,
            }}/>
          </div>
          <div style={{ flex: 1 }}/>

          {/* User menu */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '4px 10px 4px 4px',
              background: menuOpen ? C.surfaceAlt : 'transparent',
              border: `1px solid ${menuOpen ? C.line : 'transparent'}`,
              borderRadius: 6, cursor: 'pointer',
            }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.primary, color: '#fff', display: 'grid', placeItems: 'center', fontFamily: F.sans, fontWeight: 700, fontSize: 11 }}>{initials}</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: F.sans, fontSize: 12.5, fontWeight: 600, color: C.ink, lineHeight: 1.1 }}>{admin?.name}</div>
                <div style={{ fontFamily: F.mono, fontSize: 9.5, color: C.inkMuted, letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 1 }}>{admin?.role || 'Admin'}</div>
              </div>
              <I.ChevD size={13} color={C.inkMuted}/>
            </button>

            {menuOpen && (
              <>
                <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }}/>
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                  width: 220, background: '#fff', border: `1px solid ${C.line}`,
                  borderRadius: 8, boxShadow: S.pop, padding: 6, zIndex: 50,
                }}>
                  {[
                    { label: 'Configuración', Icon: I.Settings, onClick: () => { onNav('settings'); setMenuOpen(false); } },
                  ].map(it => (
                    <button key={it.label} onClick={it.onClick} style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      padding: '8px 10px', border: 'none', background: 'transparent', cursor: 'pointer',
                      borderRadius: 4, fontFamily: F.sans, fontSize: 12.5, color: C.ink, textAlign: 'left',
                    }}>
                      <it.Icon size={15} color={C.inkSoft}/> {it.label}
                    </button>
                  ))}
                  <div style={{ height: 1, background: C.lineSoft, margin: '4px 0' }}/>
                  <button onClick={() => { logout(); setMenuOpen(false); }} style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '8px 10px', border: 'none', background: 'transparent', cursor: 'pointer',
                    borderRadius: 4, fontFamily: F.sans, fontSize: 12.5, color: C.red, textAlign: 'left',
                  }}>
                    <I.Logout size={15} color={C.red}/> Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      </main>
    </div>
  );
}
