const b = (ch) => ({ size = 18, color = 'currentColor', sw = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {ch}
  </svg>
);

export const Dashboard   = b(<><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="11" width="7" height="10" rx="1.5"/><rect x="3" y="15" width="7" height="6" rx="1.5"/></>);
export const Stethoscope = b(<><path d="M5 3v6a4 4 0 0 0 8 0V3"/><path d="M9 13v3a4 4 0 0 0 8 0v-2"/><circle cx="17" cy="11" r="2"/></>);
export const Doctor      = b(<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/><path d="M12 13v3M10.5 14.5h3"/></>);
export const Apply       = b(<><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M9 14l2 2 4-4"/></>);
export const Patient     = b(<><circle cx="9" cy="8" r="3.5"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M17 11l2 2 3-3"/></>);
export const Wallet      = b(<><path d="M3 7h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/><path d="M3 7l12-4v4"/><circle cx="16" cy="13" r="1.2" fill="currentColor"/></>);
export const Star        = ({ size = 18, color = 'currentColor', fill = 'none' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="1.6" strokeLinejoin="round"><path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9z"/></svg>;
export const Tag         = b(<><path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0l-8.6-8.6V3h9l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7" cy="7" r="1.4" fill="currentColor"/></>);
export const Map         = b(<><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/></>);
export const Headset     = b(<><path d="M4 14a8 8 0 0 1 16 0"/><rect x="2" y="14" width="5" height="6" rx="1.5"/><rect x="17" y="14" width="5" height="6" rx="1.5"/><path d="M19 20a3 3 0 0 1-3 3h-2"/></>);
export const Chart       = b(<><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></>);
export const Settings    = b(<><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4.8a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.4a7 7 0 0 0-2 1.2l-2.4-.8-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-.8c.6.5 1.3.9 2 1.2L10 21h4l.5-2.4c.7-.3 1.4-.7 2-1.2l2.4.8 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z"/></>);
export const Audit       = b(<><path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v4h4"/><path d="M8 12h8M8 16h6M8 8h3"/></>);
export const Search      = b(<><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></>);
export const Bell        = b(<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></>);
export const ChevR       = b(<><path d="M9 6l6 6-6 6"/></>);
export const ChevL       = b(<><path d="M15 6l-6 6 6 6"/></>);
export const ChevD       = b(<><path d="M6 9l6 6 6-6"/></>);
export const ChevU       = b(<><path d="M6 15l6-6 6 6"/></>);
export const Plus        = b(<><path d="M12 5v14M5 12h14"/></>);
export const Check       = b(<><path d="M5 12.5l4.5 4.5L19 7.5"/></>);
export const X           = b(<><path d="M6 6l12 12M18 6L6 18"/></>);
export const More        = b(<><circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/></>);
export const Filter      = b(<><path d="M3 5h18l-7 9v6l-4-2v-4z"/></>);
export const Download    = b(<><path d="M12 3v13M18 10l-6 6-6-6"/><path d="M4 19h16"/></>);
export const Upload      = b(<><path d="M12 21V8M6 14l6-6 6 6"/><path d="M4 5h16"/></>);
export const Phone       = b(<><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.4 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"/></>);
export const Mail        = b(<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></>);
export const Chat        = b(<><path d="M3 8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4h-5l-5 4v-4H7a4 4 0 0 1-4-4z"/></>);
export const Pin         = b(<><path d="M12 22s-7-7.5-7-13a7 7 0 0 1 14 0c0 5.5-7 13-7 13z"/><circle cx="12" cy="9" r="2.5"/></>);
export const Clock       = b(<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>);
export const Doc         = b(<><path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v4h4"/></>);
export const Pill        = b(<><rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-30 12 12)"/><path d="M9.2 6.8l7.6 10.4"/></>);
export const Vital       = b(<><path d="M3 12h4l2-7 4 14 2-7h6"/></>);
export const Eye         = b(<><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>);
export const Edit        = b(<><path d="M4 20h4l11-11-4-4L4 16z"/><path d="M14 5l4 4"/></>);
export const Trash       = b(<><path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14"/></>);
export const Lock        = b(<><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></>);
export const Unlock      = b(<><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/></>);
export const Logout      = b(<><path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5"/><path d="M16 8l4 4-4 4M20 12H9"/></>);
export const User        = b(<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>);
export const Shield      = b(<><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></>);
export const Refresh     = b(<><path d="M4 12a8 8 0 0 1 14-5.3L21 9"/><path d="M21 4v5h-5"/><path d="M20 12a8 8 0 0 1-14 5.3L3 15"/><path d="M3 20v-5h5"/></>);
export const Send        = b(<><path d="M3 11l18-8-8 18-2-7z"/></>);
export const Print       = b(<><path d="M7 8V3h10v5"/><rect x="4" y="8" width="16" height="8" rx="2"/><path d="M7 14h10v6H7z"/></>);
export const Link        = b(<><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></>);
export const Warn        = b(<><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18.5v.01"/></>);
export const Info        = b(<><circle cx="12" cy="12" r="9"/><path d="M12 8v.01M12 11v6"/></>);
export const Mobile      = b(<><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></>);
export const Broadcast   = b(<><path d="M18.36 6.64a9 9 0 0 1 0 10.72M15.54 9.46a5 5 0 0 1 0 5.08"/><circle cx="12" cy="12" r="2"/><path d="M5.64 6.64a9 9 0 0 0 0 10.72M8.46 9.46a5 5 0 0 0 0 5.08"/></>);
export const Activity    = b(<><path d="M3 12h4l2-7 4 14 2-7h6"/></>);
export const TrendUp     = b(<><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></>);
export const Zap         = b(<><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></>);

export function Logo({ size = 32, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M24 5L5 20v22a2 2 0 0 0 2 2h34a2 2 0 0 0 2-2V20L24 5z"
        stroke={color} strokeWidth="3" strokeLinejoin="round" fill="none"/>
      <rect x="20" y="22" width="8" height="4" fill={color}/>
      <rect x="22" y="22" width="4" height="13" fill={color}/>
      <rect x="20" y="28" width="8" height="3" fill={color}/>
    </svg>
  );
}
