// utils/generateBracketAndSchedule.ts

import { Timestamp } from "firebase/firestore";

/**
 * @param players string[] - Array of user IDs
 * @param startDate Timestamp - Firestore timestamp for round 1
 * @returns { rounds: any[], matchSchedule: any[] }
 */
export function generateBracketAndSchedule(players: string[], startDate: Timestamp) {
  const rounds = [];
  let currentPlayers = players.slice();
  let roundNum = 1;

  // Generate all rounds structure
  while (currentPlayers.length > 1) {
    const roundMatches = [];
    for (let i = 0; i < currentPlayers.length; i += 2) {
      roundMatches.push({
        player1: currentPlayers[i] || null,
        player2: currentPlayers[i + 1] || null,
        winner: null,
        completed: false,
        matchNum: i / 2 + 1,
      });
    }
    rounds.push(roundMatches);

    // Winners advance to next round (but we don't know yet, so set nulls)
    currentPlayers = new Array(Math.ceil(currentPlayers.length / 2)).fill(null);
    roundNum++;
  }

  // Generate matchSchedule with dates (1 round per day)
  const matchSchedule: any[] = [];
  let currentDate = startDate.toDate();

  rounds.forEach((round, idx) => {
    matchSchedule.push({
      round: idx + 1,
      date: Timestamp.fromDate(new Date(currentDate)), // Store as Firestore Timestamp
      matchups: round.map((match: any) => ({
        ...match,
      })),
    });
    // Next round is next day
    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
  });

  return { rounds, matchSchedule };
}
