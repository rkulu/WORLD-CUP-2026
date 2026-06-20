import { Match } from "../types/bracket";

export const teamMap: Record<string, { nameId: string; flag: string }> = {
  "Mexico": { nameId: "Meksiko", flag: "🇲🇽" },
  "South Africa": { nameId: "Afrika Selatan", flag: "🇿🇦" },
  "South Korea": { nameId: "Kore Selatan", flag: "🇰🇷" },
  "Czech Republic": { nameId: "Republik Ceko", flag: "🇨🇿" },
  "Canada": { nameId: "Kanada", flag: "🇨🇦" },
  "Bosnia and Herzegovina": { nameId: "Bosnia & Herzegovina", flag: "🇧🇦" },
  "United States": { nameId: "Amerika Serikat", flag: "🇺🇸" },
  "Paraguay": { nameId: "Paraguay", flag: "🇵🇾" },
  "Haiti": { nameId: "Haiti", flag: "🇭🇹" },
  "Scotland": { nameId: "Skotlandia", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  "Australia": { nameId: "Australia", flag: "🇦🇺" },
  "Turkey": { nameId: "Turki", flag: "🇹🇷" },
  "Brazil": { nameId: "Brasil", flag: "🇧🇷" },
  "Morocco": { nameId: "Maroko", flag: "🇲🇦" },
  "Qatar": { nameId: "Qatar", flag: "🇶🇦" },
  "Switzerland": { nameId: "Swiss", flag: "🇨🇭" },
  "Ivory Coast": { nameId: "Pantai Gading", flag: "🇨🇮" },
  "Ecuador": { nameId: "Ekuador", flag: "🇪🇨" },
  "Germany": { nameId: "Jerman", flag: "🇩🇪" },
  "Curaçao": { nameId: "Kurasao", flag: "🇨🇼" },
  "Netherlands": { nameId: "Belanda", flag: "🇳🇱" },
  "Japan": { nameId: "Jepang", flag: "🇯🇵" },
  "Sweden": { nameId: "Swedia", flag: "🇸🇪" },
  "Tunisia": { nameId: "Tunisia", flag: "🇹🇳" },
  "Iran": { nameId: "Iran", flag: "🇮🇷" },
  "New Zealand": { nameId: "Selandia Baru", flag: "🇳🇿" },
  "Spain": { nameId: "Spanyol", flag: "🇪🇸" },
  "Cape Verde": { nameId: "Tanjung Verde", flag: "🇨🇻" },
  "Belgium": { nameId: "Belgia", flag: "🇧🇪" },
  "Egypt": { nameId: "Mesir", flag: "🇪🇬" },
  "Saudi Arabia": { nameId: "Arab Saudi", flag: "🇸🇦" },
  "Uruguay": { nameId: "Uruguay", flag: "🇺🇾" },
  "France": { nameId: "Prancis", flag: "🇫🇷" },
  "Senegal": { nameId: "Senegal", flag: "🇸🇳" },
  "Iraq": { nameId: "Irak", flag: "🇮🇶" },
  "Norway": { nameId: "Norwegia", flag: "🇳🇴" },
  "Argentina": { nameId: "Argentina", flag: "🇦🇷" },
  "Algeria": { nameId: "Aljazair", flag: "🇩🇿" },
  "Austria": { nameId: "Austria", flag: "🇦🇹" },
  "Jordan": { nameId: "Yordania", flag: "🇯🇴" },
  "Portugal": { nameId: "Portugal", flag: "🇵🇹" },
  "Democratic Republic of the Congo": { nameId: "Kongo DR", flag: "🇨🇩" },
  "England": { nameId: "Inggris", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "Croatia": { nameId: "Kroasia", flag: "🇭🇷" },
  "Uzbekistan": { nameId: "Uzbekistan", flag: "🇺🇿" },
  "Colombia": { nameId: "Kolombia", flag: "🇨🇴" },
  "Ghana": { nameId: "Ghana", flag: "🇬🇭" },
  "Panama": { nameId: "Panama", flag: "🇵🇦" }
};

// Map stadium entries for better localized presentation
export const fallbackStadiums: Record<string, string> = {
  "1": "Estadio Azteca, Mexico City",
  "2": "Estadio BBVA, Monterrey",
  "3": "Estadio Akron, Guadalajara",
  "4": "BC Place, Vancouver",
  "5": "BMO Field, Toronto",
  "6": "MetLife Stadium, New York/New Jersey",
  "7": "SoFi Stadium, Los Angeles",
  "8": "Hard Rock Stadium, Miami",
  "9": "Mercedes-Benz Stadium, Atlanta",
  "10": "Gillette Stadium, Boston",
  "11": "Lincoln Financial Field, Philadelphia",
  "12": "Arrowhead Stadium, Kansas City",
  "13": "NRG Stadium, Houston",
  "14": "Lumen Field, Seattle",
  "15": "Levi's Stadium, San Francisco Bay Area",
  "16": "AT&T Stadium, Dallas"
};

export const fetchWorldCupGames = async (): Promise<Match[]> => {
  try {
    const [gamesRes, stadiumsRes, teamsRes] = await Promise.all([
      fetch("https://worldcup26.ir/get/games").then(res => res.json()),
      fetch("https://worldcup26.ir/get/stadiums").then(res => res.json()).catch(() => ({ stadiums: [] })),
      fetch("https://worldcup26.ir/get/teams").then(res => res.json()).catch(() => ({ teams: [] }))
    ]);

    if (!gamesRes || !gamesRes.games) {
      throw new Error("Invalid API response structure");
    }

    // Build stadium mapping dictionary
    const stadiumDict: Record<string, string> = {};
    if (stadiumsRes && stadiumsRes.stadiums) {
      stadiumsRes.stadiums.forEach((std: any) => {
        stadiumDict[std.id] = `${std.name_en}, ${std.city_en}`;
      });
    }

    // Build teams mapping dictionary from the live get/teams API
    const teamsDict: Record<string, { nameEn: string; flag: string; iso2: string }> = {};
    if (teamsRes && teamsRes.teams) {
      teamsRes.teams.forEach((t: any) => {
        teamsDict[t.id] = {
          nameEn: t.name_en,
          flag: t.flag,
          iso2: t.iso2
        };
      });
    }

    // Map the match structures from the live endpoint
    const r16Games = gamesRes.games.filter((g: any) => 
      ["group", "r32", "r16", "qf", "sf", "final"].includes(g.type)
    );

    const matches: Match[] = r16Games.map((g: any) => {
      // Round Mapping
      let mappedRound: Match['round'] = '16 Besar';
      if (g.type === 'group') mappedRound = 'Fase Grup';
      else if (g.type === 'r32') mappedRound = '32 Besar';
      else if (g.type === 'qf') mappedRound = 'Perempat Final';
      else if (g.type === 'sf') mappedRound = 'Semifinal';
      else if (g.type === 'final') mappedRound = 'Final';

      // Team properties with flag conversions using teamsDict and teamMap
      const apiTeamHome = g.home_team_id ? teamsDict[g.home_team_id] : undefined;
      const apiTeamAway = g.away_team_id ? teamsDict[g.away_team_id] : undefined;

      const rawHome = apiTeamHome ? apiTeamHome.nameEn : (g.home_team_name_en || g.home_team_label || "TBD");
      const rawAway = apiTeamAway ? apiTeamAway.nameEn : (g.away_team_name_en || g.away_team_label || "TBD");

      const lookupHome = teamMap[rawHome];
      const lookupAway = teamMap[rawAway];

      const teamA = lookupHome ? lookupHome.nameId : rawHome;
      const teamB = lookupAway ? lookupAway.nameId : rawAway;

      // Access exact FlagCDN logo url, fallback to unicode emoji when not configured
      const flagA = apiTeamHome ? apiTeamHome.flag : (lookupHome ? lookupHome.flag : "🏳️");
      const flagB = apiTeamAway ? apiTeamAway.flag : (lookupAway ? lookupAway.flag : "🏳️");

      // Score evaluation
      const hasScore = g.finished === "TRUE" || (g.home_score !== undefined && g.away_score !== undefined && g.home_score !== "null");
      const scoreA = hasScore ? parseInt(g.home_score, 10) : undefined;
      const scoreB = hasScore ? parseInt(g.away_score, 10) : undefined;

      // Finish evaluation
      let status: Match['status'] = "Belum Dimainkan";
      if (g.finished === "TRUE" || g.time_elapsed === "finished") {
        status = "Selesai";
      } else if (g.time_elapsed === "live" || g.time_elapsed === "started") {
        status = "Live";
      }

      // Winner mapping
      let winner: string | undefined = undefined;
      if (status === "Selesai" && scoreA !== undefined && scoreB !== undefined) {
        winner = scoreA > scoreB ? teamA : teamB;
      }

      // Stadium name localization
      const stadiumName = stadiumDict[g.stadium_id] || fallbackStadiums[g.stadium_id] || `Stadion No. ${g.stadium_id}`;

      // Date transform (e.g. 07/04/2026 17:00 -> 04 Juli 2026)
      let formattedDate = g.local_date || "Juli 2026";
      try {
        const parts = formattedDate.split(" ");
        const dateParts = parts[0].split("/");
        if (dateParts.length === 3) {
          const day = parseInt(dateParts[1], 10);
          const monthIndex = parseInt(dateParts[0], 10);
          const year = dateParts[2];
          const monthsIndo = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Okt", "Nov", "Des"
          ];
          formattedDate = `${day} ${monthsIndo[monthIndex - 1]} ${year}`;
        }
      } catch (e) {
        // Fallback
      }

      return {
        id: g.id,
        round: mappedRound,
        teamA,
        teamB,
        scoreA: isNaN(scoreA as number) ? undefined : scoreA,
        scoreB: isNaN(scoreB as number) ? undefined : scoreB,
        winner,
        date: formattedDate,
        stadium: stadiumName,
        flagA,
        flagB,
        status,
        group: g.group || ""
      };
    });

    // Make sure we sort matches consistently by round type and match chronological index
    const roundWeights = { 'Fase Grup': 1, '32 Besar': 2, '16 Besar': 3, 'Perempat Final': 4, 'Semifinal': 5, 'Final': 6 };
    matches.sort((a, b) => {
      const weightA = roundWeights[a.round] || 0;
      const weightB = roundWeights[b.round] || 0;
      if (weightA !== weightB) return weightA - weightB;
      return parseInt(a.id, 10) - parseInt(b.id, 10);
    });

    return matches;
  } catch (error) {
    console.error("Failed fetching live world cup tournament games:", error);
    throw error;
  }
};
