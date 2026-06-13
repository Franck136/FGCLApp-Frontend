import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { path: '/dashboard',     label: 'Tableau de bord', icon: '⬛', roles: ['admin', 'commercial','technicien'] },
  { path: '/clients',       label: 'Clients',          icon: '🏢', roles: ['admin', 'commercial'] },
  { path: '/contrats',      label: 'Contrats',         icon: '📋', roles: ['admin', 'commercial'] },
  { path: '/interventions', label: 'Interventions',    icon: '🔧', roles: ['admin', 'commercial', 'technicien'] },
  { path: '/equipements',   label: 'Équipements',      icon: '💻', roles: ['admin', 'commercial'] },
  { path: '/techniciens',   label: 'Techniciens',      icon: '👷', roles: ['admin', 'commercial'] },
  { path: '/rapports',      label: 'Rapports',         icon: '📊', roles: ['admin', 'commercial'] },
  { path: '/mon-planning',      label: 'Mon planning',     icon: '📅', roles: ['technicien'] },
  { path: '/mes-statistiques',  label: 'Mes statistiques', icon: '📈', roles: ['technicien'] },
  { path: '/MonProfil',    label: 'Mon profil',       icon: '👤', roles:  ['technicien'] },
];

export default function Sidebar() {
  const { user, logout }  = useAuthStore();
  const navigate          = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (_) {}
    logout();
    toast.success('Déconnexion réussie.');
    navigate('/login');
  };

  //Filtre par role
  const visibleItems = NAV_ITEMS.filter(n => n.roles.includes(user?.role));

  return (
    <aside className="w-56 bg-[#0D1F3C] border-r border-[#1C3560] flex flex-col shrink-0">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#1C3560]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1D6FA4] to-[#2589C8] flex items-center justify-center text-lg">
          ⚙
        </div>
        <div>
          <div className="font-extrabold text-sm text-white">FGCL SARL</div>
          <div className="text-xs text-[#6B84AA]">Gestion IT</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150
              ${isActive
                ? 'bg-[#1D6FA4]/30 text-white font-semibold border-l-2 border-[#F0A500]'
                : 'text-[#6B84AA] hover:bg-white/5 hover:text-white border-l-2 border-transparent'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Profil + déconnexion */}
      <div className="px-4 py-4 border-t border-[#1C3560]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F0A500] to-[#FFD166] flex items-center justify-center font-bold text-sm text-[#08132A] shrink-0">
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">
              {user?.prenom} {user?.nom} 
            </div>
            <div className="text-xs text-[#6B84AA] capitalize">{user?.role}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Déconnexion"
            className="text-[#6B84AA] hover:text-red-400 transition-colors text-base"
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>
  );
}
