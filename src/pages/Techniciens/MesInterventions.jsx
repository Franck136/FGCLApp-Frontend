import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

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

// ── Modal mise à jour intervention ──
function UpdateModal({ intervention, onClose, onSaved }) {
  const [loading, setLoading]   = useState(false);
  const [pdf, setPdf]           = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm]         = useState({
    statut:           intervention.statut           || 'planifiee',
    date_debut_reelle: intervention.date_debut_reelle
      ? new Date(intervention.date_debut_reelle).toISOString().slice(0, 16) : '',
    date_fin_reelle:  intervention.date_fin_reelle
      ? new Date(intervention.date_fin_reelle).toISOString().slice(0, 16) : '',
    duree_minutes:    intervention.duree_minutes    || '',
    cout:             intervention.cout             || '',
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.put(`/interventions/${intervention.id}`, form);
      toast.success('Intervention mise à jour.');
      onSaved();
    } catch {
      toast.error('Erreur lors de la mise à jour.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadRapport = async () => {
    if (!pdf) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('pdf', pdf);
      await api.post(`/interventions/${intervention.id}/pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Rapport PDF uploadé.');
      setPdf(null);
      onSaved();
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

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#00000080',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20,
    }}>
      <div style={{
        background: '#101F3A', border: '1px solid #1C3560',
        borderRadius: 14, width: '100%', maxWidth: 560,
        maxHeight: '90vh', overflowY: 'auto', padding: 28,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: '#E8EDF5' }}>
              Mettre à jour — {intervention.reference}
            </div>
            <div style={{ color: '#6B84AA', fontSize: 12, marginTop: 2 }}>
              {intervention.client?.raison_sociale}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6B84AA', fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Statut */}
          <div>
            <label style={labelStyle}>Statut *</label>
            <select style={inputStyle} value={form.statut} onChange={set('statut')}>
              <option value="planifiee">Planifiée</option>
              <option value="en_cours">En cours</option>
              <option value="terminee">Terminée</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>

          {/* Dates réelles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Début réel</label>
              <input type="datetime-local" style={inputStyle}
                value={form.date_debut_reelle} onChange={set('date_debut_reelle')} />
            </div>
            <div>
              <label style={labelStyle}>Fin réelle</label>
              <input type="datetime-local" style={inputStyle}
                value={form.date_fin_reelle} onChange={set('date_fin_reelle')} />
            </div>
          </div>

          {/* Durée + Coût */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Durée (minutes)</label>
              <input type="number" style={inputStyle}
                value={form.duree_minutes} onChange={set('duree_minutes')}
                placeholder="Ex: 90" />
              {form.duree_minutes && (
                <div style={{ color: '#6B84AA', fontSize: 11, marginTop: 4 }}>
                  = {Math.floor(form.duree_minutes / 60)}h {form.duree_minutes % 60}min
                </div>
              )}
            </div>
            <div>
              <label style={labelStyle}>Coût (FCFA)</label>
              <input type="number" style={inputStyle}
                value={form.cout} onChange={set('cout')}
                placeholder="Ex: 150000" />
            </div>
          </div>

          {/* Upload rapport PDF */}
          <div>
            <label style={labelStyle}>Rapport d'intervention PDF</label>
            <div style={{
              border: '2px dashed #1C3560', borderRadius: 8,
              padding: '16px', textAlign: 'center', cursor: 'pointer',
            }}
              onClick={() => document.getElementById('rapport-pdf').click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); setPdf(e.dataTransfer.files[0]); }}
            >
              {pdf ? (
                <div style={{ color: '#22C55E', fontSize: 13 }}>
                  📄 {pdf.name}
                  <button onClick={e => { e.stopPropagation(); setPdf(null); }} style={{
                    marginLeft: 8, background: 'none', border: 'none',
                    color: '#EF4444', cursor: 'pointer',
                  }}>✕</button>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>📄</div>
                  <div style={{ color: '#6B84AA', fontSize: 12 }}>
                    Glisser-déposer ou cliquer · PDF uniquement
                  </div>
                  {intervention.pdf_rapport_path && (
                    <div style={{ color: '#F0A500', fontSize: 11, marginTop: 4 }}>
                      Un rapport existe déjà — le remplacer ?
                    </div>
                  )}
                </div>
              )}
              <input id="rapport-pdf" type="file" accept=".pdf"
                style={{ display: 'none' }}
                onChange={e => setPdf(e.target.files[0])} />
            </div>
            {pdf && (
              <button onClick={handleUploadRapport} disabled={uploading} style={{
                marginTop: 8, width: '100%',
                background: '#22C55E22', border: '1px solid #22C55E',
                borderRadius: 8, padding: '9px',
                color: '#22C55E', fontSize: 13, fontWeight: 600,
                cursor: uploading ? 'not-allowed' : 'pointer',
              }}>
                {uploading ? 'Upload en cours...' : '📤 Uploader le rapport PDF'}
              </button>
            )}
          </div>
        </div>

        {/* Boutons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
          <button onClick={onClose} style={{
            background: 'transparent', border: '1px solid #1C3560',
            borderRadius: 8, padding: '9px 20px',
            color: '#6B84AA', fontSize: 13, cursor: 'pointer',
          }}>Annuler</button>
          <button onClick={handleSubmit} disabled={loading} style={{
            background: 'linear-gradient(135deg, #1D6FA4, #2589C8)',
            border: 'none', borderRadius: 8, padding: '9px 24px',
            color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Enregistrement...' : 'Mettre à jour'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PAGE MES INTERVENTIONS ──
export default function MesInterventions() {
  const { user } = useAuthStore();
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [statut, setStatut]       = useState('');
  const [selected, setSelected]   = useState(null);
  const [pagination, setPagination] = useState({});

  useEffect(() => { fetchInterventions(); }, [statut]);

  const fetchInterventions = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, technicien_id: user?.id };
      if (statut) params.statut = statut;
      const res = await api.get('/interventions', { params });
      setInterventions(res.data.data ?? []);
      setPagination(res.data);
    } catch {
      toast.error('Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadRapport = async (id, reference) => {
    try {
      const res = await api.get(`/interventions/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a   = document.createElement('a');
      a.href    = url;
      a.download = `Rapport-${reference}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Aucun rapport disponible.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20, color: '#E8EDF5' }}>Mes interventions</div>
          <div style={{ color: '#6B84AA', fontSize: 13 }}>
            {pagination.total ?? 0} intervention(s) assignée(s)
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 12 }}>
        {['', 'planifiee', 'en_cours', 'terminee', 'annulee'].map(s => (
          <button key={s} onClick={() => setStatut(s)} style={{
            background: statut === s ? '#1D6FA4' : '#101F3A',
            border: `1px solid ${statut === s ? '#2589C8' : '#1C3560'}`,
            borderRadius: 8, padding: '7px 16px',
            color: statut === s ? '#fff' : '#6B84AA',
            fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {s === '' ? 'Toutes' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6B84AA' }}>Chargement...</div>
      ) : interventions.length === 0 ? (
        <div style={{
          background: '#101F3A', border: '1px solid #1C3560',
          borderRadius: 12, padding: '60px', textAlign: 'center', color: '#6B84AA',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔧</div>
          <div>Aucune intervention trouvée</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {interventions.map(inv => (
            <div key={inv.id} style={{
              background: '#101F3A', border: '1px solid #1C3560',
              borderRadius: 12, padding: '18px 22px',
              borderLeft: `4px solid ${
                inv.priorite === 'haute' ? '#EF4444' :
                inv.statut === 'en_cours' ? '#60A5FA' :
                inv.statut === 'terminee' ? '#F59E0B' : '#22C55E'
              }`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ color: '#2589C8', fontWeight: 700, fontSize: 14 }}>{inv.reference}</span>
                    <Badge statut={inv.statut} />
                    <Badge statut={inv.priorite} />
                    {inv.pdf_rapport_path && (
                      <span style={{
                        background: '#22C55E22', color: '#22C55E',
                        padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      }}>📄 Rapport joint</span>
                    )}
                  </div>
                  <div style={{ color: '#E8EDF5', fontWeight: 600, fontSize: 14 }}>
                    {inv.client?.raison_sociale}
                  </div>
                  <div style={{ color: '#6B84AA', fontSize: 12, marginTop: 4 }}>
                    {inv.type_intervention} · Planifiée le {new Date(inv.date_planifiee).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  {inv.contrat && (
                    <div style={{ color: '#6B84AA', fontSize: 12, marginTop: 2 }}>
                      Contrat : {inv.contrat.reference}
                    </div>
                  )}
                  {inv.duree_minutes && (
                    <div style={{ color: '#6B84AA', fontSize: 12, marginTop: 2 }}>
                      Durée : {Math.floor(inv.duree_minutes / 60)}h {inv.duree_minutes % 60}min
                      {inv.cout && ` · Coût : ${Number(inv.cout).toLocaleString()} FCFA`}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 16 }}>
                  {inv.statut !== 'terminee' && inv.statut !== 'annulee' && (
                    <button onClick={() => setSelected(inv)} style={{
                      background: 'linear-gradient(135deg, #1D6FA4, #2589C8)',
                      border: 'none', borderRadius: 8, padding: '8px 16px',
                      color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}>Mettre à jour</button>
                  )}
                  {inv.pdf_rapport_path && (
                    <button onClick={() => handleDownloadRapport(inv.id, inv.reference)} style={{
                      background: '#22C55E22', border: '1px solid #22C55E',
                      borderRadius: 8, padding: '8px 14px',
                      color: '#22C55E', fontSize: 13, cursor: 'pointer',
                    }}>📥 Rapport</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => fetchInterventions(p)} style={{
              width: 32, height: 32, borderRadius: 6,
              background: p === pagination.current_page ? '#1D6FA4' : '#0D1F3C',
              border: '1px solid #1C3560', color: '#E8EDF5',
              fontSize: 12, cursor: 'pointer',
            }}>{p}</button>
          ))}
        </div>
      )}

      {/* Modal */}
      {selected && (
        <UpdateModal
          intervention={selected}
          onClose={() => setSelected(null)}
          onSaved={() => { setSelected(null); fetchInterventions(); }}
        />
      )}
    </div>
  );
}
