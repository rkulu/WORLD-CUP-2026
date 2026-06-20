import { Match } from "../types/bracket";

export const initialBracketData: Match[] = [
  // Round of 16 (8 matches)
  {
    id: "89", round: "16 Besar", teamA: "Prancis", teamB: "Polandia",
    scoreA: 3, scoreB: 1, winner: "Prancis", date: "20 Juni 2026",
    stadium: "Gillette Stadium, Boston", flagA: "🇫🇷", flagB: "🇵🇱", status: "Selesai"
  },
  {
    id: "90", round: "16 Besar", teamA: "Inggris", teamB: "Senegal",
    scoreA: 3, scoreB: 0, winner: "Inggris", date: "21 Juni 2026",
    stadium: "BMO Field, Toronto", flagA: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", flagB: "🇸🇳", status: "Selesai"
  },
  {
    id: "91", round: "16 Besar", teamA: "Argentina", teamB: "Australia",
    scoreA: 2, scoreB: 1, winner: "Argentina", date: "22 Juni 2026",
    stadium: "Lincoln Financial Field, Philadelphia", flagA: "🇦🇷", flagB: "🇦🇺", status: "Selesai"
  },
  {
    id: "92", round: "16 Besar", teamA: "Belanda", teamB: "Amerika Serikat",
    scoreA: 3, scoreB: 1, winner: "Belanda", date: "23 Juni 2026",
    stadium: "Estadio Azteca, Mexico City", flagA: "🇳🇱", flagB: "🇺🇸", status: "Selesai"
  },
  {
    id: "93", round: "16 Besar", teamA: "Brasil", teamB: "Korea Selatan",
    scoreA: 4, scoreB: 1, winner: "Brasil", date: "24 Juni 2026",
    stadium: "BC Place, Vancouver", flagA: "🇧🇷", flagB: "🇰🇷", status: "Selesai"
  },
  {
    id: "94", round: "16 Besar", teamA: "Jepang", teamB: "Kroasia",
    scoreA: 1, scoreB: 1, winner: "Kroasia", date: "24 Juni 2026",
    stadium: "Lumen Field, Seattle", flagA: "🇯🇵", flagB: "🇭🇷", status: "Selesai"
  },
  {
    id: "95", round: "16 Besar", teamA: "Maroko", teamB: "Spanyol",
    scoreA: 0, scoreB: 0, winner: "Maroko", date: "25 Juni 2026",
    stadium: "AT&T Stadium, Dallas", flagA: "🇲🇦", flagB: "🇪🇸", status: "Selesai"
  },
  {
    id: "96", round: "16 Besar", teamA: "Portugal", teamB: "Swiss",
    scoreA: 6, scoreB: 1, winner: "Portugal", date: "25 Juni 2026",
    stadium: "Hard Rock Stadium, Miami", flagA: "🇵🇹", flagB: "🇨🇭", status: "Selesai"
  },
  // Quarter Finals (4 matches)
  {
    id: "97", round: "Perempat Final", teamA: "Prancis", teamB: "Inggris",
    scoreA: 2, scoreB: 1, winner: "Prancis", date: "28 Juni 2026",
    stadium: "BMO Field, Toronto", flagA: "🇫🇷", flagB: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", status: "Selesai"
  },
  {
    id: "99", round: "Perempat Final", teamA: "Argentina", teamB: "Belanda",
    scoreA: 2, scoreB: 2, winner: "Argentina", date: "29 Juni 2026",
    stadium: "MetLife Stadium, New York/New Jersey", flagA: "🇦🇷", flagB: "🇳🇱", status: "Selesai"
  },
  {
    id: "98", round: "Perempat Final", teamA: "Brasil", teamB: "Kroasia",
    scoreA: 1, scoreB: 1, winner: "Kroasia", date: "30 Juni 2026",
    stadium: "Lincoln Financial Field, Philadelphia", flagA: "🇧🇷", flagB: "🇭🇷", status: "Selesai"
  },
  {
    id: "100", round: "Perempat Final", teamA: "Maroko", teamB: "Portugal",
    scoreA: 1, scoreB: 0, winner: "Maroko", date: "30 Juni 2026",
    stadium: "Levi's Stadium, San Francisco Bay Area", flagA: "🇲🇦", flagB: "🇵🇹", status: "Selesai"
  },
  // Semifinals (2 matches)
  {
    id: "101", round: "Semifinal", teamA: "Prancis", teamB: "Maroko",
    scoreA: 2, scoreB: 0, winner: "Prancis", date: "3 Juli 2026",
    stadium: "BMO Field, Toronto", flagA: "🇫🇷", flagB: "🇲🇦", status: "Selesai"
  },
  {
    id: "102", round: "Semifinal", teamA: "Argentina", teamB: "Kroasia",
    scoreA: 3, scoreB: 0, winner: "Argentina", date: "4 Juli 2026",
    stadium: "MetLife Stadium, New York/New Jersey", flagA: "🇦🇷", flagB: "🇭🇷", status: "Selesai"
  },
  // Final (1 match)
  {
    id: "104", round: "Final", teamA: "Prancis", teamB: "Argentina",
    scoreA: 3, scoreB: 3, winner: "Argentina", date: "7 Juli 2026",
    stadium: "MetLife Stadium, New York/New Jersey", flagA: "🇫🇷", flagB: "🇦🇷", status: "Selesai"
  }
];
