import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE, DEV_DOCTOR_ID } from './config';

const AppContext = createContext(null);

function getInitials(name) {
  if (!name) return 'DR';
  const words = name.split(' ').filter(w => w.length > 2 && !/^(Dr\.?|Dra\.?)$/i.test(w));
  return words.slice(0, 2).map(w => w[0].toUpperCase()).join('') || 'DR';
}

function getFirstName(name) {
  if (!name) return '';
  return name.split(' ').filter(w => !/^(Dr\.?|Dra\.?)$/i.test(w))[0] || '';
}

function todayLabel() {
  const now = new Date();
  const days   = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]}`;
}

const BLANK_DOCTOR = {
  id:       DEV_DOCTOR_ID,
  name:     '',
  firstName:'',
  specialty:'',
  cmp:      '',
  rating:   0,
  reviews:  0,
  visits:   0,
  initials: 'DR',
  level:    'Doctor House Pro',
  recentReviews: [],
};

const BLANK_TODAY = {
  date:        todayLabel(),
  visits:      0,
  completed:   0,
  earned:      0,
  hours:       0,
  weekEarned:  0,
  weekVisits:  0,
  monthEarned: 0,
};

export function AppProvider({ children }) {
  const [state, setState] = useState({
    doctor:      BLANK_DOCTOR,
    today:       BLANK_TODAY,
    online:      false,
    authToken:   null,
    activeVisit: null,
    consultation: null,
    homeVariant: 'waiting',
  });

  useEffect(() => {
    const id = DEV_DOCTOR_ID;
    Promise.all([
      fetch(`${API_BASE}/doctors/${id}`)
        .then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API_BASE}/doctors/${id}/stats`)
        .then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([profile, stats]) => {
      setState(s => ({
        ...s,
        doctor: profile ? {
          id:            profile.id,
          name:          profile.name || '',
          firstName:     getFirstName(profile.name),
          specialty:     profile.specialty || '',
          cmp:           profile.cmp_license || '',
          rating:        parseFloat(profile.rating) || 0,
          reviews:       parseInt(profile.total_reviews) || 0,
          visits:        parseInt(stats?.total_visits) || 0,
          initials:      getInitials(profile.name),
          level:         'Doctor House Pro',
          recentReviews: profile.recent_reviews || [],
        } : s.doctor,
        today: stats ? {
          date:        todayLabel(),
          visits:      parseInt(stats.today_visits) || 0,
          completed:   parseInt(stats.today_visits) || 0,
          earned:      parseFloat(stats.today_earned) || 0,
          hours:       0,
          weekEarned:  parseFloat(stats.week_earned) || 0,
          weekVisits:  parseInt(stats.week_visits) || 0,
          monthEarned: parseFloat(stats.month_earned) || 0,
        } : s.today,
      }));
    });
  }, []);

  return (
    <AppContext.Provider value={{ state, setState }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
