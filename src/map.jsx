// Stylized map component (SVG illustration — Lima-esque neighborhood grid)
function MapView({ height = 260, pinLabel, pulse, doctorMoving, eta }) {
  const { color: C, font: F } = window.DH;
  return (
    <div style={{
      position: 'relative', width: '100%', height,
      overflow: 'hidden', background: '#E4EAF1',
    }}>
      <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="#E8EEF4"/>
            <path d="M0 0h40M0 0v40" stroke="#D4DDE6" strokeWidth="0.8"/>
          </pattern>
        </defs>
        <rect width="400" height="300" fill="url(#grid)"/>
        {/* Big roads */}
        <path d="M-20 120 L420 140" stroke="#fff" strokeWidth="14"/>
        <path d="M-20 120 L420 140" stroke="#F2D57E" strokeWidth="12"/>
        <path d="M150 -20 L180 320" stroke="#fff" strokeWidth="12"/>
        <path d="M150 -20 L180 320" stroke="#fff" strokeWidth="10"/>
        {/* Minor roads */}
        <path d="M-20 60 L420 75" stroke="#fff" strokeWidth="5"/>
        <path d="M-20 200 L420 215" stroke="#fff" strokeWidth="5"/>
        <path d="M-20 260 L420 270" stroke="#fff" strokeWidth="5"/>
        <path d="M60 -20 L80 320" stroke="#fff" strokeWidth="4"/>
        <path d="M280 -20 L300 320" stroke="#fff" strokeWidth="5"/>
        <path d="M350 -20 L360 320" stroke="#fff" strokeWidth="4"/>
        {/* Blocks (buildings) */}
        {[[20,30,30,20],[100,30,35,25],[200,30,50,25],[330,30,50,22],
          [20,160,35,30],[200,160,60,30],[310,160,40,30],
          [20,230,35,22],[100,225,40,30],[210,225,45,35],[320,225,50,30]].map((b,i)=>(
          <rect key={i} x={b[0]} y={b[1]} width={b[2]} height={b[3]} fill="#F5F5EC" stroke="#DDE3DE" strokeWidth="0.5" rx="1"/>
        ))}
        {/* Park */}
        <rect x="210" y="40" width="60" height="70" fill="#CDE6CF" rx="4"/>
        <circle cx="225" cy="60" r="6" fill="#9FCFA4"/>
        <circle cx="250" cy="85" r="8" fill="#9FCFA4"/>

        {/* Doctor route */}
        {doctorMoving && (
          <path d="M40 260 Q 100 220, 150 180 T 200 140" stroke={C.blue} strokeWidth="3"
            strokeLinecap="round" strokeDasharray="6 5" fill="none"/>
        )}
      </svg>

      {/* Doctor marker */}
      {doctorMoving && (
        <div style={{
          position: 'absolute', left: '10%', top: '85%',
          width: 36, height: 36, transform: 'translate(-50%,-50%)',
          background: C.blue, borderRadius: 18, border: '3px solid #fff',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', animation: 'dhMove 6s ease-in-out infinite',
        }}>
          <I.Car size={18}/>
        </div>
      )}

      {/* Center pin */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        {pinLabel && (
          <div style={{
            background: '#fff', padding: '6px 10px', borderRadius: 20,
            fontSize: 12, fontWeight: 600, color: C.ink, marginBottom: 4,
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)', whiteSpace: 'nowrap',
            fontFamily: F.ui,
          }}>{pinLabel}</div>
        )}
        <svg width="32" height="40" viewBox="0 0 32 40">
          <path d="M16 0C7 0 0 7 0 16c0 10 16 24 16 24s16-14 16-24c0-9-7-16-16-16z" fill={C.blue}/>
          <circle cx="16" cy="16" r="6" fill="#fff"/>
        </svg>
        {pulse && (
          <div style={{
            position: 'absolute', left: '50%', top: 0,
            transform: 'translate(-50%, -50%)',
            width: 60, height: 60, borderRadius: 30,
            background: C.blue, opacity: 0.2,
            animation: 'dhPulse 2s ease-out infinite',
          }}/>
        )}
      </div>

      {eta && (
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: '#fff', padding: '8px 12px', borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: F.ui, fontSize: 13, fontWeight: 600, color: C.ink,
        }}>
          <I.Clock size={14}/> {eta}
        </div>
      )}
    </div>
  );
}

window.MapView = MapView;
