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

function StatMini({ label, value, color }) {
  return (
    <div style={{
      background: '#0D1F3C', borderRadius: 10,
      padding: '14px 18px', textAlign: 'center',
      border: '1px solid #1C3560',
    }}>
      <div style={{ fontSize: 24, fontWeight: 800, color }}>{value ?? 0}</div>
      <div style={{ color: '#6B84AA', fontSize: 12, marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient]   = useState(null);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClient();
    fetchStats();
  }, [id]);

  const fetchClient = async () => {
    try {
      const res = await api.get(`/clients/${id}`);
      setClient(res.data);
    } catch {
      toast.error('Client introuvable.');
      navigate('/clients');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get(`/clients/${id}/statistiques`);
      setStats(res.data);
    } catch {}
  };

  if (loading) return (
    <div style={{ color: '#6B84AA', textAlign: 'center', padding: '60px', fontSize: 14 }}>
      Chargement...
    </div>
  );

  if (!client) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => navigate('/clients')} style={{
          background: '#101F3A', border: '1px solid #1C3560',
          borderRadius: 8, padding: '8px 14px',
          color: '#6B84AA', fontSize: 13, cursor: 'pointer',
        }}>← Retour</button>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20, color: '#E8EDF5' }}>
            {client.raison_sociale}
          </div>
          <div style={{ color: '#6B84AA', fontSize: 13 }}>
            {client.secteur_activite} · {client.ville}
          </div>
        </div>
        <span style={{
          marginLeft: 'auto',
          background: client.statut === 'actif' ? '#1A3A2A' : '#3A1A1A',
          color: client.statut === 'actif' ? '#22C55E' : '#EF4444',
          padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
        }}>{client.statut}</span>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          <StatMini label="Contrats"         value={stats.contrats_total}          color="#1D6FA4" />
          <StatMini label="Contrats actifs"  value={stats.contrats_actifs}         color="#22C55E" />
          <StatMini label="Interventions"    value={stats.interventions_total}      color="#F59E0B" />
          <StatMini label="Équipements"      value={stats.equipements_total}        color="#A855F7" />
          <StatMini label="Hors service"     value={stats.equipements_hors_service} color="#EF4444" />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Identification */}
        <Card title="Identification">
          <InfoRow label="Raison sociale"      value={client.raison_sociale} />
          <InfoRow label="Forme juridique"     value={client.forme_juridique} />
          <InfoRow label="N° Contribuable"     value={client.numero_contribuable} />
          <InfoRow label="Secteur d'activité"  value={client.secteur_activite} />
          <InfoRow label="Statut"              value={client.statut} />
        </Card>

        {/* Localisation */}
        <Card title="Localisation">
          <InfoRow label="Adresse"  value={client.adresse} />
          <InfoRow label="Ville"    value={client.ville} />
          <InfoRow label="Région"   value={client.region} />
          <InfoRow label="Email"    value={client.email} />
          <InfoRow label="Téléphone" value={client.telephone} />
        </Card>

        {/* Contact principal */}
        <Card title="Contact principal">
          <InfoRow label="Nom & Prénom" value={client.nom_responsable} />
          <InfoRow label="Poste"        value={client.poste_responsable} />
          <InfoRow label="Téléphone"    value={client.telephone_responsable} />
          <InfoRow label="Email"        value={client.email_responsable} />
        </Card>

        {/* Contact secondaire */}
        <Card title="Contact secondaire">
          <InfoRow label="Nom & Prénom" value={client.nom_contact2} />
          <InfoRow label="Téléphone"    value={client.telephone_contact2} />
          <InfoRow label="Email"        value={client.email_contact2} />
        </Card>
      </div>

      {/* Contrats récents */}
      {client.contrats?.length > 0 && (
        <Card title={`Contrats (${client.contrats.length})`}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Référence', 'Type', 'Début', 'Fin', 'Statut'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '8px 12px',
                    color: '#6B84AA', fontSize: 11,
                    fontWeight: 600, textTransform: 'uppercase',
                    borderBottom: '1px solid #1C3560',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {client.contrats.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #1C356022' }}>
                  <td style={{ padding: '10px 12px', color: '#2589C8', fontSize: 13, fontWeight: 600 }}>{c.reference}</td>
                  <td style={{ padding: '10px 12px', color: '#6B84AA', fontSize: 13 }}>{c.type_contrat}</td>
                  <td style={{ padding: '10px 12px', color: '#6B84AA', fontSize: 13 }}>{c.date_debut}</td>
                  <td style={{ padding: '10px 12px', color: '#6B84AA', fontSize: 13 }}>{c.date_fin}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      background: c.statut === 'actif' ? '#1A3A2A' : '#3A1A1A',
                      color: c.statut === 'actif' ? '#22C55E' : '#EF4444',
                      padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    }}>{c.statut}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Équipements */}
      {client.equipements?.length > 0 && (
        <Card title={`Équipements (${client.equipements.length})`}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Type', 'Marque', 'Modèle', 'N° Série', 'État', 'Localisation'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '8px 12px',
                    color: '#6B84AA', fontSize: 11,
                    fontWeight: 600, textTransform: 'uppercase',
                    borderBottom: '1px solid #1C3560',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {client.equipements.map(e => (
                <tr key={e.id} style={{ borderBottom: '1px solid #1C356022' }}>
                  <td style={{ padding: '10px 12px', color: '#E8EDF5', fontSize: 13 }}>{e.type_equipement}</td>
                  <td style={{ padding: '10px 12px', color: '#6B84AA', fontSize: 13 }}>{e.marque}</td>
                  <td style={{ padding: '10px 12px', color: '#6B84AA', fontSize: 13 }}>{e.modele}</td>
                  <td style={{ padding: '10px 12px', color: '#6B84AA', fontSize: 13 }}>{e.numero_serie || '—'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      background: e.etat === 'bon' ? '#1A3A2A' : e.etat === 'degrade' ? '#2A2A1A' : '#3A1A1A',
                      color: e.etat === 'bon' ? '#22C55E' : e.etat === 'degrade' ? '#F59E0B' : '#EF4444',
                      padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    }}>{e.etat}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#6B84AA', fontSize: 13 }}>{e.localisation || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

    </div>
  );
}
