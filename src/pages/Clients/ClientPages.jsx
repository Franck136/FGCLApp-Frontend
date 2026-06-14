// ════════════════════════════════
// MesContratsClient.jsx
// ════════════════════════════════
import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

//Regler la date
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
};

function Badge({ statut }) {
  const map = {
    'actif':    { bg: '#1A3A2A', color: '#22C55E' },
    'suspendu': { bg: '#2A2A1A', color: '#F59E0B' },
    'expire':   { bg: '#3A1A1A', color: '#EF4444' },
    'resilie':  { bg: '#2A1A2A', color: '#A855F7' },
  };
  const s = map[statut] || { bg: '#222', color: '#aaa' };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '2px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600,
    }}>{statut}</span>
  );
}

export function MesContratsClient() {
  const [contrats, setContrats]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [pdfUrl, setPdfUrl]       = useState(null);
  const [showPdf, setShowPdf]     = useState(false);
  const [pdfContrat, setPdfContrat] = useState(null);

  useEffect(() => { fetchContrats(); }, []);

  const fetchContrats = async () => {
    try {
      const res = await api.get('/client/contrats');
      setContrats(res.data ?? []);
    } catch {
      toast.error('Erreur lors du chargement des contrats.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPdf = async (contrat) => {
    setPdfContrat(contrat);
    try {
      const res = await api.get(`/client/contrats/${contrat.id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      setPdfUrl(url);
      setShowPdf(true);
    } catch {
      toast.error('Aucun PDF disponible pour ce contrat.');
    }
  };

  const handleDownload = async (contrat) => {
    try {
      const res = await api.get(`/client/contrats/${contrat.id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a   = document.createElement('a');
      a.href    = url;
      a.download = `Contrat-${contrat.reference}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Aucun PDF disponible.');
    }
  };

  const joursRestants = (dateFin) =>
    Math.ceil((new Date(dateFin) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div>
        <div style={{ fontWeight: 800, fontSize: 20, color: '#E8EDF5' }}>Mes contrats</div>
        <div style={{ color: '#6B84AA', fontSize: 13 }}>{contrats.length} contrat(s)</div>
      </div>

      {loading ? (
        <div style={{ color: '#6B84AA', textAlign: 'center', padding: '40px' }}>Chargement...</div>
      ) : contrats.length === 0 ? (
        <div style={{ background: '#101F3A', border: '1px solid #1C3560', borderRadius: 12, padding: '60px', textAlign: 'center', color: '#6B84AA' }}>
          Aucun contrat enregistré
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {contrats.map(c => {
            const jours = joursRestants(c.date_fin);
            const expireBientot = c.statut === 'actif' && jours >= 0 && jours <= 30;
            return (
              <div key={c.id} style={{
                background: '#101F3A', border: `1px solid ${expireBientot ? (jours <= 7 ? '#EF4444' : '#F59E0B') : '#1C3560'}`,
                borderRadius: 12, padding: '20px 24px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{ color: '#2589C8', fontWeight: 700, fontSize: 16 }}>{c.reference}</div>
                    <div style={{ color: '#6B84AA', fontSize: 13, marginTop: 3 }}>
                      {c.type_contrat?.replace(/_/g, ' ')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {expireBientot && (
                      <span style={{
                        color: jours <= 7 ? '#EF4444' : '#F59E0B',
                        fontWeight: 700, fontSize: 14,
                      }}>J-{jours}</span>
                    )}
                    <Badge statut={c.statut} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                  {[
                    { label: 'Date signature', value: formatDate(c.date_signature) },
                    { label: 'Date début',     value: formatDate(c.date_debut) },
                    { label: 'Date fin',        value: formatDate(c.date_fin) },
                    { label: 'Durée',           value: c.duree_mois ? `${c.duree_mois} mois` : '—' },
                    { label: 'Renouvellement',  value: c.renouvellement_auto ? 'Automatique' : 'Manuel' },
                    { label: 'Version PDF',     value: c.pdf_path ? `v${c.pdf_version}` : 'Aucun' },
                  ].map(info => (
                    <div key={info.label} style={{ background: '#0D1F3C', borderRadius: 8, padding: '10px 14px' }}>
                      <div style={{ color: '#6B84AA', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>
                        {info.label}
                      </div>
                      <div style={{ color: '#E8EDF5', fontSize: 13 }}>{info.value || '—'}</div>
                    </div>
                  ))}
                </div>

                {c.pdf_path && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => handleViewPdf(c)} style={{
                      background: '#1D6FA422', border: '1px solid #1D6FA4',
                      borderRadius: 8, padding: '8px 16px',
                      color: '#2589C8', fontSize: 13, cursor: 'pointer',
                    }}>👁 Voir le contrat PDF</button>
                    <button onClick={() => handleDownload(c)} style={{
                      background: '#22C55E22', border: '1px solid #22C55E',
                      borderRadius: 8, padding: '8px 16px',
                      color: '#22C55E', fontSize: 13, cursor: 'pointer',
                    }}>📥 Télécharger</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Viewer PDF */}
      {showPdf && pdfUrl && (
        <div style={{
          background: '#101F3A', border: '1px solid #1C3560',
          borderRadius: 12, padding: '20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontWeight: 700, color: '#E8EDF5' }}>
              {pdfContrat?.reference}
            </div>
            <button onClick={() => { setShowPdf(false); setPdfUrl(null); }} style={{
              background: '#3A1A1A', border: 'none', borderRadius: 6,
              padding: '6px 14px', color: '#EF4444', fontSize: 12, cursor: 'pointer',
            }}>✕ Fermer</button>
          </div>
          <iframe
            src={pdfUrl} width="100%" height="600px"
            style={{ border: 'none', borderRadius: 8, background: '#fff' }}
            title="Contrat PDF"
          />
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════
// MesInterventionsClient.jsx
// ════════════════════════════════
export function MesInterventionsClient() {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [statut, setStatut]     = useState('');
  const [pagination, setPagination] = useState({});

  useEffect(() => { fetchInterventions(); }, [statut]);

  const fetchInterventions = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page };
      if (statut) params.statut = statut;
      const res = await api.get('/client/interventions', { params });
      setInterventions(res.data.data ?? []);
      setPagination(res.data);
    } catch {
      toast.error('Erreur chargement.');
    } finally {
      setLoading(false);
    }
  };

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
      <span style={{ background: s.bg, color: s.color, padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
        {statut?.replace('_', ' ')}
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20, color: '#E8EDF5' }}>Mes interventions</div>
          <div style={{ color: '#6B84AA', fontSize: 13 }}>{pagination.total ?? 0} intervention(s)</div>
        </div>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8 }}>
        {['', 'planifiee', 'en_cours', 'terminee', 'annulee'].map(s => (
          <button key={s} onClick={() => setStatut(s)} style={{
            background: statut === s ? '#1D6FA4' : '#101F3A',
            border: `1px solid ${statut === s ? '#2589C8' : '#1C3560'}`,
            borderRadius: 8, padding: '7px 14px',
            color: statut === s ? '#fff' : '#6B84AA',
            fontSize: 12, cursor: 'pointer',
          }}>
            {s === '' ? 'Toutes' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: '#6B84AA', textAlign: 'center', padding: '40px' }}>Chargement...</div>
      ) : interventions.length === 0 ? (
        <div style={{ background: '#101F3A', border: '1px solid #1C3560', borderRadius: 12, padding: '60px', textAlign: 'center', color: '#6B84AA' }}>
          Aucune intervention trouvée
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {interventions.map(inv => (
            <div key={inv.id} style={{
              background: '#101F3A', border: '1px solid #1C3560',
              borderRadius: 12, padding: '18px 22px',
              borderLeft: `4px solid ${inv.statut === 'en_cours' ? '#60A5FA' : inv.statut === 'terminee' ? '#F59E0B' : '#22C55E'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ color: '#2589C8', fontWeight: 700, fontSize: 14 }}>{inv.reference}</span>
                    <Badge statut={inv.statut} />
                    <Badge statut={inv.priorite} />
                  </div>
                  <div style={{ color: '#6B84AA', fontSize: 13 }}>
                    {inv.type_intervention} · Planifiée le {new Date(inv.date_planifiee).toLocaleDateString('fr-FR')}
                  </div>
                  {inv.techniciens?.length > 0 && (
                    <div style={{ color: '#6B84AA', fontSize: 12, marginTop: 4 }}>
                      👷 {inv.techniciens.map(t => `${t.prenom} ${t.nom}`).join(', ')}
                    </div>
                  )}
                  {inv.duree_minutes && (
                    <div style={{ color: '#6B84AA', fontSize: 12, marginTop: 2 }}>
                      ⏱ Durée : {Math.floor(inv.duree_minutes / 60)}h {inv.duree_minutes % 60}min
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════
// MonParcInformatique.jsx
// ════════════════════════════════
export function MonParcInformatique() {
  const [equipements, setEquipements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [etat, setEtat]       = useState('');
  const [type, setType]       = useState('');

  useEffect(() => { fetchEquipements(); }, [etat, type]);

  const fetchEquipements = async () => {
    setLoading(true);
    try {
      const params = {};
      if (etat) params.etat            = etat;
      if (type) params.type_equipement = type;
      const res = await api.get('/client/equipements', { params });
      setEquipements(res.data ?? []);
    } catch {
      toast.error('Erreur chargement.');
    } finally {
      setLoading(false);
    }
  };

  function BadgeEtat({ etat }) {
    const map = {
      'bon':          { bg: '#1A3A2A', color: '#22C55E' },
      'degrade':      { bg: '#2A2A1A', color: '#F59E0B' },
      'hors_service': { bg: '#3A1A1A', color: '#EF4444' },
    };
    const s = map[etat] || { bg: '#222', color: '#aaa' };
    return (
      <span style={{ background: s.bg, color: s.color, padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
        {etat?.replace('_', ' ')}
      </span>
    );
  }

  const icons = { 'PC': '💻', 'Serveur': '🖥', 'Imprimante': '🖨', 'Routeur': '📡', 'Switch': '🔀', 'NAS': '💾', 'Autre': '⚙' };
  const bons        = equipements.filter(e => e.etat === 'bon').length;
  const degrades    = equipements.filter(e => e.etat === 'degrade').length;
  const horsService = equipements.filter(e => e.etat === 'hors_service').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ fontWeight: 800, fontSize: 20, color: '#E8EDF5' }}>Mon parc informatique</div>
        <div style={{ color: '#6B84AA', fontSize: 13 }}>{equipements.length} équipement(s)</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'En bon état',  value: bons,        color: '#22C55E', bg: '#1A3A2A' },
          { label: 'Dégradés',     value: degrades,    color: '#F59E0B', bg: '#2A2A1A' },
          { label: 'Hors service', value: horsService, color: '#EF4444', bg: '#3A1A1A' },
        ].map((s, i) => (
          <div key={i} style={{
            background: s.bg, border: `1px solid ${s.color}33`,
            borderRadius: 10, padding: '14px 20px',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ color: s.color, fontSize: 13, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 12 }}>
        <select value={etat} onChange={e => setEtat(e.target.value)} style={{
          background: '#101F3A', border: '1px solid #1C3560',
          borderRadius: 8, padding: '9px 14px', color: '#E8EDF5',
          fontSize: 13, outline: 'none',
        }}>
          <option value="">Tous les états</option>
          <option value="bon">Bon</option>
          <option value="degrade">Dégradé</option>
          <option value="hors_service">Hors service</option>
        </select>
        <select value={type} onChange={e => setType(e.target.value)} style={{
          background: '#101F3A', border: '1px solid #1C3560',
          borderRadius: 8, padding: '9px 14px', color: '#E8EDF5',
          fontSize: 13, outline: 'none',
        }}>
          <option value="">Tous les types</option>
          {['PC', 'Serveur', 'Imprimante', 'Routeur', 'Switch', 'NAS', 'Autre'].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Grille équipements */}
      {loading ? (
        <div style={{ color: '#6B84AA', textAlign: 'center', padding: '40px' }}>Chargement...</div>
      ) : equipements.length === 0 ? (
        <div style={{ background: '#101F3A', border: '1px solid #1C3560', borderRadius: 12, padding: '60px', textAlign: 'center', color: '#6B84AA' }}>
          Aucun équipement trouvé
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {equipements.map(e => (
            <div key={e.id} style={{
              background: '#101F3A', border: '1px solid #1C3560',
              borderRadius: 12, padding: '18px',
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={ev => ev.currentTarget.style.borderColor = '#1D6FA4'}
              onMouseLeave={ev => ev.currentTarget.style.borderColor = '#1C3560'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: '#1D6FA422', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 20,
                }}>
                  {icons[e.type_equipement] || '⚙'}
                </div>
                <div>
                  <div style={{ color: '#E8EDF5', fontWeight: 700, fontSize: 14 }}>{e.type_equipement}</div>
                  <div style={{ color: '#6B84AA', fontSize: 12 }}>{e.marque} {e.modele}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                {e.numero_serie && (
                  <div style={{ color: '#6B84AA', fontSize: 12 }}>
                    N° : <span style={{ color: '#E8EDF5', fontFamily: 'monospace' }}>{e.numero_serie}</span>
                  </div>
                )}
                {e.localisation && (
                  <div style={{ color: '#6B84AA', fontSize: 12 }}>
                    📍 {e.localisation}
                  </div>
                )}
                {e.derniere_maintenance && (
                  <div style={{ color: '#6B84AA', fontSize: 12 }}>
                    🔧 Maint. : {new Date(e.derniere_maintenance).toLocaleDateString('fr-FR')}
                  </div>
                )}
              </div>
              <BadgeEtat etat={e.etat} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
