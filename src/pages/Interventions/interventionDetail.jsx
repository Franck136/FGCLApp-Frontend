import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

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
      padding: '4px 14px', borderRadius: 20,
      fontSize: 13, fontWeight: 600,
    }}>{statut?.replace('_', ' ')}</span>
  );
}

export default function InterventionDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdminOrCommercial = ['admin', 'commercial'].includes(user?.role);

  const [intervention, setIntervention] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [pdfUrl, setPdfUrl]             = useState(null);
  const [showPdf, setShowPdf]           = useState(false);
  const [pdfLoading, setPdfLoading]     = useState(false);
  const [uploadFile, setUploadFile]     = useState(null);
  const [uploading, setUploading]       = useState(false);

  // Mise à jour statut/durée/coût
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving]     = useState(false);

  useEffect(() => { fetchIntervention(); }, [id]);

  const fetchIntervention = async () => {
    try {
      const res = await api.get(`/interventions/${id}`);
      setIntervention(res.data);
      setEditForm({
        statut:            res.data.statut            || '',
        date_debut_reelle: res.data.date_debut_reelle
          ? new Date(res.data.date_debut_reelle).toISOString().slice(0, 16) : '',
        date_fin_reelle:   res.data.date_fin_reelle
          ? new Date(res.data.date_fin_reelle).toISOString().slice(0, 16) : '',
        duree_minutes:     res.data.duree_minutes     || '',
        cout:              res.data.cout              || '',
      });
    } catch {
      toast.error('Intervention introuvable.');
      navigate('/interventions');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/interventions/${id}`, editForm);
      toast.success('Intervention mise à jour.');
      fetchIntervention();
    } catch {
      toast.error('Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  const handleViewPdf = async () => {
    if (pdfUrl) { setShowPdf(true); return; }
    setPdfLoading(true);
    try {
      const res = await api.get(`/interventions/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      setPdfUrl(url);
      setShowPdf(true);
    } catch {
      toast.error('Aucun rapport disponible.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const res = await api.get(`/interventions/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a   = document.createElement('a');
      a.href    = url;
      a.download = `Rapport-${intervention.reference}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Aucun rapport disponible.');
    }
  };

  const handleUploadPdf = async () => {
    if (!uploadFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('pdf', uploadFile);
      await api.post(`/interventions/${id}/pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Rapport PDF uploadé avec succès.');
      setPdfUrl(null);
      setUploadFile(null);
      fetchIntervention();
    } catch {
      toast.error('Erreur lors de l\'upload.');
    } finally {
      setUploading(false);
    }
  };

  const inputStyle = {
    width: '100%', background: '#0D1F3C',
    border: '1px solid #1C3560', borderRadius: 8,
    padding: '9px 12px', color: '#E8EDF5',
    fontSize: 13, outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle = {
    display: 'block', color: '#6B84AA', fontSize: 11,
    fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: 5,
  };

  if (loading) return (
    <div style={{ color: '#6B84AA', textAlign: 'center', padding: '60px' }}>Chargement...</div>
  );

  if (!intervention) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/interventions')} style={{
          background: '#101F3A', border: '1px solid #1C3560',
          borderRadius: 8, padding: '8px 14px',
          color: '#6B84AA', fontSize: 13, cursor: 'pointer',
        }}>← Retour</button>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 20, color: '#E8EDF5' }}>
            {intervention.reference}
          </div>
          <div style={{ color: '#6B84AA', fontSize: 13 }}>
            {intervention.client?.raison_sociale} · {intervention.type_intervention}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Badge statut={intervention.statut} />
          <Badge statut={intervention.priorite} />
        </div>

        {/* Actions PDF */}
        <div style={{ display: 'flex', gap: 8 }}>
          {intervention.pdf_rapport_path && (
            <>
              <button onClick={handleViewPdf} disabled={pdfLoading} style={{
                background: '#1D6FA422', border: '1px solid #1D6FA4',
                borderRadius: 8, padding: '8px 16px',
                color: '#2589C8', fontSize: 13, cursor: 'pointer',
              }}>
                {pdfLoading ? 'Chargement...' : '👁 Voir rapport'}
              </button>
              <button onClick={handleDownloadPdf} style={{
                background: '#22C55E22', border: '1px solid #22C55E',
                borderRadius: 8, padding: '8px 16px',
                color: '#22C55E', fontSize: 13, cursor: 'pointer',
              }}>📥 Télécharger</button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Informations générales */}
        <Card title="Informations générales">
          <InfoRow label="Référence"       value={intervention.reference} />
          <InfoRow label="Type"            value={intervention.type_intervention} />
          <InfoRow label="Date planifiée"  value={
            intervention.date_planifiee
              ? new Date(intervention.date_planifiee).toLocaleString('fr-FR')
              : '—'
          } />
          <InfoRow label="Début réel"      value={
            intervention.date_debut_reelle
              ? new Date(intervention.date_debut_reelle).toLocaleString('fr-FR')
              : '—'
          } />
          <InfoRow label="Fin réelle"      value={
            intervention.date_fin_reelle
              ? new Date(intervention.date_fin_reelle).toLocaleString('fr-FR')
              : '—'
          } />
          <InfoRow label="Durée effective" value={
            intervention.duree_minutes
              ? `${Math.floor(intervention.duree_minutes / 60)}h ${intervention.duree_minutes % 60}min`
              : '—'
          } />
          <InfoRow label="Coût"            value={
            intervention.cout
              ? `${Number(intervention.cout).toLocaleString()} FCFA`
              : '—'
          } />
          <InfoRow label="Créée par"       value={
            intervention.createur
              ? `${intervention.createur.prenom} ${intervention.createur.nom}`
              : '—'
          } />
        </Card>

        {/* Client + Contrat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card title="Client">
            <InfoRow label="Raison sociale" value={intervention.client?.raison_sociale} />
            <InfoRow label="Ville"          value={intervention.client?.ville} />
            <InfoRow label="Téléphone"      value={intervention.client?.telephone} />
            <InfoRow label="Contact"        value={intervention.client?.nom_responsable} />
            <button
              onClick={() => navigate(`/clients/${intervention.client_id}`)}
              style={{
                background: '#1D6FA422', border: 'none', borderRadius: 6,
                padding: '6px 14px', color: '#2589C8', fontSize: 12,
                cursor: 'pointer', marginTop: 8,
              }}>Voir la fiche client →</button>
          </Card>

          {intervention.contrat && (
            <Card title="Contrat associé">
              <InfoRow label="Référence" value={intervention.contrat.reference} />
              <InfoRow label="Type"      value={intervention.contrat.type_contrat?.replace(/_/g, ' ')} />
              <button
                onClick={() => navigate(`/contrats/${intervention.contrat_id}`)}
                style={{
                  background: '#F0A50022', border: 'none', borderRadius: 6,
                  padding: '6px 14px', color: '#F0A500', fontSize: 12,
                  cursor: 'pointer', marginTop: 8,
                }}>Voir le contrat →</button>
            </Card>
          )}
        </div>
      </div>

      {/* Techniciens */}
      {intervention.techniciens?.length > 0 && (
        <Card title={`Techniciens assignés (${intervention.techniciens.length})`}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {intervention.techniciens.map(t => (
              <div key={t.id} style={{
                background: '#0D1F3C', borderRadius: 10,
                padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
                border: '1px solid #1C3560',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1D6FA4, #2589C8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 14, color: '#fff',
                }}>
                  {t.prenom?.[0]}{t.nom?.[0]}
                </div>
                <div>
                  <div style={{ color: '#E8EDF5', fontSize: 13, fontWeight: 600 }}>
                    {t.prenom} {t.nom}
                  </div>
                  <div style={{ color: '#6B84AA', fontSize: 12 }}>{t.telephone || t.email}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Mise à jour statut / durée / coût */}
      <Card title="Mettre à jour l'intervention">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Statut</label>
            <select style={inputStyle} value={editForm.statut}
              onChange={e => setEditForm(f => ({ ...f, statut: e.target.value }))}>
              <option value="planifiee">Planifiée</option>
              <option value="en_cours">En cours</option>
              <option value="terminee">Terminée</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Durée (minutes)</label>
            <input type="number" style={inputStyle} value={editForm.duree_minutes}
              onChange={e => setEditForm(f => ({ ...f, duree_minutes: e.target.value }))}
              placeholder="Ex: 90" />
          </div>
          <div>
            <label style={labelStyle}>Coût (FCFA)</label>
            <input type="number" style={inputStyle} value={editForm.cout}
              onChange={e => setEditForm(f => ({ ...f, cout: e.target.value }))}
              placeholder="Ex: 150000" />
          </div>
          <div>
            <label style={labelStyle}>Début réel</label>
            <input type="datetime-local" style={inputStyle} value={editForm.date_debut_reelle}
              onChange={e => setEditForm(f => ({ ...f, date_debut_reelle: e.target.value }))} />
          </div>
          <div>
            <label style={labelStyle}>Fin réelle</label>
            <input type="datetime-local" style={inputStyle} value={editForm.date_fin_reelle}
              onChange={e => setEditForm(f => ({ ...f, date_fin_reelle: e.target.value }))} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleSave} disabled={saving} style={{
            background: 'linear-gradient(135deg, #1D6FA4, #2589C8)',
            border: 'none', borderRadius: 8, padding: '10px 28px',
            color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'Enregistrement...' : 'Sauvegarder les modifications'}
          </button>
        </div>
      </Card>

      {/* Upload rapport PDF */}
      <Card title="Rapport d'intervention PDF">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            {intervention.pdf_rapport_path ? (
              <div style={{ color: '#22C55E', fontSize: 13 }}>
                ✅ Rapport PDF disponible
              </div>
            ) : (
              <div style={{ color: '#6B84AA', fontSize: 13 }}>
                Aucun rapport PDF joint à cette intervention
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="file" accept=".pdf" id="upload-rapport"
              style={{ display: 'none' }}
              onChange={e => setUploadFile(e.target.files[0])} />
            <button onClick={() => document.getElementById('upload-rapport').click()} style={{
              background: '#0D1F3C', border: '1px solid #1C3560',
              borderRadius: 8, padding: '8px 14px',
              color: '#6B84AA', fontSize: 12, cursor: 'pointer',
            }}>
              {intervention.pdf_rapport_path ? '🔄 Remplacer le rapport' : '📤 Ajouter un rapport'}
            </button>
            {uploadFile && (
              <>
                <span style={{ color: '#F0A500', fontSize: 12 }}>{uploadFile.name}</span>
                <button onClick={handleUploadPdf} disabled={uploading} style={{
                  background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                  border: 'none', borderRadius: 8, padding: '8px 16px',
                  color: '#fff', fontSize: 12, fontWeight: 600,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                }}>
                  {uploading ? 'Upload...' : 'Confirmer l\'upload'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Zone drag & drop */}
        <div style={{
          border: '2px dashed #1C3560', borderRadius: 8,
          padding: '20px', textAlign: 'center', cursor: 'pointer',
        }}
          onClick={() => document.getElementById('upload-rapport').click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); setUploadFile(e.dataTransfer.files[0]); }}
        >
          {uploadFile ? (
            <div style={{ color: '#22C55E', fontSize: 13 }}>
              📄 {uploadFile.name}
              <button onClick={e => { e.stopPropagation(); setUploadFile(null); }} style={{
                marginLeft: 8, background: 'none', border: 'none',
                color: '#EF4444', cursor: 'pointer',
              }}>✕</button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
              <div style={{ color: '#6B84AA', fontSize: 13 }}>
                Glisser-déposer le rapport PDF ici ou cliquer pour sélectionner
              </div>
              <div style={{ color: '#3A5070', fontSize: 11, marginTop: 4 }}>
                PDF uniquement · Max 10 MB
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Viewer PDF */}
      {showPdf && pdfUrl && (
        <Card title="Aperçu du rapport PDF">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button onClick={() => setShowPdf(false)} style={{
              background: '#3A1A1A', border: 'none', borderRadius: 6,
              padding: '6px 14px', color: '#EF4444', fontSize: 12, cursor: 'pointer',
            }}>✕ Fermer l'aperçu</button>
          </div>
          <iframe
            src={pdfUrl}
            width="100%" height="600px"
            style={{ border: 'none', borderRadius: 8, background: '#fff' }}
            title="Rapport PDF"
          />
        </Card>
      )}

    </div>
  );
}
