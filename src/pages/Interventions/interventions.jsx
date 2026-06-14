import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

// ── Badges ──
function Badge({ statut }) {
  const map = {
    'planifiee':  { bg: '#1A3A2A', color: '#22C55E' },
    'en_cours':   { bg: '#1D3F7A', color: '#60A5FA' },
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

// ── Modal Intervention ──
function InterventionModal({ intervention, clients, techniciens, onClose, onSaved }) {
  const isEdit = !!intervention;
  const [loading, setLoading] = useState(false);
  const [contrats, setContrats] = useState([]);
  const [form, setForm] = useState({
    client_id:         intervention?.client_id         || '',
    contrat_id:        intervention?.contrat_id        || '',
    type_intervention: intervention?.type_intervention || '',
    priorite:          intervention?.priorite          || 'normale',
    date_planifiee:    intervention?.date_planifiee
      ? new Date(intervention.date_planifiee).toISOString().slice(0, 16)
      : '',
    statut:            intervention?.statut            || 'planifiee',
    cout:              intervention?.cout              || '',
    techniciens:       intervention?.techniciens?.map(t => t.id) || [],
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  // Charger les contrats du client sélectionné
  useEffect(() => {
    if (form.client_id) fetchContrats(form.client_id);
    else setContrats([]);
  }, [form.client_id]);

  const fetchContrats = async (clientId) => {
    try {
      const res = await api.get('/contrats', { params: { client_id: clientId, statut: 'actif' } });
      setContrats(res.data.data ?? []);
    } catch {}
  };

  const toggleTechnicien = (id) => {
    setForm(f => ({
      ...f,
      techniciens: f.techniciens.includes(id)
        ? f.techniciens.filter(t => t !== id)
        : [...f.techniciens, id],
    }));
  };

  const handleSubmit = async () => {
    if (!form.client_id || !form.type_intervention || !form.priorite || !form.date_planifiee) {
      toast.error('Remplissez tous les champs obligatoires (*)');
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/interventions/${intervention.id}`, form);
        toast.success('Intervention mise à jour.');
      } else {
        await api.post('/interventions', form);
        toast.success('Intervention créée avec succès.');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
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
  const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#00000080',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20,
    }}>
      <div style={{
        background: '#101F3A', border: '1px solid #1C3560',
        borderRadius: 14, width: '100%', maxWidth: 660,
        maxHeight: '90vh', overflowY: 'auto', padding: 28,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: '#E8EDF5' }}>
              {isEdit ? 'Modifier l\'intervention' : 'Nouvelle intervention'}
            </div>
            <div style={{ color: '#6B84AA', fontSize: 12, marginTop: 2 }}>
              Les champs * sont obligatoires
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6B84AA', fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Client */}
          <div>
            <label style={labelStyle}>Client *</label>
            <select style={inputStyle} value={form.client_id} onChange={set('client_id')}>
              <option value="">Sélectionner un client...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.raison_sociale}</option>)}
            </select>
          </div>

          {/* Contrat lié */}
          <div>
            <label style={labelStyle}>Contrat lié (optionnel)</label>
            <select style={inputStyle} value={form.contrat_id} onChange={set('contrat_id')} disabled={!form.client_id}>
              <option value="">Aucun contrat sélectionné</option>
              {contrats.map(c => <option key={c.id} value={c.id}>{c.reference} — {c.type_contrat?.replace(/_/g, ' ')}</option>)}
            </select>
          </div>

          <div style={grid2}>
            {/* Type */}
            <div>
              <label style={labelStyle}>Type d'intervention *</label>
              <select style={inputStyle} value={form.type_intervention} onChange={set('type_intervention')}>
                <option value="">Sélectionner...</option>
                <option value="preventive">Préventive</option>
                <option value="corrective">Corrective</option>
                <option value="installation">Installation</option>
                <option value="audit">Audit</option>
              </select>
            </div>

            {/* Priorité */}
            <div>
              <label style={labelStyle}>Priorité *</label>
              <select style={inputStyle} value={form.priorite} onChange={set('priorite')}>
                <option value="haute">Haute</option>
                <option value="normale">Normale</option>
                <option value="basse">Basse</option>
              </select>
            </div>

            {/* Date planifiée */}
            <div>
              <label style={labelStyle}>Date planifiée *</label>
              <input type="datetime-local" style={inputStyle} value={form.date_planifiee} onChange={set('date_planifiee')} />
            </div>

            {/* Statut */}
            <div>
              <label style={labelStyle}>Statut</label>
              <select style={inputStyle} value={form.statut} onChange={set('statut')}>
                <option value="planifiee">Planifiée</option>
                <option value="en_cours">En cours</option>
                <option value="terminee">Terminée</option>
                <option value="annulee">Annulée</option>
              </select>
            </div>

            {/* Coût */}
            <div>
              <label style={labelStyle}>Coût (FCFA)</label>
              <input type="number" style={inputStyle} value={form.cout} onChange={set('cout')} placeholder="Ex: 150000" />
            </div>
          </div>

          {/* Techniciens */}
          <div>
            <label style={labelStyle}>Techniciens assignés</label>
            <div style={{
              background: '#0D1F3C', border: '1px solid #1C3560',
              borderRadius: 8, padding: '10px 12px',
              display: 'flex', flexWrap: 'wrap', gap: 8,
              maxHeight: 140, overflowY: 'auto',
            }}>
              {techniciens.length === 0 ? (
                <div style={{ color: '#3A5070', fontSize: 12 }}>Aucun technicien disponible</div>
              ) : techniciens.map(t => {
                const selected = form.techniciens.includes(t.user_id);
                return (
                  <button key={t.id} type="button" onClick={() => toggleTechnicien(t.user_id)} style={{
                    background: selected ? '#1D6FA4' : '#152645',
                    border: `1px solid ${selected ? '#2589C8' : '#1C3560'}`,
                    borderRadius: 20, padding: '5px 14px',
                    color: selected ? '#fff' : '#6B84AA',
                    fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    {t.user?.prenom} {t.user?.nom}
                    {selected && ' ✓'}
                  </button>
                );
              })}
            </div>
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
            {loading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer l\'intervention'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PAGE INTERVENTIONS ──
export default function Interventions() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdminOrCommercial = ['admin', 'commercial'].includes(user?.role);

  const [interventions, setInterventions] = useState([]);
  const [clients, setClients]             = useState([]);
  const [techniciens, setTechniciens]     = useState([]);
  const [loading, setLoading]             = useState(true);
  const [statut, setStatut]               = useState('');
  const [priorite, setPriorite]           = useState('');
  const [modal, setModal]                 = useState(false);
  const [editIntervention, setEditIntervention] = useState(null);
  const [pagination, setPagination]       = useState({});

  useEffect(() => {
    fetchInterventions();
    if (isAdminOrCommercial) {
      fetchClients();
      fetchTechniciens();
    }
  }, [statut, priorite]);

  const fetchInterventions = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page };
      if (statut)   params.statut   = statut;
      if (priorite) params.priorite = priorite;
      const res = await api.get('/interventions', { params });
      setInterventions(res.data.data ?? []);
      setPagination(res.data);
    } catch {
      toast.error('Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients', { params: { statut: 'actif' } });
      setClients(res.data.data ?? []);
    } catch {}
  };

  const fetchTechniciens = async () => {
    try {
      const res = await api.get('/techniciens');
      setTechniciens(res.data.data ?? []);
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette intervention ?')) return;
    try {
      await api.delete(`/interventions/${id}`);
      toast.success('Intervention supprimée.');
      fetchInterventions();
    } catch {
      toast.error('Impossible de supprimer.');
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
      toast.error('Aucun rapport PDF disponible.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20, color: '#E8EDF5' }}>Interventions</div>
          <div style={{ color: '#6B84AA', fontSize: 13 }}>
            {pagination.total ?? 0} intervention(s) enregistrée(s)
          </div>
        </div>
        {isAdminOrCommercial && (
          <button onClick={() => { setEditIntervention(null); setModal(true); }} style={{
            background: 'linear-gradient(135deg, #1D6FA4, #2589C8)',
            border: 'none', borderRadius: 8, padding: '10px 20px',
            color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>+ Nouvelle intervention</button>
        )}
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 12 }}>
        <select value={statut} onChange={e => setStatut(e.target.value)} style={{
          background: '#101F3A', border: '1px solid #1C3560',
          borderRadius: 8, padding: '9px 14px', color: '#E8EDF5',
          fontSize: 13, outline: 'none',
        }}>
          <option value="">Tous les statuts</option>
          <option value="planifiee">Planifiée</option>
          <option value="en_cours">En cours</option>
          <option value="terminee">Terminée</option>
          <option value="annulee">Annulée</option>
        </select>

        <select value={priorite} onChange={e => setPriorite(e.target.value)} style={{
          background: '#101F3A', border: '1px solid #1C3560',
          borderRadius: 8, padding: '9px 14px', color: '#E8EDF5',
          fontSize: 13, outline: 'none',
        }}>
          <option value="">Toutes les priorités</option>
          <option value="haute">Haute</option>
          <option value="normale">Normale</option>
          <option value="basse">Basse</option>
        </select>
      </div>

      {/* Table */}
      <div style={{
        background: '#101F3A', border: '1px solid #1C3560',
        borderRadius: 12, overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0D1F3C' }}>
              {['Réf.', 'Client', 'Type', 'Technicien(s)', 'Date planifiée', 'Durée', 'Coût', 'Priorité', 'Statut', 'Actions'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '12px 12px',
                  color: '#6B84AA', fontSize: 11,
                  fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#6B84AA', fontSize: 13 }}>Chargement...</td></tr>
            ) : interventions.length === 0 ? (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: '#6B84AA', fontSize: 13 }}>Aucune intervention trouvée</td></tr>
            ) : interventions.map(inv => (
              <tr key={inv.id}
                style={{ borderTop: '1px solid #1C356022' }}
                onMouseEnter={e => e.currentTarget.style.background = '#ffffff06'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '11px 12px', color: '#2589C8', fontSize: 13, fontWeight: 600 }}>{inv.reference}</td>
                <td style={{ padding: '11px 12px', color: '#E8EDF5', fontSize: 13 }}>{inv.client?.raison_sociale ?? '—'}</td>
                <td style={{ padding: '11px 12px', color: '#6B84AA', fontSize: 12 }}>{inv.type_intervention}</td>
                <td style={{ padding: '11px 12px', color: '#E8EDF5', fontSize: 12 }}>
                  {inv.techniciens?.map(t => `${t.prenom} ${t.nom}`).join(', ') || '—'}
                </td>
                <td style={{ padding: '11px 12px', color: '#6B84AA', fontSize: 12 }}>
                  {inv.date_planifiee ? new Date(inv.date_planifiee).toLocaleDateString('fr-FR') : '—'}
                </td>
                <td style={{ padding: '11px 12px', color: '#6B84AA', fontSize: 12 }}>
                  {inv.duree_minutes ? `${Math.floor(inv.duree_minutes / 60)}h${inv.duree_minutes % 60}m` : '—'}
                </td>
                <td style={{ padding: '11px 12px', color: '#6B84AA', fontSize: 12 }}>
                  {inv.cout ? `${Number(inv.cout).toLocaleString()} FCFA` : '—'}
                </td>
                <td style={{ padding: '11px 12px' }}><Badge statut={inv.priorite} /></td>
                <td style={{ padding: '11px 12px' }}><Badge statut={inv.statut} /></td>
                <td style={{ padding: '11px 12px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => navigate(`/app/interventions/${inv.id}`)} style={{
                      background: '#1D6FA422', border: 'none', borderRadius: 6,
                      padding: '4px 10px', color: '#2589C8', fontSize: 11, cursor: 'pointer',
                    }}>Voir</button>
                    {isAdminOrCommercial && (
                      <>
                        <button onClick={() => { setEditIntervention(inv); setModal(true); }} style={{
                          background: '#F0A50022', border: 'none', borderRadius: 6,
                          padding: '4px 10px', color: '#F0A500', fontSize: 11, cursor: 'pointer',
                        }}>Éditer</button>
                        {inv.pdf_rapport_path && (
                          <button onClick={() => handleDownloadRapport(inv.id, inv.reference)} style={{
                            background: '#22C55E22', border: 'none', borderRadius: 6,
                            padding: '4px 10px', color: '#22C55E', fontSize: 11, cursor: 'pointer',
                          }}>📄 Rapport</button>
                        )}
                        <button onClick={() => handleDelete(inv.id)} style={{
                          background: '#EF444422', border: 'none', borderRadius: 6,
                          padding: '4px 10px', color: '#EF4444', fontSize: 11, cursor: 'pointer',
                        }}>Suppr.</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px', borderTop: '1px solid #1C3560' }}>
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
      </div>

      {/* Modal */}
      {modal && (
        <InterventionModal
          intervention={editIntervention}
          clients={clients}
          techniciens={techniciens}
          onClose={() => { setModal(false); setEditIntervention(null); }}
          onSaved={() => { setModal(false); setEditIntervention(null); fetchInterventions(); }}
        />
      )}
    </div>
  );
}
