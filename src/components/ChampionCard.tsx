import { Trophy, Star, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

interface ChampionCardProps {
  team?: string;
  flag?: string;
}

export const ChampionCard = ({ team, flag }: ChampionCardProps) => {
  if (!team || team === "TBD") {
    return (
      <div className="relative flex flex-col items-center justify-center p-8 rounded-3xl border border-dashed border-slate-800 bg-slate-950/20 max-w-sm mx-auto text-center">
        <Trophy className="w-14 h-14 text-slate-700 mb-3 animate-pulse" />
        <h4 className="text-slate-400 font-bold text-sm tracking-widest uppercase mb-1">
          Menunggu Juara
        </h4>
        <p className="text-xs text-slate-500 max-w-xs">
          Selesaikan seluruh bagan dan tentukan pemenang laga Final untuk menobatkan Juara Dunia Baru!
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      className="relative flex flex-col items-center justify-center p-8 rounded-3xl overflow-hidden shadow-2xl shadow-amber-500/10 border border-amber-500/30 bg-slate-950/60 backdrop-blur-xl max-w-sm mx-auto text-center group"
    >
      {/* Decorative Golden Ambient Lights */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-[60px] pointer-events-none group-hover:bg-amber-500/30 transition-all duration-700" />
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-500/15 rounded-full blur-[40px] pointer-events-none" />

      {/* Champion Stars */}
      <div className="flex gap-1 mb-4 relative z-10">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }}
            transition={{ repeat: Infinity, duration: 4, delay: i * 0.2 }}
          >
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </motion.div>
        ))}
      </div>

      {/* Trophy with Glowing animations */}
      <div className="mb-4 relative z-10">
        <Trophy className="w-20 h-20 text-gradient bg-gradient-to-tr from-amber-400 to-yellow-200 mx-auto filter drop-shadow-[0_4px_16px_rgba(251,191,36,0.5)]" />
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.12, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="absolute inset-0 text-amber-500/50 blur-xl"
        >
          <Trophy className="w-20 h-20 mx-auto" />
        </motion.div>
      </div>

      {/* Title */}
      <h3 className="text-amber-400 font-extrabold uppercase tracking-[0.3em] text-xs mb-2.5 relative z-10">
        Kampiun Sejati
      </h3>

      {/* Flag and Team info */}
      <div className="flex flex-col items-center gap-1.5 relative z-10">
        <span className="text-6xl filter drop-shadow-md animate-bounce duration-1000">
          {flag}
        </span>
        <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-white to-amber-200 tracking-tight">
          {team}
        </span>
      </div>

      <div className="mt-4 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 uppercase tracking-widest font-extrabold relative z-10">
        🏆 JUARA PIALA DUNIA 2026
      </div>
    </motion.div>
  );
};
