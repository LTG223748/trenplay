// utils/tournamentUtils.ts

/**
 * Generates rounds for a single-elimination bracket from player IDs.
 * @param players Array of user IDs.
 */
export function generateRounds(players: string[]) {
  const rounds = [];

  // First round pairings
  let currentRound = [];
  for (let i = 0; i < players.length; i += 2) {
    currentRound.push({
      player1: players[i] || null,
      player2: players[i + 1] || null,
      winner: null,
    });
  }
  rounds.push(currentRound);

  // Generate future rounds (nulls for now)
  let matchCount = currentRound.length;
  while (matchCount > 1) {
    const nextRound = [];
    for (let i = 0; i < Math.ceil(matchCount / 2); i++) {
      nextRound.push({
        player1: null,
        player2: null,
        winner: null,
      });
    }
    rounds.push(nextRound);
    matchCount = nextRound.length;
  }

  return rounds;
}
