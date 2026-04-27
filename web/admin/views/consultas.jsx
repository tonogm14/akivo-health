// views/consultas.jsx — ConsultationStatsBar, ConsultationDetail, ConsultationsView

function ConsultationStatsBar({ token, dateFrom, dateTo, userId }) {
  const T = useT();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let url = '/admin/consultations/stats';
    const p = [];
    if (dateFrom) p.push(`date_from=${dateFrom}`);
    if (dateTo)   p.push(`date_to=${dateTo}`);
    if (userId)   p.push(`user_id=${userId}`);
    if (p.length) url += '?' + p.join('&');
    fetch(url, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null).then(d => { if (d) setStats(d); }).catch(() => {});
  }, [token, dateFrom, dateTo, userId]);

  const tiles = stats ? [
    { label:'Total',       value:stats.total,     color:T.inkSoft, soft:T.bgInput },
    { label:'Activas',     value:stats.active,    color:T.accent,  soft:T.accentSoft },
    { label:'Completadas', value:stats.completed, color:T.green,   soft:T.greenSoft },
    { label:'Canceladas',  value:stats.cancelled, color:T.red,     soft:T.redSoft },
    { label:'Ingresos',    value:`S/ ${Number(stats.revenue||0).toFixed(2)}`, color:T.amber, soft:T.amberSoft },
  ] : null;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
        <span style={{ fontSize:13, fontWeight:600, color:T.inkSoft }}>Resumen ·</span>
        <span style={{ fontSize:13, fontWeight:700, color:T.accent }}>{stats?.period||'Hoy'}</span>
        {!stats && <span style={{ fontSize:11, color:T.inkMuted }}>Cargando…</span>}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10 }}>
        {(tiles||[0,1,2,3,4]).map((t,i) => (
          <div key={i} style={{ background:t.soft||T.bgInput,
            border:`1px solid ${(t.color||T.border)}22`, borderRadius:11, padding:'14px 18px' }}>
            {t.label ? (
              <>
                <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase',
                  letterSpacing:0.6, color:T.inkMuted, marginBottom:5 }}>{t.label}</div>
                <div style={{ fontSize:t.label==='Ingresos'?17:26, fontWeight:800,
                  color:t.color, lineHeight:1 }}>{t.value}</div>
              </>
            ) : (
              <div style={{ height:52, borderRadius:6, background:T.bgHover, opacity:0.5 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ConsultationDetail({ token, visitId, onBack, onViewPatient }) {
  const T = useT();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    if (!visitId) return;
    setLoading(true); setError(null);
    fetch(`/admin/consultations/${visitId}`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => { setDetail(d); setLoading(false); })
      .catch(() => { setError('No se pudo cargar el detalle.'); setLoading(false); });
  }, [visitId]);

  if (loading) return <div style={{ padding:60, textAlign:'center', color:T.inkMuted }}>Cargando...</div>;
  if (error)   return <div style={{ padding:40, textAlign:'center', color:T.red }}>{error}</div>;
  if (!detail) return null;

  const c = detail;
  const events = detail.events || [];
  const report = detail.report || null;
  const prescriptions = detail.prescriptions || [];
  const review = detail.review || null;
  const symptoms = detail.symptoms || [];
  const dur = report?.duration_minutes;
  const timeRange = (report?.consultation_started_at && report?.consultation_finished_at)
    ? `${fmtTime(report.consultation_started_at)} – ${fmtTime(report.consultation_finished_at)}` : null;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
      <button onClick={onBack} style={{ display:'inline-flex', alignItems:'center', gap:6,
        background:'transparent', border:`1px solid ${T.border}`, color:T.inkSoft,
        borderRadius:8, padding:'7px 13px', cursor:'pointer', fontWeight:600,
        fontSize:13, width:'fit-content' }}>
        <Ic.ChevronLeft /> Volver
      </button>

      {/* Header */}
      <Card style={{ padding:24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:18 }}>
          <div style={{ flex:1, minWidth:180 }}>
            <SectionLabel>Paciente</SectionLabel>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
              <button onClick={() => onViewPatient && onViewPatient(c.user_id, c.patient_name)}
                style={{ background:'none', border:'none', color:T.ink, fontSize:19,
                  fontWeight:800, cursor:'pointer', padding:0,
                  textDecoration:'underline dotted', textDecorationColor:T.borderMd, textUnderlineOffset:4 }}>
                {c.patient_name || 'Sin nombre'}
              </button>
              <StatusBadge status={c.status} />
            </div>
            <div style={{ fontSize:13, color:T.inkSoft, marginTop:4 }}>
              {[c.patient_age && `${c.patient_age} años`, c.patient_phone].filter(Boolean).join(' · ')}
            </div>
          </div>
          <div style={{ flex:1, minWidth:160 }}>
            <SectionLabel>Doctor</SectionLabel>
            <div style={{ fontSize:16, fontWeight:700, color:T.ink }}>{c.doctor_name || 'No asignado'}</div>
            <div style={{ fontSize:12, color:T.inkSoft, marginTop:2 }}>
              {[c.specialty, c.cmp_license && `CMP ${c.cmp_license}`].filter(Boolean).join(' · ')}
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:5, minWidth:170 }}>
            <div style={{ fontSize:11, color:T.inkMuted, fontFamily:'monospace' }}>{c.id?.slice(0,8)}…</div>
            <div style={{ fontSize:12, color:T.inkSoft }}>{fmtDate(c.created_at)}</div>
            {c.service_type && <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px',
              borderRadius:5, background:T.purpleSoft, color:T.purple }}>
              {SERVICE_LABELS[c.service_type]||c.service_type}
            </span>}
            {c.urgency && <span style={{ fontSize:10, fontWeight:700, padding:'3px 8px',
              borderRadius:5, background:T.amberSoft, color:T.amber }}>
              {URGENCY_LABELS[c.urgency]||c.urgency}
            </span>}
          </div>
        </div>
        {c.address && <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${T.border}`,
          fontSize:13, color:T.inkSoft }}>📍 {c.address}</div>}
      </Card>

      {/* Two columns */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
        <Card style={{ padding:22 }}>
          <div style={{ fontSize:12, fontWeight:700, color:T.accent, textTransform:'uppercase',
            letterSpacing:0.5, marginBottom:16, display:'flex', alignItems:'center', gap:7 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Lo que reportó el paciente
          </div>
          <InfoRow label="Urgencia"        value={URGENCY_LABELS[c.urgency]||c.urgency} />
          <InfoRow label="Tipo de servicio" value={SERVICE_LABELS[c.service_type]||c.service_type} />
          {symptoms.length > 0 ? (
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:0.8, color:T.inkMuted,
                textTransform:'uppercase', marginBottom:7 }}>Síntomas</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {symptoms.map((s,i) => (
                  <span key={i} style={{ fontSize:12, fontWeight:600, padding:'4px 10px',
                    borderRadius:20, background:T.accentSoft, color:T.accent }}>
                    {SYMPTOM_LABELS[s]||s.replace(/_/g,' ')}
                  </span>
                ))}
              </div>
            </div>
          ) : <InfoRow label="Síntomas" value="No registrados" />}
          <Divider />
          <SectionLabel style={{ marginTop:10 }}>Datos del paciente</SectionLabel>
          <InfoRow label="Nombre"      value={c.patient_name} />
          <InfoRow label="Edad"        value={c.patient_age ? `${c.patient_age} años` : null} />
          <InfoRow label="Grupo etario" value={c.age_group ? (AGE_GROUP_LABELS[c.age_group]||c.age_group) : null} />
          {c.cancel_reason && <InfoRow label="Motivo de cancelación" value={c.cancel_reason} valueColor={T.red} />}
        </Card>

        <Card style={{ padding:22 }}>
          <div style={{ fontSize:12, fontWeight:700, color:T.purple, textTransform:'uppercase',
            letterSpacing:0.5, marginBottom:16, display:'flex', alignItems:'center', gap:7 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
            Lo que registró el doctor
          </div>
          {(dur != null || timeRange) && (
            <div style={{ marginBottom:14, padding:'11px 14px', borderRadius:9,
              background:T.purpleSoft, border:`1px solid ${T.purple}33` }}>
              <SectionLabel style={{ marginBottom:3 }}>Duración</SectionLabel>
              {dur != null && <div style={{ fontSize:20, fontWeight:800, color:T.purple }}>{dur} min</div>}
              {timeRange && <div style={{ fontSize:11, color:T.inkSoft, marginTop:1 }}>{timeRange}</div>}
            </div>
          )}
          {report ? <div style={{ marginBottom:14 }}><VitalsStrip report={report} /></div>
            : <InfoRow label="Signos vitales" value="No registrados" />}
          <Divider />
          {report?.diagnosis ? (
            <div style={{ marginTop:10, marginBottom:12 }}>
              <SectionLabel>Diagnóstico</SectionLabel>
              <div style={{ fontSize:14, fontWeight:700, color:T.ink }}>
                {report.diagnosis}
                {report.diagnosis_code && <span style={{ fontSize:12, color:T.inkMuted,
                  fontWeight:400, marginLeft:7 }}>({report.diagnosis_code})</span>}
              </div>
            </div>
          ) : <InfoRow label="Diagnóstico" value="No registrado" />}
          {report?.clinical_notes && (
            <div style={{ marginBottom:12 }}>
              <SectionLabel>Notas clínicas</SectionLabel>
              <div style={{ fontSize:13, lineHeight:1.65, color:T.inkSoft,
                whiteSpace:'pre-wrap' }}>{report.clinical_notes}</div>
            </div>
          )}
        </Card>
      </div>

      {/* Prescriptions */}
      {prescriptions.length > 0 && (
        <Card style={{ padding:22 }}>
          <div style={{ fontSize:12, fontWeight:700, color:T.green, textTransform:'uppercase',
            letterSpacing:0.5, marginBottom:16, display:'flex', alignItems:'center', gap:7 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            Receta — {prescriptions.length} medicamento{prescriptions.length!==1?'s':''}
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:`1px solid ${T.border}` }}>
                  {['MEDICAMENTO','DOSIS','FRECUENCIA','DURACIÓN','INSTRUCCIONES'].map(h => (
                    <th key={h} style={{ padding:'7px 12px', fontSize:10, fontWeight:700,
                      letterSpacing:0.5, color:T.inkMuted, textAlign:'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((rx,i) => (
                  <tr key={i} style={{ borderBottom:`1px solid ${T.border}` }}>
                    <td style={{ padding:'11px 12px', fontWeight:700, color:T.ink }}>{rx.drug_name||rx.medication||'—'}</td>
                    <td style={{ padding:'11px 12px', color:T.inkSoft }}>{rx.dose||rx.dosage||'—'}</td>
                    <td style={{ padding:'11px 12px', color:T.inkSoft }}>{rx.frequency||'—'}</td>
                    <td style={{ padding:'11px 12px', color:T.inkSoft }}>{rx.duration_days?`${rx.duration_days} días`:(rx.duration||'—')}</td>
                    <td style={{ padding:'11px 12px', color:T.inkMuted, fontSize:12 }}>{rx.instructions||'—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Payment + Review */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
        <Card style={{ padding:22 }}>
          <div style={{ fontSize:12, fontWeight:700, color:T.green, textTransform:'uppercase',
            letterSpacing:0.5, marginBottom:16, display:'flex', alignItems:'center', gap:7 }}>
            <Ic.CreditCard /> Pago
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9 }}>
            {[
              { label:'MONTO',   val:c.amount!=null?`S/ ${Number(c.amount).toFixed(2)}`:'—', color:T.green },
              { label:'PROPINA', val:c.tip!=null?`S/ ${Number(c.tip).toFixed(2)}`:'—',       color:T.amber },
              { label:'MÉTODO',  val:c.payment_method?c.payment_method.toUpperCase():'—' },
              { label:'ESTADO',  val:c.payment_status?c.payment_status.toUpperCase():'—',
                color:c.payment_status==='confirmed'?T.green:c.payment_status==='failed'?T.red:T.amber },
            ].map((it,i) => (
              <div key={i} style={{ background:T.bgInput, borderRadius:9, padding:'11px 12px' }}>
                <div style={{ fontSize:10, color:T.inkMuted, letterSpacing:0.5, marginBottom:3 }}>{it.label}</div>
                <div style={{ fontSize:14, fontWeight:800, color:it.color||T.ink }}>{it.val}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card style={{ padding:22 }}>
          <div style={{ fontSize:12, fontWeight:700, color:T.amber, textTransform:'uppercase',
            letterSpacing:0.5, marginBottom:16, display:'flex', alignItems:'center', gap:7 }}>
            <Ic.Star filled /> Calificación
          </div>
          {(review||c.rating) ? (
            <>
              <div style={{ marginBottom:10 }}><StarRating rating={review?.rating||c.rating} /></div>
              {(review?.comment||c.review_comment) && (
                <div style={{ fontSize:13, color:T.inkSoft, fontStyle:'italic', lineHeight:1.6,
                  borderLeft:`3px solid ${T.amberSoft}`, paddingLeft:12 }}>
                  "{review?.comment||c.review_comment}"
                </div>
              )}
            </>
          ) : (
            <div style={{ fontSize:13, color:T.inkMuted, fontStyle:'italic' }}>
              El paciente aún no ha calificado esta consulta.
            </div>
          )}
        </Card>
      </div>

      {/* Timeline */}
      <Card style={{ padding:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:22 }}>
          <Ic.Clock />
          <span style={{ fontSize:15, fontWeight:800, color:T.ink }}>Historial completo</span>
          <span style={{ fontSize:11, color:T.inkMuted }}>{events.length} eventos</span>
        </div>
        {events.length === 0 ? (
          <div style={{ fontSize:13, color:T.inkMuted, fontStyle:'italic' }}>No hay eventos registrados.</div>
        ) : (
          <div style={{ position:'relative' }}>
            <div style={{ position:'absolute', left:19, top:0, bottom:0, width:2,
              background:T.border, borderRadius:2 }} />
            {events.map((ev,i) => {
              const cfg = buildEventCfg(ev, c.doctor_name);
              return (
                <div key={i} style={{ display:'flex', gap:18,
                  paddingBottom:i===events.length-1?0:18, position:'relative' }}>
                  <div style={{ flexShrink:0, zIndex:1, width:40, height:40, borderRadius:'50%',
                    background:`${cfg.color}18`, border:`2px solid ${cfg.color}55`,
                    display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <div style={{ width:10, height:10, borderRadius:'50%', background:cfg.color }} />
                  </div>
                  <div style={{ flex:1, paddingTop:8 }}>
                    <div style={{ display:'flex', alignItems:'baseline', gap:8, flexWrap:'wrap' }}>
                      <span style={{ fontSize:14, fontWeight:700, color:T.ink }}>{cfg.text}</span>
                      {cfg.badge && <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px',
                        borderRadius:4, background:`${cfg.color}18`, color:cfg.color }}>{cfg.badge}</span>}
                    </div>
                    {cfg.sub && <div style={{ fontSize:12, color:T.inkSoft, marginTop:2 }}>{cfg.sub}</div>}
                    <div style={{ fontSize:11, color:T.inkMuted, marginTop:3 }}>
                      {fmtDate(ev.created_at)}
                      {ev.actor_name && <span style={{ marginLeft:6 }}>
                        · {ev.actor_type==='system'?'Sistema':ev.actor_name}
                      </span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function ConsultationsView({ token }) {
  const T = useT();
  const { path, navigate } = useNav();
  const visitId = path.startsWith('/admin/consultas/') ? path.slice('/admin/consultas/'.length) : null;
  const [rows, setRows]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [filterStatus, setFilterStatus]     = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo]     = useState('');
  const [offset, setOffset]         = useState(0);
  const [hasMore, setHasMore]       = useState(false);
  const [patientFilter, setPatientFilter] = useState(null);
  const LIMIT = 50;

  const load = useCallback(async (reset = false) => {
    setLoading(true); setError(null);
    const cur = reset ? 0 : offset;
    try {
      let url = `/admin/consultations?limit=${LIMIT}&offset=${cur}`;
      if (filterStatus)          url += `&status=${filterStatus}`;
      if (filterDateFrom)        url += `&date_from=${filterDateFrom}`;
      if (filterDateTo)          url += `&date_to=${filterDateTo}`;
      if (patientFilter?.userId) url += `&user_id=${patientFilter.userId}`;
      const res = await fetch(url, { headers:{ Authorization:`Bearer ${token}` } });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.rows || []);
      if (reset) { setRows(list); setOffset(list.length); }
      else       { setRows(prev => [...prev, ...list]); setOffset(cur + list.length); }
      setHasMore(list.length === LIMIT);
    } catch { setError('No se pudo cargar el historial.'); }
    finally  { setLoading(false); }
  }, [filterStatus, filterDateFrom, filterDateTo, patientFilter, token, offset]);

  useEffect(() => { setOffset(0); setRows([]); load(true); },
    [filterStatus, filterDateFrom, filterDateTo, patientFilter, token]);

  if (visitId) return (
    <ConsultationDetail token={token} visitId={visitId}
      onBack={() => navigate('/admin/consultas')}
      onViewPatient={(uid, name) => { setPatientFilter({ userId:uid, name }); navigate('/admin/consultas'); }} />
  );

  const hasFilters = filterStatus || filterDateFrom || filterDateTo;
  const inp = {
    padding:'9px 12px', borderRadius:9, border:`1px solid ${T.border}`,
    background:T.bgInput, color:T.ink, fontSize:13, outline:'none', width:'100%',
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <ConsultationStatsBar token={token} dateFrom={filterDateFrom}
        dateTo={filterDateTo} userId={patientFilter?.userId} />

      {patientFilter && (
        <div style={{ background:T.accentSoft, border:`1px solid ${T.accent}33`,
          borderRadius:9, padding:'9px 14px', display:'flex',
          alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:13, fontWeight:600, color:T.ink }}>
            Historial de: <strong>{patientFilter.name}</strong>
          </span>
          <button onClick={() => setPatientFilter(null)} style={{ background:'none',
            border:`1px solid ${T.border}`, color:T.inkSoft, borderRadius:7,
            padding:'4px 9px', cursor:'pointer', fontSize:12, display:'flex',
            alignItems:'center', gap:5 }}>
            <Ic.X /> Limpiar
          </button>
        </div>
      )}

      {/* Filters */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(170px,1fr))', gap:12 }}>
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:T.inkMuted, letterSpacing:0.5,
            textTransform:'uppercase', marginBottom:5 }}>Estado</div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ ...inp, cursor:'pointer' }}>
            <option value="">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="matched">Asignado</option>
            <option value="on_way">En camino</option>
            <option value="arrived">Llegó</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:T.inkMuted, letterSpacing:0.5,
            textTransform:'uppercase', marginBottom:5 }}>Desde</div>
          <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} style={inp} />
        </div>
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:T.inkMuted, letterSpacing:0.5,
            textTransform:'uppercase', marginBottom:5 }}>Hasta</div>
          <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} style={inp} />
        </div>
        {hasFilters && (
          <div style={{ display:'flex', alignItems:'flex-end' }}>
            <button onClick={() => { setFilterStatus(''); setFilterDateFrom(''); setFilterDateTo(''); }}
              style={{ ...inp, width:'auto', background:T.redSoft, border:`1px solid ${T.red}33`,
                color:T.red, fontWeight:700, cursor:'pointer' }}>
              Limpiar
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <Card style={{ padding:0, overflow:'hidden' }}>
        <div style={{ padding:'16px 22px', borderBottom:`1px solid ${T.border}` }}>
          <div style={{ fontSize:16, fontWeight:800, color:T.ink }}>
            {patientFilter ? `Historial · ${patientFilter.name}` : 'Historial de Consultas'}
          </div>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${T.border}` }}>
                {['FECHA','PACIENTE','DOCTOR','ESTADO','DURACIÓN','MONTO','RATING',''].map(h => (
                  <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:10,
                    fontWeight:700, letterSpacing:0.5, color:T.inkMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading && (
                <tr><td colSpan={8} style={{ padding:36, textAlign:'center',
                  color:T.inkMuted, fontSize:13 }}>No hay consultas.</td></tr>
              )}
              {rows.map(c => (
                <HoverRow key={c.id} onClick={() => navigate('/admin/consultas/' + c.id)}
                  style={{ borderBottom:`1px solid ${T.border}`, cursor:'pointer' }}>
                  <td style={{ padding:'12px 14px', fontSize:12, color:T.inkSoft, whiteSpace:'nowrap' }}>
                    {fmtDateShort(c.created_at)}
                  </td>
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ fontWeight:700, color:T.ink, cursor:'pointer',
                      textDecoration:'underline dotted', textDecorationColor:T.borderMd }}
                      onClick={e => { e.stopPropagation(); setPatientFilter({ userId:c.user_id, name:c.patient_name }); }}>
                      {c.patient_name||'—'}
                    </div>
                    {c.patient_age && <div style={{ fontSize:11, color:T.inkMuted }}>{c.patient_age} años</div>}
                  </td>
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ fontWeight:600, color:T.ink }}>{c.doctor_name||'Sin asignar'}</div>
                    {c.specialty && <div style={{ fontSize:11, color:T.inkMuted }}>{c.specialty}</div>}
                  </td>
                  <td style={{ padding:'12px 14px' }}><StatusBadge status={c.status} /></td>
                  <td style={{ padding:'12px 14px', fontSize:13, color:T.inkSoft }}>
                    {c.duration_minutes ? `${c.duration_minutes} min` : '—'}
                  </td>
                  <td style={{ padding:'12px 14px', fontWeight:700, color:T.green }}>
                    {c.amount != null ? `S/ ${Number(c.amount).toFixed(2)}` : '—'}
                  </td>
                  <td style={{ padding:'12px 14px' }}>
                    {c.rating ? (
                      <div style={{ display:'flex', alignItems:'center', gap:3 }}>
                        <Ic.Star filled />
                        <span style={{ fontSize:12, fontWeight:700, color:T.amber }}>{c.rating}</span>
                      </div>
                    ) : <span style={{ fontSize:12, color:T.inkMuted }}>—</span>}
                  </td>
                  <td style={{ padding:'12px 14px', textAlign:'right' }}>
                    <button onClick={e => { e.stopPropagation(); navigate('/admin/consultas/' + c.id); }}
                      style={{ background:T.accentSoft, border:`1px solid ${T.accent}33`,
                        color:T.accent, borderRadius:7, padding:'5px 10px',
                        fontSize:12, cursor:'pointer', fontWeight:700 }}>
                      Detalle
                    </button>
                  </td>
                </HoverRow>
              ))}
            </tbody>
          </table>
        </div>
        {loading && <div style={{ textAlign:'center', padding:24, color:T.inkMuted }}>Cargando...</div>}
        {!loading && hasMore && (
          <div style={{ textAlign:'center', padding:14, borderTop:`1px solid ${T.border}` }}>
            <button onClick={() => load(false)} style={{ background:T.accentSoft,
              border:`1px solid ${T.accent}33`, color:T.accent, borderRadius:8,
              padding:'8px 22px', cursor:'pointer', fontWeight:700, fontSize:13 }}>
              Cargar más
            </button>
          </div>
        )}
        {!loading && rows.length > 0 && (
          <div style={{ padding:'7px 22px', textAlign:'right', fontSize:11,
            color:T.inkMuted, borderTop:`1px solid ${T.border}` }}>
            {rows.length} consulta(s)
          </div>
        )}
      </Card>
    </div>
  );
}
