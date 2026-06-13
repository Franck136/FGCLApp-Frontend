import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

function RapportCard({ titre, description, icon, color, onGenerer, loading, extra }) {
  return (
    <div style={{
      background: '#101F3A',
      border: `1px solid #1C3560`,
      borderRadius: 14,
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = color}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#1C3560'}
    >
      {/* Header carte */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 12, flexShrink: 0,
          background: color + '22',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26,
        }}>{icon}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#E8EDF5' }}>{titre}</div>
          <div style={{ color: '#6B84AA', fontSize: 13, marginTop: 4 }}>{description}</div>
        </div>
      </div>

      {/* Champs supplémentaires */}
      {extra}

      {/* Bouton */}
      <button
        onClick={onGenerer}
        disabled={loading}
        style={{
          background: loading ? '#1C3560' : `linear-gradient(135deg, ${color}CC, ${color})`,
          border: 'none', borderRadius: 8, padding: '10px 20px',
          color: '#fff', fontSize: 13, fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        {loading ? (
          <>
            <svg style={{ animation: 'spin 1s linear infinite', width: 14, height: 14 }} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Génération en cours...
          </>
        ) : '📥 Générer le rapport PDF'}
      </button>
    </div>
  );
}

export default function Rapports() {
  const [clients, setClients]         = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [loadings, setLoadings]       = useState({});

  // Sélections
  const [clientId, setClientId]           = useState('');
  const [interventionId, setInterventionId] = useState('');
  const [technicienId, setTechnicienId]   = useState('');
  const [dateDebut, setDateDebut]         = useState('');
  const [dateFin, setDateFin]             = useState('');
  const [statutContrat, setStatutContrat] = useState('');

  useEffect(() => {
    fetchClients();
    fetchTechniciens();
    fetchInterventions();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data.data ?? []);
    } catch {}
  };

  const fetchTechniciens = async () => {
    try {
      const res = await api.get('/techniciens');
      setTechniciens(res.data.data ?? []);
    } catch {}
  };

  const fetchInterventions = async () => {
    try {
      const res = await api.get('/interventions');
      setInterventions(res.data.data ?? []);
    } catch {}
  };

  const setLoading = (key, val) => setLoadings(l => ({ ...l, [key]: val }));

  // Télécharger un rapport PDF depuis l'API
  const downloadRapport = async (key, url, filename, params = {}) => {
    setLoading(key, true);
    try {
      const res = await api.get(url, { responseType: 'blob', params });
      const blob = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a    = document.createElement('a');
      a.href     = blob;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(blob);
      toast.success('Rapport généré avec succès !');
    } catch {
      toast.error('Erreur lors de la génération du rapport.');
    } finally {
      setLoading(key, false);
    }
  };

  const selectStyle = {
    width: '100%', background: '#0D1F3C',
    border: '1px solid #1C3560', borderRadius: 8,
    padding: '9px 12px', color: '#E8EDF5',
    fontSize: 13, outline: 'none', boxSizing: 'border-box',
  };
  const inputStyle = { ...selectStyle };
  const labelStyle = {
    display: 'block', color: '#6B84AA', fontSize: 11,
    fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: 5,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div>
        <div style={{ fontWeight: 800, fontSize: 20, color: '#E8EDF5' }}>Rapports PDF</div>
        <div style={{ color: '#6B84AA', fontSize: 13 }}>
          Générez et téléchargez les rapports de votre activité
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Grille de rapports */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* 1. Rapport Client */}
        <RapportCard
          titre="Rapport Client"
          description="Synthèse complète d'un client : contrats, interventions, équipements."
          icon="🏢"
          color="#1D6FA4"
          loading={loadings['client']}
          onGenerer={() => {
            if (!clientId) { toast.error('Sélectionnez un client.'); return; }
            const client = clients.find(c => c.id == clientId);
            downloadRapport('client', `/rapports/client/${clientId}`,
              `Rapport-Client-${client?.raison_sociale ?? clientId}.pdf`);
          }}
          extra={
            <div>
              <label style={labelStyle}>Sélectionner un client *</label>
              <select style={selectStyle} value={clientId} onChange={e => setClientId(e.target.value)}>
                <option value="">Choisir un client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.raison_sociale}</option>)}
              </select>
            </div>
          }
        />

        {/* 2. Rapport Intervention */}
        <RapportCard
          titre="Rapport d'Intervention"
          description="Fiche détaillée d'une intervention : techniciens, durée, coût, statut."
          icon="🔧"
          color="#F59E0B"
          loading={loadings['intervention']}
          onGenerer={() => {
            if (!interventionId) { toast.error('Sélectionnez une intervention.'); return; }
            downloadRapport('intervention', `/rapports/intervention/${interventionId}`,
              `Rapport-Intervention-${interventionId}.pdf`);
          }}
          extra={
            <div>
              <label style={labelStyle}>Sélectionner une intervention *</label>
              <select style={selectStyle} value={interventionId} onChange={e => setInterventionId(e.target.value)}>
                <option value="">Choisir une intervention...</option>
                {interventions.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.reference} — {i.client?.raison_sociale ?? ''}
                  </option>
                ))}
              </select>
            </div>
          }
        />

        {/* 3. Rapport Technicien */}
        <RapportCard
          titre="Rapport Technicien"
          description="Activités d'un technicien sur une période : interventions réalisées, durées, coûts."
          icon="👷"
          color="#22C55E"
          loading={loadings['technicien']}
          onGenerer={() => {
            if (!technicienId) { toast.error('Sélectionnez un technicien.'); return; }
            if (!dateDebut || !dateFin) { toast.error('Sélectionnez une période.'); return; }
            const tech = techniciens.find(t => t.id == technicienId);
            downloadRapport(
              'technicien',
              `/rapports/technicien/${technicienId}`,
              `Rapport-Technicien-${tech?.user?.nom ?? technicienId}.pdf`,
              { debut: dateDebut, fin: dateFin }
            );
          }}
          extra={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={labelStyle}>Sélectionner un technicien *</label>
                <select style={selectStyle} value={technicienId} onChange={e => setTechnicienId(e.target.value)}>
                  <option value="">Choisir un technicien...</option>
                  {techniciens.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.user?.prenom} {t.user?.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Date début *</label>
                  <input type="date" style={inputStyle} value={dateDebut} onChange={e => setDateDebut(e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Date fin *</label>
                  <input type="date" style={inputStyle} value={dateFin} onChange={e => setDateFin(e.target.value)} />
                </div>
              </div>
            </div>
          }
        />

        {/* 4. Rapport Global Contrats */}
        <RapportCard
          titre="Rapport Global Contrats"
          description="Liste complète des contrats avec statuts, échéances et clients associés."
          icon="📋"
          color="#A855F7"
          loading={loadings['contrats']}
          onGenerer={() => {
            downloadRapport(
              'contrats',
              '/rapports/contrats',
              `Rapport-Contrats-${new Date().toISOString().slice(0, 10)}.pdf`,
              statutContrat ? { statut: statutContrat } : {}
            );
          }}
          extra={
            <div>
              <label style={labelStyle}>Filtrer par statut (optionnel)</label>
              <select style={selectStyle} value={statutContrat} onChange={e => setStatutContrat(e.target.value)}>
                <option value="">Tous les statuts</option>
                <option value="actif">Actifs</option>
                <option value="expire">Expirés</option>
                <option value="suspendu">Suspendus</option>
                <option value="resilie">Résiliés</option>
              </select>
            </div>
          }
        />
      </div>

      {/* Info */}
      <div style={{
        background: '#0D1F3C', border: '1px solid #1C3560',
        borderRadius: 10, padding: '14px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 18 }}>ℹ️</span>
        <div style={{ color: '#6B84AA', fontSize: 13 }}>
          Les rapports sont générés en temps réel depuis les données de la plateforme et téléchargés au format PDF.
          Assurez-vous que les vues Blade Laravel sont configurées dans <code style={{ color: '#2589C8' }}>resources/views/rapports/</code>.
        </div>
      </div>
    </div>
  );
}
