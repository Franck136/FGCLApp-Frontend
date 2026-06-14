import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Layout from '../components/layout/Layout';

// Pages publiques
import LandingPage from '../pages/LandingPage';
import Login       from '../pages/auth/Login';

// Admin + Commercial
import Dashboard          from '../pages/Dashboard/Dashboard';
import Interventions      from '../pages/Interventions/interventions';
import InterventionDetail from '../pages/Interventions/InterventionDetail';
import Clients            from '../pages/Clients/clients';
import ClientDetail       from '../pages/Clients/ClientDetail';
import Contrats           from '../pages/Contrats/Contrats';
import ContratDetail      from '../pages/Contrats/ContratDetail';
import Equipements        from '../pages/Equipements/Equipements';
import Techniciens        from '../pages/Techniciens/techniciens';
import Rapports           from '../pages/Rapports/Rapports';

// Technicien
import DashboardTechnicien from '../pages/Techniciens/DashboardTechnicien';
import MesInterventions    from '../pages/Techniciens/MesInterventions';
import MonProfil           from '../pages/Techniciens/MonProfil';
import MonPlanning         from '../pages/Techniciens/MonPlanning';
import MesStatistiques     from '../pages/Techniciens/MesStatistiques';

// Client
import DashboardClient from '../pages/Clients/DashboardClient';
import { MesContratsClient, MesInterventionsClient, MonParcInformatique } from '../pages/Clients/ClientPages';

// ── Guards ──
const PrivateRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
};

const RoleRoute = ({ children, roles }) => {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (!user)  return null;
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

// ── Pages dynamiques selon rôle ──
const DashboardPage = () => {
  const { user } = useAuthStore();
  if (!user) return null;
  if (user.role === 'technicien') return <DashboardTechnicien />;
  if (user.role === 'client')     return <DashboardClient />;
  return <Dashboard />;
};

const InterventionsPage = () => {
  const { user } = useAuthStore();
  if (!user) return null;
  if (user.role === 'technicien') return <MesInterventions />;
  if (user.role === 'client')     return <MesInterventionsClient />;
  return <Interventions />;
};

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── PUBLIQUES ── */}
        <Route path="/"      element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* ── PROTÉGÉES ── */}
        <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />

          {/* Commun */}
          <Route path="dashboard"         element={<DashboardPage />} />
          <Route path="interventions"     element={<InterventionsPage />} />
          <Route path="interventions/:id" element={<InterventionDetail />} />

          {/* Technicien */}
          <Route path="mon-profil"       element={<MonProfil />} />
          <Route path="mon-planning"     element={<MonPlanning />} />
          <Route path="mes-statistiques" element={<MesStatistiques />} />

          {/* Client */}
          <Route path="client/contrats"    element={<RoleRoute roles={['client']}><MesContratsClient /></RoleRoute>} />
          <Route path="client/equipements" element={<RoleRoute roles={['client']}><MonParcInformatique /></RoleRoute>} />

          {/* Admin + Commercial */}
          <Route path="clients"      element={<RoleRoute roles={['admin','commercial']}><Clients /></RoleRoute>} />
          <Route path="clients/:id"  element={<RoleRoute roles={['admin','commercial']}><ClientDetail /></RoleRoute>} />
          <Route path="contrats"     element={<RoleRoute roles={['admin','commercial']}><Contrats /></RoleRoute>} />
          <Route path="contrats/:id" element={<RoleRoute roles={['admin','commercial']}><ContratDetail /></RoleRoute>} />
          <Route path="equipements"  element={<RoleRoute roles={['admin','commercial']}><Equipements /></RoleRoute>} />
          <Route path="techniciens"  element={<RoleRoute roles={['admin','commercial']}><Techniciens /></RoleRoute>} />
          <Route path="rapports"     element={<RoleRoute roles={['admin','commercial']}><Rapports /></RoleRoute>} />
        </Route>

        {/* ── 404 → accueil ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
