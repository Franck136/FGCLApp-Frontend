import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

// ── Badge disponibilité ──
function BadgeDispo({ disponible }) {
  return (
    <span style={{
      background: disponible ? '#1A3A2A' : '#3A1A1A',
      color: disponible ? '#22C55E' : '#EF4444',
      padding: '2px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600,
    }}>{disponible ? 'Disponible' : 'Indisponible'}</span>
  );
}

// ── Badge contrat travail ──
function BadgeContrat({ type }) {
  const map = {
    'CDI':        { bg: '#1A3A2A', color: '#22C55E' },
    'CDD':        { bg: '#1D3F7A', color: '#60A5FA' },
    'stagiaire':  { bg: '#2A2A1A', color: '#F59E0B' },
    'prestataire':{ bg: '#2A1A2A', color: '#A855F7' },
  };
  const s = map[type] || { bg: '#222', color: '#aaa' };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '2px 10px', borderRadius: 20,
      fontSize: 12, fontWeight: 600,
    }}>{type}</span>
  );
}

// ── Modal Technicien ──
function TechnicienModal({ technicien, users, specialites, onClose, onSaved }) {
  const isEdit = !!technicien;
  const [loading, setLoading]   = useState(false);
  const [pdf, setPdf]           = useState(null);
  const [form, setForm]         = useState({
    user_id:               technicien?.user_id               || '',
    zone_intervention:     technicien?.zone_intervention     || '',
    type_contrat_travail:  technicien?.type_contrat_travail  || 'CDI',
    date_embauche:         technicien?.date_embauche         || '',
    disponible:            technicien?.disponible ?? true,
    specialites:           technicien?.specialites?.map(s => s.id) || [],
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const toggleSpecialite = (id) => {
    setForm(f => ({
      ...f,
      specialites: f.specialites.includes(id)
        ? f.specialites.filter(s => s !== id)
        : [...f.specialites, id],
    }));
  };

  const handleSubmit = async () => {
    if (!form.user_id || !form.zone_intervention || !form.type_contrat_travail) {
      toast.error('Remplissez tous les champs obligatoires (*)');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'specialites') {
          v.forEach(id => formData.append('specialites[]', id));
        } else {
          formData.append(k, v);
        }
      });
      if (pdf) formData.append('pdf', pdf);

      if (isEdit) {
        await api.put(`/techniciens/${technicien.id}`, {
          ...form,
          disponible: form.disponible ? 1 : 0,
        });
        toast.success('Technicien mis à jour.');
      } else {
        await api.post('/techniciens', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Technicien créé avec succès.');
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
        borderRadius: 14, width: '100%', maxWidth: 620,
        maxHeight: '90vh', overflowY: 'auto', padding: 28,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: '#E8EDF5' }}>
              {isEdit ? 'Modifier le technicien' : 'Nouveau technicien'}
            </div>
            <div style={{ color: '#6B84AA', fontSize: 12, marginTop: 2 }}>
              Les champs * sont obligatoires
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6B84AA', fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Utilisateur */}
          {!isEdit && (
            <div>
              <label style={labelStyle}>Compte utilisateur *</label>
              <select style={inputStyle} value={form.user_id} onChange={set('user_id')}>
                <option value="">Sélectionner un utilisateur...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.prenom} {u.nom} — {u.email}
                  </option>
                ))}
              </select>
              <div style={{ color: '#3A5070', fontSize: 11, marginTop: 4 }}>
                Uniquement les utilisateurs avec rôle "technicien"
              </div>
            </div>
          )}

          <div style={grid2}>
            {/* Type contrat travail */}
            <div>
              <label style={labelStyle}>Type de contrat *</label>
              <select style={inputStyle} value={form.type_contrat_travail} onChange={set('type_contrat_travail')}>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="stagiaire">Stagiaire</option>
                <option value="prestataire">Prestataire</option>
              </select>
            </div>

            {/* Date embauche */}
            <div>
              <label style={labelStyle}>Date d'embauche</label>
              <input type="date" style={inputStyle} value={form.date_embauche} onChange={set('date_embauche')} />
            </div>
          </div>

          {/* Zone intervention */}
          <div>
            <label style={labelStyle}>Zone d'intervention *</label>
            <input style={inputStyle} value={form.zone_intervention} onChange={set('zone_intervention')}
              placeholder="Ex: Douala-Centre, Littoral, Tout Cameroun..." />
          </div>

          {/* Disponibilité */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="checkbox"
              id="disponible"
              checked={form.disponible}
              onChange={e => setForm(f => ({ ...f, disponible: e.target.checked }))}
              style={{ width: 16, height: 16, cursor: 'pointer' }}
            />
            <label htmlFor="disponible" style={{ color: '#E8EDF5', fontSize: 13, cursor: 'pointer' }}>
              Technicien disponible pour affectation
            </label>
          </div>

          {/* Spécialités */}
          <div>
            <label style={labelStyle}>Spécialités</label>
            <div style={{
              background: '#0D1F3C', border: '1px solid #1C3560',
              borderRadius: 8, padding: '10px 12px',
              display: 'flex', flexWrap: 'wrap', gap: 8,
            }}>
              {specialites.length === 0 ? (
                <div style={{ color: '#3A5070', fontSize: 12 }}>
                  Aucune spécialité configurée — ajoutez-en depuis les paramètres
                </div>
              ) : specialites.map(s => {
                const selected = form.specialites.includes(s.id);
                return (
                  <button key={s.id} type="button" onClick={() => toggleSpecialite(s.id)} style={{
                    background: selected ? '#1D6FA4' : '#152645',
                    border: `1px solid ${selected ? '#2589C8' : '#1C3560'}`,
                    borderRadius: 20, padding: '5px 14px',
                    color: selected ? '#fff' : '#6B84AA',
                    fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    {s.nom} {selected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload contrat travail PDF */}
          <div>
            <label style={labelStyle}>Contrat de travail PDF (optionnel)</label>
            <div style={{
              border: '2px dashed #1C3560', borderRadius: 8,
              padding: '14px', textAlign: 'center', cursor: 'pointer',
            }}
              onClick={() => document.getElementById('pdf-tech').click()}
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
                  {technicien?.pdf_contrat_path && (
                    <div style={{ color: '#F0A500', fontSize: 11, marginTop: 4 }}>
                      Un contrat existe déjà — le remplacer ?
                    </div>
                  )}
                </div>
              )}
              <input id="pdf-tech" type="file" accept=".pdf"
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
            {loading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer le technicien'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PAGE TECHNICIENS ──
export default function Techniciens() {
  const [techniciens, setTechniciens]   = useState([]);
  const [users, setUsers]               = useState([]);
  const [specialites, setSpecialites]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [disponible, setDisponible]     = useState('');
  const [specialiteFilter, setSpecialiteFilter] = useState('');
  const [modal, setModal]               = useState(false);
  const [editTech, setEditTech]         = useState(null);
  const [pagination, setPagination]     = useState({});

  useEffect(() => {
    fetchTechniciens();
    fetchUsers();
    fetchSpecialites();
  }, [disponible, specialiteFilter]);

  const fetchTechniciens = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page };
      if (disponible !== '')    params.disponible    = disponible;
      if (specialiteFilter)     params.specialite_id = specialiteFilter;
      const res = await api.get('/techniciens', { params });
      setTechniciens(res.data.data ?? []);
      setPagination(res.data);
    } catch {
      toast.error('Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users', { params: { role: 'technicien' } });
      setUsers(res.data.data ?? []);
    } catch {}
  };

  const fetchSpecialites = async () => {
    try {
      const res = await api.get('/specialites');
      setSpecialites(res.data ?? []);
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette fiche technicien ?')) return;
    try {
      await api.delete(`/techniciens/${id}`);
      toast.success('Fiche technicien supprimée.');
      fetchTechniciens();
    } catch {
      toast.error('Impossible de supprimer.');
    }
  };

  const toggleDisponibilite = async (tech) => {
    try {
      await api.put(`/techniciens/${tech.id}`, { disponible: !tech.disponible });
      toast.success(`Technicien marqué comme ${!tech.disponible ? 'disponible' : 'indisponible'}.`);
      fetchTechniciens();
    } catch {
      toast.error('Erreur lors de la mise à jour.');
    }
  };

  const disponibles   = techniciens.filter(t => t.disponible).length;
  const indisponibles = techniciens.filter(t => !t.disponible).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20, color: '#E8EDF5' }}>Techniciens</div>
          <div style={{ color: '#6B84AA', fontSize: 13 }}>
            {pagination.total ?? 0} technicien(s) enregistré(s)
          </div>
        </div>
        <button onClick={() => { setEditTech(null); setModal(true); }} style={{
          background: 'linear-gradient(135deg, #1D6FA4, #2589C8)',
          border: 'none', borderRadius: 8, padding: '10px 20px',
          color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>+ Nouveau technicien</button>
      </div>

      {/* Stats rapides */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{
          background: '#1A3A2A', border: '1px solid #22C55E33',
          borderRadius: 10, padding: '14px 20px',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#22C55E' }}>{disponibles}</div>
          <div style={{ color: '#22C55E', fontSize: 13, fontWeight: 600 }}>Disponibles</div>
        </div>
        <div style={{
          background: '#3A1A1A', border: '1px solid #EF444433',
          borderRadius: 10, padding: '14px 20px',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#EF4444' }}>{indisponibles}</div>
          <div style={{ color: '#EF4444', fontSize: 13, fontWeight: 600 }}>Indisponibles</div>
        </div>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 12 }}>
        <select value={disponible} onChange={e => setDisponible(e.target.value)} style={{
          background: '#101F3A', border: '1px solid #1C3560',
          borderRadius: 8, padding: '9px 14px', color: '#E8EDF5',
          fontSize: 13, outline: 'none',
        }}>
          <option value="">Toutes disponibilités</option>
          <option value="1">Disponible</option>
          <option value="0">Indisponible</option>
        </select>

        <select value={specialiteFilter} onChange={e => setSpecialiteFilter(e.target.value)} style={{
          background: '#101F3A', border: '1px solid #1C3560',
          borderRadius: 8, padding: '9px 14px', color: '#E8EDF5',
          fontSize: 13, outline: 'none',
        }}>
          <option value="">Toutes les spécialités</option>
          {specialites.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
        </select>
      </div>

      {/* Cards techniciens */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6B84AA', fontSize: 13 }}>Chargement...</div>
      ) : techniciens.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6B84AA', fontSize: 13 }}>Aucun technicien trouvé</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {techniciens.map(t => (
            <div key={t.id} style={{
              background: '#101F3A', border: '1px solid #1C3560',
              borderRadius: 12, padding: '20px',
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#1D6FA4'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1C3560'}
            >
              {/* Avatar + nom */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1D6FA4, #2589C8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 16, color: '#fff', flexShrink: 0,
                }}>
                  {t.user?.prenom?.[0]}{t.user?.nom?.[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#E8EDF5', truncate: true }}>
                    {t.user?.prenom} {t.user?.nom}
                  </div>
                  <div style={{ color: '#6B84AA', fontSize: 12 }}>{t.user?.email}</div>
                </div>
              </div>

              {/* Infos */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6B84AA', fontSize: 12 }}>Disponibilité</span>
                  <BadgeDispo disponible={t.disponible} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6B84AA', fontSize: 12 }}>Contrat</span>
                  <BadgeContrat type={t.type_contrat_travail} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6B84AA', fontSize: 12 }}>Zone</span>
                  <span style={{ color: '#E8EDF5', fontSize: 12, textAlign: 'right', maxWidth: 160 }}>
                    {t.zone_intervention}
                  </span>
                </div>
              </div>

              {/* Spécialités */}
              {t.specialites?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                  {t.specialites.map(s => (
                    <span key={s.id} style={{
                      background: '#1D6FA422', color: '#2589C8',
                      padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    }}>{s.nom}</span>
                  ))}
                </div>
              )}

              {/* Téléphone */}
              {t.user?.telephone && (
                <div style={{ color: '#6B84AA', fontSize: 12, marginBottom: 14 }}>
                  📞 {t.user.telephone}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #1C3560', paddingTop: 14 }}>
                <button onClick={() => toggleDisponibilite(t)} style={{
                  flex: 1, background: t.disponible ? '#3A1A1A' : '#1A3A2A',
                  border: 'none', borderRadius: 6, padding: '6px',
                  color: t.disponible ? '#EF4444' : '#22C55E',
                  fontSize: 11, cursor: 'pointer', fontWeight: 600,
                }}>
                  {t.disponible ? '✗ Indispo' : '✓ Disponible'}
                </button>
                <button onClick={() => { setEditTech(t); setModal(true); }} style={{
                  flex: 1, background: '#F0A50022', border: 'none', borderRadius: 6,
                  padding: '6px', color: '#F0A500', fontSize: 11, cursor: 'pointer',
                }}>Éditer</button>
                <button onClick={() => handleDelete(t.id)} style={{
                  background: '#EF444422', border: 'none', borderRadius: 6,
                  padding: '6px 10px', color: '#EF4444', fontSize: 11, cursor: 'pointer',
                }}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => fetchTechniciens(p)} style={{
              width: 32, height: 32, borderRadius: 6,
              background: p === pagination.current_page ? '#1D6FA4' : '#0D1F3C',
              border: '1px solid #1C3560', color: '#E8EDF5',
              fontSize: 12, cursor: 'pointer',
            }}>{p}</button>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <TechnicienModal
          technicien={editTech}
          users={users}
          specialites={specialites}
          onClose={() => { setModal(false); setEditTech(null); }}
          onSaved={() => { setModal(false); setEditTech(null); fetchTechniciens(); }}
        />
      )}
    </div>
  );
}
