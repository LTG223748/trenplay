// components/AuthLayout.js
import Image from 'next/image';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen bg-[#0e001b]">
      {/* Left side with mascot and promo */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-[#300040] via-[#1a0030] to-[#120020] text-white p-10">
        <Image
          src="/images/Tbet-mascot.png" // ✅ use mascot image
          width={220}
          height={220}
          alt="TrenBet Mascot"
          className="mb-6 rounded-lg"
        />
        <h2 className="text-3xl font-bold text-yellow-400 mb-4">{title}</h2>
        <p className="text-lg text-gray-300 text-center max-w-md">{subtitle}</p>
      </div>

      {/* Right side with form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="bg-[#1a1a2b] w-full max-w-md p-8 rounded-lg shadow-lg">
          {children}
        </div>
      </div>
    </div>
  );
}