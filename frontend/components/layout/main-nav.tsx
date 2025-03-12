import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:gap-10">
      <Link
        href="/"
        className={cn(
          "flex items-center text-sm font-medium transition-colors hover:text-primary",
          pathname === "/" ? "text-foreground" : "text-foreground/60"
        )}
      >
        Home
      </Link>
      <Link
        href="/projects"
        className={cn(
          "flex items-center text-sm font-medium transition-colors hover:text-primary",
          pathname?.startsWith("/projects") ? "text-foreground" : "text-foreground/60"
        )}
      >
        Projects
      </Link>
      <Link
        href="/docs"
        className={cn(
          "flex items-center text-sm font-medium transition-colors hover:text-primary",
          pathname?.startsWith("/docs") ? "text-foreground" : "text-foreground/60"
        )}
      >
        Documentation
      </Link>
    </div>
  );
}