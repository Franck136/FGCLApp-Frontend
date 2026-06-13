import { useState, useEffect } from 'react';
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

export default function MonProfil() {
  const { user, login }   = useAuthStore();
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({ nom: '', prenom: '', telephone: '', password: '', password_confirmation: '' });

  useEffect(() => { fetchProfil(); }, []);

  const fetchProfil = async () => {
    try {
      const res = await api.get('/techniciens/mon-profil');
      setProfil(res.data);
      setForm({ nom: user?.nom || '', prenom: user?.prenom || '', telephone: user?.telephone || '', password: '', password_confirmation: '' });
    } catch {
      toast.error('Impossible de charger le profil.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (form.password && form.password !== form.password_confirmation) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }
    setSaving(true);
    try {
      const data = { nom: form.nom, prenom: form.prenom, telephone: form.telephone };
      if (form.password) data.password = form.password;
      const res = await api.put(`/users/${user?.id}`, data);
      login(res.data, localStorage.getItem('fgcl_token') || '');
      toast.success('Profil mis à jour.');
      setEditMode(false);
      setForm(f => ({ ...f, password: '', password_confirmation: '' }));
    } catch {
      toast.error('Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 800 }}>

      {/* Header profil */}
      <div style={{
        background: 'linear-gradient(135deg, #0F1E35, #1D6FA4)',
        borderRadius: 14, padding: '28px',
        display: 'flex', alignItems: 'center', gap: 20,
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, #F0A500, #FFD166)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 26, color: '#0F1E35', flexShrink: 0,
        }}>
          {user?.prenom?.[0]}{user?.nom?.[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 22, color: '#fff' }}>
            {user?.prenom} {user?.nom}
          </div>
          <div style={{ color: '#A0B4CC', fontSize: 13, marginTop: 3 }}>{user?.email}</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <span style={{
              background: '#F0A50033', color: '#F0A500',
              padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
            }}>Technicien</span>
            {profil?.disponible !== undefined && (
              <span style={{
                background: profil.disponible ? '#22C55E22' : '#EF444422',
                color: profil.disponible ? '#22C55E' : '#EF4444',
                padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              }}>
                {profil.disponible ? 'Disponible' : 'Indisponible'}
              </span>
            )}
          </div>
        </div>
        <button onClick={() => setEditMode(!editMode)} style={{
          background: editMode ? '#EF444422' : '#ffffff22',
          border: `1px solid ${editMode ? '#EF4444' : '#ffffff44'}`,
          borderRadius: 8, padding: '8px 16px',
          color: editMode ? '#EF4444' : '#fff',
          fontSize: 13, cursor: 'pointer',
        }}>
          {editMode ? '✕ Annuler' : '✏ Modifier'}
        </button>
      </div>

      {/* Formulaire édition */}
      {editMode && (
        <Card title="Modifier mes informations">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Prénom</label>
              <input style={inputStyle} value={form.prenom}
                onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Nom</label>
              <input style={inputStyle} value={form.nom}
                onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Téléphone</label>
              <input style={inputStyle} value={form.telephone}
                onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} />
            </div>
            <div />
            <div>
              <label style={labelStyle}>Nouveau mot de passe</label>
              <input type="password" style={inputStyle} value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Laisser vide pour ne pas changer" />
            </div>
            <div>
              <label style={labelStyle}>Confirmer le mot de passe</label>
              <input type="password" style={inputStyle} value={form.password_confirmation}
                onChange={e => setForm(f => ({ ...f, password_confirmation: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
            <button onClick={handleSave} disabled={saving} style={{
              background: 'linear-gradient(135deg, #1D6FA4, #2589C8)',
              border: 'none', borderRadius: 8, padding: '10px 28px',
              color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
            }}>
              {saving ? 'Enregistrement...' : 'Sauvegarder'}
            </button>
          </div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Infos compte */}
        <Card title="Informations du compte">
          <InfoRow label="Prénom"    value={user?.prenom} />
          <InfoRow label="Nom"       value={user?.nom} />
          <InfoRow label="Email"     value={user?.email} />
          <InfoRow label="Téléphone" value={user?.telephone} />
          <InfoRow label="Rôle"      value="Technicien" />
          <InfoRow label="Specialite"    value={""} />
          <InfoRow label="Statut"    value={user?.statut} />
        </Card>

        {/* Infos technicien */}
        {profil && (
          <Card title="Fiche technicien">
            <InfoRow label="Zone d'intervention"  value={profil.zone_intervention} />
            <InfoRow label="Type de contrat"      value={profil.type_contrat_travail} />
            <InfoRow label="Date d'embauche"      value={profil.date_embauche} />
            <InfoRow label="Disponibilité"
              value={profil.disponible ? '✅ Disponible' : '❌ Indisponible'} />
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: '#6B84AA', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                Spécialités
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {profil.specialites?.length > 0 ? profil.specialites.map(s => (
                  <span key={s.id} style={{
                    background: '#1D6FA422', color: '#2589C8',
                    padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  }}>{s.nom}</span>
                )) : <span style={{ color: '#6B84AA', fontSize: 13 }}>—</span>}
              </div>
            </div>
            {profil.pdf_contrat_path && (
              <div style={{
                background: '#22C55E22', border: '1px solid #22C55E44',
                borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#22C55E',
              }}>
                ✅ Contrat de travail PDF disponible
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
