import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/api/client';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('dh_admin_token');
    if (!t) { setLoading(false); return; }
    api.me()
      .then(setAdmin)
      .catch(() => localStorage.removeItem('dh_admin_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    const data = await api.login(username, password);
    localStorage.setItem('dh_admin_token', data.token);
    setAdmin(data.admin);
    return data.admin;
  }

  function logout() {
    localStorage.removeItem('dh_admin_token');
    setAdmin(null);
  }

  return <Ctx.Provider value={{ admin, loading, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
