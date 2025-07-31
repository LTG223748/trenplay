// components/TrenLogo.js
import Image from 'next/image';
import Link from 'next/link';

export default function TrenLogo() {
  return (
    <div className="px-4 pt-4 sm:pt-6">
      <Link href="/">
        <Image
          src="/images/trenbet-logo.png"
          alt="TrenBet Logo"
          width={160} // You can adjust the size here
          height={60}
          className="hover:scale-105 transition-transform"
        />
      </Link>
    </div>
  );
}