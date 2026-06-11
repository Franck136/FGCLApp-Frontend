import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../lib/axios';
import useAuthStore from '../../store/authStore';

const PAGE_TITLES = {
  '/dashboard':     'Tableau de bord',
  '/clients':       'Gestion des clients',
  '/contrats':      'Gestion des contrats',
  '/interventions': 'Gestion des interventions',
  '/equipements':   'Parc informatique',
  '/techniciens':   'Gestion des techniciens',
  '/rapports':      'Rapports PDF',
};

export default function Topbar() {
  const location                    = useLocation();
  const { user }                    = useAuthStore();
  const [notifs, setNotifs]         = useState([]);
  const [notifOpen, setNotifOpen]   = useState(false);
  const [nonLues, setNonLues]       = useState(0);

  const title = PAGE_TITLES[location.pathname] ?? 'FGCL';

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  useEffect(() => {
    fetchNotifs();
    // Rafraîchir toutes les 2 minutes
    const interval = setInterval(fetchNotifs, 120000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifs = async () => {
    try {
      const res = await api.get('/notifications?lu=false');
      setNotifs(res.data.notifications?.data ?? []);
      setNonLues(res.data.total_non_lues ?? 0);
    } catch (_) {}
  };

  const marquerLue = async (id) => {
    try {
      await api.put(`/notifications/${id}/lire`);
      setNotifs(prev => prev.filter(n => n.id !== id));
      setNonLues(prev => Math.max(0, prev - 1));
    } catch (_) {}
  };

  const marquerToutesLues = async () => {
    try {
      await api.put('/notifications/lire-tout');
      setNotifs([]);
      setNonLues(0);
    } catch (_) {}
  };

  return (
    <header className="h-14 bg-[#0D1F3C] border-b border-[#1C3560] flex items-center justify-between px-6 shrink-0">

      {/* Titre page */}
      <div>
        <div className="font-bold text-white text-base">{title}</div>
        <div className="text-xs text-[#6B84AA] capitalize">{today}</div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 relative">

        {/* Cloche notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="w-9 h-9 bg-[#152645] border border-[#1C3560] rounded-lg flex items-center justify-center text-lg hover:border-[#1D6FA4] transition-colors relative"
          >
            🔔
            {nonLues > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                {nonLues > 9 ? '9+' : nonLues}
              </span>
            )}
          </button>

          {/* Dropdown notifications */}
          {notifOpen && (
            <div className="absolute right-0 top-11 w-80 bg-[#101F3A] border border-[#1C3560] rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1C3560]">
                <span className="text-xs font-bold text-[#6B84AA] uppercase tracking-wider">
                  Notifications ({nonLues})
                </span>
                {nonLues > 0 && (
                  <button
                    onClick={marquerToutesLues}
                    className="text-xs text-[#1D6FA4] hover:text-white transition-colors"
                  >
                    Tout marquer lu
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto">
                {notifs.length === 0 ? (
                  <div className="text-center text-[#6B84AA] text-sm py-8">
                    Aucune notification
                  </div>
                ) : (
                  notifs.map(n => (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 px-4 py-3 border-b border-[#1C3560]/50 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white truncate">{n.titre}</div>
                        <div className="text-xs text-[#6B84AA] mt-0.5 line-clamp-2">{n.message}</div>
                      </div>
                      <button
                        onClick={() => marquerLue(n.id)}
                        className="text-[#1D6FA4] text-xs hover:text-white transition-colors shrink-0 mt-0.5"
                        title="Marquer comme lu"
                      >
                        ✓
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F0A500] to-[#FFD166] flex items-center justify-center font-bold text-xs text-[#08132A]">
          {user?.prenom?.[0]}{user?.nom?.[0]}
        </div>
      </div>
    </header>
  );
}
