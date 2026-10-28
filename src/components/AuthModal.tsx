import React, { useState } from 'react';
import { useAuth, DEMO_USER } from '../context/AuthContext';
import {
  X,
  LogIn,
  User,
  Mail,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  LogOut,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    user,
    isDemoMode,
    authError,
    clearAuthError,
    signInWithGoogle,
    setPersonalUser,
    enableDemoMode,
    signOut,
    isAuthModalOpen,
    closeAuthModal,
  } = useAuth();

  const [name, setName] = useState(
    user?.displayName && user.displayName !== 'Pengguna Demo'
      ? user.displayName
      : 'Vinsensius'
  );
  const [email, setEmail] = useState(
    user?.email && user.email !== DEMO_USER.email
      ? user.email
      : 'vinsensiua83@gmail.com'
  );
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsSubmittingGoogle(true);
    const success = await signInWithGoogle();
    setIsSubmittingGoogle(false);
    if (success) {
      closeAuthModal();
    }
  };

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setPersonalUser(name.trim(), email.trim());
  };

  const isCurrentDemo = isDemoMode || user?.email === DEMO_USER.email;
  const isCurrentGoogle = !isCurrentDemo && user && 'providerData' in user;
  const isCurrentPersonal = !isCurrentDemo && !isCurrentGoogle && !!user;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Pengaturan Akun & Profil
              </h2>
              <p className="text-xs text-slate-400">
                Pilih akun untuk mencatat keuangan Anda
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Current Status Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Status Akun Aktif
              </span>
              {isCurrentDemo ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 text-[10px] font-bold">
                  Mode Demo
                </span>
              ) : isCurrentGoogle ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Akun Google
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Akun Pribadi
                </span>
              )}
            </div>

            <div className="mt-2.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                {user?.displayName?.charAt(0) || 'P'}
              </div>
              <div className="truncate">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {user?.displayName || 'Pengguna'}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {user?.email || 'Belum terhubung'}
                </p>
              </div>
            </div>
          </div>

          {/* Auth Error Notification */}
          {authError && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 text-xs space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Info Autentikasi Google:</p>
                  <p className="text-[11px] leading-relaxed text-rose-800 dark:text-rose-300">
                    {authError}
                  </p>
                </div>
              </div>

              {authError.includes('Firebase Authorized Domains') && (
                <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/40 text-[11px] text-rose-700 dark:text-rose-300">
                  <p className="font-semibold">💡 Solusi Cepat:</p>
                  <p className="mt-0.5">
                    Gunakan <strong>Akun Pribadi</strong> di bawah untuk langsung menggunakan akun dan nama Anda (vinsensiua83@gmail.com) tanpa perlu mengubah pengaturan Firebase Console!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Option A: Masuk dengan Google */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Opsi 1: Masuk dengan Google (Cloud Firestore)
            </span>
            <button
              onClick={handleGoogleSignIn}
              disabled={isSubmittingGoogle}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2.5 shadow-sm active:scale-98 transition-all disabled:opacity-50"
            >
              {isSubmittingGoogle ? (
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Masuk dengan Google</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
              ATAU
            </span>
          </div>

          {/* Option B: Gunakan Akun Pribadi (Nama & Email) */}
          <form onSubmit={handleSavePersonal} className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Opsi 2: Gunakan Profil Akun Anda Sendiri
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Langsung Aktif
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2.5">
                Bebas dari pesan demo. Catatan keuangan tersimpan khusus untuk akun Anda.
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Nama Lengkap / Panggilan
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Vinsensius"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-semibold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Alamat Email Anda
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vinsensiua83@gmail.com"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-semibold"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Gunakan Akun Pribadi Ini</span>
            </button>
          </form>

          {/* Option C: Mode Demo / Keluar */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={enableDemoMode}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold py-1 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Mode Demo
            </button>

            <button
              type="button"
              onClick={() => {
                signOut();
                closeAuthModal();
              }}
              className="text-rose-600 hover:text-rose-700 font-semibold py-1 flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar Akun
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
