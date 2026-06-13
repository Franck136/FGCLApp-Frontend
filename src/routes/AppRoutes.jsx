import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Layout from '../components/layout/Layout';

//pages
import Login from '../pages/auth/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import Interventions from '../pages/Interventions/interventions';
import InterventionDetail from '../pages/Interventions/interventionDetail';
import Clients from '../pages/Clients/clients';
import ClientDetail from '../pages/Clients/ClientDetail';
import Contrats from '../pages/Contrats/Contrats';
import ContratDetail from '../pages/Contrats/ContratDetail';
import Equipements from '../pages/Equipements/Equipements';
import Techniciens from '../pages/Techniciens/techniciens';
import Rapports from '../pages/Rapports/Rapports';
//Technicien
import DashboardTechnicien from '../pages/Techniciens/DashboardTechnicien';
import MesInterventions from '../pages/Techniciens/MesInterventions';
import MonProfil from '../pages/Techniciens/MonProfil';
import MonPlanning     from '../pages/Techniciens/MonPlanning';
import MesStatistiques from '../pages/Techniciens/MesStatistiques';

// Guard connexion
const PrivateRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
};

// Guard rôle
const RoleRoute = ({ children, roles }) => {
  const { user, token } = useAuthStore();
  
  if (!token) return <Navigate to="/login" replace />;
  
  // Attendre que user soit chargé
  if (!user) return (
    <div style={{ 
      color: '#6B84AA', textAlign: 'center', 
      padding: '60px', fontSize: 14 
    }}>
      Chargement...
    </div>
  );
  
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  
  return children;
};

// Dashboard selon rôle
const DashboardPage = () => {
  const { user } = useAuthStore();
  return user?.role === 'technicien' ? <DashboardTechnicien /> : <Dashboard />;
};

// Interventions selon rôle
const InterventionsPage = () => {
  const { user } = useAuthStore();
  return user?.role === 'technicien' ? <MesInterventions /> : <Interventions />;
};

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route path="dashboard"        element={<DashboardPage />} />
          <Route path="interventions"    element={<InterventionsPage />} />
          <Route path="interventions/:id" element={<InterventionDetail />} />

          {/* <Route path="mon-profil" element={
            <RoleRoute roles={['technicien']}><MonProfil /></RoleRoute>
          } /> */}
          <Route path="/MonProfil" element={
                    <MonProfil />
          } />
          <Route path="mon-planning" element={<MonPlanning />} />
          <Route path="mes-statistiques" element={<MesStatistiques />} />

          <Route path="clients" element={
            <RoleRoute roles={['admin', 'commercial']}><Clients /></RoleRoute>
          } />
          <Route path="clients/:id" element={
            <RoleRoute roles={['admin', 'commercial']}><ClientDetail /></RoleRoute>
          } />
          <Route path="contrats" element={
            <RoleRoute roles={['admin', 'commercial']}><Contrats /></RoleRoute>
          } />
          <Route path="contrats/:id" element={
            <RoleRoute roles={['admin', 'commercial']}><ContratDetail /></RoleRoute>
          } />
          <Route path="equipements" element={
            <RoleRoute roles={['admin', 'commercial']}><Equipements /></RoleRoute>
          } />
          <Route path="techniciens" element={
            <RoleRoute roles={['admin', 'commercial']}><Techniciens /></RoleRoute>
          } />
          <Route path="rapports" element={
            <RoleRoute roles={['admin', 'commercial']}><Rapports /></RoleRoute>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}