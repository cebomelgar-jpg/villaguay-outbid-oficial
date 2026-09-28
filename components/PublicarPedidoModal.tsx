'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, Upload, MapPin, DollarSign, MessageCircle, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { VILLAGUAY_ZONES } from '@/lib/oficiosData';
import { processImage } from '@/lib/imageUtils';

const CATEGORIAS = [
  'Jardinería',
  'Plomería',
  'Electricidad',
  'Albañilería',
  'Fletes',
  'Limpieza',
  'Otros',
];

const MAX_FOTOS = 3;

interface PublicarPedidoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: () => void;
}

export function PublicarPedidoModal({ open, onOpenChange, onSubmitted }: PublicarPedidoModalProps) {
  const [form, setForm] = useState({
    titulo: '',
    categoria: CATEGORIAS[0],
    detalles: '',
    zona: VILLAGUAY_ZONES[0],
    presupuesto: '',
    whatsapp: '',
    nombre_contacto: '',
  });
  const [fotos, setFotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fotos.length >= MAX_FOTOS) {
      toast.error(`Máximo ${MAX_FOTOS} fotos`);
      return;
    }
    setUploading(true);
    try {
      const base64 = await processImage(file);
      setFotos([...fotos, base64]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al procesar imagen');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setFotos(fotos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!form.titulo.trim() || !form.detalles.trim() || !form.whatsapp.trim()) {
      toast.error('Completá los campos obligatorios');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          fotos,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al publicar');
      }

      toast.success('Pedido publicado. Quedará pendiente de aprobación.');
      setForm({
        titulo: '',
        categoria: CATEGORIAS[0],
        detalles: '',
        zona: VILLAGUAY_ZONES[0],
        presupuesto: '',
        whatsapp: '',
        nombre_contacto: '',
      });
      setFotos([]);
      onOpenChange(false);
      onSubmitted?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al publicar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto scrollbar-hide space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-neon-gold" />
                Publicar Pedido de Servicio
              </h3>
              <button
                onClick={() => onOpenChange(false)}
                className="p-1.5 rounded-lg glass-panel-hover text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-body font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
                  Título del trabajo *
                </label>
                <input
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Ej: Corte de pasto y limpieza de terreno"
                  className="w-full px-3 py-2.5 rounded-lg glass-panel text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-neon-gold/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-body font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
                  Categoría *
                </label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg glass-panel text-sm font-body text-foreground focus:outline-none focus:border-neon-gold/50"
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c} className="bg-panel">{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-body font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
                  Detalles y Medidas *
                </label>
                <textarea
                  value={form.detalles}
                  onChange={(e) => setForm({ ...form, detalles: e.target.value })}
                  rows={4}
                  placeholder="Describí el trabajo, dimensiones, requerimientos, materiales, etc."
                  className="w-full px-3 py-2.5 rounded-lg glass-panel text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-neon-gold/50 resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-body font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
                  Zona / Barrio *
                </label>
                <select
                  value={form.zona}
                  onChange={(e) => setForm({ ...form, zona: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg glass-panel text-sm font-body text-foreground focus:outline-none focus:border-neon-gold/50"
                >
                  {VILLAGUAY_ZONES.map((z) => (
                    <option key={z} value={z} className="bg-panel">{z}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-body font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
                  Presupuesto estimado
                </label>
                <input
                  value={form.presupuesto}
                  onChange={(e) => setForm({ ...form, presupuesto: e.target.value })}
                  placeholder="Ej: $15.000 o dejá vacío para 'A convenir'"
                  className="w-full px-3 py-2.5 rounded-lg glass-panel text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-neon-gold/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-body font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
                    WhatsApp de contacto *
                  </label>
                  <input
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    placeholder="Ej: 3455512345"
                    className="w-full px-3 py-2.5 rounded-lg glass-panel text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-neon-gold/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-body font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
                    Nombre (opcional)
                  </label>
                  <input
                    value={form.nombre_contacto}
                    onChange={(e) => setForm({ ...form, nombre_contacto: e.target.value })}
                    placeholder="Tu nombre"
                    className="w-full px-3 py-2.5 rounded-lg glass-panel text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-neon-gold/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-body font-medium text-muted-foreground uppercase tracking-wider mb-2 block flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5" /> Fotos opcionales ({fotos.length}/{MAX_FOTOS})
                </label>
                {fotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {fotos.map((foto, idx) => (
                      <div key={idx} className="relative group">
                        <img src={foto} alt={`Foto ${idx + 1}`} className="w-full h-20 object-cover rounded-lg border border-white/10" />
                        <button
                          onClick={() => removePhoto(idx)}
                          className="absolute top-1 right-1 p-1 rounded bg-destructive/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {fotos.length < MAX_FOTOS && (
                  <label className="flex items-center justify-center gap-2 cursor-pointer glass-panel rounded-lg p-3 border-2 border-dashed border-white/10 hover:border-neon-gold/30 text-xs text-muted-foreground transition-colors">
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Procesando...' : 'Subir foto'}
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                  </label>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !form.titulo.trim() || !form.detalles.trim() || !form.whatsapp.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neon-gold text-obsidian font-display font-bold text-sm hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] transition-all disabled:opacity-40"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-obsidian"></div>
              ) : (
                <>
                  <Briefcase className="h-4 w-4" />
                  Publicar Pedido
                </>
              )}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
