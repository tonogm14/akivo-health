// Minimal line icons — 24x24, stroke-based, no emoji
const Icon = ({ d, size = 24, stroke = 'currentColor', fill = 'none', sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {typeof d === 'string' ? <path d={d}/> : d}
  </svg>
);

const I = {
  Stethoscope: (p) => <Icon {...p} d={<>
    <path d="M6 3v6a4 4 0 0 0 8 0V3"/>
    <path d="M10 13v3a4 4 0 0 0 4 4h0a4 4 0 0 0 4-4v-3"/>
    <circle cx="18" cy="10" r="2"/>
  </>}/>,
  Home: (p) => <Icon {...p} d={<>
    <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>
  </>}/>,
  MapPin: (p) => <Icon {...p} d={<>
    <path d="M12 22s-7-7.5-7-13a7 7 0 0 1 14 0c0 5.5-7 13-7 13z"/>
    <circle cx="12" cy="9" r="2.5"/>
  </>}/>,
  Clock: (p) => <Icon {...p} d={<>
    <circle cx="12" cy="12" r="9"/>
    <path d="M12 7v5l3 2"/>
  </>}/>,
  ChevronRight: (p) => <Icon {...p} d="M9 6l6 6-6 6"/>,
  ChevronLeft: (p) => <Icon {...p} d="M15 6l-6 6 6 6"/>,
  ChevronDown: (p) => <Icon {...p} d="M6 9l6 6 6-6"/>,
  X: (p) => <Icon {...p} d="M6 6l12 12M18 6L6 18"/>,
  Check: (p) => <Icon {...p} d="M4 12l5 5L20 6"/>,
  Plus: (p) => <Icon {...p} d="M12 5v14M5 12h14"/>,
  Minus: (p) => <Icon {...p} d="M5 12h14"/>,
  Phone: (p) => <Icon {...p} d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>,
  Shield: (p) => <Icon {...p} d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/>,
  Star: (p) => <Icon {...p} d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9z" sw={1.6}/>,
  Info: (p) => <Icon {...p} d={<>
    <circle cx="12" cy="12" r="9"/>
    <path d="M12 8h0M12 11v5"/>
  </>}/>,
  Alert: (p) => <Icon {...p} d={<>
    <path d="M12 3l10 17H2z"/>
    <path d="M12 10v4M12 17h0"/>
  </>}/>,
  Warn: (p) => <Icon {...p} d={<>
    <circle cx="12" cy="12" r="9"/>
    <path d="M12 8v5M12 16h0"/>
  </>}/>,
  Wifi: (p) => <Icon {...p} d={<>
    <path d="M2 9a15 15 0 0 1 20 0"/>
    <path d="M5 12.5a10 10 0 0 1 14 0"/>
    <path d="M8.5 16a5 5 0 0 1 7 0"/>
    <path d="M12 19.5h0"/>
  </>}/>,
  User: (p) => <Icon {...p} d={<>
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 21a8 8 0 0 1 16 0"/>
  </>}/>,
  Users: (p) => <Icon {...p} d={<>
    <circle cx="9" cy="8" r="3.5"/>
    <path d="M2 20a7 7 0 0 1 14 0"/>
    <path d="M16 4a4 4 0 0 1 0 8"/>
    <path d="M22 20a6 6 0 0 0-4-5.5"/>
  </>}/>,
  Bolt: (p) => <Icon {...p} d="M13 3L4 14h6l-1 7 9-11h-6z"/>,
  Calendar: (p) => <Icon {...p} d={<>
    <rect x="3" y="5" width="18" height="16" rx="2"/>
    <path d="M3 10h18M8 3v4M16 3v4"/>
  </>}/>,
  Cash: (p) => <Icon {...p} d={<>
    <rect x="2" y="6" width="20" height="12" rx="2"/>
    <circle cx="12" cy="12" r="2.5"/>
    <path d="M6 10h0M18 14h0"/>
  </>}/>,
  Card: (p) => <Icon {...p} d={<>
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <path d="M2 10h20M6 15h3"/>
  </>}/>,
  Whatsapp: (p) => <Icon {...p} d={<>
    <path d="M3.5 20.5l1.4-4.6A8.5 8.5 0 1 1 8.1 19.1z"/>
    <path d="M8.5 9.5c.3 2.5 2.5 4.7 5 5l1.3-1.4 2.2 1-.5 1.6a1.8 1.8 0 0 1-1.8 1.2c-4 0-7.6-3.6-7.6-7.6a1.8 1.8 0 0 1 1.2-1.8l1.6-.5 1 2.2z"/>
  </>}/>,
  Search: (p) => <Icon {...p} d={<>
    <circle cx="11" cy="11" r="7"/>
    <path d="M20 20l-3.5-3.5"/>
  </>}/>,
  ArrowRight: (p) => <Icon {...p} d="M5 12h14M13 6l6 6-6 6"/>,
  Car: (p) => <Icon {...p} d={<>
    <path d="M4 15V11l2-5h12l2 5v4"/>
    <path d="M2 15h20v3a1 1 0 0 1-1 1h-2a2 2 0 0 1-4 0h-6a2 2 0 0 1-4 0H3a1 1 0 0 1-1-1z"/>
  </>}/>,
  Pill: (p) => <Icon {...p} d={<>
    <rect x="2" y="8" width="20" height="8" rx="4" transform="rotate(-30 12 12)"/>
    <path d="M8.5 7.5l7 7" transform="rotate(-30 12 12)"/>
  </>}/>,
  Thermometer: (p) => <Icon {...p} d={<>
    <path d="M14 4a2 2 0 1 1 4 0v10a4 4 0 1 1-4 0z"/>
    <path d="M16 13V6"/>
  </>}/>,
  Heart: (p) => <Icon {...p} d="M12 20s-8-5-8-11a5 5 0 0 1 8-4 5 5 0 0 1 8 4c0 6-8 11-8 11z"/>,
  Lungs: (p) => <Icon {...p} d={<>
    <path d="M12 4v12"/>
    <path d="M12 8c-1 5-4 8-6 8s-2-4 0-8 4-5 6-4z"/>
    <path d="M12 8c1 5 4 8 6 8s2-4 0-8-4-5-6-4z"/>
  </>}/>,
  Stomach: (p) => <Icon {...p} d={<>
    <path d="M8 4v4a4 4 0 0 0 8 0V4"/>
    <path d="M7 8a6 6 0 0 0 0 12h10a5 5 0 0 0 0-10"/>
  </>}/>,
  Baby: (p) => <Icon {...p} d={<>
    <circle cx="12" cy="7" r="3"/>
    <path d="M5 21a7 7 0 0 1 14 0"/>
    <path d="M10 7h0M14 7h0"/>
  </>}/>,
  Adult: (p) => <Icon {...p} d={<>
    <circle cx="12" cy="6" r="3"/>
    <path d="M6 21v-4a6 6 0 0 1 12 0v4"/>
  </>}/>,
  Elder: (p) => <Icon {...p} d={<>
    <circle cx="11" cy="6" r="3"/>
    <path d="M5 21l1-7a5 5 0 0 1 10 0l1 7"/>
    <path d="M18 10l2 11"/>
  </>}/>,
};

window.I = I;
