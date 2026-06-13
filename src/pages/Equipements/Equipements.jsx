import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

// ── Badge état ──
function Badge({ etat }) {
  const map = {
    'bon':         { bg: '#1A3A2A', color: '#22C55E' },
    'degrade':     { bg: '#2A2A1A', color: '#F59E0B' },
    'hors_service':{ bg: '#3A1A1A', color: '#EF4444' },
  };
  const s = map[etat] || { bg: '#222', color: '#aaa' };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '2px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600,
    }}>{etat?.replace('_', ' ')}</span>
  );
}

// ── Icône type équipement ──
function TypeIcon({ type }) {
  const icons = {
    'PC': '💻', 'Serveur': '🖥', 'Imprimante': '🖨',
    'Routeur': '📡', 'Switch': '🔀', 'NAS': '💾', 'Autre': '⚙',
  };
  return <span>{icons[type] || '⚙'}</span>;
}

// ── Modal Équipement ──
function EquipementModal({ equipement, clients, onClose, onSaved }) {
  const isEdit = !!equipement;
  const [loading, setLoading] = useState(false);
  const [pdf, setPdf]         = useState(null);
  const [form, setForm]       = useState({
    client_id:        equipement?.client_id        || '',
    type_equipement:  equipement?.type_equipement  || '',
    marque:           equipement?.marque           || '',
    modele:           equipement?.modele           || '',
    numero_serie:     equipement?.numero_serie     || '',
    etat:             equipement?.etat             || 'bon',
    localisation:     equipement?.localisation     || '',
    derniere_maintenance: equipement?.derniere_maintenance || '',
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.client_id || !form.type_equipement || !form.marque || !form.modele) {
      toast.error('Remplissez tous les champs obligatoires (*)');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
      if (pdf) formData.append('pdf', pdf);

      if (isEdit) {
        await api.put(`/equipements/${equipement.id}`, form);
        toast.success('Équipement mis à jour.');
      } else {
        await api.post('/equipements', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Équipement créé avec succès.');
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
        borderRadius: 14, width: '100%', maxWidth: 600,
        maxHeight: '90vh', overflowY: 'auto', padding: 28,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: '#E8EDF5' }}>
              {isEdit ? 'Modifier l\'équipement' : 'Nouvel équipement'}
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
            <select style={inputStyle} value={form.client_id} onChange={set('client_id')} disabled={isEdit}>
              <option value="">Sélectionner un client...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.raison_sociale}</option>)}
            </select>
          </div>

          <div style={grid2}>
            {/* Type */}
            <div>
              <label style={labelStyle}>Type d'équipement *</label>
              <select style={inputStyle} value={form.type_equipement} onChange={set('type_equipement')}>
                <option value="">Sélectionner...</option>
                {['PC', 'Serveur', 'Imprimante', 'Routeur', 'Switch', 'NAS', 'Autre'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* État */}
            <div>
              <label style={labelStyle}>État</label>
              <select style={inputStyle} value={form.etat} onChange={set('etat')}>
                <option value="bon">Bon</option>
                <option value="degrade">Dégradé</option>
                <option value="hors_service">Hors service</option>
              </select>
            </div>

            {/* Marque */}
            <div>
              <label style={labelStyle}>Marque *</label>
              <input style={inputStyle} value={form.marque} onChange={set('marque')} placeholder="Ex: Dell, HP, Cisco..." />
            </div>

            {/* Modèle */}
            <div>
              <label style={labelStyle}>Modèle *</label>
              <input style={inputStyle} value={form.modele} onChange={set('modele')} placeholder="Ex: Latitude 5520" />
            </div>

            {/* N° Série */}
            <div>
              <label style={labelStyle}>N° de série</label>
              <input style={inputStyle} value={form.numero_serie} onChange={set('numero_serie')} placeholder="Ex: SN-ABC123" />
            </div>

            {/* Dernière maintenance */}
            <div>
              <label style={labelStyle}>Dernière maintenance</label>
              <input type="date" style={inputStyle} value={form.derniere_maintenance} onChange={set('derniere_maintenance')} />
            </div>
          </div>

          {/* Localisation */}
          <div>
            <label style={labelStyle}>Localisation dans l'entreprise</label>
            <input style={inputStyle} value={form.localisation} onChange={set('localisation')}
              placeholder="Ex: Bureau Direction, Salle Serveur, Accueil..." />
          </div>

          {/* Upload fiche technique PDF */}
          <div>
            <label style={labelStyle}>Fiche technique PDF (optionnel)</label>
            <div style={{
              border: '2px dashed #1C3560', borderRadius: 8,
              padding: '14px', textAlign: 'center', cursor: 'pointer',
            }}
              onClick={() => document.getElementById('pdf-equip').click()}
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
                    Glisser-déposer ou cliquer · PDF uniquement · Max 10MB
                  </div>
                  {equipement?.pdf_path && (
                    <div style={{ color: '#F0A500', fontSize: 11, marginTop: 4 }}>
                      Une fiche existe déjà — la remplacer ?
                    </div>
                  )}
                </div>
              )}
              <input id="pdf-equip" type="file" accept=".pdf"
                style={{ display: 'none' }}
                onChange={e => setPdf(e.target.files[0])} />
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
            {loading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer l\'équipement'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PAGE ÉQUIPEMENTS ──
export default function Equipements() {
  const [equipements, setEquipements] = useState([]);
  const [clients, setClients]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [etat, setEtat]               = useState('');
  const [type, setType]               = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [modal, setModal]             = useState(false);
  const [editEquipement, setEditEquipement] = useState(null);
  const [pagination, setPagination]   = useState({});

  useEffect(() => {
    fetchEquipements();
    fetchClients();
  }, [etat, type, clientFilter]);

  const fetchEquipements = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page };
      if (etat)         params.etat            = etat;
      if (type)         params.type_equipement = type;
      if (clientFilter) params.client_id       = clientFilter;
      const res = await api.get('/equipements', { params });
      setEquipements(res.data.data ?? []);
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

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet équipement ?')) return;
    try {
      await api.delete(`/equipements/${id}`);
      toast.success('Équipement supprimé.');
      fetchEquipements();
    } catch {
      toast.error('Impossible de supprimer.');
    }
  };

  const handleDownloadFiche = async (id, marque, modele) => {
    try {
      const res = await api.get(`/equipements/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a   = document.createElement('a');
      a.href    = url;
      a.download = `Fiche-${marque}-${modele}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Aucune fiche technique disponible.');
    }
  };

  // Stats rapides
  const total       = pagination.total ?? 0;
  const bons        = equipements.filter(e => e.etat === 'bon').length;
  const degrades    = equipements.filter(e => e.etat === 'degrade').length;
  const horsService = equipements.filter(e => e.etat === 'hors_service').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20, color: '#E8EDF5' }}>Parc informatique</div>
          <div style={{ color: '#6B84AA', fontSize: 13 }}>{total} équipement(s) enregistré(s)</div>
        </div>
        <button onClick={() => { setEditEquipement(null); setModal(true); }} style={{
          background: 'linear-gradient(135deg, #1D6FA4, #2589C8)',
          border: 'none', borderRadius: 8, padding: '10px 20px',
          color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>+ Nouvel équipement</button>
      </div>

      {/* Stats rapides */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'En bon état',    value: bons,        color: '#22C55E', bg: '#1A3A2A' },
          { label: 'Dégradés',       value: degrades,    color: '#F59E0B', bg: '#2A2A1A' },
          { label: 'Hors service',   value: horsService, color: '#EF4444', bg: '#3A1A1A' },
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
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
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

        <select value={clientFilter} onChange={e => setClientFilter(e.target.value)} style={{
          background: '#101F3A', border: '1px solid #1C3560',
          borderRadius: 8, padding: '9px 14px', color: '#E8EDF5',
          fontSize: 13, outline: 'none',
        }}>
          <option value="">Tous les clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.raison_sociale}</option>)}
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
              {['Type', 'Marque / Modèle', 'N° Série', 'Client', 'Localisation', 'Dernière Maint.', 'État', 'Actions'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '12px 14px',
                  color: '#6B84AA', fontSize: 11,
                  fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#6B84AA', fontSize: 13 }}>Chargement...</td></tr>
            ) : equipements.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#6B84AA', fontSize: 13 }}>Aucun équipement trouvé</td></tr>
            ) : equipements.map(e => (
              <tr key={e.id}
                style={{ borderTop: '1px solid #1C356022' }}
                onMouseEnter={ev => ev.currentTarget.style.background = '#ffffff06'}
                onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: '#1D6FA422', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: 16,
                    }}>
                      <TypeIcon type={e.type_equipement} />
                    </div>
                    <span style={{ color: '#E8EDF5', fontSize: 13, fontWeight: 600 }}>{e.type_equipement}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ color: '#E8EDF5', fontSize: 13, fontWeight: 600 }}>{e.marque}</div>
                  <div style={{ color: '#6B84AA', fontSize: 12 }}>{e.modele}</div>
                </td>
                <td style={{ padding: '12px 14px', color: '#6B84AA', fontSize: 12, fontFamily: 'monospace' }}>
                  {e.numero_serie || '—'}
                </td>
                <td style={{ padding: '12px 14px', color: '#E8EDF5', fontSize: 13 }}>
                  {e.client?.raison_sociale ?? '—'}
                </td>
                <td style={{ padding: '12px 14px', color: '#6B84AA', fontSize: 12 }}>
                  {e.localisation || '—'}
                </td>
                <td style={{ padding: '12px 14px', color: '#6B84AA', fontSize: 12 }}>
                  {e.derniere_maintenance
                    ? new Date(e.derniere_maintenance).toLocaleDateString('fr-FR')
                    : '—'}
                </td>
                <td style={{ padding: '12px 14px' }}><Badge etat={e.etat} /></td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => { setEditEquipement(e); setModal(true); }} style={{
                      background: '#F0A50022', border: 'none', borderRadius: 6,
                      padding: '4px 10px', color: '#F0A500', fontSize: 11, cursor: 'pointer',
                    }}>Éditer</button>
                    {e.pdf_path && (
                      <button onClick={() => handleDownloadFiche(e.id, e.marque, e.modele)} style={{
                        background: '#22C55E22', border: 'none', borderRadius: 6,
                        padding: '4px 10px', color: '#22C55E', fontSize: 11, cursor: 'pointer',
                      }}>📄 Fiche</button>
                    )}
                    <button onClick={() => handleDelete(e.id)} style={{
                      background: '#EF444422', border: 'none', borderRadius: 6,
                      padding: '4px 10px', color: '#EF4444', fontSize: 11, cursor: 'pointer',
                    }}>Suppr.</button>
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
              <button key={p} onClick={() => fetchEquipements(p)} style={{
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
        <EquipementModal
          equipement={editEquipement}
          clients={clients}
          onClose={() => { setModal(false); setEditEquipement(null); }}
          onSaved={() => { setModal(false); setEditEquipement(null); fetchEquipements(); }}
        />
      )}
    </div>
  );
}
