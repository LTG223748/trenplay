export default function RocketWithLogo() {
  return (
    <svg
      width="180"
      height="100"
      viewBox="0 0 180 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      {/* Rotate rocket body to face right */}
      <g transform="rotate(0, 90, 50)">
        {/* Rocket body */}
        <ellipse
          cx="90"
          cy="50"
          rx="60"
          ry="40"
          fill="url(#rocketGradient)"
          stroke="#ffdf70"
          strokeWidth="2"
        />

        {/* Window */}
        <circle cx="120" cy="50" r="15" fill="#000" stroke="#ff4b5c" strokeWidth="3" />

        {/* Flame */}
        <path
          d="M10 30 Q-10 50 10 70 L10 60 Q-10 50 10 40 Z"
          fill="url(#flameGradient)"
        />

        {/* Left fin */}
        <path d="M50 90 L30 110 L50 110 Z" fill="#ff4b5c" />

        {/* Right fin */}
        <path d="M50 10 L30 -10 L50 -10 Z" fill="#ff4b5c" />
      </g>

      {/* Tren Play text - horizontal below the rocket */}
      <text
        x="90"
        y="95"
        textAnchor="middle"
        fontFamily="Orbitron, sans-serif"
        fontWeight="900"
        fontSize="18"
        fill="url(#textGradient)"
        stroke="#8b00ff"
        strokeWidth="0.9"
        style={{ userSelect: 'none', letterSpacing: '3px' }}
      >
        TREN PLAY
      </text>

      {/* Gradients */}
      <defs>
        <radialGradient id="rocketGradient" cx="0.5" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#6c63ff" />
          <stop offset="100%" stopColor="#2d0140" />
        </radialGradient>
        <radialGradient id="flameGradient" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffce00" />
          <stop offset="100%" stopColor="#ff4b5c" />
        </radialGradient>
        <linearGradient id="textGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8b00ff" />
          <stop offset="100%" stopColor="#007fff" />
        </linearGradient>
      </defs>
    </svg>
  );
}
