import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { C } from '../theme';

const base = ({ size = 22, color = C.ink, sw = 2 }, children) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </Svg>
);

export const Icons = {
  Home:    (p) => base(p, <Path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>),
  Bell:    (p) => base(p, <><Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><Path d="M10 21a2 2 0 0 0 4 0"/></>),
  User:    (p) => base(p, <><Circle cx="12" cy="8" r="4"/><Path d="M4 21a8 8 0 0 1 16 0"/></>),
  Wallet:  (p) => base(p, <><Path d="M3 7h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/><Path d="M3 7l12-4v4"/><Circle cx="16" cy="13" r="1.5" fill={p.color || C.ink} stroke="none"/></>),
  Clock:   (p) => base(p, <><Circle cx="12" cy="12" r="9"/><Path d="M12 7v5l3 2"/></>),
  Check:   (p) => base(p, <Path d="M5 12.5l4.5 4.5L19 7.5"/>),
  X:       (p) => base(p, <Path d="M6 6l12 12M18 6L6 18"/>),
  Phone:   (p) => base(p, <Path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.4 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"/>),
  Map:     (p) => base(p, <><Path d="M12 22s-7-7.5-7-13a7 7 0 0 1 14 0c0 5.5-7 13-7 13z"/><Circle cx="12" cy="9" r="2.5"/></>),
  Nav:     (p) => base(p, <Path d="M3 11l18-8-8 18-2-7z"/>),
  Doc:     (p) => base(p, <><Path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><Path d="M14 3v4h4"/><Path d="M8 12h8M8 16h6"/></>),
  Pill:    (p) => base(p, <><Rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-30 12 12)"/><Path d="M9.2 6.8l7.6 10.4"/></>),
  Plus:    (p) => base(p, <Path d="M12 5v14M5 12h14"/>),
  Stats:   (p) => base(p, <Path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>),
  Shield:  (p) => base(p, <><Path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/><Path d="M9 12l2 2 4-4"/></>),
  ChevR:   (p) => base(p, <Path d="M9 6l6 6-6 6"/>),
  ChevL:   (p) => base(p, <Path d="M15 6l-6 6 6 6"/>),
  ChevD:   (p) => base(p, <Path d="M6 9l6 6 6-6"/>),
  Signal:  (p) => base(p, <><Path d="M3 20h2M8 20h2M13 20h2M18 20h3"/><Path d="M4 16v4M9 12v8M14 8v12M19 4v16"/></>),
  Power:   (p) => base(p, <><Path d="M12 3v9"/><Path d="M6 8a8 8 0 1 0 12 0"/></>),
  Settings:(p) => base(p, <><Circle cx="12" cy="12" r="3"/><Path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4.8a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.4a7 7 0 0 0-2 1.2l-2.4-.8-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-.8c.6.5 1.3.9 2 1.2L10 21h4l.5-2.4c.7-.3 1.4-.7 2-1.2l2.4.8 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z"/></>),
  Chat:    (p) => base(p, <Path d="M3 8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4h-5l-5 4v-4H7a4 4 0 0 1-4-4z"/>),
  Thermometer: (p) => base(p, <Path d="M14 4v10a4 4 0 1 1-4 0V4a2 2 0 1 1 4 0z"/>),
  Calendar:(p) => base(p, <><Rect x="3" y="5" width="18" height="16" rx="2"/><Path d="M3 10h18M8 3v4M16 3v4"/></>),
  Camera:  (p) => base(p, <><Path d="M3 8a2 2 0 0 1 2-2h3l1.5-2h5L16 6h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><Circle cx="12" cy="13" r="4"/></>),
  Star: ({ size = 22, fill = 'none', color = C.amber }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={1.6} strokeLinejoin="round">
      <Path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9z"/>
    </Svg>
  ),
  Sparkle: ({ size = 22, color = C.amber }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth={1}>
      <Path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"/>
    </Svg>
  ),
};
