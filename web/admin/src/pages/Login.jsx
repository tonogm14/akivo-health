import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { C, F, R } from '@/tokens';
import { Logo } from '@/components/ui/Icons';
import * as I from '@/components/ui/Icons';
import { Btn, Field } from '@/components/ui';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.data?.error || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1.1fr', fontFamily: F.sans }}>
      {/* Left: form */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: '40px 64px', background: '#fff', borderRight: `1px solid ${C.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: C.ink, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Logo size={22} color="#fff"/>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>Doctor House</div>
            <div style={{ fontFamily: F.mono, fontSize: 9.5, color: C.inkMuted, letterSpacing: 1.5, textTransform: 'uppercase' }}>Admin Console</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 360 }}>
          <div style={{ fontFamily: F.mono, fontSize: 11, color: C.primary, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600 }}>— Acceso interno —</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: C.ink, letterSpacing: -0.6, margin: '8px 0 6px' }}>Bienvenido.</h1>
          <p style={{ fontSize: 13.5, color: C.inkSoft, margin: '0 0 24px' }}>Inicia sesión con tus credenciales corporativas.</p>

          <Field label="Usuario" required>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${C.line}`, borderRadius: R.md, padding: '0 10px', height: 36, background: '#fff' }}>
              <I.User size={15} color={C.inkMuted}/>
              <input
                type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="usuario" autoFocus
                style={{ flex: 1, border: 'none', outline: 'none', fontFamily: F.sans, fontSize: 13, color: C.ink }}
              />
            </div>
          </Field>

          <Field label="Contraseña" required>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${C.line}`, borderRadius: R.md, padding: '0 10px', height: 36, background: '#fff' }}>
              <I.Lock size={15} color={C.inkMuted}/>
              <input
                type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ flex: 1, border: 'none', outline: 'none', fontFamily: F.sans, fontSize: 13, color: C.ink }}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.inkMuted, padding: 4 }}>
                <I.Eye size={14}/>
              </button>
            </div>
          </Field>

          {error && (
            <div style={{ padding: '8px 12px', background: C.redSoft, border: `1px solid ${C.red}44`, borderRadius: R.md, fontSize: 12.5, color: C.red, marginBottom: 12 }}>
              {error}
            </div>
          )}

          <Btn variant="primary" size="lg" full disabled={loading} style={{ marginTop: 4 }}>
            {loading ? 'Entrando...' : 'Entrar al panel'}
          </Btn>

          <div style={{ marginTop: 16, padding: '10px 12px', background: C.amberSoft, border: `1px solid ${C.amber}66`, borderRadius: R.md, display: 'flex', gap: 8, fontSize: 12, color: '#7E5305' }}>
            <I.Shield size={14} color={C.amber}/>
            <span>Acceso restringido. Toda actividad queda registrada.</span>
          </div>
        </form>

        <div style={{ fontSize: 11.5, color: C.inkMuted }}>© 2026 Doctor House SAC</div>
      </div>

      {/* Right: brand */}
      <div style={{ background: C.sidebar, color: '#fff', padding: '64px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'repeating-linear-gradient(45deg,#fff 0 1px,transparent 1px 24px)' }}/>
        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: F.mono, fontSize: 11, color: C.primary, letterSpacing: 2, textTransform: 'uppercase' }}>— Operations Console · v 3.1 —</div>
          <h2 style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1, margin: '14px 0 0', maxWidth: 480, color: '#fff' }}>
            Toda la operación de Doctor House, en una sola consola.
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', maxWidth: 440, marginTop: 14, lineHeight: 1.5 }}>
            Consultas en vivo, validación de médicos, payouts, y control bidireccional de las apps cliente y profesional.
          </p>
          <div style={{ display: 'flex', gap: 24, marginTop: 36, flexWrap: 'wrap' }}>
            {[['Consultas / mes','4 856'],['Médicos activos','187'],['NPS','72'],['Disponibilidad','99.94%']].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontFamily: F.mono, fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: 1.5, textTransform: 'uppercase' }}>{k}</div>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 18, fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Lima · Perú</span>
          <span style={{ fontFamily: F.mono, letterSpacing: 1.5, textTransform: 'uppercase' }}>● Sistemas operativos</span>
        </div>
      </div>
    </div>
  );
}
