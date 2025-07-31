import React from 'react';

// Icons (use generic or your own SVGs/images)
const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  Console: <span className="text-blue-400 text-3xl mr-2">🎮</span>,
  // Add more if needed in the future
};

const PLATFORM_STYLES: Record<string, string> = {
  Console: 'from-[#25124a] to-[#372066] border-blue-400 shadow-blue-400/50',
  // Add more if needed in the future
};

const TC_PER_USD = 1000;

function tcToUsd(tc: number): string {
  if (!tc) return '0.00';
  return (tc / TC_PER_USD).toFixed(2);
}

interface Tournament {
  id: string;
  name: string;
  entryfee: number;
  players: string[];
  prizepool: number;
  type: number;
  status: string;
  platform: string;   // <-- Make sure this exists!
  division?: string;
  // ...add other tournament fields as needed
}

interface Props {
  tournament: Tournament;
  // add other props if needed (join handler, etc)
}
function getPlatformIcon(platform: string) {
  if (platform === 'Console-Green') {
    return <span className="text-green-400 text-3xl mr-2">🎮</span>;
  }
  if (platform === 'Console-Blue') {
    return <span className="text-blue-300 text-3xl mr-2">🎮</span>;
  }
  return <span className="text-gray-400 text-3xl mr-2">🎮</span>;
}
function getPlatformStyle(platform: string) {
  if (platform === 'Console-Green') return 'from-[#193c1a] to-[#275d2a] border-green-500 shadow-green-500/50';
  if (platform === 'Console-Blue') return 'from-[#1a1a3c] to-[#3147a9] border-blue-400 shadow-blue-400/50';
  return 'from-[#25124a] to-[#372066] border-purple-600 shadow-purple-600/50';
}

const TournamentCard: React.FC<Props> = ({ tournament }) => {
  // Fallback for unknown platform: default to "Console"
  const platform = tournament.platform === "Console" ? "Console" : "Console";
  const icon = PLATFORM_ICONS[platform] || <span className="text-gray-400 text-3xl mr-2">🎮</span>;
  const bg = PLATFORM_STYLES[platform] || 'from-[#25124a] to-[#372066] border-blue-400 shadow-blue-400/50';

  return (
    <div
      className={`relative bg-gradient-to-br ${bg} border-2 rounded-2xl p-6 mb-8 shadow-xl transition-all duration-200`}
    >
      {/* Platform Label */}
      <div className="absolute top-4 right-4 flex items-center">
  {getPlatformIcon(tournament.platform)}
  <span className="font-bold uppercase tracking-wide text-xs ml-1 text-white">Console</span>
</div>


      {/* Tournament Name */}
      <h2 className="text-2xl font-bold mb-2 text-purple-200">{tournament.name}</h2>

      {/* Entry, Prize Pool, Status */}
      <div className="flex flex-wrap gap-x-8 gap-y-2 mb-4 items-center">
        <span>
          <span className="text-white">Entry:</span>{' '}
          <span className="font-semibold text-yellow-300">{tournament.entryfee} TC</span>
          <span className="text-green-300 ml-2 text-sm">
            ≈ ${tcToUsd(tournament.entryfee)} USD
          </span>
        </span>
        <span>
          <span className="text-white">Prize pool:</span>{' '}
          <span className="font-semibold text-yellow-300">{tournament.prizepool} TC</span>
        </span>
        <span>
          <span className="text-white">Status:</span>{' '}
          <span className="font-semibold text-yellow-200 capitalize">{tournament.status}</span>
        </span>
      </div>

      {/* Players and Max */}
      <div className="mb-3 text-white">
        <strong>{tournament.players?.length || 0}</strong> / {tournament.type} players joined
      </div>

      {/* (Optional) Disclaimer */}
      <div className="absolute bottom-4 right-4 text-[11px] text-gray-400 italic text-right max-w-xs pointer-events-none select-none">
        USD values are for reference only.
      </div>
    </div>
  );
};

export default TournamentCard;


