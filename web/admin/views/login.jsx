// views/login.jsx
function Login({ onLogin, dark, toggleDark }) {
  const T = useT();
  const [user, setUser]       = useState('');
  const [pass, setPass]       = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await fetch('/admin/login', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ username:user, password:pass }),
      });
      const data = await res.json();
      if (res.ok) onLogin(data);
      else setError(data.error || 'Credenciales incorrectas.');
    } catch { setError('Error de red. Intenta de nuevo.'); }
    finally { setLoading(false); }
  };

  const inp = {
    width:'100%', padding:'11px 14px', borderRadius:9,
    border:`1px solid ${T.border}`, background:T.bgInput,
    color:T.ink, fontSize:14, outline:'none',
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:T.bg, padding:16 }}>

      <button onClick={toggleDark} style={{ position:'fixed', top:16, right:16,
        background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:8,
        padding:'7px 9px', color:T.inkSoft, cursor:'pointer', display:'flex',
        alignItems:'center', gap:6, fontSize:12, boxShadow:T.shadowSm }}>
        {dark ? <Ic.Sun /> : <Ic.Moon />}
      </button>

      <div style={{ width:'100%', maxWidth:380 }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:52, height:52, background:T.accent, borderRadius:13,
            display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div style={{ fontSize:22, fontWeight:800, color:T.ink }}>Doctor House</div>
          <div style={{ fontSize:13, color:T.inkSoft, marginTop:3 }}>Panel de administración</div>
        </div>

        <div style={{ background:T.bgCard, border:`1px solid ${T.border}`,
          borderRadius:14, padding:28, boxShadow:T.shadow }}>
          <div style={{ fontSize:17, fontWeight:800, color:T.ink, marginBottom:20 }}>Iniciar sesión</div>
          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:T.inkSoft, display:'block', marginBottom:5 }}>
                Usuario
              </label>
              <input type="text" placeholder="nombre de usuario" value={user}
                onChange={e => setUser(e.target.value)} style={inp}
                onFocus={e => e.target.style.borderColor = T.accent}
                onBlur={e => e.target.style.borderColor = T.border} />
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:T.inkSoft, display:'block', marginBottom:5 }}>
                Contraseña
              </label>
              <div style={{ position:'relative' }}>
                <input type={showPass?'text':'password'} placeholder="••••••••"
                  value={pass} onChange={e => setPass(e.target.value)}
                  style={{ ...inp, paddingRight:50 }}
                  onFocus={e => e.target.style.borderColor = T.accent}
                  onBlur={e => e.target.style.borderColor = T.border} />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', color:T.inkMuted, cursor:'pointer',
                    fontSize:11, fontWeight:600 }}>
                  {showPass ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>
            {error && (
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 12px',
                borderRadius:8, background:T.redSoft, border:`1px solid ${T.red}33` }}>
                <Ic.AlertCircle />
                <span style={{ fontSize:13, fontWeight:600, color:T.red }}>{error}</span>
              </div>
            )}
            <button type="submit" disabled={loading} style={{
              padding:'12px', borderRadius:9, border:'none',
              background:loading ? T.bgInput : T.accent,
              color:loading ? T.inkMuted : '#fff',
              fontWeight:700, fontSize:15, cursor:loading?'not-allowed':'pointer',
              marginTop:4, transition:'background 0.15s',
            }}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
        <div style={{ textAlign:'center', marginTop:18, fontSize:11, color:T.inkMuted }}>
          Doctor House © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
