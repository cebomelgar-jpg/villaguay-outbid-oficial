'use client';

import { motion } from 'framer-motion';
import {
  ScrollText,
  Crown,
  Swords,
  Shield,
  Coins,
  AlertTriangle,
  Wrench,
  Send,
  Trophy,
  Briefcase,
  Handshake,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface ReglamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const sections = [
  {
    icon: Crown,
    title: 'Objetivo del #1',
    description: 'El comercio con la puja más alta de su categoría ocupa el puesto #1 y aparece destacado con el marco dorado de "Líder de Villaguay".',
    color: 'text-neon-gold',
  },
  {
    icon: Swords,
    title: 'Sistema de Pujas',
    description: 'Cualquier comercio puede destronar al líder realizando una puja superior. La puja mínima para superar al actual #1 es un 5% mayor al valor reinante.',
    color: 'text-neon-green',
  },
  {
    icon: Coins,
    title: 'Pagos y Montos',
    description: 'Las pujas se expresan en pesos argentinos (ARS). El monto pujado se abona mensualmente mientras el comercio mantenga el puesto.',
    color: 'text-neon-purple',
  },
  {
    icon: Shield,
    title: 'Categorías',
    description: 'Cada comercio compite exclusivamente dentro de su categoría: Gastronomía, Estética, Indumentaria, Servicios, Gimnasios o Automotor.',
    color: 'text-neon-green',
  },
  {
    icon: Wrench,
    title: 'Publicación de Oficios y Changas',
    description: 'Los trabajadores pueden publicar su oficio completando el formulario con nombre, especialidad, zona y WhatsApp. Cada solicitud queda pendiente hasta que el administrador la aprueba. Una vez aprobada, el trabajador aparece en el directorio público de Oficios & Changas.',
    color: 'text-neon-green',
  },
  {
    icon: Send,
    title: 'Presupuestos Express',
    description: 'Los vecinos pueden solicitar presupuestos rápidos a cualquier comercio del ranking. El sistema arma automáticamente un mensaje de WhatsApp con los detalles del trabajo, la urgencia y el rubro seleccionado, para que el comercio lo reciba directamente.',
    color: 'text-neon-blue',
  },
  {
    icon: Briefcase,
    title: 'Bolsa de Trabajos / Pedidos de Servicio',
    description: 'Los vecinos publican necesidades de servicios (jardinería, plomería, electricidad, albañilería, fletes, limpieza y otros) con detalles, zona, presupuesto y fotos. Los trabajadores pueden contactar directamente por WhatsApp al cliente. Los pedidos requieren aprobación del administrador antes de publicarse.',
    color: 'text-neon-gold',
  },
  {
    icon: Trophy,
    title: 'Torneo de Publicistas',
    description: 'El Torneo de Publicistas es un concurso mensual con un premio de $100.000 ARS. Los participantes generan su enlace único de referido (?ref=usuario) y lo comparten. Cada visita única (por IP + dispositivo) suma 1 punto, con un máximo de 1 punto por visitante cada 24 horas. Se requiere al menos 5 segundos de permanencia y 1 interacción. Los bots son ignorados. Al final del mes, el publicista con más puntos gana el premio.',
    color: 'text-neon-gold',
  },
  {
    icon: Handshake,
    title: 'Aprobación y Moderación',
    description: 'Todas las publicaciones (comercios, oficios y pedidos de trabajo) pasan por revisión del administrador antes de aparecer públicamente. El administrador puede aprobar, pausar, editar o eliminar cualquier publicación en cualquier momento.',
    color: 'text-neon-purple',
  },
  {
    icon: AlertTriangle,
    title: 'Fair Play y Sanciones',
    description: 'Está prohibido realizar pujas falsas, manipular el sistema de referidos con bots o múltiples cuentas, o publicar información engañosa. Las pujas son vinculantes y no reembolsables. El incumplimiento del reglamento puede resultar en la descalificación del comercio o publicista.',
    color: 'text-destructive',
  },
];

export function ReglamentoModal({ open, onOpenChange }: ReglamentoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-panel/95 backdrop-blur-xl border border-white/10 max-h-[85vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-2xl font-bold">
            <ScrollText className="h-6 w-6 text-neon-green" />
            <span className="neon-text-green">Reglamento</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-body">
            Reglas oficiales del leaderboard competitivo VILLAGUAY OUTBID
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {sections.map((rule, index) => {
            const Icon = rule.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.06 }}
                className="glass-panel rounded-xl p-4 flex gap-4"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center">
                    <Icon className={`h-5 w-5 ${rule.color}`} />
                  </div>
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground text-sm mb-1">
                    {rule.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-body leading-relaxed">
                    {rule.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="pt-2 text-center">
          <p className="text-xs text-muted-foreground/50 font-body">
            Al participar aceptás todas las reglas del reglamento. VILLAGUAY OUTBID se reserva el derecho de modificar las normas previa notificación.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
