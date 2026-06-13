import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import useAuthStore from '../../store/authStore';

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: '#101F3A', border: '1px solid #1C3560',
      borderRadius: 12, padding: '20px 24px', ...style,
    }}>{children}</div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <div style={{ width: 3, height: 20, background: '#F0A500', borderRadius: 2 }} />
      <span style={{ color: '#E8EDF5', fontWeight: 700, fontSize: 15 }}>{children}</span>
    </div>
  );
}

function Badge({ statut }) {
  const map = {
    'planifiee': { bg: '#1A3A2A', color: '#22C55E' },
    'en_cours':  { bg: '#1D3F7A', color: '#60A5FA' },
    'terminee':  { bg: '#2A2A1A', color: '#F59E0B' },
    'annulee':   { bg: '#3A1A1A', color: '#EF4444' },
    'haute':     { bg: '#3A1A1A', color: '#EF4444' },
    'normale':   { bg: '#1D3F7A', color: '#60A5FA' },
    'basse':     { bg: '#1A3A2A', color: '#22C55E' },
  };
  const s = map[statut] || { bg: '#222', color: '#aaa' };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '2px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600,
    }}>{statut?.replace('_', ' ')}</span>
  );
}

export default function DashboardTechnicien() {
  const { user }  = useAuthStore();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [dashRes, interRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/interventions', { params: { technicien_id: user?.id } }),
      ]);
      setData({
        interventions: interRes.data.data ?? [],
        stats: dashRes.data.stats ?? {},
      });
    } catch {}
    finally { setLoading(false); }
  };

  if (loading) return (
    <div style={{ color: '#6B84AA', textAlign: 'center', padding: '60px' }}>Chargement...</div>
  );

  const interventions = data?.interventions ?? [];
  const enCours    = interventions.filter(i => i.statut === 'en_cours').length;
  const planifiees = interventions.filter(i => i.statut === 'planifiee').length;
  const terminees  = interventions.filter(i => i.statut === 'terminee').length;
  const hautes     = interventions.filter(i => i.priorite === 'haute' && i.statut !== 'terminee').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Bienvenue */}
      <div style={{
        background: 'linear-gradient(135deg, #0F1E35, #1D6FA4)',
        borderRadius: 14, padding: '24px 28px',
        display: 'flex', alignItems: 'center', gap: 18,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #F0A500, #FFD166)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 20, color: '#0F1E35', flexShrink: 0,
        }}>
          {user?.prenom?.[0]}{user?.nom?.[0]}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20, color: '#fff' }}>
            Bonjour, {user?.prenom} !
          </div>
          <div style={{ color: '#A0B4CC', fontSize: 13, marginTop: 2 }}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        {hautes > 0 && (
          <div style={{
            marginLeft: 'auto', background: '#EF444422',
            border: '1px solid #EF4444', borderRadius: 10,
            padding: '10px 18px', textAlign: 'center',
          }}>
            <div style={{ color: '#EF4444', fontWeight: 800, fontSize: 22 }}>{hautes}</div>
            <div style={{ color: '#EF4444', fontSize: 12 }}>priorité haute</div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'En cours',   value: enCours,    color: '#60A5FA', icon: '🔧' },
          { label: 'Planifiées', value: planifiees,  color: '#22C55E', icon: '📅' },
          { label: 'Terminées',  value: terminees,   color: '#F59E0B', icon: '✅' },
        ].map((s, i) => (
          <Card key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ color: '#6B84AA', fontSize: 13, marginTop: 4 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Prochaines interventions */}
      <Card>
        <SectionTitle>Mes prochaines interventions</SectionTitle>
        {interventions.filter(i => i.statut !== 'terminee' && i.statut !== 'annulee').length === 0 ? (
          <div style={{ color: '#6B84AA', textAlign: 'center', padding: '30px 0', fontSize: 13 }}>
            Aucune intervention en attente
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {interventions
              .filter(i => i.statut !== 'terminee' && i.statut !== 'annulee')
              .slice(0, 5)
              .map(inv => (
                <div key={inv.id} style={{
                  background: '#0D1F3C', borderRadius: 10,
                  padding: '14px 18px',
                  borderLeft: `3px solid ${inv.priorite === 'haute' ? '#EF4444' : inv.statut === 'en_cours' ? '#60A5FA' : '#22C55E'}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ color: '#2589C8', fontWeight: 700, fontSize: 13 }}>{inv.reference}</div>
                    <div style={{ color: '#E8EDF5', fontSize: 13, marginTop: 2 }}>{inv.client?.raison_sociale}</div>
                    <div style={{ color: '#6B84AA', fontSize: 12, marginTop: 2 }}>
                      {inv.type_intervention} · {new Date(inv.date_planifiee).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                    <Badge statut={inv.statut} />
                    <Badge statut={inv.priorite} />
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>

    </div>
  );
}
