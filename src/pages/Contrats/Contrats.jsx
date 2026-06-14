import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

// ── Badge statut ──
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

//Regler la date
//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('fr-FR', {
//         day: 'numeric',
//         month: 'long',
//         year: 'numeric'
//     });
// };
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
};

// ── Modal Contrat ──
function ContratModal({ contrat, clients, onClose, onSaved }) {
  const isEdit = !!contrat;
  const [loading, setLoading] = useState(false);
  const [pdf, setPdf]         = useState(null);
  const [form, setForm]       = useState({
    client_id:           contrat?.client_id           || '',
    reference:           contrat?.reference           || '',
    type_contrat:        contrat?.type_contrat        || '',
    date_signature:      contrat?.date_signature      || '',
    date_debut:          contrat?.date_debut          || '',
    date_fin:            contrat?.date_fin            || '',
    renouvellement_auto: contrat?.renouvellement_auto || false,
    statut:              contrat?.statut              || 'actif',
  });

  const set = (k) => (e) => setForm(f => ({
    ...f,
    [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
  }));

  const handleSubmit = async () => {
    if (!form.client_id || !form.reference || !form.type_contrat || !form.date_signature || !form.date_debut || !form.date_fin) {
      toast.error('Remplissez tous les champs obligatoires (*)');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
     // Object.entries(form).forEach(([k, v]) => formData.append(k, v));
     Object.entries(form).forEach(([k, v]) => { 
        if( k=== 'renouvellement_auto'){
            formData.append(k, v?1:0);
        }else{
             formData.append(k, v);
        }
       });
      if (pdf) formData.append('pdf', pdf);

      if (isEdit) {
        await api.put(`/contrats/${contrat.id}`, form);
        if (pdf) {
          const pdfData = new FormData();
          pdfData.append('pdf', pdf);
          await api.post(`/contrats/${contrat.id}/pdf`, pdfData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
        toast.success('Contrat mis à jour.');
      } else {
        await api.post('/contrats', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Contrat créé avec succès.');
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
        borderRadius: 14, width: '100%', maxWidth: 620,
        maxHeight: '90vh', overflowY: 'auto', padding: 28,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: '#E8EDF5' }}>
              {isEdit ? 'Modifier le contrat' : 'Nouveau contrat'}
            </div>
            <div style={{ color: '#6B84AA', fontSize: 12, marginTop: 2 }}>
              Les champs * sont obligatoires
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6B84AA', fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>

        {/* Champs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Client */}
          <div>
            <label style={labelStyle}>Client *</label>
            <select style={inputStyle} value={form.client_id} onChange={set('client_id')}>
              <option value="">Sélectionner un client...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.raison_sociale}</option>
              ))}
            </select>
          </div>

          <div style={grid2}>
            {/* Référence */}
            <div>
              <label style={labelStyle}>Référence *</label>
              <input style={inputStyle} value={form.reference} onChange={set('reference')}
                placeholder="Ex: CTR-2026-001" disabled={isEdit} />
            </div>

            {/* Type */}
            <div>
              <label style={labelStyle}>Type de contrat *</label>
              <select style={inputStyle} value={form.type_contrat} onChange={set('type_contrat')}>
                <option value="">Sélectionner...</option>
                <option value="maintenance_preventive">Maintenance préventive</option>
                <option value="maintenance_corrective">Maintenance corrective</option>
                <option value="infogerance">Infogérance</option>
                <option value="installation">Installation</option>
              </select>
            </div>

            {/* Date signature */}
            <div>
              <label style={labelStyle}>Date de signature *</label>
              <input type="date" style={inputStyle} value={form.date_signature} onChange={set('date_signature')} />
            </div>

            {/* Statut */}
            <div>
              <label style={labelStyle}>Statut</label>
              <select style={inputStyle} value={form.statut} onChange={set('statut')}>
                <option value="actif">Actif</option>
                <option value="suspendu">Suspendu</option>
                <option value="expire">Expiré</option>
                <option value="resilie">Résilié</option>
              </select>
            </div>

            {/* Date début */}
            <div>
              <label style={labelStyle}>Date de début *</label>
              <input type="date" style={inputStyle} value={form.date_debut} onChange={set('date_debut')} />
            </div>

            {/* Date fin */}
            <div>
              <label style={labelStyle}>Date de fin *</label>
              <input type="date" style={inputStyle} value={form.date_fin} onChange={set('date_fin')} />
            </div>
          </div>

          {/* Renouvellement auto */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="checkbox"
              id="renouvellement"
              checked={form.renouvellement_auto}
              onChange={set('renouvellement_auto')}
              style={{ width: 16, height: 16, cursor: 'pointer' }}
            />
            <label htmlFor="renouvellement" style={{ color: '#E8EDF5', fontSize: 13, cursor: 'pointer' }}>
              Renouvellement automatique à échéance
            </label>
          </div>

          {/* Upload PDF */}
          <div>
            <label style={labelStyle}>Document PDF du contrat</label>
            <div style={{
              border: '2px dashed #1C3560', borderRadius: 8,
              padding: '16px', textAlign: 'center',
              cursor: 'pointer', transition: 'border-color 0.2s',
            }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); setPdf(e.dataTransfer.files[0]); }}
              onClick={() => document.getElementById('pdf-input').click()}
            >
              {pdf ? (
                <div style={{ color: '#22C55E', fontSize: 13 }}>
                  📄 {pdf.name}
                  <button onClick={e => { e.stopPropagation(); setPdf(null); }} style={{
                    marginLeft: 8, background: 'none', border: 'none',
                    color: '#EF4444', cursor: 'pointer', fontSize: 14,
                  }}>✕</button>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>📄</div>
                  <div style={{ color: '#6B84AA', fontSize: 13 }}>
                    Glisser-déposer ou cliquer pour sélectionner
                  </div>
                  <div style={{ color: '#3A5070', fontSize: 11, marginTop: 4 }}>
                    PDF uniquement · Max 10 MB
                  </div>
                  {contrat?.pdf_path && (
                    <div style={{ color: '#F0A500', fontSize: 11, marginTop: 6 }}>
                      ⚠ Un PDF existe déjà — le remplacer ?
                    </div>
                  )}
                </div>
              )}
              <input
                id="pdf-input" type="file" accept=".pdf"
                style={{ display: 'none' }}
                onChange={e => setPdf(e.target.files[0])}
              />
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
            {loading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer le contrat'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PAGE CONTRATS ──
export default function Contrats() {
  const navigate = useNavigate();
  const [contrats, setContrats]     = useState([]);
  const [clients, setClients]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [statut, setStatut]         = useState('');
  const [modal, setModal]           = useState(false);
  const [editContrat, setEditContrat] = useState(null);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchContrats();
    fetchClients();
  }, [statut]);

  const fetchContrats = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page };
      if (statut) params.statut = statut;
      const res = await api.get('/contrats', { params });
      setContrats(res.data.data ?? []);
      setPagination(res.data);
    } catch {
      toast.error('Erreur lors du chargement des contrats.');
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
    if (!window.confirm('Supprimer ce contrat ?')) return;
    try {
      await api.delete(`/contrats/${id}`);
      toast.success('Contrat supprimé.');
      fetchContrats();
    } catch {
      toast.error('Impossible de supprimer ce contrat.');
    }
  };

  const handleRenouveler = async (id) => {
    if (!window.confirm('Renouveler ce contrat ?')) return;
    try {
      await api.post(`/contrats/${id}/renouveler`);
      toast.success('Contrat renouvelé.');
      fetchContrats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors du renouvellement.');
    }
  };

  const handleDownloadPdf = async (id, reference) => {
    try {
      const res = await api.get(`/contrats/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Contrat-${reference}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Aucun PDF disponible pour ce contrat.');
    }
  };

  const joursRestants = (dateFin) => {
    const diff = Math.ceil((new Date(dateFin) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20, color: '#E8EDF5' }}>Contrats</div>
          <div style={{ color: '#6B84AA', fontSize: 13 }}>
            {pagination.total ?? 0} contrat(s) enregistré(s)
          </div>
        </div>
        <button onClick={() => { setEditContrat(null); setModal(true); }} style={{
          background: 'linear-gradient(135deg, #1D6FA4, #2589C8)',
          border: 'none', borderRadius: 8, padding: '10px 20px',
          color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>+ Nouveau contrat</button>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 12 }}>
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
          <option value="suspendu">Suspendu</option>
          <option value="expire">Expiré</option>
          <option value="resilie">Résilié</option>
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
              {['Référence', 'Client', 'Type', 'Signature', 'Début', 'Fin', 'Échéance', 'Statut', 'Actions'].map(h => (
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
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#6B84AA', fontSize: 13 }}>Chargement...</td></tr>
            ) : contrats.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#6B84AA', fontSize: 13 }}>Aucun contrat trouvé</td></tr>
            ) : contrats.map((c) => {
              const jours = joursRestants(c.date_fin);
              const expireBientot = jours >= 0 && jours <= 30;
              return (
                <tr key={c.id}
                  style={{ borderTop: '1px solid #1C356022' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#ffffff06'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '11px 14px', color: '#2589C8', fontSize: 13, fontWeight: 600 }}>{c.reference}</td>
                  <td style={{ padding: '11px 14px', color: '#E8EDF5', fontSize: 13 }}>{c.client?.raison_sociale ?? '—'}</td>
                  <td style={{ padding: '11px 14px', color: '#6B84AA', fontSize: 12 }}>{c.type_contrat?.replace(/_/g, ' ')}</td>
                  <td style={{ padding: '11px 14px', color: '#6B84AA', fontSize: 12 }}>{formatDate(c.date_signature)}</td>
                  <td style={{ padding: '11px 14px', color: '#6B84AA', fontSize: 12 }}>{formatDate(c.date_debut)}</td>
                  <td style={{ padding: '11px 14px', color: '#6B84AA', fontSize: 12 }}>{formatDate(c.date_fin)}</td>
                  <td style={{ padding: '11px 14px' }}>
                    {expireBientot ? (
                      <span style={{
                        color: jours <= 7 ? '#EF4444' : '#F59E0B',
                        fontWeight: 700, fontSize: 12,
                      }}>J-{jours}</span>
                    ) : (
                      <span style={{ color: '#3A5070', fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '11px 14px' }}><Badge statut={c.statut} /></td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button onClick={() => navigate(`/app/contrats/${c.id}`)} style={{
                        background: '#1D6FA422', border: 'none', borderRadius: 6,
                        padding: '4px 10px', color: '#2589C8', fontSize: 11, cursor: 'pointer',
                      }}>Voir</button>
                      <button onClick={() => { setEditContrat(c); setModal(true); }} style={{
                        background: '#F0A50022', border: 'none', borderRadius: 6,
                        padding: '4px 10px', color: '#F0A500', fontSize: 11, cursor: 'pointer',
                      }}>Éditer</button>
                      {c.pdf_path && (
                        <button onClick={() => handleDownloadPdf(c.id, c.reference)} style={{
                          background: '#22C55E22', border: 'none', borderRadius: 6,
                          padding: '4px 10px', color: '#22C55E', fontSize: 11, cursor: 'pointer',
                        }}>📄 PDF</button>
                      )}
                      {c.statut === 'actif' && (
                        <button onClick={() => handleRenouveler(c.id)} style={{
                          background: '#A855F722', border: 'none', borderRadius: 6,
                          padding: '4px 10px', color: '#A855F7', fontSize: 11, cursor: 'pointer',
                        }}>↻ Renouveler</button>
                      )}
                      <button onClick={() => handleDelete(c.id)} style={{
                        background: '#EF444422', border: 'none', borderRadius: 6,
                        padding: '4px 10px', color: '#EF4444', fontSize: 11, cursor: 'pointer',
                      }}>Suppr.</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px', borderTop: '1px solid #1C3560' }}>
            {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => fetchContrats(p)} style={{
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
        <ContratModal
          contrat={editContrat}
          clients={clients}
          onClose={() => { setModal(false); setEditContrat(null); }}
          onSaved={() => { setModal(false); setEditContrat(null); fetchContrats(); }}
        />
      )}
    </div>
  );
}
