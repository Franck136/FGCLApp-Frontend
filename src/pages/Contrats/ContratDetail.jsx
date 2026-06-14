import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

function InfoRow({ label, value }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ color: '#6B84AA', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ color: '#E8EDF5', fontSize: 13 }}>{value || '—'}</div>
    </div>
  );
}

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
      padding: '4px 14px', borderRadius: 20,
      fontSize: 13, fontWeight: 600,
    }}>{statut}</span>
  );
}

export default function ContratDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [contrat, setContrat]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [pdfUrl, setPdfUrl]       = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showPdf, setShowPdf]     = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchContrat();
  }, [id]);

  const fetchContrat = async () => {
    try {
      const res = await api.get(`/contrats/${id}`);
      setContrat(res.data);
    } catch {
      toast.error('Contrat introuvable.');
      navigate('/contrats');
    } finally {
      setLoading(false);
    }
  };

  // Charger le PDF dans le viewer
  const handleViewPdf = async () => {
    if (pdfUrl) { setShowPdf(true); return; }
    setPdfLoading(true);
    try {
      const res = await api.get(`/contrats/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      setPdfUrl(url);
      setShowPdf(true);
    } catch {
      toast.error('Aucun PDF disponible.');
    } finally {
      setPdfLoading(false);
    }
  };

  // Télécharger le PDF
  const handleDownloadPdf = async () => {
    try {
      const res = await api.get(`/contrats/${id}/pdf`, { responseType: 'blob' });
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

  

  // Uploader / remplacer le PDF
  const handleUploadPdf = async () => {
    if (!uploadFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('pdf', uploadFile);
      await api.post(`/contrats/${id}/pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('PDF mis à jour avec succès.');
      setPdfUrl(null); // reset viewer
      setUploadFile(null);
      fetchContrat();
    } catch {
      toast.error('Erreur lors de l\'upload du PDF.');
    } finally {
      setUploading(false);
    }
  };

  // Renouveler le contrat
  const handleRenouveler = async () => {
    if (!window.confirm('Renouveler ce contrat ?')) return;
    try {
      await api.post(`/contrats/${id}/renouveler`);
      toast.success('Contrat renouvelé avec succès.');
      fetchContrat();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur.');
    }
  };

  const joursRestants = () => {
    if (!contrat?.date_fin) return null;
    return Math.ceil((new Date(contrat.date_fin) - new Date()) / (1000 * 60 * 60 * 24));
  };

  if (loading) return (
    <div style={{ color: '#6B84AA', textAlign: 'center', padding: '60px', fontSize: 14 }}>
      Chargement...
    </div>
  );

  if (!contrat) return null;

  const jours = joursRestants();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/contrats')} style={{
          background: '#101F3A', border: '1px solid #1C3560',
          borderRadius: 8, padding: '8px 14px',
          color: '#6B84AA', fontSize: 13, cursor: 'pointer',
        }}>← Retour</button>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 20, color: '#E8EDF5' }}>
            {contrat.reference}
          </div>
          <div style={{ color: '#6B84AA', fontSize: 13 }}>
            {contrat.client?.raison_sociale} · {contrat.type_contrat?.replace(/_/g, ' ')}
          </div>
        </div>

        <Badge statut={contrat.statut} />

        {/* Boutons actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          {contrat.pdf_path && (
            <>
              <button onClick={handleViewPdf} disabled={pdfLoading} style={{
                background: '#1D6FA422', border: '1px solid #1D6FA4',
                borderRadius: 8, padding: '8px 16px',
                color: '#2589C8', fontSize: 13, cursor: 'pointer',
              }}>
                {pdfLoading ? 'Chargement...' : '👁 Voir PDF'}
              </button>
              <button onClick={handleDownloadPdf} style={{
                background: '#22C55E22', border: '1px solid #22C55E',
                borderRadius: 8, padding: '8px 16px',
                color: '#22C55E', fontSize: 13, cursor: 'pointer',
              }}>📥 Télécharger</button>
            </>
          )}
          {contrat.statut === 'actif' && (
            <button onClick={handleRenouveler} style={{
              background: '#A855F722', border: '1px solid #A855F7',
              borderRadius: 8, padding: '8px 16px',
              color: '#A855F7', fontSize: 13, cursor: 'pointer',
            }}>↻ Renouveler</button>
          )}
        </div>
      </div>

      {/* Alerte échéance */}
      {jours !== null && jours >= 0 && jours <= 30 && (
        <div style={{
          background: jours <= 7 ? '#3A1A1A' : '#2A2A1A',
          border: `1px solid ${jours <= 7 ? '#EF4444' : '#F59E0B'}`,
          borderRadius: 10, padding: '14px 20px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 20 }}>{jours <= 7 ? '🚨' : '⚠️'}</span>
          <div>
            <div style={{ color: jours <= 7 ? '#EF4444' : '#F59E0B', fontWeight: 700, fontSize: 14 }}>
              Ce contrat expire dans {jours} jour(s)
            </div>
            <div style={{ color: '#6B84AA', fontSize: 12, marginTop: 2 }}>
              Date d'expiration : {contrat.date_fin}
              {contrat.renouvellement_auto && ' · Renouvellement automatique activé'}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Informations contrat */}
        <Card title="Informations du contrat">
          <InfoRow label="Référence"      value={contrat.reference} />
          <InfoRow label="Type"           value={contrat.type_contrat?.replace(/_/g, ' ')} />
          <InfoRow label="Date signature" value={contrat.date_signature} />
          <InfoRow label="Date début"     value={contrat.date_debut} />
          <InfoRow label="Date fin"       value={contrat.date_fin} />
          <InfoRow label="Durée"          value={contrat.duree_mois ? `${contrat.duree_mois} mois` : '—'} />
          <InfoRow label="Renouvellement auto" value={contrat.renouvellement_auto ? 'Oui' : 'Non'} />
          <InfoRow label="Version PDF"    value={contrat.pdf_version ? `v${contrat.pdf_version}` : '—'} />
        </Card>

        {/* Client + Commercial */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card title="Client">
            <InfoRow label="Raison sociale" value={contrat.client?.raison_sociale} />
            <InfoRow label="Ville"          value={contrat.client?.ville} />
            <InfoRow label="Téléphone"      value={contrat.client?.telephone} />
            <button
              onClick={() => navigate(`/clients/${contrat.client_id}`)}
              style={{
                background: '#1D6FA422', border: 'none', borderRadius: 6,
                padding: '6px 14px', color: '#2589C8', fontSize: 12,
                cursor: 'pointer', marginTop: 8,
              }}
            >Voir la fiche client →</button>
          </Card>

          <Card title="Commercial assigné">
            <InfoRow label="Nom"    value={contrat.commercial ? `${contrat.commercial.prenom} ${contrat.commercial.nom}` : '—'} />
          </Card>
        </div>
      </div>

      {/* Gestion PDF */}
      <Card title="Document PDF du contrat">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            {contrat.pdf_path ? (
              <div style={{ color: '#22C55E', fontSize: 13 }}>
                ✅ PDF disponible — Version {contrat.pdf_version}
              </div>
            ) : (
              <div style={{ color: '#6B84AA', fontSize: 13 }}>
                Aucun PDF joint à ce contrat
              </div>
            )}
          </div>

          {/* Upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="file" accept=".pdf"
              id="replace-pdf"
              style={{ display: 'none' }}
              onChange={e => setUploadFile(e.target.files[0])}
            />
            <button onClick={() => document.getElementById('replace-pdf').click()} style={{
              background: '#0D1F3C', border: '1px solid #1C3560',
              borderRadius: 8, padding: '8px 14px',
              color: '#6B84AA', fontSize: 12, cursor: 'pointer',
            }}>
              {contrat.pdf_path ? '🔄 Remplacer le PDF' : '📤 Ajouter un PDF'}
            </button>
            {uploadFile && (
              <>
                <span style={{ color: '#F0A500', fontSize: 12 }}>{uploadFile.name}</span>
                <button onClick={handleUploadPdf} disabled={uploading} style={{
                  background: 'linear-gradient(135deg, #1D6FA4, #2589C8)',
                  border: 'none', borderRadius: 8, padding: '8px 14px',
                  color: '#fff', fontSize: 12, cursor: 'pointer',
                }}>
                  {uploading ? 'Upload...' : 'Confirmer'}
                </button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Viewer PDF intégré */}
      {showPdf && pdfUrl && (
        <Card title="Aperçu du contrat PDF">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button onClick={() => setShowPdf(false)} style={{
              background: '#3A1A1A', border: 'none', borderRadius: 6,
              padding: '6px 14px', color: '#EF4444', fontSize: 12, cursor: 'pointer',
            }}>✕ Fermer l'aperçu</button>
          </div>
          <iframe
            src={pdfUrl}
            width="100%"
            height="600px"
            style={{ border: 'none', borderRadius: 8, background: '#fff' }}
            title="Contrat PDF"
          />
        </Card>
      )}

      {/* Interventions liées */}
      {contrat.interventions?.length > 0 && (
        <Card title={`Interventions liées (${contrat.interventions.length})`}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Référence', 'Type', 'Date planifiée', 'Statut'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '8px 12px',
                    color: '#6B84AA', fontSize: 11, fontWeight: 600,
                    textTransform: 'uppercase', borderBottom: '1px solid #1C3560',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contrat.interventions.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid #1C356022' }}>
                  <td style={{ padding: '10px 12px', color: '#2589C8', fontSize: 13, fontWeight: 600 }}>
                    {inv.reference}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#6B84AA', fontSize: 13 }}>
                    {inv.type_intervention}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#6B84AA', fontSize: 13 }}>
                    {new Date(inv.date_planifiee).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      background: inv.statut === 'terminee' ? '#1A3A2A' : inv.statut === 'en_cours' ? '#1D3F7A' : '#2A2A1A',
                      color: inv.statut === 'terminee' ? '#22C55E' : inv.statut === 'en_cours' ? '#60A5FA' : '#F59E0B',
                      padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    }}>{inv.statut}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

    </div>
  );
}
