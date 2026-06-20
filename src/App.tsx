import { useState, useMemo, useEffect } from 'react';
import { initialBracketData } from './data/worldCupBracket';
import { Match, MatchStatus } from './types/bracket';
import { TournamentHeader } from './components/TournamentHeader';
import { MatchCard } from './components/MatchCard';
import { ChampionCard } from './components/ChampionCard';
import { GroupCard } from './components/GroupCard';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Search, Trophy, Filter, CircleHelp, Download, Sparkles } from 'lucide-react';
import { fetchWorldCupGames } from './lib/worldCupApi';

export default function App() {
  const [matches, setMatches] = useState<Match[]>(() => {
    return initialBracketData;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRoundFilter, setActiveRoundFilter] = useState<'Semua' | 'Fase Grup' | '32 Besar' | '16 Besar' | 'Perempat Final' | 'Semifinal' | 'Final'>('Semua');
  const [mobileRoundIndex, setMobileRoundIndex] = useState(0);
  const [selectedStageTab, setSelectedStageTab] = useState<'gugur' | 'r32' | 'grup'>('gugur');

  // States for API synchronization
  const [isLoading, setIsLoading] = useState(false);
  const [apiSyncState, setApiSyncState] = useState<'idle' | 'success' | 'error'>('idle');
  const [apiError, setApiError] = useState<string | undefined>(undefined);

  // Load from external live API
  const loadLiveGames = async () => {
    setIsLoading(true);
    setApiSyncState('idle');
    setApiError(undefined);
    try {
      const data = await fetchWorldCupGames();
      setMatches(data);
      setApiSyncState('success');
      setTimeout(() => setApiSyncState('idle'), 3500);
    } catch (err: any) {
      console.error(err);
      setApiError("Gagal memuat data dari API. Silakan coba klik tombol kembali.");
      setApiSyncState('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Run on initial mounting structure
  useEffect(() => {
    loadLiveGames();
  }, []);

  const rounds: ('Fase Grup' | '32 Besar' | '16 Besar' | 'Perempat Final' | 'Semifinal' | 'Final')[] = [
    "Fase Grup",
    "32 Besar",
    "16 Besar",
    "Perempat Final",
    "Semifinal",
    "Final"
  ];

  const gugurRounds: ('16 Besar' | 'Perempat Final' | 'Semifinal' | 'Final')[] = [
    "16 Besar",
    "Perempat Final",
    "Semifinal",
    "Final"
  ];

  // Recalculates and propagates winners through future matching slots
  const propagateWinners = (currentMatches: Match[]): Match[] => {
    const updated = currentMatches.map(m => ({ ...m }));

    // Helper to determine winner of a match ID
    const getWinnerOf = (matchId: string): { name: string; flag: string } | null => {
      const m = updated.find(x => x.id === matchId);
      if (!m) return null;
      if (m.status !== 'Selesai') return null;
      if (m.scoreA === undefined || m.scoreB === undefined) return null;

      if (m.scoreA > m.scoreB) {
        return { name: m.teamA, flag: m.flagA };
      } else if (m.scoreB > m.scoreA) {
        return { name: m.teamB, flag: m.flagB };
      } else {
        // If tied, default to winner already stored, otherwise fall back to teamA
        const fallbackName = m.winner || m.teamA;
        const fallbackFlag = fallbackName === m.teamA ? m.flagA : m.flagB;
        return { name: fallbackName, flag: fallbackFlag };
      }
    };

    // Determine if we are using live API numerical structure or the static legacy keys
    const isLiveStructure = updated.some(m => !isNaN(parseInt(m.id, 10)));

    if (isLiveStructure) {
      // Live World Cup Schema Pairings Mapping
      const apiPairings = [
        // 16 Besar (derived from 32 Besar winners)
        { qId: "89", left: "74", right: "77" },
        { qId: "90", left: "73", right: "75" },
        { qId: "91", left: "76", right: "78" },
        { qId: "92", left: "79", right: "80" },
        { qId: "93", left: "83", right: "84" },
        { qId: "94", left: "81", right: "82" },
        { qId: "95", left: "86", right: "88" },
        { qId: "96", left: "85", right: "87" },

        // Quarter-finals
        { qId: "97", left: "89", right: "90" },
        { qId: "98", left: "93", right: "94" },
        { qId: "99", left: "91", right: "92" },
        { qId: "100", left: "95", right: "96" },

        // Semifinals
        { qId: "101", left: "97", right: "98" },
        { qId: "102", left: "99", right: "100" },

        // Final
        { qId: "104", left: "101", right: "102" }
      ];

      apiPairings.forEach(({ qId, left, right }) => {
        const targetMatch = updated.find(x => x.id === qId);
        if (targetMatch) {
          const winL = getWinnerOf(left);
          const winR = getWinnerOf(right);

          const oldTeamA = targetMatch.teamA;
          const oldTeamB = targetMatch.teamB;

          targetMatch.teamA = winL ? winL.name : "TBD";
          targetMatch.flagA = winL ? winL.flag : "🏳️";
          targetMatch.teamB = winR ? winR.name : "TBD";
          targetMatch.flagB = winR ? winR.flag : "🏳️";

          if (targetMatch.teamA !== oldTeamA) {
            targetMatch.scoreA = undefined;
            targetMatch.winner = undefined;
          }
          if (targetMatch.teamB !== oldTeamB) {
            targetMatch.scoreB = undefined;
            targetMatch.winner = undefined;
          }

          if (targetMatch.teamA === "TBD" || targetMatch.teamB === "TBD") {
            targetMatch.status = "Belum Dimainkan";
            targetMatch.scoreA = undefined;
            targetMatch.scoreB = undefined;
            targetMatch.winner = undefined;
          } else if (targetMatch.status === 'Selesai') {
            const sa = targetMatch.scoreA ?? 0;
            const sb = targetMatch.scoreB ?? 0;
            if (sa > sb) targetMatch.winner = targetMatch.teamA;
            else if (sb > sa) targetMatch.winner = targetMatch.teamB;
            else targetMatch.winner = targetMatch.teamA;
          }
        }
      });
    } else {
      // Legacy structure mapping (as reference/fallback)
      const pairingsQF = [
        { qId: 'q1', left: 'm1', right: 'm2' },
        { qId: 'q2', left: 'm3', right: 'm4' },
        { qId: 'q3', left: 'm5', right: 'm6' },
        { qId: 'q4', left: 'm7', right: 'm8' },
      ];

      pairingsQF.forEach(({ qId, left, right }) => {
        const qMatch = updated.find(x => x.id === qId);
        if (qMatch) {
          const winL = getWinnerOf(left);
          const winR = getWinnerOf(right);

          const oldTeamA = qMatch.teamA;
          const oldTeamB = qMatch.teamB;

          qMatch.teamA = winL ? winL.name : "TBD";
          qMatch.flagA = winL ? winL.flag : "🏳️";
          qMatch.teamB = winR ? winR.name : "TBD";
          qMatch.flagB = winR ? winR.flag : "🏳️";

          if (qMatch.teamA !== oldTeamA) {
            qMatch.scoreA = undefined;
            qMatch.winner = undefined;
          }
          if (qMatch.teamB !== oldTeamB) {
            qMatch.scoreB = undefined;
            qMatch.winner = undefined;
          }

          if (qMatch.teamA === "TBD" || qMatch.teamB === "TBD") {
            qMatch.status = "Belum Dimainkan";
            qMatch.scoreA = undefined;
            qMatch.scoreB = undefined;
            qMatch.winner = undefined;
          } else if (qMatch.status === 'Selesai') {
            const sa = qMatch.scoreA ?? 0;
            const sb = qMatch.scoreB ?? 0;
            if (sa > sb) qMatch.winner = qMatch.teamA;
            else if (sb > sa) qMatch.winner = qMatch.teamB;
            else qMatch.winner = qMatch.teamA;
          }
        }
      });

      const pairingsSF = [
        { sId: 's1', left: 'q1', right: 'q2' },
        { sId: 's2', left: 'q3', right: 'q4' },
      ];

      pairingsSF.forEach(({ sId, left, right }) => {
        const sMatch = updated.find(x => x.id === sId);
        if (sMatch) {
          const winL = getWinnerOf(left);
          const winR = getWinnerOf(right);

          const oldTeamA = sMatch.teamA;
          const oldTeamB = sMatch.teamB;

          sMatch.teamA = winL ? winL.name : "TBD";
          sMatch.flagA = winL ? winL.flag : "🏳️";
          sMatch.teamB = winR ? winR.name : "TBD";
          sMatch.flagB = winR ? winR.flag : "🏳️";

          if (sMatch.teamA !== oldTeamA) {
            sMatch.scoreA = undefined;
            sMatch.winner = undefined;
          }
          if (sMatch.teamB !== oldTeamB) {
            sMatch.scoreB = undefined;
            sMatch.winner = undefined;
          }

          if (sMatch.teamA === "TBD" || sMatch.teamB === "TBD") {
            sMatch.status = "Belum Dimainkan";
            sMatch.scoreA = undefined;
            sMatch.scoreB = undefined;
            sMatch.winner = undefined;
          } else if (sMatch.status === 'Selesai') {
            const sa = sMatch.scoreA ?? 0;
            const sb = sMatch.scoreB ?? 0;
            if (sa > sb) sMatch.winner = sMatch.teamA;
            else if (sb > sa) sMatch.winner = sMatch.teamB;
            else sMatch.winner = sMatch.teamA;
          }
        }
      });

      const fMatch = updated.find(x => x.id === 'f1');
      if (fMatch) {
        const winL = getWinnerOf('s1');
        const winR = getWinnerOf('s2');

        const oldTeamA = fMatch.teamA;
        const oldTeamB = fMatch.teamB;

        fMatch.teamA = winL ? winL.name : "TBD";
        fMatch.flagA = winL ? winL.flag : "🏳️";
        fMatch.teamB = winR ? winR.name : "TBD";
        fMatch.flagB = winR ? winR.flag : "🏳️";

        if (fMatch.teamA !== oldTeamA) {
          fMatch.scoreA = undefined;
          fMatch.winner = undefined;
        }
        if (fMatch.teamB !== oldTeamB) {
          fMatch.scoreB = undefined;
          fMatch.winner = undefined;
        }

        if (fMatch.teamA === "TBD" || fMatch.teamB === "TBD") {
          fMatch.status = "Belum Dimainkan";
          fMatch.scoreA = undefined;
          fMatch.scoreB = undefined;
          fMatch.winner = undefined;
        } else if (fMatch.status === 'Selesai') {
          const sa = fMatch.scoreA ?? 0;
          const sb = fMatch.scoreB ?? 0;
          if (sa > sb) fMatch.winner = fMatch.teamA;
          else if (sb > sa) fMatch.winner = fMatch.teamB;
          else fMatch.winner = fMatch.teamA;
        }
      }
    }

    return updated;
  };

  // Adjust match scores
  const handleUpdateScore = (matchId: string, team: 'A' | 'B', val: number) => {
    setMatches(prev => {
      const copy = prev.map(m => {
        if (m.id === matchId) {
          // Calculate score
          const currentScore = team === 'A' ? (m.scoreA ?? 0) : (m.scoreB ?? 0);
          const newScore = Math.max(0, currentScore + val);

          const updatedMatch = { ...m };
          if (team === 'A') updatedMatch.scoreA = newScore;
          else updatedMatch.scoreB = newScore;

          // If scores changed, we recalculate winner and set as Selesai if user adjusts it
          if (updatedMatch.status === 'Belum Dimainkan') {
            updatedMatch.status = 'Selesai';
          }

          // Compute winner
          const sa = updatedMatch.scoreA ?? 0;
          const sb = updatedMatch.scoreB ?? 0;
          if (sa > sb) {
            updatedMatch.winner = updatedMatch.teamA;
          } else if (sb > sa) {
            updatedMatch.winner = updatedMatch.teamB;
          } else {
            // Tie - default to team A or preserve previous winner choice
            updatedMatch.winner = updatedMatch.winner || updatedMatch.teamA;
          }
          return updatedMatch;
        }
        return m;
      });
      return propagateWinners(copy);
    });
  };

  // Adjust Status
  const handleUpdateStatus = (matchId: string, status: MatchStatus) => {
    setMatches(prev => {
      const copy = prev.map(m => {
        if (m.id === matchId) {
          const updated = { ...m, status };
          if (status === 'Selesai') {
            if (updated.scoreA === undefined) updated.scoreA = 0;
            if (updated.scoreB === undefined) updated.scoreB = 0;
            const sa = updated.scoreA;
            const sb = updated.scoreB;
            if (sa > sb) updated.winner = updated.teamA;
            else if (sb > sa) updated.winner = updated.teamB;
            else updated.winner = updated.teamA;
          } else if (status === 'Belum Dimainkan') {
            // Keep scores but reset winner so bracket remains intact
            updated.winner = undefined;
          }
          return updated;
        }
        return m;
      });
      return propagateWinners(copy);
    });
  };

  const handleReset = () => {
    setMatches(initialBracketData);
  };

  // Fun helper to randomize and simulate scenarios!
  const handleRandomizeScores = () => {
    setMatches(prev => {
      // 1. First randomize Group play and Round of 32 (or R16 if r32 is not present in data)
      const copy = prev.map(m => {
        if (m.round === 'Fase Grup' || m.round === '32 Besar' || (m.round === '16 Besar' && !prev.some(x => x.round === '32 Besar'))) {
          const score1 = Math.floor(Math.random() * 5);
          let score2 = Math.floor(Math.random() * 5);
          if (score1 === score2 && m.round !== 'Fase Grup') {
            // Avoid tie defaults for knockout stages
            score2 += 1;
          }
          const win = score1 > score2 ? m.teamA : m.teamB;
          return {
            ...m,
            scoreA: score1,
            scoreB: score2,
            winner: win,
            status: 'Selesai' as MatchStatus
          };
        }
        return m;
      });

      // 2. Classically propagate and Cascade through Knockout Stages
      let fullCascade = propagateWinners(copy);

      // Randomize 16 Besar (if 32 Besar is present, it would have been filled with actual teams)
      if (prev.some(x => x.round === '32 Besar')) {
        fullCascade = fullCascade.map(m => {
          if (m.round === '16 Besar' && m.teamA !== 'TBD' && m.teamB !== 'TBD') {
            const score1 = Math.floor(Math.random() * 5);
            let score2 = Math.floor(Math.random() * 5);
            if (score1 === score2) score2 += 1;
            const win = score1 > score2 ? m.teamA : m.teamB;
            return {
              ...m,
              scoreA: score1,
              scoreB: score2,
              winner: win,
              status: 'Selesai' as MatchStatus
            };
          }
          return m;
        });
        fullCascade = propagateWinners(fullCascade);
      }

      // Now we have teams in Quarter-Finals, let's randomize Quarter-Finals
      fullCascade = fullCascade.map(m => {
        if (m.round === 'Perempat Final' && m.teamA !== 'TBD' && m.teamB !== 'TBD') {
          const score1 = Math.floor(Math.random() * 4);
          let score2 = Math.floor(Math.random() * 4);
          if (score1 === score2) score2 += 1;
          const win = score1 > score2 ? m.teamA : m.teamB;
          return {
            ...m,
            scoreA: score1,
            scoreB: score2,
            winner: win,
            status: 'Selesai' as MatchStatus
          };
        }
        return m;
      });

      // Propagate again to Semifinals
      fullCascade = propagateWinners(fullCascade);

      // Randomize Semifinals
      fullCascade = fullCascade.map(m => {
        if (m.round === 'Semifinal' && m.teamA !== 'TBD' && m.teamB !== 'TBD') {
          let score1 = Math.floor(Math.random() * 3);
          let score2 = Math.floor(Math.random() * 3);
          if (score1 === score2) score1 += 1;
          const win = score1 > score2 ? m.teamA : m.teamB;
          return {
            ...m,
            scoreA: score1,
            scoreB: score2,
            winner: win,
            status: 'Selesai' as MatchStatus
          };
        }
        return m;
      });

      // Propagate Semis
      fullCascade = propagateWinners(fullCascade);

      // Randomize Final!
      fullCascade = fullCascade.map(m => {
        if (m.round === 'Final' && m.teamA !== 'TBD' && m.teamB !== 'TBD') {
          const score1 = Math.floor(Math.random() * 4);
          let score2 = Math.floor(Math.random() * 4);
          if (score1 === score2) score2 += 1;
          const win = score1 > score2 ? m.teamA : m.teamB;
          return {
            ...m,
            scoreA: score1,
            scoreB: score2,
            winner: win,
            status: 'Selesai' as MatchStatus
          };
        }
        return m;
      });

      // Return fully simulated cascade!
      return propagateWinners(fullCascade);
    });
  };

  // Filter matches for rendering
  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      // Round check
      if (activeRoundFilter !== 'Semua' && m.round !== activeRoundFilter) return false;

      // Query check
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        return (
          m.teamA.toLowerCase().includes(q) ||
          m.teamB.toLowerCase().includes(q) ||
          m.stadium.toLowerCase().includes(q) ||
          m.round.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [matches, searchQuery, activeRoundFilter]);

  // Find current active winner of final (the Champion!)
  const finalMatch = matches.find(m => m.round === "Final");
  const championTeam = finalMatch?.status === 'Selesai' ? finalMatch.winner : undefined;
  const championFlag = championTeam 
    ? (championTeam === finalMatch.teamA ? finalMatch.flagA : finalMatch.flagB)
    : undefined;

  // Print bracket friendly layout handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen stadium-bg text-slate-100 flex flex-col transition-colors pb-12">
      
      {/* Top Floating App Banner */}
      <div className="w-full bg-slate-950/80 border-b border-slate-900/60 py-3.5 px-6 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-1 px-2 text-xs font-black bg-emerald-500 rounded-lg text-slate-950 flex items-center gap-1.5 shadow-md shadow-emerald-950/30">
              FIFA <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-sm font-bold tracking-tight text-white uppercase font-display">
              Bagan Sistem Fase Gugur Piala Dunia 2026
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live synchronizer button */}
            <button
              onClick={loadLiveGames}
              disabled={isLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border shadow-sm cursor-pointer select-none ${
                apiSyncState === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : apiSyncState === 'error'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              } disabled:opacity-50`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
              <span>
                {isLoading 
                  ? 'Memuat API...' 
                  : apiSyncState === 'success' 
                  ? 'Tersinkronisasi!' 
                  : apiSyncState === 'error' 
                  ? 'Gagal Sinkronisasi' 
                  : 'Sinkronisasi Live API'}
              </span>
            </button>

            {/* Quick interactive search input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari tim atau stadion..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 md:px-8 mt-8 flex-grow">
        {/* Error notification from API */}
        {apiError && (
          <div className="mb-6 max-w-4xl mx-auto p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center justify-between shadow-lg">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
              {apiError}
            </span>
            <button 
              onClick={() => setApiError(undefined)}
              className="text-[10px] font-black uppercase tracking-wider text-rose-400 hover:text-white"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Loading overlay notification */}
        {isLoading && (
          <div className="mb-6 max-w-4xl mx-auto p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between shadow-lg">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Mengunduh dan menerjemahkan data 16 Besar secara real-time dari server FIFA...
            </span>
            <span className="text-[10px] font-bold text-slate-400">Sedang diproses</span>
          </div>
        )}

        {/* Tournament Header with statistics */}
        <TournamentHeader
          matches={matches}
          onReset={handleReset}
          onRandomizeScores={handleRandomizeScores}
        />

        {/* Premium Stage Tabs Selector */}
        <div className="max-w-4xl mx-auto mb-8 bg-slate-950/60 p-1 rounded-2xl border border-slate-905 flex flex-col md:flex-row gap-1 relative z-10 shadow-lg select-none">
          <button
            onClick={() => {
              setSelectedStageTab('grup');
              setActiveRoundFilter('Fase Grup');
            }}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedStageTab === 'grup'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <span className="text-sm">📊</span>
            <span>Fase Grup (Klasemen)</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-slate-900/60 text-slate-400">72 Laga</span>
          </button>

          <button
            onClick={() => {
              setSelectedStageTab('r32');
              setActiveRoundFilter('32 Besar');
            }}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedStageTab === 'r32'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <span className="text-sm">⚡</span>
            <span>32 Besar (Knockout)</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-slate-900/60 text-slate-400">16 Laga</span>
          </button>

          <button
            onClick={() => {
              setSelectedStageTab('gugur');
              setActiveRoundFilter('Semua');
            }}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedStageTab === 'gugur'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <span className="text-sm">🏆</span>
            <span>Kerangka Fase Gugur</span>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-slate-900/60 text-slate-400">15 Laga</span>
          </button>
        </div>

        {/* Global Alert or Search notice */}
        {searchQuery.trim() !== "" && (
          <div className="mb-6 p-3 bg-emerald-950/30 border border-emerald-900/60 rounded-xl max-w-xl mx-auto flex items-center justify-between text-xs text-emerald-400">
            <span>Menampilkan hasil pencarian untuk: <strong>"{searchQuery}"</strong></span>
            <button 
              onClick={() => setSearchQuery("")}
              className="underline text-slate-300 hover:text-white font-bold"
            >
              Hapus
            </button>
          </div>
        )}

        {/* VIEW 1: FASE GRUP */}
        {selectedStageTab === 'grup' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
            {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map(letter => {
              let groupMatches = matches.filter(m => m.round === 'Fase Grup' && m.group === letter);
              
              if (searchQuery.trim() !== "") {
                const q = searchQuery.toLowerCase();
                groupMatches = groupMatches.filter(m => 
                  m.teamA.toLowerCase().includes(q) || 
                  m.teamB.toLowerCase().includes(q) || 
                  m.stadium.toLowerCase().includes(q)
                );
              }

              return (
                <GroupCard
                  key={letter}
                  groupLetter={letter}
                  groupMatches={groupMatches}
                  onUpdateScore={handleUpdateScore}
                  onUpdateStatus={handleUpdateStatus}
                />
              );
            })}
          </div>
        )}

        {/* VIEW 2: 32 BESAR */}
        {selectedStageTab === 'r32' && (
          <div className="space-y-6 mb-10">
            <div className="text-center max-w-xl mx-auto mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-2.5">
                Kualifikasi Knockout Pertama
              </span>
              <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">
                Pertandingan Babak 32 Besar
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Laga sistem gugur perdana. Menangkan pertandingan untuk melaju ke Babak 16 Besar secara dinamis!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center items-center">
              {filteredMatches
                .filter(m => m.round === '32 Besar')
                .map(match => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onUpdateScore={handleUpdateScore}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))}
              {filteredMatches.filter(m => m.round === '32 Besar').length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-500 text-xs italic">
                  Tidak ada pertandingan 32 Besar yang cocok dengan kriteria pencarian Anda.
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: BAGAN FASE GUGUR */}
        {selectedStageTab === 'gugur' && (
          <>
            {/* Desktop Tournament Bracket Layout (Horizontal Tree) */}
            <div className="hidden lg:block relative overflow-x-auto pb-10 no-scrollbar select-none">
              {/* Inner height container matching the strict height alignment */}
              <div className="min-w-[1180px] h-[780px] grid grid-cols-5 gap-4 relative">
                
                {/* COLUMN 1: 16 Besar (8 matches) */}
                <div className="flex flex-col justify-around h-full">
                  <div className="text-center font-display text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400 bg-slate-950/40 py-1.5 rounded-lg border border-slate-900">
                    16 Besar
                  </div>
                  <div className="flex flex-col justify-between h-full py-4">
                    {matches.filter(m => m.round === "16 Besar").map((match) => (
                      <div key={match.id} className="relative flex justify-center py-1">
                        <MatchCard
                          match={match}
                          onUpdateScore={handleUpdateScore}
                          onUpdateStatus={handleUpdateStatus}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* COLUMN 2: Perempat Final (4 matches) */}
                <div className="flex flex-col justify-around h-full">
                  <div className="text-center font-display text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400 bg-slate-950/40 py-1.5 rounded-lg border border-slate-900">
                    Perempat Final
                  </div>
                  <div className="flex flex-col justify-around h-full py-8">
                    {matches.filter(m => m.round === "Perempat Final").map((match) => (
                      <div key={match.id} className="relative flex justify-center py-2">
                        <MatchCard
                          match={match}
                          onUpdateScore={handleUpdateScore}
                          onUpdateStatus={handleUpdateStatus}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* COLUMN 3: Semifinal (2 matches) */}
                <div className="flex flex-col justify-around h-full">
                  <div className="text-center font-display text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400 bg-slate-950/40 py-1.5 rounded-lg border border-slate-900">
                    Semifinal
                  </div>
                  <div className="flex flex-col justify-around h-full py-16">
                    {matches.filter(m => m.round === "Semifinal").map((match) => (
                      <div key={match.id} className="relative flex justify-center py-4">
                        <MatchCard
                          match={match}
                          onUpdateScore={handleUpdateScore}
                          onUpdateStatus={handleUpdateStatus}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* COLUMN 4: Final (1 match) */}
                <div className="flex flex-col justify-around h-full">
                  <div className="text-center font-display text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400 bg-slate-950/40 py-1.5 rounded-lg border border-slate-900">
                    Final
                  </div>
                  <div className="flex flex-col justify-around h-full py-24">
                    {matches.filter(m => m.round === "Final").map((match) => (
                      <div key={match.id} className="relative flex justify-center py-8">
                        <MatchCard
                          match={match}
                          onUpdateScore={handleUpdateScore}
                          onUpdateStatus={handleUpdateStatus}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* COLUMN 5: Champion Space (Central Spotlight) */}
                <div className="flex flex-col justify-center h-full">
                  <div className="text-center font-display text-[10px] font-extrabold uppercase tracking-[0.2em] text-amber-400 bg-amber-950/20 py-1.5 rounded-lg border border-amber-900/40 mb-12">
                    Juara Dunia
                  </div>
                  <div className="p-4 rounded-3xl">
                    <ChampionCard team={championTeam} flag={championFlag} />
                  </div>
                </div>

              </div>
            </div>

            {/* Mobile / Tablet View: Filtered columns view or list view */}
            <div className="lg:hidden flex flex-col gap-6">
              
              {/* Mobile Switch Tabs */}
              <div className="flex gap-1.5 p-1 bg-slate-950 border border-slate-900/80 rounded-2xl overflow-x-auto no-scrollbar">
                {gugurRounds.map((round, idx) => (
                  <button
                    key={round}
                    onClick={() => setMobileRoundIndex(idx)}
                    className={`flex-1 py-3 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      mobileRoundIndex === idx
                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{round}</span>
                    <span className="p-1 px-1.5 text-[9px] rounded-full bg-slate-900 text-slate-300 leading-none">
                      {matches.filter(m => m.round === round).length}
                    </span>
                  </button>
                ))}
              </div>

              {/* Active Round Title header */}
              <div className="flex items-center justify-between border-b border-slate-900 pb-3 mt-4">
                <h3 className="text-sm font-black uppercase text-emerald-400 font-display tracking-widest">
                  Laga {gugurRounds[mobileRoundIndex] || "16 Besar"}
                </h3>
                <span className="text-[10px] bg-slate-900 px-2.5 py-1 rounded text-slate-400 font-medium">
                  Mode Mobile Aktif
                </span>
              </div>

              {/* Render List of Active Matches in mobile tab */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-items-center">
                {matches
                  .filter(m => m.round === (gugurRounds[mobileRoundIndex] || "16 Besar"))
                  .map(match => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onUpdateScore={handleUpdateScore}
                      onUpdateStatus={handleUpdateStatus}
                    />
                  ))}
              </div>

              {/* Mobile Champion spotlight display */}
              <motion.div 
                layout
                className="mt-8 pt-4 border-t border-slate-900/60"
              >
                <div className="text-center text-[10px] uppercase font-black tracking-widest text-[#f59e0b] mb-4">
                  Juara Dunia 2026
                </div>
                <ChampionCard team={championTeam} flag={championFlag} />
              </motion.div>
            </div>
          </>
        )}

        {/* Help & Customization Manual Tips */}
        <div className="mt-16 max-w-4xl mx-auto p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
          <div className="flex gap-4">
            <CircleHelp className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-slate-300 text-xs leading-relaxed">
              <h4 className="font-extrabold text-white mb-2 text-sm uppercase tracking-wider font-display">Panduan Simulasi Interaktif Piala Dunia:</h4>
              <ul className="list-disc pl-4 space-y-2">
                <li>
                  <strong>Ubah Skor Pertandingan:</strong> Arahkan kursor Anda ke area nama tim pada Match Card lalu klik ikon <strong>(+ / -)</strong> untuk langsung menambah/mengurangi skor. Bracket akan otomatis memicu status selesai dan memajukan pemenang ke babak berikutnya!
                </li>
                <li>
                  <strong>Bagan Otomatis:</strong> Hasil yang berubah di Babak 16 Besar akan memetakan tim yang lolos secara real-time ke Perempat Final, Semifinal, hingga Final secara beruntun.
                </li>
                <li>
                  <strong>Ubah Status:</strong> Gunakan menu seleksi status laga (<span className="text-white font-bold bg-slate-800/80 px-1.5 py-0.5 rounded text-[10px]">Live, Selesai, Belum</span>) pada bagian pojok kanan kartu untuk memicu skenario laga secara khusus.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Actions & Export Options */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-xs">
          <div className="font-medium">
            &copy; 2026 Piala Dunia Bracket Pro. Desain premium Piala Dunia untuk ridwankulu47.
          </div>
          <div className="flex gap-4">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-white font-bold transition-all py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4 text-emerald-400" /> Cetak Bracket (PDF)
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-white font-bold transition-all py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 cursor-pointer shadow-md"
            >
              <RefreshCw className="w-4 h-4 text-amber-500" /> Reset Default
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
