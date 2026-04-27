// Design tokens for Doctor House
window.DH = {
  // Calming healthcare palette
  color: {
    bg: '#F4F6F8',
    bgElev: '#FFFFFF',
    ink: '#0B1F33',
    inkSoft: '#4A5B6E',
    inkMuted: '#8A9AAB',
    line: '#E4E9EE',
    lineStrong: '#D3DCE4',

    // Primary — trust blue
    blue: '#1863E0',
    blueSoft: '#E8F0FD',
    blueDark: '#0F4AB5',

    // Wellness green
    green: '#13A579',
    greenSoft: '#E2F6EF',

    // Yape purple (Peruvian fintech payment — generic, original)
    yape: '#6E2EC2',
    yapeSoft: '#F1EAFB',

    // Warn / emergency
    red: '#E23B4D',
    redSoft: '#FCEBED',
    amber: '#F0A020',
    amberSoft: '#FDF2DF',
  },
  font: {
    ui: '-apple-system, "SF Pro Text", "Inter", system-ui, sans-serif',
    display: '-apple-system, "SF Pro Display", "Inter", system-ui, sans-serif',
  },
  radius: { sm: 10, md: 14, lg: 20, xl: 28, pill: 9999 },
  space: (n) => n * 4,
};
