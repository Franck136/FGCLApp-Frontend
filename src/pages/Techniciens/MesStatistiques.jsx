import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import useAuthStore from '../../store/authStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart,
  Line, Legend,
} from 'recharts';

function Card({ title, children, style = {} }) {
  return (
    <div style={{
      background: '#101F3A', border: '1px solid #1C3560',
      borderRadius: 12, padding: '20px 24px', ...style,
    }}>
      {title && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 16, paddingBottom: 12,
          borderBottom: '1px solid #1C3560',
        }}>
          <div style={{ width: 3, height: 18, background: '#F0A500', borderRadius: 2 }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: '#E8EDF5' }}>{title}</span>
        </div>
      )}
      {children}
    </div>
  );
}

const COLORS = ['#22C55E', '#60A5FA', '#F59E0B', '#EF4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: '#0D1F3C', border: '1px solid #1C3560',
        borderRadius: 8, padding: '8px 14px',
      }}>
        <div style={{ color: '#6B84AA', fontSize: 12 }}>{label}</div>
        <div style={{ color: '#2589C8', fontWeight: 700, fontSize: 15 }}>
          {payload[0].value} {payload[0].name}
        </div>
      </div>
    );
  }
  return null;
};

export default function MesStatistiques() {
  const { user }  = useAuthStore();
  const [loading, setLoading]         = useState(true);
  const [interventions, setInterventions] = useState([]);
  const [annee, setAnnee]             = useState(new Date().getFullYear());

  useEffect(() => { fetchData(); }, [annee]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/interventions', {
        params: { technicien_id: user?.id },
      });
      setInterventions(res.data.data ?? []);
    } catch {}
    finally { setLoading(false); }
  };

  // Filtrer par année
  const parAnnee = interventions.filter(inv =>
    new Date(inv.date_planifiee).getFullYear() === annee
  );

  // Stats globales
  const total     = parAnnee.length;
  const terminees = parAnnee.filter(i => i.statut === 'terminee').length;
  const tauxCompletion = total > 0 ? Math.round((terminees / total) * 100) : 0;
  const dureeTotal = parAnnee.reduce((acc, i) => acc + (i.duree_minutes || 0), 0);
  const coutTotal  = parAnnee.reduce((acc, i) => acc + (parseFloat(i.cout) || 0), 0);
  const dureeMoy   = terminees > 0
    ? Math.round(parAnnee.filter(i => i.duree_minutes).reduce((acc, i) => acc + i.duree_minutes, 0) / terminees)
    : 0;

  // Par mois
  const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const parMois = MOIS.map((mois, i) => {
    const invMois = parAnnee.filter(inv => new Date(inv.date_planifiee).getMonth() === i);
    return {
      mois,
      total:     invMois.length,
      terminees: invMois.filter(inv => inv.statut === 'terminee').length,
      cout:      Math.round(invMois.reduce((acc, inv) => acc + (parseFloat(inv.cout) || 0), 0) / 1000),
    };
  });

  // Par type
  const parType = ['preventive', 'corrective', 'installation', 'audit'].map(type => ({
    name: type,
    value: parAnnee.filter(i => i.type_intervention === type).length,
  })).filter(t => t.value > 0);

  // Par statut
  const parStatut = [
    { name: 'Planifiée',  value: parAnnee.filter(i => i.statut === 'planifiee').length,  color: '#22C55E' },
    { name: 'En cours',   value: parAnnee.filter(i => i.statut === 'en_cours').length,   color: '#60A5FA' },
    { name: 'Terminée',   value: parAnnee.filter(i => i.statut === 'terminee').length,   color: '#F59E0B' },
    { name: 'Annulée',    value: parAnnee.filter(i => i.statut === 'annulee').length,    color: '#EF4444' },
  ].filter(s => s.value > 0);

  // Par client (top 5)
  const parClient = Object.entries(
    parAnnee.reduce((acc, inv) => {
      const nom = inv.client?.raison_sociale ?? 'Inconnu';
      acc[nom] = (acc[nom] || 0) + 1;
      return acc;
    }, {})
  )
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([client, total]) => ({ client, total }));

  if (loading) return (
    <div style={{ color: '#6B84AA', textAlign: 'center', padding: '60px' }}>Chargement...</div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20, color: '#E8EDF5' }}>Mes statistiques</div>
          <div style={{ color: '#6B84AA', fontSize: 13 }}>Analyse de vos performances</div>
        </div>
        <select
          value={annee}
          onChange={e => setAnnee(parseInt(e.target.value))}
          style={{
            background: '#101F3A', border: '1px solid #1C3560',
            borderRadius: 8, padding: '9px 14px', color: '#E8EDF5',
            fontSize: 13, outline: 'none',
          }}
        >
          {[2024, 2025, 2026, 2027].map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        {[
          { label: 'Total',          value: total,        color: '#1D6FA4', icon: '🔧' },
          { label: 'Terminées',      value: terminees,    color: '#22C55E', icon: '✅' },
          { label: 'Taux complétion',value: `${tauxCompletion}%`, color: '#F0A500', icon: '📊' },
          { label: 'Durée totale',
            value: dureeTotal ? `${Math.floor(dureeTotal/60)}h` : '0h',
            color: '#A855F7', icon: '⏱' },
          { label: 'Revenu total',
            value: coutTotal ? `${Math.round(coutTotal/1000)}k` : '0',
            color: '#F59E0B', icon: '💰' },
        ].map((k, i) => (
          <Card key={i} style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: 26, marginBottom: 6 }}>{k.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ color: '#6B84AA', fontSize: 12, marginTop: 4 }}>{k.label}</div>
          </Card>
        ))}
      </div>

      {/* Graphiques ligne */}
      <Card title="Évolution mensuelle">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={parMois} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1C3560" />
            <XAxis dataKey="mois" tick={{ fill: '#6B84AA', fontSize: 11 }} />
            <YAxis tick={{ fill: '#6B84AA', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#0D1F3C', border: '1px solid #1C3560', borderRadius: 8 }}
              labelStyle={{ color: '#6B84AA' }} itemStyle={{ color: '#E8EDF5' }} />
            <Legend />
            <Line type="monotone" dataKey="total"     name="Total"     stroke="#1D6FA4" strokeWidth={2} dot={{ fill: '#1D6FA4' }} />
            <Line type="monotone" dataKey="terminees" name="Terminées" stroke="#22C55E" strokeWidth={2} dot={{ fill: '#22C55E' }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Répartition par type */}
        <Card title="Répartition par type">
          {parType.length === 0 ? (
            <div style={{ color: '#6B84AA', textAlign: 'center', padding: '40px 0', fontSize: 13 }}>
              Aucune donnée
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={parType} cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                    dataKey="value" paddingAngle={3}>
                    {parType.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0D1F3C', border: '1px solid #1C3560', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {parType.map((t, i) => (
                  <div key={t.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length] }} />
                      <span style={{ color: '#6B84AA', fontSize: 12, textTransform: 'capitalize' }}>{t.name}</span>
                    </div>
                    <span style={{ color: '#E8EDF5', fontSize: 13, fontWeight: 700 }}>{t.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Répartition par statut */}
        <Card title="Répartition par statut">
          {parStatut.length === 0 ? (
            <div style={{ color: '#6B84AA', textAlign: 'center', padding: '40px 0', fontSize: 13 }}>
              Aucune donnée
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {parStatut.map(s => (
                <div key={s.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ color: '#6B84AA', fontSize: 12 }}>{s.name}</span>
                    <span style={{ color: s.color, fontSize: 12, fontWeight: 700 }}>
                      {s.value} ({total > 0 ? Math.round((s.value / total) * 100) : 0}%)
                    </span>
                  </div>
                  <div style={{ height: 6, background: '#0D1F3C', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      background: s.color,
                      width: `${total > 0 ? (s.value / total) * 100 : 0}%`,
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top 5 clients */}
        <Card title="Top 5 clients">
          {parClient.length === 0 ? (
            <div style={{ color: '#6B84AA', textAlign: 'center', padding: '40px 0', fontSize: 13 }}>
              Aucune donnée
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={parClient} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C3560" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#6B84AA', fontSize: 11 }} />
                <YAxis type="category" dataKey="client" tick={{ fill: '#6B84AA', fontSize: 10 }} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" name="interventions" fill="#1D6FA4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Durée moyenne */}
        <Card title="Performance">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Durée moyenne par intervention',
                value: dureeMoy ? `${Math.floor(dureeMoy/60)}h ${dureeMoy%60}min` : '—',
                color: '#A855F7' },
              { label: 'Interventions ce mois',
                value: parAnnee.filter(i => new Date(i.date_planifiee).getMonth() === new Date().getMonth()).length,
                color: '#1D6FA4' },
              { label: 'Taux de complétion',
                value: `${tauxCompletion}%`,
                color: tauxCompletion >= 80 ? '#22C55E' : tauxCompletion >= 50 ? '#F59E0B' : '#EF4444' },
              { label: 'Coût moyen par intervention',
                value: terminees > 0
                  ? `${Math.round(coutTotal / terminees / 1000)}k FCFA`
                  : '—',
                color: '#F0A500' },
            ].map((p, i) => (
              <div key={i} style={{
                background: '#0D1F3C', borderRadius: 8,
                padding: '12px 16px', display: 'flex',
                justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ color: '#6B84AA', fontSize: 13 }}>{p.label}</span>
                <span style={{ color: p.color, fontWeight: 800, fontSize: 16 }}>{p.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
