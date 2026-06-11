import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Layout from '../components/layout/Layout';

// Pages
import Login          from '../pages/auth/Login';
import Dashboard      from '../pages/Dashboard/Dashboard';
import Clients        from '../pages/Clients/clients';
import ClientDetail   from '../pages/Clients/ClientDetail';
import Contrats       from '../pages/contrats/Contrats';
import ContratDetail  from '../pages/contrats/ContratDetail';
import Interventions  from '../pages/interventions/Interventions';
import Equipements    from '../pages/Equipements/Equipements';
import Techniciens    from '../pages/techniciens/Techniciens';
import Rapports       from '../pages/rapports/Rapports';

// Guard : redirige vers /login si non connecté
const PrivateRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
};

// Guard rôle : redirige si rôle insuffisant
const RoleRoute = ({ children, roles }) => {
  const { user } = useAuthStore();
  return roles.includes(user?.role) ? children : <Navigate to="/dashboard" replace />;
};

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Publique */}
        <Route path="/login" element={<Login />} />

        {/* Protégées */}
        <Route path="/" element={
          <PrivateRoute><Layout /></PrivateRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"    element={<Dashboard />} />
          <Route path="clients"      element={<Clients />} />
          <Route path="clients/:id"  element={<ClientDetail />} />
          <Route path="contrats"     element={<Contrats />} />
          <Route path="contrats/:id" element={<ContratDetail />} />
          <Route path="interventions" element={<Interventions />} />
          <Route path="equipements"  element={<Equipements />} />
          <Route path="rapports"     element={
            <RoleRoute roles={['admin', 'commercial']}>
              <Rapports />
            </RoleRoute>
          } />
          <Route path="techniciens"  element={
            <RoleRoute roles={['admin', 'commercial']}>
              <Techniciens />
            </RoleRoute>
          } />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}