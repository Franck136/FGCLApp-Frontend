import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
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
      padding: '2px 8px', borderRadius: 20,
      fontSize: 11, fontWeight: 600,
    }}>{statut?.replace('_', ' ')}</span>
  );
}

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MOIS  = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
               'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export default function MonPlanning() {
  const { user }   = useAuthStore();
  const navigate   = useNavigate();
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [view, setView] = useState('mois'); // 'mois' | 'semaine'

  useEffect(() => { fetchInterventions(); }, []);

  const fetchInterventions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/interventions', {
        params: { technicien_id: user?.id },
      });
      setInterventions(res.data.data ?? []);
    } catch {}
    finally { setLoading(false); }
  };

  // Interventions du jour sélectionné
  const interventionsDuJour = (date) => {
    if (!date) return [];
    return interventions.filter(inv => {
      const d = new Date(inv.date_planifiee);
      return d.getDate() === date.getDate() &&
             d.getMonth() === date.getMonth() &&
             d.getFullYear() === date.getFullYear();
    });
  };

  // Interventions du mois courant
  const interventionsDuMois = () => {
    return interventions.filter(inv => {
      const d = new Date(inv.date_planifiee);
      return d.getMonth() === currentDate.getMonth() &&
             d.getFullYear() === currentDate.getFullYear();
    });
  };

  // Couleur selon statut pour le calendrier
  const couleurStatut = (statut, priorite) => {
    if (priorite === 'haute') return '#EF4444';
    if (statut === 'terminee') return '#F59E0B';
    if (statut === 'en_cours') return '#60A5FA';
    return '#22C55E';
  };

  // Générer les jours du mois
  const genererJoursMois = () => {
    const annee = currentDate.getFullYear();
    const mois  = currentDate.getMonth();
    const premierJour = new Date(annee, mois, 1);
    const dernierJour = new Date(annee, mois + 1, 0);

    // Décalage pour commencer à lundi
    let jourDepart = premierJour.getDay() - 1;
    if (jourDepart < 0) jourDepart = 6;

    const jours = [];

    // Jours du mois précédent
    for (let i = jourDepart; i > 0; i--) {
      const d = new Date(annee, mois, 1 - i);
      jours.push({ date: d, autreMois: true });
    }

    // Jours du mois courant
    for (let i = 1; i <= dernierJour.getDate(); i++) {
      jours.push({ date: new Date(annee, mois, i), autreMois: false });
    }

    // Compléter avec jours du mois suivant
    const reste = 42 - jours.length;
    for (let i = 1; i <= reste; i++) {
      jours.push({ date: new Date(annee, mois + 1, i), autreMois: true });
    }

    return jours;
  };

  // Générer les jours de la semaine courante
  const genererJoursSemaine = () => {
    const debut = new Date(currentDate);
    const jour  = debut.getDay() || 7;
    debut.setDate(debut.getDate() - jour + 1);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(debut);
      d.setDate(debut.getDate() + i);
      return d;
    });
  };

  const moisPrecedent = () => {
    if (view === 'mois') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    }
    setSelectedDay(null);
  };

  const moisSuivant = () => {
    if (view === 'mois') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    }
    setSelectedDay(null);
  };

  const aujourd_hui = new Date();
  const jours = view === 'mois' ? genererJoursMois() : genererJoursSemaine().map(d => ({ date: d, autreMois: false }));
  const invMois = interventionsDuMois();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20, color: '#E8EDF5' }}>Mon planning</div>
          <div style={{ color: '#6B84AA', fontSize: 13 }}>
            {invMois.length} intervention(s) ce mois
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['mois', 'semaine'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              background: view === v ? '#1D6FA4' : '#101F3A',
              border: `1px solid ${view === v ? '#2589C8' : '#1C3560'}`,
              borderRadius: 8, padding: '7px 16px',
              color: view === v ? '#fff' : '#6B84AA',
              fontSize: 13, cursor: 'pointer', textTransform: 'capitalize',
            }}>{v}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>

        {/* Calendrier */}
        <div style={{
          background: '#101F3A', border: '1px solid #1C3560',
          borderRadius: 12, overflow: 'hidden',
        }}>
          {/* Navigation mois */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid #1C3560',
          }}>
            <button onClick={moisPrecedent} style={{
              background: '#0D1F3C', border: '1px solid #1C3560',
              borderRadius: 8, padding: '6px 12px', color: '#6B84AA',
              fontSize: 16, cursor: 'pointer',
            }}>←</button>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#E8EDF5' }}>
              {view === 'mois'
                ? `${MOIS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                : `Semaine du ${genererJoursSemaine()[0].toLocaleDateString('fr-FR')}`
              }
            </div>
            <button onClick={moisSuivant} style={{
              background: '#0D1F3C', border: '1px solid #1C3560',
              borderRadius: 8, padding: '6px 12px', color: '#6B84AA',
              fontSize: 16, cursor: 'pointer',
            }}>→</button>
          </div>

          {/* Jours de la semaine */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
            borderBottom: '1px solid #1C3560',
          }}>
            {JOURS.map(j => (
              <div key={j} style={{
                textAlign: 'center', padding: '10px 0',
                color: '#6B84AA', fontSize: 12, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: 0.5,
              }}>{j}</div>
            ))}
          </div>

          {/* Grille jours */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {jours.map(({ date, autreMois }, i) => {
              const invJour    = interventionsDuJour(date);
              const estAujdhui = date.toDateString() === aujourd_hui.toDateString();
              const estSelect  = selectedDay?.toDateString() === date.toDateString();

              return (
                <div key={i}
                  onClick={() => setSelectedDay(date)}
                  style={{
                    minHeight: view === 'semaine' ? 140 : 90,
                    padding: '8px',
                    borderRight: i % 7 !== 6 ? '1px solid #1C356033' : 'none',
                    borderBottom: '1px solid #1C356033',
                    cursor: 'pointer',
                    background: estSelect ? '#1D6FA422' : 'transparent',
                    transition: 'background 0.15s',
                    opacity: autreMois ? 0.35 : 1,
                  }}
                  onMouseEnter={e => !estSelect && (e.currentTarget.style.background = '#ffffff05')}
                  onMouseLeave={e => !estSelect && (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Numéro jour */}
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: estAujdhui ? '#1D6FA4' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: estAujdhui ? 700 : 400,
                    color: estAujdhui ? '#fff' : '#E8EDF5',
                    marginBottom: 4,
                  }}>{date.getDate()}</div>

                  {/* Points interventions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {invJour.slice(0, view === 'semaine' ? 5 : 2).map(inv => (
                      <div key={inv.id} style={{
                        background: couleurStatut(inv.statut, inv.priorite) + '33',
                        borderLeft: `2px solid ${couleurStatut(inv.statut, inv.priorite)}`,
                        borderRadius: 3, padding: '2px 5px',
                        fontSize: 10, color: couleurStatut(inv.statut, inv.priorite),
                        fontWeight: 600, whiteSpace: 'nowrap',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {inv.client?.raison_sociale ?? inv.reference}
                      </div>
                    ))}
                    {invJour.length > (view === 'semaine' ? 5 : 2) && (
                      <div style={{ fontSize: 10, color: '#6B84AA' }}>
                        +{invJour.length - (view === 'semaine' ? 5 : 2)} autres
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panneau latéral */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Aujourd'hui */}
          <div style={{
            background: '#101F3A', border: '1px solid #1C3560',
            borderRadius: 12, padding: '16px',
          }}>
            <div style={{ color: '#6B84AA', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
              Aujourd'hui
            </div>
            <div style={{ color: '#E8EDF5', fontWeight: 700, fontSize: 15 }}>
              {aujourd_hui.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            {interventionsDuJour(aujourd_hui).length === 0 ? (
              <div style={{ color: '#6B84AA', fontSize: 12, marginTop: 8 }}>
                Aucune intervention aujourd'hui
              </div>
            ) : (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {interventionsDuJour(aujourd_hui).map(inv => (
                  <div key={inv.id}
                    onClick={() => navigate(`/interventions/${inv.id}`)}
                    style={{
                      background: '#0D1F3C', borderRadius: 8, padding: '10px 12px',
                      borderLeft: `3px solid ${couleurStatut(inv.statut, inv.priorite)}`,
                      cursor: 'pointer',
                    }}>
                    <div style={{ color: '#2589C8', fontSize: 12, fontWeight: 700 }}>{inv.reference}</div>
                    <div style={{ color: '#E8EDF5', fontSize: 12 }}>{inv.client?.raison_sociale}</div>
                    <div style={{ color: '#6B84AA', fontSize: 11, marginTop: 3 }}>
                      {new Date(inv.date_planifiee).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Jour sélectionné */}
          {selectedDay && selectedDay.toDateString() !== aujourd_hui.toDateString() && (
            <div style={{
              background: '#101F3A', border: '1px solid #1D6FA4',
              borderRadius: 12, padding: '16px',
            }}>
              <div style={{ color: '#2589C8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
                {selectedDay.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              {interventionsDuJour(selectedDay).length === 0 ? (
                <div style={{ color: '#6B84AA', fontSize: 12 }}>Aucune intervention ce jour</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {interventionsDuJour(selectedDay).map(inv => (
                    <div key={inv.id}
                      onClick={() => navigate(`/interventions/${inv.id}`)}
                      style={{
                        background: '#0D1F3C', borderRadius: 8, padding: '10px 12px',
                        borderLeft: `3px solid ${couleurStatut(inv.statut, inv.priorite)}`,
                        cursor: 'pointer',
                      }}>
                      <div style={{ color: '#2589C8', fontSize: 12, fontWeight: 700 }}>{inv.reference}</div>
                      <div style={{ color: '#E8EDF5', fontSize: 12 }}>{inv.client?.raison_sociale}</div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
                        <Badge statut={inv.statut} />
                        <Badge statut={inv.priorite} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Légende */}
          <div style={{
            background: '#101F3A', border: '1px solid #1C3560',
            borderRadius: 12, padding: '16px',
          }}>
            <div style={{ color: '#6B84AA', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>
              Légende
            </div>
            {[
              { color: '#22C55E', label: 'Planifiée' },
              { color: '#60A5FA', label: 'En cours' },
              { color: '#F59E0B', label: 'Terminée' },
              { color: '#EF4444', label: 'Priorité haute' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: l.color }} />
                <span style={{ color: '#6B84AA', fontSize: 12 }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
