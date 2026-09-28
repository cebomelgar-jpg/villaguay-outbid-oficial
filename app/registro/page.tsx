'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Loader2, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function RegistroPage() {
  const { signUp, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signUp(email, password, accessKey || undefined);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      setSuccess(true);
      toast.success('Cuenta creada exitosamente');
      setTimeout(() => router.push('/login'), 2000);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel rounded-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-neon-green/15 border border-neon-green/50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-neon-green" />
          </div>
          <h1 className="font-display text-2xl font-bold neon-text-green mb-2">¡Cuenta Creada!</h1>
          <p className="text-sm text-muted-foreground font-body">
            Redirigiendo al inicio de sesión...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-body mb-6 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al inicio
        </button>

        <div className="glass-panel rounded-2xl p-8 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-neon-gold/15 border border-neon-gold/40 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-neon-gold" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Crear Cuenta</h1>
              <p className="text-xs text-muted-foreground font-body">Registrate con tu clave de acceso</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-body font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-2.5 rounded-lg glass-panel text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-neon-gold/50 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-body font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Contraseña
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-2.5 rounded-lg glass-panel text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-neon-gold/50 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-body font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="h-3 w-3" />
                  Clave de Accceso <span className="text-muted-foreground/50">(opcional)</span>
                </span>
              </label>
              <input
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="VO-XXXX-XXXX"
                className="w-full px-4 py-2.5 rounded-lg glass-panel text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-neon-gold/50 transition-colors font-mono"
              />
              <p className="text-[10px] text-muted-foreground/60 font-body mt-1">
                Sin clave, tu cuenta será de tipo &quot;cliente&quot;. Con una clave de Admin obtenés el rol correspondiente.
              </p>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-xs font-body">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-neon-gold to-amber-400 text-obsidian font-display font-bold text-sm hover:shadow-[0_0_25px_rgba(255,215,0,0.5)] transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creando cuenta...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" /> Crear Cuenta
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-muted-foreground font-body">
              ¿Ya tenés cuenta?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-neon-green hover:underline font-semibold"
              >
                Iniciar sesión
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
