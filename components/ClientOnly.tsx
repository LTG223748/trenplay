import { useEffect, useState, type ReactNode } from "react";

export default function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null; // Don’t render anything until after mount
  return <>{children}</>;
}
