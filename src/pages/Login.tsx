import React, { useState, useEffect } from 'react';
import { Mail, Lock, User as UserIcon, Shield, GraduationCap, Loader2 } from 'lucide-react';


import { loginFirebase, registerFirebase } from '../services/auth';
import type { User } from '../services/auth';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'admin' | 'guru'>('guru');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Clear states when toggling views
  useEffect(() => {
    setError('');
    setSuccessMsg('');
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        const user = await loginFirebase(email, password);
        setSuccessMsg(`Selamat datang kembali, ${user.fullName}!`);
        setTimeout(() => {
          onLoginSuccess(user);
        }, 1000);
      } else {
        if (!fullName.trim()) {
          throw new Error('Nama Lengkap wajib diisi!');
        }
        if (password.length < 6) {
          throw new Error('Password minimal 6 karakter!');
        }
        const user = await registerFirebase(email, password, fullName, role);
        setSuccessMsg(`Registrasi berhasil! Selamat datang, ${user.fullName}!`);
        setTimeout(() => {
          onLoginSuccess(user);
        }, 1000);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoRole: 'admin' | 'guru') => {
    if (demoRole === 'admin') {
      setEmail('admin@sekolah.sch.id');
      setPassword('admin123');
    } else {
      setEmail('guru@sekolah.sch.id');
      setPassword('guru123');
    }
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 p-4 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 relative z-10">
        
        {/* App Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 p-1 border border-white/20 overflow-hidden flex items-center justify-center">
              <img src="/logo-kiri.jpg" alt="Logo Pemda" className="w-full h-full object-contain" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/10 p-1 border border-white/20 overflow-hidden flex items-center justify-center">
              <img src="/logo-kanan.jpg" alt="Logo SMKN 2 Tikep" className="w-full h-full object-contain" />
            </div>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Smart School Letter</h1>
          <p className="text-xs text-blue-300 font-bold uppercase tracking-wider mt-0.5">SMKN 2 Kota Tidore Kepulauan</p>
          <p className="text-[11px] text-slate-400 mt-1">Sistem Pembuat & Editor Surat Dinas Otomatis</p>
        </div>


        {/* Tab Toggle */}
        <div className="flex bg-slate-950/40 p-1 rounded-xl mb-6 border border-white/5">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
              isLogin ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Masuk
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
              !isLogin ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Daftar Akun
          </button>
        </div>

        {/* Form Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm font-medium animate-pulse">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm font-medium">
            {successMsg}
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap beserta Gelar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/30 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                placeholder="nama@sekolah.sch.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/30 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/30 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Pilih Peran (Role)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('guru')}
                  className={`flex items-center justify-center gap-2 p-3 border rounded-xl font-medium transition-all ${
                    role === 'guru'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'border-white/10 bg-slate-950/20 text-slate-400 hover:bg-slate-950/40'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  Staf / Guru
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex items-center justify-center gap-2 p-3 border rounded-xl font-medium transition-all ${
                    role === 'admin'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'border-white/10 bg-slate-950/20 text-slate-400 hover:bg-slate-950/40'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Memproses...
              </>
            ) : isLogin ? (
              'Masuk Aplikasi'
            ) : (
              'Daftar Sekarang'
            )}
          </button>
        </form>

        {/* Demo Accounts Panel */}
        {isLogin && (
          <div className="mt-8 pt-6 border-t border-white/15">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">
              Gunakan Akun Demo Pengujian:
            </h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleDemoFill('admin')}
                className="w-full flex items-center justify-between p-2.5 bg-slate-950/30 border border-white/5 hover:border-white/10 rounded-xl text-left text-xs transition-all hover:bg-slate-950/50"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="font-semibold text-slate-200">Role: Administrator</p>
                    <p className="text-slate-400">admin@sekolah.sch.id</p>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  admin123
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('guru')}
                className="w-full flex items-center justify-between p-2.5 bg-slate-950/30 border border-white/5 hover:border-white/10 rounded-xl text-left text-xs transition-all hover:bg-slate-950/50"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="font-semibold text-slate-200">Role: Guru / Staf</p>
                    <p className="text-slate-400">guru@sekolah.sch.id</p>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  guru123
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
