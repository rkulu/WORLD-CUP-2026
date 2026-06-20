import { useState, useMemo } from "react";
import { Match, MatchStatus } from "../types/bracket";
import { MatchCard } from "./MatchCard";
import { FlagIcon } from "./MatchCard";
import { motion, AnimatePresence } from "motion/react";
import { Award, CalendarClock, TableProperties } from "lucide-react";

interface GroupCardProps {
  key?: string | number;
  groupLetter: string;
  groupMatches: Match[];
  onUpdateScore: (matchId: string, team: 'A' | 'B', val: number) => void;
  onUpdateStatus: (matchId: string, status: MatchStatus) => void;
}

interface GroupStanding {
  team: string;
  flag: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

export const GroupCard = ({ groupLetter, groupMatches, onUpdateScore, onUpdateStatus }: GroupCardProps) => {
  const [activeView, setActiveView] = useState<'table' | 'matches'>('table');

  const standings = useMemo(() => {
    const standingsMap: Record<string, GroupStanding> = {};

    // 1. Initialize unique teams in this group
    groupMatches.forEach(m => {
      if (m.teamA && m.teamA !== "TBD") {
        if (!standingsMap[m.teamA]) {
          standingsMap[m.teamA] = {
            team: m.teamA,
            flag: m.flagA,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            gf: 0,
            ga: 0,
            gd: 0,
            pts: 0
          };
        }
      }
      if (m.teamB && m.teamB !== "TBD") {
        if (!standingsMap[m.teamB]) {
          standingsMap[m.teamB] = {
            team: m.teamB,
            flag: m.flagB,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            gf: 0,
            ga: 0,
            gd: 0,
            pts: 0
          };
        }
      }
    });

    // 2. Accumulate results based on completed matches
    groupMatches.forEach(m => {
      if (m.status === 'Selesai' && m.teamA !== "TBD" && m.teamB !== "TBD") {
        const sa = m.scoreA ?? 0;
        const sb = m.scoreB ?? 0;

        const sA = standingsMap[m.teamA];
        const sB = standingsMap[m.teamB];

        if (sA && sB) {
          sA.played += 1;
          sB.played += 1;
          sA.gf += sa;
          sA.ga += sb;
          sB.gf += sb;
          sB.ga += sa;

          if (sa > sb) {
            sA.won += 1;
            sA.pts += 3;
            sB.lost += 1;
          } else if (sb > sa) {
            sB.won += 1;
            sB.pts += 3;
            sA.lost += 1;
          } else {
            sA.drawn += 1;
            sA.pts += 1;
            sB.drawn += 1;
            sB.pts += 1;
          }
        }
      }
    });

    // 3. Post-process goal diff, sort by points, goal diff, goals scored, and team name
    return Object.values(standingsMap).map(s => ({
      ...s,
      gd: s.gf - s.ga
    })).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.team.localeCompare(b.team);
    });
  }, [groupMatches]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-950/50 border border-slate-900/80 rounded-2xl p-4 flex flex-col h-[400px] shadow-lg backdrop-blur-md relative overflow-hidden"
    >
      {/* Group Header */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xs font-black">
            {groupLetter}
          </div>
          <h3 className="font-display font-black text-sm text-slate-100 uppercase tracking-widest">
            Grup {groupLetter}
          </h3>
        </div>

        {/* View Switch Segment Controls */}
        <div className="flex bg-slate-900/60 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveView('table')}
            className={`px-2 py-1 rounded text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all ${
              activeView === 'table'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TableProperties className="w-3 h-3" />
            <span>Klasemen</span>
          </button>
          <button
            onClick={() => setActiveView('matches')}
            className={`px-2 py-1 rounded text-[10px] font-extrabold flex items-center gap-1 cursor-pointer transition-all ${
              activeView === 'matches'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarClock className="w-3 h-3" />
            <span>Pertandingan ({groupMatches.length})</span>
          </button>
        </div>
      </div>

      {/* Pane Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          {activeView === 'table' ? (
            <motion.div
              key="table"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 5 }}
              transition={{ duration: 0.18 }}
              className="w-full text-[11px]"
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-500 font-extrabold border-b border-slate-900/40 pb-1 uppercase text-[9px] tracking-wider">
                    <th className="py-1 w-6 text-center">Pos</th>
                    <th className="py-1">Negara</th>
                    <th className="py-1 w-8 text-center">Mn</th>
                    <th className="py-1 w-8 text-center" title="Selisih Gol">SG</th>
                    <th className="py-1 w-10 text-right">Poin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/30">
                  {standings.map((row, idx) => {
                    const isTopTwo = idx < 2;
                    return (
                      <tr key={row.team} className="text-slate-300 font-medium hover:bg-slate-900/20 transition-all">
                        <td className="py-2.5 text-center">
                          <span className={`w-4 h-4 rounded-full text-[9px] font-black inline-flex items-center justify-center ${
                            isTopTwo 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-slate-900 text-slate-500'
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-2.5 font-semibold text-slate-100 flex items-center gap-2 min-w-0">
                          <FlagIcon flag={row.flag} countryName={row.team} className="w-5 h-3.5" />
                          <span className="truncate max-w-[110px]" title={row.team}>{row.team}</span>
                        </td>
                        <td className="py-2.5 text-slate-400 font-mono text-center font-bold">{row.played}</td>
                        <td className={`py-2.5 font-mono text-center font-semibold ${
                          row.gd > 0 ? 'text-emerald-400' : row.gd < 0 ? 'text-rose-400' : 'text-slate-400'
                        }`}>
                          {row.gd > 0 ? `+${row.gd}` : row.gd}
                        </td>
                        <td className="py-2.5 text-right font-mono font-black text-rose-300 pr-1">{row.pts}</td>
                      </tr>
                    );
                  })}
                  {standings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-slate-500 text-center font-medium italic">
                        Belum ada data tim...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="mt-4 p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10 text-[9px] text-emerald-400/80 leading-relaxed flex gap-1.5">
                <Award className="w-3.5 h-3.5 shrink-0" />
                <span>Peringkat 1 dan 2 lolos otomatis ke Babak 32 Besar.</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="matches"
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              transition={{ duration: 0.18 }}
              className="space-y-4 pt-1"
            >
              <div className="grid grid-cols-1 gap-3">
                {groupMatches.map(match => (
                  <div key={match.id} className="flex justify-center scale-95 origin-center">
                    <MatchCard
                      match={match}
                      onUpdateScore={onUpdateScore}
                      onUpdateStatus={onUpdateStatus}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
