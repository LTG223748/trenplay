// components/MobileHeader.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

export default function MobileHeader() {
  return (
    <header
      className="md:hidden sticky top-0 z-50 bg-[#0b0f0c]/95 backdrop-blur border-b border-white/10"
      style={{ paddingTop: "var(--safe-top)" }}
    >
      <div className="flex items-center justify-between px-3 py-2">
        {/* Left: TrenPlay logo (bigger, aligned left) */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/trenplay-logo.png"
            alt="TrenPlay Logo"
            width={300}         // bump width as needed to fit header height
            height={100}
            className="object-contain h-10 w-auto"  // h-10 ≈ 40px; adjust to match your header
            priority
          />
        </Link>

        {/* Right: Phantom wallet button */}
        <WalletMultiButton className="!bg-green-500 !text-black !rounded-lg !px-3 !py-1.5 !h-auto !min-h-0 text-sm" />
      </div>
    </header>
  );
}
