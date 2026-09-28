'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Loader2, ArrowLeft, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { signIn, user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user && role) {
      if (role === 'admin') router.push('/admin');
      else if (role === 'moderator') router.push('/moderator');
      else router.push('/');
    }
  }, [user, role, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
      setLoading(false);
    }
  };

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
            <div className="w-12 h-12 rounded-xl bg-neon-green/15 border border-neon-green/40 flex items-center justify-center">
              <Shield className="h-6 w-6 text-neon-green" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Acceso al Panel</h1>
              <p className="text-xs text-muted-foreground font-body">Iniciá sesión para gestionar la plataforma</p>
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
                placeholder="admin@villaguay.com"
                className="w-full px-4 py-2.5 rounded-lg glass-panel text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-neon-green/50 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-body font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg glass-panel text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-neon-green/50 transition-colors"
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-xs font-body">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neon-green text-obsidian font-display font-bold text-sm hover:shadow-[0_0_25px_rgba(0,255,135,0.4)] transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Ingresando...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" /> Iniciar Sesión
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-muted-foreground font-body">
              ¿No tenés cuenta?{' '}
              <button
                onClick={() => router.push('/registro')}
                className="text-neon-green hover:underline font-semibold"
              >
                Registrarse con clave de acceso
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
