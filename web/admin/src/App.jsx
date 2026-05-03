import { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Shell from '@/components/Shell';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Consultations from '@/pages/Consultations';
import Doctors from '@/pages/Doctors';
import Applications from '@/pages/Applications';
import Patients from '@/pages/Patients';
import Payouts from '@/pages/Payouts';
import Reviews from '@/pages/Reviews';
import Coupons from '@/pages/Coupons';
import Zones from '@/pages/Zones';
import Support from '@/pages/Support';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import LiveControl from '@/pages/LiveControl';
import ApiDocs from '@/pages/ApiDocs';
import { Spinner } from '@/components/ui';
import { C } from '@/tokens';

function Router() {
  const { admin, loading } = useAuth();
  const [route, setRoute] = useState('dashboard');

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: C.bg }}>
        <Spinner size={32}/>
      </div>
    );
  }

  if (!admin) return <Login/>;

  const pages = {
    dashboard:    <Dashboard onOpenConsult={id => setRoute('consults')}/>,
    consults:     <Consultations/>,
    doctors:      <Doctors/>,
    applications: <Applications/>,
    patients:     <Patients/>,
    live:         <LiveControl/>,
    payouts:      <Payouts/>,
    reviews:      <Reviews/>,
    coupons:      <Coupons/>,
    zones:        <Zones/>,
    support:      <Support/>,
    reports:      <Reports/>,
    settings:     <Settings/>,
    apidocs:      <ApiDocs/>,
  };

  return (
    <Shell route={route} onNav={setRoute}>
      {pages[route] || pages.dashboard}
    </Shell>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router/>
    </AuthProvider>
  );
}
