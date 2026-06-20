import { Match } from "../types/bracket";
import { motion } from "motion/react";
import { MapPin, Calendar, Plus, Minus, Info } from "lucide-react";

interface MatchCardProps {
  key?: string | number;
  match: Match;
  onUpdateScore: (matchId: string, team: 'A' | 'B', val: number) => void;
  onUpdateStatus: (matchId: string, status: Match['status']) => void;
}

export const MatchCard = ({ match, onUpdateScore, onUpdateStatus }: MatchCardProps) => {
  const isWinnerA = match.status === 'Selesai' && match.winner === match.teamA;
  const isWinnerB = match.status === 'Selesai' && match.winner === match.teamB;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`glass-card p-4 rounded-2xl w-full max-w-[290px] relative overflow-hidden group select-none transition-all duration-300 border-l-4 ${
        match.status === 'Live' ? 'border-l-rose-500' : match.status === 'Selesai' ? 'border-l-emerald-500' : 'border-l-slate-600'
      } bg-slate-950/40 hover:bg-slate-900/60 hover:border-slate-700/80 hover:shadow-emerald-950/20 hover:shadow-2xl`}
    >
      {/* Dynamic Background Spotlight on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />

      {/* Header Info */}
      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold tracking-wider mb-2.5">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-slate-500" />
          {match.date}
        </span>
        
        {/* Status Dropdown/Selector */}
        <select
          value={match.status}
          onChange={(e) => onUpdateStatus(match.id, e.target.value as Match['status'])}
          className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border-0 outline-none uppercase cursor-pointer bg-slate-800 text-slate-300 ${
            match.status === 'Selesai' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-900' :
            match.status === 'Live' ? 'bg-rose-950/80 text-rose-300 border border-rose-900 animate-pulse' :
            'bg-slate-800/80 text-slate-400 border border-slate-700'
          }`}
        >
          <option value="Belum Dimainkan">Belum</option>
          <option value="Live">Live</option>
          <option value="Selesai">Selesai</option>
        </select>
      </div>

      {/* Teams and Scores row */}
      <div className="space-y-2.5 relative z-10">
        {/* Team A */}
        <div className={`flex justify-between items-center py-1 px-1.5 rounded-lg transition-colors ${
          isWinnerA ? 'bg-emerald-950/30' : ''
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl filter drop-shadow" role="img" aria-label={match.teamA}>
              {match.flagA || "🏳️"}
            </span>
            <span className={`font-semibold text-sm truncate ${
              match.teamA === "TBD" ? 'text-slate-500 italic' : isWinnerA ? 'text-emerald-300 font-bold' : 'text-slate-100'
            }`}>
              {match.teamA}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5">
            {match.teamA !== "TBD" && (
              <div className="opacity-0 group-hover:opacity-100 flex items-center transition-opacity gap-1">
                <button
                  onClick={() => onUpdateScore(match.id, 'A', -1)}
                  className="p-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onUpdateScore(match.id, 'A', 1)}
                  className="p-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
            <span className={`font-mono text-base font-black px-1.5 py-0.5 rounded ${
              isWinnerA ? 'text-emerald-400 bg-emerald-950/50' : 'text-slate-300'
            }`}>
              {match.scoreA !== undefined ? match.scoreA : '-'}
            </span>
          </div>
        </div>

        {/* Separator / VS */}
        <div className="relative flex py-0.5 items-center justify-center">
          <div className="w-full border-t border-slate-900" />
          <span className="absolute bg-slate-950 text-[9px] font-bold text-slate-600 px-2 tracking-widest uppercase">vs</span>
        </div>

        {/* Team B */}
        <div className={`flex justify-between items-center py-1 px-1.5 rounded-lg transition-colors ${
          isWinnerB ? 'bg-emerald-950/30' : ''
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl filter drop-shadow" role="img" aria-label={match.teamB}>
              {match.flagB || "🏳️"}
            </span>
            <span className={`font-semibold text-sm truncate ${
              match.teamB === "TBD" ? 'text-slate-500 italic' : isWinnerB ? 'text-emerald-300 font-bold' : 'text-slate-100'
            }`}>
              {match.teamB}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {match.teamB !== "TBD" && (
              <div className="opacity-0 group-hover:opacity-100 flex items-center transition-opacity gap-1">
                <button
                  onClick={() => onUpdateScore(match.id, 'B', -1)}
                  className="p-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onUpdateScore(match.id, 'B', 1)}
                  className="p-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
            <span className={`font-mono text-base font-black px-1.5 py-0.5 rounded ${
              isWinnerB ? 'text-emerald-400 bg-emerald-950/50' : 'text-slate-300'
            }`}>
              {match.scoreB !== undefined ? match.scoreB : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Stadium/Location info */}
      <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-400 font-medium">
        <span className="truncate flex items-center gap-1 max-w-[170px]">
          <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
          <span className="truncate">{match.stadium}</span>
        </span>
        {match.teamA !== "TBD" && match.teamB !== "TBD" && match.status !== 'Selesai' && (
          <span className="text-amber-400/80 flex items-center gap-0.5 text-[9px] font-bold">
            <Info className="w-2.5 h-2.5" /> Sesuaikan skor
          </span>
        )}
      </div>
    </motion.div>
  );
};
