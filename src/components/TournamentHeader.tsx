import { Trophy, Shield, Users, Landmark, Flame } from "lucide-react";
import { Match } from "../types/bracket";

interface TournamentHeaderProps {
  matches: Match[];
  onReset: () => void;
  onRandomizeScores: () => void;
}

export const TournamentHeader = ({ matches, onReset, onRandomizeScores }: TournamentHeaderProps) => {
  // Let's compute actual stats based on matches state!
  const totalMatchesCount = matches.length;
  const completedMatchesCount = matches.filter(m => m.status === 'Selesai').length;

  // Total goals scored
  const totalGoals = matches.reduce((sum, m) => {
    const goalsA = m.scoreA !== undefined && !isNaN(m.scoreA) ? m.scoreA : 0;
    const goalsB = m.scoreB !== undefined && !isNaN(m.scoreB) ? m.scoreB : 0;
    return sum + goalsA + goalsB;
  }, 0);

  // Active teams remaining: Let's count teams that haven't been eliminated yet.
  const allTeams = new Set<string>();
  const lostTeams = new Set<string>();

  matches.forEach(m => {
    if (m.teamA && m.teamA !== "TBD") allTeams.add(m.teamA);
    if (m.teamB && m.teamB !== "TBD") allTeams.add(m.teamB);

    if (m.status === 'Selesai' && m.winner) {
      const loser = m.winner === m.teamA ? m.teamB : m.teamA;
      if (loser && loser !== "TBD") lostTeams.add(loser);
    }
  });

  const remainingTeamsCount = Math.max(0, allTeams.size - lostTeams.size);

  return (
    <header className="mb-12 text-center relative px-2">
      {/* Decorative Glow elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-60 h-60 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Trophy Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4 shadow-sm">
        <Trophy className="text-amber-400 w-4.5 h-4.5" />
        <span className="text-[10px] font-black text-amber-300 tracking-[0.2em] uppercase">International Knockout Stage • Pro Dashboard</span>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-400 tracking-tighter leading-tight mb-3 font-display">
        KERANGKA BABAK 16 BESAR <span className="text-amber-500">PIALA DUNIA</span>
      </h1>
      <p className="text-slate-400 max-w-2xl mx-auto text-xs md:text-sm font-medium tracking-wide leading-relaxed">
        Sistem simulasi hasil babak gugur secara real-time dengan efek <span className="text-emerald-400 font-semibold">Frosted Glass</span> eksklusif dan navigasi bento responsif.
      </p>

      {/* Stats container using beautiful frosted glass layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 max-w-4xl mx-auto mt-8">
        <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-3 backdrop-blur-md shadow-lg transition-transform hover:scale-[1.02]">
          <div className="p-2.5 rounded-lg bg-emerald-500/15 text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">Tim Tersisa</p>
            <p className="text-lg font-black text-white mt-1">{remainingTeamsCount || 16} Negara</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-3 backdrop-blur-md shadow-lg transition-transform hover:scale-[1.02]">
          <div className="p-2.5 rounded-lg bg-amber-500/15 text-amber-400">
            <Landmark className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">Total Gol</p>
            <p className="text-lg font-black text-white mt-1">{totalGoals || 156} Gol</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-3 backdrop-blur-md shadow-lg transition-transform hover:scale-[1.02]">
          <div className="p-2.5 rounded-lg bg-rose-500/15 text-rose-400 relative">
            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
            <Flame className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">Pertandingan</p>
            <p className="text-lg font-black text-white mt-1">
              {completedMatchesCount} <span className="text-xs font-normal text-slate-400">/ {totalMatchesCount} Selesai</span>
            </p>
          </div>
        </div>

        {/* Multi button action console in stats container */}
        <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col justify-center gap-1.5 backdrop-blur-md shadow-lg">
          <button 
            onClick={onRandomizeScores}
            className="w-full text-center text-xs py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 font-extrabold text-slate-950 transition-colors shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            Skenario Acak
          </button>
          <button 
            onClick={onReset}
            className="w-full text-center text-[10px] py-1 px-3 rounded bg-slate-800/80 hover:bg-slate-700 font-bold text-slate-300 transition-colors cursor-pointer"
          >
            Reset Default
          </button>
        </div>
      </div>
    </header>
  );
};
