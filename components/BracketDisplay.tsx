// components/BracketDisplay.tsx
interface BracketDisplayProps {
  tournament: {
    matchSchedule?: any[];
    players: string[];
  };
  userId?: string; // If you want to highlight the current user's matches
}

export default function BracketDisplay({ tournament, userId }: BracketDisplayProps) {
  if (!tournament.matchSchedule) return <div className="text-gray-400">Bracket not yet generated.</div>;

  return (
    <div className="mt-4">
      <h3 className="text-white font-bold mb-2">Bracket & Schedule</h3>
      {tournament.matchSchedule.map((round, roundIdx) => (
        <div key={roundIdx} className="mb-2">
          <div className="text-yellow-300 font-semibold">
            Round {round.round} — {new Date(round.date).toLocaleString()}
          </div>
          {round.matchups.map((match: any, i: number) => (
            <div
              key={i}
              className={
                'ml-4 text-white text-sm' +
                (userId && (match.player1 === userId || match.player2 === userId)
                  ? ' font-bold underline'
                  : '')
              }
            >
              Match {match.matchNum}: {match.player1 || 'TBD'} vs {match.player2 || 'TBD'}
              {match.winner && (
                <span className="text-green-400 ml-2">Winner: {match.winner}</span>
              )}
              {!match.winner && (match.player1 && match.player2) && (
                <span className="text-gray-400 ml-2">Scheduled</span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

