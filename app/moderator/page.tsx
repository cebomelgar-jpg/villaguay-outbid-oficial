'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  LogOut,
  Store,
  Wrench,
  Trophy,
  MessageCircle,
  KeyRound,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  RefreshCw,
  Send,
  Clock,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getStoredState, subscribeToState, type AppState } from '@/lib/store';
import { categories, type Business, type CategoryId } from '@/lib/mockData';
import { OFICIO_TRADES, VILLAGUAY_ZONES, type Oficio } from '@/lib/oficiosData';

type ModTab = 'comercios' | 'oficios' | 'publicistas' | 'tickets' | 'keys';

export default function ModeratorPage() {
  const router = useRouter();
  const { user, role, loading: authLoading, signOut } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [state, setState] = useState<AppState | null>(null);
  const [activeTab, setActiveTab] = useState<ModTab>('comercios');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || authLoading) return;
    if (!user || (role !== 'moderator' && role !== 'admin')) {
      router.push('/login');
      return;
    }
    setState(getStoredState());
    const unsub = subscribeToState(() => setState(getStoredState()));
    return unsub;
  }, [isMounted, authLoading, user, role, router]);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (!isMounted || authLoading) {
    return (
      <div className="min-h-screen bg-panel flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue"></div>
      </div>
    );
  }

  if (!user || (role !== 'moderator' && role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-panel rounded-2xl p-8 max-w-sm w-full text-center">
          <Shield className="h-12 w-12 text-neon-blue mx-auto mb-4" />
          <h1 className="font-display text-xl font-bold text-foreground mb-2">Acceso Restringido</h1>
          <p className="text-sm text-muted-foreground font-body mb-4">Necesitás permisos de moderador.</p>
          <button onClick={() => router.push('/login')} className="px-6 py-2.5 rounded-xl bg-neon-blue text-white font-display font-bold text-sm">
            Ir al login
          </button>
        </div>
      </div>
    );
  }

  if (!state) return null;

  const tabs: { id: ModTab; label: string; icon: typeof Store }[] = [
    { id: 'comercios', label: 'Comercios', icon: Store },
    { id: 'oficios', label: 'Oficios', icon: Wrench },
    { id: 'publicistas', label: 'Publicistas', icon: Trophy },
    { id: 'tickets', label: 'Tickets', icon: MessageCircle },
    { id: 'keys', label: 'Claves', icon: KeyRound },
  ];

  return (
    <div className="min-h-screen">
      {/* Moderator header */}
      <div className="glass-panel border-b border-white/5 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-neon-blue/15 border border-neon-blue/40 flex items-center justify-center">
                <Shield className="h-5 w-5 text-neon-blue" />
              </div>
              <div>
                <h1 className="font-display text-base sm:text-lg font-bold text-foreground leading-none">Panel Moderador</h1>
                <span className="text-[10px] text-muted-foreground/60 font-body">VILLAGUAY OUTBID</span>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 rounded-lg glass-panel-hover text-xs font-body text-muted-foreground hover:text-destructive transition-colors">
              <LogOut className="h-4 w-4" /> Salir
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2 flex-nowrap items-center touch-scroll">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl font-body text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-neon-blue/15 border border-neon-blue/40 text-neon-blue'
                    : 'glass-panel text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'comercios' && <ModComerciosTab key="comercios" state={state} />}
          {activeTab === 'oficios' && <ModOficiosTab key="oficios" />}
          {activeTab === 'publicistas' && <ModPublicistasTab key="publicistas" />}
          {activeTab === 'tickets' && <ModTicketsTab key="tickets" />}
          {activeTab === 'keys' && <ModKeysTab key="keys" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ============ COMERCIOS TAB ============ */

function ModComerciosTab({ state }: { state: AppState }) {
  const [selCat, setSelCat] = useState<CategoryId>('gastronomia');
  const [editing, setEditing] = useState<Business | null>(null);

  const ranked = state.businesses.filter((b) => b.category === selCat);

  const handleSave = (updated: Business) => {
    // Save to localStorage via store functions
    const { updateBusiness } = require('@/lib/store');
    updateBusiness(updated.id, updated);
    setEditing(null);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelCat(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-all ${
                selCat === cat.id
                  ? 'bg-neon-blue/15 border border-neon-blue/50 text-neon-blue'
                  : 'glass-panel text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {ranked.length === 0 ? (
          <div className="glass-panel rounded-xl p-8 text-center text-sm text-muted-foreground font-body">
            No hay comercios en esta categoría.
          </div>
        ) : (
          <div className="space-y-2">
            {ranked.map((biz, idx) => (
              <div key={biz.id} className="glass-panel rounded-xl p-4 flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-black/30 border border-white/10 flex items-center justify-center">
                  <span className={`font-display text-sm font-bold ${idx === 0 ? 'text-neon-gold' : 'text-muted-foreground'}`}>#{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-sm font-bold text-foreground truncate">{biz.name}</div>
                  <div className="text-xs text-muted-foreground font-body truncate">
                    {biz.description}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    <span className="text-[10px] text-neon-gold font-body">{biz.bid ? `${biz.bid.toLocaleString()}` : 'Sin puja'}</span>
                    <span className="text-[10px] text-muted-foreground font-body">{biz.address || 'Sin dirección'}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-body ${biz.status === 'active' ? 'bg-neon-green/15 text-neon-green' : 'bg-muted-foreground/15 text-muted-foreground'}`}>
                      {biz.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setEditing(biz)}
                  className="p-2 rounded-lg glass-panel-hover text-muted-foreground hover:text-neon-blue transition-all"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {editing && (
          <EditBusinessModal business={editing} onSave={handleSave} onClose={() => setEditing(null)} />
        )}
      </div>
    </motion.div>
  );
}

function EditBusinessModal({ business, onSave, onClose }: { business: Business; onSave: (b: Business) => void; onClose: () => void }) {
  const [form, setForm] = useState<Business>({ ...business });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto scrollbar-hide space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <Edit2 className="h-5 w-5 text-neon-blue" /> Editar Comercio
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg glass-panel-hover text-muted-foreground hover:text-foreground">✕</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-body font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Nombre</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 rounded-lg glass-panel text-sm font-body text-foreground focus:outline-none focus:border-neon-blue/50" />
          </div>
          <div>
            <label className="text-[10px] font-body font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Descripción</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2.5 rounded-lg glass-panel text-sm font-body text-foreground focus:outline-none focus:border-neon-blue/50 resize-none" />
          </div>
          <div>
            <label className="text-[10px] font-body font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Dirección</label>
            <input value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2.5 rounded-lg glass-panel text-sm font-body text-foreground focus:outline-none focus:border-neon-blue/50" />
          </div>
          <div>
            <label className="text-[10px] font-body font-medium text-muted-foreground uppercase tracking-wider mb-1 block">WhatsApp</label>
            <input value={form.socialLinks?.whatsapp || ''} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, whatsapp: e.target.value } })} className="w-full px-3 py-2.5 rounded-lg glass-panel text-sm font-body text-foreground focus:outline-none focus:border-neon-blue/50" />
          </div>
          <div>
            <label className="text-[10px] font-body font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Instagram</label>
            <input value={form.socialLinks?.instagram || ''} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, instagram: e.target.value } })} className="w-full px-3 py-2.5 rounded-lg glass-panel text-sm font-body text-foreground focus:outline-none focus:border-neon-blue/50" />
          </div>
          <div>
            <label className="text-[10px] font-body font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Estado</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="w-full px-3 py-2.5 rounded-lg glass-panel text-sm font-body text-foreground focus:outline-none focus:border-neon-blue/50">
              <option value="active" className="bg-panel">Activo</option>
              <option value="suspended" className="bg-panel">Suspendido</option>
              <option value="hidden" className="bg-panel">Oculto</option>
            </select>
          </div>
        </div>

        <button onClick={() => onSave(form)} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neon-blue text-white font-display font-bold text-sm hover:shadow-[0_0_20px_rgba(0,200,255,0.4)] transition-all">
          Guardar cambios
        </button>
      </motion.div>
    </div>
  );
}

/* ============ OFICIOS TAB (Moderator) ============ */

function ModOficiosTab() {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPending = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/oficios?estado=pendiente');
      if (res.ok) {
        const data = await res.json();
        setPending(data.oficios || []);
      }
    } catch (err) {
      console.error('Error loading pending oficios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (id: string) => {
    await fetch(`/api/oficios/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'aprobado' }),
    });
    loadPending();
  };

  const handleReject = async (id: string) => {
    if (!confirm('¿Rechazar esta solicitud?')) return;
    await fetch(`/api/oficios/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'rechazado' }),
    });
    loadPending();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <div className="space-y-4">
        <div className="glass-panel rounded-xl p-4">
          <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
            <Wrench className="h-4 w-4 text-neon-blue" />
            Aprobación de Oficios
          </h3>
          <p className="text-xs text-muted-foreground font-body mt-1">
            Revisá y aprobá las solicitudes de trabajadores que quieren aparecer en el directorio.
          </p>
        </div>

        {loading ? (
          <div className="glass-panel rounded-xl p-8 text-center text-sm text-muted-foreground font-body">
            Cargando solicitudes...
          </div>
        ) : pending.length === 0 ? (
          <div className="glass-panel rounded-xl p-8 text-center text-sm text-muted-foreground font-body">
            No hay solicitudes pendientes.
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((p) => (
              <div key={p.id} className="glass-panel rounded-xl p-4 space-y-3 border border-neon-gold/20">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neon-gold/15 border border-neon-gold/40 flex items-center justify-center">
                    <Wrench className="h-5 w-5 text-neon-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-sm font-bold text-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground font-body mt-0.5">
                      {p.trade} · {p.zone}
                    </div>
                    {p.bio && <p className="text-xs text-muted-foreground/70 font-body mt-1">{p.bio}</p>}
                    <div className="text-xs text-neon-green font-body mt-1">{p.whatsapp}</div>
                    <div className="text-[10px] text-muted-foreground/50 font-body mt-1">
                      Enviado {new Date(p.created_at).toLocaleDateString('es-AR')}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(p.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-neon-green/15 border border-neon-green/30 text-neon-green hover:bg-neon-green/25 transition-all text-xs font-display font-bold"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Aprobar
                  </button>
                  <button
                    onClick={() => handleReject(p.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive hover:bg-destructive/25 transition-all text-xs font-display font-bold"
                  >
                    <XCircle className="h-4 w-4" /> Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ============ PUBLICISTAS TAB (Moderator) ============ */

function ModPublicistasTab() {
  const [publicistas, setPublicistas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/publicistas')
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => setPublicistas(data.publicistas || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <div className="space-y-4">
        <div className="glass-panel rounded-xl p-4">
          <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-4 w-4 text-neon-gold" />
            Monitoreo de Publicistas
          </h3>
          <p className="text-xs text-muted-foreground font-body mt-1">
            Inspeccioná la actividad del torneo de publicistas y sus enlaces de referido.
          </p>
        </div>

        {loading ? (
          <div className="glass-panel rounded-xl p-8 text-center text-sm text-muted-foreground font-body">
            Cargando publicistas...
          </div>
        ) : publicistas.length === 0 ? (
          <div className="glass-panel rounded-xl p-8 text-center text-sm text-muted-foreground font-body">
            No hay publicistas registrados.
          </div>
        ) : (
          <div className="space-y-2">
            {publicistas.map((p, idx) => (
              <div key={p.id} className="glass-panel rounded-xl p-4 flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-black/30 border border-white/10 flex items-center justify-center">
                  <span className={`font-display text-sm font-bold ${idx === 0 ? 'text-neon-gold' : 'text-muted-foreground'}`}>#{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-sm font-bold text-foreground truncate">{p.nombre_publico}</div>
                  <div className="text-[10px] text-muted-foreground font-body">
                    @{p.nombre_usuario} · {p.whatsapp_contacto}
                  </div>
                  <div className="text-[10px] text-neon-gold font-mono mt-0.5">
                    /?ref={p.ref_key}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-lg font-bold text-neon-gold">{p.puntos_mes_actual}</div>
                  <div className="text-[10px] text-muted-foreground font-body">puntos</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ============ TICKETS TAB (Moderator) ============ */

function ModTicketsTab() {
  const { session } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);
  const [response, setResponse] = useState('');

  const loadTickets = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch('/api/tickets', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [session]);

  const handleRespond = async (id: string) => {
    if (!session || !response.trim()) return;
    try {
      await fetch('/api/tickets', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id, response, status: 'resolved' }),
      });
      setResponding(null);
      setResponse('');
      loadTickets();
    } catch (err) {
      console.error('Error responding to ticket:', err);
    }
  };

  const statusColors: Record<string, string> = {
    open: 'bg-neon-gold/15 text-neon-gold',
    in_progress: 'bg-neon-blue/15 text-neon-blue',
    resolved: 'bg-neon-green/15 text-neon-green',
    closed: 'bg-muted-foreground/15 text-muted-foreground',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <div className="space-y-4">
        <div className="glass-panel rounded-xl p-4">
          <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-neon-blue" />
            Canal de Soporte
          </h3>
          <p className="text-xs text-muted-foreground font-body mt-1">
            Tickets y solicitudes de comercios que piden cambios en sus perfiles.
          </p>
        </div>

        {loading ? (
          <div className="glass-panel rounded-xl p-8 text-center text-sm text-muted-foreground font-body">
            Cargando tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div className="glass-panel rounded-xl p-8 text-center text-sm text-muted-foreground font-body">
            No hay tickets de soporte.
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="glass-panel rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neon-blue/15 border border-neon-blue/40 flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-neon-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-bold text-foreground">{t.subject}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-body font-semibold ${statusColors[t.status] || statusColors.open}`}>
                        {t.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-body mt-1">{t.message}</p>
                    {t.business_id && (
                      <div className="text-[10px] text-muted-foreground/60 font-body mt-1">
                        Comercio: {t.business_id}
                      </div>
                    )}
                    <div className="text-[10px] text-muted-foreground/50 font-body mt-1">
                      {new Date(t.created_at).toLocaleDateString('es-AR')}
                    </div>
                    {t.response && (
                      <div className="mt-2 p-2 rounded-lg bg-neon-green/10 border border-neon-green/20">
                        <div className="text-[10px] text-neon-green font-body font-semibold mb-0.5">Respuesta:</div>
                        <p className="text-xs text-muted-foreground font-body">{t.response}</p>
                      </div>
                    )}
                  </div>
                </div>
                {t.status !== 'resolved' && t.status !== 'closed' && (
                  <div>
                    {responding === t.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={response}
                          onChange={(e) => setResponse(e.target.value)}
                          rows={2}
                          placeholder="Escribí tu respuesta..."
                          className="w-full px-3 py-2 rounded-lg glass-panel text-xs font-body text-foreground focus:outline-none focus:border-neon-blue/50 resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRespond(t.id)}
                            disabled={!response.trim()}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-neon-blue text-white text-xs font-display font-bold disabled:opacity-40"
                          >
                            <Send className="h-3.5 w-3.5" /> Enviar y resolver
                          </button>
                          <button
                            onClick={() => { setResponding(null); setResponse(''); }}
                            className="px-3 py-2 rounded-lg glass-panel text-xs text-muted-foreground"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setResponding(t.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg glass-panel-hover text-neon-blue text-xs font-display font-bold hover:bg-neon-blue/10 transition-all"
                      >
                        <Send className="h-3.5 w-3.5" /> Responder
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ============ KEYS TAB (Moderator - read only) ============ */

function ModKeysTab() {
  const { session } = useAuth();
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    fetch('/api/access-keys', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => setKeys(data.keys || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <div className="space-y-4">
        <div className="glass-panel rounded-xl p-4">
          <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-neon-blue" />
            Inspección de Claves
          </h3>
          <p className="text-xs text-muted-foreground font-body mt-1">
            Solo lectura. El administrador genera y gestiona las claves.
          </p>
        </div>

        {loading ? (
          <div className="glass-panel rounded-xl p-8 text-center text-sm text-muted-foreground font-body">
            Cargando claves...
          </div>
        ) : keys.length === 0 ? (
          <div className="glass-panel rounded-xl p-8 text-center text-sm text-muted-foreground font-body">
            No hay claves generadas.
          </div>
        ) : (
          <div className="space-y-2">
            {keys.map((key) => (
              <div key={key.id} className="glass-panel rounded-xl p-4 flex items-center gap-3">
                <code className="text-sm font-mono text-neon-blue font-bold">{key.key_code}</code>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-green/15 text-neon-green font-body">
                    {key.role_grant}
                  </span>
                  {key.is_active ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-green/15 text-neon-green font-body">Activa</span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted-foreground/15 text-muted-foreground font-body">Usada</span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground/50 font-body ml-auto">
                  {new Date(key.created_at).toLocaleDateString('es-AR')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
