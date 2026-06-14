import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

// ── Badge statut ──
function Badge({ statut }) {
  const map = {
    'actif':    { bg: '#1A3A2A', color: '#22C55E' },
    'inactif':  { bg: '#2A2A2A', color: '#9CA3AF' },
    'suspendu': { bg: '#3A1A1A', color: '#EF4444' },
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

// ── Modal formulaire ──
function ClientModal({ client, onClose, onSaved }) {
  const isEdit = !!client;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    raison_sociale:        client?.raison_sociale        || '',
    forme_juridique:       client?.forme_juridique       || '',
    numero_contribuable:   client?.numero_contribuable   || '',
    secteur_activite:      client?.secteur_activite      || '',
    adresse:               client?.adresse               || '',
    ville:                 client?.ville                 || '',
    region:                client?.region                || '',
    email:                 client?.email                 || '',
    telephone:             client?.telephone             || '',
    nom_responsable:       client?.nom_responsable       || '',
    poste_responsable:     client?.poste_responsable     || '',
    telephone_responsable: client?.telephone_responsable || '',
    email_responsable:     client?.email_responsable     || '',
    nom_contact2:          client?.nom_contact2          || '',
    telephone_contact2:    client?.telephone_contact2    || '',
    email_contact2:        client?.email_contact2        || '',
    statut:                client?.statut                || 'actif',
    date_debut_relation:   client?.date_debut_relation   || '',
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.raison_sociale || !form.secteur_activite || !form.telephone || !form.nom_responsable || !form.adresse || !form.ville) {
      toast.error('Remplissez tous les champs obligatoires (*)');
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/clients/${client.id}`, form);
        toast.success('Client mis à jour.');
      } else {
        await api.post('/clients', form);
        toast.success('Client créé avec succès.');
      }
      onSaved();
    } catch (err) {
      const msg = err.response?.data?.message || 'Une erreur est survenue.';
      toast.error(msg);
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
    display: 'block', color: '#6B84AA',
    fontSize: 11, fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5,
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
        borderRadius: 14, width: '100%', maxWidth: 700,
        maxHeight: '90vh', overflowY: 'auto',
        padding: 28,
      }}>
        {/* Header modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: '#E8EDF5' }}>
              {isEdit ? 'Modifier le client' : 'Nouveau client'}
            </div>
            <div style={{ color: '#6B84AA', fontSize: 12, marginTop: 2 }}>
              Les champs marqués * sont obligatoires
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none',
            color: '#6B84AA', fontSize: 22, cursor: 'pointer',
          }}>✕</button>
        </div>

        {/* Section : Identification */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: '#1D6FA4', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, borderBottom: '1px solid #1C3560', paddingBottom: 6 }}>
            Identification
          </div>
          <div style={grid2}>
            <div>
              <label style={labelStyle}>Raison sociale *</label>
              <input style={inputStyle} value={form.raison_sociale} onChange={set('raison_sociale')} placeholder="Ex: SOGETRA SA" />
            </div>
            <div>
              <label style={labelStyle}>Forme juridique</label>
              <select style={inputStyle} value={form.forme_juridique} onChange={set('forme_juridique')}>
                <option value="">Sélectionner...</option>
                {['SARL', 'SA', 'GIE', 'SNC', 'Autre'].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Secteur d'activité *</label>
              <input style={inputStyle} value={form.secteur_activite} onChange={set('secteur_activite')} placeholder="Ex: Finance, Télécom..." />
            </div>
            <div>
              <label style={labelStyle}>N° Contribuable / RCCM</label>
              <input style={inputStyle} value={form.numero_contribuable} onChange={set('numero_contribuable')} />
            </div>
          </div>
        </div>

        {/* Section : Localisation */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: '#1D6FA4', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, borderBottom: '1px solid #1C3560', paddingBottom: 6 }}>
            Localisation
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Adresse *</label>
            <input style={inputStyle} value={form.adresse} onChange={set('adresse')} placeholder="Quartier, rue..." />
          </div>
          <div style={grid2}>
            <div>
              <label style={labelStyle}>Ville *</label>
              <select style={inputStyle} value={form.ville} onChange={set('ville')}>
                <option value="">Sélectionner...</option>
                {['Douala', 'Yaoundé', 'Bafoussam', 'Garoua', 'Maroua', 'Bamenda', 'Autre'].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Région</label>
              <select style={inputStyle} value={form.region} onChange={set('region')}>
                <option value="">Sélectionner...</option>
                {['Littoral', 'Centre', 'Ouest', 'Nord', 'Extrême-Nord', 'Sud', 'Est', 'Adamaoua', 'Nord-Ouest', 'Sud-Ouest'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Section : Contact */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: '#1D6FA4', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, borderBottom: '1px solid #1C3560', paddingBottom: 6 }}>
            Contact entreprise
          </div>
          <div style={grid2}>
            <div>
              <label style={labelStyle}>Téléphone *</label>
              <input style={inputStyle} value={form.telephone} onChange={set('telephone')} placeholder="Ex: 699000000" />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" value={form.email} onChange={set('email')} placeholder="contact@entreprise.cm" />
            </div>
          </div>
        </div>

        {/* Section : Responsable */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: '#1D6FA4', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, borderBottom: '1px solid #1C3560', paddingBottom: 6 }}>
            Contact principal *
          </div>
          <div style={grid2}>
            <div>
              <label style={labelStyle}>Nom & Prénom *</label>
              <input style={inputStyle} value={form.nom_responsable} onChange={set('nom_responsable')} placeholder="Ex: Mourabak alla" />
            </div>
            <div>
              <label style={labelStyle}>Poste / Fonction</label>
              <input style={inputStyle} value={form.poste_responsable} onChange={set('poste_responsable')} placeholder="Ex: Directeur IT" />
            </div>
            <div>
              <label style={labelStyle}>Téléphone</label>
              <input style={inputStyle} value={form.telephone_responsable} onChange={set('telephone_responsable')} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" value={form.email_responsable} onChange={set('email_responsable')} />
            </div>
          </div>
        </div>

        {/* Section : Contact 2 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: '#1D6FA4', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, borderBottom: '1px solid #1C3560', paddingBottom: 6 }}>
            Contact secondaire (optionnel)
          </div>
          <div style={grid2}>
            <div>
              <label style={labelStyle}>Nom & Prénom</label>
              <input style={inputStyle} value={form.nom_contact2} onChange={set('nom_contact2')} />
            </div>
            <div>
              <label style={labelStyle}>Téléphone</label>
              <input style={inputStyle} value={form.telephone_contact2} onChange={set('telephone_contact2')} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" value={form.email_contact2} onChange={set('email_contact2')} />
            </div>
          </div>
        </div>

        {/* Statut */}
        <div style={grid2}>
            <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Statut</label>
          <select style={{ ...inputStyle, width: 200 }} value={form.statut} onChange={set('statut')}>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
            <option value="suspendu">Suspendu</option>
          </select>
            </div>
            <div>
              <label style={labelStyle}>Date debut Relation</label>
              <input style={inputStyle} type = "date" value={form.date_debut_relation} onChange={set('date_debut_relation')} />
            </div>
        </div>
        {/* <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Statut</label>
          <select style={{ ...inputStyle, width: 200 }} value={form.statut} onChange={set('statut')}>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
            <option value="suspendu">Suspendu</option>
          </select>
        </div> */}

        {/* Boutons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
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
            {loading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer le client'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PAGE CLIENTS ──
export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [statut, setStatut]       = useState('');
  const [modal, setModal]         = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchClients();
  }, [search, statut]);

  const fetchClients = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.search = search;
      if (statut) params.statut = statut;
      const res = await api.get('/clients', { params });
      setClients(res.data.data ?? []);
      setPagination(res.data);
    } catch {
      toast.error('Erreur lors du chargement des clients.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce client ?')) return;
    try {
      await api.delete(`/clients/${id}`);
      toast.success('Client supprimé.');
      fetchClients();
    } catch {
      toast.error('Impossible de supprimer ce client.');
    }
  };

  const handleSaved = () => {
    setModal(false);
    setEditClient(null);
    fetchClients();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20, color: '#E8EDF5' }}>Clients</div>
          <div style={{ color: '#6B84AA', fontSize: 13 }}>
            {pagination.total ?? 0} client(s) enregistré(s)
          </div>
        </div>
        <button onClick={() => { setEditClient(null); setModal(true); }} style={{
          background: 'linear-gradient(135deg, #1D6FA4, #2589C8)',
          border: 'none', borderRadius: 8, padding: '10px 20px',
          color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>+ Nouveau client</button>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 12 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Rechercher un client..."
          style={{
            background: '#101F3A', border: '1px solid #1C3560',
            borderRadius: 8, padding: '9px 14px', color: '#E8EDF5',
            fontSize: 13, width: 280, outline: 'none',
          }}
        />
        <select
          value={statut}
          onChange={e => setStatut(e.target.value)}
          style={{
            background: '#101F3A', border: '1px solid #1C3560',
            borderRadius: 8, padding: '9px 14px', color: '#E8EDF5',
            fontSize: 13, outline: 'none',
          }}
        >
          <option value="">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
          <option value="suspendu">Suspendu</option>
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
              {['Entreprise', 'Secteur', 'Ville', 'Responsable', 'Téléphone', 'Statut', 'Actions'].map(h => (
                <th key={h} style={{
                  textAlign: 'left', padding: '12px 16px',
                  color: '#6B84AA', fontSize: 11,
                  fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#6B84AA', fontSize: 13 }}>
                  Chargement...
                </td>
              </tr>
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#6B84AA', fontSize: 13 }}>
                  Aucun client trouvé
                </td>
              </tr>
            ) : clients.map((c, i) => (
              <tr key={c.id}
                style={{ borderTop: '1px solid #1C356022' }}
                onMouseEnter={e => e.currentTarget.style.background = '#ffffff06'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8,
                      background: '#1D6FA422',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#2589C8', fontWeight: 700, fontSize: 14, flexShrink: 0,
                    }}>{c.raison_sociale?.[0]}</div>
                    <span style={{ color: '#E8EDF5', fontWeight: 600, fontSize: 13 }}>
                      {c.raison_sociale}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px', color: '#6B84AA', fontSize: 13 }}>{c.secteur_activite}</td>
                <td style={{ padding: '12px 16px', color: '#6B84AA', fontSize: 13 }}>{c.ville}</td>
                <td style={{ padding: '12px 16px', color: '#E8EDF5', fontSize: 13 }}>{c.nom_responsable}</td>
                <td style={{ padding: '12px 16px', color: '#6B84AA', fontSize: 13 }}>{c.telephone}</td>
                <td style={{ padding: '12px 16px' }}><Badge statut={c.statut} /></td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => navigate(`/app/clients/${c.id}`)}
                      style={{
                        background: '#1D6FA422', border: 'none', borderRadius: 6,
                        padding: '5px 12px', color: '#2589C8', fontSize: 12, cursor: 'pointer',
                      }}>Voir</button>
                    <button
                      onClick={() => { setEditClient(c); setModal(true); }}
                      style={{
                        background: '#F0A50022', border: 'none', borderRadius: 6,
                        padding: '5px 12px', color: '#F0A500', fontSize: 12, cursor: 'pointer',
                      }}>Éditer</button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      style={{
                        background: '#EF444422', border: 'none', borderRadius: 6,
                        padding: '5px 12px', color: '#EF4444', fontSize: 12, cursor: 'pointer',
                      }}>Suppr.</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 8,
            padding: '16px', borderTop: '1px solid #1C3560',
          }}>
            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => fetchClients(p)} style={{
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
        <ClientModal
          client={editClient}
          onClose={() => { setModal(false); setEditClient(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
