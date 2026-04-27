import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState({
    urgency: 'now',
    serviceType: 'doctor_visit',
    selectedInjectable: null,
    doctorType: null,
    specialtyRequested: null,
    symptoms: [],
    address: '',
    lat: null,
    lng: null,
    ref: '',
    when: 'asap',
    patient: {},
    payment: 'yape_plin',
    phone: '',
    schedDate: 1,
    schedTime: null,
    sameDoctor: true,
    recurring: null,
    assignedDoctor: null,
    visitId: null,
    // Auth permanente — cargado desde AsyncStorage
    authToken: null,
    userPhone: null,
    authLoaded: false,
  });

  useEffect(() => {
    AsyncStorage.multiGet(['dh_auth_token', 'dh_user_phone'])
      .then(([[, token], [, phone]]) => {
        setState(prev => ({
          ...prev,
          authToken:  token || null,
          userPhone:  phone || null,
          authLoaded: true,
        }));
      })
      .catch(() => setState(prev => ({ ...prev, authLoaded: true })));
  }, []);

  return (
    <AppContext.Provider value={{ state, setState }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
