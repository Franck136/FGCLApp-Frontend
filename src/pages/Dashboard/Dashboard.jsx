import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

// ── Composants UI ──
function StatCard({ label, value, delta, color, icon }) {
  return (
    <div style={{
      background: '#101F3A',
      border: '1px solid #1C3560',
      borderRadius: 12,
      padding: '20px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: color + '18',
      }} />
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: '#E8EDF5', lineHeight: 1 }}>
        {value ?? '—'}
      </div>
      <div style={{ fontSize: 13, color: '#6B84AA', marginTop: 4 }}>{label}</div>
      {delta && (
        <div style={{ fontSize: 12, color, marginTop: 6, fontWeight: 600 }}>{delta}</div>
      )}
    </div>
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

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: '#101F3A',
      border: '1px solid #1C3560',
      borderRadius: 12,
      padding: '20px 24px',
      ...style,
    }}>{children}</div>
  );
}

function Badge({ statut }) {
  const map = {
    'en_cours':   { bg: '#1D3F7A', color: '#60A5FA' },
    'planifiee':  { bg: '#1A3A2A', color: '#22C55E' },
    'terminee':   { bg: '#2A2A1A', color: '#F59E0B' },
    'annulee':    { bg: '#3A1A1A', color: '#EF4444' },
    'haute':      { bg: '#3A1A1A', color: '#EF4444' },
    'normale':    { bg: '#1D3F7A', color: '#60A5FA' },
    'basse':      { bg: '#1A3A2A', color: '#22C55E' },
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

// ── Tooltip personnalisé recharts ──
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: '#0D1F3C', border: '1px solid #1C3560',
        borderRadius: 8, padding: '8px 14px',
      }}>
        <div style={{ color: '#6B84AA', fontSize: 12 }}>{label}</div>
        <div style={{ color: '#2589C8', fontWeight: 700, fontSize: 16 }}>
          {payload[0].value} interventions
        </div>
      </div>
    );
  }
  return null;
};

// ── DASHBOARD ──
export default function Dashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      setError('Impossible de charger le tableau de bord.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40, border: '3px solid #1C3560',
          borderTop: '3px solid #1D6FA4', borderRadius: '50%',
          animation: 'spin 1s linear infinite', margin: '0 auto 16px',
        }} />
        <div style={{ color: '#6B84AA', fontSize: 14 }}>Chargement...</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div style={{
      background: '#3A1A1A', border: '1px solid #EF4444',
      borderRadius: 12, padding: '20px 24px', color: '#EF4444',
    }}>{error}</div>
  );

  const stats = data?.stats ?? {};
  const interventionsMois = data?.interventions_mois ?? [];
  const contratsExpirants = data?.contrats_expirants ?? [];
  const interventionsRecentes = data?.interventions_recent ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── STATS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard
          label="Clients actifs"
          value={stats.clients_actifs}
          icon="🏢" color="#1D6FA4"
        />
        <StatCard
          label="Contrats actifs"
          value={stats.contrats_actifs}
          delta={stats.contrats_expirant_bientot > 0 ? `⚠ ${stats.contrats_expirant_bientot} expirent bientôt` : null}
          icon="📋" color="#F0A500"
        />
        <StatCard
          label="Interventions en cours"
          value={stats.interventions_en_cours}
          delta={`${stats.interventions_planifiees ?? 0} planifiées`}
          icon="🔧" color="#F59E0B"
        />
        <StatCard
          label="Techniciens disponibles"
          value={stats.techniciens_disponibles}
          delta={`sur ${stats.techniciens_total ?? 0} au total`}
          icon="👷" color="#22C55E"
        />
      </div>

      {/* ── GRAPHIQUE + CONTRATS EXPIRANTS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Graphique barres */}
        <Card>
          <SectionTitle>Interventions par mois</SectionTitle>
          {interventionsMois.length === 0 ? (
            <div style={{ color: '#6B84AA', textAlign: 'center', padding: '40px 0', fontSize: 13 }}>
              Aucune donnée disponible
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={interventionsMois} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C3560" />
                <XAxis dataKey="mois" tick={{ fill: '#6B84AA', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6B84AA', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="#1D6FA4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Contrats expirants */}
        <Card>
          <SectionTitle>⚠ Contrats expirant bientôt</SectionTitle>
          {contratsExpirants.length === 0 ? (
            <div style={{ color: '#6B84AA', textAlign: 'center', padding: '40px 0', fontSize: 13 }}>
              Aucun contrat n'expire dans les 30 prochains jours
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {contratsExpirants.map((c, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: c.jours_restants <= 7 ? '#3A1A1A' : '#1A2A3A',
                  borderRadius: 8, padding: '10px 14px',
                  borderLeft: `3px solid ${c.jours_restants <= 7 ? '#EF4444' : '#F59E0B'}`,
                }}>
                  <div>
                    <div style={{ color: '#E8EDF5', fontSize: 13, fontWeight: 600 }}>{c.client}</div>
                    <div style={{ color: '#6B84AA', fontSize: 11 }}>{c.reference} · Fin : {c.date_fin}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      color: c.jours_restants <= 7 ? '#EF4444' : '#F59E0B',
                      fontWeight: 700, fontSize: 13,
                    }}>J-{c.jours_restants}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── INTERVENTIONS RÉCENTES ── */}
      <Card>
        <SectionTitle>Interventions récentes</SectionTitle>
        {interventionsRecentes.length === 0 ? (
          <div style={{ color: '#6B84AA', textAlign: 'center', padding: '40px 0', fontSize: 13 }}>
            Aucune intervention enregistrée
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1C3560' }}>
                {['Réf.', 'Client', 'Type', 'Technicien(s)', 'Priorité', 'Statut', 'Date'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '8px 12px',
                    color: '#6B84AA', fontSize: 11,
                    fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {interventionsRecentes.map((row, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: '1px solid #1C356022', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#ffffff08'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '10px 12px', color: '#2589C8', fontSize: 13, fontWeight: 600 }}>
                    {row.reference}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#E8EDF5', fontSize: 13 }}>
                    {row.client?.raison_sociale ?? '—'}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#6B84AA', fontSize: 13 }}>
                    {row.type_intervention}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#E8EDF5', fontSize: 13 }}>
                    {row.techniciens?.map(t => `${t.prenom} ${t.nom}`).join(', ') || '—'}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <Badge statut={row.priorite} />
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <Badge statut={row.statut} />
                  </td>
                  <td style={{ padding: '10px 12px', color: '#6B84AA', fontSize: 13 }}>
                    {row.date_planifiee
                      ? new Date(row.date_planifiee).toLocaleDateString('fr-FR')
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* ── STATS SECONDAIRES ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <Card style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>💻</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#EF4444' }}>
            {stats.equipements_hors_service ?? 0}
          </div>
          <div style={{ color: '#6B84AA', fontSize: 13, marginTop: 4 }}>
            Équipements hors service
          </div>
        </Card>
        <Card style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#22C55E' }}>
            {stats.interventions_planifiees ?? 0}
          </div>
          <div style={{ color: '#6B84AA', fontSize: 13, marginTop: 4 }}>
            Interventions planifiées
          </div>
        </Card>
        <Card style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#F0A500' }}>
            {stats.contrats_expirant_bientot ?? 0}
          </div>
          <div style={{ color: '#6B84AA', fontSize: 13, marginTop: 4 }}>
            Contrats expirant (30j)
          </div>
        </Card>
      </div>

    </div>
  );
}
