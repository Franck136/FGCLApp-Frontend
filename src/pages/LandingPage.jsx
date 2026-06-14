import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    { icon: '🖥', titre: 'Maintenance préventive', desc: 'Interventions planifiées pour garantir la continuité de votre parc informatique et éviter les pannes.' },
    { icon: '🔧', titre: 'Maintenance corrective', desc: 'Dépannage rapide et efficace de vos équipements informatiques en cas de défaillance.' },
    { icon: '📡', titre: 'Infogérance', desc: 'Gestion complète de votre infrastructure IT. Vous vous concentrez sur votre cœur de métier.' },
    { icon: '⚙', titre: 'Installation & déploiement', desc: 'Installation, configuration et mise en service de vos équipements et logiciels.' },
    { icon: '🔒', titre: 'Sécurité informatique', desc: 'Protection de vos données et systèmes contre les menaces et cyberattaques.' },
    { icon: '☁', titre: 'Support & assistance', desc: 'Assistance technique disponible pour vos équipes, à distance ou sur site.' },
  ];

  const chiffres = [
    { valeur: '10+', label: 'Années d\'expérience' },
    { valeur: '150+', label: 'Clients satisfaits' },
    { valeur: '500+', label: 'Interventions / an' },
    { valeur: '15', label: 'Techniciens experts' },
  ];

  const temoignages = [
    { nom: 'Jean-Paul MBARGA', poste: 'DSI — SOGETRA SA', texte: 'FGCL assure la maintenance de notre parc depuis 5 ans. Réactivité et professionnalisme au rendez-vous.', initiales: 'JM' },
    { nom: 'Alice NKONO', poste: 'Responsable IT — Ecobank', texte: 'Grâce à FGCL, nos incidents informatiques ont diminué de 60%. Un partenaire de confiance.', initiales: 'AN' },
    { nom: 'Paul TAMBA', poste: 'Directeur — CDE Douala', texte: 'L\'équipe FGCL est toujours disponible. Nos équipements sont bien entretenus et nos équipes sereines.', initiales: 'PT' },
  ];

  return (
    <div style={{ fontFamily: "'Sora', sans-serif", background: '#08132A', color: '#E8EDF5', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0D1F3C; }
        ::-webkit-scrollbar-thumb { background: #1C3560; border-radius: 3px; }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        .fade-in { animation: fadeInUp 0.8s ease forwards; }
        .float { animation: float 4s ease-in-out infinite; }
        .service-card:hover { transform: translateY(-6px); border-color: #1D6FA4 !important; }
        .service-card { transition: all 0.3s ease; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px #1D6FA460; }
        .btn-primary { transition: all 0.2s ease; }
        .btn-secondary:hover { background: #ffffff15 !important; transform: translateY(-2px); }
        .btn-secondary { transition: all 0.2s ease; }
        .nav-link:hover { color: #2589C8 !important; }
        .nav-link { transition: color 0.2s; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? '#0D1F3Cee' : 'transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        borderBottom: scrolled ? '1px solid #1C3560' : 'none',
        transition: 'all 0.3s ease',
        padding: '0 60px', height: 70,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #1D6FA4, #2589C8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>⚙</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16, color: '#E8EDF5', letterSpacing: 1 }}>FGCL SARL</div>
            <div style={{ fontSize: 10, color: '#6B84AA', letterSpacing: 0.5 }}>Services Informatiques</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {['#services', '#chiffres', '#temoignages', '#contact'].map((href, i) => (
            <a key={i} href={href} className="nav-link" style={{
              color: '#A0B4CC', fontSize: 13, fontWeight: 600,
              textDecoration: 'none', letterSpacing: 0.3,
            }}>
              {['Services', 'Chiffres', 'Témoignages', 'Contact'][i]}
            </a>
          ))}
          <button className="btn-primary" onClick={() => navigate('/login')} style={{
            background: 'linear-gradient(135deg, #1D6FA4, #2589C8)',
            border: 'none', borderRadius: 8, padding: '9px 22px',
            color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>
            Accéder à la plateforme →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #08132A 0%, #0F1E35 50%, #0A1628 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', padding: '120px 60px 80px',
      }}>
        {/* Cercles décoratifs */}
        <div style={{
          position: 'absolute', top: '10%', right: '5%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, #1D6FA420 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', left: '5%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, #F0A50015 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Grille décorative */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(#1C356015 1px, transparent 1px), linear-gradient(90deg, #1C356015 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div style={{ maxWidth: 900, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div className="fade-in" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#1D6FA422', border: '1px solid #1D6FA444',
            borderRadius: 20, padding: '6px 16px', marginBottom: 28,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', animation: 'pulse 2s infinite' }} />
            <span style={{ color: '#2589C8', fontSize: 13, fontWeight: 600 }}>
              Douala, Cameroun · Services IT depuis 2010
            </span>
          </div>

          {/* Titre */}
          <h1 className="fade-in" style={{
            fontSize: 58, fontWeight: 900, lineHeight: 1.1,
            color: '#E8EDF5', marginBottom: 20, letterSpacing: -1,
          }}>
            Votre partenaire IT<br />
            <span style={{
              background: 'linear-gradient(135deg, #1D6FA4, #2589C8, #F0A500)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>de confiance</span> au Cameroun
          </h1>

          {/* Sous-titre */}
          <p className="fade-in" style={{
            fontSize: 18, color: '#8A9BBD', lineHeight: 1.7,
            maxWidth: 640, margin: '0 auto 40px',
          }}>
            FGCL SARL assure la maintenance, l'infogérance et le support informatique
            des entreprises au Cameroun. Réactivité, expertise et proximité.
          </p>

          {/* CTA */}
          <div className="fade-in" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => navigate('/login')} style={{
              background: 'linear-gradient(135deg, #1D6FA4, #2589C8)',
              border: 'none', borderRadius: 10, padding: '14px 32px',
              color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            }}>
              Accéder à la plateforme →
            </button>
            <a href="#services" className="btn-secondary" style={{
              background: '#ffffff0a', border: '1px solid #1C3560',
              borderRadius: 10, padding: '14px 32px',
              color: '#A0B4CC', fontSize: 15, fontWeight: 600,
              textDecoration: 'none', display: 'inline-block',
            }}>
              Découvrir nos services
            </a>
          </div>

          {/* Stats rapides */}
          <div style={{
            display: 'flex', gap: 40, justifyContent: 'center',
            marginTop: 60, flexWrap: 'wrap',
          }}>
            {chiffres.map((c, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#2589C8' }}>{c.valeur}</div>
                <div style={{ fontSize: 12, color: '#6B84AA', marginTop: 3 }}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" style={{ padding: '100px 60px', background: '#0D1F3C' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{
              display: 'inline-block', background: '#1D6FA422',
              border: '1px solid #1D6FA444', borderRadius: 20,
              padding: '5px 16px', marginBottom: 16,
              color: '#2589C8', fontSize: 12, fontWeight: 700, letterSpacing: 1,
              textTransform: 'uppercase',
            }}>Nos services</div>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: '#E8EDF5', marginBottom: 12 }}>
              Une offre complète pour votre IT
            </h2>
            <p style={{ color: '#6B84AA', fontSize: 15, maxWidth: 500, margin: '0 auto' }}>
              De la maintenance préventive à l'infogérance complète, nous couvrons tous vos besoins informatiques.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {services.map((s, i) => (
              <div key={i} className="service-card" style={{
                background: '#101F3A', border: '1px solid #1C3560',
                borderRadius: 14, padding: '28px 24px',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 12, marginBottom: 18,
                  background: '#1D6FA422', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 26,
                }}>{s.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#E8EDF5', marginBottom: 10 }}>
                  {s.titre}
                </h3>
                <p style={{ color: '#6B84AA', fontSize: 13, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHIFFRES ── */}
      <section id="chiffres" style={{
        padding: '100px 60px',
        background: 'linear-gradient(135deg, #0F1E35, #1D6FA415)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block', background: '#F0A50022',
            border: '1px solid #F0A50044', borderRadius: 20,
            padding: '5px 16px', marginBottom: 16,
            color: '#F0A500', fontSize: 12, fontWeight: 700, letterSpacing: 1,
            textTransform: 'uppercase',
          }}>Nos chiffres</div>
          <h2 style={{ fontSize: 38, fontWeight: 800, color: '#E8EDF5', marginBottom: 60 }}>
            La confiance en chiffres
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              { valeur: '10+', label: 'Années d\'expérience', icon: '🏆', color: '#F0A500' },
              { valeur: '150+', label: 'Clients satisfaits', icon: '🏢', color: '#1D6FA4' },
              { valeur: '500+', label: 'Interventions / an', icon: '🔧', color: '#22C55E' },
              { valeur: '99%', label: 'Taux de satisfaction', icon: '⭐', color: '#A855F7' },
            ].map((c, i) => (
              <div key={i} style={{
                background: '#101F3A', border: `1px solid ${c.color}33`,
                borderRadius: 16, padding: '36px 24px',
              }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>{c.icon}</div>
                <div style={{ fontSize: 44, fontWeight: 900, color: c.color, lineHeight: 1 }}>
                  {c.valeur}
                </div>
                <div style={{ color: '#6B84AA', fontSize: 13, marginTop: 8 }}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section id="temoignages" style={{ padding: '100px 60px', background: '#0D1F3C' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{
              display: 'inline-block', background: '#22C55E22',
              border: '1px solid #22C55E44', borderRadius: 20,
              padding: '5px 16px', marginBottom: 16,
              color: '#22C55E', fontSize: 12, fontWeight: 700, letterSpacing: 1,
              textTransform: 'uppercase',
            }}>Témoignages</div>
            <h2 style={{ fontSize: 38, fontWeight: 800, color: '#E8EDF5' }}>
              Ce que disent nos clients
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {temoignages.map((t, i) => (
              <div key={i} style={{
                background: '#101F3A', border: '1px solid #1C3560',
                borderRadius: 14, padding: '28px 24px',
              }}>
                <div style={{ fontSize: 32, color: '#1D6FA4', marginBottom: 14, fontWeight: 900 }}>"</div>
                <p style={{ color: '#A0B4CC', fontSize: 14, lineHeight: 1.8, marginBottom: 20 }}>
                  {t.texte}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1D6FA4, #2589C8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 14, color: '#fff', flexShrink: 0,
                  }}>{t.initiales}</div>
                  <div>
                    <div style={{ color: '#E8EDF5', fontWeight: 700, fontSize: 14 }}>{t.nom}</div>
                    <div style={{ color: '#6B84AA', fontSize: 12 }}>{t.poste}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT / CTA FINAL ── */}
      <section id="contact" style={{
        padding: '100px 60px',
        background: 'linear-gradient(135deg, #08132A, #0F1E35)',
      }}>
        <div style={{
          maxWidth: 800, margin: '0 auto', textAlign: 'center',
          background: 'linear-gradient(135deg, #1D6FA415, #0D1F3C)',
          border: '1px solid #1C3560', borderRadius: 20, padding: '60px 40px',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📞</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#E8EDF5', marginBottom: 14 }}>
            Contactez-nous
          </h2>
          <p style={{ color: '#6B84AA', fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
            Vous avez un besoin en maintenance informatique ? <br />
            Notre équipe est disponible pour vous accompagner.
          </p>

          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 }}>
            {[
              { icon: '📍', label: 'Adresse', value: 'Douala, Cameroun' },
              { icon: '📞', label: 'Téléphone', value: '+237 693 273 039' },
              { icon: '✉', label: 'Email', value: 'Fgcl@gmail.cm' },
            ].map((c, i) => (
              <div key={i} style={{
                background: '#0D1F3C', border: '1px solid #1C3560',
                borderRadius: 10, padding: '14px 20px', textAlign: 'center',
                minWidth: 160,
              }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{c.icon}</div>
                <div style={{ color: '#6B84AA', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>
                  {c.label}
                </div>
                <div style={{ color: '#E8EDF5', fontSize: 13, fontWeight: 600 }}>{c.value}</div>
              </div>
            ))}
          </div>

          <button className="btn-primary" onClick={() => navigate('/login')} style={{
            background: 'linear-gradient(135deg, #1D6FA4, #2589C8)',
            border: 'none', borderRadius: 10, padding: '14px 36px',
            color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
          }}>
            Accéder à la plateforme →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: '#050E1E',
        borderTop: '1px solid #1C3560',
        padding: '30px 60px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, #1D6FA4, #2589C8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>⚙</div>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#E8EDF5' }}>FGCL SARL</span>
        </div>
        <div style={{ color: '#3A5070', fontSize: 13 }}>
          © 2026 FGCL SARL · Tous droits réservés · Douala, Cameroun
        </div>
        <button onClick={() => navigate('/login')} style={{
          background: 'transparent', border: '1px solid #1C3560',
          borderRadius: 8, padding: '7px 16px',
          color: '#6B84AA', fontSize: 13, cursor: 'pointer',
        }}>
          Connexion →
        </button>
      </footer>
    </div>
  );
}
