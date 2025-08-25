import { FaBasketballBall, FaFutbol, FaFootballBall, FaGraduationCap, FaBaseballBall } from 'react-icons/fa';
import { GiBoxingGlove } from 'react-icons/gi';
import { MdSportsEsports } from 'react-icons/md'; // NEW: Esports controller

const gameIcons = {
  "All": <MdSportsEsports className="text-purple-400 text-2xl" />, // NEW: Cyber controller
  "NBA 2K": <FaBasketballBall className="text-orange-400 text-lg" />,
  "FIFA": <FaFutbol className="text-green-400 text-lg" />,
  "UFC": <GiBoxingGlove className="text-red-500 text-lg" />,
  "Madden": <FaFootballBall className="text-yellow-500 text-lg" />,
  "College Football": <FaGraduationCap className="text-blue-300 text-lg" />,
  "MLB The Show": <FaBaseballBall className="text-pink-300 text-lg" />,
};

export default function GameFilterBar({ activeGame, setActiveGame, categories }) {
  return (
    <div
      className="flex justify-between bg-[#1a0033]/80 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-inner mb-6"
      style={{ minHeight: 153 }}
    >
      {categories.map((game) => (
        <button
          key={game}
          onClick={() => setActiveGame(game)}
          className={`
            flex flex-col items-center justify-center flex-1 mx-2
            min-w-0
            rounded-[36px] border-2
            font-orbitron font-black uppercase tracking-widest
            text-base sm:text-lg
            transition-all duration-300
            ${activeGame === game
              ? "bg-white/70 text-black border-yellow-200 scale-105 z-10 shadow-[0_0_20px_rgba(250,204,21,.55)]" // ✅ glowing active box
              : "bg-white/20 border-[#6648b0] text-white hover:bg-white/30 hover:shadow-[0_0_14px_rgba(168,85,247,.35)]"
            }
            hover:scale-105
          `}
          style={{
            minHeight: 108,
            maxWidth: '225px',
            backdropFilter: 'blur(8px)',
            letterSpacing: "0.08em",
          }}
        >
          <div className="mb-1">{gameIcons[game]}</div>
          <span className="leading-tight text-shadow-lg break-words whitespace-pre-line text-sm sm:text-base text-center">
            {game}
          </span>
        </button>
      ))}
    </div>
  );
}
