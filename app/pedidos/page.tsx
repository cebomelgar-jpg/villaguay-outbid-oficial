'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Briefcase,
  Search,
  ArrowLeft,
  Plus,
  MapPin,
  Clock,
  MessageCircle,
  Tag,
  DollarSign,
  CheckCircle2,
  Filter,
  X,
  ImageIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { ReglamentoModal } from '@/components/ReglamentoModal';
import { PublicarPedidoModal } from '@/components/PublicarPedidoModal';
import { toast } from 'sonner';
import { VILLAGUAY_ZONES } from '@/lib/oficiosData';

export interface Pedido {
  id: string;
  titulo: string;
  categoria: string;
  detalles: string;
  zona: string;
  presupuesto: string;
  whatsapp: string;
  nombre_contacto: string;
  fotos: string[];
  estado: string;
  created_at: string;
}

const CATEGORIAS_PEDIDOS = [
  'Jardinería',
  'Plomería',
  'Electricidad',
  'Albañilería',
  'Fletes',
  'Limpieza',
  'Otros',
];

const CATEGORIA_EMOJIS: Record<string, string> = {
  Jardinería: '🌿',
  Plomería: '🔧',
  Electricidad: '⚡',
  Albañilería: '🧱',
  Fletes: '🚚',
  Limpieza: '🧹',
  Otros: '📋',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'hace instantes';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days}d`;
  return new Date(dateStr).toLocaleDateString('es-AR');
}

export default function PedidosPage() {
  const router = useRouter();
  const [reglamentoOpen, setReglamentoOpen] = useState(false);
  const [publicarOpen, setPublicarOpen] = useState(false);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('');
  const [detailPedido, setDetailPedido] = useState<Pedido | null>(null);

  const loadPedidos = useCallback(async () => {
    try {
      const res = await fetch('/api/pedidos?estado=aprobado');
      if (!res.ok) throw new Error('Error cargando pedidos');
      const data = await res.json();
      setPedidos(data.pedidos || []);
    } catch (err) {
      console.error('Error loading pedidos:', err);
      toast.error('Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPedidos();
  }, [loadPedidos]);

  const filteredPedidos = useMemo(() => {
    return pedidos.filter((p) => {
      if (categoriaFilter && p.categoria !== categoriaFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        p.titulo.toLowerCase().includes(q) ||
        p.detalles.toLowerCase().includes(q) ||
        p.zona.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q)
      );
    });
  }, [pedidos, search, categoriaFilter]);

  const handleContact = (pedido: Pedido) => {
    const msg = `Hola! Vi tu pedido en Villaguay Outbid: "${pedido.titulo}". Quiero ofrecerte mis servicios.`;
    const phone = pedido.whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen">
      <Header
        onOpenReglamento={() => setReglamentoOpen(true)}
        onOpenPublicar={() => {
          router.push('/');
          setTimeout(() => {
            const event = new CustomEvent('open-publicar');
            window.dispatchEvent(event);
          }, 100);
        }}
      />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-body mb-4 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al inicio
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-gold/10 border border-neon-gold/30 mb-3">
            <Briefcase className="h-4 w-4 text-neon-gold" />
            <span className="text-xs font-display font-bold text-neon-gold tracking-wide">BOLSA DE TRABAJOS</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            <span className="text-foreground">Pedidos de </span>
            <span className="neon-text-gold">Servicios</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-body mt-3 max-w-2xl mx-auto text-balance">
            Publicá lo que necesitás y recibí propuestas de trabajadores de Villaguay. O contactá directamente por WhatsApp.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          onClick={() => setPublicarOpen(true)}
          className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neon-gold text-obsidian font-display font-bold text-sm hover:shadow-[0_0_25px_rgba(255,215,0,0.4)] transition-all"
        >
          <Plus className="h-4 w-4" />
          Publicar un Pedido
        </motion.button>

        <div className="space-y-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar pedidos por título, zona o descripción..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg glass-panel text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-neon-gold/50 transition-colors"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 touch-scroll">
            <button
              onClick={() => setCategoriaFilter('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-body font-medium whitespace-nowrap transition-all ${
                categoriaFilter === ''
                  ? 'bg-neon-gold/15 border border-neon-gold/50 text-neon-gold'
                  : 'glass-panel text-muted-foreground hover:text-foreground'
              }`}
            >
              Todos
            </button>
            {CATEGORIAS_PEDIDOS.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-body font-medium whitespace-nowrap transition-all ${
                  categoriaFilter === cat
                    ? 'bg-neon-gold/15 border border-neon-gold/50 text-neon-gold'
                    : 'glass-panel text-muted-foreground hover:text-foreground'
                }`}
              >
                {CATEGORIA_EMOJIS[cat]} {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">
            Pedidos Vigentes
          </h3>
          <span className="text-xs text-muted-foreground font-body">
            {filteredPedidos.length} {filteredPedidos.length === 1 ? 'pedido' : 'pedidos'}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-gold"></div>
          </div>
        ) : filteredPedidos.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 sm:p-12 text-center space-y-4 border border-neon-gold/20">
            <div className="w-16 h-16 rounded-full bg-neon-gold/15 border border-neon-gold/40 flex items-center justify-center mx-auto">
              <Briefcase className="h-8 w-8 text-neon-gold" />
            </div>
            <div>
              <h4 className="font-display text-xl font-bold text-foreground mb-2">No hay pedidos vigentes</h4>
              <p className="text-sm text-muted-foreground font-body max-w-md mx-auto">
                Sé el primero en publicar un pedido de servicio. Los trabajadores de Villaguay están esperando.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredPedidos.map((pedido, index) => (
                <motion.div
                  key={pedido.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.03 }}
                  className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-neon-gold/20 transition-all cursor-pointer"
                  onClick={() => setDetailPedido(pedido)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-neon-gold/15 border border-neon-gold/30 flex items-center justify-center text-2xl">
                      {CATEGORIA_EMOJIS[pedido.categoria] || '📋'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-display text-sm sm:text-base font-bold text-foreground">{pedido.titulo}</h4>
                        {pedido.estado === 'resuelto' && (
                          <span className="px-2 py-0.5 rounded-full bg-neon-green/15 text-neon-green text-[10px] font-body font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Resuelto
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground font-body line-clamp-2">{pedido.detalles}</p>
                      <div className="flex items-center gap-3 flex-wrap mt-2">
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-body">
                          <Tag className="h-3 w-3" /> {pedido.categoria}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-body">
                          <MapPin className="h-3 w-3" /> {pedido.zona}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-body">
                          <Clock className="h-3 w-3" /> {timeAgo(pedido.created_at)}
                        </span>
                        {pedido.presupuesto && pedido.presupuesto !== 'A convenir' && (
                          <span className="flex items-center gap-1 text-[10px] text-neon-green font-body font-semibold">
                            <DollarSign className="h-3 w-3" /> {pedido.presupuesto}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContact(pedido);
                      }}
                      className="flex-shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-neon-green/15 border border-neon-green/30 text-neon-green hover:bg-neon-green/25 transition-all text-xs font-display font-bold"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Contactar</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <footer className="mt-16 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-muted-foreground/50 font-body">
            VILLAGUAY OUTBID — Bolsa de Trabajos y Pedidos de Servicio de Villaguay, Entre Ríos.
          </p>
        </footer>
      </main>

      <ReglamentoModal open={reglamentoOpen} onOpenChange={setReglamentoOpen} />
      <PublicarPedidoModal
        open={publicarOpen}
        onOpenChange={setPublicarOpen}
        onSubmitted={loadPedidos}
      />

      {detailPedido && (
        <PedidoDetailModal
          pedido={detailPedido}
          onClose={() => setDetailPedido(null)}
          onContact={handleContact}
        />
      )}
    </div>
  );
}

function PedidoDetailModal({
  pedido,
  onClose,
  onContact,
}: {
  pedido: Pedido;
  onClose: () => void;
  onContact: (p: Pedido) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto scrollbar-hide space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-neon-gold" />
            Detalle del Pedido
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg glass-panel-hover text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon-gold/15 text-neon-gold text-[10px] font-body font-semibold">
            {CATEGORIA_EMOJIS[pedido.categoria]} {pedido.categoria}
          </span>
        </div>

        <div>
          <h4 className="font-display text-base font-bold text-foreground mb-1">{pedido.titulo}</h4>
          <p className="text-sm text-muted-foreground font-body whitespace-pre-wrap">{pedido.detalles}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="glass-panel rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider mb-1">Zona</p>
            <p className="text-sm font-display font-bold text-foreground flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-neon-gold" /> {pedido.zona}
            </p>
          </div>
          <div className="glass-panel rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider mb-1">Presupuesto</p>
            <p className="text-sm font-display font-bold text-foreground flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5 text-neon-green" /> {pedido.presupuesto || 'A convenir'}
            </p>
          </div>
        </div>

        {pedido.nombre_contacto && (
          <div>
            <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider mb-1">Contacto</p>
            <p className="text-sm font-body text-foreground">{pedido.nombre_contacto}</p>
          </div>
        )}

        {pedido.fotos && pedido.fotos.length > 0 && (
          <div>
            <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider mb-2 flex items-center gap-1">
              <ImageIcon className="h-3.5 w-3.5" /> Fotos ({pedido.fotos.length})
            </p>
            <div className="grid grid-cols-3 gap-2">
              {pedido.fotos.map((foto, idx) => (
                <img
                  key={idx}
                  src={foto}
                  alt={`Foto ${idx + 1}`}
                  className="w-full h-20 object-cover rounded-lg border border-white/10"
                />
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground font-body">
          Publicado {timeAgo(pedido.created_at)}
        </div>

        <button
          onClick={() => {
            onContact(pedido);
            onClose();
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neon-green text-obsidian font-display font-bold text-sm hover:shadow-[0_0_20px_rgba(0,255,135,0.4)] transition-all"
        >
          <MessageCircle className="h-4 w-4" />
          Contactar por WhatsApp
        </button>
      </motion.div>
    </div>
  );
}
