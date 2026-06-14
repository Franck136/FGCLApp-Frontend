import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import useAuthStore from '../../store/authStore';

export default function Login() {
  const navigate  = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/login', data);
      login(res.data.user, res.data.token);
      toast.success(`Bienvenue, ${res.data.user.prenom} !`);
      //Window.location.href = '/app/dashbord';
      navigate('/app/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Identifiants incorrects.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#08132A]">

      {/* Fond décoratif */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#1D6FA4] opacity-5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#F0A500] opacity-5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md px-4">

        {/* Card */}
        <div className="bg-[#101F3A] border border-[#1C3560] rounded-2xl p-10 shadow-2xl">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1D6FA4] to-[#2589C8] flex items-center justify-center text-3xl mb-4 shadow-lg">
              ⚙
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              FGCL SARL
            </h1>
            <p className="text-sm text-[#6B84AA] mt-1">
              Plateforme de gestion IT
            </p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#6B84AA] uppercase tracking-wider mb-2">
                Adresse email
              </label>
              <input
                type="email"
                placeholder="admin@fgcl.cm"
                autoComplete="email"
                className={`w-full bg-[#0D1F3C] border rounded-xl px-4 py-3 text-white placeholder-[#3A5070] text-sm outline-none transition-all focus:border-[#1D6FA4] focus:ring-1 focus:ring-[#1D6FA4]
                  ${errors.email ? 'border-red-500' : 'border-[#1C3560]'}`}
                {...register('email', {
                  required: 'Email obligatoire',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Email invalide',
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-xs font-semibold text-[#6B84AA] uppercase tracking-wider mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full bg-[#0D1F3C] border rounded-xl px-4 py-3 pr-12 text-white placeholder-[#3A5070] text-sm outline-none transition-all focus:border-[#1D6FA4] focus:ring-1 focus:ring-[#1D6FA4]
                    ${errors.password ? 'border-red-500' : 'border-[#1C3560]'}`}
                  {...register('password', {
                    required: 'Mot de passe obligatoire',
                    minLength: { value: 6, message: 'Minimum 6 caractères' },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B84AA] hover:text-white transition-colors text-lg"
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Bouton connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#1D6FA4] to-[#2589C8] hover:from-[#186090] hover:to-[#1D6FA4] text-white font-bold py-3 rounded-xl transition-all duration-200 text-sm tracking-wide shadow-lg disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Connexion en cours...
                </span>
              ) : 'Se connecter →'}
            </button>

          </form>

          {/* Footer card */}
          <p className="text-center text-xs text-[#3A5070] mt-8">
            Accès réservé au personnel & partenaires FGCL SARL 
          </p>
        </div>

        {/* Version */}
        <p className="text-center text-xs text-[#2A3F60] mt-4">
          v1.0.0 · FGCL SARL © 2026
        </p>
      </div>
    </div>
  );
}
